export type TingkatKeparahan = 'Ringan' | 'Sedang' | 'Berat';
export type JenisObjek = 'daun' | 'tanah';

export interface RekomendasiPupuk {
  jenis: string;
  takaran_gram: number;
}

export interface AnalysisRecord {
  id: number;
  image_hash: string;
  image_path: string;
  jenis_tanaman?: string | null;
  jenis_objek: JenisObjek;
  diagnosis: string;
  tingkat_keparahan: TingkatKeparahan;
  rekomendasi_air_ml: number;
  rekomendasi_pupuk: RekomendasiPupuk;
  rekomendasi_pupuk_jenis?: string;
  rekomendasi_pupuk_gram?: number;
  catatan_tambahan?: string;
  tingkat_keyakinan: number;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  is_cached?: boolean;
}

export interface FeedbackRecord {
  id: number;
  analysis_id: number;
  is_accurate: boolean;
  catatan?: string;
  created_at: string;
}

export interface PresetSample {
  id: string;
  title: string;
  crop: string;
  type: 'daun' | 'tanah';
  description: string;
  imageUrl: string;
}

export interface WeatherData {
  location: {
    name: string;
    province: string;
    latitude: number;
    longitude: number;
    data_source: string;
    station_code: string;
  };
  current: {
    temperature: number;
    apparent_temperature?: number;
    humidity: number;
    wind_speed: number;
    wind_direction_deg: number;
    wind_direction_cardinal: string;
    rain_probability_next_4h: number;
    precipitation_amount: number;
    cloud_cover: number;
    weather_desc: string;
    weather_icon: string;
    bmkg_icon_url?: string;
    is_day: boolean;
    updated_at: string;
  };
  spray_advisor: {
    status: 'ideal' | 'caution' | 'avoid';
    title: string;
    advice: string;
    reasons: string[];
  };
  hourly_forecast: Array<{
    time: string;
    temperature: number;
    humidity: number;
    rain_probability: number;
    wind_speed: number;
    weather_desc: string;
    is_safe_to_spray: boolean;
  }>;
}
