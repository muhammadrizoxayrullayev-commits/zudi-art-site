// ==========================================================================
// 3D GRAND ROMANTIC PALACE LABYRINTH (7 THEMATIC CHAMBERS & WINDING GALLERIES)
// An authentic European palace maze (Louvre / Hermitage / Versailles pavilions)
// Exactly 2-3 intimate masterworks per room with crystal chandeliers & archways
// ==========================================================================

import { DEFAULT_PAINTINGS, DEFAULT_STATUES, createArtworkCanvas } from './paintings.js?v=v7_masterpiece_247';

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
    this.parquetCanvas = pCanvas;
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

    // 6. Polished Italian Carrara Statuary Marble (for Classical Sculptures)
    this.carraraMarbleMaterial = new THREE.MeshStandardMaterial({
      color: 0xfcf8f2,
      roughness: 0.2,
      metalness: 0.04
    });

    // 7. Russian Imperial Polished Mahogany (for MEB-1167 Empire Divan)
    this.mahoganyMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d170e,
      roughness: 0.22,
      metalness: 0.08
    });

    // 8. Russian Imperial Striped Silk Fabric (Navy & Midnight Blue with Gold Pinstripes)
    const dCanvas = document.createElement('canvas');
    dCanvas.width = 256;
    dCanvas.height = 256;
    const dCtx = dCanvas.getContext('2d');
    dCtx.fillStyle = '#101c30';
    dCtx.fillRect(0, 0, 256, 256);
    const stripeW = 32;
    for (let x = 0; x < 256; x += stripeW) {
      if ((x / stripeW) % 2 === 0) {
        dCtx.fillStyle = '#182b48';
        dCtx.fillRect(x, 0, stripeW, 256);
      }
      dCtx.strokeStyle = 'rgba(212, 175, 55, 0.28)';
      dCtx.lineWidth = 1.5;
      dCtx.strokeRect(x + 1, 0, stripeW - 2, 256);
    }
    const divanTex = new THREE.CanvasTexture(dCanvas);
    divanTex.wrapS = THREE.RepeatWrapping;
    divanTex.wrapT = THREE.RepeatWrapping;
    divanTex.repeat.set(4, 4);
    divanTex.colorSpace = THREE.SRGBColorSpace;
    this.divanFabricMaterial = new THREE.MeshStandardMaterial({
      map: divanTex,
      roughness: 0.42,
      metalness: 0.12
    });
  }

  // ==========================================================================
  // BUILD 7 THEMATIC CHAMBERS & INTERCONNECTING CORRIDORS
  // ==========================================================================
  buildLabyrinthArchitecture() {
    this.wallHeight = 7.5;

    // List of room & corridor floors: [minX, maxX, minZ, maxZ, roomName]
    // Boundaries meet edge-to-edge for zero z-fighting, complete enclosure and continuous parquet
    const zones = [
      // 1. Room 1: Vestibule / Kirish Rotundasi
      { minX: -6.4, maxX: 6.4, minZ: 30.0, maxZ: 42.4, name: 'Room 1: Vestibule' },
      // 2. Corr 1 North (full vertical leg from z=19.3 to z=30.0)
      { minX: -2.7, maxX: 2.7, minZ: 19.3, maxZ: 30.0, name: 'Corr 1 North' },
      // 3. Corr 1-2 East (full horizontal leg from x=2.7 to x=12.0, z from 19.3 to 24.7)
      { minX: 2.7, maxX: 12.0, minZ: 19.3, maxZ: 24.7, name: 'Corr 1-2 East' },
      // 4. Room 2: East Wing / Atirgullar Zali
      { minX: 12.0, maxX: 22.4, minZ: 14.8, maxZ: 29.4, name: 'Room 2: East Wing' },
      // 5. Corr 2-3 North (full vertical leg from z=5.3 to z=15.0)
      { minX: 14.3, maxX: 19.7, minZ: 5.3, maxZ: 15.0, name: 'Corr 2-3 North' },
      // 6. Corr 2-3 West (full horizontal leg from x=6.0 to x=14.3, z from 5.3 to 10.7)
      { minX: 6.0, maxX: 14.3, minZ: 5.3, maxZ: 10.7, name: 'Corr 2-3 West' },
      // 7. Room 3: Central Angel Rotunda
      { minX: -6.0, maxX: 6.0, minZ: -0.2, maxZ: 16.4, name: 'Room 3: Central Rotunda' },
      // 8. Corr 3-4 West
      { minX: -12.0, maxX: -6.0, minZ: 5.3, maxZ: 10.7, name: 'Corr 3-4 West' },
      // 9. Room 4: West Wing / Tog'lar Zali
      { minX: -22.4, maxX: -12.0, minZ: 0.8, maxZ: 15.4, name: 'Room 4: West Wing' },
      // 10. Corr 4-5 North (full vertical leg from z=-14.7 to z=1.0)
      { minX: -19.7, maxX: -14.3, minZ: -14.7, maxZ: 1.0, name: 'Corr 4-5 North' },
      // 11. Corr 4-5 East (full horizontal leg from x=-14.3 to x=-6.0, z from -14.7 to -9.3)
      { minX: -14.3, maxX: -6.0, minZ: -14.7, maxZ: -9.3, name: 'Corr 4-5 East' },
      // 12. Room 5: Bosphorus Marble Palace
      { minX: -6.0, maxX: 6.4, minZ: -18.0, maxZ: -5.8, name: 'Room 5: Bosphorus' },
      // 13. Portal 5-6
      { minX: -2.7, maxX: 2.7, minZ: -20.0, maxZ: -18.0, name: 'Portal 5-6' },
      // 14. Room 6: Golden Sunset Hall
      { minX: -6.4, maxX: 6.4, minZ: -36.0, maxZ: -20.0, name: 'Room 6: Golden Sunset' },
      // 15. Triumphal Portal 6-7
      { minX: -3.3, maxX: 3.3, minZ: -39.0, maxZ: -36.0, name: 'Portal 6-7' },
      // 16. Room 7: Sanctuary of Eternal Love
      { minX: -7.4, maxX: 7.4, minZ: -57.4, maxZ: -39.0, name: 'Room 7: Sanctuary' }
    ];

    // Master Seamless Foundation Floor & Ceiling (Guarantees 100% zero holes/voids anywhere in the palace)
    const masterFloorTex = new THREE.CanvasTexture(this.parquetCanvas);
    masterFloorTex.wrapS = THREE.RepeatWrapping;
    masterFloorTex.wrapT = THREE.RepeatWrapping;
    masterFloorTex.colorSpace = THREE.SRGBColorSpace;
    masterFloorTex.repeat.set(90 / 0.8, 160 / 0.8);

    const masterFloorMat = new THREE.MeshStandardMaterial({
      map: masterFloorTex,
      roughness: 0.55,
      metalness: 0.0
    });
    const masterFloor = new THREE.Mesh(new THREE.PlaneGeometry(90, 160), masterFloorMat);
    masterFloor.rotation.x = -Math.PI / 2;
    masterFloor.position.set(0, 0.0, -10);
    this.scene.add(masterFloor);

    const masterCeilMat = new THREE.MeshStandardMaterial({ color: 0x18080a, roughness: 0.8 });
    const masterCeil = new THREE.Mesh(new THREE.PlaneGeometry(90, 160), masterCeilMat);
    masterCeil.rotation.x = Math.PI / 2;
    masterCeil.position.set(0, this.wallHeight + 0.02, -10);
    this.scene.add(masterCeil);

    // Build floors & ceilings for each zone with continuous world-space UV parquet
    zones.forEach(z => {
      const w = z.maxX - z.minX;
      const l = z.maxZ - z.minZ;
      const cx = (z.minX + z.maxX) / 2;
      const cz = (z.minZ + z.maxZ) / 2;

      // Floor plane with world-space 0.8m x 0.8m parquet scaling
      const fGeo = new THREE.PlaneGeometry(w, l);
      const floorTex = new THREE.CanvasTexture(this.parquetCanvas);
      floorTex.wrapS = THREE.RepeatWrapping;
      floorTex.wrapT = THREE.RepeatWrapping;
      floorTex.colorSpace = THREE.SRGBColorSpace;
      floorTex.repeat.set(w / 0.8, l / 0.8);
      const uOffset = (((z.minX % 0.8) + 0.8) % 0.8) / 0.8;
      const vOffset = (((z.minZ % 0.8) + 0.8) % 0.8) / 0.8;
      floorTex.offset.set(uOffset, vOffset);

      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.55,
        metalness: 0.0
      });
      const floor = new THREE.Mesh(fGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(cx, 0.002, cz);
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
  addWall(cx, cz, length, thickness = 0.48, isHorizontal = false) {
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
    this.addWall(0, 42, 12.8, 0.48, true);       // South Entrance Wall
    this.addWall(-6, 36, 12.8, 0.48, false);    // West Wall (Painting #1)
    this.addWall(6, 36, 12.8, 0.48, false);     // East Wall (Painting #2)
    this.addWall(-4.25, 30, 4.0, 0.48, true);   // North Wall Left Wing (Doorway at x: [-2.25, 2.25])
    this.addWall(4.25, 30, 4.0, 0.48, true);    // North Wall Right Wing

    // ------------------------------------------------------------------------
    // CORRIDOR 1-2 (x: [-2.5, 12], z: [19.5, 30])
    // ------------------------------------------------------------------------
    this.addWall(-2.5, 25.5, 9.5, 0.48, false); // West Wall (from z=20.75 to z=30.25)
    this.addWall(2.5, 27.25, 6.0, 0.48, false); // East Wall (from z=24.25 to z=30.25)
    this.addWall(0, 19.5, 5.5, 0.48, true);     // North Dead-end Wall
    this.addWall(7.25, 24.5, 10.0, 0.48, true); // Corr 1-2 South Wall (from x=2.25 to x=12.25)
    this.addWall(7.25, 19.5, 10.0, 0.48, true); // Corr 1-2 North Wall (from x=2.25 to x=12.25)

    // ------------------------------------------------------------------------
    // ROOM 2: EAST WING / ATIRGULLAR ZALI (x: [12, 22], z: [15, 29])
    // ------------------------------------------------------------------------
    this.addWall(12, 26.75, 5.0, 0.48, false);  // West Wall South Wing (Doorway at z: [19.5, 24.5])
    this.addWall(12, 17.25, 5.0, 0.48, false);  // West Wall North Wing
    this.addWall(22, 22, 14.8, 0.48, false);    // East Wall (Painting #4)
    this.addWall(17, 29, 10.8, 0.48, true);     // South Wall (Painting #3)
    this.addWall(13.25, 15, 3.0, 0.48, true);   // North Wall West Wing (Doorway at x: [14.5, 19.5])
    this.addWall(20.75, 15, 3.0, 0.48, true);   // North Wall East Wing

    // ------------------------------------------------------------------------
    // CORRIDOR 2-3 (x: [6, 19.5], z: [5.5, 15])
    // ------------------------------------------------------------------------
    this.addWall(19.5, 11.5, 7.5, 0.48, false); // East Wall (from z=7.75 to z=15.25)
    this.addWall(14.5, 12.75, 5.0, 0.48, false);// West Wall (from z=10.25 to z=15.25)
    this.addWall(17, 5.5, 5.5, 0.48, true);     // North Dead-end Wall
    this.addWall(10.25, 10.5, 9.0, 0.48, true); // Corr 2-3 South Wall (from x=5.75 to x=14.75)
    this.addWall(10.25, 5.5, 9.0, 0.48, true);  // Corr 2-3 North Wall (from x=5.75 to x=14.75)

    // ------------------------------------------------------------------------
    // ROOM 3: CENTRAL ANGEL ROTUNDA (x: [-6, 6], z: [0, 16])
    // ------------------------------------------------------------------------
    this.addWall(6, 2.75, 6.0, 0.48, false);    // East Wall North Wing (Doorway at z: [5.5, 10.5])
    this.addWall(6, 13.25, 6.0, 0.48, false);   // East Wall South Wing
    this.addWall(-6, 2.75, 6.0, 0.48, false);   // West Wall North Wing (Doorway at z: [5.5, 10.5])
    this.addWall(-6, 13.25, 6.0, 0.48, false);  // West Wall South Wing
    this.addWall(0, 0, 12.8, 0.48, true);       // North Wall (Painting #5)
    this.addWall(0, 16, 12.8, 0.48, true);      // South Wall (Painting #6)

    // ------------------------------------------------------------------------
    // CORRIDOR 3-4 (x: [-12, -6], z: [5.5, 10.5])
    // ------------------------------------------------------------------------
    this.addWall(-9, 5.5, 6.5, 0.48, true);     // North Wall (from x=-12.25 to x=-5.75)
    this.addWall(-9, 10.5, 6.5, 0.48, true);    // South Wall (from x=-12.25 to x=-5.75)

    // ------------------------------------------------------------------------
    // ROOM 4: WEST WING / TOG'LAR ZALI (x: [-22, -12], z: [1, 15])
    // ------------------------------------------------------------------------
    this.addWall(-12, 3.0, 5.0, 0.48, false);   // East Wall North Wing (Doorway at z: [5.5, 10.5])
    this.addWall(-12, 13.0, 5.0, 0.48, false);  // East Wall South Wing
    this.addWall(-22, 8, 14.8, 0.48, false);    // West Wall (Painting #7)
    this.addWall(-17, 15, 10.8, 0.48, true);    // South Wall (Painting #8)
    this.addWall(-20.75, 1, 3.0, 0.48, true);   // North Wall West Wing (Doorway at x: [-19.5, -14.5])
    this.addWall(-13.25, 1, 3.0, 0.48, true);   // North Wall East Wing

    // ------------------------------------------------------------------------
    // CORRIDOR 4-5 (x: [-19.5, -6], z: [-14.5, 1])
    // ------------------------------------------------------------------------
    this.addWall(-19.5, -5.5, 13.5, 0.48, false);// West Wall (from z=-12.25 to z=1.25)
    this.addWall(-14.5, -4.25, 11.0, 0.48, false);// East Wall (from z=-9.75 to z=1.25)
    this.addWall(-17, -14.5, 5.5, 0.48, true);  // North Dead-end Wall
    this.addWall(-10.25, -14.5, 9.0, 0.48, true);// Corr 4-5 North Wall (from x=-14.75 to x=-5.75)
    this.addWall(-10.25, -9.5, 9.0, 0.48, true); // Corr 4-5 South Wall (from x=-14.75 to x=-5.75)

    // ------------------------------------------------------------------------
    // ROOM 5: BOSPHORUS MARBLE PALACE (x: [-6, 6], z: [-18, -6])
    // ------------------------------------------------------------------------
    this.addWall(-6, -16.25, 4.0, 0.48, false); // West Wall North Wing (Doorway at z: [-14.5, -9.5])
    this.addWall(-6, -7.75, 4.0, 0.48, false);  // West Wall South Wing
    this.addWall(6, -12, 12.8, 0.48, false);    // East Wall (Painting #10)
    this.addWall(0, -6, 12.8, 0.48, true);      // South Wall (Painting #9)
    this.addWall(-4.25, -18, 4.0, 0.48, true);  // North Wall West Wing (Portal at x: [-2.25, 2.25])
    this.addWall(4.25, -18, 4.0, 0.48, true);   // North Wall East Wing

    // PORTAL 5-6 ENCLOSING SIDE WALLS (Hermetically connects Room 5 to Room 6, z: [-20, -18])
    this.addWall(-2.25, -19, 2.0, 0.48, false); // West Portal Wall
    this.addWall(2.25, -19, 2.0, 0.48, false);  // East Portal Wall

    // ------------------------------------------------------------------------
    // ROOM 6: GOLDEN SUNSET (x: [-6, 6], z: [-36, -20])
    // ------------------------------------------------------------------------
    this.addWall(-4.25, -20, 4.0, 0.48, true);  // South Wall West Wing
    this.addWall(4.25, -20, 4.0, 0.48, true);   // South Wall East Wing
    this.addWall(-6, -28, 16.8, 0.48, false);   // West Wall (Painting #11)
    this.addWall(6, -28, 16.8, 0.48, false);    // East Wall (Painting #12)
    this.addWall(-4.5, -36, 3.5, 0.48, true);   // North Wall West Wing (Triumphal Portal at x: [-2.75, 2.75])
    this.addWall(4.5, -36, 3.5, 0.48, true);    // North Wall East Wing

    // PORTAL 6-7 ENCLOSING SIDE WALLS (Hermetically connects Room 6 to Room 7, z: [-39, -36])
    this.addWall(-2.75, -37.5, 3.0, 0.48, false); // West Portal Wall
    this.addWall(2.75, -37.5, 3.0, 0.48, false);  // East Portal Wall

    // ------------------------------------------------------------------------
    // ROOM 7: MONUMENTAL SANCTUARY (x: [-7, 7], z: [-57, -39])
    // ------------------------------------------------------------------------
    this.addWall(-5, -39, 4.5, 0.48, true);     // South Altar Wall West Wing
    this.addWall(5, -39, 4.5, 0.48, true);      // South Altar Wall East Wing
    this.addWall(-7, -48, 18.8, 0.48, false);   // West Wall
    this.addWall(7, -48, 18.8, 0.48, false);    // East Wall
    this.addWall(0, -57, 14.8, 0.48, true);     // North Sanctuary Wall (Painting #13)
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
      { x: 0, z: -19, rotY: 0, width: 4.5, title: '🌅 VI. OLTIN SHAFAQ QASRI 🌅' },
      { x: 0, z: -37.5, rotY: 0, width: 5.5, title: '👑 VII. ABADIY MUHABBAT MEHROBI 👑' }
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

    // 1. SOLID DAMASK LINTEL WALL ABOVE ARCHWAY (Seals completely to ceiling at y = 7.5m!)
    const lintelH = this.wallHeight - 5.0; // 2.5m tall lintel
    const lintelGeo = new THREE.BoxGeometry(width + 1.2, lintelH, 0.48);
    const lintel = new THREE.Mesh(lintelGeo, this.upperWallMaterial);
    lintel.position.set(0, 5.0 + lintelH / 2, 0); // centered at y = 6.25m -> spans y = [5.0m, 7.5m]
    group.add(lintel);

    // Gold crown cornice along ceiling on lintel
    const cornGeo = new THREE.BoxGeometry(width + 1.26, 0.28, 0.62);
    const corn = new THREE.Mesh(cornGeo, this.goldMaterial);
    corn.position.set(0, this.wallHeight - 0.14, 0);
    group.add(corn);

    // Gold arch rail at bottom of lintel (y = 5.0m)
    const railGeo = new THREE.BoxGeometry(width + 1.22, 0.16, 0.58);
    const rail = new THREE.Mesh(railGeo, this.goldMaterial);
    rail.position.set(0, 5.0, 0);
    group.add(rail);

    // Flanking Imperial Emerald Marble Columns
    [-halfW, halfW].forEach(px => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.36, 5.0, 16),
        new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.3 })
      );
      col.position.set(px, 2.5, 0);
      group.add(col);

      // Gold plinth & capital
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.85), this.goldMaterial);
      base.position.set(px, 0.22, 0);
      group.add(base);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.9), this.goldMaterial);
      cap.position.set(px, 5.0, 0);
      group.add(cap);
    });

    // Gilded Arch Header & Cornice at y = 5.25m
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.65, 0.6), this.goldMaterial);
    archTop.position.set(0, 5.25, 0);
    group.add(archTop);

    // Gilded Crown Plaque with Room Title on BOTH sides of the portal
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

    // Front plaque
    const plaqueFront = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.75, 0.48), pMat);
    plaqueFront.position.set(0, 5.25, 0.32);
    group.add(plaqueFront);

    // Back plaque
    const plaqueBack = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.75, 0.48), pMat);
    plaqueBack.rotation.y = Math.PI;
    plaqueBack.position.set(0, 5.25, -0.32);
    group.add(plaqueBack);

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
      texture.anisotropy = 16;
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
  // CLASSICAL MARBLE SCULPTURES & RUSSIAN EMPIRE DIVANS
  // Inspired by Antonio Canova's Neoclassical Dancers & Russian Museum MEB-1167
  // ==========================================================================
  buildStatues() {
    // 1. Centerpiece: Monumental Winged Neoclassical Angel in Room 3 (Rotunda center: 0, 8)
    const angelStatue = this.createAngelStatue();
    angelStatue.position.set(0, 0, 8);
    angelStatue.userData = { type: 'statue', data: DEFAULT_STATUES[0] };
    this.scene.add(angelStatue);
    this.interactiveObjects.push(angelStatue);

    // 2. Neoclassical Classical Marble Sculptures on Fluted Pedestals (Antonio Canova style)
    const statuePlacements = [
      { x: 17, z: 16.5, rotY: -Math.PI / 2, type: 'dancer_chin', data: DEFAULT_STATUES[1] },     // Room 2: Afrodita & Raqqosa
      { x: -17, z: 2.5, rotY: Math.PI / 2, type: 'dancer_cymbals', data: DEFAULT_STATUES[2] },   // Room 4: Apollon & Lira Raqqosi
      { x: 0, z: -14.5, rotY: 0, type: 'hermes_caduceus', data: DEFAULT_STATUES[3] }             // Room 5: Hermes & Shamol Raqqosi
    ];

    statuePlacements.forEach(b => {
      const statueObj = this.createNeoclassicalSculpture(b);
      statueObj.position.set(b.x, 0, b.z);
      statueObj.rotation.y = b.rotY;
      statueObj.userData = { type: 'statue', data: b.data };

      this.scene.add(statueObj);
      this.interactiveObjects.push(statueObj);
    });

    // 3. Russian Empire Neoclassical Divans (Replicating Russian Museum MEB-1167)
    const benchPlacements = [
      { x: 0, z: 39, rotY: 0 },              // Room 1: Vestibule (facing north into room)
      { x: 17, z: 24, rotY: -Math.PI / 2 },  // Room 2: East Wing (facing west into room)
      { x: -17, z: 10, rotY: Math.PI / 2 },  // Room 4: West Wing (facing east into room)
      { x: 0, z: -9.5, rotY: 0 },            // Room 5: Bosphorus (facing north)
      { x: 0, z: -27, rotY: 0 },             // Room 6: Golden Sunset (facing north)
      { x: 0, z: -46, rotY: 0 }              // Room 7: Sanctuary (facing north towards altar)
    ];

    benchPlacements.forEach(bp => {
      const divan = this.createEmpireDivan();
      divan.position.set(bp.x, 0, bp.z);
      divan.rotation.y = bp.rotY;
      this.scene.add(divan);
    });
  }

  // ==========================================================================
  // NEOCLASSICAL MARBLE SCULPTURE BUILDER (Antonio Canova's Dancers)
  // ==========================================================================
  createNeoclassicalSculpture(config) {
    const group = new THREE.Group();

    // 1. Classical Pedestal (Emerald Marble & Gilded Bronze Ormolu)
    const pedGroup = new THREE.Group();

    // Stepped plinth base
    const plinth1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.9), this.goldMaterial);
    plinth1.position.y = 0.08;
    pedGroup.add(plinth1);

    const plinth2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.14, 0.82),
      new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.25 })
    );
    plinth2.position.y = 0.23;
    pedGroup.add(plinth2);

    // Fluted Column Shaft
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 1.1, 24),
      new THREE.MeshStandardMaterial({ map: this.marbleTexture, roughness: 0.25 })
    );
    shaft.position.y = 0.85;
    pedGroup.add(shaft);

    // Gilded rings on shaft
    [-0.45, 0.45].forEach(ry => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 24), this.goldMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.85 + ry;
      pedGroup.add(ring);
    });

    // Pedestal Capital / Cornice
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.16, 0.8), this.goldMaterial);
    cap.position.y = 1.48;
    pedGroup.add(cap);

    // Oval Marble Statue Plinth
    const statuePlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.38, 0.1, 24),
      this.carraraMarbleMaterial
    );
    statuePlinth.position.y = 1.61;
    pedGroup.add(statuePlinth);

    // Engraved Museum Brass Plaque
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.2, 0.02), this.goldMaterial);
    plaque.position.set(0, 0.85, 0.33);
    pedGroup.add(plaque);

    group.add(pedGroup);

    // 2. The Neoclassical Standing Figure (Antonio Canova's Dancer style)
    const figGroup = new THREE.Group();
    figGroup.position.y = 1.66; // Base of statue feet

    // Sculpted Marble Feet peeking out beneath chiton hem
    const footLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.16), this.carraraMarbleMaterial);
    footLeft.position.set(-0.06, 0.025, 0.08);
    figGroup.add(footLeft);

    const footRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.16), this.carraraMarbleMaterial);
    footRight.position.set(0.08, 0.025, 0.04);
    footRight.rotation.y = 0.25;
    figGroup.add(footRight);

    // Gold Sandal Straps
    const sandal1 = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 6, 12), this.goldMaterial);
    sandal1.rotation.x = Math.PI / 2;
    sandal1.position.set(-0.06, 0.03, 0.06);
    figGroup.add(sandal1);

    // Cascading Chiton / Pleated Gown (Flowing drapery)
    // Lower flowing skirt with elegant flare
    const lowerSkirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.36, 0.65, 24),
      this.carraraMarbleMaterial
    );
    lowerSkirt.position.set(0.01, 0.36, -0.01);
    lowerSkirt.rotation.z = -0.03;
    figGroup.add(lowerSkirt);

    // Fluted Drapery Folds (Vertical ridges around skirt to catch realistic light & shadows)
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      const fold = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.032, 0.64, 8),
        this.carraraMarbleMaterial
      );
      const rad = 0.29;
      fold.position.set(Math.cos(ang) * rad, 0.36, Math.sin(ang) * rad);
      fold.rotation.z = Math.cos(ang) * -0.08;
      figGroup.add(fold);
    }

    // Mid-skirt & hips in graceful contrapposto curve
    const midSkirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.23, 0.42, 20),
      this.carraraMarbleMaterial
    );
    midSkirt.position.set(-0.01, 0.85, 0);
    midSkirt.rotation.z = 0.04;
    figGroup.add(midSkirt);

    // High Neoclassical Waist & Gilded Sash
    const sash = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.022, 8, 24),
      this.goldMaterial
    );
    sash.rotation.x = Math.PI / 2;
    sash.position.set(0, 1.05, 0);
    figGroup.add(sash);

    // Gilded cameo brooch at center of sash
    const brooch = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 12),
      this.goldMaterial
    );
    brooch.position.set(0, 1.05, 0.18);
    figGroup.add(brooch);

    // Sculpted Torso & Draped Bodice
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.17, 0.32, 16),
      this.carraraMarbleMaterial
    );
    torso.position.set(0, 1.2, 0);
    figGroup.add(torso);

    // Classical Draped Bust / Folds
    const bustL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), this.carraraMarbleMaterial);
    bustL.position.set(-0.07, 1.22, 0.08);
    figGroup.add(bustL);

    const bustR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), this.carraraMarbleMaterial);
    bustR.position.set(0.07, 1.22, 0.08);
    figGroup.add(bustR);

    // Slender Neck & Sculpted Shoulders
    const shoulders = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.22, 0.14, 16),
      this.carraraMarbleMaterial
    );
    shoulders.position.set(0, 1.38, 0);
    figGroup.add(shoulders);

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 0.16, 16),
      this.carraraMarbleMaterial
    );
    neck.position.set(0, 1.48, 0);
    figGroup.add(neck);

    // Sculpted Head with Classical Profile
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.135, 20, 20),
      this.carraraMarbleMaterial
    );
    head.scale.set(0.9, 1.1, 0.95);
    head.position.set(0, 1.62, 0.02);
    figGroup.add(head);

    // Classical Coiffure (Wavy Greek hair + high chignon bun)
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 16),
      this.carraraMarbleMaterial
    );
    hairCrown.position.set(0, 1.66, -0.03);
    figGroup.add(hairCrown);

    // Sculpted braided chignon / topknot bun
    const bun = new THREE.Mesh(
      new THREE.TorusGeometry(0.07, 0.04, 12, 16),
      this.carraraMarbleMaterial
    );
    bun.rotation.x = Math.PI / 2;
    bun.position.set(0, 1.76, -0.04);
    figGroup.add(bun);

    // Gilded Laurel Tiara / Hairband
    const tiara = new THREE.Mesh(
      new THREE.TorusGeometry(0.125, 0.018, 8, 24),
      this.goldMaterial
    );
    tiara.rotation.x = Math.PI / 2 - 0.2;
    tiara.position.set(0, 1.68, 0.03);
    figGroup.add(tiara);

    // Poses and Attributes based on statue config:
    if (config.type === 'dancer_chin') {
      // CANOVA: DANCER WITH FINGER ON CHIN (Afrodita in Room 2)
      // Right arm raised elegantly to chin
      const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.26, 12), this.carraraMarbleMaterial);
      rUpper.position.set(0.19, 1.34, 0.06);
      rUpper.rotation.z = -0.7;
      rUpper.rotation.x = 0.5;
      figGroup.add(rUpper);

      const rFore = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.25, 12), this.carraraMarbleMaterial);
      rFore.position.set(0.11, 1.5, 0.14);
      rFore.rotation.z = 0.9;
      rFore.rotation.x = -0.5;
      figGroup.add(rFore);

      const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), this.carraraMarbleMaterial);
      rHand.position.set(0.04, 1.57, 0.13);
      figGroup.add(rHand);

      // Left arm swept downward holding draped gown fold
      const lUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.28, 12), this.carraraMarbleMaterial);
      lUpper.position.set(-0.2, 1.25, 0);
      lUpper.rotation.z = 0.35;
      figGroup.add(lUpper);

      const lFore = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.26, 12), this.carraraMarbleMaterial);
      lFore.position.set(-0.24, 1.0, 0.04);
      lFore.rotation.z = -0.2;
      figGroup.add(lFore);

      // Gilded Rose in left hand
      const rose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), this.goldMaterial);
      rose.position.set(-0.25, 0.88, 0.06);
      figGroup.add(rose);

    } else if (config.type === 'dancer_cymbals') {
      // CANOVA: DANCER WITH CYMBALS / APOLLO LYRE (Room 4)
      const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.32, 12), this.carraraMarbleMaterial);
      lArm.position.set(-0.22, 1.26, 0.08);
      lArm.rotation.z = 0.6;
      lArm.rotation.x = 0.4;
      figGroup.add(lArm);

      const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.32, 12), this.carraraMarbleMaterial);
      rArm.position.set(0.2, 1.26, 0.1);
      rArm.rotation.z = -0.5;
      rArm.rotation.x = 0.6;
      figGroup.add(rArm);

      // Classical Golden Apollo Lyre
      const lyreGroup = new THREE.Group();
      lyreGroup.position.set(0, 1.22, 0.22);

      const lyreBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.05), this.goldMaterial);
      lyreGroup.add(lyreBase);

      const lyreFrame = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 8, 20), this.goldMaterial);
      lyreFrame.position.y = 0.14;
      lyreGroup.add(lyreFrame);

      const lyreTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.04), this.goldMaterial);
      lyreTop.position.y = 0.3;
      lyreGroup.add(lyreTop);

      figGroup.add(lyreGroup);

    } else if (config.type === 'hermes_caduceus') {
      // CANOVA / GIAMBOLOGNA: HERMES WITH CADUCEUS & WINGED SANDALS (Room 5)
      [-0.1, 0.12].forEach(wx => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.12), this.goldMaterial);
        wing.position.set(wx, 0.08, -0.04);
        wing.rotation.y = 0.4;
        figGroup.add(wing);
      });

      // Right arm raised gracefully holding gilded Caduceus wand
      const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.3, 12), this.carraraMarbleMaterial);
      rUpper.position.set(0.22, 1.35, 0.04);
      rUpper.rotation.z = -0.9;
      rUpper.rotation.x = 0.2;
      figGroup.add(rUpper);

      const rFore = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.28, 12), this.carraraMarbleMaterial);
      rFore.position.set(0.35, 1.56, 0.06);
      rFore.rotation.z = -0.3;
      figGroup.add(rFore);

      // Gilded Caduceus Wand
      const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 8), this.goldMaterial);
      wand.position.set(0.38, 1.76, 0.08);
      figGroup.add(wand);

      const wandTop = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), this.goldMaterial);
      wandTop.position.set(0.38, 2.08, 0.08);
      figGroup.add(wandTop);

      // Caduceus wings
      const cWingL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.02), this.goldMaterial);
      cWingL.position.set(0.32, 2.05, 0.08);
      cWingL.rotation.z = 0.3;
      figGroup.add(cWingL);

      const cWingR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.02), this.goldMaterial);
      cWingR.position.set(0.44, 2.05, 0.08);
      cWingR.rotation.z = -0.3;
      figGroup.add(cWingR);
    }

    group.add(figGroup);
    return group;
  }

  // ==========================================================================
  // ROOM 3 MONUMENTAL CENTERPIECE: WINGED ANGEL OF LOVE (CUPID & PSYCHE)
  // ==========================================================================
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

    // 3. Monumental Standing Winged Neoclassical Angel of Love
    const angelFigure = new THREE.Group();
    angelFigure.position.y = 2.18; // Base of feet on pedestal cap

    // Marble Feet
    [-0.08, 0.08].forEach(fx => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.18), this.carraraMarbleMaterial);
      foot.position.set(fx, 0.03, 0.06);
      angelFigure.add(foot);
    });

    // Cascading Fluted Marble Chiton Skirt
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.44, 0.85, 24),
      this.carraraMarbleMaterial
    );
    skirt.position.y = 0.48;
    angelFigure.add(skirt);

    // Fluted vertical folds
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const fold = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.035, 0.84, 8),
        this.carraraMarbleMaterial
      );
      fold.position.set(Math.cos(ang) * 0.36, 0.48, Math.sin(ang) * 0.36);
      angelFigure.add(fold);
    }

    // High Waist & Gilded Sash
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 24), this.goldMaterial);
    sash.rotation.x = Math.PI / 2;
    sash.position.y = 0.95;
    angelFigure.add(sash);

    // Sculpted Classical Torso & Bodice
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.38, 16), this.carraraMarbleMaterial);
    torso.position.y = 1.14;
    angelFigure.add(torso);

    // Shoulders & Neck
    const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.28, 0.16, 16), this.carraraMarbleMaterial);
    shoulders.position.y = 1.36;
    angelFigure.add(shoulders);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.18, 16), this.carraraMarbleMaterial);
    neck.position.y = 1.48;
    angelFigure.add(neck);

    // Head with Classical Profile
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), this.carraraMarbleMaterial);
    head.scale.set(0.9, 1.1, 0.95);
    head.position.set(0, 1.64, 0.02);
    angelFigure.add(head);

    // Classical Wavy Hair + Topknot Bun
    const bun = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.05, 12, 16), this.carraraMarbleMaterial);
    bun.rotation.x = Math.PI / 2;
    bun.position.set(0, 1.8, -0.04);
    angelFigure.add(bun);

    // Gilded Laurel Tiara
    const tiara = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 8, 24), this.goldMaterial);
    tiara.rotation.x = Math.PI / 2 - 0.2;
    tiara.position.set(0, 1.7, 0.04);
    angelFigure.add(tiara);

    // Majestic Outstretched Feathered Angel Wings (Spanning 2.4m across!)
    [-1, 1].forEach(side => {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 0.15, 1.25, -0.15);
      wingGroup.rotation.y = side * 0.35;
      wingGroup.rotation.z = side * -0.25;

      // Main primary wing arch
      const wingBone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 1.2, 12),
        this.carraraMarbleMaterial
      );
      wingBone.position.set(side * 0.45, 0.55, 0);
      wingBone.rotation.z = side * -0.7;
      wingGroup.add(wingBone);

      // Layered feathered vanes
      for (let f = 0; f < 6; f++) {
        const feather = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.45 + f * 0.08, 0.03),
          this.carraraMarbleMaterial
        );
        feather.position.set(side * (0.25 + f * 0.14), 0.35 + f * 0.12, -0.02 * f);
        feather.rotation.z = side * (-0.4 - f * 0.1);
        wingGroup.add(feather);

        // Gold feather tips
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.035), this.goldMaterial);
        tip.position.set(side * (0.25 + f * 0.14), 0.58 + f * 0.16, -0.02 * f);
        tip.rotation.z = side * (-0.4 - f * 0.1);
        wingGroup.add(tip);
      }

      angelFigure.add(wingGroup);
    });

    // Both Arms Uplifted Holding the Gilded Laurel Wreath of Eternal Love
    [-1, 1].forEach(side => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.45, 12), this.carraraMarbleMaterial);
      arm.position.set(side * 0.22, 1.48, 0.14);
      arm.rotation.z = side * -0.55;
      arm.rotation.x = 0.55;
      angelFigure.add(arm);
    });

    // Gilded Laurel Wreath of Eternal Love
    const wreath = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.035, 12, 32),
      this.goldMaterial
    );
    wreath.position.set(0, 1.76, 0.28);
    angelFigure.add(wreath);

    group.add(angelFigure);

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

  // ==========================================================================
  // RUSSIAN EMPIRE NEOCLASSICAL DIVAN (REPLICATING RUSSIAN MUSEUM MEB-1167)
  // Polished mahogany frame, arched backrest with carved crest, scrolled volute arms
  // ==========================================================================
  createEmpireDivan() {
    const group = new THREE.Group();

    // 1. Mahogany Base Plinth / Apron (Matching MEB-1167)
    const baseApron = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.2, 0.96),
      this.mahoganyMaterial
    );
    baseApron.position.y = 0.28;
    group.add(baseApron);

    // Gold bead molding along bottom of apron
    const apronTrim = new THREE.Mesh(
      new THREE.BoxGeometry(2.52, 0.04, 0.98),
      this.goldMaterial
    );
    apronTrim.position.y = 0.19;
    group.add(apronTrim);

    // 2. Neoclassical Curved Sabre Legs (4 legs with gold brass ferrule feet)
    const legPositions = [
      { x: -1.12, z: 0.38, rotX: 0.18, rotZ: -0.15 },  // Front Left
      { x: 1.12, z: 0.38, rotX: 0.18, rotZ: 0.15 },   // Front Right
      { x: -1.12, z: -0.38, rotX: -0.18, rotZ: -0.12 }, // Rear Left
      { x: 1.12, z: -0.38, rotX: -0.18, rotZ: 0.12 }   // Rear Right
    ];

    legPositions.forEach(lp => {
      const legGroup = new THREE.Group();
      legGroup.position.set(lp.x, 0.18, lp.z);

      // Upper carved block
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), this.mahoganyMaterial);
      upper.position.y = -0.06;
      legGroup.add(upper);

      // Curved saber shaft
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.08), this.mahoganyMaterial);
      shaft.position.set(0, -0.12, 0);
      shaft.rotation.x = lp.rotX;
      shaft.rotation.z = lp.rotZ;
      legGroup.add(shaft);

      // Brass claw / ferrule foot
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.09), this.goldMaterial);
      foot.position.set(lp.rotZ * 0.15, -0.17, lp.rotX * 0.15);
      legGroup.add(foot);

      group.add(legGroup);
    });

    // 3. Luxurious Royal Navy Striped Seat Cushion
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(2.16, 0.24, 0.86),
      this.divanFabricMaterial
    );
    cushion.position.set(0, 0.46, 0.02);
    group.add(cushion);

    // Gold piping cord around cushion perimeter
    const piping = new THREE.Mesh(
      new THREE.BoxGeometry(2.18, 0.03, 0.88),
      this.goldMaterial
    );
    piping.position.set(0, 0.35, 0.02);
    group.add(piping);

    // 4. Grand Mahogany Arched Backrest with Carved Neoclassical Crest
    const backPanel = new THREE.Mesh(
      new THREE.BoxGeometry(2.46, 0.85, 0.1),
      this.mahoganyMaterial
    );
    backPanel.position.set(0, 0.88, -0.42);
    backPanel.rotation.x = -0.06;
    group.add(backPanel);

    // Central Neoclassical Pediment / Crest (The signature carved crown on MEB-1167)
    const crestTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.22, 0.12),
      this.mahoganyMaterial
    );
    crestTop.position.set(0, 1.38, -0.44);
    group.add(crestTop);

    // Gilded carved acanthus / palmette medallion on crest
    const crestMedallion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.04, 20),
      this.goldMaterial
    );
    crestMedallion.rotation.x = Math.PI / 2;
    crestMedallion.position.set(0, 1.39, -0.37);
    group.add(crestMedallion);

    // Gold bead molding along backrest crest curve
    const crestRail = new THREE.Mesh(
      new THREE.BoxGeometry(2.48, 0.04, 0.12),
      this.goldMaterial
    );
    crestRail.position.set(0, 1.3, -0.43);
    group.add(crestRail);

    // 5. Scrolled Volute Armrests (Left & Right with carved spiral volutes & gold rosettes)
    [-1.18, 1.18].forEach(ax => {
      const armGroup = new THREE.Group();
      armGroup.position.set(ax, 0.64, 0.0);

      // Side mahogany arm panel
      const sideBoard = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.54, 0.94),
        this.mahoganyMaterial
      );
      armGroup.add(sideBoard);

      // Sweeping top arm rail
      const armRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.06, 0.96),
        this.mahoganyMaterial
      );
      armRail.position.y = 0.28;
      armGroup.add(armRail);

      // Front Scrolled Volute (cylinder rolling down at the front)
      const scrollVolute = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.14, 24),
        this.mahoganyMaterial
      );
      scrollVolute.rotation.z = Math.PI / 2;
      scrollVolute.position.set(0, 0.22, 0.46);
      armGroup.add(scrollVolute);

      // Carved Gilded Rosette Medallion on the outer face of the volute
      const rosette = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.02, 20),
        this.goldMaterial
      );
      rosette.rotation.z = Math.PI / 2;
      rosette.position.set(ax > 0 ? 0.075 : -0.075, 0.22, 0.46);
      armGroup.add(rosette);

      group.add(armGroup);
    });

    // 6. Cylindrical Bolster Roll Pillows (Matching Empire luxury salon style)
    [-0.95, 0.95].forEach(bx => {
      const bolster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.76, 20),
        this.divanFabricMaterial
      );
      bolster.rotation.x = Math.PI / 2;
      bolster.position.set(bx, 0.55, 0.02);
      group.add(bolster);

      // Gold tuft button on front end
      const bCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16),
        this.goldMaterial
      );
      bCap.rotation.x = Math.PI / 2;
      bCap.position.set(bx, 0.55, 0.41);
      group.add(bCap);
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

    // Warm gallery corridor and transition portal lights
    const corridorLights = [
      { x: 0, z: 25, color: 0xffe8c8, intensity: 2.0, dist: 14 },     // Corr 1 North
      { x: 5, z: 22, color: 0xffe8c8, intensity: 2.0, dist: 16 },     // Corr 1-2 East
      { x: 17, z: 11, color: 0xffe8c8, intensity: 2.0, dist: 14 },    // Corr 2-3 North
      { x: 10, z: 8, color: 0xffe8c8, intensity: 2.0, dist: 15 },     // Corr 2-3 West
      { x: -9, z: 8, color: 0xffe8c8, intensity: 2.2, dist: 15 },     // Corr 3-4 West
      { x: -17, z: -5, color: 0xffe8c8, intensity: 2.0, dist: 16 },   // Corr 4-5 North
      { x: -10, z: -12, color: 0xffe8c8, intensity: 2.0, dist: 15 },  // Corr 4-5 East
      { x: 0, z: -19, color: 0xffeed0, intensity: 2.2, dist: 14 },    // Portal 5-6
      { x: 0, z: -37.5, color: 0xfffaea, intensity: 2.5, dist: 15 }   // Portal 6-7
    ];

    corridorLights.forEach(cl => {
      const pLight = new THREE.PointLight(cl.color, cl.intensity, cl.dist, 1.2);
      pLight.position.set(cl.x, this.wallHeight - 1.5, cl.z);
      this.scene.add(pLight);
    });

    // Balanced global romantic ambient & fill light (warm palace illumination, no pitch black voids)
    const amb = new THREE.AmbientLight(0x4a2228, 1.4);
    this.scene.add(amb);

    const hemi = new THREE.HemisphereLight(0xffeedb, 0x241014, 0.6);
    this.scene.add(hemi);
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
