/**
 * 僵尸系统
 * 包含基础僵尸类、AI辅助方法和僵尸类型定义
 */

// ========================================
// 基础僵尸类
// ========================================

/**
 * 基础僵尸类
 * 所有僵尸类型的基类，包含完整的AI状态机系统
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
    this.detectionRange = config.detectionRange || 800; // 大幅增加检测范围
    this.attackRange = config.attackRange || 25;
    this.size = config.size || 1.2; // 比人物大一点

    // AI状态机
    this.state = 'wandering'; // wandering, aware, chasing, attacking
    this.target = null;
    this.lastAttackTime = 0;
    this.attackCooldown = config.attackCooldown || 1500; // 攻击冷却时间
    this.lastStateChangeTime = Date.now(); // 状态切换时间
    this.aiUpdateTimer = 0; // AI更新计时器

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

    // 对象池相关
    this.active = true;
    this.isDead = false;
    this.quadTreeInserted = false;
    this.lastQuadTreeX = this.x;
    this.lastQuadTreeY = this.y;
}

// 重置僵尸状态（用于对象池）
BaseZombie.prototype.reset = function(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.state = 'wandering';
    this.target = null;
    this.lastAttackTime = 0;
    this.aiUpdateTimer = 0;
    this.wanderTarget = null;
    this.wanderTimer = 0;
    this.isWalking = false;
    this.direction = 'down';
    this.walkAnimationFrame = 0;
    this.lastAnimationTime = 0;
    this.isDead = false;
    this.active = true;
};

BaseZombie.prototype.update = function(deltaTime, gameEngine) {
    // 检查游戏是否已结束
    if (gameEngine && (gameEngine.isGameEnded || gameEngine.gameState === 'gameover' || gameEngine.gameState === 'victory')) {
        return;
    }

    this.gameEngine = gameEngine;
    this.updateAI(deltaTime, gameEngine);
    this.updateAnimation(deltaTime);
    this.updateMovement(deltaTime);
};

BaseZombie.prototype.updateAI = function(deltaTime, gameEngine) {
    // 检查游戏是否已结束
    if (!gameEngine || gameEngine.isGameEnded || gameEngine.gameState === 'gameover' || gameEngine.gameState === 'victory') {
        return;
    }

    // 额外检查：如果僵尸本身无效，则不更新
    if (!this || this.health <= 0 || this.isDead) {
        return;
    }

    if (!this.aiUpdateTimer) this.aiUpdateTimer = 0;
    this.aiUpdateTimer += deltaTime;

    if (this.aiUpdateTimer < 100) return; // 提高AI更新频率
    this.aiUpdateTimer = 0;

    // 检查游戏引擎和玩家对象是否有效
    if (!gameEngine.player || gameEngine.player.health <= 0 || gameEngine.player.isDead) {
        // 如果玩家无效，僵尸应该回到游荡状态
        if (this.state !== 'wandering') {
            this.state = 'wandering';
            this.target = null;
        }
        return;
    }

    var currentTime = Date.now();
    var playerDistance = Math.sqrt(Math.pow(this.x - gameEngine.player.x, 2) + Math.pow(this.y - gameEngine.player.y, 2));

    // 状态机核心逻辑
    switch (this.state) {
        case 'wandering':
            this.updateWanderingState(playerDistance, gameEngine, currentTime);
            break;
        case 'aware':
            this.updateAwareState(playerDistance, gameEngine, currentTime);
            break;
        case 'chasing':
            this.updateChasingState(playerDistance, gameEngine, currentTime);
            break;
        case 'attacking':
            this.updateAttackingState(playerDistance, gameEngine, currentTime);
            break;
        default:
            this.state = 'wandering';
            break;
    }
};

BaseZombie.prototype.updateAnimation = function(deltaTime) {
    var currentTime = Date.now();
    
    if (this.isWalking && currentTime - this.lastAnimationTime >= this.walkAnimationSpeed) {
        this.walkAnimationFrame = (this.walkAnimationFrame + 1) % 4;
        this.lastAnimationTime = currentTime;
    }
};

BaseZombie.prototype.moveTowardsPlayer = function(player) {
    var dx = player.x - this.x;
    var dy = player.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > this.attackRange) {
        var normalizedDx = dx / distance;
        var normalizedDy = dy / distance;
        
        this.x += normalizedDx * this.moveSpeed;
        this.y += normalizedDy * this.moveSpeed;
        
        this.isWalking = true;
        this.updateDirection(normalizedDx, normalizedDy);
    } else {
        this.isWalking = false;
        // 在攻击范围内，尝试攻击
        this.tryAttack(player);
    }
};

BaseZombie.prototype.updateDirection = function(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
    } else {
        this.direction = dy > 0 ? 'down' : 'up';
    }
};

BaseZombie.prototype.tryAttack = function(player) {
    var currentTime = Date.now();
    
    if (currentTime - this.lastAttackTime >= this.attackCooldown) {
        this.attackPlayer(player);
        this.lastAttackTime = currentTime;
    }
};

BaseZombie.prototype.attackPlayer = function(player) {
    if (!player.isDead) {
        player.health -= this.attack;
        if (player.health <= 0) {
            player.health = 0;
            player.isDead = true;
        }
        console.log('[Zombie] 僵尸攻击玩家，造成', this.attack, '点伤害');
    }
};

BaseZombie.prototype.takeDamage = function(damage) {
    this.health -= damage;
    if (this.health <= 0) {
        this.health = 0;
        this.isDead = true;
        console.log('[Zombie] 僵尸死亡:', this.id);
    }
};

BaseZombie.prototype.render = function(ctx, camera) {
    if (this.isDead) return;
    
    var screenX = this.x - camera.x + camera.width / 2;
    var screenY = this.y - camera.y + camera.height / 2;
    
    // 绘制僵尸
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制血条
    this.renderHealthBar(ctx, screenX, screenY);
    
    // 绘制方向指示器
    this.renderDirectionIndicator(ctx, screenX, screenY);
};

BaseZombie.prototype.renderHealthBar = function(ctx, screenX, screenY) {
    var barWidth = this.radius * 2;
    var barHeight = 4;
    var barY = screenY - this.radius - 10;
    
    // 背景
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);
    
    // 血量
    var healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(screenX - barWidth / 2, barY, barWidth * healthPercent, barHeight);
};

BaseZombie.prototype.renderDirectionIndicator = function(ctx, screenX, screenY) {
    if (!this.isWalking) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    var directionText = '';
    switch (this.direction) {
        case 'up': directionText = '↑'; break;
        case 'down': directionText = '↓'; break;
        case 'left': directionText = '←'; break;
        case 'right': directionText = '→'; break;
    }
    
    ctx.fillText(directionText, screenX, screenY + this.radius + 15);
};

// ========================================
// AI状态机方法
// ========================================

BaseZombie.prototype.updateWanderingState = function(playerDistance, gameEngine, currentTime) {
    // 检查玩家对象是否有效
    if (!gameEngine || !gameEngine.player || gameEngine.player.health <= 0 || gameEngine.player.isDead) {
        return;
    }

    // 检测是否有人类进入察觉范围（70%检测范围）
    var awareRange = this.detectionRange * 0.7;
    if (playerDistance <= awareRange && gameEngine.player.health > 0 && !gameEngine.player.isDead) {
        // 游荡→察觉：检测到人类进入察觉范围
        this.state = 'aware';
        this.target = gameEngine.player;
        this.lastStateChangeTime = currentTime;
        return;
    }

    // 继续游荡
    this.wander(100); // 固定时间间隔
};

BaseZombie.prototype.updateAwareState = function(playerDistance, gameEngine, currentTime) {
    // 检查目标是否仍然有效
    if (!this.target || this.target.health <= 0 || this.target.isDead) {
        // 察觉→游荡：目标无效
        this.state = 'wandering';
        this.target = null;
        return;
    }

    // 检查是否进入追击范围
    if (playerDistance <= this.detectionRange) {
        // 察觉→追击：进入追击范围
        this.state = 'chasing';
        return;
    }

    // 检查是否超出察觉范围
    if (playerDistance > this.detectionRange * 0.8) {
        // 察觉→游荡：超出察觉范围
        this.state = 'wandering';
        this.target = null;
        return;
    }

    // 察觉状态：缓慢转向玩家方向
    var dx = this.target.x - this.x;
    var dy = this.target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        var dirX = dx / distance;
        var dirY = dy / distance;

        // 缓慢移动（0.3倍速度）
        var slowSpeed = this.moveSpeed * 0.3;
        var newX = this.x + dirX * slowSpeed;
        var newY = this.y + dirY * slowSpeed;

        // 检查移动安全性
        if (this.canZombieMoveTo(newX, newY, this.gameEngine)) {
            this.x = newX;
            this.y = newY;
            this.isWalking = true;
            this.direction = this.getDirectionFromDelta(dirX, dirY);
        }
    }
};

BaseZombie.prototype.updateChasingState = function(playerDistance, gameEngine, currentTime) {
    // 检查目标是否仍然有效
    if (!this.target || this.target.health <= 0 || this.target.isDead) {
        // 追击→游荡：目标无效
        this.state = 'wandering';
        this.target = null;
        return;
    }

    // 检查目标是否超出检测范围（增加追击距离）
    var chaseDistance = this.detectionRange * 1.2; // 追击距离比检测范围多20%
    if (playerDistance > chaseDistance) {
        // 追击→游荡：目标超出追击距离
        this.state = 'wandering';
        this.target = null;
        return;
    }

    // 检查是否进入攻击范围
    if (playerDistance <= this.attackRange) {
        // 追击→攻击：与目标距离≤攻击范围
        this.state = 'attacking';
        this.lastStateChangeTime = currentTime;
        return;
    }

    // 继续追击
    this.chaseTarget(this.target);
};

BaseZombie.prototype.updateAttackingState = function(playerDistance, gameEngine, currentTime) {
    // 检查目标是否仍然有效
    if (!this.target || this.target.health <= 0 || this.target.isDead) {
        // 攻击→游荡：目标无效
        this.state = 'wandering';
        this.target = null;
        return;
    }

    // 检查目标是否逃离攻击范围
    if (playerDistance > this.attackRange) {
        var chaseDistance = this.detectionRange * 1.2; // 追击距离比检测范围多20%
        if (playerDistance <= chaseDistance) {
            // 攻击→追击：目标逃离攻击范围但仍在追击距离内
            this.state = 'chasing';
        } else {
            // 攻击→游荡：目标超出追击距离
            this.state = 'wandering';
            this.target = null;
        }
        return;
    }

    // 执行攻击
    if (currentTime - this.lastAttackTime >= this.attackCooldown) {
        // 再次检查目标是否有效，防止在攻击过程中目标被清空
        if (this.target && this.target.health > 0 && !this.target.isDead) {
            this.attackTarget(this.target);
            this.lastAttackTime = currentTime;
        } else {
            // 目标无效，切换到游荡状态
            this.state = 'wandering';
            this.target = null;
        }
    }
};

// ========================================
// AI辅助方法
// ========================================

// 游荡行为
BaseZombie.prototype.wander = function(interval) {
    var currentTime = Date.now();
    
    // 检查是否需要设置新的游荡目标
    if (!this.wanderTarget || currentTime - this.wanderTimer > interval) {
        this.setNewWanderTarget();
        this.wanderTimer = currentTime;
    }
    
    // 向游荡目标移动
    if (this.wanderTarget) {
        this.moveTowardsTarget(this.wanderTarget.x, this.wanderTarget.y, this.moveSpeed * 0.6);
    }
};

BaseZombie.prototype.setNewWanderTarget = function() {
    // 在当前位置周围随机选择一个目标点
    var wanderRadius = 80 + Math.random() * 120; // 80-200像素范围
    var angle = Math.random() * Math.PI * 2;
    
    this.wanderTarget = {
        x: this.x + Math.cos(angle) * wanderRadius,
        y: this.y + Math.sin(angle) * wanderRadius
    };
    
    // 确保游荡目标在地图范围内
    if (this.gameEngine && this.gameEngine.mapConfig) {
        this.wanderTarget.x = Math.max(50, Math.min(this.gameEngine.mapConfig.width - 50, this.wanderTarget.x));
        this.wanderTarget.y = Math.max(50, Math.min(this.gameEngine.mapConfig.height - 50, this.wanderTarget.y));
    }
};

// 追击行为
BaseZombie.prototype.chaseTarget = function(target) {
    if (!target) return;
    
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        var dirX = dx / distance;
        var dirY = dy / distance;
        
        var newX = this.x + dirX * this.moveSpeed;
        var newY = this.y + dirY * this.moveSpeed;
        
        // 检查移动安全性
        if (this.canZombieMoveTo(newX, newY, this.gameEngine)) {
            this.x = newX;
            this.y = newY;
            this.isWalking = true;
            this.direction = this.getDirectionFromDelta(dirX, dirY);
        }
    }
};

// 向目标移动（通用方法）
BaseZombie.prototype.moveTowardsTarget = function(targetX, targetY, speed) {
    var dx = targetX - this.x;
    var dy = targetY - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) { // 如果距离目标足够远
        var dirX = dx / distance;
        var dirY = dy / distance;
        
        var newX = this.x + dirX * speed;
        var newY = this.y + dirY * speed;
        
        // 检查移动安全性
        if (this.canZombieMoveTo(newX, newY, this.gameEngine)) {
            this.x = newX;
            this.y = newY;
            this.isWalking = true;
            this.direction = this.getDirectionFromDelta(dirX, dirY);
        }
    } else {
        this.isWalking = false;
    }
};

// 攻击目标
BaseZombie.prototype.attackTarget = function(target) {
    if (!target || target.isDead) return;
    
    // 造成伤害
    target.health -= this.attack;
    
    if (target.health <= 0) {
        target.health = 0;
        target.isDead = true;
    }
    
    console.log('[Zombie] 僵尸攻击目标，造成', this.attack, '点伤害');
};

// 检查僵尸是否可以移动到指定位置
BaseZombie.prototype.canZombieMoveTo = function(x, y, gameEngine) {
    if (!gameEngine) return true;
    
    var zombieRadius = 20; // 僵尸的碰撞半径
    
    // 检查地图边界
    if (gameEngine.mapConfig) {
        if (x < zombieRadius || x > gameEngine.mapConfig.width - zombieRadius ||
            y < zombieRadius || y > gameEngine.mapConfig.height - zombieRadius) {
            return false;
        }
    }
    
    // 检查建筑物碰撞
    if (gameEngine.buildings && Array.isArray(gameEngine.buildings)) {
        for (var i = 0; i < gameEngine.buildings.length; i++) {
            var building = gameEngine.buildings[i];
            
            if (!building || typeof building.x !== 'number' || typeof building.y !== 'number') {
                continue;
            }
            
            // 计算僵尸中心到建筑物边缘的最短距离
            var closestX = Math.max(building.x, Math.min(x, building.x + building.width));
            var closestY = Math.max(building.y, Math.min(y, building.y + building.height));
            
            var distanceSquared = Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2);
            var minDistanceSquared = Math.pow(zombieRadius, 2);
            
            // 如果距离小于安全距离，不能移动
            if (distanceSquared < minDistanceSquared) {
                return false;
            }
        }
    }
    
    return true;
};

// 根据移动方向获取朝向
BaseZombie.prototype.getDirectionFromDelta = function(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
    } else {
        return dy > 0 ? 'down' : 'up';
    }
};

// 更新移动状态
BaseZombie.prototype.updateMovement = function(deltaTime) {
    // 记录上一帧的位置
    var lastX = this.lastX || this.x;
    var lastY = this.lastY || this.y;
    
    // 检查是否在移动
    var moved = Math.abs(this.x - lastX) > 0.1 || Math.abs(this.y - lastY) > 0.1;
    this.isWalking = moved;
    
    // 更新位置记录
    this.lastX = this.x;
    this.lastY = this.y;
};

// 检查是否在攻击范围内
BaseZombie.prototype.isInAttackRange = function(target) {
    if (!target) return false;
    
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= this.attackRange;
};

// 检查是否在检测范围内
BaseZombie.prototype.isInDetectionRange = function(target) {
    if (!target) return false;
    
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= this.detectionRange;
};

// 获取到目标的距离
BaseZombie.prototype.getDistanceToTarget = function(target) {
    if (!target) return Infinity;
    
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
};

// ========================================
// 僵尸类型定义
// ========================================

function ThinZombie(config) {
    BaseZombie.call(this, config);
    this.type = 'thin';
    this.health = 30;
    this.maxHealth = 30;
    this.attack = 8;
    this.moveSpeed = 5.0; // 基础速度，会根据生存天数调整
    this.detectionRange = 600;
    this.attackRange = 25;
    this.attackCooldown = 1200;
    this.size = 1.0;
}

ThinZombie.prototype = Object.create(BaseZombie.prototype);
ThinZombie.prototype.constructor = ThinZombie;

ThinZombie.prototype.render = function(ctx, camera) {
    if (this.isDead) return;
    
    var screenX = this.x - camera.x + camera.width / 2;
    var screenY = this.y - camera.y + camera.height / 2;
    
    // 绘制瘦僵尸（椭圆形）
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY, this.radius, this.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制血条
    this.renderHealthBar(ctx, screenX, screenY);
    
    // 绘制方向指示器
    this.renderDirectionIndicator(ctx, screenX, screenY);
};

function FatZombie(config) {
    BaseZombie.call(this, config);
    this.type = 'fat';
    this.health = 50;
    this.maxHealth = 50;
    this.attack = 12;
    this.moveSpeed = 4.5; // 基础速度，会根据生存天数调整
    this.detectionRange = 700;
    this.attackRange = 25;
    this.attackCooldown = 1500;
    this.size = 1.3;
}

FatZombie.prototype = Object.create(BaseZombie.prototype);
FatZombie.prototype.constructor = FatZombie;

FatZombie.prototype.render = function(ctx, camera) {
    if (this.isDead) return;
    
    var screenX = this.x - camera.x + camera.width / 2;
    var screenY = this.y - camera.y + camera.height / 2;
    
    // 绘制胖僵尸（圆形）
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制血条
    this.renderHealthBar(ctx, screenX, screenY);
    
    // 绘制方向指示器
    this.renderDirectionIndicator(ctx, screenX, screenY);
};

function ZombieBoss1(config) {
    BaseZombie.call(this, config);
    this.type = 'boss1';
    this.health = 100;
    this.maxHealth = 100;
    this.attack = 20;
    this.moveSpeed = 6.0; // 基础速度，会根据生存天数调整
    this.detectionRange = 1000;
    this.attackRange = 30;
    this.attackCooldown = 1000;
    this.size = 1.5;
}

ZombieBoss1.prototype = Object.create(BaseZombie.prototype);
ZombieBoss1.prototype.constructor = ZombieBoss1;

ZombieBoss1.prototype.render = function(ctx, camera) {
    if (this.isDead) return;
    
    var screenX = this.x - camera.x + camera.width / 2;
    var screenY = this.y - camera.y + camera.height / 2;
    
    // 绘制Boss僵尸（大圆形，带光环）
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制光环
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制血条
    this.renderHealthBar(ctx, screenX, screenY);
    
    // 绘制方向指示器
    this.renderDirectionIndicator(ctx, screenX, screenY);
};

ZombieBoss1.prototype.attackPlayer = function(player) {
    if (!player.isDead) {
        // Boss攻击有击退效果
        var knockbackDistance = 20;
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            player.x += (dx / distance) * knockbackDistance;
            player.y += (dy / distance) * knockbackDistance;
        }
        
        player.health -= this.attack;
        if (player.health <= 0) {
            player.health = 0;
            player.isDead = true;
        }
        console.log('[ZombieBoss] Boss僵尸攻击玩家，造成', this.attack, '点伤害，击退距离:', knockbackDistance);
    }
};
