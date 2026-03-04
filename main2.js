import * as THREE from "three";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

/* ========================
   基本セットアップ
======================== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

/* ========================
   ライト
======================== */

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

/* ========================
   地面
======================== */

for (let x = -50; x < 50; x++) {
  for (let z = -50; z < 50; z++) {
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ color: 0x228B22 })
    );
    tile.position.set(x, -0.5, z);
    scene.add(tile);
  }
}

/* ========================
   FPSコントロール
======================== */

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener("click", () => controls.lock());

const player = controls.getObject();
player.position.set(0, 1.6, 5);

/* ========================
   入力
======================== */

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* ========================
   物理パラメータ
======================== */

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const walkAcceleration = 35;
const sprintAcceleration = 70;
const friction = 6;
const airControl = 0.3;

const gravity = -20;
const jumpPower = 8;

let onGround = true;
const eyeHeight = 1.6;

/* ========================
   FOV設定
======================== */

const baseFov = 75;
const sprintFov = 90;
const fovLerpSpeed = 6;

/* ========================
   ヘッドボブ
======================== */

let bobTime = 0;
const bobAmount = 0.05;
const bobSpeed = 10;

/* ========================
   更新処理
======================== */

const clock = new THREE.Clock();

function update(delta) {

  direction.set(0, 0, 0);

  if (keys["w"]) direction.z -= 1;
  if (keys["s"]) direction.z += 1;
  if (keys["a"]) direction.x -= 1;
  if (keys["d"]) direction.x += 1;

  direction.normalize();

  const isMoving = direction.length() > 0;
  const isSprinting = keys["shift"] && isMoving;

  const acceleration = isSprinting ? sprintAcceleration : walkAcceleration;
  const control = onGround ? 1 : airControl;

  velocity.x += direction.x * acceleration * delta * control;
  velocity.z += direction.z * acceleration * delta * control;

  velocity.x -= velocity.x * friction * delta;
  velocity.z -= velocity.z * friction * delta;

  controls.moveRight(velocity.x * delta);
  controls.moveForward(velocity.z * delta);

  /* ===== 重力 ===== */

  velocity.y += gravity * delta;
  player.position.y += velocity.y * delta;

  if (player.position.y <= eyeHeight) {
    velocity.y = 0;
    player.position.y = eyeHeight;
    onGround = true;
  }

  if (keys[" "] && onGround) {
    velocity.y = jumpPower;
    onGround = false;
  }

  /* ===== FOV変化 ===== */

  const targetFov = isSprinting ? sprintFov : baseFov;
  camera.fov += (targetFov - camera.fov) * fovLerpSpeed * delta;
  camera.updateProjectionMatrix();

  /* ===== ヘッドボブ ===== */

  if (isMoving && onGround) {
    bobTime += delta * bobSpeed * (isSprinting ? 1.5 : 1);
    player.position.y = eyeHeight + Math.sin(bobTime) * bobAmount;
  } else {
    bobTime = 0;
    player.position.y += (eyeHeight - player.position.y) * 10 * delta;
  }
}

/* ========================
   ループ
======================== */

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  update(delta);
  renderer.render(scene, camera);
}

animate();

/* ========================
   リサイズ
======================== */

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
