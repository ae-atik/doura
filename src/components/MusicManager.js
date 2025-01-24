import { Howl, Howler } from "howler";

export default class MusicManager {
  constructor() {
    this.sounds = {
      backgroundMusic: new Howl({
        src: ["/assets/audio/bgm.mp3"],
        loop: true,
        volume: 0.1, // Adjust volume
      }),
      coinPickup: new Howl({
        src: ["/assets/audio/coinsound.mp3"],
        volume: 0.2,
      }),
    //   buffPickup: new Howl({
    //     src: ["/assets/audio/buff-pickup.mp3"],
    //     volume: 0.8,
    //   }),
      jump: new Howl({
        src: ["/assets/audio/jumpsound.mp3"],
        volume: 0.6,
      }),
    //   gameOver: new Howl({
    //     src: ["/assets/audio/game-over.mp3"],
    //     volume: 1.0,
    //   }),
    };
  }

  playBackgroundMusic() {
    if (!this.sounds.backgroundMusic.playing()) {
      this.sounds.backgroundMusic.play();
    }
  }

  stopBackgroundMusic() {
    this.sounds.backgroundMusic.stop();
  }

  playSoundEffect(effect) {
    if (this.sounds[effect]) {
      this.sounds[effect].play();
    }
  }

  setVolume(effect, volume) {
    if (this.sounds[effect]) {
      this.sounds[effect].volume(volume);
    }
  }

  muteAll(muted) {
    Howler.mute(muted);
  }
}
