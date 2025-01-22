// Coin.js
import * as THREE from "three";

export class Coin {
  constructor(scene, lanePositions, existingObjects, lane = null, index = 0) {
    this.scene = scene;
    this.lanePositions = lanePositions;

    // If lane is not specified, choose a safe lane
    if (lane === null) {
      let safePositionFound = false;
      let attempts = 0;

      while (!safePositionFound && attempts < 10) {
        lane = Math.floor(Math.random() * 3) + 1;
        let conflict = existingObjects.some(
          (obj) =>
            obj.mesh.position.x === lanePositions[lane] &&
            Math.abs(obj.mesh.position.z - -10) < 5
        );

        if (!conflict) safePositionFound = true;
        attempts++;
      }

      if (!safePositionFound) lane = Math.floor(Math.random() * 3) + 1;
    }

    // Create Coin (Rotating Cylinder)
    const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    const coinMaterial = new THREE.MeshStandardMaterial({ color: "gold" });
    this.mesh = new THREE.Mesh(coinGeometry, coinMaterial);
    this.mesh.castShadow = true;

    // Position all 5 coins in a tight group
    this.mesh.position.set(lanePositions[lane], 0.5, -10 - index * 1.2);
    this.mesh.rotation.x = Math.PI / 2;

    scene.add(this.mesh);
  }

  moveForward(speedMultiplier = 1, hasMagnet, player) {
    // Standard forward movement
    this.mesh.position.z += 0.12 * speedMultiplier;

    // Magnet logic: Pull coin toward player if magnet is active
    if (hasMagnet && player && player.mesh) {
      console.log(`magnet on`);
      const dx = player.mesh.position.x - this.mesh.position.x;
      const dz = player.mesh.position.z - this.mesh.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance === 0) return false; // Prevent division by zero

      // Calculate normalized direction vector
      const directionX = dx / distance;
      const directionZ = dz / distance;

      // Increase for a stronger pull
      const attractionSpeed = 0.1;

      // Move coin closer to player
      if(distance<4) {
        this.mesh.position.x += directionX * attractionSpeed;
        this.mesh.position.z += directionZ * attractionSpeed;
      }

      // Check if the coin is close enough to be collected
      if (distance < 1) {
        return true; // Signal that the coin should be collected
      }
    }

    // Rotate coin visually
    this.mesh.rotation.y += 0.1;
    return false; // Coin is not yet collected
  }

  isOutOfView() {
    return this.mesh.position.z > 5;
  }

  checkCollision(player) {
    if (!player || !player.mesh) return false; // Ensure player.mesh exists
    return (
      Math.abs(this.mesh.position.x - player.mesh.position.x) < 0.6 &&
      Math.abs(this.mesh.position.z - player.mesh.position.z) < 0.6 &&
      Math.abs(this.mesh.position.y - player.mesh.position.y) < 1
    );
  }

  remove() {
    this.scene.remove(this.mesh);
  }
}
