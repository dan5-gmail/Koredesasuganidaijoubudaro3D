import * as THREE from "three";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

/* ===== 基本 ===== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

/* ===== 光 ===== */

scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1));

/* ===== 地面 ===== */

const ground = new THREE.Mesh(
 new THREE.PlaneGeometry(500,500),
 new THREE.MeshLambertMaterial({color:0x228B22})
);

ground.rotation.x = -Math.PI/2;
scene.add(ground);

/* ===== FPS ===== */

const controls = new PointerLockControls(camera,document.body);
scene.add(controls.getObject());

camera.position.y = 1.7;

const start = document.getElementById("start");

start.addEventListener("click",()=>{
 controls.lock();
});

controls.addEventListener("lock",()=>{
 start.style.display="none";
});

controls.addEventListener("unlock",()=>{
 start.style.display="";
});

/* ===== 入力 ===== */

const keys = {};

document.addEventListener("keydown",e=>{
 keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup",e=>{
 keys[e.key.toLowerCase()] = false;
});

/* ===== 移動 ===== */

const velocity = new THREE.Vector3();
const speed = 10;

const clock = new THREE.Clock();

function update(delta){

 velocity.x = 0;
 velocity.z = 0;

 if(keys["w"]) velocity.z -= speed;
 if(keys["s"]) velocity.z += speed;
 if(keys["a"]) velocity.x -= speed;
 if(keys["d"]) velocity.x += speed;

 controls.moveRight(velocity.x * delta);
 controls.moveForward(velocity.z * delta);

}

/* ===== ループ ===== */

function animate(){

 requestAnimationFrame(animate);

 const delta = clock.getDelta();

 update(delta);

 renderer.render(scene,camera);

}

animate();

/* ===== リサイズ ===== */

window.addEventListener("resize",()=>{

 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();

 renderer.setSize(window.innerWidth,window.innerHeight);

});
