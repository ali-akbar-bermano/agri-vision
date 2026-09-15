import React, { useState, useMemo } from 'react';
import { Calculator, Droplets, FlaskConical, Scale, DollarSign, Check, Copy, Info, Sparkles, Layers } from 'lucide-react';

interface DosageCalculatorProps {
  initialCrop?: string;
  initialFertilizer?: string;
  initialDoseGram?: number;
  initialWaterMl?: number;
  isEmbedded?: boolean;
}

export const DosageCalculator: React.FC<DosageCalculatorProps> = ({
  initialCrop = 'Cabai',
  initialFertilizer = 'NPK 16-16-16',
  initialDoseGram = 15,
  initialWaterMl = 400,
  isEmbedded = false,
}) => {
  const [calculationMode, setCalculationMode] = useState<'area' | 'plantCount'>('area');
  const [landAreaM2, setLandAreaM2] = useState<number>(1000); // 1.000 m2 (10 are)
  const [plantCountInput, setPlantCountInput] = useState<number>(2500);
  const [spacing, setSpacing] = useState<{ row: number; col: number }>({ row: 60, col: 50 }); // cm
  const [dosePerPlantGram, setDosePerPlantGram] = useState<number>(initialDoseGram || 15);
  const [waterPerPlantMl, setWaterPerPlantMl] = useState<number>(initialWaterMl || 400);
  const [fertilizerType, setFertilizerType] = useState<string>(initialFertilizer || 'NPK 16-16-16');
  const [tankCapacityLiters, setTankCapacityLiters] = useState<number>(16); // standard 16L knapsack
  const [pricePerKg, setPricePerKg] = useState<number>(16000); // Rp 16.000/kg
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Calculate plant population
  const totalPlants = useMemo(() => {
    if (calculationMode === 'plantCount') {
      return Math.max(1, plantCountInput);
    }
    // Calculate based on spacing: area / (row_m * col_m)
    // Allow 15% reduction for walking paths/drainage ditches
    const spacingAreaM2 = (spacing.row / 100) * (spacing.col / 100);
    if (spacingAreaM2 <= 0) return 1000;
    const rawPlants = (landAreaM2 * 0.85) / spacingAreaM2;
    return Math.round(Math.max(10, rawPlants));
  }, [calculationMode, landAreaM2, plantCountInput, spacing]);

  // Fertilizer total in kg
  const totalFertilizerKg = useMemo(() => {
    const totalGrams = totalPlants * dosePerPlantGram;
    return Number((totalGrams / 1000).toFixed(1));
  }, [totalPlants, dosePerPlantGram]);

  // Sacks (50kg per sack)
  const totalSacks = useMemo(() => {
    return (totalFertilizerKg / 50).toFixed(1);
  }, [totalFertilizerKg]);

  // Water total in liters
  const totalWaterLiters = useMemo(() => {
    const totalMl = totalPlants * waterPerPlantMl;
    return Math.round(totalMl / 1000);
  }, [totalPlants, waterPerPlantMl]);

  // Total knapsack sprayer tanks
  const totalSprayerTanks = useMemo(() => {
    if (tankCapacityLiters <= 0) return 0;
    return Math.ceil(totalWaterLiters / tankCapacityLiters);
  }, [totalWaterLiters, tankCapacityLiters]);

  // Dosage per tank (for kocor/foliar spray mixing)
  const dosePerTankGram = useMemo(() => {
    if (totalSprayerTanks <= 0) return 0;
    return Math.round((totalFertilizerKg * 1000) / totalSprayerTanks);
  }, [totalFertilizerKg, totalSprayerTanks]);

  // Spoon equivalent (1 tablespoon ~ 15-20g)
  const dosePerTankSpoons = useMemo(() => {
    return Math.round(dosePerTankGram / 18);
  }, [dosePerTankGram]);

  // Estimated budget
  const estimatedCost = useMemo(() => {
    return Math.round(totalFertilizerKg * pricePerKg);
  }, [totalFertilizerKg, pricePerKg]);

  const handleCopySummary = () => {
    const summary = `🌾 RINGKASAN REKOMENDASI DOSIS LAHAN AGRI-VISION
Tanaman: ${initialCrop}
Populasi Tanaman: ${totalPlants.toLocaleString()} pohon (Luas: ${calculationMode === 'area' ? `${landAreaM2} m²` : 'Input Manual'})
Pupuk: ${fertilizerType} @ ${dosePerPlantGram} gr/pohon
---------------------------------------------
• Total Kebutuhan Pupuk: ${totalFertilizerKg} kg (~${totalSacks} Sak 50kg)
• Total Kebutuhan Air: ${totalWaterLiters.toLocaleString()} Liter
• Aplikasi Tangki Semprot (${tankCapacityLiters}L): ${totalSprayerTanks} Tangki
• Takaran per Tangki: ${dosePerTankGram} gram (~${dosePerTankSpoons} sendok makan)
• Estimasi Anggaran: Rp ${estimatedCost.toLocaleString('id-ID')}
---------------------------------------------
Dihitung otomatis via Agri-Vision Smart Farm Assistant`;

    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className={`bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden ${isEmbedded ? 'p-5' : 'p-6 sm:p-8'}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2215]">
              Kalkulator Dosis Lahan & Tangki Semprot
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Konversi takaran individu ke kebutuhan skala riil bedengan, kebun, dan tangki knapsack
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#143823] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Salin Ringkasan'}</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="pt-6">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCalculationMode('area')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              calculationMode === 'area'
                ? 'bg-white text-[#143823] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Hitung Berdasarkan Luas Lahan (m²)
          </button>
          <button
            type="button"
            onClick={() => setCalculationMode('plantCount')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              calculationMode === 'plantCount'
                ? 'bg-white text-[#143823] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Hitung Berdasarkan Jumlah Tanaman
          </button>
        </div>

        {/* Input Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {calculationMode === 'area' ? (
            <>
              {/* Luas Lahan */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Luas Lahan (m²)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    step={50}
                    value={landAreaM2}
                    onChange={(e) => setLandAreaM2(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    m² ({(landAreaM2 / 10000).toFixed(2)} Ha)
                  </span>
                </div>
              </div>

              {/* Jarak Tanam */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jarak Tanam (Bedengan)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={10}
                      value={spacing.row}
                      onChange={(e) => setSpacing({ ...spacing, row: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">cm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={10}
                      value={spacing.col}
                      onChange={(e) => setSpacing({ ...spacing, col: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">cm</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Direct Plant Count */
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Total Populasi Tanaman di Lahan
              </label>
              <input
                type="number"
                min={1}
                step={50}
                value={plantCountInput}
                onChange={(e) => setPlantCountInput(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          )}

          {/* Dosis Pupuk per Tanaman */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Dosis Pupuk (gr/pohon)
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                Rekomendasi AI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                step={1}
                value={dosePerPlantGram}
                onChange={(e) => setDosePerPlantGram(Math.max(0.5, Number(e.target.value)))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <span className="text-xs font-semibold text-slate-500">gram</span>
            </div>
          </div>

          {/* Kebutuhan Air per Tanaman */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kebutuhan Air (ml/pohon)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={50}
                step={50}
                value={waterPerPlantMl}
                onChange={(e) => setWaterPerPlantMl(Math.max(10, Number(e.target.value)))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <span className="text-xs font-semibold text-slate-500">ml</span>
            </div>
          </div>
        </div>

        {/* Setting Tambahan (Tangki & Pupuk) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100">
          <div>
            <label className="block text-xs font-bold text-[#143823] mb-1">
              Jenis Pupuk
            </label>
            <select
              value={fertilizerType}
              onChange={(e) => setFertilizerType(e.target.value)}
              className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="NPK 16-16-16">NPK 16-16-16 (Mutiara / Pak Tani)</option>
              <option value="Urea (46% N)">Urea (46% Nitrogen)</option>
              <option value="SP-36 (Fosfat)">SP-36 (Super Phosphate)</option>
              <option value="KCl (Kalium Klorida)">KCl (Kalium Murni)</option>
              <option value="Kalsium Nitrat (CN)">Kalsium Nitrat (Anti Busuk Pantat)</option>
              <option value="Pupuk Hayati / Kompos">Pupuk Organik / Kompos Matang</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#143823] mb-1">
              Kapasitas Tangki Semprot
            </label>
            <select
              value={tankCapacityLiters}
              onChange={(e) => setTankCapacityLiters(Number(e.target.value))}
              className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value={14}>14 Liter (Knapsack Manual Standar)</option>
              <option value={16}>16 Liter (Tangki Elektrik / Baterai)</option>
              <option value={20}>20 Liter (Tangki Kapasitas Besar)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#143823] mb-1">
              Estimasi Harga Pupuk (Rp / kg)
            </label>
            <input
              type="number"
              min={1000}
              step={500}
              value={pricePerKg}
              onChange={(e) => setPricePerKg(Math.max(0, Number(e.target.value)))}
              className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* RESULTS HERO METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Total Pupuk */}
          <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 relative overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <FlaskConical className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total Pupuk Dibutuhkan
            </p>
            <p className="text-2xl sm:text-3xl font-black text-[#0B2215] mt-1">
              {totalFertilizerKg.toLocaleString()} <span className="text-sm font-semibold text-slate-500">kg</span>
            </p>
            <p className="text-xs font-semibold text-emerald-700 mt-1">
              Setara ~{totalSacks} Sak (Karung 50kg)
            </p>
          </div>

          {/* Total Air */}
          <div className="p-5 rounded-2xl bg-[#F0F9FF] border border-blue-200 relative overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
              <Droplets className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Total Kebutuhan Air
            </p>
            <p className="text-2xl sm:text-3xl font-black text-[#0B2215] mt-1">
              {totalWaterLiters.toLocaleString()} <span className="text-sm font-semibold text-slate-500">Liter</span>
            </p>
            <p className="text-xs font-semibold text-blue-700 mt-1">
              Setara {(totalWaterLiters / 1000).toFixed(2)} m³ air siram
            </p>
          </div>

          {/* Aplikasi Tangki Semprot */}
          <div className="p-5 rounded-2xl bg-[#FFFBEB] border border-amber-200 relative overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Kebutuhan Tangki Semprot
            </p>
            <p className="text-2xl sm:text-3xl font-black text-[#0B2215] mt-1">
              {totalSprayerTanks} <span className="text-sm font-semibold text-slate-500">Tangki</span>
            </p>
            <p className="text-xs font-semibold text-amber-800 mt-1">
              Takaran: <b>{dosePerTankGram} gr</b> (~{dosePerTankSpoons} sdm)/tangki
            </p>
          </div>

          {/* Estimasi Biaya */}
          <div className="p-5 rounded-2xl bg-[#FAF5FF] border border-purple-200 relative overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Estimasi Anggaran Pupuk
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#0B2215] mt-1 truncate">
              Rp {estimatedCost.toLocaleString('id-ID')}
            </p>
            <p className="text-xs font-semibold text-purple-700 mt-1">
              Untuk {totalPlants.toLocaleString()} pohon tanaman
            </p>
          </div>

        </div>

        {/* Petunjuk Aplikasi Praktis Lapangan */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-800">Tips Aplikasi di Lapangan:</p>
            <p>
              • <b>Metode Kocor (Disiram ke Akar)</b>: Larutkan <b>{dosePerTankGram} gram</b> pupuk ke dalam tangki {tankCapacityLiters}L, siramkan sekitar 200–400 ml larutan per pangkal batang tanaman saat tanah lembap pagi hari.
            </p>
            <p>
              • <b>Metode Tabur Kering</b>: Taburkan 1 sendok makan melingkar pada jarak 10–15 cm dari pangkal batang (tajuk terluar), lalu segera sirami air agar unsur hara cepat diserap akar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
