import * as THREE from "three";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

/* ========================
   基本セット
======================== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
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

const walkAccel = 35;
const sprintAccel = 70;
const friction = 6;
const airControl = 0.3;

const gravity = -20;
const jumpPower = 8;

let onGround = true;
const eyeHeight = 1.6;

/* ========================
   FOV
======================== */

const baseFov = 75;
const sprintFov = 90;
const fovSpeed = 6;

/* ========================
   ヘッドボブ
======================== */

let bobTime = 0;
let bobOffset = 0;
const bobAmount = 0.05;
const bobSpeed = 10;

/* ========================
   更新処理
======================== */

const clock = new THREE.Clock();

function update(delta) {

  /* === 入力方向 === */

  direction.set(0, 0, 0);
  if (keys["w"]) direction.z -= 1;
  if (keys["s"]) direction.z += 1;
  if (keys["a"]) direction.x -= 1;
  if (keys["d"]) direction.x += 1;
  direction.normalize();

  const isMoving = direction.length() > 0;
  const isSprinting = keys["shift"] && isMoving;

  const accel = isSprinting ? sprintAccel : walkAccel;
  const control = onGround ? 1 : airControl;

  /* === 水平方向加速 === */

  velocity.x += direction.x * accel * delta * control;
  velocity.z += direction.z * accel * delta * control;

  /* === 摩擦 === */

  velocity.x -= velocity.x * friction * delta;
  velocity.z -= velocity.z * friction * delta;

  controls.moveRight(velocity.x * delta);
  controls.moveForward(velocity.z * delta);

  /* === 重力計算（ベースYのみ） === */

  velocity.y += gravity * delta;
  let baseY = player.position.y + velocity.y * delta;

  if (baseY <= eyeHeight) {
    velocity.y = 0;
    baseY = eyeHeight;
    onGround = true;
  }

  if (keys[" "] && onGround) {
    velocity.y = jumpPower;
    onGround = false;
  }

  /* === ヘッドボブ === */

  if (isMoving && onGround) {
    bobTime += delta * bobSpeed * (isSprinting ? 1.5 : 1);
    bobOffset = Math.sin(bobTime) * bobAmount;
  } else {
    bobTime = 0;
    bobOffset += (0 - bobOffset) * 10 * delta;
  }

  /* === Y合成 === */

  player.position.y = baseY;
camera.position.y = bobOffset;

  /* === FOV変化 === */

  const targetFov = isSprinting ? sprintFov : baseFov;
  camera.fov += (targetFov - camera.fov) * fovSpeed * delta;
  camera.updateProjectionMatrix();
}

/* ========================
   ループ
======================== */

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  update(delta);
  renderer.render(scene, camera);
   camera.position.y = Math.sin(performance.now() * 0.01) * 0.2;
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
