// ==========================================================================
// 3D GRAND ROMANTIC ART MUSEUM ARCHITECTURE (OPTIMIZED FOR 60FPS & MOBILE)
// Faithfully matches European grand palace galleries (Pinterest aesthetic)
// ==========================================================================

import { DEFAULT_PAINTINGS, createArtworkCanvas } from './paintings.js';

export class Museum {
  constructor(scene) {
    this.scene = scene;
    this.paintings = [];
    this.interactiveObjects = [];
    this.flames = [];
    this.particles = null;

    // Dimensions
    this.hallLength = 72; // Length of gallery
    this.hallWidth = 14;  // Width
    this.hallHeight = 9.5; // Vault height
    this.bayCount = 6;    // 6 bays on each side (12 bays total)
    this.bayLength = this.hallLength / this.bayCount;

    this.initTextures();
    this.buildArchitecture();
    this.buildColumns();
    this.buildPaintings();
    this.buildFurniture();
    this.buildLighting();
    this.buildAmbientDust();
  }

  initTextures() {
    // 1. Procedural Polished Parquet / Herringbone Floor Texture
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext('2d');

    // Rich dark oak parquet tones
    fCtx.fillStyle = '#26150f';
    fCtx.fillRect(0, 0, 512, 512);

    const plankW = 64;
    const plankH = 16;
    for (let y = 0; y < 512; y += plankH) {
      for (let x = 0; x < 512; x += plankW) {
        const offset = (Math.floor(y / plankH) % 2) * (plankW / 2);
        const px = (x + offset) % 512;
        const shade = Math.floor(Math.random() * 24) - 12;
        fCtx.fillStyle = `rgb(${42 + shade}, ${24 + Math.floor(shade * 0.6)}, ${16 + Math.floor(shade * 0.4)})`;
        fCtx.fillRect(px, y, plankW - 2, plankH - 2);

        fCtx.strokeStyle = 'rgba(0,0,0,0.3)';
        fCtx.lineWidth = 1;
        fCtx.beginPath();
        fCtx.moveTo(px, y + plankH / 2);
        fCtx.lineTo(px + plankW, y + plankH / 2);
        fCtx.stroke();
      }
    }
    this.floorTexture = new THREE.CanvasTexture(floorCanvas);
    this.floorTexture.wrapS = THREE.RepeatWrapping;
    this.floorTexture.wrapT = THREE.RepeatWrapping;
    this.floorTexture.repeat.set(8, 36);

    // 2. Deep Burgundy Damask Wall Texture (Vibrant Crimson)
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wCtx = wallCanvas.getContext('2d');
    wCtx.fillStyle = '#42121b'; // Vibrant deep crimson/burgundy
    wCtx.fillRect(0, 0, 512, 512);

    wCtx.fillStyle = 'rgba(105, 25, 40, 0.55)';
    for (let y = 0; y < 512; y += 64) {
      for (let x = 0; x < 512; x += 64) {
        wCtx.beginPath();
        wCtx.arc(x + 32, y + 32, 20, 0, Math.PI * 2);
        wCtx.fill();
        wCtx.beginPath();
        wCtx.arc(x, y, 12, 0, Math.PI * 2);
        wCtx.fill();
      }
    }
    this.wallTexture = new THREE.CanvasTexture(wallCanvas);
    this.wallTexture.wrapS = THREE.RepeatWrapping;
    this.wallTexture.wrapT = THREE.RepeatWrapping;
    this.wallTexture.repeat.set(12, 4);

    // 3. Dark Marble Column Texture
    const marbleCanvas = document.createElement('canvas');
    marbleCanvas.width = 256;
    marbleCanvas.height = 256;
    const mCtx = marbleCanvas.getContext('2d');
    mCtx.fillStyle = '#0f1f1a'; // Dark green-black marble
    mCtx.fillRect(0, 0, 256, 256);
    mCtx.strokeStyle = 'rgba(80, 180, 130, 0.3)';
    mCtx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      mCtx.beginPath();
      mCtx.moveTo(Math.random() * 256, 0);
      mCtx.bezierCurveTo(Math.random() * 256, 80, Math.random() * 256, 170, Math.random() * 256, 256);
      mCtx.stroke();
    }
    this.marbleTexture = new THREE.CanvasTexture(marbleCanvas);
    this.marbleTexture.wrapS = THREE.RepeatWrapping;
    this.marbleTexture.wrapT = THREE.RepeatWrapping;

