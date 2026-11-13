// ==========================================================================
// PAINTINGS & ARTWORKS REGISTRY
// Supports persistent photo uploads, placeholder generator & modal details
// ==========================================================================

export const DEFAULT_PAINTINGS = [
  // ========================================================================
  // ROOM I: SALON DE L'AMOUR (Entrance Grand Gallery — The 4 Personal Portraits)
  // ========================================================================
  {
    id: 1,
    side: 'left',
    bayIndex: 5, // z = 30 (Immediate left upon entry)
    title: 'Dengiz Oqshomi & Beg\'ubor Orzu',
    subtitle: 'ZAL I — XAS PORTRET #01',
    description: 'Quyosh botishidagi sokin dengiz sohili, to\'lqinlar shovqini va sochlardagi oq lenta — unutilmas sehrli va romantik nigoh.',
    date: 'Dengiz bo\'yidagi oqshom',
    aspect: 1.0,
    imageSrc: '/images/artworks/artwork_sunset_balcony.jpg'
  },
  {
    id: 7,
    side: 'right',
    bayIndex: 5, // z = 30 (Immediate right upon entry)
    title: 'Nafislik & Betakror Latofat',
    subtitle: 'ZAL I — XAS PORTRET #02',
    description: 'Qora-oq chiziqli nafis libos va beg\'ubor husn. Dunyodagi eng nafis va jozibador tabassum.',
    date: 'Kuzgudagi betakror aks',
    aspect: 1.0,
    imageSrc: '/images/artworks/artwork_chic_portrait.jpg'
  },
  {
    id: 2,
    side: 'left',
    bayIndex: 4, // z = 18
    title: 'Jilvali Qalbim Oftobi',
    subtitle: 'ZAL I — XAS PORTRET #03',
    description: 'Har bir jilvasi va to\'lqin jingalak sochlari qalbimni shodlikka to\'ldiradigan sevimli va samimiy chehra.',
    date: 'Har lahza quvonch va mehr',
    aspect: 1.0,
    imageSrc: '/images/artworks/artwork_curly_selfie.jpg'
  },
  {
    id: 8,
    side: 'right',
    bayIndex: 4, // z = 18
    title: 'Tog\' Cho\'qqisi & Oltin Quyosh',
    subtitle: 'ZAL I — XAS PORTRET #04',
    description: 'Yuksak tog\'lar uzra botayotgan moviy dengiz va oltin quyosh jilosi ostida erkinlik nafasi.',
    date: 'Oltin ufq va erkin parvoz',
    aspect: 0.56,
    imageSrc: '/images/artworks/artwork_mountain_sunset.jpg'
  },

  // ========================================================================
  // ROOM II: GALERIE ROYALE (Central Grand Hall)
  // ========================================================================
  {
    id: 3,
    side: 'left',
    bayIndex: 3, // z = 6
    title: 'Arno Daryosi & Yulduzli Tun',
    subtitle: 'ZAL II — SHOH ASAR #01',
    description: 'Qadimiy Florensiya uzra moviy yulduzlar charog\'onligi va sokin oqayotgan daryo siri.',
    date: 'Tungi shahar chiroqlari',
    aspect: 1.33,
    placeholderTheme: 'night'
  },
  {
    id: 9,
    side: 'right',
    bayIndex: 3, // z = 6
    title: 'Oy Nuri & Moviy Ko\'l',
    subtitle: 'ZAL II — SHOH ASAR #02',
    description: 'Alp tog\'larining moviy ko\'zgusida aks etgan kumushrang to\'lin oy va sokin qarag\'aylar.',
    date: 'Kumush tunda sukunat',
    aspect: 1.33,
    placeholderTheme: 'moonlight'
  },
  {
    id: 4,
    side: 'left',
    bayIndex: 2, // z = -6
    title: 'Venetsiya Gondolasi & Qizil Ufq',
    subtitle: 'ZAL II — SHOH ASAR #03',
    description: 'Qizil shafaq nurlari ostida suzib borayotgan gondola va qadimiy saroylar aks etgan suv sathi.',
    date: 'Orzular kanali',
    aspect: 1.33,
    placeholderTheme: 'sunset'
  },
  {
    id: 10,
    side: 'right',
    bayIndex: 2, // z = -6
    title: 'Provans Lavanda Dalalari',
    subtitle: 'ZAL II — SHOH ASAR #04',
    description: 'Ufqqa qadar cho\'zilgan binafsharang lavanda dalalari va botayotgan quyoshning iliq nurlari.',
    date: 'Fransuz yozining nafasi',
    aspect: 1.25,
    placeholderTheme: 'lavender'
  },

  // ========================================================================
  // ROOM III: LE TEMPLE ÉTERNEL (Far End Sanctuary)
  // ========================================================================
  {
    id: 5,
    side: 'left',
    bayIndex: 1, // z = -18
    title: 'Qirollik Atirgullari Bog\'i',
    subtitle: 'ZAL III — SHOH ASAR #05',
    description: 'Marmar favvoralar atrofidagi qizil va oq atirgullar muattar hidi, bahorning mangu tarovati.',
    date: 'Bahoriy nafosat',
    aspect: 1.0,
    placeholderTheme: 'flower'
  },
  {
    id: 11,
    side: 'right',
    bayIndex: 1, // z = -18
    title: 'Sham Yorig\'idagi Sokin Vals',
    subtitle: 'ZAL III — SHOH ASAR #06',
    description: 'Zarhallangan qandillar nuri ostida yangragan mayin skripka kuylari va shohona saroy kechasi.',
    date: 'Klassik ohanglar',
    aspect: 1.0,
    placeholderTheme: 'opera'
  },
  {
    id: 6,
    side: 'left',
    bayIndex: 0, // z = -30
    title: 'Kuzgi Xiyobon & Oltin Barglar',
    subtitle: 'ZAL III — SHOH ASAR #07',
    description: 'Yomg\'irdan so\'nggi yaltiroq tosh yo\'laklar va oltin chinor yaproqlari shiviri.',
    date: 'Oltin fasl xotirasi',
    aspect: 1.33,
    placeholderTheme: 'autumn'
  },
  {
    id: 12,
    side: 'right',
    bayIndex: 0, // z = -30
    title: 'Abadiy Muhabbat Saroyi',
    subtitle: 'ZAL III — SHOH ASAR #08',
    description: 'Oldinda bizni kutayotgan baxtli yillar, unutilmas to\'y va shirin oilaviy hayot orzulari.',
    date: 'Abadiy muhabbat ❤️',
    aspect: 1.33,
    placeholderTheme: 'palace'
  }
];

