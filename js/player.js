// ==========================================================================
// BULLETPROOF PHYSICAL PLAYER CONTROLLER
// Supports: Arrow key turning, Edge-scroll mouse, Pointer Lock, Mobile Swipe & Buttons
// Zero freezing, infinite 360° rotation on both desktop and mobile
// ==========================================================================

import { createAvatarModel } from './avatar.js';

export class Player {
  constructor(camera, domElement, scene, onFootstep = null) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;
    this.onFootstep = onFootstep;

    // Physical Position & Rotation
    this.position = new THREE.Vector3(0, 1.65, 36); // Start at grand vestibule entrance
    this.velocity = new THREE.Vector3(0, 0, 0);

    // Rotation angles
    this.yaw = 0; // Face towards the gallery chambers
    this.pitch = 0;
    this.turnVelocity = 0;

    // Physical Movement Parameters
    this.walkSpeed = 5.2;
    this.sprintSpeed = 8.2;
    this.acceleration = 20.0;
    this.friction = 14.0;
    this.turnSpeed = 2.4; // Keyboard turning speed (rad/s)
    this.isMoving = false;

    // Head-Bobbing
    this.bobTimer = 0;
    this.bobIntensity = 0.04;
    this.bobOffset = new THREE.Vector3();

    // Camera Perspective (1st vs 3rd person)
    this.isThirdPerson = false;
    this.cameraDistance = 3.2;

    // Palace Labyrinth Walkable Zones
    this.walkableAreas = [
      { minX: -5.6, maxX: 5.6, minZ: 30.4, maxZ: 41.6 },      // Room 1: Vestibule
      { minX: -2.3, maxX: 2.3, minZ: 21.8, maxZ: 30.6 },      // Corr 1 North
      { minX: -2.3, maxX: 12.6, minZ: 19.8, maxZ: 24.2 },     // Corr 1-2 East
      { minX: 12.4, maxX: 21.6, minZ: 15.4, maxZ: 28.6 },     // Room 2: East Wing
      { minX: 14.8, maxX: 19.2, minZ: 7.8, maxZ: 15.6 },      // Corr 2-3 North
      { minX: 5.8, maxX: 19.2, minZ: 5.8, maxZ: 10.2 },       // Corr 2-3 West
      { minX: -5.6, maxX: 5.6, minZ: 0.4, maxZ: 15.6 },       // Room 3: Central Rotunda
      { minX: -12.6, maxX: -5.8, minZ: 5.8, maxZ: 10.2 },     // Corr 3-4 West
      { minX: -21.6, maxX: -12.4, minZ: 1.4, maxZ: 14.6 },    // Room 4: West Wing
      { minX: -19.2, maxX: -14.8, minZ: -12.2, maxZ: 1.6 },   // Corr 4-5 North
      { minX: -19.2, maxX: -5.8, minZ: -14.2, maxZ: -9.8 },   // Corr 4-5 East
      { minX: -5.6, maxX: 5.6, minZ: -17.6, maxZ: -6.4 },     // Room 5: Bosphorus
      { minX: -2.3, maxX: 2.3, minZ: -20.6, maxZ: -17.4 },    // Portal 5-6
      { minX: -5.6, maxX: 5.6, minZ: -35.6, maxZ: -20.4 },    // Room 6: Golden Sunset
      { minX: -2.8, maxX: 2.8, minZ: -39.6, maxZ: -35.4 },    // Portal 6-7 (Triumphal)
      { minX: -6.6, maxX: 6.6, minZ: -56.6, maxZ: -39.4 }     // Room 7: Sanctuary
    ];

    // Keyboard & Direction States
    this.keys = {
      forward: false,
      backward: false,
      strafeLeft: false,
      strafeRight: false,
      turnLeft: false,
      turnRight: false,
      sprint: false
    };

    // Mouse States
    this.isPointerLocked = false;
    this.edgeTurnRate = 0; // Continuous turning when mouse is at screen edge

    // Mobile Look Touch (Full screen swipe)
    this.lookTouch = {
      touchId: null,
      lastX: 0,
      lastY: 0,
      active: false
    };

    this.footstepTimer = 0;
    this.avatarGroup = null;
    this.avatarLimbs = null;
    this.walkCycle = 0;
    this.userRole = 'boy';

