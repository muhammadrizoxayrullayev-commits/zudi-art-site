// ==========================================================================
// 3D GRAND ROMANTIC ART MUSEUM ARCHITECTURE (AUTHENTIC NEOCLASSICAL PALACE)
// Inspired by Louvre & Hermitage Grand Galleries (Pinterest aesthetic)
// Pure vertical walls, coffered ceiling, chiaroscuro darkness & gold Baroque frames
// Features 3 distinct majestic galleries, partition archways & marble sculptures
// ==========================================================================

import { DEFAULT_PAINTINGS, DEFAULT_STATUES, createArtworkCanvas } from './paintings.js';

export class Museum {
  constructor(scene) {
    this.scene = scene;
    this.paintings = [];
    this.interactiveObjects = [];
    this.flames = [];
    this.particles = null;

    // Gallery Dimensions
    this.hallLength = 72; // Length of the grand hall (meters)
    this.hallWidth = 14;  // Width
    this.hallHeight = 8.8; // Classical palace ceiling height
    this.bayCount = 6;    // 6 bays on each side (12 classical bays total)
    this.bayLength = this.hallLength / this.bayCount;

    this.initTextures();
    this.buildArchitecture();
    this.buildPartitionWalls();
    this.buildColumns();
    this.buildPaintings();
    this.buildStatues();
    this.buildFurniture();
    this.buildLighting();
    this.buildAmbientDust();
  }

