/**
 * 建筑工厂 - 使用工厂模式生成不同类型的建筑
 */
function BuildingFactory() {
    this.buildingClasses = {};
    this.buildingConfig = null;
    this.idCounter = 1;
    
    console.log('[BuildingFactory] 建筑工厂初始化');
}

/**
 * 设置建筑配置
 */
BuildingFactory.prototype.setBuildingConfig = function(config) {
    this.buildingConfig = config;
};

/**
 * 注册建筑类型
 */
BuildingFactory.prototype.registerBuildingType = function(typeName, buildingClass) {
    this.buildingClasses[typeName] = buildingClass;
    console.log('[BuildingFactory] 注册建筑类型:', typeName);
};

/**
 * 创建建筑
 */
BuildingFactory.prototype.createBuilding = function(typeName, position) {
    var buildingTypeConfig = this.buildingConfig.getBuildingType(typeName);
    if (!buildingTypeConfig) {
        console.error('[BuildingFactory] 未知建筑类型:', typeName);
        return null;
    }
    
    var BuildingClass = this.buildingClasses[typeName] || BaseBuilding;
    
    var config = {
        id: typeName + '_' + this.idCounter++,
        type: typeName,
        name: buildingTypeConfig.name,
        x: position.x,
        y: position.y,
        width: position.width || buildingTypeConfig.size.width,
        height: position.height || buildingTypeConfig.size.height,
        color: buildingTypeConfig.color,
        category: buildingTypeConfig.category,
        oneTimeOnly: buildingTypeConfig.oneTimeOnly,
        resources: buildingTypeConfig.resources,
        enemies: buildingTypeConfig.enemies,
        submapType: buildingTypeConfig.submapType,
        description: buildingTypeConfig.description
    };
    
    try {
        var building = new BuildingClass(config);
        console.log('[BuildingFactory] 创建建筑:', building.name, 'ID:', building.id);
        return building;
    } catch (error) {
        console.error('[BuildingFactory] 建筑创建失败:', typeName, error);
        return null;
    }
};

/**
 * 批量创建建筑
 */
BuildingFactory.prototype.createBuildingsForMap = function(mapConfig) {
    var buildings = [];
    var blocksX = Math.floor(mapConfig.width / mapConfig.blockSize);
    var blocksY = Math.floor(mapConfig.height / mapConfig.blockSize);
    
    console.log('[BuildingFactory] 开始生成建筑，网格:', blocksX + 'x' + blocksY);
    
    for (var blockX = 0; blockX < blocksX; blockX++) {
        for (var blockY = 0; blockY < blocksY; blockY++) {
            var buildingType = this.buildingConfig.getRandomBuildingType();
            var position = this.calculateBuildingPosition(blockX, blockY, mapConfig);
            
            if (position) {
                var building = this.createBuilding(buildingType.type || 'house', position);
                if (building) {
                    buildings.push(building);
                }
            }
        }
    }
    
    console.log('[BuildingFactory] 建筑生成完成，共', buildings.length, '个建筑');
    return buildings;
};

/**
 * 计算建筑在网格中的位置
 */
BuildingFactory.prototype.calculateBuildingPosition = function(blockX, blockY, mapConfig) {
    var blockStartX = blockX * mapConfig.blockSize;
    var blockStartY = blockY * mapConfig.blockSize;
    
    var buildingX = blockStartX + mapConfig.streetWidth;
    var buildingY = blockStartY + mapConfig.streetWidth;
    var buildingWidth = mapConfig.blockSize - mapConfig.streetWidth;
    var buildingHeight = mapConfig.blockSize - mapConfig.streetWidth;
    
    // 边界检查
    if (buildingX + buildingWidth > mapConfig.width ||
        buildingY + buildingHeight > mapConfig.height) {
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
 * 获取指定类型的所有建筑
 */
BuildingFactory.prototype.getBuildingsByType = function(buildings, typeName) {
    return buildings.filter(function(building) {
        return building.type === typeName;
    });
};

/**
 * 获取指定分类的所有建筑
 */
BuildingFactory.prototype.getBuildingsByCategory = function(buildings, category) {
    return buildings.filter(function(building) {
        return building.category === category;
    });
};
