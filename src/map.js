/**
 * 地图模块 (map.js)
 * 
 * 功能描述：
 * - 地图生成：程序化生成游戏世界地图
 * - 建筑系统：各种建筑的生成、管理和交互
 * - 地形渲染：地面、道路、障碍物等地形元素
 * - 区块管理：将大地图分割为区块以提高性能
 * - 建筑类型：医院、超市、警察局、学校等不同功能建筑
 * - 地图导航：寻路、距离计算、可达性检测
 * 
 * 主要类和方法：
 * - MapGenerator: 地图生成器
 * - BuildingManager: 建筑管理器
 * - TerrainRenderer: 地形渲染器
 * - NavigationSystem: 导航系统
 * - 建筑类型定义和生成逻辑
 */

/**
 * 地图生成器
 * @param {Object} config - 地图配置
 */
function MapGenerator(config) {
    this.config = config || {
        width: 4000,
        height: 4000,
        blockSize: 400,
        buildingDensity: 0.3,
        roadWidth: 30
    };
    
    this.buildingManager = new BuildingManager();
    this.terrainRenderer = new TerrainRenderer();
    this.navigationSystem = new NavigationSystem();
    
    // 地图数据
    this.mapData = {
        buildings: [],
        roads: [],
        obstacles: [],
        resources: [],
        spawnPoints: []
    };
    
    // 区块系统
    this.blocks = {};
    this.blocksX = Math.floor(this.config.width / this.config.blockSize);
    this.blocksY = Math.floor(this.config.height / this.config.blockSize);
}

/**
 * 生成完整地图
 * @returns {Object} 生成的地图数据
 */
MapGenerator.prototype.generateMap = function() {
    console.log('[MapGenerator] 开始生成地图...');
    
    // 1. 初始化区块
    this.initializeBlocks();
    
    // 2. 生成道路网络
    this.generateRoadNetwork();
    
    // 3. 生成建筑
    this.generateBuildings();
    
    // 4. 生成资源点
    this.generateResourcePoints();
    
    // 5. 生成障碍物
    this.generateObstacles();
    
    // 6. 设置生成点
    this.setupSpawnPoints();
    
    // 7. 构建导航网格
    this.navigationSystem.buildNavigationMesh(this.mapData);
    
    console.log('[MapGenerator] 地图生成完成');
    console.log('- 建筑数量:', this.mapData.buildings.length);
    console.log('- 道路数量:', this.mapData.roads.length);
    console.log('- 资源点数量:', this.mapData.resources.length);
    
    return this.mapData;
};

/**
 * 初始化区块系统
 */
MapGenerator.prototype.initializeBlocks = function() {
    for (var x = 0; x < this.blocksX; x++) {
        for (var y = 0; y < this.blocksY; y++) {
            var blockKey = x + ',' + y;
            this.blocks[blockKey] = {
                x: x,
                y: y,
                worldX: x * this.config.blockSize,
                worldY: y * this.config.blockSize,
                buildings: [],
                roads: [],
                resources: [],
                type: this.determineBlockType(x, y)
            };
        }
    }
};

/**
 * 确定区块类型
 * @param {number} x - 区块X坐标
 * @param {number} y - 区块Y坐标
 * @returns {string} 区块类型
 */
MapGenerator.prototype.determineBlockType = function(x, y) {
    var centerX = this.blocksX / 2;
    var centerY = this.blocksY / 2;
    var distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    var maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    var normalizedDistance = distance / maxDistance;
    
    if (normalizedDistance < 0.3) {
        return 'downtown'; // 市中心
    } else if (normalizedDistance < 0.6) {
        return 'residential'; // 住宅区
    } else if (normalizedDistance < 0.8) {
        return 'suburban'; // 郊区
    } else {
        return 'rural'; // 农村
    }
};

/**
 * 生成道路网络
 */
MapGenerator.prototype.generateRoadNetwork = function() {
    var roadWidth = this.config.roadWidth;
    
    // 生成主干道（水平和垂直）
    for (var x = 0; x < this.blocksX; x++) {
        if (x % 2 === 0) { // 每两个区块一条主干道
            this.mapData.roads.push({
                type: 'main',
                x: x * this.config.blockSize,
                y: 0,
                width: roadWidth,
                height: this.config.height,
                direction: 'vertical'
            });
        }
    }
    
    for (var y = 0; y < this.blocksY; y++) {
        if (y % 2 === 0) {
            this.mapData.roads.push({
                type: 'main',
                x: 0,
                y: y * this.config.blockSize,
                width: this.config.width,
                height: roadWidth,
                direction: 'horizontal'
            });
        }
    }
    
    // 生成次要道路
    this.generateSecondaryRoads();
};

