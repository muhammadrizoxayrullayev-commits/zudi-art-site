// ==========================================================================
// PAINTINGS & ARTWORKS REGISTRY — 7 GRAND THEMATIC CHAMBERS (PALACE LABYRINTH)
// Each room features exactly 2-3 intimate masterworks with museum spotlights & plaques
// ==========================================================================

export const DEFAULT_PAINTINGS = [
  // ========================================================================
  // ROOM I: GRAND VESTIBULE (Kirish Rotundasi — z: [30, 42])
  // ========================================================================
  {
    id: 1,
    roomId: 'room_1',
    roomName: 'I. Kirish Rotundasi (Salon de l\'Amour)',
    title: 'Dengiz Oqshomi & Beg\'ubor Orzu',
    subtitle: 'ZAL I — XAS PORTRET #01',
    description: 'Quyosh botishidagi sokin dengiz sohili, to\'lqinlar shovqini va sochlardagi oq lenta — unutilmas sehrli va romantik nigoh.',
    date: 'Dengiz bo\'yidagi oqshom',
    aspect: 1.0,
    imageSrc: '/images/artworks/artwork_sunset_balcony.jpg',
    wall: 'west',
    position: { x: -5.75, y: 3.5, z: 36.0 },
    rotationY: Math.PI / 2
  },
  {
    id: 2,
    roomId: 'room_1',
    roomName: 'I. Kirish Rotundasi (Salon de l\'Amour)',
    title: 'Nafislik & Betakror Latofat',
    subtitle: 'ZAL I — XAS PORTRET #02',
    description: 'Qora-oq chiziqli nafis libos va beg\'ubor husn. Dunyodagi eng nafis va jozibador tabassum.',
    date: 'Kuzgudagi betakror aks',
    aspect: 1.0,
    imageSrc: '/images/artworks/artwork_chic_portrait.jpg',
    wall: 'east',
    position: { x: 5.75, y: 3.5, z: 36.0 },
    rotationY: -Math.PI / 2
  },

  // ========================================================================
  // ROOM II: EAST WING (Sharqiy Qanot / Atirgullar Zali — x: [12, 22], z: [15, 29])
  // ========================================================================
  {
    id: 3,
    roomId: 'room_2',
    roomName: 'II. Sharqiy Qanot (Atirgullar Zali)',
    title: 'Jilvali Qalbim Oftobi',
    subtitle: 'ZAL II — XAS PORTRET #03',
    description: 'Har bir jilvasi va to\'lqin jingalak sochlari qalbimni shodlikka to\'ldiradigan sevimli va samimiy chehra.',
    date: 'Har lahza quvonch va mehr',
    aspect: 1.0,
    imageSrc: '/images/artworks/artwork_curly_selfie.jpg',
    wall: 'south',
    position: { x: 17.0, y: 3.5, z: 28.75 },
    rotationY: Math.PI
  },
  {
    id: 4,
    roomId: 'room_2',
    roomName: 'II. Sharqiy Qanot (Atirgullar Zali)',
    title: 'Tog\' Cho\'qqisi & Oltin Quyosh',
    subtitle: 'ZAL II — XAS PORTRET #04',
    description: 'Yuksak tog\'lar uzra botayotgan moviy dengiz va oltin quyosh jilosi ostida erkinlik nafasi.',
    date: 'Oltin ufq va erkin parvoz',
    aspect: 0.56,
    imageSrc: '/images/artworks/artwork_mountain_sunset.jpg',
    wall: 'east',
    position: { x: 21.75, y: 3.5, z: 22.0 },
    rotationY: -Math.PI / 2
  },

  // ========================================================================
  // ROOM III: CENTRAL ANGEL ROTUNDA (Markaziy Rotunda — x: [-6, 6], z: [0, 16])
  // ========================================================================
  {
    id: 5,
    roomId: 'room_3',
    roomName: 'III. Markaziy Farishta Rotundasi (Rotonde de l\'Ange)',
    title: 'Moviy Havza & Shamol Tegirmonlari',
    subtitle: 'ZAL III — XAS PORTRET #05',
    description: 'Yozning quyoshli kunida musaffo moviy suvlar va yam-yashil tog\'lar uzra esgan iliq shaboda.',
    date: 'Moviy ufqlar aro',
    aspect: 0.56,
    imageSrc: '/images/artworks/artwork_pool_lagoon.jpg',
    wall: 'north',
    position: { x: 0.0, y: 3.5, z: 0.25 },
    rotationY: 0
  },
  {
    id: 6,
    roomId: 'room_3',
    roomName: 'III. Markaziy Farishta Rotundasi (Rotonde de l\'Ange)',
    title: 'Oq Libos & Palma Soyalari',
    subtitle: 'ZAL III — XAS PORTRET #06',
    description: 'Palma daraxtlari aks etgan ko\'zguda oppoq nafis libosdagi maftunkor va jozibador siymo.',
    date: 'Quyoshli damlar',
    aspect: 0.56,
    imageSrc: '/images/artworks/artwork_white_dress.jpg',
    wall: 'south',
    position: { x: 0.0, y: 3.5, z: 15.75 },
    rotationY: Math.PI
  },

  // ========================================================================
  // ROOM IV: WEST WING (G'arbiy Qanot / Tog'lar Manzarasi — x: [-22, -12], z: [1, 15])
  // ========================================================================
  {
    id: 7,
    roomId: 'room_4',
    roomName: 'IV. G\'arbiy Qanot (Tog\'lar Zali)',
    title: 'Yashil Vodiylar & Moviy Ko\'rfaz',
    subtitle: 'ZAL IV — XAS PORTRET #07',
    description: 'Qarag\'ayzor tog\'lar cho\'qqisidagi ko\'rkam manzaralar, quyosh ko\'zoynagi va betakror erkinlik hissi.',
    date: 'Tog\'lar bag\'rida',
    aspect: 0.56,
    imageSrc: '/images/artworks/artwork_mountain_overlook.jpg',
    wall: 'west',
    position: { x: -21.75, y: 3.5, z: 8.0 },
    rotationY: Math.PI / 2
  },
  {
    id: 8,
    roomId: 'room_4',
    roomName: 'IV. G\'arbiy Qanot (Tog\'lar Zali)',
    title: 'Sokin Maskanda Beg\'ubor Tabassum',
    subtitle: 'ZAL IV — XAS PORTRET #08',
    description: 'Sokin va shinam maskanda oq libosdagi zamonaviy, latofatli va beg\'ubor tabassum.',
    date: 'Yo\'l xotiralari',
    aspect: 0.56,
    imageSrc: '/images/artworks/artwork_lounge_portrait.jpg',
    wall: 'south',
    position: { x: -17.0, y: 3.5, z: 14.75 },
    rotationY: Math.PI
  },

  // ========================================================================
  // ROOM V: BOSPHORUS MARBLE PALACE (Bosfor Marmar Qasri — x: [-6, 6], z: [-18, -6])
  // ========================================================================
  {
    id: 9,
    roomId: 'room_5',
    roomName: 'V. Bosfor Marmar Qasri (Palais du Bosphore)',
    title: 'Marmar Darvoza & Bosfor To\'lqinlari',
    subtitle: 'ZAL V — XAS PORTRET #09',
    description: 'Qadimiy o\'ymakor marmar saroy darvozasi yonida, dengiz to\'lqinlari va mayin shamol jilvasi.',
    date: 'Tarixiy dengiz bo\'yi',
    aspect: 0.91,
    imageSrc: '/images/artworks/artwork_bosphorus_gate.jpg',
    wall: 'south',
    position: { x: 0.0, y: 3.5, z: -6.25 },
    rotationY: Math.PI
  },
  {
    id: 10,
    roomId: 'room_5',
    roomName: 'V. Bosfor Marmar Qasri (Palais du Bosphore)',
    title: 'Kema Bandargohi & Mayin Tabassum',
    subtitle: 'ZAL V — XAS PORTRET #10',
    description: 'Oq yelkanli kemalar fonida porlagan eng samimiy, jozibador va beg\'ubor tabassum.',
    date: 'Dengiz sohili',
    aspect: 0.56,
    imageSrc: '/images/artworks/artwork_seaside_yachts.jpg',
    wall: 'east',
    position: { x: 5.75, y: 3.5, z: -12.0 },
    rotationY: -Math.PI / 2
  },

  // ========================================================================
  // ROOM VI: GOLDEN SUNSET GALLERY (Oltin Shafaq Qasri — x: [-6, 6], z: [-36, -20])
  // ========================================================================
  {
    id: 11,
    roomId: 'room_6',
    roomName: 'VI. Oltin Shafaq Galereyasi (Galerie du Crépuscule)',
    title: 'Oltin Shafaq & Sokin Ko\'rfaz',
    subtitle: 'ZAL VI — XAS PORTRET #11',
    description: 'Ufqda botayotgan oltin quyosh nurlari, sokin ko\'rfaz va dengizdagi oppoq yaxtalar.',
    date: 'Oltin oqshom siri',
    aspect: 1.33,
    imageSrc: '/images/artworks/artwork_golden_sunset_bay.jpg',
    wall: 'west',
    position: { x: -5.75, y: 3.5, z: -28.0 },
    rotationY: Math.PI / 2
  },
  {
    id: 12,
    roomId: 'room_6',
    roomName: 'VI. Oltin Shafaq Galereyasi (Galerie du Crépuscule)',
    title: 'Kuch, Nafislik & Qat\'iyat',
    subtitle: 'ZAL VI — XAS PORTRET #12',
    description: 'Sportcha shijoat, kuchli iroda va qat\'iyat bilan birga mujassam bo\'lgan tengsiz go\'zallik.',
    date: 'G\'alaba va shijoat ❤️',
    aspect: 0.80,
    imageSrc: '/images/artworks/artwork_kimono_strength.jpg',
    wall: 'east',
    position: { x: 5.75, y: 3.5, z: -28.0 },
    rotationY: -Math.PI / 2
  },

  // ========================================================================
  // ROOM VII: SANCTUARY OF ETERNAL LOVE (Monumental Sanctuary — x: [-7, 7], z: [-57, -39])
  // ========================================================================
  {
    id: 13,
    roomId: 'room_7',
    roomName: 'VII. Abadiy Muhabbat Mehrobi (Sanctuaire Éternel)',
    title: 'Kechki Shafaq & Sokin Xayollar',
    subtitle: 'ZAL VII — MONUMENTAL SHOH ASAR #01',
    description: 'Quyosh botishidagi sehrli qizil-oltin ufq, deraza panjarasi ortidagi sokinlik va mayin mushukcha silueti. Qalbga huzur va orom bag\'ishlovchi oqshom siri.',
    date: 'Oltin shafaq mo\'jizasi',
    aspect: 0.75,
    imageSrc: '/images/artworks/monumental_sunset_cat.jpg',
    isMonumental: true,
    wall: 'north',
    position: { x: 0.0, y: 3.6, z: -56.7 },
    rotationY: 0
  },
  {
    id: 14,
    roomId: 'room_7',
    roomName: 'VII. Abadiy Muhabbat Mehrobi (Sanctuaire Éternel)',
    title: 'Muhabbat Gullari & Dengizdagi Malika',
    subtitle: 'ZAL VII — MONUMENTAL SHOH ASAR #02',
    description: 'Dengiz sohilidagi qizil ufqqa boqayotgan go\'zal qiz surati va uning qarshisidagi muattar, yorqin va nafis bahoriy gullar guldastasi.',
    date: 'Mangu ifor va cheksiz mehr',
    aspect: 0.75,
    imageSrc: '/images/artworks/monumental_flowers_sunset.jpg',
    isMonumental: true,
    wall: 'altar',
    position: { x: 0.0, y: 3.6, z: -39.3 },
    rotationY: Math.PI
  }
];

