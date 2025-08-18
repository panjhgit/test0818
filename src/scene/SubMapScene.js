/**
 * 子地图场景
 * 处理建筑物内部的探索和战斗
 */
import Scene from './Scene.js';
import GameScene from './GameScene.js';
import ZombieManager from '../zombie/ZombieManager.js';
import UIManager from '../ui/UIManager.js';
import MapManager from '../map/MapManager.js';
import EventManager from '../core/EventManager.js';

class SubMapScene extends Scene {
    constructor(engine, building, gameManager, player, companions) {
        super(engine);
        
        this.building = building;
        this.gameManager = gameManager;
        this.player = player;
        this.companions = [...companions];
        
        // 管理器
        this.zombieManager = new ZombieManager();
        this.uiManager = new UIManager(this.canvas, this.ctx);
        this.mapManager = new MapManager(this.canvas, this.ctx);
        
        // 子地图状态
        this.resources = [];
        this.isExploring = false;
        this.explorationComplete = false;
        this.exitAvailable = false;
        
        console.log(`[SubMapScene] 进入子地图: ${building.name}`);
    }
    
    /**
     * 初始化子地图场景
     */
    init() {
        super.init();
        
        // 设置地图类型
        this.mapManager.switchToSubMap(this.building.type);
        this.zombieManager.setCurrentMapType(this.building.type);
        
        // 生成僵尸群
        this.generateZombies();
        
        // 生成资源
        this.generateResources();
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 设置角色位置
        this.setupCharacterPositions();
        
        // 标记开始探索
        this.isExploring = true;
        
        console.log('[SubMapScene] 子地图场景初始化完成');
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 僵尸检测请求
        EventManager.on('zombie_detect_request', (data) => {
            this.zombieManager.handleZombieDetection(data);
        });
        
        // 获取可攻击目标请求
        EventManager.on('get_attackable_targets', (data) => {
            const targets = this.getAttackableTargets(data.position, data.range);
            if (data.callback) {
                data.callback(targets);
            }
        });
        
        // 僵尸击杀事件
        EventManager.on('zombie_killed', (data) => {
            this.handleZombieKilled(data);
        });
        
        // 僵尸掉落事件
        EventManager.on('zombie_drop', (data) => {
            this.handleZombieDrop(data);
        });
        
        // 画布点击事件
        EventManager.on('canvas_click', (data) => {
            this.handleCanvasClick(data.x, data.y);
        });
        
        // 摇杆移动事件
        EventManager.on('joystick_move', (direction) => {
            this.player.handleMovement(direction);
            this.moveCompanions(direction);
        });
    }
    
    /**
     * 生成僵尸群
     */
    generateZombies() {
        const mapBounds = {
            left: 50,
            right: 350,
            top: 100,
            bottom: 300
        };
        
        this.zombieManager.generateZombieGroup(mapBounds);
        
        // 设置昼夜状态
        this.zombieManager.setDayNight(this.gameManager.getGameData().isDay);
    }
    
    /**
     * 生成资源
     */
    generateResources() {
        const resourceChance = this.getResourceChance();
        
        if (Math.random() < resourceChance) {
            const resourceType = this.getResourceType();
            const resource = this.createResource(resourceType);
            
            if (resource) {
                this.resources.push(resource);
                console.log(`[SubMapScene] 生成资源: ${resourceType}`);
            }
        }
    }
    
    /**
     * 获取资源生成概率
     */
    getResourceChance() {
        switch (this.building.type) {
            case 'police_station':
            case 'hospital':
            case 'restaurant':
                return 0.8; // 80%概率生成伙伴
            case 'shop':
                return 0.6; // 60%概率生成武器
            case 'school':
            case 'house':
            case 'villa':
                return 0.7; // 70%概率生成食物
            default:
                return 0.3; // 30%基础概率
        }
    }
    
    /**
     * 获取资源类型
     */
    getResourceType() {
        switch (this.building.type) {
            case 'police_station':
                return 'companion_police';
            case 'hospital':
                return 'companion_nurse';
            case 'restaurant':
                return 'companion_chef';
            case 'shop':
                return Math.random() < 0.5 ? 'weapon_knife' : 'weapon_bat';
            case 'school':
            case 'house':
            case 'villa':
                return 'food';
            default:
                return 'food';
        }
    }
    
