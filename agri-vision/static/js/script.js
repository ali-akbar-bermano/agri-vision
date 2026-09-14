/**
 * Agri-Vision — Frontend Script (Vanilla JavaScript)
 * Mengatur interaksi UI, kompresi gambar sisi klien via Canvas,
 * pemanggilan REST API, Text-to-Speech (Web Speech API),
 * ekspor PDF, tab riwayat, dan dukungan PWA.
 */

// Global State
let currentSelectedFile = null;
let currentCompressedBlob = null;
let currentAnalysisData = null;
let userLatitude = null;
let userLongitude = null;
let isSpeaking = false;

// DOM Elements Cache
const dropZone = document.getElementById("drop-zone");
const dropPlaceholder = document.getElementById("drop-placeholder");
const dropPreviewContainer = document.getElementById("drop-preview-container");
const imagePreview = document.getElementById("image-preview");
const previewFilename = document.getElementById("preview-filename");
const previewFilesize = document.getElementById("preview-filesize");
const btnSubmitAnalyze = document.getElementById("btn-submit-analyze");
const btnSubmitText = document.getElementById("btn-submit-text");
const loadingWrapper = document.getElementById("loading-spinner-wrapper");
const resultPanel = document.getElementById("result-panel");
const cacheNoticeBanner = document.getElementById("cache-notice-banner");

// Inisialisasi Aplikasi saat Dokumen Siap
document.addEventListener("DOMContentLoaded", () => {
  initGeolocation();
  initServiceWorker();
  loadHistoryCount();
});

// ==========================================================
// 1. PWA & Service Worker
// ==========================================================
function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js")
        .then((reg) => console.log("🌾 Agri-Vision PWA ServiceWorker terdaftar:", reg.scope))
        .catch((err) => console.warn("PWA ServiceWorker gagal didaftarkan:", err));
    });
  }
}

// ==========================================================
// 2. Geolocation (GPS Lahan)
// ==========================================================
function initGeolocation() {
  const gpsStatus = document.getElementById("gps-status");
  if (!("geolocation" in navigator)) {
    if (gpsStatus) gpsStatus.textContent = "GPS tidak didukung";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLatitude = position.coords.latitude;
      userLongitude = position.coords.longitude;
      if (gpsStatus) {
        gpsStatus.textContent = `📍 GPS Siap (${userLatitude.toFixed(4)}, ${userLongitude.toFixed(4)})`;
      }
    },
    (error) => {
      console.warn("Akses GPS ditolak atau tidak tersedia:", error.message);
      if (gpsStatus) gpsStatus.textContent = "GPS Lahan Non-aktif";
    },
    { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
  );
}

function toggleGeotag(event) {
  const isChecked = event.target.checked;
  const gpsStatus = document.getElementById("gps-status");
  if (isChecked) {
    initGeolocation();
  } else {
    userLatitude = null;
    userLongitude = null;
    if (gpsStatus) gpsStatus.textContent = "GPS dinonaktifkan pengguna";
  }
}

// ==========================================================
// 3. Tab Switching (Diagnosis vs Riwayat)
// ==========================================================
function switchTab(tabName) {
  const diagnosisView = document.getElementById("view-diagnosis");
  const historyView = document.getElementById("view-history");
  const tabDiagnosisBtn = document.getElementById("tab-diagnosis-btn");
  const tabHistoryBtn = document.getElementById("tab-history-btn");

  if (tabName === "diagnosis") {
    diagnosisView.classList.add("active");
    historyView.classList.remove("active");
    tabDiagnosisBtn.classList.add("active");
    tabDiagnosisBtn.setAttribute("aria-selected", "true");
    tabHistoryBtn.classList.remove("active");
    tabHistoryBtn.setAttribute("aria-selected", "false");
  } else {
    diagnosisView.classList.remove("active");
    historyView.classList.add("active");
    tabDiagnosisBtn.classList.remove("active");
    tabDiagnosisBtn.setAttribute("aria-selected", "false");
    tabHistoryBtn.classList.add("active");
    tabHistoryBtn.setAttribute("aria-selected", "true");
    loadHistoryData();
  }
}

