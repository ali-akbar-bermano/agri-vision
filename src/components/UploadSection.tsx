import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, UploadCloud, MapPin, X, Sparkles, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { PRESET_SAMPLES } from '../presetData';
import { PresetSample } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import localImages from '../assets/images';

interface UploadSectionProps {
  onAnalyze: (payload: {
    blobOrBase64: Blob | string;
    fileName: string;
    crop: string;
    latitude?: number | null;
    longitude?: number | null;
    previewUrl: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isLoading }) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Umum / Otomatis Deteksi');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    origKb: number;
    compKb: number;
    percentSaved: number;
  } | null>(null);

  const [useGps, setUseGps] = useState<boolean>(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Init Geolocation
  useEffect(() => {
    if (useGps && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Akses lokasi GPS ditolak/tidak aktif:', err.message),
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      setCoords(null);
    }
  }, [useGps]);

  // Client-Side Canvas Image Compression
  const compressImage = (file: File): Promise<{ blob: Blob; dataUrl: string; origKb: number; compKb: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const maxDim = 1280;

          if (width < 200 || height < 200) {
            reject(new Error(`Dimensi gambar terlalu kecil (${width}x${height}px). Minimal 200x200px.`));
            return;
          }

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context tidak tersedia.'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Kompresi gambar gagal.'));
                return;
              }
              const origKb = Math.round(file.size / 1024);
              const compKb = Math.round(blob.size / 1024);
              resolve({
                blob,
                dataUrl: canvas.toDataURL('image/jpeg', 0.82),
                origKb,
                compKb,
              });
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = () => reject(new Error('File gambar rusak atau tidak dapat didekode.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
      reader.readAsDataURL(file);
    });
  };

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validExtensions.includes(file.type.toLowerCase())) {
      setErrorMessage('Format berkas tidak didukung. Harap unggah foto berekstensi JPG, PNG, atau WebP.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Ukuran berkas asli melebihi 15MB.');
      return;
    }

    try {
      const result = await compressImage(file);
      setSelectedFile(file);
      setCompressedBlob(result.blob);
      setPreviewUrl(result.dataUrl);

      const saved = Math.max(0, Math.round(((result.origKb - result.compKb) / result.origKb) * 100));
      setCompressionStats({
        origKb: result.origKb,
        compKb: result.compKb,
        percentSaved: saved,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses dan mengompresi gambar.');
      handleClearImage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setCompressedBlob(null);
    setCompressionStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectPreset = (sample: PresetSample) => {
    setSelectedCrop(sample.crop);
    setPreviewUrl(sample.imageUrl);
    setSelectedFile(null);
    setCompressedBlob(null);
    setCompressionStats({
      origKb: 84,
      compKb: 38,
      percentSaved: 55,
    });
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (!previewUrl) {
      setErrorMessage('Silakan pilih foto daun atau permukaan tanah terlebih dahulu.');
      return;
    }

    if (compressedBlob) {
      onAnalyze({
        blobOrBase64: compressedBlob,
        fileName: selectedFile?.name || 'plant_sample.jpg',
        crop: selectedCrop,
        latitude: coords?.lat,
        longitude: coords?.lng,
        previewUrl,
      });
    } else {
      // Preset Sample (SVG data URI)
      onAnalyze({
        blobOrBase64: previewUrl,
        fileName: `${selectedCrop.toLowerCase()}_sample.svg`,
        crop: selectedCrop,
        latitude: coords?.lat,
        longitude: coords?.lng,
        previewUrl,
      });
    }
  };

  return (
    <section id="beranda" className="relative pt-4 pb-12 lg:py-16 overflow-hidden">
      {/* Dekorasi Latar Belakang Halus */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-0 -z-10 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          
          {/* ====================================================
              KOLOM KIRI: TEKS & AKSI UTAMA
              ==================================================== */}
          <div className="flex flex-col space-y-6">
            
            {/* Badge Subtitel Startup Modern */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold tracking-wide uppercase text-[#143823]">
                Analisis Visi AI Pertanian
              </span>
            </div>

            {/* Headline H1 Sangat Besar & Tebal */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#0B2215] leading-[1.12]">
              Pertanian Cerdas, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#143823] via-emerald-600 to-teal-600">
                Panen Berkualitas.
              </span>
            </h1>

            {/* Subtitle Singkat Teknologi AI untuk Petani */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Asisten agronomi cerdas berbasis visi komputer untuk mendeteksi penyakit daun, malnutrisi, dan kelembapan tanah seketika. Solusi presisi langsung dari genggaman petani.
            </p>

            {/* AREA UNGGAH (DRAG & DROP) */}
            <div id="upload-section" className="pt-2">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group p-6 sm:p-7 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                  isDragOver
                    ? 'border-emerald-600 bg-emerald-50/70 scale-[1.01]'
                    : 'border-emerald-300 hover:border-emerald-600 bg-white/90 hover:bg-emerald-50/40 shadow-xl shadow-emerald-950/5'
                }`}
              >
                {/* Input File Tersembunyi untuk Galeri */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center text-center space-y-4">
                  
                  {/* Ikon Upload Modern */}
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#0B2215]">
                      Unggah Foto Daun atau Permukaan Tanah
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
                      Tarik dan lepaskan foto ke sini, atau gunakan opsi praktis di bawah:
                    </p>
                  </div>

                  {/* Dua Tombol Aksi: Ambil Foto & Pilih Galeri */}
                  <div
                    className="flex flex-wrap items-center justify-center gap-3 w-full pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Tombol Ambil Foto (Kamera Langsung) */}
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#143823] hover:bg-[#0B2215] rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-emerald-300" />
                      <span>Ambil Foto</span>
                    </button>

                    {/* Tombol Pilih Galeri */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#143823] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl active:scale-95 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>Pilih Galeri</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Mendukung JPG, PNG, WEBP (Otomatis dikompresi di browser)
                  </span>
                </div>
              </div>

              {/* Error Alert jika ada */}
              {errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Pilihan Komoditas & Opsi Lokasi GPS */}
              <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <label htmlFor="crop-select" className="font-bold text-slate-700 whitespace-nowrap">
                    Tanaman:
                  </label>
                  <select
                    id="crop-select"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Umum / Otomatis Deteksi">Otomatis Deteksi AI</option>
                    <option value="Padi">Padi (Oryza Sativa)</option>
                    <option value="Cabai">Cabai Merah / Rawit</option>
                    <option value="Tomat">Tomat Sayur / Buah</option>
                    <option value="Jagung">Jagung Manis / Hibrida</option>
                    <option value="Permukaan Tanah">Permukaan Tanah / Bedengan</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={useGps}
                    onChange={(e) => setUseGps(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {coords ? 'GPS Terhubung' : 'Geotagging'}
                  </span>
                </label>
              </div>

              {/* Preview Box jika foto sudah dipilih */}
              {previewUrl && (
                <div className="mt-4 p-4 bg-white rounded-3xl border border-emerald-100 shadow-xl flex items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Pratinjau"
                      className="w-14 h-14 rounded-2xl object-cover border border-emerald-100 shadow-xs flex-shrink-0"
                    />
                    <div className="overflow-hidden text-left">
                      <p className="text-sm font-bold text-[#0B2215] truncate">
                        {selectedFile?.name || `${selectedCrop} (Sampel Siap)`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {compressionStats
                          ? `${compressionStats.compKb} KB (Hemat ${compressionStats.percentSaved}%) • Siap Analisis`
                          : 'Siap dianalisis dengan AI Agronomi'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#143823] hover:bg-[#0B2215] rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                          <span>Menganalisis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-300" />
                          <span>Analisis AI</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleClearImage}
                      disabled={isLoading}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
                      title="Batalkan foto ini"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Deretan Metrik Sederhana */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-3">
              <div className="p-3 bg-white/70 rounded-2xl border border-slate-100/80 text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-extrabold text-[#143823]">98.4%</p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">
                  Akurasi Diagnosis
                </p>
              </div>
              <div className="p-3 bg-white/70 rounded-2xl border border-slate-100/80 text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-extrabold text-[#143823]">&lt; 3 Detik</p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">
                  Waktu Respons AI
                </p>
              </div>
              <div className="p-3 bg-white/70 rounded-2xl border border-slate-100/80 text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-extrabold text-[#143823]">24/7</p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">
                  Siaga Lapangan
                </p>
              </div>
            </div>

          </div>

          {/* ====================================================
              KOLOM KANAN: VISUAL DENGAN 3 FLOATING GLASSMORPHISM CARDS
              ==================================================== */}
          <div className="relative flex justify-center items-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-none">
              
              {/* Foto Besar Lahan Pertanian Berkualitas Tinggi */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/20 border-4 border-white">
                <img
                  src={localImages.heroFarmField}
                  alt="Lahan Pertanian Berkelanjutan Agri-Vision"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2215]/60 via-transparent to-transparent"></div>
                
                {/* Badge Lokasi/Kondisi di Pojok Foto */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/95 text-xs font-medium px-3 py-1.5 rounded-xl bg-[#0B2215]/40 backdrop-blur-md">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Lahan Presisi Aktif
                  </span>
                  <span>AI Agronomi Presisi</span>
                </div>
              </div>

              {/* ====================================================
                  EFEK MENGAMBANG (3 FLOATING GLASSMORPHISM CARDS)
                  ==================================================== */}

              {/* Floating Card 1: Sampel Cepat Padi (Kiri Atas) */}
              <div
                onClick={() => {
                  const sample = PRESET_SAMPLES.find((s) => s.crop === 'Padi') || PRESET_SAMPLES[0];
                  handleSelectPreset(sample);
                }}
                className="absolute -top-4 -left-2 sm:-left-6 bg-white/80 backdrop-blur-md border border-white/80 p-3 sm:p-3.5 rounded-2xl shadow-xl shadow-emerald-950/10 flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 z-20 group"
                title="Klik untuk mencoba diagnosis sampel Daun Padi"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-emerald-100 flex-shrink-0 border border-white">
                  <img
                    src={localImages.samplePadiLeaf}
                    alt="Sampel Daun Padi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-[#143823]">
                      Coba
                    </span>
                    <p className="text-xs font-bold text-[#0B2215]">Sampel Cepat: Padi</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Bakterisida + NPK Seimbang</p>
                </div>
              </div>

              {/* Floating Card 2: Sampel Cepat Cabai (Kanan Tengah) */}
              <div
                onClick={() => {
                  const sample = PRESET_SAMPLES.find((s) => s.crop === 'Cabai') || PRESET_SAMPLES[1];
                  handleSelectPreset(sample);
                }}
                className="absolute top-1/2 -right-3 sm:-right-6 -translate-y-1/2 bg-white/80 backdrop-blur-md border border-white/80 p-3 sm:p-3.5 rounded-2xl shadow-xl shadow-emerald-950/10 flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 z-20 group"
                title="Klik untuk mencoba diagnosis sampel Daun Cabai"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-red-100 flex-shrink-0 border border-white">
                  <img
                    src={localImages.sampleCabaiLeaf}
                    alt="Sampel Daun Cabai"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      Coba
                    </span>
                    <p className="text-xs font-bold text-[#0B2215]">Sampel Cepat: Cabai</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Fungisida Mankozeb 15g</p>
                </div>
              </div>

              {/* Floating Card 3: Sampel Cepat Tomat (Kiri Bawah) */}
              <div
                onClick={() => {
                  const sample = PRESET_SAMPLES.find((s) => s.crop === 'Tomat') || PRESET_SAMPLES[2];
                  handleSelectPreset(sample);
                }}
                className="absolute -bottom-5 left-4 sm:left-8 bg-white/80 backdrop-blur-md border border-white/80 p-3 sm:p-3.5 rounded-2xl shadow-xl shadow-emerald-950/10 flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 z-20 group"
                title="Klik untuk mencoba diagnosis sampel Daun Tomat"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0 border border-white">
                  <img
                    src={localImages.sampleTomatLeaf}
                    alt="Sampel Daun Tomat"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-[#143823]">
                      Coba
                    </span>
                    <p className="text-xs font-bold text-[#0B2215]">Sampel Cepat: Tomat</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Siram 300ml + Kalsium Nitrat</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Modal Kamera Langsung */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(file) => handleProcessFile(file)}
      />
    </section>
  );
};
