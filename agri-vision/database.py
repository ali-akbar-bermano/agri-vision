"""
database.py
Modul manajemen basis data SQLite untuk Agri-Vision.
Menyediakan inisialisasi skema tabel 'analyses' & 'feedback' serta operasi CRUD.
"""

import sqlite3
import os
from datetime import datetime

DATABASE_NAME = os.environ.get("DATABASE_PATH", "agrivision.db")


def get_db_connection():
    """Membuka koneksi ke database SQLite dengan row_factory dictionary."""
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Inisialisasi tabel analyses dan feedback jika belum ada."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Tabel analyses
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_hash TEXT NOT NULL,
        image_path TEXT NOT NULL,
        jenis_tanaman TEXT,
        jenis_objek TEXT NOT NULL,
        diagnosis TEXT NOT NULL,
        tingkat_keparahan TEXT NOT NULL,
        rekomendasi_air_ml INTEGER NOT NULL,
        rekomendasi_pupuk_jenis TEXT NOT NULL,
        rekomendasi_pupuk_gram INTEGER NOT NULL,
        catatan_tambahan TEXT,
        tingkat_keyakinan INTEGER NOT NULL,
        latitude REAL,
        longitude REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Index untuk pencarian cepat berbasis hash (caching) dan filter tanaman
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_analyses_hash ON analyses(image_hash);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_analyses_tanaman ON analyses(jenis_tanaman);")

    # Tabel feedback
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        analysis_id INTEGER NOT NULL,
        is_accurate BOOLEAN NOT NULL,
        catatan TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()


def find_analysis_by_hash(image_hash: str):
    """Mencari analisis sebelumnya dengan hash gambar yang sama (cache hit)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM analyses WHERE image_hash = ? ORDER BY created_at DESC LIMIT 1",
        (image_hash,)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def insert_analysis(data: dict) -> int:
    """Menyimpan record analisis baru ke database dan mengembalikan id-nya."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO analyses (
            image_hash, image_path, jenis_tanaman, jenis_objek,
            diagnosis, tingkat_keparahan, rekomendasi_air_ml,
            rekomendasi_pupuk_jenis, rekomendasi_pupuk_gram,
            catatan_tambahan, tingkat_keyakinan, latitude, longitude, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("image_hash"),
        data.get("image_path"),
        data.get("jenis_tanaman"),
        data.get("jenis_objek"),
        data.get("diagnosis"),
        data.get("tingkat_keparahan"),
        data.get("rekomendasi_air_ml", 0),
        data.get("rekomendasi_pupuk_jenis", "-"),
        data.get("rekomendasi_pupuk_gram", 0),
        data.get("catatan_tambahan", ""),
        data.get("tingkat_keyakinan", 0),
        data.get("latitude"),
        data.get("longitude"),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    inserted_id = cursor.lastrowid
    conn.close()
    return inserted_id


def get_all_analyses(jenis_tanaman: str = None):
    """Mengambil daftar seluruh riwayat analisis dengan filter opsional jenis tanaman."""
    conn = get_db_connection()
    cursor = conn.cursor()

    if jenis_tanaman and jenis_tanaman.strip() and jenis_tanaman.lower() != 'semua':
        cursor.execute(
            "SELECT * FROM analyses WHERE LOWER(jenis_tanaman) = LOWER(?) ORDER BY created_at DESC",
            (jenis_tanaman.strip(),)
        )
    else:
        cursor.execute("SELECT * FROM analyses ORDER BY created_at DESC")

    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_analysis_by_id(analysis_id: int):
    """Mengambil satu detail analisis berdasarkan ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def insert_feedback(analysis_id: int, is_accurate: bool, catatan: str = None) -> int:
    """Menyimpan feedback akurasi dari pengguna."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO feedback (analysis_id, is_accurate, catatan, created_at)
        VALUES (?, ?, ?, ?)
    """, (
        analysis_id,
        1 if is_accurate else 0,
        catatan,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    feedback_id = cursor.lastrowid
    conn.close()
    return feedback_id
