import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import RoadManager from "./RoadManager";
import SpawnManager from "./SpawnManager";
import BuffManager from "./BuffManager";
import { Player } from "./Player";
import { GameManager } from "./GameManager";
import EnvironmentManager from "./EnvironmentManager";
import TreeManager from "./TreeManager";

const ThreeScene = ({ preloadedTrees, musicManager }) => {
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

    // Basic camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 3, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Environment
    const environmentManager = new EnvironmentManager(scene, speedMultiplier);

    // Managers
    const roadManager = new RoadManager(scene);
    roadManager.addLeftSide();

    treeManager = new TreeManager(scene, speedMultiplier, treesRef, preloadedTrees);

    const buffManager = new BuffManager(
      setHasMagnet,
      (value) => {
        setHasShield(value);
        hasShieldRef.current = value;
      },
      (value) => {
        speedMultiplier.current = value;
      }
    );

    const spawnManager = new SpawnManager(
      scene,
      lanePositions,
      enemiesRef,
      coinsRef,
      buffsRef
    );

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, -10);
    light.castShadow = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 20;
    light.shadow.camera.left = -10;
    light.shadow.camera.right = 10;
    light.shadow.camera.top = 10;
    light.shadow.camera.bottom = -10;
    scene.add(light, new THREE.AmbientLight(0xffffff, 2));

    // Player & Game Manager
    player = new Player(scene, lanePositions, musicManager);
    gameManager = new GameManager(player, enemiesRef, setIsGameOver);

    // Intervals for spawning
    const objectSpawnInterval = setInterval(() => {
      if (!isGameOver) {
        spawnManager.spawnObjects(false);
      }
    }, 2000);

    const treeSpawnInterval = setInterval(() => {
      if (!isGameOver && Math.random() < 1) {
        treeManager.spawnTree();
      }
    }, 400);

    // Prevent default touch gestures
    const preventDefaultTouchActions = (event) => {
      event.preventDefault();
    };
    document.addEventListener("touchmove", preventDefaultTouchActions, { passive: false });
    document.addEventListener("gesturestart", preventDefaultTouchActions, { passive: false });
    document.addEventListener("gesturechange", preventDefaultTouchActions, { passive: false });
    document.addEventListener("gestureend", preventDefaultTouchActions, { passive: false });

    // Coin glow effect helper
    const createCoinParticleEffect = (position, scene) => {
      const particleCount = 1;
      const particles = new THREE.Group();

      for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ color: "gold" });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        particle.position.set(
          position.x + (Math.random() - 0.5) * 0.3,
          position.y + (Math.random() - 0.5) * 0.3,
          position.z + (Math.random() - 0.5) * 0.3
        );
        particles.add(particle);
      }

      scene.add(particles);

      let scale = 1;
      let opacity = 1;
      const velocity = [];

      for (let i = 0; i < particleCount; i++) {
        velocity.push({
          x: (Math.random() - 0.5) * 0.1,
          y: Math.random() * 0.1 + 0.02,
          z: (Math.random() - 0.5) * 0.1,
        });
      }

      const animateParticles = () => {
        if (opacity <= 0) {
          scene.remove(particles);
          return;
        }
        requestAnimationFrame(animateParticles);

        particles.children.forEach((particle, index) => {
          particle.position.x += velocity[index].x;
          particle.position.y += velocity[index].y;
          particle.position.z += velocity[index].z;
        });

        scale += 0.02;
        opacity -= 0.05;
        particles.children.forEach((particle) => {
          particle.material.opacity = opacity;
          particle.scale.set(scale, scale, scale);
        });
      };
      animateParticles();
    };

    // Main animation loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // 1. If game already over, stop all updates
      if (isGameOver) {
        renderer.render(scene, camera);
        return;
      }

      // 2. If player is dead, just animate the player (to show dying anim),
      //    and don't move anything else
      if (player.isDead) {
        player.update();
        renderer.render(scene, camera);
        return;
      }

      // 3. Normal gameplay updates
      player.update();
      environmentManager.updateGround();
      treeManager.updateTrees();
      roadManager.moveForward();

      // Move enemies
      enemiesRef.current.forEach((enemy, index) => {
        enemy.moveForward(speedMultiplier.current);

        // Collision => remove enemy, player dies, game over after delay
        if (!hasShieldRef.current && enemy.checkCollision(player)) {
          // Remove the enemy right away
          enemy.remove();
          enemiesRef.current.splice(index, 1);

          // Trigger death animation
          player.die();
          setTimeout(() => {
            setIsGameOver(true);
          }, 4000); // Enough time for dying anim to finish
          return;
        }
        if (enemy.isOutOfView()) {
          enemy.remove();
          enemiesRef.current.splice(index, 1);
        }
      });

      // Move coins
      coinsRef.current.forEach((coin, index) => {
        const shouldCollect = coin.moveForward(
          speedMultiplier.current,
          hasMagnetRef.current,
          player
        );
        if (shouldCollect || coin.checkCollision(player)) {
          musicManager.playSoundEffect("coinPickup");
          createCoinParticleEffect(coin.mesh.position, scene);
          setCoinCount((prev) => prev + 1);
          coin.remove();
          coinsRef.current.splice(index, 1);
        } else if (coin.isOutOfView()) {
          coin.remove();
          coinsRef.current.splice(index, 1);
        }
      });

      // Move buffs
      buffsRef.current.forEach((buff, index) => {
        buff.moveForward(speedMultiplier.current);
        if (buff.checkCollision(player)) {
          buffManager.activateBuff(buff.type);
          buff.remove();
          buffsRef.current.splice(index, 1);
        } else if (buff.isOutOfView()) {
          buff.remove();
          buffsRef.current.splice(index, 1);
        }
      });

      // Render the scene
      renderer.render(scene, camera);
    };

    // Start the loop
    animate();

    // Cleanup
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
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Display coin count in top-right corner */}
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

      {/* If game is over, show Game Over UI */}
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
