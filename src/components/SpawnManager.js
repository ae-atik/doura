// SpawnManager.js
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

  spawnObjects(isGameOver) {
    if (!isGameOver) {
      // Spawn Enemy
      const newEnemy = new Enemy(this.scene, this.lanePositions);
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
        coins.push(coin);
      }
      this.coinsRef.current.push(...coins);

      // Spawn Buffs
      if (Math.random() < 1) {
        const buffTypes = [ "magnet"];//, "speed", "shield"
        const buffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];

        // Combine all existing objects to check for conflicts
        const existingObjects = [
          ...this.enemiesRef.current,
          ...this.coinsRef.current,
          ...this.buffsRef.current,
        ];

        // Determine the index for z-position offset
        const currentBuffsInLane = this.buffsRef.current.filter(
          (buff) => buff.type === buffType
        ).length;

        const buff = new Buff(
          this.scene,
          this.lanePositions,
          buffType,
          existingObjects, // Pass existing objects
          null, // Let Buff.js choose a safe lane
          currentBuffsInLane // Offset z-position
        );
        this.buffsRef.current.push(buff);
      }
    }
  }
}
