import React, { useState } from "react";
import ThreeScene from "./components/ThreeScene";
import StartScreen from "./components/StartScreen";
import LoadingScreen from "./components/LoadingScreen";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // ✅ Added GLTFLoader for trees
import * as THREE from "three";
import MusicManager from "./components/MusicManager";

const App = () => {
  const [gameState, setGameState] = useState("start");
  const [progress, setProgress] = useState(0);
  const treeModels = []; // Store preloaded tree models
  const musicManager = new MusicManager();

  const preloadAssets = async () => {
    const manager = new THREE.LoadingManager();

    return new Promise((resolve) => {
      manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const percentage = (itemsLoaded / itemsTotal) * 100;
        setProgress(isNaN(percentage) ? 0 : percentage);
      };

      manager.onLoad = () => {
        console.log("All assets loaded.");
        resolve();
      };

      // ✅ Load textures
      const textureLoader = new THREE.TextureLoader(manager);
      const textures = [
        "/assets/textures/tree.jpg",
        "/assets/textures/grass.jpg",
        "/assets/textures/cloudy.jpg"
      ].map(src => new Promise(resolve => textureLoader.load(src, resolve)));


      // ✅ Load tree models (GLTF)
      const gltfLoader = new GLTFLoader(manager);
      gltfLoader.setPath("/assets/models/");
      const loadGLB = (file) => new Promise((resolve, reject) => {
        gltfLoader.load(file, (gltf) => {
          console.log(`${file} loaded.`);
          treeModels.push(gltf.scene); // Store preloaded trees
          resolve(gltf.scene);
        }, undefined, reject);
      });

      const glbModels = [
        loadGLB("tree1.glb"),
        loadGLB("tree2.glb"),
        loadGLB('dying.glb'),
      ];

      // ✅ Wait for all assets (textures, FBX models, and trees) to load
      Promise.all([...textures, ...glbModels]).then(() => {
        console.log("All assets fully loaded, including trees.");
        resolve();
      });
    });
  };

  const handleStart = async () => {
    setGameState("loading");
    await preloadAssets(); // ✅ Ensures trees are loaded with the progress bar
    setTimeout(() => {
      setGameState("game")
      musicManager.playBackgroundMusic();
    }, 500);

  };

  const handleRestart = () => {
    setGameState("loading"); 
    
    setTimeout(() => {
      setGameState("game");
      musicManager.playBackgroundMusic();
    }, 500);
  };
  

  if (gameState === "start") return <StartScreen onStart={handleStart} />;
  if (gameState === "loading") return <LoadingScreen progress={progress} />;

  return <ThreeScene preloadedTrees={treeModels} musicManager={musicManager} onRestart={handleRestart} />;

};

export default App;
