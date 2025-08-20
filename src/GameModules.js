/**
 * 游戏模块集成文件 - 统一加载所有重构后的模块
 * 这个文件将所有模块整合在一起，便于在game.js中使用
 */

// === 核心系统模块 ===
// EventBus - 事件总线系统
// (EventBus代码在这里...)

// SceneManager - 场景管理系统  
// (SceneManager代码在这里...)

// === 配置系统模块 ===
// GameConfig - 游戏配置管理
// (GameConfig代码在这里...)

// BuildingConfig - 建筑配置管理
// (BuildingConfig代码在这里...)

// === 世界系统模块 ===
// BaseBuilding - 建筑基类
// (BaseBuilding代码在这里...)

// BuildingFactory - 建筑工厂
// (BuildingFactory代码在这里...)

// === 子地图系统模块 ===
// BaseSubMap - 子地图基类
// (BaseSubMap代码在这里...)

// SubMapManager - 子地图管理器
// (SubMapManager代码在这里...)

// PoliceStationMap - 警察局子地图
// (PoliceStationMap代码在这里...)

// HospitalMap - 医院子地图
// (HospitalMap代码在这里...)

// === 敌人系统模块 ===
// BaseEnemy - 敌人基类
// (BaseEnemy代码在这里...)

// EnemyManager - 敌人管理器
// (EnemyManager代码在这里...)

// === 工具函数模块 ===
// MathUtils - 数学工具函数
// (MathUtils代码在这里...)

// CollisionUtils - 碰撞检测工具
// (CollisionUtils代码在这里...)

/**
 * 模块初始化函数
 */
function initializeGameModules() {
    console.log('[GameModules] 开始初始化所有游戏模块...');
    
    // 验证配置
    if (!gameConfig.validate()) {
        throw new Error('游戏配置验证失败');
    }
    
    console.log('[GameModules] 所有模块初始化完成');
    
    return {
        // 返回所有需要的类和实例
        GameEngine_New: GameEngine_New,
        SceneManager: SceneManager,
        CharacterManager: CharacterManager,
        BuildingFactory: BuildingFactory,
        SubMapManager: SubMapManager,
        EnemyManager: EnemyManager,
        BaseBuilding: BaseBuilding,
        BaseSubMap: BaseSubMap,
        BaseEnemy: BaseEnemy,
        PoliceStationMap: PoliceStationMap,
        HospitalMap: HospitalMap,
        gameConfig: gameConfig,
        buildingConfig: buildingConfig,
        eventBus: eventBus,
        MathUtils: MathUtils,
        CollisionUtils: CollisionUtils
    };
}

/**
 * 快速启动函数 - 用于替换原有的initGame
 */
function startNewGame(canvas, ctx) {
    try {
        console.log('[GameModules] 启动新的模块化游戏引擎...');
        
        // 初始化所有模块
        var modules = initializeGameModules();
        
        // 创建新的游戏引擎
        var gameEngine = new modules.GameEngine_New(canvas, ctx);
        
        // 启动游戏
        gameEngine.start();
        
        console.log('[GameModules] 新游戏引擎启动成功！');
        return gameEngine;
        
    } catch (error) {
        console.error('[GameModules] 新游戏引擎启动失败:', error);
        throw error;
    }
}
