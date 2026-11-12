/**
 * 输入管理器 - 处理键盘和鼠标输入
 */

export class InputManager {
  keys: Map<string, boolean> = new Map();
  mouseButtons: Map<number, boolean> = new Map();
  mouseDelta: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Prevent context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  onKeyDown(e: KeyboardEvent) {
    this.keys.set(e.code, true);
  }

  onKeyUp(e: KeyboardEvent) {
    this.keys.set(e.code, false);
  }

  onMouseDown(e: MouseEvent) {
    this.mouseButtons.set(e.button, true);
  }

  onMouseUp(e: MouseEvent) {
    this.mouseButtons.set(e.button, false);
  }

  onMouseMove(e: MouseEvent) {
    this.mouseDelta.x = e.movementX;
    this.mouseDelta.y = e.movementY;
  }

  isKeyPressed(code: string): boolean {
    return this.keys.get(code) === true;
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.get(button) === true;
  }

  getMovementInput(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) y += 1;
    if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) y -= 1;
    if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) x -= 1;
    if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) x += 1;

    // Normalize
    const length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  resetMouseDelta() {
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }
}
