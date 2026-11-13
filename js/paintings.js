// ==========================================================================
// PAINTINGS & ARTWORKS REGISTRY
// Supports persistent photo uploads, placeholder generator & modal details
// ==========================================================================

export const DEFAULT_PAINTINGS = [
  {
    id: 1,
    side: 'left',
    bayIndex: 0,
    title: 'Bizning Ilk Nigohimiz',
    subtitle: 'ZAL I — XOTIRA #01',
    description: 'Ko\'zlarimiz bir-biriga tushgan o\'sha sehrli lahza. Butun dunyo to\'xtab qolgandek tuyulgandi.',
    date: 'Unutilmas ilk uchrashuv',
    aspect: 1.33, // width/height
    placeholderTheme: 'sunset'
  },
  {
    id: 2,
    side: 'left',
    bayIndex: 1,
    title: 'Sevgilimning Tabassumi',
    subtitle: 'ZAL I — XOTIRA #02',
    description: 'Dunyodagi eng go\'zal va eng samimiy tabassum. Har bir kunimni yoritib turadigan oftobim.',
    date: 'Har lahza quvonch',
    aspect: 0.85,
    placeholderTheme: 'portrait'
  },
  {
    id: 3,
    side: 'left',
    bayIndex: 2,
    title: 'Kechki Sayr',
    subtitle: 'ZAL I — XOTIRA #03',
    description: 'Yulduzlar ostida, qo\'llaringizdan tutib qilingan eng shirin suhbatlar va sokin xiyobonlar.',
    date: 'Tungi shahar chiroqlari',
    aspect: 1.4,
    placeholderTheme: 'night'
  },
  {
    id: 4,
    side: 'left',
    bayIndex: 3,
    title: 'Shirin Qahva & Shirin Xotiralar',
    subtitle: 'ZAL I — XOTIRA #04',
    description: 'Ikkimizning sevimli qahvaxonamizdagi samimiy kulgularimiz va kelajak haqidagi orzularimiz.',
    date: 'Bir piyola mehr',
    aspect: 1.0,
    placeholderTheme: 'cozy'
  },
  {
    id: 5,
    side: 'left',
    bayIndex: 4,
    title: 'Kutilmagan Sovg\'a',
    subtitle: 'ZAL I — XOTIRA #05',
    description: 'Ko\'zlaringizdagi hayrat va quvonch jilosi — men uchun eng bebaho mukofot.',
    date: 'Kutilmagan baxt',
    aspect: 0.8,
    placeholderTheme: 'flower'
  },
  {
    id: 6,
    side: 'left',
    bayIndex: 5,
    title: 'Yomg\'ir Ostida',
    subtitle: 'ZAL I — XOTIRA #06',
    description: 'Bitta soyabon ostida ikkita yurak. Yomg\'ir tomchilari ham muhabbatimiz kuylayotgandek.',
    date: 'Kuzgi yomg\'ir',
    aspect: 1.3,
    placeholderTheme: 'rain'
  },
  // Right Wall Paintings
  {
    id: 7,
    side: 'right',
    bayIndex: 0,
    title: 'Bog\'dagi Gullar & Sen',
    subtitle: 'ZAL II — XOTIRA #07',
    description: 'Bahor gullari orasida sen hammadan go\'zal va nafis eding.',
    date: 'Bahor nafasi',
    aspect: 0.85,
    placeholderTheme: 'flower'
  },
  {
    id: 8,
    side: 'right',
    bayIndex: 1,
    title: 'Kino Kechasi',
    subtitle: 'ZAL II — XOTIRA #08',
    description: 'Kinoning mazmuni esda qolmagan bo\'lsa ham, yoningda o\'tirganim eng yaxshi syujet edi.',
    date: 'Eng yaxshi film',
    aspect: 1.35,
    placeholderTheme: 'cozy'
  },
  {
    id: 9,
    side: 'right',
    bayIndex: 2,
    title: 'Yulduzli Osmonga Boqib',
    subtitle: 'ZAL II — XOTIRA #09',
    description: 'Oqqan yulduzga bir xil orzu tilagan edik: doim birga bo\'lish.',
    date: 'Yulduzlar guvoh',
    aspect: 1.5,
    placeholderTheme: 'night'
  },
  {
    id: 10,
    side: 'right',
    bayIndex: 3,
    title: 'Tog\' Shamoli & Erkinlik',
    subtitle: 'ZAL II — XOTIRA #10',
    description: 'Tog\'larning musaffo havosi va sening quvnoq kulgung.',
    date: 'Sarguzashtlar',
    aspect: 1.25,
    placeholderTheme: 'sunset'
  },
  {
    id: 11,
    side: 'right',
    bayIndex: 4,
    title: 'Senga Bitilgan She\'r',
    subtitle: 'ZAL II — XOTIRA #11',
    description: 'Qalbimning eng nozik torlarini chertgan muhabbat.',
    date: 'Qalb satrlari',
    aspect: 0.85,
    placeholderTheme: 'portrait'
  },
  {
    id: 12,
    side: 'right',
    bayIndex: 5,
    title: 'Kelajak Orzulari',
    subtitle: 'ZAL II — XOTIRA #12',
    description: 'Oldinda bizni kutayotgan baxtli yillar, unutilmas to\'y va shirin oilaviy hayot.',
    date: 'Abadiy muhabbat ❤️',
    aspect: 1.4,
    placeholderTheme: 'sunset'
  }
];

