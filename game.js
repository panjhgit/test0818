/**
 * 末日Q行 - 抖音小程序游戏
 * 一个生存至100天的挑战游戏
 * 使用ES5语法，完全兼容抖音小程序环境
 */

console.log('=== 末日Q行游戏启动 ===');
console.log('参考文档: https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/introduction');

/**
 * 游戏引擎构造函数 - 兼容抖音小程序环境
 */
function GameEngine(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.running = false;
    this.gameState = 'menu'; // menu, playing, submap, gameover, victory
    this.lastTime = 0;
    
    // 游戏数据
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
    
    // 游戏对象
    this.buildings = this.initializeBuildings();
    this.player = { x: 200, y: 300, health: 20, maxHealth: 20, level: 1 };
    this.companions = [];
    this.currentBuilding = null;
    this.exploredBuildings = [];
    
    // 子地图状态
    this.zombies = [];
    this.resources = [];
    this.subMapType = null;
    
    this.setupInput();
    console.log('[GameEngine] 游戏引擎已初始化');
}

/**
 * 初始化建筑物
 */
GameEngine.prototype.initializeBuildings = function() {
    return [
        { id: 'police_station', name: '警察局', type: 'police_station', x: 100, y: 150, width: 60, height: 60, explored: false, color: '#3498db' },
        { id: 'hospital', name: '医院', type: 'hospital', x: 200, y: 150, width: 60, height: 60, explored: false, color: '#e74c3c' },
        { id: 'school', name: '学校', type: 'school', x: 300, y: 150, width: 60, height: 60, explored: false, color: '#f39c12' },
        { id: 'house1', name: '民房', type: 'house', x: 100, y: 250, width: 50, height: 50, explored: false, color: '#95a5a6' },
        { id: 'villa', name: '别墅', type: 'villa', x: 200, y: 250, width: 70, height: 50, explored: false, color: '#8e44ad' },
        { id: 'shop', name: '商店', type: 'shop', x: 300, y: 250, width: 60, height: 50, explored: false, color: '#27ae60', oneTimeOnly: true },
        { id: 'bar', name: '酒吧', type: 'bar', x: 100, y: 350, width: 50, height: 50, explored: false, color: '#d35400', oneTimeOnly: true },
        { id: 'restaurant', name: '餐厅', type: 'restaurant', x: 200, y: 350, width: 60, height: 50, explored: false, color: '#e67e22', oneTimeOnly: true },
        { id: 'station', name: '车站', type: 'station', x: 300, y: 350, width: 60, height: 50, explored: false, color: '#34495e' }
    ];
};

/**
 * 设置输入处理
 */
