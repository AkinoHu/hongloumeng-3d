/**
 * 相机控制器 - 实现leash跟随机制
 */

import * as THREE from 'three';

export class CameraController {
  camera: THREE.PerspectiveCamera;
  target: THREE.Object3D | null = null;

  offset: THREE.Vector3 = new THREE.Vector3(0, 15, 15);
  leashDistance: number = 4;
  smoothing: number = 5;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  setTarget(target: THREE.Object3D) {
    this.target = target;
  }

  update(deltaTime: number) {
    if (!this.target) return;

    // Desired camera position
    const desiredPos = this.target.position.clone().add(this.offset);
    const currentPos = this.camera.position;

    // Calculate distance
    const dist = desiredPos.distanceTo(currentPos);

    // Leash: only pull if beyond distance
    if (dist > this.leashDistance) {
      const dir = desiredPos.clone().sub(currentPos).normalize();
      const pullAmount = dist - this.leashDistance;
      const moveAmount = Math.min(pullAmount, this.smoothing * deltaTime * dist);
      this.camera.position.add(dir.multiplyScalar(moveAmount));
    }

    // Look at target
    const lookAtPos = this.target.position.clone();
    lookAtPos.y += 1.5; // Look at chest height
    this.camera.lookAt(lookAtPos);
  }
}
