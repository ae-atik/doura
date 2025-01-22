// Enemy.js
import * as THREE from "three";

export class Enemy {
  constructor(scene, lanePositions) {
    this.scene = scene;
    this.lanePositions = lanePositions;

    const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: "red" });
    this.mesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
    this.mesh.castShadow = true;

    const enemyLane = Math.floor(Math.random() * 3) + 1;
    this.mesh.position.set(this.lanePositions[enemyLane], 0, -20);

    this.boundingBox = new THREE.Box3().setFromObject(this.mesh); // Add bounding box
    this.shrinkBoundingBox(0.1);

    scene.add(this.mesh);
  }

  moveForward(speedMultiplier = 1) {
    this.mesh.position.z += 0.12 * speedMultiplier; // Adjust speed with multiplier
    this.boundingBox.setFromObject(this.mesh);
    this.shrinkBoundingBox(0.1);
  }
  

  checkCollision(player) {
    return this.boundingBox.intersectsBox(player.boundingBox); // More accurate collision detection
  }

  isOutOfView() {
    return this.mesh.position.z > 5;
  }

  remove() {
    this.scene.remove(this.mesh);
  }

  // Function to shrink bounding box
  shrinkBoundingBox(scaleFactor = 0.1) {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    this.boundingBox.getSize(size);
    this.boundingBox.getCenter(center);

    size.multiplyScalar(scaleFactor);

    this.boundingBox.setFromCenterAndSize(center, size);
  }
}
