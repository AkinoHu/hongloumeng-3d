/**
 * 战斗系统 - 碰撞检测、击中判定、伤害计算
 */

import * as THREE from 'three';
import type { CharacterController } from '../characters/CharacterController';

export class CombatSystem {
  characters: CharacterController[] = [];
  hitboxes: Map<string, THREE.Box3> = new Map();

  constructor() {}

  registerCharacter(character: CharacterController) {
    this.characters.push(character);
  }

  update(deltaTime: number) {
    // Update character states
    for (const char of this.characters) {
      // Check for attacks
      if (char.state.startsWith('attack')) {
        this.checkAttackHits(char);
      }
    }

    // Check collisions
    this.resolveCollisions();
  }

  checkAttackHits(attacker: CharacterController) {
    // Simple hitbox detection
    const attackRange = 1.5;
    const attackAngle = 90; // degrees

    const attackDir = attacker.getForwardDirection();

    for (const target of this.characters) {
      if (target === attacker) continue;
      if (target.stats.health <= 0) continue;
      if (target.isInvincible()) continue;

      // Distance check
      const toTarget = target.position.clone().sub(attacker.position);
      const distance = toTarget.length();

      if (distance > attackRange) continue;

      // Angle check (cone)
      const angle = Math.acos(
        attackDir.dot(toTarget.normalize())
      ) * (180 / Math.PI);

      if (angle > attackAngle / 2) continue;

      // Hit!
      this.applyHit(attacker, target);
    }
  }

  applyHit(attacker: CharacterController, target: CharacterController) {
    // Calculate damage
    let damage = attacker.stats.attackPower;

    // Combo multiplier
    if (attacker.comboIndex === 3) {
      damage *= 1.5;
    }

    // Apply damage
    target.takeDamage(damage);

    // Apply hitstun (freeze target briefly)
    this.applyHitstun(target, 0.1);

    // Apply knockback
    this.applyKnockback(attacker, target);

    console.log(`[击中] ${attacker.id} 对 ${target.id} 造成 ${damage} 伤害`);
  }

  applyHitstun(target: CharacterController, duration: number) {
    // TODO: Implement timeScale or animation pause
    // For now, just log
    console.log(`[顿帧] ${target.id} 顿帧 ${duration}秒`);
  }

  applyKnockback(attacker: CharacterController, target: CharacterController) {
    const knockbackForce = attacker.comboIndex === 3 ? 5 : 2;
    const direction = target.position.clone().sub(attacker.position).normalize();
    direction.y = 0;

    target.velocity.add(direction.multiplyScalar(knockbackForce));
  }

  resolveCollisions() {
    // Body collision between characters
    for (let i = 0; i < this.characters.length; i++) {
      const charA = this.characters[i];
      if (charA.isInvincible()) continue;

      for (let j = i + 1; j < this.characters.length; j++) {
        const charB = this.characters[j];
        if (charB.isInvincible()) continue;

        // Simple capsule collision
        const distance = charA.position.distanceTo(charB.position);
        const minDistance = charA.radius + charB.radius;

        if (distance < minDistance) {
          // Push apart
          const direction = charB.position.clone().sub(charA.position).normalize();
          direction.y = 0;

          const overlap = minDistance - distance;
          charA.position.sub(direction.clone().multiplyScalar(overlap * 0.5));
          charB.position.add(direction.clone().multiplyScalar(overlap * 0.5));
        }
      }
    }
  }

  attackHoming(attacker: CharacterController, maxDistance: number = 3) {
    // Find nearest target in front
    let nearestTarget: CharacterController | null = null;
    let nearestDistance = Infinity;

    const attackDir = attacker.getForwardDirection();

    for (const target of this.characters) {
      if (target === attacker) continue;
      if (target.stats.health <= 0) continue;

      const toTarget = target.position.clone().sub(attacker.position);
      const distance = toTarget.length();

      if (distance > maxDistance) continue;

      // In front cone (120 degrees)
      const angle = Math.acos(
        attackDir.dot(toTarget.normalize())
      ) * (180 / Math.PI);

      if (angle > 60) continue;

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = target;
      }
    }

    if (nearestTarget) {
      // Rotate towards target
      const toTarget = nearestTarget.position.clone().sub(attacker.position);
      const targetAngle = Math.atan2(toTarget.x, toTarget.z);

      attacker.rotation.y = THREE.MathUtils.lerp(
        attacker.rotation.y,
        targetAngle,
        0.3
      );

      // Slide towards target
      if (nearestDistance > 1.5) {
        const slideDistance = Math.min(1.5, nearestDistance - 1.0);
        const slideDir = toTarget.normalize();
        slideDir.y = 0;

        attacker.position.add(slideDir.multiplyScalar(slideDistance));
      }

      console.log(`[归位] ${attacker.id} 自动归位到 ${nearestTarget.id}`);
    }
  }
}