    // 4. Gold Leaf Material
    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xdeb841,
      metalness: 0.85,
      roughness: 0.28,
      emissive: 0x5a420e,
      emissiveIntensity: 0.22
    });
  }

  buildArchitecture() {
    const halfW = this.hallWidth / 2;
    const halfL = this.hallLength / 2;

    // Polished Floor
    const floorGeo = new THREE.PlaneGeometry(this.hallWidth, this.hallLength);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.floorTexture,
      roughness: 0.28,
      metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Lower Wainscoting (Dark Mahogany Wood Baseboard)
    const wainscotMat = new THREE.MeshStandardMaterial({
      color: 0x1d0f11,
      roughness: 0.45,
      metalness: 0.25
    });

    // Upper Damask Wall Material
    const upperWallMat = new THREE.MeshStandardMaterial({
      map: this.wallTexture,
      roughness: 0.7,
      metalness: 0.12
    });

    // Build Left and Right Walls
    [-halfW, halfW].forEach(xPos => {
      // Lower Wainscot
      const wainscotGeo = new THREE.BoxGeometry(0.4, 2.2, this.hallLength);
      const wainscot = new THREE.Mesh(wainscotGeo, wainscotMat);
      wainscot.position.set(xPos, 1.1, 0);
      this.scene.add(wainscot);

      // Gold Dado Rail Molding on top of wainscot
      const dadoGeo = new THREE.BoxGeometry(0.5, 0.12, this.hallLength);
      const dado = new THREE.Mesh(dadoGeo, this.goldMaterial);
      dado.position.set(xPos, 2.25, 0);
      this.scene.add(dado);

      // Upper Damask Wall
      const wallGeo = new THREE.BoxGeometry(0.3, this.hallHeight - 2.3, this.hallLength);
      const wall = new THREE.Mesh(wallGeo, upperWallMat);
      wall.position.set(xPos, (this.hallHeight + 2.3) / 2, 0);
      this.scene.add(wall);
    });

    // End Walls (Entrance and Far End Portals)
    [-halfL, halfL].forEach((zPos, idx) => {
      const endWainscotGeo = new THREE.BoxGeometry(this.hallWidth, 2.2, 0.4);
      const endW = new THREE.Mesh(endWainscotGeo, wainscotMat);
      endW.position.set(0, 1.1, zPos);
      this.scene.add(endW);

      const endWallGeo = new THREE.BoxGeometry(this.hallWidth, this.hallHeight - 2.2, 0.3);
      const endWall = new THREE.Mesh(endWallGeo, upperWallMat);
      endWall.position.set(0, (this.hallHeight + 2.2) / 2, zPos);
      this.scene.add(endWall);

      const archPortal = this.createArchPortal();
      archPortal.position.set(0, 0, zPos + (idx === 0 ? 0.3 : -0.3));
      if (idx === 0) archPortal.rotation.y = Math.PI;
      this.scene.add(archPortal);
    });

    // Vaulted Ceiling
    this.buildVaultedCeiling();
  }

  createArchPortal() {
    const group = new THREE.Group();
    [-2.2, 2.2].forEach(px => {
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.38, 5.5, 16),
        new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
      );
      p.position.set(px, 2.75, 0);
      group.add(p);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.9), this.goldMaterial);
      base.position.set(px, 0.2, 0);
      group.add(base);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.9), this.goldMaterial);
      cap.position.set(px, 5.5, 0);
      group.add(cap);
    });

    const archTop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.8, 0.8), this.goldMaterial);
    archTop.position.set(0, 5.9, 0);
    group.add(archTop);

    return group;
  }

  buildVaultedCeiling() {
    const halfL = this.hallLength / 2;
    const radius = this.hallWidth / 2;

    const vaultGeo = new THREE.CylinderGeometry(
      radius, radius, this.hallLength, 32, 1, true, -Math.PI / 2, Math.PI
    );
    const vaultMat = new THREE.MeshStandardMaterial({
      color: 0x2b0d14,
      roughness: 0.8,
      side: THREE.BackSide
    });
    const vault = new THREE.Mesh(vaultGeo, vaultMat);
    vault.rotation.z = Math.PI / 2;
    vault.rotation.y = Math.PI / 2;
    vault.position.set(0, this.hallHeight - 1, 0);
    this.scene.add(vault);

    // Golden Rib Arches
    for (let i = 0; i <= this.bayCount; i++) {
      const z = -halfL + i * this.bayLength;
      const ribGeo = new THREE.TorusGeometry(radius - 0.05, 0.25, 8, 32, Math.PI);
      const rib = new THREE.Mesh(ribGeo, this.goldMaterial);
      rib.position.set(0, this.hallHeight - 1, z);
      rib.rotation.y = Math.PI / 2;
      this.scene.add(rib);
    }

    // Central Glass Skylight
    const skylightGeo = new THREE.PlaneGeometry(3.2, this.hallLength);
    const skylightMat = new THREE.MeshStandardMaterial({
      color: 0x0e2038,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x142b4d,
      emissiveIntensity: 0.7,
      side: THREE.DoubleSide
    });
    const skylight = new THREE.Mesh(skylightGeo, skylightMat);
    skylight.rotation.x = Math.PI / 2;
    skylight.position.set(0, this.hallHeight + 0.5, 0);
    this.scene.add(skylight);
  }

  buildColumns() {
    const halfW = this.hallWidth / 2 - 0.7;
    const halfL = this.hallLength / 2;
    const colHeight = 6.8;

    [-halfW, halfW].forEach(x => {
      for (let i = 0; i <= this.bayCount; i++) {
        const z = -halfL + i * this.bayLength;
        const colGroup = new THREE.Group();

        const shaftGeo = new THREE.CylinderGeometry(0.38, 0.42, colHeight, 16);
        const shaft = new THREE.Mesh(
          shaftGeo,
          new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.35, metalness: 0.2 })
        );
        shaft.position.y = colHeight / 2 + 0.4;
        colGroup.add(shaft);

        const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), this.goldMaterial);
        base.position.y = 0.25;
        colGroup.add(base);

        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 1.1), this.goldMaterial);
        cap.position.y = colHeight + 0.5;
        colGroup.add(cap);

        colGroup.position.set(x, 0, z);
        this.scene.add(colGroup);
      }
    });
  }

  buildPaintings() {
    const halfW = this.hallWidth / 2 - 0.15;
    const halfL = this.hallLength / 2;

    DEFAULT_PAINTINGS.forEach(p => {
      const z = -halfL + (p.bayIndex + 0.5) * this.bayLength;
      const x = p.side === 'left' ? -halfW : halfW;
      const y = 3.6;

      const frameGroup = new THREE.Group();

      const savedPhoto = localStorage.getItem(`museum_artwork_${p.id}`);
      const canvas = createArtworkCanvas(p, savedPhoto);
      const texture = new THREE.CanvasTexture(canvas);
      p.texture = texture;
      p.canvas = canvas;

      const frameHeight = 2.4;
      const frameWidth = frameHeight * p.aspect;

      // Baroque Gold Frame
      const frameBorderGeo = new THREE.BoxGeometry(frameWidth + 0.4, frameHeight + 0.4, 0.18);
      const frameBorder = new THREE.Mesh(frameBorderGeo, this.goldMaterial);
      frameGroup.add(frameBorder);

      const linerGeo = new THREE.BoxGeometry(frameWidth + 0.1, frameHeight + 0.1, 0.2);
      const liner = new THREE.Mesh(
        linerGeo,
        new THREE.MeshStandardMaterial({ color: 0x1a0d0a, roughness: 0.6 })
      );
      frameGroup.add(liner);

      // Canvas
      const canvasGeo = new THREE.PlaneGeometry(frameWidth, frameHeight);
      const canvasMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.08
      });
      const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
      canvasMesh.position.z = 0.11;
      frameGroup.add(canvasMesh);

      // Brass Plaque
      const plaqueGroup = new THREE.Group();
      const plaqueGeo = new THREE.BoxGeometry(1.6, 0.45, 0.06);
      const plaque = new THREE.Mesh(plaqueGeo, this.goldMaterial);
      plaqueGroup.add(plaque);
      plaqueGroup.position.set(0, -frameHeight / 2 - 0.4, 0.06);
      frameGroup.add(plaqueGroup);

      // Double Brass Candle Wall Sconces
      [-frameWidth / 2 - 0.8, frameWidth / 2 + 0.8].forEach(sx => {
        const sconce = this.createWallSconce();
        sconce.position.set(sx, 0, 0.1);
        frameGroup.add(sconce);
      });

      if (p.side === 'left') {
        frameGroup.rotation.y = Math.PI / 2;
        frameGroup.position.set(x, y, z);
      } else {
        frameGroup.rotation.y = -Math.PI / 2;
        frameGroup.position.set(x, y, z);
      }

      frameGroup.userData = {
        type: 'painting',
        data: p,
        worldPos: new THREE.Vector3(x + (p.side === 'left' ? 2 : -2), 1.6, z)
      };

      this.scene.add(frameGroup);
      this.paintings.push({ mesh: frameGroup, data: p });
      this.interactiveObjects.push(frameGroup);
    });
  }

  createWallSconce() {
    const group = new THREE.Group();
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 12), this.goldMaterial);
    plate.rotation.x = Math.PI / 2;
    group.add(plate);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), this.goldMaterial);
    arm.rotation.z = Math.PI / 3;
    arm.position.set(0, 0.1, 0.12);
    group.add(arm);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.1, 10), this.goldMaterial);
    cup.position.set(0, 0.28, 0.2);
    group.add(cup);

    // Glowing candle flame (Shader-friendly MeshBasicMaterial)
    const flameGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffe082 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 0.38, 0.2);
    group.add(flame);

    this.flames.push(flame);
    return group;
  }

  buildFurniture() {
    const benchCount = 4;
    const spacing = this.hallLength / (benchCount + 1);
    const startZ = -this.hallLength / 2 + spacing;

    for (let i = 0; i < benchCount; i++) {
      const z = startZ + i * spacing;
      const bench = this.createVelvetBench();
      bench.position.set(0, 0, z);
      this.scene.add(bench);
    }
  }

  createVelvetBench() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x1a0d10, roughness: 0.4 });
    const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.5, 10);
    [
      [-1.1, -0.4], [1.1, -0.4],
      [-1.1, 0.4], [1.1, 0.4]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, 0.25, lz);
      group.add(leg);
    });

    const cushionGeo = new THREE.BoxGeometry(2.6, 0.35, 1.1);
    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x54121e, // Deep burgundy velvet
      roughness: 0.85,
      metalness: 0.1
    });
    const cushion = new THREE.Mesh(cushionGeo, velvetMat);
    cushion.position.y = 0.65;
    group.add(cushion);

    const trimGeo = new THREE.BoxGeometry(2.65, 0.08, 1.15);
    const trim = new THREE.Mesh(trimGeo, this.goldMaterial);
    trim.position.y = 0.48;
    group.add(trim);

    return group;
  }

  buildLighting() {
    // 1. Warm Rich Ambient Light (Prevents black shadows, renders vibrant velvet & gold)
    const ambient = new THREE.AmbientLight(0x4a2027, 0.95);
    this.scene.add(ambient);

    // 2. Soft Ceiling Moonlight / Floor Bounce
    const hemisphere = new THREE.HemisphereLight(0xfff0db, 0x2e1218, 0.75);
    this.scene.add(hemisphere);

    // 3. Strategic Warm Point Lights (Safe 6-light budget for 60fps on all mobile GPUs)
    const spotCount = 5;
    const spacing = this.hallLength / spotCount;
    for (let i = 0; i < spotCount; i++) {
      const z = -this.hallLength / 2 + (i + 0.5) * spacing;
      const point = new THREE.PointLight(0xffe2aa, 1.3, 18, 1.5);
      point.position.set(0, 5.5, z);
      this.scene.add(point);
    }
  }

  buildAmbientDust() {
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * (this.hallWidth - 2);
      positions[i + 1] = Math.random() * (this.hallHeight - 1) + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * (this.hallLength - 4);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xfae17d,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(delta) {
    // Animate candle flame flicker
    const time = performance.now() * 0.005;
    this.flames.forEach((flame, idx) => {
      const flicker = 1 + Math.sin(time + idx * 1.3) * 0.12;
      flame.scale.set(flicker, flicker * 1.1, flicker);
    });

    // Animate ambient dust floating
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= delta * 0.18;
        if (pos[i] < 0.2) pos[i] = this.hallHeight - 1;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
