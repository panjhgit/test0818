/**
 * 场景基类
 * 定义场景的基本结构和生命周期
 */
class Scene {
    constructor(engine) {
        this.engine = engine;
        this.canvas = engine.canvas;
        this.ctx = engine.ctx;
        this.initialized = false;
        
        console.log(`[Scene] 场景创建: ${this.constructor.name}`);
    }
    
    /**
     * 场景初始化
     */
    init() {
        this.initialized = true;
        console.log(`[Scene] 场景初始化: ${this.constructor.name}`);
    }
    
    /**
     * 场景更新
     */
    update(deltaTime) {
        // 子类实现
    }
    
    /**
     * 场景渲染
     */
    render(ctx) {
        // 子类实现
    }
    
    /**
     * 场景销毁
     */
    destroy() {
        this.initialized = false;
        console.log(`[Scene] 场景销毁: ${this.constructor.name}`);
    }
    
    /**
     * 处理输入事件
     */
    handleInput(inputData) {
        // 子类实现
    }
    
    /**
     * 切换到其他场景
     */
    switchScene(sceneClass, ...args) {
        const newScene = new sceneClass(this.engine, ...args);
        this.engine.switchScene(newScene);
    }
}

export default Scene;