/**
 * 生成次要道路
 */
MapGenerator.prototype.generateSecondaryRoads = function() {
    var roadWidth = this.config.roadWidth / 2;
    
    for (var x = 1; x < this.blocksX; x += 2) {
        for (var y = 1; y < this.blocksY; y += 2) {
            // 在区块中心生成十字路口
            var centerX = x * this.config.blockSize + this.config.blockSize / 2;
            var centerY = y * this.config.blockSize + this.config.blockSize / 2;
            
            // 水平次要道路
            this.mapData.roads.push({
                type: 'secondary',
                x: centerX - this.config.blockSize / 2,
                y: centerY - roadWidth / 2,
                width: this.config.blockSize,
                height: roadWidth,
                direction: 'horizontal'
            });
            
            // 垂直次要道路
            this.mapData.roads.push({
                type: 'secondary',
                x: centerX - roadWidth / 2,
                y: centerY - this.config.blockSize / 2,
                width: roadWidth,
                height: this.config.blockSize,
                direction: 'vertical'
            });
        }
    }
};

/**
 * 生成建筑
 */
MapGenerator.prototype.generateBuildings = function() {
    for (var blockKey in this.blocks) {
        var block = this.blocks[blockKey];
        this.generateBuildingsInBlock(block);
    }
};

/**
 * 在指定区块中生成建筑
 * @param {Object} block - 区块对象
 */
MapGenerator.prototype.generateBuildingsInBlock = function(block) {
    var buildingTypes = this.getBuildingTypesForBlock(block);
    var buildingCount = this.getBuildingCountForBlock(block);
    
    for (var i = 0; i < buildingCount; i++) {
        var building = this.generateBuildingInBlock(block, buildingTypes);
        if (building) {
            this.mapData.buildings.push(building);
            block.buildings.push(building);
        }
    }
};

/**
 * 获取区块适用的建筑类型
 * @param {Object} block - 区块对象
 * @returns {Array} 建筑类型数组
 */
MapGenerator.prototype.getBuildingTypesForBlock = function(block) {
    var allTypes = this.buildingManager.getBuildingTypes();
    
    switch (block.type) {
        case 'downtown':
            return allTypes.filter(function(type) {
                return ['hospital', 'police_station', 'office', 'apartment'].indexOf(type.type) !== -1;
            });
        case 'residential':
            return allTypes.filter(function(type) {
                return ['house', 'apartment', 'school', 'supermarket'].indexOf(type.type) !== -1;
            });
        case 'suburban':
            return allTypes.filter(function(type) {
                return ['house', 'school', 'supermarket', 'gas_station'].indexOf(type.type) !== -1;
            });
        case 'rural':
            return allTypes.filter(function(type) {
                return ['house', 'farm', 'warehouse'].indexOf(type.type) !== -1;
            });
        default:
            return allTypes;
    }
};

/**
 * 获取区块中建筑数量
 * @param {Object} block - 区块对象
 * @returns {number} 建筑数量
 */
MapGenerator.prototype.getBuildingCountForBlock = function(block) {
    var baseDensity = this.config.buildingDensity;
    
    switch (block.type) {
        case 'downtown':
            return Math.floor(baseDensity * 8);
        case 'residential':
            return Math.floor(baseDensity * 6);
        case 'suburban':
            return Math.floor(baseDensity * 4);
        case 'rural':
            return Math.floor(baseDensity * 2);
        default:
            return Math.floor(baseDensity * 3);
    }
};

/**
 * 在区块中生成单个建筑
 * @param {Object} block - 区块对象
 * @param {Array} buildingTypes - 可用建筑类型
 * @returns {Object|null} 生成的建筑对象
 */
MapGenerator.prototype.generateBuildingInBlock = function(block, buildingTypes) {
    if (buildingTypes.length === 0) return null;
    
    var maxAttempts = 20;
    
    for (var attempt = 0; attempt < maxAttempts; attempt++) {
        var typeIndex = Math.floor(Math.random() * buildingTypes.length);
        var buildingType = buildingTypes[typeIndex];
        
        var position = this.findBuildingPosition(block, buildingType);
        if (position) {
            return this.buildingManager.createBuilding(buildingType, position, block);
        }
    }
    
    return null;
};