    /**
     * 创建资源
     */
    createResource(type) {
        const centerX = 200;
        const centerY = 200;
        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 60;
        
        const resource = {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            x: centerX + offsetX,
            y: centerY + offsetY,
            collected: false
        };
        
        // 设置资源特定属性
        switch (type) {
            case 'companion_police':
                resource.companionData = {
                    name: '警察',
                    companionType: 'police',
                    x: resource.x,
                    y: resource.y
                };
                break;
            case 'companion_nurse':
                resource.companionData = {
                    name: '护士',
                    companionType: 'nurse',
                    x: resource.x,
                    y: resource.y
                };
                break;
            case 'companion_chef':
                resource.companionData = {
                    name: '厨师',
                    companionType: 'chef',
                    x: resource.x,
                    y: resource.y
                };
                break;
            case 'food':
                resource.amount = this.getFoodAmount();
                break;
            case 'weapon_knife':
            case 'weapon_bat':
                resource.weaponData = {
                    name: type === 'weapon_knife' ? '砍刀' : '棒球棒',
                    damage: 10,
                    type: 'melee'
                };
                break;
        }
        
        return resource;
    }
    
    /**
     * 获取食物数量
     */
    getFoodAmount() {
        switch (this.building.type) {
            case 'school':
                return 3 + Math.floor(Math.random() * 3); // 3-5份
            case 'house':
                return 2 + Math.floor(Math.random() * 2); // 2-3份
            case 'villa':
                return 4 + Math.floor(Math.random() * 3); // 4-6份
            default:
                return 2 + Math.floor(Math.random() * 3); // 2-4份
        }
    }
    
    /**
     * 设置角色初始位置
     */
    setupCharacterPositions() {
        // 玩家位置（地图入口）
        this.player.setPosition(200, 280);
        
        // 伙伴位置（玩家周围）
        this.companions.forEach((companion, index) => {
            const angle = (index * 2 * Math.PI) / this.companions.length;
            const distance = 30;
            const x = this.player.x + Math.cos(angle) * distance;
            const y = this.player.y + Math.sin(angle) * distance;
            
            companion.setPosition(x, y);
        });
    }
    
    /**
     * 移动伙伴
     */
    moveCompanions(direction) {
        this.companions.forEach((companion, index) => {
            // 伙伴跟随玩家移动，但有轻微延迟和偏移
            setTimeout(() => {
                const offset = (index + 1) * 0.8; // 轻微偏移
                companion.handleMovement({
                    x: direction.x * offset,
                    y: direction.y * offset
                });
            }, index * 50); // 延迟跟随
        });
    }
    
    /**
     * 处理画布点击
     */
    handleCanvasClick(x, y) {
        // 检查返回按钮
        if (this.isBackButtonClicked(x, y)) {
            this.exitSubMap();
            return;
        }
        
        // 检查资源点击
        this.checkResourceClick(x, y);
    }
    
    /**
     * 检查返回按钮点击
     */
    isBackButtonClicked(x, y) {
        const buttonX = 10;
        const buttonY = this.canvas.height - 40;
        const buttonWidth = 80;
        const buttonHeight = 30;
        
        return x >= buttonX && x <= buttonX + buttonWidth &&
               y >= buttonY && y <= buttonY + buttonHeight;
    }
    
    /**
     * 检查资源点击
     */
    checkResourceClick(x, y) {
        this.resources.forEach(resource => {
            if (!resource.collected) {
                const distance = Math.sqrt((x - resource.x) ** 2 + (y - resource.y) ** 2);
                if (distance <= 30) {
                    this.collectResource(resource);
                }
            }
        });
    }
    
    /**
     * 收集资源
     */
    collectResource(resource) {
        if (resource.collected) return;
        
        resource.collected = true;
        
        switch (resource.type) {
            case 'companion_police':
            case 'companion_nurse':
            case 'companion_chef':
                this.addCompanion(resource.companionData);
                break;
            case 'food':
                this.gameManager.addFood(resource.amount);
                break;
            case 'weapon_knife':
            case 'weapon_bat':
                // 武器暂时只是增加攻击力
                this.player.attack += resource.weaponData.damage;
                console.log(`[SubMapScene] 获得武器: ${resource.weaponData.name}`);
                break;
        }
        
        console.log(`[SubMapScene] 收集资源: ${resource.type}`);
    }
    
