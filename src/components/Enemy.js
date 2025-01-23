// Enemy.js
import * as THREE from "three";

export class Enemy {
  constructor(scene, lanePositions) {
    this.scene = scene;
    this.lanePositions = lanePositions;

    // List of possible enemy textures (ensure these paths are correct and images have transparency)
    const enemyTextures = [
      "/assets/textures/obs1.png",
      "/assets/textures/obs2.png",
      "/assets/textures/obs3.png",
    ];

    // Randomly select a texture path
    const chosenTexturePath =
      enemyTextures[Math.floor(Math.random() * enemyTextures.length)];
    if (!chosenTexturePath) {
      console.warn("No valid texture found. Defaulting to the first texture.");
    }

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      chosenTexturePath || enemyTextures[0],
      () => {
        console.log(
          `${chosenTexturePath || enemyTextures[0]} loaded successfully.`
        );
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the texture:", error);
        // Optional: Set a fallback color if texture fails to load
        if (this.mesh && this.mesh.material) {
          this.mesh.material.color.set("grey"); // Fallback color
        }
      }
    );

    // Configure texture properties for better appearance
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);

    // Create a plane geometry to display the texture
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      roughness: 0.5, // Controls the shininess (higher = less shiny) // Brightness control
      metalness: 0, // Non-metallic to reduce reflections // Contrast control
      emissive: new THREE.Color(0x222222), // Slight emissive to adjust brightness
      emissiveIntensity: 0.2, // Controls the strength of emissive color
      transparent: true, // Enable transparency to handle PNG alpha
      depthWrite: false, // Prevent z-fighting with ground
    });

    // Create the mesh with the plane geometry and material
    this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
    this.mesh.castShadow = true; // Enable casting shadows
    this.mesh.receiveShadow = true; // Enable receiving shadows

    // Randomly assign the enemy to a lane
    const enemyLane = Math.floor(Math.random() * 3) + 1;
    const xPosition = this.lanePositions[enemyLane];
    const zPosition = -20;
    this.mesh.position.set(xPosition, 0, zPosition); // y=0.5 above ground

    // Create a bounding box for collision detection
    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    this.shrinkBoundingBox(0.001); // Optional: Shrink the bounding box for tighter collisions

    // Add the enemy to the scene
    scene.add(this.mesh);
  }

  moveForward(speedMultiplier = 1) {
    const moveDistance = 0.2 * speedMultiplier;
    // Move the enemy mesh forward
    this.mesh.position.z += moveDistance;

    // Update the bounding box to the new position
    this.boundingBox.setFromObject(this.mesh);
    this.shrinkBoundingBox(0.001); // Maintain the shrunk bounding box
  }

  checkCollision(player) {
    return this.boundingBox.intersectsBox(player.boundingBox);
  }

  isOutOfView() {
    return this.mesh.position.z > 5;
  }

  remove() {
    // Remove the enemy from the scene
    this.scene.remove(this.mesh);

    // Dispose of the texture to free up memory
    if (this.mesh.material.map) {
      this.mesh.material.map.dispose();
    }
    // Dispose of the material itself
    this.mesh.material.dispose();
  }

  // Optional: Function to shrink the bounding box for tighter collision detection
  shrinkBoundingBox(scaleFactor = 0.1) {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    this.boundingBox.getSize(size);
    this.boundingBox.getCenter(center);

    size.multiplyScalar(scaleFactor);
    this.boundingBox.setFromCenterAndSize(center, size);
  }
}