/**
 * 寻找建筑位置
 * @param {Object} block - 区块对象
 * @param {Object} buildingType - 建筑类型
 * @returns {Object|null} 位置对象 {x, y, width, height}
 */
MapGenerator.prototype.findBuildingPosition = function(block, buildingType) {
    var margin = 20; // 建筑间距
    var roadMargin = 40; // 距离道路的最小距离
    
    var minX = block.worldX + margin;
    var maxX = block.worldX + this.config.blockSize - buildingType.width - margin;
    var minY = block.worldY + margin;
    var maxY = block.worldY + this.config.blockSize - buildingType.height - margin;
    
    if (minX >= maxX || minY >= maxY) return null;
    
    var x = minX + Math.random() * (maxX - minX);
    var y = minY + Math.random() * (maxY - minY);
    
    var position = {
        x: x,
        y: y,
        width: buildingType.width,
        height: buildingType.height
    };
    
    // 检查是否与道路重叠
    if (this.isPositionNearRoad(position, roadMargin)) {
        return null;
    }
    
    // 检查是否与其他建筑重叠
    if (this.isPositionOccupied(position, block)) {
        return null;
    }
    
    return position;
};

/**
 * 检查位置是否靠近道路
 * @param {Object} position - 位置对象
 * @param {number} margin - 边距
 * @returns {boolean} 是否靠近道路
 */
MapGenerator.prototype.isPositionNearRoad = function(position, margin) {
    for (var i = 0; i < this.mapData.roads.length; i++) {
        var road = this.mapData.roads[i];
        
        var expandedRoad = {
            x: road.x - margin,
            y: road.y - margin,
            width: road.width + margin * 2,
            height: road.height + margin * 2
        };
        
        if (this.isRectangleOverlap(position, expandedRoad)) {
            return true;
        }
    }
    return false;
};

/**
 * 检查位置是否被占用
 * @param {Object} position - 位置对象
 * @param {Object} block - 区块对象
 * @returns {boolean} 是否被占用
 */
MapGenerator.prototype.isPositionOccupied = function(position, block) {
    for (var i = 0; i < block.buildings.length; i++) {
        var building = block.buildings[i];
        if (this.isRectangleOverlap(position, building)) {
            return true;
        }
    }
    return false;
};

/**
 * 检查两个矩形是否重叠
 * @param {Object} rect1 - 矩形1
 * @param {Object} rect2 - 矩形2
 * @returns {boolean} 是否重叠
 */
MapGenerator.prototype.isRectangleOverlap = function(rect1, rect2) {
    return !(rect1.x > rect2.x + rect2.width ||
             rect1.x + rect1.width < rect2.x ||
             rect1.y > rect2.y + rect2.height ||
             rect1.y + rect1.height < rect2.y);
};

/**
 * 生成资源点
 */
MapGenerator.prototype.generateResourcePoints = function() {
    var resourceTypes = ['food', 'medicine', 'weapon', 'material'];
    var resourceCount = Math.floor(this.mapData.buildings.length * 0.3);
    
    for (var i = 0; i < resourceCount; i++) {
        var type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        var position = this.findRandomPosition();
        
        if (position) {
            this.mapData.resources.push({
                id: 'resource_' + i,
                type: type,
                x: position.x,
                y: position.y,
                amount: Math.floor(Math.random() * 10) + 5,
                collected: false
            });
        }
    }
};

/**
 * 生成障碍物
 */
MapGenerator.prototype.generateObstacles = function() {
    var obstacleCount = Math.floor(this.mapData.buildings.length * 0.2);
    
    for (var i = 0; i < obstacleCount; i++) {
        var position = this.findRandomPosition();
        
        if (position) {
            this.mapData.obstacles.push({
                id: 'obstacle_' + i,
                type: 'debris',
                x: position.x,
                y: position.y,
                width: 20 + Math.random() * 30,
                height: 20 + Math.random() * 30,
                blocking: true
            });
        }
    }
};

/**
 * 寻找随机位置
 * @returns {Object|null} 位置对象 {x, y}
 */
