// ==========================================================================
// REALISTIC & STYLISH 3D AVATAR CHARACTER BUILDER
// Crafted with high-fashion aesthetics matching real photos (Girl with curly hair & bow, Boy in dapper suit)
// ==========================================================================

const textureLoader = new THREE.TextureLoader();

// Preload textures
const textures = {
  faceGirl: textureLoader.load('/images/avatars/face_girl.png'),
  faceBoy: textureLoader.load('/images/avatars/face_boy.png'),
  stripedTop: textureLoader.load('/images/avatars/striped_top.png'),
  suitFabric: textureLoader.load('/images/avatars/suit_fabric.png')
};

// Configure texture filtering for crispness
Object.values(textures).forEach(tex => {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
});

export function createAvatarModel(role = 'boy') {
  const group = new THREE.Group();
  const isGirl = role === 'girl';

  // Skin Materials
  const skinColor = isGirl ? 0xffdfce : 0xffd9c4;
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.55,
    metalness: 0.02
  });

  const hairColor = isGirl ? 0x180d0a : 0x120a08;
  const hairMat = new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.85,
    metalness: 0.05
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.85
  });

  // Limbs registry for walking & idle animation
  const limbs = {
    leftLeg: null,
    rightLeg: null,
    leftArm: null,
    rightArm: null,
    head: null,
    torso: null,
    shadow: null
  };

  // 1. Soft Circular Ground Ambient Shadow
  const shadowGeo = new THREE.CircleGeometry(0.38, 24);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  const sGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
  sGrad.addColorStop(0, 'rgba(0,0,0,0.45)');
  sGrad.addColorStop(0.6, 'rgba(0,0,0,0.18)');
  sGrad.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02;
  group.add(shadowMesh);
  limbs.shadow = shadowMesh;

  if (isGirl) {
    // ========================================================================
    // GIRL AVATAR: STYLISH CURLY HAIR, WHITE LACE BOW, STRIPED TOP & CHIC PANTS
    // ========================================================================

    // A. Torso & Outfit (Striped knit halter top + high-waist belt)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.92;

    const topMat = new THREE.MeshStandardMaterial({
      map: textures.stripedTop,
      roughness: 0.65,
      metalness: 0.05
    });
    textures.stripedTop.wrapS = THREE.RepeatWrapping;
    textures.stripedTop.wrapT = THREE.RepeatWrapping;
    textures.stripedTop.repeat.set(1, 2);

    // Fitted slender waist & bodice
    const chestGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.38, 16);
    const chestMesh = new THREE.Mesh(chestGeo, topMat);
    chestMesh.scale.set(1.15, 1.0, 0.8);
    chestMesh.position.y = 0.18;
    torsoGroup.add(chestMesh);

    // Bare feminine shoulders / neck base
    const shoulderGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.12, 16);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, skinMat);
    shoulderMesh.scale.set(1.2, 1.0, 0.75);
    shoulderMesh.position.y = 0.38;
    torsoGroup.add(shoulderMesh);

    // Chic cinched waist belt
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.155, 0.16, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0x1f1416, roughness: 0.4 })
    );
    belt.scale.set(1.15, 1.0, 0.82);
    belt.position.y = -0.01;
    torsoGroup.add(belt);

    // Gold belt buckle
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.03), goldMat);
    buckle.position.set(0, -0.01, 0.13);
    torsoGroup.add(buckle);

    // Upper hip flare (High-waisted white linen trousers base)
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0xf7f5ee, roughness: 0.65 });
    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.18, 16), pantsMat);
    pelvis.scale.set(1.18, 1.0, 0.85);
    pelvis.position.y = -0.11;
    torsoGroup.add(pelvis);

    group.add(torsoGroup);
    limbs.torso = torsoGroup;

    // B. Slender Neck & Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.18, 12), skinMat);
    neck.position.y = 1.38;
    group.add(neck);

    // Delicate gold chain necklace with heart pendant
    const necklace = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.008, 6, 16), goldMat);
    necklace.rotation.x = Math.PI / 2.3;
    necklace.position.y = 1.35;
    group.add(necklace);

    const heartPendant = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), goldMat);
    heartPendant.position.set(0, 1.32, 0.075);
    group.add(heartPendant);

    // Head with expressive face texture
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.52;

    const faceMat = new THREE.MeshStandardMaterial({
      map: textures.faceGirl,
      roughness: 0.55
    });

    const headGeo = new THREE.SphereGeometry(0.17, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, faceMat);
    headMesh.rotation.y = -Math.PI / 2; // Orient eyes to look forward
    headGroup.add(headMesh);

    // C. Voluminous Curly Brunette Hair (Matching real photos)
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.185, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.5),
      hairMat
    );
    hairCrown.position.set(0, 0.04, -0.02);
    headGroup.add(hairCrown);

    // Cascading side curls falling over shoulders
    const curlMat = hairMat;
    [-1, 1].forEach(side => {
      // Forehead fringe curl
      const bang = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), curlMat);
      bang.scale.set(1.4, 0.8, 1.0);
      bang.position.set(side * 0.11, 0.1, 0.12);
      headGroup.add(bang);

      // Long curly lock down shoulder
      const lock1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.38, 8), curlMat);
      lock1.position.set(side * 0.16, -0.15, 0.06);
      lock1.rotation.z = side * -0.15;
      headGroup.add(lock1);

      const lock2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), curlMat);
      lock2.position.set(side * 0.17, -0.32, 0.05);
      headGroup.add(lock2);

      // Cute gold hoop earring
      const earring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 6, 12), goldMat);
      earring.position.set(side * 0.175, 0.01, 0.01);
      earring.rotation.y = Math.PI / 2;
      headGroup.add(earring);
    });

    // Back lush curls
    const backCurls = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.42, 10), curlMat);
    backCurls.position.set(0, -0.16, -0.12);
    headGroup.add(backCurls);

    // D. White Lace Hair Bow in Back (Exactly matching photo media_1794596966488_663e1946.jpg)
    const bowGroup = new THREE.Group();
    bowGroup.position.set(0, 0.06, -0.18);

    const bowMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      side: THREE.DoubleSide
    });

    // Bow knot center
    const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), bowMat);
    bowGroup.add(bowKnot);

    // Left & Right lace loops
    [-1, 1].forEach(bSide => {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.02, 6, 12), bowMat);
      loop.rotation.y = Math.PI / 2;
      loop.rotation.z = bSide * 0.4;
      loop.position.set(bSide * 0.05, 0.02, 0);
      bowGroup.add(loop);

      // Ribbon tail
      const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.18), bowMat);
      tail.position.set(bSide * 0.04, -0.1, 0.01);
      tail.rotation.z = bSide * 0.25;
      bowGroup.add(tail);
    });

    headGroup.add(bowGroup);

    group.add(headGroup);
    limbs.head = headGroup;

    // E. Legs (Chic Flowing White Linen Trousers & Black Block Heels)
    const legGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.72, 12);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.35 });

    // Left Leg
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.14, 0.74, 0);
    const lLegMesh = new THREE.Mesh(legGeo, pantsMat);
    lLegMesh.position.y = -0.36;
    leftLegGroup.add(lLegMesh);

    // Chic block heel
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.07, 0.14), shoeMat);
    lShoe.position.set(0, -0.71, 0.03);
    leftLegGroup.add(lShoe);
    group.add(leftLegGroup);
    limbs.leftLeg = leftLegGroup;

    // Right Leg
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.14, 0.74, 0);
    const rLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rLegMesh.position.y = -0.36;
    rightLegGroup.add(rLegMesh);

    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.07, 0.14), shoeMat);
    rShoe.position.set(0, -0.71, 0.03);
    rightLegGroup.add(rShoe);
    group.add(rightLegGroup);
    limbs.rightLeg = rightLegGroup;

    // F. Arms (Slender Feminine Arms in Natural Skin Tone)
    const armGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.62, 10);

    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.25, 1.25, 0);
    const lArmMesh = new THREE.Mesh(armGeo, skinMat);
    lArmMesh.position.y = -0.31;
    leftArmGroup.add(lArmMesh);

    // Delicate gold bracelet on wrist
    const lBangle = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.006, 6, 12), goldMat);
    lBangle.rotation.x = Math.PI / 2;
    lBangle.position.y = -0.54;
    leftArmGroup.add(lBangle);

    group.add(leftArmGroup);
    limbs.leftArm = leftArmGroup;

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.25, 1.25, 0);
    const rArmMesh = new THREE.Mesh(armGeo, skinMat);
    rArmMesh.position.y = -0.31;
    rightArmGroup.add(rArmMesh);
    group.add(rightArmGroup);
    limbs.rightArm = rightArmGroup;

  } else {
    // ========================================================================
    // BOY AVATAR: HANDSOME DAPPER GENTLEMAN IN MIDNIGHT SUIT & OXFORD SHOES
    // ========================================================================

    const suitMat = new THREE.MeshStandardMaterial({
      map: textures.suitFabric,
      roughness: 0.55,
      metalness: 0.1
    });

    const satinLapelMat = new THREE.MeshStandardMaterial({
      color: 0x090f18,
      roughness: 0.25,
      metalness: 0.35
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xfcfcfc,
      roughness: 0.4
    });

    const tieMat = new THREE.MeshStandardMaterial({
      color: 0x821c26, // Wine burgundy silk tie
      roughness: 0.35
    });

    // A. Torso & Tailored Suit Jacket
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.95;

    // Upper jacket (V-taper athletic cut)
    const jacketGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.52, 16);
    const jacketMesh = new THREE.Mesh(jacketGeo, suitMat);
    jacketMesh.scale.set(1.22, 1.0, 0.75);
    jacketMesh.position.y = 0.22;
    torsoGroup.add(jacketMesh);

    // White shirt triangle V-neck
    const shirtV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.04), shirtMat);
    shirtV.position.set(0, 0.28, 0.13);
    torsoGroup.add(shirtV);

    // Satin lapels on both sides
    [-1, 1].forEach(lSide => {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.03), satinLapelMat);
      lapel.position.set(lSide * 0.1, 0.26, 0.145);
      lapel.rotation.z = lSide * -0.22;
      torsoGroup.add(lapel);
    });

    // Burgundy silk necktie
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.28, 0.02), tieMat);
    tie.position.set(0, 0.24, 0.155);
    torsoGroup.add(tie);

    // Gold tie clip
    const tieClip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.015), goldMat);
    tieClip.position.set(0, 0.26, 0.17);
    torsoGroup.add(tieClip);

    // White silk pocket square in breast pocket
    const pocketSq = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.015), shirtMat);
    pocketSq.position.set(0.14, 0.34, 0.15);
    pocketSq.rotation.z = -0.15;
    torsoGroup.add(pocketSq);

    // Lower jacket skirt & belt
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.22, 16), suitMat);
    waist.scale.set(1.2, 1.0, 0.78);
    waist.position.y = -0.11;
    torsoGroup.add(waist);

    group.add(torsoGroup);
    limbs.torso = torsoGroup;

    // B. Neck & Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.16, 12), skinMat);
    neck.position.y = 1.42;
    group.add(neck);

    // White shirt collar points
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.1, 0.06, 12), shirtMat);
    collar.position.y = 1.39;
    group.add(collar);

    // Head with expressive handsome face
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.55;

    const faceMat = new THREE.MeshStandardMaterial({
      map: textures.faceBoy,
      roughness: 0.55
    });

    const headGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, faceMat);
    headMesh.rotation.y = -Math.PI / 2;
    headGroup.add(headMesh);

    // Modern textured pompadour hair
    const hairTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.195, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.6),
      hairMat
    );
    hairTop.position.set(0, 0.06, -0.01);
    headGroup.add(hairTop);

    // Textured hair quiff in front
    const quiff = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.14), hairMat);
    quiff.position.set(0.02, 0.18, 0.08);
    quiff.rotation.x = 0.3;
    headGroup.add(quiff);

    group.add(headGroup);
    limbs.head = headGroup;

    // C. Trousers & Polished Oxford Dress Shoes
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.6 });
    const legGeo = new THREE.CylinderGeometry(0.088, 0.082, 0.76, 12);
    const oxfordMat = new THREE.MeshStandardMaterial({
      color: 0x08080a,
      roughness: 0.22,
      metalness: 0.35
    });

    // Left Leg
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.15, 0.76, 0);
    const lLegMesh = new THREE.Mesh(legGeo, pantsMat);
    lLegMesh.position.y = -0.38;
    leftLegGroup.add(lLegMesh);

    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.075, 0.16), oxfordMat);
    lShoe.position.set(0, -0.74, 0.03);
    leftLegGroup.add(lShoe);
    group.add(leftLegGroup);
    limbs.leftLeg = leftLegGroup;

    // Right Leg
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.15, 0.76, 0);
    const rLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rLegMesh.position.y = -0.38;
    rightLegGroup.add(rLegMesh);

    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.075, 0.16), oxfordMat);
    rShoe.position.set(0, -0.74, 0.03);
    rightLegGroup.add(rShoe);
    group.add(rightLegGroup);
    limbs.rightLeg = rightLegGroup;

    // D. Arms (Suit Sleeves with White Shirt Cuffs & Gold Watch)
    const sleeveGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.64, 12);

    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.31, 1.3, 0);
    const lSleeve = new THREE.Mesh(sleeveGeo, suitMat);
    lSleeve.position.y = -0.32;
    leftArmGroup.add(lSleeve);

    // White shirt cuff peeking out
    const lCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.058, 0.04, 12), shirtMat);
    lCuff.position.y = -0.61;
    leftArmGroup.add(lCuff);

    // Gold luxury watch
    const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 12), goldMat);
    watch.position.y = -0.59;
    leftArmGroup.add(watch);

    // Hand
    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), skinMat);
    lHand.position.y = -0.65;
    leftArmGroup.add(lHand);

    group.add(leftArmGroup);
    limbs.leftArm = leftArmGroup;

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.31, 1.3, 0);
    const rSleeve = new THREE.Mesh(sleeveGeo, suitMat);
    rSleeve.position.y = -0.32;
    rightArmGroup.add(rSleeve);

    const rCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.058, 0.04, 12), shirtMat);
    rCuff.position.y = -0.61;
    rightArmGroup.add(rCuff);

    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), skinMat);
    rHand.position.y = -0.65;
    rightArmGroup.add(rHand);

    group.add(rightArmGroup);
    limbs.rightArm = rightArmGroup;
  }

  return { group, limbs };
}

