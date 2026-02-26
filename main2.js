import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

// ===== 基本セット =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener("click", () => controls.lock());

// ===== ワールド =====
const groundHeight = 1; // ← 今回は1mのブロックにする（わかりやすく）
const eyeHeight = 1.6;

// 地面生成
const worldSize = 50;

for (let x = 0; x < worldSize; x++) {
  for (let z = 0; z < worldSize; z++) {

    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(1, groundHeight, 1),
      new THREE.MeshLambertMaterial({ color: 0x228B22 })
    );

    // 地面の上面が Y=0 になるようにする
    tile.position.set(x, -groundHeight / 2, z);
    scene.add(tile);
  }
}

// ===== 光 =====
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// ===== プレイヤー初期位置 =====
controls.getObject().position.set(5, eyeHeight, 5);

// ===== 物理 =====
let velocityY = 0;
const gravity = -0.02;
const jumpPower = 0.5;

let isOnGround = true;

const keys = {};

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.code === "Space" && isOnGround) {
    velocityY = jumpPower;
    isOnGround = false;
  }
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

function updatePlayer() {

  const speed = keys["shift"] ? 0.3 : 0.15;

  if (keys["w"]) controls.moveForward(speed);
  if (keys["s"]) controls.moveForward(-speed);
  if (keys["a"]) controls.moveRight(-speed);
  if (keys["d"]) controls.moveRight(speed);

  // 重力
  velocityY += gravity;
  controls.getObject().position.y += velocityY;

  // 地面判定（地面上面は Y=0）
  if (controls.getObject().position.y <= eyeHeight) {
    velocityY = 0;
    controls.getObject().position.y = eyeHeight;
    isOnGround = true;
  }
}

function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
