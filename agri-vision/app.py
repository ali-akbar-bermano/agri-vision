"""
app.py
Aplikasi Utama Flask untuk Agri-Vision (Asisten AI Diagnosis Pertanian).
Mengorkestrasi routing, validasi input, caching hash gambar, pemanggilan Gemini API,
penyimpanan SQLite, dan ekspor PDF.
"""

import os
import uuid
from flask import Flask, request, jsonify, render_template, send_from_directory, send_file
from dotenv import load_dotenv

from cache_utils import validate_image_file, compute_image_hash
from database import (
    init_db,
    find_analysis_by_hash,
    insert_analysis,
    get_all_analyses,
    get_analysis_by_id,
    insert_feedback
)
from gemini_service import analyze_plant_image
from pdf_export import generate_analysis_pdf

# Muat variabel environment dari .env jika ada
load_dotenv()

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)

# Konfigurasi Upload Folder
UPLOAD_FOLDER = os.path.join(app.static_folder, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # Max 10MB payload

# Inisialisasi Database saat aplikasi dimulai
with app.app_context():
    init_db()


# ==========================================================
# Frontend Routes & PWA
# ==========================================================

@app.route("/")
def index():
    """Halaman utama antarmuka pengguna Agri-Vision."""
    return render_template("index.html")


@app.route("/manifest.json")
def manifest():
    """Menyajikan manifest.json untuk dukungan Progressive Web App (PWA)."""
    return send_from_directory(app.static_folder, "manifest.json", mimetype="application/manifest+json")


@app.route("/service-worker.js")
def service_worker():
    """Menyajikan service worker untuk caching offline PWA."""
    return send_from_directory(app.static_folder, "service-worker.js", mimetype="application/javascript")


# ==========================================================
# REST API Endpoints
# ==========================================================

@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    """
    Menerima gambar unggahan (multipart/form-data) dan jenis tanaman opsional.
    Melakukan validasi, pengecekan cache berbasis SHA-256 hash,
    memanggil Gemini Vision API jika cache miss, dan menyimpan hasil ke SQLite.
    """
    if "image" not in request.files:
        return jsonify({
            "status": "error",
            "message": "Field 'image' diperlukan pada multipart/form-data."
        }), 400

    file = request.files["image"]
    jenis_tanaman = request.form.get("jenis_tanaman", "").strip() or None

    # Geotagging opsional
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    try:
        lat_val = float(latitude) if latitude else None
        lng_val = float(longitude) if longitude else None
    except ValueError:
        lat_val, lng_val = None, None

    # 1. Validasi File (format, ukuran, dimensi min 200x200px)
    is_valid, err_msg, image_bytes = validate_image_file(file)
    if not is_valid:
        return jsonify({
            "status": "error",
            "message": err_msg
        }), 400

    # 2. Hitung Hash Gambar untuk Caching
    img_hash = compute_image_hash(image_bytes)

    # 3. Pengecekan Cache
    cached = find_analysis_by_hash(img_hash)
    if cached:
        cached_result = {
            "id": cached["id"],
            "image_hash": cached["image_hash"],
            "image_path": cached["image_path"],
            "jenis_tanaman": cached["jenis_tanaman"],
            "jenis_objek": cached["jenis_objek"],
            "diagnosis": cached["diagnosis"],
            "tingkat_keparahan": cached["tingkat_keparahan"],
            "rekomendasi_air_ml": cached["rekomendasi_air_ml"],
            "rekomendasi_pupuk": {
                "jenis": cached["rekomendasi_pupuk_jenis"],
                "takaran_gram": cached["rekomendasi_pupuk_gram"]
            },
            "catatan_tambahan": cached["catatan_tambahan"],
            "tingkat_keyakinan": cached["tingkat_keyakinan"],
            "latitude": cached["latitude"],
            "longitude": cached["longitude"],
            "created_at": cached["created_at"],
            "is_cached": True
        }
        return jsonify({
            "status": "success",
            "message": "Hasil diagnosis diambil dari cache (gambar identik).",
            "data": cached_result
        }), 200

    # 4. Simpan Gambar ke Direktori Uploads
    ext = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    saved_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
    with open(saved_path, "wb") as f:
        f.write(image_bytes)

    public_image_url = f"/static/uploads/{unique_filename}"

    # 5. Analisis dengan Google Gemini Vision API
    success, ai_output = analyze_plant_image(image_bytes, jenis_tanaman=jenis_tanaman)
    if not success:
        # Bersihkan file jika gagal analisis
        if os.path.exists(saved_path):
            os.remove(saved_path)
        return jsonify({
            "status": "error",
            "message": ai_output
        }), 502

    # 6. Simpan Hasil Analisis ke Database SQLite
    record_data = {
        "image_hash": img_hash,
        "image_path": public_image_url,
        "jenis_tanaman": jenis_tanaman,
        "jenis_objek": ai_output["jenis_objek"],
        "diagnosis": ai_output["diagnosis"],
        "tingkat_keparahan": ai_output["tingkat_keparahan"],
        "rekomendasi_air_ml": ai_output["rekomendasi_air_ml"],
        "rekomendasi_pupuk_jenis": ai_output["rekomendasi_pupuk"]["jenis"],
        "rekomendasi_pupuk_gram": ai_output["rekomendasi_pupuk"]["takaran_gram"],
        "catatan_tambahan": ai_output["catatan_tambahan"],
        "tingkat_keyakinan": ai_output["tingkat_keyakinan"],
        "latitude": lat_val,
        "longitude": lng_val
    }

    new_id = insert_analysis(record_data)

    # Susun respons lengkap
    response_data = {
        "id": new_id,
        "image_hash": img_hash,
        "image_path": public_image_url,
        "jenis_tanaman": jenis_tanaman,
        "jenis_objek": ai_output["jenis_objek"],
        "diagnosis": ai_output["diagnosis"],
        "tingkat_keparahan": ai_output["tingkat_keparahan"],
        "rekomendasi_air_ml": ai_output["rekomendasi_air_ml"],
        "rekomendasi_pupuk": ai_output["rekomendasi_pupuk"],
        "catatan_tambahan": ai_output["catatan_tambahan"],
        "tingkat_keyakinan": ai_output["tingkat_keyakinan"],
        "latitude": lat_val,
        "longitude": lng_val,
        "is_cached": False
    }

    return jsonify({
        "status": "success",
        "message": "Analisis berhasil diselesaikan.",
        "data": response_data
    }), 201


@app.route("/api/history", methods=["GET"])
def api_history():
    """Mengambil daftar riwayat analisis, mendukung query filter ?jenis_tanaman="""
    jenis_tanaman = request.args.get("jenis_tanaman")
    analyses = get_all_analyses(jenis_tanaman=jenis_tanaman)
    return jsonify({
        "status": "success",
        "total": len(analyses),
        "data": analyses
    }), 200


@app.route("/api/history/<int:analysis_id>", methods=["GET"])
def api_history_detail(analysis_id: int):
    """Mengambil detail lengkap dari satu hasil analisis."""
    analysis = get_analysis_by_id(analysis_id)
    if not analysis:
        return jsonify({
            "status": "error",
            "message": f"Data analisis dengan ID {analysis_id} tidak ditemukan."
        }), 404

    return jsonify({
        "status": "success",
        "data": analysis
    }), 200


@app.route("/api/feedback", methods=["POST"])
def api_feedback():
    """Menyimpan umpan balik pengguna terkait akurasi hasil diagnosis."""
    data = request.get_json() or {}
    analysis_id = data.get("analysis_id")
    is_accurate = data.get("is_accurate")
    catatan = data.get("catatan", "")

    if analysis_id is None or is_accurate is None:
        return jsonify({
            "status": "error",
            "message": "Field 'analysis_id' dan 'is_accurate' (boolean) wajib disertakan."
        }), 400

    analysis = get_analysis_by_id(int(analysis_id))
    if not analysis:
        return jsonify({
            "status": "error",
            "message": f"Analisis dengan ID {analysis_id} tidak ditemukan."
        }), 404

    feedback_id = insert_feedback(int(analysis_id), bool(is_accurate), catatan)
    return jsonify({
        "status": "success",
        "message": "Terima kasih! Umpan balik Anda berhasil disimpan.",
        "feedback_id": feedback_id
    }), 201


@app.route("/api/export/<int:analysis_id>", methods=["GET"])
def api_export_pdf(analysis_id: int):
    """Menghasilkan dan mengunduh berkas laporan PDF dari hasil analisis."""
    analysis = get_analysis_by_id(analysis_id)
    if not analysis:
        return jsonify({
            "status": "error",
            "message": f"Analisis dengan ID {analysis_id} tidak ditemukan."
        }), 404

    pdf_buffer = generate_analysis_pdf(analysis)
    filename = f"Laporan-AgriVision-{analysis_id}.pdf"
    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename
    )


# ==========================================================
# Main Runner
# ==========================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "1") == "1"
    print(f"🌾 Agri-Vision Server berjalan di http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
