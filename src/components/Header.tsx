import React, { useState } from 'react';
import { Sprout, History, Code2, Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  activeTab: 'diagnosis' | 'history' | 'code';
  setActiveTab: (tab: 'diagnosis' | 'history' | 'code') => void;
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

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/85 backdrop-blur-md border-b border-emerald-900/5 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Agri-Vision di Kiri */}
          <div 
            onClick={() => scrollToSection('beranda')}
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
          <nav className="hidden md:flex items-center gap-1 bg-emerald-50/70 p-1.5 rounded-full border border-emerald-100/60 shadow-inner">
            <button
              onClick={() => scrollToSection('beranda')}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                activeTab === 'diagnosis'
                  ? 'bg-white text-[#143823] shadow-xs'
                  : 'text-slate-600 hover:text-[#143823] hover:bg-white/60'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => scrollToSection('cara-kerja')}
              className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-[#143823] hover:bg-white/60 rounded-full transition-all cursor-pointer"
            >
              Cara Kerja
            </button>
            <button
              onClick={() => scrollToSection('tentang-kami')}
              className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-[#143823] hover:bg-white/60 rounded-full transition-all cursor-pointer"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-[#143823] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-[#143823] hover:bg-white/60'
              }`}
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span>Riwayat</span>
              <span className="bg-emerald-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                {historyCount}
              </span>
            </button>
          </nav>

          {/* Tombol CTA 'Mulai Diagnosis' di Kanan */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('code');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-2.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
              title="Lihat Arsitektur Backend & SQLite"
            >
              <Code2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => scrollToSection('upload-section')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#143823] hover:bg-[#0B2215] active:scale-95 rounded-2xl shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <span>Mulai Diagnosis</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>
          </div>

          {/* Tombol Hamburger Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-emerald-50 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          <button
            onClick={() => scrollToSection('beranda')}
            className="block w-full text-left px-4 py-2.5 rounded-xl font-medium text-[#143823] bg-emerald-50"
          >
            Beranda
          </button>
          <button
            onClick={() => scrollToSection('cara-kerja')}
            className="block w-full text-left px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-emerald-50/50"
          >
            Cara Kerja
          </button>
          <button
            onClick={() => scrollToSection('tentang-kami')}
            className="block w-full text-left px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-emerald-50/50"
          >
            Tentang Kami
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-emerald-50/50"
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
              <span>Mulai Diagnosis</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
