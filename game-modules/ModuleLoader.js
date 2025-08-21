/**
 * 模块加载器 - 统一加载所有游戏模块
 * 兼容抖音小程序环境 (ES5)
 */

/**
 * 模块加载器
 */
function ModuleLoader() {
    this.loadedModules = {};
    this.loadOrder = [
        'utils/GameUtils.js',
        'character/BaseCharacter.js',
        'character/CharacterManager.js',
        'zombie/BaseZombie.js',
        'zombie/ThinZombie.js',
        'zombie/FatZombie.js',
        'zombie/ZombieBoss1.js',
        'zombie/ZombieManager.js',
        'resource/ResourceManager.js',
        'collision/CollisionManager.js',
        'camera/CameraManager.js',
        'building/BuildingManager.js',
        'npc/NPCManager.js',
        'rendering/RenderManager.js',
        'gamestate/GameStateManager.js'
    ];
}

/**
 * 加载所有模块
 */
ModuleLoader.prototype.loadAllModules = function(callback) {
    console.log('[ModuleLoader] 开始加载游戏模块...');
    
    var self = this;
    var loadedCount = 0;
    var totalModules = this.loadOrder.length;
    
    // 模拟模块加载（在抖音小程序中，模块会被内联）
    for (var i = 0; i < this.loadOrder.length; i++) {
        var modulePath = this.loadOrder[i];
        this.loadedModules[modulePath] = true;
        loadedCount++;
        
        console.log('[ModuleLoader] 已加载模块:', modulePath, '(' + loadedCount + '/' + totalModules + ')');
    }
    
    console.log('[ModuleLoader] 所有模块加载完成');
    
    if (callback) {
        callback();
    }
};

/**
 * 检查模块是否已加载
 */
ModuleLoader.prototype.isModuleLoaded = function(modulePath) {
    return !!this.loadedModules[modulePath];
};

/**
 * 获取已加载的模块列表
 */
ModuleLoader.prototype.getLoadedModules = function() {
    return Object.keys(this.loadedModules);
};
