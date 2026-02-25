import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js'; 
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

// ===== シーン =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
 
// ===== カメラ =====
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 1.6, 5);
const controls = new PointerLockControls(camera, document.body);

document.addEventListener("click", () => {
 controls.lock();
});
// ===== レンダラー =====
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
 
// ===== 光 =====
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 30, 10);
scene.add(light);
 
// ===== 地面 100×100 =====
const worldSize = 100;
 
for (let x = 0; x < worldSize; x++) {
  for (let z = 0; z < worldSize; z++) {
 
    const tileGeo = new THREE.BoxGeometry(1, 0.1, 1);
    const tileMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const tile = new THREE.Mesh(tileGeo, tileMat);
    tile.position.set(x, 0, z);
    scene.add(tile);
 
    // 草
    if (Math.random() < 0.25) {
      const grassGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
      const grassMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
      const grass = new THREE.Mesh(grassGeo, grassMat);
      grass.position.set(x, 0.35, z);
      scene.add(grass);
    }
  }
}
 
// ===== プレイヤー 　　一旦FPS完成後検討=====　
 
// ===== 入力 =====
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
 
// ===== 更新 =====
function updatePlayer() {

 let speed = 0.15;
 if (keys["Shift"]) speed = 0.3;

 const direction = new THREE.Vector3();
 camera.getWorldDirection(direction);
 direction.y = 0;
 direction.normalize();

 const right = new THREE.Vector3();
 right.crossVectors(direction, camera.up);

 if (keys["w"]) camera.position.addScaledVector(direction, speed);
 if (keys["a"]) camera.position.addScaledVector(right, -speed);
 if (keys["s"]) camera.position.addScaledVector(direction, -speed);
 if (keys["d"]) camera.position.addScaledVector(right, speed);
 }
 
// ===== ループ =====
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene, camera);
}
 
animate();
 
// ===== リサイズ対応 =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
