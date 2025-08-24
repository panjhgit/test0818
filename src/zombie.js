/**
 * 僵尸模块 (zombie.js)
 * 
 * 功能描述：
 * - 基础僵尸类：生命值、攻击力、移动速度等基本属性
 * - 僵尸类型：瘦僵尸、胖僵尸、僵尸Boss等不同类型
 * - 僵尸AI：寻路、攻击、群体行为等智能系统
 * - 僵尸管理器：生成、更新、销毁僵尸的统一管理
 * - 僵尸渲染：不同类型僵尸的视觉表现
 * - 难度调节：根据游戏进度调整僵尸强度和数量
 * 
 * 主要类和方法：
 * - BaseZombie: 基础僵尸类
 * - ThinZombie: 瘦僵尸（速度快，血量少）
 * - FatZombie: 胖僵尸（速度慢，血量多）
 * - ZombieBoss1: 僵尸Boss（强力敌人）
 * - ZombieManager: 僵尸管理器
 */

/**
 * 基础僵尸类
 * @param {Object} config - 僵尸配置对象
 */
function BaseZombie(config) {
    // 基础属性
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.type = config.type || 'normal';
    
    // 位置和移动
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.targetX = this.x;
    this.targetY = this.y;
    this.moveSpeed = config.moveSpeed || 1.5;
    this.radius = config.radius || 15;
    
    // 战斗属性
    this.maxHealth = config.health || 30;
    this.health = this.maxHealth;
    this.attack = config.attack || 10;
    this.attackRange = config.attackRange || 25;
    this.attackCooldown = config.attackCooldown || 1000;
    this.lastAttackTime = 0;
    
    // 状态
    this.isAlive = true;
    this.state = 'idle'; // idle, chasing, attacking, dead
    this.currentTarget = null;
    
    // AI相关
    this.detectionRange = config.detectionRange || 150;
    this.aiUpdateInterval = 200; // AI更新间隔（毫秒）
    this.lastAiUpdate = 0;
    this.pathfindingCooldown = 0;
    
    // 渲染属性
    this.color = config.color || '#8B0000';
    this.size = config.size || 12;
    
    // 群体行为
    this.groupBehavior = config.groupBehavior !== false;
    this.separationDistance = 30;
    this.cohesionDistance = 80;
    
    // 特殊属性
    this.experienceValue = config.experienceValue || 10;
    this.dropChance = config.dropChance || 0.1;
}

/**
 * 僵尸更新逻辑
 * @param {number} deltaTime - 帧间隔时间
 */
BaseZombie.prototype.update = function(deltaTime) {
    if (!this.isAlive) return;
    
    // 更新AI
    this.updateAI(deltaTime);
    
    // 更新移动
    this.updateMovement(deltaTime);
    
    // 更新攻击冷却
    this.updateAttackCooldown(deltaTime);
    
    // 更新寻路冷却
    if (this.pathfindingCooldown > 0) {
        this.pathfindingCooldown -= deltaTime;
    }
};

/**
 * AI更新逻辑
 * @param {number} deltaTime - 帧间隔时间
 */
BaseZombie.prototype.updateAI = function(deltaTime) {
    this.lastAiUpdate += deltaTime;
    if (this.lastAiUpdate < this.aiUpdateInterval) return;
    this.lastAiUpdate = 0;
    
    // 寻找最近的目标
    var nearestTarget = this.findNearestTarget();
    
    if (nearestTarget) {
        var distance = this.getDistanceTo(nearestTarget);
        
        if (distance <= this.attackRange) {
            // 在攻击范围内
            this.attack(nearestTarget);
            this.state = 'attacking';
        } else if (distance <= this.detectionRange) {
            // 在检测范围内，开始追击
            this.currentTarget = nearestTarget;
            this.chaseTarget(nearestTarget);
            this.state = 'chasing';
        } else {
            // 超出检测范围，停止追击
            this.currentTarget = null;
            this.state = 'idle';
        }
    } else {
        // 没有发现目标
        this.currentTarget = null;
        this.state = 'idle';
    }
};

/**
 * 移动更新
 * @param {number} deltaTime - 帧间隔时间
 */
