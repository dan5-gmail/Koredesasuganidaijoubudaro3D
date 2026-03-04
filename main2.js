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

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

/* ========================
   地面
======================== */

const groundGeo = new THREE.BoxGeometry(1, 1, 1);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });

for (let x = -50; x < 50; x++) {
  for (let z = -50; z < 50; z++) {
    const tile = new THREE.Mesh(groundGeo, groundMat);
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
player.position.set(0, 0, 5);

/* bob専用オブジェクト */
const bobObject = new THREE.Object3D();
player.add(bobObject);
bobObject.add(camera);

const eyeHeight = 1.6;
bobObject.position.y = eyeHeight;

/* ========================
   入力
======================== */

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* ========================
   物理
======================== */

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const walkAccel = 45;
const sprintAccel = 80;
const friction = 10;
const gravity = -30;
const jumpPower = 9;

let bodyY = 0;
let onGround = true;

/* ========================
   FOV
======================== */

const baseFov = 75;
const sprintFov = 95;
const fovSpeed = 10;

/* ========================
   ヘッドボブ
======================== */

let bobTime = 0;
let bobOffset = 0;
const bobAmount = 0.15;   // 強めにして確実に見せる
const bobSpeed = 14;

/* ========================
   更新処理
======================== */

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

  /* 水平加速 */
  velocity.x += direction.x * accel * delta;
  velocity.z += direction.z * accel * delta;

  /* 摩擦 */
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

  /* 実際に動いているか判定（キーではなく速度） */
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  const isMoving = speed > 0.1;

  /* ヘッドボブ */
  if (isMoving && onGround) {
    bobTime += delta * bobSpeed * (isSprinting ? 1.8 : 1);
    bobOffset = Math.sin(bobTime) * bobAmount;
  } else {
    bobTime = 0;
    bobOffset += (0 - bobOffset) * 12 * delta;
  }

  /* 反映 */
  player.position.y = bodyY;
  bobObject.position.y = eyeHeight + bobOffset;

  /* FOV */
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
