import React, { useState, useEffect, useRef } from 'react';
import { Header, AppTab } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ResultPanel } from './components/ResultPanel';
import { FeaturesSection } from './components/FeaturesSection';
import { HistorySection } from './components/HistorySection';
import { FeedbackModal } from './components/FeedbackModal';
import { DosageCalculator } from './components/DosageCalculator';
import { WeatherSprayAdvisor } from './components/WeatherSprayAdvisor';
import { PestEncyclopedia } from './components/PestEncyclopedia';
import { AnalysisRecord } from './types';
import { CheckCircle, AlertCircle, RefreshCw, Sprout } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('diagnosis');
  const [historyItems, setHistoryItems] = useState<AnalysisRecord[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<AnalysisRecord | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // Register PWA Service Worker & invalidate stale caches
  useEffect(() => {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          reg.update();
        })
        .catch((err) => console.log('PWA registration notice:', err.message));

      // Clean up legacy v1 cache if present
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => {
            if (key === 'agri-vision-v1') {
              caches.delete(key);
            }
          });
        });
      }
    }
  }, []);

  // Fetch initial history from API or LocalStorage (for GitHub Pages static mode)
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setHistoryItems(json.data);
          if (!currentAnalysis) {
            setCurrentAnalysis(json.data[0]);
          }
          return;
        }
      }
    } catch {
      // Offline / GitHub Pages static mode
    }

    // LocalStorage fallback for GitHub Pages
    try {
      const local = localStorage.getItem('agrivision_history');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistoryItems(parsed);
          if (!currentAnalysis) {
            setCurrentAnalysis(parsed[0]);
          }
        }
      }
    } catch (err) {
      console.warn('Gagal membaca localStorage riwayat:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAnalyze = async (payload: {
    blobOrBase64: Blob | string;
    fileName: string;
    crop: string;
    latitude?: number | null;
    longitude?: number | null;
    previewUrl: string;
  }) => {
    setIsLoading(true);
    setNotification(null);

    try {
      let record: AnalysisRecord | null = null;

      // 1. Coba panggil Backend API jika tersedia
      try {
        const formData = new FormData();
        if (typeof payload.blobOrBase64 === 'string') {
          formData.append('image', payload.blobOrBase64);
        } else {
          formData.append('image', payload.blobOrBase64, payload.fileName || 'upload.jpg');
        }

        if (payload.crop) {
          formData.append('jenis_tanaman', payload.crop);
        }
        if (payload.latitude) {
          formData.append('latitude', payload.latitude.toString());
        }
        if (payload.longitude) {
          formData.append('longitude', payload.longitude.toString());
        }

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && result.data) {
            record = result.data;
          }
        }
      } catch (backendErr) {
        console.warn('Backend API tidak terjangkau (Mode GitHub Pages / Statis):', backendErr);
      }

      // 2. Jika di GitHub Pages (tidak ada backend) atau API gagal, gunakan Client Agronomy Engine
      if (!record) {
        const { analyzePlantClientSide } = await import('./clientAgronomyService');
        record = analyzePlantClientSide(
          payload.crop,
          payload.previewUrl,
          payload.latitude,
          payload.longitude
        );
      }

      if (payload.previewUrl && !record.image_path.startsWith('http')) {
        record.image_path = payload.previewUrl;
      }

      setCurrentAnalysis(record);
      setHistoryItems((prev) => {
        const updated = [record!, ...prev.filter((i) => i.id !== record!.id)];
        try {
          localStorage.setItem('agrivision_history', JSON.stringify(updated.slice(0, 30)));
        } catch {
          // ignore
        }
        return updated;
      });

      showToast(
        record.is_cached
          ? 'Hasil diambil langsung dari Cache (Gambar identik terdeteksi).'
          : 'Diagnosis AI Agronomi berhasil diselesaikan!',
        'success'
      );

      // Scroll to result smoothly
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat memproses gambar.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFDFD] text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-[#143823]">
      {/* 1. Bagian Navigasi (Navbar) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={historyItems.length}
      />

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-fadeIn">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-sm font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Tab 1: Landing Page & Diagnosis */}
        {activeTab === 'diagnosis' && (
          <div>
            {/* 2. Bagian Pahlawan (Hero Section) - Split Layout 50/50 */}
            <UploadSection onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Hasil Diagnosis Panel (Jika Ada) */}
            {currentAnalysis && (
              <div ref={resultRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl shadow-emerald-950/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#143823]">
                        Hasil Diagnosis AI Terkini
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const el = document.getElementById('upload-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs text-slate-500 hover:text-emerald-800 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Unggah Sampel Lain</span>
                    </button>
                  </div>

                  <ResultPanel
                    data={currentAnalysis}
                    onOpenFeedback={() => setFeedbackTarget(currentAnalysis)}
                  />
                </div>
              </div>
            )}

            {/* 3. Bagian Kedua (Informasi Tambahan) - Split "Kenapa Memilih Agri-Vision" & 3 Kartu Vertikal */}
            <FeaturesSection
              onStartDiagnosis={() => {
                const el = document.getElementById('upload-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* Tab 2: Riwayat Analisis */}
        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <HistorySection
              historyItems={historyItems}
              onSelectAnalysis={(item) => {
                setCurrentAnalysis(item);
                setActiveTab('diagnosis');
                setTimeout(() => {
                  resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              onNewDiagnosis={() => setActiveTab('diagnosis')}
            />
          </div>
        )}

        {/* Tab 3: Ensiklopedia Hama & Penyakit */}
        {activeTab === 'encyclopedia' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <PestEncyclopedia
              onSelectDiseaseForCalculator={(crop, disease) => {
                setActiveTab('calculator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* Tab 4: Kalkulator Dosis Lahan & Tangki Semprot */}
        {activeTab === 'calculator' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <DosageCalculator
              initialCrop={currentAnalysis?.jenis_tanaman || 'Cabai'}
              initialFertilizer={currentAnalysis?.rekomendasi_pupuk?.jenis || currentAnalysis?.rekomendasi_pupuk_jenis || 'NPK 16-16-16'}
              initialDoseGram={currentAnalysis?.rekomendasi_pupuk?.takaran_gram || currentAnalysis?.rekomendasi_pupuk_gram || 15}
              initialWaterMl={currentAnalysis?.rekomendasi_air_ml || 400}
            />
          </div>
        )}

        {/* Tab 5: Cuaca Lahan & Waktu Ideal Semprot */}
        {activeTab === 'weather' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <WeatherSprayAdvisor
              latitude={currentAnalysis?.latitude}
              longitude={currentAnalysis?.longitude}
            />
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      {feedbackTarget && (
        <FeedbackModal
          analysis={feedbackTarget}
          onClose={() => setFeedbackTarget(null)}
          onSubmitSuccess={() => {
            showToast('Terima kasih atas umpan balik Anda!', 'success');
          }}
        />
      )}

      {/* Footer Modern Bertema Lingkungan */}
      <footer id="tentang-kami" className="mt-auto bg-[#0B2215] text-white border-t border-[#143823]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#143823] flex items-center justify-center text-emerald-400 shadow-md">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Mata<span className="text-emerald-400">Tani</span>
                </span>
                <p className="text-[11px] text-emerald-200/60 font-medium -mt-0.5">
                  Smart Precision Agriculture & Agronomy AI
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-emerald-200/70">
              <span>AI Agronomi Presisi</span>
              <span>•</span>
              <span>Client Canvas Compression</span>
              <span>•</span>
              <span>SHA-256 Cache</span>
              <span>•</span>
              <span>Voice Narration</span>
              <span>•</span>
              <span>PDF Report Export</span>
            </div>

            <p className="text-xs text-emerald-200/60 text-center sm:text-right">
              © 2026 MataTani. Ketahanan Pangan & Pertanian Berkelanjutan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
