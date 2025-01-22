import * as THREE from "three";

export default class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.addSky();
    this.addGround();
  }

  addSky() {
    const skyGeometry = new THREE.SphereGeometry(500, 64, 64);
    const skyTexture = new THREE.TextureLoader().load(
      "/assets/textures/cloudy.jpg"
    ); // Use your seamless texture

    // Enable repeating and adjust scaling
    skyTexture.wrapS = THREE.RepeatWrapping;
    skyTexture.wrapT = THREE.RepeatWrapping;
    skyTexture.repeat.set(4, 4); // Adjust these values to control scaling

    const skyMaterial = new THREE.MeshStandardMaterial({
      map: skyTexture,
      side: THREE.BackSide,
    });

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.rotation.y = 5.3;
    sky.rotation.x = Math.PI / 4.7;
    this.scene.add(sky);
  }

  addGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const grassTexture = new THREE.TextureLoader().load(
      "/assets/textures/grass.jpg"
    );
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10); // Adjust for desired tiling effect

    const groundMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2.02;
    ground.position.y = -5;
    this.scene.add(ground);
  }
}
