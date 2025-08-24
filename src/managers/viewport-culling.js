/**
 * 视距裁剪管理器
 * 使用四叉树优化渲染性能
 */

function ViewportCullingManager() {
    this.quadTree = null;
    this.quadTreeInitialized = false; // 添加四叉树初始化标志位
    this.visibleEntities = {
        players: [], 
        followers: [], 
        zombies: [], 
        buildings: [], 
        decorations: []
    };
    this.updateCounters = {
        core: 0, 
        important: 0, 
        normal: 0, 
        low: 0
    };
    this.camera = {x: 0, y: 0, width: 800, height: 600};
    this.pauseMainMapUpdates = false; // 添加暂停主地图更新的标志位
    this.lastQueryTime = 0;
    this.lastQueryRange = null;
}

ViewportCullingManager.prototype.init = function(mapWidth, mapHeight) {
    this.quadTree = new QuadTreeNode(new Bounds(0, 0, mapWidth, mapHeight));
    this.quadTreeInitialized = true;
    this.lastMapWidth = mapWidth;
    this.lastMapHeight = mapHeight;
};

// 添加重置四叉树的方法
ViewportCullingManager.prototype.resetQuadTree = function() {
    this.quadTree = null;
    this.quadTreeInitialized = false;
    this.lastMapWidth = null;
    this.lastMapHeight = null;
    console.log('[ViewportCulling] 四叉树已重置');
};

ViewportCullingManager.prototype.updateCamera = function(x, y, width, height) {
    this.camera.x = x;
    this.camera.y = y;
    this.camera.width = width;
    this.camera.height = height;
};

ViewportCullingManager.prototype.updateVisibleEntities = function(gameEngine) {
    // 如果暂停主地图更新，则跳过
    if (this.pauseMainMapUpdates) {
        return;
    }

    // 高性能算法：只在必要时重新计算
    var currentTime = Date.now();

    // 计算稳定的视口范围（使用整数坐标避免浮点数问题）
    var stableRange = this.getStableVisibleRange();

    // 检查是否需要重新查询（避免频繁查询）
    if (this.shouldUpdateVisibleQuery(stableRange, currentTime)) {
        this.performVisibleQuery(stableRange, gameEngine);
        this.lastQueryTime = currentTime;
        this.lastQueryRange = stableRange;

        // 添加调试信息
        console.log('[ViewportCulling] 可见实体更新 - 建筑物:', this.visibleEntities.buildings.length);
    }

    // 只更新移动实体的位置（静态实体永远不变）
    this.updateMovingEntitiesOnly(gameEngine);

    // 轻量级计数器更新
    this.updateCounters.core++;
    if (this.updateCounters.core % 10 === 0) this.updateCounters.important++;
    if (this.updateCounters.core % 30 === 0) this.updateCounters.normal++;
    if (this.updateCounters.core % 60 === 0) this.updateCounters.low++;
};

ViewportCullingManager.prototype.calculateViewBounds = function(camera) {
    var extraRender = VIEWPORT_CONFIG.EXTRA_RENDER;
    var gridSize = VIEWPORT_CONFIG.GRID_SIZE;
    
    var left = camera.x - extraRender * gridSize;
    var top = camera.y - extraRender * gridSize;
    var right = camera.x + camera.width + extraRender * gridSize;
    var bottom = camera.y + camera.height + extraRender * gridSize;
    
    return new Bounds(left, top, right - left, bottom - top);
};

ViewportCullingManager.prototype.insert = function(entity) {
    if (!this.quadTree || !this.quadTreeInitialized) {
        return false;
    }
    
    try {
        if (entity && typeof entity.x === 'number' && typeof entity.y === 'number') {
            this.quadTree.insert(entity);
            entity.quadTreeInserted = true;
            entity.lastQuadTreeX = entity.x;
            entity.lastQuadTreeY = entity.y;
            return true;
        }
    } catch (error) {
        console.error('[ViewportCulling] 插入实体到四叉树失败:', error);
    }
    
    return false;
};

ViewportCullingManager.prototype.remove = function(entity) {
    if (!this.quadTree || !this.quadTreeInitialized) {
        return false;
    }
    
    try {
        // 注意：四叉树不支持直接删除，这里只是标记
        if (entity) {
            entity.quadTreeInserted = false;
            return true;
        }
    } catch (error) {
        console.error('[ViewportCulling] 从四叉树移除实体失败:', error);
    }
    
    return false;
};

ViewportCullingManager.prototype.clear = function() {
    if (this.quadTree) {
        this.quadTree.clear();
    }
    this.quadTreeInitialized = false;
};

ViewportCullingManager.prototype.rebuild = function(mapWidth, mapHeight) {
    this.clear();
    this.init(mapWidth, mapHeight);
};

ViewportCullingManager.prototype.getStats = function() {
    if (!this.quadTree) {
        return { initialized: false, nodeCount: 0, objectCount: 0 };
    }
    
    var stats = {
        initialized: this.quadTreeInitialized,
        nodeCount: this.countNodes(this.quadTree),
        objectCount: this.countObjects(this.quadTree)
    };
    
    return stats;
};

ViewportCullingManager.prototype.countNodes = function(node) {
    if (!node) return 0;
    
    var count = 1; // 当前节点
    if (!node.isLeaf) {
        for (var i = 0; i < node.nodes.length; i++) {
            count += this.countNodes(node.nodes[i]);
        }
    }
    
    return count;
};

