"""
pdf_export.py
Modul pembuatan laporan PDF dari hasil analisis Agri-Vision
menggunakan pustaka ReportLab.
"""

from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm


def generate_analysis_pdf(analysis_data: dict) -> BytesIO:
    """
    Menghasilkan dokumen PDF dari data analisis pertanian.
    Mengembalikan BytesIO buffer yang siap di-stream ke pengguna.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#2E7D32'),
        alignment=1,  # Center
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#555555'),
        alignment=1,
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1B5E20'),
        spaceBefore=10,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#222222')
    )

    bold_label = ParagraphStyle(
        'BoldLabel',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    elements = []

    # 1. Header
    elements.append(Paragraph("AGRI-VISION", title_style))
    elements.append(Paragraph("Laporan Resmi Hasil Diagnosis AI Kesehatan Tanaman & Tanah", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#2E7D32'), spaceAfter=15))

    # 2. Metadata Tabel
    keparahan = analysis_data.get('tingkat_keparahan', 'Ringan')
    kep_color = colors.HexColor('#2E7D32')  # Hijau
    if keparahan == 'Sedang':
        kep_color = colors.HexColor('#F57C00')  # Oranye
    elif keparahan == 'Berat':
        kep_color = colors.HexColor('#D32F2F')  # Merah

    tanaman = analysis_data.get('jenis_tanaman') or "Umum / Tidak Ditentukan"
    objek = analysis_data.get('jenis_objek', 'daun').capitalize()
    created_at = analysis_data.get('created_at', '-')
    keyakinan = analysis_data.get('tingkat_keyakinan', 0)

    meta_table_data = [
        [Paragraph("ID Analisis", bold_label), Paragraph(f"#{analysis_data.get('id', '-')}", body_style),
         Paragraph("Tanggal Analisis", bold_label), Paragraph(str(created_at), body_style)],
        [Paragraph("Jenis Tanaman", bold_label), Paragraph(str(tanaman), body_style),
         Paragraph("Objek Foto", bold_label), Paragraph(str(objek), body_style)],
        [Paragraph("Tingkat Keparahan", bold_label), 
         Paragraph(f"<font color='{kep_color.hexval()}'><b>{keparahan.upper()}</b></font>", bold_label),
         Paragraph("Tingkat Keyakinan AI", bold_label), Paragraph(f"<b>{keyakinan}%</b>", body_style)],
    ]

    meta_table = Table(meta_table_data, colWidths=[3.5 * cm, 5 * cm, 4 * cm, 4.5 * cm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F4F6F4')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D0DDD0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 15))

    # 3. Diagnosis Utama
    elements.append(Paragraph("1. Hasil Diagnosis AI", h2_style))
    diagnosis_text = analysis_data.get('diagnosis', 'Tidak ada deskripsi diagnosis.')
    elements.append(Paragraph(diagnosis_text, body_style))
    elements.append(Spacer(1, 12))

    # 4. Rekomendasi Tindakan Lapangan
    elements.append(Paragraph("2. Rekomendasi Tindakan Lapangan", h2_style))

    air_ml = analysis_data.get('rekomendasi_air_ml', 0)
    pupuk_jenis = analysis_data.get('rekomendasi_pupuk_jenis', '-')
    pupuk_gram = analysis_data.get('rekomendasi_pupuk_gram', 0)

    recom_data = [
        [Paragraph("Kebutuhan Air Tambahan", bold_label), Paragraph(f"<b>{air_ml:,} ml / tanaman</b>", body_style)],
        [Paragraph("Rekomendasi Jenis Pupuk", bold_label), Paragraph(f"<b>{pupuk_jenis}</b>", body_style)],
        [Paragraph("Takaran Pupuk yang Disarankan", bold_label), Paragraph(f"<b>{pupuk_gram} gram / tanaman</b>", body_style)]
    ]

    recom_table = Table(recom_data, colWidths=[6.5 * cm, 10.5 * cm])
    recom_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FAFAFA')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E0E0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(recom_table)
    elements.append(Spacer(1, 12))

    # 5. Catatan Tambahan
    catatan = analysis_data.get('catatan_tambahan')
    if catatan and catatan.strip():
        elements.append(Paragraph("3. Catatan & Tindakan Pencegahan", h2_style))
        elements.append(Paragraph(catatan, body_style))
        elements.append(Spacer(1, 12))

    # 6. Geotagging & Hash Data
    lat = analysis_data.get('latitude')
    lng = analysis_data.get('longitude')
    geo_str = f"Lat: {lat:.6f}, Long: {lng:.6f}" if (lat is not None and lng is not None) else "Tidak dicatat"
    hash_str = analysis_data.get('image_hash', '-')

    tech_data = [
        [Paragraph("Koordinat Lahan", bold_label), Paragraph(geo_str, body_style)],
        [Paragraph("Image Hash (SHA256)", bold_label), Paragraph(f"<font size='8'>{hash_str}</font>", body_style)]
    ]
    tech_table = Table(tech_data, colWidths=[4.5 * cm, 12.5 * cm])
    tech_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#EAEAEA')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(Paragraph("4. Data Verifikasi Lapangan", h2_style))
    elements.append(tech_table)
    elements.append(Spacer(1, 20))

    # 7. Footer Disclaimer
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#777777'),
        alignment=1
    )
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CCCCCC'), spaceAfter=8))
    elements.append(Paragraph(
        "Dokumen ini dibuat otomatis oleh Agri-Vision AI Assistant. Rekomendasi berbasis AI Vision "
        "sebagai panduan awal. Lakukan konfirmasi berkala dengan petugas penyuluh pertanian setempat.",
        disclaimer_style
    ))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
