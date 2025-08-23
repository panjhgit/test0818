
// ========================================
// 建筑和地图系统 (Building & Map System)
// ========================================

/**
 * 获取建筑类型配置
 */
function getBuildingTypes() {
    return [{
        type: 'police_station', name: '警察局', width: 70, height: 70, color: '#3498db', weight: 1
    }, {
        type: 'hospital', name: '医院', width: 70, height: 70, color: '#e74c3c', weight: 1
    }, {
        type: 'school', name: '学校', width: 60, height: 60, color: '#f39c12', weight: 2
    }, {
        type: 'shop', name: '商店', width: 50, height: 40, color: '#27ae60', weight: 4, oneTimeOnly: true
    }, {
        type: 'restaurant', name: '餐厅', width: 50, height: 40, color: '#e67e22', weight: 4, oneTimeOnly: true
    }, {
        type: 'house', name: '民房', width: 40, height: 40, color: '#95a5a6', weight: 8
    }, {
        type: 'villa', name: '别墅', width: 70, height: 50, color: '#8e44ad', weight: 4
    }];
}

/**
 * 计算建筑位置
 */
function calculateBuildingPosition(blockX, blockY, mapConfig) {
    var blockStartX = blockX * mapConfig.blockSize;
    var blockStartY = blockY * mapConfig.blockSize;

    var buildingX = blockStartX + mapConfig.streetWidth;
    var buildingY = blockStartY + mapConfig.streetWidth;
    var buildingWidth = mapConfig.blockSize - mapConfig.streetWidth;
    var buildingHeight = mapConfig.blockSize - mapConfig.streetWidth;

    if (buildingX + buildingWidth > mapConfig.width || buildingY + buildingHeight > mapConfig.height) {
        return null;
    }

    return {
        x: buildingX, y: buildingY, width: buildingWidth, height: buildingHeight
    };
}

/**
 * 初始化建筑物
 */
