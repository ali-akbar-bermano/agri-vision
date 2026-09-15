import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import localImages from '../assets/images';

interface FeaturesSectionProps {
  onStartDiagnosis?: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onStartDiagnosis }) => {
  const scrollToUpload = () => {
    if (onStartDiagnosis) {
      onStartDiagnosis();
    } else {
      const el = document.getElementById('upload-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="cara-kerja" className="py-16 sm:py-24 bg-gradient-to-b from-white via-emerald-50/20 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* SISI KIRI: TEKS "Kenapa Memilih Agri-Vision?" */}
          <div className="lg:col-span-5 flex flex-col space-y-6 lg:sticky lg:top-28">
            
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#143823]">
                Solusi Berkelanjutan
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2215] tracking-tight leading-tight">
              Kenapa Memilih <br className="hidden sm:inline" />
              <span className="text-emerald-700">Agri-Vision?</span>
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              Metode pertanian konvensional sering menghadapi keterlambatan deteksi penyakit dan takaran pupuk yang tidak proporsional. Agri-Vision menggabungkan ilmu agronomi presisi dengan kapabilitas AI Vision untuk memutus rantai kerugian panen.
            </p>

            {/* Poin-Poin Manfaat Utama */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B2215]">Analisis Berstandar Agronomi</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sistem prompt terkurasi mengidentifikasi jenis daun/tanah, tingkat keparahan (Ringan/Sedang/Berat), dan persentase keyakinan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B2215]">Ramah Lingkungan & Zero Waste</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mencegah overdosis pestisida sintetis melalui takaran miligram yang terukur dan rekomendasi bahan organik ramah tanah.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B2215]">Terbukti Mengurangi Biaya Operasional</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Petani menghemat hingga 35% pengeluaran pupuk dan mempertahankan ekosistem mikroorganisme tanah yang sehat.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={scrollToUpload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#143823] hover:bg-[#0B2215] text-white text-sm font-bold shadow-lg transition-all cursor-pointer"
              >
                <span>Coba Deteksi Tanaman Anda</span>
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </button>
            </div>

          </div>

          {/* SISI KANAN: 3 KARTU VERTIKAL TINGGI */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* KARTU 1: Efisiensi Pupuk */}
            <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={localImages.featurePupukTanah} 
                  alt="Efisiensi Pupuk Pertanian" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2215]/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-lg bg-[#143823]/80 backdrop-blur-sm">
                  Nutrisi Tanah
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0B2215] group-hover:text-emerald-700 transition-colors">
                    Efisiensi Pupuk
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Rekomendasi takaran tepat hingga satuan gram (NPK, Urea, atau Organik). Mengurangi limpasan kimia ke sumber air dan menjaga pH tanah seimbang.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700">
                  <span>Hemat Biaya 35%</span>
                  <span className="ml-auto">→</span>
                </div>
              </div>
            </div>

            {/* KARTU 2: Deteksi Dini Hama */}
            <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={localImages.featureHamaDaun} 
                  alt="Deteksi Dini Hama dan Penyakit Tanaman" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2215]/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-lg bg-[#143823]/80 backdrop-blur-sm">
                  Proteksi Dini
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0B2215] group-hover:text-emerald-700 transition-colors">
                    Deteksi Dini Hama
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Kenali gejala awal bercak klorofil, jamur mikotik, atau serangan hama sebelum menyebar ke seluruh petak lahan. Tindakan isolasi dini menyelamatkan panen.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700">
                  <span>Cegah Gagal Panen</span>
                  <span className="ml-auto">→</span>
                </div>
              </div>
            </div>

            {/* KARTU 3: Hemat Air */}
            <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={localImages.featureIrigasiAir} 
                  alt="Irigasi Presisi dan Hemat Air" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2215]/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-lg bg-[#143823]/80 backdrop-blur-sm">
                  Konservasi Air
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0B2215] group-hover:text-emerald-700 transition-colors">
                    Hemat Air
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Analisis visual tanah mendeteksi hidrasi permukaan dan memberikan takaran siram ideal dalam mililiter (ml). Menghindari genangan berlebih penyebab busuk akar.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700">
                  <span>Irigasi Presisi</span>
                  <span className="ml-auto">→</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