    this.initDesktopControls();
    this.initMobileControls();
  }

  get rotation() {
    return {
      x: this.pitch,
      y: this.yaw,
      z: 0
    };
  }

  setRole(role, name) {
    this.userRole = role;
    this.userName = name;
    this.buildLocalAvatar();
  }

  buildLocalAvatar() {
    if (this.avatarGroup) {
      this.scene.remove(this.avatarGroup);
    }

    const { group, limbs } = createAvatarModel(this.userRole);
    // Position avatar with feet on the museum parquet floor
    group.position.set(this.position.x, 0, this.position.z);
    group.rotation.y = this.yaw;
    group.visible = this.isThirdPerson;
    this.scene.add(group);

    this.avatarGroup = group;
    this.avatarLimbs = limbs;
  }

  initDesktopControls() {
    // Keyboard listeners
    // WASD = Walking & Strafing
    // Arrow keys & Q/E = Smooth Turning (Left/Right) & Walking (Up/Down)
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      const key = (e.key || '').toLowerCase();

      // Forward / Backward
      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'ц') this.keys.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'ы') this.keys.backward = true;

      // Strafe Left / Right
      if (code === 'KeyA' || key === 'a' || key === 'ф') this.keys.strafeLeft = true;
      if (code === 'KeyD' || key === 'd' || key === 'в') this.keys.strafeRight = true;

      // Dedicated Turn Keys (Arrow Left/Right & Q/E)
      if (code === 'ArrowLeft' || code === 'KeyQ' || key === 'q' || key === 'й') this.keys.turnLeft = true;
      if (code === 'ArrowRight' || key === 'e' && !this.isNearPainting() || key === 'у') this.keys.turnRight = true;

      // Sprint
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = true;

      // Toggle Camera Perspective (V key)
      if (code === 'KeyV' || key === 'v' || key === 'м') {
        const cameraBtn = document.getElementById('btn-camera');
        if (cameraBtn) cameraBtn.click();
        else this.toggleCameraPerspective();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      const key = (e.key || '').toLowerCase();

      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'ц') this.keys.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'ы') this.keys.backward = false;
      if (code === 'KeyA' || key === 'a' || key === 'ф') this.keys.strafeLeft = false;
      if (code === 'KeyD' || key === 'd' || key === 'в') this.keys.strafeRight = false;
      if (code === 'ArrowLeft' || code === 'KeyQ' || key === 'q' || key === 'й') this.keys.turnLeft = false;
      if (code === 'ArrowRight' || key === 'e' || key === 'у') this.keys.turnRight = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = false;
    });

    // PointerLock state
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.domElement;
      this.edgeTurnRate = 0;
      this.hasMouseMoved = false;
    });

    // Reset when leaving window or blur
    window.addEventListener('mouseleave', () => {
      this.edgeTurnRate = 0;
      this.hasMouseMoved = false;
    });

    window.addEventListener('blur', () => {
      this.edgeTurnRate = 0;
      this.hasMouseMoved = false;
      for (const k in this.keys) this.keys[k] = false;
    });

    // Click canvas to engage Pointer Lock
    this.domElement.addEventListener('click', () => {
      const modal = document.getElementById('entry-modal');
      const artModal = document.getElementById('artwork-modal');
      const isModalOpen = (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') ||
                          (artModal && !artModal.classList.contains('hidden'));

      if (!isModalOpen && !this.isPointerLocked && window.innerWidth >= 768) {
        this.domElement.requestPointerLock?.();
      }
    });

    // Desktop Mouse Move
    window.addEventListener('mousemove', (e) => {
      const modal = document.getElementById('entry-modal');
      if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') return;

      if (this.isPointerLocked) {
        // Full 360° Infinite Mouse Look (Pointer Lock)
        const mx = Number.isFinite(e.movementX) ? e.movementX : 0;
        const my = Number.isFinite(e.movementY) ? e.movementY : 0;
        this.yaw -= mx * 0.0026;
        this.pitch -= my * 0.0026;
        this.edgeTurnRate = 0;
      } else {
        // Direct mouse motion delta
        if (this.hasMouseMoved && Number.isFinite(this.lastMouseX) && Number.isFinite(this.lastMouseY)) {
          const dx = e.clientX - this.lastMouseX;
          const dy = e.clientY - this.lastMouseY;
          if (Math.abs(dx) < 200 && Math.abs(dy) < 200) {
            this.yaw -= dx * 0.0032;
            this.pitch -= dy * 0.0032;
          }
        }
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.hasMouseMoved = true;
      }

      this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));
      if (!Number.isFinite(this.yaw)) this.yaw = 0;
      if (!Number.isFinite(this.pitch)) this.pitch = 0;
    });
  }

  initMobileControls() {
    // 1. Mobile Touch Look Swipe (Silky smooth 360° swipe rotation)
    window.addEventListener('touchstart', (e) => {
      const modal = document.getElementById('entry-modal');
      if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') return;

      const target = e.target;
      // If tapping directly on interactive UI element, don't hijack as look touch
      if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'INPUT' || target.closest('#chat-widget')) {
        return;
      }

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (this.lookTouch.touchId === null) {
          this.lookTouch.touchId = t.identifier;
          this.lookTouch.lastX = t.clientX;
          this.lookTouch.lastY = t.clientY;
          this.lookTouch.active = true;
        }
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      const modal = document.getElementById('entry-modal');
      if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.lookTouch.touchId) {
          if (e.cancelable) e.preventDefault();

          const dx = t.clientX - this.lookTouch.lastX;
          const dy = t.clientY - this.lookTouch.lastY;

          if (Math.abs(dx) < 150 && Math.abs(dy) < 150) {
            this.yaw -= dx * 0.0055;
            this.pitch -= dy * 0.0055;
            this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));

            if (!Number.isFinite(this.yaw)) this.yaw = 0;
            if (!Number.isFinite(this.pitch)) this.pitch = 0;
          }

          this.lookTouch.lastX = t.clientX;
          this.lookTouch.lastY = t.clientY;
        }
      }
    }, { passive: false });

    const endTouch = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.lookTouch.touchId) {
          this.lookTouch.touchId = null;
          this.lookTouch.active = false;
        }
      }
    };

    window.addEventListener('touchend', endTouch, { passive: true });
    window.addEventListener('touchcancel', endTouch, { passive: true });

    // 2. Mobile D-Pad Buttons (Walk & Turn)
    this.initTouchButtons();
  }

  initTouchButtons() {
    const bindBtn = (id, action) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const start = (e) => {
        if (e.cancelable) e.preventDefault();
        action(true);
      };
      const end = (e) => {
        if (e.cancelable) e.preventDefault();
        action(false);
      };

      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('touchcancel', end, { passive: false });

      btn.addEventListener('mousedown', (e) => { e.preventDefault(); action(true); });
      btn.addEventListener('mouseup', () => action(false));
      btn.addEventListener('mouseleave', () => action(false));
    };

    // D-Pad Walk buttons
    bindBtn('btn-walk-up', (active) => { this.keys.forward = active; });
    bindBtn('btn-walk-down', (active) => { this.keys.backward = active; });
    bindBtn('btn-walk-left', (active) => { this.keys.strafeLeft = active; });
    bindBtn('btn-walk-right', (active) => { this.keys.strafeRight = active; });

    // Dedicated Touch Turn Buttons (Left & Right)
    bindBtn('btn-turn-left', (active) => { this.keys.turnLeft = active; });
    bindBtn('btn-turn-right', (active) => { this.keys.turnRight = active; });
  }

  isNearPainting() {
    return document.getElementById('inspect-prompt') &&
           !document.getElementById('inspect-prompt').classList.contains('hidden');
  }

  isInsideWalkable(x, z) {
    // 1. Physical Obstacle: Central Classical Statue in Room 3 (Center 0, 8, radius 2.3m)
    const statueDx = x - 0;
    const statueDz = z - 8;
    if (statueDx * statueDx + statueDz * statueDz < 2.3 * 2.3) {
      return false;
    }

    // 2. Check walkable palace corridors & rooms
    for (let i = 0; i < this.walkableAreas.length; i++) {
      const b = this.walkableAreas[i];
      if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
        return true;
      }
    }
    return false;
  }

  toggleCameraPerspective() {
    this.isThirdPerson = !this.isThirdPerson;
    if (this.avatarGroup) {
      this.avatarGroup.visible = this.isThirdPerson;
    }
    return this.isThirdPerson;
  }

  update(delta) {
    // 1. Process Turning (Keyboard + Screen Edge Scroll + Touch Turn Buttons)
    let turnDelta = 0;
    if (this.keys.turnLeft) turnDelta += this.turnSpeed;
    if (this.keys.turnRight) turnDelta -= this.turnSpeed;
    if (this.edgeTurnRate !== 0) turnDelta += this.edgeTurnRate;

    if (turnDelta !== 0) {
      this.yaw += turnDelta * delta;
    }

    // 2. Physical Walking Vector (WASD + D-Pad)
    const moveDir = new THREE.Vector3();
    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.strafeLeft) moveDir.x -= 1;
    if (this.keys.strafeRight) moveDir.x += 1;

    const maxSpeed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;

    if (moveDir.lengthSq() > 0.001) {
      moveDir.normalize();

      // Transform direction based on player yaw
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const targetVel = new THREE.Vector3()
        .addScaledVector(forward, -moveDir.z)
        .addScaledVector(right, moveDir.x)
        .multiplyScalar(maxSpeed);

      this.velocity.lerp(targetVel, this.acceleration * delta);
      this.isMoving = true;

      // Animate 3D avatar limbs
      this.walkCycle += delta * (this.keys.sprint ? 12 : 8.5);
      if (this.avatarLimbs) {
        const swing = Math.sin(this.walkCycle) * 0.45;
        this.avatarLimbs.leftLeg.rotation.x = swing;
        this.avatarLimbs.rightLeg.rotation.x = -swing;
        this.avatarLimbs.leftArm.rotation.x = -swing * 0.8;
        this.avatarLimbs.rightArm.rotation.x = swing * 0.8;
      }

      // Footstep audio
      this.footstepTimer += delta;
      if (this.footstepTimer > (this.keys.sprint ? 0.3 : 0.44)) {
        this.footstepTimer = 0;
        if (this.onFootstep) this.onFootstep();
      }

      // Head bobbing
      this.bobTimer += delta * (this.keys.sprint ? 14 : 9);
      this.bobOffset.set(
        Math.cos(this.bobTimer * 0.5) * 0.02,
        Math.abs(Math.sin(this.bobTimer)) * this.bobIntensity,
        0
      );
    } else {
      // Natural deceleration with friction
      this.velocity.lerp(new THREE.Vector3(0, 0, 0), this.friction * delta);
      this.isMoving = this.velocity.lengthSq() > 0.01;

      if (this.avatarLimbs) {
        this.avatarLimbs.leftLeg.rotation.x *= 0.8;
        this.avatarLimbs.rightLeg.rotation.x *= 0.8;
        this.avatarLimbs.leftArm.rotation.x *= 0.8;
        this.avatarLimbs.rightArm.rotation.x *= 0.8;
      }
      this.bobOffset.lerp(new THREE.Vector3(0, 0, 0), 0.15);
    }

    // 3. Move Position with Sliding AABB Collision
    const nextX = this.position.x + this.velocity.x * delta;
    const nextZ = this.position.z + this.velocity.z * delta;

    if (this.isInsideWalkable(nextX, this.position.z)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = 0;
    }

    if (this.isInsideWalkable(this.position.x, nextZ)) {
      this.position.z = nextZ;
    } else {
      this.velocity.z = 0;
    }

    this.position.y = 1.65;

    // 5. Update Avatar Position & Rotation (Feet on floor at y = 0)
    if (this.avatarGroup) {
      this.avatarGroup.position.set(this.position.x, 0, this.position.z);
      this.avatarGroup.rotation.y = this.yaw;
    }

    // 6. Camera Placement
    if (!this.isThirdPerson) {
      // First Person (Eye Level + Head Bob)
      this.camera.position.copy(this.position).add(this.bobOffset);
      this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    } else {
      // Third Person (Behind character, viewing upper body and gallery)
      const camOffset = new THREE.Vector3(0, 0.45, this.cameraDistance)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch * 0.5)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const targetCamPos = this.position.clone().add(camOffset);
      this.camera.position.lerp(targetCamPos, 0.28);

      const lookTarget = new THREE.Vector3(this.position.x, 1.35, this.position.z);
      this.camera.lookAt(lookTarget);
    }
  }
}
