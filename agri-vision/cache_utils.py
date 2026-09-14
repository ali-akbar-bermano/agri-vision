"""
cache_utils.py
Modul untuk utilitas validasi file gambar dan kalkulasi hash (SHA256/MD5)
guna keperluan caching hasil diagnosis Agri-Vision.
"""

import hashlib
import os
from io import BytesIO
from PIL import Image

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
MIN_IMAGE_DIMENSION = 200  # 200x200 px minimum


def allowed_file(filename: str) -> bool:
    """Memeriksa apakah ekstensi file termasuk dalam daftar yang diizinkan."""
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def compute_image_hash(image_bytes: bytes) -> str:
    """Menghitung SHA-256 hash dari data byte gambar untuk kunci cache."""
    return hashlib.sha256(image_bytes).hexdigest()


def validate_image_file(file_storage) -> tuple[bool, str, bytes | None]:
    """
    Memvalidasi file yang diunggah:
    - Ekstensi file diizinkan (JPG, JPEG, PNG, WebP)
    - Ukuran maksimum <= 5MB
    - Dimensi minimum >= 200x200 px
    
    Mengembalikan (is_valid, error_message, image_bytes)
    """
    if not file_storage or file_storage.filename == '':
        return False, "Tidak ada file gambar yang dipilih.", None

    if not allowed_file(file_storage.filename):
        allowed_str = ", ".join(sorted(ALLOWED_EXTENSIONS)).upper()
        return False, f"Format file tidak didukung. Harap gunakan format: {allowed_str}.", None

    # Baca byte file
    image_bytes = file_storage.read()
    file_storage.seek(0)  # Reset pointer file

    # Cek ukuran file
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        return False, "Ukuran file melebihi batas maksimum 5MB.", None

    if len(image_bytes) == 0:
        return False, "File gambar kosong.", None

    # Cek dimensi gambar menggunakan Pillow
    try:
        with Image.open(BytesIO(image_bytes)) as img:
            width, height = img.size
            if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
                return False, (
                    f"Dimensi gambar terlalu kecil ({width}x{height}px). "
                    f"Minimal resolusi adalah {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION}px "
                    "agar analisis AI akurat."
                ), None
    except Exception as e:
        return False, f"File gambar rusak atau tidak dapat dibaca: {str(e)}", None

    return True, "", image_bytes
