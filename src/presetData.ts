import { PresetSample } from './types';

// Sample photos encoded as SVG Data URIs representing realistic agronomic conditions
export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'sample-padi',
    title: 'Daun Padi — Hawar Daun Bakteri',
    crop: 'Padi',
    type: 'daun',
    description: 'Gejala garis basah memanjang dari ujung daun menguning kecoklatan akibat Xanthomonas oryzae.',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23A5D6A7"/><stop offset="100%" stop-color="%2381C784"/></linearGradient><linearGradient id="lesion" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23D7CCC8"/><stop offset="50%" stop-color="%23A1887F"/><stop offset="100%" stop-color="%235D4037"/></linearGradient></defs><rect width="600" height="400" fill="url(%23bg)"/><path d="M50,200 Q300,50 550,200 Q300,350 50,200" fill="%2343A047" stroke="%232E7D32" stroke-width="4"/><path d="M60,200 L540,200" stroke="%232E7D32" stroke-width="3" stroke-dasharray="8,4"/><path d="M320,130 Q420,120 490,180 Q430,220 330,170 Z" fill="url(%23lesion)" opacity="0.9"/><circle cx="390" cy="160" r="18" fill="%233E2723" opacity="0.8"/><text x="300" y="360" font-family="system-ui,sans-serif" font-size="18" font-weight="bold" fill="%231B5E20" text-anchor="middle">Sampel Daun Padi (Xanthomonas)</text></svg>'
  },
  {
    id: 'sample-cabai',
    title: 'Daun Cabai — Antraknosa & Bercak',
    crop: 'Cabai',
    type: 'daun',
    description: 'Bercak bulat konsentris kecoklatan dengan tepi gelap pada permukaan daun cabai.',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23C8E6C9"/><stop offset="100%" stop-color="%23A5D6A7"/></linearGradient></defs><rect width="600" height="400" fill="url(%23bg2)"/><path d="M120,320 Q200,80 480,100 Q460,300 120,320" fill="%234CAF50" stroke="%23388E3C" stroke-width="4"/><path d="M140,300 Q280,220 460,110" stroke="%232E7D32" stroke-width="3"/><circle cx="310" cy="180" r="32" fill="%235D4037" opacity="0.85"/><circle cx="310" cy="180" r="18" fill="%23D7CCC8"/><circle cx="380" cy="240" r="22" fill="%234E342E" opacity="0.8"/><circle cx="240" cy="220" r="16" fill="%236D4C41" opacity="0.75"/><text x="300" y="360" font-family="system-ui,sans-serif" font-size="18" font-weight="bold" fill="%231B5E20" text-anchor="middle">Sampel Daun Cabai (Antraknosa)</text></svg>'
  },
  {
    id: 'sample-tomat',
    title: 'Daun Tomat — Busuk Daun (Phytophthora)',
    crop: 'Tomat',
    type: 'daun',
    description: 'Bercak basah kehijauan gelap hingga coklat kehitaman pada daun tomat saat cuaca lembap.',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="bg3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="%23E8F5E9"/><stop offset="100%" stop-color="%23C8E6C9"/></linearGradient></defs><rect width="600" height="400" fill="url(%23bg3)"/><g transform="translate(100,60)"><path d="M100,220 C80,120 180,60 260,100 C320,40 380,140 320,200 C360,260 220,300 100,220 Z" fill="%23388E3C" stroke="%231B5E20" stroke-width="3"/><path d="M220,120 Q260,130 280,180 Q220,220 180,170 Z" fill="%233E2723" opacity="0.9"/><path d="M130,190 Q170,170 190,210 Q140,240 130,190 Z" fill="%234E342E" opacity="0.85"/></g><text x="300" y="360" font-family="system-ui,sans-serif" font-size="18" font-weight="bold" fill="%231B5E20" text-anchor="middle">Sampel Daun Tomat (Phytophthora)</text></svg>'
  },
  {
    id: 'sample-tanah',
    title: 'Permukaan Tanah — Kering & Retak Defisiensi NPK',
    crop: 'Tanah Pertanian',
    type: 'tanah',
    description: 'Tekstur tanah sawah mengering dengan retakan mikro dan indikasi kelembapan di bawah 20%.',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="soil" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%238D6E63"/><stop offset="50%" stop-color="%236D4C41"/><stop offset="100%" stop-color="%234E342E"/></linearGradient></defs><rect width="600" height="400" fill="url(%23soil)"/><path d="M50,120 L180,180 L280,140 L420,220 L550,190" stroke="%232E1C14" stroke-width="5" fill="none"/><path d="M180,180 L160,280 L260,340" stroke="%232E1C14" stroke-width="4" fill="none"/><path d="M280,140 L340,60" stroke="%232E1C14" stroke-width="4" fill="none"/><path d="M420,220 L400,320 L480,360" stroke="%232E1C14" stroke-width="4" fill="none"/><path d="M300,200 L380,160" stroke="%232E1C14" stroke-width="3" fill="none"/><text x="300" y="360" font-family="system-ui,sans-serif" font-size="18" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">Sampel Tanah Kering Berongga</text></svg>'
  }
];
