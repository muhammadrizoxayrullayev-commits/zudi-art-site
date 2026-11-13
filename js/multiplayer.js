// ==========================================================================
// REAL-TIME MULTIPLAYER SYSTEM (SOCKET.IO)
// Synchronizes 3D avatars, name tags, walking animations, hearts & chat
// ==========================================================================

export class MultiplayerManager {
  constructor(scene, onProximityChange = null, onHeartSound = null) {
    this.scene = scene;
    this.onProximityChange = onProximityChange;
    this.onHeartSound = onHeartSound;

    this.socket = null;
    this.remotePlayers = new Map(); // socketId -> playerMeshGroup
    this.heartParticles = [];
    this.localPlayerId = null;
  }

  connect(userData, onConnected = null) {
    this.socket = io({
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.localPlayerId = this.socket.id;
      console.log('⚡ Connected to museum server with ID:', this.socket.id);

      // Join room
      this.socket.emit('join-room', userData);

      if (onConnected) onConnected();
    });

    // Receive initial players list
    this.socket.on('current-players', (playersList) => {
      playersList.forEach(p => {
        if (p.id !== this.localPlayerId && !this.remotePlayers.has(p.id)) {
          this.createRemotePlayer(p);
        }
      });
      this.updatePlayerCountUI();
    });

    // New player joined
    this.socket.on('player-joined', (p) => {
      if (p.id !== this.localPlayerId && !this.remotePlayers.has(p.id)) {
        this.createRemotePlayer(p);
        this.showToast(`✨ ${p.name} muzeyga kirdi!`);
      }
      this.updatePlayerCountUI();
    });

    // Remote player moved
    this.socket.on('player-moved', (data) => {
      const p = this.remotePlayers.get(data.id);
      if (p) {
        p.targetPosition.set(data.x, data.y, data.z);
        p.targetRotY = data.rotY;
        p.isMoving = data.isMoving;
      }
    });

    // Remote player sent heart
    this.socket.on('heart-received', (data) => {
      this.spawnHeartExplosion(new THREE.Vector3(data.x, data.y + 1.2, data.z));
      if (this.onHeartSound) this.onHeartSound();
      this.showToast(`❤️ ${data.senderName} sizga yurak yubordi!`);
    });

    // Remote player chat message
    this.socket.on('chat-received', (data) => {
      this.displayChatInUI(data.senderName, data.text);

      // Also attach speech bubble over their 3D avatar
      const p = this.remotePlayers.get(data.senderId);
      if (p) {
        this.showSpeechBubbleOverAvatar(p, data.text);
      }
    });

    // Player disconnected
    this.socket.on('player-left', (data) => {
      if (this.remotePlayers.has(data.id)) {
        const p = this.remotePlayers.get(data.id);
        this.scene.remove(p.mesh);
        this.remotePlayers.delete(data.id);
        this.showToast(`👋 ${data.name} muzeydan chiqdi.`);
      }
      this.updatePlayerCountUI();
    });
  }

