import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

/* 地面 */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshBasicMaterial({ color: 0x228B22 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* FPS */
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());
document.addEventListener("click", () => controls.lock());

const player = controls.getObject();
player.position.set(0, 0, 5);

/* ⭐ ここが重要 */
const pitchObject = camera.parent; 

/* 入力 */
const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* 物理 */
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const accel = 60;
const friction = 10;
const gravity = -30;

let bodyY = 0;
let onGround = true;

/* ボブ */
let bobTime = 0;
const bobAmount = 0.6;
const bobSpeed = 14;

const clock = new THREE.Clock();

function update(delta){

  direction.set(0,0,0);
  if(keys["w"]) direction.z -= 1;
  if(keys["s"]) direction.z += 1;
  if(keys["a"]) direction.x -= 1;
  if(keys["d"]) direction.x += 1;
  direction.normalize();

  velocity.x += direction.x * accel * delta;
  velocity.z += direction.z * accel * delta;

  velocity.x -= velocity.x * friction * delta;
  velocity.z -= velocity.z * friction * delta;

  controls.moveRight(velocity.x * delta);
  controls.moveForward(velocity.z * delta);

  /* 重力 */
  velocity.y += gravity * delta;
  bodyY += velocity.y * delta;

  if(bodyY <= 0){
    velocity.y = 0;
    bodyY = 0;
    onGround = true;
  }

  player.position.y = bodyY;

  /* 移動判定 */
  const speed = Math.sqrt(velocity.x**2 + velocity.z**2);
  const moving = speed > 0.1;

  if(moving && onGround){
    bobTime += delta * bobSpeed;
    pitchObject.position.y = Math.sin(bobTime) * bobAmount;
  } else {
    bobTime = 0;
    pitchObject.position.y += (0 - pitchObject.position.y) * 10 * delta;
  }
}

function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  update(delta);
  renderer.render(scene,camera);
}
animate();

camera.fov = 30;
camera.updateProjectionMatrix();
