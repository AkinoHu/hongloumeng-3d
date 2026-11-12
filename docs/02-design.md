# 红楼梦3D动作游戏 - 详细设计文档

## 角色设计

### 主角：林黛玉

**外观设定：**
- 年龄：16-18岁
- 身高：约160cm
- 服装：淡青色古装长裙，腰间玉佩
- 发型：长发半束，簪花
- 武器：细长的青锋剑（剑身带有诗词刻纹）

**战斗风格：**
- 轻盈灵动，速度快
- 攻击范围中等（剑长约1米）
- 擅长连击和闪避

**技能树：**
1. **普通攻击（三段连招）**
   - 第一击：横斩（0.3秒，伤害20）
   - 第二击：上撩（0.35秒，伤害25）
   - 第三击：旋斩（0.5秒，伤害40，击退2米）

2. **重攻击：蓄力剑气斩**
   - 蓄力：1秒
   - 释放：扇形剑气，范围120度，距离5米
   - 伤害：80
   - 冷却：5秒

3. **闪避：翩然回旋**
   - 翻滚距离：3米
   - 无敌帧：0.5秒
   - 冷却：2秒

4. **格挡：剑盾**
   - 持续：最多2秒
   - 成功格挡：进入弹反窗口（1秒）
   - 弹反伤害加成：+50%

5. **必杀技：落英神剑**
   - 释放：向前突进5米，剑气爆发
   - 范围：半径4米的圆形AOE
   - 伤害：150
   - 冷却：30秒

**属性：**
- 生命值：1000
- 移动速度：6m/s
- 攻击速度：1.2倍
- 防御力：中等

### Boss：薛宝钗（幻境形态）

**外观设定：**
- 华丽的金色古装
- 手持宝扇（战斗武器）
- 周围环绕淡金色气场

**战斗模式：**

**Phase 1（血量100%-50%）：**
- 扇击连击（三段）
- 金钗投掷（远程攻击）
- 旋风斩（360度AOE）

**Phase 2（血量50%-0%）：**
- 增加召唤护卫
- 扇形气波（无法格挡，必须闪避）
- 飞行突袭

**属性：**
- 生命值：3000
- 移动速度：5m/s
- 攻击力：40-80
- 防御力：高

### 敌人：幻影（小怪）

**类型一：近战幻影**
- 生命值：200
- 武器：单刀
- 攻击模式：冲刺斩、横扫

**类型二：远程幻影**
- 生命值：150
- 武器：弓箭
- 攻击模式：蓄力箭、连射

**类型三：重型幻影**
- 生命值：300
- 武器：重锤
- 攻击模式：下砸、震地波

## 场景设计

### 怡红院广场

**布局：**
```
          北
          ↑
    ┌─────────────┐
西 ←│  假山  回廊  │→ 东
    │  　　　　　  │
    │  花树  池塘  │
    └─────────────┘
          ↓
          南
```

**尺寸：**30m x 30m

**主要元素：**
1. **中央战斗区**（15m直径圆形空地）
   - 石板地面
   - 无障碍物
   - 主要战斗发生地

2. **假山群**（3组）
   - 位置：西北、东北、南侧
   - 高度：2-3米
   - 可作为掩体和视线阻挡

3. **回廊**（4段）
   - 红色木柱，灰色瓦顶
   - 形成外围框架
   - 玩家可穿过但敌人会绕行

4. **花树**（6棵）
   - 桃花、海棠、垂柳
   - 装饰性，无碰撞
   - 增加视觉丰富度

5. **小池塘**（1个）
   - 东南角
   - 有小桥跨越
   - 水面反射效果

**光照：**
- 主光源：黄昏斜阳（暖色调）
- 点光源：回廊灯笼（橙色）
- 环境光：淡蓝色天光

**氛围：**
- 古典园林美学
- 战斗时花瓣飘落
- 雾气弥漫

## 战斗系统设计

### 攻击归位（Homing）

**触发条件：**
- 轻攻击时
- 前方120度锥形范围内
- 3米内有可攻击目标

