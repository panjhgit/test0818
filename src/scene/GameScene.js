/**
 * 游戏主场景
 * 管理游戏的主要逻辑和渲染
 */
import Scene from './Scene.js';
import MenuScene from './MenuScene.js';
import SubMapScene from './SubMapScene.js';
import GameManager from '../game/GameManager.js';
import UIManager from '../ui/UIManager.js';
import MapManager from '../map/MapManager.js';
import InputManager from '../core/InputManager.js';
import Player from '../character/Player.js';
import Companion from '../character/Companion.js';
import EventManager from '../core/EventManager.js';

class GameScene extends Scene {
    constructor(engine) {
        super(engine);
        
        // 初始化管理器
        this.gameManager = new GameManager();
        this.uiManager = new UIManager(this.canvas, this.ctx);
        this.mapManager = new MapManager(this.canvas, this.ctx);
        this.inputManager = new InputManager(this.canvas);
        
        // 游戏对象
        this.player = null;
        this.companions = [];
        this.loadingState = null;
        
        console.log('[GameScene] 游戏场景已创建');
    }
    
    /**
     * 初始化游戏场景
     */
    init() {
        super.init();
        
        // 创建玩家
        this.player = new Player({
            x: 200,
            y: 300
        });
        
        // 设置事件监听
        this.setupEventListeners();
        
        console.log('[GameScene] 游戏场景初始化完成');
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 摇杆移动事件
        EventManager.on('joystick_move', (direction) => {
            this.player.handleMovement(direction);
        });
        
        // 画布点击事件
        EventManager.on('canvas_click', (clickData) => {
            this.handleCanvasClick(clickData.x, clickData.y);
        });
        
        // 新一天事件
        EventManager.on('new_day', (day) => {
            this.handleNewDay(day);
        });
        
        // 游戏结束事件
        EventManager.on('game_over', (gameStats) => {
            this.handleGameOver(gameStats);
        });
        
        // 游戏胜利事件
        EventManager.on('game_win', (gameStats) => {
            this.handleGameWin(gameStats);
        });
        
        // 角色死亡事件
        EventManager.on('character_death', (deathData) => {
            this.handleCharacterDeath(deathData);
        });
        
        // 每日食物产出事件
        EventManager.on('daily_food_production', (amount) => {
            this.gameManager.addFood(amount);
        });
        
        // 群体回血事件
        EventManager.on('group_heal', (healData) => {
            this.handleGroupHeal(healData);
        });
    }
    
    /**
     * 处理画布点击
     */
    handleCanvasClick(x, y) {
        // 检查是否点击了建筑物
        const building = this.mapManager.getBuildingAt(x, y);
        if (building) {
            this.exploreBuilding(building);
        }
    }
    
    /**
     * 探索建筑物
     */
    exploreBuilding(building) {
        console.log(`[GameScene] 探索建筑物: ${building.name}`);
        
        // 检查是否已探索且是一次性建筑
        if (building.oneTimeOnly && this.gameManager.isBuildingExplored(building.id)) {
            console.log('[GameScene] 该建筑物只能探索一次');
            return;
        }
        
        // 切换到子地图场景
        this.switchScene(SubMapScene, building, this.gameManager, this.player, this.companions);
    }
    
    /**
     * 处理新一天
     */
    handleNewDay(day) {
        console.log(`[GameScene] 新的一天开始: 第${day}天`);
        
        // 检查玩家升级条件
        if (day === 10 && this.player.level === 1) {
            this.player.levelUp();
        } else if (day === 30 && this.player.level === 2) {
            this.player.levelUp();
        }
        
        // 应用玩家团队增益到所有伙伴
        this.applyTeamBuffs();
    }
    
    /**
     * 应用团队增益
     */
    applyTeamBuffs() {
        const teamBuffs = this.player.getTeamBuffs();
        
        this.companions.forEach(companion => {
            companion.applyTeamBuffs(teamBuffs);
        });
    }
    
    /**
     * 处理游戏结束
     */
    handleGameOver(gameStats) {
        console.log('[GameScene] 游戏结束');
        this.engine.setGameState('gameover');
    }
    
    /**
     * 处理游戏胜利
     */
    handleGameWin(gameStats) {
        console.log('[GameScene] 游戏胜利');
        this.engine.setGameState('victory');
    }
    
    /**
     * 处理角色死亡
     */
    handleCharacterDeath(deathData) {
        const { character, killer } = deathData;
        
        if (character === this.player) {
            // 玩家死亡，游戏结束
            this.gameManager.gameOver('death');
        } else {
            // 伙伴死亡，从团队中移除
            const index = this.companions.indexOf(character);
            if (index > -1) {
                this.companions.splice(index, 1);
                this.gameManager.gameData.teamSize = this.companions.length + 1;
                
                console.log(`[GameScene] 伙伴 ${character.name} 死亡`);
            }
        }
    }
    
