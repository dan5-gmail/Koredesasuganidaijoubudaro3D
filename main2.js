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

/* ================= FPS ================= */

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());
document.addEventListener("click", () => controls.lock());

const player = controls.getObject();
player.position.set(0, 0, 5);

/* ===== bobノード ===== */

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
const sprintAccel = 90;
const friction = 10;
const gravity = -30;
const jumpPower = 9;

let bodyY = 0;
let onGround = true;

/* ================= FOV ================= */

const baseFov = 75;
const sprintFov = 105; // さらに広げた
const fovSpeed = 10;

/* ================= 超強ヘッドボブ ================= */

let bobTime = 0;

const bobAmountY = 0.6;   // ← 超強
const bobAmountX = 0.4;   // ← 超強
const bobRotZ  = 0.05;    // ← 回転揺れ
const bobSpeed = 16;

/* ================= 更新 ================= */

const clock = new THREE.Clock();

function update(delta) {

  direction.set(0, 0, 0);
  if (keys["w"]) direction.z -= 1;
  if (keys["s"]) direction.z += 1;
  if (keys["a"]) direction.x -= 1;
  if (keys["d"]) direction.x += 1;
  direction.normalize();

  const isSprinting = keys["shift"];
  const accel = isSprinting ? sprintAccel : walkAccel;

  velocity.x += direction.x * accel * delta;
  velocity.z += direction.z * accel * delta;

  velocity.x -= velocity.x * friction * delta;
  velocity.z -= velocity.z * friction * delta;

  controls.moveRight(velocity.x * delta);
  controls.moveForward(velocity.z * delta);

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

  /* ===== 揺れ判定 ===== */

  const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
  const isMoving = speed > 0.15;

  if (isMoving && onGround) {
    bobTime += delta * bobSpeed * (isSprinting ? 2.0 : 1);

    const y = Math.sin(bobTime) * bobAmountY;
    const x = Math.cos(bobTime * 0.5) * bobAmountX;
    const rot = Math.sin(bobTime * 0.5) * bobRotZ;

    bobNode.position.y = eyeHeight + y;
    bobNode.position.x = x;
    camera.rotation.z = rot;

  } else {
    bobTime = 0;

    bobNode.position.y += (eyeHeight - bobNode.position.y) * 8 * delta;
    bobNode.position.x += (0 - bobNode.position.x) * 8 * delta;
    camera.rotation.z += (0 - camera.rotation.z) * 8 * delta;
  }

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