// Helper to generate artistic canvas textures as placeholders
export function createArtworkCanvas(painting, customDataUrl = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = Math.round(1024 / painting.aspect);
  const ctx = canvas.getContext('2d');

  if (customDataUrl) {
    const img = new Image();
    img.src = customDataUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (painting.texture) painting.texture.needsUpdate = true;
    };
    return canvas;
  }

  // Draw romantic classical painting style placeholder
  const w = canvas.width;
  const h = canvas.height;

  // Background Gradient based on theme
  let grad = ctx.createLinearGradient(0, 0, w, h);
  if (painting.placeholderTheme === 'sunset') {
    grad.addColorStop(0, '#2b101c');
    grad.addColorStop(0.5, '#732938');
    grad.addColorStop(0.8, '#d97746');
    grad.addColorStop(1, '#f7b952');
  } else if (painting.placeholderTheme === 'night') {
    grad.addColorStop(0, '#040814');
    grad.addColorStop(0.5, '#0b1933');
    grad.addColorStop(0.8, '#1e2d4d');
    grad.addColorStop(1, '#3b384d');
  } else if (painting.placeholderTheme === 'portrait') {
    grad.addColorStop(0, '#1c1012');
    grad.addColorStop(0.5, '#401820');
    grad.addColorStop(1, '#2e1418');
  } else if (painting.placeholderTheme === 'flower') {
    grad.addColorStop(0, '#1a181a');
    grad.addColorStop(0.6, '#3a1e28');
    grad.addColorStop(1, '#782e43');
  } else {
    grad.addColorStop(0, '#1f130b');
    grad.addColorStop(0.5, '#472814');
    grad.addColorStop(1, '#693e21');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Soft atmospheric moon / sun / glow orb
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, w * 0.4);
  glow.addColorStop(0, 'rgba(255, 240, 200, 0.4)');
  glow.addColorStop(0.5, 'rgba(255, 180, 120, 0.15)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Elegant classical decorative borders
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, w - 60, h - 60);

  ctx.strokeStyle = 'rgba(250, 225, 125, 0.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(45, 45, w - 90, h - 90);

  // Corner decorative flourishes
  const cornerSize = 40;
  const corners = [
    [50, 50], [w - 50, 50],
    [50, h - 50], [w - 50, h - 50]
  ];
  ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Silhouette / romantic icon in center
  ctx.font = '72px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 230, 160, 0.9)';
  ctx.fillText('🏛️', w * 0.5, h * 0.42);

  // Title text on canvas
  ctx.font = 'bold 36px "Cinzel", serif';
  ctx.fillStyle = '#fae17d';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 15;
  ctx.fillText(painting.title.toUpperCase(), w * 0.5, h * 0.58);

  ctx.font = 'italic 24px "Playfair Display", serif';
  ctx.fillStyle = '#e8d2b0';
  ctx.shadowBlur = 10;
  ctx.fillText(`“ ${painting.date} ”`, w * 0.5, h * 0.66);

  ctx.font = '18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(212, 175, 55, 0.75)';
  ctx.fillText('📷 Rasm yuklash uchun yaqinroq kelib [E] ni bosing', w * 0.5, h * 0.76);

  return canvas;
}

