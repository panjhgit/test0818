/**
 * 游戏状态管理器 - 管理游戏状态和数据
 * 兼容抖音小程序环境 (ES5)
 */
function GameStateManager(gameEngine) {
    this.gameEngine = gameEngine;
    this.gameState = 'menu';
    this.running = false;
    this.lastTime = 0;
    
    // 初始化游戏数据
    this.initializeGameData();
}

/**
 * 初始化游戏数据
 */
GameStateManager.prototype.initializeGameData = function() {
    this.gameData = {
        survivalDays: 1,
        food: 5,
        teamSize: 1,
        maxTeamSize: 1,
        zombieKills: 0,
        totalFood: 5,
        isDay: true,
        timeRemaining: 300000, // 5分钟白天
        gameStartTime: Date.now()
    };
    
    this.exploredBuildings = [];
    this.currentBuilding = null;
    this.subMapType = null;
    this.zombies = [];
    this.resources = [];
};

/**
 * 启动游戏
 */
GameStateManager.prototype.startGame = function() {
    console.log('[GameState] 开始游戏');
    this.gameState = 'playing';
    console.log('[GameState] 游戏状态已切换到:', this.gameState);
};

/**
 * 重新开始游戏
 */
GameStateManager.prototype.restartGame = function() {
    this.initializeGameData();
    
    // 重置玩家位置
    var mapConfig = this.gameEngine.mapConfig;
    this.gameEngine.player = { 
        x: mapConfig.width / 2, 
        y: mapConfig.height / 2, 
        health: 20, 
        maxHealth: 20, 
        level: 1,
        isWalking: false,
        walkAnimationFrame: 0,
        walkAnimationSpeed: 200,
        lastAnimationTime: 0,
        direction: 'down'
    };
    
    // 重置建筑状态
    var buildings = this.gameEngine.buildingManager.buildings;
    for (var i = 0; i < buildings.length; i++) {
        buildings[i].explored = false;
    }
    
    // 重置NPC和跟随者
    this.gameEngine.npcManager.followers = [];
    this.gameEngine.npcManager.initializeNPCs();
    
    this.gameState = 'playing';
    console.log('[GameState] 游戏重新开始');
};

/**
 * 游戏结束
 */
GameStateManager.prototype.gameOver = function(cause) {
    this.gameState = 'gameover';
    this.gameData.gameEndTime = Date.now();
    this.gameData.gameEndCause = cause;
    console.log('[GameState] 游戏结束，原因:', cause);
};

/**
 * 游戏胜利
 */
GameStateManager.prototype.gameWin = function() {
    this.gameState = 'victory';
    this.gameData.gameEndTime = Date.now();
    console.log('[GameState] 游戏胜利！');
};

/**
 * 更新游戏时间
 */
GameStateManager.prototype.updateTime = function(deltaTime) {
    this.gameData.timeRemaining -= deltaTime;
    
    if (this.gameData.timeRemaining <= 0) {
        if (this.gameData.isDay) {
            this.gameData.isDay = false;
            this.gameData.timeRemaining = 60000; // 1分钟夜晚
            console.log('[GameState] 夜幕降临');
        } else {
            this.gameData.isDay = true;
            this.gameData.timeRemaining = 300000; // 5分钟白天
            this.gameData.survivalDays++;
            
            // 消耗口粮
            var foodCost = this.gameData.teamSize;
            this.gameData.food -= foodCost;
            
            console.log('[GameState] 第' + this.gameData.survivalDays + '天，消耗口粮' + foodCost + '份');
            
            // 检查口粮是否足够
            if (this.gameData.food < 0) {
                this.gameOver('starvation');
                return;
            }
            
            // 检查是否通关
            if (this.gameData.survivalDays > 100) {
                this.gameWin();
                return;
            }
        }
    }
};

/**
 * 获取游戏状态
 */
GameStateManager.prototype.getGameState = function() {
    return this.gameState;
};

/**
 * 设置游戏状态
 */
GameStateManager.prototype.setGameState = function(state) {
    var oldState = this.gameState;
    this.gameState = state;
    console.log('[GameState] 状态切换:', oldState, '→', state);
};

/**
 * 获取游戏数据
 */
GameStateManager.prototype.getGameData = function() {
    return this.gameData;
};
