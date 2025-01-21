// RoadManager.js
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export default class RoadManager {
  constructor(scene) {
    this.scene = scene;
    this.loader = new FBXLoader();
    this.boxSize = { x: 0, y: 0, z: 0 };

    this.loadRoad();
  }

  addLeftSide() {
    this.loader.load("src/assets/models/Road_02.fbx", (obj) => {
        this.scene.add(obj);
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        this.boxSize = { x: size.x, y: size.y, z: size.z };
  
        obj.position.y -= 2 + this.boxSize.y;
  
        for (let i = 0; i <= 5; i++) {
          const roadClone = obj.clone();
          roadClone.rotation.y = Math.PI
          roadClone.position.y = -2.8 + 2 * this.boxSize.y;
          roadClone.position.z = -i * this.boxSize.z;
          this.scene.add(roadClone);
        }
      });
  }
  
  

  loadRoad() {
    this.loader.load("src/assets/models/Road_02.fbx", (obj) => {
      this.scene.add(obj);
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      this.boxSize = { x: size.x, y: size.y, z: size.z };

      obj.position.y -= 2 + this.boxSize.y;

      for (let i = 1; i <= 5; i++) {
        const roadClone = obj.clone();
        roadClone.position.y = -2.8 + 2 * this.boxSize.y;
        roadClone.position.z = -i * this.boxSize.z;
        this.scene.add(roadClone);
      }
    });
  }
}
