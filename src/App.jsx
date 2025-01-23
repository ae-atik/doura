import React, { useState } from "react";
import ThreeScene from "./components/ThreeScene";
import StartScreen from "./components/StartScreen";
import LoadingScreen from "./components/LoadingScreen";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";

const App = () => {
  const [gameState, setGameState] = useState("start");
  const [progress, setProgress] = useState(0);

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

      // Load textures
      const textureLoader = new THREE.TextureLoader(manager);
      const textures = [
        "/assets/textures/tree.jpg",
        "/assets/textures/grass.jpg",
        "/assets/textures/cloudy.jpg"
      ].map(src => new Promise(resolve => textureLoader.load(src, resolve)));

      // Load models
      const fbxLoader = new FBXLoader();
      fbxLoader.setPath("/assets/models/");
      const loadFBX = (file) => new Promise((resolve, reject) => {
        fbxLoader.load(file, (object) => {
          console.log(`${file} loaded.`);
          resolve(object);
        }, undefined, reject);
      });

      const models = [
        loadFBX("Road_02.fbx") // Add more models here if needed
      ];

      // Wait for all textures & models before resolving
      Promise.all([...textures, ...models]).then(() => {
        console.log("All assets fully loaded.");
        resolve();
      });
    });
  };

  const handleStart = async () => {
    setGameState("loading");
    await preloadAssets(); // ✅ Waits until everything is loaded before starting
    setTimeout(() => setGameState("game"), 500);
  };

  if (gameState === "start") return <StartScreen onStart={handleStart} />;
  if (gameState === "loading") return <LoadingScreen progress={progress} />;

  return <ThreeScene />;
};

export default App;
