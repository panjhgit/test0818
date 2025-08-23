/**
 * 末日Q行 - 抖音小程序游戏
 * 一个生存至100天的挑战游戏
 * 使用ES5语法，完全兼容抖音小程序环境
 */

// 引用人物系统模块
var characterModule;
var zombieModule;

// 引用视距裁剪系统模块
var viewModule;

// 引用地图系统模块
var mapModule;

// 尝试加载模块
try {
    console.log('[Game] 开始加载模块...');
    characterModule = require('./js/character.js');
    console.log('[Game] 人物模块加载成功:', characterModule);
    
    zombieModule = require('./js/zombie.js');
    console.log('[Game] 僵尸模块加载成功:', zombieModule);
    
    viewModule = require('./js/view.js');
    console.log('[Game] 视距模块加载成功:', viewModule);
    
    mapModule = require('./js/map.js');
    console.log('[Game] 地图模块加载成功:', mapModule);
} catch (error) {
    console.error('[Game] 模块加载失败:', error);
    
    // 创建默认模块避免崩溃
    characterModule = {
        BaseCharacter: function() { console.error('人物模块加载失败'); },
        CharacterManager: function() { 
            console.error('人物管理器加载失败');
            return {
                characters: {},
                getCurrentCharacter: function() { return null; },
                renderCurrentCharacter: function() {}
            };
        }
    };
    
    viewModule = {
        VIEWPORT_CONFIG: {
            GRID_SIZE: 500,
            EXTRA_RENDER: 1,
            MAX_VIEW_DISTANCE: 1000,
            UPDATE_FREQUENCIES: {
                CORE: 1, IMPORTANT: 2, NORMAL: 4, LOW: 30, SLEEP: 0
            }
        },
        Bounds: function(x, y, width, height) { 
            console.error('视距模块加载失败');
            return {x: x, y: y, width: width, height: height};
        },
        QuadTreeNode: function() { 
            console.error('四叉树模块加载失败');
            return {};
        },
        ViewportCullingManager: function() { 
            console.error('视距裁剪管理器加载失败');
            return {
                quadTree: null,
                visibleEntities: {players: [], followers: [], zombies: [], buildings: [], decorations: []},
                update: function() {},
                init: function() {}
            };
        }
    };
    
    mapModule = {
        getBuildingTypes: function() { 
            console.error('地图模块加载失败');
            return [];
        },
        calculateBuildingPosition: function() { 
            console.error('建筑位置计算模块加载失败');
            return null;
        },
        initializeBuildings: function() { 
            console.error('建筑初始化模块加载失败');
            return [];
        },
        exploreBuilding: function() { 
            console.error('建筑探索模块加载失败');
        },
        exitBuilding: function() { 
            console.error('建筑退出模块加载失败');
        }
    };
    
    zombieModule = {
        ZombieManager: function() { 
            console.error('僵尸管理器加载失败');
            return {
                zombies: [],
                update: function() {},
                render: function() {},
                createZombie: function() { return null; }
            };
        },
        GAME_CONFIG: {
            PLAYER: { BASE_HEALTH: 50, BASE_ATTACK: 15, ATTACK_RANGE: 35, ATTACK_COOLDOWN: 800, MOVE_SPEED: 3, CHARACTER_RADIUS: 18 },
            TEAM: { MAX_SIZE: 20, FOLLOW_DISTANCE: 35, COLLISION_THRESHOLD: 900 },
            TIME: { DAY_DURATION: 30000, NIGHT_DURATION: 30000, FOOD_COST_PER_DAY: 1 },
            BUILDING: { INTERACTION_DISTANCE: 60, TRIGGER_DISTANCE: 50, EXIT_COOLDOWN: 2000 },
            ZOMBIE_SPAWN: { BASE_COUNT: 10, PER_DAY_INCREASE: 3, MAX_ZOMBIES: 50, SPAWN_RADIUS: 2000, MIN_DISTANCE: 300, MAX_ATTEMPTS_MULTIPLIER: 10 }
        }
    };
}





// ========================================
// 游戏引擎 (Game Engine)
// ========================================

/**
 * 游戏引擎构造函数 - 兼容抖音小程序环境
 */
function GameEngine(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.running = false;
    this.gameState = 'menu'; // menu, playing, submap, gameover, victory
    this.lastTime = 0;

    // 游戏结束标志位，防止在游戏结束后继续更新游戏对象
    this.isGameEnded = false;

    // 初始化管理器
    this.characterManager = new characterModule.CharacterManager();
    this.zombieManager = new zombieModule.ZombieManager();

    // 设置僵尸管理器的游戏引擎引用
    this.zombieManager.gameEngine = this;

    // 确保视距裁剪系统正确初始化
    try {
        this.viewportCulling = new viewModule.ViewportCullingManager();
        console.log('[GameEngine] 视距裁剪管理器创建成功');
    } catch (error) {
        console.error('[GameEngine] 视距裁剪管理器创建失败:', error);
        this.viewportCulling = null;
    }

    // 绘制优化设置
    this.ctx.imageSmoothingEnabled = false; // 关闭图像平滑，保持像素风格
    this.ctx.imageSmoothingQuality = 'low'; // 设置图像平滑质量

    // NPC系统
    this.npcs = [];
    this.followers = [];

        // 验证followers数组的初始状态
    this.validateFollowersArray();

    // 初始化跟随者对象池
    this.initializeFollowerPool();

    // 初始化资源对象池
    this.initializeResourcePool();

    // 游戏数据
    this.gameData = {
        survivalDays: 1, food: 20, // 开局设置20个食物
        teamSize: 1, maxTeamSize: 1, zombieKills: 0, totalFood: 20, // 总食物也设置为20
        isDay: true, timeRemaining: zombieModule.GAME_CONFIG.TIME.DAY_DURATION, gameStartTime: Date.now()
    };

    // 地图配置
    this.mapConfig = {
        width: 10000, height: 10000, blockSize: 750, streetWidth: 350, buildingSpacing: 0
    };

    // 摄像机系统
    this.camera = {
        x: 0, y: 0, followTarget: null, smoothing: 0.1, zoom: 0.8
    };

    // 游戏对象
    this.buildings = mapModule.initializeBuildings(this.mapConfig);

    // 调试信息：显示建筑数量
    console.log('[Map] 地图初始化完成，建筑数量:', this.buildings.length);
    console.log('[Map] 地图配置:', {
        width: this.mapConfig.width,
        height: this.mapConfig.height,
        blockSize: this.mapConfig.blockSize,
        streetWidth: this.mapConfig.streetWidth,
        buildingSize: this.mapConfig.blockSize - this.mapConfig.streetWidth,
        estimatedBlocks: Math.floor(this.mapConfig.width / this.mapConfig.blockSize),
        streetRatio: (this.mapConfig.streetWidth / this.mapConfig.blockSize * 100).toFixed(1) + '%'
    });

    // 调试信息：显示碰撞检测系统状态
    console.log('[Collision] 碰撞检测系统已启用，防止穿墙功能已激活');
    console.log('[Collision] 玩家碰撞半径:', zombieModule.GAME_CONFIG.PLAYER.CHARACTER_RADIUS);
    console.log('[Collision] 僵尸碰撞半径: 20');
    console.log('[Collision] 跟随者碰撞半径: 15');

    // 调试信息：显示移动系统状态
    console.log('[Movement] 匀速移动系统已启用');
    console.log('[Movement] 玩家移动速度:', zombieModule.GAME_CONFIG.PLAYER.MOVE_SPEED, '像素/帧');
    console.log('[Movement] 僵尸移动速度: 基于生存天数的动态调整');
    console.log('[Movement] 跟随者移动速度: 1.0-2.0倍玩家速度');
    console.log('[Movement] 方向向量标准化: 确保对角线移动速度一致');

    // 调试信息：显示僵尸速度系统状态
    console.log('[ZombieSpeed] 动态速度系统已启用');
    console.log('[ZombieSpeed] 1-10天: 僵尸速度 = 基础速度 × 1.2 (至少比玩家快20%)');
    console.log('[ZombieSpeed] 10-20天: 僵尸速度 = 基础速度 × 1.4');
    console.log('[ZombieSpeed] 20-50天: 僵尸速度 = 基础速度 × 1.6');
    console.log('[ZombieSpeed] 50-70天: 僵尸速度 = 基础速度 × 1.8');
    console.log('[ZombieSpeed] 70-100天: 僵尸速度 = 基础速度 × 2.0');
    console.log('[ZombieSpeed] 僵尸基础速度: 瘦僵尸5.0, 胖僵尸4.5, Boss僵尸6.0');

    // 调试信息：显示僵尸AI状态机系统状态
    console.log('[ZombieAI] 状态机系统已启用');
    console.log('[ZombieAI] 三种状态: 游荡(Wandering) → 追击(Chasing) → 攻击(Attacking)');
    console.log('[ZombieAI] 检测范围: 瘦僵尸600像素, 胖僵尸700像素, Boss僵尸1000像素');
    console.log('[ZombieAI] 攻击范围: 25像素, 攻击冷却: 瘦僵尸1200ms, Boss僵尸1000ms');
    console.log('[ZombieAI] A*寻路算法: 50像素网格, 8方向寻路, 最大100次迭代');
    console.log('[ZombieAI] 游荡系统: 80-200像素范围, 2-4秒间隔, 0.6倍移动速度');
    console.log('[ZombieAI] 追击系统: 追击距离比检测范围多20%, 最大追击距离1200像素');

    // 调试信息：显示跟随系统状态
    console.log('[Follow] 稳定版Flocking算法跟随系统已启用');
    console.log('[Follow] 建筑碰撞: 双重碰撞检测，绝对防止穿墙');
    console.log('[Follow] 分离规则: 20像素分离半径，0.2分离强度，超温和推开避免抽搐');
    console.log('[Follow] 聚合规则: 30像素理想距离，0.6聚合强度，100像素最大距离限制');
    console.log('[Follow] 对齐规则: 0.2对齐强度，幂函数平滑处理避免抽搐');
    console.log('[Follow] 平滑系统: 0.2平滑因子，0.1最小力阈值，超平滑移动');
    console.log('[Follow] 抽搐修复: 降低所有力的强度，使用平方函数平滑处理');
    this.player = {
        x: 1000, // 左下角附近
        y: this.mapConfig.height - 1000,
        health: zombieModule.GAME_CONFIG.PLAYER.BASE_HEALTH,
        maxHealth: zombieModule.GAME_CONFIG.PLAYER.BASE_HEALTH,
        level: 1,
        attack: zombieModule.GAME_CONFIG.PLAYER.BASE_ATTACK,
        attackRange: zombieModule.GAME_CONFIG.PLAYER.ATTACK_RANGE,
        lastAttackTime: 0,
        attackCooldown: zombieModule.GAME_CONFIG.PLAYER.ATTACK_COOLDOWN,
        isDead: false,
        isZombie: false,
        isWalking: false,
        walkAnimationFrame: 0,
        walkAnimationSpeed: 200,
        lastAnimationTime: 0,
        direction: 'down'
    };

    this.companions = [];
    this.currentBuilding = null;
    this.exploredBuildings = [];
    this.nearBuilding = null;
    this.buildingEntryPrompt = null;
    this.buildingExitCooldown = 0;

    // 设置摄像机跟随玩家
    this.camera.followTarget = this.player;

    // 生成初始伙伴（开局时主人物身边生成8个伙伴）
    this.generateInitialPartners();

    // 调试信息：显示玩家初始位置
    console.log('[Player] 玩家初始位置:', {
        x: this.player.x, y: this.player.y, mapWidth: this.mapConfig.width, mapHeight: this.mapConfig.height
    });

    // 初始化系统
    this.initializeNPCs();
    this.initializeZombies();

    // 视距裁剪系统初始化
    try {
        this.viewportCulling.init(this.mapConfig.width, this.mapConfig.height);
        this.fallbackToTraditionalRendering = false;
        console.log('[GameEngine] 视距裁剪系统初始化成功');

        // 延迟初始化四叉树，确保建筑物已经创建
        setTimeout(function () {
            if (this.viewportCulling && this.buildings && this.buildings.length > 0) {
                console.log('[GameEngine] 延迟初始化四叉树，建筑物数量:', this.buildings.length);
                this.markStaticEntities();
                this.insertEntitiesToQuadTree();
                this.viewportCulling.quadTreeInitialized = true;
                this.viewportCulling.lastMapWidth = this.mapConfig.width;
                this.viewportCulling.lastMapHeight = this.mapConfig.height;
                console.log('[GameEngine] 四叉树延迟初始化完成');

                // 检查四叉树状态
                this.checkQuadTreeStatus();
            }
        }.bind(this), 100);

    } catch (error) {
        console.error('[GameEngine] 视距裁剪系统初始化失败，回退到传统渲染:', error);
        this.fallbackToTraditionalRendering = true;
        this.viewportCulling = null;
    }

    // 子地图状态
    this.zombies = [];
    this.resources = [];
    this.subMapType = null;

    this.setupInput();
}


// ========================================
// 输入系统实现 (Input System Implementation)
// ========================================

GameEngine.prototype.setupInput = function () {
    var self = this;

    console.log('[Input] 开始设置触摸事件，画布尺寸:', this.canvas.width, 'x', this.canvas.height);

    // 初始化摇杆对象
    if (!this.joystick) {
    this.joystick = {
        active: false,
        centerX: 80,
        centerY: 0,
        currentX: 80,
        currentY: 0,
        direction: {x: 0, y: 0},
        radius: 60,
        knobRadius: 20,
        visible: true,
            maxDistance: 50
    };
    }

    // 性能优化：事件监听器引用，便于解绑
    this.eventHandlers = {
        touchStart: null, touchMove: null, touchEnd: null
    };

    // 标记事件绑定状态，避免重复绑定
    this.eventsBound = false;

    // 抖音平台适配：默认位置在屏幕底部中央
    this.joystick.centerX = this.canvas.width / 2;
    this.joystick.centerY = this.canvas.height - 80;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;

    console.log('[Input] 摇杆位置设置完成:', this.joystick.centerX, this.joystick.centerY);

    // 抖音小程序触摸事件处理 - 修复兼容性问题
    if (typeof tt !== 'undefined') {
        // 先解绑之前的事件（如果存在）
        if (this.eventHandlers.touchStart) {
            try {
                tt.offTouchStart(this.eventHandlers.touchStart);
            } catch (e) {
                console.warn('[Input] 解绑抖音触摸开始事件失败:', e);
            }
        }
        if (this.eventHandlers.touchMove) {
            try {
                tt.offTouchMove(this.eventHandlers.touchMove);
            } catch (e) {
                console.warn('[Input] 解绑抖音触摸移动事件失败:', e);
            }
        }
        if (this.eventHandlers.touchEnd) {
            try {
                tt.offTouchEnd(this.eventHandlers.touchEnd);
            } catch (e) {
                console.warn('[Input] 解绑抖音触摸结束事件失败:', e);
            }
        }

        // 使用抖音小程序的触摸事件API
        try {
            this.eventHandlers.touchStart = function (res) {
                self.onTouchStart(res);
            };
            this.eventHandlers.touchMove = function (res) {
                self.onTouchMove(res);
            };
            this.eventHandlers.touchEnd = function (res) {
                self.onTouchEnd(res);
            };

            tt.onTouchStart(this.eventHandlers.touchStart);
            tt.onTouchMove(this.eventHandlers.touchMove);
            tt.onTouchEnd(this.eventHandlers.touchEnd);

            this.eventsBound = true;
            console.log('[Input] 抖音触摸事件绑定成功');

        } catch (ttError) {
            console.warn('[Input] 抖音触摸事件绑定失败，使用Canvas事件:', ttError);
            this.bindCanvasEvents();
        }
    } else {
        // 抖音小游戏环境：使用Canvas事件属性
        this.bindCanvasEvents();
    }

};

// 绑定Canvas事件的方法
GameEngine.prototype.bindCanvasEvents = function () {
    var self = this;

    try {
        // 先清理之前的事件绑定
        this.canvas.ontouchstart = null;
        this.canvas.ontouchmove = null;
        this.canvas.ontouchend = null;
        this.canvas.onclick = null;

        // 重新绑定事件
        this.canvas.ontouchstart = function (e) {
            self.onTouchStart(e);
        };
        this.canvas.ontouchmove = function (e) {
            self.onTouchMove(e);
        };
        this.canvas.ontouchend = function (e) {
            self.onTouchEnd(e);
        };
        this.canvas.onclick = function (e) {
            self.onClick(e);
        };

        this.eventsBound = true;
        console.log('[Input] Canvas触摸事件绑定成功');
    } catch (error) {
        console.error('[Input] Canvas触摸事件绑定失败:', error);
    }
};