function initializeBuildings(mapConfig) {
    var buildings = [];
    var buildingId = 1;
    var buildingTypes = getBuildingTypes();

    var blocksX = Math.floor(mapConfig.width / mapConfig.blockSize);
    var blocksY = Math.floor(mapConfig.height / mapConfig.blockSize);

    for (var blockX = 0; blockX < blocksX; blockX++) {
        for (var blockY = 0; blockY < blocksY; blockY++) {
            var typeIndex = Math.floor(Math.random() * buildingTypes.length);
            var buildingType = buildingTypes[typeIndex];
            var position = calculateBuildingPosition(blockX, blockY, mapConfig);

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
}

/**
 * 探索建筑
 */
function exploreBuilding(building, gameEngine) {
    if (building.oneTimeOnly && building.explored) {
        return;
    }

    gameEngine.playerPositionBeforeEntering = {x: gameEngine.player.x, y: gameEngine.player.y};
    gameEngine.followersPositionBeforeEntering = [];
    for (var i = 0; i < gameEngine.followers.length; i++) {
        gameEngine.followersPositionBeforeEntering.push({
            x: gameEngine.followers[i].x, y: gameEngine.followers[i].y
        });
    }

    gameEngine.currentBuilding = building;
    gameEngine.subMapType = building.type;
    gameEngine.gameState = 'submap';

    // 进入子地图时暂停主地图的四叉树更新
    if (gameEngine.viewportCulling) {
        gameEngine.viewportCulling.pauseMainMapUpdates = true;
    }

    gameEngine.player.x = 200;
    gameEngine.player.y = 130;

    var maxTeamSize = Math.min(gameEngine.followers.length, 12);
    var submapBounds = {minX: 70, maxX: 330, minY: 120, maxY: 280};

    for (var i = 0; i < maxTeamSize; i++) {
        var follower = gameEngine.followers[i];
        var row = Math.floor(i / 4);
        var col = i % 4;
        var baseOffsetX = (col - 1.5) * 35;
        var baseOffsetY = (row + 1) * 35;
        var randomOffsetX = (Math.random() - 0.5) * 10;
        var randomOffsetY = (Math.random() - 0.5) * 10;

        var newX = gameEngine.player.x + baseOffsetX + randomOffsetX;
        var newY = gameEngine.player.y + baseOffsetY + randomOffsetY;

        newX = Math.max(submapBounds.minX, Math.min(submapBounds.maxX, newX));
        newY = Math.max(submapBounds.minY, Math.min(submapBounds.maxY, newY));

        follower.x = newX;
        follower.y = newY;
    }

    for (var j = maxTeamSize; j < gameEngine.followers.length; j++) {
        gameEngine.followers[j].x = -100;
        gameEngine.followers[j].y = -100;
    }

    gameEngine.generateSubMapContent();
}

/**
 * 退出建筑
 */
function exitBuilding(gameEngine) {
    var building = gameEngine.currentBuilding;

    if (building) {
        building.explored = true;
        gameEngine.exploredBuildings.push(building);
    }

    if (building && gameEngine.playerPositionBeforeEntering) {
        gameEngine.player.x = gameEngine.playerPositionBeforeEntering.x;
        gameEngine.player.y = gameEngine.playerPositionBeforeEntering.y;

        if (gameEngine.followersPositionBeforeEntering) {
            for (var i = 0; i < Math.min(gameEngine.followers.length, gameEngine.followersPositionBeforeEntering.length); i++) {
                var follower = gameEngine.followers[i];
                var savedPosition = gameEngine.followersPositionBeforeEntering[i];

                follower.x = savedPosition.x;
                follower.y = savedPosition.y;

                follower.x = Math.max(100, Math.min(gameEngine.mapConfig.width - 100, follower.x));
                follower.y = Math.max(100, Math.min(gameEngine.mapConfig.height - 100, follower.y));
            }
        }

        gameEngine.playerPositionBeforeEntering = null;
        gameEngine.followersPositionBeforeEntering = null;
    } else {
        if (building) {
            var doorInfo = gameEngine.calculateDoorInfo(building);
            var doorCenterX = doorInfo.originalX + doorInfo.originalWidth / 2;
            var doorCenterY = doorInfo.originalY + doorInfo.originalHeight / 2;

            gameEngine.player.x = doorCenterX;
            gameEngine.player.y = doorCenterY + 120;

            for (var i = 0; i < gameEngine.followers.length; i++) {
                var follower = gameEngine.followers[i];
                var row = Math.floor(i / 3);
                var col = i % 3;
                var offsetX = (col - 1) * 40;
                var offsetY = row * 35 + 60;

                follower.x = gameEngine.player.x + offsetX;
                follower.y = gameEngine.player.y + offsetY;

                follower.x = Math.max(100, Math.min(gameEngine.mapConfig.width - 100, follower.x));
                follower.y = Math.max(100, Math.min(gameEngine.mapConfig.height - 100, follower.y));
            }
        }
    }

    gameEngine.gameState = 'playing';
    gameEngine.currentBuilding = null;
    gameEngine.subMapType = null;
    gameEngine.buildingExitCooldown = Date.now() + gameEngine.zombieModule.GAME_CONFIG.BUILDING.EXIT_COOLDOWN;
    gameEngine.zombies = [];
    gameEngine.resources = [];

    // 退出子地图时恢复主地图的四叉树更新
    if (gameEngine.viewportCulling) {
        gameEngine.viewportCulling.pauseMainMapUpdates = false;
        // 检查是否需要重新初始化四叉树
        if (gameEngine.viewportCulling.lastMapWidth !== gameEngine.mapConfig.width || gameEngine.viewportCulling.lastMapHeight !== gameEngine.mapConfig.height) {
            console.log('[ViewportCulling] 退出子地图后重新初始化四叉树');
            gameEngine.viewportCulling.resetQuadTree();
        }
    }
}

// 模块导出
module.exports = {
    getBuildingTypes: getBuildingTypes,
    calculateBuildingPosition: calculateBuildingPosition,
    initializeBuildings: initializeBuildings,
    exploreBuilding: exploreBuilding,
    exitBuilding: exitBuilding
};