// ==========================================================
// 4. Client-Side Image Compression (Canvas)
// ==========================================================
/**
 * Mengompresi gambar di sisi klien menggunakan HTML5 Canvas
 * untuk menghemat kuota internet dan mempercepat unggah di area pedesaan.
 * Maksimal dimensi: 1280px, format: JPEG (kualitas 0.82)
 */
function compressImage(file, maxDimension = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Cek dimensi minimum (200x200px)
        if (width < 200 || height < 200) {
          reject(new Error(`Dimensi gambar terlalu kecil (${width}x${height}px). Minimal 200x200px.`));
          return;
        }

        // Skalakan jika melebihi batas dimensi maksimum
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Kompresi Canvas gagal menghasilkan blob."));
              return;
            }
            resolve({
              blob,
              dataUrl: canvas.toDataURL("image/jpeg", quality),
              originalSize: file.size,
              compressedSize: blob.size,
              width,
              height
            });
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Gagal membaca file gambar."));
    };
    reader.onerror = () => reject(new Error("Gagal membaca file dari penyimpanan lokal."));
  });
}

// ==========================================================
// 5. Drag & Drop and File Selection Handlers
// ==========================================================
function handleDragOver(e) {
  e.preventDefault();
  dropZone.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    processIncomingFile(e.dataTransfer.files[0]);
  }
}

function handleFileSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    processIncomingFile(e.target.files[0]);
  }
}

async function processIncomingFile(file) {
  // Validasi tipe
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    showToast("Format file tidak didukung. Harap pilih gambar JPG, PNG, atau WebP.", "error");
    return;
  }

  // Validasi ukuran awal (maksimal 15MB sebelum kompresi)
  if (file.size > 15 * 1024 * 1024) {
    showToast("Ukuran file terlalu besar. Maksimal 15MB.", "error");
    return;
  }

  currentSelectedFile = file;

  try {
    showToast("Mengompresi gambar untuk koneksi optimal...", "info");
    const result = await compressImage(file);
    currentCompressedBlob = result.blob;

    // Tampilkan preview
    imagePreview.src = result.dataUrl;
    previewFilename.textContent = file.name;
    const kbOriginal = Math.round(result.originalSize / 1024);
    const kbCompressed = Math.round(result.compressedSize / 1024);
    previewFilesize.textContent = `${kbCompressed} KB (Hemat ${(100 - (kbCompressed / kbOriginal * 100)).toFixed(0)}%)`;

    dropPlaceholder.classList.add("hidden");
    dropPreviewContainer.classList.remove("hidden");
    btnSubmitAnalyze.disabled = false;
  } catch (err) {
    showToast(err.message || "Gagal memproses gambar.", "error");
    clearSelectedImage();
  }
}

function clearSelectedImage() {
  currentSelectedFile = null;
  currentCompressedBlob = null;
  imagePreview.src = "";
  dropPreviewContainer.classList.add("hidden");
  dropPlaceholder.classList.remove("hidden");
  btnSubmitAnalyze.disabled = true;

  // Reset input file elements
  const cameraInput = document.getElementById("camera-input");
  const fileInput = document.getElementById("file-input");
  if (cameraInput) cameraInput.value = "";
  if (fileInput) fileInput.value = "";
}

