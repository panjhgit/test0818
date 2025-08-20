/**
 * 末日Q行 - 抖音小程序游戏
 * 一个生存至100天的挑战游戏
 * 使用ES5语法，完全兼容抖音小程序环境
 */

console.log('=== 末日Q行游戏启动 ===');
console.log('参考文档: https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/introduction');

// === 人物系统集成 ===
// 由于抖音小程序环境限制，直接内联人物系统代码

// 基础人物类
function BaseCharacter(config) {
    this.id = config.id || 1;
    this.name = config.name || '角色' + this.id;
    this.description = config.description || '这是一个神秘的角色';
    this.colors = config.colors || this.getDefaultColors();
    this.features = config.features || this.getDefaultFeatures();
    this.animations = config.animations || this.getDefaultAnimations();
}

BaseCharacter.prototype.getDefaultColors = function() {
    return {
        skin: '#FF8C42', skinHighlight: '#FFB366', skinShadow: '#E6732A',
        clothes: '#FFFFFF', clothesShadow: '#E0E0E0', clothesDetail: '#F0F0F0',
        hair: '#1A1A1A', hairHighlight: '#404040',
        eyes: '#000000', eyesHighlight: '#FFFFFF',
        mouth: '#D4621F', mouthShadow: '#E6732A'
    };
};

BaseCharacter.prototype.getDefaultFeatures = function() {
    return { hasGlasses: true, hairStyle: 'normal', bodyType: 'normal', clothingStyle: 'casual', accessory: 'sunglasses' };
};

BaseCharacter.prototype.getDefaultAnimations = function() {
    return { walkBobAmplitude: 1.5, walkLegSwingAmplitude: 3, walkArmSwingAmplitude: 2, walkSpeed: 200 };
};

BaseCharacter.prototype.calculateAnimationOffsets = function(player) {
    var offsets = { bobOffset: 0, leftLegOffset: 0, rightLegOffset: 0, leftArmOffset: 0, rightArmOffset: 0 };
    if (player.isWalking) {
        offsets.bobOffset = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkBobAmplitude;
        var legSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkLegSwingAmplitude;
        offsets.leftLegOffset = legSwing; offsets.rightLegOffset = -legSwing;
        var armSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkArmSwingAmplitude;
        offsets.leftArmOffset = -armSwing; offsets.rightArmOffset = armSwing;
    }
    return offsets;
};

BaseCharacter.prototype.render = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    y += offsets.bobOffset;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    this.renderBody(ctx, x, y, player); this.renderHead(ctx, x, y, player);
    this.renderArms(ctx, x, y, player); this.renderLegs(ctx, x, y, player);
    ctx.restore();
};

BaseCharacter.prototype.renderBody = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.clothes; ctx.fillRect(x - 10, y - 6, 20, 18);
    ctx.fillStyle = this.colors.clothesShadow; ctx.fillRect(x + 8, y - 4, 2, 14); ctx.fillRect(x - 8, y + 10, 16, 2);
    ctx.fillStyle = this.colors.clothesDetail; ctx.fillRect(x - 6, y - 2, 2, 8); ctx.fillRect(x + 4, y + 2, 2, 6);
};

BaseCharacter.prototype.renderHead = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.skin; ctx.fillRect(x - 10, y - 20, 20, 16);
    ctx.fillStyle = this.colors.skinHighlight; ctx.fillRect(x - 8, y - 18, 4, 4); ctx.fillRect(x + 4, y - 16, 4, 3);
    ctx.fillStyle = this.colors.skinShadow; ctx.fillRect(x + 8, y - 16, 2, 12); ctx.fillRect(x - 6, y - 6, 12, 2);
    this.renderHair(ctx, x, y, player); this.renderFacialFeatures(ctx, x, y, player);
};

BaseCharacter.prototype.renderHair = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(x - 12, y - 28, 24, 12); ctx.fillRect(x - 10, y - 32, 20, 6);
    ctx.fillRect(x - 14, y - 26, 4, 8); ctx.fillRect(x + 10, y - 26, 4, 8);
    ctx.fillRect(x - 8, y - 22, 16, 4); ctx.fillRect(x - 4, y - 24, 8, 2);
    ctx.fillStyle = this.colors.hairHighlight;
    ctx.fillRect(x - 6, y - 30, 3, 2); ctx.fillRect(x + 3, y - 32, 3, 2); ctx.fillRect(x - 2, y - 22, 4, 1);
};

BaseCharacter.prototype.renderFacialFeatures = function(ctx, x, y, player) {
    if (this.features.hasGlasses) this.renderGlasses(ctx, x, y, player);
    else this.renderEyes(ctx, x, y, player);
    this.renderNose(ctx, x, y, player); this.renderMouth(ctx, x, y, player);
};

BaseCharacter.prototype.renderGlasses = function(ctx, x, y, player) {
    ctx.fillStyle = '#000000'; ctx.fillRect(x - 8, y - 18, 16, 6);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 7, y - 17, 6, 4); ctx.fillRect(x + 1, y - 17, 6, 4);
    ctx.fillStyle = '#333333'; ctx.fillRect(x - 6, y - 17, 2, 1); ctx.fillRect(x + 2, y - 17, 2, 1);
    ctx.fillStyle = '#555555'; ctx.fillRect(x - 7, y - 16, 1, 2); ctx.fillRect(x + 6, y - 16, 1, 2);
    ctx.fillStyle = '#000000'; ctx.fillRect(x - 1, y - 17, 2, 2);
    ctx.fillRect(x - 10, y - 17, 2, 1); ctx.fillRect(x + 8, y - 17, 2, 1);
};

BaseCharacter.prototype.renderEyes = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.eyes; ctx.fillRect(x - 6, y - 16, 3, 2); ctx.fillRect(x + 3, y - 16, 3, 2);
    ctx.fillStyle = this.colors.eyesHighlight; ctx.fillRect(x - 5, y - 16, 1, 1); ctx.fillRect(x + 4, y - 16, 1, 1);
};

BaseCharacter.prototype.renderNose = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.skinShadow; ctx.fillRect(x - 1, y - 12, 2, 2);
    ctx.fillStyle = this.colors.skinHighlight; ctx.fillRect(x, y - 13, 1, 1);
};

BaseCharacter.prototype.renderMouth = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.mouth; ctx.fillRect(x - 2, y - 10, 4, 1);
    ctx.fillStyle = this.colors.mouthShadow; ctx.fillRect(x - 1, y - 9, 2, 1);
};

BaseCharacter.prototype.renderArms = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 14, y - 4 + offsets.leftArmOffset, 4, 10); ctx.fillRect(x - 16, y + 4 + offsets.leftArmOffset, 4, 8);
    ctx.fillRect(x + 10, y - 4 + offsets.rightArmOffset, 4, 10); ctx.fillRect(x + 12, y + 4 + offsets.rightArmOffset, 4, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 12, y + 2 + offsets.leftArmOffset, 2, 4); ctx.fillRect(x + 10, y + 2 + offsets.rightArmOffset, 2, 4);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 18, y + 10 + offsets.leftArmOffset, 4, 4); ctx.fillRect(x + 14, y + 10 + offsets.rightArmOffset, 4, 4);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 16, y + 12 + offsets.leftArmOffset, 2, 2); ctx.fillRect(x + 14, y + 12 + offsets.rightArmOffset, 2, 2);
};

BaseCharacter.prototype.renderLegs = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 6, y + 12 + offsets.leftLegOffset, 5, 14); ctx.fillRect(x - 7, y + 24 + offsets.leftLegOffset, 5, 8);
    ctx.fillRect(x + 1, y + 12 + offsets.rightLegOffset, 5, 14); ctx.fillRect(x + 2, y + 24 + offsets.rightLegOffset, 5, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 2, y + 20 + offsets.leftLegOffset, 2, 6); ctx.fillRect(x + 1, y + 20 + offsets.rightLegOffset, 2, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 10, y + 30 + offsets.leftLegOffset, 8, 5); ctx.fillRect(x + 2, y + 30 + offsets.rightLegOffset, 8, 5);
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(x - 8, y + 32 + offsets.leftLegOffset, 4, 2); ctx.fillRect(x + 4, y + 32 + offsets.rightLegOffset, 4, 2);
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(x - 9, y + 30 + offsets.leftLegOffset, 2, 1); ctx.fillRect(x + 7, y + 30 + offsets.rightLegOffset, 2, 1);
};

// === 僵尸系统 ===

// 基础僵尸类
function BaseZombie(config) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.type = config.type || 'thin';
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.health = config.health || 30;
    this.maxHealth = config.maxHealth || 30;
    this.attack = config.attack || 8;
    this.moveSpeed = config.moveSpeed || 1.5;
    this.detectionRange = config.detectionRange || 150;
    this.attackRange = config.attackRange || 25;
    this.size = config.size || 1.2; // 比人物大一点
    
    // AI状态
    this.state = 'wandering'; // wandering, chasing, attacking
    this.target = null;
    this.lastAttackTime = 0;
    this.attackCooldown = config.attackCooldown || 1500; // 攻击冷却时间
    
    // 移动相关
    this.lastX = this.x;
    this.lastY = this.y;
    this.isWalking = false;
    this.direction = 'down';
    this.wanderTarget = null;
    this.wanderTimer = 0;
    
    // 动画相关
    this.walkAnimationFrame = 0;
    this.lastAnimationTime = 0;
    this.walkAnimationSpeed = 300; // 比人物慢一点
}

BaseZombie.prototype.update = function(deltaTime, gameEngine) {
    // 保存gameEngine引用供其他方法使用
    this.gameEngine = gameEngine;
    
    this.updateAI(deltaTime, gameEngine);
    this.updateAnimation(deltaTime);
    this.updateMovement(deltaTime);
};

BaseZombie.prototype.updateAI = function(deltaTime, gameEngine) {
    // 降低AI更新频率以提高性能
    if (!this.aiUpdateTimer) this.aiUpdateTimer = 0;
    this.aiUpdateTimer += deltaTime;
    
    // 每200ms更新一次AI，而不是每帧都更新
    if (this.aiUpdateTimer < 200) return;
    this.aiUpdateTimer = 0;
    
    var currentTime = Date.now();
    
    // 简化目标寻找逻辑，只检查玩家
    var playerDistance = Math.sqrt(
        Math.pow(this.x - gameEngine.player.x, 2) + 
        Math.pow(this.y - gameEngine.player.y, 2)
    );
    
    if (playerDistance <= this.detectionRange && gameEngine.player.health > 0) {
        // 发现玩家，切换到追击状态
        this.state = 'chasing';
        this.target = gameEngine.player;
        
        if (playerDistance <= this.attackRange) {
            // 进入攻击范围
            this.state = 'attacking';
            
            // 攻击冷却检查
            if (currentTime - this.lastAttackTime >= this.attackCooldown) {
                this.attackTarget(gameEngine.player);
                this.lastAttackTime = currentTime;
            }
        } else {
            // 追击玩家
            this.chaseTarget(gameEngine.player);
        }
    } else {
        // 没有发现目标，进入游荡状态
        if (this.state !== 'wandering') {
            this.state = 'wandering';
            this.target = null;
        }
        this.wander(deltaTime);
    }
};

BaseZombie.prototype.findNearestTarget = function(gameEngine) {
    var nearestTarget = null;
    var nearestDistance = Infinity;
    
    // 检查玩家
    var playerDistance = Math.sqrt(
        Math.pow(this.x - gameEngine.player.x, 2) + 
        Math.pow(this.y - gameEngine.player.y, 2)
    );
    
    if (playerDistance < nearestDistance && gameEngine.player.health > 0) {
        nearestDistance = playerDistance;
        nearestTarget = { target: gameEngine.player, distance: playerDistance, type: 'player' };
    }
    
    // 检查团队成员
    for (var i = 0; i < gameEngine.followers.length; i++) {
        var follower = gameEngine.followers[i];
        if (follower.health > 0) { // 只攻击活着的成员
            var followerDistance = Math.sqrt(
                Math.pow(this.x - follower.x, 2) + 
                Math.pow(this.y - follower.y, 2)
            );
            
            if (followerDistance < nearestDistance) {
                nearestDistance = followerDistance;
                nearestTarget = { target: follower, distance: followerDistance, type: 'follower' };
            }
        }
    }
    
    return nearestTarget;
};

BaseZombie.prototype.chaseTarget = function(target) {
    if (!target) return;
    
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        // 标准化方向向量
        var dirX = dx / distance;
        var dirY = dy / distance;
        
        // 计算新位置
        var newX = this.x + dirX * this.moveSpeed;
        var newY = this.y + dirY * this.moveSpeed;
        
        // 检查新位置是否与建筑碰撞
        if (this.canZombieMoveTo(newX, newY, this.gameEngine)) {
            // 没有碰撞，直接移动
            this.x = newX;
            this.y = newY;
        } else {
            // 有碰撞，尝试绕过建筑物
            var alternativePath = this.findZombieAlternativePath(target.x, target.y, this.gameEngine);
            if (alternativePath.success) {
                this.x = alternativePath.x;
                this.y = alternativePath.y;
            }
            // 如果找不到路径，僵尸就停在原地
        }
        
        // 更新方向和行走状态
        this.isWalking = true;
        this.direction = this.getDirectionFromDelta(dirX, dirY);
    }
};

/**
 * 检查僵尸是否可以移动到指定位置
 */
BaseZombie.prototype.canZombieMoveTo = function(x, y, gameEngine) {
    // 地图边界检查
    var zombieRadius = 20;
    var mapConfig = gameEngine ? gameEngine.mapConfig : { width: 10000, height: 10000 };
    
    if (x < zombieRadius || x > mapConfig.width - zombieRadius ||
        y < zombieRadius || y > mapConfig.height - zombieRadius) {
        return false;
    }
    
    // 建筑碰撞检查 - 僵尸不能进入任何建筑
    var buildings = gameEngine ? gameEngine.buildings : [];
    
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        
        // 简单的矩形碰撞检测
        if (x + zombieRadius >= building.x && 
            x - zombieRadius <= building.x + building.width &&
            y + zombieRadius >= building.y && 
            y - zombieRadius <= building.y + building.height) {
            return false; // 僵尸不能进入建筑
        }
    }
    
    return true;
};

/**
 * 为僵尸寻找替代路径
 */
BaseZombie.prototype.findZombieAlternativePath = function(targetX, targetY, gameEngine) {
    var searchRadius = 50;
    var stepSize = 10;
    
    // 尝试8个方向寻找可移动位置
    var directions = [
        { dx: 1, dy: 0 },   // 右
        { dx: -1, dy: 0 },  // 左
        { dx: 0, dy: 1 },   // 下
        { dx: 0, dy: -1 },  // 上
        { dx: 1, dy: 1 },   // 右下
        { dx: 1, dy: -1 },  // 右上
        { dx: -1, dy: 1 },  // 左下
        { dx: -1, dy: -1 }  // 左上
    ];
    
    for (var radius = stepSize; radius <= searchRadius; radius += stepSize) {
        for (var i = 0; i < directions.length; i++) {
            var dir = directions[i];
            var testX = this.x + dir.dx * radius;
            var testY = this.y + dir.dy * radius;
            
            if (this.canZombieMoveTo(testX, testY, gameEngine)) {
                // 检查是否更接近目标
                var currentDistance = Math.sqrt(
                    Math.pow(this.x - targetX, 2) + 
                    Math.pow(this.y - targetY, 2)
                );
                var testDistance = Math.sqrt(
                    Math.pow(testX - targetX, 2) + 
                    Math.pow(testY - targetY, 2)
                );
                
                if (testDistance < currentDistance) {
                    return { success: true, x: testX, y: testY };
                }
            }
        }
    }
    
    return { success: false };
};

BaseZombie.prototype.wander = function(deltaTime) {
    this.wanderTimer -= deltaTime;
    
    if (!this.wanderTarget || this.wanderTimer <= 0) {
        // 设置新的游荡目标，确保目标位置可以到达
        var attempts = 0;
        var maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            var angle = Math.random() * Math.PI * 2;
            var distance = 50 + Math.random() * 100;
            
            var targetX = this.x + Math.cos(angle) * distance;
            var targetY = this.y + Math.sin(angle) * distance;
            
            // 检查目标位置是否可以到达
            if (this.canZombieMoveTo(targetX, targetY, this.gameEngine)) {
                this.wanderTarget = { x: targetX, y: targetY };
                break;
            }
            
            attempts++;
        }
        
        if (!this.wanderTarget) {
            // 如果找不到合适的目标，就在原地停留
            this.wanderTarget = { x: this.x, y: this.y };
        }
        
        this.wanderTimer = 2000 + Math.random() * 3000; // 2-5秒
    }
    
    // 向游荡目标移动
    if (this.wanderTarget) {
        var dx = this.wanderTarget.x - this.x;
        var dy = this.wanderTarget.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            var dirX = dx / distance;
            var dirY = dy / distance;
            
            // 计算新位置
            var newX = this.x + dirX * this.moveSpeed * 0.5; // 游荡时移动更慢
            var newY = this.y + dirY * this.moveSpeed * 0.5;
            
            // 检查是否可以移动
            if (this.canZombieMoveTo(newX, newY, this.gameEngine)) {
                this.x = newX;
                this.y = newY;
                this.isWalking = true;
                this.direction = this.getDirectionFromDelta(dirX, dirY);
            } else {
                // 碰到障碍物，重新选择目标
                this.wanderTarget = null;
                this.wanderTimer = 0;
                this.isWalking = false;
            }
        } else {
            this.wanderTarget = null;
            this.isWalking = false;
        }
    }
};

BaseZombie.prototype.attackTarget = function(target) {
    if (!target || target.health <= 0) return;
    
    // 造成伤害
    target.health -= this.attack;
    
    console.log('[Zombie] 僵尸攻击目标，造成', this.attack, '点伤害，目标剩余血量:', target.health);
    
    // 检查目标是否死亡
    if (target.health <= 0) {
        this.onTargetDeath(target);
    }
};

BaseZombie.prototype.onTargetDeath = function(target) {
    console.log('[Zombie] 目标死亡，准备转化为僵尸');
    
    // 这里会在后面实现人物转化为僵尸的逻辑
    target.health = 0;
    target.isDead = true;
    
    // 重置僵尸状态
    this.state = 'wandering';
    this.target = null;
};

BaseZombie.prototype.takeDamage = function(damage) {
    this.health -= damage;
    console.log('[Zombie] 僵尸受到', damage, '点伤害，剩余血量:', this.health);
    
    if (this.health <= 0) {
        this.health = 0;
        console.log('[Zombie] 僵尸死亡');
        return true; // 返回true表示僵尸死亡
    }
    
    return false;
};

BaseZombie.prototype.updateAnimation = function(deltaTime) {
    if (this.isWalking) {
        this.lastAnimationTime += deltaTime;
        
        if (this.lastAnimationTime >= this.walkAnimationSpeed) {
            this.walkAnimationFrame = (this.walkAnimationFrame + 1) % 4;
            this.lastAnimationTime = 0;
        }
    } else {
        this.walkAnimationFrame = 0;
    }
};

BaseZombie.prototype.updateMovement = function(deltaTime) {
    // 记录移动历史
    if (Math.abs(this.x - this.lastX) > 0.1 || Math.abs(this.y - this.lastY) > 0.1) {
        this.isWalking = true;
    } else {
        this.isWalking = false;
    }
    
    this.lastX = this.x;
    this.lastY = this.y;
};

BaseZombie.prototype.getDirectionFromDelta = function(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
    } else {
        return deltaY > 0 ? 'down' : 'up';
    }
};

BaseZombie.prototype.render = function(ctx, camera) {
    // 简化渲染逻辑，直接使用世界坐标
    // 检查是否在可见区域内
    var viewWidth = ctx.canvas.width / camera.zoom;
    var viewHeight = ctx.canvas.height / camera.zoom;
    var viewLeft = camera.x;
    var viewRight = camera.x + viewWidth;
    var viewTop = camera.y;
    var viewBottom = camera.y + viewHeight;
    
    // 扩大一点边界以确保僵尸不会突然消失
    var margin = 100;
    if (this.x < viewLeft - margin || this.x > viewRight + margin ||
        this.y < viewTop - margin || this.y > viewBottom + margin) {
        return;
    }
    
    ctx.save();
    
    // 应用缩放（僵尸比人物大一点）
    var scale = this.size;
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);
    
    // 渲染僵尸
    this.renderZombie(ctx);
    
    // 渲染血条
    this.renderHealthBar(ctx);
    
    // 渲染状态指示器
    this.renderStateIndicator(ctx);
    
    ctx.restore();
};

BaseZombie.prototype.renderZombie = function(ctx) {
    // 基础僵尸渲染（会被子类覆盖）
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-12, -12, 24, 24);
    
    // 僵尸眼睛
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-8, -8, 3, 3);
    ctx.fillRect(5, -8, 3, 3);
    
    // 僵尸嘴巴
    ctx.fillStyle = '#000000';
    ctx.fillRect(-4, -2, 8, 2);
};

BaseZombie.prototype.renderHealthBar = function(ctx) {
    var healthPercentage = this.health / this.maxHealth;
    var barWidth = 20;
    var barHeight = 3;
    
    // 背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(-barWidth/2, -20, barWidth, barHeight);
    
    // 血条
    ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : healthPercentage > 0.2 ? '#FF9800' : '#F44336';
    ctx.fillRect(-barWidth/2, -20, barWidth * healthPercentage, barHeight);
    
    // 边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-barWidth/2, -20, barWidth, barHeight);
};

BaseZombie.prototype.renderStateIndicator = function(ctx) {
    var indicator = '';
    var color = '#ffffff';
    
    switch (this.state) {
        case 'chasing':
            indicator = '!';
            color = '#ff4444';
            break;
        case 'attacking':
            indicator = '⚡';
            color = '#ff0000';
            break;
        case 'wandering':
            indicator = '?';
            color = '#888888';
            break;
    }
    
    if (indicator) {
        ctx.fillStyle = color;
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(indicator, 0, -25);
    }
};

// 僵尸管理器
function ZombieManager() {
    this.zombies = [];
    this.zombieTypes = this.getZombieTypes();
}

ZombieManager.prototype.getZombieTypes = function() {
    return {
        thin: {
            name: '瘦僵尸',
            health: 25,
            attack: 6,
            moveSpeed: 2.0,
            size: 1.1,
            attackCooldown: 1200,
            color: '#8b0000'
        },
        fat: {
            name: '胖僵尸',
            health: 50,
            attack: 12,
            moveSpeed: 1.2,
            size: 1.4,
            attackCooldown: 2000,
            color: '#4a4a4a'
        },
        boss1: {
            name: '僵尸Boss1',
            health: 100,
            attack: 20,
            moveSpeed: 1.8,
            size: 1.6,
            attackCooldown: 1000,
            detectionRange: 200,
            color: '#2d0d0d'
        }
    };
};

