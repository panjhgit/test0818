/**
 * 地图系统
 * 包含建筑物生成和地图相关功能
 */

/**
 * 初始化建筑物
 */
GameEngine.prototype.initializeBuildings = function() {
    var buildings = [];
    var buildingId = 1;
    var buildingTypes = this.getBuildingTypes();

    var blocksX = Math.floor(this.mapConfig.width / this.mapConfig.blockSize);
    var blocksY = Math.floor(this.mapConfig.height / this.mapConfig.blockSize);

    for (var blockX = 0; blockX < blocksX; blockX++) {
        for (var blockY = 0; blockY < blocksY; blockY++) {
            var typeIndex = Math.floor(Math.random() * buildingTypes.length);
            var buildingType = buildingTypes[typeIndex];
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

                buildings.push(building);
                buildingId++;
            }
        }
    }

    return buildings;
};

GameEngine.prototype.getBuildingTypes = function() {
    return [
        {
            type: 'police_station',
            name: '警察局',
            width: 70,
            height: 70,
            color: '#3498db',
            weight: 1
        },
        {
            type: 'hospital',
            name: '医院',
            width: 70,
            height: 70,
            color: '#e74c3c',
            weight: 1
        },
        {
            type: 'school',
            name: '学校',
            width: 60,
            height: 60,
            color: '#f39c12',
            weight: 2
        },
        {
            type: 'shop',
            name: '商店',
            width: 50,
            height: 40,
            color: '#27ae60',
            weight: 4,
            oneTimeOnly: true
        },
        {
            type: 'restaurant',
            name: '餐厅',
            width: 50,
            height: 40,
            color: '#e67e22',
            weight: 4,
            oneTimeOnly: true
        },
        {
            type: 'house',
            name: '民房',
            width: 40,
            height: 40,
            color: '#95a5a6',
            weight: 8
        },
        {
            type: 'villa',
            name: '别墅',
            width: 70,
            height: 50,
            color: '#8e44ad',
            weight: 4
        }
    ];
};

GameEngine.prototype.calculateBuildingPosition = function(blockX, blockY) {
    var blockStartX = blockX * this.mapConfig.blockSize;
    var blockStartY = blockY * this.mapConfig.blockSize;

    var buildingX = blockStartX + this.mapConfig.streetWidth;
    var buildingY = blockStartY + this.mapConfig.streetWidth;
    var buildingWidth = this.mapConfig.blockSize - this.mapConfig.streetWidth;
    var buildingHeight = this.mapConfig.blockSize - this.mapConfig.streetWidth;

    if (buildingX + buildingWidth > this.mapConfig.width || 
        buildingY + buildingHeight > this.mapConfig.height) {
        return null;
    }

    return {
        x: buildingX,
        y: buildingY,
        width: buildingWidth,
        height: buildingHeight
    };
};

GameEngine.prototype.exploreBuilding = function(building) {
    if (building.oneTimeOnly && building.explored) {
        return;
    }

    this.playerPositionBeforeEntering = {x: this.player.x, y: this.player.y};
    this.followersPositionBeforeEntering = [];
    for (var i = 0; i < this.followers.length; i++) {
        this.followersPositionBeforeEntering.push({
            x: this.followers[i].x,
            y: this.followers[i].y
        });
    }

    this.currentBuilding = building;
    this.subMapType = building.type;
    this.gameState = 'submap';

    // 进入子地图时暂停主地图的四叉树更新
    if (this.viewportCulling) {
        this.viewportCulling.pauseMainMapUpdates = true;
    }

    this.player.x = 200;
    this.player.y = 130;

    var maxTeamSize = Math.min(this.followers.length, 12);
    var submapBounds = {minX: 70, maxX: 330, minY: 120, maxY: 280};

    for (var i = 0; i < maxTeamSize; i++) {
        var follower = this.followers[i];
        var row = Math.floor(i / 4);
        var col = i % 4;
        var baseOffsetX = (col - 1.5) * 35;
        var baseOffsetY = (row + 1) * 35;
        var randomOffsetX = (Math.random() - 0.5) * 10;
        var randomOffsetY = (Math.random() - 0.5) * 10;

        var newX = this.player.x + baseOffsetX + randomOffsetX;
        var newY = this.player.y + baseOffsetY + randomOffsetY;

        newX = Math.max(submapBounds.minX, Math.min(submapBounds.maxX, newX));
        newY = Math.max(submapBounds.minY, Math.min(submapBounds.maxY, newY));

        follower.x = newX;
        follower.y = newY;
    }

    for (var j = maxTeamSize; j < this.followers.length; j++) {
        this.followers[j].x = -100;
        this.followers[j].y = -100;
    }

    this.generateSubMapContent();
};