BaseZombie.prototype.updateMovement = function(deltaTime) {
    var dx = this.targetX - this.x;
    var dy = this.targetY - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
        var moveDistance = this.moveSpeed * (deltaTime / 16.67); // 标准化到60fps
        
        // 应用群体行为
        if (this.groupBehavior) {
            var groupForce = this.calculateGroupBehavior();
            dx += groupForce.x;
            dy += groupForce.y;
            distance = Math.sqrt(dx * dx + dy * dy);
        }
        
        if (moveDistance > distance) {
            moveDistance = distance;
        }
        
        if (distance > 0) {
            this.x += (dx / distance) * moveDistance;
            this.y += (dy / distance) * moveDistance;
        }
    }
};

/**
 * 攻击冷却更新
 * @param {number} deltaTime - 帧间隔时间
 */
BaseZombie.prototype.updateAttackCooldown = function(deltaTime) {
    if (this.lastAttackTime > 0) {
        this.lastAttackTime -= deltaTime;
        if (this.lastAttackTime < 0) {
            this.lastAttackTime = 0;
        }
    }
};

/**
 * 追击目标
 * @param {Object} target - 追击目标
 */
BaseZombie.prototype.chaseTarget = function(target) {
    if (this.pathfindingCooldown <= 0) {
        this.targetX = target.x;
        this.targetY = target.y;
        this.pathfindingCooldown = 100; // 100ms寻路冷却
    }
};

/**
 * 攻击目标
 * @param {Object} target - 攻击目标
 */
BaseZombie.prototype.attack = function(target) {
    if (this.lastAttackTime > 0) return false;
    if (!target || !target.isAlive) return false;
    
    var distance = this.getDistanceTo(target);
    if (distance > this.attackRange) return false;
    
    // 造成伤害
    target.takeDamage(this.attack);
    
    // 设置攻击冷却
    this.lastAttackTime = this.attackCooldown;
    
    return true;
};

/**
 * 受到伤害
 * @param {number} damage - 伤害值
 */
BaseZombie.prototype.takeDamage = function(damage) {
    if (!this.isAlive) return;
    
    this.health -= damage;
    if (this.health <= 0) {
        this.health = 0;
        this.handleDeath();
    }
};

/**
 * 处理死亡
 */
BaseZombie.prototype.handleDeath = function() {
    this.isAlive = false;
    this.state = 'dead';
    
    // 掉落物品逻辑
    if (Math.random() < this.dropChance) {
        this.dropItems();
    }
};

/**
 * 掉落物品
 */
BaseZombie.prototype.dropItems = function() {
    // 掉落物品逻辑，将在resource.js中实现
};

/**
 * 寻找最近的目标
 * @returns {Object|null} 最近的目标对象
 */
BaseZombie.prototype.findNearestTarget = function() {
    // 这里需要访问游戏引擎的角色管理器
    // 具体实现将在游戏引擎中提供目标列表
    return null;
};

/**
 * 计算群体行为
 * @returns {Object} 群体行为力向量 {x, y}
 */
BaseZombie.prototype.calculateGroupBehavior = function() {
    // 分离、聚合、对齐行为
    var separationForce = {x: 0, y: 0};
    var cohesionForce = {x: 0, y: 0};
    var neighborCount = 0;
    
    // 这里需要访问其他僵尸的位置信息
    // 具体实现将在僵尸管理器中提供
    
    return {
        x: separationForce.x + cohesionForce.x,
        y: separationForce.y + cohesionForce.y
    };
};

/**
 * 获取到目标的距离
 * @param {Object} target - 目标对象
 * @returns {number} 距离
 */
BaseZombie.prototype.getDistanceTo = function(target) {
    var dx = this.x - target.x;
    var dy = this.y - target.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 渲染僵尸
 * @param {Object} ctx - 2D渲染上下文
 */
BaseZombie.prototype.render = function(ctx) {
    if (!this.isAlive) return;
    
    // 绘制僵尸圆形
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制生命值条
    this.renderHealthBar(ctx);
    
    // 绘制状态指示器
    this.renderStateIndicator(ctx);
    
    ctx.restore();
};

/**
 * 渲染生命值条
 * @param {Object} ctx - 2D渲染上下文
 */
BaseZombie.prototype.renderHealthBar = function(ctx) {
    var barWidth = 20;
    var barHeight = 3;
    var barX = this.x - barWidth / 2;
    var barY = this.y - this.size - 8;
    
    // 背景
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 生命值
    var healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = '#F44336';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
};

/**
 * 渲染状态指示器
 * @param {Object} ctx - 2D渲染上下文
 */
BaseZombie.prototype.renderStateIndicator = function(ctx) {
    if (this.state === 'chasing') {
        // 绘制追击状态的红色光环
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 3, 0, Math.PI * 2);
        ctx.stroke();
    }
};