ZombieManager.prototype.createZombie = function(type, x, y) {
    var zombieType = this.zombieTypes[type];
    if (!zombieType) {
        console.warn('[ZombieManager] 未知的僵尸类型:', type);
        return null;
    }
    
    var config = {
        type: type,
        x: x,
        y: y,
        health: zombieType.health,
        maxHealth: zombieType.health,
        attack: zombieType.attack,
        moveSpeed: zombieType.moveSpeed,
        size: zombieType.size,
        attackCooldown: zombieType.attackCooldown,
        detectionRange: zombieType.detectionRange || 150
    };
    
    var zombie;
    switch (type) {
        case 'thin':
            zombie = new ThinZombie(config);
            break;
        case 'fat':
            zombie = new FatZombie(config);
            break;
        case 'boss1':
            zombie = new ZombieBoss1(config);
            break;
        default:
            zombie = new BaseZombie(config);
    }
    
    this.zombies.push(zombie);
    return zombie;
};

ZombieManager.prototype.update = function(deltaTime, gameEngine) {
    // 性能优化：只更新屏幕附近的僵尸
    var viewWidth = gameEngine.canvas.width / gameEngine.camera.zoom;
    var viewHeight = gameEngine.canvas.height / gameEngine.camera.zoom;
    var viewLeft = gameEngine.camera.x - 200; // 扩大更新范围
    var viewRight = gameEngine.camera.x + viewWidth + 200;
    var viewTop = gameEngine.camera.y - 200;
    var viewBottom = gameEngine.camera.y + viewHeight + 200;
    
    for (var i = this.zombies.length - 1; i >= 0; i--) {
        var zombie = this.zombies[i];
        
        // 只更新视野范围内或正在追击的僵尸
        var inView = (zombie.x >= viewLeft && zombie.x <= viewRight &&
                     zombie.y >= viewTop && zombie.y <= viewBottom);
        var isChasing = zombie.state === 'chasing' || zombie.state === 'attacking';
        
        if (inView || isChasing) {
            zombie.update(deltaTime, gameEngine);
        }
        
        // 移除死亡的僵尸
        if (zombie.health <= 0) {
            this.zombies.splice(i, 1);
            gameEngine.gameData.zombieKills++;
            console.log('[Zombie] 僵尸死亡，剩余:', this.zombies.length, '只');
        }
    }
};

ZombieManager.prototype.render = function(ctx, camera) {
    for (var i = 0; i < this.zombies.length; i++) {
        this.zombies[i].render(ctx, camera);
    }
};

ZombieManager.prototype.getZombiesInRange = function(x, y, range) {
    var zombiesInRange = [];
    
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        var distance = Math.sqrt(
            Math.pow(zombie.x - x, 2) + 
            Math.pow(zombie.y - y, 2)
        );
        
        if (distance <= range) {
            zombiesInRange.push({ zombie: zombie, distance: distance });
        }
    }
    
    return zombiesInRange;
};

// 瘦僵尸类
function ThinZombie(config) {
    BaseZombie.call(this, config);
}

ThinZombie.prototype = Object.create(BaseZombie.prototype);
ThinZombie.prototype.constructor = ThinZombie;

ThinZombie.prototype.renderZombie = function(ctx) {
    // 瘦僵尸 - 瘦长的身体
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-8, -15, 16, 30); // 瘦长的身体
    
    // 头部
    ctx.fillStyle = '#654321';
    ctx.fillRect(-10, -20, 20, 15);
    
    // 眼睛
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-7, -17, 3, 3);
    ctx.fillRect(4, -17, 3, 3);
    
    // 嘴巴
    ctx.fillStyle = '#000000';
    ctx.fillRect(-4, -12, 8, 2);
    
    // 手臂 - 很瘦
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-12, -10, 4, 20);
    ctx.fillRect(8, -10, 4, 20);
    
    // 腿部 - 很瘦
    ctx.fillRect(-6, 15, 4, 15);
    ctx.fillRect(2, 15, 4, 15);
    
    // 破烂的衣服效果
    ctx.fillStyle = '#444444';
    ctx.fillRect(-6, -5, 12, 8);
    ctx.fillRect(-4, 5, 8, 6);
};

// 胖僵尸类
function FatZombie(config) {
    BaseZombie.call(this, config);
}

FatZombie.prototype = Object.create(BaseZombie.prototype);
FatZombie.prototype.constructor = FatZombie;

FatZombie.prototype.renderZombie = function(ctx) {
    // 胖僵尸 - 圆胖的身体
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-15, -12, 30, 24); // 胖身体
    
    // 头部 - 比较大
    ctx.fillStyle = '#654321';
    ctx.fillRect(-12, -22, 24, 18);
    
    // 眼睛
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-9, -19, 4, 4);
    ctx.fillRect(5, -19, 4, 4);
    
    // 嘴巴 - 比较大
    ctx.fillStyle = '#000000';
    ctx.fillRect(-6, -14, 12, 3);
    
    // 粗手臂
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-18, -8, 6, 16);
    ctx.fillRect(12, -8, 6, 16);
    
    // 粗腿
    ctx.fillRect(-10, 12, 8, 18);
    ctx.fillRect(2, 12, 8, 18);
    
    // 肚子
    ctx.fillStyle = '#666666';
    ctx.fillRect(-12, -5, 24, 15);
    
    // 破烂的衣服
    ctx.fillStyle = '#333333';
    ctx.fillRect(-10, -2, 20, 8);
};

// 僵尸Boss1类
function ZombieBoss1(config) {
    BaseZombie.call(this, config);
}

ZombieBoss1.prototype = Object.create(BaseZombie.prototype);
ZombieBoss1.prototype.constructor = ZombieBoss1;

ZombieBoss1.prototype.renderZombie = function(ctx) {
    // Boss僵尸 - 更大更恐怖
    ctx.fillStyle = '#2d0d0d';
    ctx.fillRect(-18, -15, 36, 30); // 巨大的身体
    
    // 头部 - 非常大
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(-15, -28, 30, 22);
    
    // 发光的红眼睛
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-12, -24, 5, 5);
    ctx.fillRect(7, -24, 5, 5);
    
    // 发光效果
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(-14, -26, 9, 9);
    ctx.fillRect(5, -26, 9, 9);
    
    // 恐怖的嘴巴
    ctx.fillStyle = '#000000';
    ctx.fillRect(-8, -18, 16, 4);
    
    // 牙齿
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -18, 2, 3);
    ctx.fillRect(-2, -18, 2, 3);
    ctx.fillRect(2, -18, 2, 3);
    ctx.fillRect(6, -18, 2, 3);
    
    // 强壮的手臂
    ctx.fillStyle = '#2d0d0d';
    ctx.fillRect(-24, -10, 8, 25);
    ctx.fillRect(16, -10, 8, 25);
    
    // 粗壮的腿
    ctx.fillRect(-12, 15, 10, 20);
    ctx.fillRect(2, 15, 10, 20);
    
    // 装甲般的胸部
    ctx.fillStyle = '#444444';
    ctx.fillRect(-15, -8, 30, 18);
    
    // 伤疤效果
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-10, -25, 2, 15);
    ctx.fillRect(5, -22, 3, 12);
    ctx.fillRect(-5, -5, 8, 2);
};

ZombieBoss1.prototype.attackTarget = function(target) {
    if (!target || target.health <= 0) return;
    
    // Boss有特殊攻击效果
    target.health -= this.attack;
    
    console.log('[ZombieBoss1] Boss攻击目标，造成', this.attack, '点伤害，目标剩余血量:', target.health);
    
    // Boss攻击有击退效果
    if (target.x !== undefined && target.y !== undefined) {
        var dx = target.x - this.x;
        var dy = target.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            var knockbackDistance = 20;
            target.x += (dx / distance) * knockbackDistance;
            target.y += (dy / distance) * knockbackDistance;
        }
    }
    
    // 检查目标是否死亡
    if (target.health <= 0) {
        this.onTargetDeath(target);
    }
};

// 人物管理器
function CharacterManager() {
    this.characters = {}; this.currentCharacterId = 1; this.initializeCharacters();
}

CharacterManager.prototype.initializeCharacters = function() {
    var configs = [
        {id: 1, name: '酷炫墨镜哥', colors: {clothes: '#FFFFFF', hair: '#1A1A1A'}, features: {hasGlasses: true}},
        {id: 2, name: '金发女战士', colors: {clothes: '#8E24AA', hair: '#FFD700'}, features: {hasGlasses: false}},
        {id: 3, name: '暗影忍者', colors: {clothes: '#212121', hair: '#1A1A1A'}, features: {hasGlasses: false}},
        {id: 4, name: '机械工程师', colors: {clothes: '#FF9800', hair: '#795548'}, features: {hasGlasses: true}},
        {id: 5, name: '魔法师', colors: {clothes: '#3F51B5', hair: '#9C27B0'}, features: {hasGlasses: false}},
        {id: 6, name: '海盗船长', colors: {clothes: '#8D6E63', hair: '#FF5722'}, features: {hasGlasses: false}},
        {id: 7, name: '太空探险家', colors: {clothes: '#607D8B', hair: '#CDDC39'}, features: {hasGlasses: true}},
        {id: 8, name: '武士', colors: {clothes: '#F44336', hair: '#424242'}, features: {hasGlasses: false}},
        {id: 9, name: '摇滚歌手', colors: {clothes: '#E91E63', hair: '#FF1744'}, features: {hasGlasses: true}},
        {id: 10, name: '神秘学者', colors: {clothes: '#009688', hair: '#37474F'}, features: {hasGlasses: false}},
        {id: 11, name: '赛车手', colors: {clothes: '#FF5722', hair: '#FFC107'}, features: {hasGlasses: true}},
        {id: 12, name: '军事指挥官', colors: {clothes: '#4CAF50', hair: '#616161'}, features: {hasGlasses: false}},
        {id: 13, name: '幽灵猎人', colors: {clothes: '#9E9E9E', hair: '#212121'}, features: {hasGlasses: true}},
        {id: 14, name: '网络黑客', colors: {clothes: '#00E676', hair: '#1DE9B6'}, features: {hasGlasses: false}},
        {id: 15, name: '西部牛仔', colors: {clothes: '#8D6E63', hair: '#FFAB40'}, features: {hasGlasses: true}},
        {id: 16, name: '外星访客', colors: {clothes: '#00BCD4', hair: '#4FC3F7'}, features: {hasGlasses: false}},
        {id: 17, name: '格斗冠军', colors: {clothes: '#FF9800', hair: '#795548'}, features: {hasGlasses: true}},
        {id: 18, name: '时间旅行者', colors: {clothes: '#673AB7', hair: '#9C27B0'}, features: {hasGlasses: false}},
        {id: 19, name: '机器人', colors: {clothes: '#546E7A', hair: '#90A4AE'}, features: {hasGlasses: true}},
        {id: 20, name: '超级英雄', colors: {clothes: '#2196F3', hair: '#FFC107'}, features: {hasGlasses: false}}
    ];
    for (var i = 0; i < configs.length; i++) this.characters[configs[i].id] = new BaseCharacter(configs[i]);
};

CharacterManager.prototype.getCurrentCharacter = function() {
    return this.characters[this.currentCharacterId] || this.characters[1];
};

CharacterManager.prototype.switchCharacter = function(characterId) {
    if (characterId >= 1 && characterId <= 20 && this.characters[characterId]) {
        this.currentCharacterId = characterId; return true;
    }
    return false;
};

CharacterManager.prototype.renderCurrentCharacter = function(ctx, x, y, player) {
    var character = this.getCurrentCharacter();
    if (character) character.render(ctx, x, y, player);
};

/**
 * 游戏引擎构造函数 - 兼容抖音小程序环境
 */
function GameEngine(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.running = false;
    this.gameState = 'menu'; // menu, playing, submap, gameover, victory
    this.lastTime = 0;
    
    // 初始化人物管理器
    this.characterManager = new CharacterManager();
    
    // 初始化僵尸管理器
    this.zombieManager = new ZombieManager();
    
    // NPC系统
    this.npcs = [];
    this.followers = []; // 跟随玩家的NPC
    
    // 游戏数据
    this.gameData = {
        survivalDays: 1,
        food: 5,
        teamSize: 1,
        maxTeamSize: 1,
        zombieKills: 0,
        totalFood: 5,
        isDay: true,
        timeRemaining: 300000, // 5分钟白天
        gameStartTime: Date.now()
    };
    
    // 地图配置
    this.mapConfig = {
        width: 10000,       // 地图总宽度 (扩大5倍容纳500个建筑)
        height: 10000,      // 地图总高度 (扩大5倍容纳500个建筑)
        blockSize: 450,     // 每个街区大小 (建筑约占半屏)
        streetWidth: 200,   // 街道宽度 (进一步拓宽)
        buildingSpacing: 0  // 建筑间距 (设为0，建筑占满格子)
    };
    
    // 摄像机系统
    this.camera = {
        x: 0,
        y: 0,
        followTarget: null,
        smoothing: 0.1,
        zoom: 0.8  // 调整缩放因子，0.8倍缩小以适应大建筑
    };
    
    // 游戏对象
    this.buildings = this.initializeBuildings();
    this.player = { 
        x: this.mapConfig.width / 2, 
        y: this.mapConfig.height / 2, 
        health: 50, 
        maxHealth: 50, 
        level: 1,
        attack: 15,
        attackRange: 35,
        lastAttackTime: 0,
        attackCooldown: 800,
        isDead: false,
        isZombie: false,
        // 添加动画相关属性
        isWalking: false,
        walkAnimationFrame: 0,
        walkAnimationSpeed: 200, // 毫秒
        lastAnimationTime: 0,
        direction: 'down' // 'up', 'down', 'left', 'right'
    };
    this.companions = [];
    this.currentBuilding = null;
    this.exploredBuildings = [];
    this.nearBuilding = null; // 当前接近的建筑
    
    // 建筑进入询问状态
    this.buildingEntryPrompt = null;
    
    // 退出建筑冷却时间
    this.buildingExitCooldown = 0;
    
    // 设置摄像机跟随玩家
    this.camera.followTarget = this.player;
    
    // 初始化NPC
    this.initializeNPCs();
    
    // 初始化僵尸分布
    this.initializeZombies();
    
    // 子地图状态
    this.zombies = [];
    this.resources = [];
    this.subMapType = null;
    
    this.setupInput();
    console.log('[GameEngine] 游戏引擎已初始化');
}

/**
 * 初始化建筑物 - 生成约100个建筑的大地图
 */
GameEngine.prototype.initializeBuildings = function() {
    var buildings = [];
    var buildingId = 1;
    
    // 建筑类型定义
    var buildingTypes = this.getBuildingTypes();
    
    // 计算网格参数
    var blocksX = Math.floor(this.mapConfig.width / this.mapConfig.blockSize);
    var blocksY = Math.floor(this.mapConfig.height / this.mapConfig.blockSize);
    
    // 为每个街区生成建筑
    for (var blockX = 0; blockX < blocksX; blockX++) {
        for (var blockY = 0; blockY < blocksY; blockY++) {
            // 每个街区只选择一种建筑类型
            var typeIndex = Math.floor(Math.random() * buildingTypes.length);
            var buildingType = buildingTypes[typeIndex];
            
            // 每个街区只有一个建筑，占满整个格子
            var position = this.calculateBuildingPosition(blockX, blockY);
            
            if (position) {
                var building = {
                    id: buildingType.type + '_' + buildingId,
                    name: buildingType.name,
                    type: buildingType.type,
                    x: position.x,
                    y: position.y,
                    width: position.width,
                    height: position.height,
                    explored: false,
                    color: buildingType.color,
                    oneTimeOnly: buildingType.oneTimeOnly || false,
                    blockX: blockX,
                    blockY: blockY
                };
                
                buildings.push(building);
                buildingId++;
            }
        }
    }
    
    console.log('[GameEngine] 生成了 ' + buildings.length + ' 个建筑');
    return buildings;
};

/**
 * 获取建筑类型定义
 */
GameEngine.prototype.getBuildingTypes = function() {
    return [
        // 重要建筑（较少）
        { type: 'police_station', name: '警察局', width: 80, height: 80, color: '#3498db', weight: 1 },
        { type: 'hospital', name: '医院', width: 80, height: 80, color: '#e74c3c', weight: 1 },
        { type: 'school', name: '学校', width: 70, height: 70, color: '#f39c12', weight: 2 },
        { type: 'station', name: '车站', width: 70, height: 60, color: '#34495e', weight: 2 },
        { type: 'mall', name: '商场', width: 90, height: 70, color: '#27ae60', weight: 1 },
        
        // 商业建筑（中等）
        { type: 'shop', name: '商店', width: 60, height: 50, color: '#27ae60', weight: 4, oneTimeOnly: true },
        { type: 'restaurant', name: '餐厅', width: 60, height: 50, color: '#e67e22', weight: 4, oneTimeOnly: true },
        { type: 'bar', name: '酒吧', width: 50, height: 50, color: '#d35400', weight: 3, oneTimeOnly: true },
        { type: 'cafe', name: '咖啡厅', width: 50, height: 50, color: '#8e44ad', weight: 3 },
        { type: 'bank', name: '银行', width: 70, height: 60, color: '#2c3e50', weight: 2 },
        
        // 住宅建筑（较多）
        { type: 'house', name: '民房', width: 50, height: 50, color: '#95a5a6', weight: 8 },
        { type: 'villa', name: '别墅', width: 80, height: 60, color: '#8e44ad', weight: 4 },
        { type: 'apartment', name: '公寓', width: 60, height: 80, color: '#7f8c8d', weight: 6 },
        
        // 工业建筑（少量）
        { type: 'factory', name: '工厂', width: 90, height: 70, color: '#555555', weight: 2 },
        { type: 'warehouse', name: '仓库', width: 80, height: 60, color: '#666666', weight: 3 },
        
        // 其他建筑
        { type: 'gas_station', name: '加油站', width: 70, height: 50, color: '#f1c40f', weight: 2 },
        { type: 'gym', name: '健身房', width: 60, height: 60, color: '#9b59b6', weight: 2 },
        { type: 'library', name: '图书馆', width: 70, height: 70, color: '#16a085', weight: 1 }
    ];
};

/**
 * 计算建筑在街区中的位置 - 占满整个格子
 */
GameEngine.prototype.calculateBuildingPosition = function(blockX, blockY) {
    // 计算街区的起始位置
    var blockStartX = blockX * this.mapConfig.blockSize;
    var blockStartY = blockY * this.mapConfig.blockSize;
    
    // 建筑占满整个格子，但要避开街道
    var buildingX = blockStartX + this.mapConfig.streetWidth;
    var buildingY = blockStartY + this.mapConfig.streetWidth;
    var buildingWidth = this.mapConfig.blockSize - this.mapConfig.streetWidth;
    var buildingHeight = this.mapConfig.blockSize - this.mapConfig.streetWidth;
    
    // 确保建筑不会超出地图边界
    if (buildingX + buildingWidth > this.mapConfig.width ||
        buildingY + buildingHeight > this.mapConfig.height) {
        return null;
    }
    
    return { 
        x: buildingX, 
        y: buildingY, 
        width: buildingWidth, 
        height: buildingHeight 
    };
};

/**
 * 设置输入处理
 */
