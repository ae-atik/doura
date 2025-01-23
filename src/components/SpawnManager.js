import { Coin } from "./Coin";
import Buff from "./Buff";
import { Enemy } from "./Enemy";

export default class SpawnManager {
  constructor(scene, lanePositions, enemiesRef, coinsRef, buffsRef) {
    this.scene = scene;
    this.lanePositions = lanePositions;
    this.enemiesRef = enemiesRef;
    this.coinsRef = coinsRef;
    this.buffsRef = buffsRef;
  }

  // Helper function to prevent overlap by shifting new objects if needed
  avoidOverlap(newObject, existingObjects, minDistance = 2) {
    if (!newObject || !newObject.mesh || !newObject.mesh.position) return;
    let attempts = 0;
    const maxAttempts = 10;

    // Simple Z-based check to shift the new object if it's too close
    while (attempts < maxAttempts) {
      let overlapping = false;
      for (const obj of existingObjects) {
        if (obj && obj.mesh && obj.mesh.position) {
          const dist = Math.abs(obj.mesh.position.z - newObject.mesh.position.z);
          // If within minDistance, shift newObject further back
          if (dist < minDistance) {
            newObject.mesh.position.z -= minDistance;
            overlapping = true;
            break;
          }
        }
      }
      if (!overlapping) break;
      attempts++;
    }
  }

  spawnObjects(isGameOver) {
    if (!isGameOver) {
      // Spawn Enemy
      const newEnemy = new Enemy(this.scene, this.lanePositions);
      // Prevent overlap with existing coins, buffs, or enemies
      this.avoidOverlap(newEnemy, [
        ...this.enemiesRef.current,
        ...this.coinsRef.current,
        ...this.buffsRef.current,
      ]);
      this.enemiesRef.current.push(newEnemy);

      // Spawn Coins
      const coinLane = Math.floor(Math.random() * 3) + 1;
      let coins = [];
      for (let i = 0; i < 5; i++) {
        const coin = new Coin(
          this.scene,
          this.lanePositions,
          [...this.enemiesRef.current, ...this.coinsRef.current, ...this.buffsRef.current],
          coinLane,
          i
        );
        // Prevent overlap with existing enemies, coins, or buffs
        this.avoidOverlap(coin, [
          ...this.enemiesRef.current,
          ...this.coinsRef.current,
          ...this.buffsRef.current,
        ]);
        coins.push(coin);
      }
      this.coinsRef.current.push(...coins);

      // Spawn Buffs
      if (Math.random() < 0.8) {
        const buffTypes = ["magnet", "speed", "shield"];
        const buffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];

        // Combine all existing objects to check for conflicts
        const existingObjects = [
          ...this.enemiesRef.current,
          ...this.coinsRef.current,
          ...this.buffsRef.current,
        ];

        // Ensure buffs spawn in a valid lane
        const availableLanes = [1, 2, 3].filter(
          (lane) => !this.buffsRef.current.some((buff) => buff.lane === lane)
        );

        if (availableLanes.length > 0) {
          const selectedLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];

          const buff = new Buff(
            this.scene,
            this.lanePositions,
            buffType,
            existingObjects,
            selectedLane, // Assign a valid lane
            0 // Reset z-position offset
          );

          // Prevent overlap with existing enemies, coins, or buffs
          this.avoidOverlap(buff, existingObjects);
          this.buffsRef.current.push(buff);
        }
      }
    }
  }
}
