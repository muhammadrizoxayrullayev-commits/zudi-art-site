// ==========================================================================
// PHYSICAL PLAYER CONTROLLER (SMOOTH MOBILE GAME FEEL + FREE DESKTOP MOUSE)
// Features: Dual-input (D-Pad + Floating Joystick), Inertia swipe, Free mouse look
// ==========================================================================

export class Player {
  constructor(camera, domElement, scene, onFootstep = null) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;
    this.onFootstep = onFootstep;

    // Physical Position & Rotation
    this.position = new THREE.Vector3(0, 1.65, 24); // Start near entrance
    this.velocity = new THREE.Vector3(0, 0, 0);

    // Rotation angles (radians)
    this.yaw = Math.PI; // Face towards negative Z (down the hall)
    this.pitch = 0;
    this.targetYaw = this.yaw;
    this.targetPitch = this.pitch;

    // Physical Movement Parameters
    this.walkSpeed = 5.2;
    this.sprintSpeed = 8.0;
    this.acceleration = 18.0;
    this.friction = 12.0;
    this.isMoving = false;

    // Head-Bobbing (First-Person realism)
    this.bobTimer = 0;
    this.bobIntensity = 0.045;
    this.bobOffset = new THREE.Vector3();

    // Camera Perspective (1st person vs 3rd person)
    this.isThirdPerson = false;
    this.cameraDistance = 3.2;

    // Bounds in Museum Hall (Collision)
    this.bounds = {
      minX: -5.4,
      maxX: 5.4,
      minZ: -33.2,
      maxZ: 33.2
    };

