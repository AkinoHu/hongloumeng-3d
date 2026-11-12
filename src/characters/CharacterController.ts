/**
 * 角色控制器 - 管理角色移动、动画、战斗状态
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { InputManager } from '../core/InputManager';

export type CharacterState = 'idle' | 'walk' | 'run' | 'attack1' | 'attack2' | 'attack3' | 'dodge' | 'block' | 'hit' | 'death';

export interface CharacterStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  moveSpeed: number;
  attackPower: number;
}

export class CharacterController {
  id: string;
  mesh: THREE.Group;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;

  stats: CharacterStats;
  state: CharacterState = 'idle';
  stateTime: number = 0;

  // Movement
  moveSpeed: number = 6;
  rotationSpeed: number = 10;

  // Combat
  comboIndex: number = 0;
  comboWindow: number = 0.5;
  timeSinceLastAttack: number = 0;

  // Collision
  radius: number = 0.5;
  height: number = 1.8;

  // Animation (程序化)
  animationMixer: THREE.AnimationMixer | null = null;

  constructor(
    id: string,
    startPosition: THREE.Vector3,
    scene: THREE.Scene,
    loadingManager: THREE.LoadingManager
  ) {
    this.id = id;
    this.position = startPosition.clone();
    this.rotation = new THREE.Euler(0, 0, 0);
    this.velocity = new THREE.Vector3();

    // Create placeholder mesh
    this.mesh = this.createPlaceholderMesh();
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);

    // Stats
    this.stats = {
      health: 1000,
      maxHealth: 1000,
      stamina: 100,
      maxStamina: 100,
      moveSpeed: 6,
      attackPower: 30,
    };
  }

  createPlaceholderMesh(): THREE.Group {
    const group = new THREE.Group();

    // Body (capsule approximation)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4ade80 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffd93d });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.75;
    head.castShadow = true;
    group.add(head);

    // Weapon (sword placeholder)
    const swordGeometry = new THREE.BoxGeometry(0.05, 1.2, 0.1);
    const swordMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
    const sword = new THREE.Mesh(swordGeometry, swordMaterial);
    sword.position.set(0.5, 1.0, 0);
    sword.rotation.z = Math.PI / 4;
    sword.castShadow = true;
    group.add(sword);

    return group;
  }

  async load() {
    // TODO: Load actual 3D model with GLTFLoader
    // For now, using placeholder
    console.log(`[角色] ${this.id} 使用占位模型`);
  }

  update(deltaTime: number, input: InputManager) {
    this.stateTime += deltaTime;
    this.timeSinceLastAttack += deltaTime;

    // Regenerate stamina
    if (this.stats.stamina < this.stats.maxStamina) {
      this.stats.stamina = Math.min(
        this.stats.maxStamina,
        this.stats.stamina + deltaTime * 20
      );
    }

    // State machine
    switch (this.state) {
      case 'idle':
      case 'walk':
        this.updateMovement(deltaTime, input);
        this.handleCombatInput(input);
        break;
      case 'attack1':
      case 'attack2':
      case 'attack3':
        this.updateAttack(deltaTime);
        break;
      case 'dodge':
        this.updateDodge(deltaTime);
        break;
      case 'block':
        this.updateBlock(deltaTime, input);
        break;
    }

    // Apply velocity
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.velocity.multiplyScalar(0.9); // Damping

    // Update mesh transform
    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
  }

  updateMovement(deltaTime: number, input: InputManager) {
    const moveInput = input.getMovementInput();

    if (moveInput.x !== 0 || moveInput.y !== 0) {
      // Calculate movement direction in world space
      const forward = new THREE.Vector3(0, 0, -1);
      const right = new THREE.Vector3(1, 0, 0);

      const moveDir = forward
        .multiplyScalar(moveInput.y)
        .add(right.multiplyScalar(moveInput.x))
        .normalize();

      // Apply movement
      this.velocity.x = moveDir.x * this.stats.moveSpeed;
      this.velocity.z = moveDir.z * this.stats.moveSpeed;

      // Rotate towards movement direction
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      const currentAngle = this.rotation.y;
      const angleDiff = targetAngle - currentAngle;
      const shortestAngle = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

      this.rotation.y += shortestAngle * this.rotationSpeed * deltaTime;

      this.state = 'walk';
    } else {
      this.state = 'idle';
    }
  }

  handleCombatInput(input: InputManager) {
    // Attack
    if (input.isMouseButtonPressed(0)) {
      this.startAttack();
    }

    // Dodge
    if (input.isKeyPressed('ShiftLeft') || input.isKeyPressed('ShiftRight')) {
      if (this.stats.stamina >= 30) {
        this.startDodge();
      }
    }

    // Block
    if (input.isKeyPressed('Space')) {
      this.startBlock();
    }

    // Skills
    if (input.isKeyPressed('KeyQ')) {
      this.useSkill('ultimate');
    }

    if (input.isKeyPressed('KeyE')) {
      this.useSkill('heavy');
    }
  }

  startAttack() {
    // Combo system
    if (this.timeSinceLastAttack < this.comboWindow && this.comboIndex < 3) {
      this.comboIndex++;
    } else {
      this.comboIndex = 1;
    }

    this.state = `attack${this.comboIndex}` as CharacterState;
    this.stateTime = 0;
    this.timeSinceLastAttack = 0;

    console.log(`[攻击] ${this.id} 第${this.comboIndex}段攻击`);
  }

  updateAttack(deltaTime: number) {
    const attackDuration = 0.4;

    if (this.stateTime >= attackDuration) {
      this.state = 'idle';
    }
  }

  startDodge() {
    if (this.state === 'dodge') return;

    this.state = 'dodge';
    this.stateTime = 0;
    this.stats.stamina -= 30;

    // Dodge direction based on current facing
    const dodgeDir = new THREE.Vector3(0, 0, -1);
    dodgeDir.applyEuler(this.rotation);
    this.velocity.copy(dodgeDir.multiplyScalar(10));

    console.log(`[闪避] ${this.id} 翻滚`);
  }

  updateDodge(deltaTime: number) {
    const dodgeDuration = 0.5;

    if (this.stateTime >= dodgeDuration) {
      this.state = 'idle';
    }
  }

  startBlock() {
    if (this.state !== 'block') {
      this.state = 'block';
      this.stateTime = 0;
      console.log(`[格挡] ${this.id} 举盾`);
    }
  }

  updateBlock(deltaTime: number, input: InputManager) {
    // Drain stamina while blocking
    this.stats.stamina -= deltaTime * 15;

    if (this.stats.stamina <= 0 || !input.isKeyPressed('Space')) {
      this.state = 'idle';
    }
  }

  useSkill(skillId: string) {
    console.log(`[技能] ${this.id} 使用 ${skillId}`);
    // TODO: Implement skills
  }

  takeDamage(amount: number) {
    this.stats.health = Math.max(0, this.stats.health - amount);
    console.log(`[受伤] ${this.id} 剩余生命: ${this.stats.health}/${this.stats.maxHealth}`);

    if (this.stats.health <= 0) {
      this.state = 'death';
    }
  }

  isInvincible(): boolean {
    // Invincible during dodge (i-frames)
    return this.state === 'dodge' && this.stateTime < 0.5;
  }

  getForwardDirection(): THREE.Vector3 {
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyEuler(this.rotation);
    return forward;
  }
}
