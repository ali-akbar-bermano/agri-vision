import localImages from '../assets/images';

export interface DiseaseEntry {
  id: string;
  name: string;
  latinName: string;
  crop: 'Padi' | 'Cabai' | 'Tomat' | 'Jagung' | 'Tanah';
  category: 'Jamur / Fungi' | 'Bakteri' | 'Virus' | 'Hama Serangga' | 'Fisiologis / Nutrisi';
  severityDefault: 'Ringan' | 'Sedang' | 'Berat';
  imageUrl: string;
  symptoms: string[];
  triggerConditions: string;
  organicRemedy: string[];
  chemicalRemedy: string[];
  prevention: string[];
}

export const ENCYCLOPEDIA_DATA: DiseaseEntry[] = [
  {
    id: 'cabai-antraknosa',
    name: 'Antraknosa (Patek)',
    latinName: 'Colletotrichum capsici',
    crop: 'Cabai',
    category: 'Jamur / Fungi',
    severityDefault: 'Berat',
    imageUrl: localImages.sampleCabaiLeaf,
    symptoms: [
      'Bercak cekung melingkar berwarna cokelat kehitaman pada buah atau daun',
      'Massa spora berwarna jingga atau merah muda di tengah bercak saat lembap',
      'Buah menjadi keriput, membusuk, dan rontok sebelum matang'
    ],
    triggerConditions: 'Kelembapan tinggi (>85%) dan suhu hangat (25–30°C), sering muncul di musim hujan.',
    organicRemedy: [
      'Semprotkan ekstrak daun mimba atau rimpang lengkuas (konsentrasi 5%) tiap 4 hari',
      'Aplikasi agen hayati Trichoderma harzianum pada lubang tanam dan pangkal batang',
      'Petik dan musnahkan segera buah yang terserang, jangan dibiarkan membusuk di tanah'
    ],
    chemicalRemedy: [
      'Fungisida kontak berbahan aktif Mankozeb 80% atau Propineb 70%',
      'Fungisida sistemik berbahan aktif Azoksistrobin + Difenokonazol jika infeksi meluas'
    ],
    prevention: [
      'Gunakan mulsa plastik hitam perak untuk mengurangi percikan spora dari tanah',
      'Atur jarak tanam minimal 50 x 60 cm untuk sirkulasi udara optimal',
      'Hindari penggunaan pupuk Nitrogen (Urea) berlebihan saat pembungaan'
    ]
  },
  {
    id: 'cabai-embun-tepung',
    name: 'Embun Tepung (Powdery Mildew)',
    latinName: 'Leveillula taurica',
    crop: 'Cabai',
    category: 'Jamur / Fungi',
    severityDefault: 'Sedang',
    imageUrl: localImages.sampleCabaiLeaf,
    symptoms: [
      'Lapisan serbuk putih kelabu menyerupai tepung pada permukaan bawah daun',
      'Permukaan atas daun menunjukkan klorosis (bercak kuning tidak beraturan)',
      'Daun melengkung ke atas, mengering, lalu gugur sebelum waktunya'
    ],
    triggerConditions: 'Cuaca kering dengan kelembapan udara malam hari yang tinggi, sirkulasi udara buruk.',
    organicRemedy: [
      'Semprotan larutan baking soda (bikarbonat 5 gr/liter air) ditambah sedikit sabun kelapa',
      'Aplikasi jamur antagonis Ampelomyces quisqualis atau Trichoderma',
      'Pangkas cabang bawah tanaman (wiwil) untuk memperbaiki pencahayaan'
    ],
    chemicalRemedy: [
      'Fungisida sulfur (belerang larut) dosis 2–3 gr/liter',
      'Fungisida sistemik golongan Triazol seperti Triadimefon atau Heksakonazol'
    ],
    prevention: [
      'Jaga kebersihan lahan dari gulma inang',
      'Penyiraman di pagi hari pada area akar (bukan membasahi kanopi daun)',
      'Pemberian pupuk silika (Si) untuk memperkuat dinding sel kutikula daun'
    ]
  },
  {
    id: 'padi-bercak-cokelat',
    name: 'Bercak Cokelat Padi (Brown Spot)',
    latinName: 'Bipolaris oryzae',
    crop: 'Padi',
    category: 'Jamur / Fungi',
    severityDefault: 'Sedang',
    imageUrl: localImages.samplePadiLeaf,
    symptoms: [
      'Bercak oval bundar berwarna cokelat tua dengan pusat berwarna abu-abu pada helai daun',
      'Bercak dikelilingi lingkaran halo berwarna kuning terang',
      'Pada gabah, terbentuk bercak hitam kelabu yang menurunkan mutu beras'
    ],
    triggerConditions: 'Tanah miskin hara (defisiensi Kalium, Silika, atau Seng), lahan stres kekeringan atau drainase buruk.',
    organicRemedy: [
      'Aplikasi pupuk kompos matang yang diperkaya Trichoderma saat olah tanah',
      'Perendaman benih (seed treatment) dengan larutan ekstrak kunyit atau air panas 52°C',
      'Pemberian abu sekam padi sebagai sumber silika organik alami'
    ],
    chemicalRemedy: [
      'Fungisida mankozeb, tebukonazol, atau difenokonazol saat anakan aktif',
      'Pupuk daun yang mengandung unsur mikro Zn (Zinc) dan KCL'
    ],
    prevention: [
      'Seimbangkan pemupukan N, P, dan K; jangan hanya menggunakan Urea',
      'Terapkan pengairan berselang (intermittent irrigation) untuk aerasi akar',
      'Gunakan benih bersertifikat bebas patogen'
    ]
  },
  {
    id: 'padi-hawar-daun',
    name: 'Hawar Daun Bakteri (Kresek)',
    latinName: 'Xanthomonas oryzae pv. oryzae',
    crop: 'Padi',
    category: 'Bakteri',
    severityDefault: 'Berat',
    imageUrl: localImages.cropPadiSawah,
    symptoms: [
      'Garis basah kehijauan di tepi daun yang meluas menjadi garis bergelombang abu-abu keputihan',
      'Daun mengering seperti terbakar terik matahari (kresek)',
      'Muncul cairan lendir bakteri (bacterial ooze) seperti titik embun kuning di pagi hari'
    ],
    triggerConditions: 'Angin kencang dan hujan lebat yang menimbulkan luka pada helai daun, pemupukan urea berlebih.',
    organicRemedy: [
      'Semprotan agens hayati bakteri Pseudomonas fluorescens atau Bacillus subtilis',
      'Hindari menyiram air sawah berlebihan saat fase tanaman luka',
      'Aplikasi asap cair kelapa (wood vinegar) konsentrasi 1:200'
    ],
    chemicalRemedy: [
      'Bakterisida tembaga hidroksida atau tembaga oksiklorida dosis 1.5 gr/L',
      'Bakterisida berbahan aktif kasugamisin atau oksitetrasiklin'
    ],
    prevention: [
      'Tanam varietas toleran hawar bakteri seperti Inpari 32 atau Ciherang',
      'Kurangi dosis urea pada musim penghujan',
      'Terapkan sistem tanam Jajar Legowo untuk sirkulasi udara sawah'
    ]
  },
  {
    id: 'tomat-busuk-daun',
    name: 'Busuk Daun & Batang (Late Blight)',
    latinName: 'Phytophthora infestans',
    crop: 'Tomat',
    category: 'Jamur / Fungi',
    severityDefault: 'Berat',
    imageUrl: localImages.sampleTomatLeaf,
    symptoms: [
      'Bercak basah berwarna hijau gelap kehitaman tidak beraturan pada ujung daun',
      'Lapisan kapang halus keputihan di sisi bawah daun saat cuaca lembap basah',
      'Batang mengalami luka kecokelatan berair rapuh dan buah membusuk keras cokelat'
    ],
    triggerConditions: 'Suhu dingin sejuk (16–22°C) disertai kabut tebal, gerimis, atau kelembapan di atas 90%.',
    organicRemedy: [
      'Semprotkan ekstrak kulit bawang merah dan bawang putih sebagai antijamur',
      'Segera buang dan bakar daun atau ranting yang terinfeksi',
      'Gunakan atap paranet atau plastik UV pada bedengan di dataran tinggi'
    ],
    chemicalRemedy: [
      'Fungisida sistemik berbahan aktif Simoksanil + Mankozeb',
      'Fungisida kuratif Dimetomorf atau Mandipropamid'
    ],
    prevention: [
      'Lakukan penyiangan agar sirkulasi udara sekitar bedengan lancar',
      'Hindari menyiram tanaman dari bagian atas (gunakan irigasi tetes/kocor akar)',
      'Gunakan lanjaran/ajir tinggi agar daun tidak menyentuh tanah basah'
    ]
  },
  {
    id: 'tomat-kalsium-defisiensi',
    name: 'Busuk Pantat Buah (Blossom End Rot)',
    latinName: 'Physiological (Defisiensi Kalsium - Ca)',
    crop: 'Tomat',
    category: 'Fisiologis / Nutrisi',
    severityDefault: 'Sedang',
    imageUrl: localImages.sampleTomatLeaf,
    symptoms: [
      'Bagian ujung/pantat buah tomat tampak cekung basah lalu menghitam pipih',
      'Jaringan bagian bawah mengeras seperti kulit kering',
      'Bukan disebabkan oleh jamur atau serangga, melainkan translokasi kalsium terganggu'
    ],
    triggerConditions: 'Penyiraman yang tidak konsisten (tanah kering mendadak lalu banjir basah), pH tanah asam (< 5.5).',
    organicRemedy: [
      'Aplikasi pupuk kalsium organik dari cangkang telur halus yang dilarutkan asam cuka apel',
      'Mulsa jerami tebal di sekitar perakaran untuk menjaga kelembapan tanah konstan'
    ],
    chemicalRemedy: [
      'Semprot pupuk daun Kalsium Nitrat (Ca(NO3)2) konsentrasi 2–4 gr/liter ke buah muda',
      'Aplikasi dolomit/kapur pertanian 50–100 gr per lubang tanam'
    ],
    prevention: [
      'Jaga kelembapan tanah tetap stabil dengan penyiraman teratur tiap pagi',
      'Ukur dan naikkan pH tanah masam sebelum tanam',
      'Hindari pemupukan amonium/kalium dosis tinggi yang menghambat serapan kalsium'
    ]
  },
  {
    id: 'jagung-bulai',
    name: 'Penyakit Bulai Jagung (Downy Mildew)',
    latinName: 'Peronosclerospora maydis',
    crop: 'Jagung',
    category: 'Jamur / Fungi',
    severityDefault: 'Berat',
    imageUrl: localImages.cropJagungFarm,
    symptoms: [
      'Garis-garis kuning keputihan memanjang sejajar tulang daun pada daun muda',
      'Permukaan bawah daun bergaris tampak dilapisi serbuk putih halus di pagi hari',
      'Tanaman kerdil, ruas batang memendek, dan tongkol tidak terbentuk sempurna (banci)'
    ],
    triggerConditions: 'Embun malam tebal dengan suhu 21–25°C pada fase bibit jagung (umur 1–3 minggu).',
    organicRemedy: [
      'Cabut dan musnahkan tanaman yang terinfeksi bulai (eradikasi total) agar tidak menular',
      'Semprotan bio-fungisida Bacillus amyloliquefaciens'
    ],
    chemicalRemedy: [
      'Perlakuan benih (seed dressing) fungisida berbahan aktif Metalaksil atau Dimetomorf',
      'Semprotan fungisida sistemik Metalaksil pada umur 7, 14, dan 21 HST'
    ],
    prevention: [
      'Gunakan varietas tahan bulai seperti Bisi 18, NK 212, atau Pioneer P35',
      'Tanam serentak dalam rentang waktu tidak lebih dari 10 hari dalam satu hamparan',
      'Hindari menanam jagung terus menerus tanpa rotasi tanaman kacang-kacangan'
    ]
  },
  {
    id: 'tanah-masam',
    name: 'Kemasaman Tanah Tinggi (Low pH Stress)',
    latinName: 'Edaphic Soil Acidity (pH < 5.0)',
    crop: 'Tanah',
    category: 'Fisiologis / Nutrisi',
    severityDefault: 'Sedang',
    imageUrl: localImages.featurePupukTanah,
    symptoms: [
      'Permukaan tanah tampak kemerahan atau berkarat, keras saat kering, becek liat saat basah',
      'Ujung akar tanaman menebal tumpul berwarna cokelat gelap karena keracunan Aluminium (Al)',
      'Tanaman lambat tumbuh dan kerdil meskipun sudah diberi pupuk NPK'
    ],
    triggerConditions: 'Curah hujan tinggi yang mencuci basa-basa tanah, pemakaian pupuk kimia sintetis asam jangka panjang.',
    organicRemedy: [
      'Aplikasi pupuk kandang sapi atau kambing matang 10–20 ton/hektar',
      'Pemberian biochar arang sekam padi untuk meningkatkan Kapasitas Tukar Kation (KTK)',
      'Aplikasi mikroba pelarut fosfat dan penambat nitrogen'
    ],
    chemicalRemedy: [
      'Tabur Kapur Pertanian (Kaptan / Dolomit CaMg(CO3)2) dosis 1.5–3 ton/ha saat olah tanah',
      'Berikan pupuk SP-36 atau Rock Phosphate yang bereaksi lambat'
    ],
    prevention: [
      'Lakukan uji pH tanah rutin tiap awal musim tanam menggunakan pH meter atau kertas lakmus',
      'Kurangi pupuk berkarakter asam seperti ZA (Amonium Sulfat)',
      'Tanam tanaman penutup tanah (legume cover crops) untuk memperkaya bahan organik'
    ]
  }
];