GameEngine.prototype.setupInput = function() {
    var self = this;
    
    this.joystick = {
        active: false,
        centerX: 80,              // 固定在左下角
        centerY: 0,               // 将在init中设置
        currentX: 80,
        currentY: 0,
        direction: { x: 0, y: 0 },
        radius: 60,               // 摇杆外圈半径
        knobRadius: 20,           // 摇杆内圈半径
        visible: true,            // 始终可见
        maxDistance: 50           // 摇杆最大移动距离
    };
    
    // 初始化摇杆位置
    this.joystick.centerY = this.canvas.height - 80;
    this.joystick.currentY = this.joystick.centerY;
    
    // 抖音小程序触摸事件 - 增强版本
    if (typeof tt !== 'undefined') {
        // 使用抖音小程序的触摸事件API
        this.canvas.addEventListener('touchstart', function(e) {
            console.log('[Input] 抖音触摸开始事件触发');
            self.onTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function(e) {
            console.log('[Input] 抖音触摸移动事件触发');
            self.onTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function(e) {
            console.log('[Input] 抖音触摸结束事件触发');
            self.onTouchEnd(e);
        });
        this.canvas.addEventListener('tap', function(e) {
            console.log('[Input] 抖音点击事件触发');
            self.onClick(e);
        });
    } else {
        // 标准浏览器事件
        this.canvas.addEventListener('touchstart', function(e) {
            console.log('[Input] 浏览器触摸开始事件触发');
            self.onTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function(e) {
            console.log('[Input] 浏览器触摸移动事件触发');
            self.onTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function(e) {
            console.log('[Input] 浏览器触摸结束事件触发');
            self.onTouchEnd(e);
        });
        this.canvas.addEventListener('click', function(e) {
            console.log('[Input] 浏览器点击事件触发');
            self.onClick(e);
        });
    }
    
    console.log('[GameEngine] 输入系统已初始化');
};

/**
 * 触摸开始
 */
GameEngine.prototype.onTouchStart = function(e) {
    try {
        if (e.preventDefault) e.preventDefault();
        
        var touch = e.touches && e.touches[0] ? e.touches[0] : e;
        var x, y;
        
        // 抖音小程序坐标处理
        if (touch.x !== undefined && touch.y !== undefined) {
            x = touch.x;
            y = touch.y;
        } else if (touch.clientX !== undefined && touch.clientY !== undefined) {
            x = touch.clientX;
            y = touch.clientY;
        } else {
            console.warn('[Input] 触摸坐标获取失败:', touch);
            x = 0;
            y = 0;
        }
        
        console.log('[Input] 触摸开始位置:', x, y, '游戏状态:', this.gameState);
        
        // 保存触摸开始位置，用于后续的tap检测
        this.touchStartX = x;
        this.touchStartY = y;
        this.touchStartTime = Date.now();
        
        // 检查是否在虚拟摇杆区域
        if (this.gameState === 'playing' || this.gameState === 'submap') {
            var joystickDistance = Math.sqrt(
                Math.pow(x - this.joystick.centerX, 2) + 
                Math.pow(y - this.joystick.centerY, 2)
            );
            
            console.log('[Input] 摇杆距离检查:', joystickDistance, '摇杆半径:', this.joystick.radius);
            
            if (joystickDistance <= this.joystick.radius) {
                this.joystick.active = true;
                this.joystick.currentX = x;
                this.joystick.currentY = y;
                this.updateJoystickDirection();
                console.log('[Input] 虚拟摇杆激活成功');
            } else {
                console.log('[Input] 触摸位置不在摇杆范围内');
            }
        } else {
            console.log('[Input] 当前游戏状态不支持摇杆操作:', this.gameState);
        }
    } catch (error) {
        console.error('[Input] 触摸开始处理错误:', error);
        // 重置摇杆状态
        this.resetJoystick();
    }
};

/**
 * 触摸移动
 */
GameEngine.prototype.onTouchMove = function(e) {
    try {
        if (e.preventDefault) e.preventDefault();
        
        if (!this.joystick.active) {
            console.log('[Input] 摇杆未激活，忽略触摸移动');
            return;
        }
        
        var touch = e.touches && e.touches[0] ? e.touches[0] : e;
        var x, y;
        
        // 抖音小程序坐标处理
        if (touch.x !== undefined && touch.y !== undefined) {
            x = touch.x;
            y = touch.y;
        } else if (touch.clientX !== undefined && touch.clientY !== undefined) {
            x = touch.clientX;
            y = touch.clientY;
        } else {
            console.warn('[Input] 触摸移动坐标获取失败');
            return;
        }
        
        console.log('[Input] 触摸移动位置:', x, y, '摇杆状态:', this.joystick.active);
        
        // 限制摇杆移动范围
        var dx = x - this.joystick.centerX;
        var dy = y - this.joystick.centerY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.joystick.maxDistance) {
            this.joystick.currentX = x;
            this.joystick.currentY = y;
        } else {
            // 限制在最大距离内
            var angle = Math.atan2(dy, dx);
            this.joystick.currentX = this.joystick.centerX + Math.cos(angle) * this.joystick.maxDistance;
            this.joystick.currentY = this.joystick.centerY + Math.sin(angle) * this.joystick.maxDistance;
        }
        
        this.updateJoystickDirection();
        console.log('[Input] 摇杆方向更新:', this.joystick.direction.x, this.joystick.direction.y);
        
    } catch (error) {
        console.error('[Input] 触摸移动处理错误:', error);
        this.resetJoystick();
    }
};

/**
 * 触摸结束
 */
GameEngine.prototype.onTouchEnd = function(e) {
    try {
        if (e.preventDefault) e.preventDefault();
        console.log('[Input] 触摸结束，摇杆状态:', this.joystick.active);
        
        // 检测是否为快速点击（tap）
        var touchEndTime = Date.now();
        var touchDuration = touchEndTime - this.touchStartTime;
        
        if (touchDuration < 300 && !this.joystick.active) { // 300ms内的快速触摸且不是摇杆操作
            console.log('[Input] 检测到点击手势，触发点击事件');
            // 模拟点击事件
            this.onClick({
                x: this.touchStartX,
                y: this.touchStartY
            });
        }
        
        // 重置摇杆状态
        this.resetJoystick();
        
    } catch (error) {
        console.error('[Input] 触摸结束处理错误:', error);
        this.resetJoystick();
    }
};

/**
 * 重置摇杆状态
 */
GameEngine.prototype.resetJoystick = function() {
    console.log('[Input] 重置摇杆状态');
    this.joystick.active = false;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;
};

/**
 * 更新摇杆方向
 */
GameEngine.prototype.updateJoystickDirection = function() {
    try {
        var dx = this.joystick.currentX - this.joystick.centerX;
        var dy = this.joystick.currentY - this.joystick.centerY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        console.log('[Input] 摇杆方向计算:', {
            dx: dx,
            dy: dy,
            distance: distance,
            maxDistance: this.joystick.maxDistance,
            deadZone: 5
        });
        
        if (distance > 5) { // 死区，避免微小抖动
            var normalizedDistance = Math.min(distance, this.joystick.maxDistance) / this.joystick.maxDistance;
            this.joystick.direction.x = (dx / distance) * normalizedDistance;
            this.joystick.direction.y = (dy / distance) * normalizedDistance;
            
            console.log('[Input] 摇杆方向已更新:', {
                x: this.joystick.direction.x,
                y: this.joystick.direction.y,
                normalizedDistance: normalizedDistance
            });
        } else {
            this.joystick.direction.x = 0;
            this.joystick.direction.y = 0;
            console.log('[Input] 摇杆在死区内，方向重置为0');
        }
    } catch (error) {
        console.error('[Input] 摇杆方向更新错误:', error);
        this.resetJoystick();
    }
};

/**
 * 点击事件
 */
GameEngine.prototype.onClick = function(e) {
    var x, y;
    
    // 抖音小程序坐标处理
    if (e.x !== undefined && e.y !== undefined) {
        x = e.x;
        y = e.y;
    } else if (e.clientX !== undefined && e.clientY !== undefined) {
        x = e.clientX;
        y = e.clientY;
    } else if (e.touches && e.touches[0]) {
        var touch = e.touches[0];
        x = touch.x || touch.clientX || 0;
        y = touch.y || touch.clientY || 0;
    } else {
        x = 0;
        y = 0;
    }
    
    console.log('[Input] 点击位置:', x, y, '游戏状态:', this.gameState);
    
    if (this.gameState === 'menu') {
        this.handleMenuClick(x, y);
    } else if (this.gameState === 'playing') {
        this.handleGameClick(x, y);
    } else if (this.gameState === 'submap') {
        this.handleSubMapClick(x, y);
    } else if (this.gameState === 'gameover' || this.gameState === 'victory') {
        this.handleEndGameClick(x, y);
    }
};

/**
 * 处理菜单点击
 */
GameEngine.prototype.handleMenuClick = function(x, y) {
    console.log('[Menu] 菜单点击检测:', x, y);
    
    // 开始游戏按钮区域 (更新为新的按钮位置和大小)
    var centerX = this.canvas.width / 2;
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    var buttonY = 320;
    
    console.log('[Menu] 按钮区域:', buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight);
    
    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('[Menu] 按钮点击成功，开始游戏');
        this.startGame();
    } else {
        console.log('[Menu] 点击位置不在按钮范围内');
    }
};

/**
 * 处理游戏点击
 */
GameEngine.prototype.handleGameClick = function(x, y) {
    console.log('[Click] 游戏中点击:', x, y);
    
    // 检查是否在建筑进入询问提示中
    if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        this.handleBuildingEntryPromptClick(x, y);
        return;
    }
    
    // ESC键取消询问提示已整合到点击处理中
    
    // 现在只使用询问进入，不需要点击触发
    console.log('[Click] 游戏中点击事件，当前为询问进入模式');
};

/**
 * 处理建筑进入询问提示的点击
 */
GameEngine.prototype.handleBuildingEntryPromptClick = function(x, y) {
    console.log('[Prompt] 处理询问提示点击:', x, y);
    
    var prompt = this.buildingEntryPrompt;
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 计算按钮位置（与渲染函数保持一致）
    var boxHeight = 150;
    var boxY = centerY - boxHeight / 2;
    var buttonWidth = 80;
    var buttonHeight = 35;
    var buttonY = boxY + 90;
    
    console.log('[Prompt] 按钮区域计算 - 中心:', centerX, centerY, '按钮Y:', buttonY);
    
    // 进入按钮
    var enterButtonX = centerX - buttonWidth - 20;
    console.log('[Prompt] 进入按钮区域:', enterButtonX, buttonY, 'to', enterButtonX + buttonWidth, buttonY + buttonHeight);
    
    if (x >= enterButtonX && x <= enterButtonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('[Prompt] 玩家选择进入建筑:', prompt.building.name);
        console.log('[Prompt] 建筑ID:', prompt.buildingId);
        console.log('[Prompt] 验证建筑匹配...');
        
        // 严格验证建筑是否仍然是当前接近的建筑
        if (this.nearBuilding && 
            this.nearBuilding.id === prompt.building.id && 
            this.nearBuilding.name === prompt.building.name) {
            console.log('[Prompt] 建筑验证通过，进入建筑:', prompt.building.name, 'ID:', prompt.building.id);
            this.exploreBuilding(prompt.building);
        } else {
            console.log('[Prompt] 建筑验证失败！');
            console.log('[Prompt] 当前接近建筑:', this.nearBuilding ? this.nearBuilding.name + '(ID:' + this.nearBuilding.id + ')' : '无');
            console.log('[Prompt] 询问提示建筑:', prompt.building.name + '(ID:' + prompt.building.id + ')');
            console.log('[Prompt] 无法进入，建筑不匹配');
        }
        
        this.buildingEntryPrompt = null; // 清除提示
        return;
    }
    
    // 取消按钮
    var cancelButtonX = centerX + 20;
    console.log('[Prompt] 取消按钮区域:', cancelButtonX, buttonY, 'to', cancelButtonX + buttonWidth, buttonY + buttonHeight);
    
    if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('[Prompt] 玩家选择取消进入建筑');
        this.buildingEntryPrompt = null; // 清除提示
        return;
    }
    
    console.log('[Prompt] 点击位置不在按钮区域内');
};

/**
 * 处理子地图点击
 */
GameEngine.prototype.handleSubMapClick = function(x, y) {
    var self = this;
    // 检查返回按钮
    if (x >= 10 && x <= 90 && y >= this.canvas.height - 40 && y <= this.canvas.height - 10) {
        this.exitBuilding();
        return;
    }
    
    // 检查资源点击
    this.resources.forEach(function(resource) {
        if (!resource.collected) {
            var distance = Math.sqrt((x - resource.x) * (x - resource.x) + (y - resource.y) * (y - resource.y));
            if (distance <= 30) {
                self.collectResource(resource);
            }
        }
    });
};

/**
 * 处理结束画面点击
 */
GameEngine.prototype.handleEndGameClick = function(x, y) {
    // 重新开始按钮
    if (x >= 175 && x <= 325 && y >= 320 && y <= 360) {
        this.restartGame();
    }
};

/**
 * 开始游戏
 */
GameEngine.prototype.startGame = function() {
    console.log('[GameEngine] 开始游戏函数被调用');
    this.gameState = 'playing';
    console.log('[GameEngine] 游戏状态已切换到:', this.gameState);
};

/**
 * 重新开始游戏
 */
GameEngine.prototype.restartGame = function() {
    this.gameData = {
        survivalDays: 1,
        food: 5,
        teamSize: 1,
        maxTeamSize: 1,
        zombieKills: 0,
        totalFood: 5,
        isDay: true,
        timeRemaining: 300000,
        gameStartTime: Date.now()
    };
    
    this.player = { 
        x: this.mapConfig.width / 2, 
        y: this.mapConfig.height / 2, 
        health: 20, 
        maxHealth: 20, 
        level: 1 
    };
    this.companions = [];
    this.exploredBuildings = [];
    this.nearBuilding = null;
    
    var self = this;
    this.buildings.forEach(function(building) {
        building.explored = false;
    });
    
    this.gameState = 'playing';
    console.log('[GameEngine] 游戏重新开始');
};

/**
 * 探索建筑物
 */
GameEngine.prototype.exploreBuilding = function(building) {
    console.log('[GameEngine] 尝试探索建筑:', building.name, '类型:', building.type);
    
    if (building.oneTimeOnly && building.explored) {
        console.log('[GameEngine] 该建筑物只能探索一次，已探索过');
        return;
    }
    
    console.log('[GameEngine] 开始进入建筑: ' + building.name);
    console.log('[GameEngine] 当前游戏状态:', this.gameState, '→ submap');
    
    // 保存进入前的位置（用于退出时恢复）
    this.playerPositionBeforeEntering = {
        x: this.player.x,
        y: this.player.y
    };
    
    // 保存团队成员进入前的位置
    this.followersPositionBeforeEntering = [];
    for (var i = 0; i < this.followers.length; i++) {
        this.followersPositionBeforeEntering.push({
            x: this.followers[i].x,
            y: this.followers[i].y
        });
    }
    
    this.currentBuilding = building;
    this.subMapType = building.type;
    this.gameState = 'submap';
    
    console.log('[GameEngine] 场景切换完成，新状态:', this.gameState);
    console.log('[GameEngine] 当前建筑:', this.currentBuilding.name);
    console.log('[GameEngine] 子地图类型:', this.subMapType);
    console.log('[GameEngine] 已保存进入前位置:', this.playerPositionBeforeEntering);
    
    // 将玩家放在子地图入口处（上方进入）
    this.player.x = 200; // 子地图中心X
    this.player.y = 130; // 子地图上方，刚进入房间
    
    // 将整个团队也带入建筑，智能排列避免重叠和越界
    var maxTeamSize = Math.min(this.followers.length, 12); // 限制最大显示数量
    var submapBounds = { minX: 70, maxX: 330, minY: 120, maxY: 280 }; // 子地图有效区域
    
    for (var i = 0; i < maxTeamSize; i++) {
        var follower = this.followers[i];
        var placed = false;
        var attempts = 0;
        
        // 尝试找到合适的位置
        while (!placed && attempts < 10) {
            var row = Math.floor(i / 4); // 每行4个
            var col = i % 4;
            var baseOffsetX = (col - 1.5) * 35; // 更合理的间距
            var baseOffsetY = (row + 1) * 35; // 在玩家后方
            
            // 添加少量随机偏移避免完全对齐
            var randomOffsetX = (Math.random() - 0.5) * 10;
            var randomOffsetY = (Math.random() - 0.5) * 10;
            
            var newX = this.player.x + baseOffsetX + randomOffsetX;
            var newY = this.player.y + baseOffsetY + randomOffsetY;
            
            // 确保在边界内
            newX = Math.max(submapBounds.minX, Math.min(submapBounds.maxX, newX));
            newY = Math.max(submapBounds.minY, Math.min(submapBounds.maxY, newY));
            
            follower.x = newX;
            follower.y = newY;
            placed = true;
            attempts++;
        }
    }
    
    // 对于超出显示限制的团队成员，暂时隐藏（设置到屏幕外）
    for (var j = maxTeamSize; j < this.followers.length; j++) {
        this.followers[j].x = -100;
        this.followers[j].y = -100;
    }
    
    console.log('[GameEngine] 玩家位置设为:', this.player.x, this.player.y);
    console.log('[GameEngine] 团队成员数量:', this.followers.length, '全部带入建筑');
    
    // 生成子地图内容
    this.generateSubMapContent();
    
    console.log('[GameEngine] 建筑进入完成，当前状态:', this.gameState);
};

/**
 * 初始化NPC系统
 */
GameEngine.prototype.initializeNPCs = function() {
    console.log('[NPC] 开始初始化NPC系统');
    
    // 生成19个NPC（2-20号人物）
    for (var i = 0; i < 19; i++) {
        var characterId = i + 2; // 2-20号人物
        var npc = this.createNPC(characterId);
        this.npcs.push(npc);
    }
    
    console.log('[NPC] 已生成', this.npcs.length, '个NPC');
};

/**
 * 初始化僵尸分布
 */
GameEngine.prototype.initializeZombies = function() {
    console.log('[Zombie] 开始初始化僵尸分布');
    
    // 根据天数生成僵尸
    this.spawnZombiesByDay();
    
    console.log('[Zombie] 初始僵尸分布完成');
};

/**
 * 根据天数生成僵尸
 */
GameEngine.prototype.spawnZombiesByDay = function() {
    var currentDay = this.gameData.survivalDays;
    
    // 计算僵尸数量：基础5只 + 每天增加2只，最多30只
    var baseCount = 5;
    var perDayIncrease = 2;
    var maxZombies = 30;
    var zombieCount = Math.min(maxZombies, baseCount + (currentDay - 1) * perDayIncrease);
    
    console.log('[Zombie] 第', currentDay, '天，生成', zombieCount, '只僵尸');
    
    var playerX = this.player.x;
    var playerY = this.player.y;
    var spawnRadius = 2000; // 2000像素半径
    var minDistance = 300; // 最小距离，避免太近
    
    var created = 0;
    var maxAttempts = zombieCount * 10; // 最多尝试次数
    var attempts = 0;
    
    while (created < zombieCount && attempts < maxAttempts) {
        attempts++;
        
        // 在2000像素半径内随机生成位置
        var angle = Math.random() * Math.PI * 2;
        var distance = minDistance + Math.random() * (spawnRadius - minDistance);
        
        var x = playerX + Math.cos(angle) * distance;
        var y = playerY + Math.sin(angle) * distance;
        
        // 确保在地图边界内
        x = Math.max(100, Math.min(this.mapConfig.width - 100, x));
        y = Math.max(100, Math.min(this.mapConfig.height - 100, y));
        
        // 检查是否与建筑重叠
        if (this.canMoveToPosition(x, y, 20)) { // 僵尸半径20
            // 确定僵尸类型
            var zombieType = this.getRandomZombieType(currentDay);
            
            var zombie = this.zombieManager.createZombie(zombieType, x, y);
            if (zombie) {
                created++;
                console.log('[Zombie] 创建僵尸', created + '/' + zombieCount, ':', zombieType, '位置:', x.toFixed(0), y.toFixed(0));
            }
        }
    }
    
    if (created < zombieCount) {
        console.warn('[Zombie] 只成功创建了', created, '只僵尸，目标是', zombieCount, '只');
    } else {
        console.log('[Zombie] 成功创建所有', created, '只僵尸');
    }
};

// isPositionBlockedByBuilding 函数已被 canMoveToPosition 替代

/**
 * 根据天数获取随机僵尸类型
 */
GameEngine.prototype.getRandomZombieType = function(day) {
    var random = Math.random();
    
    // 随着天数增加，更强的僵尸出现概率增加
    var thinChance = Math.max(0.3, 0.7 - day * 0.02);      // 开始70%，逐渐减少到30%
    var fatChance = Math.min(0.5, 0.25 + day * 0.015);     // 开始25%，逐渐增加到50%
    var bossChance = Math.min(0.2, day * 0.005);           // 开始0%，逐渐增加到20%
    
    if (random < thinChance) {
        return 'thin';
    } else if (random < thinChance + fatChance) {
        return 'fat';
    } else {
        return 'boss1';
    }
};

/**
 * 新一天开始时生成额外的僵尸
 */
GameEngine.prototype.spawnNewDayZombies = function() {
    var currentDay = this.gameData.survivalDays;
    
    // 每天额外生成2只僵尸
    var newZombieCount = 2;
    
    // 第5天开始每5天生成一次大波僵尸
    if (currentDay >= 5 && currentDay % 5 === 0) {
        newZombieCount = 5;
        console.log('[Zombie] 第', currentDay, '天！大波僵尸来袭！');
    }
    
    var playerX = this.player.x;
    var playerY = this.player.y;
    var spawnRadius = 2000;
    var minDistance = 400; // 比初始距离稍远一点
    
    var created = 0;
    var maxAttempts = newZombieCount * 15;
    var attempts = 0;
    
    console.log('[Zombie] 第', currentDay, '天开始，生成', newZombieCount, '只新僵尸');
    
    while (created < newZombieCount && attempts < maxAttempts) {
        attempts++;
        
        var angle = Math.random() * Math.PI * 2;
        var distance = minDistance + Math.random() * (spawnRadius - minDistance);
        
        var x = playerX + Math.cos(angle) * distance;
        var y = playerY + Math.sin(angle) * distance;
        
        // 确保在地图边界内
        x = Math.max(100, Math.min(this.mapConfig.width - 100, x));
        y = Math.max(100, Math.min(this.mapConfig.height - 100, y));
        
        // 检查是否与建筑重叠
        if (this.canMoveToPosition(x, y, 20)) { // 僵尸半径20
            var zombieType = this.getRandomZombieType(currentDay);
            
            var zombie = this.zombieManager.createZombie(zombieType, x, y);
            if (zombie) {
                created++;
                console.log('[Zombie] 新一天生成僵尸', created + '/' + newZombieCount, ':', zombieType);
            }
        }
    }
    
    console.log('[Zombie] 新一天成功生成', created, '只僵尸，当前总数:', this.zombieManager.zombies.length);
};

/**
 * 生成一波僵尸（5只）
 */
GameEngine.prototype.spawnZombieWave = function() {
    var zombieCount = 5; // 一次生成5只
    var playerX = this.player.x;
    var playerY = this.player.y;
    
    // 计算屏幕范围
    var screenWidth = this.canvas.width / this.camera.zoom;
    var screenHeight = this.canvas.height / this.camera.zoom;
    var minSpawnDistance = Math.max(screenWidth, screenHeight) * 0.8; // 确保不在同一屏幕
    
    var zombieDistribution = {
        thin: 0.6,    // 60% 瘦僵尸
        fat: 0.3,     // 30% 胖僵尸
        boss1: 0.1    // 10% Boss僵尸
    };
    
    var createdZombies = {
        thin: 0,
        fat: 0,
        boss1: 0
    };
    
    console.log('[Zombie] 开始生成一波僵尸，数量:', zombieCount);
    
    for (var i = 0; i < zombieCount; i++) {
        // 确定僵尸类型
        var zombieType = this.determineZombieType(i, zombieCount, zombieDistribution);
        
        // 生成街道位置（确保不在同一屏幕）
        var position = this.generateStreetZombiePosition(playerX, playerY, minSpawnDistance);
        
        if (position) {
            // 创建僵尸
            var zombie = this.zombieManager.createZombie(zombieType, position.x, position.y);
            if (zombie) {
                createdZombies[zombieType]++;
                console.log('[Zombie] 在街道创建僵尸:', zombieType, '位置:', position.x.toFixed(0), position.y.toFixed(0));
            }
        } else {
            console.warn('[Zombie] 无法找到合适的街道位置生成僵尸');
        }
    }
    
    console.log('[Zombie] 僵尸波次生成完成:', createdZombies);
    console.log('[Zombie] 当前僵尸总数:', this.zombieManager.zombies.length);
};

/**
 * 确定僵尸类型
 */
GameEngine.prototype.determineZombieType = function(index, total, distribution) {
    var ratio = index / total;
    
    if (ratio < distribution.thin) {
        return 'thin';
    } else if (ratio < distribution.thin + distribution.fat) {
        return 'fat';
    } else {
        return 'boss1';
    }
};

/**
 * 在街道上生成僵尸位置（确保不在同一屏幕）
 */
