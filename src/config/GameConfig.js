/**
 * 游戏配置管理 - 集中管理所有游戏配置
 */
function GameConfig() {
    this.config = {
        // 地图配置
        map: {
            width: 10000,
            height: 10000,
            blockSize: 450,
            streetWidth: 200,
            buildingSpacing: 0
        },
        
        // 摄像机配置
        camera: {
            smoothing: 0.1,
            zoom: 0.8,
            followOffset: { x: 0, y: 0 }
        },
        
        // 玩家配置
        player: {
            radius: 18,
            speed: 4,
            health: 20,
            startPosition: { x: 5000, y: 5000 }
        },
        
        // 团队配置
        team: {
            maxSize: 20,
            collisionDistance: 30,
            formationSpacing: 35
        },
        
        // 建筑配置
        building: {
            doorTriggerDistance: 53,
            interactionDistance: 48,
            submapBounds: {
                minX: 60, maxX: 340,
                minY: 110, maxY: 290
            }
        },
        
        // 性能配置
        performance: {
            maxVisibleNPCs: 50,
            maxTeamDisplayInSubmap: 12,
            distanceCheckOptimization: true
        }
    };
    
    console.log('[GameConfig] 游戏配置初始化完成');
}

/**
 * 获取配置值
 */
GameConfig.prototype.get = function(path) {
    var keys = path.split('.');
    var value = this.config;
    
    for (var i = 0; i < keys.length; i++) {
        if (value && typeof value === 'object' && keys[i] in value) {
            value = value[keys[i]];
        } else {
            console.warn('[GameConfig] 配置路径不存在:', path);
            return null;
        }
    }
    
    return value;
};

/**
 * 设置配置值
 */
GameConfig.prototype.set = function(path, newValue) {
    var keys = path.split('.');
    var obj = this.config;
    
    for (var i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in obj)) {
            obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = newValue;
    console.log('[GameConfig] 配置已更新:', path, '=', newValue);
};

/**
 * 获取完整配置
 */
GameConfig.prototype.getAll = function() {
    return JSON.parse(JSON.stringify(this.config)); // 深拷贝
};

/**
 * 重置为默认配置
 */
GameConfig.prototype.reset = function() {
    // 重新初始化配置
    this.config = this.getDefaultConfig();
    console.log('[GameConfig] 配置已重置为默认值');
};

/**
 * 验证配置完整性
 */
GameConfig.prototype.validate = function() {
    var requiredPaths = [
        'map.width', 'map.height', 'player.speed',
        'building.doorTriggerDistance', 'team.maxSize'
    ];
    
    for (var i = 0; i < requiredPaths.length; i++) {
        if (this.get(requiredPaths[i]) === null) {
            console.error('[GameConfig] 缺少必需配置:', requiredPaths[i]);
            return false;
        }
    }
    
    console.log('[GameConfig] 配置验证通过');
    return true;
};

// 全局配置实例
var gameConfig = new GameConfig();
