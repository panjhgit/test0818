/**
 * 主菜单场景
 */
import Scene from './Scene.js';
import GameScene from './GameScene.js';
import UIManager from '../ui/UIManager.js';

class MenuScene extends Scene {
    constructor(engine) {
        super(engine);
        this.uiManager = new UIManager(this.canvas, this.ctx);
        this.startButtonBounds = null;
    }
    
    /**
     * 初始化菜单场景
     */
    init() {
        super.init();
        
        // 设置开始按钮边界
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (this.canvas.width - buttonWidth) / 2;
        const buttonY = 250;
        
        this.startButtonBounds = {
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight
        };
        
        // 监听点击事件
        this.setupEventListeners();
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleClick(x, y);
        });
    }
    
    /**
     * 处理点击事件
     */
    handleClick(x, y) {
        if (this.startButtonBounds && 
            x >= this.startButtonBounds.x && 
            x <= this.startButtonBounds.x + this.startButtonBounds.width &&
            y >= this.startButtonBounds.y && 
            y <= this.startButtonBounds.y + this.startButtonBounds.height) {
            
            console.log('[MenuScene] 开始游戏');
            this.startGame();
        }
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.switchScene(GameScene);
    }
    
    /**
     * 更新菜单场景
     */
    update(deltaTime) {
        // 菜单场景无需特殊更新逻辑
    }
    
    /**
     * 渲染菜单场景
     */
    render(ctx) {
        this.uiManager.renderMainMenu();
    }
    
    /**
     * 销毁菜单场景
     */
    destroy() {
        super.destroy();
        // 清理事件监听器
        this.canvas.removeEventListener('click', this.handleClick);
    }
}

export default MenuScene;
