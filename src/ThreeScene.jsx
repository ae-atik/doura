import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const [lane, setLane] = useState(2); // 1 = Left, 2 = Middle, 3 = Right
  const lanePositions = { 1: -2, 2: 0, 3: 2 };

  let playerVelocityY = 0;
  const [isGameOver, setIsGameOver] = useState(false);
  const gravity = -0.002;
  const jumpStrength = 0.1;
  let onGround = true;
  const restartGame = () => {
    setIsGameOver(false);
    setLane(2); // Reset player position
    playerVelocityY = 0;
    enemiesRef.current.forEach((enemy) => scene.remove(enemy)); // Remove all enemies
    enemiesRef.current = []; // Clear enemy list
  };
  
  const enemiesRef = useRef([]); // Store enemies globally

  useEffect(() => {
    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 4);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = false;

    // Ground
    const groundGeometry = new THREE.BoxGeometry(10, 0.5, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: "#0369a1" });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Cube (Player)
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#00ff00" });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.position.y = 0;
    scene.add(cube);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 3, 1);
    light.castShadow = true;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Function to spawn enemies
    const spawnEnemy = () => {
      const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
      const enemyMaterial = new THREE.MeshStandardMaterial({ color: "red" });
      const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
      enemy.castShadow = true;

      const enemyLane = Math.floor(Math.random() * 3) + 1;
      enemy.position.set(lanePositions[enemyLane], 0, -20);
      
      enemiesRef.current.push(enemy); // Store enemy in ref
      scene.add(enemy);
    };

    const enemySpawnInterval = setInterval(spawnEnemy, 2000); // Spawn an enemy every 2 seconds

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Apply Gravity and Jump Physics
      playerVelocityY += gravity; // Apply gravity every frame
      cube.position.y += playerVelocityY; // Apply velocity change

      // Prevent Falling Below Ground
      if (cube.position.y <= 0) {
        cube.position.y = 0;
        playerVelocityY = 0; // Reset velocity when touching the ground
        onGround = true;
      }

      // Move the player left/right based on lane
      cube.position.x = lanePositions[lane];

      // Stop game loop if game over
      if (isGameOver) return; // Stop game loop if game over

      // Move enemies towards the player
      enemiesRef.current.forEach((enemy, index) => {
        enemy.position.z += 0.05;

        // Collision Detection
        if (
          Math.abs(enemy.position.x - cube.position.x) < 1 &&
          Math.abs(enemy.position.z - cube.position.z) < 1 &&
          Math.abs(enemy.position.y - cube.position.y) < 1
        ) {
          setIsGameOver(true); // Restart the game
        }

        // Remove enemy when it moves out of view
        if (enemy.position.z > 5) {
          scene.remove(enemy);
          enemiesRef.current.splice(index, 1);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle Keyboard Input
    const handleKeyDown = (event) => {
      if (event.code === "ArrowLeft" && lane > 1) {
        setLane((prevLane) => prevLane - 1);
      } else if (event.code === "ArrowRight" && lane < 3) {
        setLane((prevLane) => prevLane + 1);
      } else if (event.code === "ArrowUp" && onGround) {
        playerVelocityY = jumpStrength; // Apply jumping velocity
        onGround = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Touch Controls
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (event) => {
      touchStartX = event.touches[0].clientX;
    };

    const handleTouchEnd = (event) => {
      touchEndX = event.changedTouches[0].clientX;
      let diffX = touchEndX - touchStartX;
      const minSwipeDistance = 50;

      if (diffX > minSwipeDistance && lane < 3) {
        setLane((prevLane) => prevLane + 1);
      } else if (diffX < -minSwipeDistance && lane > 1) {
        setLane((prevLane) => prevLane - 1);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    // Cleanup on Unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      clearInterval(enemySpawnInterval);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [lane]);

  return (
    <div>
      <div ref={mountRef} />
      {isGameOver && (
          <button onClick={restartGame} style={{ padding: "10px 20px", fontSize: "16px" }}>Restart</button>
      )}
    </div>
  );
  ;
};

export default ThreeScene;
