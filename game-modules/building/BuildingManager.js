/**
 * 建筑管理器 - 管理建筑生成、交互和进入/退出逻辑
 * 兼容抖音小程序环境 (ES5)
 */
function BuildingManager(gameEngine) {
    this.gameEngine = gameEngine;
    this.buildings = [];
    this.nearBuilding = null;
    this.buildingEntryPrompt = null;
    this.playerPositionBeforeEntering = null;
    this.followersPositionBeforeEntering = null;
}

/**
 * 初始化建筑物
 */
BuildingManager.prototype.initializeBuildings = function() {
    var buildings = [];
    var buildingId = 1;
    var mapConfig = this.gameEngine.mapConfig;
    
    // 建筑类型定义
    var buildingTypes = this.getBuildingTypes();
    
    // 计算网格参数
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
                    color: buildingType.color,
                    oneTimeOnly: buildingType.oneTimeOnly || false,
                    explored: false
                };
                
                buildings.push(building);
                buildingId++;
            }
        }
    }
    
    this.buildings = buildings;
    console.log('[BuildingManager] 已生成', buildings.length, '个建筑');
    return buildings;
};

BuildingManager.prototype.getBuildingTypes = function() {
    return [
        { name: '商场', type: 'mall', color: '#e74c3c', oneTimeOnly: false },
        { name: '医院', type: 'hospital', color: '#2ecc71', oneTimeOnly: false },
        { name: '警察局', type: 'police', color: '#3498db', oneTimeOnly: false },
        { name: '学校', type: 'school', color: '#f39c12', oneTimeOnly: false },
        { name: '银行', type: 'bank', color: '#9b59b6', oneTimeOnly: false },
        { name: '餐厅', type: 'restaurant', color: '#e67e22', oneTimeOnly: false },
        { name: '图书馆', type: 'library', color: '#1abc9c', oneTimeOnly: false },
        { name: '电影院', type: 'cinema', color: '#34495e', oneTimeOnly: false },
        { name: '健身房', type: 'gym', color: '#e74c3c', oneTimeOnly: false },
        { name: '咖啡厅', type: 'cafe', color: '#8e44ad', oneTimeOnly: false }
    ];
};

BuildingManager.prototype.calculateBuildingPosition = function(blockX, blockY) {
    var mapConfig = this.gameEngine.mapConfig;
    
    // 计算街区的实际位置
    var blockStartX = blockX * mapConfig.blockSize;
    var blockStartY = blockY * mapConfig.blockSize;
    
    // 建筑占据整个街区，减去街道宽度
    var buildingWidth = mapConfig.blockSize - mapConfig.streetWidth;
    var buildingHeight = mapConfig.blockSize - mapConfig.streetWidth;
    
    // 建筑位置居中放置在街区内
    var buildingX = blockStartX + mapConfig.streetWidth / 2;
    var buildingY = blockStartY + mapConfig.streetWidth / 2;
    
    return {
        x: buildingX,
        y: buildingY,
        width: buildingWidth,
        height: buildingHeight
    };
};

/**
 * 检查玩家是否接近建筑门
 */
