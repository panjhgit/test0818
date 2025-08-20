/**
 * 建筑管理器 - 处理建筑生成和管理
 * 兼容抖音小程序环境 (ES5)
 */
function BuildingManager(gameEngine) {
    this.gameEngine = gameEngine;
    this.buildings = [];
    this.exploredBuildings = [];
    this.nearBuilding = null;
    this.currentBuilding = null;
    this.buildingEntryPrompt = null;
    
    this.initializeBuildings();
}

/**
 * 初始化建筑物 - 生成约100个建筑的大地图
 */
BuildingManager.prototype.initializeBuildings = function() {
    this.buildings = [];
    var buildingId = 1;
    
    // 建筑类型定义
    var buildingTypes = this.getBuildingTypes();
    
    // 计算网格参数
    var mapConfig = this.gameEngine.mapConfig;
    var blocksX = Math.floor(mapConfig.width / mapConfig.blockSize);
    var blocksY = Math.floor(mapConfig.height / mapConfig.blockSize);
    
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
                
                this.buildings.push(building);
                buildingId++;
            }
        }
    }
    
    console.log('[BuildingManager] 生成了 ' + this.buildings.length + ' 个建筑');
};

/**
 * 获取建筑类型定义
 */
BuildingManager.prototype.getBuildingTypes = function() {
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
 * 计算建筑位置
 */
BuildingManager.prototype.calculateBuildingPosition = function(blockX, blockY) {
    var mapConfig = this.gameEngine.mapConfig;
    
    // 计算街区的起始位置
    var blockStartX = blockX * mapConfig.blockSize;
    var blockStartY = blockY * mapConfig.blockSize;
    
    // 建筑占满整个格子，但要避开街道
    var buildingX = blockStartX + mapConfig.streetWidth;
    var buildingY = blockStartY + mapConfig.streetWidth;
    var buildingWidth = mapConfig.blockSize - mapConfig.streetWidth;
    var buildingHeight = mapConfig.blockSize - mapConfig.streetWidth;
    
    // 确保建筑不会超出地图边界
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
 * 获取所有建筑
 */
BuildingManager.prototype.getBuildings = function() {
    return this.buildings;
};

/**
 * 检查玩家是否接近建筑
 */
BuildingManager.prototype.checkNearBuilding = function(player) {
    var nearBuilding = null;
    var minDistance = Infinity;
    var interactionDistance = 30;
    
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        
        // 计算建筑中心点
        var buildingCenterX = building.x + building.width / 2;
        var buildingCenterY = building.y + building.height / 2;
        
        // 计算玩家到建筑中心的距离
        var distance = Math.sqrt(
            Math.pow(player.x - buildingCenterX, 2) + 
            Math.pow(player.y - buildingCenterY, 2)
        );
        
        // 检查是否在交互范围内
        if (distance <= interactionDistance && distance < minDistance) {
            nearBuilding = building;
            minDistance = distance;
        }
    }
    
    this.nearBuilding = nearBuilding;
    return nearBuilding;
};

/**
 * 探索建筑
 */
BuildingManager.prototype.exploreBuilding = function(building) {
    if (!building) return false;
    
    // 检查是否已经探索过（对于一次性建筑）
    if (building.oneTimeOnly && building.explored) {
        console.log('[BuildingManager] 建筑已探索过:', building.name);
        return false;
    }
    
    // 标记为已探索
    building.explored = true;
    if (this.exploredBuildings.indexOf(building) === -1) {
        this.exploredBuildings.push(building);
    }
    
    this.currentBuilding = building;
    console.log('[BuildingManager] 探索建筑:', building.name, building.type);
    
    return true;
};

/**
 * 获取当前建筑
 */
BuildingManager.prototype.getCurrentBuilding = function() {
    return this.currentBuilding;
};

/**
 * 设置当前建筑
 */
BuildingManager.prototype.setCurrentBuilding = function(building) {
    this.currentBuilding = building;
};

/**
 * 获取接近的建筑
 */
BuildingManager.prototype.getNearBuilding = function() {
    return this.nearBuilding;
};

/**
 * 设置建筑进入提示
 */
BuildingManager.prototype.setBuildingEntryPrompt = function(prompt) {
    this.buildingEntryPrompt = prompt;
};

/**
 * 获取建筑进入提示
 */
BuildingManager.prototype.getBuildingEntryPrompt = function() {
    return this.buildingEntryPrompt;
};

/**
 * 检查建筑是否已探索
 */
BuildingManager.prototype.isBuildingExplored = function(building) {
    return building && building.explored;
};

/**
 * 获取已探索建筑列表
 */
BuildingManager.prototype.getExploredBuildings = function() {
    return this.exploredBuildings;
};