/**
 * 瘦僵尸类 - 速度快，血量少
 * @param {Object} config - 配置对象
 */
function ThinZombie(config) {
    config = config || {};
    config.type = 'thin';
    config.moveSpeed = config.moveSpeed || 2.5;
    config.health = config.health || 20;
    config.attack = config.attack || 8;
    config.color = config.color || '#CD5C5C';
    config.size = config.size || 10;
    config.experienceValue = config.experienceValue || 8;
    
    BaseZombie.call(this, config);
}
ThinZombie.prototype = Object.create(BaseZombie.prototype);
ThinZombie.prototype.constructor = ThinZombie;

/**
 * 胖僵尸类 - 速度慢，血量多
 * @param {Object} config - 配置对象
 */
function FatZombie(config) {
    config = config || {};
    config.type = 'fat';
    config.moveSpeed = config.moveSpeed || 1.0;
    config.health = config.health || 60;
    config.attack = config.attack || 15;
    config.color = config.color || '#8B0000';
    config.size = config.size || 18;
    config.experienceValue = config.experienceValue || 20;
    config.attackRange = config.attackRange || 30;
    
    BaseZombie.call(this, config);
}
FatZombie.prototype = Object.create(BaseZombie.prototype);
FatZombie.prototype.constructor = FatZombie;

/**
 * 僵尸Boss1类 - 强力敌人
 * @param {Object} config - 配置对象
 */
function ZombieBoss1(config) {
    config = config || {};
    config.type = 'boss1';
    config.moveSpeed = config.moveSpeed || 1.8;
    config.health = config.health || 150;
    config.attack = config.attack || 25;
    config.color = config.color || '#4B0000';
    config.size = config.size || 25;
    config.experienceValue = config.experienceValue || 100;
    config.attackRange = config.attackRange || 40;
    config.detectionRange = config.detectionRange || 200;
    config.dropChance = config.dropChance || 0.8;
    
    BaseZombie.call(this, config);
}
ZombieBoss1.prototype = Object.create(BaseZombie.prototype);
ZombieBoss1.prototype.constructor = ZombieBoss1;

// Boss特殊技能
ZombieBoss1.prototype.update = function(deltaTime) {
    BaseZombie.prototype.update.call(this, deltaTime);
    
    // Boss特殊行为逻辑
    this.updateBossAbilities(deltaTime);
};

ZombieBoss1.prototype.updateBossAbilities = function(deltaTime) {
    // Boss特殊技能实现
    // 例如：范围攻击、召唤小怪等
};

/**
 * 僵尸管理器
 */
function ZombieManager() {
    this.zombies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 5000; // 5秒生成间隔
    this.maxZombies = GAME_CONFIG.ZOMBIE_SPAWN.MAX_ZOMBIES;
    this.gameEngine = null; // 游戏引擎引用
    
    // 生成配置
    this.spawnConfig = {
        baseCount: GAME_CONFIG.ZOMBIE_SPAWN.BASE_COUNT,
        perDayIncrease: GAME_CONFIG.ZOMBIE_SPAWN.PER_DAY_INCREASE,
        spawnRadius: GAME_CONFIG.ZOMBIE_SPAWN.SPAWN_RADIUS,
        minDistance: GAME_CONFIG.ZOMBIE_SPAWN.MIN_DISTANCE
    };
}

/**
 * 添加僵尸
 * @param {Object} zombie - 僵尸对象
 */
ZombieManager.prototype.addZombie = function(zombie) {
    if (this.zombies.length >= this.maxZombies) {
        return false;
    }
    
    this.zombies.push(zombie);
    return true;
};

/**
 * 移除僵尸
 * @param {string} zombieId - 僵尸ID
 */
ZombieManager.prototype.removeZombie = function(zombieId) {
    for (var i = this.zombies.length - 1; i >= 0; i--) {
        if (this.zombies[i].id === zombieId) {
            this.zombies.splice(i, 1);
            break;
        }
    }
};