GameEngine.prototype.exitBuilding = function() {
    var building = this.currentBuilding;

    if (building) {
        building.explored = true;
        this.exploredBuildings.push(building);
    }

    if (building && this.playerPositionBeforeEntering) {
        this.player.x = this.playerPositionBeforeEntering.x;
        this.player.y = this.playerPositionBeforeEntering.y;

        if (this.followersPositionBeforeEntering) {
            for (var i = 0; i < Math.min(this.followers.length, this.followersPositionBeforeEntering.length); i++) {
                var follower = this.followers[i];
                var savedPosition = this.followersPositionBeforeEntering[i];

                follower.x = savedPosition.x;
                follower.y = savedPosition.y;

                follower.x = Math.max(100, Math.min(this.mapConfig.width - 100, follower.x));
                follower.y = Math.max(100, Math.min(this.mapConfig.height - 100, follower.y));
            }
        }

        this.playerPositionBeforeEntering = null;
        this.followersPositionBeforeEntering = null;
    } else {
        if (building) {
            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.originalX + doorInfo.originalWidth / 2;
            var doorCenterY = doorInfo.originalY + doorInfo.originalHeight / 2;

            this.player.x = doorCenterX;
            this.player.y = doorCenterY + 120;

            for (var i = 0; i < this.followers.length; i++) {
                var follower = this.followers[i];
                var row = Math.floor(i / 3);
                var col = i % 3;
                var offsetX = (col - 1) * 40;
                var offsetY = row * 35 + 60;

                follower.x = this.player.x + offsetX;
                follower.y = this.player.y + offsetY;

                follower.x = Math.max(100, Math.min(this.mapConfig.width - 100, follower.x));
                follower.y = Math.max(100, Math.min(this.mapConfig.height - 100, follower.y));
            }
        }
    }

    this.gameState = 'playing';
    this.currentBuilding = null;
    this.subMapType = null;
    this.buildingExitCooldown = Date.now() + GAME_CONFIG.BUILDING.EXIT_COOLDOWN;
    this.zombies = [];
    this.resources = [];

    // 退出子地图时恢复主地图的四叉树更新
    if (this.viewportCulling) {
        this.viewportCulling.pauseMainMapUpdates = false;
        // 检查是否需要重新初始化四叉树
        if (this.viewportCulling.lastMapWidth !== this.mapConfig.width || 
            this.viewportCulling.lastMapHeight !== this.mapConfig.height) {
            console.log('[ViewportCulling] 退出子地图后重新初始化四叉树');
            this.viewportCulling.resetQuadTree();
        }
    }
};

GameEngine.prototype.calculateDoorInfo = function(building) {
    return {
        originalX: building.x,
        originalY: building.y,
        originalWidth: building.width,
        originalHeight: building.height
    };
};

GameEngine.prototype.generateSubMapContent = function() {
    // 子地图内容生成逻辑
    console.log('[SubMap] 生成子地图内容，类型:', this.subMapType);
    
    // 根据建筑类型生成不同的内容
    switch (this.subMapType) {
        case 'shop':
            this.generateShopContent();
            break;
        case 'hospital':
            this.generateHospitalContent();
            break;
        case 'police_station':
            this.generatePoliceStationContent();
            break;
        default:
            this.generateDefaultContent();
            break;
    }
};

GameEngine.prototype.generateShopContent = function() {
    // 商店内容：食物和资源
    for (var i = 0; i < 3; i++) {
        this.resources.push({
            type: 'food',
            x: 100 + i * 50,
            y: 200,
            amount: 5
        });
    }
};

GameEngine.prototype.generateHospitalContent = function() {
    // 医院内容：医疗用品
    for (var i = 0; i < 2; i++) {
        this.resources.push({
            type: 'medical',
            x: 120 + i * 60,
            y: 180,
            amount: 3
        });
    }
};

GameEngine.prototype.generatePoliceStationContent = function() {
    // 警察局内容：武器和弹药
    this.resources.push({
        type: 'weapon',
        x: 150,
        y: 200,
        amount: 1
    });
};

GameEngine.prototype.generateDefaultContent = function() {
    // 默认内容：少量资源
    if (Math.random() < 0.3) {
        this.resources.push({
            type: 'food',
            x: 150,
            y: 200,
            amount: 2
        });
    }
};
