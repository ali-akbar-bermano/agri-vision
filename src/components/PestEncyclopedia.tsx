import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Filter, ShieldCheck, Leaf, FlaskConical, AlertCircle, ChevronRight, X, Sparkles, ExternalLink } from 'lucide-react';
import { ENCYCLOPEDIA_DATA, DiseaseEntry } from '../data/encyclopediaData';

interface PestEncyclopediaProps {
  onSelectDiseaseForCalculator?: (crop: string, diseaseName: string) => void;
}

export const PestEncyclopedia: React.FC<PestEncyclopediaProps> = ({
  onSelectDiseaseForCalculator,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('Semua');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseEntry | null>(null);

  const cropTabs = ['Semua', 'Padi', 'Cabai', 'Tomat', 'Jagung', 'Tanah'];

  const filteredEntries = useMemo(() => {
    return ENCYCLOPEDIA_DATA.filter((entry) => {
      const matchCrop = selectedCropFilter === 'Semua' || entry.crop === selectedCropFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        entry.name.toLowerCase().includes(q) ||
        entry.latinName.toLowerCase().includes(q) ||
        entry.symptoms.some((s) => s.toLowerCase().includes(q)) ||
        entry.category.toLowerCase().includes(q);

      return matchCrop && matchSearch;
    });
  }, [searchQuery, selectedCropFilter]);

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2215]">
              Ensiklopedia Visual Hama & Penyakit Tanaman
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Katalog referensi mandiri: kenali gejala, agen hayati organik, dan solusi kuratif presisi
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari penyakit, gejala, latin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs by Crop */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-4 no-scrollbar">
        {cropTabs.map((crop) => (
          <button
            key={crop}
            type="button"
            onClick={() => setSelectedCropFilter(crop)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCropFilter === crop
                ? 'bg-[#143823] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* Grid of Disease Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            onClick={() => setSelectedDisease(entry)}
            className="group rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Image Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={entry.imageUrl}
                  alt={entry.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-[#143823]/90 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-xs">
                    {entry.crop}
                  </span>
                  <span className="bg-white/90 text-[#143823] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {entry.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-extrabold leading-snug drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                    {entry.name}
                  </h3>
                  <p className="text-[11px] italic text-emerald-200/90 truncate">
                    {entry.latinName}
                  </p>
                </div>
              </div>

              {/* Symptoms Preview */}
              <div className="p-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ciri Gejala Utama:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {entry.symptoms.slice(0, 2).map((sym, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span className="line-clamp-2 leading-relaxed">{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer card action */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#143823]">
              <span>Lihat Panduan Lengkap</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="py-12 text-center text-slate-500">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">Tidak ditemukan hasil untuk "{searchQuery}"</p>
          <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau pilih tab komoditas yang berbeda.</p>
        </div>
      )}

      {/* DETAIL MODAL FOR SELECTED DISEASE */}
      {selectedDisease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-100 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="relative h-48 sm:h-56 bg-slate-900 shrink-0">
              <img
                src={selectedDisease.imageUrl}
                alt={selectedDisease.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2215] via-[#0B2215]/60 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedDisease(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-emerald-600 text-white text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                    {selectedDisease.crop}
                  </span>
                  <span className="bg-white/20 text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    {selectedDisease.category}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">{selectedDisease.name}</h2>
                <p className="text-xs italic text-emerald-300">{selectedDisease.latinName}</p>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800">
              
              {/* Gejala & Pemicu */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Gejala Lapangan & Kondisi Pemicu</span>
                </h3>
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-semibold text-slate-500">Kondisi Pemicu Cuaca:</p>
                  <p className="text-xs text-slate-700 font-medium">{selectedDisease.triggerConditions}</p>
                </div>

                <div className="space-y-1.5">
                  {selectedDisease.symptoms.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dua Kolom Solusi: Organik vs Kimiawi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Organik & Agensia Hayati */}
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Leaf className="w-4 h-4" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider">
                      Solusi Organik & Ramah Lingkungan
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-950">
                    {selectedDisease.organicRemedy.map((org, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{org}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Kimiawi Selektif */}
                <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <FlaskConical className="w-4 h-4" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider">
                      Solusi Kimiawi Kuratif Selektif
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs text-amber-950">
                    {selectedDisease.chemicalRemedy.map((chem, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{chem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Langkah Pencegahan */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pencegahan Musim Tanam Berikutnya</span>
                </div>
                <ul className="space-y-1 text-blue-950">
                  {selectedDisease.prevention.map((prev, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-700 font-bold">✓</span>
                      <span>{prev}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedDisease(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
