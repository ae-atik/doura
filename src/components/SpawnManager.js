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
      const newEnemy = new Enemy(this.scene, this.lanePositions);
      this.enemiesRef.current.push(newEnemy);

      const coinLane = Math.floor(Math.random() * 3) + 1;
      let coins = [];
      for (let i = 0; i < 5; i++) {
        const coin = new Coin(this.scene, this.lanePositions, [...this.enemiesRef.current, ...this.coinsRef.current], coinLane, i);
        coins.push(coin);
      }
      this.coinsRef.current.push(...coins);

      if (Math.random() < 0.5) {
        const buffTypes = [ "speed"];//"magnet", "shield",
        const buffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];
        const buff = new Buff(this.scene, this.lanePositions, buffType);
        this.buffsRef.current.push(buff);
      }
    }
  }
}
