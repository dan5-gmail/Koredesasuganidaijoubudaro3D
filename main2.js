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

// ===== コントロール =====
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener("click", () => {
  controls.lock();
});

// ===== ワールド定義 =====
const groundHeight = 0.1;
const groundTop = groundHeight / 2; // 0.05
const eyeHeight = 1.6;

// プレイヤーの足元Y
const playerBaseY = groundTop + eyeHeight;

// ===== 初期位置 =====
controls.getObject().position.set(5, playerBaseY, 5);

// ===== 物理 =====
let velocityY = 0;
const gravity = -0.015;
const jumpPower = 0.35;

let isOnGround = true;
let wasOnGround = true;

let landingBoostTimer = 0;

// カメラ揺れ
let cameraOffsetY = 0;

// ===== 入力 =====
const keys = {};

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.code === "Space" && isOnGround) {
    velocityY = jumpPower;
    isOnGround = false;
    cameraOffsetY += 0.06;
  }
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// ===== レンダラー =====
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== 光 =====
scene.add(new THREE.DirectionalLight(0xffffff, 1));
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// ===== 地面生成 =====
const worldSize = 100;

for (let x = 0; x < worldSize; x++) {
  for (let z = 0; z < worldSize; z++) {

    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(1, groundHeight, 1),
      new THREE.MeshLambertMaterial({ color: 0x228B22 })
    );

    tile.position.set(x, 0, z);
    scene.add(tile);

    // 草（30cm）
    if (Math.random() < 0.25) {
      const grass = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.3, 0.1),
        new THREE.MeshLambertMaterial({ color: 0x00ff00 })
      );
      grass.position.set(x, groundTop + 0.15, z);
      scene.add(grass);
    }
  }
}

// ===== 更新処理 =====
function updatePlayer() {

  let speed = keys["shift"] ? 0.3 : 0.15;

  if (!isOnGround) speed *= 0.85;

  if (landingBoostTimer > 0) {
    speed *= 1.1;
    landingBoostTimer--;
  }

  if (keys["w"]) controls.moveForward(speed);
  if (keys["s"]) controls.moveForward(-speed);
  if (keys["a"]) controls.moveRight(-speed);
  if (keys["d"]) controls.moveRight(speed);

  // 重力
  velocityY += gravity;
  controls.getObject().position.y += velocityY;

  // 地面判定
  if (controls.getObject().position.y <= playerBaseY) {

    if (!wasOnGround) {
      landingBoostTimer = 5;
      cameraOffsetY -= 0.08;
    }

    velocityY = 0;
    controls.getObject().position.y = playerBaseY;
    isOnGround = true;

  } else {
    isOnGround = false;
  }

  wasOnGround = isOnGround;

  // 揺れ減衰
  cameraOffsetY *= 0.85;
  camera.position.y = cameraOffsetY;
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
