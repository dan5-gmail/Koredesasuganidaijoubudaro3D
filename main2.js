import * as THREE from "three";

/*========================
   基本セットアップ
========================*/

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

/*========================
   プレイヤー構造
========================*/

// 横回転用
const yawObject = new THREE.Object3D();
yawObject.position.y = 1.6;
scene.add(yawObject);

// 縦回転用
const pitchObject = new THREE.Object3D();
pitchObject.add(camera);
yawObject.add(pitchObject);

/*========================
   ライト
========================*/

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

/*========================
   地面
========================*/

for (let x = 0; x < 50; x++) {
  for (let z = 0; z < 50; z++) {
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ color: 0x228B22 })
    );
    tile.position.set(x, -0.5, z);
    scene.add(tile);
  }
}

/*========================
   入力
========================*/

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/*========================
   マウス回転（PC）
========================*/

let yaw = 0;
let pitch = 0;
const sensitivity = 0.002;

document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * sensitivity;
    pitch -= e.movementY * sensitivity;

    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    yawObject.rotation.y = yaw;
    pitchObject.rotation.x = pitch;
  }
});

/*========================
   タッチ回転（モバイル）
========================*/

let touchX = 0;
let touchY = 0;

document.addEventListener("touchstart", (e) => {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
});

document.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];

  const deltaX = touch.clientX - touchX;
  const deltaY = touch.clientY - touchY;

  touchX = touch.clientX;
  touchY = touch.clientY;

  yaw -= deltaX * sensitivity;
  pitch -= deltaY * sensitivity;

  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

  yawObject.rotation.y = yaw;
  pitchObject.rotation.x = pitch;
});

/*========================
   物理
========================*/

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const moveSpeed = 8;
const gravity = -20;
const jumpPower = 8;

let onGround = true;
const eyeHeight = 1.6;

const clock = new THREE.Clock();

function update(delta) {

  direction.set(0, 0, 0);

  if (keys["w"]) direction.z -= 1;
  if (keys["s"]) direction.z += 1;
  if (keys["a"]) direction.x -= 1;
  if (keys["d"]) direction.x += 1;

  direction.normalize();

  // 前方向ベクトル取得
  const forward = new THREE.Vector3();
  yawObject.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0,1,0)).normalize();

  yawObject.position.addScaledVector(forward, direction.z * moveSpeed * delta);
  yawObject.position.addScaledVector(right, direction.x * moveSpeed * delta);

  /* 重力 */
  velocity.y += gravity * delta;
  yawObject.position.y += velocity.y * delta;

  if (yawObject.position.y <= eyeHeight) {
    velocity.y = 0;
    yawObject.position.y = eyeHeight;
    onGround = true;
  }

  if (keys[" "] && onGround) {
    velocity.y = jumpPower;
    onGround = false;
  }
}

/*========================
   ループ
========================*/

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  update(delta);
  renderer.render(scene, camera);
}

animate();

/*========================
   リサイズ
========================*/

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
