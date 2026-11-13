// ==========================================================================
// PLAYER CONTROLLER (DESKTOP WASD/MOUSE + MOBILE TOUCH JOYSTICK & LOOK)
// Seamlessly supports 1st-person & 3rd-person perspectives
// ==========================================================================

export class Player {
  constructor(camera, domElement, onFootstep = null) {
    this.camera = camera;
    this.domElement = domElement;
    this.onFootstep = onFootstep;

    // Position & Rotation
    this.position = new THREE.Vector3(0, 1.65, 28); // Start near entrance
    this.rotation = new THREE.Euler(0, Math.PI, 0, 'YXZ'); // Look down the hall
    this.velocity = new THREE.Vector3();

    // Speed & Movement
    this.walkSpeed = 4.2;
    this.sprintSpeed = 7.0;
    this.isMoving = false;
    this.footstepTimer = 0;

    // Camera Mode (1st person vs 3rd person)
    this.isThirdPerson = false;
    this.thirdPersonOffset = new THREE.Vector3(0, 1.8, 3.2);

    // Desktop Key States
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false
    };

    // Mobile Virtual Joystick State
    this.joystickDelta = { x: 0, y: 0 };
    this.isJoystickActive = false;

    // Touch Look Swipe State
    this.touchLookId = null;
    this.lastTouchPos = { x: 0, y: 0 };

    // Bounds in Museum Hall
    this.bounds = {
      minX: -5.6,
      maxX: 5.6,
      minZ: -33.5,
      maxZ: 33.5
    };

    // PointerLock state
    this.isPointerLocked = false;

    this.initDesktopControls();
    this.initMobileControls();
  }

  initDesktopControls() {
    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
        case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
        case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
        case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = true; break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
        case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
        case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
        case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = false; break;
      }
    });

    // Pointer lock for desktop mouse look
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.domElement;
    });

    this.domElement.addEventListener('click', () => {
      // If modal is not active and not on mobile, request pointer lock
      if (!this.isPointerLocked && window.innerWidth >= 768) {
        const modal = document.getElementById('entry-modal');
        const artModal = document.getElementById('artwork-modal');
        if (modal.classList.contains('hidden') && artModal.classList.contains('hidden')) {
          this.domElement.requestPointerLock?.();
        }
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked) return;

      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      this.rotation.y -= movementX * 0.0022;
      this.rotation.x -= movementY * 0.0022;

      // Clamp vertical look angle
      this.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.rotation.x));
    });
  }

  initMobileControls() {
    // 1. Virtual Joystick
    const joystickZone = document.getElementById('joystick-zone');
    const joystickStick = document.getElementById('joystick-stick');
    const joystickBase = document.getElementById('joystick-base');

    if (joystickZone && joystickStick && joystickBase) {
      let touchId = null;
      let baseRect = null;
      let centerX = 0;
      let centerY = 0;
      const maxRadius = 45;

      const handleTouchStart = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (touchId === null) {
            touchId = t.identifier;
            this.isJoystickActive = true;
            baseRect = joystickBase.getBoundingClientRect();
            centerX = baseRect.left + baseRect.width / 2;
            centerY = baseRect.top + baseRect.height / 2;
            this.updateJoystick(t.clientX - centerX, t.clientY - centerY, maxRadius, joystickStick);
          }
        }
      };

      const handleTouchMove = (e) => {
        if (!this.isJoystickActive) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchId) {
            this.updateJoystick(t.clientX - centerX, t.clientY - centerY, maxRadius, joystickStick);
          }
        }
      };

      const handleTouchEnd = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            touchId = null;
            this.isJoystickActive = false;
            this.joystickDelta = { x: 0, y: 0 };
            joystickStick.style.transform = 'translate(-50%, -50%)';
          }
        }
      };

      joystickZone.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd, { passive: false });
      window.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    // 2. Touch Look Zone (Right half of screen)
    const lookZone = document.getElementById('touch-look-zone');
    if (lookZone) {
      lookZone.addEventListener('touchstart', (e) => {
        if (this.touchLookId === null && e.changedTouches.length > 0) {
          const t = e.changedTouches[0];
          this.touchLookId = t.identifier;
          this.lastTouchPos = { x: t.clientX, y: t.clientY };
        }
      }, { passive: true });

      lookZone.addEventListener('touchmove', (e) => {
        if (this.touchLookId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === this.touchLookId) {
            const dx = t.clientX - this.lastTouchPos.x;
            const dy = t.clientY - this.lastTouchPos.y;

            this.rotation.y -= dx * 0.004;
            this.rotation.x -= dy * 0.004;
            this.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.rotation.x));

            this.lastTouchPos = { x: t.clientX, y: t.clientY };
          }
        }
      }, { passive: true });

      const endLook = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.touchLookId) {
            this.touchLookId = null;
          }
        }
      };
      lookZone.addEventListener('touchend', endLook, { passive: true });
      lookZone.addEventListener('touchcancel', endLook, { passive: true });
    }
  }

  updateJoystick(dx, dy, maxRadius, stickEl) {
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(distance, maxRadius);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;

    stickEl.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;

    // Normalized delta (-1 to 1)
    this.joystickDelta = {
      x: stickX / maxRadius,
      y: stickY / maxRadius
    };
  }

  toggleCameraPerspective() {
    this.isThirdPerson = !this.isThirdPerson;
    return this.isThirdPerson;
  }

  update(delta) {
    const moveDir = new THREE.Vector3();

    // 1. Process Desktop Input
    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;

    // 2. Process Mobile Joystick Input
    if (this.isJoystickActive) {
      moveDir.x += this.joystickDelta.x;
      moveDir.z += this.joystickDelta.y;
    }

    const currentSpeed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;

    if (moveDir.lengthSq() > 0.001) {
      moveDir.normalize();

      // Orient move direction relative to player's yaw
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);

      const worldMove = new THREE.Vector3()
        .addScaledVector(forward, -moveDir.z)
        .addScaledVector(right, moveDir.x)
        .multiplyScalar(currentSpeed * delta);

      this.position.add(worldMove);
      this.isMoving = true;

      // Footstep sound tick
      this.footstepTimer += delta;
      if (this.footstepTimer > (this.keys.sprint ? 0.32 : 0.48)) {
        this.footstepTimer = 0;
        if (this.onFootstep) this.onFootstep();
      }
    } else {
      this.isMoving = false;
      this.footstepTimer = 0.3; // Ready on start
    }

    // 3. Enforce Museum Hall Collisions
    this.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.position.x));
    this.position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.position.z));
    this.position.y = 1.65; // Fixed ground height

    // 4. Update Camera Position & Rotation
    if (!this.isThirdPerson) {
      // First Person
      this.camera.position.copy(this.position);
      this.camera.rotation.copy(this.rotation);
    } else {
      // Third Person (Slightly behind and above avatar)
      const offset = this.thirdPersonOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
      this.camera.position.copy(this.position).add(offset);

      // Look slightly above the player head
      const target = this.position.clone().add(new THREE.Vector3(0, 0.4, 0));
      this.camera.lookAt(target);
    }
  }
}

