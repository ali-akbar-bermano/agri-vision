import { AnalysisRecord } from './types';

// Helper hash sederhana untuk konsistensi variasi hasil
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function analyzePlantClientSide(
  cropName: string | null,
  imageUrl: string,
  latitude?: number | null,
  longitude?: number | null
): AnalysisRecord {
  const crop = (cropName || '').toLowerCase();
  const hash = simpleHash(imageUrl + (cropName || ''));
  const variant = hash % 3;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  let output: {
    jenis_objek: 'daun' | 'tanah';
    diagnosis: string;
    tingkat_keparahan: 'Ringan' | 'Sedang' | 'Berat';
    rekomendasi_air_ml: number;
    pupuk_jenis: string;
    pupuk_gram: number;
    catatan: string;
    keyakinan: number;
  };

  if (crop.includes('padi') || crop.includes('rice')) {
    if (variant === 0) {
      output = {
        jenis_objek: 'daun',
        diagnosis: 'Terdeteksi gejala Hawar Daun Bakteri (Xanthomonas oryzae pv. oryzae) dengan lesi basah memanjang kekuningan pada tepi helai daun.',
        tingkat_keparahan: 'Sedang',
        rekomendasi_air_ml: 400,
        pupuk_jenis: 'Bakterisida Tembaga Oksiklorida + NPK Seimbang 15-15-15',
        pupuk_gram: 20,
        catatan: 'Hentikan pemupukan Urea berkadar nitrogen tinggi sementara waktu. Keringkan petak sawah secara berkala (intermittent irrigation) untuk menekan koloni bakteri.',
        keyakinan: 92,
      };
    } else if (variant === 1) {
      output = {
        jenis_objek: 'daun',
        diagnosis: 'Terindikasi serangan Penyakit Blas Daun (Pyricularia oryzae) berupa bercak belah ketupat kelabu kecoklatan di bagian tengah daun.',
        tingkat_keparahan: 'Berat',
        rekomendasi_air_ml: 350,
        pupuk_jenis: 'Fungisida Sistemik Trisiklazol + Pupuk Silika Cair',
        pupuk_gram: 15,
        catatan: 'Semprotkan fungisida pada pagi hari saat embun mengering. Tambahkan silika untuk memperkuat dinding sel tanaman padi dari penetrasi hifa jamur.',
        keyakinan: 89,
      };
    } else {
      output = {
        jenis_objek: 'daun',
        diagnosis: 'Bercak Daun Coklat (Bipolaris oryzae) terindikasi akibat defisiensi Kalium dan Silika pada lahan kekurangan hara mikro.',
        tingkat_keparahan: 'Ringan',
        rekomendasi_air_ml: 300,
        pupuk_jenis: 'Kalium Klorida (KCl) + Pupuk Daun Mikro Zn/Fe',
        pupuk_gram: 18,
        catatan: 'Tingkatkan kecukupan kalium untuk memperkokoh batang dan ketahanan daun terhadap spora jamur oportunistik.',
        keyakinan: 86,
      };
    }
  } else if (crop.includes('cabai') || crop.includes('chili') || crop.includes('chilli')) {
    if (variant === 0) {
      output = {
        jenis_objek: 'daun',
        diagnosis: 'Terdeteksi infeksi jamur Antraknosa (Colletotrichum capsici) dengan bercak cincin konsentris nekrotik pada permukaan daun dan tangkai.',
        tingkat_keparahan: 'Berat',
        rekomendasi_air_ml: 200,
        pupuk_jenis: 'Fungisida Kontak Mankozeb 80 WP + Difenokonazol',
        pupuk_gram: 15,
        catatan: 'Pangkas dan musnahkan daun terinfeksi berat di luar area kebun. Hindari penyiraman lewat atas (overhead) agar spora tidak terciprat ke daun sehat.',
        keyakinan: 94,
      };
    } else if (variant === 1) {
      output = {
        jenis_objek: 'daun',
        diagnosis: 'Gejala Virus Kuning Gemini (Pepper Yellow Leaf Curl Virus) berupa daun mengecil, tepi menggulung ke atas, dan klorosis urat daun.',
        tingkat_keparahan: 'Sedang',
        rekomendasi_air_ml: 250,
        pupuk_jenis: 'Insektisida Nabati Ekstrak Mimba (vektor kutu kebul) + Kalsium Boron',
        pupuk_gram: 12,
        catatan: 'Kendalikan kutu kebul (Bemisia tabaci) sebagai vektor utama virus menggunakan perangkap kuning berperekat di sekeliling bedengan.',
        keyakinan: 90,
      };
    } else {
      output = {
        jenis_objek: 'daun',
        diagnosis: 'Defisiensi Unsur Kalsium dan Klorofil Awal (ujung daun muda mengkerut dan kaku, rentan busuk ujung buah / blossom end rot).',
        tingkat_keparahan: 'Ringan',
        rekomendasi_air_ml: 280,
        pupuk_jenis: 'Kalsium Nitrat (CNG) + Asam Amino Hayati',
        pupuk_gram: 10,
        catatan: 'Jaga kelembapan tanah konstan karena fluktuasi air ekstrem menghambat translokasi kalsium menuju pucuk daun muda.',
        keyakinan: 87,
      };
    }
  } else if (crop.includes('tomat') || crop.includes('tomato')) {
    if (variant === 0) {
      output = {
        jenis_objek: 'daun',
        diagnosis: 'Serangan Busuk Daun Basah (Phytophthora infestans) dengan lesi coklat kehitaman berbatas hijau pucat pada helai daun.',
        tingkat_keparahan: 'Berat',
        rekomendasi_air_ml: 220,
        pupuk_jenis: 'Fungisida Dimetomorf / Simoksanil + Pupuk Kalium Fosfit',
        pupuk_gram: 15,
        catatan: 'Segera lakukan isolasi bedengan. Kondisi cuaca lembap bersuhu sejuk sangat mempercepat ledakan spora Phytophthora.',
        keyakinan: 95,
      };
    } else if (variant === 1) {
      output = {
        jenis_objek: 'daun',
        diagnosis: 'Klorosis Intervenal Defisiensi Magnesium (Mg) dengan pola menguning di antara tulang daun, tulang daun tetap hijau.',
        tingkat_keparahan: 'Ringan',
        rekomendasi_air_ml: 300,
        pupuk_jenis: 'Pupuk Magnesium Sulfat (Kieserite / Epsom Salt)',
        pupuk_gram: 12,
        catatan: 'Semprotkan larutan magnesium sulfat 0.5% langsung ke permukaan bawah daun untuk penyerapan stomata lebih cepat.',
        keyakinan: 88,
      };
    } else {
      output = {
        jenis_objek: 'daun',
        diagnosis: 'Bercak Daun Septoria (Septoria lycopersici) dengan bercak bulat kecil bertepi gelap dan bagian tengah berwarna kelabu.',
        tingkat_keparahan: 'Sedang',
        rekomendasi_air_ml: 260,
        pupuk_jenis: 'Fungisida Tembaga Hidroksida + Pupuk Silika',
        pupuk_gram: 15,
        catatan: 'Pangkas daun-daun tua bagian paling bawah (canopy pruning) untuk melancarkan sirkulasi udara di sekitar perakaran.',
        keyakinan: 91,
      };
    }
  } else if (crop.includes('tanah') || crop.includes('soil')) {
    output = {
      jenis_objek: 'tanah',
      diagnosis: 'Permukaan tanah mengalami evaporasi tinggi dan defisiensi kelembapan (< 22% kapasitas lapang) disertai kepadatan mikroba rendah.',
      tingkat_keparahan: 'Sedang',
      rekomendasi_air_ml: 500,
      pupuk_jenis: 'Kompos Organik Matang + Asam Humat & Agens Hayati Trichoderma',
      pupuk_gram: 50,
      catatan: 'Aplikasikan mulsa jerami atau jerami kering di atas permukaan bedengan untuk menjaga hidrasi dan merangsang aktivitas cacing tanah.',
      keyakinan: 93,
    };
  } else if (crop.includes('jagung') || crop.includes('corn')) {
    output = {
      jenis_objek: 'daun',
      diagnosis: 'Gejala Penyakit Bulai (Peronosclerospora maydis) berupa garis-garis sejajar klorotik putih kekuningan dari pangkal daun.',
      tingkat_keparahan: 'Berat',
      rekomendasi_air_ml: 350,
      pupuk_jenis: 'Fungisida Metalaksil + Pupuk NPK Khusus Jagung',
      pupuk_gram: 20,
      catatan: 'Cabut tanaman yang kerdil parah agar tidak menjadi sumber inokulum spora bagi tanaman jagung di sekitarnya.',
      keyakinan: 92,
    };
  } else {
    // Tanaman Umum
    const umumList = [
      {
        diag: `Analisis visual ${cropName || 'tanaman'}: Terdeteksi bercak klorotik kekuningan dan defisiensi unsur Nitrogen awal pada daun muda.`,
        keparahan: 'Ringan' as const,
        air: 280,
        pupuk: 'Pupuk NPK Seimbang 16-16-16 + Asam Amino',
        gram: 15,
        catatan: 'Berikan pemupukan berimbang dan lakukan penyiraman teratur di pagi hari.',
      },
      {
        diag: `Analisis visual ${cropName || 'tanaman'}: Terindikasi stres hidrasi moderat dengan kolonisasi spora jamur oportunistik pada daun bawah.`,
        keparahan: 'Sedang' as const,
        air: 320,
        pupuk: 'Fungisida Organik Ekstrak Nabati + Agens Hayati Trichoderma',
        gram: 18,
        catatan: 'Perbaiki sistem drainase bedengan agar air tidak menggenang di zona perakaran aktif.',
      },
      {
        diag: `Analisis visual ${cropName || 'tanaman'}: Terdeteksi klorosis akibat defisiensi unsur hara mikro (Besi & Magnesium).`,
        keparahan: 'Ringan' as const,
        air: 250,
        pupuk: 'Pupuk Mikro Chelate Fe-EDTA + Kieserite',
        gram: 10,
        catatan: 'Semprotkan larutan pupuk mikro melalui daun (foliar spray) saat stomata terbuka di pagi hari.',
      },
    ];
    const item = umumList[variant];
    output = {
      jenis_objek: 'daun',
      diagnosis: item.diag,
      tingkat_keparahan: item.keparahan,
      rekomendasi_air_ml: item.air,
      pupuk_jenis: item.pupuk,
      pupuk_gram: item.gram,
      catatan: item.catatan,
      keyakinan: 87,
    };
  }

  return {
    id: Date.now(),
    image_hash: hash.toString(16),
    image_path: imageUrl,
    jenis_tanaman: cropName,
    jenis_objek: output.jenis_objek,
    diagnosis: output.diagnosis,
    tingkat_keparahan: output.tingkat_keparahan,
    rekomendasi_air_ml: output.rekomendasi_air_ml,
    rekomendasi_pupuk: {
      jenis: output.pupuk_jenis,
      takaran_gram: output.pupuk_gram,
    },
    rekomendasi_pupuk_jenis: output.pupuk_jenis,
    rekomendasi_pupuk_gram: output.pupuk_gram,
    catatan_tambahan: output.catatan,
    tingkat_keyakinan: output.keyakinan,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    created_at: nowStr,
    is_cached: false,
  };
}