  initTextures() {
    // 1. Procedural Polished Parquet / Chevron Oak Floor Texture
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext('2d');

    // Rich dark oak parquet tones
    fCtx.fillStyle = '#1c0f0a';
    fCtx.fillRect(0, 0, 512, 512);

    const plankW = 64;
    const plankH = 16;
    for (let y = 0; y < 512; y += plankH) {
      for (let x = 0; x < 512; x += plankW) {
        const offset = (Math.floor(y / plankH) % 2) * (plankW / 2);
        const px = (x + offset) % 512;
        const shade = Math.floor(Math.random() * 20) - 10;
        fCtx.fillStyle = `rgb(${38 + shade}, ${22 + Math.floor(shade * 0.5)}, ${14 + Math.floor(shade * 0.3)})`;
        fCtx.fillRect(px, y, plankW - 2, plankH - 2);

        fCtx.strokeStyle = 'rgba(0,0,0,0.4)';
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

    // 2. Deep Royal Burgundy Damask Velvet Wall Texture
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wCtx = wallCanvas.getContext('2d');
    wCtx.fillStyle = '#22080d'; // Deep wine / dark crimson velvet
    wCtx.fillRect(0, 0, 512, 512);

    wCtx.fillStyle = 'rgba(56, 14, 22, 0.65)';
    for (let y = 0; y < 512; y += 64) {
      for (let x = 0; x < 512; x += 64) {
        wCtx.beginPath();
        wCtx.arc(x + 32, y + 32, 22, 0, Math.PI * 2);
        wCtx.fill();
        wCtx.beginPath();
        wCtx.arc(x, y, 14, 0, Math.PI * 2);
        wCtx.fill();
      }
    }
    this.wallTexture = new THREE.CanvasTexture(wallCanvas);
    this.wallTexture.wrapS = THREE.RepeatWrapping;
    this.wallTexture.wrapT = THREE.RepeatWrapping;
    this.wallTexture.repeat.set(12, 4);

    // 3. Dark Imperial Emerald Marble Column Texture
    const marbleCanvas = document.createElement('canvas');
    marbleCanvas.width = 256;
    marbleCanvas.height = 256;
    const mCtx = marbleCanvas.getContext('2d');
    mCtx.fillStyle = '#08140f'; // Dark green-black marble
    mCtx.fillRect(0, 0, 256, 256);
    mCtx.strokeStyle = 'rgba(60, 160, 110, 0.25)';
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

    // 4. Antique Baroque Gold Leaf Material
    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.26,
      emissive: 0x3d2b08,
      emissiveIntensity: 0.2
    });

    // 5. Dark Polished Mahogany Wood (Wainscoting & Beams)
    this.woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x160a0c,
      roughness: 0.42,
      metalness: 0.22
    });

    // 6. Upper Velvet Damask Wall Material
    this.upperWallMaterial = new THREE.MeshStandardMaterial({
      map: this.wallTexture,
      roughness: 0.72,
      metalness: 0.1
    });

    // 7. Pure Carrara White Marble for Sculptures & Busts
    this.whiteMarbleMaterial = new THREE.MeshStandardMaterial({
      color: 0xf6f3ea,
      roughness: 0.28,
      metalness: 0.05
    });
  }

  buildArchitecture() {
    const halfW = this.hallWidth / 2;
    const halfL = this.hallLength / 2;

    // 1. Polished Parquet Floor
    const floorGeo = new THREE.PlaneGeometry(this.hallWidth, this.hallLength);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.floorTexture,
      roughness: 0.25,
      metalness: 0.35
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Pure Vertical Left & Right Gallery Walls
    [-halfW, halfW].forEach(xPos => {
      // Lower Wainscoting (Dark Mahogany Wood Paneling)
      const wainscotGeo = new THREE.BoxGeometry(0.35, 2.3, this.hallLength);
      const wainscot = new THREE.Mesh(wainscotGeo, this.woodMaterial);
      wainscot.position.set(xPos, 1.15, 0);
      this.scene.add(wainscot);

      // Gold Dado Rail Molding on top of wainscot
      const dadoGeo = new THREE.BoxGeometry(0.45, 0.14, this.hallLength);
      const dado = new THREE.Mesh(dadoGeo, this.goldMaterial);
      dado.position.set(xPos, 2.37, 0);
      this.scene.add(dado);

      // Upper Damask Wall (Flat, tall, vertical)
      const wallHeight = this.hallHeight - 2.44;
      const wallGeo = new THREE.BoxGeometry(0.25, wallHeight, this.hallLength);
      const wall = new THREE.Mesh(wallGeo, this.upperWallMaterial);
      wall.position.set(xPos, 2.44 + wallHeight / 2, 0);
      this.scene.add(wall);

      // Classical Gold Crown Cornice & Entablature along the top of each wall
      const corniceGeo = new THREE.BoxGeometry(0.65, 0.35, this.hallLength);
      const cornice = new THREE.Mesh(corniceGeo, this.goldMaterial);
      cornice.position.set(xPos, this.hallHeight - 0.18, 0);
      this.scene.add(cornice);
    });

    // 3. End Walls (Grand Entrance & Far End Colonnade)
    [-halfL, halfL].forEach((zPos, idx) => {
      const endWainscotGeo = new THREE.BoxGeometry(this.hallWidth, 2.3, 0.35);
      const endW = new THREE.Mesh(endWainscotGeo, this.woodMaterial);
      endW.position.set(0, 1.15, zPos);
      this.scene.add(endW);

      const endWallGeo = new THREE.BoxGeometry(this.hallWidth, this.hallHeight - 2.3, 0.25);
      const endWall = new THREE.Mesh(endWallGeo, this.upperWallMaterial);
      endWall.position.set(0, (this.hallHeight + 2.3) / 2, zPos);
      this.scene.add(endWall);

      const endCorniceGeo = new THREE.BoxGeometry(this.hallWidth, 0.35, 0.65);
      const endCornice = new THREE.Mesh(endCorniceGeo, this.goldMaterial);
      endCornice.position.set(0, this.hallHeight - 0.18, zPos);
      this.scene.add(endCornice);

      // Classical Arch Portal
      const archPortal = this.createArchPortal(idx === 0);
      archPortal.position.set(0, 0, zPos + (idx === 0 ? 0.3 : -0.3));
      if (idx === 0) archPortal.rotation.y = Math.PI;
      this.scene.add(archPortal);
    });

    // 4. Stately Classical Coffered Ceiling
    this.buildCofferedCeiling();
  }

  createArchPortal(isFarEnd = false) {
    const group = new THREE.Group();
    [-2.4, 2.4].forEach(px => {
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.38, 5.8, 16),
        new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
      );
      p.position.set(px, 2.9, 0);
      group.add(p);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.9), this.goldMaterial);
      base.position.set(px, 0.22, 0);
      group.add(base);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 0.95), this.goldMaterial);
      cap.position.set(px, 5.8, 0);
      group.add(cap);
    });

    // Arch header & pediment
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.65, 0.7), this.goldMaterial);
    archTop.position.set(0, 6.15, 0);
    group.add(archTop);

    if (isFarEnd) {
      // Moonlit night bay window at the far end of the museum
      const winGeo = new THREE.PlaneGeometry(4.2, 5.2);
      const winMat = new THREE.MeshStandardMaterial({
        color: 0x050e18,
        emissive: 0x0a1c30,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.8,
        side: THREE.DoubleSide
      });
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(0, 3.2, 0.05);
      group.add(win);

      // Distant romantic glowing moon
      const moonGeo = new THREE.CircleGeometry(0.65, 32);
      const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffbe6 });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.set(0.6, 4.4, 0.08);
      group.add(moon);
    } else {
      // Deep crimson velvet drapery inside entrance arch
      const drapeGeo = new THREE.PlaneGeometry(4.2, 5.2);
      const drapeMat = new THREE.MeshStandardMaterial({
        color: 0x3d0b14,
        roughness: 0.85,
        side: THREE.DoubleSide
      });
      const drape = new THREE.Mesh(drapeGeo, drapeMat);
      drape.position.set(0, 3.2, -0.05);
      group.add(drape);
    }

    return group;
  }

  // ==========================================================================
  // MONUMENTAL PARTITION WALLS (DIVIDING INTO 3 MAJESTIC GALLERIES)
  // ==========================================================================
  buildPartitionWalls() {
    // Two Grand Partition Archways:
    // Partition 1 at z = 12 (dividing Room 1: Salon de l'Amour & Room 2: Galerie Royale)
    // Partition 2 at z = -12 (dividing Room 2 & Room 3: Le Temple Éternel)
    const partitions = [
      { z: 12, title: '✨ II. GALERIE ROYALE — SEVGI MAHKAMASI ✨' },
      { z: -12, title: '✨ III. LE TEMPLE ÉTERNEL — ABADIY ORZULAR ✨' }
    ];

    partitions.forEach(({ z, title }) => {
      const pGroup = new THREE.Group();
      const wallThick = 0.5;
      const archOpeningHalfW = 3.2; // 6.4m wide central archway for smooth walking
      const sideWallW = this.hallWidth / 2 - archOpeningHalfW; // ~3.8m each side

      // Left and Right Solid Wall Wings
      [-1, 1].forEach(side => {
        const xCenter = side * (archOpeningHalfW + sideWallW / 2);

        // Lower Wainscoting
        const wainscot = new THREE.Mesh(
          new THREE.BoxGeometry(sideWallW, 2.3, wallThick),
          this.woodMaterial
        );
        wainscot.position.set(xCenter, 1.15, z);
        pGroup.add(wainscot);

        // Gold Dado Molding
        const dado = new THREE.Mesh(
          new THREE.BoxGeometry(sideWallW + 0.1, 0.14, wallThick + 0.1),
          this.goldMaterial
        );
        dado.position.set(xCenter, 2.37, z);
        pGroup.add(dado);

        // Upper Damask Wall Wing
        const upperH = this.hallHeight - 2.44;
        const upper = new THREE.Mesh(
          new THREE.BoxGeometry(sideWallW, upperH, wallThick),
          this.upperWallMaterial
        );
        upper.position.set(xCenter, 2.44 + upperH / 2, z);
        pGroup.add(upper);

        // Top Gold Cornice
        const cornice = new THREE.Mesh(
          new THREE.BoxGeometry(sideWallW + 0.15, 0.35, wallThick + 0.2),
          this.goldMaterial
        );
        cornice.position.set(xCenter, this.hallHeight - 0.18, z);
        pGroup.add(cornice);

        // Grand Emerald Marble Column framing the archway edge
        const colX = side * archOpeningHalfW;
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.38, 6.4, 16),
          new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
        );
        col.position.set(colX, 3.2, z);
        pGroup.add(col);

        const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), this.goldMaterial);
        colBase.position.set(colX, 0.25, z);
        pGroup.add(colBase);

        const colCap = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.5, 0.95), this.goldMaterial);
        colCap.position.set(colX, 6.4, z);
        pGroup.add(colCap);
      });

      // Monumental Arch Header Spanning over the central opening (y: 6.4 to 8.8)
      const headerH = this.hallHeight - 6.4;
      const header = new THREE.Mesh(
        new THREE.BoxGeometry(archOpeningHalfW * 2 + 0.4, headerH, wallThick + 0.15),
        this.goldMaterial
      );
      header.position.set(0, 6.4 + headerH / 2, z);
      pGroup.add(header);

      // Gilded Classical Room Title Plaque on Header
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 1024;
      plaqueCanvas.height = 128;
      const pCtx = plaqueCanvas.getContext('2d');
      pCtx.fillStyle = '#1c070b';
      pCtx.fillRect(0, 0, 1024, 128);
      pCtx.strokeStyle = '#d4af37';
      pCtx.lineWidth = 6;
      pCtx.strokeRect(8, 8, 1008, 112);
      pCtx.font = 'bold 36px "Cinzel", serif';
      pCtx.fillStyle = '#fae17d';
      pCtx.textAlign = 'center';
      pCtx.textBaseline = 'middle';
      pCtx.fillText(title, 512, 64);

      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMat = new THREE.MeshStandardMaterial({
        map: plaqueTex,
        roughness: 0.3,
        metalness: 0.4
      });

      // Front & Back facing room plaques
      [-1, 1].forEach(side => {
        const plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.7), plaqueMat);
        plaqueMesh.position.set(0, 7.3, z + side * (wallThick / 2 + 0.1));
        if (side === -1) plaqueMesh.rotation.y = Math.PI;
        pGroup.add(plaqueMesh);
      });

      this.scene.add(pGroup);
    });
  }

  buildCofferedCeiling() {
    const halfL = this.hallLength / 2;

    // 1. High Ceiling Base Plane
    const ceilingGeo = new THREE.PlaneGeometry(this.hallWidth, this.hallLength);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x14080a, // Rich deep dark mahogany ceiling
      roughness: 0.65,
      metalness: 0.15
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, this.hallHeight, 0);
    this.scene.add(ceiling);

    // 2. Transverse Beams (Dividing each bay across the hall)
    for (let i = 0; i <= this.bayCount; i++) {
      const z = -halfL + i * this.bayLength;

      // Dark wood main beam
      const beamGeo = new THREE.BoxGeometry(this.hallWidth, 0.45, 0.6);
      const beam = new THREE.Mesh(beamGeo, this.woodMaterial);
      beam.position.set(0, this.hallHeight - 0.22, z);
      this.scene.add(beam);

      // Gold bottom trim
      const goldTrimGeo = new THREE.BoxGeometry(this.hallWidth, 0.08, 0.65);
      const goldTrim = new THREE.Mesh(goldTrimGeo, this.goldMaterial);
      goldTrim.position.set(0, this.hallHeight - 0.46, z);
      this.scene.add(goldTrim);
    }

    // 3. Longitudinal Beams (Running along the length of the hall)
    [-3.8, 3.8].forEach(x => {
      const longBeamGeo = new THREE.BoxGeometry(0.5, 0.35, this.hallLength);
      const longBeam = new THREE.Mesh(longBeamGeo, this.woodMaterial);
      longBeam.position.set(x, this.hallHeight - 0.18, 0);
      this.scene.add(longBeam);

      const longTrimGeo = new THREE.BoxGeometry(0.55, 0.06, this.hallLength);
      const longTrim = new THREE.Mesh(longTrimGeo, this.goldMaterial);
      longTrim.position.set(x, this.hallHeight - 0.36, 0);
      this.scene.add(longTrim);
    });

    // 4. Central Arched Night Skylight (Moonlit night sky high above)
    const skylightGeo = new THREE.PlaneGeometry(3.6, this.hallLength - 4);
    const skylightMat = new THREE.MeshStandardMaterial({
      color: 0x07111e,
      roughness: 0.15,
      metalness: 0.7,
      emissive: 0x091728,
      emissiveIntensity: 0.55
    });
    const skylight = new THREE.Mesh(skylightGeo, skylightMat);
    skylight.rotation.x = Math.PI / 2;
    skylight.position.set(0, this.hallHeight + 0.05, 0);
    this.scene.add(skylight);

    // Gold Skylight Framing Ribs
    for (let i = 0; i <= this.bayCount; i++) {
      const z = -halfL + i * this.bayLength;
      const ribGeo = new THREE.BoxGeometry(3.8, 0.12, 0.25);
      const rib = new THREE.Mesh(ribGeo, this.goldMaterial);
      rib.position.set(0, this.hallHeight - 0.05, z);
      this.scene.add(rib);
    }

    // 5. Ornate Gold Rosettes inside coffered cassettes
    for (let i = 0; i < this.bayCount; i++) {
      const z = -halfL + (i + 0.5) * this.bayLength;
      [-5.4, 5.4].forEach(x => {
        const rosetteGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.1, 16);
        const rosette = new THREE.Mesh(rosetteGeo, this.goldMaterial);
        rosette.position.set(x, this.hallHeight - 0.05, z);
        this.scene.add(rosette);
      });
    }
  }

  buildColumns() {
    // Columns are placed flush against the walls at each bay line
    const halfW = this.hallWidth / 2 - 0.45;
    const halfL = this.hallLength / 2;
    const colHeight = 7.6;

    [-halfW, halfW].forEach(x => {
      for (let i = 0; i <= this.bayCount; i++) {
        const z = -halfL + i * this.bayLength;
        const colGroup = new THREE.Group();

        // Dark Imperial Emerald Marble Shaft
        const shaftGeo = new THREE.CylinderGeometry(0.32, 0.36, colHeight, 16);
        const shaft = new THREE.Mesh(
          shaftGeo,
          new THREE.MeshStandardMaterial({
            map: this.marbleTexture,
            roughness: 0.3,
            metalness: 0.2
          })
        );
        shaft.position.y = colHeight / 2 + 0.4;
        colGroup.add(shaft);

        // Gold Classical Base Plinth
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.85), this.goldMaterial);
        base.position.y = 0.22;
        colGroup.add(base);

        // Gold Corinthian Capital
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.95), this.goldMaterial);
        cap.position.y = colHeight + 0.45;
        colGroup.add(cap);

        colGroup.position.set(x, 0, z);
        this.scene.add(colGroup);
      }
    });
  }

  buildPaintings() {
    // Pure wall positions: left wall at -halfW, right wall at +halfW
    const halfW = this.hallWidth / 2 - 0.16;
    const halfL = this.hallLength / 2;

    DEFAULT_PAINTINGS.forEach(p => {
      const z = -halfL + (p.bayIndex + 0.5) * this.bayLength;
      const x = p.side === 'left' ? -halfW : halfW;
      const y = 4.3; // Stately gallery viewing height

      const frameGroup = new THREE.Group();

      const savedPhoto = localStorage.getItem(`museum_artwork_${p.id}`);
      const canvas = createArtworkCanvas(p, savedPhoto);
      const texture = new THREE.CanvasTexture(canvas);
      p.texture = texture;
      p.canvas = canvas;

      const frameHeight = 2.6;
      const frameWidth = frameHeight * p.aspect;

      // 1. Ornate Baroque Gold Frame (Carved outer border)
      const frameBorderGeo = new THREE.BoxGeometry(frameWidth + 0.45, frameHeight + 0.45, 0.18);
      const frameBorder = new THREE.Mesh(frameBorderGeo, this.goldMaterial);
      frameGroup.add(frameBorder);

      // 2. Dark Velvet Inner Matting / Liner
      const linerGeo = new THREE.BoxGeometry(frameWidth + 0.12, frameHeight + 0.12, 0.2);
      const liner = new THREE.Mesh(
        linerGeo,
        new THREE.MeshStandardMaterial({ color: 0x18080a, roughness: 0.75 })
      );
      frameGroup.add(liner);

      // 3. Classical Artwork Canvas
      const canvasGeo = new THREE.PlaneGeometry(frameWidth, frameHeight);
      const canvasMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.32,
        metalness: 0.06
      });
      const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
      canvasMesh.position.z = 0.11;
      frameGroup.add(canvasMesh);

      // 4. Polished Brass Museum Plaque (Below frame)
      const plaqueGroup = new THREE.Group();
      const plaqueGeo = new THREE.BoxGeometry(1.8, 0.48, 0.06);
      const plaque = new THREE.Mesh(plaqueGeo, this.goldMaterial);
      plaqueGroup.add(plaque);
      plaqueGroup.position.set(0, -frameHeight / 2 - 0.42, 0.06);
      frameGroup.add(plaqueGroup);

      // 5. Double Brass Candle Sconces flanking the painting
      [-frameWidth / 2 - 0.75, frameWidth / 2 + 0.75].forEach(sx => {
        const sconce = this.createWallSconce();
        sconce.position.set(sx, 0, 0.1);
        frameGroup.add(sconce);
      });

      // Align cleanly flush against wall, facing into the gallery center
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
        worldPos: new THREE.Vector3(x + (p.side === 'left' ? 2 : -2), 1.65, z)
      };

      this.scene.add(frameGroup);
      this.paintings.push({ mesh: frameGroup, data: p });
      this.interactiveObjects.push(frameGroup);
    });
  }

  createWallSconce() {
    const group = new THREE.Group();

    // Wall mounting plate
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 12), this.goldMaterial);
    plate.rotation.x = Math.PI / 2;
    group.add(plate);

    // Curved brass arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), this.goldMaterial);
    arm.rotation.z = Math.PI / 3;
    arm.position.set(0, 0.1, 0.12);
    group.add(arm);

    // Candle cup
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.1, 10), this.goldMaterial);
    cup.position.set(0, 0.28, 0.2);
    group.add(cup);

    // White tapered wax candle
    const wax = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.3, 10),
      new THREE.MeshStandardMaterial({ color: 0xfffaea, roughness: 0.3 })
    );
    wax.position.set(0, 0.43, 0.2);
    group.add(wax);

    // Glowing candle flame
    const flameGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd97d });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 0.62, 0.2);
    group.add(flame);

    this.flames.push(flame);
    return group;
  }

  // ==========================================================================
  // CLASSICAL MARBLE SCULPTURES, BUSTS & CENTERPIECE ANGEL
  // ==========================================================================
  buildStatues() {
    // 1. Centerpiece Monumental Sculpture: "Angel of Eternal Love" (Cupid & Psyche)
    // Placed in the magnificent Center of Room 2 at x: 0, z: 0
    const angelData = DEFAULT_STATUES.find(s => s.id === 'statue_angel');
    const angelSculpture = this.createCenterpieceSculpture(angelData);
    angelSculpture.position.set(0, 0, 0);
    this.scene.add(angelSculpture);
    this.interactiveObjects.push(angelSculpture);

    // 2. Classical Bust Statues flanking the partition walls
    const bustConfigs = [
      {
        statueId: 'statue_aphrodite',
        x: -4.8,
        z: 13.6,
        rotY: Math.PI * 0.15 // angled toward center of Room 1
      },
      {
        statueId: 'statue_apollo',
        x: 4.8,
        z: 13.6,
        rotY: -Math.PI * 0.15
      },
      {
        statueId: 'statue_psyche',
        x: -4.8,
        z: -10.4,
        rotY: Math.PI * 0.15 // angled toward center of Room 2
      },
      {
        statueId: 'statue_eros',
        x: 4.8,
        z: -10.4,
        rotY: -Math.PI * 0.15
      }
    ];

    bustConfigs.forEach(cfg => {
      const data = DEFAULT_STATUES.find(s => s.id === cfg.statueId);
      if (!data) return;
      const bust = this.createClassicalBust(data);
      bust.position.set(cfg.x, 0, cfg.z);
      bust.rotation.y = cfg.rotY;
      this.scene.add(bust);
      this.interactiveObjects.push(bust);
    });

    // 3. Classical Medici Urns flanking the Entrance Portal at z = 32
    [-5.2, 5.2].forEach(ux => {
      const urn = this.createMediciUrn();
      urn.position.set(ux, 0, 32);
      this.scene.add(urn);
    });
  }

  createCenterpieceSculpture(statueData) {
    const group = new THREE.Group();

    // 1. Three-tier Stepped Circular Marble Dais with Gold Inlays
    const tier1 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.5, 0.22, 32),
      new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
    );
    tier1.position.y = 0.11;
    group.add(tier1);

    const tier1Trim = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.04, 8, 32), this.goldMaterial);
    tier1Trim.rotation.x = Math.PI / 2;
    tier1Trim.position.y = 0.22;
    group.add(tier1Trim);

    const tier2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.9, 0.18, 32),
      this.whiteMarbleMaterial
    );
    tier2.position.y = 0.31;
    group.add(tier2);

    const tier3 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.32, 0.16, 32),
      new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
    );
    tier3.position.y = 0.48;
    group.add(tier3);

    // 2. Central Classical Fluted Pedestal / Altar
    const altar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.78, 1.15, 24),
      this.whiteMarbleMaterial
    );
    altar.position.y = 1.12;
    group.add(altar);

    // Gold laurel swags on altar
    const swagRing = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.045, 8, 24), this.goldMaterial);
    swagRing.rotation.x = Math.PI / 2;
    swagRing.position.y = 1.62;
    group.add(swagRing);

    // 3. Sculpted Carrara Marble Figures (Cupid & Psyche / Angel of Love)
    const figuresGroup = new THREE.Group();
    figuresGroup.position.y = 1.7;

    // Graceful draped pedestal base
    const drapeBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.78, 0.45, 24),
      this.whiteMarbleMaterial
    );
    drapeBase.position.y = 0.22;
    figuresGroup.add(drapeBase);

    // Figure 1: Winged Angel (Eros)
    const angelTorso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.75, 16),
      this.whiteMarbleMaterial
    );
    angelTorso.position.set(-0.14, 0.85, 0);
    angelTorso.rotation.z = -0.15;
    angelTorso.scale.set(1.1, 1.0, 0.85);
    figuresGroup.add(angelTorso);

    const angelHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      this.whiteMarbleMaterial
    );
    angelHead.scale.set(0.95, 1.15, 1.0);
    angelHead.position.set(-0.22, 1.35, 0.05);
    figuresGroup.add(angelHead);

    // Figure 2: Psyche (Draped Graceful Figure)
    const psycheTorso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.22, 0.7, 16),
      this.whiteMarbleMaterial
    );
    psycheTorso.position.set(0.15, 0.78, 0.06);
    psycheTorso.rotation.z = 0.18;
    psycheTorso.scale.set(1.1, 1.0, 0.85);
    figuresGroup.add(psycheTorso);

    const psycheHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      this.whiteMarbleMaterial
    );
    psycheHead.scale.set(0.95, 1.12, 1.0);
    psycheHead.position.set(0.22, 1.25, 0.08);
    figuresGroup.add(psycheHead);

    // Embracing arms in marble
    const embraceArm1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.42, 8),
      this.whiteMarbleMaterial
    );
    embraceArm1.position.set(0.02, 1.05, 0.14);
    embraceArm1.rotation.z = Math.PI / 3;
    figuresGroup.add(embraceArm1);

    const embraceArm2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.38, 8),
      this.whiteMarbleMaterial
    );
    embraceArm2.position.set(-0.02, 0.98, -0.12);
    embraceArm2.rotation.z = -Math.PI / 3.5;
    figuresGroup.add(embraceArm2);

    // 4. Magnificent Sculpted Marble Wings (Curved, layered, graceful)
    [-1, 1].forEach(wSide => {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(wSide * 0.12, 0.9, -0.12);

      // Primary wing arch
      const wingArch = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.08, 8, 24, Math.PI * 0.65),
        this.whiteMarbleMaterial
      );
      wingArch.rotation.z = wSide * 0.4;
      wingArch.rotation.y = -wSide * 0.35;
      wingArch.position.set(wSide * 0.45, 0.45, 0);
      wingGroup.add(wingArch);

      // Sculpted feather vanes
      [0.3, 0.6, 0.9, 1.2].forEach((fy, fIdx) => {
        const feather = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.55 - fIdx * 0.06, 0.18),
          this.whiteMarbleMaterial
        );
        feather.position.set(wSide * (0.35 + fIdx * 0.22), fy + 0.25, 0);
        feather.rotation.z = wSide * (0.45 + fIdx * 0.15);
        wingGroup.add(feather);
      });

      figuresGroup.add(wingGroup);
    });

    group.add(figuresGroup);

    // Dedicated overhead warm spotlight illuminating the angel
    const spot = new THREE.SpotLight(0xfff2d6, 2.8, 15, Math.PI / 4, 0.35, 1.2);
    spot.position.set(0, 7.5, 0);
    spot.target = figuresGroup;
    group.add(spot);

    group.userData = {
      type: 'statue',
      data: statueData,
      worldPos: new THREE.Vector3(0, 1.65, 2.5)
    };

    return group;
  }

  createClassicalBust(statueData) {
    const group = new THREE.Group();

    // 1. Classical Pedestal (Dark Emerald Marble + Gold moldings)
    const basePlinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.35, 0.85),
      this.goldMaterial
    );
    basePlinth.position.y = 0.18;
    group.add(basePlinth);

    const shaft = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 1.25, 0.72),
      new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
    );
    shaft.position.y = 0.98;
    group.add(shaft);

    const capPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.22, 0.85),
      this.goldMaterial
    );
    capPlinth.position.y = 1.68;
    group.add(capPlinth);

    // Brass Label Plaque on pedestal front
    const plaqueMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.2, 0.04),
      this.goldMaterial
    );
    plaqueMesh.position.set(0, 1.15, 0.38);
    group.add(plaqueMesh);

    // 2. Sculpted Carrara White Marble Bust (y: 1.8 to 2.8)
    const bustGroup = new THREE.Group();
    bustGroup.position.y = 1.79;

    // Turned circular marble stand / socle
    const socle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.24, 0.16, 20),
      this.whiteMarbleMaterial
    );
    socle.position.y = 0.08;
    bustGroup.add(socle);

    // Classical draped bust torso (tapered chest with toga folds)
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.22, 0.44, 20),
      this.whiteMarbleMaterial
    );
    torso.scale.set(1.25, 1.0, 0.72);
    torso.position.y = 0.34;
    bustGroup.add(torso);

    // Draped toga sash diagonal across chest
    const togaFold = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.05, 8, 20, Math.PI * 0.9),
      this.whiteMarbleMaterial
    );
    togaFold.position.set(0, 0.38, 0.14);
    togaFold.rotation.z = -Math.PI / 4;
    bustGroup.add(togaFold);

    // Sculpted neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16),
      this.whiteMarbleMaterial
    );
    neck.position.y = 0.62;
    bustGroup.add(neck);

    // Classical head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      this.whiteMarbleMaterial
    );
    head.scale.set(0.95, 1.15, 1.0);
    head.position.set(0, 0.82, 0.02);
    bustGroup.add(head);

    // Sculpted hair curls
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7),
      this.whiteMarbleMaterial
    );
    hair.scale.set(0.98, 1.16, 1.02);
    hair.position.set(0, 0.84, -0.01);
    bustGroup.add(hair);

    // Gilded Classical Laurel Wreath Crown
    const laurel = new THREE.Mesh(
      new THREE.TorusGeometry(0.19, 0.025, 8, 20),
      this.goldMaterial
    );
    laurel.rotation.x = Math.PI / 2.3;
    laurel.position.set(0, 0.88, 0.02);
    bustGroup.add(laurel);

    group.add(bustGroup);

    // Focused warm picture spotlight shining on the bust
    const bustLight = new THREE.PointLight(0xffeed4, 0.8, 5, 2.0);
    bustLight.position.set(0, 3.2, 0.8);
    group.add(bustLight);

    group.userData = {
      type: 'statue',
      data: statueData,
      worldPos: new THREE.Vector3(group.position.x, 1.65, group.position.z + 1.8)
    };

    return group;
  }

  createMediciUrn() {
    const group = new THREE.Group();

    // Dark marble base pedestal
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.95, 0.8),
      new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
    );
    base.position.y = 0.48;
    group.add(base);

    const baseCap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.9), this.goldMaterial);
    baseCap.position.y = 0.98;
    group.add(baseCap);

    // Gilded Medici Urn / Amphora (y: 1.05 to 2.2)
    const urnFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.18, 16), this.goldMaterial);
    urnFoot.position.y = 1.12;
    group.add(urnFoot);

    const urnBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 16, 16),
      this.goldMaterial
    );
    urnBody.position.y = 1.52;
    urnBody.scale.set(1.0, 1.25, 1.0);
    group.add(urnBody);

    const urnRim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 0.25, 16), this.goldMaterial);
    urnRim.position.y = 1.95;
    group.add(urnRim);

    // Gilded laurel branches inside the urn
    const laurelTop = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0xdeb841, metalness: 0.7, roughness: 0.3 })
    );
    laurelTop.position.y = 2.25;
    group.add(laurelTop);

    return group;
  }

  buildFurniture() {
    // Elegant Velvet Tufted Benches arranged thoughtfully in the alcoves
    // Leaving the center promenade wide and open for comfortable 3D walking
    const benchConfigs = [
      // Room 1 (Salon de l'Amour)
      { x: -3.8, z: 24, rotY: 0 },
      { x: 3.8, z: 24, rotY: 0 },

      // Room 2 (Flanking Centerpiece Rotunda)
      { x: -4.2, z: 0, rotY: 0 },
      { x: 4.2, z: 0, rotY: 0 },

      // Room 3 (Le Temple Éternel)
      { x: -3.8, z: -24, rotY: 0 },
      { x: 3.8, z: -24, rotY: 0 }
    ];

    benchConfigs.forEach(cfg => {
      const bench = this.createVelvetBench();
      bench.position.set(cfg.x, 0, cfg.z);
      bench.rotation.y = cfg.rotY;
      this.scene.add(bench);
    });
  }

  createVelvetBench() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x14070a, roughness: 0.4 });
    const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.5, 10);
    [
      [-1.15, -0.42], [1.15, -0.42],
      [-1.15, 0.42], [1.15, 0.42]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, 0.25, lz);
      group.add(leg);
    });

    // Deep burgundy tufted velvet cushion
    const cushionGeo = new THREE.BoxGeometry(2.7, 0.36, 1.15);
    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x480d17,
      roughness: 0.85,
      metalness: 0.08
    });
    const cushion = new THREE.Mesh(cushionGeo, velvetMat);
    cushion.position.y = 0.66;
    group.add(cushion);

    // Carved gold base trim
    const trimGeo = new THREE.BoxGeometry(2.76, 0.08, 1.2);
    const trim = new THREE.Mesh(trimGeo, this.goldMaterial);
    trim.position.y = 0.48;
    group.add(trim);

    return group;
  }

  buildLighting() {
    // 1. Romantic Chiaroscuro Ambient Light (Warm, subtle, dark wine atmosphere)
    const ambient = new THREE.AmbientLight(0x1a080c, 0.42);
    this.scene.add(ambient);

    // 2. Gentle Moonlight / Skylight Hemispheric Bounce
    const hemisphere = new THREE.HemisphereLight(0xffeed6, 0x120306, 0.32);
    this.scene.add(hemisphere);

    // 3. Strategic Warm Gallery Spotlights along the central hall
    // Creates dramatic chiaroscuro pools of light on parquet & highlights gold frames
    const spotCount = 6;
    const spacing = this.hallLength / spotCount;
    for (let i = 0; i < spotCount; i++) {
      const z = -this.hallLength / 2 + (i + 0.5) * spacing;
      const point = new THREE.PointLight(0xffdf9e, 1.45, 19, 1.8);
      point.position.set(0, 6.2, z);
      this.scene.add(point);
    }
  }

  buildAmbientDust() {
    const particleCount = 160;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * (this.hallWidth - 2);
      positions[i + 1] = Math.random() * (this.hallHeight - 1) + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * (this.hallLength - 4);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xdfb15b,
      size: 0.075,
      transparent: true,
      opacity: 0.5,
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
        pos[i] -= delta * 0.15;
        if (pos[i] < 0.2) pos[i] = this.hallHeight - 1;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
