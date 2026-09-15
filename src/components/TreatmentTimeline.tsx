import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Sparkles, Shield, AlertCircle, ArrowRight, Share2, Printer } from 'lucide-react';
import { TingkatKeparahan } from '../types';

interface MilestoneTask {
  id: string;
  text: string;
  isCompleted: boolean;
}

interface MilestoneDay {
  dayNumber: number;
  dayLabel: string;
  phase: string;
  description: string;
  badgeColor: string;
  tasks: MilestoneTask[];
}

interface TreatmentTimelineProps {
  diagnosisId?: number;
  crop?: string;
  diagnosisText: string;
  severity: TingkatKeparahan;
  fertilizerName?: string;
  fertilizerGram?: number;
  waterMl?: number;
  isEmbedded?: boolean;
}

export const TreatmentTimeline: React.FC<TreatmentTimelineProps> = ({
  diagnosisId = 1,
  crop = 'Tanaman',
  diagnosisText,
  severity,
  fertilizerName = 'NPK 16-16-16',
  fertilizerGram = 15,
  waterMl = 400,
  isEmbedded = false,
}) => {
  const storageKey = `agri_timeline_progress_${diagnosisId}`;

  // Default milestones customized to inputs
  const defaultMilestones: MilestoneDay[] = [
    {
      dayNumber: 1,
      dayLabel: 'Hari ke-1',
      phase: 'Fase Darurat & Isolasi Infeksi',
      description: 'Hentikan penyebaran spora/patogen dan buang jaringan tanaman yang telah mati (nekrosis parah).',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      tasks: [
        { id: 'd1_t1', text: 'Pangkas dan kumpulkan daun dengan gejala parah ke kantong plastik, bakar atau kubur jauh dari kebun.', isCompleted: false },
        { id: 'd1_t2', text: 'Sterilkan gunting/alat potong menggunakan alkohol 70% atau larutan pemutih 1:10.', isCompleted: false },
        { id: 'd1_t3', text: 'Semprotkan fungisida/bakterisida kontak primer di pagi hari (sebelum jam 08.30) secara merata ke bawah daun.', isCompleted: false },
        { id: 'd1_t4', text: 'Bersihkan gulma liar inang di sekitar bedengan untuk memperbaiki aerasi udara.', isCompleted: false }
      ]
    },
    {
      dayNumber: 3,
      dayLabel: 'Hari ke-3',
      phase: 'Evaluasi Stres & Hidrasi Terkendali',
      description: 'Pantau apakah lesi bercak daun mengering (inaktif) atau masih timbul bercak basah baru.',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      tasks: [
        { id: 'd3_t1', text: `Berikan penyiraman akar secukupnya (~${waterMl} ml per tanaman) di pagi hari pada area perakaran.`, isCompleted: false },
        { id: 'd3_t2', text: 'Periksa drainase parit bedengan; jangan sampai ada air menggenang lebih dari 2 jam.', isCompleted: false },
        { id: 'd3_t3', text: 'Cek tepi luka pada daun yang tersisa: bercak harus mengering kecokelatan (tanda infeksi terhenti).', isCompleted: false }
      ]
    },
    {
      dayNumber: 7,
      dayLabel: 'Hari ke-7',
      phase: 'Pemupukan Pemulihan & Meristem Baru',
      description: 'Pacu pembentukan klorofil baru dan penguatan dinding sel dengan nutrisi seimbang.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      tasks: [
        { id: 'd7_t1', text: `Aplikasikan ${fertilizerName} sebanyak ${fertilizerGram} gram per tanaman secara kocor atau tabur melingkar 10 cm dari pangkal batang.`, isCompleted: false },
        { id: 'd7_t2', text: 'Semprotkan pupuk daun kaya unsur mikro (Kalsium / Silika / Zink) konsentrasi rendah untuk mempertebal kutikula.', isCompleted: false },
        { id: 'd7_t3', text: 'Amati munculnya tunas/pucuk daun baru di ketiak batang.', isCompleted: false }
      ]
    },
    {
      dayNumber: 14,
      dayLabel: 'Hari ke-14',
      phase: 'Proteksi Biologis & Bebas Penyakit',
      description: 'Stabilisasi kekebalan tanaman agar penyakit tidak kambuh kembali pada fase pembungaan/pembuahan.',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      tasks: [
        { id: 'd14_t1', text: 'Verifikasi pucuk daun muda tumbuh sehat dengan warna hijau segar tanpa bercak mikotik.', isCompleted: false },
        { id: 'd14_t2', text: 'Kocorkan agensia hayati ramah lingkungan (Trichoderma / Bacillus subtilis) untuk perlindungan perakaran.', isCompleted: false },
        { id: 'd14_t3', text: 'Tandai tanaman dalam catatan buku tani sebagai "Pulih Berhasil".', isCompleted: false }
      ]
    }
  ];

  const [milestones, setMilestones] = useState<MilestoneDay[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedState = JSON.parse(saved);
        return defaultMilestones.map((m) => ({
          ...m,
          tasks: m.tasks.map((t) => ({
            ...t,
            isCompleted: parsedState[t.id] ?? false,
          })),
        }));
      }
    } catch {
      // fallback
    }
    return defaultMilestones;
  });

  // Save progress changes to localStorage
  const handleToggleTask = (taskId: string) => {
    setMilestones((prev) => {
      const updated = prev.map((m) => ({
        ...m,
        tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)),
      }));

      // Flatten to key-value map for persistent storage
      const storageMap: Record<string, boolean> = {};
      updated.forEach((m) => {
        m.tasks.forEach((t) => {
          storageMap[t.id] = t.isCompleted;
        });
      });
      localStorage.setItem(storageKey, JSON.stringify(storageMap));

      return updated;
    });
  };

  // Calculate completion percentage
  const totalTasks = milestones.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = milestones.reduce((acc, m) => acc + m.tasks.filter((t) => t.isCompleted).length, 0);
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden ${isEmbedded ? 'p-5' : 'p-6 sm:p-8'}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2215]">
              Protokol 14 Hari Pemulihan Tanaman
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Jadwal tindakan harian bertahap untuk menyembuhkan infeksi secara permanen
            </p>
          </div>
        </div>

        {/* Progress Bar & Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-700">
              Progres Perawatan: <span className="text-emerald-700">{progressPercent}%</span>
            </p>
            <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
            title="Cetak Jadwal Tindakan"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Plant Summary Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-[#FAFDF9] border border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#143823] bg-emerald-100 px-2.5 py-1 rounded-lg">
            {crop}
          </span>
          <span className="font-semibold text-slate-600 truncate max-w-md">
            Target: {diagnosisText}
          </span>
        </div>
        <span className="font-bold text-slate-500">
          Tingkat Keparahan: <b className="text-emerald-800">{severity}</b>
        </span>
      </div>

      {/* TIMELINE STEPS */}
      <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:left-5 sm:before:left-6 before:w-0.5 before:bg-emerald-100 before:pointer-events-none">
        
        {milestones.map((m) => {
          const isPhaseComplete = m.tasks.every((t) => t.isCompleted);

          return (
            <div key={m.dayNumber} className="relative pl-12 sm:pl-14">
              {/* Step Circle Indicator */}
              <div
                className={`absolute left-2.5 sm:left-3.5 top-0 w-6 h-6 -translate-x-1/2 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isPhaseComplete
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-emerald-300 text-emerald-700'
                }`}
              >
                {isPhaseComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-[10px] font-black">{m.dayNumber}</span>
                )}
              </div>

              {/* Step Card */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-200 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${m.badgeColor}`}>
                      {m.dayLabel}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {m.phase}
                    </h3>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {m.tasks.filter((t) => t.isCompleted).length} dari {m.tasks.length} Selesai
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4">
                  {m.description}
                </p>

                {/* Task Checklist Items */}
                <div className="space-y-2">
                  {m.tasks.map((task) => (
                    <label
                      key={task.id}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        task.isCompleted
                          ? 'bg-emerald-50/70 border-emerald-200 text-slate-700'
                          : 'bg-white border-slate-200/80 text-slate-800 hover:border-emerald-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => handleToggleTask(task.id)}
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={`text-xs leading-relaxed ${task.isCompleted ? 'line-through text-slate-400 font-medium' : 'font-semibold'}`}>
                        {task.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