GameEngine.prototype.setupInput = function() {
    var self = this;
    
    this.joystick = {
        active: false,
        centerX: 0,
        centerY: 0,
        currentX: 0,
        currentY: 0,
        direction: { x: 0, y: 0 }
    };
    
    // 抖音小程序触摸事件
    if (typeof tt !== 'undefined') {
        // 使用抖音小程序的触摸事件API
        this.canvas.addEventListener('touchstart', function(e) {
            self.onTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function(e) {
            self.onTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function(e) {
            self.onTouchEnd(e);
        });
        this.canvas.addEventListener('tap', function(e) {
            self.onClick(e);
        });
    } else {
        // 标准浏览器事件
        this.canvas.addEventListener('touchstart', function(e) {
            self.onTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function(e) {
            self.onTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function(e) {
            self.onTouchEnd(e);
        });
        this.canvas.addEventListener('click', function(e) {
            self.onClick(e);
        });
    }
    
    console.log('[GameEngine] 输入系统已初始化');
};

/**
 * 触摸开始
 */
GameEngine.prototype.onTouchStart = function(e) {
    if (e.preventDefault) e.preventDefault();
    
    var touch = e.touches && e.touches[0] ? e.touches[0] : e;
    var x, y;
    
    // 抖音小程序坐标处理
    if (touch.x !== undefined && touch.y !== undefined) {
        x = touch.x;
        y = touch.y;
    } else if (touch.clientX !== undefined && touch.clientY !== undefined) {
        x = touch.clientX;
        y = touch.clientY;
    } else {
        x = 0;
        y = 0;
    }
    
    console.log('[Input] 触摸开始位置:', x, y);
    
    // 保存触摸开始位置，用于后续的tap检测
    this.touchStartX = x;
    this.touchStartY = y;
    this.touchStartTime = Date.now();
    
    // 检查是否在虚拟摇杆区域（左下角）
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        if (x < this.canvas.width / 3 && y > this.canvas.height * 2 / 3) {
            this.joystick.active = true;
            this.joystick.centerX = x;
            this.joystick.centerY = y;
            this.joystick.currentX = x;
            this.joystick.currentY = y;
            console.log('[Input] 虚拟摇杆激活');
        }
    }
};

/**
 * 触摸移动
 */
GameEngine.prototype.onTouchMove = function(e) {
    if (e.preventDefault) e.preventDefault();
    if (!this.joystick.active) return;
    
    var touch = e.touches && e.touches[0] ? e.touches[0] : e;
    var x, y;
    
    // 抖音小程序坐标处理
    if (touch.x !== undefined && touch.y !== undefined) {
        x = touch.x;
        y = touch.y;
    } else if (touch.clientX !== undefined && touch.clientY !== undefined) {
        x = touch.clientX;
        y = touch.clientY;
    } else {
        return;
    }
    
    this.joystick.currentX = x;
    this.joystick.currentY = y;
    
    // 计算方向
    var dx = x - this.joystick.centerX;
    var dy = y - this.joystick.centerY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var maxDistance = 60;
    
    if (distance > 10) {
        var normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
        this.joystick.direction.x = (dx / distance) * normalizedDistance;
        this.joystick.direction.y = (dy / distance) * normalizedDistance;
    } else {
        this.joystick.direction.x = 0;
        this.joystick.direction.y = 0;
    }
};

/**
 * 触摸结束
 */
GameEngine.prototype.onTouchEnd = function(e) {
    if (e.preventDefault) e.preventDefault();
    console.log('[Input] 触摸结束');
    
    // 检测是否为快速点击（tap）
    var touchEndTime = Date.now();
    var touchDuration = touchEndTime - this.touchStartTime;
    
    if (touchDuration < 300 && !this.joystick.active) { // 300ms内的快速触摸且不是摇杆操作
        console.log('[Input] 检测到点击手势，触发点击事件');
        // 模拟点击事件
        this.onClick({
            x: this.touchStartX,
            y: this.touchStartY
        });
    }
    
    this.joystick.active = false;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;
};

/**
 * 点击事件
 */
GameEngine.prototype.onClick = function(e) {
    var x, y;
    
    // 抖音小程序坐标处理
    if (e.x !== undefined && e.y !== undefined) {
        x = e.x;
        y = e.y;
    } else if (e.clientX !== undefined && e.clientY !== undefined) {
        x = e.clientX;
        y = e.clientY;
    } else if (e.touches && e.touches[0]) {
        var touch = e.touches[0];
        x = touch.x || touch.clientX || 0;
        y = touch.y || touch.clientY || 0;
    } else {
        x = 0;
        y = 0;
    }
    
    console.log('[Input] 点击位置:', x, y, '游戏状态:', this.gameState);
    
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

/**
 * 处理菜单点击
 */
GameEngine.prototype.handleMenuClick = function(x, y) {
    console.log('[Menu] 菜单点击检测:', x, y);
    
    // 开始游戏按钮区域 (调整为更大的点击区域)
    var buttonX = 150;
    var buttonY = 250;
    var buttonWidth = 200;
    var buttonHeight = 50;
    
    console.log('[Menu] 按钮区域:', buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight);
    
    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('[Menu] 按钮点击成功，开始游戏');
        this.startGame();
    } else {
        console.log('[Menu] 点击位置不在按钮范围内');
    }
};

/**
 * 处理游戏点击
 */
GameEngine.prototype.handleGameClick = function(x, y) {
    var self = this;
    // 检查建筑物点击
    this.buildings.forEach(function(building) {
        if (x >= building.x && x <= building.x + building.width &&
            y >= building.y && y <= building.y + building.height) {
            self.exploreBuilding(building);
        }
    });
};

/**
 * 处理子地图点击
 */
GameEngine.prototype.handleSubMapClick = function(x, y) {
    var self = this;
    // 检查返回按钮
    if (x >= 10 && x <= 90 && y >= this.canvas.height - 40 && y <= this.canvas.height - 10) {
        this.exitSubMap();
        return;
    }
    
    // 检查资源点击
    this.resources.forEach(function(resource) {
        if (!resource.collected) {
            var distance = Math.sqrt((x - resource.x) * (x - resource.x) + (y - resource.y) * (y - resource.y));
            if (distance <= 30) {
                self.collectResource(resource);
            }
        }
    });
};

/**
 * 处理结束画面点击
 */
GameEngine.prototype.handleEndGameClick = function(x, y) {
    // 重新开始按钮
    if (x >= 175 && x <= 325 && y >= 320 && y <= 360) {
        this.restartGame();
    }
};

/**
 * 开始游戏
 */
GameEngine.prototype.startGame = function() {
    console.log('[GameEngine] 开始游戏函数被调用');
    this.gameState = 'playing';
    console.log('[GameEngine] 游戏状态已切换到:', this.gameState);
};

/**
 * 重新开始游戏
 */
GameEngine.prototype.restartGame = function() {
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
    
    this.player = { x: 200, y: 300, health: 20, maxHealth: 20, level: 1 };
    this.companions = [];
    this.exploredBuildings = [];
    
    var self = this;
    this.buildings.forEach(function(building) {
        building.explored = false;
    });
    
    this.gameState = 'playing';
    console.log('[GameEngine] 游戏重新开始');
};

/**
 * 探索建筑物
 */
GameEngine.prototype.exploreBuilding = function(building) {
    if (building.oneTimeOnly && building.explored) {
        console.log('[GameEngine] 该建筑物只能探索一次');
        return;
    }
    
    console.log('[GameEngine] 探索建筑: ' + building.name);
    
    this.currentBuilding = building;
    this.subMapType = building.type;
    this.gameState = 'submap';
    
    // 生成子地图内容
    this.generateSubMapContent();
};

/**
 * 生成子地图内容
 */
GameEngine.prototype.generateSubMapContent = function() {
    this.zombies = [];
    this.resources = [];
    
    // 生成僵尸
    this.generateZombies();
    
    // 生成资源
    this.generateResources();
    
    console.log('[GameEngine] 子地图内容生成完成: ' + this.zombies.length + '只僵尸, ' + this.resources.length + '个资源');
};

/**
 * 生成僵尸
 */
GameEngine.prototype.generateZombies = function() {
    var random = Math.random();
    var count;
    
    if (random < 0.1) {
        count = 5 + Math.floor(Math.random() * 4); // 5-8只
    } else if (random < 0.3) {
        count = 1 + Math.floor(Math.random() * 2); // 1-2只
    } else {
        count = 3 + Math.floor(Math.random() * 2); // 3-4只
    }
    
    for (var i = 0; i < count; i++) {
        var zombie = {
            id: Math.random().toString(36).substr(2, 9),
            x: 80 + Math.random() * 240,
            y: 120 + Math.random() * 160,
            health: 15,
            maxHealth: 15,
            attack: this.gameData.isDay ? 5 : 10,
            moveSpeed: this.gameData.isDay ? 2 : 4,
            state: 'patrol',
            target: null,
            lastAttackTime: 0
        };
        
        this.zombies.push(zombie);
    }
};

/**
 * 生成资源
 */
GameEngine.prototype.generateResources = function() {
    var resourceChance = this.getResourceChance();
    
    if (Math.random() < resourceChance) {
        var resourceType = this.getResourceType();
        var resource = this.createResource(resourceType);
        
        if (resource) {
            this.resources.push(resource);
        }
    }
};

/**
 * 获取资源生成概率
 */
GameEngine.prototype.getResourceChance = function() {
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

/**
 * 获取资源类型
 */
GameEngine.prototype.getResourceType = function() {
    switch (this.subMapType) {
        case 'police_station':
            return 'companion_police';
        case 'hospital':
            return 'companion_nurse';
        case 'restaurant':
            return 'companion_chef';
        case 'shop':
            return Math.random() < 0.5 ? 'weapon' : 'weapon';
        case 'school':
        case 'house':
        case 'villa':
            return 'food';
        default:
            return 'food';
    }
};

/**
 * 创建资源
 */
GameEngine.prototype.createResource = function(type) {
    var resource = {
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 80,
        collected: false
    };
    
    switch (type) {
        case 'companion_police':
            resource.companionData = { name: '警察', type: 'police', health: 20, attack: 25, special: '远程攻击' };
            break;
        case 'companion_nurse':
            resource.companionData = { name: '护士', type: 'nurse', health: 15, attack: 8, special: '群体回血' };
            break;
        case 'companion_chef':
            resource.companionData = { name: '厨师', type: 'chef', health: 15, attack: 8, special: '每日产粮' };
            break;
        case 'food':
            resource.amount = this.getFoodAmount();
            break;
        case 'weapon':
            resource.weaponData = { name: '近战武器', damage: 10 };
            break;
    }
    
    return resource;
};

/**
 * 获取食物数量
 */
GameEngine.prototype.getFoodAmount = function() {
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

/**
 * 收集资源
 */
GameEngine.prototype.collectResource = function(resource) {
    if (resource.collected) return;
    
    resource.collected = true;
    
    switch (resource.type) {
        case 'companion_police':
        case 'companion_nurse':
        case 'companion_chef':
            if (this.companions.length < 7) { // 团队上限8人
                this.companions.push(resource.companionData);
                this.gameData.teamSize++;
                if (this.gameData.teamSize > this.gameData.maxTeamSize) {
                    this.gameData.maxTeamSize = this.gameData.teamSize;
                }
                console.log('[GameEngine] 新伙伴加入: ' + resource.companionData.name);
            }
            break;
        case 'food':
            this.gameData.food += resource.amount;
            this.gameData.totalFood += resource.amount;
            console.log('[GameEngine] 获得 ' + resource.amount + ' 份口粮');
            break;
        case 'weapon':
            this.player.attack = (this.player.attack || 20) + resource.weaponData.damage;
            console.log('[GameEngine] 获得武器，攻击力提升');
            break;
    }
};

/**
 * 退出子地图
 */
GameEngine.prototype.exitSubMap = function() {
    if (this.currentBuilding) {
        this.currentBuilding.explored = true;
        this.exploredBuildings.push(this.currentBuilding.id);
    }
    
    this.gameState = 'playing';
    this.currentBuilding = null;
    this.subMapType = null;
    this.zombies = [];
    this.resources = [];
    
    console.log('[GameEngine] 退出子地图');
};

/**
 * 启动游戏循环
 */
GameEngine.prototype.start = function() {
    this.running = true;
    this.lastTime = Date.now();
    this.gameLoop();
    console.log('[GameEngine] 游戏主循环启动');
};

/**
 * 游戏主循环
 */
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

/**
 * 更新游戏逻辑
 */
GameEngine.prototype.update = function(deltaTime) {
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        this.updatePlayer(deltaTime);
        this.updateTime(deltaTime);
        
        if (this.gameState === 'submap') {
            this.updateZombies(deltaTime);
        }
    }
};

/**
 * 更新玩家
 */
GameEngine.prototype.updatePlayer = function(deltaTime) {
    if (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0) {
        var moveSpeed = 3;
        this.player.x += this.joystick.direction.x * moveSpeed;
        this.player.y += this.joystick.direction.y * moveSpeed;
        
        // 边界检查
        if (this.gameState === 'playing') {
            this.player.x = Math.max(10, Math.min(this.canvas.width - 10, this.player.x));
            this.player.y = Math.max(70, Math.min(this.canvas.height - 10, this.player.y));
        } else if (this.gameState === 'submap') {
            this.player.x = Math.max(60, Math.min(340, this.player.x));
            this.player.y = Math.max(110, Math.min(290, this.player.y));
        }
    }
};

/**
 * 更新游戏时间
 */
GameEngine.prototype.updateTime = function(deltaTime) {
    var self = this;
    this.gameData.timeRemaining -= deltaTime;
    
    if (this.gameData.timeRemaining <= 0) {
        if (this.gameData.isDay) {
            this.gameData.isDay = false;
            this.gameData.timeRemaining = 60000; // 1分钟夜晚
            console.log('[GameEngine] 夜幕降临');
        } else {
            this.gameData.isDay = true;
            this.gameData.timeRemaining = 300000; // 5分钟白天
            this.gameData.survivalDays++;
            
            // 消耗口粮
            var foodCost = this.gameData.teamSize;
            this.gameData.food -= foodCost;
            
            console.log('[GameEngine] 第' + this.gameData.survivalDays + '天，消耗口粮' + foodCost + '份');
            
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
            
            // 厨师每日产粮
            this.companions.forEach(function(companion) {
                if (companion.type === 'chef') {
                    self.gameData.food += 5;
                    self.gameData.totalFood += 5;
                }
            });
        }
    }
};

/**
 * 更新僵尸
 */
GameEngine.prototype.updateZombies = function(deltaTime) {
    var self = this;
    
    this.zombies.forEach(function(zombie) {
        // 简单的僵尸AI
        var dx = self.player.x - zombie.x;
        var dy = self.player.y - zombie.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100 && distance > 30) {
            // 追击玩家
            var moveDistance = zombie.moveSpeed * (deltaTime / 1000);
            zombie.x += (dx / distance) * moveDistance;
            zombie.y += (dy / distance) * moveDistance;
        } else if (distance <= 30) {
            // 攻击玩家
            var currentTime = Date.now();
            if (currentTime - zombie.lastAttackTime >= 1000) {
                self.player.health -= zombie.attack;
                zombie.lastAttackTime = currentTime;
                
                if (self.player.health <= 0) {
                    self.gameOver('death');
                }
            }
        }
    });
    
    // 移除死亡僵尸
    this.zombies = this.zombies.filter(function(zombie) {
        return zombie.health > 0;
    });
};

/**
 * 游戏结束
 */
GameEngine.prototype.gameOver = function(cause) {
    this.gameState = 'gameover';
    this.gameData.cause = cause;
    console.log('[GameEngine] 游戏结束: ' + cause);
};

/**
 * 游戏胜利
 */
GameEngine.prototype.gameWin = function() {
    this.gameState = 'victory';
    console.log('[GameEngine] 游戏胜利');
};

/**
 * 渲染游戏
 */
GameEngine.prototype.render = function() {
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
    
    // 渲染虚拟摇杆
    if (this.joystick.active) {
        this.renderJoystick();
    }
};

/**
 * 渲染菜单
 */
GameEngine.prototype.renderMenu = function() {
    // 背景
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 标题
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('末日Q行', this.canvas.width / 2, 150);
    
    // 副标题
    this.ctx.fillStyle = '#bdc3c7';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('生存至100天的挑战', this.canvas.width / 2, 190);
    
    // 开始按钮
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(150, 250, 200, 50);
    
    this.ctx.strokeStyle = '#45a049';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(150, 250, 200, 50);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '18px Arial';
    this.ctx.fillText('开始游戏', this.canvas.width / 2, 280);
    
    this.ctx.textAlign = 'left';
};

/**
 * 渲染游戏主界面
 */
GameEngine.prototype.renderGame = function() {
    // 背景
    this.ctx.fillStyle = '#7f8c8d';
    this.ctx.fillRect(0, 60, this.canvas.width, this.canvas.height - 60);
    
    // 状态栏
    this.renderStatusBar();
    
    // 绘制街道
    this.renderStreets();
    
    // 绘制建筑物
    this.renderBuildings();
    
    // 绘制玩家
    this.renderPlayer();
    
    // 绘制时间信息
    this.renderTimeInfo();
};

/**
 * 渲染状态栏
 */
GameEngine.prototype.renderStatusBar = function() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, 60);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('第 ' + this.gameData.survivalDays + ' 天', 10, 25);
    this.ctx.fillText('🍞 ' + this.gameData.food, 10, 45);
    this.ctx.fillText('👥 ' + this.gameData.teamSize, 120, 25);
};

/**
 * 渲染街道
 */
GameEngine.prototype.renderStreets = function() {
    this.ctx.fillStyle = '#34495e';
    // 水平街道
    this.ctx.fillRect(0, 200, this.canvas.width, 20);
    this.ctx.fillRect(0, 320, this.canvas.width, 20);
    // 垂直街道
    this.ctx.fillRect(150, 60, 20, this.canvas.height - 60);
    this.ctx.fillRect(250, 60, 20, this.canvas.height - 60);
};

/**
 * 渲染建筑物
 */
GameEngine.prototype.renderBuildings = function() {
    var self = this;
    
    this.buildings.forEach(function(building) {
        // 建筑主体
        self.ctx.fillStyle = building.explored ? building.color : self.lightenColor(building.color, 0.3);
        self.ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // 建筑边框
        self.ctx.strokeStyle = '#2c3e50';
        self.ctx.lineWidth = 2;
        self.ctx.strokeRect(building.x, building.y, building.width, building.height);
        
        // 未探索高亮
        if (!building.explored) {
            self.ctx.strokeStyle = '#f1c40f';
            self.ctx.lineWidth = 3;
            self.ctx.setLineDash([5, 5]);
            self.ctx.strokeRect(building.x - 2, building.y - 2, building.width + 4, building.height + 4);
            self.ctx.setLineDash([]);
        }
        
        // 建筑名称
        self.ctx.fillStyle = '#ffffff';
        self.ctx.font = '12px Arial';
        self.ctx.textAlign = 'center';
        self.ctx.fillText(building.name, building.x + building.width / 2, building.y + building.height + 15);
    });
    
    this.ctx.textAlign = 'left';
};

/**
 * 渲染玩家
 */
GameEngine.prototype.renderPlayer = function() {
    // 玩家主体
    this.ctx.fillStyle = '#3498db';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, 10, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 玩家边框
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // 血条
    if (this.player.health < this.player.maxHealth) {
        var barWidth = 20;
        var barHeight = 4;
        var healthPercent = this.player.health / this.player.maxHealth;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(this.player.x - barWidth / 2, this.player.y - 18, barWidth, barHeight);
        
        this.ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : '#e74c3c';
        this.ctx.fillRect(this.player.x - barWidth / 2, this.player.y - 18, barWidth * healthPercent, barHeight);
    }
};

/**
 * 渲染时间信息
 */
GameEngine.prototype.renderTimeInfo = function() {
    var minutes = Math.floor(this.gameData.timeRemaining / 60000);
    var seconds = Math.floor((this.gameData.timeRemaining % 60000) / 1000);
    var timeText = (this.gameData.isDay ? '白天' : '夜晚') + ' ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(this.canvas.width - 120, 10, 110, 25);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(timeText, this.canvas.width - 115, 27);
};

/**
 * 渲染子地图
 */
GameEngine.prototype.renderSubMap = function() {
    // 背景
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(0, 60, this.canvas.width, this.canvas.height - 60);
    
    // 状态栏
    this.renderStatusBar();
    
    // 子地图房间
    this.ctx.fillStyle = this.getSubMapColor();
    this.ctx.fillRect(50, 100, 300, 200);
    
    // 房间边框
    this.ctx.strokeStyle = '#34495e';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(50, 100, 300, 200);
    
    // 地图标题
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.currentBuilding.name, this.canvas.width / 2, 90);
    
    // 渲染僵尸
    this.renderZombies();
    
    // 渲染资源
    this.renderResources();
    
    // 渲染玩家
    this.renderPlayer();
    
    // 返回按钮
    this.renderBackButton();
    
    this.ctx.textAlign = 'left';
};

