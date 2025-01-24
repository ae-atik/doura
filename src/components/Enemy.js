import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Enemy {
  constructor(scene, lanePositions, clock) {
    this.scene = scene;
    this.lanePositions = lanePositions;
    this.clock = clock;

    const enemyModels = [
      "/assets/models/obs1.glb",
      "/assets/models/obs2.glb",
      "/assets/models/obs3.glb",
    ];

    const chosenModelPath =
      enemyModels[Math.floor(Math.random() * enemyModels.length)];
    
    const loader = new GLTFLoader();
    loader.load(
      chosenModelPath || enemyModels[0],
      (gltf) => {
        this.mesh = gltf.scene;

        // Enhanced positioning and scaling
        this.mesh.scale.set(0.8, 0.8, 0.8); // Slightly smaller scale
        this.mesh.rotation.y = Math.PI * 0.5;

        // Ground integration
        this.mesh.traverse((child) => {
          if (child.isMesh) {
            // Enhanced shadow and ground interaction
            child.castShadow = true;
            child.receiveShadow = true;

            // Adjust material for more natural look
            if (child.material) {
              child.material.shadowSide = THREE.FrontSide;
              child.material.needsUpdate = true;
            }
          }
        });

        // Positioning just above ground with slight randomization
        const groundLevel = -0.3; // Slightly embedded in ground
        const jitterX = (Math.random() - 0.5) * 0.2; // Small horizontal jitter
        const jitterRotation = (Math.random() - 0.5) * 0.2; // Small rotation variance

        // Randomly assign the enemy to a lane
        const enemyLane = Math.floor(Math.random() * 3) + 1;
        const xPosition = this.lanePositions[enemyLane] + jitterX;
        const zPosition = -20;

        this.mesh.position.set(xPosition, groundLevel, zPosition);
        this.mesh.rotation.y += jitterRotation;

        // Create a more precise bounding box
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.shrinkBoundingBox(0.6); // Slightly different shrink factor

        scene.add(this.mesh);
      },
      undefined,
      (error) => {
        console.error("Model loading error:", error);
        this.createFallbackObstacle();
      }
    );
  }

  createFallbackObstacle() {
    const fallbackGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1, 6);
    const fallbackMaterial = new THREE.MeshStandardMaterial({
      color: 0x5C4033, // Earthy brown
      roughness: 0.7,
      metalness: 0.1,
      shadowSide: THREE.FrontSide
    });

    this.mesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
    
    // Ground-level positioning with slight randomization
    const groundLevel = -0.1;
    const enemyLane = Math.floor(Math.random() * 3) + 1;
    const xPosition = this.lanePositions[enemyLane] + (Math.random() - 0.5) * 0.2;
    
    this.mesh.position.set(xPosition, groundLevel, -20);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    this.shrinkBoundingBox(0.6);

    this.scene.add(this.mesh);
  }

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

  moveForward(speedMultiplier = 1) {
    const moveDistance = 0.2 * speedMultiplier;
    if (this.mesh) {
      this.mesh.position.z += moveDistance;
      this.boundingBox.setFromObject(this.mesh);
      this.shrinkBoundingBox(0.6);
    }
  }

  checkCollision(player) {
    return this.boundingBox && player.boundingBox 
      ? this.boundingBox.intersectsBox(player.boundingBox)
      : false;
  }

  isOutOfView() {
    return this.mesh && this.mesh.position.z > 5;
  }

  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
          child.geometry.dispose();
        }
      });
    }
  }
}