import React, { useState, useEffect } from "react";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import ThreeScene from "./components/ThreeScene";
import StartScreen from "./components/StartScreen";
import LoadingScreen from "./components/LoadingScreen";
import * as THREE from "three";

const App = () => {
  const [gameState, setGameState] = useState("start");
  const [progress, setProgress] = useState(0);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  const preloadAssets = () => {
    const manager = new THREE.LoadingManager();
  
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const percentage = (itemsLoaded / itemsTotal) * 100;
      setProgress(isNaN(percentage) ? 0 : percentage);
    };
  
    manager.onLoad = () => {
      setTimeout(() => setIsFullyLoaded(true), 500);
    };
  
    // Load textures with the manager
    const textureLoader = new THREE.TextureLoader(manager);
    textureLoader.load("/assets/textures/tree.jpg");
    textureLoader.load("/assets/textures/grass.jpg");
    textureLoader.load("/assets/textures/cloudy.jpg");
  
    // ✅ Correct FBXLoader usage (set manager separately)
    const fbxLoader = new FBXLoader();
    fbxLoader.setPath("/assets/models/"); // Set model directory
    fbxLoader.load("Road_02.fbx", (object) => {
      console.log("FBX Model Loaded:", object);
    }, undefined, (error) => {
      console.error("Error loading FBX:", error);
    });
  };

  useEffect(() => {
    if (gameState === "loading" && isFullyLoaded) {
      setTimeout(() => setGameState("game"), 500); // Small buffer to ensure smooth loading
    }
  }, [isFullyLoaded, gameState]);

  const handleStart = () => {
    setGameState("loading");
    preloadAssets();
  };

  if (gameState === "start") return <StartScreen onStart={handleStart} />;
  if (gameState === "loading") return <LoadingScreen progress={progress} />;

  return <ThreeScene />;
};

export default App;