    // Desktop Controls State
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false
    };
    this.isPointerLocked = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.hasMouseMoved = false;

    // Mobile Virtual Touch Joystick (Dynamic Floating)
    this.joystick = {
      touchId: null,
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0,
      active: false,
      maxRadius: 48
    };

    // Mobile Touch Look Swipe
    this.lookTouch = {
      touchId: null,
      lastX: 0,
      lastY: 0,
      velX: 0,
      velY: 0,
      active: false
    };

    this.footstepTimer = 0;

    // 3D Avatar for Local Player (visible in 3rd person)
    this.avatarGroup = null;
    this.avatarLimbs = null;
    this.walkCycle = 0;
    this.userRole = 'boy';

    this.initDesktopControls();
    this.initMobileControls();
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

    const group = new THREE.Group();
    const isGirl = this.userRole === 'girl';

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3, roughness: 0.55 });
    const clothesColor = isGirl ? 0xdb2777 : 0x1e3a8a;
    const clothesMat = new THREE.MeshStandardMaterial({ color: clothesColor, roughness: 0.5, metalness: 0.15 });
    const hairMat = new THREE.MeshStandardMaterial({ color: isGirl ? 0x3d1d11 : 0x1f140e, roughness: 0.8 });

    // Torso
    const torsoGeo = isGirl
      ? new THREE.ConeGeometry(0.38, 0.95, 16)
      : new THREE.BoxGeometry(0.5, 0.78, 0.28);
    const torso = new THREE.Mesh(torsoGeo, clothesMat);
    torso.position.y = 0.9;
    group.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = isGirl ? 1.5 : 1.48;
    group.add(head);

    // Hair
    const hairGeo = isGirl
      ? new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7)
      : new THREE.BoxGeometry(0.38, 0.12, 0.38);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = isGirl ? 1.52 : 1.58;
    group.add(hair);

    // Limbs
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

    group.position.copy(this.position);
    group.visible = this.isThirdPerson;
    this.scene.add(group);

    this.avatarGroup = group;
    this.avatarLimbs = { leftLeg, rightLeg, leftArm, rightArm };
  }

  initDesktopControls() {
    // Keyboard listeners (Supports Latin + Cyrillic layout)
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      const key = (e.key || '').toLowerCase();

      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'ц') this.keys.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'ы') this.keys.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a' || key === 'ф') this.keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'в') this.keys.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = true;
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      const key = (e.key || '').toLowerCase();

      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'ц') this.keys.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'ы') this.keys.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a' || key === 'ф') this.keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'в') this.keys.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = false;
    });

    // PointerLock state
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.domElement;
    });

    this.domElement.addEventListener('click', () => {
      const modal = document.getElementById('entry-modal');
      const artModal = document.getElementById('artwork-modal');
      const isModalOpen = (modal && !modal.classList.contains('hidden')) || (artModal && !artModal.classList.contains('hidden'));

      if (!isModalOpen && !this.isPointerLocked && window.innerWidth >= 768) {
        this.domElement.requestPointerLock?.();
      }
    });

    // Free Mouse Look (Tracks mouse position directly across window)
    window.addEventListener('mousemove', (e) => {
      const modal = document.getElementById('entry-modal');
      if (modal && !modal.classList.contains('hidden')) return;

      if (this.isPointerLocked) {
        const mx = e.movementX || 0;
        const my = e.movementY || 0;
        this.targetYaw -= mx * 0.0028;
        this.targetPitch -= my * 0.0028;
      } else {
        // Free mouse movement: camera turns wherever the mouse moves!
        if (!this.hasMouseMoved) {
          this.lastMouseX = e.clientX;
          this.lastMouseY = e.clientY;
          this.hasMouseMoved = true;
          return;
        }

        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;

        this.targetYaw -= dx * 0.0035;
        this.targetPitch -= dy * 0.0035;

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }

      this.targetPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.targetPitch));
    });
  }

  initMobileControls() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickStick = document.getElementById('joystick-stick');
    const joystickBase = document.getElementById('joystick-base');

    // 1. Dynamic Full-Screen Touch Handler
    window.addEventListener('touchstart', (e) => {
      const modal = document.getElementById('entry-modal');
      if (modal && !modal.classList.contains('hidden')) return;

      // Allow clicks on buttons/inputs
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button') || target.closest('input')) {
        return;
      }

      // Prevent default page zooming / scrolling
      if (e.cancelable) e.preventDefault();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        // Left Half = Walking Joystick
        if (t.clientX < window.innerWidth * 0.5) {
          if (this.joystick.touchId === null) {
            this.joystick.touchId = t.identifier;
            this.joystick.active = true;
            this.joystick.startX = t.clientX;
            this.joystick.startY = t.clientY;

            if (joystickZone && joystickBase) {
              joystickBase.style.display = 'block';
              joystickZone.style.left = `${t.clientX - 60}px`;
              joystickZone.style.top = `${t.clientY - 60}px`;
              joystickZone.style.bottom = 'auto';
            }

            this.updateJoystickPosition(t.clientX, t.clientY, joystickStick);
          }
        } else {
          // Right Half = Look Swipe (360° Game Turning)
          if (this.lookTouch.touchId === null) {
            this.lookTouch.touchId = t.identifier;
            this.lookTouch.lastX = t.clientX;
            this.lookTouch.lastY = t.clientY;
            this.lookTouch.velX = 0;
            this.lookTouch.velY = 0;
            this.lookTouch.active = true;
          }
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      const modal = document.getElementById('entry-modal');
      if (modal && !modal.classList.contains('hidden')) return;

      const target = e.target;
      if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) {
        return;
      }

      if (e.cancelable) e.preventDefault();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (t.identifier === this.joystick.touchId) {
          this.updateJoystickPosition(t.clientX, t.clientY, joystickStick);
        } else if (t.identifier === this.lookTouch.touchId) {
          const dx = t.clientX - this.lookTouch.lastX;
          const dy = t.clientY - this.lookTouch.lastY;

          // Game-like rotation sensitivity
          this.targetYaw -= dx * 0.007;
          this.targetPitch -= dy * 0.007;
          this.targetPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.targetPitch));

          this.lookTouch.velX = dx;
          this.lookTouch.velY = dy;

          this.lookTouch.lastX = t.clientX;
          this.lookTouch.lastY = t.clientY;
        }
      }
    }, { passive: false });

    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.joystick.touchId) {
          this.joystick.touchId = null;
          this.joystick.active = false;
          this.joystick.deltaX = 0;
          this.joystick.deltaY = 0;
          if (joystickStick) joystickStick.style.transform = 'translate(-50%, -50%)';
          if (joystickZone) {
            joystickZone.style.left = '20px';
            joystickZone.style.bottom = 'calc(env(safe-area-inset-bottom, 16px) + 20px)';
            joystickZone.style.top = 'auto';
          }
        } else if (t.identifier === this.lookTouch.touchId) {
          this.lookTouch.touchId = null;
          this.lookTouch.active = false;
        }
      }
    };

    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // 2. On-Screen D-Pad Walk Buttons (100% Reliable Walking for Mobile)
    this.initDPadControls();
  }

  initDPadControls() {
    const bindBtn = (id, direction) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const start = (e) => {
        if (e.cancelable) e.preventDefault();
        this.keys[direction] = true;
      };
      const end = (e) => {
        if (e.cancelable) e.preventDefault();
        this.keys[direction] = false;
      };

      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('touchcancel', end, { passive: false });

      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
    };

    bindBtn('btn-walk-up', 'forward');
    bindBtn('btn-walk-down', 'backward');
    bindBtn('btn-walk-left', 'left');
    bindBtn('btn-walk-right', 'right');
  }

  updateJoystickPosition(clientX, clientY, stickEl) {
    const dx = clientX - this.joystick.startX;
    const dy = clientY - this.joystick.startY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, this.joystick.maxRadius);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;

    if (stickEl) {
      stickEl.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;
    }

    this.joystick.deltaX = stickX / this.joystick.maxRadius;
    this.joystick.deltaY = stickY / this.joystick.maxRadius;
  }

  toggleCameraPerspective() {
    this.isThirdPerson = !this.isThirdPerson;
    if (this.avatarGroup) {
      this.avatarGroup.visible = this.isThirdPerson;
    }
    return this.isThirdPerson;
  }

  update(delta) {
    // 1. Smooth Camera Rotation (Interpolation)
    this.yaw += (this.targetYaw - this.yaw) * 0.28;
    this.pitch += (this.targetPitch - this.pitch) * 0.28;

    // Apply swipe inertia on mobile
    if (!this.lookTouch.active && Math.abs(this.lookTouch.velX) > 0.1) {
      this.targetYaw -= this.lookTouch.velX * 0.004;
      this.lookTouch.velX *= 0.88;
    }

    // 2. Physical Input Direction Vector
    const inputDir = new THREE.Vector3();

    // Keyboard / D-Pad
    if (this.keys.forward) inputDir.z -= 1;
    if (this.keys.backward) inputDir.z += 1;
    if (this.keys.left) inputDir.x -= 1;
    if (this.keys.right) inputDir.x += 1;

    // Mobile Joystick
    if (this.joystick.active) {
      inputDir.x += this.joystick.deltaX;
      inputDir.z += this.joystick.deltaY;
    }

    const maxSpeed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;

    if (inputDir.lengthSq() > 0.001) {
      if (inputDir.lengthSq() > 1) inputDir.normalize();

      // Transform direction according to player's current yaw
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const desiredVel = new THREE.Vector3()
        .addScaledVector(forward, -inputDir.z)
        .addScaledVector(right, inputDir.x)
        .multiplyScalar(maxSpeed);

      this.velocity.lerp(desiredVel, this.acceleration * delta);
      this.isMoving = true;

      // Animate walking limbs
      this.walkCycle += delta * (this.keys.sprint ? 12 : 8.5);
      if (this.avatarLimbs) {
        const swing = Math.sin(this.walkCycle) * 0.45;
        this.avatarLimbs.leftLeg.rotation.x = swing;
        this.avatarLimbs.rightLeg.rotation.x = -swing;
        this.avatarLimbs.leftArm.rotation.x = -swing * 0.8;
        this.avatarLimbs.rightArm.rotation.x = swing * 0.8;
      }

      // Footstep audio pacing
      this.footstepTimer += delta;
      if (this.footstepTimer > (this.keys.sprint ? 0.3 : 0.44)) {
        this.footstepTimer = 0;
        if (this.onFootstep) this.onFootstep();
      }

      // First-person head bobbing
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
      this.bobOffset.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }

    // 3. Move Position with Velocity
    this.position.addScaledVector(this.velocity, delta);

    // 4. Collision Enforcement (Hall Walls & Boundaries)
    this.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.position.x));
    this.position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.position.z));
    this.position.y = 1.65;

    // 5. Update Local Avatar Position & Rotation
    if (this.avatarGroup) {
      this.avatarGroup.position.copy(this.position);
      this.avatarGroup.rotation.y = this.yaw;
    }

    // 6. Camera Placement (1st vs 3rd Person)
    if (!this.isThirdPerson) {
      // First Person
      this.camera.position.copy(this.position).add(this.bobOffset);
      this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    } else {
      // Third Person (Smooth behind-the-back tracking)
      const camOffset = new THREE.Vector3(0, 1.4, this.cameraDistance)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch * 0.5)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const targetCamPos = this.position.clone().add(camOffset);
      this.camera.position.lerp(targetCamPos, 0.28);

      const lookTarget = this.position.clone().add(new THREE.Vector3(0, 0.4, 0));
      this.camera.lookAt(lookTarget);
    }
  }
}
