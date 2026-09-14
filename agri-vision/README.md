# 🌾 Agri-Vision — Asisten AI Diagnosis Pertanian

Agri-Vision adalah aplikasi web purwarupa (*prototype*) asisten diagnosis pertanian lapangan berbasis **AI Vision**. Dirancang khusus untuk petani dan penyuluh pertanian dalam mendeteksi kondisi kesehatan daun tanaman dan permukaan tanah, memberikan estimasi tingkat keparahan, rekomendasi air, rekomendasi pupuk, skor keyakinan, serta fitur narasi suara (TTS) dan ekspor laporan PDF.

---

## 🚀 Fitur Utama
1. **Diagnosis AI Vision**: Deteksi otomatis bercak daun, hama, defisiensi hara, atau kelembapan tanah via Google Gemini Vision API.
2. **Kompensasi Jaringan Lambat / Hemat Kuota**: Kompresi gambar otomatis di browser (HTML5 Canvas) sebelum dikirim ke server.
3. **Smart Caching SHA-256**: Mencegah pemanggilan ganda API Gemini untuk gambar identik guna efisiensi biaya.
4. **Narasi Suara (TTS)**: Pembacaan hasil diagnosis dalam bahasa Indonesia menggunakan Web Speech API native.
5. **Ekspor Laporan PDF**: Pembuatan laporan agronomi resmi berformat PDF via ReportLab.
6. **Riwayat & Filter Tanaman**: Penyimpanan lokal berbasis SQLite dengan fitur penyaringan per jenis komoditas (Padi, Cabai, Tomat, Jagung, dll.).
7. **PWA (Progressive Web App)**: Dapat dipasang (*installable*) di ponsel pintar dan dapat dibuka pada kondisi sinyal lemah.
8. **Feedback Akurasi**: Mekanisme umpan balik petani untuk continuous improvement.

---

## 🛠️ Tumpukan Teknologi
- **Frontend**: HTML5, CSS3 kustom (Tema Hijau Daun `#2E7D32` & Coklat Tanah `#795548`), Vanilla JavaScript.
- **Backend**: Python 3 (Flask + Werkzeug).
- **AI Engine**: Google Gemini Vision API (`google-generativeai` / `gemini-1.5-flash`).
- **Database**: SQLite3.
- **Ekspor Dokumen**: ReportLab (PDF generator).
- **Audio TTS**: Web Speech API (Browser native).

---

## 🗄️ Skema Database (SQLite)

Berikut adalah skrip DDL SQL untuk inisialisasi tabel basis data:

```sql
-- 1. Tabel Riwayat Analisis
CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_hash TEXT NOT NULL,
    image_path TEXT NOT NULL,
    jenis_tanaman TEXT,
    jenis_objek TEXT NOT NULL,  -- 'daun' atau 'tanah'
    diagnosis TEXT NOT NULL,
    tingkat_keparahan TEXT NOT NULL, -- 'Ringan', 'Sedang', 'Berat'
    rekomendasi_air_ml INTEGER NOT NULL,
    rekomendasi_pupuk_jenis TEXT NOT NULL,
    rekomendasi_pupuk_gram INTEGER NOT NULL,
    catatan_tambahan TEXT,
    tingkat_keyakinan INTEGER NOT NULL, -- 0 s/d 100
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analyses_hash ON analyses(image_hash);
CREATE INDEX IF NOT EXISTS idx_analyses_tanaman ON analyses(jenis_tanaman);

-- 2. Tabel Umpan Balik Akurasi Pengguna
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_id INTEGER NOT NULL,
    is_accurate BOOLEAN NOT NULL,
    catatan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE
);
```

---

## 📋 Prasyarat Sistem
- Python 3.9 atau lebih baru.
- Kunci API Google Gemini (dapat diperoleh gratis melalui [Google AI Studio](https://aistudio.google.com/)).

---

## ⚙️ Langkah Instalasi & Menjalankan di Localhost

### 1. Masuk ke Direktori Proyek
```bash
cd agri-vision
```

### 2. Buat dan Aktifkan Virtual Environment
```bash
# Di Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# Di Windows:
python -m venv venv
venv\Scripts\activate
```

### 3. Pasang Dependensi Python
```bash
pip install -r requirements.txt
```

### 4. Konfigurasi Variabel Lingkungan (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Buka file `.env` dan masukkan API Key Gemini Anda:
```env
GEMINI_API_KEY=AIzaSyD...your_actual_gemini_key
PORT=5000
FLASK_DEBUG=1
```

### 5. Jalankan Aplikasi Flask
```bash
python app.py
```
Atau menggunakan Flask CLI:
```bash
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --port=5000
```

Buka peramban (browser) Anda di:
👉 **`http://localhost:5000`**

---

## 🌐 Dokumentasi REST API

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/analyze` | Menganalisis gambar daun/tanah via Gemini Vision |
| `GET` | `/api/history` | Mengambil daftar riwayat (opsional filter `?jenis_tanaman=`) |
| `GET` | `/api/history/<id>` | Detail satu riwayat analisis |
| `POST` | `/api/feedback` | Menyimpan umpan balik petani (`analysis_id`, `is_accurate`, `catatan`) |
| `GET` | `/api/export/<id>` | Mengunduh file laporan resmi PDF |

---

## 📱 Pengujian Fitur Khusus
1. **Kamera & Galeri**: Klik tombol **Ambil Foto** pada smartphone untuk langsung membuka kamera belakang.
2. **Offline PWA**: Buka menu browser di ponsel lalu pilih **"Tambahkan ke Layar Utama" / "Install Agri-Vision"**.
3. **Narasi Suara**: Setelah hasil diagnosis muncul, tekan **"Dengarkan (TTS)"** untuk mendengarkan panduan audio.
4. **Ekspor PDF**: Klik **"Unduh PDF"** untuk mengunduh lembar rekomendasi lapangan siap cetak.