// ==========================================================
// 6. Submit Analisis ke Backend
// ==========================================================
async function handleAnalyzeSubmit(e) {
  e.preventDefault();
  if (!currentCompressedBlob) {
    showToast("Silakan pilih atau ambil foto terlebih dahulu.", "error");
    return;
  }

  const cropSelect = document.getElementById("crop-select");
  const jenisTanaman = cropSelect ? cropSelect.value : "";

  const formData = new FormData();
  formData.append("image", currentCompressedBlob, currentSelectedFile ? currentSelectedFile.name : "photo.jpg");
  if (jenisTanaman) {
    formData.append("jenis_tanaman", jenisTanaman);
  }
  if (userLatitude && userLongitude) {
    formData.append("latitude", userLatitude.toString());
    formData.append("longitude", userLongitude.toString());
  }

  // Set Loading UI
  btnSubmitAnalyze.disabled = true;
  btnSubmitText.textContent = "Menganalisis...";
  loadingWrapper.classList.remove("hidden");
  resultPanel.classList.add("hidden");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      throw new Error(result.message || "Gagal menganalisis gambar.");
    }

    currentAnalysisData = result.data;
    renderAnalysisResult(result.data);
    showToast("Diagnosis berhasil diselesaikan!", "success");
    loadHistoryCount();

    // Smooth scroll ke panel hasil
    setTimeout(() => {
      resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

  } catch (err) {
    showToast(err.message || "Koneksi terputus atau server tidak merespons.", "error");
  } finally {
    btnSubmitAnalyze.disabled = false;
    btnSubmitText.textContent = "Analisis Sekarang";
    loadingWrapper.classList.add("hidden");
  }
}

// ==========================================================
// 7. Render Panel Hasil Analisis
// ==========================================================
function renderAnalysisResult(data) {
  resultPanel.classList.remove("hidden");

  // Nama Tanaman & Objek
  const tanamanHeading = document.getElementById("res-tanaman-heading");
  const jenisObjek = document.getElementById("res-jenis-objek");
  tanamanHeading.textContent = data.jenis_tanaman ? data.jenis_tanaman : "Tanaman / Daun";
  jenisObjek.textContent = (data.jenis_objek || "daun").toUpperCase();

  // Badge Keparahan
  const keparahanBadge = document.getElementById("res-keparahan-badge");
  const keparahan = data.tingkat_keparahan || "Ringan";
  keparahanBadge.textContent = keparahan;
  keparahanBadge.className = "badge-keparahan";
  if (keparahan.toLowerCase() === "berat") {
    keparahanBadge.classList.add("keparahan-berat");
  } else if (keparahan.toLowerCase() === "sedang") {
    keparahanBadge.classList.add("keparahan-sedang");
  } else {
    keparahanBadge.classList.add("keparahan-ringan");
  }

  // Cache Notice
  if (data.is_cached) {
    cacheNoticeBanner.classList.remove("hidden");
  } else {
    cacheNoticeBanner.classList.add("hidden");
  }

  // Gambar
  const resImage = document.getElementById("res-image");
  if (data.image_path) {
    resImage.src = data.image_path;
  } else if (imagePreview.src) {
    resImage.src = imagePreview.src;
  }

  // Skor Keyakinan
  const confidenceText = document.getElementById("res-confidence-text");
  const confidenceBar = document.getElementById("res-confidence-bar");
  const confidence = data.tingkat_keyakinan || 85;
  confidenceText.textContent = `${confidence}%`;
  confidenceBar.style.width = `${confidence}%`;

  // Diagnosis
  const resDiagnosis = document.getElementById("res-diagnosis");
  resDiagnosis.textContent = data.diagnosis || "-";

  // Rekomendasi Air & Pupuk
  const resWater = document.getElementById("res-water");
  const resFertilizer = document.getElementById("res-fertilizer");
  resWater.textContent = `${(data.rekomendasi_air_ml || 0).toLocaleString()} ml / tanaman`;

  const pupuk = data.rekomendasi_pupuk || {};
  const pupukJenis = pupuk.jenis || data.rekomendasi_pupuk_jenis || "Pupuk Seimbang";
  const pupukGram = pupuk.takaran_gram !== undefined ? pupuk.takaran_gram : (data.rekomendasi_pupuk_gram || 0);
  resFertilizer.textContent = `${pupukJenis} (${pupukGram} gram)`;

  // Catatan Tambahan
  const resNotes = document.getElementById("res-notes");
  const notesBlock = document.getElementById("res-notes-block");
  if (data.catatan_tambahan && data.catatan_tambahan.trim()) {
    notesBlock.classList.remove("hidden");
    resNotes.textContent = data.catatan_tambahan;
  } else {
    notesBlock.classList.add("hidden");
  }
}

