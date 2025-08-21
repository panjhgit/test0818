/**
 * 僵尸管理器 - 从game.js提取
 * 兼容抖音小程序环境 (ES5)
 */
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
            if (gameEngine.gameData) {
                gameEngine.gameData.zombieKills = (gameEngine.gameData.zombieKills || 0) + 1;
            }
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