GameEngine.prototype.onTouchStart = function (e) {
    try {

        // 抖音小程序事件对象结构可能不同
        var x, y;

        // 抖音小程序的触摸事件处理
        if (typeof tt !== 'undefined') {
            // 抖音小程序触摸事件结构
            if (e.touches && e.touches.length > 0) {
                // 标准触摸事件结构
                var touch = e.touches[0];
                x = touch.x || touch.clientX || touch.pageX || 0;
                y = touch.y || touch.clientY || touch.pageY || 0;
            } else if (e.x !== undefined && e.y !== undefined) {
                // 抖音小程序直接坐标
                x = e.x;
                y = e.y;
            } else if (e.clientX !== undefined && e.clientY !== undefined) {
                // 客户端坐标
                x = e.clientX;
                y = e.clientY;
            } else {
                // 默认坐标
                x = 0;
                y = 0;
            }
        } else {
            // 抖音小游戏环境：直接使用事件坐标
            var touch = e.touches && e.touches[0] ? e.touches[0] : e;
            x = parseFloat(touch.x) || parseFloat(touch.clientX) || 0;
            y = parseFloat(touch.y) || parseFloat(touch.clientY) || 0;
        }

        // 转换为画布坐标
        try {
            var rect = this.canvas.getBoundingClientRect();
            x = x - rect.left;
            y = y - rect.top;
        } catch (error) {
            console.warn('[Touch] 画布坐标转换失败，使用原始坐标:', error);
        }

        this.touchStartX = x;
        this.touchStartY = y;
        this.touchStartTime = Date.now();

        console.log('[Touch] 触摸开始，坐标:', x, y, '游戏状态:', this.gameState);


        if (this.gameState === 'playing' || this.gameState === 'submap') {
            // 抖音小游戏环境：确保坐标是有效数值
            if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
                // 使用距离平方避免开方运算，提高性能
                var dx = x - this.joystick.centerX;
                var dy = y - this.joystick.centerY;
                var joystickDistanceSquared = dx * dx + dy * dy;
                var joystickRadiusSquared = this.joystick.radius * this.joystick.radius;

                console.log('[Touch] 触摸坐标:', x, y, '摇杆中心:', this.joystick.centerX, this.joystick.centerY, '距离:', Math.sqrt(joystickDistanceSquared).toFixed(1), '摇杆半径:', this.joystick.radius);

                if (joystickDistanceSquared <= joystickRadiusSquared) {
                    // 激活摇杆
                    this.joystick.active = true;
                    this.joystick.currentX = x;
                    this.joystick.currentY = y;
                    this.updateJoystickDirection();
                    console.log('[Joystick] 摇杆已激活，开始控制移动');
                } else {
                    console.log('[Touch] 触摸位置超出摇杆范围，不激活摇杆');
                }
            } else {
                console.warn('[Touch] 无效的触摸坐标:', {x: x, y: y, event: e});
            }
        } else {
            console.log('[Touch] 当前游戏状态不支持摇杆控制:', this.gameState);
        }
    } catch (error) {
        console.error('[Input] 触摸开始处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.onTouchMove = function (e) {
    try {

        if (!this.joystick.active) {
            console.log('[Touch] 摇杆未激活，忽略触摸移动');
            return;
        }

        var x, y;

        // 抖音小程序的触摸移动事件处理
        if (typeof tt !== 'undefined') {
            if (e.touches && e.touches.length > 0) {
                var touch = e.touches[0];
                x = touch.x || touch.clientX || touch.pageX || 0;
                y = touch.y || touch.clientY || touch.pageY || 0;
            } else if (e.x !== undefined && e.y !== undefined) {
                x = e.x;
                y = e.y;
            } else if (e.clientX !== undefined && e.clientY !== undefined) {
                x = e.clientX;
                y = e.clientY;
            } else {
                console.warn('[Input] 无法获取抖音触摸移动坐标');
                return;
            }
        } else {
            // 抖音小游戏环境：直接使用事件坐标
            var touch = e.touches && e.touches[0] ? e.touches[0] : e;
            x = parseFloat(touch.x) || parseFloat(touch.clientX) || 0;
            y = parseFloat(touch.y) || parseFloat(touch.clientY) || 0;

            // 转换为画布坐标
            try {
                var rect = this.canvas.getBoundingClientRect();
                x = x - rect.left;
                y = y - rect.top;
            } catch (error) {
                console.warn('[Touch] 触摸移动画布坐标转换失败，使用原始坐标:', error);
            }
        }


        var dx = x - this.joystick.centerX;
        var dy = y - this.joystick.centerY;
        var distanceSquared = dx * dx + dy * dy;
        var maxDistanceSquared = this.joystick.maxDistance * this.joystick.maxDistance;

        if (distanceSquared <= maxDistanceSquared) {
            this.joystick.currentX = x;
            this.joystick.currentY = y;
        } else {
            var angle = Math.atan2(dy, dx);
            this.joystick.currentX = this.joystick.centerX + Math.cos(angle) * this.joystick.maxDistance;
            this.joystick.currentY = this.joystick.centerY + Math.sin(angle) * this.joystick.maxDistance;
        }

        // 实时更新摇杆方向
        this.updateJoystickDirection();

    } catch (error) {
        console.error('[Input] 触摸移动处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.onTouchEnd = function (e) {
    try {
        // 检测是否为快速点击（tap）
        var touchEndTime = Date.now();
        var touchDuration = touchEndTime - (this.touchStartTime || touchEndTime);

        if (touchDuration < 300 && !this.joystick.active) {
            // 模拟点击事件
            console.log('[Touch] 检测到点击，坐标:', this.touchStartX, this.touchStartY, '游戏状态:', this.gameState);
            this.onClick({
                x: this.touchStartX || 0, y: this.touchStartY || 0
            });
        }

        // 立即重置摇杆状态
        this.resetJoystick();

    } catch (error) {
        console.error('[Input] 触摸结束处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.resetJoystick = function () {
    // 完全重置摇杆状态
    this.joystick.active = false;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;

    // 确保玩家停止移动
    if (this.player) {
        this.player.isWalking = false;
        this.player.walkAnimationFrame = 0;
    }

    console.log('[Joystick] 摇杆状态已重置');
};




// 检查事件绑定状态的方法
GameEngine.prototype.checkEventBindingStatus = function () {
    var status = {
        eventsBound: this.eventsBound, ttAvailable: typeof tt !== 'undefined', eventHandlers: {
            touchStart: !!this.eventHandlers.touchStart,
            touchMove: !!this.eventHandlers.touchMove,
            touchEnd: !!this.eventHandlers.touchEnd
        }, canvasEvents: {
            ontouchstart: !!this.canvas.ontouchstart,
            ontouchmove: !!this.canvas.ontouchmove,
            ontouchend: !!this.canvas.ontouchend,
            onclick: !!this.canvas.onclick
        }
    };

    console.log('[Input] 事件绑定状态检查:', status);
    return status;
};

GameEngine.prototype.updateJoystickDirection = function () {
    try {
        // 只有在摇杆激活时才更新方向
        if (!this.joystick.active) {
            this.joystick.direction.x = 0;
            this.joystick.direction.y = 0;
            return;
        }

        var dx = this.joystick.currentX - this.joystick.centerX;
        var dy = this.joystick.currentY - this.joystick.centerY;
        var distanceSquared = dx * dx + dy * dy;
        var minDistanceSquared = 5 * 5; // 25

        if (distanceSquared > minDistanceSquared) {
            var distance = Math.sqrt(distanceSquared);
            var normalizedDistance = Math.min(distance, this.joystick.maxDistance) / this.joystick.maxDistance;
            this.joystick.direction.x = (dx / distance) * normalizedDistance;
            this.joystick.direction.y = (dy / distance) * normalizedDistance;
        } else {
            this.joystick.direction.x = 0;
            this.joystick.direction.y = 0;
        }
    } catch (error) {
        console.error('[Input] 摇杆方向更新错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.onClick = function (e) {
    var x, y;


    // 抖音小程序点击事件处理
    if (typeof tt !== 'undefined') {
        if (e.touches && e.touches.length > 0) {
            var touch = e.touches[0];
            x = touch.x || touch.clientX || touch.pageX || 0;
            y = touch.y || touch.clientY || touch.pageY || 0;
        } else if (e.x !== undefined && e.y !== undefined) {
            x = e.x;
            y = e.y;
        } else if (e.clientX !== undefined && e.clientY !== undefined) {
            x = e.clientX;
            y = e.clientY;
        } else {
            x = 0;
            y = 0;
            console.warn('[Input] 无法获取抖音点击坐标，使用默认值');
        }
    } else {
        // 抖音小游戏环境：直接使用事件坐标
        if (e.touches && e.touches[0]) {
            var touch = e.touches[0];
            x = parseFloat(touch.x) || parseFloat(touch.clientX) || 0;
            y = parseFloat(touch.y) || parseFloat(touch.clientY) || 0;
        } else {
            x = parseFloat(e.x) || parseFloat(e.clientX) || 0;
            y = parseFloat(e.y) || parseFloat(e.clientY) || 0;
        }
    }


    if (this.gameState === 'menu') {
        this.handleMenuClick(x, y);
    } else if (this.gameState === 'playing') {
        this.handleGameClick(x, y);
    } else if (this.gameState === 'submap') {
        this.handleSubMapClick(x, y);
    } else if (this.gameState === 'gameover' || this.gameState === 'victory') {
        this.handleEndGameClick(x, y);
    }
};

GameEngine.prototype.handleMenuClick = function (x, y) {
    var centerX = this.canvas.width / 2;
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    var buttonY = 320;

    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        this.startGame();
    }
};

GameEngine.prototype.handleGameClick = function (x, y) {
    console.log('[Click] 游戏点击事件，坐标:', x, y, '弹出提示状态:', {
        exists: !!this.buildingEntryPrompt, active: this.buildingEntryPrompt ? this.buildingEntryPrompt.active : false
    });

    if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        console.log('[Click] 调用建筑进入提示点击处理');
        this.handleBuildingEntryPromptClick(x, y);
        return;
    }
};

GameEngine.prototype.handleBuildingEntryPromptClick = function (x, y) {
    console.log('[Click] 处理建筑进入提示点击，坐标:', x, y);
    var prompt = this.buildingEntryPrompt;
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    var boxHeight = 150;
    var boxY = centerY - boxHeight / 2;
    var buttonWidth = 80;
    var buttonHeight = 35;
    var buttonY = boxY + 90;

    var enterButtonX = centerX - buttonWidth - 20;
    console.log('[Click] 进入按钮区域:', enterButtonX, buttonY, buttonWidth, buttonHeight);
    console.log('[Click] 点击位置是否在进入按钮内:', x >= enterButtonX && x <= enterButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight);

    if (x >= enterButtonX && x <= enterButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('[Click] 进入按钮被点击');
        if (this.nearBuilding && this.nearBuilding.id === prompt.building.id && this.nearBuilding.name === prompt.building.name) {
            console.log('[Click] 开始进入建筑:', prompt.building.name);
            mapModule.exploreBuilding(prompt.building, this);
        } else {
            console.log('[Click] 进入建筑失败，nearBuilding不匹配:', {
                nearBuilding: this.nearBuilding, promptBuilding: prompt.building
            });
        }
        this.buildingEntryPrompt = null;
        return;
    }

    var cancelButtonX = centerX + 20;
    if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        this.buildingEntryPrompt = null;
        return;
    }
};

GameEngine.prototype.handleSubMapClick = function (x, y) {
    var self = this;
    if (x >= 10 && x <= 90 && y >= this.canvas.height - 40 && y <= this.canvas.height - 10) {
        mapModule.exitBuilding(this);
        return;
    }

    // 使用for循环遍历资源，可以提前退出以提高性能
    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        if (!resource.collected) {
                    // 使用距离平方避免开方运算，提高性能
        var dx = x - resource.x;
        var dy = y - resource.y;
        var distanceSquared = dx * dx + dy * dy;
        var interactionRadiusSquared = 30 * 30; // 900

        if (distanceSquared <= interactionRadiusSquared) {
                this.collectResource(resource);
                break; // 找到一个资源后即可退出
            }
        }
    }
};

GameEngine.prototype.handleEndGameClick = function (x, y) {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;

    // 重新开始按钮 (160x50, 居中) - 与渲染代码保持一致
    var restartButtonX = centerX - 80;
    var restartButtonY = centerY + 80;
    var restartButtonWidth = 160;
    var restartButtonHeight = 50;

    // 返回菜单按钮 (160x50, 居中) - 与渲染代码保持一致
    var menuButtonX = centerX - 80;
    var menuButtonY = centerY + 150;
    var menuButtonWidth = 160;
    var menuButtonHeight = 50;

    console.log('[EndGame] 点击坐标:', x, y);
    console.log('[EndGame] 画布尺寸:', this.canvas.width, 'x', this.canvas.height);
    console.log('[EndGame] 画布中心:', centerX, centerY);
    console.log('[EndGame] 重新开始按钮区域:', restartButtonX, restartButtonY, restartButtonWidth, restartButtonHeight);
    console.log('[EndGame] 返回菜单按钮区域:', menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight);

    // 检查重新开始按钮点击
    if (x >= restartButtonX && x <= restartButtonX + restartButtonWidth && y >= restartButtonY && y <= restartButtonY + restartButtonHeight) {
        console.log('[EndGame] 重新开始按钮被点击');
        this.restartGame();
        return;
    }

    // 检查返回菜单按钮点击
    if (x >= menuButtonX && x <= menuButtonX + menuButtonWidth && y >= menuButtonY && y <= menuButtonY + menuButtonHeight) {
        console.log('[EndGame] 返回菜单按钮被点击');
        this.returnToMenu();
        return;
    }

    console.log('[EndGame] 点击未命中任何按钮');
};

// 返回菜单函数
GameEngine.prototype.returnToMenu = function () {
    console.log('[GameEngine] 返回菜单');

    // 重置游戏状态
    this.gameState = 'menu';
    this.isGameEnded = false;

    // 清理游戏对象
    this.cleanupGameObjects();

    // 强制重新绑定触摸事件
    this.eventsBound = false;
    this.setupInput();
    console.log('[Input] 返回菜单时重新绑定触摸事件');

    // 重置摇杆状态
    this.resetJoystick();

    // 重新开始游戏循环以显示菜单
    this.running = true;
    this.lastTime = Date.now();
};

// ========================================
// 碰撞检测系统实现 (Collision System Implementation)
// ========================================

GameEngine.prototype.checkCollisionWithBuildings = function (x, y, characterRadius) {
            characterRadius = characterRadius || zombieModule.GAME_CONFIG.PLAYER.CHARACTER_RADIUS;
    var bufferDistance = 2;
    var effectiveRadius = characterRadius + bufferDistance;

    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];

        if (this.circleRectCollision(x, y, effectiveRadius, building.x, building.y, building.width, building.height)) {
            var doorInfo = this.calculateDoorInfo(building);
            var originalDoorX = doorInfo.originalX;
            var originalDoorY = doorInfo.originalY;
            var originalDoorWidth = doorInfo.originalWidth;
            var originalDoorHeight = doorInfo.originalHeight;

            var doorEffectiveRadius = characterRadius;

            if (this.circleRectCollision(x, y, doorEffectiveRadius, originalDoorX, originalDoorY, originalDoorWidth, originalDoorHeight)) {
                return {collision: false, building: null, inDoor: true};
            } else {
                return {collision: true, building: building, inDoor: false};
            }
        }
    }

    return {collision: false, building: null, inDoor: false};
};

// 新增：检查角色之间的重叠（允许短时间重叠）
GameEngine.prototype.checkCharacterOverlap = function (char1, char2, allowOverlap = true) {
    var char1Radius = char1.radius || 18;
    var char2Radius = char2.radius || 18;

    // 使用距离平方避免开方运算，提高性能
    var dx = char1.x - char2.x;
    var dy = char1.y - char2.y;
    var distanceSquared = dx * dx + dy * dy;
    var minDistance = char1Radius + char2Radius;
    var minDistanceSquared = minDistance * minDistance;

    if (allowOverlap) {
        // 允许重叠身体3分之1的像素
        var overlapAllowance = Math.min(char1Radius, char2Radius) / 3;
        var allowedDistanceSquared = (minDistance - overlapAllowance) * (minDistance - overlapAllowance);
        return distanceSquared >= allowedDistanceSquared;
    } else {
        return distanceSquared >= minDistanceSquared;
    }
};


// 安全获取跟随者索引的辅助方法
GameEngine.prototype.getFollowerIndex = function (follower) {
    // 检查跟随者是否有效
    if (!follower || !this.followers || !Array.isArray(this.followers)) {
        console.warn('[getFollowerIndex] 跟随者或followers数组无效:', {follower: !!follower, followers: !!this.followers});
        return -1;
    }

    var index = this.followers.indexOf(follower);

    // 检查index是否有效
    if (index === -1) {
        console.warn('[getFollowerIndex] 跟随者不在数组中:', follower);
        return -1;
    }

    return index;
};

// 安全移除跟随者的辅助方法
GameEngine.prototype.safeRemoveFollower = function (follower) {
    var index = this.getFollowerIndex(follower);
    if (index === -1) {
        console.warn('[safeRemoveFollower] 无法找到跟随者索引:', follower);
        return false;
    }

    // 验证索引和数组状态
    if (this.followers && Array.isArray(this.followers) && index >= 0 && index < this.followers.length) {
        if (this.followers[index] === follower) {
            // 在移除前，尝试回收到跟随者对象池
            this.recycleFollowerToPool(follower);

            // 使用安全的移除方法
            return this.safeRemoveFollowerByIndex(index);
        } else {
            console.warn('[safeRemoveFollower] 索引验证失败，跟随者可能已被移除');
            return false;
        }
    } else {
        console.error('[safeRemoveFollower] 数组状态异常，无法移除跟随者');
        return false;
    }
};

// 通过索引安全移除跟随者
GameEngine.prototype.safeRemoveFollowerByIndex = function (index) {
    if (!this.followers || !Array.isArray(this.followers)) {
        console.error('[safeRemoveFollowerByIndex] followers数组无效');
        return false;
    }

    if (index < 0 || index >= this.followers.length) {
        console.error('[safeRemoveFollowerByIndex] 索引超出范围:', index, '数组长度:', this.followers.length);
        return false;
    }

    try {
        // 验证索引对应的对象
        var follower = this.followers[index];
        if (!follower) {
            console.error('[safeRemoveFollowerByIndex] 索引对应的跟随者无效:', index);
            return false;
        }

        // 安全移除
        this.followers.splice(index, 1);
        this.gameData.teamSize = this.followers.length + 1;
        console.log('[safeRemoveFollowerByIndex] 跟随者移除成功，当前团队人数:', this.gameData.teamSize);
        return true;
    } catch (error) {
        console.error('[safeRemoveFollowerByIndex] 移除跟随者时出错:', error);
        return false;
    }
};

// 通用安全数组操作工具类
var SafeArrayOperations = {
    // 安全的批量删除，使用对象引用而不是索引，就地操作避免内存分配
    safeBatchRemove: function (array, indicesToRemove, onRemove) {
        if (!array || !Array.isArray(array) || !indicesToRemove || indicesToRemove.length === 0) {
            return 0;
        }

        var objectsToRemove = [];
        var removedCount = 0;

        // 收集需要移除的对象引用
        for (var i = 0; i < indicesToRemove.length; i++) {
            var index = indicesToRemove[i];
            if (index >= 0 && index < array.length) {
                var obj = array[index];
                if (obj) {
                    objectsToRemove.push(obj);
                }
            }
        }

        // 使用就地操作安全移除，避免内存分配和索引问题
        for (var j = array.length - 1; j >= 0; j--) {
            var obj = array[j];
            var shouldRemove = objectsToRemove.indexOf(obj) !== -1;

            if (shouldRemove) {
                if (typeof onRemove === 'function') {
                    onRemove(obj);
                }
                array.splice(j, 1);
                removedCount++;
            }
        }

        return removedCount;
    },

    // 安全的单个元素移除，使用对象引用
    safeRemove: function (array, objectToRemove) {
        if (!array || !Array.isArray(array) || !objectToRemove) {
            return false;
        }

        var index = array.indexOf(objectToRemove);
        if (index === -1) {
            return false;
        }

        array.splice(index, 1);
        return true;
    },

    // 验证索引是否有效
    isValidIndex: function (array, index) {
        return array && Array.isArray(array) && index >= 0 && index < array.length;
    },

    // 安全删除死亡实体
    safeRemoveDeadEntities: function (array, isDeadCheck, cleanupCallback) {
        if (!Array.isArray(array)) {
            console.warn('[SafeArrayOperations] 数组参数类型错误');
            return 0;
        }

        var deadIndices = [];

        // 先收集所有死亡实体的索引
        for (var i = 0; i < array.length; i++) {
            if (array[i] && isDeadCheck(array[i])) {
                deadIndices.push(i);
            }
        }

        // 从后往前删除
        var removedCount = 0;
        for (var j = deadIndices.length - 1; j >= 0; j--) {
            var indexToRemove = deadIndices[j];
            if (indexToRemove >= 0 && indexToRemove < array.length) {
                if (cleanupCallback) {
                    cleanupCallback(array[indexToRemove]);
                }
                array.splice(indexToRemove, 1);
                removedCount++;
            }
        }

        return removedCount;
    }
};

// 验证followers数组状态的辅助方法
GameEngine.prototype.validateFollowersArray = function () {
    if (!this.followers) {
        console.error('[validateFollowersArray] followers数组未定义');
        this.followers = [];
        return false;
    }

    if (!Array.isArray(this.followers)) {
        console.error('[validateFollowersArray] followers不是数组:', typeof this.followers);
        this.followers = [];
        return false;
    }

    // 检查数组中的无效元素
    var invalidCount = 0;
    for (var i = 0; i < this.followers.length; i++) {
        if (!this.followers[i] || typeof this.followers[i] !== 'object') {
            console.warn('[validateFollowersArray] 发现无效跟随者，索引:', i, '值:', this.followers[i]);
            invalidCount++;
        }
    }

    if (invalidCount > 0) {
        console.warn('[validateFollowersArray] 发现', invalidCount, '个无效跟随者');
        // 清理无效元素 - 使用安全的批量删除避免索引错乱
        var invalidIndices = [];
        for (var j = 0; j < this.followers.length; j++) {
            if (!this.followers[j] || typeof this.followers[j] !== 'object') {
                invalidIndices.push(j);
            }
        }

        // 从后往前删除，避免索引错乱
        for (var k = invalidIndices.length - 1; k >= 0; k--) {
            var indexToRemove = invalidIndices[k];
            if (indexToRemove >= 0 && indexToRemove < this.followers.length) {
                this.followers.splice(indexToRemove, 1);
            }
        }
        console.log('[validateFollowersArray] 清理后跟随者数量:', this.followers.length);
    }

    return true;
};

// 跟随者对象池管理
GameEngine.prototype.followerPool = [];
GameEngine.prototype.maxFollowerPoolSize = 50;

// 初始化跟随者对象池（优化版）
GameEngine.prototype.initializeFollowerPool = function () {
    if (this.followerPool.length > 0) {
        console.log('[FollowerPool] 对象池已存在，跳过初始化');
        return;
    }

    console.log('[FollowerPool] 开始初始化跟随者对象池，目标大小:', this.maxFollowerPoolSize);

    // 预创建一些跟随者对象，使用对象工厂避免重复代码
    var initialPoolSize = Math.min(20, this.maxFollowerPoolSize);
    for (var i = 0; i < initialPoolSize; i++) {
        var follower = this.createPooledFollower(i);
        this.followerPool.push(follower);
    }

    console.log('[FollowerPool] 跟随者对象池初始化完成，当前大小:', this.followerPool.length);
};

// 创建池化跟随者对象（对象工厂模式）
GameEngine.prototype.createPooledFollower = function (index) {
    return {
        id: 'pool_' + index,
            characterId: 2, // 默认角色ID
            x: 0,
            y: 0,
            health: 30,
            maxHealth: 30,
            attack: 10,
            attackRange: 25,
            attackCooldown: 1000,
            lastAttackTime: 0,
            isDead: false,
            isZombie: false,
            isUnstucking: false,
            unstuckTargetX: null,
            unstuckTargetY: null,
            unstuckStartTime: null,
            lastMoveTime: null,
            lastX: null,
            lastY: null,
            lastFollowUpdate: null,
            isWalking: false,
            direction: 'down',
            walkAnimationFrame: 0,
            lastAnimationTime: null,
            smoothForceX: 0,
            smoothForceY: 0,
        quadTreeInserted: false, // 池化对象标记
        isPooled: true,
        poolIndex: index
    };
};

// 回收跟随者到对象池
GameEngine.prototype.recycleFollowerToPool = function (follower) {
    if (!follower || typeof follower !== 'object') {
        console.warn('[FollowerPool] 无效的跟随者对象，跳过回收:', follower);
        return false;
    }

    if (this.followerPool.length >= this.maxFollowerPoolSize) {
        console.log('[FollowerPool] 对象池已满，跳过回收');
        return false;
    }

    try {
        // 重置跟随者状态
        follower.x = 0;
        follower.y = 0;
        follower.health = 30;
        follower.maxHealth = 30;
        follower.isDead = false;
        follower.isZombie = false;
        follower.isUnstucking = false;
        follower.unstuckTargetX = null;
        follower.unstuckTargetY = null;
        follower.unstuckStartTime = null;
        follower.lastMoveTime = null;
        follower.lastX = null;
        follower.lastY = null;
        follower.lastFollowUpdate = null;
        follower.isWalking = false;
        follower.direction = 'down';
        follower.walkAnimationFrame = 0;
        follower.lastAnimationTime = null;
        follower.smoothForceX = 0;
        follower.smoothForceY = 0;
        follower.quadTreeInserted = false;

        // 确保从四叉树中移除
        if (this.viewportCulling && this.viewportCulling.quadTree) {
            this.viewportCulling.quadTree.remove(follower);
        }
        ;

        // 添加到对象池
        this.followerPool.push(follower);
        console.log('[FollowerPool] 跟随者回收成功，当前池大小:', this.followerPool.length);
        return true;
    } catch (error) {
        console.error('[FollowerPool] 回收跟随者时出错:', error);
        return false;
    }
};

// ========================================
// 资源对象池 (Resource Object Pool)
// ========================================

// 初始化资源对象池
GameEngine.prototype.initializeResourcePool = function () {
    if (this.resourcePool && this.resourcePool.length > 0) {
        console.log('[ResourcePool] 资源对象池已存在，跳过初始化');
        return;
    }

    // 初始化资源对象池数组
    this.resourcePool = [];
    this.maxResourcePoolSize = 30;

    console.log('[ResourcePool] 开始初始化资源对象池，目标大小:', this.maxResourcePoolSize);

    // 预创建一些资源对象
    var initialPoolSize = Math.min(15, this.maxResourcePoolSize);
    for (var i = 0; i < initialPoolSize; i++) {
        var resource = {
            id: 'pool_' + i,
            type: 'food',
            x: 0,
            y: 0,
            collected: false,
            companionData: null,
            amount: 0,
            weaponData: null
        };

        this.resourcePool.push(resource);
    }

    console.log('[ResourcePool] 资源对象池初始化完成，当前大小:', this.resourcePool.length);
};

// 从对象池获取资源对象
GameEngine.prototype.getResourceFromPool = function (type) {
    for (var i = 0; i < this.resourcePool.length; i++) {
        if (this.resourcePool[i].type === type || this.resourcePool[i].type === 'food') {
            var resource = this.resourcePool.splice(i, 1)[0];
            console.log('[ResourcePool] 从对象池获取资源:', type);
            return resource;
        }
    }
    return null;
};

// 回收资源对象到对象池
GameEngine.prototype.recycleResourceToPool = function (resource) {
    if (!resource || typeof resource !== 'object') {
        console.warn('[ResourcePool] 无效的资源对象，跳过回收:', resource);
        return false;
    }

    if (this.resourcePool.length >= this.maxResourcePoolSize) {
        console.log('[ResourcePool] 资源对象池已满，跳过回收');
        return false;
    }

    try {
        // 重置资源状态
        resource.id = 'pool_' + Date.now() + '_' + Math.random();
        resource.x = 0;
        resource.y = 0;
        resource.collected = false;
        resource.companionData = null;
        resource.amount = 0;
        resource.weaponData = null;

        // 确保从四叉树中移除（如果存在）
        if (this.viewportCulling && this.viewportCulling.quadTree) {
            this.viewportCulling.quadTree.remove(resource);
        }

        // 添加到对象池
        this.resourcePool.push(resource);
        console.log('[ResourcePool] 资源回收成功，当前池大小:', this.resourcePool.length);
        return true;
    } catch (error) {
        console.error('[ResourcePool] 回收资源时出错:', error);
        return false;
    }
};

// 计算附近跟随者数量
GameEngine.prototype.countNearbyFollowers = function (follower, radius) {
    var count = 0;
    for (var i = 0; i < this.followers.length; i++) {
        var other = this.followers[i];
        if (other !== follower) {
            var dx = follower.x - other.x;
            var dy = follower.y - other.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < radius) count++;
        }
    }
    return count;
};


// 菱形布局偏移：4个以下跟随者
GameEngine.prototype.calculateDiamondOffset = function (index, totalFollowers, personality) {
    var baseDistance = personality.followDistance || 25;

    // 预设的菱形偏移位置（相对于领导者）
    var offsets = [{x: 0, y: -baseDistance},           // 前方
        {x: -baseDistance, y: 0},           // 左侧
        {x: baseDistance, y: 0},            // 右侧
        {x: 0, y: baseDistance}             // 后方
    ];

    var offset = offsets[index] || {x: 0, y: 0};

    // 添加微小的随机偏移，避免完全重叠
    var randomOffset = (Math.random() - 0.5) * 3; // ±1.5像素随机偏移
    offset.x += randomOffset;
    offset.y += randomOffset;

    return offset;
};

// 双环布局偏移：5-8个跟随者
GameEngine.prototype.calculateDoubleRingOffset = function (index, totalFollowers, personality) {
    var baseDistance = personality.followDistance || 25;
    var innerRadius = baseDistance;
    var outerRadius = baseDistance + 15;

    // 添加微小的随机偏移
    var randomOffset = (Math.random() - 0.5) * 2; // ±1像素随机偏移

    if (index < 4) {
        // 内环：4个位置
        var angle = (index / 4) * Math.PI * 2;
        return {
            x: Math.cos(angle) * innerRadius + randomOffset, y: Math.sin(angle) * innerRadius + randomOffset
        };
    } else {
        // 外环：剩余位置
        var outerIndex = index - 4;
        var outerCount = totalFollowers - 4;
        var angle = (outerIndex / outerCount) * Math.PI * 2;
        return {
            x: Math.cos(angle) * outerRadius + randomOffset, y: Math.sin(angle) * outerRadius + randomOffset
        };
    }
};

// 螺旋布局偏移：9个以上跟随者
GameEngine.prototype.calculateSpiralOffset = function (index, totalFollowers, personality) {
    var baseDistance = personality.followDistance || 25;
    var baseRadius = baseDistance;
    var spiralSpacing = 8;

    // 使用黄金角度创建螺旋效果
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    var angle = index * goldenAngle;
    var radius = baseRadius + index * spiralSpacing;

    // 添加微小的随机偏移
    var randomOffset = (Math.random() - 0.5) * 1.5; // ±0.75像素随机偏移

            return {
        x: Math.cos(angle) * radius + randomOffset, y: Math.sin(angle) * radius + randomOffset
    };
};


