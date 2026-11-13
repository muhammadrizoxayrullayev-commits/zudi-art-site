// ==========================================================================
// 3D GRAND ROMANTIC ART MUSEUM ARCHITECTURE (AUTHENTIC NEOCLASSICAL PALACE)
// Inspired by Louvre & Hermitage Grand Galleries (Pinterest aesthetic)
// Pure vertical walls, coffered ceiling, chiaroscuro darkness & gold Baroque frames
// ==========================================================================

import { DEFAULT_PAINTINGS, createArtworkCanvas } from './paintings.js';

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
    this.buildColumns();
    this.buildPaintings();
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

    // 2. Pure Vertical Left & Right Gallery Walls (No obstructions!)
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

    // 3. End Walls (Grand Entrance & Far End Portal)
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
      const archPortal = this.createArchPortal();
      archPortal.position.set(0, 0, zPos + (idx === 0 ? 0.3 : -0.3));
      if (idx === 0) archPortal.rotation.y = Math.PI;
      this.scene.add(archPortal);
    });

    // 4. Stately Classical Coffered Ceiling (Flat, High, Elegant — No Blocking Meshes!)
    this.buildCofferedCeiling();
  }

  createArchPortal() {
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

    // Deep crimson velvet drapery inside arch
    const drapeGeo = new THREE.PlaneGeometry(4.2, 5.2);
    const drapeMat = new THREE.MeshStandardMaterial({
      color: 0x3d0b14,
      roughness: 0.85,
      side: THREE.DoubleSide
    });
    const drape = new THREE.Mesh(drapeGeo, drapeMat);
    drape.position.set(0, 3.2, -0.05);
    group.add(drape);

    return group;
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

  buildFurniture() {
    // Elegant Velvet Tufted Benches placed gracefully along center aisle (leaving entrance clear)
    const benchZPositions = [10, -2, -14, -26];
    benchZPositions.forEach(z => {
      const bench = this.createVelvetBench();
      bench.position.set(0, 0, z);
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
