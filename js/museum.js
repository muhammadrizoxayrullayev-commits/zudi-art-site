// ==========================================================================
// 3D GRAND ROMANTIC ART MUSEUM ARCHITECTURE
// Faithfully matches European grand palace galleries (Pinterest aesthetic)
// ==========================================================================

import { DEFAULT_PAINTINGS, createArtworkCanvas } from './paintings.js';

export class Museum {
  constructor(scene) {
    this.scene = scene;
    this.paintings = [];
    this.interactiveObjects = [];
    this.lights = [];
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

    // Dark rich oak parquet tones
    fCtx.fillStyle = '#1e110b';
    fCtx.fillRect(0, 0, 512, 512);

    // Draw wood planks pattern
    const plankW = 64;
    const plankH = 16;
    for (let y = 0; y < 512; y += plankH) {
      for (let x = 0; x < 512; x += plankW) {
        const offset = (Math.floor(y / plankH) % 2) * (plankW / 2);
        const px = (x + offset) % 512;
        const shade = Math.floor(Math.random() * 20) - 10;
        fCtx.fillStyle = `rgb(${32 + shade}, ${18 + Math.floor(shade * 0.6)}, ${12 + Math.floor(shade * 0.4)})`;
        fCtx.fillRect(px, y, plankW - 2, plankH - 2);

        // Wood grain lines
        fCtx.strokeStyle = 'rgba(0,0,0,0.2)';
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

    // 2. Deep Burgundy Damask Wall Texture
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wCtx = wallCanvas.getContext('2d');
    wCtx.fillStyle = '#300a10'; // Rich deep crimson/wine red
    wCtx.fillRect(0, 0, 512, 512);

    // Subtle damask / velvet floral repeat
    wCtx.fillStyle = 'rgba(80, 16, 26, 0.45)';
    for (let y = 0; y < 512; y += 64) {
      for (let x = 0; x < 512; x += 64) {
        wCtx.beginPath();
        wCtx.arc(x + 32, y + 32, 18, 0, Math.PI * 2);
        wCtx.fill();
        wCtx.beginPath();
        wCtx.arc(x, y, 10, 0, Math.PI * 2);
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
    mCtx.fillStyle = '#0c1613'; // Dark green-black marble
    mCtx.fillRect(0, 0, 256, 256);
    mCtx.strokeStyle = 'rgba(60, 140, 100, 0.2)';
    mCtx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
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
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x4a3a0e,
      emissiveIntensity: 0.15
    });
  }

  buildArchitecture() {
    const halfW = this.hallWidth / 2;
    const halfL = this.hallLength / 2;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(this.hallWidth, this.hallLength);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.floorTexture,
      roughness: 0.35,
      metalness: 0.25
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Lower Wainscoting (Dark Wood Baseboard) Materials
    const wainscotMat = new THREE.MeshStandardMaterial({
      color: 0x160c0e,
      roughness: 0.5,
      metalness: 0.2
    });

    // Upper Damask Wall Material
    const upperWallMat = new THREE.MeshStandardMaterial({
      map: this.wallTexture,
      roughness: 0.75,
      metalness: 0.1
    });

    // Build Left and Right Walls (Upper Damask + Lower Wainscot)
    [-halfW, halfW].forEach(xPos => {
      // Lower Wainscot
      const wainscotGeo = new THREE.BoxGeometry(0.4, 2.2, this.hallLength);
      const wainscot = new THREE.Mesh(wainscotGeo, wainscotMat);
      wainscot.position.set(xPos, 1.1, 0);
      wainscot.receiveShadow = true;
      this.scene.add(wainscot);

      // Gold Dado Rail Molding on top of wainscot
      const dadoGeo = new THREE.BoxGeometry(0.5, 0.1, this.hallLength);
      const dado = new THREE.Mesh(dadoGeo, this.goldMaterial);
      dado.position.set(xPos, 2.25, 0);
      this.scene.add(dado);

      // Upper Damask Wall
      const wallGeo = new THREE.BoxGeometry(0.3, this.hallHeight - 2.3, this.hallLength);
      const wall = new THREE.Mesh(wallGeo, upperWallMat);
      wall.position.set(xPos, (this.hallHeight + 2.3) / 2, 0);
      wall.receiveShadow = true;
      this.scene.add(wall);
    });

    // End Walls (Entrance and Far End Gallery Portals)
    [-halfL, halfL].forEach((zPos, idx) => {
      // Lower
      const endWainscotGeo = new THREE.BoxGeometry(this.hallWidth, 2.2, 0.4);
      const endW = new THREE.Mesh(endWainscotGeo, wainscotMat);
      endW.position.set(0, 1.1, zPos);
      this.scene.add(endW);

      // Upper End Wall with Grand Classical Archway
      const endWallGeo = new THREE.BoxGeometry(this.hallWidth, this.hallHeight - 2.2, 0.3);
      const endWall = new THREE.Mesh(endWallGeo, upperWallMat);
      endWall.position.set(0, (this.hallHeight + 2.2) / 2, zPos);
      this.scene.add(endWall);

      // Arch Molding Frame around center portal
      const archPortal = this.createArchPortal();
      archPortal.position.set(0, 0, zPos + (idx === 0 ? 0.3 : -0.3));
      if (idx === 0) archPortal.rotation.y = Math.PI;
      this.scene.add(archPortal);
    });

    // High Vaulted Barrel Ceiling with Central Glass Skylight
    this.buildVaultedCeiling();
  }

  createArchPortal() {
    const group = new THREE.Group();
    // Two flanking pillars for portal
    [-2.2, 2.2].forEach(px => {
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.38, 5.5, 16),
        new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
      );
      p.position.set(px, 2.75, 0);
      group.add(p);

      // Gold base and capital
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.9), this.goldMaterial);
      base.position.set(px, 0.2, 0);
      group.add(base);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.9), this.goldMaterial);
      cap.position.set(px, 5.5, 0);
      group.add(cap);
    });

    // Arch Entablature
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.8, 0.8), this.goldMaterial);
    archTop.position.set(0, 5.9, 0);
    group.add(archTop);

    return group;
  }

  buildVaultedCeiling() {
    const halfL = this.hallLength / 2;
    const radius = this.hallWidth / 2;

    // Arched Vault Shell
    const vaultGeo = new THREE.CylinderGeometry(
      radius, radius, this.hallLength, 32, 1, true, -Math.PI / 2, Math.PI
    );
    const vaultMat = new THREE.MeshStandardMaterial({
      color: 0x24090e,
      roughness: 0.85,
      side: THREE.BackSide
    });
    const vault = new THREE.Mesh(vaultGeo, vaultMat);
    vault.rotation.z = Math.PI / 2;
    vault.rotation.y = Math.PI / 2;
    vault.position.set(0, this.hallHeight - 1, 0);
    this.scene.add(vault);

    // Golden Rib Arches dividing each bay
    for (let i = 0; i <= this.bayCount; i++) {
      const z = -halfL + i * this.bayLength;
      const ribGeo = new THREE.TorusGeometry(radius - 0.05, 0.25, 8, 32, Math.PI);
      const rib = new THREE.Mesh(ribGeo, this.goldMaterial);
      rib.position.set(0, this.hallHeight - 1, z);
      rib.rotation.y = Math.PI / 2;
      this.scene.add(rib);
    }

    // Central Glass Skylight (Simulating the deep night sky glass in the Pinterest photo)
    const skylightGeo = new THREE.PlaneGeometry(3.2, this.hallLength);
    const skylightMat = new THREE.MeshStandardMaterial({
      color: 0x091424, // Midnight deep blue
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0c203b,
      emissiveIntensity: 0.6,
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

        // Fluted Marble Shaft
        const shaftGeo = new THREE.CylinderGeometry(0.38, 0.42, colHeight, 20);
        const shaft = new THREE.Mesh(
          shaftGeo,
          new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.35, metalness: 0.2 })
        );
        shaft.position.y = colHeight / 2 + 0.4;
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        colGroup.add(shaft);

        // Gold Plinth Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), this.goldMaterial);
        base.position.y = 0.25;
        colGroup.add(base);

        // Gold Corinthian Capital
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
      const y = 3.6; // Center height on wall

      const frameGroup = new THREE.Group();

      // Retrieve locally saved custom photo if user previously uploaded one
      const savedPhoto = localStorage.getItem(`museum_artwork_${p.id}`);
      const canvas = createArtworkCanvas(p, savedPhoto);
      const texture = new THREE.CanvasTexture(canvas);
      p.texture = texture;
      p.canvas = canvas;

      // Frame Dimensions
      const frameHeight = 2.4;
      const frameWidth = frameHeight * p.aspect;

      // 1. Ornate Baroque Gold Frame Border
      const frameBorderGeo = new THREE.BoxGeometry(frameWidth + 0.4, frameHeight + 0.4, 0.18);
      const frameBorder = new THREE.Mesh(frameBorderGeo, this.goldMaterial);
      frameBorder.castShadow = true;
      frameGroup.add(frameBorder);

      // Inner Dark Frame Liner
      const linerGeo = new THREE.BoxGeometry(frameWidth + 0.1, frameHeight + 0.1, 0.2);
      const liner = new THREE.Mesh(
        linerGeo,
        new THREE.MeshStandardMaterial({ color: 0x1a0d0a, roughness: 0.6 })
      );
      frameGroup.add(liner);

      // 2. Painting Canvas Surface
      const canvasGeo = new THREE.PlaneGeometry(frameWidth, frameHeight);
      const canvasMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.05
      });
      const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
      canvasMesh.position.z = 0.11;
      frameGroup.add(canvasMesh);

      // 3. Brass Museum Plaque Underneath
      const plaqueGroup = new THREE.Group();
      const plaqueGeo = new THREE.BoxGeometry(1.6, 0.45, 0.06);
      const plaque = new THREE.Mesh(plaqueGeo, this.goldMaterial);
      plaqueGroup.add(plaque);

      plaqueGroup.position.set(0, -frameHeight / 2 - 0.4, 0.06);
      frameGroup.add(plaqueGroup);

      // 4. Double Brass Candle Wall Sconces flanking the painting
      [-frameWidth / 2 - 0.8, frameWidth / 2 + 0.8].forEach(sx => {
        const sconce = this.createWallSconce();
        sconce.position.set(sx, 0, 0.1);
        frameGroup.add(sconce);
      });

      // Align rotation and position according to wall
      if (p.side === 'left') {
        frameGroup.rotation.y = Math.PI / 2;
        frameGroup.position.set(x, y, z);
      } else {
        frameGroup.rotation.y = -Math.PI / 2;
        frameGroup.position.set(x, y, z);
      }

      // Add clickable interaction data
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
    // Brass mount plate
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 12), this.goldMaterial);
    plate.rotation.x = Math.PI / 2;
    group.add(plate);

    // Curved brass arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), this.goldMaterial);
    arm.rotation.z = Math.PI / 3;
    arm.position.set(0, 0.1, 0.12);
    group.add(arm);

    // Candle cup
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.1, 10), this.goldMaterial);
    cup.position.set(0, 0.28, 0.2);
    group.add(cup);

    // Glowing candle flame
    const flameGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffdd88 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 0.38, 0.2);
    group.add(flame);

    // Warm Flame Point Light
    const flameLight = new THREE.PointLight(0xffa844, 0.8, 6, 2);
    flameLight.position.set(0, 0.42, 0.25);
    group.add(flameLight);

    return group;
  }

  buildFurniture() {
    // Red velvet classical museum benches in the center of the hall
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
    // Dark mahogany legs
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x140a0c, roughness: 0.4 });
    const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.5, 10);
    [
      [-1.1, -0.4], [1.1, -0.4],
      [-1.1, 0.4], [1.1, 0.4]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, 0.25, lz);
      group.add(leg);
    });

    // Tufted Red Velvet Cushion
    const cushionGeo = new THREE.BoxGeometry(2.6, 0.35, 1.1);
    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x4a0e18, // Rich deep burgundy velvet
      roughness: 0.85,
      metalness: 0.1
    });
    const cushion = new THREE.Mesh(cushionGeo, velvetMat);
    cushion.position.y = 0.65;
    cushion.castShadow = true;
    cushion.receiveShadow = true;
    group.add(cushion);

    // Gold Trim edge
    const trimGeo = new THREE.BoxGeometry(2.65, 0.08, 1.15);
    const trim = new THREE.Mesh(trimGeo, this.goldMaterial);
    trim.position.y = 0.48;
    group.add(trim);

    return group;
  }

  buildLighting() {
    // 1. Soft Warm Ambient Light (Night museum atmosphere)
    const ambient = new THREE.AmbientLight(0x281216, 0.6);
    this.scene.add(ambient);

    // 2. Soft Midnight Sky Light from the skylight above
    const moonHemisphere = new THREE.HemisphereLight(0x182a44, 0x140a0d, 0.4);
    this.scene.add(moonHemisphere);

    // 3. Overhead Spotlights illuminating the museum walkway and paintings
    const spotCount = 6;
    const spacing = this.hallLength / spotCount;
    for (let i = 0; i < spotCount; i++) {
      const z = -this.hallLength / 2 + (i + 0.5) * spacing;

      const spot = new THREE.PointLight(0xffecd0, 1.1, 14, 1.8);
      spot.position.set(0, 7.8, z);
      this.scene.add(spot);
    }
  }

  buildAmbientDust() {
    // Subtle golden romantic dust particles floating in the air
    const particleCount = 200;
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
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(delta) {
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

