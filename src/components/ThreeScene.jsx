import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Coin } from "./Coin";
import Buff from "./Buff";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { GameManager } from "./GameManager";
import { FBXLoader } from "three/examples/jsm/Addons.js";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [coinCount, setCoinCount] = useState(0);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [ setSpeedBoost] = useState(false);
  const lanePositions = { 1: -1.5, 2: 0, 3: 1.5 };
  const enemiesRef = useRef([]);
  const coinsRef = useRef([]);
  const buffsRef = useRef([]);
  let player, gameManager;
  let animationFrameId;

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const loader = new FBXLoader();
    const boxSize = {x: 0, y: 0, z: 0}
    
    loader.load('src/assets/models/Road_02.fbx', (obj)=> {
        scene.add(obj);
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        boxSize.x = size.x;
        boxSize.y = size.y;
        boxSize.z = size.z;
        obj.position.y -= 2+boxSize.y;
        const model21 = obj.clone()
        scene.add(model21)
        model21.position.y = -2.525+boxSize.y;
        model21.position.z = -boxSize.z;
        const model23 = obj.clone()
        scene.add(model23)
        model23.position.y = -2.8+2*boxSize.y;
        model23.position.z = -2*boxSize.z;
        const model24 = obj.clone()
        scene.add(model24)
        model24.position.y = -2.8+2*boxSize.y;
        model24.position.z = -3*boxSize.z;
        const model25 = obj.clone()
        scene.add(model25)
        model25.position.y = -2.8+2*boxSize.y;
        model25.position.z = -4*boxSize.z;
      });
      loader.load('src/assets/models/Road_02.fbx', (obj)=> {
        scene.add(obj);
        // obj.position.x -= boxSize.x;
        obj.rotation.y = Math.PI;
        obj.position.y -= 2+boxSize.y;
        const model22 = obj.clone()
        scene.add(model22)
        model22.position.y = -2.525 + boxSize.y;
        model22.position.z = -boxSize.z;
        const model23 = obj.clone()
        scene.add(model23)
        model23.position.y = -2.8+2*boxSize.y;
        model23.position.z = -2*boxSize.z;
        const model24 = obj.clone()
        scene.add(model24)
        model24.position.y = -2.8+2*boxSize.y;
        model24.position.z = -3*boxSize.z;
        const model25 = obj.clone()
        scene.add(model25)
        model25.position.y = -2.8+2*boxSize.y;
        model25.position.z = -4*boxSize.z;
    });

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.5, 50),
      new THREE.MeshStandardMaterial({ color: "#0369a1" })
    );
    ground.position.y = -2;
    ground.receiveShadow = true;
    // scene.add(ground);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 2, -1);
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
          const coin = new Coin(scene, lanePositions, [...enemiesRef.current, ...coinsRef.current], coinLane, i);
          coins.push(coin);
        }
        coinsRef.current.push(...coins);

        if (Math.random() < 0.2) {
          const buffTypes = ["magnet", "shield", "speed"];
          const buffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];
          const buff = new Buff(scene, lanePositions, buffType);
          buffsRef.current.push(buff);
        }
      }
    };

    const objectSpawnInterval = setInterval(spawnObjects, 2000);

    const activateBuff = (buffType) => {
      if (buffType === "magnet") {
        setHasMagnet(true);
        setTimeout(() => setHasMagnet(false), 5000);
      } else if (buffType === "shield") {
        setHasShield(true);
        setTimeout(() => setHasShield(false), 5000);
      } else if (buffType === "speed") {
        setSpeedBoost(true);
        setTimeout(() => setSpeedBoost(false), 5000);
      }
    };

    const animate = () => {
      if (isGameOver) return;
      animationFrameId = requestAnimationFrame(animate);

      player.update();

      enemiesRef.current.forEach((enemy, index) => {
        enemy.moveForward();
        if (!hasShield && enemy.checkCollision(player)) {
          // setIsGameOver(true);
          return;
        }
        if (enemy.isOutOfView()) {
          enemy.remove();
          enemiesRef.current.splice(index, 1);
        }
      });

      coinsRef.current.forEach((coin, index) => {
        coin.moveForward();
        if (coin.checkCollision(player) || (hasMagnet && coin.mesh.position.z > player.mesh.position.z - 1)) {
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
        buff.moveForward();
        if (buff.checkCollision(player)) {
          activateBuff(buff.type);
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
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [isGameOver]);

  return (
    <div>
      <div ref={mountRef} />

      <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0, 0, 0, 0.7)", color: "white", padding: "8px", borderRadius: "5px", fontSize: "16px" }}>
        Coins: {coinCount}
      </div>

      {isGameOver && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", padding: "10px", borderRadius: "5px" }}>
          <h2>Game Over!</h2>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", fontSize: "16px" }}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default ThreeScene;
