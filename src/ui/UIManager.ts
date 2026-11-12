/**
 * UI管理器 - 更新HUD元素
 */

import type { CharacterController } from '../characters/CharacterController';

export class UIManager {
  healthBar: HTMLElement;
  healthText: HTMLElement;
  staminaBar: HTMLElement;
  staminaText: HTMLElement;

  constructor() {
    this.healthBar = document.getElementById('health')!;
    this.healthText = document.getElementById('health-text')!;
    this.staminaBar = document.getElementById('stamina')!;
    this.staminaText = document.getElementById('stamina-text')!;
  }

  update(player: CharacterController | null) {
    if (!player) return;

    // Update health
    const healthPercent = (player.stats.health / player.stats.maxHealth) * 100;
    this.healthBar.style.width = `${healthPercent}%`;
    this.healthText.textContent = `${Math.floor(player.stats.health)} / ${player.stats.maxHealth}`;

    // Update stamina
    const staminaPercent = (player.stats.stamina / player.stats.maxStamina) * 100;
    this.staminaBar.style.width = `${staminaPercent}%`;
    this.staminaText.textContent = `${Math.floor(player.stats.stamina)} / ${player.stats.maxStamina}`;
  }
}