MapGenerator.prototype.findRandomPosition = function() {
    var maxAttempts = 50;
    
    for (var attempt = 0; attempt < maxAttempts; attempt++) {
        var x = Math.random() * this.config.width;
        var y = Math.random() * this.config.height;
        
        var position = {x: x, y: y, width: 10, height: 10};
        
        // 检查是否与建筑或道路重叠
        if (!this.isPositionNearRoad(position, 20) && 
            !this.isPositionNearBuildings(position, 30)) {
            return {x: x, y: y};
        }
    }
    
    return null;
};

/**
 * 检查位置是否靠近建筑
 * @param {Object} position - 位置对象
 * @param {number} margin - 边距
 * @returns {boolean} 是否靠近建筑
 */
MapGenerator.prototype.isPositionNearBuildings = function(position, margin) {
    for (var i = 0; i < this.mapData.buildings.length; i++) {
        var building = this.mapData.buildings[i];
        
        var expandedBuilding = {
            x: building.x - margin,
            y: building.y - margin,
            width: building.width + margin * 2,
            height: building.height + margin * 2
        };
        
        if (this.isRectangleOverlap(position, expandedBuilding)) {
            return true;
        }
    }
    return false;
};

/**
 * 设置生成点
 */
MapGenerator.prototype.setupSpawnPoints = function() {
    // 玩家生成点（地图中心）
    this.mapData.spawnPoints.push({
        type: 'player',
        x: this.config.width / 2,
        y: this.config.height / 2
    });
    
    // 僵尸生成点（地图边缘）
    var edgePoints = [
        {x: 100, y: 100},
        {x: this.config.width - 100, y: 100},
        {x: 100, y: this.config.height - 100},
        {x: this.config.width - 100, y: this.config.height - 100}
    ];
    
    for (var i = 0; i < edgePoints.length; i++) {
        this.mapData.spawnPoints.push({
            type: 'zombie',
            x: edgePoints[i].x,
            y: edgePoints[i].y
        });
    }
};

/**
 * 建筑管理器
 */
function BuildingManager() {
    this.buildingTypes = this.initializeBuildingTypes();
    this.buildingIdCounter = 1;
}

/**
 * 初始化建筑类型
 * @returns {Array} 建筑类型数组
 */
BuildingManager.prototype.initializeBuildingTypes = function() {
    return [
        {
            type: 'hospital',
            name: '医院',
            width: 80,
            height: 60,
            color: '#E3F2FD',
            oneTimeOnly: false,
            resources: ['medicine'],
            description: '可以治疗伤员，获取医疗用品'
        },
        {
            type: 'supermarket',
            name: '超市',
            width: 70,
            height: 50,
            color: '#FFF3E0',
            oneTimeOnly: false,
            resources: ['food'],
            description: '可以获取食物和生活用品'
        },
        {
            type: 'police_station',
            name: '警察局',
            width: 60,
            height: 50,
            color: '#E8F5E8',
            oneTimeOnly: false,
            resources: ['weapon'],
            description: '可以获取武器和弹药'
        },
        {
            type: 'school',
            name: '学校',
            width: 90,
            height: 70,
            color: '#FFF8E1',
            oneTimeOnly: false,
            resources: ['survivor'],
            description: '可能有幸存者，获取教育资源'
        },
        {
            type: 'house',
            name: '住宅',
            width: 40,
            height: 30,
            color: '#F3E5F5',
            oneTimeOnly: true,
            resources: ['food', 'material'],
            description: '普通住宅，可能有少量资源'
        },
        {
            type: 'apartment',
            name: '公寓',
            width: 60,
            height: 80,
            color: '#E1F5FE',
            oneTimeOnly: true,
            resources: ['food', 'survivor'],
            description: '公寓楼，可能有幸存者'
        },
        {
            type: 'office',
            name: '办公楼',
            width: 70,
            height: 90,
            color: '#F9FBE7',
            oneTimeOnly: true,
            resources: ['material'],
            description: '办公楼，可能有办公用品'
        },
        {
            type: 'gas_station',
            name: '加油站',
            width: 50,
            height: 40,
            color: '#FFEBEE',
            oneTimeOnly: false,
            resources: ['fuel'],
            description: '加油站，可以获取燃料'
        },
        {
            type: 'farm',
            name: '农场',
            width: 100,
            height: 80,
            color: '#E8F5E8',
            oneTimeOnly: false,
            resources: ['food'],
            description: '农场，可以获取大量食物'
        },
        {
            type: 'warehouse',
            name: '仓库',
            width: 80,
            height: 60,
            color: '#EFEBE9',
            oneTimeOnly: true,
            resources: ['material', 'food'],
            description: '仓库，可能有各种物资'
        }
    ];
};

