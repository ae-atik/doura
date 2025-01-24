import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class TreeManager {
  constructor(scene, speedMultiplierRef, treesRef, preloadedTrees) {
    this.scene = scene;
    this.speedMultiplierRef = speedMultiplierRef;
    this.treesRef = treesRef; // Reference to trees array
    this.loader = new GLTFLoader();
    this.preloadedTrees = [];
    this.isPreloaded = false; // Flag to track preloading completion

    // Tree models list
    this.treeModels = [
      "/assets/models/tree1.glb",
      "/assets/models/tree2.glb",
      "/assets/models/tree3.glb",
      "/assets/models/bush.glb",
    ];

    // Preload trees before the game starts
    this.preloadTrees();
  }

  preloadTrees() {
    let loadedCount = 0;

    this.treeModels.forEach((treeModel, index) => {
      this.loader.load(
        treeModel,
        (gltf) => {
          const tree = gltf.scene;
          tree.scale.set(1, 1, 1);

          // Enable shadows
          tree.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.preloadedTrees[index] = tree;
          loadedCount++;

          // Ensure all trees are loaded before proceeding
          if (loadedCount === this.treeModels.length) {
            this.isPreloaded = true;
            console.log("All tree models preloaded.");
            this.initialTreePlacement(); // ✅ Spawn trees **before** the game starts
          }
        },
        undefined,
        (error) => {
          console.error("Error preloading tree model:", error);
        }
      );
    });
  }

  initialTreePlacement() {
    if (!this.isPreloaded || this.preloadedTrees.length === 0) return;

    // Create an **initial batch** of trees so the player never sees empty space
    const treeBatch = 5; // Spawn a large batch of trees initially
    for (let i = 0; i < treeBatch; i++) {
      const zOffset = 2 - i * 10; // ✅ Places trees **way back** to create depth

      this.createTreePair(zOffset);
    }
  }

  spawnTree() {
    // Ensure trees are preloaded before spawning
    if (!this.isPreloaded || this.preloadedTrees.length === 0) {
      console.warn("Trees not preloaded yet. Skipping spawn.");
      return;
    }

    // ✅ Adjust Z-position so trees spawn way further back to avoid pop-in
    const zOffset = -40; // Spawn far back so it feels like trees existed before
    this.createTreePair(zOffset);
  }

  createTreePair(zOffset) {
    const leftMin = -7,
      leftMax = -5; // Randomized left range
    const rightMin = 5,
      rightMax = 7; // Randomized right range

    // Select a random preloaded tree model for each side
    const leftTreeIndex = Math.floor(Math.random() * this.preloadedTrees.length);
    const rightTreeIndex = Math.floor(Math.random() * this.preloadedTrees.length);

    if (!this.preloadedTrees[leftTreeIndex] || !this.preloadedTrees[rightTreeIndex]) {
      console.warn("Skipping tree spawn due to undefined preloaded tree.");
      return;
    }

    const leftTree = this.preloadedTrees[leftTreeIndex].clone();
    const rightTree = this.preloadedTrees[rightTreeIndex].clone();

    // Assign positions with **deep Z-depth** to create depth effect
    leftTree.position.set(
      Math.random() * (leftMax - leftMin) + leftMin,
      -3,
      zOffset + Math.random() * 5
    );
    rightTree.position.set(
      Math.random() * (rightMax - rightMin) + rightMin,
      -3,
      zOffset + Math.random() * 5
    );

    // Add trees to the scene
    this.scene.add(leftTree, rightTree);

    // Correctly update treesRef.current (since it's a ref)
    this.treesRef.current.push(leftTree, rightTree);
  }

  updateTrees() {
    this.treesRef.current.forEach((tree, index) => {
      const speed = this.speedMultiplierRef.current * 0.3;
      tree.position.z += speed;

      if (tree.position.z > 5) {
        this.scene.remove(tree);
        this.treesRef.current.splice(index, 1);
      }
    });
  }
}
