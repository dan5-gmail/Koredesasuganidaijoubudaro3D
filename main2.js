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

// ===== 初期高さ =====
const baseHeight = 1.6;
controls.getObject().position.set(5, baseHeight, 5);

// ===== 物理 =====
let velocityY = 0;
const gravity = -0.01;
const jumpPower = 0.25;

let isOnGround = true;
let wasOnGround = true;

let landingBoostTimer = 0;
const airControl = 0.85;
const landingBoost = 1.1;

// カメラ揺れ用
let cameraOffsetY = 0;

// ===== 入力 =====
const keys = {};

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.code === "Space" && isOnGround) {
    velocityY = jumpPower;
    isOnGround = false;

    // ジャンプ揺れ
    cameraOffsetY += 0.05;
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

// ===== 更新 =====
function updatePlayer() {

  let baseSpeed = keys["shift"] ? 0.3 : 0.15;
  let speed = baseSpeed;

  // 空中減速
  if (!isOnGround) {
    speed *= airControl;
  }

  // 着地ブースト
  if (landingBoostTimer > 0) {
    speed *= landingBoost;
    landingBoostTimer--;
  }

  if (keys["w"]) controls.moveForward(speed);
  if (keys["s"]) controls.moveForward(-speed);
  if (keys["a"]) controls.moveRight(-speed);
  if (keys["d"]) controls.moveRight(speed);

  // ===== 重力 =====
  velocityY += gravity;
  controls.getObject().position.y += velocityY;

  // ===== 地面判定 =====
  if (controls.getObject().position.y <= baseHeight) {

    if (!wasOnGround) {
      // 着地瞬間
      landingBoostTimer = 5;
      cameraOffsetY -= 0.08;
    }

    velocityY = 0;
    controls.getObject().position.y = baseHeight;
    isOnGround = true;
  } else {
    isOnGround = false;
  }

  wasOnGround = isOnGround;

  // ===== カメラ揺れ処理（安全構造） =====
  cameraOffsetY *= 0.85;  // 減衰
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