/**
 * 获取建筑类型列表
 * @returns {Array} 建筑类型数组
 */
BuildingManager.prototype.getBuildingTypes = function() {
    return this.buildingTypes;
};

/**
 * 根据类型获取建筑类型
 * @param {string} type - 建筑类型
 * @returns {Object|null} 建筑类型对象
 */
BuildingManager.prototype.getBuildingType = function(type) {
    for (var i = 0; i < this.buildingTypes.length; i++) {
        if (this.buildingTypes[i].type === type) {
            return this.buildingTypes[i];
        }
    }
    return null;
};

/**
 * 创建建筑
 * @param {Object} buildingType - 建筑类型
 * @param {Object} position - 位置信息
 * @param {Object} block - 所属区块
 * @returns {Object} 建筑对象
 */
BuildingManager.prototype.createBuilding = function(buildingType, position, block) {
    var building = {
        id: buildingType.type + '_' + this.buildingIdCounter++,
        name: buildingType.name,
        type: buildingType.type,
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        color: buildingType.color,
        explored: false,
        oneTimeOnly: buildingType.oneTimeOnly,
        resources: buildingType.resources ? buildingType.resources.slice() : [],
        description: buildingType.description,
        blockX: block.x,
        blockY: block.y,
        
        // 建筑状态
        isAccessible: true,
        lastVisited: 0,
        resourcesRemaining: true
    };
    
    return building;
};

/**
 * 地形渲染器
 */
function TerrainRenderer() {
    this.grassPattern = null;
    this.roadPattern = null;
    this.initialized = false;
}

/**
 * 初始化地形纹理
 * @param {Object} ctx - 2D渲染上下文
 */
TerrainRenderer.prototype.initialize = function(ctx) {
    if (this.initialized) return;
    
    // 创建草地纹理
    this.grassPattern = this.createGrassPattern(ctx);
    
    // 创建道路纹理
    this.roadPattern = this.createRoadPattern(ctx);
    
    this.initialized = true;
};

/**
 * 创建草地纹理
 * @param {Object} ctx - 2D渲染上下文
 * @returns {Object} 草地纹理
 */
TerrainRenderer.prototype.createGrassPattern = function(ctx) {
    var canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    var patternCtx = canvas.getContext('2d');
    
    // 绘制草地纹理
    patternCtx.fillStyle = '#4CAF50';
    patternCtx.fillRect(0, 0, 50, 50);
    
    // 添加一些变化
    for (var i = 0; i < 20; i++) {
        patternCtx.fillStyle = '#66BB6A';
        patternCtx.fillRect(Math.random() * 50, Math.random() * 50, 2, 2);
    }
    
    return ctx.createPattern(canvas, 'repeat');
};

/**
 * 创建道路纹理
 * @param {Object} ctx - 2D渲染上下文
 * @returns {Object} 道路纹理
 */
TerrainRenderer.prototype.createRoadPattern = function(ctx) {
    var canvas = document.createElement('canvas');
    canvas.width = 30;
    canvas.height = 30;
    var patternCtx = canvas.getContext('2d');
    
    // 绘制道路纹理
    patternCtx.fillStyle = '#616161';
    patternCtx.fillRect(0, 0, 30, 30);
    
    // 添加道路标线
    patternCtx.strokeStyle = '#FFEB3B';
    patternCtx.lineWidth = 1;
    patternCtx.setLineDash([5, 5]);
    patternCtx.beginPath();
    patternCtx.moveTo(0, 15);
    patternCtx.lineTo(30, 15);
    patternCtx.stroke();
    
    return ctx.createPattern(canvas, 'repeat');
};

/**
 * 渲染地形
 * @param {Object} ctx - 2D渲染上下文
 * @param {Object} viewport - 视口信息
 * @param {Object} mapData - 地图数据
 */
TerrainRenderer.prototype.render = function(ctx, viewport, mapData) {
    if (!this.initialized) {
        this.initialize(ctx);
    }
    
    // 渲染草地背景
    this.renderGrass(ctx, viewport);
    
    // 渲染道路
    this.renderRoads(ctx, viewport, mapData.roads);
    
    // 渲染建筑
    this.renderBuildings(ctx, viewport, mapData.buildings);
    
    // 渲染障碍物
    this.renderObstacles(ctx, viewport, mapData.obstacles);
    
    // 渲染资源点
    this.renderResources(ctx, viewport, mapData.resources);
};