GameEngine.prototype.generateStreetZombiePosition = function(playerX, playerY, minDistance) {
    var maxAttempts = 100;
    var attempts = 0;
    
    var blockSize = this.mapConfig.blockSize;
    var streetWidth = this.mapConfig.streetWidth;
    var mapWidth = this.mapConfig.width;
    var mapHeight = this.mapConfig.height;
    
    while (attempts < maxAttempts) {
        var streetPosition = null;
        
        // 随机选择水平或垂直街道
        if (Math.random() < 0.5) {
            // 水平街道
            var blockY = Math.floor(Math.random() * Math.floor(mapHeight / blockSize));
            var streetCenterY = blockY * blockSize + streetWidth / 2;
            var x = Math.random() * (mapWidth - 200) + 100; // 避开边界
            
            streetPosition = { x: x, y: streetCenterY };
        } else {
            // 垂直街道
            var blockX = Math.floor(Math.random() * Math.floor(mapWidth / blockSize));
            var streetCenterX = blockX * blockSize + streetWidth / 2;
            var y = Math.random() * (mapHeight - 200) + 100; // 避开边界
            
            streetPosition = { x: streetCenterX, y: y };
        }
        
        if (streetPosition) {
            // 检查距离玩家是否足够远
            var distanceToPlayer = Math.sqrt(
                Math.pow(streetPosition.x - playerX, 2) + 
                Math.pow(streetPosition.y - playerY, 2)
            );
            
            if (distanceToPlayer >= minDistance) {
                // 确保在街道范围内，不与建筑重叠
                if (this.isPositionInStreet(streetPosition.x, streetPosition.y)) {
                    console.log('[Zombie] 找到合适的街道位置，距离玩家:', distanceToPlayer.toFixed(0), '像素');
                    return streetPosition;
                }
            }
        }
        
        attempts++;
    }
    
    console.warn('[Zombie] 经过', maxAttempts, '次尝试仍无法找到合适的街道位置');
    
    // 后备方案：在地图边缘的街道上生成
    return this.generateEdgeStreetPosition(playerX, playerY, minDistance);
};

/**
 * 检查位置是否在街道上
 */
GameEngine.prototype.isPositionInStreet = function(x, y) {
    var blockSize = this.mapConfig.blockSize;
    var streetWidth = this.mapConfig.streetWidth;
    
    // 计算在哪个街区
    var blockX = Math.floor(x / blockSize);
    var blockY = Math.floor(y / blockSize);
    
    // 计算在街区内的相对位置
    var relativeX = x - blockX * blockSize;
    var relativeY = y - blockY * blockSize;
    
    // 检查是否在水平或垂直街道上
    var inHorizontalStreet = relativeY <= streetWidth;
    var inVerticalStreet = relativeX <= streetWidth;
    
    return inHorizontalStreet || inVerticalStreet;
};

/**
 * 在地图边缘的街道上生成位置
 */
GameEngine.prototype.generateEdgeStreetPosition = function(playerX, playerY, minDistance) {
    var blockSize = this.mapConfig.blockSize;
    var streetWidth = this.mapConfig.streetWidth;
    var mapWidth = this.mapConfig.width;
    var mapHeight = this.mapConfig.height;
    
    // 选择边缘方向，确保距离玩家足够远
    var edges = [];
    
    // 检查上边缘
    if (playerY > minDistance) {
        edges.push('top');
    }
    
    // 检查下边缘
    if (playerY < mapHeight - minDistance) {
        edges.push('bottom');
    }
    
    // 检查左边缘
    if (playerX > minDistance) {
        edges.push('left');
    }
    
    // 检查右边缘
    if (playerX < mapWidth - minDistance) {
        edges.push('right');
    }
    
    if (edges.length === 0) {
        // 如果所有边缘都太近，选择对角边缘
        edges = ['top', 'bottom', 'left', 'right'];
    }
    
    var selectedEdge = edges[Math.floor(Math.random() * edges.length)];
    
    switch (selectedEdge) {
        case 'top':
            // 在顶部街道生成
            var blockY = 0;
            var streetY = blockY * blockSize + streetWidth / 2;
            var x = Math.random() * (mapWidth - 200) + 100;
            return { x: x, y: streetY };
            
        case 'bottom':
            // 在底部街道生成
            var blockY = Math.floor(mapHeight / blockSize) - 1;
            var streetY = blockY * blockSize + streetWidth / 2;
            var x = Math.random() * (mapWidth - 200) + 100;
            return { x: x, y: streetY };
            
        case 'left':
            // 在左侧街道生成
            var blockX = 0;
            var streetX = blockX * blockSize + streetWidth / 2;
            var y = Math.random() * (mapHeight - 200) + 100;
            return { x: streetX, y: y };
            
        case 'right':
            // 在右侧街道生成
            var blockX = Math.floor(mapWidth / blockSize) - 1;
            var streetX = blockX * blockSize + streetWidth / 2;
            var y = Math.random() * (mapHeight - 200) + 100;
            return { x: streetX, y: y };
    }
    
    // 默认返回地图中心的街道位置
    return { x: mapWidth / 2, y: streetWidth / 2 };
};

/**
 * 检查僵尸位置是否与建筑重叠（使用新的碰撞系统）
 */
GameEngine.prototype.checkZombiePositionOverlap = function(x, y) {
    return !this.canMoveToPosition(x, y, 20); // 僵尸半径20
};

/**
 * 创建单个NPC
 */
GameEngine.prototype.createNPC = function(characterId) {
    // 随机选择街道位置
    var position = this.getRandomStreetPosition();
    
    // 获取角色个性
    var character = this.characterManager.characters[characterId] || this.characterManager.characters[2];
    var personality = this.getCharacterPersonality(character);
    
    var npc = {
        id: characterId,
        characterId: characterId,
        x: position.x,
        y: position.y,
        isFollowing: false,
        
        // 角色相关
        character: character,
        
        // 个性化属性
        personality: personality,
        
        // 移动相关
        lastX: position.x,
        lastY: position.y,
        isWalking: false,
        walkAnimationFrame: 0,
        lastAnimationTime: 0,
        direction: 'down',
        
        // 跟随状态
        followStartTime: 0,
        lastFollowUpdate: 0,
        
        // 随机行为
        behaviorTimer: Math.random() * 1000,
        currentBehavior: 'idle'
    };
    
    return npc;
};

/**
 * 获取随机街道位置
 */
GameEngine.prototype.getRandomStreetPosition = function() {
    var blockSize = this.mapConfig.blockSize;
    var streetWidth = this.mapConfig.streetWidth;
    var mapWidth = this.mapConfig.width;
    var mapHeight = this.mapConfig.height;
    
    // 随机选择水平或垂直街道
    if (Math.random() < 0.5) {
        // 水平街道
        var blockY = Math.floor(Math.random() * Math.floor(mapHeight / blockSize));
        var streetY = blockY * blockSize + streetWidth / 2;
        var x = Math.random() * (mapWidth - 200) + 100; // 避免边界
        return { x: x, y: streetY };
    } else {
        // 垂直街道
        var blockX = Math.floor(Math.random() * Math.floor(mapWidth / blockSize));
        var streetX = blockX * blockSize + streetWidth / 2;
        var y = Math.random() * (mapHeight - 200) + 100; // 避免边界
        return { x: streetX, y: y };
    }
};

/**
 * 生成子地图内容
 */
GameEngine.prototype.generateSubMapContent = function() {
    this.zombies = [];
    this.resources = [];
    
    // 生成僵尸
    this.generateZombies();
    
    // 生成资源
    this.generateResources();
    
    console.log('[GameEngine] 子地图内容生成完成: ' + this.zombies.length + '只僵尸, ' + this.resources.length + '个资源');
};

/**
 * 生成僵尸
 */
GameEngine.prototype.generateZombies = function() {
    var random = Math.random();
    var count;
    
    if (random < 0.1) {
        count = 5 + Math.floor(Math.random() * 4); // 5-8只
    } else if (random < 0.3) {
        count = 1 + Math.floor(Math.random() * 2); // 1-2只
    } else {
        count = 3 + Math.floor(Math.random() * 2); // 3-4只
    }
    
    for (var i = 0; i < count; i++) {
        var zombie = {
            id: Math.random().toString(36).substr(2, 9),
            x: 80 + Math.random() * 240,
            y: 120 + Math.random() * 160,
            health: 15,
            maxHealth: 15,
            attack: this.gameData.isDay ? 5 : 10,
            moveSpeed: this.gameData.isDay ? 2 : 4,
            state: 'patrol',
            target: null,
            lastAttackTime: 0
        };
        
        this.zombies.push(zombie);
    }
};

/**
 * 生成资源
 */
GameEngine.prototype.generateResources = function() {
    var resourceChance = this.getResourceChance();
    
    if (Math.random() < resourceChance) {
        var resourceType = this.getResourceType();
        var resource = this.createResource(resourceType);
        
        if (resource) {
            this.resources.push(resource);
        }
    }
};

/**
 * 获取资源生成概率
 */
GameEngine.prototype.getResourceChance = function() {
    switch (this.subMapType) {
        case 'police_station':
        case 'hospital':
        case 'restaurant':
            return 0.8;
        case 'shop':
            return 0.6;
        case 'school':
        case 'house':
        case 'villa':
            return 0.7;
        default:
            return 0.3;
    }
};

/**
 * 获取资源类型
 */
GameEngine.prototype.getResourceType = function() {
    switch (this.subMapType) {
        case 'police_station':
            return 'companion_police';
        case 'hospital':
            return 'companion_nurse';
        case 'restaurant':
            return 'companion_chef';
        case 'shop':
            return Math.random() < 0.5 ? 'weapon' : 'weapon';
        case 'school':
        case 'house':
        case 'villa':
            return 'food';
        default:
            return 'food';
    }
};

/**
 * 创建资源
 */
GameEngine.prototype.createResource = function(type) {
    var resource = {
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 80,
        collected: false
    };
    
    switch (type) {
        case 'companion_police':
            resource.companionData = { name: '警察', type: 'police', health: 20, attack: 25, special: '远程攻击' };
            break;
        case 'companion_nurse':
            resource.companionData = { name: '护士', type: 'nurse', health: 15, attack: 8, special: '群体回血' };
            break;
        case 'companion_chef':
            resource.companionData = { name: '厨师', type: 'chef', health: 15, attack: 8, special: '每日产粮' };
            break;
        case 'food':
            resource.amount = this.getFoodAmount();
            break;
        case 'weapon':
            resource.weaponData = { name: '近战武器', damage: 10 };
            break;
    }
    
    return resource;
};

/**
 * 获取食物数量
 */
GameEngine.prototype.getFoodAmount = function() {
    switch (this.subMapType) {
        case 'school':
            return 3 + Math.floor(Math.random() * 3);
        case 'house':
            return 2 + Math.floor(Math.random() * 2);
        case 'villa':
            return 4 + Math.floor(Math.random() * 3);
        default:
            return 2 + Math.floor(Math.random() * 3);
    }
};

/**
 * 收集资源
 */
GameEngine.prototype.collectResource = function(resource) {
    if (resource.collected) return;
    
    resource.collected = true;
    
    switch (resource.type) {
        case 'companion_police':
        case 'companion_nurse':
        case 'companion_chef':
            if (this.companions.length < 7) { // 团队上限8人
                this.companions.push(resource.companionData);
                this.gameData.teamSize++;
                if (this.gameData.teamSize > this.gameData.maxTeamSize) {
                    this.gameData.maxTeamSize = this.gameData.teamSize;
                }
                console.log('[GameEngine] 新伙伴加入: ' + resource.companionData.name);
            }
            break;
        case 'food':
            this.gameData.food += resource.amount;
            this.gameData.totalFood += resource.amount;
            console.log('[GameEngine] 获得 ' + resource.amount + ' 份口粮');
            break;
        case 'weapon':
            this.player.attack = (this.player.attack || 20) + resource.weaponData.damage;
            console.log('[GameEngine] 获得武器，攻击力提升');
            break;
    }
};

// 退出子地图功能已统一到exitBuilding函数

/**
 * 启动游戏循环
 */
GameEngine.prototype.start = function() {
    this.running = true;
    this.lastTime = Date.now();
    this.gameLoop();
    console.log('[GameEngine] 游戏主循环启动');
};

/**
 * 游戏主循环
 */
GameEngine.prototype.gameLoop = function() {
    var self = this;
    
    if (!this.running) return;
    
    var currentTime = Date.now();
    var deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame(function() {
        self.gameLoop();
    });
};

/**
 * 更新游戏逻辑
 */
GameEngine.prototype.update = function(deltaTime) {
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        this.updatePlayer(deltaTime);
        this.updateTime(deltaTime);
        
        if (this.gameState === 'playing') {
            // 在主地图中更新僵尸
            this.zombieManager.update(deltaTime, this);
            this.updateCombat(deltaTime);
            this.updateTeamHealth(deltaTime);
        }
        
        if (this.gameState === 'submap') {
            this.updateZombies(deltaTime);
        }
    }
};

/**
 * 更新战斗系统（简化版本）
 */
GameEngine.prototype.updateCombat = function(deltaTime) {
    var currentTime = Date.now();
    
    // 只让玩家自动攻击附近的僵尸，简化逻辑
    if (!this.player.isDead && !this.player.isZombie && 
        currentTime - this.player.lastAttackTime >= this.player.attackCooldown) {
        
        var nearbyZombies = this.zombieManager.getZombiesInRange(
            this.player.x, this.player.y, this.player.attackRange
        );
        
        if (nearbyZombies.length > 0) {
            // 攻击最近的僵尸
            var targetZombie = nearbyZombies[0].zombie;
            this.attackZombie(this.player, targetZombie);
            this.player.lastAttackTime = currentTime;
        }
    }
    
    // 简化团队成员战斗，降低更新频率
    if (!this.teamCombatTimer) this.teamCombatTimer = 0;
    this.teamCombatTimer += deltaTime;
    
    // 每500ms更新一次团队战斗
    if (this.teamCombatTimer >= 500) {
        this.teamCombatTimer = 0;
        this.updateTeamCombat(currentTime);
    }
};

/**
 * 更新团队战斗（降低频率）
 */
GameEngine.prototype.updateTeamCombat = function(currentTime) {
    // 只更新前3个团队成员的战斗，避免过多计算
    var maxCombatMembers = Math.min(3, this.followers.length);
    
    for (var i = 0; i < maxCombatMembers; i++) {
        var follower = this.followers[i];
        
        // 确保跟随者有战斗属性
        if (!follower.attack) {
            follower.attack = 10;
            follower.attackRange = 30;
            follower.lastAttackTime = 0;
            follower.attackCooldown = 1200; // 稍微慢一点
            follower.health = follower.health || 30;
            follower.maxHealth = follower.maxHealth || 30;
            follower.isDead = false;
            follower.isZombie = false;
        }
        
        if (!follower.isDead && !follower.isZombie &&
            currentTime - follower.lastAttackTime >= follower.attackCooldown) {
            
            var nearbyZombies = this.zombieManager.getZombiesInRange(
                follower.x, follower.y, follower.attackRange
            );
            
            if (nearbyZombies.length > 0) {
                var targetZombie = nearbyZombies[0].zombie;
                this.attackZombie(follower, targetZombie);
                follower.lastAttackTime = currentTime;
            }
        }
    }
};

/**
 * 攻击僵尸
 */
GameEngine.prototype.attackZombie = function(attacker, zombie) {
    var damage = attacker.attack + Math.floor(Math.random() * 5); // 随机伤害
    var isDead = zombie.takeDamage(damage);
    
    console.log('[Combat]', attacker === this.player ? '玩家' : '团队成员', '攻击僵尸，造成', damage, '点伤害');
    
    if (isDead) {
        console.log('[Combat] 僵尸被击败');
    }
};

/**
 * 更新团队健康状态
 */
GameEngine.prototype.updateTeamHealth = function(deltaTime) {
    // 检查玩家是否死亡
    if (this.player.health <= 0 && !this.player.isDead) {
        this.player.isDead = true;
        console.log('[Health] 玩家死亡');
        
        // 如果玩家死亡，游戏结束
        this.gameOver('death');
        return;
    }
    
    // 检查团队成员健康状态
    for (var i = this.followers.length - 1; i >= 0; i--) {
        var follower = this.followers[i];
        
        if (follower.health <= 0 && !follower.isDead) {
            console.log('[Health] 团队成员死亡，转化为僵尸:', follower.characterId);
            this.convertToZombie(follower, i);
        }
    }
};

/**
 * 将死亡的团队成员转化为僵尸
 */
GameEngine.prototype.convertToZombie = function(follower, index) {
    // 创建一个新僵尸在死亡成员的位置
    var newZombie = this.zombieManager.createZombie('thin', follower.x, follower.y);
    if (newZombie) {
        // 设置为转化僵尸的特殊属性
        newZombie.isConverted = true;
        newZombie.originalName = follower.character ? follower.character.name : '团队成员';
        
        console.log('[Conversion] 团队成员', newZombie.originalName, '已转化为僵尸');
    }
    
    // 从团队中移除死亡成员
    this.followers.splice(index, 1);
    this.gameData.teamSize = this.followers.length + 1; // +1 for player
};

/**
 * 更新玩家
 */
GameEngine.prototype.updatePlayer = function(deltaTime) {
    var isMoving = (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0);
    
    if (isMoving) {
        // 设置行走状态
        this.player.isWalking = true;
        
        // 更新行走方向
        if (Math.abs(this.joystick.direction.x) > Math.abs(this.joystick.direction.y)) {
            this.player.direction = this.joystick.direction.x > 0 ? 'right' : 'left';
        } else {
            this.player.direction = this.joystick.direction.y > 0 ? 'down' : 'up';
        }
        
        // 更新行走动画帧
        this.updateWalkAnimation(deltaTime);
        
        var moveSpeed = 4; // 调整移动速度为原来的1/3
        var newX = this.player.x + this.joystick.direction.x * moveSpeed;
        var newY = this.player.y + this.joystick.direction.y * moveSpeed;
        
        // 边界检查和碰撞检测
        if (this.gameState === 'playing') {
            // 检查玩家是否可以移动到新位置
            if (this.canMoveToPosition(newX, newY, 18)) {
            var deltaX = newX - this.player.x;
            var deltaY = newY - this.player.y;
            
                this.player.x = newX;
                this.player.y = newY;
                this.moveTeam(deltaX, deltaY);
            } else {
                // 尝试单轴移动
                var canMoveX = this.canMoveToPosition(newX, this.player.y, 18);
                var canMoveY = this.canMoveToPosition(this.player.x, newY, 18);
                
                if (canMoveX) {
                    var deltaX = newX - this.player.x;
                    this.player.x = newX;
                    this.moveTeam(deltaX, 0);
                }
                if (canMoveY) {
                    var deltaY = newY - this.player.y;
                    this.player.y = newY;
                    this.moveTeam(0, deltaY);
                }
            }
            
        } else if (this.gameState === 'submap') {
            // 子地图中的团队移动边界检查
            var deltaX = newX - this.player.x;
            var deltaY = newY - this.player.y;
            
            if (this.canTeamMoveInSubmap(deltaX, deltaY)) {
                this.player.x = Math.max(60, Math.min(340, newX));
                this.player.y = Math.max(110, Math.min(290, newY));
                this.moveTeam(deltaX, deltaY);
            } else {
                // 尝试单轴移动
                var canMoveX = this.canTeamMoveInSubmap(deltaX, 0);
                var canMoveY = this.canTeamMoveInSubmap(0, deltaY);
                
                if (canMoveX) {
                    this.player.x = Math.max(60, Math.min(340, newX));
                    this.moveTeam(deltaX, 0);
                }
                if (canMoveY) {
                    this.player.y = Math.max(110, Math.min(290, newY));
                    this.moveTeam(0, deltaY);
                }
            }
        }
        
    } else {
        // 停止行走状态
        this.player.isWalking = false;
        this.player.walkAnimationFrame = 0;
    }
    
    // 更新摄像机位置
    if (this.gameState === 'playing') {
        this.updateCamera(deltaTime);
        // 更新NPC
        this.updateNPCs(deltaTime);
        // 检查是否接近建筑门（无论是否移动都检查）
        this.checkNearDoor();
    }
};

/**
 * 更新NPC系统
 */
GameEngine.prototype.updateNPCs = function(deltaTime) {
    for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];
        this.updateSingleNPC(npc, deltaTime);
    }
};

/**
 * 更新单个NPC
 */
GameEngine.prototype.updateSingleNPC = function(npc, deltaTime) {
    // 如果已经加入团队，跳过处理节省性能
    if (npc.isFollowing) {
        return;
    }
    
    var collisionThresholdSquared = 900; // 30^2 = 900，避免开方运算
    
    // 检查与玩家的碰撞（使用距离平方比较）
    var distanceSquaredToPlayer = 
        Math.pow(npc.x - this.player.x, 2) + 
        Math.pow(npc.y - this.player.y, 2);
    
    var shouldJoinTeam = distanceSquaredToPlayer < collisionThresholdSquared;
    
    // 如果与玩家未碰撞，检查与团队成员的碰撞
    if (!shouldJoinTeam) {
        for (var i = 0; i < this.followers.length; i++) {
            var follower = this.followers[i];
            var distanceSquaredToFollower = 
                Math.pow(npc.x - follower.x, 2) + 
                Math.pow(npc.y - follower.y, 2);
            
            if (distanceSquaredToFollower < collisionThresholdSquared) {
                shouldJoinTeam = true;
                break;
            }
        }
    }
    
    // 加入团队（防止重复加入）
    if (shouldJoinTeam) {
        // 检查是否已经在followers数组中
        var alreadyInTeam = false;
        for (var j = 0; j < this.followers.length; j++) {
            if (this.followers[j].id === npc.id) {
                alreadyInTeam = true;
                break;
            }
        }
        
        if (!alreadyInTeam) {
            npc.isFollowing = true;
            npc.followStartTime = Date.now();
            
            // 确保跟随者有正确的初始状态
            npc.lastX = npc.x;
            npc.lastY = npc.y;
            npc.isWalking = false;
            npc.walkAnimationFrame = 0;
            npc.lastAnimationTime = 0;
            npc.direction = 'down';
            
            this.followers.push(npc);
            console.log('[NPC] 角色', npc.characterId, '加入团队，个性类型:', npc.personality.personalityType, '当前团队人数:', this.followers.length);
            
            // 验证跟随者数组状态
            console.log('[NPC] 跟随者数组验证:', {
                length: this.followers.length,
                followers: this.followers.map(function(f) {
                    return {
                        id: f.characterId,
                        x: f.x,
                        y: f.y,
                        isFollowing: f.isFollowing
                    };
                })
            });
            
            // 新加入的NPC直接跟随，不刷新现有成员位置
            this.addNewFollowerToTeam(npc);
        }
    } else {
        // NPC未跟随时的个性化行为
        this.updateNPCIdleBehavior(npc, deltaTime);
    }
};

/**
 * 添加新跟随者到团队 - 不影响现有成员位置
 */
GameEngine.prototype.addNewFollowerToTeam = function(newFollower) {
    // 计算新跟随者的理想位置
    var character = newFollower.character || this.characterManager.characters[2];
    var personality = this.getCharacterPersonality(character);
    
    // 新跟随者直接跟随到玩家附近
    var targetOffset = this.calculateFollowerOffset(newFollower, personality);
    newFollower.x = this.player.x + targetOffset.x;
    newFollower.y = this.player.y + targetOffset.y;
    
    // 更新动画状态
    newFollower.isWalking = false;
    newFollower.direction = 'down';
    
    console.log('[Follower] 新成员', newFollower.characterId, '加入团队，位置:', newFollower.x, newFollower.y);
};