/**
 * 获取子地图颜色
 */
GameEngine.prototype.getSubMapColor = function() {
    switch (this.subMapType) {
        case 'police_station': return '#34495e';
        case 'hospital': return '#ecf0f1';
        case 'school': return '#f39c12';
        case 'house': return '#95a5a6';
        case 'villa': return '#8e44ad';
        case 'shop': return '#27ae60';
        case 'bar': return '#d35400';
        case 'restaurant': return '#e67e22';
        case 'station': return '#34495e';
        default: return '#7f8c8d';
    }
};

/**
 * 渲染僵尸
 */
GameEngine.prototype.renderZombies = function() {
    var self = this;
    
    this.zombies.forEach(function(zombie) {
        // 僵尸主体
        self.ctx.fillStyle = '#8b0000';
        self.ctx.beginPath();
        self.ctx.arc(zombie.x, zombie.y, 8, 0, Math.PI * 2);
        self.ctx.fill();
        
        // 血条
        if (zombie.health < zombie.maxHealth) {
            var barWidth = 16;
            var barHeight = 3;
            var healthPercent = zombie.health / zombie.maxHealth;
            
            self.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            self.ctx.fillRect(zombie.x - barWidth / 2, zombie.y - 15, barWidth, barHeight);
            
            self.ctx.fillStyle = '#e74c3c';
            self.ctx.fillRect(zombie.x - barWidth / 2, zombie.y - 15, barWidth * healthPercent, barHeight);
        }
    });
};