/**
 * 渲染草地
 * @param {Object} ctx - 2D渲染上下文
 * @param {Object} viewport - 视口信息
 */
TerrainRenderer.prototype.renderGrass = function(ctx, viewport) {
    ctx.fillStyle = this.grassPattern || '#4CAF50';
    ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
};

/**
 * 渲染道路
 * @param {Object} ctx - 2D渲染上下文
 * @param {Object} viewport - 视口信息
 * @param {Array} roads - 道路数组
 */
TerrainRenderer.prototype.renderRoads = function(ctx, viewport, roads) {
    ctx.fillStyle = this.roadPattern || '#616161';
    
    for (var i = 0; i < roads.length; i++) {
        var road = roads[i];
        
        // 检查道路是否在视口内
        if (this.isInViewport(road, viewport)) {
            ctx.fillRect(road.x, road.y, road.width, road.height);
        }
    }
};

/**
 * 渲染建筑
 * @param {Object} ctx - 2D渲染上下文
 * @param {Object} viewport - 视口信息
 * @param {Array} buildings - 建筑数组
 */
TerrainRenderer.prototype.renderBuildings = function(ctx, viewport, buildings) {
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        
        // 检查建筑是否在视口内
        if (this.isInViewport(building, viewport)) {
            this.renderBuilding(ctx, building);
        }
    }
};

/**
 * 渲染单个建筑
 * @param {Object} ctx - 2D渲染上下文
 * @param {Object} building - 建筑对象
 */
TerrainRenderer.prototype.renderBuilding = function(ctx, building) {
    // 建筑主体
    ctx.fillStyle = building.color;
    ctx.fillRect(building.x, building.y, building.width, building.height);
    
    // 建筑边框
    ctx.strokeStyle = building.explored ? '#4CAF50' : '#333';
    ctx.lineWidth = building.explored ? 3 : 1;
    ctx.strokeRect(building.x, building.y, building.width, building.height);
    
    // 建筑名称
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(building.name, 
                building.x + building.width / 2, 
                building.y + building.height / 2);
};

/**
 * 渲染障碍物
 * @param {Object} ctx - 2D渲染上下文
 * @param {Object} viewport - 视口信息
 * @param {Array} obstacles - 障碍物数组
 */
