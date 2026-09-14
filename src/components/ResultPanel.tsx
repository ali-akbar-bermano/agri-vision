import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Download, MessageSquare, Zap, Droplets, FlaskConical, ShieldCheck, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { AnalysisRecord } from '../types';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

interface ResultPanelProps {
  data: AnalysisRecord;
  onOpenFeedback: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ data, onOpenFeedback }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Trigger celebratory confetti on clean/mild diagnosis or first load
  useEffect(() => {
    if (data.tingkat_keparahan === 'Ringan') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2E7D32', '#66BB6A', '#A5D6A7'],
      });
    }
  }, [data.id]);

  // TTS using Web Speech API
  const handleToggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Fitur pembacaan suara tidak didukung oleh browser Anda.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cropName = data.jenis_tanaman || 'tanaman';
    const textToSpeak = `Hasil diagnosis untuk ${cropName}. Tingkat keparahan adalah ${data.tingkat_keparahan}. ` +
      `Temuan: ${data.diagnosis}. ` +
      `Kebutuhan air tambahan: ${data.rekomendasi_air_ml} mililiter. ` +
      `Rekomendasi pupuk: berikan ${data.rekomendasi_pupuk?.takaran_gram || data.rekomendasi_pupuk_gram || 15} gram ${data.rekomendasi_pupuk?.jenis || data.rekomendasi_pupuk_jenis}. ` +
      (data.catatan_tambahan ? `Catatan lapangan: ${data.catatan_tambahan}` : '');

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;

    // Indonesian voice preference
    const voices = window.speechSynthesis.getVoices();
    const indoVoice = voices.find((v) => v.lang.includes('id') || v.lang.includes('ID'));
    if (indoVoice) utterance.voice = indoVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Direct Client-Side PDF Generation + Server fallback
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(46, 125, 50); // #2E7D32
      doc.rect(0, 0, 210, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('AGRI-VISION — LAPORAN DIAGNOSIS PERTANIAN', 14, 15);

      // Metadata Info Box
      doc.setFillColor(244, 248, 244);
      doc.rect(14, 30, 182, 34, 'F');
      doc.setDrawColor(208, 221, 208);
      doc.rect(14, 30, 182, 34, 'S');

      doc.setTextColor(30, 50, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`ID Analisis: #${data.id}`, 18, 38);
      doc.text(`Tanggal: ${data.created_at || new Date().toLocaleDateString('id-ID')}`, 110, 38);

      doc.setFont('helvetica', 'normal');
      doc.text(`Jenis Komoditas: ${data.jenis_tanaman || 'Umum'}`, 18, 46);
      doc.text(`Objek Analisis: ${data.jenis_objek.toUpperCase()}`, 110, 46);

      doc.text(`Tingkat Keparahan: ${data.tingkat_keparahan.toUpperCase()}`, 18, 54);
      doc.text(`Keyakinan AI Vision: ${data.tingkat_keyakinan}%`, 110, 54);

      // Section 1: Diagnosis
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(27, 94, 32);
      doc.text('1. Temuan Kondisi Tanaman / Tanah', 14, 73);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      const splitDiagnosis = doc.splitTextToSize(data.diagnosis, 180);
      doc.text(splitDiagnosis, 14, 80);

      // Section 2: Recommendations
      let currentY = 80 + splitDiagnosis.length * 6 + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(27, 94, 32);
      doc.text('2. Rekomendasi Tindakan Lapangan', 14, currentY);

      currentY += 8;
      doc.setFillColor(250, 250, 250);
      doc.rect(14, currentY, 182, 22, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, currentY, 182, 22, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text('Kebutuhan Air Tambahan:', 18, currentY + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.rekomendasi_air_ml.toLocaleString()} ml / tanaman`, 75, currentY + 8);

      doc.setFont('helvetica', 'bold');
      doc.text('Rekomendasi Pupuk:', 18, currentY + 16);
      doc.setFont('helvetica', 'normal');
      const pupukStr = `${data.rekomendasi_pupuk?.jenis || data.rekomendasi_pupuk_jenis} (${data.rekomendasi_pupuk?.takaran_gram || data.rekomendasi_pupuk_gram} gr / tanaman)`;
      doc.text(pupukStr, 75, currentY + 16);

      // Section 3: Notes
      currentY += 30;
      if (data.catatan_tambahan) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(27, 94, 32);
        doc.text('3. Catatan Khusus & Penanganan Lahan', 14, currentY);

        currentY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        const splitNotes = doc.splitTextToSize(data.catatan_tambahan, 180);
        doc.text(splitNotes, 14, currentY);
        currentY += splitNotes.length * 6;
      }

      // Verification & GPS
      currentY += 10;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const gpsTxt = data.latitude ? `Koordinat GPS Lahan: ${data.latitude.toFixed(5)}, ${data.longitude?.toFixed(5)}` : 'Koordinat: Tidak dicatat';
      doc.text(gpsTxt, 14, currentY);
      doc.text(`Hash Berkas SHA-256: ${data.image_hash}`, 14, currentY + 5);

      // Footer
      doc.setFontSize(8);
      doc.text('Dihasilkan otomatis oleh Agri-Vision berbasis Google Gemini Vision API. Gunakan sebagai panduan awal budidaya.', 14, 280);

      doc.save(`Laporan-AgriVision-${data.id}.pdf`);
    } catch (err) {
      console.warn('jsPDF error, membuka fallback print route:', err);
      window.open(`/api/export/${data.id}?print=true`, '_blank');
    }
  };

  const getKeparahanBadge = () => {
    const kep = data.tingkat_keparahan;
    if (kep === 'Berat') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
          <AlertOctagon className="w-4 h-4" />
          <span>Tingkat Keparahan: Berat</span>
        </span>
      );
    }
    if (kep === 'Sedang') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-4 h-4" />
          <span>Tingkat Keparahan: Sedang</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
        <CheckCircle2 className="w-4 h-4" />
        <span>Tingkat Keparahan: Ringan</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border-l-4 border-l-[#2E7D32] border-y border-r border-[#E2E8E2] shadow-sm p-5 sm:p-7 transition-all">
      {/* Header Result */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8E2] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide bg-[#EFEBE9] text-[#4E342E]">
              {data.jenis_objek}
            </span>
            <span className="text-xs text-[#5C6E61]">ID #{data.id}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C281F]">
            {data.jenis_tanaman || 'Diagnosis Sampel'}
          </h2>
        </div>

        <div>{getKeparahanBadge()}</div>
      </div>

      {/* Cache Notification Banner */}
      {data.is_cached && (
        <div className="mb-5 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 font-semibold">
          <Zap className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Hasil instan dari Cache Lokal (SHA-256 gambar identik terdeteksi, hemat kuota API).</span>
        </div>
      )}

      {/* Grid Layout: Image on left, analysis details on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Image & Confidence */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-xl overflow-hidden border border-[#D0DDD0] bg-black/5 shadow-xs">
            <img
              src={data.image_path}
              alt="Sampel yang dianalisis"
              className="w-full max-h-64 object-cover block"
            />
          </div>

          {/* AI Confidence Meter */}
          <div className="bg-[#FAFDF9] border border-[#D0DDD0] rounded-xl p-3.5">
            <div className="flex justify-between items-center text-xs font-semibold text-[#1C281F] mb-1.5">
              <span className="flex items-center gap-1.5 text-[#2E7D32]">
                <ShieldCheck className="w-4 h-4" />
                <span>Tingkat Keyakinan AI</span>
              </span>
              <span className="text-sm font-bold text-[#1B5E20]">{data.tingkat_keyakinan}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#E0E8E0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#66BB6A] to-[#2E7D32] transition-all duration-700 ease-out"
                style={{ width: `${data.tingkat_keyakinan}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnosis, Recommendations, Notes */}
        <div className="md:col-span-7 space-y-5">
          {/* Diagnosis Block */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] mb-1">
              Temuan Diagnosis
            </h3>
            <p className="text-base text-[#1C281F] font-medium leading-relaxed bg-[#F8FAF8] p-4 rounded-xl border border-[#E2E8E2]">
              {data.diagnosis}
            </p>
          </div>

          {/* Recommendations Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Water Recommendation */}
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-blue-700">Kebutuhan Air</span>
                <p className="text-sm font-bold text-[#1C281F] mt-0.5">
                  {data.rekomendasi_air_ml.toLocaleString()} ml <span className="text-xs font-normal text-gray-600">/ tanaman</span>
                </p>
              </div>
            </div>

            {/* Fertilizer Recommendation */}
            <div className="bg-[#FDF4EB] border border-[#F8D7BE] rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EFEBE9] text-[#795548] flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#795548]">Rekomendasi Pupuk</span>
                <p className="text-sm font-bold text-[#1C281F] mt-0.5">
                  {data.rekomendasi_pupuk?.jenis || data.rekomendasi_pupuk_jenis}
                </p>
                <p className="text-xs text-[#5C6E61]">
                  Dosis: <b>{data.rekomendasi_pupuk?.takaran_gram || data.rekomendasi_pupuk_gram || 15} gram</b> / tanaman
                </p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {data.catatan_tambahan && (
            <div className="bg-[#FAFDF9] border border-[#D0DDD0] rounded-xl p-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                Catatan Tindakan Lapangan
              </h4>
              <p className="text-sm text-[#2F3E32] leading-relaxed">
                {data.catatan_tambahan}
              </p>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {/* Audio TTS Button */}
            <button
              type="button"
              id="btn-tts-listen"
              onClick={handleToggleTTS}
              className={`flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-[#2E7D32] text-white animate-pulse'
                  : 'bg-[#F1F5F1] hover:bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Hentikan Suara' : 'Dengarkan (TTS)'}</span>
            </button>

            {/* PDF Export Button */}
            <button
              type="button"
              id="btn-download-pdf"
              onClick={handleDownloadPDF}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F1F5F1] hover:bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF</span>
            </button>

            {/* Feedback Button */}
            <button
              type="button"
              id="btn-give-feedback"
              onClick={onOpenFeedback}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAFDF9] text-[#795548] border border-[#D7CCC8] rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Beri Feedback</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
