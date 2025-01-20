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

    scene.add(this.mesh);
  }

  moveForward() {
    this.mesh.position.z += 0.1;
    this.boundingBox.setFromObject(this.mesh); // Update bounding box
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
}