**行为：**
- 自动调整朝向（插值旋转，0.1秒）
- 向目标滑动（最多1.5米）
- 保持流畅不突兀

**代码伪逻辑：**
```typescript
function attackHoming(player, enemies) {
  const target = findNearestInCone(player, enemies, 3, 120);
  if (target) {
    const toTarget = target.position - player.position;
    const targetAngle = Math.atan2(toTarget.x, toTarget.z);
    player.rotation.y = lerp(player.rotation.y, targetAngle, 0.3);
    
    const distance = toTarget.length();
    if (distance > attackRange && distance < 3) {
      player.position += toTarget.normalize() * min(1.5, distance - attackRange);
    }
  }
}
```

### 击中反馈

**顿帧：**
- 目标暂停：0.1秒
- 攻击者不受影响
- 实现：`enemy.timeScale = 0` 然后恢复

**击退：**
- 轻攻击：0.5米
- 重攻击：2米
- Boss第三段：3米
- 方向：攻击者朝向

**特效：**
- 火花粒子（击中点）
- 屏幕震动（2-5像素）
- 剑光残影

### 连招系统

**状态机：**
```
Idle ──Attack1──> Attack1State
         ↓
    [0.5s窗口]
         ↓
     Attack2──> Attack2State
         ↓
    [0.5s窗口]
         ↓
     Attack3──> Attack3State ──完成──> Idle
         ↓
      [取消]
         ↓
      Dodge ──> DodgeState ──> Idle
```

**输入缓冲：**
- 受击硬直期间的输入会被记录
- 硬直结束后立即执行
- 缓冲时间：0.3秒

### 格挡与弹反

**格挡机制：**
- 按住Shift键
- 消耗精力（每秒20点，共100点）
- 成功格挡：精力消耗减半

**弹反窗口：**
- 触发：格挡成功后
- 持续：1秒
- 标识：角色周围金色光环
- 效果：下一次攻击伤害+50%，带击飞

**完美弹反：**
- 时机：敌人攻击前0.2秒内按格挡
- 效果：敌人硬直2秒，精力不消耗

## 敌人AI设计

### 行为状态机

```
Idle ──发现玩家──> Approach
  ↑                    ↓
  └────失去目标───────┤
                       ↓
                 [距离判断]
                       ↓
            ┌──近战范围──┬──远程范围──┐
            ↓           ↓            ↓
        MeleeAttack  RangedAttack  Retreat
            ↓           ↓            ↓
        [冷却]      [冷却]       [重新接近]
            ↓           ↓            ↓
          Idle        Idle         Approach
```

### 协同攻击

**包围逻辑：**
- 计算玩家周围8个方位点（360度均分）
- 每个敌人占据一个方位
- 保持距离：3-5米

**轮流攻击：**
- 同时只有1个近战敌人进攻
- 其他敌人：
  - 保持包围圈
  - 左右移动
  - 举盾待命

**攻击时机：**
- 当前攻击者完成攻击后
- 延迟0.5-1秒
- 下一个敌人发起攻击

### Boss战设计

**Phase转换：**
- 血量50%：播放转换动画（3秒无敌）
- 召唤2个近战护卫
- 攻击速度+30%

**特殊攻击模式：**
1. **金钗雨**
   - 蓄力：1秒
   - 效果：从天空降下12根金钗
   - 范围：全场随机点
   - 躲避：观察地面红圈

2. **旋风斩**
   - 蓄力：0.5秒
   - 效果：360度旋转，范围5米
   - 伤害：80
   - 躲避：后退或闪避

3. **飞行突袭**（Phase 2）
   - 飞到空中（2秒）
   - 俯冲攻击玩家位置
   - 伤害：100
   - 躲避：闪避

## 技术实现

### 项目结构（Three.js）

```typescript
// src/main.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CharacterController } from './characters/CharacterController';
import { CombatSystem } from './combat/CombatSystem';
import { InputManager } from './core/InputManager';

class Game {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  player: CharacterController;
  
  init() {
    this.setupScene();
    this.loadAssets();
    this.setupInput();
    this.startGameLoop();
  }
  
  update(deltaTime: number) {
    this.player.update(deltaTime);
    this.combatSystem.update(deltaTime);
    this.updateCamera();
  }
}
```

