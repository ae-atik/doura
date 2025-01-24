import * as THREE from "three";

export default class EnvironmentManager {
  constructor(scene, speedMultiplierRef) {
    this.scene = scene;
    this.speedMultiplierRef = speedMultiplierRef;
    this.groundMaterial = undefined;
    this.grassInstances = [];
    this.addSky();
    this.addGround();
  }

  addSky() {
    const skyGeometry = new THREE.SphereGeometry(500, 64, 64);
    const skyTexture = new THREE.TextureLoader().load(
      "/assets/textures/cloudy.jpg"
    );

    skyTexture.wrapS = THREE.RepeatWrapping;
    skyTexture.wrapT = THREE.RepeatWrapping;
    skyTexture.repeat.set(4, 4);

    const skyMaterial = new THREE.MeshStandardMaterial({
      map: skyTexture,
      side: THREE.BackSide,
    });

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.rotation.y = 5.3;
    sky.rotation.x = Math.PI / 4.7;
    this.scene.add(sky);
  }

  addGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);

    const grassTexture = new THREE.TextureLoader().load(
      "/assets/textures/grass.jpg"
    );
    const mudTexture = new THREE.TextureLoader().load(
      "/assets/textures/road_tex.webp"
    );

    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20); // Increased tiling

    mudTexture.wrapS = THREE.RepeatWrapping;
    mudTexture.wrapT = THREE.RepeatWrapping;
    mudTexture.repeat.set(10, 20); // More vertical tiling for smoother motion

    this.groundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        grassTexture: { value: grassTexture },
        mudTexture: { value: mudTexture },
        scaleFactor: { value: 10.0 }, // Scale UVs for larger tiling
        time: { value: 0.0 },
        speed: { value: 0.1 }, // Speed factor for movement
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float scaleFactor;

        void main() {
          vUv = uv * scaleFactor; // Scale UVs
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform sampler2D grassTexture;
        uniform sampler2D mudTexture;
        uniform float time;
        uniform float speed;

        void main() {
          vec2 uv = vUv;
          
          // Scroll mud texture downwards based on time
          vec2 mudUV = vec2(vUv.x, vUv.y + time * speed);
          vec2 grassUV = vec2(vUv.x, vUv.y + time * speed);

          // Smooth blending from mud to grass
          float blendFactor = smoothstep(4.0, 8.0, abs(vPosition.x)); 

          vec4 grassColor = texture2D(grassTexture, grassUV);
          vec4 mudColor = texture2D(mudTexture, mudUV);

          gl_FragColor = mix(mudColor, grassColor, blendFactor);
        }
      `,
    });

    const ground = new THREE.Mesh(groundGeometry, this.groundMaterial);
    ground.rotation.x = -Math.PI / 2.02;
    ground.position.y = -5;
    this.scene.add(ground);
  }


  updateGround() {
    this.groundMaterial.uniforms.time.value += this.speedMultiplierRef.current * 0.3; // Moves road texture based on speed
  }
}
