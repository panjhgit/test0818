/**
 * 基础僵尸类 - 从game.js提取
 * 兼容抖音小程序环境 (ES5)
 */
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
