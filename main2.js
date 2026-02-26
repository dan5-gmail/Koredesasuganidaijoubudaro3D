import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

// ===== シーン =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

// ===== カメラ =====
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 1.6, 5);

// ===== コントロール =====
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener("click", () => {
  controls.lock();
});

// ===== レンダラー =====
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== 光 =====
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 30, 10);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// ===== 地面 =====
const worldSize = 100;

for (let x = 0; x < worldSize; x++) {
  for (let z = 0; z < worldSize; z++) {

    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.1, 1),
      new THREE.MeshLambertMaterial({ color: 0x228B22 })
    );
    tile.position.set(x, 0, z);
    scene.add(tile);

    if (Math.random() < 0.25) {
      const grass = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.6, 0.1),
        new THREE.MeshLambertMaterial({ color: 0x00ff00 })
      );
      grass.position.set(x, 0.35, z);
      scene.add(grass);
    }
  }
}

// ===== 入力 =====
const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== 更新 =====
function updatePlayer() {
  let speed = keys["shift"] ? 0.3 : 0.15;

  if (keys["w"]) controls.moveForward(speed);
  if (keys["s"]) controls.moveForward(-speed);
  if (keys["a"]) controls.moveRight(-speed);
  if (keys["d"]) controls.moveRight(speed);
}

// ===== ループ =====
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene, camera);
}

animate();

// ===== リサイズ =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
