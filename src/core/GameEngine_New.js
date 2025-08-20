/**
 * 新的游戏引擎 - 重构后的精简版本
 * 只负责核心游戏循环、场景管理和系统协调
 */
function GameEngine_New(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.running = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    
    // 核心管理器
    this.sceneManager = new SceneManager(canvas, ctx);
    this.characterManager = new CharacterManager();
    this.buildingFactory = new BuildingFactory();
    this.submapManager = new SubMapManager(canvas, ctx);
    this.enemyManager = new EnemyManager();
    
    // 配置系统
    this.gameConfig = new GameConfig();
    this.buildingConfig = new BuildingConfig();
    
    // 游戏状态
    this.gameData = this.initializeGameData();
    this.world = this.initializeWorld();
    
    this.setupSystems();
    console.log('[GameEngine_New] 新游戏引擎初始化完成');
}

/**
 * 初始化游戏数据
 */
GameEngine_New.prototype.initializeGameData = function() {
    return {
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
};

/**
 * 初始化世界
 */
GameEngine_New.prototype.initializeWorld = function() {
    var mapConfig = this.gameConfig.get('map');
    
    // 设置建筑工厂配置
    this.buildingFactory.setBuildingConfig(this.buildingConfig);
    
    // 生成建筑
    var buildings = this.buildingFactory.createBuildingsForMap(mapConfig);
    
    // 创建玩家
    var playerConfig = this.gameConfig.get('player');
    var player = {
        x: playerConfig.startPosition.x,
        y: playerConfig.startPosition.y,
        health: playerConfig.health,
        maxHealth: playerConfig.health,
        radius: playerConfig.radius,
        speed: playerConfig.speed,
        level: 1,
        isWalking: false,
        walkAnimationFrame: 0,
        walkAnimationSpeed: 200,
        lastAnimationTime: 0,
        direction: 'down'
    };
    
    return {
        buildings: buildings,
        player: player,
        npcs: [],
        followers: [],
        camera: {
            x: 0, y: 0,
            followTarget: player,
            smoothing: this.gameConfig.get('camera.smoothing'),
            zoom: this.gameConfig.get('camera.zoom')
        }
    };
};

/**
 * 设置各个系统
 */
GameEngine_New.prototype.setupSystems = function() {
    // 注册场景
    this.sceneManager.registerScene('menu', MenuScene);
    this.sceneManager.registerScene('game', GameScene);
    this.sceneManager.registerScene('submap', SubMapScene);
    
    // 注册子地图类型
    this.submapManager.registerSubMapType('police_station', PoliceStationMap);
    this.submapManager.registerSubMapType('hospital', HospitalMap);
    // 其他子地图类型可以在这里注册
    
    // 注册敌人类型
    this.enemyManager.registerEnemyType('zombie_normal', BaseEnemy);
    this.enemyManager.registerEnemyType('zombie_elite', BaseEnemy);
    // 其他敌人类型可以在这里注册
    
    // 设置事件监听
    this.setupEventListeners();
    
    // 初始化NPC
    this.initializeNPCs();
};

/**
 * 设置事件监听器
 */
GameEngine_New.prototype.setupEventListeners = function() {
    var self = this;
    
    // 建筑进入事件
    eventBus.on('building_entered', function(data) {
        self.submapManager.enterSubMap(data.building);
        self.sceneManager.switchTo('submap', data);
    });
    
    // 子地图退出事件
    eventBus.on('submap_exited', function(data) {
        self.submapManager.exitSubMap();
        self.sceneManager.switchTo('game', data);
    });
    
    // 资源收集事件
    eventBus.on('resource_collected', function(data) {
        self.handleResourceCollected(data);
    });
    
    // 敌人死亡事件
    eventBus.on('enemy_death', function(data) {
        self.handleEnemyDeath(data);
    });
};

/**
 * 初始化NPC
 */
GameEngine_New.prototype.initializeNPCs = function() {
    var mapConfig = this.gameConfig.get('map');
    
    // 生成19个NPC（2-20号角色）
    for (var i = 2; i <= 20; i++) {
        var position = this.getRandomStreetPosition(mapConfig);
        var npc = {
            id: i,
            characterId: i,
            x: position.x,
            y: position.y,
            isFollowing: false,
            character: this.characterManager.characters[i]
        };
        
        this.world.npcs.push(npc);
    }
    
    console.log('[GameEngine_New] NPC初始化完成，共', this.world.npcs.length, '个');
};

/**
 * 获取随机街道位置
 */
GameEngine_New.prototype.getRandomStreetPosition = function(mapConfig) {
    if (Math.random() < 0.5) {
        // 水平街道
        var blockY = Math.floor(Math.random() * Math.floor(mapConfig.height / mapConfig.blockSize));
        var streetY = blockY * mapConfig.blockSize + mapConfig.streetWidth / 2;
        var x = Math.random() * (mapConfig.width - 200) + 100;
        return { x: x, y: streetY };
    } else {
        // 垂直街道
        var blockX = Math.floor(Math.random() * Math.floor(mapConfig.width / mapConfig.blockSize));
        var streetX = blockX * mapConfig.blockSize + mapConfig.streetWidth / 2;
        var y = Math.random() * (mapConfig.height - 200) + 100;
        return { x: streetX, y: y };
    }
};

/**
 * 启动游戏
 */
GameEngine_New.prototype.start = function() {
    this.running = true;
    this.lastTime = Date.now();
    
    // 切换到菜单场景
    this.sceneManager.switchTo('menu');
    
    this.gameLoop();
    console.log('[GameEngine_New] 游戏启动');
};

/**
 * 游戏主循环
 */
GameEngine_New.prototype.gameLoop = function() {
    var self = this;
    
    if (!this.running) return;
    
    var currentTime = Date.now();
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(this.deltaTime);
    this.render();
    
    requestAnimationFrame(function() {
        self.gameLoop();
    });
};

/**
 * 更新游戏逻辑
 */
GameEngine_New.prototype.update = function(deltaTime) {
    // 更新场景
    this.sceneManager.update(deltaTime);
    
    // 更新子地图（如果在子地图中）
    this.submapManager.update(deltaTime);
    
    // 更新敌人系统
    this.enemyManager.updateAll(deltaTime, this.getTargetsForEnemies());
};

/**
 * 渲染游戏
 */
GameEngine_New.prototype.render = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 渲染当前场景
    this.sceneManager.render();
};