// ==========================================================
// 8. Text-to-Speech (Web Speech API Native)
// ==========================================================
function toggleAudioNarration() {
  if (!("speechSynthesis" in window)) {
    showToast("Fitur pembacaan suara tidak didukung browser ini.", "error");
    return;
  }

  const btnTTS = document.getElementById("btn-tts");
  const btnTTSText = document.getElementById("btn-tts-text");

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    btnTTS.classList.remove("active-narration");
    btnTTSText.textContent = "Dengarkan (TTS)";
    return;
  }

  if (!currentAnalysisData) {
    showToast("Tidak ada data analisis untuk dibacakan.", "error");
    return;
  }

  const tanaman = currentAnalysisData.jenis_tanaman || "tanaman";
  const diagnosis = currentAnalysisData.diagnosis || "";
  const keparahan = currentAnalysisData.tingkat_keparahan || "Ringan";
  const air = currentAnalysisData.rekomendasi_air_ml || 0;
  const pupuk = currentAnalysisData.rekomendasi_pupuk || {};
  const pupukJenis = pupuk.jenis || currentAnalysisData.rekomendasi_pupuk_jenis || "pupuk seimbang";
  const pupukGram = pupuk.takaran_gram !== undefined ? pupuk.takaran_gram : (currentAnalysisData.rekomendasi_pupuk_gram || 0);

  const narrationText = `Diagnosis untuk ${tanaman}. Tingkat keparahan: ${keparahan}. ` +
    `Kondisi: ${diagnosis}. ` +
    `Rekomendasi penyiraman: ${air} mililiter air per tanaman. ` +
    `Rekomendasi pemupukan: berikan ${pupukGram} gram pupuk ${pupukJenis}. ` +
    (currentAnalysisData.catatan_tambahan ? `Catatan: ${currentAnalysisData.catatan_tambahan}` : "");

  const utterance = new SpeechSynthesisUtterance(narrationText);
  utterance.lang = "id-ID";
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Mencoba cari suara bahasa Indonesia jika tersedia
  const voices = window.speechSynthesis.getVoices();
  const indonesianVoice = voices.find(v => v.lang.includes("id") || v.lang.includes("ID"));
  if (indonesianVoice) {
    utterance.voice = indonesianVoice;
  }

  utterance.onstart = () => {
    isSpeaking = true;
    btnTTS.classList.add("active-narration");
    btnTTSText.textContent = "Hentikan Suara";
  };

  utterance.onend = () => {
    isSpeaking = false;
    btnTTS.classList.remove("active-narration");
    btnTTSText.textContent = "Dengarkan (TTS)";
  };

  utterance.onerror = () => {
    isSpeaking = false;
    btnTTS.classList.remove("active-narration");
    btnTTSText.textContent = "Dengarkan (TTS)";
  };

  window.speechSynthesis.speak(utterance);
}

// ==========================================================
// 9. Ekspor Laporan PDF
// ==========================================================
function downloadAnalysisPDF() {
  if (!currentAnalysisData || !currentAnalysisData.id) {
    showToast("ID analisis belum tersedia.", "error");
    return;
  }

  showToast("Mengunduh laporan PDF...", "info");
  const exportUrl = `/api/export/${currentAnalysisData.id}`;
  window.open(exportUrl, "_blank");
}

// ==========================================================
// 10. Feedback Modal & Submission
// ==========================================================
function openFeedbackModal() {
  const modal = document.getElementById("feedback-modal");
  modal.classList.remove("hidden");
}

function closeFeedbackModal() {
  const modal = document.getElementById("feedback-modal");
  modal.classList.add("hidden");
  document.getElementById("feedback-form").reset();
}

function handleModalBackdropClick(e) {
  if (e.target.id === "feedback-modal") {
    closeFeedbackModal();
  }
}