ViewportCullingManager.prototype.countObjects = function(node) {
    if (!node) return 0;
    
    var count = node.objects.length;
    if (!node.isLeaf) {
        for (var i = 0; i < node.nodes.length; i++) {
            count += this.countObjects(node.nodes[i]);
        }
    }
    
    return count;
};

// ========================================
// 视距裁剪辅助方法
// ========================================

// 获取稳定的视口范围（使用整数坐标）
ViewportCullingManager.prototype.getStableVisibleRange = function() {
    var extra = VIEWPORT_CONFIG.GRID_SIZE * VIEWPORT_CONFIG.EXTRA_RENDER;

    // 使用整数坐标，避免浮点数精度问题
    var stableX = Math.floor(this.camera.x / 50) * 50; // 50像素网格对齐
    var stableY = Math.floor(this.camera.y / 50) * 50;

    return new Bounds(
        Math.max(0, stableX - extra), 
        Math.max(0, stableY - extra), 
        this.camera.width + extra * 2, 
        this.camera.height + extra * 2
    );
};

// 检查是否需要重新查询（高性能判断）
ViewportCullingManager.prototype.shouldUpdateVisibleQuery = function(currentRange, currentTime) {
    // 首次查询
    if (!this.lastQueryTime || !this.lastQueryRange) {
        return true;
    }

    // 时间间隔检查（至少500ms才重新查询）
    if (currentTime - this.lastQueryTime < 500) {
        return false;
    }

    // 视口范围变化检查（只有显著变化才重新查询）
    var rangeChanged = Math.abs(currentRange.x - this.lastQueryRange.x) > 200 || 
                      Math.abs(currentRange.y - this.lastQueryRange.y) > 200;

    return rangeChanged;
};

// 执行可见实体查询（重型操作，尽量少调用）
ViewportCullingManager.prototype.performVisibleQuery = function(range, gameEngine) {
    console.log('[HighPerf] 执行视口查询，范围:', range.x, range.y, range.width, range.height);

    var allEntities = this.quadTree.query(range);

    // 调试信息：检查四叉树查询结果
    console.log('[ViewportCulling] 四叉树查询结果:', {
        totalEntities: allEntities.length,
        entityTypes: allEntities.map(function(e) {
            return e ? e.type : 'null';
        }),
        firstFewEntities: allEntities.slice(0, 5).map(function(e) {
            return e ? {type: e.type, x: e.x, y: e.y} : 'null';
        })
    });

    // 清空并重新分类（只在查询时做一次）
    for (var key in this.visibleEntities) {
        this.visibleEntities[key] = [];
    }

    for (var i = 0; i < allEntities.length; i++) {
        var entity = allEntities[i];

        // 快速类型分类（避免复杂计算）
        if (entity.type === 'player') {
            this.visibleEntities.players.push(entity);
            console.log('[ViewportCulling] 分类玩家:', entity.id || 'unknown');
        } else if (entity.type === 'building') {
            this.visibleEntities.buildings.push(entity);
        } else if (entity.type === 'follower' || (entity.isFollowing && entity.type === 'npc')) {
            this.visibleEntities.followers.push(entity);
            console.log('[ViewportCulling] 分类跟随者:', entity.id || 'unknown', 'type:', entity.type, 'isFollowing:', entity.isFollowing);
        } else if (entity.type === 'thin' || entity.type === 'fat' || entity.type === 'boss1') {
            this.visibleEntities.zombies.push(entity);
        } else if (entity.type === 'npc') {
            this.visibleEntities.decorations.push(entity);
        } else {
            this.visibleEntities.decorations.push(entity);
            console.log('[ViewportCulling] 分类到装饰物:', entity.id || 'unknown', 'type:', entity.type);
        }
    }

    // 调试信息：检查分类结果
    console.log('[ViewportCulling] 实体分类结果:', {
        players: this.visibleEntities.players.length,
        buildings: this.visibleEntities.buildings.length,
        followers: this.visibleEntities.followers.length,
        zombies: this.visibleEntities.zombies.length,
        decorations: this.visibleEntities.decorations.length
    });
};

// 只更新移动实体（轻量级操作，每帧可调用）
ViewportCullingManager.prototype.updateMovingEntitiesOnly = function(gameEngine) {
    // 确保玩家始终在可见列表中
    if (this.visibleEntities.players.length === 0 && gameEngine.player) {
        this.visibleEntities.players.push(gameEngine.player);
    }

    // 快速更新玩家位置（如果在可见列表中）
    for (var i = 0; i < this.visibleEntities.players.length; i++) {
        var player = this.visibleEntities.players[i];
        if (player === gameEngine.player) {
            // 玩家位置已经是最新的，无需更新
            break;
        }
    }

    // 快速更新跟随者位置（如果在可见列表中）
    for (var i = 0; i < this.visibleEntities.followers.length; i++) {
        var follower = this.visibleEntities.followers[i];
        // 跟随者位置由游戏逻辑更新，这里只需要确认可见性
        var distance = Math.sqrt(Math.pow(follower.x - gameEngine.player.x, 2) + Math.pow(follower.y - gameEngine.player.y, 2));

        // 如果距离过远，标记为不可见（但不从列表中移除，避免数组操作）
        follower.tooFarToRender = distance > VIEWPORT_CONFIG.MAX_VIEW_DISTANCE;
    }
};