import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Download, MessageSquare, Zap, Droplets, FlaskConical, ShieldCheck, CheckCircle2, AlertTriangle, AlertOctagon, Calculator, Calendar, CloudRain, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisRecord } from '../types';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { DosageCalculator } from './DosageCalculator';
import { TreatmentTimeline } from './TreatmentTimeline';
import { WeatherSprayAdvisor } from './WeatherSprayAdvisor';

interface ResultPanelProps {
  data: AnalysisRecord;
  onOpenFeedback: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ data, onOpenFeedback }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<'none' | 'calculator' | 'timeline' | 'weather'>('none');

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
      doc.text('Dihasilkan otomatis oleh Agri-Vision berbasis Model AI Agronomi Presisi. Gunakan sebagai panduan awal budidaya.', 14, 280);

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
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-100">
          <AlertOctagon className="w-4 h-4" />
          <span>Tingkat Keparahan: Berat</span>
        </span>
      );
    }
    if (kep === 'Sedang') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-100">
          <AlertTriangle className="w-4 h-4" />
          <span>Tingkat Keparahan: Sedang</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100">
        <CheckCircle2 className="w-4 h-4" />
        <span>Tingkat Keparahan: Ringan</span>
      </span>
    );
  };

  return (
    <div className="bg-[#FAFAF8] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 transition-all">
      {/* Header Result */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/60 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-stone-200/70 text-stone-700">
              {data.jenis_objek}
            </span>
            <span className="text-xs text-stone-400 font-medium">ID #{data.id}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {data.jenis_tanaman || 'Diagnosis Sampel'}
          </h2>
        </div>

        <div>{getKeparahanBadge()}</div>
      </div>

      {/* Cache Notification Banner */}
      {data.is_cached && (
        <div className="mb-5 px-4 py-2.5 bg-amber-50/80 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 font-semibold shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <Zap className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Hasil instan dari Cache Lokal (SHA-256 gambar identik terdeteksi, hemat kuota API).</span>
        </div>
      )}

      {/* Grid Layout: Image on left, analysis details on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Image & Confidence */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-2xl overflow-hidden bg-stone-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <img
              src={data.image_path}
              alt="Sampel yang dianalisis"
              className="w-full max-h-64 object-cover block rounded-2xl"
            />
          </div>

          {/* AI Confidence Meter */}
          <div className="bg-white/80 rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <div className="flex justify-between items-center text-xs font-semibold text-stone-800 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Tingkat Keyakinan AI</span>
              </span>
              <span className="text-sm font-extrabold text-emerald-800">{data.tingkat_keyakinan}%</span>
            </div>
            <div className="w-full h-2 bg-stone-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-700 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${data.tingkat_keyakinan}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnosis, Recommendations, Notes */}
        <div className="md:col-span-7 space-y-5">
          {/* Diagnosis Block */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1.5">
              Temuan Diagnosis
            </h3>
            <div className="bg-white/90 p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <p className="text-base text-stone-800 font-medium leading-relaxed">
                {data.diagnosis}
              </p>
            </div>
          </div>

          {/* Recommendations Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Water Recommendation */}
            <div className="bg-[#EEF6FB]/85 rounded-2xl p-4.5 flex items-start gap-3.5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-sky-800 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-sky-900/70">Kebutuhan Air</span>
                <p className="text-base font-extrabold text-stone-900 mt-0.5">
                  {data.rekomendasi_air_ml.toLocaleString()} ml <span className="text-xs font-medium text-stone-500">/ tanaman</span>
                </p>
              </div>
            </div>

            {/* Fertilizer Recommendation */}
            <div className="bg-[#F6F2EB]/95 rounded-2xl p-4.5 flex items-start gap-3.5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#EBE3D7] text-[#6D4C41] flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#795548]">Rekomendasi Pupuk</span>
                <p className="text-base font-extrabold text-stone-900 mt-0.5">
                  {data.rekomendasi_pupuk?.jenis || data.rekomendasi_pupuk_jenis}
                </p>
                <p className="text-xs text-stone-600 mt-0.5">
                  Dosis: <span className="font-bold text-stone-800">{data.rekomendasi_pupuk?.takaran_gram || data.rekomendasi_pupuk_gram || 15} gram</span> / tanaman
                </p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {data.catatan_tambahan && (
            <div className="bg-[#F9F6F0]/80 rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                Catatan Tindakan Lapangan
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed">
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
              className={`flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-emerald-800 text-white animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
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
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200/80 text-stone-800 rounded-2xl text-sm font-semibold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF</span>
            </button>

            {/* Feedback Button */}
            <button
              type="button"
              id="btn-give-feedback"
              onClick={onOpenFeedback}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white text-stone-700 rounded-2xl text-sm font-semibold transition-all cursor-pointer shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Beri Feedback</span>
            </button>
          </div>

          {/* ====================================================
              FITUR TAMBAHAN AGRONOMI TERPADU
              ==================================================== */}
          <div className="pt-4 border-t border-stone-200/60">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                Alat Lanjutan Agronomi Terpadu:
              </span>
              {activeTool !== 'none' && (
                <button
                  type="button"
                  onClick={() => setActiveTool('none')}
                  className="text-[11px] font-bold text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  Tutup Panel Alat
                </button>
              )}
            </div>

            {/* 3 Interactive Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Tool 1: Kalkulator Dosis */}
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'calculator' ? 'none' : 'calculator')}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeTool === 'calculator'
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-2 ring-emerald-600/15'
                    : 'bg-white/80 border-stone-200/70 hover:border-emerald-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Kalkulator Lahan</p>
                    <p className="text-[10px] text-stone-500 font-medium">Hitung tangki & pupuk</p>
                  </div>
                </div>
                {activeTool === 'calculator' ? (
                  <ChevronUp className="w-4 h-4 text-emerald-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>

              {/* Tool 2: Jadwal 14 Hari */}
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'timeline' ? 'none' : 'timeline')}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeTool === 'timeline'
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-2 ring-emerald-600/15'
                    : 'bg-white/80 border-stone-200/70 hover:border-emerald-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Jadwal 14 Hari</p>
                    <p className="text-[10px] text-stone-500 font-medium">Protokol pemulihan</p>
                  </div>
                </div>
                {activeTool === 'timeline' ? (
                  <ChevronUp className="w-4 h-4 text-emerald-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>

              {/* Tool 3: Cuaca & Jendela Semprot */}
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'weather' ? 'none' : 'weather')}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeTool === 'weather'
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-2 ring-emerald-600/15'
                    : 'bg-white/80 border-stone-200/70 hover:border-emerald-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Cuaca & Semprot</p>
                    <p className="text-[10px] text-stone-500 font-medium">Cek jendela aman</p>
                  </div>
                </div>
                {activeTool === 'weather' ? (
                  <ChevronUp className="w-4 h-4 text-emerald-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>
            </div>

            {/* Embedded Active Tool Display */}
            {activeTool === 'calculator' && (
              <div className="mt-4 animate-fadeIn">
                <DosageCalculator
                  initialCrop={data.jenis_tanaman || 'Cabai'}
                  initialFertilizer={data.rekomendasi_pupuk?.jenis || data.rekomendasi_pupuk_jenis || 'NPK 16-16-16'}
                  initialDoseGram={data.rekomendasi_pupuk?.takaran_gram || data.rekomendasi_pupuk_gram || 15}
                  initialWaterMl={data.rekomendasi_air_ml || 400}
                  isEmbedded={true}
                />
              </div>
            )}

            {activeTool === 'timeline' && (
              <div className="mt-4 animate-fadeIn">
                <TreatmentTimeline
                  diagnosisId={data.id}
                  crop={data.jenis_tanaman || 'Tanaman'}
                  diagnosisText={data.diagnosis}
                  severity={data.tingkat_keparahan}
                  fertilizerName={data.rekomendasi_pupuk?.jenis || data.rekomendasi_pupuk_jenis || 'NPK 16-16-16'}
                  fertilizerGram={data.rekomendasi_pupuk?.takaran_gram || data.rekomendasi_pupuk_gram || 15}
                  waterMl={data.rekomendasi_air_ml || 400}
                  isEmbedded={true}
                />
              </div>
            )}

            {activeTool === 'weather' && (
              <div className="mt-4 animate-fadeIn">
                <WeatherSprayAdvisor
                  latitude={data.latitude}
                  longitude={data.longitude}
                  isEmbedded={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