// 动态计算对齐参数
GameEngine.prototype.calculateDynamicAlignmentParams = function (follower) {
    var baseStrength = 0.3;

    // 根据玩家移动速度动态调整
    var playerSpeed = this.calculatePlayerSpeed();
    var speedFactor = Math.min(playerSpeed / 2, 1.5);

    // 根据跟随者距离动态调整
    var distanceToPlayer = Math.sqrt(Math.pow(follower.x - this.player.x, 2) + Math.pow(follower.y - this.player.y, 2));
    var distanceFactor = Math.min(distanceToPlayer / 50, 1.5);

    // 速度快时增加对齐强度，距离远时减少对齐强度
    var finalStrength = baseStrength * (1 + speedFactor * 0.4) * (1 - distanceFactor * 0.3);

    return {
        strength: Math.max(0.1, Math.min(0.6, finalStrength)) // 限制在合理范围内
    };
};


GameEngine.prototype.canMoveToPosition = function (x, y, characterRadius) {
    var margin = characterRadius || zombieModule.GAME_CONFIG.PLAYER.CHARACTER_RADIUS;

    // 检查地图边界
    if (x < margin || x > this.mapConfig.width - margin || y < margin || y > this.mapConfig.height - margin) {
        return false;
    }

    // 检查与建筑物的碰撞
    var collision = this.checkCollisionWithBuildings(x, y, characterRadius);
    return !collision.collision;
};

// 新增：检查移动路径是否安全（防止穿墙）
GameEngine.prototype.canMoveAlongPath = function (fromX, fromY, toX, toY, characterRadius) {
    var margin = characterRadius || zombieModule.GAME_CONFIG.PLAYER.CHARACTER_RADIUS;

    // 计算路径上的多个检查点
    var distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    var checkPoints = Math.max(2, Math.floor(distance / margin));

    for (var i = 0; i <= checkPoints; i++) {
        var t = i / checkPoints;
        var checkX = fromX + (toX - fromX) * t;
        var checkY = fromY + (toY - fromY) * t;

        if (!this.canMoveToPosition(checkX, checkY, characterRadius)) {
            return false;
        }
    }

    return true;
};

GameEngine.prototype.circleRectCollision = function (circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight) {
    var closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    var closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));

    var distanceX = circleX - closestX;
    var distanceY = circleY - closestY;
    var distanceSquared = distanceX * distanceX + distanceY * distanceY;

    return distanceSquared < (circleRadius * circleRadius);
};

GameEngine.prototype.calculateDoorInfo = function (building) {
    var doorWidth = Math.max(30, Math.floor(building.width / 8));
    var doorHeight = Math.max(40, Math.floor(building.height / 6));
    var doorX = building.x + (building.width - doorWidth) / 2;
    var doorY = building.y + building.height - doorHeight - 5;

    var expandedDoorX = doorX - 20;
    var expandedDoorY = doorY - 20;
    var expandedDoorWidth = doorWidth + 40;
    var expandedDoorHeight = doorHeight + 40;

    return {
        x: expandedDoorX,
        y: expandedDoorY,
        width: expandedDoorWidth,
        height: expandedDoorHeight,
        originalX: doorX,
        originalY: doorY,
        originalWidth: doorWidth,
        originalHeight: doorHeight
    };
};

GameEngine.prototype.checkNearDoor = function () {
            var interactionDistance = zombieModule.GAME_CONFIG.BUILDING.INTERACTION_DISTANCE;
        var triggerDistance = zombieModule.GAME_CONFIG.BUILDING.TRIGGER_DISTANCE;

    if (this.buildingExitCooldown > Date.now()) {
        if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
            this.buildingEntryPrompt = null;
        }
        return;
    }

    this.nearBuilding = null;

    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;

    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];

        if (building.x + building.width >= viewLeft && building.x <= viewRight && building.y + building.height >= viewTop && building.y <= viewBottom) {

            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.x + doorInfo.width / 2;
            var doorCenterY = doorInfo.y + doorInfo.height / 2;

            var playerDistance = Math.sqrt(Math.pow(this.player.x - doorCenterX, 2) + Math.pow(this.player.y - doorCenterY, 2));

            // 调试信息：显示距离
            if (playerDistance <= 100) { // 只显示100像素内的距离
                console.log('[Debug] 建筑物:', building.name, '距离:', playerDistance.toFixed(1), '交互距离:', interactionDistance, '触发距离:', triggerDistance);
            }

            if (playerDistance <= interactionDistance) {
                this.nearBuilding = building;
                console.log('[Door] 设置nearBuilding:', building.name, 'ID:', building.id, 'Name:', building.name);

                // 当门变色时，就创建弹出提示（复用门变色逻辑）
                if (!this.buildingEntryPrompt || !this.buildingEntryPrompt.active || this.buildingEntryPrompt.buildingId !== (building.id || building.name)) {
                    this.buildingEntryPrompt = {
                        building: building,
                        buildingId: building.id || building.name,
                        active: true,
                        message: '是否进入 ' + building.name + '？',
                        options: ['进入', '取消']
                    };
                    console.log('[Door] 弹出提示已创建（复用门变色逻辑）:', building.name, '距离:', playerDistance);
                }
                break;
            }
        }
    }

    if (!this.nearBuilding && this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        console.log('[Door] 清除弹出提示，原因：玩家离开建筑物');
        this.buildingEntryPrompt = null;
    }
};

// ========================================
// 游戏逻辑系统 (Game Logic System)
// ========================================

GameEngine.prototype.start = function () {
    this.running = true;
    this.lastTime = Date.now();
    this.gameLoop();
};

GameEngine.prototype.gameLoop = function () {
    var self = this;

    if (!this.running) return;

    // 如果游戏已经结束，只进行渲染，不进行游戏逻辑更新
    if (this.isGameEnded || this.gameState === 'gameover' || this.gameState === 'victory') {
        // 游戏结束时仍然需要渲染界面和接收触摸事件
        this.render();

        // 继续游戏循环以保持界面响应
        if (typeof tt !== 'undefined' && tt.requestAnimationFrame) {
            tt.requestAnimationFrame(function () {
                self.gameLoop();
            });
        } else {
            requestAnimationFrame(function () {
                self.gameLoop();
            });
        }
        return;
    }

    var currentTime = Date.now();
    var deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    // 抖音小游戏环境：使用tt.requestAnimationFrame
    if (typeof tt !== 'undefined' && tt.requestAnimationFrame) {
        tt.requestAnimationFrame(function () {
            self.gameLoop();
        });
    } else {
        requestAnimationFrame(function () {
            self.gameLoop();
        });
    }
};

GameEngine.prototype.update = function (deltaTime) {
    // 检查游戏是否已结束，如果是则不进行任何更新
    if (this.isGameEnded || this.gameState === 'gameover' || this.gameState === 'victory') {
        return;
    }

    if (this.gameState === 'playing' || this.gameState === 'submap') {
        // 定期验证followers数组状态（每100帧检查一次）
        if (!this.followerValidationCounter) this.followerValidationCounter = 0;
        this.followerValidationCounter++;
        if (this.followerValidationCounter >= 100) {
            this.validateFollowersArray();
            this.followerValidationCounter = 0;
        }

        // 优先检查玩家是否死亡
        if (this.player.health <= 0 && !this.player.isDead) {
            this.player.isDead = true;
            this.gameOver('death');
            return;
        }

        this.updatePlayer(deltaTime);
        this.updateTime(deltaTime);

        if (this.gameState === 'playing') {
            // 更新伙伴系统（统一处理，避免重复）
            this.updatePartnerSystem();

            this.zombieManager.update(deltaTime, this);
            this.updateCombat(deltaTime);
            this.updateTeamHealth(deltaTime);
        }

        if (this.gameState === 'submap') {
            this.updateZombies(deltaTime);
            this.updateCombat(deltaTime);
            this.updateTeamHealth(deltaTime);
        }
    }
};

GameEngine.prototype.updatePlayer = function (deltaTime) {
    // 如果玩家已死亡，不允许移动
    if (this.player.health <= 0 || this.player.isDead) {
        this.player.isWalking = false;
        this.player.walkAnimationFrame = 0;
        return;
    }

    // 只有在摇杆激活且方向不为零时才移动
    var isMoving = this.joystick.active && (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0);

    // 调试信息：每帧检查摇杆状态
    if (this.debugCounter === undefined) this.debugCounter = 0;
    this.debugCounter++;
    if (this.debugCounter >= 60) { // 每60帧（约1秒）输出一次调试信息
        console.log('[Player] 摇杆状态:', {
            active: this.joystick.active,
            directionX: this.joystick.direction.x,
            directionY: this.joystick.direction.y,
            centerX: this.joystick.centerX,
            centerY: this.joystick.centerY,
            isMoving: isMoving
        });
        this.debugCounter = 0;
    }

    if (isMoving) {
        this.player.isWalking = true;

        // 获取摇杆方向
        var directionX = this.joystick.direction.x;
        var directionY = this.joystick.direction.y;

        // 使用标准化后的方向向量判断移动方向
        if (Math.abs(directionX) > Math.abs(directionY)) {
            this.player.direction = directionX > 0 ? 'right' : 'left';
        } else {
            this.player.direction = directionY > 0 ? 'down' : 'up';
        }

        this.updateWalkAnimation(deltaTime);

        // 匀速移动：固定移动速度，不受摇杆推拉程度影响
        var moveSpeed = zombieModule.GAME_CONFIG.PLAYER.MOVE_SPEED;

        // 标准化方向向量，确保对角线移动速度一致
        var directionLength = Math.sqrt(directionX * directionX + directionY * directionY);

        if (directionLength > 0) {
            // 标准化方向向量，确保对角线移动速度一致
            directionX /= directionLength;
            directionY /= directionLength;
        }

        var newX = this.player.x + directionX * moveSpeed;
        var newY = this.player.y + directionY * moveSpeed;

        if (this.gameState === 'playing') {
            if (this.canMoveAlongPath(this.player.x, this.player.y, newX, newY, 18)) {
                var deltaX = newX - this.player.x;
                var deltaY = newY - this.player.y;
                this.player.x = newX;
                this.player.y = newY;
                this.moveTeam(deltaX, deltaY);

            } else {
                var canMoveX = this.canMoveAlongPath(this.player.x, this.player.y, newX, this.player.y, 18);
                var canMoveY = this.canMoveAlongPath(this.player.x, this.player.y, this.player.x, newY, 18);

                if (canMoveX) {
                    var deltaX = newX - this.player.x;
                    this.player.x = newX;
                    this.moveTeam(deltaX, 0);
                }
                if (canMoveY) {
                    var deltaY = newY - this.player.y;
                    this.player.y = newY;
                    this.moveTeam(0, deltaY);
                }
            }
        } else if (this.gameState === 'submap') {
            var deltaX = newX - this.player.x;
            var deltaY = newY - this.player.y;

            if (this.canTeamMoveInSubmap(deltaX, deltaY)) {
                this.player.x = Math.max(60, Math.min(340, newX));
                this.player.y = Math.max(110, Math.min(290, newY));
                this.moveTeam(deltaX, deltaY);
            } else {
                var canMoveX = this.canTeamMoveInSubmap(deltaX, 0);
                var canMoveY = this.canTeamMoveInSubmap(0, deltaY);

                if (canMoveX) {
                    this.player.x = Math.max(60, Math.min(340, newX));
                    this.moveTeam(deltaX, 0);
                }
                if (canMoveY) {
                    this.player.y = Math.max(110, Math.min(290, newY));
                    this.moveTeam(0, deltaY);
                }
            }
        }
    } else {
        this.player.isWalking = false;
        this.player.walkAnimationFrame = 0;
    }

    if (this.gameState === 'playing') {
        this.updateCamera(deltaTime);
        this.updateNPCs(deltaTime);
        this.checkNearDoor();

        // 调试：每帧检查弹出提示状态
        if (this.buildingEntryPrompt) {
            console.log('[Debug] 每帧检查 - 弹出提示状态:', {
                exists: !!this.buildingEntryPrompt,
                active: this.buildingEntryPrompt.active,
                buildingId: this.buildingEntryPrompt.buildingId,
                message: this.buildingEntryPrompt.message
            });
        }
    }
};

GameEngine.prototype.updateWalkAnimation = function (deltaTime) {
    this.player.lastAnimationTime += deltaTime;

    if (this.player.lastAnimationTime >= this.player.walkAnimationSpeed) {
        this.player.walkAnimationFrame = (this.player.walkAnimationFrame + 1) % 4;
        this.player.lastAnimationTime = 0;
    }
};

GameEngine.prototype.updateCamera = function (deltaTime) {
    if (!this.camera.followTarget) return;

    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;

    var targetX = this.camera.followTarget.x - viewWidth / 2;
    var targetY = this.camera.followTarget.y - viewHeight / 2;

    targetX = Math.max(0, Math.min(this.mapConfig.width - viewWidth, targetX));
    targetY = Math.max(0, Math.min(this.mapConfig.height - viewHeight, targetY));

    var smoothing = this.camera.smoothing || 0.1;
    this.camera.x += (targetX - this.camera.x) * smoothing;
    this.camera.y += (targetY - this.camera.y) * smoothing;

    if (Math.abs(targetX - this.camera.x) < 1) this.camera.x = targetX;
    if (Math.abs(targetY - this.camera.y) < 1) this.camera.y = targetY;
};

GameEngine.prototype.updateTime = function (deltaTime) {
    var self = this;
    this.gameData.timeRemaining -= deltaTime;

    if (this.gameData.timeRemaining <= 0) {
        if (this.gameData.isDay) {
            this.gameData.isDay = false;
            this.gameData.timeRemaining = zombieModule.GAME_CONFIG.TIME.NIGHT_DURATION;
        } else {
            this.gameData.isDay = true;
            this.gameData.timeRemaining = zombieModule.GAME_CONFIG.TIME.DAY_DURATION;
            this.gameData.survivalDays++;

            // 每个伙伴每天消耗1个食物
            var foodCost = this.gameData.teamSize;
            this.gameData.food -= foodCost;

            console.log('[Time] 新的一天开始，团队人数:', this.gameData.teamSize, '，消耗食物:', foodCost, '，剩余食物:', this.gameData.food);

            // 显示食物消耗警告
            if (this.gameData.food <= 5) {
                console.warn('[Warning] 食物不足！剩余食物:', this.gameData.food, '，团队人数:', this.gameData.teamSize);
            }

            if (this.gameData.food < 0) {
                this.gameOver('starvation');
                return;
            }

            if (this.gameData.survivalDays > 100) {
                this.gameWin();
                return;
            }

            this.spawnNewDayZombies();

            // 优化：批量处理厨师产粮 - 使用for循环避免函数调用开销
            var chefCount = 0;
            for (var i = 0; i < this.followers.length; i++) {
                var follower = this.followers[i];
                if (follower.character && follower.character.type === 'chef') {
                    chefCount++;
                }
            }

            if (chefCount > 0) {
                var foodProduction = chefCount * 5;
                this.gameData.food += foodProduction;
                this.gameData.totalFood += foodProduction;
                console.log('[Time] 厨师产粮:', foodProduction, '，当前食物:', this.gameData.food);
            }
        }
    }
};

GameEngine.prototype.startGame = function () {
    console.log('[GameEngine] 开始新游戏');
    this.initializeGame();
};

// 统一的游戏初始化方法 - 包含所有必要的资源加载和初始化逻辑
GameEngine.prototype.initializeGame = function () {
    console.log('[GameEngine] 开始初始化游戏...');

    // 重置游戏结束标志位
    this.isGameEnded = false;

    // 重置游戏状态
    this.gameState = 'playing';

    // 重置游戏数据
    this.gameData = {
        survivalDays: 1, food: 20, // 开局设置20个食物
        teamSize: 1, maxTeamSize: 1, zombieKills: 0, totalFood: 20, // 总食物也设置为20
        isDay: true, timeRemaining: zombieModule.GAME_CONFIG.TIME.DAY_DURATION, gameStartTime: Date.now()
    };

    // 重置玩家状态
    this.player = {
        x: 1000, // 左下角附近
        y: this.mapConfig.height - 1000,
        health: zombieModule.GAME_CONFIG.PLAYER.BASE_HEALTH,
        maxHealth: zombieModule.GAME_CONFIG.PLAYER.BASE_HEALTH,
        level: 1,
        attack: zombieModule.GAME_CONFIG.PLAYER.BASE_ATTACK,
        attackRange: zombieModule.GAME_CONFIG.PLAYER.BASE_ATTACK_RANGE,
        isDead: false
    };

    // 重置摄像机位置 - 应该跟随玩家
    this.camera = {
        x: this.player.x, y: this.player.y, followTarget: this.player, smoothing: 0.1, zoom: 0.8
    };

    console.log('[GameEngine] 玩家位置已设置:', this.player.x, this.player.y);
    console.log('[GameEngine] 摄像机位置已设置:', this.camera.x, this.camera.y);

    // 清理游戏对象
    this.cleanupGameObjects();

    // 重置建筑状态
    if (this.buildings && Array.isArray(this.buildings)) {
        for (var i = 0; i < this.buildings.length; i++) {
            this.buildings[i].explored = false;
        }
        console.log('[GameEngine] 建筑状态已重置，总数:', this.buildings.length);
    }

    // 重置其他游戏状态
    this.companions = [];
    this.exploredBuildings = [];
    this.nearBuilding = null;
    this.buildingEntryPrompt = null;

    // 清理僵尸管理器
    if (this.zombieManager) {
        this.zombieManager.zombies = [];
        console.log('[GameEngine] 僵尸管理器已清理');
    }

    // 清理房间内僵尸
    if (this.zombies) {
        this.zombies = [];
        console.log('[GameEngine] 房间内僵尸已清理');
    }

    // 清理跟随者
    if (this.followers) {
        this.followers = [];
        console.log('[GameEngine] 跟随者已清理');
    }

    // 清理NPC列表，准备重新生成
    if (this.npcs) {
        this.npcs = [];
        console.log('[GameEngine] NPC列表已清理');
    }

    // 重新初始化重要组件
    this.initializeFollowerPool();
    this.initializeResourcePool();
    console.log('[GameEngine] 对象池已重新初始化');

    // 修复视距裁剪系统
    this.fixViewportCullingSystem();

    // 重新生成僵尸（主地图）
    if (this.zombieManager) {
        this.zombieManager.generateZombiesForMap();
        console.log('[ZombieManager] 主地图僵尸已重新生成');
    }

    // 确保玩家实体被插入到四叉树中
    if (this.viewportCulling && this.viewportCulling.quadTree && this.player) {
        this.player.type = 'player';
        this.player.quadTreeInserted = true;
        this.player.lastQuadTreeX = this.player.x;
        this.player.lastQuadTreeY = this.player.y;
        this.viewportCulling.quadTree.insert(this.player);
        console.log('[GameEngine] 玩家实体已插入四叉树，位置:', this.player.x, this.player.y);
    } else {
        console.warn('[GameEngine] 无法插入玩家实体到四叉树:', {
            viewportCulling: !!this.viewportCulling,
            quadTree: !!this.viewportCulling?.quadTree,
            player: !!this.player,
            playerPosition: this.player ? {x: this.player.x, y: this.player.y} : null
        });
    }

    // 强制重新绑定触摸事件
    this.eventsBound = false;
        this.setupInput();
    console.log('[Input] 触摸事件已重新绑定');

    // 重置摇杆状态
    this.resetJoystick();
    console.log('[GameEngine] 摇杆状态已重置');

    // 重新开始游戏循环
    this.running = true;
    this.lastTime = Date.now();

    // 检查事件绑定状态
    this.checkEventBindingStatus();

    // 强制更新视距裁剪系统，确保玩家可见
    if (this.viewportCulling) {
        this.viewportCulling.quadTreeInitialized = false; // 强制重新初始化

        // 确保四叉树正确初始化
        if (this.viewportCulling.quadTree) {
            console.log('[GameEngine] 四叉树状态检查:', {
                exists: !!this.viewportCulling.quadTree,
                bounds: this.viewportCulling.quadTree.bounds,
                maxObjects: this.viewportCulling.quadTree.maxObjects,
                maxLevels: this.viewportCulling.quadTree.maxLevels
            });
        }

        this.updateViewportCulling();
        console.log('[GameEngine] 视距裁剪系统已强制更新');

        // 调试信息：检查四叉树状态
        if (this.viewportCulling.quadTree) {
            this.checkQuadTreeStatus();
        }
    }

    // 生成初始伙伴（开局时主人物身边生成8个伙伴）
    this.generateInitialPartners();
    console.log('[GameEngine] 初始伙伴已生成，NPC数量:', this.npcs.length);

    // 验证NPC列表状态
    if (this.npcs && this.npcs.length > 0) {
        console.log('[GameEngine] 第一个NPC信息:', {
            id: this.npcs[0].id,
            name: this.npcs[0].name,
            position: {x: this.npcs[0].x, y: this.npcs[0].y},
            type: this.npcs[0].type,
            isFollowing: this.npcs[0].isFollowing
        });
    } else {
        console.warn('[GameEngine] 警告：NPC列表为空！');

        // 尝试手动创建一个测试NPC
        console.log('[GameEngine] 尝试手动创建测试NPC...');
        try {
            var testNPC = {
                id: 'test_npc_1',
                name: '测试伙伴',
                x: this.player.x + 100,
                y: this.player.y + 100,
                type: 'npc',
                isFollowing: false,
                isJoined: false,
                quadTreeInserted: false,
                character: this.characterManager.characters[2],
                personality: this.getCharacterPersonality(this.characterManager.characters[2])
            };

            this.npcs.push(testNPC);
            console.log('[GameEngine] 手动创建测试NPC成功，当前NPC数量:', this.npcs.length);

            // 插入到视距裁剪系统
            if (this.viewportCulling && this.viewportCulling.quadTree) {
                this.viewportCulling.quadTree.insert(testNPC);
                testNPC.quadTreeInserted = true;
                console.log('[GameEngine] 测试NPC已插入视距裁剪系统');
            }

        } catch (error) {
            console.error('[GameEngine] 手动创建测试NPC失败:', error);
        }
    }

    console.log('[GameEngine] 游戏初始化完成！');
};

GameEngine.prototype.restartGame = function () {
    console.log('[GameEngine] 重新开始游戏');
    this.initializeGame();
};

GameEngine.prototype.gameOver = function (cause) {
    this.gameState = 'gameover';
    this.gameData.cause = cause;

    // 设置游戏结束标志位
    this.isGameEnded = true;

    // 清理游戏对象引用
    this.cleanupGameObjects();


    // 重新绑定触摸事件，确保游戏结束界面可以接收点击
    if (!this.eventsBound) {
        this.setupInput();
        console.log('[Input] 游戏结束时重新绑定触摸事件');
    }

    // 清理定时器和事件监听器
    this.cleanupTimersAndListeners();
};

GameEngine.prototype.gameWin = function () {
    this.gameState = 'victory';

    // 设置游戏结束标志位
    this.isGameEnded = true;

    // 清理游戏对象引用
    this.cleanupGameObjects();

    // 重新绑定触摸事件，确保胜利界面可以接收点击
    if (!this.eventsBound) {
        this.setupInput();
        console.log('[Input] 游戏胜利时重新绑定触摸事件');
    }
};