export const MONUMENTAL_PAINTINGS = DEFAULT_PAINTINGS.filter(p => p.isMonumental);

// Helper to generate artistic canvas textures as placeholders or high-res photo frames
export function createArtworkCanvas(painting, customDataUrl = null) {
  const canvas = document.createElement('canvas');
  // High-resolution 2K/4K canvas for ultra-crisp display
  const baseSize = 2048;
  let canvasW, canvasH;
  if (painting.aspect >= 1.0) {
    canvasW = baseSize;
    canvasH = Math.round(baseSize / painting.aspect);
  } else {
    canvasH = baseSize;
    canvasW = Math.round(baseSize * painting.aspect);
  }
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  const imgSrc = customDataUrl || painting.imageSrc;

  if (imgSrc) {
    // Draw real photo in crystal-clear definition
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;

    const draw = () => {
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

    img.onload = draw;
    if (img.complete && img.naturalWidth !== 0) {
      setTimeout(draw, 15);
    }

    // Draw initial placeholder while image loads
    ctx.fillStyle = '#14080c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  // Fallback
  ctx.fillStyle = '#180a10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    title: 'Afrodita (Muhabbat va Husn Ma\'budasi)',
    subtitle: 'SHARQIY QANOT — ATIRGULLAR ZALI',
    description: 'Dengiz ko\'pigidan bino bo\'lgan go\'zallik, samimiylik va nazokat timsoli. Boshidagi oltin dafna gulchambari mangu yoshlik va cheksiz ehtirom ramzidir.',
    date: 'Antik Nafosat',
    aspect: 0.8,
    type: 'statue',
    emoji: '👑'
  },
  {
    id: 'statue_apollo',
    title: 'Apollon (Quyosh va San\'at Himoyachisi)',
    subtitle: 'G\'ARBIY QANOT — TOG\'LAR ZALI',
    description: 'Ilhom, yorug\'lik va nafis san\'at homiysi. Qadimiy saroy zallarida mardlik, yorqinlik va qat\'iyat ifodasi sifatida o\'rnatilgan.',
    date: 'Klassik Haykaltaroshlik',
    aspect: 0.8,
    type: 'statue',
    emoji: '☀️'
  },
  {
    id: 'statue_hermes',
    title: 'Hermes (Yurak Rozlari Kuryeri)',
    subtitle: 'BOSFOR QASRI — OQSHOM BOG\'I',
    description: 'Oshiqlar o\'rtasidagi samimiy maktublar va shirin suhbatlar homiysi.',
    date: 'Oltin Qanotlar',
    aspect: 0.8,
    type: 'statue',
    emoji: '📜'
  }
];

export function createStatueCanvas(statue) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0a0507');
  grad.addColorStop(0.5, '#1e0d14');
  grad.addColorStop(1, '#080305');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(512, 480, 20, 512, 480, 400);
  glow.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
  glow.addColorStop(0.6, 'rgba(212, 175, 55, 0.08)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
  ctx.lineWidth = 14;
  ctx.strokeRect(40, 40, 944, 1200);

  ctx.strokeStyle = 'rgba(250, 225, 125, 0.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(65, 65, 894, 1150);

  ctx.font = '160px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(statue.emoji || '🏛️', 512, 460);

  ctx.font = 'bold 46px "Cinzel", serif';
  ctx.fillStyle = '#fae17d';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 20;
  ctx.fillText(statue.title.toUpperCase(), 512, 720);

  ctx.font = 'italic 30px "Playfair Display", serif';
  ctx.fillStyle = '#e8d2b0';
  ctx.fillText(`“ ${statue.date} ”`, 512, 800);

  return canvas;
}