BuildingManager.prototype.checkNearDoor = function() {
    var player = this.gameEngine.player;
    var followers = this.gameEngine.followers;
    var camera = this.gameEngine.camera;
    var canvas = this.gameEngine.canvas;
    
    var playerRadius = 18;
    var interactionDistance = 30;
    
    // 重置当前接近的建筑
    this.nearBuilding = null;
    
    // 检查可见区域内的建筑
    var viewWidth = canvas.width / camera.zoom;
    var viewHeight = canvas.height / camera.zoom;
    var viewLeft = camera.x;
    var viewRight = camera.x + viewWidth;
    var viewTop = camera.y;
    var viewBottom = camera.y + viewHeight;
    
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        
        // 只检查可见区域内的建筑
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.x + doorInfo.width / 2;
            var doorCenterY = doorInfo.y + doorInfo.height / 2;
            
            // 检查整个团队是否有人接近门
            var teamNearDoor = false;
            var nearestMember = null;
            var nearestDistance = interactionDistance + playerRadius + 1;
            
            // 检查玩家
            var playerDistance = Math.sqrt(
                Math.pow(player.x - doorCenterX, 2) + 
                Math.pow(player.y - doorCenterY, 2)
            );
            
            if (playerDistance <= interactionDistance + playerRadius) {
                teamNearDoor = true;
                if (playerDistance < nearestDistance) {
                    nearestDistance = playerDistance;
                    nearestMember = 'player';
                }
            }
            
            // 检查团队成员
            for (var j = 0; j < followers.length; j++) {
                var follower = followers[j];
                var followerDistance = Math.sqrt(
                    Math.pow(follower.x - doorCenterX, 2) + 
                    Math.pow(follower.y - doorCenterY, 2)
                );
                
                if (followerDistance <= interactionDistance + playerRadius) {
                    teamNearDoor = true;
                    if (followerDistance < nearestDistance) {
                        nearestDistance = followerDistance;
                        nearestMember = follower.character.name;
                    }
                }
            }
            
            if (teamNearDoor) {
                this.nearBuilding = building;
                console.log('[Door] 团队接近建筑:', building.name, '距离:', nearestDistance.toFixed(1));
                
                // 检查是否在进入范围内，显示询问提示
                if (nearestDistance <= playerRadius + 25) {
                    console.log('[Door] 触发建筑进入询问:', building.name);
                    this.showBuildingEntryPrompt(building);
                }
                break;
            }
        }
    }
    
    // 如果没有接近任何建筑，清除询问提示
    if (!this.nearBuilding && this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        console.log('[Door] 离开建筑门口，清除询问提示');
        this.buildingEntryPrompt = null;
    }
};

/**
 * 显示建筑进入询问提示
 */
BuildingManager.prototype.showBuildingEntryPrompt = function(building) {
    this.buildingEntryPrompt = {
        building: building,
        buildingId: building.id,
        active: true,
        message: '是否进入 ' + building.name + '？',
        options: ['进入', '取消']
    };
    
    console.log('[Door] 询问提示已设置，建筑:', building.name, 'ID:', building.id);
};

/**
 * 处理建筑进入询问提示的点击
 */
BuildingManager.prototype.handleBuildingEntryPromptClick = function(x, y) {
    console.log('[Prompt] 处理询问提示点击:', x, y);
    
    var prompt = this.buildingEntryPrompt;
    var canvas = this.gameEngine.canvas;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    
    // 计算按钮位置（与渲染函数保持一致）
    var boxHeight = 150;
    var boxY = centerY - boxHeight / 2;
    var buttonWidth = 80;
    var buttonHeight = 35;
    var buttonY = boxY + 90;
    
    // 进入按钮
    var enterButtonX = centerX - buttonWidth - 20;
    if (x >= enterButtonX && x <= enterButtonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
        
        // 严格验证建筑是否仍然是当前接近的建筑
        if (this.nearBuilding && 
            this.nearBuilding.id === prompt.building.id && 
            this.nearBuilding.name === prompt.building.name) {
            console.log('[Prompt] 建筑验证通过，进入建筑:', prompt.building.name);
            this.exploreBuilding(prompt.building);
        } else {
            console.log('[Prompt] 建筑验证失败，无法进入');
        }
        
        this.buildingEntryPrompt = null;
        return true;
    }
    
    // 取消按钮
    var cancelButtonX = centerX + 20;
    if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('[Prompt] 玩家选择取消进入建筑');
        this.buildingEntryPrompt = null;
        return true;
    }
    
    return false;
};

/**
 * 探索建筑物
 */
BuildingManager.prototype.exploreBuilding = function(building) {
    console.log('[Building] 开始进入建筑:', building.name);
    
    if (building.oneTimeOnly && building.explored) {
        console.log('[Building] 该建筑物只能探索一次，已探索过');
        return;
    }
    
    var player = this.gameEngine.player;
    var followers = this.gameEngine.followers;
    
    // 保存进入前的位置
    this.playerPositionBeforeEntering = { x: player.x, y: player.y };
    this.followersPositionBeforeEntering = [];
    for (var i = 0; i < followers.length; i++) {
        this.followersPositionBeforeEntering.push({
            x: followers[i].x,
            y: followers[i].y
        });
    }
    
    // 切换到子地图
    this.gameEngine.currentBuilding = building;
    this.gameEngine.subMapType = building.type;
    this.gameEngine.gameState = 'submap';
    
    // 将玩家放在子地图入口处
    player.x = 200;
    player.y = 130;
    
    // 将团队成员带入建筑
    this.arrangeTeamInSubMap();
    
    // 生成子地图内容
    this.gameEngine.generateSubMapContent();
    
    console.log('[Building] 建筑进入完成，当前状态:', this.gameEngine.gameState);
};