// 清理游戏对象引用，防止在游戏结束后继续访问已销毁的对象
GameEngine.prototype.cleanupGameObjects = function () {
    console.log('[GameEngine] 开始清理游戏对象...');

    try {
        // 清理所有僵尸的目标引用
        if (this.zombieManager && this.zombieManager.zombies) {
            this.zombieManager.zombies.forEach(function (zombie) {
                if (zombie) {
                    zombie.target = null;
                    zombie.state = 'wandering';
                    zombie.gameEngine = null; // 清理循环引用
                }
            });
        }

        // 清理房间内僵尸的目标引用
        if (this.zombies && Array.isArray(this.zombies)) {
            this.zombies.forEach(function (zombie) {
                if (zombie) {
                    zombie.target = null;
                    zombie.state = 'wandering';
                    zombie.gameEngine = null; // 清理循环引用
                }
            });
        }

        // 清理跟随者的目标引用
        if (this.followers && Array.isArray(this.followers)) {
            this.followers.forEach(function (follower) {
                if (follower) {
                    follower.target = null;
                    follower.gameEngine = null; // 清理循环引用
                    follower.lastX = null;
                    follower.lastY = null;
                    follower.lastEmergencyX = null;
                    follower.lastEmergencyY = null;
                }
            });
        }

        // 清理NPC引用
        if (this.npcs && Array.isArray(this.npcs)) {
            this.npcs.forEach(function (npc) {
                if (npc) {
                    npc.target = null;
                    npc.gameEngine = null; // 清理循环引用
                    npc.lastX = null;
                    npc.lastY = null;
                }
            });
        }

        // 清理视距裁剪系统引用
        if (this.viewportCulling) {
            this.viewportCulling.gameEngine = null;
            this.viewportCulling.visibleEntities = null;
        }

        // 🧪 测试代码 - 清理测试伙伴 - 后续删除
        this.cleanupTestPartnersDirectly();

        console.log('[GameEngine] 游戏对象清理完成');
    } catch (error) {
        console.error('[GameEngine] 清理游戏对象时出错:', error);
    }
};

// ========================================
// NPC和团队系统 (NPC & Team System)
// ========================================

GameEngine.prototype.initializeNPCs = function () {
    // 伙伴应该预先存在于地图中，在地图初始化时就创建
    for (var i = 0; i < 19; i++) {
        var characterId = i + 2;
        var npc = this.createNPC(characterId);
        this.npcs.push(npc);
    }

    console.log('[NPC] 伙伴系统初始化完成，在地图中创建了', this.npcs.length, '个伙伴');
};

GameEngine.prototype.createNPC = function (characterId) {
    // 伙伴应该预先存在于地图中，使用随机街道位置
    var position = this.getRandomStreetPosition();
    var character = this.characterManager.characters[characterId] || this.characterManager.characters[2];
    var personality = this.getCharacterPersonality(character);

    var npc = {
        id: characterId,
        characterId: characterId,
        x: position.x,
        y: position.y,
        isFollowing: false,
        character: character,
        personality: personality,
        lastX: position.x,
        lastY: position.y,
        isWalking: false,
        walkAnimationFrame: 0,
        lastAnimationTime: 0,
        direction: 'down',
        followStartTime: 0,
        lastFollowUpdate: 0,
        behaviorTimer: Math.random() * 1000,
        currentBehavior: 'idle',
        type: 'npc' // 添加类型标识
    };

    return npc;
};

GameEngine.prototype.getRandomStreetPosition = function () {
    var blockSize = this.mapConfig.blockSize;
    var streetWidth = this.mapConfig.streetWidth;
    var mapWidth = this.mapConfig.width;
    var mapHeight = this.mapConfig.height;

    var maxAttempts = 50;
    var attempts = 0;

    while (attempts < maxAttempts) {
        attempts++;

        if (Math.random() < 0.5) {
            var blockY = Math.floor(Math.random() * Math.floor(mapHeight / blockSize));
            var streetY = blockY * blockSize + streetWidth / 2;
            var x = Math.random() * (mapWidth - 200) + 100;

            // 检查位置是否安全（不在建筑物上）
            if (this.canMoveToPosition(x, streetY, 25)) {
                return {x: x, y: streetY};
            }
        } else {
            var blockX = Math.floor(Math.random() * Math.floor(mapWidth / blockSize));
            var streetX = blockX * blockSize + streetWidth / 2;
            var y = Math.random() * (mapHeight - 200) + 100;

            // 检查位置是否安全（不在建筑物上）
            if (this.canMoveToPosition(streetX, y, 25)) {
                return {x: streetX, y: y};
            }
        }
    }

    // 如果找不到安全位置，返回地图边缘的安全位置
    return this.getSafeEdgePosition();
};

GameEngine.prototype.getSafeEdgePosition = function () {
    var mapWidth = this.mapConfig.width;
    var mapHeight = this.mapConfig.height;
    var edgePositions = [{x: 200, y: 200}, // 左上角
        {x: mapWidth - 200, y: 200}, // 右上角
        {x: 200, y: mapHeight - 200}, // 左下角
        {x: mapWidth - 200, y: mapHeight - 200} // 右下角
    ];

    // 随机选择一个边缘位置
    var randomIndex = Math.floor(Math.random() * edgePositions.length);
    return edgePositions[randomIndex];
};

GameEngine.prototype.getSafeFollowerPosition = function () {
    var maxAttempts = 30;
    var attempts = 0;

    while (attempts < maxAttempts) {
        attempts++;

        // 在玩家周围生成随机位置
        var angle = Math.random() * Math.PI * 2;
        var distance = 30 + Math.random() * 50; // 30-80像素距离

        var x = this.player.x + Math.cos(angle) * distance;
        var y = this.player.y + Math.sin(angle) * distance;

        // 确保在地图边界内
        x = Math.max(100, Math.min(this.mapConfig.width - 100, x));
        y = Math.max(100, Math.min(this.mapConfig.height - 100, y));

        // 检查位置是否安全（不在建筑物上）
        if (this.canMoveToPosition(x, y, 20)) {
            return {x: x, y: y};
        }
    }

    // 如果找不到安全位置，返回玩家位置附近的安全位置
    return {x: this.player.x + 50, y: this.player.y + 50};
};

GameEngine.prototype.updateNPCs = function (deltaTime) {
    // 批量更新优化：减少更新频率，批量处理
    if (!this.npcUpdateTimer) this.npcUpdateTimer = 0;
    this.npcUpdateTimer += deltaTime;

    if (this.npcUpdateTimer < 150) return; // 降低更新频率到150ms
    this.npcUpdateTimer = 0;

    // 使用缓存的视口信息
    if (!this.cachedUpdateViewport || this.cachedUpdateViewport.frame !== this.frameCount) {
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x - 100;
    var viewRight = this.camera.x + viewWidth + 100;
    var viewTop = this.camera.y - 100;
    var viewBottom = this.camera.y + viewHeight + 100;

        this.cachedUpdateViewport = {
            frame: this.frameCount, left: viewLeft, right: viewRight, top: viewTop, bottom: viewBottom
        };
    }

    var viewport = this.cachedUpdateViewport;
    var npcsToUpdate = 0;
    var batchSize = 5; // 每帧最多更新5个NPC

    // 批量更新：只更新视口内的NPC，限制每帧更新数量
    for (var i = 0; i < this.npcs.length && npcsToUpdate < batchSize; i++) {
        var npc = this.npcs[i];

        // 跳过已加入团队的NPC
        if (npc.isFollowing || npc.isJoined) {
            continue;
        }

        if (npc.x >= viewport.left && npc.x <= viewport.right && npc.y >= viewport.top && npc.y <= viewport.bottom) {
            // 只更新动画，不处理碰撞
            this.updateSingleNPCAnimation(npc, deltaTime);
            npcsToUpdate++;
        }
    }

    // 性能监控
    if (this.frameCount % 120 === 0) {
        this.npcUpdateStats = {
            total: this.npcs.length,
            updated: npcsToUpdate,
            efficiency: (npcsToUpdate / this.npcs.length * 100).toFixed(1)
        };
    }
};

GameEngine.prototype.updateSingleNPCAnimation = function (npc, deltaTime) {
    // 只更新NPC动画，不处理碰撞逻辑
    if (npc.isFollowing || npc.isDead) return;

    // 简单的动画更新
    if (npc.character && npc.character.animations) {
        // 更新行走动画
        if (npc.isWalking && npc.character.animations.walk) {
            if (!npc.lastAnimationTime) npc.lastAnimationTime = 0;
            npc.lastAnimationTime += deltaTime;

            if (npc.lastAnimationTime >= 150) { // 150ms切换一帧
                npc.walkAnimationFrame = (npc.walkAnimationFrame + 1) % npc.character.animations.walk.length;
                npc.lastAnimationTime = 0;
            }
        }
    }
};


GameEngine.prototype.moveTeam = function (deltaX, deltaY) {
    // 只有在摇杆激活时才移动团队
    if (!this.joystick.active) {
        return;
    }

    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        this.moveSingleFollower(follower, deltaX, deltaY);
    }
};


// 计算玩家移动速度
GameEngine.prototype.calculatePlayerSpeed = function () {
    if (!this.player || !this.player.lastX || !this.player.lastY) {
        return 0;
    }

    var dx = this.player.x - this.player.lastX;
    var dy = this.player.y - this.player.lastY;
    var speed = Math.sqrt(dx * dx + dy * dy);

    // 更新上次位置
    this.player.lastX = this.player.x;
    this.player.lastY = this.player.y;

    return speed;
};

// 统计附近跟随者数量
GameEngine.prototype.countNearbyFollowers = function (follower, radius) {
    var count = 0;

    for (var i = 0; i < this.followers.length; i++) {
        var other = this.followers[i];
        if (other !== follower) {
            var dx = follower.x - other.x;
            var dy = follower.y - other.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= radius) {
                count++;
            }
        }
    }

    return count;
};


GameEngine.prototype.getCharacterPersonality = function (character) {
    var characterId = character.id || 2;
    var seed = characterId * 12345;
    var random = this.seededRandom(seed);

    return {
        followDistance: 25 + (random() * 15 - 7), // 减少跟随距离，让跟随者更靠近
        moveSpeed: 1.0, // 固定为1.0，与主人物保持一致
        randomness: random() * 0.05, // 进一步减少随机性，避免抽搐
        reactionDelay: random() * 20, // 大幅减少反应延迟，提高响应性
        personalityType: this.getPersonalityType(characterId)
    };
};


GameEngine.prototype.getPersonalityType = function (characterId) {
    var types = ['leader', 'supporter', 'scout', 'guardian', 'independent'];
    return types[characterId % types.length];
};

GameEngine.prototype.updateFollowerAnimation = function (follower, personality) {
    var deltaX = follower.x - (follower.lastX || follower.x);
    var deltaY = follower.y - (follower.lastY || follower.y);

    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        follower.isWalking = true;
        follower.direction = this.getDirectionFromDelta(deltaX, deltaY);

        if (!follower.lastAnimationTime) follower.lastAnimationTime = 0;
        follower.lastAnimationTime += 16;

        var animationSpeed = personality.moveSpeed * 200;
        if (follower.lastAnimationTime >= animationSpeed) {
            follower.walkAnimationFrame = (follower.walkAnimationFrame || 0) + 1;
            if (follower.walkAnimationFrame >= 4) follower.walkAnimationFrame = 0;
            follower.lastAnimationTime = 0;
        }
    } else {
        follower.isWalking = false;
    }

    follower.lastX = follower.x;
    follower.lastY = follower.y;
};

GameEngine.prototype.getDirectionFromDelta = function (deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
    } else {
        return deltaY > 0 ? 'down' : 'up';
    }
};

GameEngine.prototype.seededRandom = function (seed) {
    var m = 0x80000000;
    var a = 1103515245;
    var c = 12345;
    var state = seed ? seed : Math.floor(Math.random() * (m - 1));

    return function () {
        state = (a * state + c) % m;
        return (state & (m - 1)) / (m - 1);
    };
};

GameEngine.prototype.canTeamMoveInSubmap = function (deltaX, deltaY) {
    var submapBounds = {minX: 60, maxX: 340, minY: 110, maxY: 290};

    var playerNewX = this.player.x + deltaX;
    var playerNewY = this.player.y + deltaY;
    if (playerNewX < submapBounds.minX || playerNewX > submapBounds.maxX || playerNewY < submapBounds.minY || playerNewY > submapBounds.maxY) {
        return false;
    }

    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        var followerNewX = follower.x + deltaX;
        var followerNewY = follower.y + deltaY;

        if (followerNewX < submapBounds.minX || followerNewX > submapBounds.maxX || followerNewY < submapBounds.minY || followerNewY > submapBounds.maxY) {
            return false;
        }
    }

    return true;
};


// 在玩家附近寻找安全位置
GameEngine.prototype.findSafePositionNearPlayer = function (follower) {
    try {
        var playerRadius = 60;
        var angleStep = Math.PI / 8;

        for (var angle = 0; angle < Math.PI * 2; angle += angleStep) {
            var testX = this.player.x + Math.cos(angle) * playerRadius;
            var testY = this.player.y + Math.sin(angle) * playerRadius;

            // 确保在边界内
            testX = Math.max(50, Math.min(this.mapConfig.width - 50, testX));
            testY = Math.max(50, Math.min(this.mapConfig.height - 50, testY));

            if (this.canMoveToPosition(testX, testY, 15)) {
                return {x: testX, y: testY};
            }
        }

        // 如果找不到安全位置，返回null
        return null;

    } catch (error) {
        console.error('[SafePosition] 寻找安全位置时出错:', error);
        return null;
    }
};

// 强制恢复卡死的跟随者
GameEngine.prototype.forceRecoverFollower = function (follower) {
    console.log('[Emergency] 强制恢复跟随者', follower.id);

    // 重置所有状态
    follower.isUnstucking = false;
    follower.unstuckTargetX = null;
    follower.unstuckTargetY = null;
    follower.unstuckStartTime = null;
    follower.isJoined = false; // 重置加入状态

    // 传送到玩家附近的安全位置
    var safePosition = this.findSafePositionNearPlayer(follower);
    if (safePosition) {
        follower.x = safePosition.x;
        follower.y = safePosition.y;
        follower.isWalking = false;
        console.log('[Emergency] 跟随者', follower.id, '已传送到安全位置:', safePosition.x, safePosition.y);
    } else {
        // 如果找不到安全位置，传送到玩家位置
        follower.x = this.player.x + (Math.random() - 0.5) * 30;
        follower.y = this.player.y + (Math.random() - 0.5) * 30;
        console.log('[Emergency] 跟随者', follower.id, '已传送到玩家附近');
    }

    // 重置位置记录
    follower.lastX = follower.x;
    follower.lastY = follower.y;
    follower.lastEmergencyX = follower.x;
    follower.lastEmergencyY = follower.y;
};

// 紧急停止检查：防止游戏卡死
GameEngine.prototype.checkEmergencyStop = function () {
    if (!this.lastEmergencyCheck) this.lastEmergencyCheck = Date.now();
    var timeSinceLastCheck = Date.now() - this.lastEmergencyCheck;

    // 每10秒检查一次
    if (timeSinceLastCheck > 10000) {
        // 检查是否有异常情况
        var hasStuckFollowers = false;
        var hasInvalidNPCs = false;

        // 检查跟随者状态
        for (var i = 0; i < this.followers.length; i++) {
            var follower = this.followers[i];
            if (follower.isUnstucking && follower.unstuckStartTime) {
                var unstuckTime = Date.now() - follower.unstuckStartTime;
                if (unstuckTime > 10000) { // 脱困超过10秒
                    hasStuckFollowers = true;
                    console.log('[Emergency] 跟随者', follower.id, '脱困超时，强制恢复');
                    this.forceRecoverFollower(follower);
                }
            }
        }

        // 检查NPC状态
        for (var i = 0; i < this.npcs.length; i++) {
            var npc = this.npcs[i];
            if (npc.isFollowing || npc.isJoined) {
                hasInvalidNPCs = true;
                console.log('[Emergency] 发现已加入团队的NPC，清理:', npc.id);
                this.npcs.splice(i, 1);
                i--; // 调整索引
            }
        }

        if (hasStuckFollowers || hasInvalidNPCs) {
            console.log('[Emergency] 检测到异常状态，已清理');
        }

        this.lastEmergencyCheck = Date.now();
    }
};


/**
 * 帮助被卡住的跟随者脱困（改进版）
 */
GameEngine.prototype.helpFollowerUnstuck = function (follower) {
    // 设置脱困状态，避免重复触发
    if (follower.isUnstucking) return;
    follower.isUnstucking = true;

    console.log('[Follower] 跟随者', follower.id, '开始脱困，当前位置:', follower.x, follower.y);

    // 首先尝试在玩家附近寻找安全位置
    var playerRadius = 60; // 减少搜索半径，更安全
    var angleStep = Math.PI / 8; // 增加搜索精度

    for (var angle = 0; angle < Math.PI * 2; angle += angleStep) {
        var testX = this.player.x + Math.cos(angle) * playerRadius;
        var testY = this.player.y + Math.sin(angle) * playerRadius;

        // 确保在边界内
        testX = Math.max(50, Math.min(this.mapConfig.width - 50, testX));
        testY = Math.max(50, Math.min(this.mapConfig.height - 50, testY));

        if (this.canMoveToPosition(testX, testY, 15)) {
            // 找到安全位置，设置脱困目标
            follower.unstuckTargetX = testX;
            follower.unstuckTargetY = testY;
            follower.unstuckStartTime = Date.now();
            console.log('[Follower] 跟随者', follower.id, '脱困目标位置:', testX, testY);
            return;
        }
    }

    // 如果找不到安全位置，尝试更近的位置
    var closerRadius = 40;
    for (var angle = 0; angle < Math.PI * 2; angle += angleStep) {
        var testX = this.player.x + Math.cos(angle) * closerRadius;
        var testY = this.player.y + Math.sin(angle) * closerRadius;

    // 确保在边界内
        testX = Math.max(50, Math.min(this.mapConfig.width - 50, testX));
        testY = Math.max(50, Math.min(this.mapConfig.height - 50, testY));

        if (this.canMoveToPosition(testX, testY, 15)) {
            follower.unstuckTargetX = testX;
            follower.unstuckTargetY = testY;
    follower.unstuckStartTime = Date.now();
            console.log('[Follower] 跟随者', follower.id, '脱困目标位置（近距离）:', testX, testY);
        return;
    }
    }

    // 最后尝试直接传送到玩家位置附近
    var emergencyX = this.player.x + (Math.random() - 0.5) * 20;
    var emergencyY = this.player.y + (Math.random() - 0.5) * 20;

    // 确保在边界内
    emergencyX = Math.max(50, Math.min(this.mapConfig.width - 50, emergencyX));
    emergencyY = Math.max(50, Math.min(this.mapConfig.height - 50, emergencyY));

    follower.unstuckTargetX = emergencyX;
    follower.unstuckTargetY = emergencyY;
    follower.unstuckStartTime = Date.now();
    console.log('[Follower] 跟随者', follower.id, '紧急脱困位置:', emergencyX, emergencyY);
};

/**
 * 更平滑的缓动函数：避免抽搐
 */
GameEngine.prototype.easeInOutCubic = function (t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};


GameEngine.prototype.executeWanderBehavior = function (npc) {
    if (!npc.wanderTarget) {
        var wanderRadius = 50 + Math.random() * 100;
        var angle = Math.random() * Math.PI * 2;
        npc.wanderTarget = {
            x: npc.x + Math.cos(angle) * wanderRadius, y: npc.y + Math.sin(angle) * wanderRadius
        };
    }

    var dx = npc.wanderTarget.x - npc.x;
    var dy = npc.wanderTarget.y - npc.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
        var moveSpeed = (npc.personality ? npc.personality.moveSpeed : 1) * 0.5;
        npc.x += (dx / distance) * moveSpeed;
        npc.y += (dy / distance) * moveSpeed;

        npc.isWalking = true;
        npc.direction = this.getDirectionFromDelta(dx, dy);
    } else {
        npc.wanderTarget = null;
        npc.isWalking = false;
    }
};

GameEngine.prototype.executeLookAroundBehavior = function (npc) {
    if (!npc.lookAroundTimer) {
        npc.lookAroundTimer = 0;
        npc.lookAroundDirection = 0;
    }

    npc.lookAroundTimer += 16;
    if (npc.lookAroundTimer > 500) {
        npc.lookAroundDirection = (npc.lookAroundDirection + 1) % 4;
        npc.lookAroundTimer = 0;

        var directions = ['up', 'right', 'down', 'left'];
        npc.direction = directions[npc.lookAroundDirection];
    }
};

GameEngine.prototype.executeStretchBehavior = function (npc) {
    if (!npc.stretchTimer) {
        npc.stretchTimer = 0;
        npc.stretchPhase = 0;
    }

    npc.stretchTimer += 16;
    if (npc.stretchTimer > 200) {
        npc.stretchTimer = 0;
        npc.stretchPhase = (npc.stretchPhase + 1) % 4;

        var stretchOffset = Math.sin(npc.stretchPhase * Math.PI / 2) * 2;
        npc.y += stretchOffset;
    }
};

GameEngine.prototype.executeCheckEquipmentBehavior = function (npc) {
    if (!npc.checkEquipmentTimer) {
        npc.checkEquipmentTimer = 0;
    }

    npc.checkEquipmentTimer += 16;
    if (npc.checkEquipmentTimer > 300) {
        npc.checkEquipmentTimer = 0;

        var directions = ['up', 'right', 'down', 'left'];
        npc.direction = directions[Math.floor(Math.random() * directions.length)];
    }
};

// ========================================
// 战斗系统 (Combat System)
// ========================================

GameEngine.prototype.updateCombat = function (deltaTime) {
    var currentTime = Date.now();

    if (!this.player.isDead && !this.player.isZombie && currentTime - this.player.lastAttackTime >= this.player.attackCooldown) {

        var nearbyZombies = [];

        // 根据游戏状态选择僵尸源
        if (this.gameState === 'submap') {
            // 房间内：检查房间的僵尸数组
            nearbyZombies = this.getZombiesInRangeFromArray(this.zombies, this.player.x, this.player.y, this.player.attackRange);
        } else {
            // 主地图：使用ZombieManager
            nearbyZombies = this.zombieManager.getZombiesInRange(this.player.x, this.player.y, this.player.attackRange);
        }

        if (nearbyZombies.length > 0) {
            var targetZombie = nearbyZombies[0].zombie;
            this.attackZombie(this.player, targetZombie);
            this.player.lastAttackTime = currentTime;
        }
    }

    if (!this.teamCombatTimer) this.teamCombatTimer = 0;
    this.teamCombatTimer += deltaTime;

    if (this.teamCombatTimer >= 500) {
        this.teamCombatTimer = 0;
        this.updateTeamCombat(currentTime);
    }
};

GameEngine.prototype.updateTeamCombat = function (currentTime) {
    var maxCombatMembers = Math.min(3, this.followers.length);

    for (var i = 0; i < maxCombatMembers; i++) {
        var follower = this.followers[i];

        if (!follower.attack) {
            follower.attack = 10;
            follower.attackRange = 30;
            follower.lastAttackTime = 0;
            follower.attackCooldown = 1200;
            follower.health = follower.health || 30;
            follower.maxHealth = follower.maxHealth || 30;
            follower.isDead = false;
            follower.isZombie = false;
        }

        if (!follower.isDead && !follower.isZombie && currentTime - follower.lastAttackTime >= follower.attackCooldown) {

            var nearbyZombies = [];

            // 根据游戏状态选择僵尸源
            if (this.gameState === 'submap') {
                // 房间内：检查房间的僵尸数组
                nearbyZombies = this.getZombiesInRangeFromArray(this.zombies, follower.x, follower.y, follower.attackRange);
            } else {
                // 主地图：使用ZombieManager
                nearbyZombies = this.zombieManager.getZombiesInRange(follower.x, follower.y, follower.attackRange);
            }

            if (nearbyZombies.length > 0) {
                var targetZombie = nearbyZombies[0].zombie;
                this.attackZombie(follower, targetZombie);
                follower.lastAttackTime = currentTime;
            }
        }
    }
};

GameEngine.prototype.attackZombie = function (attacker, zombie) {
    var damage = attacker.attack + Math.floor(Math.random() * 5);
    var isDead = zombie.takeDamage(damage);
};

