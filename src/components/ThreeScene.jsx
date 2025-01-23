import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import RoadManager from "./RoadManager";
import SpawnManager from "./SpawnManager";
import BuffManager from "./BuffManager";
import { Player } from "./Player";
import { GameManager } from "./GameManager";
import EnvironmentManager from "./EnvironmentManager"; // Import EnvironmentManager
import TreeManager from "./TreeManager";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [coinCount, setCoinCount] = useState(0);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [hasShield, setHasShield] = useState(false);

  const hasShieldRef = useRef(false);
  const hasMagnetRef = useRef(false);
  const speedMultiplier = useRef(1);

  const lanePositions = { 1: -1.5, 2: 0, 3: 1.5 };
  const enemiesRef = useRef([]);
  const coinsRef = useRef([]);
  const buffsRef = useRef([]);
  const treesRef = useRef([]);
  let player, gameManager, treeManager;
  let animationFrameId;

  useEffect(() => {
    hasMagnetRef.current = hasMagnet;
  }, [hasMagnet]);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Initialize Environment
    const environmentManager = new EnvironmentManager(scene, speedMultiplier);
    // environmentManager.updateGround()

    // Initialize Managers
    const roadManager = new RoadManager(scene);
    roadManager.addLeftSide();

    treeManager = new TreeManager(scene, speedMultiplier, treesRef); // Initialize TreeManager

    const setSpeedMultiplierFunc = (value) => {
      speedMultiplier.current = value;
    };

    const preventDefaultTouchActions = (event) => {
      event.preventDefault();
    };

    document.addEventListener("touchmove", preventDefaultTouchActions, { passive: false });
    document.addEventListener("gesturestart", preventDefaultTouchActions, { passive: false });
    document.addEventListener("gesturechange", preventDefaultTouchActions, { passive: false });
    document.addEventListener("gestureend", preventDefaultTouchActions, { passive: false });



    const buffManager = new BuffManager(
      setHasMagnet,
      (value) => {
        setHasShield(value);
        hasShieldRef.current = value;
      },
      setSpeedMultiplierFunc
    );

    const spawnManager = new SpawnManager(
      scene,
      lanePositions,
      enemiesRef,
      coinsRef,
      buffsRef
    );

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 2, -1);
    scene.add(light, new THREE.AmbientLight(0xffffff, 2));

    player = new Player(scene, lanePositions);
    gameManager = new GameManager(player, enemiesRef, setIsGameOver);

    const objectSpawnInterval = setInterval(() => {
      spawnManager.spawnObjects(isGameOver);
      
    }, 2000);

    const treeSpawnInterval = setInterval(() => {
      if (Math.random() < 1) treeManager.spawnTree(); // Spawn trees randomly
    }, 400); // Reduce interval time for more frequent tree spawning
    

    

    const animate = () => {
      if (isGameOver) return;
      animationFrameId = requestAnimationFrame(animate);

      player.update();
      environmentManager.updateGround()
      treeManager.updateTrees(); // Update tree positions
      roadManager.moveForward();

      const currentSpeed = speedMultiplier.current;

      enemiesRef.current.forEach((enemy, index) => {
        enemy.moveForward(currentSpeed);
        if (!hasShieldRef.current && enemy.checkCollision(player)) {
          setIsGameOver(true);
          return;
        }
        if (enemy.isOutOfView()) {
          enemy.remove();
          enemiesRef.current.splice(index, 1);
        }
      });

      coinsRef.current.forEach((coin, index) => {
        const shouldCollect = coin.moveForward(currentSpeed, hasMagnetRef.current, player);
        if (shouldCollect || coin.checkCollision(player)) {
          setCoinCount((prev) => prev + 1);
          coin.remove();
          coinsRef.current.splice(index, 1);
        }
        if (coin.isOutOfView()) {
          coin.remove();
          coinsRef.current.splice(index, 1);
        }
      });

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

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      gameManager.cleanup();
      clearInterval(objectSpawnInterval);
      clearInterval(treeSpawnInterval);
      mountRef.current.removeChild(renderer.domElement);

      document.removeEventListener("touchmove", preventDefaultTouchActions);
      document.removeEventListener("gesturestart", preventDefaultTouchActions);
      document.removeEventListener("gesturechange", preventDefaultTouchActions);
      document.removeEventListener("gestureend", preventDefaultTouchActions);
    };
  }, [isGameOver]);

  return (
    <div>
      <div ref={mountRef} />

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
