/**
 * 场景管理器 - 独立的场景管理系统
 * 负责场景切换、生命周期管理和状态维护
 */
function SceneManager(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.currentScene = null;
    this.sceneStack = [];
    this.scenes = {};
    this.transitionState = null;
    
    console.log('[SceneManager] 场景管理器初始化');
}

/**
 * 注册场景类型
 */
SceneManager.prototype.registerScene = function(sceneName, sceneClass) {
    this.scenes[sceneName] = sceneClass;
    console.log('[SceneManager] 注册场景:', sceneName);
};

/**
 * 切换到指定场景
 */
SceneManager.prototype.switchTo = function(sceneName, data) {
    console.log('[SceneManager] 切换场景:', this.currentScene ? this.currentScene.name : 'null', '→', sceneName);
    
    var SceneClass = this.scenes[sceneName];
    if (!SceneClass) {
        console.error('[SceneManager] 场景未找到:', sceneName);
        return false;
    }
    
    // 销毁当前场景
    if (this.currentScene && this.currentScene.destroy) {
        this.currentScene.destroy();
    }
    
    // 创建新场景
    try {
        this.currentScene = new SceneClass(this.canvas, this.ctx, data);
        this.currentScene.name = sceneName;
        
        // 初始化场景
        if (this.currentScene.init) {
            this.currentScene.init();
        }
        
        // 发布场景切换事件
        eventBus.emit('scene_changed', {
            sceneName: sceneName,
            scene: this.currentScene,
            data: data
        });
        
        return true;
    } catch (error) {
        console.error('[SceneManager] 场景创建失败:', sceneName, error);
        return false;
    }
};

/**
 * 推入场景（保存当前场景到栈中）
 */
SceneManager.prototype.pushScene = function(sceneName, data) {
    if (this.currentScene) {
        this.sceneStack.push(this.currentScene);
        console.log('[SceneManager] 场景入栈:', this.currentScene.name);
    }
    
    return this.switchTo(sceneName, data);
};

/**
 * 弹出场景（恢复栈顶场景）
 */
SceneManager.prototype.popScene = function() {
    if (this.sceneStack.length === 0) {
        console.warn('[SceneManager] 场景栈为空，无法弹出');
        return false;
    }
    
    // 销毁当前场景
    if (this.currentScene && this.currentScene.destroy) {
        this.currentScene.destroy();
    }
    
    // 恢复栈顶场景
    this.currentScene = this.sceneStack.pop();
    console.log('[SceneManager] 恢复场景:', this.currentScene.name);
    
    // 重新激活场景
    if (this.currentScene.resume) {
        this.currentScene.resume();
    }
    
    return true;
};

/**
 * 更新当前场景
 */
SceneManager.prototype.update = function(deltaTime) {
    if (this.currentScene && this.currentScene.update) {
        this.currentScene.update(deltaTime);
    }
};

/**
 * 渲染当前场景
 */
SceneManager.prototype.render = function() {
    if (this.currentScene && this.currentScene.render) {
        this.currentScene.render(this.ctx);
    }
};

/**
 * 获取当前场景
 */
SceneManager.prototype.getCurrentScene = function() {
    return this.currentScene;
};

/**
 * 获取当前场景名称
 */
SceneManager.prototype.getCurrentSceneName = function() {
    return this.currentScene ? this.currentScene.name : null;
};

/**
 * 处理输入事件
 */
SceneManager.prototype.handleInput = function(inputType, inputData) {
    if (this.currentScene && this.currentScene.handleInput) {
        this.currentScene.handleInput(inputType, inputData);
    }
};

/**
 * 清理所有场景
 */
SceneManager.prototype.cleanup = function() {
    if (this.currentScene && this.currentScene.destroy) {
        this.currentScene.destroy();
    }
    
    // 清理场景栈
    while (this.sceneStack.length > 0) {
        var scene = this.sceneStack.pop();
        if (scene.destroy) {
            scene.destroy();
        }
    }
    
    this.currentScene = null;
    console.log('[SceneManager] 所有场景已清理');
};