// 从指定数组中获取范围内的僵尸（用于房间内战斗）
GameEngine.prototype.getZombiesInRangeFromArray = function (zombieArray, x, y, range) {
    if (!zombieArray || !Array.isArray(zombieArray)) {
        return [];
    }

    var zombiesInRange = [];

    for (var i = 0; i < zombieArray.length; i++) {
        var zombie = zombieArray[i];

        if (!zombie || zombie.health <= 0) {
            continue;
        }

        var distance = Math.sqrt(Math.pow(zombie.x - x, 2) + Math.pow(zombie.y - y, 2));

        if (distance <= range) {
            zombiesInRange.push({zombie: zombie, distance: distance});
        }
    }

    // 按距离排序，最近的在前
    zombiesInRange.sort(function (a, b) {
        return a.distance - b.distance;
    });

    return zombiesInRange;
};

GameEngine.prototype.updateTeamHealth = function (deltaTime) {
    if (this.player.health <= 0 && !this.player.isDead) {
        this.player.isDead = true;
        this.gameOver('death');
        return;
    }

    for (var i = this.followers.length - 1; i >= 0; i--) {
        var follower = this.followers[i];

        if (follower.health <= 0 && !follower.isDead) {
            this.convertToZombie(follower, i);
        }
    }
};

GameEngine.prototype.convertToZombie = function (follower, index) {
    // 检查参数有效性
    if (!follower) {
        console.warn('[ConvertToZombie] 跟随者对象无效:', follower);
        return;
    }

    // 如果提供了index，验证其有效性；否则自动查找
    if (typeof index === 'number' && index >= 0 && index < this.followers.length) {
        // 验证提供的index是否对应正确的跟随者
        if (this.followers[index] !== follower) {
            console.warn('[ConvertToZombie] 提供的索引与跟随者不匹配，自动查找正确索引');
            index = this.getFollowerIndex(follower);
        }
    } else {
        // 自动查找索引
        index = this.getFollowerIndex(follower);
    }

    // 检查是否找到有效索引
    if (index === -1) {
        console.error('[ConvertToZombie] 无法找到跟随者索引，跳过转换');
        return;
    }

    // 从视距裁剪系统中移除死亡的跟随者（使用标记法）
    if (this.viewportCulling && follower) {
        follower.isDead = true; // 标记为死亡，渲染时会跳过
        follower.quadTreeInserted = false; // 重置插入标记
    }

    // 创建转换后的僵尸，优先使用对象池
    var newZombie = this.zombieManager.createZombie('thin', follower.x, follower.y);
    if (newZombie) {
        newZombie.isConverted = true;
        newZombie.originalName = follower.character ? follower.character.name : '团队成员';

        // 将新僵尸插入视距裁剪系统
        if (this.viewportCulling && this.viewportCulling.quadTree) {
            newZombie.quadTreeInserted = true;
            this.viewportCulling.quadTree.insert(newZombie);
        }

        console.log('[ConvertToZombie] 跟随者成功转换为僵尸，位置:', follower.x, follower.y);
    } else {
        console.error('[ConvertToZombie] 僵尸创建失败');
    }

    // 使用安全移除方法
    if (this.safeRemoveFollower(follower)) {
        console.log('[ConvertToZombie] 跟随者转换完成');
    } else {
        console.error('[ConvertToZombie] 跟随者移除失败');
    }
};

// ========================================
// 僵尸生成系统 (Zombie Spawning System)
// ========================================

GameEngine.prototype.initializeZombies = function () {
    this.spawnZombiesByDay();
};

GameEngine.prototype.spawnZombiesByDay = function () {
    var currentDay = this.gameData.survivalDays;

    // 游戏平衡优化：动态难度系统
            var baseCount = zombieModule.GAME_CONFIG.ZOMBIE_SPAWN.BASE_COUNT;
        var perDayIncrease = zombieModule.GAME_CONFIG.ZOMBIE_SPAWN.PER_DAY_INCREASE;
        var maxZombies = zombieModule.GAME_CONFIG.ZOMBIE_SPAWN.MAX_ZOMBIES;

    // 根据团队规模调整僵尸数量
    var teamSizeMultiplier = Math.max(0.5, Math.min(2.0, this.gameData.teamSize / 5));
    var zombieCount = Math.min(maxZombies, Math.floor((baseCount + (currentDay - 1) * perDayIncrease) * teamSizeMultiplier));

    var playerX = this.player.x;
    var playerY = this.player.y;
            var spawnRadius = zombieModule.GAME_CONFIG.ZOMBIE_SPAWN.SPAWN_RADIUS;
        var minDistance = zombieModule.GAME_CONFIG.ZOMBIE_SPAWN.MIN_DISTANCE;

    var created = 0;
            var maxAttempts = zombieCount * zombieModule.GAME_CONFIG.ZOMBIE_SPAWN.MAX_ATTEMPTS_MULTIPLIER;
    var attempts = 0;

    while (created < zombieCount && attempts < maxAttempts) {
        attempts++;

        var angle = Math.random() * Math.PI * 2;
        var distance = minDistance + Math.random() * (spawnRadius - minDistance);

        var x = playerX + Math.cos(angle) * distance;
        var y = playerY + Math.sin(angle) * distance;

        x = Math.max(100, Math.min(this.mapConfig.width - 100, x));
        y = Math.max(100, Math.min(this.mapConfig.height - 100, y));

        if (this.canMoveToPosition(x, y, 25)) {
            var zombieType = this.getRandomZombieType(currentDay);
            var zombie = this.zombieManager.createZombie(zombieType, x, y);
            if (zombie) {
                created++;
            }
        }
    }


};

GameEngine.prototype.getRandomZombieType = function (day) {
    var random = Math.random();
    var thinChance = Math.max(0.3, 0.7 - day * 0.02);
    var fatChance = Math.min(0.5, 0.25 + day * 0.015);

    if (random < thinChance) {
        return 'thin';
    } else if (random < thinChance + fatChance) {
        return 'fat';
    } else {
        return 'boss1';
    }
};

GameEngine.prototype.spawnNewDayZombies = function () {
    var currentDay = this.gameData.survivalDays;
    var newZombieCount = 5;

    if (currentDay >= 5 && currentDay % 5 === 0) {
        newZombieCount = 10;
    }

    // 更新所有僵尸的移动速度（基于新的生存天数）
    this.zombieManager.updateAllZombieSpeeds(currentDay);

    var playerX = this.player.x;
    var playerY = this.player.y;
    var spawnRadius = 2000;
    var minDistance = 400;

    var created = 0;
    var maxAttempts = newZombieCount * 15;
    var attempts = 0;


    while (created < newZombieCount && attempts < maxAttempts) {
        attempts++;

        var angle = Math.random() * Math.PI * 2;
        var distance = minDistance + Math.random() * (spawnRadius - minDistance);

        var x = playerX + Math.cos(angle) * distance;
        var y = playerY + Math.sin(angle) * distance;

        x = Math.max(100, Math.min(this.mapConfig.width - 100, x));
        y = Math.max(100, Math.min(this.mapConfig.height - 100, y));

        if (this.canMoveToPosition(x, y, 25)) {
            var zombieType = this.getRandomZombieType(currentDay);
            var zombie = this.zombieManager.createZombie(zombieType, x, y);
            if (zombie) {
                created++;
            }
        }
    }

};

// ========================================
// 子地图和资源系统 (SubMap & Resource System)
// ========================================

GameEngine.prototype.generateSubMapContent = function () {
    this.zombies = [];
    this.resources = [];

    this.generateZombies();
    this.generateResources();

};

GameEngine.prototype.generateZombies = function () {
    var buildingType = this.currentBuilding ? this.currentBuilding.type : 'house';
    var count = 5; // 每个房间最少5只僵尸

    // 根据建筑类型增加额外僵尸数量
    switch (buildingType) {
        case 'police_station':
        case 'hospital':
            count += 2; // 警察局和医院额外2只
            break;
        case 'mall':
        case 'factory':
            count += 3; // 商场和工厂额外3只
            break;
        case 'school':
            count += 1; // 学校额外1只
            break;
        default:
            // 民房和别墅保持基础数量5只
            break;
    }

    // 使用主地图的僵尸系统生成僵尸
    for (var i = 0; i < count; i++) {
        // 随机选择僵尸类型
        var zombieTypes = ['thin', 'fat', 'boss1'];
        var randomType = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];

        // 随机位置
        var x = 80 + Math.random() * 240;
        var y = 120 + Math.random() * 160;

        // 使用ZombieManager创建僵尸实例
        var zombie = this.zombieManager.createZombie(randomType, x, y);

        if (zombie) {
            // 设置房间内僵尸的初始状态
            zombie.state = 'wandering';
            zombie.target = null;
            zombie.lastAttackTime = 0;

            // 将僵尸添加到房间的僵尸数组
        this.zombies.push(zombie);
        }
    }
};

GameEngine.prototype.generateResources = function () {
    var resourceChance = this.getResourceChance();

    if (Math.random() < resourceChance) {
        var resourceType = this.getResourceType();
        var resource = this.createResource(resourceType);

        if (resource) {
            this.resources.push(resource);
        }
    }
};

GameEngine.prototype.getResourceChance = function () {
    switch (this.subMapType) {
        case 'police_station':
        case 'hospital':
        case 'restaurant':
            return 0.8;
        case 'shop':
            return 0.6;
        case 'school':
        case 'house':
        case 'villa':
            return 0.7;
        default:
            return 0.3;
    }
};

GameEngine.prototype.getResourceType = function () {
    switch (this.subMapType) {
        case 'shop':
            return 'weapon';
        case 'school':
        case 'house':
        case 'villa':
            return 'food';
        default:
            return 'food';
    }
};

GameEngine.prototype.createResource = function (type) {
    // 尝试从对象池获取资源对象
    var resource = this.getResourceFromPool(type);

    if (!resource) {
        // 如果对象池为空，创建新的资源对象
        resource = {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            x: 150 + Math.random() * 100,
            y: 150 + Math.random() * 80,
            collected: false
        };
    } else {
        // 使用对象池中的资源对象，更新其属性
        resource.id = Math.random().toString(36).substr(2, 9);
        resource.type = type;
        resource.x = 150 + Math.random() * 100;
        resource.y = 150 + Math.random() * 80;
        resource.collected = false;
    }

    switch (type) {
        case 'food':
            resource.amount = this.getFoodAmount();
            break;
        case 'weapon':
            resource.weaponData = {name: '近战武器', damage: 10};
            break;
    }

    return resource;
};

GameEngine.prototype.getFoodAmount = function () {
    switch (this.subMapType) {
        case 'school':
            return 3 + Math.floor(Math.random() * 3);
        case 'house':
            return 2 + Math.floor(Math.random() * 2);
        case 'villa':
            return 4 + Math.floor(Math.random() * 3);
        default:
            return 2 + Math.floor(Math.random() * 3);
    }
};

GameEngine.prototype.collectResource = function (resource) {
    if (resource.collected) return;

    resource.collected = true;

    switch (resource.type) {

        case 'food':
            this.gameData.food += resource.amount;
            this.gameData.totalFood += resource.amount;
            break;
        case 'weapon':
            this.player.attack = (this.player.attack || 20) + resource.weaponData.damage;
            break;
    }

    // 资源收集完成后，回收到对象池以重用
    this.recycleResourceToPool(resource);
};

GameEngine.prototype.updateZombies = function (deltaTime) {
    var self = this;

    // 检查游戏是否已经结束
    if (this.isGameEnded || this.gameState === 'gameover' || this.gameState === 'menu' || this.gameState === 'victory') {
        return;
    }

    // 使用主地图僵尸的完整AI系统更新房间内僵尸
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];

        // 强化僵尸有效性检查
        if (!zombie || typeof zombie !== 'object' || zombie.health <= 0 || zombie.isDead) {
            continue;
        }

        // 额外检查：如果游戏已经结束，僵尸应该停止所有活动
        if (this.isGameEnded || this.gameState === 'gameover' || this.gameState === 'victory') {
            // 强制僵尸回到游荡状态
            if (zombie.state !== 'wandering') {
                zombie.state = 'wandering';
                zombie.target = null;
            }
            continue;
        }

        // 使用僵尸的完整AI系统进行更新，添加错误处理
        try {
            if (zombie.update && typeof zombie.update === 'function') {
                zombie.update(deltaTime, this);
            }
        } catch (error) {
            console.error('[GameEngine] 僵尸更新出错:', error, '僵尸:', zombie);
            // 如果僵尸更新出错，将其标记为死亡以避免继续出错
            zombie.health = 0;
            zombie.isDead = true;
        }
    }

    // 清理死亡僵尸
    for (var i = this.zombies.length - 1; i >= 0; i--) {
        if (this.zombies[i].health <= 0) {
            this.zombies.splice(i, 1);
        }
    }
};


// ========================================
// 渲染系统 (Rendering System)
// ========================================

GameEngine.prototype.render = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    switch (this.gameState) {
        case 'menu':
            this.renderMenu();
            break;
        case 'playing':
            this.renderGame();
            break;
        case 'submap':
            this.renderSubMap();
            break;
        case 'gameover':
            this.renderGameOver();
            break;
        case 'victory':
            this.renderVictory();
            break;
    }

    if (this.gameState === 'playing' || this.gameState === 'submap') {
        this.renderJoystick();
    }

    if (this.showFPS) {
        this.renderFPS();
    }
};

// 菜单渲染
GameEngine.prototype.renderMenu = function () {
    var centerX = this.canvas.width / 2;

    var gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderBackgroundGrid();
    this.renderDecorations();

    this.ctx.save();
    this.ctx.shadowColor = 'rgba(255, 87, 51, 0.8)';
    this.ctx.shadowBlur = 20;
    this.ctx.fillStyle = '#ff5733';
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('末日Q行', centerX, 120);

    this.ctx.strokeStyle = '#ff5733';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 100, 140);
    this.ctx.lineTo(centerX + 100, 140);
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.fillStyle = '#e8e8e8';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('生存至100天的挑战', centerX, 170);

    this.renderGameFeatures(centerX);
    this.renderStartButton(centerX);
    this.renderFooterInfo(centerX);

    this.ctx.textAlign = 'left';
};

GameEngine.prototype.renderBackgroundGrid = function () {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;

    var gridSize = 40;

    for (var x = 0; x < this.canvas.width; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    }

    for (var y = 0; y < this.canvas.height; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
    }

    this.ctx.restore();
};

GameEngine.prototype.renderDecorations = function () {
    this.ctx.save();
    this.ctx.fillStyle = '#8b0000';
    this.ctx.beginPath();
    this.ctx.arc(50, 50, 15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(48, 48, 3, 0, Math.PI * 2);
    this.ctx.arc(52, 48, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.save();
    this.ctx.strokeStyle = '#ff5733';
    this.ctx.fillStyle = '#ff5733';
    this.ctx.lineWidth = 3;

    var warningX = this.canvas.width - 50;
    var warningY = 50;

    this.ctx.beginPath();
    this.ctx.moveTo(warningX, warningY - 15);
    this.ctx.lineTo(warningX - 13, warningY + 15);
    this.ctx.lineTo(warningX + 13, warningY + 15);
    this.ctx.closePath();
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('!', warningX, warningY + 5);
    this.ctx.restore();

    var decorY = this.canvas.height - 60;
    this.ctx.fillStyle = 'rgba(255, 87, 51, 0.2)';
    this.ctx.fillRect(0, decorY, this.canvas.width, 4);

    this.ctx.fillStyle = 'rgba(255, 87, 51, 0.4)';
    this.ctx.fillRect(0, decorY + 8, this.canvas.width, 2);
};

GameEngine.prototype.renderGameFeatures = function (centerX) {
    var features = ['🧟 对抗僵尸群', '🏠 探索建筑物', '👥 招募伙伴', '🍞 管理资源'];

    this.ctx.fillStyle = '#b8c6db';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';

    var startY = 200;
    var spacing = 25;

    for (var i = 0; i < features.length; i++) {
        this.ctx.fillText(features[i], centerX, startY + i * spacing);
    }
};

GameEngine.prototype.renderStartButton = function (centerX) {
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    var buttonY = 320;

    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetY = 4;

    var buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
    buttonGradient.addColorStop(0, '#4CAF50');
    buttonGradient.addColorStop(0.5, '#45a049');
    buttonGradient.addColorStop(1, '#3d8b40');

    this.ctx.fillStyle = buttonGradient;
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    this.ctx.shadowColor = 'rgba(76, 175, 80, 0.6)';
    this.ctx.shadowBlur = 15;
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    this.ctx.restore();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🎮 开始游戏', centerX, buttonY + buttonHeight / 2 + 7);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(buttonX + 5, buttonY + 5, buttonWidth - 10, buttonHeight - 10);
};

GameEngine.prototype.renderFooterInfo = function (centerX) {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';

    var footerY = this.canvas.height - 30;
    this.ctx.fillText('点击开始按钮进入末日世界', centerX, footerY);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.font = '10px Arial';
    this.ctx.fillText('v1.0 - 抖音小程序版', centerX, footerY + 15);
};

// 游戏主界面渲染
GameEngine.prototype.renderGame = function () {
    // 检查弹出提示状态
    console.log('[Render] 检查弹出提示状态:', {
        exists: !!this.buildingEntryPrompt,
        active: this.buildingEntryPrompt ? this.buildingEntryPrompt.active : false,
        buildingId: this.buildingEntryPrompt ? this.buildingEntryPrompt.buildingId : null,
        message: this.buildingEntryPrompt ? this.buildingEntryPrompt.message : null
    });

    // 尝试修复视距裁剪系统
    if (!this.viewportCulling || !this.viewportCulling.quadTree) {
        console.log('[Render] 检测到视距裁剪系统问题，尝试修复...');
        this.fixViewportCullingSystem();
    }

    // 检查是否需要强制回退到传统渲染
    if (this.fallbackToTraditionalRendering) {
        console.log('[Render] 使用传统渲染模式（已回退）');
        this.renderGameTraditional();
        return;
    }

    try {
        // 检查视距裁剪系统是否可用
        if (this.viewportCulling && this.viewportCulling.quadTree && this.viewportCulling.quadTreeInitialized) {
        // 更新视距裁剪系统
        this.updateViewportCulling();

            // 检查更新是否成功
            if (this.viewportCulling.visibleEntities) {
                // 正常使用视距裁剪渲染
                this.renderWithViewportCulling();
                return;
            } else {
                console.warn('[Render] 视距裁剪系统更新后仍不可用');
            }
        } else {
            console.log('[Render] 视距裁剪系统未就绪，使用传统建筑物渲染');
        }
    } catch (error) {
        console.error('[Render] 视距裁剪渲染出错:', error);
    }

    // 如果视距裁剪系统有问题，回退到传统渲染
    console.log('[Render] 视距裁剪系统异常，强制回退到传统渲染');
    this.fallbackToTraditionalRendering = true;
    this.renderGameTraditional();
};

// 使用视距裁剪系统的渲染方法
GameEngine.prototype.renderWithViewportCulling = function () {
    try {
        this.ctx.save();
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // 分层渲染（按优先级）
        this.renderMapBackground();
        this.renderStreetGrid();
            this.renderLayer('buildings');      // 建筑层
        this.renderLayer('decorations');    // 装饰层
        this.renderLayer('zombies');        // 僵尸层
        this.renderLayer('followers');      // 跟随者层
        this.renderLayer('players');        // 玩家层（最高优先级）

        this.ctx.restore();

        this.renderStatusBar();
        this.renderTimeInfo();
        this.renderMiniMap();

        if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
            this.renderBuildingEntryPrompt();
        }
    } catch (error) {
        console.error('[RenderWithViewportCulling] 视距裁剪渲染出错:', error);
        throw error;
    }
};

// 传统游戏渲染回退方案
GameEngine.prototype.renderGameTraditional = function () {
    this.ctx.save();

    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);

    this.renderMapBackground();
    this.renderStreetGrid();
    this.renderVisibleBuildings();
    this.renderPlayer();
    this.renderNPCs();
    this.renderFollowers();
    this.zombieManager.render(this.ctx, this.camera);

    this.ctx.restore();

    this.renderStatusBar();
    this.renderTimeInfo();
    this.renderMiniMap();

    console.log('[RenderFallback] 检查弹出提示状态:', {
        exists: !!this.buildingEntryPrompt,
        active: this.buildingEntryPrompt ? this.buildingEntryPrompt.active : false,
        buildingId: this.buildingEntryPrompt ? this.buildingEntryPrompt.buildingId : null,
        message: this.buildingEntryPrompt ? this.buildingEntryPrompt.message : null
    });

    if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        this.renderBuildingEntryPrompt();
    }
};

GameEngine.prototype.renderMapBackground = function () {
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(0, 0, this.mapConfig.width, this.mapConfig.height);
};

GameEngine.prototype.renderStreetGrid = function () {
    this.ctx.fillStyle = '#2c3e50';
    var streetWidth = this.mapConfig.streetWidth;
    var blockSize = this.mapConfig.blockSize;

    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var startX = Math.floor(this.camera.x / blockSize) * blockSize;
    var endX = startX + viewWidth + blockSize;
    var startY = Math.floor(this.camera.y / blockSize) * blockSize;
    var endY = startY + viewHeight + blockSize;

    for (var x = startX; x <= endX; x += blockSize) {
        if (x >= 0 && x <= this.mapConfig.width) {
            this.ctx.fillRect(x, Math.max(0, this.camera.y), streetWidth, Math.min(viewHeight, this.mapConfig.height - this.camera.y));
        }
    }

    for (var y = startY; y <= endY; y += blockSize) {
        if (y >= 0 && y <= this.mapConfig.height) {
            this.ctx.fillRect(Math.max(0, this.camera.x), y, Math.min(viewWidth, this.mapConfig.width - this.camera.x), streetWidth);
        }
    }

    this.renderStreetLines();
};

GameEngine.prototype.renderStreetLines = function () {
    this.ctx.strokeStyle = '#f39c12';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);

    var blockSize = this.mapConfig.blockSize;
    var streetWidth = this.mapConfig.streetWidth;
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var startX = Math.floor(this.camera.x / blockSize) * blockSize;
    var endX = startX + viewWidth + blockSize;
    var startY = Math.floor(this.camera.y / blockSize) * blockSize;
    var endY = startY + viewHeight + blockSize;

    for (var x = startX; x <= endX; x += blockSize) {
        if (x >= 0 && x <= this.mapConfig.width) {
            var lineX = x + streetWidth / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(lineX, Math.max(0, this.camera.y));
            this.ctx.lineTo(lineX, Math.min(this.camera.y + viewHeight, this.mapConfig.height));
            this.ctx.stroke();
        }
    }

    for (var y = startY; y <= endY; y += blockSize) {
        if (y >= 0 && y <= this.mapConfig.height) {
            var lineY = y + streetWidth / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(Math.max(0, this.camera.x), lineY);
            this.ctx.lineTo(Math.min(this.camera.x + viewWidth, this.mapConfig.width), lineY);
            this.ctx.stroke();
        }
    }

    this.ctx.setLineDash([]);
};

// 高性能分层渲染系统
GameEngine.prototype.renderLayer = function (layerType) {
    // 快速检查：如果视距裁剪系统出错，回退到传统渲染
    if (this.fallbackToTraditionalRendering) {
        this.renderLayerFallback(layerType);
        return;
    }

    var entities = this.viewportCulling.visibleEntities[layerType];
    if (!entities || entities.length === 0) {
        return; // 没有实体需要渲染，直接返回
    }

    // 高性能渲染：直接渲染，减少检查
    switch (layerType) {
        case 'players':
            // 确保玩家始终可见（安全检查）
            if (entities.length === 0 && this.player) {
                this.renderPlayerEntity(this.player);
            } else {
                for (var i = 0; i < entities.length; i++) {
                    this.renderPlayerEntity(entities[i]);
                }
            }
            break;
        case 'followers':
            for (var i = 0; i < entities.length; i++) {
                var follower = entities[i];
                // 跳过死亡和过远的跟随者
                if (!follower.isDead && !follower.tooFarToRender) {
                    this.renderFollowerEntity(follower);
                }
            }

            // 调试信息：如果没有跟随者，检查是否有测试伙伴
            if (entities.length === 0 && this.followers && this.followers.length > 0) {
                console.log('[RenderLayer] followers层为空，但跟随者列表中有', this.followers.length, '个跟随者');
                // 强制渲染测试伙伴
                for (var j = 0; j < this.followers.length; j++) {
                    var follower = this.followers[j];
                    if (follower && follower.isTestPartner) {
                        console.log('[RenderLayer] 强制渲染真正测试伙伴:', follower.id);
                        this.renderFollowerEntity(follower);
                    }
                }
            }
            break;
        case 'zombies':
            for (var i = 0; i < entities.length; i++) {
                var zombie = entities[i];
                // 跳过死亡的僵尸
                if (!zombie.isDead) {
                    this.renderZombieEntity(zombie);
                }
            }
            break;
        case 'buildings':
            // 添加调试信息
            if (entities.length === 0) {
                console.warn('[RenderLayer] 建筑物层没有可见实体，回退到传统渲染');
                this.renderVisibleBuildings();
                return;
            }

            for (var i = 0; i < entities.length; i++) {
                this.renderBuildingEntity(entities[i]);
            }
            break;
        case 'decorations':
            for (var i = 0; i < entities.length; i++) {
                this.renderDecorationEntity(entities[i]);
            }
            break;
    }
};

