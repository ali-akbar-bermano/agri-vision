import React, { useState, useEffect, useCallback } from 'react';
import {
  CloudRain,
  Wind,
  Thermometer,
  Sun,
  Compass,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Clock,
  MapPin,
  RefreshCw,
  Droplet,
  Search,
  Navigation,
  ExternalLink,
  Info,
  Check,
  Calendar
} from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherSprayAdvisorProps {
  latitude?: number | null;
  longitude?: number | null;
  isEmbedded?: boolean;
}

interface AgriRegion {
  id: string;
  name: string;
  detail: string;
  province: string;
  lat: number;
  lng: number;
  adm4?: string;
}

interface SearchResult {
  name: string;
  province: string;
  regency: string;
  latitude: number;
  longitude: number;
}

export const WeatherSprayAdvisor: React.FC<WeatherSprayAdvisorProps> = ({
  latitude,
  longitude,
  isEmbedded = false,
}) => {
  const [regions, setRegions] = useState<AgriRegion[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('brebes');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  // 1. Fetch available Indonesian agricultural regions on mount
  useEffect(() => {
    fetch('/api/weather/regions')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && data.data) {
          setRegions(data.data);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat daftar wilayah:', err);
      });
  }, []);

  // 2. Load weather from server API
  const loadWeather = useCallback(async (params: { region?: string; lat?: number; lng?: number; name?: string; province?: string }) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const queryParams = new URLSearchParams();
      if (params.region) queryParams.set('region', params.region);
      if (params.lat !== undefined && params.lng !== undefined) {
        queryParams.set('lat', params.lat.toString());
        queryParams.set('lng', params.lng.toString());
      }
      if (params.name) queryParams.set('name', params.name);
      if (params.province) queryParams.set('province', params.province);

      const res = await fetch(`/api/weather?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error(`Server cuaca mengembalikan kode ${res.status}`);
      }
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        setWeather(json.data);
      } else {
        throw new Error(json.message || 'Gagal memuat data cuaca.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Tidak dapat terhubung ke server cuaca BMKG/Satelit.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: prioritize coordinates if passed as props, otherwise default to Brebes
  useEffect(() => {
    if (latitude && longitude) {
      setIsGpsActive(true);
      loadWeather({ lat: latitude, lng: longitude, name: 'Lokasi Diagnosis Daun', province: 'Koordinat Lahan' });
    } else {
      loadWeather({ region: 'brebes' });
    }
  }, [latitude, longitude, loadWeather]);

  // Handler: Change Predefined Region
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setSelectedRegionId(regionId);
    setIsGpsActive(false);
    setSearchQuery('');
    loadWeather({ region: regionId });
  };

  // Handler: Geolocation GPS Button
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung geolokasi GPS.');
      return;
    }

    setIsLoading(true);
    setIsGpsActive(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadWeather({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Lahan GPS Saya',
          province: 'Deteksi Otomatis Perangkat'
        });
      },
      (err) => {
        setIsLoading(false);
        setIsGpsActive(false);
        alert(`Gagal membaca sinyal GPS (${err.message}). Mengembalikan ke pilihan sentra pertanian.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handler: Search location across Indonesia
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.trim().length < 2) return;

    setIsSearching(true);
    setShowSearchDropdown(true);

    try {
      const res = await fetch(`/api/weather/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        setSearchResults(json.data);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: SearchResult) => {
    setShowSearchDropdown(false);
    setIsGpsActive(false);
    setSearchQuery(`${item.name}, ${item.province}`);
    loadWeather({
      lat: item.latitude,
      lng: item.longitude,
      name: `${item.name} (${item.regency})`,
      province: item.province
    });
  };

  return (
    <div className={`bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden ${isEmbedded ? 'p-4 sm:p-5' : 'p-6 sm:p-8'}`}>
      
      {/* ====================================================
          HEADER & LOCATION PICKER
          ==================================================== */}
      <div className="pb-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 border border-sky-200 flex items-center justify-center text-sky-700 shadow-xs shrink-0">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#0B2215]">
                  Cuaca Riil Lahan & Jendela Semprot Aman
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  BMKG LIVE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Integrasi meteorologi riil Indonesia untuk mengantisipasi pencucian hujan dan penguapan terik
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUseGps}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                isGpsActive
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:text-emerald-800 hover:bg-emerald-50/50'
              }`}
              title="Gunakan lokasi GPS perangkat Anda"
            >
              <Navigation className={`w-3.5 h-3.5 ${isGpsActive ? 'fill-white text-white' : 'text-emerald-700'}`} />
              <span>GPS Lahan Saya</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isGpsActive && weather?.location) {
                  loadWeather({ lat: weather.location.latitude, lng: weather.location.longitude });
                } else {
                  loadWeather({ region: selectedRegionId });
                }
              }}
              disabled={isLoading}
              className="p-2 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Perbarui Data Cuaca Riil"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: REGION SELECTOR & SEARCH BAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          
          {/* Dropdown Sentra Pertanian */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-2">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-slate-500 shrink-0">Sentra Utama:</span>
            <select
              value={selectedRegionId}
              onChange={handleRegionChange}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none w-full cursor-pointer truncate"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.province}) — {r.detail}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box Bebas Kecamatan/Kota se-Indonesia */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                placeholder="Cari kecamatan / kabupaten (misal: Garut, Boyolali, Cianjur)..."
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg shrink-0 cursor-pointer transition-colors"
              >
                {isSearching ? 'Mencari...' : 'Cari'}
              </button>
            </form>

            {/* Dropdown Hasil Pencarian */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100">
                <div className="p-2 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 flex justify-between items-center">
                  <span>Hasil Wilayah di Indonesia ({searchResults.length})</span>
                  <button
                    type="button"
                    onClick={() => setShowSearchDropdown(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                  >
                    Tutup
                  </button>
                </div>
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.name}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left p-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">{item.regency} • {item.province}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono">
                      {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Source and Location Confirmation Pill */}
        {weather && (
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-bold text-slate-800">{weather.location.name}</span>
              <span className="text-slate-400">•</span>
              <span>{weather.location.province}</span>
              <span className="text-slate-400 font-mono text-[10px]">
                ({weather.location.latitude.toFixed(4)}, {weather.location.longitude.toFixed(4)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800 font-semibold text-[10px]">
                {weather.location.data_source}
              </span>
              <span>Diperbarui: <b>{weather.current.updated_at}</b></span>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================
          MAIN CONTENT AREA
          ==================================================== */}
      {isLoading && !weather ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-bold text-slate-700">Mengunduh data cuaca satelit & BMKG Indonesia...</p>
          <p className="text-xs text-slate-400">Sinkronisasi parameter mikroklimat, angin, dan presipitasi</p>
        </div>
      ) : errorMsg && !weather ? (
        <div className="p-6 my-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="font-bold text-red-900">Gagal Mengambil Data Cuaca</h3>
          <p className="text-xs text-red-700">{errorMsg}</p>
          <button
            type="button"
            onClick={() => loadWeather({ region: 'brebes' })}
            className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
          >
            Coba Lagi dengan Lokasi Standar
          </button>
        </div>
      ) : weather ? (
        <div className="pt-6 space-y-6 animate-fadeIn">

          {/* 1. SPRAY SAFETY ADVISOR BANNER */}
          <div
            className={`p-5 rounded-3xl border transition-all ${
              weather.spray_advisor.status === 'ideal'
                ? 'bg-[#F0FDF4] border-emerald-300 text-[#0B2215]'
                : weather.spray_advisor.status === 'caution'
                ? 'bg-[#FFFBEB] border-amber-300 text-[#78350F]'
                : 'bg-[#FEF2F2] border-red-300 text-[#7F1D1D]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  weather.spray_advisor.status === 'ideal'
                    ? 'bg-emerald-600 text-white'
                    : weather.spray_advisor.status === 'caution'
                    ? 'bg-amber-500 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {weather.spray_advisor.status === 'ideal' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : weather.spray_advisor.status === 'caution' ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <ShieldAlert className="w-7 h-7" />
                )}
              </div>

              <div className="space-y-1.5 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        weather.spray_advisor.status === 'ideal'
                          ? 'bg-emerald-200/80 text-emerald-900'
                          : weather.spray_advisor.status === 'caution'
                          ? 'bg-amber-200/80 text-amber-900'
                          : 'bg-red-200/80 text-red-900'
                      }`}
                    >
                      Status Agronomi Saat Ini
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Kondisi: <b>{weather.current.weather_desc}</b>
                    </span>
                  </div>

                  {weather.current.bmkg_icon_url && (
                    <img
                      src={weather.current.bmkg_icon_url}
                      alt={weather.current.weather_desc}
                      className="w-8 h-8 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                <h3 className="text-lg font-black leading-snug">{weather.spray_advisor.title}</h3>
                <p className="text-xs sm:text-sm leading-relaxed opacity-95">{weather.spray_advisor.advice}</p>

                {weather.spray_advisor.reasons && weather.spray_advisor.reasons.length > 0 && (
                  <div className="pt-2 border-t border-black/5 flex flex-wrap gap-2">
                    {weather.spray_advisor.reasons.map((r, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/70 px-2 py-1 rounded-lg border border-black/5"
                      >
                        <Info className="w-3 h-3 opacity-60" />
                        <span>{r}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. FOUR KEY METEOROLOGICAL METRICS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Suhu Udara */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Suhu Udara</span>
                <Thermometer className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{weather.current.temperature}°C</span>
                {weather.current.apparent_temperature && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    (Terasa {weather.current.apparent_temperature}°C)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {weather.current.temperature <= 28
                  ? '🟢 Sejuk (Stomata Terbuka)'
                  : weather.current.temperature >= 32
                  ? '🔴 Panas Terik (Stomata Menutup)'
                  : '🟡 Suhu Menengah'}
              </p>
            </div>

            {/* Kelembapan Relatif */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Kelembapan Udara</span>
                <Droplet className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{weather.current.humidity}%</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {weather.current.humidity > 80
                  ? '🔴 Tinggi (Waspada Spora Jamur)'
                  : weather.current.humidity < 55
                  ? '🟡 Rendah (Penguapan Cepat)'
                  : '🟢 Optimal (60-75%)'}
              </p>
            </div>

            {/* Kecepatan & Arah Angin */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Kecepatan Angin</span>
                <Wind className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {weather.current.wind_speed} <span className="text-xs font-semibold text-slate-500">km/j</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1 truncate" title={weather.current.wind_direction_cardinal}>
                {weather.current.wind_speed <= 10
                  ? '🟢 Tenang (Aman Semprot)'
                  : weather.current.wind_speed <= 15
                  ? '🟡 Sedang (Gunakan Perata)'
                  : '🔴 Kencang (Risiko Drift)'}{' '}
                • {weather.current.wind_direction_cardinal}
              </p>
            </div>

            {/* Peluang Hujan (4 Jam ke Depan) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Peluang Hujan (4 Jam)</span>
                <CloudRain className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {weather.current.rain_probability_next_4h}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {weather.current.rain_probability_next_4h < 30
                  ? '🟢 Rendah (Anti-Luntur Hujan)'
                  : weather.current.rain_probability_next_4h < 50
                  ? '🟡 Sedang (Waspada Mendung)'
                  : '🔴 Tinggi (Tunda Semprot)'}
              </p>
            </div>

          </div>

          {/* 3. HOURLY FORECAST SLIDER / TIMELINE (8 JAM KEDEPAN) */}
          {weather.hourly_forecast && weather.hourly_forecast.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Prakiraan Per Jam & Rekomendasi Aplikasi Semprot (8 Jam ke Depan)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Data Satelit Terverifikasi</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {weather.hourly_forecast.map((h, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      h.is_safe_to_spray
                        ? 'bg-white border-emerald-300 shadow-2xs'
                        : 'bg-slate-100/70 border-slate-200 opacity-90'
                    }`}
                  >
                    <p className="text-[11px] font-extrabold text-slate-800">{h.time}</p>
                    <p className="text-sm font-black text-slate-900 mt-1">{h.temperature}°C</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5" title={h.weather_desc}>
                      {h.weather_desc}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-center gap-1">
                      <Droplet className="w-3 h-3 text-sky-500" />
                      <span className="text-[10px] font-bold text-slate-700">{h.rain_probability}%</span>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          h.is_safe_to_spray
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {h.is_safe_to_spray ? 'Aman' : 'Tunda'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. DAILY GUIDELINE (BEST SPRAY TIME SESSIONS) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Pedoman Jam Semprot Efektif Pertanian Tropis Indonesia
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-900">Sesi Pagi (Paling Direkomendasikan)</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-full">
                    Sangat Efektif
                  </span>
                </div>
                <p className="text-emerald-800 font-semibold">06.00 – 08.30 WIB</p>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Stomata daun terbuka optimal menyerap cairan setelah embun pagi menguap. Angin relatif tenang dan risiko penguapan terik masih rendah.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-red-900">Sesi Siang Hari</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 font-black text-[10px] rounded-full">
                    Dilarang Keras
                  </span>
                </div>
                <p className="text-red-800 font-semibold">11.00 – 14.30 WIB</p>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Suhu di atas 32°C membuat butiran semprot menguap seketika. Efek lensa tetesan air di bawah terik matahari juga dapat membakar lamina daun.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sky-900">Sesi Sore Hari</span>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-black text-[10px] rounded-full">
                    Alternatif Baik
                  </span>
                </div>
                <p className="text-sky-800 font-semibold">15.30 – 17.30 WIB</p>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Suhu lingkungan mulai sejuk. Sangat cocok untuk mengaplikasikan insektisida/fungisida terhadap hama nokturnal seperti ulat grayak dan kutu kebul.
                </p>
              </div>

            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
};
