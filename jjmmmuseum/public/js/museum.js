// ==========================================================================
// 3D GRAND ROMANTIC PALACE LABYRINTH (7 THEMATIC CHAMBERS & WINDING GALLERIES)
// An authentic European palace maze (Louvre / Hermitage / Versailles pavilions)
// Exactly 2-3 intimate masterworks per room with crystal chandeliers & archways
// ==========================================================================

import { DEFAULT_PAINTINGS, DEFAULT_STATUES, createArtworkCanvas } from './paintings.js';

export class Museum {
  constructor(scene) {
    this.scene = scene;
    this.paintings = [];
    this.interactiveObjects = [];
    this.flames = [];
    this.statues = [];

    this.initTextures();
    this.buildLabyrinthArchitecture();
    this.buildPaintings();
    this.buildStatues();
    this.buildLighting();
    this.buildAmbientDust();
  }

  // ==========================================================================
  // TEXTURES & PALACE MATERIALS
  // ==========================================================================
  initTextures() {
    // 1. Procedural Polished Versailles Parquet Floor
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 512;
    pCanvas.height = 512;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = '#24100c';
    pCtx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    for (let y = 0; y < 512; y += tileSize) {
      for (let x = 0; x < 512; x += tileSize) {
        pCtx.fillStyle = (x / tileSize + y / tileSize) % 2 === 0 ? '#381c15' : '#2b140e';
        pCtx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        pCtx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
        pCtx.lineWidth = 1;
        pCtx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        pCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        pCtx.beginPath();
        pCtx.moveTo(x, y);
        pCtx.lineTo(x + tileSize, y + tileSize);
        pCtx.stroke();
      }
    }
    const parquetTex = new THREE.CanvasTexture(pCanvas);
    parquetTex.wrapS = THREE.RepeatWrapping;
    parquetTex.wrapT = THREE.RepeatWrapping;
    parquetTex.repeat.set(16, 24);
    parquetTex.colorSpace = THREE.SRGBColorSpace;
    this.floorMaterial = new THREE.MeshStandardMaterial({
      map: parquetTex,
      roughness: 0.28,
      metalness: 0.12
    });

    // 2. Velvet Wall Fabric (Burgundy Damask)
    const wCanvas = document.createElement('canvas');
    wCanvas.width = 256;
    wCanvas.height = 256;
    const wCtx = wCanvas.getContext('2d');
    wCtx.fillStyle = '#300810';
    wCtx.fillRect(0, 0, 256, 256);
    wCtx.fillStyle = '#4a0e1a';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * 256;
      const ry = Math.random() * 256;
      wCtx.beginPath();
      wCtx.arc(rx, ry, Math.random() * 2.5, 0, Math.PI * 2);
      wCtx.fill();
    }
    const velvetTex = new THREE.CanvasTexture(wCanvas);
    velvetTex.wrapS = THREE.RepeatWrapping;
    velvetTex.wrapT = THREE.RepeatWrapping;
    velvetTex.repeat.set(4, 4);
    this.upperWallMaterial = new THREE.MeshStandardMaterial({
      map: velvetTex,
      roughness: 0.75,
      metalness: 0.05
    });