    /**
     * 添加伙伴
     */
    addCompanion(companionData) {
        // 检查团队人数限制
        if (this.companions.length >= 7) { // 玩家+7个伙伴=8人上限
            console.log('[SubMapScene] 团队人数已满');
            return;
        }
        
        // 添加到伙伴列表
        const companion = new (require('../character/Companion.js').default)(companionData);
        this.companions.push(companion);
        
        // 应用团队增益
        companion.applyTeamBuffs(this.player.getTeamBuffs());
        
        console.log(`[SubMapScene] 新伙伴加入: ${companionData.name}`);
    }
    
    /**
     * 处理僵尸击杀
     */
    handleZombieKilled(data) {
        this.gameManager.addZombieKill();
        
        // 给玩家经验
        this.player.gainExperience(10);
        
        // 检查是否所有僵尸都被清除
        if (this.zombieManager.getAllZombies().length === 0) {
            this.explorationComplete = true;
            this.exitAvailable = true;
            console.log('[SubMapScene] 探索完成，可以离开');
        }
    }
    
    /**
     * 处理僵尸掉落
     */
    handleZombieDrop(data) {
        const { type, position, amount } = data;
        
        // 创建掉落物资源
        const dropResource = {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            x: position.x,
            y: position.y,
            amount: amount,
            collected: false
        };
        
        this.resources.push(dropResource);
    }
    
    /**
     * 获取可攻击目标
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
     * 退出子地图
     */
    exitSubMap() {
        // 标记建筑为已探索
        this.gameManager.markBuildingExplored(this.building.id);
        
        // 返回主地图
        console.log('[SubMapScene] 退出子地图');
        this.switchToGameScene();
    }
    
    /**
     * 切换回游戏场景
     */
    switchToGameScene() {
        // 创建新的游戏场景并传递更新后的数据
        const gameScene = new GameScene(this.engine);
        gameScene.gameManager = this.gameManager;
        gameScene.player = this.player;
        gameScene.companions = this.companions;
        
        this.engine.switchScene(gameScene);
    }
    
    /**
     * 更新子地图场景
     */
    update(deltaTime) {
        // 更新玩家
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // 更新伙伴
        this.companions.forEach(companion => {
            companion.update(deltaTime);
        });
        
        // 更新僵尸
        this.zombieManager.update(deltaTime);
        
        // 更新游戏时间
        this.gameManager.updateTime(deltaTime);
    }
    
    /**
     * 渲染子地图场景
     */
    render(ctx) {
        // 渲染地图
        this.mapManager.renderSubMap(
            this.building.type,
            this.resources.filter(r => !r.collected),
            this.zombieManager.getAllZombies()
        );
        
        // 渲染玩家
        if (this.player) {
            this.player.render(ctx);
        }
        
        // 渲染伙伴
        this.companions.forEach(companion => {
            companion.render(ctx);
        });
        
        // 渲染僵尸
        this.zombieManager.render(ctx);
        
        // 渲染UI
        const gameData = this.gameManager.getGameData();
        this.uiManager.renderStatusBar(gameData);
        
        // 渲染探索提示
        if (this.explorationComplete && this.exitAvailable) {
            this.renderExplorationComplete(ctx);
        }
    }
    
    /**
     * 渲染探索完成提示
     */
    renderExplorationComplete(ctx) {
        ctx.fillStyle = 'rgba(0, 150, 0, 0.8)';
        ctx.fillRect(this.canvas.width / 2 - 80, 120, 160, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('探索完成！', this.canvas.width / 2, 145);
        ctx.textAlign = 'left';
    }
    
    /**
     * 销毁子地图场景
     */
    destroy() {
        super.destroy();
        
        // 清理事件监听器
        EventManager.off('zombie_detect_request');
        EventManager.off('get_attackable_targets');
        EventManager.off('zombie_killed');
        EventManager.off('zombie_drop');
        EventManager.off('canvas_click');
        EventManager.off('joystick_move');
        
        // 清理僵尸
        this.zombieManager.clearAllZombies();
    }
}

export default SubMapScene;