// 传统渲染回退方案
GameEngine.prototype.renderLayerFallback = function (layerType) {
    switch (layerType) {
        case 'players':
            this.renderPlayer();
            break;
        case 'followers':
            this.renderFollowers();
            // 强制渲染测试伙伴（即使视距裁剪系统有问题）
            this.renderTestPartnersDirectly();
            break;
        case 'zombies':
            this.zombieManager.render(this.ctx, this.camera);
            break;
        case 'buildings':
            this.renderVisibleBuildings();
            break;
        case 'decorations':
            // 装饰物渲染逻辑
            break;
    }
};


GameEngine.prototype.renderPlayerEntity = function (player) {
    this.characterManager.renderCurrentCharacter(this.ctx, player.x, player.y, player);
    this.renderCharacterHealthBar(player, player.x, player.y);
};

GameEngine.prototype.renderFollowerEntity = function (follower) {
    this.renderSingleFollower(follower, 0);
};

GameEngine.prototype.renderZombieEntity = function (zombie) {
    // 检查僵尸对象是否有效
    if (!zombie || typeof zombie !== 'object') {
        console.warn('[GameEngine] 僵尸对象无效:', zombie);
        return;
    }

    // 检查僵尸是否有必要的属性和方法
    if (typeof zombie.x !== 'number' || typeof zombie.y !== 'number' || typeof zombie.render !== 'function') {
        console.warn('[GameEngine] 僵尸对象缺少必要属性:', zombie);
        return;
    }

    // 检查僵尸坐标是否有效
    if (isNaN(zombie.x) || isNaN(zombie.y) || !isFinite(zombie.x) || !isFinite(zombie.y)) {
        console.warn('[GameEngine] 僵尸坐标无效:', zombie.x, zombie.y);
        return;
    }

    // 检查渲染上下文和相机是否有效
    if (!this.ctx || !this.camera) {
        console.warn('[GameEngine] 渲染上下文或相机无效:', {ctx: !!this.ctx, camera: !!this.camera});
        return;
    }

    try {
        zombie.render(this.ctx, this.camera);
    } catch (error) {
        console.error('[GameEngine] 渲染僵尸时出错:', zombie, '错误:', error);
    }
};

GameEngine.prototype.renderBuildingEntity = function (building) {
    // 渲染单个建筑，避免重复渲染
    if (building && typeof building.x === 'number' && typeof building.y === 'number') {
        this.renderSingleBuilding(building);
    }
};

// 渲染单个建筑
GameEngine.prototype.renderSingleBuilding = function (building) {
    if (!building || typeof building.x !== 'number' || typeof building.y !== 'number') {
        return;
    }

    // 检查建筑是否在视口内
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;

    if (building.x + building.width < viewLeft || building.x > viewRight || building.y + building.height < viewTop || building.y > viewBottom) {
        return; // 不在视口内，不渲染
    }

    // 渲染建筑主体
    this.ctx.fillStyle = building.explored ? building.color : this.lightenColor(building.color, 0.3);
    this.ctx.fillRect(building.x, building.y, building.width, building.height);

    // 渲染门
    var doorWidth = Math.max(30, Math.floor(building.width / 8));
    var doorHeight = Math.max(40, Math.floor(building.height / 6));
    var doorX = building.x + (building.width - doorWidth) / 2;
    var doorY = building.y + building.height - doorHeight - 5;

    this.ctx.fillStyle = building.explored ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.6)';
    this.ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

    // 高亮当前靠近的建筑
    if (this.nearBuilding && this.nearBuilding.id === building.id) {
        this.ctx.save();
        this.ctx.shadowColor = '#3498db';
        this.ctx.shadowBlur = 15;
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(doorX - 2, doorY - 2, doorWidth + 4, doorHeight + 4);
        this.ctx.restore();
    }

    // 建筑边框
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(building.x, building.y, building.width, building.height);

    // 未探索建筑的黄色虚线边框
    if (!building.explored) {
        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(building.x - 3, building.y - 3, building.width + 6, building.height + 6);
        this.ctx.setLineDash([]);
    }

    // 建筑名称
    var fontSize = Math.max(20, Math.floor(building.width / 12));
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold ' + fontSize + 'px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = Math.max(3, Math.floor(fontSize / 6));

    var textX = building.x + building.width / 2;
    var textY = building.y + building.height / 3;

    this.ctx.strokeText(building.name, textX, textY);
    this.ctx.fillText(building.name, textX, textY);

    // 重置文本对齐
    this.ctx.textAlign = 'left';
};

GameEngine.prototype.renderDecorationEntity = function (decoration) {
    // 装饰物渲染逻辑
};

// 更新视距裁剪系统
GameEngine.prototype.updateViewportCulling = function () {
    console.log('[ViewportCulling] 开始更新视距裁剪系统...');

    // 安全检查
    if (!this.viewportCulling) {
        console.warn('[ViewportCulling] 视距裁剪管理器不存在，尝试重新创建...');
        try {
            this.viewportCulling = new ViewportCullingManager();
            console.log('[ViewportCulling] 重新创建视距裁剪管理器成功');
        } catch (error) {
            console.error('[ViewportCulling] 重新创建视距裁剪管理器失败:', error);
        return;
        }
    }

    // 如果四叉树不存在，尝试初始化
    if (!this.viewportCulling.quadTree) {
        console.log('[ViewportCulling] 四叉树不存在，尝试初始化...');
        try {
            this.viewportCulling.init(this.mapConfig.width, this.mapConfig.height);

            // 如果初始化后仍然不存在，则跳过
            if (!this.viewportCulling.quadTree) {
                console.warn('[ViewportCulling] 四叉树初始化失败，跳过更新');
                return;
            } else {
                console.log('[ViewportCulling] 四叉树初始化成功');
            }
        } catch (error) {
            console.error('[ViewportCulling] 四叉树初始化异常:', error);
            return;
        }
    }

    try {
        // 更新摄像机位置
        this.viewportCulling.updateCamera(this.camera.x, this.camera.y, this.canvas.width / this.camera.zoom, this.canvas.height / this.camera.zoom);

        // 更新可见实体
        this.viewportCulling.updateVisibleEntities(this);

        // 检查更新后的状态
        console.log('[ViewportCulling] 视距裁剪系统更新完成，状态:', {
            visibleEntities: !!this.viewportCulling.visibleEntities,
            buildingsCount: this.viewportCulling.visibleEntities ? this.viewportCulling.visibleEntities.buildings.length : 'N/A',
            playersCount: this.viewportCulling.visibleEntities ? this.viewportCulling.visibleEntities.players.length : 'N/A',
            followersCount: this.viewportCulling.visibleEntities ? this.viewportCulling.visibleEntities.followers.length : 'N/A'
        });

    } catch (error) {
        console.error('[ViewportCulling] 更新时出错:', error);
        // 不要立即设置 fallbackToTraditionalRendering，先尝试修复
    }
};

// 修复视距裁剪系统
GameEngine.prototype.fixViewportCullingSystem = function () {
    try {
        // 如果没有视距裁剪管理器，创建一个新的
        if (!this.viewportCulling) {
            console.log('[ViewportCulling] 创建新的视距裁剪管理器');
            this.viewportCulling = new ViewportCullingManager();
        }

        // 如果四叉树未初始化，初始化它
        if (this.viewportCulling && !this.viewportCulling.quadTree) {
            console.log('[ViewportCulling] 初始化四叉树');
            this.viewportCulling.init(this.mapConfig.width, this.mapConfig.height);
        }

        // 如果四叉树已初始化但未标记为已初始化，修复标记
        if (this.viewportCulling && this.viewportCulling.quadTree && !this.viewportCulling.quadTreeInitialized) {
            console.log('[ViewportCulling] 修复初始化标记');
            this.viewportCulling.quadTreeInitialized = true;
        }

        // 确保可见实体对象存在
        if (this.viewportCulling && !this.viewportCulling.visibleEntities) {
            this.viewportCulling.visibleEntities = {
                players: [], followers: [], zombies: [], buildings: [], decorations: []
            };
        }

        console.log('[ViewportCulling] 修复完成');
        return true;
    } catch (error) {
        console.error('[ViewportCulling] 修复失败:', error);
        return false;
    }
};

// 生成初始伙伴（开局时主人物身边生成8个伙伴）
GameEngine.prototype.generateInitialPartners = function () {
    try {
        console.log('[InitialPartners] 开始生成初始伙伴，玩家位置:', this.player.x, this.player.y);

        // 检查必要组件
        if (!this.characterManager) {
            console.error('[InitialPartners] 错误：characterManager未初始化');
            return;
        }

        if (!this.characterManager.characters) {
            console.error('[InitialPartners] 错误：characterManager.characters未初始化');
            return;
        }

        console.log('[InitialPartners] 角色管理器状态:', {
            characterManager: !!this.characterManager,
            characters: !!this.characterManager.characters,
            charactersCount: this.characterManager.characters ? Object.keys(this.characterManager.characters).length : 0
        });

        // 伙伴配置
        var partnerConfigs = [{name: '金发女战士', characterId: 2, health: 100, attack: 20, special: '近战攻击'}, {
            name: '暗影忍者',
            characterId: 3,
            health: 80,
            attack: 25,
            special: '隐身突袭'
        }, {name: '机械工程师', characterId: 4, health: 90, attack: 15, special: '机械修复'}, {
            name: '魔法师',
            characterId: 5,
            health: 70,
            attack: 30,
            special: '魔法攻击'
        }, {name: '海盗船长', characterId: 6, health: 110, attack: 22, special: '航海技能'}, {
            name: '太空探险家',
            characterId: 7,
            health: 85,
            attack: 18,
            special: '科技装备'
        }, {name: '武士', characterId: 8, health: 95, attack: 24, special: '剑术精通'}, {
            name: '忍者',
            characterId: 9,
            health: 75,
            attack: 26,
            special: '暗杀技巧'
        }];

        // 在玩家周围生成8个伙伴，形成一个圆圈
        var partnerCount = partnerConfigs.length;
        var radius = 80; // 距离玩家的半径（像素）
        var angleStep = (2 * Math.PI) / partnerCount;

        console.log('[InitialPartners] 准备生成', partnerCount, '个伙伴，半径:', radius, '像素');

        for (var i = 0; i < partnerCount; i++) {
            var angle = i * angleStep;
            var x = this.player.x + Math.cos(angle) * radius;
            var y = this.player.y + Math.sin(angle) * radius;

            var partnerConfig = partnerConfigs[i];

            // 检查角色是否存在
            var character = this.characterManager.characters[partnerConfig.characterId];
            if (!character) {
                console.warn('[InitialPartners] 警告：角色ID', partnerConfig.characterId, '不存在，跳过');
                continue;
            }

            // 创建伙伴对象（初始状态为NPC，未加入团队）
            var partner = {
                id: 'initial_partner_' + (i + 1),
                characterId: partnerConfig.characterId,
                name: partnerConfig.name,
                x: x,
                y: y,
                health: partnerConfig.health,
                maxHealth: partnerConfig.health,
                attack: partnerConfig.attack,
                special: partnerConfig.special,
                isWalking: false,
                direction: 'down',
                lastUpdateTime: Date.now(),
                type: 'npc', // 初始状态为NPC
                isFollowing: false, // 未加入团队
                isJoined: false, // 未加入团队
                quadTreeInserted: false, // 添加渲染所需的属性
                character: character,
                personality: this.getCharacterPersonality(character)
            };

            // 调试信息：检查角色数据
            console.log('[InitialPartners] 伙伴', (i + 1), '角色数据:', {
                characterId: partnerConfig.characterId,
                character: !!partner.character,
                characterName: partner.character ? partner.character.name : 'undefined',
                personality: !!partner.personality
            });

            // 添加到NPC列表（不是跟随者列表）
            this.npcs.push(partner);
            console.log('[InitialPartners] 伙伴', (i + 1), '已添加到NPC列表，当前NPC数量:', this.npcs.length);

            // 插入到视距裁剪系统
            if (this.viewportCulling && this.viewportCulling.quadTree) {
                this.viewportCulling.quadTree.insert(partner);
                partner.quadTreeInserted = true;
                console.log('[InitialPartners] 伙伴', (i + 1), '已插入视距裁剪系统');
            } else {
                console.warn('[InitialPartners] 警告：视距裁剪系统未初始化，跳过四叉树插入');
            }

            console.log('[InitialPartners] 生成伙伴', (i + 1), ':', partnerConfig.name, '位置:', {x: x, y: y});
        }

        // 更新NPC数量统计
        console.log('[InitialPartners] 初始伙伴生成完成，NPC数量:', this.npcs.length, '等待玩家碰撞加入团队');

        // 最终验证
        if (this.npcs.length === 0) {
            console.error('[InitialPartners] 错误：NPC列表仍然为空！');
        } else {
            console.log('[InitialPartners] 成功生成', this.npcs.length, '个NPC');
        }

    } catch (error) {
        console.error('[InitialPartners] 生成初始伙伴时出错:', error);
        console.error('[InitialPartners] 错误堆栈:', error.stack);
    }
};

// 检查四叉树状态
GameEngine.prototype.checkQuadTreeStatus = function () {
    try {
        console.log('=== 四叉树状态检查 ===');

        if (!this.viewportCulling) {
            console.error('[Check] ViewportCullingManager 不存在');
            return;
        }

        if (!this.viewportCulling.quadTree) {
            console.error('[Check] 四叉树不存在');
            return;
        }

        // 检查四叉树基本信息
        console.log('[Check] 四叉树基本信息:', {
            bounds: this.viewportCulling.quadTree.bounds,
            maxObjects: this.viewportCulling.quadTree.maxObjects,
            maxLevels: this.viewportCulling.quadTree.maxLevels,
            level: this.viewportCulling.quadTree.level,
            isLeaf: this.viewportCulling.quadTree.isLeaf
        });

        // 检查四叉树中的对象数量
        var totalObjects = this.countQuadTreeObjects(this.viewportCulling.quadTree);
        console.log('[Check] 四叉树对象总数:', totalObjects);

        // 检查实体插入状态
        console.log('[Check] 实体插入状态:', {
            buildings: this.buildings ? this.buildings.length : 'N/A',
            buildingsWithType: this.buildings ? this.buildings.filter(b => b.type === 'building').length : 'N/A',
            buildingsInserted: this.buildings ? this.buildings.filter(b => b.quadTreeInserted).length : 'N/A',
            player: this.player ? {x: this.player.x, y: this.player.y, type: this.player.type} : 'N/A'
        });

        // 测试四叉树查询
        this.testQuadTreeQuery();

        console.log('=== 四叉树状态检查完成 ===');

    } catch (error) {
        console.error('[Check] 检查四叉树状态时出错:', error);
    }
};

// 递归计算四叉树中的对象总数
GameEngine.prototype.countQuadTreeObjects = function (node) {
    var count = node.objects.length;
    if (!node.isLeaf) {
        for (var i = 0; i < node.nodes.length; i++) {
            count += this.countQuadTreeObjects(node.nodes[i]);
        }
    }
    return count;
};

// 测试四叉树查询功能
GameEngine.prototype.testQuadTreeQuery = function () {
    try {
        // 测试全图查询
        var fullRange = new Bounds(0, 0, this.mapConfig.width, this.mapConfig.height);
        var allEntities = this.viewportCulling.quadTree.query(fullRange);

        console.log('[Test] 全图查询结果:', {
            totalEntities: allEntities.length, entityTypes: allEntities.map(function (e) {
                return e ? e.type : 'null';
            }), firstFewEntities: allEntities.slice(0, 5).map(function (e) {
                return e ? {type: e.type, x: e.x, y: e.y} : 'null';
            })
        });

        // 测试玩家周围查询
        if (this.player) {
            var playerRange = new Bounds(this.player.x - 500, this.player.y - 500, 1000, 1000);
            var playerEntities = this.viewportCulling.quadTree.query(playerRange);

            console.log('[Test] 玩家周围查询结果:', {
                playerPos: {x: this.player.x, y: this.player.y},
                range: {x: playerRange.x, y: playerRange.y, width: playerRange.width, height: playerRange.height},
                totalEntities: playerEntities.length,
                entityTypes: playerEntities.map(function (e) {
                    return e ? e.type : 'null';
                })
            });
        }

    } catch (error) {
        console.error('[Test] 测试四叉树查询时出错:', error);
    }
};

// 清理死亡实体（高性能方法）
GameEngine.prototype.cleanupDeadEntities = function () {
    try {
        var cleanedCount = 0;

        // 清理死亡的僵尸 - 使用安全的数组操作
        if (this.zombieManager && this.zombieManager.zombies) {
            var zombieCleanupCount = SafeArrayOperations.safeRemoveDeadEntities(this.zombieManager.zombies, function (zombie) {
                return zombie && zombie.isDead;
            }, function (zombie) {
                    // 从视距裁剪系统中移除
                    if (this.viewportCulling && this.viewportCulling.quadTree) {
                        this.viewportCulling.quadTree.remove(zombie);
                        zombie.quadTreeInserted = false; // 重置标记
                    }
            }.bind(this));
            cleanedCount += zombieCleanupCount;
        }

        // 清理死亡的跟随者 - 使用安全的数组操作
        var followerCleanupCount = SafeArrayOperations.safeRemoveDeadEntities(this.followers, function (follower) {
            return follower && follower.isDead;
        }, function (follower) {
                // 从视距裁剪系统中移除
                if (this.viewportCulling && this.viewportCulling.quadTree) {
                    this.viewportCulling.quadTree.remove(follower);
                    follower.quadTreeInserted = false; // 重置标记
                }
        }.bind(this));
        cleanedCount += followerCleanupCount;
        
        if (cleanedCount > 0) {
            console.log('[Cleanup] 清理了', cleanedCount, '个死亡实体');
        }
        
    } catch (error) {
        console.error('[Cleanup] 清理死亡实体时出错:', error);
    }
};

// 内存泄漏检测和预防
GameEngine.prototype.startMemoryLeakDetection = function () {
    var self = this;
    
    // 定期检查内存状态
    setInterval(function () {
        self.checkMemoryHealth();
    }, 30000); // 每30秒检查一次
    
    // 立即执行一次检查，帮助调试
    setTimeout(function () {
        console.log('[MemoryLeak] 执行首次内存健康检查...');
        self.checkMemoryHealth();
    }, 2000);
    
    console.log('[MemoryLeak] 内存泄漏检测已启动');
};

GameEngine.prototype.checkMemoryHealth = function () {
    try {
        var issues = [];
        
        // 检查僵尸数组
        try {
            if (this.zombieManager && this.zombieManager.zombies && Array.isArray(this.zombieManager.zombies)) {
                var zombieCount = this.zombieManager.zombies.length;
                var deadZombieCount = 0;
                var quadTreeZombieCount = 0;
                
                for (var i = 0; i < zombieCount; i++) {
                    var zombie = this.zombieManager.zombies[i];
                    if (zombie && typeof zombie === 'object') {
                        if (zombie.isDead === true) deadZombieCount++;
                        if (zombie.quadTreeInserted === true) quadTreeZombieCount++;
                    }
                }
                
                if (deadZombieCount > 0) {
                    issues.push('发现 ' + deadZombieCount + ' 个死亡僵尸未清理');
                }
                
                if (quadTreeZombieCount !== zombieCount) {
                    issues.push('僵尸四叉树状态不一致: ' + quadTreeZombieCount + '/' + zombieCount);
                }
            }
        } catch (zombieError) {
            console.error('[MemoryLeak] 检查僵尸数组时出错:', zombieError);
            issues.push('僵尸数组检查失败: ' + zombieError.message);
        }
        
        // 检查跟随者数组
        try {
            if (this.followers && Array.isArray(this.followers)) {
                var followerCount = this.followers.length;
                var deadFollowerCount = 0;
                var quadTreeFollowerCount = 0;
                
                for (var i = 0; i < followerCount; i++) {
                    var follower = this.followers[i];
                    if (follower && typeof follower === 'object') {
                        if (follower.isDead === true) deadFollowerCount++;
                        if (follower.quadTreeInserted === true) quadTreeFollowerCount++;
                    }
                }
                
                if (deadFollowerCount > 0) {
                    issues.push('发现 ' + deadFollowerCount + ' 个死亡跟随者未清理');
                }
                
                if (quadTreeFollowerCount !== followerCount) {
                    issues.push('跟随者四叉树状态不一致: ' + quadTreeFollowerCount + '/' + followerCount);
                }
            }
        } catch (followerError) {
            console.error('[MemoryLeak] 检查跟随者数组时出错:', followerError);
            issues.push('跟随者数组检查失败: ' + followerError.message);
        }
        
        // 检查对象池状态
        try {
            if (this.followerPool && Array.isArray(this.followerPool) && this.followerPool.length > this.maxFollowerPoolSize) {
                issues.push('跟随者对象池超出限制: ' + this.followerPool.length + '/' + this.maxFollowerPoolSize);
            }
            
            if (this.resourcePool && Array.isArray(this.resourcePool) && this.resourcePool.length > this.maxResourcePoolSize) {
                issues.push('资源对象池超出限制: ' + this.resourcePool.length + '/' + this.maxResourcePoolSize);
            }
        } catch (poolError) {
            console.error('[MemoryLeak] 检查对象池时出错:', poolError);
            issues.push('对象池检查失败: ' + poolError.message);
        }
        
        // 报告问题
        if (issues.length > 0) {
            console.warn('[MemoryLeak] 发现内存健康问题:');
            for (var j = 0; j < issues.length; j++) {
                console.warn('[MemoryLeak] - ' + issues[j]);
            }
            
            // 显示详细信息
            console.log('[MemoryLeak] 详细信息:');
            try {
                if (this.zombieManager && this.zombieManager.zombies) {
                    console.log('[MemoryLeak] 僵尸总数:', this.zombieManager.zombies.length);
                }
                if (this.followers) {
                    console.log('[MemoryLeak] 跟随者总数:', this.followers.length);
                }
                if (this.followerPool) {
                    console.log('[MemoryLeak] 跟随者对象池大小:', this.followerPool.length);
                }
                if (this.resourcePool) {
                    console.log('[MemoryLeak] 资源对象池大小:', this.resourcePool.length);
                }
            } catch (detailError) {
                console.error('[MemoryLeak] 显示详细信息时出错:', detailError);
            }
            
            // 自动清理
            try {
                this.cleanupDeadEntities();
            } catch (cleanupError) {
                console.error('[MemoryLeak] 自动清理时出错:', cleanupError);
            }
        } else {
            console.log('[MemoryLeak] 内存状态健康');
        }
        
    } catch (error) {
        console.error('[MemoryLeak] 内存健康检查出错:', error);
    }
};

