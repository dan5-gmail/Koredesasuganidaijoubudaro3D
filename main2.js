import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

/* ===== 基本 ===== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

/* ===== 地面（揺れが見えやすい巨大グリッド）===== */

const grid = new THREE.GridHelper(200, 50);
scene.add(grid);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshBasicMaterial({ color: 0x228B22, wireframe: false })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ===== FPS ===== */

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());
document.addEventListener("click", () => controls.lock());

const player = controls.getObject();
player.position.set(0, 1.6, 5);

/* ===== ⭐ 超重要：pitch取得 ===== */

const pitchObject = camera.parent;

console.log("pitchObject:", pitchObject);

/* ===== 強制揺れフラグ ===== */

const FORCE_TEST = true;

/* ===== ループ ===== */

function animate() {
  requestAnimationFrame(animate);

  if (FORCE_TEST) {
    // ← 真実を暴く強制上下運動（超デカい）
    pitchObject.position.y = Math.sin(performance.now() * 0.005) * 5;
  }

  renderer.render(scene, camera);
}

animate();

/* ===== リサイズ ===== */

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
