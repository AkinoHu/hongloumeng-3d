/**
 * 场景管理器 - 加载和管理游戏场景
 */

import * as THREE from 'three';

export class SceneManager {
  scene: THREE.Scene;
  loadingManager: THREE.LoadingManager;
  ground: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene, loadingManager: THREE.LoadingManager) {
    this.scene = scene;
    this.loadingManager = loadingManager;
  }

  async loadScene(sceneId: string) {
    console.log(`[场景] 加载场景: ${sceneId}`);

    // Setup lighting
    this.setupLighting();

    // Create ground
    this.createGround();

    // Create environment
    this.createEnvironment(sceneId);

    console.log(`[场景] ${sceneId} 加载完成`);
  }

  setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    // Directional light (sun)
    const sun = new THREE.DirectionalLight(0xfff4e6, 1.0);
    sun.position.set(20, 30, 10);
    sun.castShadow = true;

    // Shadow camera
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 100;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    this.scene.add(sun);

    // Hemisphere light (sky/ground)
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.3);
    this.scene.add(hemi);

    console.log('[光照] 设置完成');
  }

  createGround() {
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4c5a9,
      roughness: 0.8,
      metalness: 0.2,
    });

    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Ground grid (optional, for debugging)
    const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0xcccccc);
    gridHelper.position.y = 0.01;
    // this.scene.add(gridHelper);
  }

  createEnvironment(sceneId: string) {
    if (sceneId === 'yihongyuan') {
      this.createYihongyuan();
    }
  }

  createYihongyuan() {
    // 假山 (Rocks)
    this.createRock(new THREE.Vector3(-8, 0, -8));
    this.createRock(new THREE.Vector3(10, 0, -10));
    this.createRock(new THREE.Vector3(-6, 0, 12));

    // 回廊柱子 (Pillars)
    this.createPillar(new THREE.Vector3(-12, 0, -12));
    this.createPillar(new THREE.Vector3(-12, 0, 12));
    this.createPillar(new THREE.Vector3(12, 0, -12));
    this.createPillar(new THREE.Vector3(12, 0, 12));

    // 花树 (Trees)
    this.createTree(new THREE.Vector3(-4, 0, -4), 0xffb7c5); // 桃花
    this.createTree(new THREE.Vector3(6, 0, 6), 0xffd1dc);   // 海棠
    this.createTree(new THREE.Vector3(-10, 0, 4), 0xc8e6c9); // 垂柳
    this.createTree(new THREE.Vector3(8, 0, -6), 0xffe4b5);  // 银杏

    console.log('[场景] 怡红院环境创建完成');
  }

  createRock(position: THREE.Vector3) {
    // Simplified rock (placeholder)
    const geometry = new THREE.DodecahedronGeometry(1.5, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.9,
      metalness: 0.1,
    });

    const rock = new THREE.Mesh(geometry, material);
    rock.position.copy(position);
    rock.position.y = 1.5;
    rock.castShadow = true;
    rock.receiveShadow = true;

    // Scale randomly
    rock.scale.set(
      1 + Math.random() * 0.5,
      0.8 + Math.random() * 0.4,
      1 + Math.random() * 0.5
    );

    this.scene.add(rock);
  }

  createPillar(position: THREE.Vector3) {
    // Red wooden pillar
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 12);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b0000,
      roughness: 0.7,
      metalness: 0.1,
    });

    const pillar = new THREE.Mesh(geometry, material);
    pillar.position.copy(position);
    pillar.position.y = 2;
    pillar.castShadow = true;
    pillar.receiveShadow = true;

    this.scene.add(pillar);

    // Capital (top decoration)
    const capGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.8);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.6,
    });

    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.copy(position);
    cap.position.y = 4.15;
    cap.castShadow = true;

    this.scene.add(cap);
  }

  createTree(position: THREE.Vector3, color: number) {
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9,
    });

    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.copy(position);
    trunk.position.y = 1;
    trunk.castShadow = true;

    this.scene.add(trunk);

    // Foliage
    const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
    });

    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.copy(position);
    foliage.position.y = 3;
    foliage.castShadow = true;

    this.scene.add(foliage);
  }
}
