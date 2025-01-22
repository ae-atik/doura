import * as THREE from "three";

export default class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.addSky();
    this.addGround();
  }

  addSky() {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb, // Sky blue color
      side: THREE.BackSide, // Invert the normals to be seen from the inside
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);
  }

  addGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22, // Grass green color
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI /2.02;
    ground.position.y = -5;
    this.scene.add(ground);
  }
}