    // 3. Dark Mahogany Wainscoting
    this.woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x180b09,
      roughness: 0.38,
      metalness: 0.15
    });

    // 4. Heavy Gilded Gold Material
    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.22,
      metalness: 0.88
    });

    // 5. Emerald Marble Texture
    const mCanvas = document.createElement('canvas');
    mCanvas.width = 256;
    mCanvas.height = 256;
    const mCtx = mCanvas.getContext('2d');
    mCtx.fillStyle = '#061a12';
    mCtx.fillRect(0, 0, 256, 256);
    mCtx.strokeStyle = 'rgba(120, 220, 160, 0.35)';
    mCtx.lineWidth = 1.5;
    for (let i = 0; i < 16; i++) {
      mCtx.beginPath();
      mCtx.moveTo(Math.random() * 256, 0);
      mCtx.bezierCurveTo(Math.random() * 256, 80, Math.random() * 256, 180, Math.random() * 256, 256);
      mCtx.stroke();
    }
    this.marbleTexture = new THREE.CanvasTexture(mCanvas);
    this.marbleTexture.wrapS = THREE.RepeatWrapping;
    this.marbleTexture.wrapT = THREE.RepeatWrapping;
    this.marbleTexture.colorSpace = THREE.SRGBColorSpace;
  }

  // ==========================================================================
  // BUILD 7 THEMATIC CHAMBERS & INTERCONNECTING CORRIDORS
  // ==========================================================================
  buildLabyrinthArchitecture() {
    this.wallHeight = 7.5;

    // List of room & corridor floors: [minX, maxX, minZ, maxZ, roomName]
    const zones = [
      { minX: -6.5, maxX: 6.5, minZ: 29.5, maxZ: 42.5, name: 'Room 1: Vestibule' },
      { minX: -2.5, maxX: 2.5, minZ: 19.5, maxZ: 30.5, name: 'Corr 1: North' },
      { minX: 1.5, maxX: 11.5, minZ: 18.5, maxZ: 23.5, name: 'Corr 1-2: East' },
      { minX: 5.5, maxX: 16.5, minZ: 12.5, maxZ: 25.5, name: 'Room 2: East Wing' },
      { minX: 8.5, maxX: 13.5, minZ: 6.5, maxZ: 14.5, name: 'Corr 2-Exit' },
      { minX: -1.5, maxX: 11.5, minZ: 3.5, maxZ: 8.5, name: 'Corr 2-3: West' },
      { minX: -7.5, maxX: 7.5, minZ: -3.5, maxZ: 11.5, name: 'Room 3: Rotunda' },
      { minX: -14.5, maxX: -6.5, minZ: 1.5, maxZ: 5.5, name: 'Corr 3-4: West' },
      { minX: -19.5, maxX: -8.5, minZ: -9.5, maxZ: 3.5, name: 'Room 4: West Wing' },
      { minX: -16.5, maxX: -11.5, minZ: -18.5, maxZ: -8.5, name: 'Corr 4-5A: North' },
      { minX: -14.5, maxX: 0.5, minZ: -20.5, maxZ: -15.5, name: 'Corr 4-5B: East' },
      { minX: -6.5, maxX: 6.5, minZ: -26.5, maxZ: -13.5, name: 'Room 5: Bosphorus' },
      { minX: -2.8, maxX: 2.8, minZ: -28.5, maxZ: -25.5, name: 'Corr 5-6: North' },
      { minX: -6.5, maxX: 6.5, minZ: -38.5, maxZ: -26.5, name: 'Room 6: Golden Sunset' },
      { minX: -3.5, maxX: 3.5, minZ: -40.5, maxZ: -37.5, name: 'Corr 6-7: Arch' },
      { minX: -8.5, maxX: 8.5, minZ: -52.5, maxZ: -38.5, name: 'Room 7: Sanctuary' }
    ];

    // Build floors & ceilings for each zone
    zones.forEach(z => {
      const w = z.maxX - z.minX;
      const l = z.maxZ - z.minZ;
      const cx = (z.minX + z.maxX) / 2;
      const cz = (z.minZ + z.maxZ) / 2;

      // Floor plane
      const fGeo = new THREE.PlaneGeometry(w, l);
      const floor = new THREE.Mesh(fGeo, this.floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(cx, 0.001, cz);
      this.scene.add(floor);

      // Ceiling plane with dark beams
      const cGeo = new THREE.PlaneGeometry(w, l);
      const ceilMat = new THREE.MeshStandardMaterial({ color: 0x1a0a0c, roughness: 0.7 });
      const ceil = new THREE.Mesh(cGeo, ceilMat);
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(cx, this.wallHeight, cz);
      this.scene.add(ceil);

      // Gold cassette border along ceiling perimeter
      const trimGeo = new THREE.BoxGeometry(w, 0.15, l);
      const trimMat = new THREE.MeshStandardMaterial({ color: 0x2b1016, roughness: 0.5 });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.set(cx, this.wallHeight - 0.08, cz);
      this.scene.add(trim);
    });

    // Build all palace walls
    this.buildLabyrinthWalls();

    // Build majestic arched portals between chambers
    this.buildLabyrinthPortals();
  }

  // ==========================================================================
  // WALL BUILDER HELPER
  // ==========================================================================
  addWall(cx, cz, length, thickness = 0.45, isHorizontal = false) {
    const group = new THREE.Group();

    // 1. Lower Mahogany Wainscoting (0m to 2.3m)
    const wainGeo = isHorizontal
      ? new THREE.BoxGeometry(length, 2.3, thickness)
      : new THREE.BoxGeometry(thickness, 2.3, length);
    const wain = new THREE.Mesh(wainGeo, this.woodMaterial);
    wain.position.y = 1.15;
    group.add(wain);

    // 2. Gold Chair Rail Molding at y = 2.3m
    const railGeo = isHorizontal
      ? new THREE.BoxGeometry(length + 0.06, 0.12, thickness + 0.1)
      : new THREE.BoxGeometry(thickness + 0.1, 0.12, length + 0.06);
    const rail = new THREE.Mesh(railGeo, this.goldMaterial);
    rail.position.y = 2.3;
    group.add(rail);

    // 3. Upper Crimson Velvet Damask Wall (2.3m to 7.5m)
    const upperH = this.wallHeight - 2.3;
    const upperGeo = isHorizontal
      ? new THREE.BoxGeometry(length, upperH, thickness)
      : new THREE.BoxGeometry(thickness, upperH, length);
    const upper = new THREE.Mesh(upperGeo, this.upperWallMaterial);
    upper.position.y = 2.3 + upperH / 2;
    group.add(upper);

    // 4. Gold Entablature & Crown Cornice along top
    const cornGeo = isHorizontal
      ? new THREE.BoxGeometry(length + 0.06, 0.28, thickness + 0.14)
      : new THREE.BoxGeometry(thickness + 0.14, 0.28, length + 0.06);
    const corn = new THREE.Mesh(cornGeo, this.goldMaterial);
    corn.position.y = this.wallHeight - 0.14;
    group.add(corn);

    group.position.set(cx, 0, cz);
    this.scene.add(group);
  }

  buildLabyrinthWalls() {
    // ------------------------------------------------------------------------
    // ROOM 1: VESTIBULE (x: [-6, 6], z: [30, 42])
    // ------------------------------------------------------------------------
    // South Wall (Back of entrance)
    this.addWall(0, 42.2, 12.4, 0.45, true);
    // Left & Right Walls
    this.addWall(-6.2, 36, 12.4, 0.45, false);
    this.addWall(6.2, 36, 12.4, 0.45, false);
    // North Wall wings flanking Doorway 1
    this.addWall(-4.2, 29.8, 3.8, 0.45, true);
    this.addWall(4.2, 29.8, 3.8, 0.45, true);

    // ------------------------------------------------------------------------
    // CORRIDOR 1 & CORRIDOR 1-2 (x: [-2.2, 2.2], z: [21, 30] -> x: [2.2, 11])
    // ------------------------------------------------------------------------
    this.addWall(-2.4, 25.5, 9.0, 0.45, false);
    this.addWall(2.4, 26.5, 7.0, 0.45, false);
    // North dead-end of Corr 1
    this.addWall(0, 20.8, 4.8, 0.45, true);
    // Corr 1-2 horizontal walls
    this.addWall(6.6, 23.2, 8.8, 0.45, true);
    this.addWall(6.6, 18.8, 8.8, 0.45, true);

    // ------------------------------------------------------------------------
    // ROOM 2: EAST WING / ATIRGULLAR ZALI (x: [6, 16], z: [13, 25])
    // ------------------------------------------------------------------------
    this.addWall(16.2, 19, 12.4, 0.45, false); // East Wall
    this.addWall(11, 25.2, 10.4, 0.45, true);  // South Wall
    // North Wall with doorway
    this.addWall(7.5, 12.8, 3.0, 0.45, true);
    this.addWall(14.5, 12.8, 3.0, 0.45, true);
    // West Wall wings
    this.addWall(5.8, 24, 2.4, 0.45, false);
    this.addWall(5.8, 16, 6.0, 0.45, false);

    // ------------------------------------------------------------------------
    // CORRIDOR 2-EXIT & CORRIDOR 2-3 (x: [9, 13], z: [7, 13] -> x: [-1, 11])
    // ------------------------------------------------------------------------
    this.addWall(13.2, 10, 6.0, 0.45, false); // East side
    this.addWall(8.8, 10.5, 5.0, 0.45, false); // West side
    // Corr 2-3 horizontal walls
    this.addWall(5.0, 8.2, 8.0, 0.45, true);
    this.addWall(5.0, 3.8, 8.0, 0.45, true);

    // ------------------------------------------------------------------------
    // ROOM 3: CENTRAL ANGEL ROTUNDA (x: [-7, 7], z: [-3, 11])
    // ------------------------------------------------------------------------
    this.addWall(0, 11.2, 14.4, 0.45, true); // South Wall
    // East Wall wings flanking Corr 2-3 entry
    this.addWall(7.2, 9.5, 3.4, 0.45, false);
    this.addWall(7.2, 0.5, 7.0, 0.45, false);
    // West Wall wings flanking Corr 3-4 exit
    this.addWall(-7.2, 8.5, 5.4, 0.45, false);
    this.addWall(-7.2, -0.5, 5.0, 0.45, false);
    // North Wall
    this.addWall(0, -3.2, 14.4, 0.45, true);

    // ------------------------------------------------------------------------
    // CORRIDOR 3-4 (x: [-14, -7], z: [1.5, 5.5])
    // ------------------------------------------------------------------------
    this.addWall(-10.5, 5.8, 7.0, 0.45, true);
    this.addWall(-10.5, 1.2, 7.0, 0.45, true);

    // ------------------------------------------------------------------------
    // ROOM 4: WEST WING / TOG'LAR ZALI (x: [-19, -9], z: [-9, 3])
    // ------------------------------------------------------------------------
    this.addWall(-19.2, -3, 12.4, 0.45, false); // West Wall
    this.addWall(-14, 3.2, 10.4, 0.45, true);   // South Wall
    // East Wall wings
    this.addWall(-8.8, 0, 4.0, 0.45, false);
    this.addWall(-8.8, -6, 6.0, 0.45, false);
    // North Wall with doorway
    this.addWall(-10.5, -9.2, 3.0, 0.45, true);
    this.addWall(-17.5, -9.2, 3.0, 0.45, true);

    // ------------------------------------------------------------------------
    // CORRIDOR 4-5A & 4-5B (North -> East into Room 5)
    // ------------------------------------------------------------------------
    this.addWall(-16.2, -13.5, 9.0, 0.45, false);
    this.addWall(-11.8, -13.0, 8.0, 0.45, false);
    // Corr 4-5B horizontal walls
    this.addWall(-7.0, -15.8, 14.0, 0.45, true);
    this.addWall(-7.0, -20.2, 14.0, 0.45, true);

    // ------------------------------------------------------------------------
    // ROOM 5: BOSPHORUS MARBLE PALACE (x: [-6, 6], z: [-26, -14])
    // ------------------------------------------------------------------------
    this.addWall(0, -13.8, 12.4, 0.45, true); // South Wall
    // West Wall with doorway from Corr 4-5B
    this.addWall(-6.2, -15, 2.4, 0.45, false);
    this.addWall(-6.2, -23, 6.0, 0.45, false);
    // East Wall
    this.addWall(6.2, -20, 12.4, 0.45, false);
    // North Wall with doorway
    this.addWall(-4.2, -26.2, 4.0, 0.45, true);
    this.addWall(4.2, -26.2, 4.0, 0.45, true);

    // ------------------------------------------------------------------------
    // CORRIDOR 5-6 & ROOM 6: GOLDEN SUNSET (x: [-6, 6], z: [-38, -26])
    // ------------------------------------------------------------------------
    this.addWall(-6.2, -32, 12.4, 0.45, false);
    this.addWall(6.2, -32, 12.4, 0.45, false);
    // North Wall of Room 6 flanking Triumphal Arch
    this.addWall(-4.8, -38.2, 3.4, 0.45, true);
    this.addWall(4.8, -38.2, 3.4, 0.45, true);

    // ------------------------------------------------------------------------
    // ROOM 7: MONUMENTAL SANCTUARY (x: [-8, 8], z: [-52, -38])
    // ------------------------------------------------------------------------
    this.addWall(-8.2, -45, 14.4, 0.45, false); // West Wall
    this.addWall(8.2, -45, 14.4, 0.45, false);  // East Wall
    this.addWall(0, -52.2, 16.4, 0.45, true);   // Far End North Wall
  }

  // ==========================================================================
  // PALACE ARCHWAYS & PORTALS
  // ==========================================================================
  buildLabyrinthPortals() {
    const archways = [
      { x: 0, z: 29.8, rotY: 0, width: 4.4, title: '✨ II. SHARQIY QANOTGA YO\'L ✨' },
      { x: 5.8, z: 21, rotY: Math.PI / 2, width: 4.0, title: '🌹 II. ATIRGULLAR ZALI 🌹' },
      { x: 7.2, z: 6, rotY: Math.PI / 2, width: 4.0, title: '🕊️ III. FARISHTA ROTUNDASI 🕊️' },
      { x: -7.2, z: 3.5, rotY: Math.PI / 2, width: 4.0, title: '🏔️ IV. TOG\'LAR ZALI 🏔️' },
      { x: -6.2, z: -18, rotY: Math.PI / 2, width: 4.0, title: '🌊 V. BOSFOR MARMAR QASRI 🌊' },
      { x: 0, z: -26.2, rotY: 0, width: 4.8, title: '🌅 VI. OLTIN SHAFAQ QASRI 🌅' },
      { x: 0, z: -38.2, rotY: 0, width: 6.4, title: '👑 VII. ABADIY MUHABBAT MEHROBI 👑' }
    ];

    archways.forEach(a => {
      const arch = this.createArchedPortal(a.width, a.title);
      arch.position.set(a.x, 0, a.z);
      arch.rotation.y = a.rotY;
      this.scene.add(arch);
    });
  }

  createArchedPortal(width, titleText) {
    const group = new THREE.Group();
    const halfW = width / 2;

    // Flanking Imperial Emerald Marble Columns
    [-halfW, halfW].forEach(px => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.36, 6.2, 16),
        new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
      );
      col.position.set(px, 3.1, 0);
      group.add(col);

      // Gold plinth & capital
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.85), this.goldMaterial);
      base.position.set(px, 0.22, 0);
      group.add(base);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.9), this.goldMaterial);
      cap.position.set(px, 6.2, 0);
      group.add(cap);
    });

    // Gilded Arch Header & Cornice
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.65, 0.6), this.goldMaterial);
    archTop.position.set(0, 6.5, 0);
    group.add(archTop);

    // Gilded Crown Plaque with Room Title
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 1024;
    plaqueCanvas.height = 140;
    const pCtx = plaqueCanvas.getContext('2d');
    pCtx.fillStyle = '#1c0a0f';
    pCtx.fillRect(0, 0, 1024, 140);
    pCtx.strokeStyle = '#d4af37';
    pCtx.lineWidth = 6;
    pCtx.strokeRect(6, 6, 1012, 128);
    pCtx.font = 'bold 36px "Cinzel", serif';
    pCtx.textAlign = 'center';
    pCtx.textBaseline = 'middle';
    pCtx.fillStyle = '#fae17d';
    pCtx.fillText(titleText, 512, 70);

    const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
    plaqueTex.colorSpace = THREE.SRGBColorSpace;
    const pMat = new THREE.MeshStandardMaterial({
      map: plaqueTex,
      roughness: 0.3,
      metalness: 0.6
    });
    const plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.75, 0.48), pMat);
    plaqueMesh.position.set(0, 6.5, 0.32);
    group.add(plaqueMesh);

    return group;
  }

  // ==========================================================================
  // BUILD PAINTINGS IN THEIR DEDICATED ROOMS (EXACTLY 2 PER ROOM)
  // ==========================================================================
  buildPaintings() {
    DEFAULT_PAINTINGS.forEach(p => {
      const frameGroup = new THREE.Group();

      const savedPhoto = localStorage.getItem(`museum_artwork_${p.id}`);
      const canvas = createArtworkCanvas(p, savedPhoto);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      p.texture = texture;
      p.canvas = canvas;

      const isMonumental = !!p.isMonumental;
      const frameHeight = isMonumental ? 5.2 : 2.5;
      const frameWidth = frameHeight * p.aspect;

      // 1. Ornate Baroque Gold Frame (Carved outer border)
      const frameBorderGeo = new THREE.BoxGeometry(frameWidth + 0.45, frameHeight + 0.45, 0.18);
      const frameBorder = new THREE.Mesh(frameBorderGeo, this.goldMaterial);
      frameGroup.add(frameBorder);

      // 2. Dark Velvet Inner Matting / Liner
      const linerGeo = new THREE.BoxGeometry(frameWidth + 0.12, frameHeight + 0.12, 0.2);
      const liner = new THREE.Mesh(
        linerGeo,
        new THREE.MeshStandardMaterial({ color: 0x18080a, roughness: 0.85 })
      );
      frameGroup.add(liner);

      // 3. Classical Artwork Canvas
      const canvasGeo = new THREE.PlaneGeometry(frameWidth, frameHeight);
      const canvasMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.32,
        metalness: 0.06,
        side: THREE.DoubleSide
      });
      const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
      canvasMesh.position.z = 0.11;
      frameGroup.add(canvasMesh);

      // 4. Polished Brass Museum Plaque (Below frame)
      const plaqueGroup = new THREE.Group();
      const plaqueW = Math.min(frameWidth * 0.8, 2.2);
      const plaqueGeo = new THREE.BoxGeometry(plaqueW, 0.42, 0.06);
      const plaque = new THREE.Mesh(plaqueGeo, this.goldMaterial);
      plaqueGroup.add(plaque);
      plaqueGroup.position.set(0, -frameHeight / 2 - 0.36, 0.06);
      frameGroup.add(plaqueGroup);

      // 5. Double Brass Candle Sconces flanking the painting
      [-frameWidth / 2 - 0.65, frameWidth / 2 + 0.65].forEach(sx => {
        const sconce = this.createWallSconce();
        sconce.position.set(sx, 0, 0.1);
        frameGroup.add(sconce);
      });

      // Position and Orient the Painting Frame
      frameGroup.position.set(p.position.x, p.position.y, p.position.z);
      frameGroup.rotation.y = p.rotationY;

      frameGroup.userData = {
        type: 'painting',
        data: p
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

    // Flickering candle flame
    const flameGeo = new THREE.ConeGeometry(0.03, 0.09, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 0.62, 0.2);
    group.add(flame);
    this.flames.push(flame);

    return group;
  }

  // ==========================================================================
  // CLASSICAL MARBLE SCULPTURES & BUSTS
  // ==========================================================================
  buildStatues() {
    // 1. Centerpiece: Winged Cupid & Psyche Statue in Room 3 (Rotunda)
    const angelStatue = this.createAngelStatue();
    angelStatue.position.set(0, 0, 4);
    angelStatue.userData = { type: 'statue', data: DEFAULT_STATUES[0] };
    this.scene.add(angelStatue);
    this.interactiveObjects.push(angelStatue);

    // 2. Classical Marble Busts on Green Marble Pedestals in key rooms
    const bustPlacements = [
      { x: 11, z: 24.2, rotY: Math.PI, data: DEFAULT_STATUES[1] }, // Room 2: Aphrodite
      { x: -14, z: -8.2, rotY: 0, data: DEFAULT_STATUES[2] },       // Room 4: Apollo
      { x: 0, z: -14.8, rotY: 0, data: DEFAULT_STATUES[3] }        // Room 5: Hermes
    ];

    bustPlacements.forEach(b => {
      const pedestalGroup = new THREE.Group();

      // Green Marble Pedestal Base & Shaft
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), this.goldMaterial);
      base.position.y = 0.15;
      pedestalGroup.add(base);

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 1.25, 16),
        new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.25 })
      );
      shaft.position.y = 0.92;
      pedestalGroup.add(shaft);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.2, 0.75), this.goldMaterial);
      cap.position.y = 1.62;
      pedestalGroup.add(cap);

      // Classical Marble Bust
      const marbleMat = new THREE.MeshStandardMaterial({ color: 0xfaf5ec, roughness: 0.25 });
      const bustTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.45, 12), marbleMat);
      bustTorso.position.y = 1.95;
      pedestalGroup.add(bustTorso);

      const bustHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), marbleMat);
      bustHead.position.y = 2.3;
      pedestalGroup.add(bustHead);

      // Gold Laurel Wreath
      const crown = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 20), this.goldMaterial);
      crown.rotation.x = Math.PI / 2;
      crown.position.y = 2.38;
      pedestalGroup.add(crown);

      pedestalGroup.position.set(b.x, 0, b.z);
      pedestalGroup.rotation.y = b.rotY;
      pedestalGroup.userData = { type: 'statue', data: b.data };

      this.scene.add(pedestalGroup);
      this.interactiveObjects.push(pedestalGroup);
    });

    // 3. Red Velvet Stately Benches in each chamber
    const benchPlacements = [
      { x: 0, z: 39 },    // Room 1
      { x: 11, z: 22 },   // Room 2
      { x: -14, z: -6 },  // Room 4
      { x: 0, z: -23 },   // Room 5
      { x: 0, z: -35 }    // Room 6
    ];

    benchPlacements.forEach(bp => {
      const bench = this.createVelvetBench();
      bench.position.set(bp.x, 0, bp.z);
      this.scene.add(bench);
    });
  }

  createAngelStatue() {
    const group = new THREE.Group();

    // 1. Stepped Circular Marble Dais
    const daisMat = new THREE.MeshStandardMaterial({
      map: this.marbleTexture,
      roughness: 0.25
    });
    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.25, 32), daisMat);
    step1.position.y = 0.125;
    group.add(step1);

    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 0.25, 32), daisMat);
    step2.position.y = 0.375;
    group.add(step2);

    // Gilded plinth
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.45, 24), this.goldMaterial);
    plinth.position.y = 0.72;
    group.add(plinth);

    // Pure Carrara White Marble for the Angel Figures
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xfffaf2,
      roughness: 0.22,
      metalness: 0.05
    });

    // Winged Angel Body
    const angelTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.1, 14), marbleMat);
    angelTorso.position.y = 1.45;
    group.add(angelTorso);

    const angelHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), marbleMat);
    angelHead.position.y = 2.15;
    group.add(angelHead);

    // Spreading Angel Wings
    [-1, 1].forEach(side => {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 0.2, 1.7, -0.15);

      const wingArch = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.4, 0.45),
        marbleMat
      );
      wingArch.rotation.z = side * 0.4;
      wingArch.rotation.y = -side * 0.35;
      wingArch.position.set(side * 0.45, 0.45, 0);
      wingGroup.add(wingArch);

      group.add(wingGroup);
    });

    // Psyche (Lover embracing the Angel)
    const loverTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.95, 14), marbleMat);
    loverTorso.position.set(0.25, 1.35, 0.15);
    loverTorso.rotation.z = -0.25;
    group.add(loverTorso);

    const loverHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), marbleMat);
    loverHead.position.set(0.15, 1.95, 0.2);
    group.add(loverHead);

    // Gold Plaque on Dais
    const plaqueGeo = new THREE.BoxGeometry(1.8, 0.35, 0.06);
    const plaque = new THREE.Mesh(plaqueGeo, this.goldMaterial);
    plaque.position.set(0, 0.72, 1.25);
    group.add(plaque);

    return group;
  }

  createVelvetBench() {
    const group = new THREE.Group();
    const benchGeo = new THREE.BoxGeometry(2.4, 0.35, 0.9);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x5a0f1b, roughness: 0.75 });
    const cushion = new THREE.Mesh(benchGeo, benchMat);
    cushion.position.y = 0.52;
    group.add(cushion);

    const goldBase = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.1, 0.95), this.goldMaterial);
    goldBase.position.y = 0.32;
    group.add(goldBase);

    [-1.0, 1.0].forEach(lx => {
      [-0.32, 0.32].forEach(lz => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.32, 10), this.goldMaterial);
        leg.position.set(lx, 0.16, lz);
        group.add(leg);
      });
    });

    return group;
  }

  // ==========================================================================
  // ROOM CHANDELIERS & GALLERY LIGHTING
  // ==========================================================================
  buildLighting() {
    // Chandelier locations at the heart of each room
    const chandeliers = [
      { x: 0, z: 36, color: 0xffeed0, intensity: 2.5, dist: 22 },   // Room 1
      { x: 11, z: 19, color: 0xffdfd0, intensity: 2.4, dist: 20 },  // Room 2
      { x: 0, z: 4, color: 0xfffaea, intensity: 3.5, dist: 26 },    // Room 3 (Angel)
      { x: -14, z: -3, color: 0xffe8c8, intensity: 2.4, dist: 20 }, // Room 4
      { x: 0, z: -20, color: 0xffeed0, intensity: 2.5, dist: 22 },  // Room 5
      { x: 0, z: -32, color: 0xffdfb8, intensity: 2.5, dist: 22 },  // Room 6
      { x: 0, z: -45, color: 0xfffaea, intensity: 3.8, dist: 28 }   // Room 7 (Sanctuary)
    ];

    chandeliers.forEach(c => {
      const chGroup = this.createChandelierMesh();
      chGroup.position.set(c.x, this.wallHeight, c.z);
      this.scene.add(chGroup);

      const light = new THREE.PointLight(c.color, c.intensity, c.dist, 1.2);
      light.position.set(c.x, this.wallHeight - 1.8, c.z);
      this.scene.add(light);
    });

    // Subtle global romantic ambient light
    const amb = new THREE.AmbientLight(0x280e15, 0.85);
    this.scene.add(amb);
  }

  createChandelierMesh() {
    const group = new THREE.Group();

    // Central brass rod from ceiling
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), this.goldMaterial);
    rod.position.y = -0.7;
    group.add(rod);

    // Tier 1 Crown
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.04, 8, 24), this.goldMaterial);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = -1.2;
    group.add(ring1);

    // Tier 2 Crown
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.05, 8, 30), this.goldMaterial);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = -1.5;
    group.add(ring2);

    // Crystal Prisms (Glass pendants)
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xfffbe8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.35, 6), crystalMat);
      crystal.rotation.x = Math.PI;
      crystal.position.set(Math.cos(angle) * 1.3, -1.7, Math.sin(angle) * 1.3);
      group.add(crystal);
    }

    return group;
  }

  // ==========================================================================
  // FLOATING ROMANTIC DUST PARTICLES
  // ==========================================================================
  buildAmbientDust() {
    const particleCount = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 36;
      positions[i + 1] = Math.random() * 6.5 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 80;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfae17d,
      size: 0.06,
      transparent: true,
      opacity: 0.4
    });

    this.dustParticles = new THREE.Points(geo, mat);
    this.scene.add(this.dustParticles);
  }

  update(delta) {
    // Flickering candle flames
    const time = Date.now() * 0.005;
    this.flames.forEach((flame, idx) => {
      flame.scale.y = 0.9 + Math.sin(time + idx * 1.7) * 0.22;
      flame.scale.x = 0.95 + Math.cos(time + idx * 2.3) * 0.15;
    });

    // Drift ambient dust particles gently
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 0.08;
        if (positions[i] < 0.2) positions[i] = 6.8;
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
