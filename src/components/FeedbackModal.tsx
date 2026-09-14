import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnalysisRecord } from '../types';

interface FeedbackModalProps {
  analysis: AnalysisRecord;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  analysis,
  onClose,
  onSubmitSuccess,
}) => {
  const [isAccurate, setIsAccurate] = useState<boolean | null>(true);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAccurate === null) {
      setErrorMsg('Pilih apakah diagnosis akurat atau tidak.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysis.id,
          is_accurate: isAccurate,
          catatan: notes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'Gagal menyimpan feedback.');
      }

      setSuccessMsg('Terima kasih! Umpan balik Anda berhasil dicatat.');
      setTimeout(() => {
        onSubmitSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8E2] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5C6E61] hover:text-[#1C281F] p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-[#1B5E20] mb-1">Evaluasi Akurasi Diagnosis</h3>
        <p className="text-xs text-[#5C6E61] mb-5">
          Bantu kami meningkatkan kualitas model agronomis untuk analisis ID #{analysis.id} ({analysis.jenis_tanaman || 'Tanaman'}).
        </p>

        {successMsg ? (
          <div className="py-6 text-center text-green-700 space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 animate-bounce" />
            <p className="font-bold text-sm">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1C281F] uppercase tracking-wider mb-2">
                Apakah diagnosis ini sesuai dengan kondisi nyata?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsAccurate(true)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isAccurate === true
                      ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20]'
                      : 'bg-white border-[#D0DDD0] text-[#5C6E61] hover:bg-[#F9FAF9]'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 text-[#2E7D32]" />
                  <span>Akurat / Sesuai</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAccurate(false)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isAccurate === false
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-[#D0DDD0] text-[#5C6E61] hover:bg-[#F9FAF9]'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  <span>Tidak Akurat</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="feedback-notes" className="block text-xs font-bold text-[#1C281F] uppercase tracking-wider mb-1.5">
                Catatan Pengamatan Lapangan <span className="text-[11px] font-normal text-gray-500">(Opsional)</span>
              </label>
              <textarea
                id="feedback-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Gejala di lapangan ternyata lebih mirip kekurangan kalium daripada jamur..."
                className="w-full text-xs p-3 border border-[#D0DDD0] rounded-xl focus:outline-none focus:border-[#2E7D32]"
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#D0DDD0] text-xs font-semibold text-[#5C6E61] hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold transition-all"
              >
                {isSubmitting ? 'Menyimpan...' : 'Kirim Umpan Balik'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
