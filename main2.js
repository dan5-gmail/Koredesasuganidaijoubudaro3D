import * as THREE from "three";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

/* ===== シーン ===== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

/* ===== 光 ===== */

scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1));

/* ===== 100×100地面 ===== */

const ground = new THREE.Mesh(
 new THREE.PlaneGeometry(100,100),
 new THREE.MeshLambertMaterial({color:0x228B22})
);

ground.rotation.x = -Math.PI/2;
scene.add(ground);

/* グリッド（位置確認用） */

const grid = new THREE.GridHelper(100,100);
scene.add(grid);

/* ===== FPS ===== */

const controls = new PointerLockControls(camera,document.body);
scene.add(controls.getObject());

camera.position.y = 1.7;

document.addEventListener("click",()=>{
 controls.lock();
});

/* ===== 入力 ===== */

const keys={};

document.addEventListener("keydown",e=>{
 keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup",e=>{
 keys[e.key.toLowerCase()] = false;
});

/* ===== 物理 ===== */

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const walkSpeed = 6;
const sprintSpeed = 12;
const gravity = -25;
const jumpPower = 10;

let bodyY = 1.7;
let onGround = true;

/* ===== ヘッドボブ ===== */

let bobTime = 0;
const bobAmount = 0.15;
const bobSpeed = 10;

/* ===== FOV ===== */

const baseFov = 75;
const sprintFov = 95;

/* ===== clock ===== */

const clock = new THREE.Clock();

/* ===== update ===== */

function update(delta){

direction.set(0,0,0);

if(keys["w"]) direction.z-=1;
if(keys["s"]) direction.z+=1;
if(keys["a"]) direction.x-=1;
if(keys["d"]) direction.x+=1;

direction.normalize();

/* 走る */

const running = keys["shift"];
const speed = running ? sprintSpeed : walkSpeed;

velocity.x = direction.x * speed;
velocity.z = direction.z * speed;

/* 移動 */

controls.moveRight(velocity.x*delta);
controls.moveForward(velocity.z*delta);

/* ジャンプ */

if(keys[" "] && onGround){

 velocity.y = jumpPower;
 onGround=false;

}

/* 重力 */

velocity.y += gravity*delta;
bodyY += velocity.y*delta;

if(bodyY<=1.7){

 bodyY=1.7;
 velocity.y=0;
 onGround=true;

}

camera.position.y = bodyY;

/* ===== ヘッドボブ ===== */

const moving = direction.length()>0;

if(moving && onGround){

 bobTime += delta * bobSpeed * (running ? 1.8 : 1);

 camera.position.y =
 bodyY + Math.sin(bobTime)*bobAmount;

}

/* ===== FOV ===== */

const targetFov = running ? sprintFov : baseFov;

camera.fov += (targetFov-camera.fov)*8*delta;
camera.updateProjectionMatrix();

}

/* ===== ループ ===== */

function animate(){

requestAnimationFrame(animate);

const delta = clock.getDelta();

update(delta);

renderer.render(scene,camera);

}

animate();

/* ===== resize ===== */

window.addEventListener("resize",()=>{

camera.aspect = window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth,window.innerHeight);

});
