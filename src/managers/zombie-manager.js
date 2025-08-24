/**
 * 僵尸管理器
 * 管理所有僵尸的生成、更新和渲染
 */

function ZombieManager() {
    this.gameEngine = null; // 将在GameEngine中设置
    this.zombies = [];
    this.zombiePool = [];
    this.zombieTypes = {
        'thin': {
            health: 30,
            attack: 8,
            moveSpeed: 5.0,
            detectionRange: 600,
            attackCooldown: 1200,
            size: 1.0
        },
        'fat': {
            health: 50,
            attack: 12,
            moveSpeed: 4.5,
            detectionRange: 700,
            attackCooldown: 1500,
            size: 1.3
        },
        'boss1': {
            health: 100,
            attack: 20,
            moveSpeed: 6.0,
            detectionRange: 1000,
            attackCooldown: 1000,
            size: 1.5
        }
    };
    
    this.lastSpawnTime = 0;
    this.spawnInterval = 5000; // 5秒生成一次
    this.maxPoolSize = 100; // 对象池最大大小
}

ZombieManager.prototype.update = function(deltaTime) {
    if (!this.gameEngine) return;
    
    // 检查游戏是否已结束
    if (this.gameEngine.isGameEnded || this.gameEngine.gameState === 'gameover' || this.gameEngine.gameState === 'victory') {
        return;
    }
    
    // 更新所有僵尸
    for (var i = this.zombies.length - 1; i >= 0; i--) {
        var zombie = this.zombies[i];
        
        if (!zombie || zombie.isDead || zombie.health <= 0) {
            // 回收死亡的僵尸到对象池
            this.recycleZombie(zombie);
            this.zombies.splice(i, 1);
            continue;
        }
        
        zombie.update(deltaTime, this.gameEngine);
    }
    
    // 生成新僵尸
    this.trySpawnZombies();
    
    // 清理僵尸池
    this.cleanupZombiePool();
};

ZombieManager.prototype.trySpawnZombies = function() {
    if (!this.gameEngine || !this.gameEngine.gameData) return;
    
    var currentTime = Date.now();
    
    if (currentTime - this.lastSpawnTime < this.spawnInterval) {
        return;
    }
    
    // 根据生存天数计算最大僵尸数量
    var survivalDays = this.gameEngine.gameData.survivalDays || 1;
    var maxZombies = this.calculateMaxZombies(survivalDays);
    
    if (this.zombies.length >= maxZombies) {
        return;
    }
    
    // 根据生存天数计算生成数量
    var baseCount = 10;
    var perDayIncrease = 3;
    var spawnCount = Math.min(
        baseCount + Math.floor(survivalDays / 5) * perDayIncrease,
        maxZombies - this.zombies.length
    );
    
    for (var i = 0; i < spawnCount; i++) {
        this.spawnZombie();
    }
    
    this.lastSpawnTime = currentTime;
};

ZombieManager.prototype.calculateMaxZombies = function(survivalDays) {
    var baseMax = 50;
    var dayMultiplier = Math.floor(survivalDays / 10);
    return Math.min(baseMax + dayMultiplier * 10, 200); // 最多200个僵尸
};

ZombieManager.prototype.spawnZombie = function() {
    var player = this.gameEngine.player;
    if (!player) return;
    
    var maxAttempts = this.maxAttemptsMultiplier * 10;
    var zombie = null;
    
    for (var attempt = 0; attempt < maxAttempts; attempt++) {
        var angle = Math.random() * Math.PI * 2;
        var distance = this.spawnRadius * (0.5 + Math.random() * 0.5);
        
        var x = player.x + Math.cos(angle) * distance;
        var y = player.y + Math.sin(angle) * distance;
        
        if (this.isSafeSpawnPosition(x, y)) {
            zombie = this.createZombie(x, y);
            break;
        }
    }
    
    if (zombie) {
        this.zombies.push(zombie);
        console.log('[ZombieManager] 生成僵尸:', zombie.type, '位置:', zombie.x, zombie.y);
    }
};

ZombieManager.prototype.createZombie = function(x, y) {
    var survivalDays = this.gameEngine.gameData ? this.gameEngine.gameData.survivalDays : 1;
    var type = this.selectZombieType(survivalDays);
    
    // 尝试从对象池获取僵尸
    var zombie = this.getZombieFromPool(type);
    
    if (zombie) {
        // 重置僵尸状态
        zombie.reset(type, x, y);
        this.applyDifficultyScaling(zombie, survivalDays);
    } else {
        // 创建新僵尸
        var config = {
            id: 'zombie_' + Date.now() + '_' + Math.random(),
            type: type,
            x: x,
            y: y
        };
        
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
                break;
        }
        
        this.applyDifficultyScaling(zombie, survivalDays);
    }
    
    return zombie;
};

ZombieManager.prototype.selectZombieType = function(survivalDays) {
    var types = ['thin'];
    
    // 根据生存天数解锁不同类型的僵尸
    if (survivalDays >= 5) {
        types.push('fat');
    }
    
    if (survivalDays >= 15) {
        types.push('boss1');
    }
    
    // 根据天数调整各类型的权重
    var weights = [];
    for (var i = 0; i < types.length; i++) {
        switch (types[i]) {
            case 'thin':
                weights.push(60); // 60%概率
                break;
            case 'fat':
                weights.push(30); // 30%概率
                break;
            case 'boss1':
                weights.push(10); // 10%概率
                break;
        }
    }
    
    return this.weightedRandomSelect(types, weights);
};

