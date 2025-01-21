// BuffManager.js

export default class BuffManager {
    constructor(setHasMagnet, setHasShield, setSpeedMultiplier) {
      this.setHasMagnet = setHasMagnet;
      this.setHasShield = setHasShield;
      this.setSpeedMultiplier = setSpeedMultiplier;
    }
  
    activateBuff(buffType) {
      if (buffType === "magnet") {
        this.setHasMagnet(true);
        setTimeout(() => this.setHasMagnet(false), 5000);
      } else if (buffType === "shield") {
        this.setHasShield(true);
        setTimeout(() => this.setHasShield(false), 5000);
      } else if (buffType === "speed") {
        this.setSpeedMultiplier(2); // Set speed to 2x
        setTimeout(() => {
          this.setSpeedMultiplier(1); // Reset back to normal speed after 5s
        }, 5000);
      }
    }
  }
  