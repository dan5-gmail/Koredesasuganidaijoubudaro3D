import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

/* =================
基本
================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* =================
ライト
================= */

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(50,100,50);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff,0.5));

/* =================
100×100 地面
================= */

const size = 100;
const grid = new THREE.GridHelper(size, size);
scene.add(grid);

/* =================
操作
================= */

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const start = document.getElementById("start");

start.addEventListener("click", ()=>{
controls.lock();
});

controls.addEventListener("lock", ()=>{
start.style.display="none";
});

controls.addEventListener("unlock", ()=>{
start.style.display="";
});

/* =================
プレイヤー
================= */

camera.position.set(0,3,0);

let velocityY = 0;
let onGround = false;

const gravity = 0.01;
const jumpPower = 0.25;

/* =================
キー入力
================= */

const keys = {};

document.addEventListener("keydown",(e)=>{
keys[e.code]=true;

if(e.code==="Space" && onGround){
velocityY = jumpPower;
onGround=false;
}
});

document.addEventListener("keyup",(e)=>{
keys[e.code]=false;
});

/* =================
移動
================= */

let headBobTime = 0;

function move(){

const speed = keys["ShiftLeft"] ? 0.15 : 0.08;

if(keys["KeyW"]) controls.moveForward(speed);
if(keys["KeyS"]) controls.moveForward(-speed);
if(keys["KeyA"]) controls.moveRight(-speed);
if(keys["KeyD"]) controls.moveRight(speed);

/* ヘッドボブ */

if(keys["KeyW"]||keys["KeyA"]||keys["KeyS"]||keys["KeyD"]){

headBobTime += 0.15;

camera.position.y += Math.sin(headBobTime)*0.02;

}

/* 重力 */

velocityY -= gravity;
camera.position.y += velocityY;

/* 地面判定 */

if(camera.position.y < 2){

velocityY = 0;
camera.position.y = 2;
onGround = true;

}

}

/* =================
リサイズ
================= */

window.addEventListener("resize",()=>{

camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth, window.innerHeight);

});

/* =================
ループ
================= */

function animate(){

requestAnimationFrame(animate);

move();

renderer.render(scene,camera);

}

animate();
