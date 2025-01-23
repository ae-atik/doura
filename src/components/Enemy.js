// Enemy.js
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // Import GLTFLoader

export class Enemy {
  constructor(scene, lanePositions, clock) {
    this.scene = scene;
    this.lanePositions = lanePositions;
    this.clock = clock; // THREE.Clock instance to track elapsed time

    // List of possible enemy model paths (ensure these paths are correct and models have transparency if needed)
    const enemyModels = [
      "/assets/models/obs1.glb",
      "/assets/models/obs2.glb",
      "/assets/models/obs3.glb",
    ];

    // Randomly select a model path
    const chosenModelPath =
      enemyModels[Math.floor(Math.random() * enemyModels.length)];
    if (!chosenModelPath) {
      console.warn("No valid model found. Defaulting to the first model.");
    }

    const loader = new GLTFLoader();
    loader.load(
      chosenModelPath || enemyModels[0],
      (gltf) => {
        // Assuming the model has a single scene
        this.mesh = gltf.scene;

        // ** Scaling the obstacle **
        // Adjust the scale as needed to fit your game environment
        this.mesh.scale.set(0.6, 0.6, 0.6); // Uniform scaling to 0.6

        // ** Rotating the obstacle **
        // Adjust rotation to align the model correctly in the scene
        this.mesh.rotation.y = Math.PI * 0.5; // Fixed Y rotation for consistency
        this.mesh.position.y = -2;

        // Enable shadows for all child meshes
        this.mesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false; // Disable receiving shadows to allow shadows on the road
            if(child.material){
              child.material.shadowSide = THREE.DoubleSide;
              child.material = new THREE.MeshStandardMaterial({
                ...child.material,
                shadowMapSide: THREE.DoubleSide,
                aoMapIntensity: 1.0
              })
            }
          }
        });

        // Randomly assign the enemy to a lane
        const enemyLane = Math.floor(Math.random() * 3) + 1;
        const xPosition = this.lanePositions[enemyLane];
        const zPosition = -20;
        this.mesh.position.set(xPosition, 0, zPosition); // y=0 above ground

        // Create a bounding box for collision detection
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.shrinkBoundingBox(0.5); // Shrink the bounding box by 50%

        // Add the enemy to the scene
        scene.add(this.mesh);
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the model:", error);
        // Optional: Create a fallback mesh if model fails to load
        const fallbackGeometry = new THREE.BoxGeometry(1, 1, 1);
        const fallbackMaterial = new THREE.MeshStandardMaterial({
          color: "grey",
          roughness: 0.5,
          metalness: 0,
          emissive: new THREE.Color(0x222222),
          emissiveIntensity: 0.2,
          transparent: true,
          depthWrite: false,
        });
        this.mesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        this.mesh.scale.set(0.6, 0.6, 0.6); // Ensure fallback matches obstacle scale
        this.mesh.position.set(0, 0, -20);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = false; // Disable receiving shadows

        // Randomly assign the enemy to a lane
        const enemyLaneFallback = Math.floor(Math.random() * 3) + 1;
        const xPositionFallback = this.lanePositions[enemyLaneFallback];
        this.mesh.position.set(xPositionFallback, 0, -20); // y=0 above ground

        // Create a bounding box for collision detection
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.shrinkBoundingBox(0.5); // Shrink the bounding box by 50%

        // Add the fallback enemy to the scene
        scene.add(this.mesh);
      }
    );

    // Initialize shader uniforms if needed
    this.uniforms = {
      uTime: { value: 0.0 },
    };
  }

  // Method to shrink the bounding box by a given scale factor
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
      // Move the enemy mesh forward
      this.mesh.position.z += moveDistance;

      // Update the bounding box to the new position
      this.boundingBox.setFromObject(this.mesh);
      this.shrinkBoundingBox(0.5); // Maintain the shrunk bounding box
    }
  }

  checkCollision(player) {
    if (this.boundingBox && player.boundingBox) {
      return this.boundingBox.intersectsBox(player.boundingBox);
    }
    return false;
  }

  isOutOfView() {
    return this.mesh && this.mesh.position.z > 5;
  }

  remove() {
    if (this.mesh) {
      // Remove the enemy from the scene
      this.scene.remove(this.mesh);

      // Dispose of the model's materials and geometries to free up memory
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
          child.geometry.dispose();
        }
      });
    }
  }

  // Update shader uniforms (should be called in the animation loop)
  updateShader() {
    // No shader to update since it's removed
  }
}