async function submitFeedbackForm(e) {
  e.preventDefault();
  if (!currentAnalysisData || !currentAnalysisData.id) {
    showToast("Tidak ada analisis aktif untuk dinilai.", "error");
    return;
  }

  const form = e.target;
  const isAccurateVal = form.querySelector("input[name='is_accurate']:checked")?.value === "true";
  const notes = document.getElementById("feedback-notes").value.trim();

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis_id: currentAnalysisData.id,
        is_accurate: isAccurateVal,
        catatan: notes
      })
    });

    const result = await response.json();
    if (!response.ok || result.status !== "success") {
      throw new Error(result.message || "Gagal mengirim feedback.");
    }

    closeFeedbackModal();
    showToast("Umpan balik berhasil dikirim! Terima kasih atas kontribusi Anda.", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ==========================================================
// 11. Tab Riwayat Analisis
// ==========================================================
async function loadHistoryCount() {
  try {
    const res = await fetch("/api/history");
    const json = await res.json();
    if (json.status === "success") {
      const badge = document.getElementById("history-badge");
      if (badge) badge.textContent = json.total || 0;
    }
  } catch (err) {
    console.warn("Gagal memuat jumlah riwayat:", err);
  }
}

async function loadHistoryData() {
  const container = document.getElementById("history-items-container");
  const filterSelect = document.getElementById("filter-crop");
  const cropFilter = filterSelect ? filterSelect.value : "";

  container.innerHTML = `<div class="empty-state"><div class="spinner"></div><p class="empty-text">Memuat riwayat...</p></div>`;

  try {
    const url = cropFilter ? `/api/history?jenis_tanaman=${encodeURIComponent(cropFilter)}` : "/api/history";
    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok || json.status !== "success") {
      throw new Error(json.message || "Gagal memuat riwayat.");
    }

    const items = json.data || [];
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🌱</div>
          <p class="empty-text">Belum ada riwayat analisis untuk kategori ini.</p>
          <button class="btn btn-primary btn-sm" onclick="switchTab('diagnosis')">Buat Analisis Baru</button>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const kep = item.tingkat_keparahan || "Ringan";
      let kepClass = "keparahan-ringan";
      if (kep.toLowerCase() === "berat") kepClass = "keparahan-berat";
      else if (kep.toLowerCase() === "sedang") kepClass = "keparahan-sedang";

      return `
        <div class="history-item-card" onclick="viewHistoryDetail(${item.id})">
          <div class="history-thumb-wrapper">
            <img src="${item.image_path || '/static/uploads/placeholder.jpg'}" alt="${item.jenis_tanaman || 'Tanaman'}" class="history-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\' fill=\\'%23C8E6C9\\'><rect width=\\'100\\' height=\\'100\\'/><text x=\\'50\\' y=\\'55\\' text-anchor=\\'middle\\' font-size=\\'30\\'>🌱</text></svg>'">
          </div>
          <div class="history-card-body">
            <div>
              <p class="history-date">${item.created_at || '-'}</p>
              <h4 class="history-crop-title">${item.jenis_tanaman || 'Tanaman Tidak Spesifik'}</h4>
              <p class="history-diag-snippet">${item.diagnosis || '-'}</p>
            </div>
            <div class="history-footer">
              <span class="badge-keparahan ${kepClass}">${kep}</span>
              <span class="confidence-val">${item.tingkat_keyakinan || 0}% AI</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-text" style="color: #c62828;">${err.message}</p>
        <button class="btn btn-outline btn-sm" onclick="loadHistoryData()">Coba Lagi</button>
      </div>
    `;
  }
}

async function viewHistoryDetail(analysisId) {
  try {
    showToast("Mengambil detail analisis...", "info");
    const res = await fetch(`/api/history/${analysisId}`);
    const json = await res.json();
    if (!res.ok || json.status !== "success") {
      throw new Error(json.message || "Gagal mengambil detail.");
    }

    currentAnalysisData = json.data;
    switchTab("diagnosis");
    renderAnalysisResult(json.data);

    setTimeout(() => {
      resultPanel.scrollIntoView({ behavior: "smooth" });
    }, 150);
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ==========================================================
// 12. Toast Notification Helper
// ==========================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "toast-error" : type === "success" ? "toast-success" : ""}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
