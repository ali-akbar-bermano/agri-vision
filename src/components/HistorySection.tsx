import React, { useState } from 'react';
import { Filter, Calendar, Sprout, ArrowRight, ShieldCheck } from 'lucide-react';
import { AnalysisRecord } from '../types';

interface HistorySectionProps {
  historyItems: AnalysisRecord[];
  onSelectAnalysis: (item: AnalysisRecord) => void;
  onNewDiagnosis: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  historyItems,
  onSelectAnalysis,
  onNewDiagnosis,
}) => {
  const [filterCrop, setFilterCrop] = useState<string>('');

  const filteredItems = historyItems.filter((item) => {
    if (!filterCrop || filterCrop === 'Semua') return true;
    return item.jenis_tanaman?.toLowerCase() === filterCrop.toLowerCase();
  });

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8E2] shadow-sm p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8E2] pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1B5E20]">Riwayat Diagnosis Lapangan</h2>
          <p className="text-xs sm:text-sm text-[#5C6E61] mt-0.5">
            Arsip riwayat analisis tanaman dan kondisi tanah tersimpan di database lokal.
          </p>
        </div>

        {/* Filter per jenis tanaman */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5C6E61]" />
          <select
            id="history-filter-select"
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="bg-[#FAFDF9] border border-[#D0DDD0] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#1C281F] focus:outline-none focus:border-[#2E7D32]"
          >
            <option value="">Semua Tanaman ({historyItems.length})</option>
            <option value="Padi">Padi</option>
            <option value="Cabai">Cabai</option>
            <option value="Tomat">Tomat</option>
            <option value="Jagung">Jagung</option>
            <option value="Bawang Merah">Bawang Merah</option>
            <option value="Kedelai">Kedelai</option>
            <option value="Kentang">Kentang</option>
            <option value="Tanah Pertanian">Tanah Pertanian</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
            <Sprout className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#1C281F]">Belum Ada Riwayat untuk Kategori Ini</h3>
          <p className="text-xs text-[#5C6E61] max-w-sm mx-auto mt-1 mb-5">
            Lakukan analisis foto pertama Anda untuk melihat arsip diagnosis otomatis di sini.
          </p>
          <button
            onClick={onNewDiagnosis}
            className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold transition-all"
          >
            Mulai Analisis Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isBerat = item.tingkat_keparahan === 'Berat';
            const isSedang = item.tingkat_keparahan === 'Sedang';

            return (
              <div
                key={item.id}
                id={`history-card-${item.id}`}
                onClick={() => onSelectAnalysis(item)}
                className="group bg-[#FAFDF9] border border-[#E2E8E2] hover:border-[#2E7D32] rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 bg-black/5 overflow-hidden">
                    <img
                      src={item.image_path}
                      alt={item.jenis_tanaman || 'Tanaman'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-black/60 text-white backdrop-blur-xs">
                        {item.jenis_objek}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isBerat
                            ? 'bg-red-100 text-red-700'
                            : isSedang
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.tingkat_keparahan}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1 text-[11px] text-[#5C6E61] mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.created_at}</span>
                    </div>
                    <h4 className="text-base font-bold text-[#1C281F] mb-1 group-hover:text-[#2E7D32] transition-colors">
                      {item.jenis_tanaman || 'Tanaman Tidak Spesifik'}
                    </h4>
                    <p className="text-xs text-[#5C6E61] line-clamp-2 leading-relaxed">
                      {item.diagnosis}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-white border-t border-[#E2E8E2] flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-semibold text-[#2E7D32]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{item.tingkat_keyakinan}% AI</span>
                  </span>
                  <span className="text-[#2E7D32] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Buka Detail <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
