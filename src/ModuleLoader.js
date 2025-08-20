/**
 * 模块加载器 - 统一管理所有模块的加载
 * 解决抖音小程序环境下的模块依赖问题
 */
function ModuleLoader() {
    this.modules = {};
    this.loadQueue = [];
    this.loadedModules = new Set();
    
    console.log('[ModuleLoader] 模块加载器初始化');
}

/**
 * 注册模块
 */
ModuleLoader.prototype.register = function(name, moduleFactory) {
    this.modules[name] = moduleFactory;
    console.log('[ModuleLoader] 注册模块:', name);
};

/**
 * 加载模块
 */
ModuleLoader.prototype.load = function(name) {
    if (this.loadedModules.has(name)) {
        return this.modules[name];
    }
    
    if (!this.modules[name]) {
        console.error('[ModuleLoader] 模块未找到:', name);
        return null;
    }
    
    try {
        var module = this.modules[name]();
        this.loadedModules.add(name);
        console.log('[ModuleLoader] 模块加载成功:', name);
        return module;
    } catch (error) {
        console.error('[ModuleLoader] 模块加载失败:', name, error);
        return null;
    }
};

/**
 * 批量加载模块
 */
ModuleLoader.prototype.loadBatch = function(moduleNames) {
    var loadedModules = {};
    
    for (var i = 0; i < moduleNames.length; i++) {
        var name = moduleNames[i];
        loadedModules[name] = this.load(name);
    }
    
    return loadedModules;
};

/**
 * 获取已加载的模块列表
 */
ModuleLoader.prototype.getLoadedModules = function() {
    return Array.from(this.loadedModules);
};

/**
 * 清空所有模块
 */
ModuleLoader.prototype.clear = function() {
    this.modules = {};
    this.loadedModules.clear();
    console.log('[ModuleLoader] 所有模块已清空');
};

// 全局模块加载器实例
var moduleLoader = new ModuleLoader();