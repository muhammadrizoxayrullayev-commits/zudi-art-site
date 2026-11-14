// ==========================================================================
// MAIN CONTROLLER & APPLICATION ENTRY POINT
// Initializes Three.js engine, Museum, Physical Player, Multiplayer, UI & Events
// ==========================================================================

import { Museum } from './museum.js';
import { Player } from './player.js';
import { MultiplayerManager } from './multiplayer.js';
import { AudioManager } from './audio.js';
import { createArtworkCanvas, createStatueCanvas, DEFAULT_PAINTINGS } from './paintings.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    // Scene & Renderer — Romantic Chiaroscuro Darkness & Beauty
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060204);
    this.scene.fog = new THREE.FogExp2(0x090205, 0.015); // Deep romantic museum atmospheric haze

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Audio & Multiplayer managers
    this.audio = new AudioManager();
    this.multiplayer = new MultiplayerManager(
      this.scene,
      (isClose) => this.updateProximityUI(isClose),
      () => this.audio.playHeartChime()
    );

    // Museum & Physical Player
    this.museum = new Museum(this.scene);
    this.player = new Player(
      this.camera,
      this.renderer.domElement,
      this.scene,
      () => this.audio.playFootstep()
    );

    // State
    this.activePainting = null;
    this.activeRoomId = this.getRoomIdFromURL();
    this.localUserData = {
      name: 'Muhammadrizo',
      role: 'boy',
      roomId: this.activeRoomId
    };

    // Raycaster for paintings
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 8.0;

    // Minimap & Room Detection State
    this.lastRoomTitle = '';
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    this.minimapTimer = 0;

    this.initURLParams();
    this.initUI();
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  getRoomIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || 'jjmm-gallery';
  }

  initURLParams() {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const nameParam = params.get('name');

    if (roleParam === 'girl') {
      const girlRadio = document.querySelector('input[name="player-role"][value="girl"]');
      if (girlRadio) {
        girlRadio.checked = true;
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        girlRadio.closest('.role-card')?.classList.add('selected');
      }
      const nameInput = document.getElementById('player-name-input');
      if (nameInput) nameInput.value = nameParam || 'Sevgilim';
    } else if (nameParam) {
      const nameInput = document.getElementById('player-name-input');
      if (nameInput) nameInput.value = nameParam;
    }
  }

  initUI() {
    // 1. Role Card Selection
    document.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const input = card.querySelector('input');
        if (input) input.checked = true;
      });
    });

    // 2. Enter Museum Button
    const enterBtn = document.getElementById('btn-enter-museum');
    enterBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('player-name-input');
      const selectedRole = document.querySelector('input[name="player-role"]:checked');

      this.localUserData.name = (nameInput?.value || 'Oshiq').trim();
      this.localUserData.role = selectedRole?.value || 'boy';
      this.localUserData.roomId = this.activeRoomId;

      // Initialize player avatar role
      this.player.setRole(this.localUserData.role, this.localUserData.name);

      const entryModal = document.getElementById('entry-modal');
      entryModal.classList.add('hidden');
      entryModal.style.display = 'none';

      window.focus();

      // Connect to multiplayer
      this.multiplayer.connect(this.localUserData);

      this.multiplayer.showToast('🏛️ Muzeyga xush kelibsiz! "Ulashish" orqali sevgilingizni taklif qiling.');
    });

    // 3. Share Button
    const shareBtn = document.getElementById('btn-share');
    shareBtn.addEventListener('click', () => {
      const inviteRole = this.localUserData.role === 'boy' ? 'girl' : 'boy';
      const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(this.activeRoomId)}&role=${inviteRole}`;

      navigator.clipboard?.writeText(shareUrl).then(() => {
        this.multiplayer.showToast('🔗 Maxsus taklif havolasi nusxalandi! Sevgilingizga yuboring ❤️');
      }).catch(() => {
        prompt('Taklif havolasini nusxalang:', shareUrl);
      });
    });

    // 4. Music Toggle
    const audioBtn = document.getElementById('btn-audio');
    const audioIcon = document.getElementById('audio-icon');
    audioBtn.addEventListener('click', () => {
      const isPlaying = this.audio.toggleMusic();
      audioIcon.textContent = isPlaying ? '🎵' : '🔇';
    });

    // 5. Camera Perspective Toggle (1st Person vs 3rd Person)
    const cameraBtn = document.getElementById('btn-camera');
    cameraBtn.addEventListener('click', () => {
      const isThird = this.player.toggleCameraPerspective();
      const textEl = cameraBtn.querySelector('.btn-text');
      if (textEl) textEl.textContent = isThird ? '3-shaxs' : '1-shaxs';

      const mCamText = document.getElementById('m-cam-text');
      const mCamIcon = document.getElementById('m-cam-icon');
      if (mCamText) mCamText.textContent = isThird ? '1-shaxs' : '3-shaxs';
      if (mCamIcon) mCamIcon.textContent = isThird ? '👁️' : '👤';

      this.multiplayer.showToast(isThird ? '👤 3-shaxs: Odam ko\'rinadi' : '👁️ 1-shaxs: O\'z ko\'zingiz bilan');
    });

    const mCameraBtn = document.getElementById('m-btn-camera');
    if (mCameraBtn) {
      mCameraBtn.addEventListener('click', () => cameraBtn.click());
    }

    // 6. Fullscreen Toggle
    const fsBtn = document.getElementById('btn-fullscreen');
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });

    // 7. Heart Action Buttons (Desktop Key 'H' + Mobile Button)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyH' && !this.isChatActive()) {
        this.triggerHeart();
      }
      if (e.code === 'KeyE' && this.activePainting && !this.isChatActive()) {
        this.openArtworkModal(this.activePainting);
      }
      if (e.code === 'KeyV' && !this.isChatActive()) {
        cameraBtn.click();
      }
    });

    const mHeartBtn = document.getElementById('m-btn-heart');
    if (mHeartBtn) mHeartBtn.addEventListener('click', () => this.triggerHeart());

    // 8. Inspect Prompt & Button
    const inspectPrompt = document.getElementById('inspect-prompt');
    inspectPrompt.addEventListener('click', () => {
      if (this.activePainting) this.openArtworkModal(this.activePainting);
    });

    const mInspectBtn = document.getElementById('m-btn-inspect');
    if (mInspectBtn) {
      mInspectBtn.addEventListener('click', () => {
        if (this.activePainting) this.openArtworkModal(this.activePainting);
      });
    }

    // 9. Close Artwork Modal
    document.getElementById('btn-close-artwork').addEventListener('click', () => {
      document.getElementById('artwork-modal').classList.add('hidden');
    });

    // 10. Photo Upload for Painting
    const photoFileInput = document.getElementById('photo-file-input');
    photoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0] && this.activePainting) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          this.applyCustomPhotoToPainting(this.activePainting, dataUrl);
        };
        reader.readAsDataURL(file);
      }
    });

    // 11. Chat Widget & Submission
    const chatWidget = document.getElementById('chat-widget');
    const mChatBtn = document.getElementById('m-btn-chat');
    const closeChatBtn = document.getElementById('btn-close-chat');

    mChatBtn.addEventListener('click', () => {
      chatWidget.classList.toggle('collapsed');
      if (!chatWidget.classList.contains('collapsed')) {
        document.getElementById('chat-input')?.focus();
      }
    });

    closeChatBtn.addEventListener('click', () => chatWidget.classList.add('collapsed'));

    const chatForm = document.getElementById('chat-form');
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (text) {
        this.multiplayer.emitChatMessage(this.localUserData.name, text);
        this.multiplayer.displayChatInUI(this.localUserData.name, text);
        input.value = '';
      }
    });

    // 12. Minimap Toggle
    const toggleMinimapBtn = document.getElementById('btn-toggle-minimap');
    const minimapCard = document.getElementById('minimap-card');
    if (toggleMinimapBtn && minimapCard) {
      toggleMinimapBtn.addEventListener('click', () => {
        minimapCard.classList.toggle('collapsed');
        toggleMinimapBtn.textContent = minimapCard.classList.contains('collapsed') ? '＋' : '—';
      });
    }
  }

  isChatActive() {
    return document.activeElement && document.activeElement.id === 'chat-input';
  }

  triggerHeart() {
    this.multiplayer.emitHeart(this.player, this.localUserData.name);
    this.audio.playHeartChime();
  }

  updateProximityUI(isClose) {
    const banner = document.getElementById('proximity-banner');
    if (banner) {
      if (isClose) banner.classList.remove('hidden');
      else banner.classList.add('hidden');
    }
  }

  openArtworkModal(paintingData) {
    const modal = document.getElementById('artwork-modal');
    const imgEl = document.getElementById('artwork-img');
    const numEl = document.getElementById('art-number');
    const titleEl = document.getElementById('art-title');
    const descEl = document.getElementById('art-desc');
    const dateEl = document.getElementById('art-date');

    numEl.textContent = paintingData.subtitle;
    titleEl.textContent = paintingData.title;
    descEl.textContent = paintingData.description;
    dateEl.textContent = `“ ${paintingData.date} ”`;

    const saved = localStorage.getItem(`museum_artwork_${paintingData.id}`);
    if (saved) {
      imgEl.src = saved;
    } else if (paintingData.imageSrc) {
      imgEl.src = paintingData.imageSrc;
    } else if (paintingData.canvas) {
      imgEl.src = paintingData.canvas.toDataURL();
    } else if (paintingData.type === 'statue') {
      const c = createStatueCanvas(paintingData);
      paintingData.canvas = c;
      imgEl.src = c.toDataURL();
    }

    modal.classList.remove('hidden');
  }

  applyCustomPhotoToPainting(paintingData, dataUrl) {
    try {
      localStorage.setItem(`museum_artwork_${paintingData.id}`, dataUrl);
    } catch (e) {
      console.warn('Storage full or unavailable');
    }

    createArtworkCanvas(paintingData, dataUrl);
    if (paintingData.texture) {
      paintingData.texture.needsUpdate = true;
    }

    document.getElementById('artwork-img').src = dataUrl;
    this.multiplayer.showToast('✅ Rasm ramkaga muvaffaqiyatli joylashtirildi!');
  }

  checkRaycastInteractions() {
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    const intersects = this.raycaster.intersectObjects(this.museum.interactiveObjects, true);

    let foundPainting = null;

    if (intersects.length > 0) {
      let root = intersects[0].object;
      while (root && !root.userData?.data) {
        root = root.parent;
      }
      if (root && root.userData?.data) {
        foundPainting = root.userData.data;
      }
    }

    // Closest distance check (only paintings in front of the player)
    if (!foundPainting) {
      let closestDist = Infinity;
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.yaw);

      for (const p of this.museum.paintings) {
        const toPainting = p.mesh.position.clone().sub(this.player.position);
        toPainting.y = 0;
        const dist = toPainting.length();
        const maxDist = p.data?.isMonumental ? 7.5 : 4.4;

        if (dist < maxDist) {
          toPainting.normalize();
          const dot = forward.dot(toPainting);
          if (dot > 0.25 && dist < closestDist) {
            closestDist = dist;
            foundPainting = p.data;
          }
        }
      }
    }

    this.activePainting = foundPainting;

    const promptEl = document.getElementById('inspect-prompt');
    const mInspectBtn = document.getElementById('m-btn-inspect');

    if (foundPainting) {
      promptEl.classList.remove('hidden');
      document.getElementById('prompt-text').textContent = `"${foundPainting.title}" ni ko'rish`;
      if (mInspectBtn) mInspectBtn.classList.remove('hidden');
    } else {
      promptEl.classList.add('hidden');
      if (mInspectBtn) mInspectBtn.classList.add('hidden');
    }
  }

  getCurrentRoomTitle(x, z) {
    if (z >= 29) {
      return 'I. Kirish Rotundasi';
    }
    if (x >= 11 && z >= 14 && z <= 30) {
      return 'II. Atirgullar Zali';
    }
    if (x >= -6.5 && x <= 6.5 && z >= 0 && z <= 16) {
      return 'III. Farishta Rotundasi';
    }
    if (x <= -11 && z >= 0 && z <= 16) {
      return 'IV. Tog\'lar Zali';
    }
    if (x >= -6.5 && x <= 6.5 && z < -5 && z >= -19) {
      return 'V. Bosfor Marmar Qasri';
    }
    if (x >= -6.5 && x <= 6.5 && z < -19 && z >= -37) {
      return 'VI. Oltin Shafaq Qasri';
    }
    if (z < -37) {
      return 'VII. Abadiy Muhabbat Mehrobi';
    }

    // Corridors & Transition Portals
    if (z >= 19 && z < 29 && x > 0) {
      return 'Yo\'lak: Sharqiy Qanot tomon';
    }
    if (z >= 5 && z <= 16 && x > 5) {
      return 'Yo\'lak: Markaziy Farishta Rotundasi';
    }
    if (x < -6 && z >= 5 && z <= 11) {
      return 'Yo\'lak: G\'arbiy Qanot tomon';
    }
    if (x < -5 && z < 2 && z >= -15) {
      return 'Yo\'lak: Bosfor Qasri tomon';
    }
    return 'Saroy Labirinti';
  }

  renderMinimap() {
    if (!this.minimapCtx || !this.minimapCanvas) return;
    const ctx = this.minimapCtx;
    const cw = this.minimapCanvas.width;
    const ch = this.minimapCanvas.height;

    // Coordinate conversion from 3D world to 2D canvas
    // X span [-22.4, 22.4] -> width 45m. Center X = 0 -> cw / 2 = 65
    // Z span [-57.4, 42.4] -> depth 100m. Top (Z=-57.4) -> 10, Bottom (Z=+42.4) -> 192
    const toX = (wx) => 65 + wx * 2.45;
    const toY = (wz) => 10 + (wz - (-57.4)) * 1.82;

    ctx.clearRect(0, 0, cw, ch);

    // 1. Draw interconnected corridors and chambers
    ctx.lineWidth = 1;
    const playerX = this.player.position.x;
    const playerZ = this.player.position.z;

    this.player.walkableAreas.forEach(area => {
      const left = toX(area.minX);
      const right = toX(area.maxX);
      const top = toY(area.minZ);
      const bottom = toY(area.maxZ);
      const w = Math.max(right - left, 2);
      const h = Math.max(bottom - top, 2);

      const isPlayerInside =
        playerX >= area.minX && playerX <= area.maxX &&
        playerZ >= area.minZ && playerZ <= area.maxZ;

      if (isPlayerInside) {
        ctx.fillStyle = 'rgba(120, 28, 42, 0.9)';
        ctx.fillRect(left, top, w, h);
        ctx.strokeStyle = '#fae17d';
        ctx.strokeRect(left, top, w, h);
      } else {
        ctx.fillStyle = 'rgba(40, 12, 18, 0.82)';
        ctx.fillRect(left, top, w, h);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
        ctx.strokeRect(left, top, w, h);
      }
    });

    // 2. Draw Central Statue Dais in Room 3
    const statueMapX = toX(0);
    const statueMapY = toY(8);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
    ctx.beginPath();
    ctx.arc(statueMapX, statueMapY, 5, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Draw Painting Markers (Gold dots)
    DEFAULT_PAINTINGS.forEach(p => {
      const px = toX(p.position.x);
      const py = toY(p.position.z);
      if (p.isMonumental) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px - 3, py - 3, 6, 6);
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
    });

    // 4. Draw Remote Players (Partner / Sevgilim) as pulsing pink dots
    if (this.multiplayer?.remotePlayers) {
      this.multiplayer.remotePlayers.forEach(p => {
        if (!p.mesh) return;
        const rx = toX(p.mesh.position.x);
        const ry = toY(p.mesh.position.z);

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffe4e6';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // 5. Draw Local Player (Cyan directional arrow)
    const mx = toX(playerX);
    const my = toY(playerZ);

    ctx.save();
    ctx.translate(mx, my);
    // In Three.js: -Z is forward. On canvas, -Z is up (negative Y)
    ctx.rotate(-this.player.yaw);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -5);   // Nose
    ctx.lineTo(3.5, 4);  // Right fin
    ctx.lineTo(0, 2);    // Center notch
    ctx.lineTo(-3.5, 4); // Left fin
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.08);

    try {
      // Update Physical Player & Museum
      this.player.update(delta);
      this.museum.update(delta);

      // Sync Multiplayer
      this.multiplayer.emitLocalMovement(this.player);
      this.multiplayer.update(delta, this.player.position);

      // Raycast interaction
      this.checkRaycastInteractions();

      // Update Room Badge
      const roomTitle = this.getCurrentRoomTitle(this.player.position.x, this.player.position.z);
      if (roomTitle !== this.lastRoomTitle) {
        this.lastRoomTitle = roomTitle;
        const roomEl = document.getElementById('current-room-text');
        if (roomEl) roomEl.textContent = roomTitle;
      }

      // Render Mini-Map Radar (every ~60ms)
      this.minimapTimer += delta;
      if (this.minimapTimer > 0.06) {
        this.minimapTimer = 0;
        this.renderMinimap();
      }
    } catch (err) {
      console.warn('Loop update warning:', err);
    }

    // Always render scene - never freeze viewport
    try {
      this.renderer.render(this.scene, this.camera);
    } catch (renderErr) {
      console.error('Render error:', renderErr);
    }
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.museumApp = new App();
});
