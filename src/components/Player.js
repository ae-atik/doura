import * as THREE from "three";

export class Player {
  constructor(scene, lanePositions) {
    this.lane = 2;
    this.lanePositions = lanePositions;
    this.velocityY = 0;
    this.gravity = -0.002;
    this.jumpStrength = 0.08;
    this.onGround = true;

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#00ff00" });
    this.mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.mesh.castShadow = true;
    this.mesh.position.set(0, 0, 2);

    this.boundingBox = new THREE.Box3().setFromObject(this.mesh); // Add bounding box

    scene.add(this.mesh);
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
    }
  }

  update() {
    this.velocityY += this.gravity;
    this.mesh.position.y += this.velocityY;

    if (this.mesh.position.y <= 0) {
      this.mesh.position.y = 0;
      this.velocityY = 0;
      this.onGround = true;
    }

    this.mesh.position.x = this.lanePositions[this.lane];
    this.boundingBox.setFromObject(this.mesh); // Update bounding box every frame
  }
}
