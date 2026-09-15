import { PresetSample } from './types';
import localImages from './assets/images';

// Sample agronomic crops stored locally in source code
export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'sample-padi',
    title: 'Daun Padi — Hawar Daun Bakteri',
    crop: 'Padi',
    type: 'daun',
    description: 'Gejala garis basah memanjang dari ujung daun menguning kecoklatan akibat Xanthomonas oryzae.',
    imageUrl: localImages.samplePadiLeaf,
  },
  {
    id: 'sample-cabai',
    title: 'Daun Cabai — Antraknosa & Bercak',
    crop: 'Cabai',
    type: 'daun',
    description: 'Bercak bulat konsentris kecoklatan dengan tepi gelap pada permukaan daun cabai.',
    imageUrl: localImages.sampleCabaiLeaf,
  },
  {
    id: 'sample-tomat',
    title: 'Daun Tomat — Busuk Daun (Phytophthora)',
    crop: 'Tomat',
    type: 'daun',
    description: 'Bercak basah kehijauan gelap hingga coklat kehitaman pada daun tomat saat cuaca lembap.',
    imageUrl: localImages.sampleTomatLeaf,
  },
  {
    id: 'sample-tanah',
    title: 'Permukaan Tanah — Kering & Retak Defisiensi NPK',
    crop: 'Tanah Pertanian',
    type: 'tanah',
    description: 'Tekstur tanah sawah mengering dengan retakan mikro dan indikasi kelembapan di bawah 20%.',
    imageUrl: localImages.featurePupukTanah,
  }
];

