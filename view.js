// ========================================
// 视距裁剪系统 (Viewport Culling System)
// ========================================

// 视距裁剪系统配置
var VIEWPORT_CONFIG = {
    GRID_SIZE: 500,           // 网格区块大小
    EXTRA_RENDER: 1,          // 额外渲染区块数
    MAX_VIEW_DISTANCE: 1000,  // 最大视距
    UPDATE_FREQUENCIES: {
        CORE: 1,              // 60fps (每帧更新)
        IMPORTANT: 2,         // 30fps (每2帧更新)
        NORMAL: 4,            // 15fps (每4帧更新)
        LOW: 30,              // 2fps (每30帧更新)
        SLEEP: 0              // 停止更新
    }
};

// 边界框类
function Bounds(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Bounds.prototype.contains = function (x, y) {
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
};

Bounds.prototype.intersects = function (other) {
    return !(this.x > other.x + other.width || this.x + this.width < other.x || this.y > other.y + other.height || this.y + this.height < other.y);
};

// 四叉树节点类
function QuadTreeNode(bounds, maxObjects, maxLevels, level) {
    this.bounds = bounds;           // 边界 {x, y, width, height}
    this.maxObjects = maxObjects || 10;
    this.maxLevels = maxLevels || 5;
    this.level = level || 0;
    this.objects = [];
    this.nodes = [];
    this.isLeaf = true;
}

QuadTreeNode.prototype.insert = function (object) {
    if (!this.bounds.contains(object.x, object.y)) {
        return false;
    }

    if (this.isLeaf && this.objects.length < this.maxObjects) {
        this.objects.push(object);
        return true;
    }

    if (this.isLeaf && this.level < this.maxLevels) {
        this.split();
    }

    for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].insert(object)) {
            return true;
        }
    }

    return false;
};

QuadTreeNode.prototype.split = function () {
    var subWidth = this.bounds.width / 2;
    var subHeight = this.bounds.height / 2;
    var x = this.bounds.x;
    var y = this.bounds.y;

    this.nodes[0] = new QuadTreeNode(new Bounds(x + subWidth, y, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1);

    this.nodes[1] = new QuadTreeNode(new Bounds(x, y, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1);

    this.nodes[2] = new QuadTreeNode(new Bounds(x, y + subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1);

    this.nodes[3] = new QuadTreeNode(new Bounds(x + subWidth, y + subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1);

    this.isLeaf = false;

    // 重新分配现有对象
    for (var i = 0; i < this.objects.length; i++) {
        for (var j = 0; j < this.nodes.length; j++) {
            if (this.nodes[j].insert(this.objects[i])) {
                break;
            }
        }
    }
    this.objects = [];
};

QuadTreeNode.prototype.query = function (range) {
    var result = [];

    if (!this.bounds.intersects(range)) {
        return result;
    }

    for (var i = 0; i < this.objects.length; i++) {
        if (range.contains(this.objects[i].x, this.objects[i].y)) {
            result.push(this.objects[i]);
        }
    }

    if (!this.isLeaf) {
        for (var i = 0; i < this.nodes.length; i++) {
            result = result.concat(this.nodes[i].query(range));
        }
    }

    return result;
};

// 从四叉树中移除对象
QuadTreeNode.prototype.remove = function (object) {
    if (this.isLeaf) {
        // 在叶子节点中查找并移除对象
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i] === object) {
                this.objects.splice(i, 1);
                return true;
            }
        }
        return false;
    } else {
        // 在子节点中查找并移除对象
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].remove(object)) {
                return true;
            }
        }
        return false;
    }
};

// 视距裁剪管理器
function ViewportCullingManager() {
    this.quadTree = null;
    this.quadTreeInitialized = false; // 添加四叉树初始化标志位
    this.visibleEntities = {
        players: [], followers: [], zombies: [], buildings: [], decorations: []
    };
    this.updateCounters = {
        core: 0, important: 0, normal: 0, low: 0
    };
    this.camera = {x: 0, y: 0, width: 800, height: 600};
    this.pauseMainMapUpdates = false; // 添加暂停主地图更新的标志位
}

ViewportCullingManager.prototype.init = function (mapWidth, mapHeight) {
    this.quadTree = new QuadTreeNode(new Bounds(0, 0, mapWidth, mapHeight));
    this.quadTreeInitialized = true;
    this.lastMapWidth = mapWidth;
    this.lastMapHeight = mapHeight;
};

// 添加重置四叉树的方法
ViewportCullingManager.prototype.resetQuadTree = function () {
    this.quadTree = null;
    this.quadTreeInitialized = false;
    this.lastMapWidth = null;
    this.lastMapHeight = null;
    console.log('[ViewportCulling] 四叉树已重置');
};

ViewportCullingManager.prototype.updateCamera = function (x, y, width, height) {
    this.camera.x = x;
    this.camera.y = y;
    this.camera.width = width;
    this.camera.height = height;
};


ViewportCullingManager.prototype.updateVisibleEntities = function (gameEngine) {
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

// 获取稳定的视口范围（使用整数坐标）
ViewportCullingManager.prototype.getStableVisibleRange = function () {
    var extra = VIEWPORT_CONFIG.GRID_SIZE * VIEWPORT_CONFIG.EXTRA_RENDER;

    // 使用整数坐标，避免浮点数精度问题
    var stableX = Math.floor(this.camera.x / 50) * 50; // 50像素网格对齐
    var stableY = Math.floor(this.camera.y / 50) * 50;

    return new Bounds(Math.max(0, stableX - extra), Math.max(0, stableY - extra), this.camera.width + extra * 2, this.camera.height + extra * 2);
};

// 检查是否需要重新查询（高性能判断）
ViewportCullingManager.prototype.shouldUpdateVisibleQuery = function (currentRange, currentTime) {
    // 首次查询
    if (!this.lastQueryTime || !this.lastQueryRange) {
        return true;
    }

    // 时间间隔检查（至少500ms才重新查询）
    if (currentTime - this.lastQueryTime < 500) {
        return false;
    }

    // 视口范围变化检查（只有显著变化才重新查询）
    var rangeChanged = Math.abs(currentRange.x - this.lastQueryRange.x) > 200 || Math.abs(currentRange.y - this.lastQueryRange.y) > 200;

    return rangeChanged;
};

// 执行可见实体查询（重型操作，尽量少调用）
ViewportCullingManager.prototype.performVisibleQuery = function (range, gameEngine) {
    console.log('[HighPerf] 执行视口查询，范围:', range.x, range.y, range.width, range.height);

    var allEntities = this.quadTree.query(range);

    // 调试信息：检查四叉树查询结果
    console.log('[ViewportCulling] 四叉树查询结果:', {
        totalEntities: allEntities.length, entityTypes: allEntities.map(function (e) {
            return e ? e.type : 'null';
        }), firstFewEntities: allEntities.slice(0, 5).map(function (e) {
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
ViewportCullingManager.prototype.updateMovingEntitiesOnly = function (gameEngine) {
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

// 模块导出
module.exports = {
    VIEWPORT_CONFIG: VIEWPORT_CONFIG,
    Bounds: Bounds,
    QuadTreeNode: QuadTreeNode,
    ViewportCullingManager: ViewportCullingManager
};