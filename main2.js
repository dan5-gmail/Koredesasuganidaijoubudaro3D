import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

/* ================= 基本 ================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

/* ================= 地面 ================= */

const GROUND_Y = 0;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500,500),
  new THREE.MeshLambertMaterial({
    color:0x228B22,
    side:THREE.DoubleSide
  })
);
ground.rotation.x = -Math.PI/2;
ground.position.y = GROUND_Y;
scene.add(ground);

scene.add(new THREE.AmbientLight(0xffffff,0.6));

/* ================= FPS ================= */

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());
document.addEventListener("click", ()=>controls.lock());

const player = controls.getObject();

/* ================= リスポーン設定 ================= */

const RESPAWN_HEIGHT = 5;   // 地面より上に確実に出す高さ
const FALL_LIMIT = -30;     // これ以下で強制復帰

let bodyY = RESPAWN_HEIGHT;
player.position.set(0, bodyY, 5);

/* ================= bobノード ================= */

const eyeHeight = 1.6;

const bobNode = new THREE.Object3D();
player.add(bobNode);
bobNode.add(camera);
bobNode.position.y = eyeHeight;

/* ================= 入力 ================= */

const keys = {};
document.addEventListener("keydown", e=>keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e=>keys[e.key.toLowerCase()] = false);

/* ================= 物理 ================= */

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const walkAccel = 40;
const sprintAccel = 80;
const friction = 10;
const gravity = -30;
const jumpPower = 9;

let onGround = false;

/* ================= ヘッドボブ ================= */

let bobTime = 0;
const bobAmount = 0.3;
const bobSpeed = 12;

/* ================= FOV ================= */

const baseFov = 75;
const sprintFov = 95;
const fovSpeed = 8;

const clock = new THREE.Clock();

/* ================= リスポーン関数 ================= */

function respawn(){
  velocity.set(0,0,0);
  bodyY = RESPAWN_HEIGHT;
  player.position.set(0, bodyY, 5);
  onGround = false;
}

/* ================= update ================= */

function update(delta){

  /* ---- 移動入力 ---- */
  direction.set(0,0,0);
  if(keys["w"]) direction.z -= 1;
  if(keys["s"]) direction.z += 1;
  if(keys["a"]) direction.x -= 1;
  if(keys["d"]) direction.x += 1;
  direction.normalize();

  const isSprinting = keys["shift"];
  const accel = isSprinting ? sprintAccel : walkAccel;

  velocity.x += direction.x * accel * delta;
  velocity.z += direction.z * accel * delta;

  velocity.x -= velocity.x * friction * delta;
  velocity.z -= velocity.z * friction * delta;

  controls.moveRight(velocity.x * delta);
  controls.moveForward(velocity.z * delta);

  /* ---- 重力 ---- */
  velocity.y += gravity * delta;
  bodyY += velocity.y * delta;

  /* ---- 地面判定 ---- */
  if(bodyY <= GROUND_Y){
    bodyY = GROUND_Y;
    velocity.y = 0;
    onGround = true;
  }

  /* ---- ジャンプ ---- */
  if(keys[" "] && onGround){
    velocity.y = jumpPower;
    onGround = false;
  }

  /* ---- 落下しすぎたら復帰 ---- */
  if(bodyY < FALL_LIMIT){
    respawn();
  }

  player.position.y = bodyY;

  /* ---- ヘッドボブ ---- */
  const speed = Math.sqrt(velocity.x**2 + velocity.z**2);
  const moving = speed > 0.1;

  if(moving && onGround){
    bobTime += delta * bobSpeed * (isSprinting ? 1.8 : 1);
    bobNode.position.y = eyeHeight + Math.sin(bobTime) * bobAmount;
  }else{
    bobTime = 0;
    bobNode.position.y += (eyeHeight - bobNode.position.y) * 8 * delta;
  }

  /* ---- FOV ---- */
  const targetFov = isSprinting ? sprintFov : baseFov;
  camera.fov += (targetFov - camera.fov) * fovSpeed * delta;
  camera.updateProjectionMatrix();
}

/* ================= ループ ================= */

function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  update(delta);
  renderer.render(scene,camera);
}
animate();

/* ================= リサイズ ================= */

window.addEventListener("resize",()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