/**
 * 更新所有跟随者的位置，让它们围绕玩家
 */
GameEngine.prototype.updateFollowerPositions = function() {
    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        var character = follower.character || this.characterManager.characters[2];
        var personality = this.getCharacterPersonality(character);
        
        // 计算理想位置
        var targetOffset = this.calculateFollowerOffset(follower, personality);
        var targetX = this.player.x + targetOffset.x;
        var targetY = this.player.y + targetOffset.y;
        
        // 立即移动到理想位置（避免重叠）
        follower.x = targetX;
        follower.y = targetY;
        
        // 更新动画状态
        follower.isWalking = false;
        follower.direction = 'down';
        
        console.log('[Follower] 角色', follower.characterId, '位置更新到:', targetX, targetY);
    }
};

// 旧的团队碰撞检测函数已被新系统替代

// 团队移动系统已优化

/**
 * 移动整个团队 - 智能跟随系统
 */
GameEngine.prototype.moveTeam = function(deltaX, deltaY) {
    var self = this;
    
    // 为每个跟随者计算个性化的移动，允许绕过障碍物
    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        self.moveSingleFollower(follower, deltaX, deltaY);
    }
};

/**
 * 移动单个跟随者 - 带建筑碰撞检测的智能跟随系统
 */
GameEngine.prototype.moveSingleFollower = function(follower, deltaX, deltaY) {
    // 获取角色的个性化属性
    var character = follower.character || this.characterManager.characters[2];
    var personality = this.getCharacterPersonality(character);
    
    // 计算跟随者的目标位置（相对于玩家）
    var targetOffset = this.calculateFollowerOffset(follower, personality);
    var targetX = this.player.x + targetOffset.x;
    var targetY = this.player.y + targetOffset.y;
    
    // 计算当前跟随者到目标位置的距离
    var currentDistance = Math.sqrt(
        Math.pow(follower.x - targetX, 2) + 
        Math.pow(follower.y - targetY, 2)
    );
    
    // 智能跟随逻辑
    if (currentDistance > 15) { // 如果距离超过15像素
        var directionX = targetX - follower.x;
        var directionY = targetY - follower.y;
        var distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        if (distance > 0) {
            // 标准化方向向量
            directionX /= distance;
            directionY /= distance;
            
            // 根据距离调整移动速度
            var moveSpeed;
            if (currentDistance > 100) {
                moveSpeed = 4;
            } else if (currentDistance > 50) {
                moveSpeed = 3;
            } else {
                moveSpeed = 2;
            }
            
            var moveDistance = Math.min(moveSpeed, currentDistance);
            
            // 计算新位置
            var newX = follower.x + directionX * moveDistance;
            var newY = follower.y + directionY * moveDistance;
            
            // 使用新的碰撞检测系统
            if (this.canMoveToPosition(newX, newY, 15)) { // 跟随者稍小一点
                // 没有碰撞，直接移动
                follower.x = newX;
                follower.y = newY;
            } else {
                // 有碰撞，尝试单轴移动
                if (this.canMoveToPosition(newX, follower.y, 15)) {
                    follower.x = newX;
                } else if (this.canMoveToPosition(follower.x, newY, 15)) {
                    follower.y = newY;
                } else {
                    // 寻找替代路径
                    var alternativePath = this.findAlternativePathForFollower(follower, targetX, targetY);
                if (alternativePath.success) {
                    follower.x = alternativePath.x;
                    follower.y = alternativePath.y;
                    }
                }
            }
            
            // 标记为行走状态
            follower.isWalking = true;
            follower.direction = this.getDirectionFromDelta(directionX, directionY);
        }
    } else {
        // 到达目标位置附近，停止行走
        follower.isWalking = false;
    }
    
    // 更新跟随者的动画状态
    this.updateFollowerAnimation(follower, personality);
    
    // 确保跟随者在地图边界内
    follower.x = Math.max(50, Math.min(this.mapConfig.width - 50, follower.x));
    follower.y = Math.max(50, Math.min(this.mapConfig.height - 50, follower.y));
};

/**
 * 获取角色个性属性
 */
GameEngine.prototype.getCharacterPersonality = function(character) {
    // 基于角色ID生成个性化属性
    var characterId = character.id || 2;
    var seed = characterId * 12345; // 使用角色ID作为种子
    
    // 生成伪随机但一致的个性
    var random = this.seededRandom(seed);
    
    return {
        // 跟随距离：每个角色有不同的理想跟随距离
        followDistance: 35 + (random() * 20 - 10), // 25-45像素范围
        
        // 移动速度：每个角色有不同的移动速度
        moveSpeed: 0.8 + (random() * 0.4), // 0.8-1.2倍玩家速度
        
        // 跟随积极性：影响角色追赶玩家的速度
        followAggressiveness: 0.7 + (random() * 0.6), // 0.7-1.3倍
        
        // 随机性：角色移动的随机程度
        randomness: random() * 0.3, // 0-0.3的随机因子
        
        // 反应延迟：角色对玩家移动的反应速度
        reactionDelay: random() * 200, // 0-200ms的延迟
        
        // 个性类型
        personalityType: this.getPersonalityType(characterId)
    };
};

/**
 * 计算跟随者的理想偏移位置
 */
GameEngine.prototype.calculateFollowerOffset = function(follower, personality) {
    var index = this.followers.indexOf(follower);
    var totalFollowers = this.followers.length;
    
    // 基础跟随模式：围绕玩家形成弧形或圆形
    var baseAngle = (index / totalFollowers) * Math.PI * 2;
    var radius = personality.followDistance;
    
    // 根据个性类型调整跟随模式
    switch (personality.personalityType) {
        case 'leader':
            // 领导者类型：紧跟在玩家身后
            return { x: -15, y: 0 };
            
        case 'supporter':
            // 支持者类型：在玩家侧面
            return { x: index % 2 === 0 ? 25 : -25, y: (index % 2 === 0 ? 1 : -1) * 20 };
            
        case 'scout':
            // 侦察者类型：在玩家前方
            return { x: 20, y: -15 };
            
        case 'guardian':
            // 守护者类型：在玩家周围形成保护圈
            var angle = baseAngle + (index * 0.3);
            return {
                x: Math.cos(angle) * radius * 0.8,
                y: Math.sin(angle) * radius * 0.8
            };
            
        case 'independent':
            // 独立者类型：保持较大距离
            var angle = baseAngle + (index * 0.5);
            return {
                x: Math.cos(angle) * (radius + 10),
                y: Math.sin(angle) * (radius + 10)
            };
            
        default:
            // 默认：围绕玩家形成弧形
            var angle = baseAngle + (index * 0.2);
            return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            };
    }
};

/**
 * 获取个性类型
 */
GameEngine.prototype.getPersonalityType = function(characterId) {
    var types = ['leader', 'supporter', 'scout', 'guardian', 'independent'];
    return types[characterId % types.length];
};

/**
 * 更新跟随者动画
 */
GameEngine.prototype.updateFollowerAnimation = function(follower, personality) {
    // 计算跟随者的移动方向
    var deltaX = follower.x - (follower.lastX || follower.x);
    var deltaY = follower.y - (follower.lastY || follower.y);
    
    // 更新跟随者的动画状态
    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        follower.isWalking = true;
        follower.direction = this.getDirectionFromDelta(deltaX, deltaY);
        
        // 个性化动画速度
        if (!follower.lastAnimationTime) follower.lastAnimationTime = 0;
        follower.lastAnimationTime += 16; // 假设16ms每帧
        
        var animationSpeed = personality.moveSpeed * 200; // 基于移动速度的动画速度
        if (follower.lastAnimationTime >= animationSpeed) {
            follower.walkAnimationFrame = (follower.walkAnimationFrame || 0) + 1;
            if (follower.walkAnimationFrame >= 4) follower.walkAnimationFrame = 0;
            follower.lastAnimationTime = 0;
        }
    } else {
        follower.isWalking = false;
    }
    
    // 保存当前位置用于下次计算
    follower.lastX = follower.x;
    follower.lastY = follower.y;
    
    // 调试信息
    if (follower.isWalking) {
        console.log('[Follower] 角色', follower.characterId, '正在行走，方向:', follower.direction, '动画帧:', follower.walkAnimationFrame);
    }
};

/**
 * 从移动增量获取方向
 */
GameEngine.prototype.getDirectionFromDelta = function(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
    } else {
        return deltaY > 0 ? 'down' : 'up';
    }
};

/**
 * 种子随机数生成器 - 确保相同角色ID总是生成相同的个性
 */
GameEngine.prototype.seededRandom = function(seed) {
    var m = 0x80000000;
    var a = 1103515245;
    var c = 12345;
    var state = seed ? seed : Math.floor(Math.random() * (m - 1));
    
    return function() {
        state = (a * state + c) % m;
        return (state & (m - 1)) / (m - 1);
    };
};

/**
 * 检查团队在子地图中是否可以移动
 */
GameEngine.prototype.canTeamMoveInSubmap = function(deltaX, deltaY) {
    var submapBounds = { minX: 60, maxX: 340, minY: 110, maxY: 290 };
    
    // 检查玩家边界
    var playerNewX = this.player.x + deltaX;
    var playerNewY = this.player.y + deltaY;
    if (playerNewX < submapBounds.minX || playerNewX > submapBounds.maxX ||
        playerNewY < submapBounds.minY || playerNewY > submapBounds.maxY) {
        return false;
    }
    
    // 检查所有团队成员边界
    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        var followerNewX = follower.x + deltaX;
        var followerNewY = follower.y + deltaY;
        
        if (followerNewX < submapBounds.minX || followerNewX > submapBounds.maxX ||
            followerNewY < submapBounds.minY || followerNewY > submapBounds.maxY) {
            return false;
        }
    }
    
    return true;
};

/**
 * 更新行走动画
 */
GameEngine.prototype.updateWalkAnimation = function(deltaTime) {
    this.player.lastAnimationTime += deltaTime;
    
    if (this.player.lastAnimationTime >= this.player.walkAnimationSpeed) {
        this.player.walkAnimationFrame = (this.player.walkAnimationFrame + 1) % 4; // 4帧循环
        this.player.lastAnimationTime = 0;
    }
};

/**
 * 检查角色与建筑的碰撞 - 通用版本
 */
GameEngine.prototype.checkCollisionWithBuildings = function(x, y, characterRadius) {
    characterRadius = characterRadius || 18; // 默认角色半径
    var bufferDistance = 2; // 小缓冲距离
    var effectiveRadius = characterRadius + bufferDistance;
    
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
            
            // 检查是否与建筑主体碰撞
            if (this.circleRectCollision(x, y, effectiveRadius, building.x, building.y, building.width, building.height)) {
            // 计算门的位置和尺寸（使用原始门尺寸，不是扩展的）
            var doorInfo = this.calculateDoorInfo(building);
            var originalDoorX = doorInfo.originalX;
            var originalDoorY = doorInfo.originalY;
            var originalDoorWidth = doorInfo.originalWidth;
            var originalDoorHeight = doorInfo.originalHeight;
            
            // 检查是否在真实门区域内（只有门区域可以通过）
            var doorEffectiveRadius = characterRadius;
            
            if (this.circleRectCollision(x, y, doorEffectiveRadius, originalDoorX, originalDoorY, originalDoorWidth, originalDoorHeight)) {
                    // 在门区域内，允许通过
                return { collision: false, building: null, inDoor: true };
            } else {
                // 不在门区域内，发生碰撞
                return { collision: true, building: building, inDoor: false };
            }
        }
    }
    
    return { collision: false, building: null, inDoor: false };
};

/**
 * 检查指定位置是否可以移动（通用函数）
 */
GameEngine.prototype.canMoveToPosition = function(x, y, characterRadius) {
    // 地图边界检查
    var margin = characterRadius || 18;
    if (x < margin || x > this.mapConfig.width - margin ||
        y < margin || y > this.mapConfig.height - margin) {
        return false;
    }
    
    // 建筑碰撞检查
    var collision = this.checkCollisionWithBuildings(x, y, characterRadius);
    return !collision.collision;
};

/**
 * 检查角色是否在门区域内
 */
GameEngine.prototype.isCharacterInDoorArea = function(x, y, building) {
    var playerRadius = 18;
    var doorBufferDistance = 3; // 门区域缓冲距离
    var doorEffectiveRadius = playerRadius + doorBufferDistance;
    
    var doorInfo = this.calculateDoorInfo(building);
    
    // 检查是否在门区域内
    var inDoorArea = this.circleRectCollision(x, y, doorEffectiveRadius, doorInfo.x, doorInfo.y, doorInfo.width, doorInfo.height);
    
    if (this.debugMode && inDoorArea) {
        console.log('[Door] 角色在门区域内:', {
            position: { x: x, y: y },
            door: { x: doorInfo.x, y: doorInfo.y, width: doorInfo.width, height: doorInfo.height },
            building: building.name
        });
    }
    
    return inDoorArea;
};

// 碰撞检测系统已优化

/**
 * 为跟随者寻找替代路径（绕过障碍物）- 优化版本
 */
GameEngine.prototype.findAlternativePathForFollower = function(follower, targetX, targetY) {
    var searchRadius = 40; // 增加搜索半径
    var stepSize = 8; // 增加步长以减少计算
    
    // 尝试8个方向寻找可移动位置
    var directions = [
        { dx: 1, dy: 0 },   // 右
        { dx: -1, dy: 0 },  // 左
        { dx: 0, dy: 1 },   // 下
        { dx: 0, dy: -1 },  // 上
        { dx: 1, dy: 1 },   // 右下
        { dx: 1, dy: -1 },  // 右上
        { dx: -1, dy: 1 },  // 左下
        { dx: -1, dy: -1 }  // 左上
    ];
    
    for (var radius = stepSize; radius <= searchRadius; radius += stepSize) {
        for (var i = 0; i < directions.length; i++) {
            var dir = directions[i];
            var testX = follower.x + dir.dx * radius;
            var testY = follower.y + dir.dy * radius;
            
            // 使用新的碰撞检测系统
            if (this.canMoveToPosition(testX, testY, 15)) {
                // 检查是否更接近目标
                var currentDistance = Math.sqrt(
                    Math.pow(follower.x - targetX, 2) + 
                    Math.pow(follower.y - targetY, 2)
                );
                var testDistance = Math.sqrt(
                    Math.pow(testX - targetX, 2) + 
                    Math.pow(testY - targetY, 2)
                );
                
                if (testDistance < currentDistance) {
                    return { success: true, x: testX, y: testY };
                }
            }
        }
    }
    
    return { success: false };
};

/**
 * 渲染建筑进入询问提示
 */
GameEngine.prototype.renderBuildingEntryPrompt = function() {
    console.log('[Render] renderBuildingEntryPrompt被调用，状态:', this.buildingEntryPrompt);
    
    if (!this.buildingEntryPrompt || !this.buildingEntryPrompt.active) {
        console.log('[Render] 询问提示未激活，跳过渲染');
        return;
    }
    
    console.log('[Render] 开始渲染询问提示');
    var prompt = this.buildingEntryPrompt;
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 半透明背景
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 提示框背景
    var boxWidth = 300;
    var boxHeight = 150;
    var boxX = centerX - boxWidth / 2;
    var boxY = centerY - boxHeight / 2;
    
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeStyle = '#3498db';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // 标题
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('进入建筑', centerX, boxY + 30);
    
    // 消息
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(prompt.message, centerX, boxY + 60);
    
    // 按钮
    var buttonWidth = 80;
    var buttonHeight = 35;
    var buttonY = boxY + 90;
    
    // 进入按钮
    var enterButtonX = centerX - buttonWidth - 20;
    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(enterButtonX, buttonY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('进入', centerX - buttonWidth - 20 + buttonWidth/2, buttonY + 25);
    
    // 取消按钮
    var cancelButtonX = centerX + 20;
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.fillRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('取消', centerX + 20 + buttonWidth/2, buttonY + 25);
    
    this.ctx.restore();
};

/**
 * 检查玩家是否接近建筑门
 */
GameEngine.prototype.checkNearDoor = function() {
    var playerRadius = 18;
    var interactionDistance = 60; // 增加交互距离，让提示更容易触发
    var triggerDistance = 50; // 提示触发距离
    var self = this;
    
    // 检查退出建筑冷却时间
    if (this.buildingExitCooldown > Date.now()) {
        // 在冷却期间，清除任何进入提示
        if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
            this.buildingEntryPrompt = null;
        }
        return;
    }
    
    // 重置当前接近的建筑
    this.nearBuilding = null;
    
    // 检查可见区域内的建筑
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;
    
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        
        // 只检查可见区域内的建筑
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.x + doorInfo.width / 2;
            var doorCenterY = doorInfo.y + doorInfo.height / 2;
            
            // 检查玩家距离门的距离
            var playerDistance = Math.sqrt(
                Math.pow(this.player.x - doorCenterX, 2) + 
                Math.pow(this.player.y - doorCenterY, 2)
            );
            
            // 简化逻辑：只检查玩家是否接近门
            if (playerDistance <= interactionDistance) {
                this.nearBuilding = building;
                
                // 检查是否在进入范围内，显示询问提示
                if (playerDistance <= triggerDistance) {
                    // 避免重复设置相同的提示
                    if (!this.buildingEntryPrompt || 
                        !this.buildingEntryPrompt.active ||
                        this.buildingEntryPrompt.buildingId !== (building.id || building.name)) {
                        
                        console.log('[Door] 玩家接近建筑入口:', building.name, '距离:', playerDistance.toFixed(1));
                    
                    // 设置询问状态，绑定到特定建筑
                    this.buildingEntryPrompt = {
                        building: building,
                            buildingId: building.id || building.name,
                        active: true,
                        message: '是否进入 ' + building.name + '？',
                        options: ['进入', '取消']
                    };
                    
                        console.log('[Door] 询问提示已设置，建筑:', building.name);
                    }
                }
                break;
            }
        }
    }
    
    // 如果没有接近任何建筑，清除询问提示
    if (!this.nearBuilding && this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        console.log('[Door] 离开建筑门口，清除询问提示');
        this.buildingEntryPrompt = null;
    }
};

/**
 * 计算建筑门的信息
 */
GameEngine.prototype.calculateDoorInfo = function(building) {
    var doorWidth = Math.max(30, Math.floor(building.width / 8));
    var doorHeight = Math.max(40, Math.floor(building.height / 6));
    var doorX = building.x + (building.width - doorWidth) / 2;
    var doorY = building.y + building.height - doorHeight - 5;
    
    // 扩大门的交互区域，让玩家更容易接近
    var expandedDoorX = doorX - 20;
    var expandedDoorY = doorY - 20;
    var expandedDoorWidth = doorWidth + 40;
    var expandedDoorHeight = doorHeight + 40;
    
    return {
        x: expandedDoorX,
        y: expandedDoorY,
        width: expandedDoorWidth,
        height: expandedDoorHeight,
        originalX: doorX,
        originalY: doorY,
        originalWidth: doorWidth,
        originalHeight: doorHeight
    };
};

/**
 * 圆形与矩形碰撞检测 - 改进版本
 */
GameEngine.prototype.circleRectCollision = function(circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight) {
    // 找到矩形上距离圆心最近的点
    var closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    var closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
    
    // 计算距离
    var distanceX = circleX - closestX;
    var distanceY = circleY - closestY;
    var distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    // 添加调试信息
    if (this.debugMode) {
        console.log('[Collision] 圆形矩形碰撞检测:', {
            circle: { x: circleX, y: circleY, radius: circleRadius },
            rect: { x: rectX, y: rectY, width: rectWidth, height: rectHeight },
            closest: { x: closestX, y: closestY },
            distance: Math.sqrt(distanceSquared),
            collision: distanceSquared < (circleRadius * circleRadius)
        });
    }
    
    return distanceSquared < (circleRadius * circleRadius);
};

/**
 * 更新摄像机 - 始终跟随玩家
 */
GameEngine.prototype.updateCamera = function(deltaTime) {
    if (!this.camera.followTarget) return;
    
    // 考虑缩放因子的视野大小
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    
    // 计算目标摄像机位置（让玩家居中）
    var targetX = this.camera.followTarget.x - viewWidth / 2;
    var targetY = this.camera.followTarget.y - viewHeight / 2;
    
    // 边界限制
    targetX = Math.max(0, Math.min(this.mapConfig.width - viewWidth, targetX));
    targetY = Math.max(0, Math.min(this.mapConfig.height - viewHeight, targetY));
    
    // 平滑跟随 - 确保摄像机始终跟随玩家
    var smoothing = this.camera.smoothing || 0.1;
    this.camera.x += (targetX - this.camera.x) * smoothing;
    this.camera.y += (targetY - this.camera.y) * smoothing;
    
    // 确保摄像机不会卡住
    if (Math.abs(targetX - this.camera.x) < 1) this.camera.x = targetX;
    if (Math.abs(targetY - this.camera.y) < 1) this.camera.y = targetY;
    
    // 调试：摄像机状态
    if (this.debugMode) {
        console.log('[Camera] 摄像机位置:', this.camera.x, this.camera.y, '目标:', targetX, targetY);
    }
};

/**
 * 更新游戏时间
 */
GameEngine.prototype.updateTime = function(deltaTime) {
    var self = this;
    this.gameData.timeRemaining -= deltaTime;
    
    if (this.gameData.timeRemaining <= 0) {
        if (this.gameData.isDay) {
            this.gameData.isDay = false;
            this.gameData.timeRemaining = 60000; // 1分钟夜晚
            console.log('[GameEngine] 夜幕降临');
        } else {
            this.gameData.isDay = true;
            this.gameData.timeRemaining = 300000; // 5分钟白天
            this.gameData.survivalDays++;
            
            // 消耗口粮
            var foodCost = this.gameData.teamSize;
            this.gameData.food -= foodCost;
            
            console.log('[GameEngine] 第' + this.gameData.survivalDays + '天，消耗口粮' + foodCost + '份');
            
            // 检查口粮是否足够
            if (this.gameData.food < 0) {
                this.gameOver('starvation');
                return;
            }
            
            // 检查是否通关
            if (this.gameData.survivalDays > 100) {
                this.gameWin();
                return;
            }
            
            // 新的一天开始时生成更多僵尸
            this.spawnNewDayZombies();
            
            // 厨师每日产粮
            this.companions.forEach(function(companion) {
                if (companion.type === 'chef') {
                    self.gameData.food += 5;
                    self.gameData.totalFood += 5;
                }
            });
        }
    }
};

