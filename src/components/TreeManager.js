import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class TreeManager {
  constructor(scene, speedMultiplierRef) {
    this.scene = scene;
    this.speedMultiplierRef = speedMultiplierRef; // Reference to control movement speed
    this.trees = [];
    this.loader = new GLTFLoader();

    // Tree models list
    this.treeModels = [
      "/assets/models/tree.glb",
      "/assets/models/tree2.glb",
    ];
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

    // Randomly select a tree model
    const chosenTreeModel =
      this.treeModels[Math.floor(Math.random() * this.treeModels.length)];

    this.loader.load(
      chosenTreeModel,
      (gltf) => {
        const tree = gltf.scene;

        // Adjust scale if necessary
        tree.scale.set(1.5, 1.5, 1.5);

        // Set initial position
        tree.position.set(treeX, -3, -30);

        // Enable shadows
        tree.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Add to scene
        this.scene.add(tree);
        this.trees.push(tree);
      },
      undefined,
      (error) => {
        console.error("Error loading tree model:", error);
      }
    );
  }

  updateTrees() {
    this.trees.forEach((tree, index) => {
      const speed = this.speedMultiplierRef.current * 0.3;
      tree.position.z += speed;

      if (tree.position.z > 5) {
        this.scene.remove(tree);
        this.trees.splice(index, 1);
      }
    });
  }
}
