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
