// Buff.js

import * as THREE from "three";
import { TextureLoader } from "three";

export default class Buff {
  constructor(scene, lanePositions, type, existingObjects, lane = null, index = 0) {
    this.scene = scene;
    this.lanePositions = lanePositions;
    this.type = type; // "magnet", "shield", "speed"

    // If lane is not specified, choose a safe lane to prevent overlapping
    if (lane === null) {
      let safePositionFound = false;
      let attempts = 0;

      while (!safePositionFound && attempts < 10) {
        lane = Math.floor(Math.random() * 3) + 1; // Choose lane 1, 2, or 3
        let conflict = existingObjects.some(
          (obj) =>
            obj.mesh.position.x === lanePositions[lane] &&
            Math.abs(obj.mesh.position.z - (-10 - index * 1.2)) < 1.5 // Adjusted distance
        );

        if (!conflict) safePositionFound = true;
        attempts++;
      }

      // If no safe lane is found after 10 attempts, choose a random lane
      if (!safePositionFound) lane = Math.floor(Math.random() * 3) + 1;
    }

    // Mapping of buff types to their corresponding image paths
    const buffTextures = {
      speed: "/assets/images/flash.png",
      magnet: "/assets/images/magnet.png",
      shield: "/assets/images/shield.png",
    };

    // Load the appropriate texture based on the buff type
    const loader = new TextureLoader();
    const texturePath = buffTextures[this.type];

    if (!texturePath) {
      console.warn(`Unknown buff type: ${this.type}. Defaulting to speed buff texture.`);
    }

    // Fallback to speed texture if type is unknown
    const texture = loader.load(
      texturePath || buffTextures["speed"],
      () => {
        console.log(`${this.type} buff texture loaded successfully.`);
      },
      undefined,
      (error) => {
        console.error(`An error occurred while loading ${this.type} buff texture:`, error);
      }
    );

    // Create a sprite material and sprite without rotation
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    this.mesh = new THREE.Sprite(spriteMaterial);

    this.mesh.scale.set(1, 1, 1); // Adjust size as needed
    this.mesh.position.set(lanePositions[lane], 0.5, -10 - index * 1.2);

    this.scene.add(this.mesh);
  }

  moveForward(speedMultiplier = 1) {
    this.mesh.position.z += 0.12 * speedMultiplier;
    // Removed rotation effect
  }

  isOutOfView() {
    return this.mesh.position.z > 5;
  }

  checkCollision(player) {
    return (
      Math.abs(this.mesh.position.x - player.mesh.position.x) < 0.6 &&
      Math.abs(this.mesh.position.z - player.mesh.position.z) < 0.6 &&
      Math.abs(this.mesh.position.y - player.mesh.position.y) < 1
    );
  }

  remove() {
    this.scene.remove(this.mesh);
    this.mesh.material.map.dispose();
    this.mesh.material.dispose();
  }
}