// 检查已加载NPC的碰撞（优化版，使用空间分区优化）
GameEngine.prototype.checkLoadedNPCCollision = function () {
    if (!this.player || !this.npcs || this.npcs.length === 0) {
        // 添加调试信息
        if (this.debugCounter === undefined) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter >= 120) { // 每2秒输出一次
            console.log('[PartnerCollision] 无法检查碰撞:', {
                player: !!this.player,
                npcs: !!this.npcs,
                npcsLength: this.npcs ? this.npcs.length : 'undefined',
                playerPosition: this.player ? {x: this.player.x, y: this.player.y} : null
            });
            this.debugCounter = 0;
        }
        return;
    }

            var playerRadius = zombieModule.GAME_CONFIG.PLAYER.CHARACTER_RADIUS;
    var npcRadius = 18; // NPC的碰撞半径
    var collisionDistance = playerRadius + npcRadius;
    var collisionDistanceSquared = collisionDistance * collisionDistance;

    // 使用空间分区优化：只检查玩家附近的NPC
    var playerX = this.player.x;
    var playerY = this.player.y;
    var searchRadius = collisionDistance + 50; // 搜索半径稍大于碰撞距离

    // 快速筛选：只检查在搜索半径内的NPC
    var nearbyNPCs = [];
    for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];

        // 跳过已经加入团队的伙伴
        if (npc.isFollowing || npc.isJoined) {
            continue;
        }

        // 快速距离检查（使用曼哈顿距离作为预筛选）
        var manhattanDistance = Math.abs(npc.x - playerX) + Math.abs(npc.y - playerY);
        if (manhattanDistance <= searchRadius * 1.5) { // 曼哈顿距离是欧几里得距离的上界
            nearbyNPCs.push(npc);
        }
    }

    // 只对附近的NPC进行精确碰撞检测
    for (var i = nearbyNPCs.length - 1; i >= 0; i--) {
        var npc = nearbyNPCs[i];

        // 精确距离计算
        var dx = playerX - npc.x;
        var dy = playerY - npc.y;
        var distanceSquared = dx * dx + dy * dy;

        // 添加距离调试信息
        if (this.debugCounter === undefined) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter >= 120) { // 每2秒输出一次
            var distance = Math.sqrt(distanceSquared);
            console.log('[PartnerCollision] 检查NPC:', npc.name || npc.id, '距离玩家:', distance.toFixed(1), '碰撞阈值:', collisionDistance);
            this.debugCounter = 0;
        }

        if (distanceSquared <= collisionDistanceSquared) {
            // 玩家碰到了伙伴，触发加入团队
            console.log('[PartnerCollision] 玩家碰到伙伴:', npc.name || npc.id, '触发加入团队');
            this.addPartnerToTeam(npc);

            // 立即返回，避免在同一帧处理多个碰撞
            return;
        }
    }
};

// 添加伙伴到团队（改进版，增加安全检查）
GameEngine.prototype.addPartnerToTeam = function (npc) {
    try {
        // 防止重复处理
        if (npc.isFollowing || npc.isJoined) {
            console.log('[Team] 伙伴', npc.name, '已经加入团队，跳过');
            return;
        }

        // 检查团队是否已满
        if (this.gameData.teamSize >= zombieModule.GAME_CONFIG.TEAM.MAX_SIZE) {
            console.log('[Team] 团队已达到最大规模限制:', zombieModule.GAME_CONFIG.TEAM.MAX_SIZE);
            return;
        }

        // 标记伙伴为已跟随状态
        npc.isFollowing = true;
        npc.isJoined = true; // 使用专门的标志位，而不是重用isDead

        // 从NPC列表移除（使用倒序索引避免问题）
        var npcIndex = this.npcs.indexOf(npc);
        if (npcIndex !== -1) {
            this.npcs.splice(npcIndex, 1);
            console.log('[Team] 从NPC列表移除伙伴:', npc.name);
        }

        // 从视距裁剪系统移除
        if (this.viewportCulling && this.viewportCulling.quadTree && npc.quadTreeInserted) {
            this.viewportCulling.quadTree.remove(npc);
            npc.quadTreeInserted = false;
            console.log('[Team] 从视距裁剪系统移除伙伴:', npc.name);
        }

        // 设置伙伴为跟随者类型
        npc.type = 'follower';

        // 计算安全的跟随位置
        var safePosition = this.getSafeFollowerPosition();
        npc.x = safePosition.x;
        npc.y = safePosition.y;

        // 添加到跟随者列表
        this.followers.push(npc);
        console.log('[Team] 添加到跟随者列表:', npc.name);

        // 插入到视距裁剪系统
        if (this.viewportCulling && this.viewportCulling.quadTree) {
            this.viewportCulling.quadTree.insert(npc);
            npc.quadTreeInserted = true;
            console.log('[Team] 插入到视距裁剪系统:', npc.name);
        }

        // 更新团队规模
        this.gameData.teamSize = this.followers.length;
        if (this.gameData.teamSize > this.gameData.maxTeamSize) {
            this.gameData.maxTeamSize = this.gameData.teamSize;
        }

        // 更新伙伴状态
        if (npc.partnerState) {
            npc.partnerState.isFollowing = true;
        }

        console.log('[Team] 伙伴', npc.name, '成功加入团队，当前团队规模:', this.gameData.teamSize);

    } catch (error) {
        console.error('[Team] 添加伙伴到团队时出错:', error);
        // 出错时恢复NPC状态
        if (npc) {
            npc.isFollowing = false;
            npc.isJoined = false;
        }
    }
};

// 高性能伙伴系统更新（统一处理碰撞检测）
GameEngine.prototype.updatePartnerSystem = function () {
    if (!this.player || !this.partnerStates) {
        return;
    }
    
    var currentTime = Date.now();
    var playerX = this.player.x;
    var playerY = this.player.y;
    
    // 遍历所有伙伴状态
    this.partnerStates.forEach(function (partnerState, partnerId) {
        // 跳过已死亡或已加入团队的伙伴
        if (partnerState.isDead || partnerState.isFollowing) {
            return;
        }
        
        // 计算到玩家的距离
        var distance = Math.sqrt(Math.pow(partnerState.x - playerX, 2) + Math.pow(partnerState.y - playerY, 2));
        
        // 检查是否需要加载
        if (!partnerState.isLoaded && distance <= partnerState.loadDistance) {
            this.loadPartner(partnerState);
        }
        // 检查是否需要卸载
        else if (partnerState.isLoaded && distance > partnerState.unloadDistance) {
            this.unloadPartner(partnerState);
        }
        
    }.bind(this));

    // 检查已加载NPC的碰撞（避免重复处理）
    this.checkLoadedNPCCollision();

    // 紧急停止检查：防止游戏卡死
    this.checkEmergencyStop();

    // 调试信息：显示NPC状态
    if (this.debugCounter === undefined) this.debugCounter = 0;
    this.debugCounter++;
    if (this.debugCounter >= 180) { // 每3秒输出一次
        console.log('[Debug] NPC状态:', {
            npcsLength: this.npcs ? this.npcs.length : 'undefined',
            followersLength: this.followers ? this.followers.length : 'undefined',
            playerPosition: this.player ? {x: this.player.x, y: this.player.y} : null
        });

        // 如果NPC列表为空，尝试创建测试NPC
        if (!this.npcs || this.npcs.length === 0) {
            console.log('[Debug] 检测到NPC列表为空，尝试创建测试NPC...');
            try {
                var testNPC = {
                    id: 'debug_npc_' + Date.now(),
                    name: '调试伙伴',
                    x: this.player.x + 150,
                    y: this.player.y + 150,
                    type: 'npc',
                    isFollowing: false,
                    isJoined: false,
                    quadTreeInserted: false,
                    character: this.characterManager.characters[2],
                    personality: this.getCharacterPersonality(this.characterManager.characters[2])
                };

                this.npcs.push(testNPC);
                console.log('[Debug] 调试NPC创建成功，当前NPC数量:', this.npcs.length);

                // 插入到视距裁剪系统
                if (this.viewportCulling && this.viewportCulling.quadTree) {
                    this.viewportCulling.quadTree.insert(testNPC);
                    testNPC.quadTreeInserted = true;
                    console.log('[Debug] 调试NPC已插入视距裁剪系统');
                }

            } catch (error) {
                console.error('[Debug] 创建调试NPC失败:', error);
            }
        }

        this.debugCounter = 0;
    }
};

// 加载伙伴到视距裁剪系统
GameEngine.prototype.loadPartner = function (partnerState) {
    try {
        // 创建伙伴实体
        var partner = {
            id: partnerState.id,
            characterId: partnerState.characterId,
            name: partnerState.name,
            x: partnerState.x,
            y: partnerState.y,
            type: 'npc',
            isFollowing: false,
            isDead: false,
            quadTreeInserted: false,
            character: this.characterManager.characters[partnerState.characterId],
            personality: this.getCharacterPersonality(this.characterManager.characters[partnerState.characterId])
        };
        
        // 插入到视距裁剪系统
        if (this.viewportCulling && this.viewportCulling.quadTree) {
            this.viewportCulling.quadTree.insert(partner);
            partner.quadTreeInserted = true;
        }
        
        // 添加到NPC列表
        this.npcs.push(partner);
        
        // 更新状态
        partnerState.isLoaded = true;
        partnerState.npcReference = partner;
        
        console.log('[PartnerSystem] 加载伙伴:', partnerState.name, '位置:', partnerState.x, partnerState.y);
        
    } catch (error) {
        console.error('[PartnerSystem] 加载伙伴失败:', error);
    }
};

// 从视距裁剪系统卸载伙伴
GameEngine.prototype.unloadPartner = function (partnerState) {
    try {
        if (partnerState.npcReference) {
            var partner = partnerState.npcReference;
            
            // 从视距裁剪系统移除
            if (this.viewportCulling && this.viewportCulling.quadTree && partner.quadTreeInserted) {
                this.viewportCulling.quadTree.remove(partner);
                partner.quadTreeInserted = false;
            }
            
            // 从NPC列表中移除
            var npcIndex = this.npcs.indexOf(partner);
            if (npcIndex > -1) {
                this.npcs.splice(npcIndex, 1);
            }
            
            // 更新状态
            partnerState.isLoaded = false;
            partnerState.npcReference = null;
            
            console.log('[PartnerSystem] 卸载伙伴:', partnerState.name);
        }
        
    } catch (error) {
        console.error('[PartnerSystem] 卸载伙伴失败:', error);
    }
};

// 将实体插入四叉树
GameEngine.prototype.insertEntitiesToQuadTree = function () {
    try {
        // 插入玩家
        if (this.player && typeof this.player.x === 'number' && typeof this.player.y === 'number') {
            this.player.type = 'player'; // 设置玩家类型
            this.player.quadTreeInserted = true; // 标记已插入
            this.viewportCulling.quadTree.insert(this.player);
        }
        
        // 插入跟随者
        if (this.followers && Array.isArray(this.followers)) {
            for (var i = 0; i < this.followers.length; i++) {
                var follower = this.followers[i];
                if (follower && typeof follower.x === 'number' && typeof follower.y === 'number') {
                    follower.type = 'follower';
                    this.viewportCulling.quadTree.insert(follower);
                }
            }
        }
        
        // 插入僵尸（只插入一次，避免重复）
        if (this.zombieManager && this.zombieManager.zombies && Array.isArray(this.zombieManager.zombies)) {
            for (var i = 0; i < this.zombieManager.zombies.length; i++) {
                var zombie = this.zombieManager.zombies[i];
                if (zombie && typeof zombie.x === 'number' && typeof zombie.y === 'number') {
                    // 僵尸已经有type属性，不需要重新设置
                    zombie.quadTreeInserted = true; // 标记已插入
                    this.viewportCulling.quadTree.insert(zombie);
                }
            }
        }
        
        // 插入建筑（只插入一次，避免重复）
        if (this.buildings && Array.isArray(this.buildings)) {
            var buildingsInserted = 0;
            var buildingsFailed = 0;
            for (var i = 0; i < this.buildings.length; i++) {
                var building = this.buildings[i];
                if (building && typeof building.x === 'number' && typeof building.y === 'number') {
                    try {
                    building.type = 'building';
                    building.quadTreeInserted = true; // 标记已插入
                    this.viewportCulling.quadTree.insert(building);
                    buildingsInserted++;

                        // 调试信息：检查前几个建筑物
                        if (buildingsInserted <= 3) {
                            console.log('[InsertEntities] 建筑物', i, '插入成功:', {
                                type: building.type,
                                x: building.x,
                                y: building.y,
                                quadTreeInserted: building.quadTreeInserted
                            });
                        }
                    } catch (error) {
                        buildingsFailed++;
                        console.error('[InsertEntities] 建筑物', i, '插入失败:', error);
                    }
                } else {
                    buildingsFailed++;
                    console.warn('[InsertEntities] 建筑物', i, '数据无效:', building);
                }
            }
            console.log('[InsertEntities] 建筑物插入结果:', buildingsInserted, '成功,', buildingsFailed, '失败, 总数:', this.buildings.length);
        }

        // 插入NPC（包括测试伙伴）
        if (this.npcs && Array.isArray(this.npcs)) {
            var npcsInserted = 0;
            for (var i = 0; i < this.npcs.length; i++) {
                var npc = this.npcs[i];
                if (npc && typeof npc.x === 'number' && typeof npc.y === 'number') {
                    // 确保NPC有正确的类型
                    if (!npc.type) {
                        npc.type = 'follower'; // 默认设置为follower类型
                    }
                    this.viewportCulling.quadTree.insert(npc);
                    npc.quadTreeInserted = true;
                    npcsInserted++;
                }
            }
            console.log('[InsertEntities] 成功插入NPC到四叉树:', npcsInserted, '/', this.npcs.length);
        }

        // 插入跟随者（包括测试伙伴）
        if (this.followers && Array.isArray(this.followers)) {
            var followersInserted = 0;
            for (var i = 0; i < this.followers.length; i++) {
                var follower = this.followers[i];
                if (follower && typeof follower.x === 'number' && typeof follower.y === 'number') {
                    // 确保跟随者有正确的类型
                    if (!follower.type) {
                        follower.type = 'follower';
                    }
                    this.viewportCulling.quadTree.insert(follower);
                    follower.quadTreeInserted = true;
                    followersInserted++;

                    // 调试信息：检查前几个跟随者
                    if (followersInserted <= 3) {
                        console.log('[InsertEntities] 跟随者', i, '插入成功:', {
                            type: follower.type,
                            x: follower.x,
                            y: follower.y,
                            quadTreeInserted: follower.quadTreeInserted,
                            isTestPartner: follower.isTestPartner
                        });
                    }
                }
            }
            console.log('[InsertEntities] 成功插入跟随者到四叉树:', followersInserted, '/', this.followers.length);
        }
    } catch (error) {
        console.error('[InsertEntities] 插入实体到四叉树时出错:', error);
        throw error;
    }
};


// 优化：为静态实体添加缓存标记
GameEngine.prototype.markStaticEntities = function () {
    // 标记建筑为静态实体
    if (this.buildings && Array.isArray(this.buildings)) {
        for (var i = 0; i < this.buildings.length; i++) {
            var building = this.buildings[i];
            if (building) {
                building.isStatic = true;
                building.lastQuadTreeX = building.x;
                building.lastQuadTreeY = building.y;

                // 确保建筑物有正确的类型标记
                if (!building.type) {
                    building.type = 'building';
                }
            }
        }
    }
    
    // 记录玩家初始位置
    if (this.player) {
        this.player.lastViewportUpdateX = this.player.x;
        this.player.lastViewportUpdateY = this.player.y;
    }
};

// 清理测试伙伴（简化版）
GameEngine.prototype.cleanupTestPartnersDirectly = function () {
    if (!this.followers || !Array.isArray(this.followers)) {
        return;
    }

    var removedCount = 0;

    for (var i = this.followers.length - 1; i >= 0; i--) {
        var follower = this.followers[i];
        if (follower && follower.isTestPartner) {
            this.followers.splice(i, 1);
            removedCount++;
        }
    }

    if (removedCount > 0) {
        console.log('[TestMode] 🧪 直接清理测试伙伴完成，移除数量:', removedCount);
    }
};


// 强制渲染测试伙伴（传统渲染回退方案）
GameEngine.prototype.renderTestPartnersDirectly = function () {
    if (!this.followers || !Array.isArray(this.followers)) {
        return;
    }

    var testPartnersCount = 0;

    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        if (follower && follower.isTestPartner) {
            testPartnersCount++;
            // 使用您现有的跟随者渲染方法
            this.renderSingleFollower(follower, i);
        }
    }

    if (testPartnersCount > 0) {
        console.log('[TestMode] 🧪 传统渲染系统渲染了', testPartnersCount, '个真正测试伙伴');
    }
};


// 检查四叉树状态（调试用）
GameEngine.prototype.checkQuadTreeStatus = function () {
    if (!this.viewportCulling || !this.viewportCulling.quadTree) {
        console.log('[QuadTree] 四叉树未初始化');
        return;
    }

    try {
        // 使用全图查询获取四叉树中的所有对象
        var fullRange = new Bounds(0, 0, this.mapConfig.width, this.mapConfig.height);
        var allObjects = this.viewportCulling.quadTree.query(fullRange);
        var objectTypes = {};

        // 统计各类型对象的数量
        for (var i = 0; i < allObjects.length; i++) {
            var obj = allObjects[i];
            if (obj && obj.type) {
                objectTypes[obj.type] = (objectTypes[obj.type] || 0) + 1;
            } else {
                objectTypes['unknown'] = (objectTypes['unknown'] || 1) + 1;
            }
        }

        console.log('[QuadTree] 四叉树状态检查:', {
            totalObjects: allObjects.length,
            objectTypes: objectTypes,
            quadTreeInitialized: this.viewportCulling.quadTreeInitialized
        });

    } catch (error) {
        console.error('[QuadTree] 检查四叉树状态时出错:', error);
    }
};

// 创建测试伙伴实体
GameEngine.prototype.createTestPartner = function (index, x, y) {
    try {
        // 使用不同的角色ID，确保多样性（2-20的角色ID）
        var characterId = (index % 19) + 2;

        var testPartner = {
            id: 'test_partner_' + index,
            characterId: characterId,
            name: '🧪测试伙伴' + index, // 添加测试标识
            x: x,
            y: y,
            type: 'follower', // 改为follower类型，确保能被正确渲染
            isFollowing: false,
            isDead: false,
            quadTreeInserted: false,
            isTestPartner: true, // 标记为测试伙伴，便于后续清理
            character: this.characterManager.characters[characterId],
            personality: this.getCharacterPersonality(this.characterManager.characters[characterId])
        };

        // 调试信息：确认测试伙伴属性
        console.log('[TestMode] 🧪 创建测试伙伴:', {
            id: testPartner.id,
            type: testPartner.type,
            x: testPartner.x,
            y: testPartner.y,
            isTestPartner: testPartner.isTestPartner
        });

        return testPartner;

    } catch (error) {
        console.error('[TestMode] 创建测试伙伴失败:', error);
        return null;
    }
};

// 清理所有测试伙伴
GameEngine.prototype.cleanupTestPartners = function () {
    if (!this.npcs || !Array.isArray(this.npcs)) {
        return;
    }

    var removedCount = 0;

    // 从后往前遍历，移除所有测试伙伴
    for (var i = this.npcs.length - 1; i >= 0; i--) {
                var npc = this.npcs[i];
        if (npc && npc.isTestPartner) {
            // 从视距裁剪系统移除
            if (npc.quadTreeInserted && this.viewportCulling && this.viewportCulling.quadTree) {
                this.viewportCulling.quadTree.remove(npc);
            }

            // 从NPC列表中移除
            this.npcs.splice(i, 1);
            removedCount++;
        }
    }

    if (removedCount > 0) {
        console.log('[TestMode] 🧪 清理测试伙伴完成，移除数量:', removedCount);
    }
};


// ========================================
// 测试代码结束
// ========================================


GameEngine.prototype.renderPlayer = function () {
    this.characterManager.renderCurrentCharacter(this.ctx, this.player.x, this.player.y, this.player);
    this.renderCharacterHealthBar(this.player, this.player.x, this.player.y);
};

GameEngine.prototype.renderCharacterHealthBar = function (character, x, y) {
    if (character.health <= 0 || character.isDead) return;

    var healthPercentage = character.health / character.maxHealth;
    var barWidth = 30;
    var barHeight = 4;
    var barY = y - 45;

    this.ctx.save();

    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

    if (healthPercentage > 0.6) {
        this.ctx.fillStyle = '#4CAF50';
    } else if (healthPercentage > 0.3) {
        this.ctx.fillStyle = '#FF9800';
    } else {
        this.ctx.fillStyle = '#F44336';
    }

    this.ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercentage, barHeight);

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - barWidth / 2, barY, barWidth, barHeight);

    if (character === this.player) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(character.health + '/' + character.maxHealth, x, barY - 2);
    }

    this.ctx.restore();
};

GameEngine.prototype.renderStatusBar = function () {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, 60);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('第 ' + this.gameData.survivalDays + ' 天', 10, 25);
    this.ctx.fillText('🍞 ' + this.gameData.food, 10, 45);
    this.ctx.fillText('👥 ' + this.gameData.teamSize, 120, 25);
    
    // 调试信息：显示NPC和跟随者数量
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '12px Arial';
    this.ctx.fillText('NPC:' + this.npcs.length + ' 跟随:' + this.followers.length, 10, 55);
    
    // 显示碰撞阈值信息
            this.ctx.fillText('碰撞阈值:' + Math.sqrt(zombieModule.GAME_CONFIG.TEAM.COLLISION_THRESHOLD) + 'px', 200, 55);
};

GameEngine.prototype.renderTimeInfo = function () {
    this.ctx.save();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(this.canvas.width - 200, 10, 190, 80);

    this.ctx.strokeStyle = '#3498db';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.canvas.width - 200, 10, 190, 80);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';

    this.ctx.fillText('生存天数: ' + this.gameData.survivalDays, this.canvas.width - 190, 35);

    var gameTime = Math.floor((Date.now() / 1000) % (24 * 60 * 60));
    var hours = Math.floor(gameTime / 3600);
    var minutes = Math.floor((gameTime % 3600) / 60);
    var timeString = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
    this.ctx.fillText('时间: ' + timeString, this.canvas.width - 190, 55);

    var character = this.characterManager.getCurrentCharacter();
    this.ctx.fillText('角色: ' + character.name, this.canvas.width - 190, 75);

    this.ctx.restore();
};

// 继续渲染函数
GameEngine.prototype.renderNPCs = function () {
    // 使用缓存的视口信息，避免重复计算
    if (!this.cachedViewport || this.cachedViewport.frame !== this.frameCount) {
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;

        this.cachedViewport = {
            frame: this.frameCount,
            left: viewLeft - 50,
            right: viewRight + 50,
            top: viewTop - 50,
            bottom: viewBottom + 50
        };
    }

    var viewport = this.cachedViewport;
    var npcsToRender = 0;

    // 使用视距裁剪系统优化渲染
    if (this.viewportCulling && this.viewportCulling.visibleEntities && this.viewportCulling.visibleEntities.npcs) {
        // 只渲染视距裁剪系统标记为可见的NPC
        var visibleNPCs = this.viewportCulling.visibleEntities.npcs;
        for (var i = 0; i < visibleNPCs.length; i++) {
            var npc = visibleNPCs[i];
            if (npc && this.isNPCOnScreen(npc, viewport)) {
                this.renderSingleNPC(npc);
                npcsToRender++;
            }
        }
    } else {
        // 回退到传统渲染方式
    for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];
            if (npc && this.isNPCOnScreen(npc, viewport)) {
            this.renderSingleNPC(npc);
                npcsToRender++;
            }
        }
    }

    // 性能监控
    if (this.frameCount % 60 === 0) {
        this.npcRenderStats = {
            total: this.npcs.length,
            rendered: npcsToRender,
            efficiency: (npcsToRender / this.npcs.length * 100).toFixed(1)
        };
    }
};

// 检查NPC是否在屏幕上（优化版）
GameEngine.prototype.isNPCOnScreen = function (npc, viewport) {
    return npc.x >= viewport.left && npc.x <= viewport.right && npc.y >= viewport.top && npc.y <= viewport.bottom;
};

