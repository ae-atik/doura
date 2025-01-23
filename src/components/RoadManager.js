// RoadManager.js
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export default class RoadManager {
  constructor(scene) {
    this.scene = scene;
    this.loader = new FBXLoader();
    this.boxSize = { x: 0, y: 0, z: 0 };
    this.ground = undefined;

    this.loadRoad();
  }

  addLeftSide() {
    this.loader.load("/assets/models/Road_02.fbx", (obj) => {
      // this.scene.add(obj);
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      // this.boxSize = { x: size.x, y: size.y, z: size.z };

      obj.position.y -= 2 + this.boxSize.y;

      for (let i = 0; i <= 5; i++) {
        const roadClone = obj.clone();
        roadClone.rotation.y = Math.PI;
        roadClone.position.y = -2.8 + 2 * this.boxSize.y;
        roadClone.position.z = -i * this.boxSize.z;
        // this.scene.add(roadClone);
      }
    });
  }

  loadRoad() {
    let loader = new THREE.TextureLoader();
    let texture = loader.load("assets/textures/road_tex.webp");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 10);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
    });

    this.ground = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 50), material);
    this.ground.position.y = -2;
    this.ground.receiveShadow = true;
    // this.scene.add(this.ground);

    this.ground.position.y += 1;

    this.loader.load("/assets/models/Road_02.fbx", (obj) => {
      // this.scene.add(obj);
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      this.boxSize = { x: size.x, y: size.y, z: size.z };

      obj.position.y -= 2 + this.boxSize.y;

      for (let i = 1; i <= 5; i++) {
        const roadClone = obj.clone();
        roadClone.position.y = -2.8 + 2 * this.boxSize.y;
        roadClone.position.z = -i * this.boxSize.z;
        // this.scene.add(roadClone);
      }
    });
  }

  moveForward(speedMultiplier = 1) {
    this.ground.position.z += 0.2 * speedMultiplier;
    // Removed rotation effect
  }
  isOutOfView() {
    return this.ground.position.z > 5;
  }
}
