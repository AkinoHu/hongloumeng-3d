/**
 * 红楼梦3D动作游戏 - 主入口
 * Dream of the Red Chamber 3D Action Game
 */

import * as THREE from 'three';
import { Game } from './core/Game';

// Loading manager
const loadingEl = document.getElementById('loading')!;
const progressEl = document.getElementById('progress')!;
const hudEl = document.getElementById('hud')!;

const manager = new THREE.LoadingManager();

manager.onProgress = (url, loaded, total) => {
  const progress = (loaded / total) * 100;
  progressEl.style.width = `${progress}%`;
};

manager.onLoad = () => {
  console.log('[加载] 所有资源加载完成');
  setTimeout(() => {
    loadingEl.classList.add('hidden');
    hudEl.style.display = 'block';
  }, 500);
};

manager.onError = (url) => {
  console.error('[加载错误]', url);
};

// Initialize game
const game = new Game(manager);
game.init();

// Debug
(window as any).__game = game;
