import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, SwitchCamera, AlertTriangle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Stop current stream tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Check if device has multiple video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Start live camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setIsStarting(true);
    setError(null);
    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Browser ini tidak mendukung akses kamera langsung (WebRTC). Silakan gunakan opsi Pilih Galeri.');
      setIsStarting(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsStarting(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let msg = 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin akses kamera ditolak. Harap izinkan akses kamera pada pengaturan browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Tidak ditemukan perangkat kamera pada perangkat ini.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Kamera sedang digunakan oleh aplikasi lain.';
      }
      setError(msg);
      setIsStarting(false);
    }
  }, [stopStream]);

  // Handle open / close & lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      setCapturedBlob(null);
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedDataUrl(null);
      setCapturedBlob(null);
      setError(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  // Flip camera between environment and user
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Capture frame from video element
  const handleSnap = () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, flip horizontally for mirror preview accuracy
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
        }
      },
      'image/jpeg',
      0.92
    );

    // Stop camera preview while user reviews
    stopStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setCapturedBlob(null);
    startCamera(facingMode);
  };

  // Confirm photo and send to parent
  const handleConfirm = () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `scan_kamera_${Date.now()}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    onCapture(file);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0B2215] rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/40 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#143823]/80 border-b border-emerald-800/30 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700/60 flex items-center justify-center text-emerald-300">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {capturedDataUrl ? 'Tinjau Hasil Foto' : 'Kamera Langsung Tanaman'}
              </h3>
              <p className="text-[11px] text-emerald-300/80">
                {capturedDataUrl ? 'Pastikan daun atau tanah terlihat fokus' : 'Arahkan kamera ke daun atau permukaan tanah'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            title="Tutup Kamera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative flex-1 bg-black min-h-[320px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-red-200">{error}</p>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          ) : capturedDataUrl ? (
            /* Review captured picture */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedDataUrl}
                alt="Tangkapan Kamera"
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              <div className="absolute top-3 left-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs px-3 py-1 rounded-full backdrop-blur-xs font-medium">
                Foto Berhasil Diambil
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full max-h-[65vh] object-cover sm:object-contain ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder Reticle Overlay */}
              <div className="absolute inset-8 sm:inset-12 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg shadow-sm" />
                  <div className="w-7 h-7 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg shadow-sm" />
                </div>
                <div className="text-center">
                  <span className="bg-black/60 backdrop-blur-md text-emerald-300 text-[11px] font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                    Fokuskan pada bercak daun atau kelembapan tanah
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg shadow-sm" />
                  <div className="w-7 h-7 border-b-3 border-r-3 border-emerald-400 rounded-br-lg shadow-sm" />
                </div>
              </div>

              {/* Loading Indicator */}
              {isStarting && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-white text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  <span>Mengaktifkan kamera...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 sm:p-5 bg-[#143823]/90 border-t border-emerald-800/40 flex items-center justify-between gap-3">
          {capturedDataUrl ? (
            /* Review Actions */
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-2xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-slate-300" />
                <span>Foto Ulang</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-2xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-100" />
                <span>Gunakan Foto Ini</span>
              </button>
            </div>
          ) : (
            /* Live Camera Controls */
            <div className="flex items-center justify-between w-full">
              {/* Switch camera button */}
              <div className="w-14 flex justify-start">
                {(hasMultipleCameras || true) && !error && (
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    disabled={isStarting}
                    className="p-3 text-emerald-200 hover:text-white bg-emerald-900/60 hover:bg-emerald-800/80 active:scale-90 rounded-2xl border border-emerald-700/50 transition-all cursor-pointer disabled:opacity-50"
                    title="Beralih Kamera Depan / Belakang"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Shutter Button */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleSnap}
                  disabled={isStarting || !!error}
                  className="group relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white p-1 shadow-lg shadow-emerald-950/50 hover:scale-105 active:scale-90 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  title="Ambil Foto Sekarang"
                >
                  <div className="w-full h-full rounded-full border-2 border-[#143823] flex items-center justify-center bg-white group-hover:bg-emerald-50 transition-colors">
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-emerald-600 group-hover:bg-emerald-700 transition-colors" />
                  </div>
                </button>
                <span className="text-[10px] text-emerald-300 font-medium mt-1">
                  Jepret Foto
                </span>
              </div>

              {/* Spacer / Cancel */}
              <div className="w-14 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
