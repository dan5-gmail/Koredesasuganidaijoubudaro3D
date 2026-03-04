import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

/* ================= 基本設定 ================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* ================= ライト ================= */

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

/* ================= 地面 ================= */

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshLambertMaterial({ color: 0x228B22 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ================= FPS 構造 (ここが重要) ================= */

// 1. プレイヤー全体をまとめる「器」を作る
const playerGroup = new THREE.Group();
scene.add(playerGroup);

// 2. PointerLockControls には「器」を操作させる
const controls = new PointerLockControls(playerGroup, document.body);
document.addEventListener("click", () => controls.lock());

// 3. カメラを「器」の子要素にする
playerGroup.add(camera);

const eyeHeight = 1.6;
camera.position.set(0, eyeHeight, 0); // 初期位置（目線の高さ）

/* ================= 入力 ================= */

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* ================= 物理・設定値 ================= */

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const walkAccel = 45;
const sprintAccel = 90;
const friction = 10;
const gravity = -30;
const jumpPower = 9;

let onGround = true;

/* ================= 強烈ヘッドボブ設定 ================= */

let bobTime = 0;
const bobAmountY = 0.3;   // 上下の揺れ幅
const bobAmountX = 0.2;   // 左右の揺れ幅
const bobRotZ  = 0.04;    // 回転（首をかしげる）の揺れ幅
const bobSpeed = 14;      // 揺れる速さ

const baseFov = 75;
const sprintFov = 100;

/* ================= 更新処理 ================= */

const clock = new THREE.Clock();

function update(delta) {
  // 移動方向の計算
  direction.set(0, 0, 0);
  if (keys["w"]) direction.z -= 1;
  if (keys["s"]) direction.z += 1;
  if (keys["a"]) direction.x -= 1;
  if (keys["d"]) direction.x += 1;
  direction.normalize();

  const isSprinting = keys["shift"];
  const accel = isSprinting ? sprintAccel : walkAccel;

  // 加速と摩擦
  velocity.x += direction.x * accel * delta;
  velocity.z += direction.z * accel * delta;
  velocity.x -= velocity.x * friction * delta;
  velocity.z -= velocity.z * friction * delta;

  // PointerLockControlsを使って playerGroup を移動させる
  controls.moveRight(velocity.x * delta);
  controls.moveForward(velocity.z * delta);

  // 重力とジャンプ
  velocity.y += gravity * delta;
  playerGroup.position.y += velocity.y * delta;

  if (playerGroup.position.y <= 0) {
    velocity.y = 0;
    playerGroup.position.y = 0;
    onGround = true;
  }

  if (keys[" "] && onGround) {
    velocity.y = jumpPower;
    onGround = false;
  }

  /* ===== 画面の揺れ（ヘッドボブ）の適用 ===== */

  const horizontalSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
  const isMoving = horizontalSpeed > 0.15;

  if (isMoving && onGround) {
    // 動いているとき：サイン・コサイン波でカメラを揺らす
    bobTime += delta * bobSpeed * (isSprinting ? 1.4 : 1.0);

    const yShake = Math.sin(bobTime) * bobAmountY;
    const xShake = Math.cos(bobTime * 0.5) * bobAmountX;
    const zRot = Math.sin(bobTime * 0.5) * bobRotZ;

    camera.position.y = eyeHeight + yShake;
    camera.position.x = xShake;
    camera.rotation.z = zRot;
  } else {
    // 止まっているとき：スムーズに中央（eyeHeight）に戻す
    bobTime = 0;
    camera.position.y += (eyeHeight - camera.position.y) * 8 * delta;
    camera.position.x += (0 - camera.position.x) * 8 * delta;
    camera.rotation.z += (0 - camera.rotation.z) * 8 * delta;
  }

  /* ===== FOVの変更 ===== */

  const targetFov = isSprinting ? sprintFov : baseFov;
  camera.fov += (targetFov - camera.fov) * 10 * delta;
  camera.updateProjectionMatrix();
}

/* ================= ループ ================= */

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (delta > 0.1) return; // タブ切り替え時のバグ防止
  update(delta);
  renderer.render(scene, camera);
}
animate();

/* ================= リサイズ ================= */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