/**
 * 更新僵尸
 */
GameEngine.prototype.updateZombies = function(deltaTime) {
    var self = this;
    
    this.zombies.forEach(function(zombie) {
        // 简单的僵尸AI
        var dx = self.player.x - zombie.x;
        var dy = self.player.y - zombie.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100 && distance > 30) {
            // 追击玩家
            var moveDistance = zombie.moveSpeed * (deltaTime / 1000);
            zombie.x += (dx / distance) * moveDistance;
            zombie.y += (dy / distance) * moveDistance;
        } else if (distance <= 30) {
            // 攻击玩家
            var currentTime = Date.now();
            if (currentTime - zombie.lastAttackTime >= 1000) {
                self.player.health -= zombie.attack;
                zombie.lastAttackTime = currentTime;
                
                if (self.player.health <= 0) {
                    self.gameOver('death');
                }
            }
        }
    });
    
    // 移除死亡僵尸
    this.zombies = this.zombies.filter(function(zombie) {
        return zombie.health > 0;
    });
};

/**
 * 游戏结束
 */
GameEngine.prototype.gameOver = function(cause) {
    this.gameState = 'gameover';
    this.gameData.cause = cause;
    console.log('[GameEngine] 游戏结束: ' + cause);
};

/**
 * 游戏胜利
 */
GameEngine.prototype.gameWin = function() {
    this.gameState = 'victory';
    console.log('[GameEngine] 游戏胜利');
};

/**
 * 渲染游戏
 */
GameEngine.prototype.render = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    switch (this.gameState) {
        case 'menu':
            this.renderMenu();
            break;
        case 'playing':
            this.renderGame();
            break;
        case 'submap':
            this.renderSubMap();
            break;
        case 'gameover':
            this.renderGameOver();
            break;
        case 'victory':
            this.renderVictory();
            break;
    }
    
    // 渲染虚拟摇杆（游戏中始终显示）
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        this.renderJoystick();
    }
    
    // 渲染FPS（调试用）
    if (this.showFPS) {
        this.renderFPS();
    }
};

/**
 * 渲染FPS信息
 */
GameEngine.prototype.renderFPS = function() {
    if (!this.fps) return;
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('FPS: ' + this.fps, 10, 20);
    this.ctx.fillText('Delta: ' + this.deltaTime.toFixed(2) + 'ms', 10, 40);
};

/**
 * 渲染游戏结束画面
 */
GameEngine.prototype.renderGameOver = function() {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 半透明黑色背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 游戏结束标题
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束', centerX, centerY - 60);
    
    // 生存天数
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('生存天数: ' + this.gameData.survivalDays, centerX, centerY);
    
    // 击杀僵尸数
    this.ctx.fillText('击杀僵尸: ' + this.gameData.zombieKills, centerX, centerY + 40);
    
    // 重新开始按钮
    this.ctx.fillStyle = '#3498db';
    this.ctx.fillRect(centerX - 80, centerY + 80, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('重新开始', centerX, centerY + 110);
    
    // 返回菜单按钮
    this.ctx.fillStyle = '#95a5a6';
    this.ctx.fillRect(centerX - 80, centerY + 150, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('返回菜单', centerX, centerY + 180);
};

/**
 * 渲染胜利画面
 */
GameEngine.prototype.renderVictory = function() {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 半透明金色背景
    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 胜利标题
    this.ctx.fillStyle = '#f39c12';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('胜利！', centerX, centerY - 60);
    
    // 恭喜信息
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('恭喜你生存了100天！', centerX, centerY);
    
    // 最终统计
    this.ctx.fillText('最终击杀数: ' + this.gameData.zombieKills, centerX, centerY + 40);
    this.ctx.fillText('最终团队规模: ' + this.gameData.teamSize, centerX, centerY + 70);
    
    // 重新开始按钮
    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(centerX - 80, centerY + 100, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('重新开始', centerX, centerY + 130);
    
    // 返回菜单按钮
    this.ctx.fillStyle = '#95a5a6';
    this.ctx.fillRect(centerX - 80, centerY + 170, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('返回菜单', centerX, centerY + 190);
};

/**
 * 渲染菜单
 */
GameEngine.prototype.renderMenu = function() {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 创建渐变背景
    var gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 添加背景装饰网格
    this.renderBackgroundGrid();
    
    // 添加末日风格装饰元素
    this.renderDecorations();
    
    // 游戏标题 - 主标题
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(255, 87, 51, 0.8)';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.fillStyle = '#ff5733';
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('末日Q行', centerX, 120);
    
    // 标题下方的装饰线
    this.ctx.strokeStyle = '#ff5733';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 100, 140);
    this.ctx.lineTo(centerX + 100, 140);
    this.ctx.stroke();
    this.ctx.restore();
    
    // 副标题
    this.ctx.fillStyle = '#e8e8e8';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('生存至100天的挑战', centerX, 170);
    
    // 游戏特色信息
    this.renderGameFeatures(centerX);
    
    // 开始游戏按钮 - 增强版
    this.renderStartButton(centerX);
    
    // 底部信息
    this.renderFooterInfo(centerX);
    
    this.ctx.textAlign = 'left';
};

/**
 * 渲染背景网格装饰
 */
GameEngine.prototype.renderBackgroundGrid = function() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    
    var gridSize = 40;
    
    // 垂直线
    for (var x = 0; x < this.canvas.width; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    }
    
    // 水平线
    for (var y = 0; y < this.canvas.height; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
    }
    
    this.ctx.restore();
};

/**
 * 渲染装饰元素
 */
GameEngine.prototype.renderDecorations = function() {
    var centerX = this.canvas.width / 2;
    
    // 左上角僵尸图标装饰
    this.ctx.save();
    this.ctx.fillStyle = '#8b0000';
    this.ctx.beginPath();
    this.ctx.arc(50, 50, 15, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(48, 48, 3, 0, Math.PI * 2);
    this.ctx.arc(52, 48, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    
    // 右上角警告标志
    this.ctx.save();
    this.ctx.strokeStyle = '#ff5733';
    this.ctx.fillStyle = '#ff5733';
    this.ctx.lineWidth = 3;
    
    var warningX = this.canvas.width - 50;
    var warningY = 50;
    
    this.ctx.beginPath();
    this.ctx.moveTo(warningX, warningY - 15);
    this.ctx.lineTo(warningX - 13, warningY + 15);
    this.ctx.lineTo(warningX + 13, warningY + 15);
    this.ctx.closePath();
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('!', warningX, warningY + 5);
    this.ctx.restore();
    
    // 底部装饰条
    var decorY = this.canvas.height - 60;
    this.ctx.fillStyle = 'rgba(255, 87, 51, 0.2)';
    this.ctx.fillRect(0, decorY, this.canvas.width, 4);
    
    this.ctx.fillStyle = 'rgba(255, 87, 51, 0.4)';
    this.ctx.fillRect(0, decorY + 8, this.canvas.width, 2);
};

/**
 * 渲染游戏特色信息
 */
GameEngine.prototype.renderGameFeatures = function(centerX) {
    var features = [
        '🧟 对抗僵尸群',
        '🏠 探索建筑物',
        '👥 招募伙伴',
        '🍞 管理资源'
    ];
    
    this.ctx.fillStyle = '#b8c6db';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    
    var startY = 200;
    var spacing = 25;
    
    for (var i = 0; i < features.length; i++) {
        this.ctx.fillText(features[i], centerX, startY + i * spacing);
    }
};

/**
 * 渲染增强版开始按钮
 */
GameEngine.prototype.renderStartButton = function(centerX) {
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    var buttonY = 320;
    
    // 按钮阴影
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 4;
    
    // 按钮渐变背景
    var buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
    buttonGradient.addColorStop(0, '#4CAF50');
    buttonGradient.addColorStop(0.5, '#45a049');
    buttonGradient.addColorStop(1, '#3d8b40');
    
    this.ctx.fillStyle = buttonGradient;
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 按钮发光效果
    this.ctx.shadowColor = 'rgba(76, 175, 80, 0.6)';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    this.ctx.restore();
    
    // 按钮文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🎮 开始游戏', centerX, buttonY + buttonHeight / 2 + 7);
    
    // 按钮装饰
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(buttonX + 5, buttonY + 5, buttonWidth - 10, buttonHeight - 10);
};

/**
 * 渲染底部信息
 */
GameEngine.prototype.renderFooterInfo = function(centerX) {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    
    var footerY = this.canvas.height - 30;
    this.ctx.fillText('点击开始按钮进入末日世界', centerX, footerY);
    
    // 版本信息
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.font = '10px Arial';
    this.ctx.fillText('v1.0 - 抖音小程序版', centerX, footerY + 15);
};

/**
 * 渲染游戏主界面
 */
GameEngine.prototype.renderGame = function() {
    // 保存上下文状态
    this.ctx.save();
    
    // 应用缩放和摄像机变换
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);
    
    // 渲染地图背景
    this.renderMapBackground();
    
    // 绘制街道网格
    this.renderStreetGrid();
    
    // 绘制可见区域内的建筑物
    this.renderVisibleBuildings();
    
    // 绘制玩家
    this.renderPlayer();
    
    // 绘制NPC
    this.renderNPCs();
    
    // 绘制团队成员 - 使用个性化渲染
    this.renderFollowers();
    
    // 绘制僵尸
    this.zombieManager.render(this.ctx, this.camera);
    
    // 恢复上下文状态
    this.ctx.restore();
    
    // 渲染UI（不受摄像机影响）
    this.renderStatusBar();
    this.renderTimeInfo();
    this.renderMiniMap();
    this.renderInteractionHint();
    
    // 渲染建筑进入询问提示（不受摄像机影响）
    if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        this.renderBuildingEntryPrompt();
    }
};

/**
 * 渲染所有NPC
 */
GameEngine.prototype.renderNPCs = function() {
    // 只渲染可见区域内的NPC
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;
    
    for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];
        
        // 检查NPC是否在可见区域内
        if (npc.x >= viewLeft - 50 && npc.x <= viewRight + 50 &&
            npc.y >= viewTop - 50 && npc.y <= viewBottom + 50) {
            
            this.renderSingleNPC(npc);
        }
    }
};

/**
 * 渲染单个NPC
 */
GameEngine.prototype.renderSingleNPC = function(npc) {
    // 创建一个虚拟的player对象用于动画
    var npcPlayer = {
        isWalking: npc.speed > 0 && !npc.isFollowing || (npc.isFollowing && npc.speed > 0),
        walkAnimationFrame: (Date.now() / 200) % 4, // 简单的动画帧
        walkAnimationSpeed: 200,
        lastAnimationTime: 0,
        direction: 'down'
    };
    
    // 使用对应的角色渲染器
    if (npc.character && npc.character.render) {
        npc.character.render(this.ctx, npc.x, npc.y, npcPlayer);
    } else {
        // 后备渲染方案
        this.renderDefaultNPC(npc);
    }
    
    // 如果NPC正在跟随，显示一个小指示器
    if (npc.isFollowing) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(npc.x, npc.y - 40, 5, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
    }
};

/**
 * 默认NPC渲染（后备方案）
 */
GameEngine.prototype.renderDefaultNPC = function(npc) {
    this.ctx.save();
    
    // 简单的方块角色
    this.ctx.fillStyle = '#3498db';
    this.ctx.fillRect(npc.x - 8, npc.y - 8, 16, 16);
    
    // 角色编号
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(npc.characterId.toString(), npc.x, npc.y + 3);
    
    this.ctx.restore();
};

/**
 * 在子地图中渲染团队成员
 */
GameEngine.prototype.renderNPCsInSubMap = function() {
    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        this.renderSingleNPC(follower);
    }
};

/**
 * 渲染跟随者 - 个性化渲染
 */
GameEngine.prototype.renderFollowers = function() {
    try {
        if (!this.followers || !Array.isArray(this.followers)) {
            console.warn('[Render] 跟随者数组无效:', this.followers);
            return;
        }
        
        console.log('[Render] 开始渲染跟随者，数量:', this.followers.length);
        
        for (var i = 0; i < this.followers.length; i++) {
            var follower = this.followers[i];
            
            // 验证跟随者对象
            if (!follower || typeof follower.x !== 'number' || typeof follower.y !== 'number') {
                console.warn('[Render] 跟随者对象无效:', follower);
                continue;
            }
            
            console.log('[Render] 渲染跟随者', i, ':', {
                id: follower.characterId,
                x: follower.x,
                y: follower.y,
                isWalking: follower.isWalking,
                personality: follower.personality ? follower.personality.personalityType : 'unknown'
            });
            
            this.renderSingleFollower(follower, i);
        }
    } catch (error) {
        console.error('[Render] 渲染跟随者时出错:', error);
    }
};

/**
 * 渲染单个跟随者 - 个性化渲染
 */
GameEngine.prototype.renderSingleFollower = function(follower, index) {
    var character = follower.character || this.characterManager.characters[2];
    var personality = follower.personality || this.getCharacterPersonality(character);
    
    // 保存当前上下文
    this.ctx.save();
    
    // 应用个性化效果
    this.applyFollowerPersonalityEffects(follower, personality);
    
    // 直接渲染跟随者
    this.renderFollowerCharacter(follower, character);
    
    // 渲染个性化指示器
    this.renderPersonalityIndicator(follower, personality, index);
    
    // 恢复上下文
    this.ctx.restore();
    
    // 调试：确保跟随者可见
    console.log('[Render] 跟随者', index, '渲染完成，位置:', follower.x, follower.y);
};

/**
 * 渲染跟随者角色
 */
GameEngine.prototype.renderFollowerCharacter = function(follower, character) {
    // 直接使用后备渲染方案，确保可见性
    this.renderDefaultFollower(follower);
    
    // 渲染跟随者血条
    if (follower.health > 0 && !follower.isDead) {
        this.renderCharacterHealthBar(follower, follower.x, follower.y);
    }
    
    // 调试：绘制跟随者位置指示器
    this.ctx.save();
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([3, 3]);
    this.ctx.strokeRect(follower.x - 12, follower.y - 12, 24, 24);
    this.ctx.setLineDash([]);
    
    // 添加跟随者ID标签
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('F' + follower.characterId, follower.x, follower.y - 20);
    
    this.ctx.restore();
};

/**
 * 默认跟随者渲染（后备方案）
 */
GameEngine.prototype.renderDefaultFollower = function(follower) {
    this.ctx.save();
    
    // 根据个性类型选择颜色
    var personality = follower.personality;
    var baseColor = '#3498db';
    
    if (personality) {
        switch (personality.personalityType) {
            case 'leader': baseColor = '#f1c40f'; break;      // 金色
            case 'supporter': baseColor = '#e74c3c'; break;   // 红色
            case 'scout': baseColor = '#3498db'; break;       // 蓝色
            case 'guardian': baseColor = '#27ae60'; break;    // 绿色
            case 'independent': baseColor = '#9b59b6'; break; // 紫色
        }
    }
    
    // 绘制角色主体 - 稍微大一点，确保可见
    this.ctx.fillStyle = baseColor;
    this.ctx.fillRect(follower.x - 10, follower.y - 10, 20, 20);
    
    // 绘制角色边框
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(follower.x - 10, follower.y - 10, 20, 20);
    
    // 绘制角色编号
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(follower.characterId.toString(), follower.x, follower.y + 6);
    
    // 如果正在行走，添加行走指示器
    if (follower.isWalking) {
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(follower.x - 12, follower.y - 12, 24, 3);
    }
    
    // 添加跟随状态指示器
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.beginPath();
    this.ctx.arc(follower.x + 12, follower.y - 8, 4, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
};

/**
 * 应用跟随者个性化效果
 */
GameEngine.prototype.applyFollowerPersonalityEffects = function(follower, personality) {
    // 根据个性类型应用不同的视觉效果
    switch (personality.personalityType) {
        case 'leader':
            // 领导者：稍微大一点，有光环效果
            this.ctx.globalAlpha = 0.9;
            break;
            
        case 'supporter':
            // 支持者：有轻微的脉动效果
            var pulse = Math.sin(Date.now() * 0.005) * 0.1 + 1;
            this.ctx.globalAlpha = 0.9;
            break;
            
        case 'scout':
            // 侦察者：有轻微的闪烁效果
            this.ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
            break;
            
        case 'guardian':
            // 守护者：有保护光环
            this.ctx.globalAlpha = 0.95;
            break;
            
        case 'independent':
            // 独立者：稍微透明，表示独立
            this.ctx.globalAlpha = 0.7;
            break;
            
        default:
            this.ctx.globalAlpha = 1.0;
            break;
    }
};

/**
 * 渲染个性化指示器
 */
GameEngine.prototype.renderPersonalityIndicator = function(follower, personality, index) {
    var indicatorY = follower.y - 25;
    
    // 根据个性类型显示不同的指示器
    switch (personality.personalityType) {
        case 'leader':
            // 领导者：显示星星
            this.renderStarIndicator(follower.x, indicatorY, '#f1c40f');
            break;
            
        case 'supporter':
            // 支持者：显示心形
            this.renderHeartIndicator(follower.x, indicatorY, '#e74c3c');
            break;
            
        case 'scout':
            // 侦察者：显示眼睛
            this.renderEyeIndicator(follower.x, indicatorY, '#3498db');
            break;
            
        case 'guardian':
            // 守护者：显示盾牌
            this.renderShieldIndicator(follower.x, indicatorY, '#27ae60');
            break;
            
        case 'independent':
            // 独立者：显示箭头
            this.renderArrowIndicator(follower.x, indicatorY, '#9b59b6');
            break;
    }
    
    // 显示跟随时间
    if (follower.followStartTime) {
        var followDuration = Math.floor((Date.now() - follower.followStartTime) / 1000);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(followDuration + 's', follower.x, indicatorY - 10);
    }
};

/**
 * 渲染星星指示器
 */
GameEngine.prototype.renderStarIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('★', x, y);
};

/**
 * 渲染心形指示器
 */
GameEngine.prototype.renderHeartIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('♥', x, y);
};

/**
 * 渲染眼睛指示器
 */
GameEngine.prototype.renderEyeIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('👁', x, y);
};

/**
 * 渲染盾牌指示器
 */
GameEngine.prototype.renderShieldIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🛡', x, y);
};

/**
 * 渲染箭头指示器
 */
GameEngine.prototype.renderArrowIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('→', x, y);
};

/**
 * 渲染地图背景
 */
GameEngine.prototype.renderMapBackground = function() {
    // 地图背景色
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(0, 0, this.mapConfig.width, this.mapConfig.height);
};

/**
 * 渲染街道网格
 */
GameEngine.prototype.renderStreetGrid = function() {
    this.ctx.fillStyle = '#2c3e50';
    var streetWidth = this.mapConfig.streetWidth;
    var blockSize = this.mapConfig.blockSize;
    
    // 计算考虑缩放后的可见区域
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var startX = Math.floor(this.camera.x / blockSize) * blockSize;
    var endX = startX + viewWidth + blockSize;
    var startY = Math.floor(this.camera.y / blockSize) * blockSize;
    var endY = startY + viewHeight + blockSize;
    
    // 绘制垂直街道
    for (var x = startX; x <= endX; x += blockSize) {
        if (x >= 0 && x <= this.mapConfig.width) {
            this.ctx.fillRect(x, Math.max(0, this.camera.y), streetWidth, 
                Math.min(viewHeight, this.mapConfig.height - this.camera.y));
        }
    }
    
    // 绘制水平街道
    for (var y = startY; y <= endY; y += blockSize) {
        if (y >= 0 && y <= this.mapConfig.height) {
            this.ctx.fillRect(Math.max(0, this.camera.x), y, 
                Math.min(viewWidth, this.mapConfig.width - this.camera.x), streetWidth);
        }
    }
    
    // 绘制街道标线
    this.renderStreetLines();
};

/**
 * 渲染街道标线
 */
GameEngine.prototype.renderStreetLines = function() {
    this.ctx.strokeStyle = '#f39c12';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    
    var blockSize = this.mapConfig.blockSize;
    var streetWidth = this.mapConfig.streetWidth;
    
    // 计算考虑缩放后的可见区域
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var startX = Math.floor(this.camera.x / blockSize) * blockSize;
    var endX = startX + viewWidth + blockSize;
    var startY = Math.floor(this.camera.y / blockSize) * blockSize;
    var endY = startY + viewHeight + blockSize;
    
    // 垂直道路标线
    for (var x = startX; x <= endX; x += blockSize) {
        if (x >= 0 && x <= this.mapConfig.width) {
            var lineX = x + streetWidth / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(lineX, Math.max(0, this.camera.y));
            this.ctx.lineTo(lineX, Math.min(this.camera.y + viewHeight, this.mapConfig.height));
            this.ctx.stroke();
        }
    }
    
    // 水平道路标线
    for (var y = startY; y <= endY; y += blockSize) {
        if (y >= 0 && y <= this.mapConfig.height) {
            var lineY = y + streetWidth / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(Math.max(0, this.camera.x), lineY);
            this.ctx.lineTo(Math.min(this.camera.x + viewWidth, this.mapConfig.width), lineY);
            this.ctx.stroke();
        }
    }
    
    this.ctx.setLineDash([]);
};

/**
 * 渲染状态栏
 */
GameEngine.prototype.renderStatusBar = function() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, 60);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('第 ' + this.gameData.survivalDays + ' 天', 10, 25);
    this.ctx.fillText('🍞 ' + this.gameData.food, 10, 45);
    this.ctx.fillText('👥 ' + this.gameData.teamSize, 120, 25);
};

/**
 * 渲染可见区域内的建筑物
 */
