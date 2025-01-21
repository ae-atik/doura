// ThreeScene.jsx

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import RoadManager from "./RoadManager";
import SpawnManager from "./SpawnManager";
import BuffManager from "./BuffManager";
import { Player } from "./Player";
import { GameManager } from "./GameManager";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [coinCount, setCoinCount] = useState(0);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  // Add shield ref
  const hasShieldRef = useRef(false);
  
  // Replace speedMultiplier state with a ref
  const speedMultiplier = useRef(1);

  const lanePositions = { 1: -1.5, 2: 0, 3: 1.5 };
  const enemiesRef = useRef([]);
  const coinsRef = useRef([]);
  const buffsRef = useRef([]);
  let player, gameManager;
  let animationFrameId;

  useEffect(() => {
    // Initialize Scene and Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 3, 0);

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Initialize Managers
    const roadManager = new RoadManager(scene);
    roadManager.addLeftSide();

    // Function to update speedMultiplier ref
    const setSpeedMultiplierFunc = (value) => {
      speedMultiplier.current = value;
    };

    // Initialize BuffManager with the speedMultiplier setter
    const buffManager = new BuffManager(
      setHasMagnet,
      (value) => {
        setHasShield(value);
        hasShieldRef.current = value; // Update ref
      },
      setSpeedMultiplierFunc
    );

    // Initialize SpawnManager
    const spawnManager = new SpawnManager(
      scene,
      lanePositions,
      enemiesRef,
      coinsRef,
      buffsRef
    );

    // Add Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 2, -1);
    scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

    // Initialize Player and GameManager
    player = new Player(scene, lanePositions);
    gameManager = new GameManager(player, enemiesRef, setIsGameOver);

    // Spawn Objects at Intervals
    const objectSpawnInterval = setInterval(
      () => spawnManager.spawnObjects(isGameOver),
      2000
    );

    // Animation Loop
    const animate = () => {
      if (isGameOver) return;
      animationFrameId = requestAnimationFrame(animate);
    
      player.update();
    
      const currentSpeed = speedMultiplier.current;
    
      enemiesRef.current.forEach((enemy, index) => {
        enemy.moveForward(currentSpeed);
        // Use ref for shield
        if (!hasShieldRef.current && enemy.checkCollision(player)) {
          setIsGameOver(true);
          return;
        }
        if (enemy.isOutOfView()) {
          enemy.remove();
          enemiesRef.current.splice(index, 1);
        }
      });

      // Update Coins
      coinsRef.current.forEach((coin, index) => {
        coin.moveForward(currentSpeed);
        if (
          coin.checkCollision(player) ||
          (hasMagnet && coin.mesh.position.z > player.mesh.position.z - 1)
        ) {
          setCoinCount((prev) => prev + 1);
          coin.remove();
          coinsRef.current.splice(index, 1);
        }
        if (coin.isOutOfView()) {
          coin.remove();
          coinsRef.current.splice(index, 1);
        }
      });

      // Update Buffs
      buffsRef.current.forEach((buff, index) => {
        buff.moveForward(currentSpeed);
        if (buff.checkCollision(player)) {
          buffManager.activateBuff(buff.type);
          buff.remove();
          buffsRef.current.splice(index, 1);
        }
        if (buff.isOutOfView()) {
          buff.remove();
          buffsRef.current.splice(index, 1);
        }
      });

      // Render the Scene
      renderer.render(scene, camera);
    };

    // Start Animation
    animate();

    // Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      gameManager.cleanup();
      clearInterval(objectSpawnInterval);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [isGameOver]); // Removed hasShield from dependencies

  return (
    <div>
      <div ref={mountRef} />

      {/* Coin Counter */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "8px",
          borderRadius: "5px",
          fontSize: "16px",
        }}
      >
        Coins: {coinCount}
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "red" }}>Game Over!</h2>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              marginTop: "20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default ThreeScene;