    /**
     * 处理群体回血
     */
    handleGroupHeal(healData) {
        const { amount } = healData;
        
        // 给玩家回血
        this.player.heal(amount);
        
        // 给所有伙伴回血
        this.companions.forEach(companion => {
            companion.heal(amount);
        });
        
        console.log(`[GameScene] 群体回血 ${amount}点`);
    }
    
    /**
     * 添加伙伴
     */
    addCompanion(companionData) {
        const companion = new Companion(companionData);
        
        // 应用当前团队增益
        companion.applyTeamBuffs(this.player.getTeamBuffs());
        
        this.companions.push(companion);
        this.gameManager.addTeamMember(companionData);
        
        console.log(`[GameScene] 新伙伴加入: ${companionData.name}`);
    }
    
    /**
     * 更新游戏场景
     */
    update(deltaTime) {
        // 更新游戏管理器
        this.gameManager.updateTime(deltaTime);
        
        // 更新玩家
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // 更新伙伴
        this.companions.forEach(companion => {
            companion.update(deltaTime);
        });
        
        // 处理加载状态
        if (this.loadingState) {
            this.updateLoading(deltaTime);
        }
    }
    
    /**
     * 更新加载状态
     */
    updateLoading(deltaTime) {
        this.loadingState.progress += deltaTime / this.loadingState.duration;
        
        if (this.loadingState.progress >= 1) {
            this.loadingState.progress = 1;
            
            // 加载完成，执行回调
            if (this.loadingState.callback) {
                this.loadingState.callback();
            }
            
            this.loadingState = null;
        }
    }
    
    /**
     * 渲染游戏场景
     */
    render(ctx) {
        const gameState = this.engine.getGameState();
        
        switch (gameState) {
            case 'playing':
                this.renderGame(ctx);
                break;
            case 'gameover':
                this.renderGameOver(ctx);
                break;
            case 'victory':
                this.renderVictory(ctx);
                break;
            default:
                this.renderGame(ctx);
        }
        
        // 渲染加载画面
        if (this.loadingState) {
            this.uiManager.renderLoadingScreen(
                this.loadingState.progress,
                this.loadingState.text
            );
        }
    }
    
    /**
     * 渲染游戏画面
     */
    renderGame(ctx) {
        // 渲染地图
        this.mapManager.renderMainMap();
        
        // 渲染玩家
        if (this.player) {
            this.player.render(ctx);
        }
        
        // 渲染伙伴
        this.companions.forEach(companion => {
            companion.render(ctx);
        });
        
        // 渲染UI
        const gameData = this.gameManager.getGameData();
        this.uiManager.renderStatusBar(gameData);
        
        // 渲染虚拟摇杆
        this.inputManager.renderJoystick(ctx);
        
        // 渲染时间信息
        this.renderTimeInfo(ctx);
    }
    
    /**
     * 渲染时间信息
     */
    renderTimeInfo(ctx) {
        const timeDesc = this.gameManager.getCurrentPhaseDescription();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.canvas.width - 120, 10, 110, 25);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(timeDesc, this.canvas.width - 115, 27);
    }
    
    /**
     * 渲染游戏结束画面
     */
    renderGameOver(ctx) {
        this.renderGame(ctx); // 先渲染游戏画面
        
        const gameStats = this.gameManager.getGameStats();
        this.uiManager.renderGameOver(gameStats);
    }
    
    /**
     * 渲染胜利画面
     */
    renderVictory(ctx) {
        this.renderGame(ctx); // 先渲染游戏画面
        
        const gameStats = this.gameManager.getGameStats();
        this.uiManager.renderVictory(gameStats);
    }
    
    /**
     * 显示加载画面
     */
    showLoading(text, duration, callback) {
        this.loadingState = {
            text: text,
            duration: duration,
            progress: 0,
            callback: callback
        };
    }
    
    /**
     * 获取所有可攻击目标
     */
    getAttackableTargets(position, range) {
        const targets = [];
        
        // 检查玩家
        if (this.player && this.player.isAlive()) {
            const distance = Math.sqrt(
                (this.player.x - position.x) ** 2 + (this.player.y - position.y) ** 2
            );
            if (distance <= range) {
                targets.push(this.player);
            }
        }
        
        // 检查伙伴
        this.companions.forEach(companion => {
            if (companion.isAlive()) {
                const distance = Math.sqrt(
                    (companion.x - position.x) ** 2 + (companion.y - position.y) ** 2
                );
                if (distance <= range) {
                    targets.push(companion);
                }
            }
        });
        
        return targets;
    }
    
    /**
     * 销毁游戏场景
     */
    destroy() {
        super.destroy();
        
        // 清理事件监听器
        EventManager.off('joystick_move');
        EventManager.off('canvas_click');
        EventManager.off('new_day');
        EventManager.off('game_over');
        EventManager.off('game_win');
        EventManager.off('character_death');
        EventManager.off('daily_food_production');
        EventManager.off('group_heal');
    }
}

export default GameScene;