/**
 * 更新所有僵尸
 * @param {number} deltaTime - 帧间隔时间
 */
ZombieManager.prototype.update = function(deltaTime) {
    // 更新生成计时器
    this.spawnTimer += deltaTime;
    
    // 检查是否需要生成新僵尸
    if (this.spawnTimer >= this.spawnInterval) {
        this.spawnZombies();
        this.spawnTimer = 0;
    }
    
    // 更新所有僵尸
    for (var i = this.zombies.length - 1; i >= 0; i--) {
        var zombie = this.zombies[i];
        zombie.update(deltaTime);
        
        // 移除死亡的僵尸
        if (!zombie.isAlive) {
            this.zombies.splice(i, 1);
        }
    }
};

/**
 * 生成僵尸
 */
ZombieManager.prototype.spawnZombies = function() {
    if (!this.gameEngine || !this.gameEngine.characterManager) return;
    
    var player = this.gameEngine.characterManager.getPlayer();
    if (!player) return;
    
    var currentDay = this.gameEngine.day || 1;
    var spawnCount = Math.min(
        this.spawnConfig.baseCount + (currentDay - 1) * this.spawnConfig.perDayIncrease,
        this.maxZombies - this.zombies.length
    );
    
    for (var i = 0; i < spawnCount; i++) {
        var spawnPos = this.findSpawnPosition(player);
        if (spawnPos) {
            var zombie = this.createRandomZombie(spawnPos.x, spawnPos.y);
            this.addZombie(zombie);
        }
    }
};

/**
 * 寻找生成位置
 * @param {Object} player - 玩家对象
 * @returns {Object|null} 生成位置 {x, y}
 */
ZombieManager.prototype.findSpawnPosition = function(player) {
    var maxAttempts = 50;
    
    for (var i = 0; i < maxAttempts; i++) {
        var angle = Math.random() * Math.PI * 2;
        var distance = this.spawnConfig.minDistance + Math.random() * (this.spawnConfig.spawnRadius - this.spawnConfig.minDistance);
        
        var x = player.x + Math.cos(angle) * distance;
        var y = player.y + Math.sin(angle) * distance;
        
        // 检查位置是否有效（不与建筑物重叠等）
        if (this.isValidSpawnPosition(x, y)) {
            return {x: x, y: y};
        }
    }
    
    return null;
};

/**
 * 检查生成位置是否有效
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {boolean} 是否有效
 */
ZombieManager.prototype.isValidSpawnPosition = function(x, y) {
    // 检查是否与建筑物重叠
    if (this.gameEngine && this.gameEngine.checkCollisionWithBuildings) {
        return !this.gameEngine.checkCollisionWithBuildings(x, y, 15);
    }
    return true;
};

/**
 * 创建随机僵尸
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {Object} 僵尸对象
 */
ZombieManager.prototype.createRandomZombie = function(x, y) {
    var rand = Math.random();
    var config = {x: x, y: y};
    
    if (rand < 0.6) {
        return new BaseZombie(config);
    } else if (rand < 0.85) {
        return new ThinZombie(config);
    } else if (rand < 0.98) {
        return new FatZombie(config);
    } else {
        return new ZombieBoss1(config);
    }
};

/**
 * 渲染所有僵尸
 * @param {Object} ctx - 2D渲染上下文
 */
ZombieManager.prototype.render = function(ctx) {
    for (var i = 0; i < this.zombies.length; i++) {
        this.zombies[i].render(ctx);
    }
};

/**
 * 获取活着的僵尸数量
 * @returns {number} 活着的僵尸数量
 */
ZombieManager.prototype.getAliveCount = function() {
    return this.zombies.length;
};

/**
 * 获取指定范围内的僵尸
 * @param {number} x - 中心X坐标
 * @param {number} y - 中心Y坐标
 * @param {number} radius - 搜索半径
 * @returns {Array} 僵尸数组
 */
ZombieManager.prototype.getZombiesInRange = function(x, y, radius) {
    var zombiesInRange = [];
    
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        var distance = zombie.getDistanceTo({x: x, y: y});
        
        if (distance <= radius) {
            zombiesInRange.push(zombie);
        }
    }
    
    return zombiesInRange;
};

// 导出类（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseZombie,
        ThinZombie,
        FatZombie,
        ZombieBoss1,
        ZombieManager
    };
}
