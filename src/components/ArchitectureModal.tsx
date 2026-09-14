import React, { useState } from 'react';
import { Terminal, Copy, Check, FileText, Server, Database, Sparkles } from 'lucide-react';

export const ArchitectureModal: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'run' | 'schema' | 'files'>('run');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlDDL = `-- Skema Basis Data SQLite untuk Agri-Vision
CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_hash TEXT NOT NULL,
    image_path TEXT NOT NULL,
    jenis_tanaman TEXT,
    jenis_objek TEXT NOT NULL,      -- 'daun' atau 'tanah'
    diagnosis TEXT NOT NULL,
    tingkat_keparahan TEXT NOT NULL, -- 'Ringan', 'Sedang', 'Berat'
    rekomendasi_air_ml INTEGER NOT NULL,
    rekomendasi_pupuk_jenis TEXT NOT NULL,
    rekomendasi_pupuk_gram INTEGER NOT NULL,
    catatan_tambahan TEXT,
    tingkat_keyakinan INTEGER NOT NULL, -- 0 s/d 100
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analyses_hash ON analyses(image_hash);
CREATE INDEX IF NOT EXISTS idx_analyses_tanaman ON analyses(jenis_tanaman);

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_id INTEGER NOT NULL,
    is_accurate BOOLEAN NOT NULL,
    catatan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE
);`;

  const runSteps = `# 1. Masuk ke folder backend Flask
cd agri-vision

# 2. Buat & aktifkan virtual environment
python3 -m venv venv
source venv/bin/activate  # Di Windows: venv\\Scripts\\activate

# 3. Install seluruh dependensi
pip install -r requirements.txt

# 4. Atur Gemini API Key di file .env
cp .env.example .env
# Edit .env: GEMINI_API_KEY=AIzaSy...

# 5. Jalankan server Flask di port 5000
python app.py
# Buka http://localhost:5000 di browser`;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8E2] shadow-sm p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8E2] pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EFEBE9] text-[#5D4037]">
              Fase 1, 2 & 3
            </span>
            <span className="text-xs text-[#5C6E61]">Python 3 + Flask + SQLite</span>
          </div>
          <h2 className="text-xl font-bold text-[#1B5E20]">Panduan Implementasi Python Flask (Localhost)</h2>
          <p className="text-xs sm:text-sm text-[#5C6E61] mt-0.5">
            Seluruh berkas arsitektur Python telah dibuat lengkap di dalam direktori <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#2E7D32] font-semibold">/agri-vision/</code>.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F1F5F1] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('run')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'run' ? 'bg-white text-[#2E7D32] shadow-xs' : 'text-[#5C6E61]'
            }`}
          >
            Cara Menjalankan
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'schema' ? 'bg-white text-[#2E7D32] shadow-xs' : 'text-[#5C6E61]'
            }`}
          >
            Skema SQLite
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'files' ? 'bg-white text-[#2E7D32] shadow-xs' : 'text-[#5C6E61]'
            }`}
          >
            Daftar Berkas Proyek
          </button>
        </div>
      </div>

      {activeTab === 'run' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#1C281F]">
            <span className="flex items-center gap-1.5 text-[#2E7D32]">
              <Terminal className="w-4 h-4" />
              <span>Langkah Eksekusi di Terminal Komputer / Laptop Anda</span>
            </span>
            <button
              onClick={() => copyToClipboard(runSteps, 'run')}
              className="flex items-center gap-1 text-[#2E7D32] hover:text-[#1B5E20] font-semibold cursor-pointer"
            >
              {copiedKey === 'run' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'run' ? 'Tersalin!' : 'Salin Perintah'}</span>
            </button>
          </div>
          <pre className="bg-[#1C281F] text-[#A5D6A7] p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
            {runSteps}
          </pre>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#FAFDF9] border border-[#D0DDD0]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B5E20] mb-1">
                <Server className="w-4 h-4" />
                <span>Routing Flask</span>
              </div>
              <p className="text-xs text-[#5C6E61]">
                Menangani multipart upload di <code className="text-gray-800">/api/analyze</code>, caching SHA-256, dan ekspor PDF ReportLab.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAFDF9] border border-[#D0DDD0]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#795548] mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Gemini 1.5 Flash</span>
              </div>
              <p className="text-xs text-[#5C6E61]">
                Menggunakan library resmi <code className="text-gray-800">google-generativeai</code> dengan parser JSON regex markdown fences.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAFDF9] border border-[#D0DDD0]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2E7D32] mb-1">
                <Database className="w-4 h-4" />
                <span>SQLite Database</span>
              </div>
              <p className="text-xs text-[#5C6E61]">
                Tabel <code className="text-gray-800">analyses</code> & <code className="text-gray-800">feedback</code> otomatis terbuat saat pertama kali dijalankan.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#1C281F]">
            <span className="flex items-center gap-1.5 text-[#2E7D32]">
              <Database className="w-4 h-4" />
              <span>DDL SQL (Auto-generated pada database.py)</span>
            </span>
            <button
              onClick={() => copyToClipboard(sqlDDL, 'sql')}
              className="flex items-center gap-1 text-[#2E7D32] hover:text-[#1B5E20] font-semibold cursor-pointer"
            >
              {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'sql' ? 'Tersalin!' : 'Salin SQL'}</span>
            </button>
          </div>
          <pre className="bg-[#1C281F] text-[#A5D6A7] p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
            {sqlDDL}
          </pre>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#1C281F] mb-1">Struktur Berkas Proyek di /agri-vision/</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FAFDF9] border border-[#D0DDD0] rounded-xl flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              <div>
                <b className="text-[#1B5E20]">agri-vision/app.py</b>
                <p className="text-[#5C6E61] mt-0.5">Aplikasi utama Flask, konfigurasi blueprint & route REST API.</p>
              </div>
            </div>

            <div className="p-3 bg-[#FAFDF9] border border-[#D0DDD0] rounded-xl flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              <div>
                <b className="text-[#1B5E20]">agri-vision/gemini_service.py</b>
                <p className="text-[#5C6E61] mt-0.5">Integrasi Gemini Vision API, system prompt agronomi, & parser JSON.</p>
              </div>
            </div>

            <div className="p-3 bg-[#FAFDF9] border border-[#D0DDD0] rounded-xl flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#795548] shrink-0 mt-0.5" />
              <div>
                <b className="text-[#795548]">agri-vision/database.py</b>
                <p className="text-[#5C6E61] mt-0.5">Koneksi SQLite, pembuatan skema tabel analyses & feedback, serta CRUD.</p>
              </div>
            </div>

            <div className="p-3 bg-[#FAFDF9] border border-[#D0DDD0] rounded-xl flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#795548] shrink-0 mt-0.5" />
              <div>
                <b className="text-[#795548]">agri-vision/cache_utils.py</b>
                <p className="text-[#5C6E61] mt-0.5">Validasi MIME type, batas ukuran, dimensi gambar, & hashing SHA-256.</p>
              </div>
            </div>

            <div className="p-3 bg-[#FAFDF9] border border-[#D0DDD0] rounded-xl flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              <div>
                <b className="text-[#1B5E20]">agri-vision/pdf_export.py</b>
                <p className="text-[#5C6E61] mt-0.5">Generator laporan PDF resmi berbasis ReportLab.</p>
              </div>
            </div>

            <div className="p-3 bg-[#FAFDF9] border border-[#D0DDD0] rounded-xl flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#5C6E61] shrink-0 mt-0.5" />
              <div>
                <b className="text-[#1C281F]">agri-vision/requirements.txt</b>
                <p className="text-[#5C6E61] mt-0.5">Daftar dependensi Python: Flask, google-generativeai, reportlab, dll.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
