import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Coin } from "./Coin";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { GameManager } from "./GameManager";
import { color } from "three/tsl";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [coinCount, setCoinCount] = useState(0);
  const lanePositions = { 1: -1.5, 2: 0, 3: 1.5 };
  const enemiesRef = useRef([]);
  const coinsRef = useRef([]);
  let player, gameManager;
  let animationFrameId;

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 7); // Slightly adjusted for better mobile view
    camera.lookAt(0, 1, -5); // Fixed focus on the road ahead

    // Prevents camera movement on mobile or resize
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Improves resolution on mobile
    mountRef.current.appendChild(renderer.domElement);

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.5, 50),
      new THREE.MeshStandardMaterial({ color: "#0369a1" })
    );
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 3, 1);
    scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

    player = new Player(scene, lanePositions);
    gameManager = new GameManager(player, enemiesRef, setIsGameOver);

    const spawnObjects = () => {
      if (!isGameOver) {
        const newEnemy = new Enemy(scene, lanePositions);
        enemiesRef.current.push(newEnemy);

        const coinLane = Math.floor(Math.random() * 3) + 1;
        let coins = [];

        for (let i = 0; i < 5; i++) {
          const coin = new Coin(
            scene,
            lanePositions,
            [...enemiesRef.current, ...coins],
            coinLane,
            i
          );
          coins.push(coin);
        }

        coinsRef.current.push(...coins);
      }
    };

    const objectSpawnInterval = setInterval(spawnObjects, 2000);

    const animate = () => {
      if (isGameOver) return;
      animationFrameId = requestAnimationFrame(animate);

      player.update();

      enemiesRef.current.forEach((enemy, index) => {
        enemy.moveForward();
        if (enemy.checkCollision(player)) {
          setIsGameOver(true);
          return;
        }
        if (enemy.isOutOfView()) {
          enemy.remove();
          enemiesRef.current.splice(index, 1);
        }
      });

      coinsRef.current.forEach((coin, index) => {
        coin.moveForward();
        if (coin.checkCollision(player)) {
          setCoinCount((prev) => prev + 1);
          coin.remove();
          coinsRef.current.splice(index, 1);
        }
        if (coin.isOutOfView()) {
          coin.remove();
          coinsRef.current.splice(index, 1);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      gameManager.cleanup();
      clearInterval(objectSpawnInterval);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [isGameOver]);

  const restartGame = () => {
    setIsGameOver(false);
    setCoinCount(0);
    enemiesRef.current.forEach((enemy) => enemy.remove());
    coinsRef.current.forEach((coin) => coin.remove());
    enemiesRef.current = [];
    coinsRef.current = [];
    player.lane = 2;
    player.mesh.position.x = lanePositions[player.lane];
  };

  return (
    <div>
      <div ref={mountRef} />

      {/* Display Live Coin Count */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "8px",
          borderRadius: "5px",
          fontSize: window.innerWidth < 600 ? "20px" : "36px", // Smaller font for mobile
          zIndex: 1000,
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
            alignContent: "center",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h2 style={{ color: "red" }}>Game Over!</h2>
          <button
            onClick={restartGame}
            style={{
              padding: "10px 20px",
              marginLeft: "13px",
              alignContent: "center",
              justifyContent: "center",
              fontSize: "20px",
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
