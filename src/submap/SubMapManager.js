/**
 * 子地图管理器 - 管理所有子地图的创建、切换和生命周期
 */
function SubMapManager(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.currentSubMap = null;
    this.submapClasses = {};
    this.submapHistory = [];
    
    console.log('[SubMapManager] 子地图管理器初始化');
}

/**
 * 注册子地图类型
 */
SubMapManager.prototype.registerSubMapType = function(typeName, submapClass) {
    this.submapClasses[typeName] = submapClass;
    console.log('[SubMapManager] 注册子地图类型:', typeName);
};

/**
 * 创建并进入子地图
 */
SubMapManager.prototype.enterSubMap = function(building) {
    console.log('[SubMapManager] 进入子地图:', building.submapType);
    
    var SubMapClass = this.submapClasses[building.submapType] || BaseSubMap;
    
    try {
        this.currentSubMap = new SubMapClass({
            type: building.submapType,
            building: building,
            canvas: this.canvas,
            ctx: this.ctx
        });
        
        this.currentSubMap.init();
        
        // 记录历史
        this.submapHistory.push({
            type: building.submapType,
            buildingId: building.id,
            timestamp: Date.now()
        });
        
        // 发布事件
        eventBus.emit('submap_entered', {
            submapType: building.submapType,
            building: building,
            submap: this.currentSubMap
        });
        
        return this.currentSubMap;
        
    } catch (error) {
        console.error('[SubMapManager] 子地图创建失败:', building.submapType, error);
        return null;
    }
};

/**
 * 退出当前子地图
 */
SubMapManager.prototype.exitSubMap = function() {
    if (!this.currentSubMap) {
        console.warn('[SubMapManager] 没有活动的子地图');
        return false;
    }
    
    console.log('[SubMapManager] 退出子地图:', this.currentSubMap.type);
    
    var submapData = {
        type: this.currentSubMap.type,
        building: this.currentSubMap.building,
        status: this.currentSubMap.getStatus()
    };
    
    // 清理当前子地图
    if (this.currentSubMap.cleanup) {
        this.currentSubMap.cleanup();
    }
    
    this.currentSubMap = null;
    
    // 发布事件
    eventBus.emit('submap_exited', submapData);
    
    return true;
};

/**
 * 更新当前子地图
 */
SubMapManager.prototype.update = function(deltaTime) {
    if (this.currentSubMap && this.currentSubMap.update) {
        this.currentSubMap.update(deltaTime);
    }
};

/**
 * 渲染当前子地图
 */
SubMapManager.prototype.render = function() {
    if (this.currentSubMap && this.currentSubMap.render) {
        this.currentSubMap.render();
    }
};

/**
 * 检查退出条件
 */
SubMapManager.prototype.checkExitConditions = function(player, team) {
    if (!this.currentSubMap) return { nearExit: false, shouldExit: false };
    
    return this.currentSubMap.checkExitProximity(player, team);
};

/**
 * 处理资源收集
 */
SubMapManager.prototype.collectResource = function(resourceId) {
    if (!this.currentSubMap) return null;
    
    var resource = this.currentSubMap.collectResource(resourceId);
    if (resource) {
        eventBus.emit('resource_collected', {
            resource: resource,
            submapType: this.currentSubMap.type
        });
    }
    return resource;
};

/**
 * 处理敌人击败
 */
SubMapManager.prototype.defeatEnemy = function(enemyId) {
    if (!this.currentSubMap) return null;
    
    var enemy = this.currentSubMap.defeatEnemy(enemyId);
    if (enemy) {
        eventBus.emit('enemy_defeated', {
            enemy: enemy,
            submapType: this.currentSubMap.type
        });
    }
    return enemy;
};

/**
 * 获取当前子地图
 */
SubMapManager.prototype.getCurrentSubMap = function() {
    return this.currentSubMap;
};

/**
 * 获取子地图历史
 */
SubMapManager.prototype.getHistory = function() {
    return this.submapHistory.slice(); // 返回副本
};

/**
 * 清理所有子地图
 */
SubMapManager.prototype.cleanup = function() {
    if (this.currentSubMap) {
        this.exitSubMap();
    }
    this.submapHistory = [];
    console.log('[SubMapManager] 子地图管理器已清理');
};
