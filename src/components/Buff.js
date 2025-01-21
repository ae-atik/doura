import * as THREE from "three";

export default class Buff {
  constructor(scene, lanePositions, type) {
    this.scene = scene;
    this.lanePositions = lanePositions;
    this.type = type; // "magnet", "shield", "speed"

    const colors = {
      magnet: "red",
      shield: "blue",
      speed: "green",
    };

    const lane = Math.floor(Math.random() * 3) + 1;

    const buffGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32);
    const buffMaterial = new THREE.MeshStandardMaterial({ color: colors[type] });
    this.mesh = new THREE.Mesh(buffGeometry, buffMaterial);
    this.mesh.castShadow = true;

    this.mesh.position.set(lanePositions[lane], 0.5, -10);
    this.mesh.rotation.x = Math.PI / 2;

    scene.add(this.mesh);
  }

  moveForward() {
    this.mesh.position.z += 0.12;
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