### 角色控制器

```typescript
class CharacterController {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  state: 'idle' | 'walk' | 'attack' | 'dodge';
  
  moveSpeed: number = 6;
  
  update(deltaTime: number) {
    this.handleInput();
    this.updatePhysics(deltaTime);
    this.updateAnimation(deltaTime);
  }
  
  attack(comboIndex: number) {
    this.state = 'attack';
    this.playAnimation(`attack${comboIndex}`);
    this.attackHitbox.enable();
  }
}
```

### 碰撞检测（胶囊体）

```typescript
class CapsuleCollider {
  center: THREE.Vector3;
  radius: number;
  height: number;
  
  checkCollision(other: CapsuleCollider): boolean {
    const dist = this.center.distanceTo(other.center);
    return dist < (this.radius + other.radius);
  }
  
  resolveCollision(other: CapsuleCollider) {
    const dir = this.center.clone().sub(other.center).normalize();
    const overlap = (this.radius + other.radius) - this.center.distanceTo(other.center);
    this.center.add(dir.multiplyScalar(overlap * 0.5));
    other.center.sub(dir.multiplyScalar(overlap * 0.5));
  }
}
```

### 相机系统（Leash）

```typescript
class CameraController {
  target: THREE.Object3D; // 玩家
  camera: THREE.Camera;
  offset: THREE.Vector3 = new THREE.Vector3(0, 15, 15);
  leashDistance: number = 4;
  
  update() {
    const desiredPos = this.target.position.clone().add(this.offset);
    const currentPos = this.camera.position;
    const dist = desiredPos.distanceTo(currentPos);
    
    if (dist > this.leashDistance) {
      const dir = desiredPos.clone().sub(currentPos).normalize();
      const pullAmount = dist - this.leashDistance;
      this.camera.position.add(dir.multiplyScalar(pullAmount));
    }
    
    this.camera.lookAt(this.target.position);
  }
}
```

## UI设计

### HUD布局

```
┌────────────────────────────┐
│ [生命] ████████░░ 800/1000 │
│ [精力] ██████████ 100/100  │
│                            │
│                            │
│          [游戏画面]          │
│                            │
│                            │
│         技能图标            │
│  [Q]落英  [E]剑气   30s    │
└────────────────────────────┘
```

### 血条实现

```typescript
function drawHealthBar(ctx, current, max, x, y, width, height) {
  // 背景
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(x, y, width, height);
  
  // 损失延迟（黄色）
  ctx.fillStyle = '#d4a82a';
  ctx.fillRect(x, y, width * (lastHealth / max), height);
  
  // 当前血量（红色到绿色渐变）
  const ratio = current / max;
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  if (ratio > 0.5) {
    gradient.addColorStop(0, '#4ade80');
    gradient.addColorStop(1, '#22c55e');
  } else {
    gradient.addColorStop(0, '#ef4444');
    gradient.addColorStop(1, '#dc2626');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width * ratio, height);
  
  // 描边
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}
```

## 下一步：素材生成

准备生成的资产：

### 角色模型提示词

**林黛玉：**
```
一位16岁的中国古代女子，身穿淡青色长裙，长发半束，头戴珠花，腰间系玉佩，手持细长青锋剑，身材修长优雅，面容清秀，气质飘逸。
全身立绘，正面站姿，3/4视角，干净的浅灰色背景，无阴影。
风格：中国古典美学，写实但略带仙侠风格。
```

**薛宝钗（Boss形态）：**
```
一位18岁的中国古代女子，身穿华丽金色刺绣长袍，发髻高耸，头戴凤冠，手持金色宝扇，周身环绕淡金色光芒。
全身立绘，威严站姿，正面视角，浅灰色背景，无阴影。
风格：华贵大气，略带神秘感。
```

**幻影小怪：**
```
半透明的人形轮廓，黑色朦胧外形，手持单刀/弓箭/重锤（三个变体）。
简化人形，无五官细节，全身视图，灰色背景。
```

### 场景道具提示词

后续详细列出...