GameEngine.prototype.renderVisibleBuildings = function() {
    var self = this;
    
    // 计算考虑缩放后的可见区域
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;
    
    // 只渲染可见区域内的建筑
    this.buildings.forEach(function(building) {
        // 检查建筑是否在可见区域内
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
            // 建筑主体
            self.ctx.fillStyle = building.explored ? building.color : self.lightenColor(building.color, 0.3);
            self.ctx.fillRect(building.x, building.y, building.width, building.height);
            
            // 建筑细节 - 添加窗户效果 (适配超大建筑)
            self.ctx.fillStyle = building.explored ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)';
            var windowSize = Math.max(12, Math.floor(building.width / 15)); // 更大的窗户
            var windowSpacing = windowSize + 12; // 更大的窗户间距
            
            // 绘制窗户网格 (避开门的区域)
            var doorWidth = Math.max(30, Math.floor(building.width / 8));
            var doorHeight = Math.max(40, Math.floor(building.height / 6));
            var doorX = building.x + (building.width - doorWidth) / 2;
            var doorY = building.y + building.height - doorHeight - 5;
            
            for (var wx = building.x + windowSpacing; wx < building.x + building.width - windowSize; wx += windowSpacing) {
                for (var wy = building.y + windowSpacing; wy < building.y + building.height - doorHeight - 20; wy += windowSpacing) {
                    // 避开门的位置
                    if (!(wx >= doorX - windowSpacing && wx <= doorX + doorWidth + windowSpacing && 
                          wy >= doorY - windowSpacing)) {
                        self.ctx.fillRect(wx, wy, windowSize, windowSize);
                        
                        // 窗户边框
                        self.ctx.strokeStyle = building.explored ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';
                        self.ctx.lineWidth = 1;
                        self.ctx.strokeRect(wx, wy, windowSize, windowSize);
                    }
                }
            }
            
            // 绘制建筑门 - 更加详细
            // 门框背景
            self.ctx.fillStyle = building.explored ? 'rgba(101, 67, 33, 0.9)' : 'rgba(101, 67, 33, 0.5)';
            self.ctx.fillRect(doorX - 3, doorY - 3, doorWidth + 6, doorHeight + 6);
            
            // 门本体
            self.ctx.fillStyle = building.explored ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.6)';
            self.ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
            
            // 门的细节
            self.ctx.strokeStyle = building.explored ? 'rgba(160, 82, 45, 1)' : 'rgba(160, 82, 45, 0.7)';
            self.ctx.lineWidth = 2;
            self.ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);
            
            // 门把手
            var handleSize = Math.max(3, Math.floor(doorWidth / 10));
            var handleX = doorX + doorWidth - handleSize * 2;
            var handleY = doorY + doorHeight / 2;
            
            self.ctx.fillStyle = building.explored ? 'rgba(255, 215, 0, 0.9)' : 'rgba(255, 215, 0, 0.5)';
            self.ctx.beginPath();
            self.ctx.arc(handleX, handleY, handleSize, 0, Math.PI * 2);
            self.ctx.fill();
            
            // 如果玩家接近这个建筑的门，添加高亮效果
            if (self.nearBuilding && self.nearBuilding.id === building.id) {
                // 门的发光效果
                self.ctx.save();
                self.ctx.shadowColor = '#3498db';
                self.ctx.shadowBlur = 15;
                self.ctx.strokeStyle = '#3498db';
                self.ctx.lineWidth = 4;
                self.ctx.strokeRect(doorX - 2, doorY - 2, doorWidth + 4, doorHeight + 4);
                
                // 添加进入箭头指示
                self.ctx.fillStyle = '#3498db';
                var arrowY = doorY - 15;
                var arrowX = doorX + doorWidth / 2;
                self.ctx.beginPath();
                self.ctx.moveTo(arrowX, arrowY);
                self.ctx.lineTo(arrowX - 6, arrowY - 8);
                self.ctx.lineTo(arrowX + 6, arrowY - 8);
                self.ctx.closePath();
                self.ctx.fill();
                
                // 添加"按住进入"文字提示
                self.ctx.fillStyle = '#3498db';
                self.ctx.font = 'bold 14px Arial';
                self.ctx.textAlign = 'center';
                self.ctx.strokeStyle = '#ffffff';
                self.ctx.lineWidth = 2;
                self.ctx.strokeText('靠近进入', arrowX, arrowY - 12);
                self.ctx.fillText('靠近进入', arrowX, arrowY - 12);
                
                self.ctx.restore();
            }
            
            // 门上方标识
            if (building.width > 200) {
                self.ctx.fillStyle = building.explored ? building.color : self.lightenColor(building.color, 0.3);
                var signWidth = doorWidth + 20;
                var signHeight = 15;
                var signX = doorX - 10;
                var signY = doorY - signHeight - 5;
                
                self.ctx.fillRect(signX, signY, signWidth, signHeight);
                self.ctx.strokeStyle = '#2c3e50';
                self.ctx.lineWidth = 1;
                self.ctx.strokeRect(signX, signY, signWidth, signHeight);
            }
            
            // 建筑边框
            self.ctx.strokeStyle = '#2c3e50';
            self.ctx.lineWidth = 2;
            self.ctx.strokeRect(building.x, building.y, building.width, building.height);
            
            // 未探索高亮
            if (!building.explored) {
                self.ctx.strokeStyle = '#f1c40f';
                self.ctx.lineWidth = 3;
                self.ctx.setLineDash([5, 5]);
                self.ctx.strokeRect(building.x - 3, building.y - 3, building.width + 6, building.height + 6);
                self.ctx.setLineDash([]);
            }
            
            // 建筑名称（适配大建筑的字体大小）
            var fontSize = Math.max(20, Math.floor(building.width / 12)); // 根据建筑大小调整字体
            self.ctx.fillStyle = '#ffffff';
            self.ctx.font = 'bold ' + fontSize + 'px Arial';
            self.ctx.textAlign = 'center';
            self.ctx.strokeStyle = '#000000';
            self.ctx.lineWidth = Math.max(3, Math.floor(fontSize / 6));
            
            // 在建筑上半部分显示名称，避开窗户区域
            var textX = building.x + building.width / 2;
            var textY = building.y + building.height / 3; // 放在上1/3位置
            
            self.ctx.strokeText(building.name, textX, textY);
            self.ctx.fillText(building.name, textX, textY);
            
            // 如果建筑足够大，添加建筑类型描述
            if (building.width > 200 && building.height > 200) {
                var subtitleFontSize = Math.floor(fontSize * 0.6);
                self.ctx.font = subtitleFontSize + 'px Arial';
                self.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                self.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                self.ctx.lineWidth = Math.max(2, Math.floor(subtitleFontSize / 8));
                
                var subtitle = self.getBuildingSubtitle(building.type);
                var subtitleY = textY + fontSize + 10;
                
                self.ctx.strokeText(subtitle, textX, subtitleY);
                self.ctx.fillText(subtitle, textX, subtitleY);
            }
        }
    });
    
    this.ctx.textAlign = 'left';
};

/**
 * 渲染交互提示
 */
GameEngine.prototype.renderInteractionHint = function() {
    // 禁用提示显示 - 改为直接自动进入
    // if (!this.nearBuilding) return;
    
    // 不再显示任何提示，靠近门时自动进入
    return;
};

/**
 * 获取建筑类型的副标题
 */
GameEngine.prototype.getBuildingSubtitle = function(buildingType) {
    switch (buildingType) {
        case 'police_station': return '治安管理';
        case 'hospital': return '医疗救治';
        case 'school': return '教育培训';
        case 'station': return '交通枢纽';
        case 'mall': return '购物中心';
        case 'shop': return '零售商店';
        case 'restaurant': return '餐饮服务';
        case 'bar': return '休闲娱乐';
        case 'cafe': return '咖啡休憩';
        case 'bank': return '金融服务';
        case 'house': return '居民住宅';
        case 'villa': return '高档别墅';
        case 'apartment': return '公寓大楼';
        case 'factory': return '工业生产';
        case 'warehouse': return '仓储物流';
        case 'gas_station': return '燃料补给';
        case 'gym': return '健身运动';
        case 'library': return '知识宝库';
        default: return '未知建筑';
    }
};

/**
 * 渲染小地图
 */
GameEngine.prototype.renderMiniMap = function() {
    var miniMapSize = 90; // 从120减小到90
    var miniMapX = this.canvas.width - miniMapSize - 8;
    var miniMapY = 65;
    
    // 小地图背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // 小地图边框
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // 视角拉近效果 - 只显示玩家周围的区域
    var zoomFactor = 0.3; // 缩放因子，数值越小视角越近
    var viewRange = Math.min(this.mapConfig.width, this.mapConfig.height) * zoomFactor;
    
    // 计算小地图显示的世界区域（以玩家为中心）
    var worldCenterX = this.player.x;
    var worldCenterY = this.player.y;
    var worldLeft = worldCenterX - viewRange / 2;
    var worldRight = worldCenterX + viewRange / 2;
    var worldTop = worldCenterY - viewRange / 2;
    var worldBottom = worldCenterY + viewRange / 2;
    
    // 边界限制
    if (worldLeft < 0) {
        worldRight += -worldLeft;
        worldLeft = 0;
    }
    if (worldRight > this.mapConfig.width) {
        worldLeft -= (worldRight - this.mapConfig.width);
        worldRight = this.mapConfig.width;
    }
    if (worldTop < 0) {
        worldBottom += -worldTop;
        worldTop = 0;
    }
    if (worldBottom > this.mapConfig.height) {
        worldTop -= (worldBottom - this.mapConfig.height);
        worldBottom = this.mapConfig.height;
    }
    
    // 计算缩放比例
    var scaleX = miniMapSize / (worldRight - worldLeft);
    var scaleY = miniMapSize / (worldBottom - worldTop);
    
    // 绘制玩家位置（居中）
    var playerMiniX = miniMapX + (this.player.x - worldLeft) * scaleX;
    var playerMiniY = miniMapY + (this.player.y - worldTop) * scaleY;
    
    this.ctx.fillStyle = '#3498db';
    this.ctx.beginPath();
    this.ctx.arc(playerMiniX, playerMiniY, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制周围的建筑
    var self = this;
    this.buildings.forEach(function(building) {
        // 只显示视野范围内的建筑
        if (building.x >= worldLeft && building.x <= worldRight &&
            building.y >= worldTop && building.y <= worldBottom) {
            
            var buildingMiniX = miniMapX + (building.x - worldLeft) * scaleX;
            var buildingMiniY = miniMapY + (building.y - worldTop) * scaleY;
            
            // 根据是否探索显示不同样式
            if (building.explored) {
                self.ctx.fillStyle = building.color;
                self.ctx.fillRect(buildingMiniX - 1, buildingMiniY - 1, 3, 3);
            } else {
                // 未探索的建筑显示为灰色小点
                self.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                self.ctx.fillRect(buildingMiniX, buildingMiniY, 1, 1);
            }
        }
    });
    
    // 绘制当前视野范围（考虑缩放）
    var gameViewWidth = this.canvas.width / this.camera.zoom;
    var gameViewHeight = this.canvas.height / this.camera.zoom;
    var cameraMiniX = miniMapX + (this.camera.x - worldLeft) * scaleX;
    var cameraMiniY = miniMapY + (this.camera.y - worldTop) * scaleY;
    var viewMiniW = gameViewWidth * scaleX;
    var viewMiniH = gameViewHeight * scaleY;
    
    this.ctx.strokeStyle = '#f1c40f';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(cameraMiniX, cameraMiniY, viewMiniW, viewMiniH);
    
    // 添加小地图标签
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('地图', miniMapX + miniMapSize / 2, miniMapY + miniMapSize + 12);
    this.ctx.textAlign = 'left';
};

/**
 * 渲染子地图（建筑内部）
 */
GameEngine.prototype.renderSubMap = function() {
    console.log('[Render] 渲染子地图，当前建筑:', this.currentBuilding ? this.currentBuilding.name : 'null');
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 子地图背景
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 子地图边界
    this.ctx.strokeStyle = '#ecf0f1';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(50, 100, 300, 200);
    
    // 地板纹理
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(60, 110, 280, 180);
    
    // 地板瓷砖效果
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 1;
    for (var i = 60; i <= 340; i += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(i, 110);
        this.ctx.lineTo(i, 290);
        this.ctx.stroke();
    }
    for (var j = 110; j <= 290; j += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(60, j);
        this.ctx.lineTo(340, j);
        this.ctx.stroke();
    }
    
    // 门 - 用于退出（放在下面）
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(195, 280, 10, 20); // 门移到下面
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(197, 285, 2, 2); // 门把手
    
    // 门标识
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('出口', 200, 315); // 标识移到下面
    
    // 建筑信息
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.currentBuilding ? this.currentBuilding.name : '建筑内部', this.canvas.width / 2, 50);
    
    // 渲染僵尸
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(zombie.x - 8, zombie.y - 8, 16, 16);
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(zombie.x - 6, zombie.y - 6, 12, 12);
    }
    
    // 渲染资源
    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(resource.x - 6, resource.y - 6, 12, 12);
        this.ctx.fillStyle = '#e67e22';
        this.ctx.fillRect(resource.x - 4, resource.y - 4, 8, 8);
    }
    
    // 渲染玩家
    this.renderPlayer();
    
    // 渲染团队成员
    this.renderNPCsInSubMap();
    
    // 检查玩家是否接近出口（门在下面）
    var exitX = 200;
    var exitY = 290; // 门的中心位置
    var distanceToExit = Math.sqrt(
        Math.pow(this.player.x - exitX, 2) + 
        Math.pow(this.player.y - exitY, 2)
    );
    
    if (distanceToExit < 25) {
        this.ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('靠近门口即可退出', this.canvas.width / 2, this.canvas.height - 30);
        
        // 自动退出建筑
        if (distanceToExit < 15) {
            this.exitBuilding();
        }
    }
    
    // 渲染状态栏
    this.renderStatusBar();
};

/**
 * 退出建筑
 */
GameEngine.prototype.exitBuilding = function() {
    console.log('[GameEngine] 退出建筑');
    
    // 保存当前建筑引用
    var building = this.currentBuilding;
    
    // 标记建筑为已探索
    if (building) {
        building.explored = true;
        this.exploredBuildings.push(building);
    }
    
    // 恢复玩家和团队成员到进入前的位置
    if (building && this.playerPositionBeforeEntering) {
        // 恢复玩家位置
        this.player.x = this.playerPositionBeforeEntering.x;
        this.player.y = this.playerPositionBeforeEntering.y;
        
        console.log('[GameEngine] 玩家位置已恢复到:', this.player.x, this.player.y);
        
        // 恢复团队成员位置
        if (this.followersPositionBeforeEntering) {
            for (var i = 0; i < Math.min(this.followers.length, this.followersPositionBeforeEntering.length); i++) {
                var follower = this.followers[i];
                var savedPosition = this.followersPositionBeforeEntering[i];
                
                follower.x = savedPosition.x;
                follower.y = savedPosition.y;
                
                // 确保不超出地图边界
                follower.x = Math.max(100, Math.min(this.mapConfig.width - 100, follower.x));
                follower.y = Math.max(100, Math.min(this.mapConfig.height - 100, follower.y));
            }
            
            console.log('[GameEngine] 团队成员位置已恢复，数量:', this.followers.length);
        }
        
        // 清理保存的位置数据
        this.playerPositionBeforeEntering = null;
        this.followersPositionBeforeEntering = null;
        
    } else {
        console.log('[GameEngine] 警告：没有保存的进入前位置，使用门口位置');
        
        // 后备方案：使用门口位置，但距离门更远
        if (building) {
            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.originalX + doorInfo.originalWidth / 2;
            var doorCenterY = doorInfo.originalY + doorInfo.originalHeight / 2;
            
            // 将玩家放置在距离门更远的位置（120像素外），避免立即触发进入提示
            this.player.x = doorCenterX;
            this.player.y = doorCenterY + 120; // 增加距离到120像素，确保足够远
            
            // 将团队成员排列在玩家周围
            for (var i = 0; i < this.followers.length; i++) {
                var follower = this.followers[i];
                var row = Math.floor(i / 3); // 每行3个
                var col = i % 3;
                var offsetX = (col - 1) * 40; // 左右分布
                var offsetY = row * 35 + 60; // 在玩家后方，距离门更远
                
                follower.x = this.player.x + offsetX;
                follower.y = this.player.y + offsetY;
                
                // 确保不超出地图边界
                follower.x = Math.max(100, Math.min(this.mapConfig.width - 100, follower.x));
                follower.y = Math.max(100, Math.min(this.mapConfig.height - 100, follower.y));
            }
        }
    }
    
    // 返回主地图
    this.gameState = 'playing';
    this.currentBuilding = null;
    this.subMapType = null;
    
    // 设置退出建筑冷却时间（2秒），避免立即触发进入提示
    this.buildingExitCooldown = Date.now() + 2000;
    
    // 清空子地图数据
    this.zombies = [];
    this.resources = [];
};

/**
 * 渲染虚拟摇杆
 */
GameEngine.prototype.renderJoystick = function() {
    var joystickRadius = 60;
    var knobRadius = 25;
    var joystickX = 100;
    var joystickY = this.canvas.height - 100;
    
    this.ctx.save();
    
    // 摇杆底座
    this.ctx.beginPath();
    this.ctx.arc(joystickX, joystickY, joystickRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // 内圈指示器
    this.ctx.beginPath();
    this.ctx.arc(joystickX, joystickY, joystickRadius - 15, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // 计算摇杆把手位置
    var knobX = joystickX + this.joystick.direction.x * (joystickRadius - knobRadius);
    var knobY = joystickY + this.joystick.direction.y * (joystickRadius - knobRadius);
    
    // 摇杆把手
    this.ctx.beginPath();
    this.ctx.arc(knobX, knobY, knobRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // 把手中心点
    this.ctx.beginPath();
    this.ctx.arc(knobX, knobY, 8, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
    this.ctx.fill();
    
    // 方向指示器（如果有方向输入）
    if (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(joystickX, joystickY);
        this.ctx.lineTo(knobX, knobY);
        this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }
    
    this.ctx.restore();
};

/**
 * 渲染时间信息
 */
GameEngine.prototype.renderTimeInfo = function() {
    // 渲染时间信息到右上角
    this.ctx.save();
    
    // 背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(this.canvas.width - 200, 10, 190, 80);
    
    // 边框
    this.ctx.strokeStyle = '#3498db';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.canvas.width - 200, 10, 190, 80);
    
    // 文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    
    // 生存天数
    this.ctx.fillText('生存天数: ' + this.gameData.survivalDays, this.canvas.width - 190, 35);
    
    // 当前时间（模拟游戏内时间）
    var gameTime = Math.floor((Date.now() / 1000) % (24 * 60 * 60)); // 24小时循环
    var hours = Math.floor(gameTime / 3600);
    var minutes = Math.floor((gameTime % 3600) / 60);
    var timeString = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
    this.ctx.fillText('时间: ' + timeString, this.canvas.width - 190, 55);
    
    // 当前角色信息
    var character = this.characterManager.getCurrentCharacter();
    this.ctx.fillText('角色: ' + character.name, this.canvas.width - 190, 75);
    
    this.ctx.restore();
};

/**
 * 颜色工具函数 - 使颜色变亮
 */
GameEngine.prototype.lightenColor = function(color, amount) {
    // 将十六进制颜色转换为RGB
    var hex = color.replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    
    // 增加亮度
    r = Math.min(255, Math.floor(r + (255 - r) * amount));
    g = Math.min(255, Math.floor(g + (255 - g) * amount));
    b = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    // 转换回十六进制 (兼容ES5)
    var rHex = r.toString(16);
    if (rHex.length === 1) rHex = '0' + rHex;
    var gHex = g.toString(16);
    if (gHex.length === 1) gHex = '0' + gHex;
    var bHex = b.toString(16);
    if (bHex.length === 1) bHex = '0' + bHex;
    
    return '#' + rHex + gHex + bHex;
};

/**
 * 渲染玩家 - 使用人物管理器渲染当前选择的角色
 */
GameEngine.prototype.renderPlayer = function() {
    // 使用人物管理器渲染当前角色
    this.characterManager.renderCurrentCharacter(this.ctx, this.player.x, this.player.y, this.player);
    
    // 渲染玩家血条
    this.renderCharacterHealthBar(this.player, this.player.x, this.player.y);
};

/**
 * 渲染角色血条
 */
GameEngine.prototype.renderCharacterHealthBar = function(character, x, y) {
    if (character.health <= 0 || character.isDead) return;
    
    var healthPercentage = character.health / character.maxHealth;
    var barWidth = 30;
    var barHeight = 4;
    var barY = y - 45; // 在角色头部上方
    
    this.ctx.save();
    
    // 背景
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);
    
    // 血条
    if (healthPercentage > 0.6) {
        this.ctx.fillStyle = '#4CAF50'; // 绿色
    } else if (healthPercentage > 0.3) {
        this.ctx.fillStyle = '#FF9800'; // 橙色
    } else {
        this.ctx.fillStyle = '#F44336'; // 红色
    }
    
    this.ctx.fillRect(x - barWidth/2, barY, barWidth * healthPercentage, barHeight);
    
    // 边框
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - barWidth/2, barY, barWidth, barHeight);
    
    // 血量文字
    if (character === this.player) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(character.health + '/' + character.maxHealth, x, barY - 2);
    }
    
    this.ctx.restore();
};

/**
 * 切换人物
 */
GameEngine.prototype.switchCharacter = function(characterId) {
    if (this.characterManager.switchCharacter(characterId)) {
        console.log('[Game] 切换到角色: ' + characterId + ' - ' + this.characterManager.getCurrentCharacter().name);
        return true;
    }
    return false;
};

/**
 * 获取当前人物信息
 */
GameEngine.prototype.getCurrentCharacterInfo = function() {
    var character = this.characterManager.getCurrentCharacter();
    return {
        id: character.id,
        name: character.name,
        description: character.description
    };
};

/**
 * 获取所有人物列表
 */
GameEngine.prototype.getCharacterList = function() {
    var list = [];
    for (var id in this.characterManager.characters) {
        var character = this.characterManager.characters[id];
        list.push({
            id: parseInt(id),
            name: character.name,
            description: character.description
        });
    }
    return list.sort(function(a, b) { return a.id - b.id; });
};

/**
 * 更新NPC的闲置行为
 */
GameEngine.prototype.updateNPCIdleBehavior = function(npc, deltaTime) {
    var currentTime = Date.now();
    
    // 更新行为计时器
    if (!npc.behaviorTimer) npc.behaviorTimer = 0;
    npc.behaviorTimer -= deltaTime || 16; // 假设16ms每帧
    
    if (npc.behaviorTimer <= 0) {
        // 选择新的行为
        npc.currentBehavior = this.selectNPCBehavior(npc);
        npc.behaviorTimer = 1000 + Math.random() * 2000; // 1-3秒的行为持续时间
    }
    
    // 执行当前行为
    this.executeNPCBehavior(npc);
};

/**
 * 选择NPC行为
 */
GameEngine.prototype.selectNPCBehavior = function(npc) {
    var behaviors = ['idle', 'wander', 'look_around', 'stretch', 'check_equipment'];
    var weights = [0.4, 0.3, 0.2, 0.05, 0.05]; // 行为权重
    
    var random = Math.random();
    var cumulativeWeight = 0;
    
    for (var i = 0; i < weights.length; i++) {
        cumulativeWeight += weights[i];
        if (random <= cumulativeWeight) {
            return behaviors[i];
        }
    }
    
    return 'idle';
};

/**
 * 执行NPC行为
 */
