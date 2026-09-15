import React, { useState } from 'react';
import { Sprout, History, Menu, X, ArrowRight, BookOpen, Calculator, CloudRain } from 'lucide-react';

export type AppTab = 'diagnosis' | 'history' | 'encyclopedia' | 'calculator' | 'weather';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveTab('diagnosis');
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTabSwitch = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-emerald-900/5 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Agri-Vision di Kiri */}
          <div 
            onClick={() => handleTabSwitch('diagnosis')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#143823] to-[#0B2215] flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl tracking-tight text-[#0B2215]">
                Agri<span className="text-emerald-600">Vision</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700 -mt-1">
                Smart AI Agriculture
              </span>
            </div>
          </div>

          {/* Menu di Tengah (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-emerald-50/70 p-1.5 rounded-full border border-emerald-100/60 shadow-inner">
            <button
              onClick={() => handleTabSwitch('diagnosis')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                activeTab === 'diagnosis'
                  ? 'bg-white text-[#143823] shadow-xs'
                  : 'text-slate-600 hover:text-[#143823] hover:bg-white/60'
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => handleTabSwitch('encyclopedia')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeTab === 'encyclopedia'
                  ? 'bg-white text-[#143823] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-[#143823] hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ensiklopedia</span>
            </button>

            <button
              onClick={() => handleTabSwitch('calculator')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white text-[#143823] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-[#143823] hover:bg-white/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dosis Lahan</span>
            </button>

            <button
              onClick={() => handleTabSwitch('weather')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-white text-[#143823] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-[#143823] hover:bg-white/60'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cuaca Semprot</span>
            </button>

            <button
              onClick={() => handleTabSwitch('history')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-[#143823] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-[#143823] hover:bg-white/60'
              }`}
            >
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>Riwayat</span>
              <span className="bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {historyCount}
              </span>
            </button>
          </nav>

          {/* Tombol CTA 'Mulai Diagnosis' di Kanan (Hanya tampil pada desktop saat burger tidak aktif) */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => scrollToSection('upload-section')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#143823] hover:bg-[#0B2215] active:scale-95 rounded-2xl shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <span>Mulai Diagnosis</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>
          </div>

          {/* Tombol Hamburger Mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-emerald-50 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          <button
            onClick={() => handleTabSwitch('diagnosis')}
            className={`block w-full text-left px-4 py-2.5 rounded-xl font-medium ${
              activeTab === 'diagnosis' ? 'bg-emerald-50 text-[#143823] font-bold' : 'text-slate-700'
            }`}
          >
            Beranda & Diagnosis
          </button>
          <button
            onClick={() => handleTabSwitch('encyclopedia')}
            className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl font-medium ${
              activeTab === 'encyclopedia' ? 'bg-emerald-50 text-[#143823] font-bold' : 'text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Ensiklopedia Hama & Penyakit</span>
          </button>
          <button
            onClick={() => handleTabSwitch('calculator')}
            className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl font-medium ${
              activeTab === 'calculator' ? 'bg-emerald-50 text-[#143823] font-bold' : 'text-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Kalkulator Dosis Lahan & Tangki</span>
          </button>
          <button
            onClick={() => handleTabSwitch('weather')}
            className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl font-medium ${
              activeTab === 'weather' ? 'bg-emerald-50 text-[#143823] font-bold' : 'text-slate-700'
            }`}
          >
            <CloudRain className="w-4 h-4 text-emerald-600" />
            <span>Cuaca & Waktu Semprot</span>
          </button>
          <button
            onClick={() => handleTabSwitch('history')}
            className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-medium ${
              activeTab === 'history' ? 'bg-emerald-50 text-[#143823] font-bold' : 'text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Riwayat Analisis</span>
            </span>
            <span className="bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {historyCount}
            </span>
          </button>
          <div className="pt-2">
            <button
              onClick={() => scrollToSection('upload-section')}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-white bg-[#143823] shadow-md cursor-pointer"
            >
              <span>Mulai Diagnosis AI</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
