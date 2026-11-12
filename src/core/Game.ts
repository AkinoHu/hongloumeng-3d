/**
 * 游戏核心类 - 管理场景、渲染、更新循环
 */

import * as THREE from 'three';
import { CharacterController } from '../characters/CharacterController';
import { InputManager } from './InputManager';
import { CameraController } from './CameraController';
import { CombatSystem } from '../combat/CombatSystem';
import { SceneManager } from '../scene/SceneManager';
import { UIManager } from '../ui/UIManager';

export class Game {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;

  player: CharacterController | null = null;
  inputManager: InputManager;
  cameraController: CameraController;
  combatSystem: CombatSystem;
  sceneManager: SceneManager;
  uiManager: UIManager;

  loadingManager: THREE.LoadingManager;

  constructor(loadingManager: THREE.LoadingManager) {
    this.loadingManager = loadingManager;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0xcccccc, 50, 100);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 15, 15);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    document.querySelector('#app')!.appendChild(this.renderer.domElement);

    // Clock
    this.clock = new THREE.Clock();

    // Systems
    this.inputManager = new InputManager();
    this.cameraController = new CameraController(this.camera);
    this.combatSystem = new CombatSystem();
    this.sceneManager = new SceneManager(this.scene, this.loadingManager);
    this.uiManager = new UIManager();

    // Window resize
    window.addEventListener('resize', () => this.onResize());
  }

  async init() {
    console.log('[游戏] 初始化中...');

    // Setup scene
    await this.sceneManager.loadScene('yihongyuan');

    // Create player
    this.player = new CharacterController(
      'daiyu',
      new THREE.Vector3(0, 0, 0),
      this.scene,
      this.loadingManager
    );

    await this.player.load();
    this.cameraController.setTarget(this.player.mesh);

    // Start game loop
    this.animate();

    console.log('[游戏] 初始化完成');
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    this.render();
  }

  update(deltaTime: number) {
    // Cap delta time to avoid large jumps
    const dt = Math.min(deltaTime, 0.1);

    // Update systems
    if (this.player) {
      this.player.update(dt, this.inputManager);
    }

    this.combatSystem.update(dt);
    this.cameraController.update(dt);
    this.uiManager.update(this.player);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