GameEngine.prototype.executeNPCBehavior = function(npc) {
    switch (npc.currentBehavior) {
        case 'wander':
            this.executeWanderBehavior(npc);
            break;
        case 'look_around':
            this.executeLookAroundBehavior(npc);
            break;
        case 'stretch':
            this.executeStretchBehavior(npc);
            break;
        case 'check_equipment':
            this.executeCheckEquipmentBehavior(npc);
            break;
        default:
            // idle - 什么都不做
            break;
    }
};

/**
 * 执行漫游行为
 */
GameEngine.prototype.executeWanderBehavior = function(npc) {
    if (!npc.wanderTarget) {
        // 设置漫游目标
        var wanderRadius = 50 + Math.random() * 100;
        var angle = Math.random() * Math.PI * 2;
        npc.wanderTarget = {
            x: npc.x + Math.cos(angle) * wanderRadius,
            y: npc.y + Math.sin(angle) * wanderRadius
        };
    }
    
    // 向目标移动
    var dx = npc.wanderTarget.x - npc.x;
    var dy = npc.wanderTarget.y - npc.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
        // 移动NPC
        var moveSpeed = (npc.personality ? npc.personality.moveSpeed : 1) * 0.5;
        npc.x += (dx / distance) * moveSpeed;
        npc.y += (dy / distance) * moveSpeed;
        
        // 更新动画
        npc.isWalking = true;
        npc.direction = this.getDirectionFromDelta(dx, dy);
    } else {
        // 到达目标，清除目标
        npc.wanderTarget = null;
        npc.isWalking = false;
    }
};

/**
 * 执行环顾四周行为
 */
GameEngine.prototype.executeLookAroundBehavior = function(npc) {
    // 简单的头部转动效果（通过改变方向实现）
    if (!npc.lookAroundTimer) {
        npc.lookAroundTimer = 0;
        npc.lookAroundDirection = 0;
    }
    
    npc.lookAroundTimer += 16;
    if (npc.lookAroundTimer > 500) {
        npc.lookAroundDirection = (npc.lookAroundDirection + 1) % 4;
        npc.lookAroundTimer = 0;
        
        var directions = ['up', 'right', 'down', 'left'];
        npc.direction = directions[npc.lookAroundDirection];
    }
};

/**
 * 执行伸展行为
 */
GameEngine.prototype.executeStretchBehavior = function(npc) {
    // 简单的伸展动画（通过改变位置实现）
    if (!npc.stretchTimer) {
        npc.stretchTimer = 0;
        npc.stretchPhase = 0;
    }
    
    npc.stretchTimer += 16;
    if (npc.stretchTimer > 200) {
        npc.stretchTimer = 0;
        npc.stretchPhase = (npc.stretchPhase + 1) % 4;
        
        // 轻微的伸展动作
        var stretchOffset = Math.sin(npc.stretchPhase * Math.PI / 2) * 2;
        npc.y += stretchOffset;
    }
};

/**
 * 执行检查装备行为
 */
GameEngine.prototype.executeCheckEquipmentBehavior = function(npc) {
    // 检查装备的动画（通过改变方向实现）
    if (!npc.checkEquipmentTimer) {
        npc.checkEquipmentTimer = 0;
    }
    
    npc.checkEquipmentTimer += 16;
    if (npc.checkEquipmentTimer > 300) {
        npc.checkEquipmentTimer = 0;
        
        // 随机改变方向，模拟检查装备
        var directions = ['up', 'right', 'down', 'left'];
        npc.direction = directions[Math.floor(Math.random() * directions.length)];
    }
};

function initGame() {
    try {
        console.log('[Main] 开始初始化游戏...');
        
        // 获取系统信息
        var systemInfo = tt.getSystemInfoSync();
        console.log('[Main] 系统信息:', {
            windowWidth: systemInfo.windowWidth,
            windowHeight: systemInfo.windowHeight,
            pixelRatio: systemInfo.pixelRatio,
            platform: systemInfo.platform
        });
        
        // 创建画布
        var canvas = tt.createCanvas();
        var ctx = canvas.getContext('2d');
canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;

        console.log('[Main] 画布创建成功: ' + canvas.width + 'x' + canvas.height);
        
        // 创建游戏引擎
        var gameEngine = new GameEngine(canvas, ctx);
        
            // 启动游戏
    gameEngine.start();
    
    // 测试个性化团队跟随系统
    console.log('[Main] 测试个性化团队跟随系统...');
    setTimeout(function() {
        console.log('[Main] 团队跟随系统状态:', {
            followers: gameEngine.followers.length,
            npcs: gameEngine.npcs.length,
            personalities: gameEngine.followers.map(function(f) {
                return {
                    id: f.characterId,
                    type: f.personality ? f.personality.personalityType : 'unknown'
                };
            })
        });
        
            // 测试跟随者渲染
    if (gameEngine.followers.length > 0) {
        console.log('[Main] 跟随者位置验证:');
        gameEngine.followers.forEach(function(f, i) {
            console.log('  跟随者', i, ':', {
                id: f.characterId,
                x: f.x,
                y: f.y,
                personality: f.personality ? f.personality.personalityType : 'unknown',
                isWalking: f.isWalking
            });
        });
    }
    
    // 添加调试跟随者功能 - 兼容抖音小程序环境
    try {
        // 尝试使用全局对象
        var globalObj = typeof global !== 'undefined' ? global : 
                       typeof window !== 'undefined' ? window : 
                       typeof this !== 'undefined' ? this : {};
        
        globalObj.debugFollowers = function() {
            console.log('[Debug] 当前跟随者状态:');
            console.log('  跟随者数量:', gameEngine.followers.length);
            console.log('  NPC数量:', gameEngine.npcs.length);
            console.log('  跟随者数组:', gameEngine.followers);
            console.log('  NPC数组:', gameEngine.npcs);
            
            // 强制添加一个测试跟随者
            if (gameEngine.followers.length === 0) {
                var testFollower = {
                    id: 'test_follower',
                    characterId: 999,
                    x: gameEngine.player.x + 50,
                    y: gameEngine.player.y + 50,
                    isFollowing: true,
                    personality: { personalityType: 'leader' },
                    isWalking: false,
                    walkAnimationFrame: 0,
                    lastAnimationTime: 0,
                    direction: 'down'
                };
                gameEngine.followers.push(testFollower);
                console.log('[Debug] 添加测试跟随者成功');
            }
        };
        
        // 也在游戏引擎上添加调试方法
        gameEngine.debugFollowers = globalObj.debugFollowers;
        
        console.log('[Main] 调试功能已加载，使用 gameEngine.debugFollowers() 或 global.debugFollowers() 来调试跟随者');
        
    } catch (error) {
        console.warn('[Main] 调试功能加载失败:', error);
        // 直接在游戏引擎上添加调试方法
        gameEngine.debugFollowers = function() {
            console.log('[Debug] 当前跟随者状态:');
            console.log('  跟随者数量:', this.followers.length);
            console.log('  NPC数量:', this.npcs.length);
            console.log('  跟随者数组:', this.followers);
            console.log('  NPC数组:', this.npcs);
            
            // 强制添加一个测试跟随者
            if (this.followers.length === 0) {
                var testFollower = {
                    id: 'test_follower',
                    characterId: 999,
                    x: this.player.x + 50,
                    y: this.player.y + 50,
                    isFollowing: true,
                    personality: { personalityType: 'unknown' },
                    isWalking: false,
                    walkAnimationFrame: 0,
                    lastAnimationTime: 0,
                    direction: 'down'
                };
                this.followers.push(testFollower);
                console.log('[Debug] 添加测试跟随者成功');
            }
        };
        
        console.log('[Main] 调试功能已加载，使用 gameEngine.debugFollowers() 来调试跟随者');
    }
    
    // 添加更多调试方法到游戏引擎
    gameEngine.debugInfo = function() {
        console.log('[Debug] 游戏引擎状态:');
        console.log('  玩家位置:', this.player.x, this.player.y);
        console.log('  跟随者数量:', this.followers.length);
        console.log('  NPC数量:', this.npcs.length);
        console.log('  建筑数量:', this.buildings.length);
        console.log('  摄像机位置:', this.camera.x, this.camera.y);
        console.log('  摄像机缩放:', this.camera.zoom);
    };
    
    gameEngine.addTestFollower = function() {
        var testFollower = {
            id: 'test_follower_' + Date.now(),
            characterId: 999,
            x: this.player.x + 50,
            y: this.player.y + 50,
            isFollowing: true,
            personality: { personalityType: 'leader' },
            isWalking: false,
            walkAnimationFrame: 0,
            lastAnimationTime: 0,
            direction: 'down',
            character: this.characterManager.characters[2]
        };
        
        this.followers.push(testFollower);
        console.log('[Debug] 测试跟随者添加成功，当前跟随者数量:', this.followers.length);
        return testFollower;
    };
    
    console.log('[Main] 额外调试方法已加载: gameEngine.debugInfo(), gameEngine.addTestFollower()');
    
    // 添加调试模式开关
    gameEngine.debugMode = false;
    gameEngine.toggleDebugMode = function() {
        this.debugMode = !this.debugMode;
        console.log('[Debug] 调试模式:', this.debugMode ? '开启' : '关闭');
    };
    
    // 添加摇杆调试和修复方法
    gameEngine.debugJoystick = function() {
        console.log('[Debug] 摇杆状态检查:');
        console.log('  摇杆对象:', this.joystick);
        console.log('  是否激活:', this.joystick.active);
        console.log('  中心位置:', this.joystick.centerX, this.joystick.centerY);
        console.log('  当前位置:', this.joystick.currentX, this.joystick.currentY);
        console.log('  方向向量:', this.joystick.direction.x, this.joystick.direction.y);
        console.log('  游戏状态:', this.gameState);
        console.log('  触摸开始位置:', this.touchStartX, this.touchStartY);
        console.log('  触摸开始时间:', this.touchStartTime);
    };
    
    gameEngine.fixJoystick = function() {
        console.log('[Debug] 尝试修复摇杆...');
        
        // 重置摇杆状态
        this.resetJoystick();
        
        // 重新初始化摇杆位置
        this.joystick.centerY = this.canvas.height - 80;
        this.joystick.currentY = this.joystick.centerY;
        
        // 重置触摸状态
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        
        console.log('[Debug] 摇杆修复完成');
        this.debugJoystick();
    };
    
    console.log('[Main] 摇杆调试方法已加载: gameEngine.debugJoystick(), gameEngine.fixJoystick()');
    
    // 添加碰撞检测调试方法
    gameEngine.debugCollision = function(x, y) {
        console.log('[Debug] 碰撞检测调试 - 位置:', x, y);
        
        // 检查所有建筑的碰撞
        for (var i = 0; i < this.buildings.length; i++) {
            var building = this.buildings[i];
            var collision = this.checkCollisionWithBuildings(x, y);
            var inDoorArea = this.isCharacterInDoorArea(x, y, building);
            
            console.log('[Debug] 建筑', i, ':', building.name, {
                position: { x: building.x, y: building.y, width: building.width, height: building.height },
                collision: collision.collision,
                inDoorArea: inDoorArea,
                doorInfo: this.calculateDoorInfo(building)
            });
        }
    };
    
    console.log('[Main] 碰撞检测调试方法已加载: gameEngine.debugCollision(x, y)');
    
    // 添加紧急解锁功能
    gameEngine.emergencyUnlock = function() {
        console.log('[Emergency] 执行紧急解锁...');
        
        // 检查玩家是否被建筑包围
        var playerX = this.player.x;
        var playerY = this.player.y;
        var searchRadius = 50;
        
        // 在周围寻找可移动的位置
        for (var radius = 10; radius <= searchRadius; radius += 5) {
            for (var angle = 0; angle < 360; angle += 45) {
                var rad = angle * Math.PI / 180;
                var testX = playerX + Math.cos(rad) * radius;
                var testY = playerY + Math.sin(rad) * radius;
                
                var collision = this.checkCollisionWithBuildings(testX, testY);
                if (!collision.collision) {
                    // 找到可移动位置，强制移动玩家
                    this.player.x = testX;
                    this.player.y = testY;
                    
                    console.log('[Emergency] 紧急解锁成功，新位置:', testX, testY);
                    return true;
                }
            }
        }
        
        console.log('[Emergency] 紧急解锁失败，无法找到可移动位置');
        return false;
    };
    
    console.log('[Main] 紧急解锁功能已加载: gameEngine.emergencyUnlock()');
    
    // 重复的全局函数已删除，使用原型方法
    
    console.log('[Main] 建筑进入询问提示功能已加载');
    
    // 添加调试功能：手动测试询问提示
    gameEngine.testBuildingPrompt = function(buildingName) {
        var building = this.buildings.find(function(b) { return b.name === buildingName; });
        if (building) {
            // 统一使用相同的状态设置逻辑
            this.buildingEntryPrompt = {
                building: building,
                buildingId: building.id || building.name,
                active: true,
                message: '是否进入 ' + building.name + '？',
                options: ['进入', '取消']
            };
            console.log('[Debug] 手动设置询问提示:', this.buildingEntryPrompt);
        } else {
            console.log('[Debug] 未找到建筑:', buildingName);
            console.log('[Debug] 可用建筑:', this.buildings.map(function(b) { return b.name; }).slice(0, 5));
        }
    };
    
    // 添加移动到建筑门口的调试功能
    gameEngine.moveToBuilding = function(buildingName) {
        var building = this.buildings.find(function(b) { return b.name === buildingName; });
        if (building) {
            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.x + doorInfo.width / 2;
            var doorCenterY = doorInfo.y + doorInfo.height / 2;
            
            // 将玩家移动到门口附近
            this.player.x = doorCenterX;
            this.player.y = doorCenterY + 60; // 保持适当距离，避免立即触发进入提示
            
            console.log('[Debug] 玩家已移动到建筑门口:', building.name);
            console.log('[Debug] 玩家位置:', this.player.x, this.player.y);
            console.log('[Debug] 门位置:', doorCenterX, doorCenterY);
        } else {
            console.log('[Debug] 未找到建筑:', buildingName);
        }
    };
    
    // 添加测试退出建筑功能
    gameEngine.testExitBuilding = function() {
        console.log('[Debug] 测试退出建筑功能');
        console.log('[Debug] 当前冷却时间:', this.buildingExitCooldown);
        console.log('[Debug] 当前时间:', Date.now());
        console.log('[Debug] 是否在冷却期:', this.buildingExitCooldown > Date.now());
        
        // 手动设置冷却时间进行测试
        this.buildingExitCooldown = Date.now() + 3000; // 3秒冷却
        console.log('[Debug] 已设置3秒冷却时间，期间不会触发进入提示');
    };
    
    // 添加僵尸系统调试功能
    gameEngine.spawnZombie = function(type, x, y) {
        type = type || 'thin';
        x = x || this.player.x + 100;
        y = y || this.player.y + 100;
        
        var zombie = this.zombieManager.createZombie(type, x, y);
        if (zombie) {
            console.log('[Debug] 创建僵尸成功:', type, '位置:', x, y);
            console.log('[Debug] 当前僵尸数量:', this.zombieManager.zombies.length);
        } else {
            console.log('[Debug] 创建僵尸失败');
        }
        return zombie;
    };
    
    // 生成一波街道僵尸
    gameEngine.spawnStreetZombies = function() {
        console.log('[Debug] 手动生成街道僵尸波次...');
        this.spawnZombiesByDay();
    };
    
    // 立即生成测试僵尸
    gameEngine.spawnTestZombies = function() {
        console.log('[Debug] 立即在玩家附近生成测试僵尸...');
        
        // 清除现有僵尸
        this.zombieManager.zombies = [];
        
        // 在玩家周围生成5只测试僵尸
        var testPositions = [
            { x: this.player.x + 200, y: this.player.y, type: 'thin' },
            { x: this.player.x - 200, y: this.player.y, type: 'thin' },
            { x: this.player.x, y: this.player.y + 200, type: 'fat' },
            { x: this.player.x + 150, y: this.player.y - 150, type: 'thin' },
            { x: this.player.x - 150, y: this.player.y + 150, type: 'boss1' }
        ];
        
        var created = 0;
        for (var i = 0; i < testPositions.length; i++) {
            var pos = testPositions[i];
            var zombie = this.zombieManager.createZombie(pos.type, pos.x, pos.y);
            if (zombie) {
                created++;
                console.log('[Debug] 测试僵尸', created, ':', pos.type, '位置:', pos.x, pos.y);
            }
        }
        
        console.log('[Debug] 成功创建', created, '只测试僵尸');
        return created;
    };
    
    // 检查当前位置是否可以移动
    gameEngine.checkPosition = function(x, y) {
        x = x || this.player.x;
        y = y || this.player.y;
        
        var canMove = this.canMoveToPosition(x, y, 18);
        var collision = this.checkCollisionWithBuildings(x, y, 18);
        
        console.log('[Debug] 位置', x.toFixed(0), y.toFixed(0));
        console.log('[Debug] 可以移动:', canMove);
        console.log('[Debug] 碰撞信息:', collision);
        
        if (collision.collision) {
            console.log('[Debug] 碰撞建筑:', collision.building.name);
        }
        if (collision.inDoor) {
            console.log('[Debug] 在门区域内');
        }
        
        return canMove;
    };
    
    // 测试建筑碰撞
    gameEngine.testBuildingCollision = function() {
        console.log('[Debug] 测试建筑碰撞系统...');
        
        // 测试玩家当前位置
        this.checkPosition();
        
        // 测试玩家周围的位置
        var testPositions = [
            { x: this.player.x + 50, y: this.player.y, desc: '右侧50px' },
            { x: this.player.x - 50, y: this.player.y, desc: '左侧50px' },
            { x: this.player.x, y: this.player.y + 50, desc: '下方50px' },
            { x: this.player.x, y: this.player.y - 50, desc: '上方50px' }
        ];
        
        for (var i = 0; i < testPositions.length; i++) {
            var pos = testPositions[i];
            console.log('[Debug] 测试', pos.desc, ':', pos.x.toFixed(0), pos.y.toFixed(0));
            this.checkPosition(pos.x, pos.y);
        }
    };
    
    gameEngine.clearZombies = function() {
        this.zombieManager.zombies = [];
        console.log('[Debug] 已清除所有僵尸');
    };
    
    gameEngine.zombieStats = function() {
        var stats = {
            total: this.zombieManager.zombies.length,
            thin: 0,
            fat: 0,
            boss1: 0,
            wandering: 0,
            chasing: 0,
            attacking: 0
        };
        
        for (var i = 0; i < this.zombieManager.zombies.length; i++) {
            var zombie = this.zombieManager.zombies[i];
            stats[zombie.type]++;
            stats[zombie.state]++;
        }
        
        console.log('[Debug] 僵尸统计:', stats);
        return stats;
    };
    
    gameEngine.damagePlayer = function(damage) {
        damage = damage || 10;
        this.player.health -= damage;
        console.log('[Debug] 玩家受到', damage, '点伤害，剩余血量:', this.player.health);
        
        if (this.player.health <= 0) {
            console.log('[Debug] 玩家死亡');
        }
    };
    
    gameEngine.healPlayer = function(amount) {
        amount = amount || 20;
        this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
        console.log('[Debug] 玩家恢复', amount, '点血量，当前血量:', this.player.health);
    };
    
    console.log('[Main] 调试功能已加载: gameEngine.testBuildingPrompt("建筑名称"), gameEngine.moveToBuilding("建筑名称"), gameEngine.testExitBuilding()');
    console.log('[Main] 僵尸调试功能: gameEngine.spawnTestZombies(), gameEngine.spawnStreetZombies(), gameEngine.clearZombies(), gameEngine.zombieStats()');
    console.log('[Main] 碰撞调试功能: gameEngine.checkPosition(x, y), gameEngine.testBuildingCollision()');
    console.log('[Main] 战斗调试功能: gameEngine.damagePlayer(damage), gameEngine.healPlayer(amount)');
    
    // 立即测试询问提示功能
    setTimeout(function() {
        console.log('[Test] 3秒后自动测试询问提示...');
        if (gameEngine.buildings && gameEngine.buildings.length > 0) {
            var testBuilding = gameEngine.buildings[0];
            gameEngine.buildingEntryPrompt = {
                building: testBuilding,
                active: true,
                message: '测试询问提示 - 是否进入 ' + testBuilding.name + '？',
                options: ['进入', '取消']
            };
            console.log('[Test] 测试询问提示已设置:', gameEngine.buildingEntryPrompt);
        }
    }, 3000);
    
    // 添加更多调试功能
    gameEngine.debugBuildingPrompt = function() {
        console.log('[Debug] 当前询问提示状态:', this.buildingEntryPrompt);
        console.log('[Debug] 当前游戏状态:', this.gameState);
        console.log('[Debug] 玩家位置:', this.player.x, this.player.y);
        console.log('[Debug] 建筑数量:', this.buildings.length);
        
        // 显示最近的几个建筑
        for (var i = 0; i < Math.min(3, this.buildings.length); i++) {
            var building = this.buildings[i];
            var doorInfo = this.calculateDoorInfo(building);
            var distance = Math.sqrt(
                Math.pow(this.player.x - (doorInfo.x + doorInfo.width/2), 2) + 
                Math.pow(this.player.y - (doorInfo.y + doorInfo.height/2), 2)
            );
            console.log('[Debug] 建筑', i, ':', building.name, '距离:', distance);
        }
    };
    
    console.log('[Main] 调试功能已加载: gameEngine.debugBuildingPrompt()');
    }, 2000);
    
    console.log('[Main] 游戏启动成功！');
        
        // 暴露全局变量供调试 - 兼容抖音小程序环境
        try {
            var globalObj = typeof global !== 'undefined' ? global : 
                           typeof window !== 'undefined' ? window : 
                           typeof this !== 'undefined' ? this : {};
            
            globalObj.game = gameEngine;
            globalObj.canvas = canvas;
            globalObj.ctx = ctx;
            
            console.log('[Main] 全局调试变量已设置');
        } catch (error) {
            console.warn('[Main] 全局调试变量设置失败:', error);
        }
        
        return gameEngine;
        
    } catch (error) {
        console.error('[Main] 游戏初始化失败:', error);
        
        // 显示错误信息
        try {
            var canvas = tt.createCanvas();
            var ctx = canvas.getContext('2d');
            var systemInfo = tt.getSystemInfoSync();
            canvas.width = systemInfo.windowWidth;
            canvas.height = systemInfo.windowHeight;
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('游戏启动失败', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText('请重新加载', canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('错误: ' + error.message, canvas.width / 2, canvas.height / 2 + 60);
        } catch (displayError) {
            console.error('[Main] 无法显示错误信息:', displayError);
        }
        
        throw error;
    }
}

// 启动游戏
console.log('[Main] 准备启动末日Q行游戏...');
try {
    initGame();
    console.log('[Main] 游戏启动完成！');
} catch (error) {
    console.error('[Main] 游戏启动失败:', error);
}