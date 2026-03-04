import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

/* ================= 基本 ================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

/* ================= ライト ================= */

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

/* ================= 地面（超重要） ================= */

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshLambertMaterial({ color: 0x228B22 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ================= FPS ================= */

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener("click", () => controls.lock());

const player = controls.getObject();
player.position.set(0, 0, 5);

/* ===== Bob専用ノード ===== */

const bobNode = new THREE.Object3D();
player.add(bobNode);
bobNode.add(camera);

const eyeHeight = 1.6;
bobNode.position.y = eyeHeight;

/* ================= 入力 ================= */

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* ================= 物理 ================= */

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const walkAccel = 45;
const sprintAccel = 85;
const friction = 12;
const gravity = -30;
const jumpPower = 9;

let bodyY = 0;
let onGround = true;

/* ================= FOV ================= */

const baseFov = 75;
const sprintFov = 95;
const fovSpeed = 8;

/* ================= ヘッドボブ ================= */

let bobTime = 0;
let bobY = 0;
let bobX = 0;

const bobAmountY = 0.25;
const bobAmountX = 0.12;
const bobSpeed = 12;

/* ================= 更新 ================= */

const clock = new THREE.Clock();

function update(delta) {

  /* 入力方向 */
  direction.set(0, 0, 0);
  if (keys["w"]) direction.z -= 1;
  if (keys["s"]) direction.z += 1;
  if (keys["a"]) direction.x -= 1;
  if (keys["d"]) direction.x += 1;
  direction.normalize();

  const isSprinting = keys["shift"];
  const accel = isSprinting ? sprintAccel : walkAccel;

  /* 加速 */
  velocity.x += direction.x * accel * delta;
  velocity.z += direction.z * accel * delta;

  /* 摩擦（自然減速） */
  velocity.x -= velocity.x * friction * delta;
  velocity.z -= velocity.z * friction * delta;

  controls.moveRight(velocity.x * delta);
  controls.moveForward(velocity.z * delta);

  /* 重力 */
  velocity.y += gravity * delta;
  bodyY += velocity.y * delta;

  if (bodyY <= 0) {
    velocity.y = 0;
    bodyY = 0;
    onGround = true;
  }

  if (keys[" "] && onGround) {
    velocity.y = jumpPower;
    onGround = false;
  }

  player.position.y = bodyY;

  /* ===== 実速度判定 ===== */

  const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
  const isMoving = speed > 0.15;

  /* ===== ヘッドボブ ===== */

  if (isMoving && onGround) {
    bobTime += delta * bobSpeed * (isSprinting ? 1.8 : 1);

    bobY = Math.sin(bobTime) * bobAmountY;
    bobX = Math.cos(bobTime * 0.5) * bobAmountX;

  } else {
    bobTime = 0;

    bobY += (0 - bobY) * 10 * delta;
    bobX += (0 - bobX) * 10 * delta;
  }

  bobNode.position.y = eyeHeight + bobY;
  bobNode.position.x = bobX;

  /* ===== FOV ===== */

  const targetFov = isSprinting ? sprintFov : baseFov;
  camera.fov += (targetFov - camera.fov) * fovSpeed * delta;
  camera.updateProjectionMatrix();
}

/* ================= ループ ================= */

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  update(delta);
  renderer.render(scene, camera);
}

animate();

/* ================= リサイズ ================= */

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
