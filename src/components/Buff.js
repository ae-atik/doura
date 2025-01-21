// Buff.js
import * as THREE from "three";
import { TextureLoader } from "three";


export default class Buff {
  constructor(scene, lanePositions, type) {
    this.scene = scene;
    this.lanePositions = lanePositions;
    this.type = type; // "magnet", "shield", "speed"
  
    const lane = Math.floor(Math.random() * 3) + 1;
  
    if (type === "speed") {
      // Load the flash.png texture
      const loader = new TextureLoader();
      const texture = loader.load("/assets/images/flash.png"); // Ensure the path is correct
  
      // Create a plane geometry and apply the texture
      const buffGeometry = new THREE.PlaneGeometry(0.8, 0.8);
      const buffMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      this.mesh = new THREE.Mesh(buffGeometry, buffMaterial);
  
      // Rotate the plane to lie flat on the ground
      // this.mesh.rotation.x = -Math.PI / 2;
    } else {
      // Existing cylinder geometry for other buffs
      const colors = {
        magnet: "red",
        shield: "blue",
      };
  
      const buffGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32);
      const buffMaterial = new THREE.MeshStandardMaterial({ color: colors[type] });
      this.mesh = new THREE.Mesh(buffGeometry, buffMaterial);
  
      // Rotate the cylinder to lie flat on the ground
      this.mesh.rotation.x = Math.PI / 2;
    }
  
    this.mesh.castShadow = true;
    this.mesh.position.set(lanePositions[lane], 0.5, -10);
  
    scene.add(this.mesh);
  }
  

  moveForward(speedMultiplier = 1) {
    this.mesh.position.z += 0.1 * speedMultiplier; // Adjust speed with multiplier
    // this.mesh.rotation.y += 0.1;
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