/**
 * 渲染资源
 */
GameEngine.prototype.renderResources = function() {
    var self = this;
    
    this.resources.forEach(function(resource) {
        if (resource.collected) return;
        
        // 资源发光效果
        var gradient = self.ctx.createRadialGradient(resource.x, resource.y, 0, resource.x, resource.y, 20);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        self.ctx.fillStyle = gradient;
        self.ctx.fillRect(resource.x - 20, resource.y - 20, 40, 40);
        
        // 资源图标
        self.ctx.fillStyle = self.getResourceColor(resource.type);
        self.ctx.fillRect(resource.x - 8, resource.y - 8, 16, 16);
    });
};

/**
 * 获取资源颜色
 */
GameEngine.prototype.getResourceColor = function(type) {
    switch (type) {
        case 'food': return '#f39c12';
        case 'weapon': return '#e74c3c';
        case 'companion_police': return '#3498db';
        case 'companion_nurse': return '#e74c3c';
        case 'companion_chef': return '#f39c12';
        default: return '#27ae60';
    }
};

/**
 * 渲染返回按钮
 */
GameEngine.prototype.renderBackButton = function() {
    this.ctx.fillStyle = 'rgba(52, 73, 94, 0.8)';
    this.ctx.fillRect(10, this.canvas.height - 40, 80, 30);
    
    this.ctx.strokeStyle = '#34495e';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(10, this.canvas.height - 40, 80, 30);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('返回', 50, this.canvas.height - 20);
};

