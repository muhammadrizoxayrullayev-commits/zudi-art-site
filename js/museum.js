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
      // 1. Room 1: Vestibule / Kirish Rotundasi
      { minX: -6.4, maxX: 6.4, minZ: 29.8, maxZ: 42.4, name: 'Room 1: Vestibule' },
      // 2. Corr 1 North
      { minX: -2.7, maxX: 2.7, minZ: 21.8, maxZ: 30.5, name: 'Corr 1 North' },
      // 3. Corr 1-2 East
      { minX: -2.7, maxX: 12.5, minZ: 19.3, maxZ: 24.7, name: 'Corr 1-2 East' },
      // 4. Room 2: East Wing / Atirgullar Zali
      { minX: 11.8, maxX: 22.4, minZ: 14.8, maxZ: 29.4, name: 'Room 2: East Wing' },
      // 5. Corr 2-3 North
      { minX: 14.3, maxX: 19.7, minZ: 7.8, maxZ: 15.5, name: 'Corr 2-3 North' },
      // 6. Corr 2-3 West
      { minX: 5.5, maxX: 19.7, minZ: 5.3, maxZ: 10.7, name: 'Corr 2-3 West' },
      // 7. Room 3: Central Angel Rotunda
      { minX: -6.4, maxX: 6.4, minZ: -0.2, maxZ: 16.4, name: 'Room 3: Central Rotunda' },
      // 8. Corr 3-4 West
      { minX: -12.5, maxX: -5.5, minZ: 5.3, maxZ: 10.7, name: 'Corr 3-4 West' },
      // 9. Room 4: West Wing / Tog'lar Zali
      { minX: -22.4, maxX: -11.8, minZ: 0.8, maxZ: 15.4, name: 'Room 4: West Wing' },
      // 10. Corr 4-5 North
      { minX: -19.7, maxX: -14.3, minZ: -12.5, maxZ: 1.5, name: 'Corr 4-5 North' },
      // 11. Corr 4-5 East
      { minX: -19.7, maxX: -5.5, minZ: -14.7, maxZ: -9.3, name: 'Corr 4-5 East' },
      // 12. Room 5: Bosphorus Marble Palace
      { minX: -6.4, maxX: 6.4, minZ: -18.4, maxZ: -5.8, name: 'Room 5: Bosphorus' },
      // 13. Portal 5-6
      { minX: -2.7, maxX: 2.7, minZ: -20.5, maxZ: -17.5, name: 'Portal 5-6' },
      // 14. Room 6: Golden Sunset Hall
      { minX: -6.4, maxX: 6.4, minZ: -36.4, maxZ: -19.8, name: 'Room 6: Golden Sunset' },
      // 15. Triumphal Portal 6-7
      { minX: -3.3, maxX: 3.3, minZ: -39.5, maxZ: -35.5, name: 'Portal 6-7' },
      // 16. Room 7: Sanctuary of Eternal Love
      { minX: -7.4, maxX: 7.4, minZ: -57.4, maxZ: -38.8, name: 'Room 7: Sanctuary' }
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
    // ROOM 1: VESTIBULE / KIRISH ROTUNDASI (x: [-6, 6], z: [30, 42])
    // ------------------------------------------------------------------------
    this.addWall(0, 42, 12.4, 0.45, true);       // South Entrance Wall
    this.addWall(-6, 36, 12.4, 0.45, false);    // West Wall (Painting #1)
    this.addWall(6, 36, 12.4, 0.45, false);     // East Wall (Painting #2)
    this.addWall(-4.25, 30, 3.5, 0.45, true);   // North Wall Left Wing (Doorway at x: [-2.5, 2.5])
    this.addWall(4.25, 30, 3.5, 0.45, true);    // North Wall Right Wing

    // ------------------------------------------------------------------------
    // CORRIDOR 1-2 (x: [-2.5, 12], z: [19.5, 30])
    // ------------------------------------------------------------------------
    this.addWall(-2.5, 26, 8.0, 0.45, false);   // West Wall (from z=22 to z=30)
    this.addWall(2.5, 27.25, 5.5, 0.45, false); // East Wall (from z=24.5 to z=30)
    this.addWall(0, 19.5, 5.0, 0.45, true);     // North Dead-end Wall
    this.addWall(7.25, 24.5, 9.5, 0.45, true);  // Corr 1-2 South Wall (from x=2.5 to x=12)
    this.addWall(7.25, 19.5, 9.5, 0.45, true);  // Corr 1-2 North Wall (from x=2.5 to x=12)

    // ------------------------------------------------------------------------
    // ROOM 2: EAST WING / ATIRGULLAR ZALI (x: [12, 22], z: [15, 29])
    // ------------------------------------------------------------------------
    this.addWall(12, 26.75, 4.5, 0.45, false);  // West Wall South Wing (Doorway at z: [19.5, 24.5])
    this.addWall(12, 17.25, 4.5, 0.45, false);  // West Wall North Wing
    this.addWall(22, 22, 14.4, 0.45, false);    // East Wall (Painting #4)
    this.addWall(17, 29, 10.4, 0.45, true);     // South Wall (Painting #3)
    this.addWall(13.25, 15, 2.5, 0.45, true);   // North Wall West Wing (Doorway at x: [14.5, 19.5])
    this.addWall(20.75, 15, 2.5, 0.45, true);   // North Wall East Wing

    // ------------------------------------------------------------------------
    // CORRIDOR 2-3 (x: [6, 19.5], z: [5.5, 15])
    // ------------------------------------------------------------------------
    this.addWall(19.5, 11.5, 7.0, 0.45, false); // East Wall (from z=8 to z=15)
    this.addWall(14.5, 12.75, 4.5, 0.45, false);// West Wall (from z=10.5 to z=15)
    this.addWall(17, 5.5, 5.0, 0.45, true);     // North Dead-end Wall
    this.addWall(10.25, 10.5, 8.5, 0.45, true); // Corr 2-3 South Wall (from x=6 to x=14.5)
    this.addWall(10.25, 5.5, 8.5, 0.45, true);  // Corr 2-3 North Wall (from x=6 to x=14.5)

    // ------------------------------------------------------------------------
    // ROOM 3: CENTRAL ANGEL ROTUNDA (x: [-6, 6], z: [0, 16])
    // ------------------------------------------------------------------------
    this.addWall(6, 2.75, 5.5, 0.45, false);    // East Wall North Wing (Doorway at z: [5.5, 10.5])
    this.addWall(6, 13.25, 5.5, 0.45, false);   // East Wall South Wing
    this.addWall(-6, 2.75, 5.5, 0.45, false);   // West Wall North Wing (Doorway at z: [5.5, 10.5])
    this.addWall(-6, 13.25, 5.5, 0.45, false);  // West Wall South Wing
    this.addWall(0, 0, 12.4, 0.45, true);       // North Wall (Painting #5)
    this.addWall(0, 16, 12.4, 0.45, true);      // South Wall (Painting #6)

    // ------------------------------------------------------------------------
    // CORRIDOR 3-4 (x: [-12, -6], z: [5.5, 10.5])
    // ------------------------------------------------------------------------
    this.addWall(-9, 5.5, 6.0, 0.45, true);     // North Wall
    this.addWall(-9, 10.5, 6.0, 0.45, true);    // South Wall

    // ------------------------------------------------------------------------
    // ROOM 4: WEST WING / TOG'LAR ZALI (x: [-22, -12], z: [1, 15])
    // ------------------------------------------------------------------------
    this.addWall(-12, 3.25, 4.5, 0.45, false);  // East Wall North Wing (Doorway at z: [5.5, 10.5])
    this.addWall(-12, 12.75, 4.5, 0.45, false); // East Wall South Wing
    this.addWall(-22, 8, 14.4, 0.45, false);    // West Wall (Painting #7)
    this.addWall(-17, 15, 10.4, 0.45, true);    // South Wall (Painting #8)
    this.addWall(-20.75, 1, 2.5, 0.45, true);   // North Wall West Wing (Doorway at x: [-19.5, -14.5])
    this.addWall(-13.25, 1, 2.5, 0.45, true);   // North Wall East Wing

    // ------------------------------------------------------------------------
    // CORRIDOR 4-5 (x: [-19.5, -6], z: [-14.5, 1])
    // ------------------------------------------------------------------------
    this.addWall(-19.5, -5.5, 13.0, 0.45, false);// West Wall (from z=-12 to z=1)
    this.addWall(-14.5, -4.25, 10.5, 0.45, false);// East Wall (from z=-9.5 to z=1)
    this.addWall(-17, -14.5, 5.0, 0.45, true);  // North Dead-end Wall
    this.addWall(-10.25, -14.5, 8.5, 0.45, true);// Corr 4-5 North Wall (from x=-14.5 to x=-6)
    this.addWall(-10.25, -9.5, 8.5, 0.45, true); // Corr 4-5 South Wall (from x=-14.5 to x=-6)

    // ------------------------------------------------------------------------
    // ROOM 5: BOSPHORUS MARBLE PALACE (x: [-6, 6], z: [-18, -6])
    // ------------------------------------------------------------------------
    this.addWall(-6, -16.25, 3.5, 0.45, false); // West Wall North Wing (Doorway at z: [-14.5, -9.5])
    this.addWall(-6, -7.75, 3.5, 0.45, false);  // West Wall South Wing
    this.addWall(6, -12, 12.4, 0.45, false);    // East Wall (Painting #10)
    this.addWall(0, -6, 12.4, 0.45, true);      // South Wall (Painting #9)
    this.addWall(-4.25, -18, 3.5, 0.45, true);  // North Wall West Wing (Portal at x: [-2.5, 2.5])
    this.addWall(4.25, -18, 3.5, 0.45, true);   // North Wall East Wing

    // ------------------------------------------------------------------------
    // ROOM 6: GOLDEN SUNSET (x: [-6, 6], z: [-36, -20])
    // ------------------------------------------------------------------------
    this.addWall(-4.25, -20, 3.5, 0.45, true);  // South Wall West Wing
    this.addWall(4.25, -20, 3.5, 0.45, true);   // South Wall East Wing
    this.addWall(-6, -28, 16.4, 0.45, false);   // West Wall (Painting #11)
    this.addWall(6, -28, 16.4, 0.45, false);    // East Wall (Painting #12)
    this.addWall(-4.5, -36, 3.0, 0.45, true);   // North Wall West Wing (Triumphal Portal at x: [-3, 3])
    this.addWall(4.5, -36, 3.0, 0.45, true);    // North Wall East Wing

    // ------------------------------------------------------------------------
    // ROOM 7: MONUMENTAL SANCTUARY (x: [-7, 7], z: [-57, -39])
    // ------------------------------------------------------------------------
    this.addWall(-5, -39, 4.0, 0.45, true);     // South Altar Wall West Wing
    this.addWall(5, -39, 4.0, 0.45, true);      // South Altar Wall East Wing
    this.addWall(-7, -48, 18.4, 0.45, false);   // West Wall
    this.addWall(7, -48, 18.4, 0.45, false);    // East Wall
    this.addWall(0, -57, 14.4, 0.45, true);     // North Sanctuary Wall (Painting #13)
  }

  // ==========================================================================
  // PALACE ARCHWAYS & PORTALS
  // ==========================================================================
  buildLabyrinthPortals() {
    const archways = [
      { x: 0, z: 30, rotY: 0, width: 4.8, title: '✨ I. SHARQIY QANOTGA YO\'L ✨' },
      { x: 12, z: 22, rotY: Math.PI / 2, width: 4.8, title: '🌹 II. ATIRGULLAR ZALI 🌹' },
      { x: 6, z: 8, rotY: Math.PI / 2, width: 4.8, title: '🕊️ III. FARISHTA ROTUNDASI 🕊️' },
      { x: -6, z: 8, rotY: Math.PI / 2, width: 4.8, title: '🏔️ IV. TOG\'LAR ZALI 🏔️' },
      { x: -6, z: -12, rotY: Math.PI / 2, width: 4.8, title: '🌊 V. BOSFOR MARMAR QASRI 🌊' },
      { x: 0, z: -19, rotY: 0, width: 4.8, title: '🌅 VI. OLTIN SHAFAQ QASRI 🌅' },
      { x: 0, z: -37.5, rotY: 0, width: 5.8, title: '👑 VII. ABADIY MUHABBAT MEHROBI 👑' }
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
    // 1. Centerpiece: Classical Marble Statue on Circular Dais in Room 3 (Rotunda center: 0, 8)
    const angelStatue = this.createAngelStatue();
    angelStatue.position.set(0, 0, 8);
    angelStatue.userData = { type: 'statue', data: DEFAULT_STATUES[0] };
    this.scene.add(angelStatue);
    this.interactiveObjects.push(angelStatue);

    // 2. Classical Marble Busts on Green Marble Pedestals in key rooms
    const bustPlacements = [
      { x: 17, z: 16.5, rotY: 0, data: DEFAULT_STATUES[1] },        // Room 2: Aphrodite
      { x: -17, z: 2.5, rotY: 0, data: DEFAULT_STATUES[2] },        // Room 4: Apollo
      { x: 0, z: -16.5, rotY: 0, data: DEFAULT_STATUES[3] }         // Room 5: Hermes
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
      { x: 0, z: 39 },     // Room 1
      { x: 17, z: 22 },    // Room 2
      { x: -17, z: 8 },    // Room 4
      { x: 0, z: -12 },    // Room 5
      { x: 0, z: -28 },    // Room 6
      { x: 0, z: -48 }     // Room 7
    ];

    benchPlacements.forEach(bp => {
      const bench = this.createVelvetBench();
      bench.position.set(bp.x, 0, bp.z);
      this.scene.add(bench);
    });
  }

  createAngelStatue() {
    const group = new THREE.Group();

    // 1. Triple-tier Polished Italian Carrara Marble Dais
    const daisMat = new THREE.MeshStandardMaterial({
      map: this.marbleTexture,
      roughness: 0.25
    });

    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, 0.22, 32), daisMat);
    step1.position.y = 0.11;
    group.add(step1);

    const goldRing1 = new THREE.Mesh(new THREE.TorusGeometry(2.22, 0.03, 8, 32), this.goldMaterial);
    goldRing1.rotation.x = Math.PI / 2;
    goldRing1.position.y = 0.22;
    group.add(goldRing1);

    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.75, 0.22, 32), daisMat);
    step2.position.y = 0.33;
    group.add(step2);

    // 2. Classical Octagonal Carved Marble Pedestal
    const pedBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.2), this.goldMaterial);
    pedBase.position.y = 0.56;
    group.add(pedBase);

    const pedShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.52, 1.3, 16),
      daisMat
    );
    pedShaft.position.y = 1.33;
    group.add(pedShaft);

    const pedCap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), this.goldMaterial);
    pedCap.position.y = 2.08;
    group.add(pedCap);

    // 3. Classical Greco-Roman Sculpted Marble Urn with Garland
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xfffaf2,
      roughness: 0.22,
      metalness: 0.05
    });

    const urnBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.3, 24), marbleMat);
    urnBase.position.y = 2.33;
    group.add(urnBase);

    // Sculpted marble amphora belly
    const urnBelly = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 20), marbleMat);
    urnBelly.scale.set(1, 1.35, 1);
    urnBelly.position.y = 2.85;
    group.add(urnBelly);

    // Urn neck & classical rim
    const urnNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 0.45, 24), marbleMat);
    urnNeck.position.y = 3.55;
    group.add(urnNeck);

    const urnRim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 12, 24), this.goldMaterial);
    urnRim.rotation.x = Math.PI / 2;
    urnRim.position.y = 3.8;
    group.add(urnRim);

    // Gilded Laurel Garland draped on urn
    const garland = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 8, 24), this.goldMaterial);
    garland.rotation.x = Math.PI / 2 + 0.2;
    garland.position.y = 2.9;
    group.add(garland);

    // 4. Museum Velvet Stanchion Ropes (4 Brass Posts surrounding dais)
    const stanchionRadius = 1.95;
    const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
    angles.forEach((ang, i) => {
      const px = Math.cos(ang) * stanchionRadius;
      const pz = Math.sin(ang) * stanchionRadius;

      // Brass post
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.95, 12), this.goldMaterial);
      post.position.set(px, 0.475, pz);
      group.add(post);

      const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.06, 16), this.goldMaterial);
      baseRing.position.set(px, 0.03, pz);
      group.add(baseRing);

      const crownBall = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), this.goldMaterial);
      crownBall.position.set(px, 0.98, pz);
      group.add(crownBall);

      // Velvet rope segment connecting to next post
      const nextAng = angles[(i + 1) % angles.length];
      const npx = Math.cos(nextAng) * stanchionRadius;
      const npz = Math.sin(nextAng) * stanchionRadius;

      const midX = (px + npx) / 2;
      const midZ = (pz + npz) / 2;
      const ropeLen = Math.hypot(npx - px, npz - pz);

      const ropeGeo = new THREE.CylinderGeometry(0.03, 0.03, ropeLen, 8);
      const ropeMat = new THREE.MeshStandardMaterial({ color: 0x881326, roughness: 0.6 });
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.position.set(midX, 0.72, midZ);
      rope.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(npx - px, 0, npz - pz).normalize()
      );
      group.add(rope);
    });

    // 5. Museum Brass Plaque
    const plaqueGeo = new THREE.BoxGeometry(0.8, 0.35, 0.05);
    const plaque = new THREE.Mesh(plaqueGeo, this.goldMaterial);
    plaque.position.set(0, 0.56, 1.25);
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
      { x: 0, z: 36, color: 0xffeed0, intensity: 2.5, dist: 22 },    // Room 1: Vestibule
      { x: 17, z: 22, color: 0xffdfd0, intensity: 2.6, dist: 22 },   // Room 2: East Wing
      { x: 0, z: 8, color: 0xfffaea, intensity: 3.5, dist: 26 },     // Room 3: Angel Rotunda
      { x: -17, z: 8, color: 0xffe8c8, intensity: 2.6, dist: 22 },   // Room 4: West Wing
      { x: 0, z: -12, color: 0xffeed0, intensity: 2.5, dist: 22 },   // Room 5: Bosphorus
      { x: 0, z: -28, color: 0xffdfb8, intensity: 2.5, dist: 22 },   // Room 6: Golden Sunset
      { x: 0, z: -48, color: 0xfffaea, intensity: 3.8, dist: 28 }    // Room 7: Sanctuary
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
