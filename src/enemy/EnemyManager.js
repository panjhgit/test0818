/**
 * 敌人管理器 - 统一管理所有敌人的生成、更新和AI
 */
function EnemyManager() {
    this.enemies = [];
    this.enemyClasses = {};
    this.spawnRules = this.initializeSpawnRules();
    this.idCounter = 1;
    
    console.log('[EnemyManager] 敌人管理器初始化');
}

/**
 * 初始化生成规则
 */
EnemyManager.prototype.initializeSpawnRules = function() {
    return {
        zombie_normal: { health: 15, attack: 5, moveSpeed: 2, weight: 10 },
        zombie_elite: { health: 30, attack: 10, moveSpeed: 2.5, weight: 2 },
        zombie_patient: { health: 10, attack: 3, moveSpeed: 1.5, weight: 5 },
        zombie_doctor: { health: 25, attack: 7, moveSpeed: 2, weight: 3 },
        zombie_criminal: { health: 20, attack: 8, moveSpeed: 2.5, weight: 3 },
        zombie_worker: { health: 18, attack: 6, moveSpeed: 2, weight: 4 },
        zombie_boss: { health: 50, attack: 15, moveSpeed: 1.5, weight: 1 },
        zombie_drunk: { health: 12, attack: 4, moveSpeed: 1, weight: 3 }
    };
};

/**
 * 注册敌人类型
 */
EnemyManager.prototype.registerEnemyType = function(typeName, enemyClass) {
    this.enemyClasses[typeName] = enemyClass;
    console.log('[EnemyManager] 注册敌人类型:', typeName);
};

/**
 * 创建敌人
 */
EnemyManager.prototype.createEnemy = function(type, position) {
    var spawnRule = this.spawnRules[type];
    if (!spawnRule) {
        console.warn('[EnemyManager] 未知敌人类型:', type);
        spawnRule = this.spawnRules.zombie_normal;
    }
    
    var EnemyClass = this.enemyClasses[type] || BaseEnemy;
    
    var config = {
        id: type + '_' + this.idCounter++,
        type: type,
        x: position.x,
        y: position.y,
        health: spawnRule.health,
        maxHealth: spawnRule.health,
        attack: spawnRule.attack,
        moveSpeed: spawnRule.moveSpeed,
        detectionRange: 60
    };
    
    try {
        var enemy = new EnemyClass(config);
        this.enemies.push(enemy);
        console.log('[EnemyManager] 创建敌人:', type, 'ID:', enemy.id);
        return enemy;
    } catch (error) {
        console.error('[EnemyManager] 敌人创建失败:', type, error);
        return null;
    }
};

/**
 * 根据规则生成敌人群
 */
EnemyManager.prototype.spawnEnemyGroup = function(enemyTypes, bounds) {
    var spawnCount = this.calculateSpawnCount();
    var spawnedEnemies = [];
    
    for (var i = 0; i < spawnCount; i++) {
        var enemyType = this.selectRandomEnemyType(enemyTypes);
        var position = this.getRandomSpawnPosition(bounds);
        
        var enemy = this.createEnemy(enemyType, position);
        if (enemy) {
            spawnedEnemies.push(enemy);
        }
    }
    
    console.log('[EnemyManager] 生成敌人群:', spawnedEnemies.length, '个敌人');
    return spawnedEnemies;
};

/**
 * 计算生成数量
 */
EnemyManager.prototype.calculateSpawnCount = function() {
    var random = Math.random();
    
    if (random < 0.1) {
        return 5 + Math.floor(Math.random() * 4); // 5-8个 (10%概率)
    } else if (random < 0.3) {
        return 1 + Math.floor(Math.random() * 2); // 1-2个 (20%概率)
    } else {
        return 3 + Math.floor(Math.random() * 2); // 3-4个 (70%概率)
    }
};

/**
 * 选择随机敌人类型
 */
EnemyManager.prototype.selectRandomEnemyType = function(availableTypes) {
    if (!availableTypes || availableTypes.length === 0) {
        return 'zombie_normal';
    }
    
    // 基于权重的随机选择
    var totalWeight = 0;
    var weightedTypes = [];
    
    for (var i = 0; i < availableTypes.length; i++) {
        var type = availableTypes[i];
        var weight = this.spawnRules[type] ? this.spawnRules[type].weight : 1;
        totalWeight += weight;
        weightedTypes.push({ type: type, weight: weight });
    }
    
    var random = Math.random() * totalWeight;
    var currentWeight = 0;
    
    for (var j = 0; j < weightedTypes.length; j++) {
        currentWeight += weightedTypes[j].weight;
        if (random <= currentWeight) {
            return weightedTypes[j].type;
        }
    }
    
    return availableTypes[0]; // 后备方案
};

/**
 * 获取随机生成位置
 */
EnemyManager.prototype.getRandomSpawnPosition = function(bounds) {
    return {
        x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
        y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY)
    };
};

/**
 * 更新所有敌人
 */
EnemyManager.prototype.updateAll = function(deltaTime, targets) {
    for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        if (enemy.alive) {
            enemy.update(deltaTime, targets);
        }
    }
    
    // 清理死亡敌人
    this.enemies = this.enemies.filter(function(enemy) {
        return enemy.alive;
    });
};

/**
 * 渲染所有敌人
 */
EnemyManager.prototype.renderAll = function(ctx) {
    for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        if (enemy.alive) {
            enemy.render(ctx);
        }
    }
};

/**
 * 获取指定范围内的敌人
 */
EnemyManager.prototype.getEnemiesInRange = function(x, y, range) {
    var enemiesInRange = [];
    var rangeSquared = range * range;
    
    for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        if (enemy.alive) {
            var distanceSquared = 
                Math.pow(enemy.x - x, 2) + 
                Math.pow(enemy.y - y, 2);
            
            if (distanceSquared <= rangeSquared) {
                enemiesInRange.push(enemy);
            }
        }
    }
    
    return enemiesInRange;
};

/**
 * 清理所有敌人
 */
EnemyManager.prototype.clearAll = function() {
    this.enemies = [];
    console.log('[EnemyManager] 所有敌人已清理');
};

/**
 * 获取敌人统计信息
 */
EnemyManager.prototype.getStats = function() {
    var stats = {
        total: this.enemies.length,
        alive: 0,
        byType: {},
        byState: {}
    };
    
    for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        
        if (enemy.alive) {
            stats.alive++;
            
            // 按类型统计
            if (!stats.byType[enemy.type]) {
                stats.byType[enemy.type] = 0;
            }
            stats.byType[enemy.type]++;
            
            // 按状态统计
            if (!stats.byState[enemy.state]) {
                stats.byState[enemy.state] = 0;
            }
            stats.byState[enemy.state]++;
        }
    }
    
    return stats;
};
