/**
 * 建筑系统 - 管理建筑的创建、交互和子地图
 * 使用ES5语法，兼容抖音小程序环境
 */

// 建筑类
function Building(type, config, position) {
    this.type = type;
    this.config = config;
    this.name = config.name;
    this.x = position.x;
    this.y = position.y;
    this.width = config.size.width;
    this.height = config.size.height;
    this.color = config.color;
    this.explored = false;
    this.oneTimeOnly = config.oneTimeOnly || false;
    
    // 子地图相关
    this.subMap = null;
    this.subMapConfig = config.subMapConfig;
}

Building.prototype.createSubMap = function() {
    if (!this.subMap && this.subMapConfig) {
        // 使用工厂创建子地图
        this.subMap = SubMapFactory.createSubMap(this.type, this.subMapConfig);
        this.subMap.generateContent();
    }
    return this.subMap;
};

Building.prototype.canExplore = function() {
    return !(this.oneTimeOnly && this.explored);
};

Building.prototype.markExplored = function() {
    this.explored = true;
};

// 建筑管理器
function BuildingManager(mapConfig) {
    this.mapConfig = mapConfig;
    this.buildings = [];
    this.configManager = new BuildingConfigManager();
}

BuildingManager.prototype.initializeBuildings = function() {
    console.log('[BuildingManager] 开始初始化建筑...');
    
    var buildingTypes = this.configManager.getBuildingTypes();
    
    // 计算网格参数
    var blocksX = Math.floor(this.mapConfig.width / this.mapConfig.blockSize);
    var blocksY = Math.floor(this.mapConfig.height / this.mapConfig.blockSize);
    
    console.log('[BuildingManager] 地图网格: ' + blocksX + 'x' + blocksY + ' = ' + (blocksX * blocksY) + '个建筑');
    
    // 在每个街区生成一个建筑
    for (var blockX = 0; blockX < blocksX; blockX++) {
        for (var blockY = 0; blockY < blocksY; blockY++) {
            var building = this.createRandomBuilding(blockX, blockY, buildingTypes);
            if (building) {
                this.buildings.push(building);
            }
        }
    }
    
    console.log('[BuildingManager] 建筑初始化完成，总计: ' + this.buildings.length + '个建筑');
    return this.buildings;
};

BuildingManager.prototype.createRandomBuilding = function(blockX, blockY, buildingTypes) {
    // 根据权重随机选择建筑类型
    var totalWeight = 0;
    for (var i = 0; i < buildingTypes.length; i++) {
        totalWeight += buildingTypes[i].weight;
    }
    
    var randomWeight = Math.random() * totalWeight;
    var currentWeight = 0;
    var selectedType = null;
    
    for (var j = 0; j < buildingTypes.length; j++) {
        currentWeight += buildingTypes[j].weight;
        if (randomWeight <= currentWeight) {
            selectedType = buildingTypes[j];
            break;
        }
    }
    
    if (!selectedType) return null;
    
    // 获取完整配置
    var config = this.configManager.getConfig(selectedType.type);
    if (!config) return null;
    
    // 计算建筑位置
    var position = this.calculateBuildingPosition(blockX, blockY);
    
    return new Building(selectedType.type, config, position);
};

BuildingManager.prototype.calculateBuildingPosition = function(blockX, blockY) {
    // 计算街区的起始位置
    var blockStartX = blockX * this.mapConfig.blockSize;
    var blockStartY = blockY * this.mapConfig.blockSize;
    
    // 建筑占满整个格子，除了街道部分
    return {
        x: blockStartX + this.mapConfig.streetWidth,
        y: blockStartY + this.mapConfig.streetWidth
    };
};

BuildingManager.prototype.getBuildingAt = function(x, y) {
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        if (x >= building.x && x <= building.x + building.width &&
            y >= building.y && y <= building.y + building.height) {
            return building;
        }
    }
    return null;
};

BuildingManager.prototype.getBuildingsInArea = function(left, top, right, bottom) {
    var result = [];
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        if (building.x + building.width >= left &&
            building.x <= right &&
            building.y + building.height >= top &&
            building.y <= bottom) {
            result.push(building);
        }
    }
    return result;
};

BuildingManager.prototype.checkCollisionWithBuildings = function(x, y, radius) {
    radius = radius || 18;
    
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        
        // 圆形与矩形的碰撞检测
        var collision = this.circleRectCollision(x, y, radius, building);
        if (collision.collision) {
            return { collision: true, building: building };
        }
    }
    
    return { collision: false, building: null };
};

BuildingManager.prototype.circleRectCollision = function(circleX, circleY, radius, rect) {
    var closestX = Math.max(rect.x, Math.min(circleX, rect.x + rect.width));
    var closestY = Math.max(rect.y, Math.min(circleY, rect.y + rect.height));
    
    var distanceX = circleX - closestX;
    var distanceY = circleY - closestY;
    var distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    return {
        collision: distanceSquared < (radius * radius),
        closestX: closestX,
        closestY: closestY
    };
};

BuildingManager.prototype.calculateDoorInfo = function(building) {
    // 门在建筑底部中央
    var doorWidth = Math.min(building.width * 0.3, 30);
    var doorHeight = 8;
    
    return {
        x: building.x + (building.width - doorWidth) / 2,
        y: building.y + building.height - doorHeight,
        width: doorWidth,
        height: doorHeight
    };
};

BuildingManager.prototype.findNearestBuilding = function(x, y, maxDistance) {
    var nearest = null;
    var nearestDistance = maxDistance || Infinity;
    
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        var centerX = building.x + building.width / 2;
        var centerY = building.y + building.height / 2;
        
        var distance = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        if (distance < nearestDistance) {
            nearest = building;
            nearestDistance = distance;
        }
    }
    
    return { building: nearest, distance: nearestDistance };
};

// 导出（兼容不同环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Building: Building,
        BuildingManager: BuildingManager
    };
} else {
    // 浏览器环境或内联使用
    window.Building = Building;
    window.BuildingManager = BuildingManager;
}