/**
 * 渲染游戏结束
 */
GameEngine.prototype.renderGameOver = function() {
    // 半透明背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 标题
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.textAlign = 'center';
    
    var title = this.gameData.cause === 'starvation' ? '饥饿死亡' : '全团覆灭';
    this.ctx.fillText(title, this.canvas.width / 2, 150);
    
    // 统计
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = '18px Arial';
    this.ctx.fillText('生存天数: ' + this.gameData.survivalDays, this.canvas.width / 2, 200);
    this.ctx.fillText('团队最高人数: ' + this.gameData.maxTeamSize, this.canvas.width / 2, 230);
    this.ctx.fillText('击杀僵尸总数: ' + this.gameData.zombieKills, this.canvas.width / 2, 260);
    
    // 重新开始按钮
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.fillRect(175, 320, 150, 40);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('重新开始', this.canvas.width / 2, 345);
    
    this.ctx.textAlign = 'left';
};

/**
 * 渲染胜利画面
 */
GameEngine.prototype.renderVictory = function() {
    // 背景
    this.ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 标题
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('100天生存成功！', this.canvas.width / 2, 120);
    
    // 恭喜
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('恭喜成为末日幸存者！', this.canvas.width / 2, 160);
    
    // 统计
    this.ctx.font = '16px Arial';
    this.ctx.fillText('生存天数: ' + this.gameData.survivalDays, this.canvas.width / 2, 200);
    this.ctx.fillText('团队最高人数: ' + this.gameData.maxTeamSize, this.canvas.width / 2, 225);
    this.ctx.fillText('击杀僵尸总数: ' + this.gameData.zombieKills, this.canvas.width / 2, 250);
    this.ctx.fillText('收集口粮总数: ' + this.gameData.totalFood, this.canvas.width / 2, 275);
    
    // 奖励
    this.ctx.fillStyle = '#f39c12';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('已解锁: 末日幸存者称号', this.canvas.width / 2, 305);
    this.ctx.fillText('已解锁: 幸存者专属皮肤', this.canvas.width / 2, 325);
    
    // 重新开始按钮
    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(175, 350, 150, 40);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('再次挑战', this.canvas.width / 2, 375);
    
    this.ctx.textAlign = 'left';
};