GameEngine.prototype.renderSingleNPC = function (npc) {
    var npcPlayer = {
        isWalking: npc.speed > 0 && !npc.isFollowing || (npc.isFollowing && npc.speed > 0),
        walkAnimationFrame: (Date.now() / 200) % 4,
        walkAnimationSpeed: 200,
        lastAnimationTime: 0,
        direction: 'down'
    };

    if (npc.character && npc.character.render) {
        npc.character.render(this.ctx, npc.x, npc.y, npcPlayer);
    } else {
        this.renderDefaultNPC(npc);
    }

    if (npc.isFollowing) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(npc.x, npc.y - 40, 5, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
    }
};

GameEngine.prototype.renderDefaultNPC = function (npc) {
    this.ctx.save();

    // 如果有角色数据，使用角色渲染方法（人物形状）
    if (npc.character && npc.character.render) {
        var npcPlayer = {
            isWalking: npc.isWalking || false,
            walkAnimationFrame: (Date.now() / 200) % 4,
            walkAnimationSpeed: 200,
            lastAnimationTime: 0,
            direction: npc.direction || 'down'
        };

        npc.character.render(this.ctx, npc.x, npc.y, npcPlayer);
        console.log('[RenderNPC] 使用角色渲染:', npc.name, '角色ID:', npc.characterId);
    } else {
        console.warn('[RenderNPC] 无法使用角色渲染:', npc.name, 'character:', !!npc.character, 'render方法:', !!(npc.character && npc.character.render));
    }

    this.ctx.restore();
};

GameEngine.prototype.renderFollowers = function () {
    try {
        if (!this.followers || !Array.isArray(this.followers)) return;

        for (var i = 0; i < this.followers.length; i++) {
            var follower = this.followers[i];

            if (!follower || typeof follower.x !== 'number' || typeof follower.y !== 'number') {
                continue;
            }

            this.renderSingleFollower(follower, i);
        }
    } catch (error) {
        console.error('[Render] 渲染跟随者时出错:', error);
    }
};

GameEngine.prototype.renderSingleFollower = function (follower, index) {
    var character = follower.character || this.characterManager.characters[2];
    var personality = follower.personality || this.getCharacterPersonality(character);

    this.ctx.save();
    this.applyFollowerPersonalityEffects(follower, personality);
    this.renderFollowerCharacter(follower, character);
    this.renderPersonalityIndicator(follower, personality, index);
    this.ctx.restore();
};

GameEngine.prototype.renderFollowerCharacter = function (follower, character) {
    this.renderDefaultFollower(follower);

    if (follower.health > 0 && !follower.isDead) {
        this.renderCharacterHealthBar(follower, follower.x, follower.y);
    }
};

GameEngine.prototype.renderDefaultFollower = function (follower) {
    this.ctx.save();

    // 如果有角色数据，使用角色渲染方法（与NPC保持一致的形状）
    if (follower.character && follower.character.render) {
        var followerPlayer = {
            isWalking: follower.isWalking || false,
            walkAnimationFrame: (Date.now() / 200) % 4,
            walkAnimationSpeed: 200,
            lastAnimationTime: 0,
            direction: follower.direction || 'down'
        };

        follower.character.render(this.ctx, follower.x, follower.y, followerPlayer);
    } else {
        // 如果没有角色数据，使用默认的彩色方块渲染（备用方案）
    var personality = follower.personality;
    var baseColor = '#3498db';

    if (personality) {
        switch (personality.personalityType) {
            case 'leader':
                baseColor = '#f1c40f';
                break;
            case 'supporter':
                baseColor = '#e74c3c';
                break;
            case 'scout':
                baseColor = '#3498db';
                break;
            case 'guardian':
                baseColor = '#27ae60';
                break;
            case 'independent':
                baseColor = '#9b59b6';
                break;
        }
    }

        // 渲染人物形状（不同颜色的方块）
    this.ctx.fillStyle = baseColor;
    this.ctx.fillRect(follower.x - 10, follower.y - 10, 20, 20);

        // 人物边框
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(follower.x - 10, follower.y - 10, 20, 20);

        // 行走状态指示器
    if (follower.isWalking) {
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(follower.x - 12, follower.y - 12, 24, 3);
        }
    }

    this.ctx.restore();
};

GameEngine.prototype.applyFollowerPersonalityEffects = function (follower, personality) {
    switch (personality.personalityType) {
        case 'leader':
            this.ctx.globalAlpha = 0.9;
            break;
        case 'supporter':
            this.ctx.globalAlpha = 0.9;
            break;
        case 'scout':
            this.ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
            break;
        case 'guardian':
            this.ctx.globalAlpha = 0.95;
            break;
        case 'independent':
            this.ctx.globalAlpha = 0.7;
            break;
        default:
            this.ctx.globalAlpha = 1.0;
            break;
    }
};

GameEngine.prototype.renderPersonalityIndicator = function (follower, personality, index) {
    var indicatorY = follower.y - 25;

    switch (personality.personalityType) {
        case 'leader':
            this.renderStarIndicator(follower.x, indicatorY, '#f1c40f');
            break;
        case 'supporter':
            this.renderHeartIndicator(follower.x, indicatorY, '#e74c3c');
            break;
        case 'scout':
            this.renderEyeIndicator(follower.x, indicatorY, '#3498db');
            break;
        case 'guardian':
            this.renderShieldIndicator(follower.x, indicatorY, '#27ae60');
            break;
        case 'independent':
            this.renderArrowIndicator(follower.x, indicatorY, '#9b59b6');
            break;
    }

    if (follower.followStartTime) {
        var followDuration = Math.floor((Date.now() - follower.followStartTime) / 1000);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(followDuration + 's', follower.x, indicatorY - 10);
    }
};

GameEngine.prototype.renderStarIndicator = function (x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('★', x, y);
};

GameEngine.prototype.renderHeartIndicator = function (x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('♥', x, y);
};

GameEngine.prototype.renderEyeIndicator = function (x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('👁', x, y);
};

GameEngine.prototype.renderShieldIndicator = function (x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🛡', x, y);
};

GameEngine.prototype.renderArrowIndicator = function (x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('→', x, y);
};

// 建筑渲染和其他渲染函数
GameEngine.prototype.renderVisibleBuildings = function () {
    var self = this;
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;

    // 使用for循环渲染建筑，避免函数调用开销
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        if (building.x + building.width >= viewLeft && building.x <= viewRight && building.y + building.height >= viewTop && building.y <= viewBottom) {

            this.ctx.fillStyle = building.explored ? building.color : this.lightenColor(building.color, 0.3);
            this.ctx.fillRect(building.x, building.y, building.width, building.height);

            var doorWidth = Math.max(30, Math.floor(building.width / 8));
            var doorHeight = Math.max(40, Math.floor(building.height / 6));
            var doorX = building.x + (building.width - doorWidth) / 2;
            var doorY = building.y + building.height - doorHeight - 5;

            this.ctx.fillStyle = building.explored ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.6)';
            this.ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

            if (this.nearBuilding && (this.nearBuilding.id === building.id || this.nearBuilding.name === building.name)) {
                this.ctx.save();
                this.ctx.shadowColor = '#3498db';
                this.ctx.shadowBlur = 15;
                this.ctx.strokeStyle = '#3498db';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(doorX - 2, doorY - 2, doorWidth + 4, doorHeight + 4);
                this.ctx.restore();
                
                // 弹出提示在checkNearDoor函数中处理，这里只负责门变色
            }

            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(building.x, building.y, building.width, building.height);

            if (!building.explored) {
                this.ctx.strokeStyle = '#f1c40f';
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([5, 5]);
                this.ctx.strokeRect(building.x - 3, building.y - 3, building.width + 6, building.height + 6);
                this.ctx.setLineDash([]);
            }

            var fontSize = Math.max(20, Math.floor(building.width / 12));
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold ' + fontSize + 'px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = Math.max(3, Math.floor(fontSize / 6));

            var textX = building.x + building.width / 2;
            var textY = building.y + building.height / 3;

            this.ctx.strokeText(building.name, textX, textY);
            this.ctx.fillText(building.name, textX, textY);
        }
    }

    this.ctx.textAlign = 'left';
};

GameEngine.prototype.lightenColor = function (color, amount) {
    var hex = color.replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * amount));
    g = Math.min(255, Math.floor(g + (255 - g) * amount));
    b = Math.min(255, Math.floor(b + (255 - b) * amount));

    var rHex = r.toString(16);
    if (rHex.length === 1) rHex = '0' + rHex;
    var gHex = g.toString(16);
    if (gHex.length === 1) gHex = '0' + gHex;
    var bHex = b.toString(16);
    if (bHex.length === 1) bHex = '0' + bHex;

    return '#' + rHex + gHex + bHex;
};

GameEngine.prototype.renderMiniMap = function () {
    var miniMapSize = 90;
    var miniMapX = this.canvas.width - miniMapSize - 8;
    var miniMapY = 65;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);

    var zoomFactor = 0.3;
    var viewRange = Math.min(this.mapConfig.width, this.mapConfig.height) * zoomFactor;

    var worldCenterX = this.player.x;
    var worldCenterY = this.player.y;
    var worldLeft = worldCenterX - viewRange / 2;
    var worldRight = worldCenterX + viewRange / 2;
    var worldTop = worldCenterY - viewRange / 2;
    var worldBottom = worldCenterY + viewRange / 2;

    if (worldLeft < 0) {
        worldRight += -worldLeft;
        worldLeft = 0;
    }
    if (worldRight > this.mapConfig.width) {
        worldLeft -= (worldRight - this.mapConfig.width);
        worldRight = this.mapConfig.width;
    }
    if (worldTop < 0) {
        worldBottom += -worldTop;
        worldTop = 0;
    }
    if (worldBottom > this.mapConfig.height) {
        worldTop -= (worldBottom - this.mapConfig.height);
        worldBottom = this.mapConfig.height;
    }

    var scaleX = miniMapSize / (worldRight - worldLeft);
    var scaleY = miniMapSize / (worldBottom - worldTop);

    var playerMiniX = miniMapX + (this.player.x - worldLeft) * scaleX;
    var playerMiniY = miniMapY + (this.player.y - worldTop) * scaleY;

    this.ctx.fillStyle = '#3498db';
    this.ctx.beginPath();
    this.ctx.arc(playerMiniX, playerMiniY, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // 使用for循环渲染小地图建筑，避免函数调用开销
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        if (building.x >= worldLeft && building.x <= worldRight && building.y >= worldTop && building.y <= worldBottom) {

            var buildingMiniX = miniMapX + (building.x - worldLeft) * scaleX;
            var buildingMiniY = miniMapY + (building.y - worldTop) * scaleY;

            if (building.explored) {
                this.ctx.fillStyle = building.color;
                this.ctx.fillRect(buildingMiniX - 1, buildingMiniY - 1, 3, 3);
            } else {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.fillRect(buildingMiniX, buildingMiniY, 1, 1);
            }
        }
    }

    var gameViewWidth = this.canvas.width / this.camera.zoom;
    var gameViewHeight = this.canvas.height / this.camera.zoom;
    var cameraMiniX = miniMapX + (this.camera.x - worldLeft) * scaleX;
    var cameraMiniY = miniMapY + (this.camera.y - worldTop) * scaleY;
    var viewMiniW = gameViewWidth * scaleX;
    var viewMiniH = gameViewHeight * scaleY;

    this.ctx.strokeStyle = '#f1c40f';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(cameraMiniX, cameraMiniY, viewMiniW, viewMiniH);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('地图', miniMapX + miniMapSize / 2, miniMapY + miniMapSize + 12);
    this.ctx.textAlign = 'left';
};

GameEngine.prototype.renderJoystick = function () {
    var joystickRadius = 60;
    var knobRadius = 25;
    
    // 抖音平台适配：默认位置在屏幕底部中央
    var joystickX = this.canvas.width / 2;
    var joystickY = this.canvas.height - 100;
    
    // 触摸区域动态扩展：手指移动时范围+50%
    var touchRadius = joystickRadius;
    if (this.joystick.active && (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0)) {
        touchRadius = joystickRadius * 1.5;
    }

    this.ctx.save();

    // 半透明背景（降低视觉干扰）
    this.ctx.beginPath();
    this.ctx.arc(joystickX, joystickY, touchRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; // 更透明
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; // 更透明
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(joystickX, joystickY, joystickRadius - 15, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 只有在摇杆激活时才显示手柄位置
    var knobX = this.joystick.active ? joystickX + this.joystick.direction.x * (joystickRadius - knobRadius) : joystickX;
    var knobY = this.joystick.active ? joystickY + this.joystick.direction.y * (joystickRadius - knobRadius) : joystickY;

    this.ctx.beginPath();
    this.ctx.arc(knobX, knobY, knobRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(knobX, knobY, 8, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
    this.ctx.fill();

    // 只有在摇杆激活且方向不为零时才显示方向线
    if (this.joystick.active && (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0)) {
        this.ctx.beginPath();
        this.ctx.moveTo(joystickX, joystickY);
        this.ctx.lineTo(knobX, knobY);
        this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    this.ctx.restore();
    
    // 调试信息：显示摇杆状态
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('摇杆状态: ' + (this.joystick.active ? '激活' : '未激活'), joystickX - 50, joystickY + joystickRadius + 20);
        this.ctx.fillText('方向: (' + this.joystick.direction.x.toFixed(2) + ', ' + this.joystick.direction.y.toFixed(2) + ')', joystickX - 50, joystickY + joystickRadius + 35);
        this.ctx.restore();
    }
};

GameEngine.prototype.renderBuildingEntryPrompt = function () {
    console.log('[Render] 尝试渲染弹出提示:', this.buildingEntryPrompt);
    if (!this.buildingEntryPrompt || !this.buildingEntryPrompt.active) {
        console.log('[Render] 弹出提示无效或未激活');
        return;
    }
    console.log('[Render] 开始渲染弹出提示:', this.buildingEntryPrompt.message);

    var prompt = this.buildingEntryPrompt;
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    var boxWidth = 300;
    var boxHeight = 150;
    var boxX = centerX - boxWidth / 2;
    var boxY = centerY - boxHeight / 2;

    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeStyle = '#3498db';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('进入建筑', centerX, boxY + 30);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(prompt.message, centerX, boxY + 60);

    var buttonWidth = 80;
    var buttonHeight = 35;
    var buttonY = boxY + 90;

    var enterButtonX = centerX - buttonWidth - 20;
    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(enterButtonX, buttonY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('进入', centerX - buttonWidth - 20 + buttonWidth / 2, buttonY + 25);

    var cancelButtonX = centerX + 20;
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.fillRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('取消', centerX + 20 + buttonWidth / 2, buttonY + 25);

    this.ctx.restore();
};

GameEngine.prototype.renderSubMap = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = '#ecf0f1';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(50, 100, 300, 200);

    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(60, 110, 280, 180);

    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(195, 280, 10, 20);
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(197, 285, 2, 2);

    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('出口', 200, 315);

    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.currentBuilding ? this.currentBuilding.name : '建筑内部', this.canvas.width / 2, 50);

    // 渲染房间内的僵尸，使用主地图僵尸的渲染系统
    if (this.gameState !== 'gameover' && this.gameState !== 'menu') {
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
            if (zombie.render && typeof zombie.render === 'function') {
                // 创建房间内的相机对象，用于僵尸渲染
                var roomCamera = {
                    x: 0, y: 0, zoom: 1
                };
                zombie.render(this.ctx, roomCamera);
            }
        }
    }

    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(resource.x - 6, resource.y - 6, 12, 12);
        this.ctx.fillStyle = '#e67e22';
        this.ctx.fillRect(resource.x - 4, resource.y - 4, 8, 8);
    }

    this.renderPlayer();
    this.renderNPCsInSubMap();

    var exitX = 200;
    var exitY = 290;
    var distanceToExit = Math.sqrt(Math.pow(this.player.x - exitX, 2) + Math.pow(this.player.y - exitY, 2));

    if (distanceToExit < 25) {
        this.ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('靠近门口即可退出', this.canvas.width / 2, this.canvas.height - 30);

        if (distanceToExit < 15) {
            mapModule.exitBuilding(this);
        }
    }

    this.renderStatusBar();
};

GameEngine.prototype.renderNPCsInSubMap = function () {
    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        this.renderSingleNPC(follower);
    }
};

GameEngine.prototype.renderGameOver = function () {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束', centerX, centerY - 60);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('生存天数: ' + this.gameData.survivalDays, centerX, centerY);
    this.ctx.fillText('击杀僵尸: ' + this.gameData.zombieKills, centerX, centerY + 40);

    this.ctx.fillStyle = '#3498db';
    this.ctx.fillRect(centerX - 80, centerY + 80, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('重新开始', centerX, centerY + 110);

    this.ctx.fillStyle = '#95a5a6';
    this.ctx.fillRect(centerX - 80, centerY + 150, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('返回菜单', centerX, centerY + 180);
};

GameEngine.prototype.renderVictory = function () {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;

    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#f39c12';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('胜利！', centerX, centerY - 60);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('恭喜你生存了100天！', centerX, centerY);
    this.ctx.fillText('最终击杀数: ' + this.gameData.zombieKills, centerX, centerY + 40);
    this.ctx.fillText('最终团队规模: ' + this.gameData.teamSize, centerX, centerY + 70);

    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(centerX - 80, centerY + 100, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('重新开始', centerX, centerY + 130);

    this.ctx.fillStyle = '#95a5a6';
    this.ctx.fillRect(centerX - 80, centerY + 170, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('返回菜单', centerX, centerY + 190);
};

GameEngine.prototype.renderFPS = function () {
    if (!this.fps) return;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('FPS: ' + this.fps, 10, 20);
    this.ctx.fillText('Delta: ' + this.deltaTime.toFixed(2) + 'ms', 10, 40);
};


// 将函数定义移到调用之前
function initGame() {
    try {
        // 检查抖音小程序环境
        if (typeof tt === 'undefined') {
            throw new Error('未检测到抖音小程序环境 (tt对象不存在)');
        }
        // 获取系统信息
        var systemInfo;
        try {
            systemInfo = tt.getSystemInfoSync();

        } catch (systemError) {
            console.error('[Main] 获取系统信息失败:', systemError);
            // 使用默认值
            systemInfo = {
                windowWidth: 375, windowHeight: 667, pixelRatio: 2, platform: 'unknown'
            };
        }
        // 创建画布
        var canvas, ctx;
        try {
            canvas = tt.createCanvas();

            ctx = canvas.getContext('2d');

            // 设置画布尺寸
            canvas.width = systemInfo.windowWidth;
            canvas.height = systemInfo.windowHeight;


            // 验证画布功能
            if (!canvas.width || !canvas.height) {
                throw new Error('画布尺寸设置失败');
            }

            if (!ctx || typeof ctx.fillRect !== 'function') {
                throw new Error('2D上下文功能异常');
            }

        } catch (canvasError) {
            console.error('[Main] 画布创建失败:', canvasError);
            throw new Error('画布初始化失败: ' + canvasError.message);
        }

        // 为抖音小程序Canvas添加兼容性方法
        if (!canvas.getBoundingClientRect) {
            canvas.getBoundingClientRect = function () {
                return {
                    left: 0,
                    top: 0,
                    right: this.width,
                    bottom: this.height,
                    width: this.width,
                    height: this.height,
                    x: 0,
                    y: 0
                };
            };
        }

        // 添加其他可能缺失的Canvas方法
        if (!canvas.offsetLeft) {
            canvas.offsetLeft = 0;
        }
        if (!canvas.offsetTop) {
            canvas.offsetTop = 0;
        }

        var gameEngine = new GameEngine(canvas, ctx);
        gameEngine.start();
        
            // 延迟检查建筑物状态
        setTimeout(function () {
        if (gameEngine.buildings && gameEngine.buildings.length > 0) {
            console.log('[Main] 建筑物状态检查 - 总数:', gameEngine.buildings.length);
            console.log('[Main] 视距裁剪系统状态:', !!gameEngine.viewportCulling);
            if (gameEngine.viewportCulling) {
                console.log('[Main] 可见建筑物数量:', gameEngine.viewportCulling.visibleEntities.buildings.length);
            }
        }
        
        // 内存泄漏检测
        gameEngine.startMemoryLeakDetection();

            // 性能监控
            gameEngine.startPerformanceMonitoring();
    }, 1000);

    } catch (error) {
        console.error('[Main] 游戏初始化失败:', error);
        throw error;
    }
}

try {
    initGame();
} catch (error) {
    console.error('[Main] 游戏启动失败:', error);
}

// 清理定时器和事件监听器
GameEngine.prototype.cleanupTimersAndListeners = function () {
    try {
        console.log('[Cleanup] 开始清理定时器和事件监听器...');

        // 清理所有定时器
        if (this.memoryLeakTimer) {
            clearInterval(this.memoryLeakTimer);
            this.memoryLeakTimer = null;
        }

        if (this.debugTimer) {
            clearInterval(this.debugTimer);
            this.debugTimer = null;
        }

        if (this.performanceTimer) {
            clearInterval(this.performanceTimer);
            this.performanceTimer = null;
        }

        if (this.npcUpdateTimer) {
            this.npcUpdateTimer = 0;
        }

        // 清理事件绑定标志
        this.eventsBound = false;

        // 清理触摸事件引用
        if (this.canvas) {
            // 移除所有事件监听器
            this.canvas.removeEventListener = this.canvas.removeEventListener || function () {
            };
            this.canvas.removeEventListener('touchstart', this.onTouchStart);
            this.canvas.removeEventListener('touchmove', this.onTouchMove);
            this.canvas.removeEventListener('touchend', this.onTouchEnd);
        }

        // 清理摇杆状态
        if (this.joystick) {
            this.joystick.active = false;
            this.joystick.direction = {x: 0, y: 0};
            this.joystick.centerX = 0;
            this.joystick.centerY = 0;
        }

        console.log('[Cleanup] 定时器和事件监听器清理完成');

    } catch (error) {
        console.error('[Cleanup] 清理定时器和事件监听器时出错:', error);
    }
};

// 启动性能监控
GameEngine.prototype.startPerformanceMonitoring = function () {
    if (this.performanceTimer) {
        clearInterval(this.performanceTimer);
    }

    this.performanceTimer = setInterval(function () {
        this.monitorPerformance();
    }.bind(this), 2000); // 每2秒监控一次

    console.log('[Performance] 性能监控已启动');
};

// 性能监控
GameEngine.prototype.monitorPerformance = function () {
    try {
        var stats = {
            fps: this.calculateFPS(),
            memory: this.getMemoryUsage(),
            render: this.npcRenderStats || {total: 0, rendered: 0, efficiency: '0%'},
            update: this.npcUpdateStats || {total: 0, updated: 0, efficiency: '0%'},
            entities: {
                npcs: this.npcs ? this.npcs.length : 0,
                followers: this.followers ? this.followers.length : 0,
                zombies: this.zombieManager ? this.zombieManager.zombies.length : 0
            }
        };

        console.log('[Performance] 性能统计:', stats);

        // 性能警告
        if (stats.fps < 30) {
            console.warn('[Performance] FPS过低:', stats.fps);
        }

        if (stats.render.efficiency < 50) {
            console.warn('[Performance] 渲染效率过低:', stats.render.efficiency + '%');
        }

    } catch (error) {
        console.error('[Performance] 性能监控出错:', error);
    }
};

// 计算FPS
GameEngine.prototype.calculateFPS = function () {
    if (!this.lastFrameTime) {
        this.lastFrameTime = Date.now();
        this.frameCount = 0;
        return 0;
    }

    this.frameCount++;
    var currentTime = Date.now();
    var timeDiff = currentTime - this.lastFrameTime;

    if (timeDiff >= 1000) { // 每秒计算一次
        var fps = Math.round((this.frameCount * 1000) / timeDiff);
        this.lastFrameTime = currentTime;
        this.frameCount = 0;
        return fps;
    }

    return this.lastFPS || 0;
};

// 获取内存使用情况
GameEngine.prototype.getMemoryUsage = function () {
    if (typeof performance !== 'undefined' && performance.memory) {
        return {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        };
    }

    return {
        used: 'N/A', total: 'N/A', limit: 'N/A'
    };
};