/**
 * 退出建筑
 */
BuildingManager.prototype.exitBuilding = function() {
    console.log('[Building] 退出建筑');
    
    var building = this.gameEngine.currentBuilding;
    var player = this.gameEngine.player;
    var followers = this.gameEngine.followers;
    
    // 标记建筑为已探索
    if (building) {
        building.explored = true;
        this.gameEngine.exploredBuildings.push(building);
    }
    
    // 恢复玩家和团队成员到进入前的位置
    if (this.playerPositionBeforeEntering) {
        player.x = this.playerPositionBeforeEntering.x;
        player.y = this.playerPositionBeforeEntering.y;
        
        // 恢复团队成员位置
        if (this.followersPositionBeforeEntering) {
            for (var i = 0; i < Math.min(followers.length, this.followersPositionBeforeEntering.length); i++) {
                var follower = followers[i];
                var savedPosition = this.followersPositionBeforeEntering[i];
                follower.x = savedPosition.x;
                follower.y = savedPosition.y;
            }
        }
        
        // 清理保存的位置数据
        this.playerPositionBeforeEntering = null;
        this.followersPositionBeforeEntering = null;
        
        console.log('[Building] 位置已恢复到进入前位置');
    }
    
    // 返回主地图
    this.gameEngine.gameState = 'playing';
    this.gameEngine.currentBuilding = null;
    this.gameEngine.subMapType = null;
    this.gameEngine.zombies = [];
    this.gameEngine.resources = [];
};

/**
 * 在子地图中安排团队成员
 */
BuildingManager.prototype.arrangeTeamInSubMap = function() {
    var followers = this.gameEngine.followers;
    var player = this.gameEngine.player;
    var maxTeamSize = Math.min(followers.length, 12);
    var submapBounds = { minX: 70, maxX: 330, minY: 120, maxY: 280 };
    
    for (var i = 0; i < maxTeamSize; i++) {
        var follower = followers[i];
        var row = Math.floor(i / 4);
        var col = i % 4;
        var baseOffsetX = (col - 1.5) * 35;
        var baseOffsetY = (row + 1) * 35;
        
        var newX = player.x + baseOffsetX;
        var newY = player.y + baseOffsetY;
        
        // 确保在边界内
        newX = Math.max(submapBounds.minX, Math.min(submapBounds.maxX, newX));
        newY = Math.max(submapBounds.minY, Math.min(submapBounds.maxY, newY));
        
        follower.x = newX;
        follower.y = newY;
    }
    
    // 隐藏超出显示限制的团队成员
    for (var j = maxTeamSize; j < followers.length; j++) {
        followers[j].x = -100;
        followers[j].y = -100;
    }
};

/**
 * 计算建筑门的信息
 */
BuildingManager.prototype.calculateDoorInfo = function(building) {
    var doorWidth = Math.max(30, Math.floor(building.width / 8));
    var doorHeight = Math.max(40, Math.floor(building.height / 6));
    var doorX = building.x + (building.width - doorWidth) / 2;
    var doorY = building.y + building.height - doorHeight - 5;
    
    return {
        x: doorX,
        y: doorY,
        width: doorWidth,
        height: doorHeight
    };
};

/**
 * 获取建筑子标题
 */
BuildingManager.prototype.getBuildingSubtitle = function(buildingType) {
    var subtitles = {
        'mall': '购买物资',
        'hospital': '治疗伤病',
        'police': '获取武器',
        'school': '学习技能',
        'bank': '存取资源',
        'restaurant': '获取食物',
        'library': '获取知识',
        'cinema': '休息娱乐',
        'gym': '锻炼身体',
        'cafe': '恢复精神'
    };
    return subtitles[buildingType] || '探索建筑';
};
