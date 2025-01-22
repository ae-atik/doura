// Player.js
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Player {
  constructor(scene, lanePositions) {
    this.lane = 2;
    this.lanePositions = lanePositions;
    this.velocityY = 0;
    this.gravity = -0.004;
    this.jumpStrength = 0.1;
    this.onGround = true;
    this.mixer = undefined;
    this.model = undefined;
    this.animations = undefined;
    this.mesh = undefined; // Added for compatibility
    this.clock = new THREE.Clock();

    this.runAction = null;
    this.jumpAction = null;

    // Initialize Bounding Box
    this.boundingBox = new THREE.Box3();

    // Load the bear model
    const loader = new GLTFLoader();

    loader.load(
      "/assets/models/run.glb",
      (gltf) => {
        const model = gltf.scene;
        this.animations = gltf.animations;
        this.model = model;
        this.mesh = model; // Assign model to mesh for compatibility
        scene.add(model);
        model.rotation.y = Math.PI; // Rotate model if necessary
        model.position.z = 2.4;

        // Optionally, scale the model to fit your game
        // model.scale.set(1, 1, 1); // Adjust as needed

        // Initialize Bounding Box once the model is loaded
        this.boundingBox.setFromObject(this.model);

        // Handle animations
        if (gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);

          // Play a specific animation (e.g., index 1)
          this.runAction = this.mixer.clipAction(gltf.animations[1]);
          this.runAction.setLoop(THREE.LoopRepeat);
          this.runAction.reset();
          this.runAction.play();
          console.log("Playing animation:", gltf.animations[1].name);
        }
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );
  }

  moveLeft() {
    if (this.lane > 1) this.lane--;
  }

  moveRight() {
    if (this.lane < 3) this.lane++;
  }

  jump() {
    if (this.onGround) {
      this.velocityY = this.jumpStrength;
      this.onGround = false;
      this.jumpAction = this.mixer.clipAction(this.animations[0]);
      
      this.runAction.fadeOut(0.2);
      this.jumpAction.reset();
      this.jumpAction.fadeIn(.02);
      this.jumpAction.play();
      this.jumpAction.setLoop(THREE.LoopOnce, 3);
      this.jumpAction.play();
      
      

    }
  }

  update() {
    // Only proceed if the model is loaded
    if (!this.model) return;

    // Apply gravity
    this.velocityY += this.gravity;
    this.model.position.y += this.velocityY;

    // Ground collision
    if (this.model.position.y <= 0) {
      this.model.position.y = 0;
      this.velocityY = 0;
      this.onGround = true;
      if (this.runAction && this.jumpAction) {

        this.runAction.reset();
        // this.runAction.fadeIn(0.2);
        this.runAction.play();
        this.jumpAction = undefined;
        console.log("Resuming run animation:", this.runAction._clip.name);
      }
    }

    // Update lane position
    this.model.position.x = this.lanePositions[this.lane];

    // Update bounding box
    this.boundingBox.setFromObject(this.model);

    // Update animations
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
  }
}