TerrainRenderer.prototype.renderObstacles = function(ctx, viewport, obstacles) {
    ctx.fillStyle = '#795548';
    
    for (var i = 0; i < obstacles.length; i++) {
        var obstacle = obstacles[i];
        
        if (this.isInViewport(obstacle, viewport)) {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }
};

/**
 * 渲染资源点
 * @param {Object} ctx - 2D渲染上下文
 * @param {Object} viewport - 视口信息
 * @param {Array} resources - 资源数组
 */
TerrainRenderer.prototype.renderResources = function(ctx, viewport, resources) {
    for (var i = 0; i < resources.length; i++) {
        var resource = resources[i];
        
        if (!resource.collected && this.isPointInViewport(resource, viewport)) {
            var colors = {
                food: '#FF9800',
                medicine: '#E91E63',
                weapon: '#9C27B0',
                material: '#607D8B',
                fuel: '#FF5722'
            };
            
            ctx.fillStyle = colors[resource.type] || '#FFC107';
            ctx.beginPath();
            ctx.arc(resource.x, resource.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // 资源类型标识
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(resource.type.charAt(0).toUpperCase(), resource.x, resource.y + 3);
        }
    }
};

/**
 * 检查对象是否在视口内
 * @param {Object} object - 对象
 * @param {Object} viewport - 视口
 * @returns {boolean} 是否在视口内
 */
TerrainRenderer.prototype.isInViewport = function(object, viewport) {
    return !(object.x > viewport.x + viewport.width ||
             object.x + object.width < viewport.x ||
             object.y > viewport.y + viewport.height ||
             object.y + object.height < viewport.y);
};

/**
 * 检查点是否在视口内
 * @param {Object} point - 点对象
 * @param {Object} viewport - 视口
 * @returns {boolean} 是否在视口内
 */
TerrainRenderer.prototype.isPointInViewport = function(point, viewport) {
    return point.x >= viewport.x && point.x <= viewport.x + viewport.width &&
           point.y >= viewport.y && point.y <= viewport.y + viewport.height;
};

/**
 * 导航系统
 */
function NavigationSystem() {
    this.navigationMesh = null;
    this.pathfindingGrid = null;
    this.gridSize = 20; // 导航网格大小
}

/**
 * 构建导航网格
 * @param {Object} mapData - 地图数据
 */
NavigationSystem.prototype.buildNavigationMesh = function(mapData) {
    console.log('[NavigationSystem] 构建导航网格...');
    
    var gridWidth = Math.ceil(mapData.width / this.gridSize);
    var gridHeight = Math.ceil(mapData.height / this.gridSize);
    
    this.pathfindingGrid = [];
    
    // 初始化网格（0=可通行，1=不可通行）
    for (var x = 0; x < gridWidth; x++) {
        this.pathfindingGrid[x] = [];
        for (var y = 0; y < gridHeight; y++) {
            this.pathfindingGrid[x][y] = 0;
        }
    }
    
    // 标记建筑为不可通行
    this.markObstacles(mapData.buildings, gridWidth, gridHeight);
    
    // 标记障碍物为不可通行
    this.markObstacles(mapData.obstacles, gridWidth, gridHeight);
    
    console.log('[NavigationSystem] 导航网格构建完成');
};

/**
 * 标记障碍物
 * @param {Array} obstacles - 障碍物数组
 * @param {number} gridWidth - 网格宽度
 * @param {number} gridHeight - 网格高度
 */
NavigationSystem.prototype.markObstacles = function(obstacles, gridWidth, gridHeight) {
    for (var i = 0; i < obstacles.length; i++) {
        var obstacle = obstacles[i];
        
        var startX = Math.floor(obstacle.x / this.gridSize);
        var endX = Math.floor((obstacle.x + obstacle.width) / this.gridSize);
        var startY = Math.floor(obstacle.y / this.gridSize);
        var endY = Math.floor((obstacle.y + obstacle.height) / this.gridSize);
        
        for (var x = Math.max(0, startX); x <= Math.min(gridWidth - 1, endX); x++) {
            for (var y = Math.max(0, startY); y <= Math.min(gridHeight - 1, endY); y++) {
                this.pathfindingGrid[x][y] = 1;
            }
        }
    }
};

/**
 * 寻找路径
 * @param {Object} start - 起始点 {x, y}
 * @param {Object} end - 终点 {x, y}
 * @returns {Array|null} 路径点数组
 */
NavigationSystem.prototype.findPath = function(start, end) {
    if (!this.pathfindingGrid) return null;
    
    var startGrid = {
        x: Math.floor(start.x / this.gridSize),
        y: Math.floor(start.y / this.gridSize)
    };
    
    var endGrid = {
        x: Math.floor(end.x / this.gridSize),
        y: Math.floor(end.y / this.gridSize)
    };
    
    // 使用A*算法寻路
    return this.aStarPathfinding(startGrid, endGrid);
};

/**
 * A*寻路算法
 * @param {Object} start - 起始网格点
 * @param {Object} end - 终点网格点
 * @returns {Array|null} 路径点数组
 */
NavigationSystem.prototype.aStarPathfinding = function(start, end) {
    // 简化的A*实现
    var openList = [start];
    var closedList = [];
    var path = [];
    
    // 这里应该实现完整的A*算法
    // 为了简化，直接返回直线路径
    path.push({x: start.x * this.gridSize, y: start.y * this.gridSize});
    path.push({x: end.x * this.gridSize, y: end.y * this.gridSize});
    
    return path;
};

/**
 * 检查位置是否可通行
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {boolean} 是否可通行
 */
NavigationSystem.prototype.isWalkable = function(x, y) {
    if (!this.pathfindingGrid) return true;
    
    var gridX = Math.floor(x / this.gridSize);
    var gridY = Math.floor(y / this.gridSize);
    
    if (gridX < 0 || gridX >= this.pathfindingGrid.length ||
        gridY < 0 || gridY >= this.pathfindingGrid[0].length) {
        return false;
    }
    
    return this.pathfindingGrid[gridX][gridY] === 0;
};

// 导出类（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MapGenerator,
        BuildingManager,
        TerrainRenderer,
        NavigationSystem
    };
}