/**
 * 渲染虚拟摇杆
 */
GameEngine.prototype.renderJoystick = function() {
    var radius = 60;
    
    // 外圈
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(this.joystick.centerX, this.joystick.centerY, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // 内圈
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(this.joystick.currentX, this.joystick.currentY, 20, 0, Math.PI * 2);
    this.ctx.fill();
};

/**
 * 颜色变亮
 */
GameEngine.prototype.lightenColor = function(color, amount) {
    var colorInt = parseInt(color.slice(1), 16);
    var r = Math.min(255, Math.floor((colorInt >> 16) + 255 * amount));
    var g = Math.min(255, Math.floor(((colorInt >> 8) & 0x00FF) + 255 * amount));
    var b = Math.min(255, Math.floor((colorInt & 0x0000FF) + 255 * amount));
    
    var result = ((r << 16) | (g << 8) | b).toString(16);
    return '#' + ('000000' + result).slice(-6);
};

/**
 * 游戏初始化函数
 */
function initGame() {
    try {
        console.log('[Main] 开始初始化游戏...');
        
        // 获取系统信息
        var systemInfo = tt.getSystemInfoSync();
        console.log('[Main] 系统信息:', {
            windowWidth: systemInfo.windowWidth,
            windowHeight: systemInfo.windowHeight,
            pixelRatio: systemInfo.pixelRatio,
            platform: systemInfo.platform
        });
        
        // 创建画布
        var canvas = tt.createCanvas();
        var ctx = canvas.getContext('2d');
canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;

        console.log('[Main] 画布创建成功: ' + canvas.width + 'x' + canvas.height);
        
        // 创建游戏引擎
        var gameEngine = new GameEngine(canvas, ctx);
        
        // 启动游戏
        gameEngine.start();
        
        console.log('[Main] 游戏启动成功！');
        
        // 暴露全局变量供调试
        if (typeof global !== 'undefined') {
            global.game = gameEngine;
            global.canvas = canvas;
            global.ctx = ctx;
        }
        
        return gameEngine;
        
    } catch (error) {
        console.error('[Main] 游戏初始化失败:', error);
        
        // 显示错误信息
        try {
            var canvas = tt.createCanvas();
            var ctx = canvas.getContext('2d');
            var systemInfo = tt.getSystemInfoSync();
            canvas.width = systemInfo.windowWidth;
            canvas.height = systemInfo.windowHeight;
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('游戏启动失败', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText('请重新加载', canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('错误: ' + error.message, canvas.width / 2, canvas.height / 2 + 60);
        } catch (displayError) {
            console.error('[Main] 无法显示错误信息:', displayError);
        }
        
        throw error;
    }
}

// 启动游戏
console.log('[Main] 准备启动末日Q行游戏...');
try {
    initGame();
    console.log('[Main] 游戏启动完成！');
} catch (error) {
    console.error('[Main] 游戏启动失败:', error);
}