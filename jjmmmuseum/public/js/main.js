// ==========================================================================
// MAIN CONTROLLER & APPLICATION ENTRY POINT
// Initializes Three.js engine, Museum, Physical Player, Multiplayer, UI & Events
// ==========================================================================

import { Museum } from './museum.js';
import { Player } from './player.js';
import { MultiplayerManager } from './multiplayer.js';
import { AudioManager } from './audio.js';
import { createArtworkCanvas, createStatueCanvas } from './paintings.js';

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
    this.raycaster.far = 5.2;

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

    // Distance fallback check
    if (!foundPainting) {
      for (const p of this.museum.paintings) {
        const dist = this.player.position.distanceTo(p.mesh.position);
        if (dist < 4.0) {
          foundPainting = p.data;
          break;
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