/**
 * 获取敌人的攻击目标
 */
GameEngine_New.prototype.getTargetsForEnemies = function() {
    var targets = [];
    
    // 添加玩家
    if (this.world.player) {
        targets.push(this.world.player);
    }
    
    // 添加团队成员
    for (var i = 0; i < this.world.followers.length; i++) {
        targets.push(this.world.followers[i]);
    }
    
    return targets;
};

/**
 * 处理资源收集
 */
GameEngine_New.prototype.handleResourceCollected = function(data) {
    switch (data.resource.type) {
        case 'food':
            this.gameData.food += data.resource.amount;
            this.gameData.totalFood += data.resource.amount;
            break;
        case 'companion_police':
        case 'companion_nurse':
        case 'companion_chef':
            // 处理伙伴招募
            this.recruitCompanion(data.resource);
            break;
    }
    
    console.log('[GameEngine_New] 资源收集处理:', data.resource.type);
};

/**
 * 处理敌人死亡
 */
GameEngine_New.prototype.handleEnemyDeath = function(data) {
    this.gameData.zombieKills++;
    console.log('[GameEngine_New] 敌人死亡处理，总击杀数:', this.gameData.zombieKills);
};

/**
 * 招募伙伴
 */
GameEngine_New.prototype.recruitCompanion = function(companionData) {
    // 实现伙伴招募逻辑
    console.log('[GameEngine_New] 招募伙伴:', companionData.type);
};

/**
 * 停止游戏
 */
GameEngine_New.prototype.stop = function() {
    this.running = false;
    console.log('[GameEngine_New] 游戏停止');
};

/**
 * 清理资源
 */
GameEngine_New.prototype.cleanup = function() {
    this.stop();
    this.sceneManager.cleanup();
    this.submapManager.cleanup();
    this.enemyManager.clearAll();
    eventBus.clear();
    console.log('[GameEngine_New] 游戏引擎已清理');
};