  createRemotePlayer(data) {
    const group = new THREE.Group();
    const isGirl = data.role === 'girl';

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3, roughness: 0.6 });
    const clothesColor = isGirl ? 0xdb2777 : 0x1e3a8a; // Rose pink for girl, royal navy for boy
    const clothesMat = new THREE.MeshStandardMaterial({ color: clothesColor, roughness: 0.5, metalness: 0.1 });
    const hairMat = new THREE.MeshStandardMaterial({ color: isGirl ? 0x3d1d11 : 0x1f140e, roughness: 0.8 });

    // 1. Torso / Body
    const torsoGeo = isGirl
      ? new THREE.ConeGeometry(0.38, 0.9, 16) // Elegant flowing gown
      : new THREE.BoxGeometry(0.5, 0.75, 0.28); // Dapper suit jacket
    const torso = new THREE.Mesh(torsoGeo, clothesMat);
    torso.position.y = 0.9;
    torso.castShadow = true;
    group.add(torso);

    // 2. Head
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = isGirl ? 1.48 : 1.45;
    group.add(head);

    // 3. Hair
    const hairGeo = isGirl
      ? new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7)
      : new THREE.BoxGeometry(0.38, 0.12, 0.38);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = isGirl ? 1.5 : 1.56;
    group.add(hair);

    // 4. Limbs (Arms & Legs for walking animation)
    const limbMat = isGirl ? clothesMat : new THREE.MeshStandardMaterial({ color: 0x111827 });
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65), limbMat);
    leftLeg.position.set(-0.16, 0.35, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65), limbMat);
    rightLeg.position.set(0.16, 0.35, 0);
    group.add(rightLeg);

    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6), clothesMat);
    leftArm.position.set(-0.35, 0.95, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6), clothesMat);
    rightArm.position.set(0.35, 0.95, 0);
    group.add(rightArm);

    // 5. Floating 3D Canvas Name Tag & Heart
    const nameSprite = this.createNameTagSprite(data.name, isGirl ? '💃🏻' : '🤵🏻');
    nameSprite.position.set(0, 1.95, 0);
    group.add(nameSprite);

    group.position.set(data.x, 0, data.z);
    this.scene.add(group);

    this.remotePlayers.set(data.id, {
      mesh: group,
      data: data,
      nameSprite: nameSprite,
      targetPosition: new THREE.Vector3(data.x, 0, data.z),
      targetRotY: data.rotY || 0,
      isMoving: false,
      walkCycle: 0,
      limbs: { leftLeg, rightLeg, leftArm, rightArm }
    });
  }

  createNameTagSprite(name, icon) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Pill background
    ctx.fillStyle = 'rgba(24, 8, 12, 0.85)';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 96, 48);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.font = 'bold 44px "Cinzel", serif';
    ctx.fillStyle = '#fae17d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText(`${icon} ${name}`, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.8, 0.45, 1);
    return sprite;
  }

  showSpeechBubbleOverAvatar(playerObj, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 120, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = '32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1e1115';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cleanText = text.length > 25 ? text.slice(0, 23) + '...' : text;
    ctx.fillText(cleanText, 256, 70);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const bubbleSprite = new THREE.Sprite(spriteMat);
    bubbleSprite.scale.set(2.2, 0.6, 1);
    bubbleSprite.position.set(0, 2.5, 0);

    playerObj.mesh.add(bubbleSprite);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      playerObj.mesh.remove(bubbleSprite);
    }, 6000);
  }

  emitLocalMovement(player) {
    if (!this.socket || !this.socket.connected || !player || !player.position) return;

    const rotY = Number.isFinite(player.yaw) ? player.yaw : (player.rotation?.y ?? 0);

    this.socket.emit('player-move', {
      x: player.position.x || 0,
      y: player.position.y || 1.65,
      z: player.position.z || 0,
      rotY: rotY,
      isMoving: !!player.isMoving
    });
  }

  emitHeart(localPlayer, name) {
    if (!this.socket || !this.socket.connected) {
      // Local preview
      this.spawnHeartExplosion(new THREE.Vector3(localPlayer.position.x, 2.2, localPlayer.position.z));
      return;
    }

    this.socket.emit('send-heart', {
      senderName: name,
      x: localPlayer.position.x,
      y: localPlayer.position.y,
      z: localPlayer.position.z
    });
  }

  emitChatMessage(name, text) {
    if (!this.socket || !this.socket.connected) return;
    this.socket.emit('send-chat', {
      senderName: name,
      text: text
    });
  }

  spawnHeartExplosion(origin) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❤️', 32, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 1
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.4, 0.4, 1);
      sprite.position.copy(origin).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.8
      ));

      this.scene.add(sprite);

      this.heartParticles.push({
        sprite: sprite,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          Math.random() * 2.2 + 1.2,
          (Math.random() - 0.5) * 1.5
        ),
        age: 0,
        maxAge: 2.2 + Math.random() * 0.8
      });
    }
  }

  update(delta, localPlayerPos) {
    // 1. Lerp remote players position, rotation & animate walking
    let closestPartnerDist = Infinity;

    this.remotePlayers.forEach(p => {
      // Position lerp
      p.mesh.position.lerp(p.targetPosition, 0.15);

      // Rotation lerp
      let diffRot = p.targetRotY - p.mesh.rotation.y;
      while (diffRot < -Math.PI) diffRot += Math.PI * 2;
      while (diffRot > Math.PI) diffRot -= Math.PI * 2;
      p.mesh.rotation.y += diffRot * 0.15;

      // Limb walking animation
      if (p.isMoving) {
        p.walkCycle += delta * 9;
        const swing = Math.sin(p.walkCycle) * 0.45;
        p.limbs.leftLeg.rotation.x = swing;
        p.limbs.rightLeg.rotation.x = -swing;
        p.limbs.leftArm.rotation.x = -swing * 0.8;
        p.limbs.rightArm.rotation.x = swing * 0.8;
      } else {
        p.limbs.leftLeg.rotation.x *= 0.8;
        p.limbs.rightLeg.rotation.x *= 0.8;
        p.limbs.leftArm.rotation.x *= 0.8;
        p.limbs.rightArm.rotation.x *= 0.8;
      }

      // Check distance to local player for lovers proximity detection
      const dist = p.mesh.position.distanceTo(localPlayerPos);
      if (dist < closestPartnerDist) closestPartnerDist = dist;
    });

    // Notify proximity banner
    if (this.onProximityChange) {
      this.onProximityChange(closestPartnerDist < 2.5);
    }

    // 2. Animate Heart Particles
    for (let i = this.heartParticles.length - 1; i >= 0; i--) {
      const hp = this.heartParticles[i];
      hp.age += delta;
      hp.sprite.position.addScaledVector(hp.vel, delta);
      hp.sprite.material.opacity = Math.max(0, 1 - hp.age / hp.maxAge);
      hp.sprite.scale.multiplyScalar(1.008);

      if (hp.age >= hp.maxAge) {
        this.scene.remove(hp.sprite);
        this.heartParticles.splice(i, 1);
      }
    }
  }

  displayChatInUI(senderName, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = `<b>${senderName}</b><span>${this.escapeHtml(text)}</span>`;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;

    // Automatically expand chat widget for 5 seconds if collapsed
    const widget = document.getElementById('chat-widget');
    if (widget && widget.classList.contains('collapsed')) {
      widget.classList.remove('collapsed');
      setTimeout(() => {
        if (!document.activeElement || document.activeElement.id !== 'chat-input') {
          widget.classList.add('collapsed');
        }
      }, 5000);
    }
  }

  updatePlayerCountUI() {
    const el = document.getElementById('players-count-text');
    if (el) {
      const count = this.remotePlayers.size + 1;
      el.textContent = `Muzeyda: ${count} kishi (${count > 1 ? 'Sizlar birgasizlar ❤️' : 'Sevgilingizni kuting'})`;
    }
  }

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 3500);
    }
  }

  escapeHtml(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }
}

