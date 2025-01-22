import * as THREE from "three";

export default class TreeManager {
  constructor(scene, speedMultiplierRef) {
    this.scene = scene;
    this.speedMultiplierRef = speedMultiplierRef; // Reference to control movement speed
    this.trees = [];
  }

  spawnTree() {
    // Define safe tree spawn positions (outside player lanes)
    const leftMin = -7,
      leftMax = -5; // Randomized left range
    const rightMin = 5,
      rightMax = 7; // Randomized right range

    const treeX =
      Math.random() > 0.5
        ? Math.random() * (leftMax - leftMin) + leftMin // Random left position
        : Math.random() * (rightMax - rightMin) + rightMin; // Random right position

    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(
      0.2,
      0.2,
      Math.random() * 3 + 3,
      6
    );
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

    // Create leaves (random shape: sphere or cone)
    const textureLoader = new THREE.TextureLoader();
    const leafTexture = textureLoader.load("/assets/textures/grass.jpg"); // Ensure this path is correct
    

    const leafGeometry =
      Math.random() > 0.5
        ? new THREE.SphereGeometry(Math.random() * 1 + 1.5, 10, 10)
        : new THREE.ConeGeometry(
            Math.random() * 0.9 + 2,
            Math.random() * 2 + 4,
            10
          );

    const position = leafGeometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const offset = (Math.random()- 0.5) * 0.5; // Random displacement for jagged effect
      position.setXYZ(
        i,
        position.getX(i) + offset,
        position.getY(i) + offset,
        position.getZ(i) + offset
      );
    }
    position.needsUpdate = true; // Ensure changes take effect

    const leafMaterial = new THREE.MeshStandardMaterial({
      map: leafTexture, // Apply texture
      transparent: true,
    });

    const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
    // Set initial positions
    trunk.position.set(treeX, -2, -30);
    leaves.position.set(
      treeX,
      trunk.position.y + trunkGeometry.parameters.height / 2 + 1,
      -30
    );

    // Add to scene
    this.scene.add(trunk, leaves);

    this.trees.push({ trunk, leaves });
  }

  updateTrees() {
    this.trees.forEach((tree, index) => {
      const speed = this.speedMultiplierRef.current * 0.1;
      tree.trunk.position.z += speed;
      tree.leaves.position.z += speed;

      if (tree.trunk.position.z > 5) {
        this.scene.remove(tree.trunk, tree.leaves);
        this.trees.splice(index, 1);
      }
    });
  }
}
