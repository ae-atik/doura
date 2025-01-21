// GameManager.js
export class GameManager {
    constructor(player, enemiesRef, setLane, setIsGameOver) {
      this.player = player;
      this.enemiesRef = enemiesRef;
      this.setLane = setLane;
      this.setIsGameOver = setIsGameOver;
  
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("touchstart", this.handleTouchStart);
      window.addEventListener("touchend", this.handleTouchEnd);
    }
  
    handleKeyDown = (event) => {
      if (event.code === "ArrowLeft") this.player.moveLeft();
      if (event.code === "ArrowRight") this.player.moveRight();
      if (event.code === "ArrowUp") this.player.jump();
    };
  
    handleTouchStart = (event) => {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    };
    
    handleTouchEnd = (event) => {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        let diffX = touchEndX - this.touchStartX;
        let diffY = touchEndY - this.touchStartY;
        const minSwipeDistance = 50;
    
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Left and Right Swipe
            if (diffX > minSwipeDistance) {
                this.player.moveRight();
            } else if (diffX < -minSwipeDistance) {
                this.player.moveLeft();
            }
        } else {
            // Up Swipe for Jump
            if (diffY < -minSwipeDistance) {
                this.player.jump();
            }
        }
    };
    
    
    restartGame = () => {
      this.setIsGameOver(false);
      this.setLane(2);
      this.enemiesRef.current.forEach((enemy) => enemy.remove());
      this.enemiesRef.current = [];
    };
  
    cleanup() {
      window.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("touchstart", this.handleTouchStart);
      window.removeEventListener("touchend", this.handleTouchEnd);
    }
  }
  