// Helper to generate artistic canvas textures as placeholders
export function createArtworkCanvas(painting, customDataUrl = null) {
  const canvas = document.createElement('canvas');
  // High-resolution 2K canvas for crisp display
  const baseSize = 2048;
  canvas.width = baseSize;
  canvas.height = Math.round(baseSize / painting.aspect);
  const ctx = canvas.getContext('2d');

  const imgSrc = customDataUrl || painting.imageSrc;

  if (imgSrc) {
    // Draw real photo in crystal-clear definition
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;
    img.onload = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Background matte
      ctx.fillStyle = '#0a0507';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fit with aspect preservation (cover mode to fill frame completely)
      const imgAspect = img.width / img.height;
      const canvasAspect = canvas.width / canvas.height;
      let sWidth = img.width;
      let sHeight = img.height;
      let sx = 0;
      let sy = 0;

      if (imgAspect > canvasAspect) {
        sWidth = img.height * canvasAspect;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / canvasAspect;
        sy = (img.height - sHeight) / 2;
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

      // Fine golden museum bevel border around canvas edge
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      // Update Three.js texture
      if (painting.texture) {
        painting.texture.needsUpdate = true;
      }
    };

    // Draw initial placeholder while image loads
    ctx.fillStyle = '#14080c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  // Procedural Masterpiece for non-photo frames (Unique themes, no duplicates!)
  const w = canvas.width;
  const h = canvas.height;

  // Background Gradient based on unique theme
  let grad = ctx.createLinearGradient(0, 0, w, h);
  if (painting.placeholderTheme === 'night') {
    grad.addColorStop(0, '#030814');
    grad.addColorStop(0.5, '#0c1b33');
    grad.addColorStop(1, '#1e293b');
  } else if (painting.placeholderTheme === 'sunset') {
    grad.addColorStop(0, '#2d0f1e');
    grad.addColorStop(0.5, '#782333');
    grad.addColorStop(0.8, '#d96c34');
    grad.addColorStop(1, '#f6ad49');
  } else if (painting.placeholderTheme === 'flower') {
    grad.addColorStop(0, '#101a14');
    grad.addColorStop(0.5, '#22422e');
    grad.addColorStop(0.8, '#592e3d');
    grad.addColorStop(1, '#8f3b52');
  } else if (painting.placeholderTheme === 'autumn') {
    grad.addColorStop(0, '#1f1008');
    grad.addColorStop(0.5, '#5c2c12');
    grad.addColorStop(0.8, '#a6551b');
    grad.addColorStop(1, '#dca038');
  } else if (painting.placeholderTheme === 'moonlight') {
    grad.addColorStop(0, '#050a17');
    grad.addColorStop(0.5, '#122542');
    grad.addColorStop(1, '#2c476b');
  } else if (painting.placeholderTheme === 'lavender') {
    grad.addColorStop(0, '#180f24');
    grad.addColorStop(0.5, '#3b2559');
    grad.addColorStop(0.8, '#69488a');
    grad.addColorStop(1, '#b08fd6');
  } else if (painting.placeholderTheme === 'opera') {
    grad.addColorStop(0, '#1a0808');
    grad.addColorStop(0.5, '#401518');
    grad.addColorStop(0.8, '#6d281f');
    grad.addColorStop(1, '#9b4a2d');
  } else {
    // palace
    grad.addColorStop(0, '#181109');
    grad.addColorStop(0.5, '#3b2a14');
    grad.addColorStop(0.8, '#705322');
    grad.addColorStop(1, '#b08d3b');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Soft atmospheric moon / sun / glow orb
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 20, w * 0.5, h * 0.42, w * 0.38);
  glow.addColorStop(0, 'rgba(255, 240, 200, 0.45)');
  glow.addColorStop(0.5, 'rgba(255, 180, 120, 0.15)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Elegant classical decorative borders
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
  ctx.lineWidth = 20;
  ctx.strokeRect(50, 50, w - 100, h - 100);

  ctx.strokeStyle = 'rgba(250, 225, 125, 0.35)';
  ctx.lineWidth = 6;
  ctx.strokeRect(80, 80, w - 160, h - 160);

  // Corner decorative flourishes
  const corners = [
    [90, 90], [w - 90, 90],
    [90, h - 90], [w - 90, h - 90]
  ];
  ctx.fillStyle = 'rgba(212, 175, 55, 0.85)';
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // Unique theme icon
  const themeIcons = {
    night: '✨',
    sunset: '🌅',
    flower: '🌹',
    autumn: '🍁',
    moonlight: '🌙',
    lavender: '🪻',
    opera: '🎻',
    palace: '👑'
  };
  const icon = themeIcons[painting.placeholderTheme] || '🏛️';

  ctx.font = '110px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 230, 160, 0.95)';
  ctx.fillText(icon, w * 0.5, h * 0.4);

  // Title text on canvas
  ctx.font = 'bold 58px "Cinzel", serif';
  ctx.fillStyle = '#fae17d';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 24;
  ctx.fillText(painting.title.toUpperCase(), w * 0.5, h * 0.57);

  ctx.font = 'italic 38px "Playfair Display", serif';
  ctx.fillStyle = '#e8d2b0';
  ctx.shadowBlur = 16;
  ctx.fillText(`“ ${painting.date} ”`, w * 0.5, h * 0.65);

  ctx.font = '28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(212, 175, 55, 0.85)';
  ctx.fillText('📷 O\'z rasmingizni yuklash uchun [E] ni bosing', w * 0.5, h * 0.75);

  return canvas;
}

// ==========================================================================
// CLASSICAL MARBLE SCULPTURES & BUSTS REGISTRY
// ==========================================================================
export const DEFAULT_STATUES = [
  {
    id: 'statue_angel',
    title: 'Abadiy Muhabbat Farishtasi (Cupid & Psyche)',
    subtitle: 'MARKAZIY ROTUNDA — SHOH ASAR',
    description: 'Qadimgi mumtoz san\'atdagi eng mashhur sevgi timsoli — Eros va Psixeyaning o\'zaro samimiy muhabbati. Oq Karrara marmaridan ishlangan ushbu qanotli haykal muhabbat har qanday masofa va to\'siqni yengib o\'tishining ramzidir.',
    date: 'Mumtoz Marmar San\'ati',
    aspect: 0.8,
    type: 'statue',
    emoji: '🕊️'
  },
  {
    id: 'statue_aphrodite',
    title: 'Afrodita (Venera) Byusti',
    subtitle: 'I-ZAL — GO\'ZALLIK MA\'BUDASI',
    description: 'Nafosat, go\'zallik va abadiy yoshlik timsoli bo\'lgan yunon ma\'budasi Afroditaning marmar siymosi.',
    date: 'Ellin Davri',
    aspect: 0.8,
    type: 'statue',
    emoji: '👑'
  },
  {
    id: 'statue_apollo',
    title: 'Apollon Byusti',
    subtitle: 'I-ZAL — ILHOM VA NUR HOMIYSI',
    description: 'She\'riyat, san\'at, quyosh nuri va ilhom ramzi bo\'lgan olijanob Apollon siymosi.',
    date: 'Klassik Davr',
    aspect: 0.8,
    type: 'statue',
    emoji: '☀️'
  },
  {
    id: 'statue_psyche',
    title: 'Psixeya Byusti',
    subtitle: 'II-ZAL — POKIZA QALB TIMSOLI',
    description: 'Inson qalbining go\'zalligi, pok niyati va samimiy sevgisining nozik ifodasi.',
    date: 'Rim San\'ati',
    aspect: 0.8,
    type: 'statue',
    emoji: '💖'
  },
  {
    id: 'statue_eros',
    title: 'Eros (Kupid) Byusti',
    subtitle: 'II-ZAL — YURAKLARNI BIRLASHTIRUVCHI',
    description: 'Yuraklarni bir-biriga bog\'lovchi, mehr va muhabbat chaqnatuvchi ilohiy tuyg\'ular posboni.',
    date: 'Rim San\'ati',
    aspect: 0.8,
    type: 'statue',
    emoji: '🏹'
  }
];

export function createStatueCanvas(statue) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Dark obsidian marble background gradient
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 50, w * 0.5, h * 0.5, w * 0.65);
  grad.addColorStop(0, '#2b1c20');
  grad.addColorStop(0.5, '#15080b');
  grad.addColorStop(1, '#080204');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Gilded decorative baroque border
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
  ctx.lineWidth = 12;
  ctx.strokeRect(25, 25, w - 50, h - 50);

  ctx.strokeStyle = 'rgba(250, 225, 125, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 38, w - 76, h - 76);

  // Statue Icon / Glow
  ctx.font = '96px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(statue.emoji || '🏛️', w * 0.5, h * 0.38);

  // Typography
  ctx.font = 'bold 32px "Cinzel", serif';
  ctx.fillStyle = '#fae17d';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 12;
  ctx.fillText(statue.title.toUpperCase(), w * 0.5, h * 0.58);

  ctx.font = 'italic 22px "Playfair Display", serif';
  ctx.fillStyle = '#e8d2b0';
  ctx.fillText(`“ ${statue.date} ”`, w * 0.5, h * 0.66);

  ctx.font = '18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
  ctx.fillText('🏛️ Oq Karrara marmaridan ishlangan asl san\'at durdonasi', w * 0.5, h * 0.78);

  return canvas;
}

