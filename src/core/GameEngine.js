/**
 * 游戏核心引擎类
 * 负责游戏主循环、场景管理、状态管理
 */
class GameEngine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.running = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // 游戏状态
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.currentScene = null;
        
        // 性能监控
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsTime = 0;
        
        console.log('[GameEngine] 游戏引擎已初始化');
    }
    
    /**
     * 启动游戏主循环
     */
    start() {
        this.running = true;
        this.lastTime = Date.now();
        this.gameLoop();
        console.log('[GameEngine] 游戏主循环已启动');
    }
    
    /**
     * 停止游戏
     */
    stop() {
        this.running = false;
        console.log('[GameEngine] 游戏已停止');
    }
    
    /**
     * 游戏主循环
     */
    gameLoop() {
        if (!this.running) return;
        
        const currentTime = Date.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 更新FPS计算
        this.updateFPS(currentTime);
        
        // 更新游戏逻辑
        this.update(this.deltaTime);
        
        // 渲染游戏画面
        this.render();
        
        // 继续下一帧
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * 更新游戏逻辑
     */
    update(deltaTime) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(deltaTime);
        }
    }
    
    /**
     * 渲染游戏画面
     */
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染当前场景
        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render(this.ctx);
        }
        
        // 渲染FPS（开发阶段）
        this.renderFPS();
    }
    
    /**
     * 切换场景
     */
    switchScene(scene) {
        if (this.currentScene && this.currentScene.destroy) {
            this.currentScene.destroy();
        }
        
        this.currentScene = scene;
        
        if (this.currentScene && this.currentScene.init) {
            this.currentScene.init();
        }
        
        console.log('[GameEngine] 场景已切换:', scene.constructor.name);
    }
    
    /**
     * 更新FPS计算
     */
    updateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
        }
    }
    
    /**
     * 渲染FPS显示
     */
    renderFPS() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 80, 30);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`FPS: ${this.fps}`, 15, 30);
    }
    
    /**
     * 设置游戏状态
     */
    setGameState(state) {
        console.log(`[GameEngine] 游戏状态变更: ${this.gameState} -> ${state}`);
        this.gameState = state;
    }
    
    /**
     * 获取游戏状态
     */
    getGameState() {
        return this.gameState;
    }
}

export default GameEngine;
