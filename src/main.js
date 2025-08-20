/**
 * 游戏主入口文件 - 精简版本
 * 整合所有模块，保持功能完整
 */

console.log('=== 末日Q行游戏启动 ===');

// 主游戏引擎 - 整合所有模块
function GameEngine(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.running = false;
    this.gameState = 'menu';
    this.lastTime = 0;
    
    // 地图配置
    this.mapConfig = {
        width: 10000,
        height: 10000,
        blockSize: 450,
        streetWidth: 200,
        buildingSpacing: 0
    };
    
    // 摄像机系统
    this.camera = {
        x: 0,
        y: 0,
        followTarget: null,
        smoothing: 0.1,
        zoom: 0.8
    };
    
    // 初始化子系统
    this.initializeSubSystems();
    this.initializeGameData();
    this.setupInput();
    
    console.log('[GameEngine] 游戏引擎初始化完成');
}

// 初始化子系统
GameEngine.prototype.initializeSubSystems = function() {
    // 角色系统
    this.characterManager = new CharacterManager();
    
    // 建筑系统
    this.buildings = this.initializeBuildings();
    
    // NPC系统
    this.npcs = [];
    this.followers = [];
    this.initializeNPCs();
    
    // 输入系统
    this.joystick = {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        direction: { x: 0, y: 0 }
    };
    
    // 状态变量
    this.nearBuilding = null;
    this.buildingEntryPrompt = null;
    this.currentBuilding = null;
    this.subMapType = null;
    this.zombies = [];
    this.resources = [];
    this.exploredBuildings = [];
};

// 初始化游戏数据
GameEngine.prototype.initializeGameData = function() {
    this.gameData = {
        survivalDays: 1,
        food: 5,
        teamSize: 1,
        maxTeamSize: 1,
        zombieKills: 0,
        totalFood: 5,
        isDay: true,
        timeRemaining: 300000,
        gameStartTime: Date.now()
    };
    
    this.player = { 
        x: this.mapConfig.width / 2, 
        y: this.mapConfig.height / 2, 
        health: 20, 
        maxHealth: 20, 
        level: 1,
        isWalking: false,
        walkAnimationFrame: 0,
        walkAnimationSpeed: 200,
        lastAnimationTime: 0,
        direction: 'down'
    };
    
    this.camera.followTarget = this.player;
};

// 游戏主循环
GameEngine.prototype.start = function() {
    this.running = true;
    this.lastTime = Date.now();
    this.gameLoop();
    console.log('[GameEngine] 游戏主循环启动');
};

GameEngine.prototype.gameLoop = function() {
    var self = this;
    if (!this.running) return;
    
    var currentTime = Date.now();
    var deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame(function() {
        self.gameLoop();
    });
};

GameEngine.prototype.update = function(deltaTime) {
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        this.updatePlayer(deltaTime);
        this.updateTime(deltaTime);
        
        if (this.gameState === 'playing') {
            this.updateCamera(deltaTime);
            this.updateNPCs(deltaTime);
            this.checkNearDoor();
        }
    }
};

// 游戏启动函数
function initGame() {
    try {
        console.log('[Main] 开始初始化游戏...');
        
        var canvas = tt.createCanvas();
        var ctx = canvas.getContext('2d');
        var systemInfo = tt.getSystemInfoSync();
        
        canvas.width = systemInfo.windowWidth;
        canvas.height = systemInfo.windowHeight;
        
        var gameEngine = new GameEngine(canvas, ctx);
        gameEngine.start();
        
        // 暴露调试接口
        var globalObj = typeof global !== 'undefined' ? global : 
                       typeof window !== 'undefined' ? window : 
                       typeof this !== 'undefined' ? this : {};
        
        globalObj.game = gameEngine;
        
        console.log('[Main] 游戏启动成功！');
        return gameEngine;
        
    } catch (error) {
        console.error('[Main] 游戏初始化失败:', error);
        throw error;
    }
}

// 启动游戏
console.log('[Main] 准备启动游戏...');
try {
    initGame();
    console.log('[Main] 游戏启动完成！');
} catch (error) {
    console.error('[Main] 游戏启动失败:', error);
}
