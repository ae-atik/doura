import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Player {
  constructor(scene, lanePositions, musicManager) {
    this.scene = scene;
    this.lane = 2;
    this.lanePositions = lanePositions;

    // Basic physics
    this.velocityY = 0;
    this.gravity = -0.004;
    this.jumpStrength = 0.09;
    this.onGround = true;

    // THREE essentials
    this.mixer = null;
    this.model = null;
    this.animations = null;
    this.mesh = null;
    this.clock = new THREE.Clock();

    // Animation actions
    this.runAction = null;
    this.jumpAction = null;
    this.dieAction = null;

    // Dead state
    this.isDead = false;

    // Initialize Bounding Box
    this.boundingBox = new THREE.Box3();

    // Sound manager
    this.musicManager = musicManager;

    // Load the GLB with ALL animations (run, jump, die)
    const loader = new GLTFLoader();
    loader.load(
      "/assets/models/dying.glb", 
      (gltf) => {
        const model = gltf.scene;
        this.animations = gltf.animations;
        this.model = model;
        this.mesh = model; // for compatibility
        this.scene.add(model);

        // Orientation & position
        model.rotation.y = Math.PI;
        model.position.z = 2.4;
        // model.scale.set(1, 1, 1); // adjust if needed

        // Initialize bounding box
        this.boundingBox.setFromObject(model);
        this.shrinkBoundingBox(0.1);

        // Create the mixer and actions
        if (gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(model);

          // Example: 
          //   index 0 = jump
          //   index 1 = run
          //   index 2 = die
          this.runAction = this.mixer.clipAction(gltf.animations[1]); 
          this.runAction.setLoop(THREE.LoopRepeat);
          this.runAction.play();
        }
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );
  }

  /**
   * Shrinks the bounding box for simpler collision detection
   */
  shrinkBoundingBox(scaleFactor = 0.5) {
    if (this.boundingBox) {
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      this.boundingBox.getSize(size);
      this.boundingBox.getCenter(center);

      size.multiplyScalar(scaleFactor);
      this.boundingBox.setFromCenterAndSize(center, size);
    }
  }

  moveLeft() {
    if (this.lane > 1 && !this.isDead) {
      this.lane--;
    }
  }

  moveRight() {
    if (this.lane < 3 && !this.isDead) {
      this.lane++;
    }
  }

  jump() {
    if (this.isDead) return; // No jumping if dead

    if (this.onGround && this.mixer && this.animations) {
      this.velocityY = this.jumpStrength;
      this.onGround = false;

      // Fade out running, play jump
      this.jumpAction = this.mixer.clipAction(this.animations[0]);
      if (this.musicManager) {
        this.musicManager.playSoundEffect("jump");
      }
      if (this.runAction) {
        this.runAction.fadeOut(0.2);
      }
      this.jumpAction.reset();
      this.jumpAction.fadeIn(0.2);
      this.jumpAction.setLoop(THREE.LoopOnce);
      this.jumpAction.play();
    }
  }

  /**
   * Called every frame to update the player's position and animations
   */
  update() {
    // If model not loaded, do nothing
    if (!this.model) return;

    // If dead, only update dying animation (no movement)
    if (this.isDead) {
      if (this.mixer) {
        const delta = this.clock.getDelta();
        this.mixer.update(delta);
      }
      return;
    }

    // Gravity + jumping
    this.velocityY += this.gravity;
    this.model.position.y += this.velocityY;

    // Ground collision
    if (this.model.position.y <= 0) {
      this.model.position.y = 0;
      this.velocityY = 0;
      this.onGround = true;

      // Resume run after jump
      if (this.runAction && this.jumpAction) {
        this.runAction.reset();
        this.runAction.fadeIn(0.2);
        this.runAction.play();

        this.jumpAction.stop();
        this.jumpAction = null;
      }
    }

    // Update lane position (X)
    this.model.position.x = this.lanePositions[this.lane];

    // Update bounding box for collisions
    this.boundingBox.setFromObject(this.model);
    this.shrinkBoundingBox(0.06);

    // Update the animation mixer
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
  }

  /**
   * Trigger the dying animation
   */
  die() {
    if (!this.mixer || !this.animations || this.isDead) return;
    this.isDead = true; // Mark the player as dead

    // Fade out run action if it's playing
    if (this.runAction) {
      this.runAction.fadeOut(0.2);
    }

    // Start the die animation (assumed at index 2)
    this.dieAction = this.mixer.clipAction(this.animations[2]);
    if (this.dieAction) {
      this.dieAction.reset();
      this.dieAction.setLoop(THREE.LoopOnce);
      this.dieAction.clampWhenFinished = true; // Stay at last frame
      this.dieAction.fadeIn(0.2);
      this.dieAction.play();
    }
  }
}
