"""
gemini_service.py
Modul integrasi dengan Google Gemini Vision API untuk analisis gambar pertanian.
Menangani konstruksi prompt, pemanggilan API, ekstraksi JSON aman (markdown fence handling),
serta validasi struktur respons.
"""

import os
import re
import json
from io import BytesIO
from PIL import Image

try:
    import google.generativeai as genai
except ImportError:
    genai = None

# Template Prompt Sistem Sesuai Bagian 7 Spesifikasi
SYSTEM_PROMPT_TEMPLATE = """Anda adalah asisten AI ahli agronomi.
Analisis gambar pertanian berikut (bisa berupa daun atau permukaan tanah).
Konteks jenis tanaman (bila tersedia): {jenis_tanaman}

Deteksi kondisi kelembapan tanah dan/atau gejala malnutrisi, hama, atau
penyakit pada daun. Kembalikan jawaban HANYA dalam format JSON valid,
tanpa teks tambahan apa pun di luar JSON, dengan struktur berikut:

{{
  "jenis_objek": "daun" atau "tanah",
  "diagnosis": "ringkasan singkat kondisi",
  "tingkat_keparahan": "Ringan" | "Sedang" | "Berat",
  "rekomendasi_air_ml": angka,
  "rekomendasi_pupuk": {{
    "jenis": "mis. NPK 16-16-16",
    "takaran_gram": angka
  }},
  "catatan_tambahan": "saran tindakan lain bila ada",
  "tingkat_keyakinan": angka 0-100
}}"""


def clean_and_parse_json(raw_text: str) -> dict:
    """
    Mengekstrak dan mem-parsing JSON dari respons teks Gemini,
    menghilangkan blok kode markdown (```json ... ```) jika ada.
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("Respons dari AI kosong.")

    text = raw_text.strip()

    # Coba langsung parse jika sudah JSON murni
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Ekstraksi menggunakan regex untuk menangkap blok ```json ... ``` atau kurung kurawal {...}
    markdown_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    match = re.search(markdown_pattern, text)
    if match:
        cleaned = match.group(1).strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

    # Coba cari kurung kurawal terluar
    brace_pattern = r"(\{[\s\S]*\})"
    brace_match = re.search(brace_pattern, text)
    if brace_match:
        try:
            return json.loads(brace_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Gagal mem-parsing format JSON dari AI: {text[:200]}...")


def validate_and_normalize_result(parsed: dict) -> dict:
    """
    Menormalkan dan memvalidasi tipe data field agar sesuai dengan skema database.
    """
    jenis_objek = str(parsed.get("jenis_objek", "daun")).strip().lower()
    if "tanah" in jenis_objek:
        jenis_objek = "tanah"
    else:
        jenis_objek = "daun"

    diagnosis = str(parsed.get("diagnosis", "Kondisi tidak terdefinisi.")).strip()

    tingkat_keparahan = str(parsed.get("tingkat_keparahan", "Ringan")).strip().capitalize()
    if tingkat_keparahan not in ["Ringan", "Sedang", "Berat"]:
        if "berat" in tingkat_keparahan.lower():
            tingkat_keparahan = "Berat"
        elif "sedang" in tingkat_keparahan.lower():
            tingkat_keparahan = "Sedang"
        else:
            tingkat_keparahan = "Ringan"

    # Rekomendasi air
    try:
        air_ml = int(parsed.get("rekomendasi_air_ml", 0))
    except (ValueError, TypeError):
        air_ml = 250

    # Rekomendasi pupuk
    pupuk_raw = parsed.get("rekomendasi_pupuk", {})
    if isinstance(pupuk_raw, dict):
        pupuk_jenis = str(pupuk_raw.get("jenis", "Pupuk Organik/NPK")).strip()
        try:
            pupuk_gram = int(pupuk_raw.get("takaran_gram", 0))
        except (ValueError, TypeError):
            pupuk_gram = 0
    else:
        pupuk_jenis = str(pupuk_raw).strip() or "NPK Seimbang"
        pupuk_gram = 15

    catatan = str(parsed.get("catatan_tambahan", "")).strip()

    try:
        keyakinan = int(parsed.get("tingkat_keyakinan", 85))
        keyakinan = max(0, min(100, keyakinan))
    except (ValueError, TypeError):
        keyakinan = 80

    return {
        "jenis_objek": jenis_objek,
        "diagnosis": diagnosis,
        "tingkat_keparahan": tingkat_keparahan,
        "rekomendasi_air_ml": air_ml,
        "rekomendasi_pupuk": {
            "jenis": pupuk_jenis,
            "takaran_gram": pupuk_gram
        },
        "catatan_tambahan": catatan,
        "tingkat_keyakinan": keyakinan
    }


def analyze_plant_image(image_bytes: bytes, jenis_tanaman: str = None) -> tuple[bool, dict | str]:
    """
    Mengirim gambar ke Google Gemini Vision API dan mengembalikan hasil terstruktur.
    
    Returns:
        (success: bool, result_or_error: dict | str)
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return False, "GEMINI_API_KEY belum dikonfigurasi di file .env atau environment variable."

    if genai is None:
        return False, "Pustaka google-generativeai belum terinstal. Jalankan: pip install -r requirements.txt"

    try:
        # Konfigurasi client SDK
        genai.configure(api_key=api_key)

        # Buka gambar menggunakan Pillow
        pil_image = Image.open(BytesIO(image_bytes))

        # Format prompt
        tanaman_str = jenis_tanaman.strip() if jenis_tanaman and jenis_tanaman.strip() else "Umum / Belum Ditentukan"
        prompt_text = SYSTEM_PROMPT_TEMPLATE.format(jenis_tanaman=tanaman_str)

        # Coba beberapa model kandidat Gemini Vision
        candidate_models = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-2.0-flash"]
        response = None
        last_err = None

        for m_name in candidate_models:
            try:
                model = genai.GenerativeModel(
                    model_name=m_name,
                    generation_config={"temperature": 0.2, "response_mime_type": "application/json"}
                )
                response = model.generate_content([prompt_text, pil_image])
                if response and response.text and response.text.strip():
                    break
            except Exception as m_err:
                last_err = m_err

        if not response or not response.text:
            raise last_err or ValueError("Tidak menerima respons dari model-model Gemini Vision.")

        parsed_json = clean_and_parse_json(response.text)
        normalized = validate_and_normalize_result(parsed_json)
        return True, normalized

    except Exception as exc:
        err_msg = str(exc)
        # Penanganan khusus jika kuota / koneksi bermasalah
        if "API_KEY_INVALID" in err_msg or "PERMISSION_DENIED" in err_msg:
            return False, "GEMINI_API_KEY tidak valid atau tidak memiliki izin akses."
        elif "ResourceExhausted" in err_msg or "429" in err_msg:
            return False, "Batas kuota API Gemini tercapai (Rate Limit / Quota Exceeded). Harap coba beberapa saat lagi."
        return False, f"Terjadi kesalahan saat memproses gambar dengan AI: {err_msg}"