ZombieManager.prototype.weightedRandomSelect = function(items, weights) {
    var totalWeight = 0;
    for (var i = 0; i < weights.length; i++) {
        totalWeight += weights[i];
    }
    
    var random = Math.random() * totalWeight;
    var currentWeight = 0;
    
    for (var i = 0; i < items.length; i++) {
        currentWeight += weights[i];
        if (random <= currentWeight) {
            return items[i];
        }
    }
    
    return items[0]; // 默认返回第一个
};

ZombieManager.prototype.applyDifficultyScaling = function(zombie, survivalDays) {
    // 根据生存天数调整僵尸属性
    var speedMultiplier = 1.0;
    
    if (survivalDays <= 10) {
        speedMultiplier = 1.2; // 至少比玩家快20%
    } else if (survivalDays <= 20) {
        speedMultiplier = 1.4;
    } else if (survivalDays <= 50) {
        speedMultiplier = 1.6;
    } else if (survivalDays <= 70) {
        speedMultiplier = 1.8;
    } else {
        speedMultiplier = 2.0;
    }
    
    // 应用速度倍数
    var baseSpeed = this.zombieTypes[zombie.type] ? this.zombieTypes[zombie.type].moveSpeed : zombie.moveSpeed;
    zombie.moveSpeed = baseSpeed * speedMultiplier;
    
    // 根据天数增加血量
    var healthMultiplier = 1.0 + Math.floor(survivalDays / 20) * 0.5;
    zombie.maxHealth = Math.floor(zombie.maxHealth * healthMultiplier);
    zombie.health = zombie.maxHealth;
};

ZombieManager.prototype.recycleZombie = function(zombie) {
    if (!zombie) return;
    
    // 重置僵尸状态
    zombie.isDead = false;
    zombie.active = false;
    zombie.health = zombie.maxHealth;
    zombie.state = 'wandering';
    zombie.target = null;
    
    // 添加到对象池（如果池未满）
    if (this.zombiePool.length < this.maxPoolSize) {
        this.zombiePool.push(zombie);
    }
};

ZombieManager.prototype.isSafeSpawnPosition = function(x, y) {
    var totalRadius = 30;
    
    // 检查是否与任何建筑物重叠
    for (var i = 0; i < this.gameEngine.buildings.length; i++) {
        var building = this.gameEngine.buildings[i];
        
        if (!building || typeof building.x !== 'number' || typeof building.y !== 'number') {
            continue;
        }
        
        var closestX = Math.max(building.x, Math.min(x, building.x + building.width));
        var closestY = Math.max(building.y, Math.min(y, building.y + building.height));
        
        var distanceSquared = Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2);
        var minDistanceSquared = Math.pow(totalRadius, 2);
        
        if (distanceSquared < minDistanceSquared) {
            return false;
        }
    }
    
    // 检查是否与玩家太近
    if (this.gameEngine.player) {
        var playerDistanceSquared = Math.pow(x - this.gameEngine.player.x, 2) + 
                                   Math.pow(y - this.gameEngine.player.y, 2);
        var minPlayerDistanceSquared = Math.pow(this.minDistance, 2);
        
        if (playerDistanceSquared < minPlayerDistanceSquared) {
            return false;
        }
    }
    
    return true;
};

ZombieManager.prototype.getZombiesInRange = function(x, y, range) {
    if (typeof x !== 'number' || typeof y !== 'number' || typeof range !== 'number' || 
        isNaN(x) || isNaN(y) || isNaN(range) || !isFinite(x) || !isFinite(y) || !isFinite(range)) {
        console.warn('[ZombieManager] 参数无效:', {x: x, y: y, range: range});
        return [];
    }
    
    if (!this.zombies || !Array.isArray(this.zombies)) {
        console.warn('[ZombieManager] zombies数组无效:', this.zombies);
        return [];
    }
    
    var zombiesInRange = [];
    
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        
        if (!zombie || typeof zombie !== 'object') {
            continue;
        }
        
        if (typeof zombie.x !== 'number' || typeof zombie.y !== 'number' || 
            isNaN(zombie.x) || isNaN(zombie.y) || !isFinite(zombie.x) || !isFinite(zombie.y)) {
            continue;
        }
        
        try {
            var distance = Math.sqrt(Math.pow(zombie.x - x, 2) + Math.pow(zombie.y - y, 2));
            
            if (distance <= range) {
                zombiesInRange.push({zombie: zombie, distance: distance});
            }
        } catch (error) {
            console.error('[ZombieManager] 计算距离时出错:', error);
        }
    }
    
    return zombiesInRange;
};

ZombieManager.prototype.render = function(ctx, camera) {
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        
        if (!zombie || zombie.isDead) continue;
        
        try {
            zombie.render(ctx, camera);
        } catch (error) {
            console.error('[ZombieManager] 渲染僵尸时出错:', error);
            zombie.renderFailed = true;
        }
    }
};

ZombieManager.prototype.cleanupZombiePool = function() {
    // 清理僵尸池中的无效对象
    for (var i = this.zombiePool.length - 1; i >= 0; i--) {
        if (!this.zombiePool[i] || this.zombiePool[i].isDead) {
            this.zombiePool.splice(i, 1);
        }
    }
};

ZombieManager.prototype.getZombieFromPool = function(type) {
    for (var i = 0; i < this.zombiePool.length; i++) {
        if (this.zombiePool[i].type === type) {
            return this.zombiePool.splice(i, 1)[0];
        }
    }
    return null;
};
