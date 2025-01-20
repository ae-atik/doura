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
            Math.abs(obj.mesh.position.z - (-10)) < 5
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

  moveForward() {
    this.mesh.position.z += 0.1; // Slightly increased speed
    this.mesh.rotation.y += 0.1;
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
  }
}
