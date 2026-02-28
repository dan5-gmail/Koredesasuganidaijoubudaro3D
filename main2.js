import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

console.log(THREE);
// ===== モバイル判定 =====
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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

// ===== コントロール =====
let controls;

if (!isMobile) {
  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());
  document.addEventListener("click", () => controls.lock());
} else {
  controls = {
    getObject: () => camera,
    moveForward: (d) => camera.translateZ(-d),
    moveRight: (d) => camera.translateX(d)
  };
}

// ===== ワールド =====
const groundHeight = 1;
const eyeHeight = 1.6;
const worldSize = 50;

for (let x = 0; x < worldSize; x++) {
  for (let z = 0; z < worldSize; z++) {
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(1, groundHeight, 1),
      new THREE.MeshLambertMaterial({ color: 0x228B22 })
    );
    tile.position.set(x, -groundHeight / 2, z);
    scene.add(tile);
  }
}

// ===== 光 =====
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// ===== 初期位置 =====
controls.getObject().position.set(5, eyeHeight, 5);

// ===== 物理 =====
let velocityY = 0;
const gravity = -0.02;
const jumpPower = 0.5;
let isOnGround = true;

const keys = {};

// ===== キーボード操作（PC用） =====
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

// ===== モバイルボタン操作 =====
if (isMobile) {

  const bindButton = (id, key) => {
    const btn = document.getElementById(id);

    btn.addEventListener("touchstart", () => keys[key] = true);
    btn.addEventListener("touchend", () => keys[key] = false);
  };

  bindButton("forward", "w");
  bindButton("back", "s");
  bindButton("left", "a");
  bindButton("right", "d");

  document.getElementById("jumpBtn").addEventListener("touchstart", () => {
    if (isOnGround) {
      velocityY = jumpPower;
      isOnGround = false;
    }
  });

  // スワイプ視点操作
  let touchX = 0;
  let touchY = 0;

  document.addEventListener("touchstart", e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  });

  document.addEventListener("touchmove", e => {
    const dx = e.touches[0].clientX - touchX;
    const dy = e.touches[0].clientY - touchY;

    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;

    camera.rotation.y -= dx * 0.003;
    camera.rotation.x -= dy * 0.003;

    camera.rotation.x = Math.max(
      -Math.PI/2,
      Math.min(Math.PI/2, camera.rotation.x)
    );
  });
}

// ===== プレイヤー更新 =====
function updatePlayer() {

  const speed = keys["shift"] ? 0.3 : 0.15;

  if (keys["w"]) controls.moveForward(speed);
  if (keys["s"]) controls.moveForward(-speed);
  if (keys["a"]) controls.moveRight(-speed);
  if (keys["d"]) controls.moveRight(speed);

  velocityY += gravity;
  controls.getObject().position.y += velocityY;

  if (controls.getObject().position.y <= eyeHeight) {
    velocityY = 0;
    controls.getObject().position.y = eyeHeight;
    isOnGround = true;
  }
}

// ===== アニメーション =====
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene, camera);
}

animate();

// ===== リサイズ対応 =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
