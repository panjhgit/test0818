/**
 * 游戏引擎主类
 * 管理游戏的核心逻辑、循环和状态
 */

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
    this.characterManager = new CharacterManager();
    this.zombieManager = new ZombieManager();

    // 设置僵尸管理器的游戏引擎引用
    this.zombieManager.gameEngine = this;

    // 确保视距裁剪系统正确初始化
    try {
        this.viewportCulling = new ViewportCullingManager();
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

    // 初始化摄像机尺寸
    this.camera.width = this.canvas.width;
    this.camera.height = this.canvas.height;

    // 游戏数据
    this.gameData = {
        survivalDays: 1,
        food: 20, // 开局设置20个食物
        teamSize: 1,
        maxTeamSize: 1,
        zombieKills: 0,
        totalFood: 20, // 总食物也设置为20
        isDay: true,
        timeRemaining: GAME_CONFIG.TIME.DAY_DURATION,
        gameStartTime: Date.now()
    };

    // 地图配置
    this.mapConfig = {
        width: 10000,
        height: 10000,
        blockSize: 750,
        streetWidth: 350,
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

    // 游戏对象
    this.buildings = this.initializeBuildings();

    // 调试信息：显示建筑数量
    console.log('[Map] 地图初始化完成，建筑数量:', this.buildings.length);

    // 初始化跟随者数组
    this.companions = [];
    this.followers = [];

    this.player = {
        x: 1000, // 左下角附近
        y: this.mapConfig.height - 1000,
        health: GAME_CONFIG.PLAYER.BASE_HEALTH,
        maxHealth: GAME_CONFIG.PLAYER.BASE_HEALTH,
        level: 1,
        attack: GAME_CONFIG.PLAYER.BASE_ATTACK,
        attackRange: GAME_CONFIG.PLAYER.ATTACK_RANGE,
        lastAttackTime: 0,
        attackCooldown: GAME_CONFIG.PLAYER.ATTACK_COOLDOWN,
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
        x: this.player.x,
        y: this.player.y,
        mapWidth: this.mapConfig.width,
        mapHeight: this.mapConfig.height
    });

    // 初始化系统
    this.initializeNPCs();
    this.initializeZombies();

    // 视距裁剪系统
    try {
        this.viewportCulling = new ViewportCullingManager();
        this.viewportCulling.init(this.mapConfig.width, this.mapConfig.height);
        this.fallbackToTraditionalRendering = false;
        console.log('[GameEngine] 视距裁剪系统初始化成功');

        // 延迟初始化四叉树，确保建筑物已经创建
        setTimeout(function() {
            if (this.viewportCulling && this.buildings && this.buildings.length > 0) {
                console.log('[GameEngine] 延迟初始化四叉树，建筑物数量:', this.buildings.length);
                this.markStaticEntities();
                this.insertEntitiesToQuadTree();
                this.viewportCulling.quadTreeInitialized = true;
                this.viewportCulling.lastMapWidth = this.mapConfig.width;
                this.viewportCulling.lastMapHeight = this.mapConfig.height;
                console.log('[GameEngine] 四叉树延迟初始化完成');
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
// 游戏引擎辅助方法
// ========================================

// 验证followers数组的初始状态
GameEngine.prototype.validateFollowersArray = function() {
    if (!Array.isArray(this.followers)) {
        console.error('[GameEngine] followers不是数组，重新初始化');
        this.followers = [];
    }
    console.log('[GameEngine] followers数组验证通过，长度:', this.followers.length);
};

// 初始化跟随者对象池
GameEngine.prototype.initializeFollowerPool = function() {
    this.followerPool = [];
    this.maxFollowerPoolSize = 50;
    console.log('[GameEngine] 跟随者对象池初始化完成');
};

// 初始化资源对象池
GameEngine.prototype.initializeResourcePool = function() {
    this.resourcePool = [];
    this.maxResourcePoolSize = 100;
    console.log('[GameEngine] 资源对象池初始化完成');
};

// 生成初始伙伴
GameEngine.prototype.generateInitialPartners = function() {
    try {
        console.log('[InitialPartners] 开始生成初始伙伴...');

        // 确保角色管理器已初始化
        if (!this.characterManager || !this.characterManager.characters) {
            console.error('[InitialPartners] 角色管理器未初始化！');
            return;
        }

        var partnerConfigs = [
            {characterId: 2, name: '金发女战士', health: 40, attack: 12, special: '医疗'},
            {characterId: 3, name: '暗影忍者', health: 35, attack: 15, special: '潜行'},
            {characterId: 4, name: '机械工程师', health: 45, attack: 10, special: '修理'},
            {characterId: 5, name: '魔法师', health: 30, attack: 18, special: '魔法'},
            {characterId: 6, name: '海盗船长', health: 50, attack: 14, special: '领导'},
            {characterId: 7, name: '太空探险家', health: 42, attack: 11, special: '探索'},
            {characterId: 8, name: '武士', health: 48, attack: 16, special: '剑术'},
            {characterId: 1, name: '酷炫墨镜哥', health: 38, attack: 13, special: '射击'}
        ];

        for (var i = 0; i < partnerConfigs.length; i++) {
            var partnerConfig = partnerConfigs[i];
            var character = this.characterManager.characters[partnerConfig.characterId];

            if (!character) {
                console.warn('[InitialPartners] 角色ID', partnerConfig.characterId, '不存在，跳过');
                continue;
            }

            // 计算伙伴位置（围绕玩家分布）
            var angle = (i / partnerConfigs.length) * 2 * Math.PI;
            var radius = 100 + Math.random() * 50;
            var x = this.player.x + Math.cos(angle) * radius;
            var y = this.player.y + Math.sin(angle) * radius;

            // 确保位置在地图范围内
            x = Math.max(100, Math.min(this.mapConfig.width - 100, x));
            y = Math.max(100, Math.min(this.mapConfig.height - 100, y));

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

// 获取角色性格
GameEngine.prototype.getCharacterPersonality = function(character) {
    if (!character) return null;
    
    var personalities = [
        '勇敢', '谨慎', '乐观', '悲观', '友好',
        '冷漠', '幽默', '严肃', '好奇', '保守'
    ];
    
    return {
        trait: personalities[character.id % personalities.length],
        loyalty: 50 + (character.id % 30),
        courage: 50 + (character.id % 40),
        personalityType: this.getPersonalityType(character.id)
    };
};

GameEngine.prototype.getPersonalityType = function(characterId) {
    var types = ['leader', 'supporter', 'scout', 'guardian', 'independent'];
    return types[characterId % types.length];
};

// 将实体插入四叉树
GameEngine.prototype.insertEntitiesToQuadTree = function() {
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
GameEngine.prototype.markStaticEntities = function() {
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

// 获取安全的跟随者位置
GameEngine.prototype.getSafeFollowerPosition = function() {
    // 在玩家周围找一个安全的位置
    var attempts = 0;
    var maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        var angle = Math.random() * 2 * Math.PI;
        var distance = 50 + Math.random() * 100;
        var x = this.player.x + Math.cos(angle) * distance;
        var y = this.player.y + Math.sin(angle) * distance;
        
        // 检查位置是否安全
        if (this.canPlayerMoveTo(x, y)) {
            return {x: x, y: y};
        }
        
        attempts++;
    }
    
    // 如果找不到安全位置，返回玩家位置附近
    return {
        x: this.player.x + (Math.random() - 0.5) * 20,
        y: this.player.y + (Math.random() - 0.5) * 20
    };
};

GameEngine.prototype.start = function() {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = Date.now();
    this.gameState = 'playing';
    
    console.log('[GameEngine] 游戏开始');
    this.gameLoop();
};

GameEngine.prototype.stop = function() {
    this.running = false;
    this.gameState = 'paused';
    console.log('[GameEngine] 游戏暂停');
};

GameEngine.prototype.gameLoop = function() {
    if (!this.running) return;
    
    var currentTime = Date.now();
    var deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // 更新游戏逻辑
    this.update(deltaTime);
    
    // 渲染游戏画面
    this.render();
    
    // 继续游戏循环
    requestAnimationFrame(this.gameLoop.bind(this));
};

GameEngine.prototype.update = function(deltaTime) {
    if (this.gameState !== 'playing') return;
    
    // 更新玩家
    this.updatePlayer(deltaTime);
    
    // 更新跟随者
    this.updateFollowers(deltaTime);
    
    // 更新僵尸
    this.zombieManager.update(deltaTime);
    
    // 更新摄像机
    this.updateCamera();
    
    // 更新视距裁剪
    if (this.viewportCulling) {
        this.updateViewportCulling();
    }
    
    // 更新战斗系统
    this.updateCombat(deltaTime);
    
    // 更新NPC
    this.updateNPCs(deltaTime);
};

GameEngine.prototype.updatePlayer = function(deltaTime) {
    if (this.player.isDead) return;
    
    // 更新玩家移动
    this.updatePlayerMovement(deltaTime);
    
    // 更新玩家动画
    this.updatePlayerAnimation(deltaTime);
    
    // 检查建筑物碰撞
    this.checkBuildingCollisions();
};

GameEngine.prototype.updatePlayerMovement = function(deltaTime) {
    // 玩家移动逻辑（由输入系统控制）
    // 这里可以添加额外的移动逻辑
};

GameEngine.prototype.updatePlayerAnimation = function(deltaTime) {
    var currentTime = Date.now();
    
    if (this.player.isWalking && currentTime - this.player.lastAnimationTime >= this.player.walkAnimationSpeed) {
        this.player.walkAnimationFrame = (this.player.walkAnimationFrame + 1) % 4;
        this.player.lastAnimationTime = currentTime;
    }
};

GameEngine.prototype.updateFollowers = function(deltaTime) {
    for (var i = 0; i < this.companions.length; i++) {
        var companion = this.companions[i];
        if (companion && !companion.isDead) {
            this.updateFollowerMovement(companion, deltaTime);
        }
    }
};

GameEngine.prototype.updateFollowerMovement = function(follower, deltaTime) {
    // 跟随者移动逻辑
    var targetX = this.player.x + (Math.random() - 0.5) * 50;
    var targetY = this.player.y + (Math.random() - 0.5) * 50;
    
    var dx = targetX - follower.x;
    var dy = targetY - follower.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
        var speed = 2;
        follower.x += (dx / distance) * speed;
        follower.y += (dy / distance) * speed;
    }
};

GameEngine.prototype.updateCamera = function() {
    if (this.camera.followTarget) {
        var target = this.camera.followTarget;
        this.camera.x = target.x - this.camera.width / 2;
        this.camera.y = target.y - this.camera.height / 2;
        
        // 限制摄像机不超出地图边界
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapConfig.width - this.camera.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapConfig.height - this.camera.height));
    }
};

GameEngine.prototype.updateViewportCulling = function() {
    if (!this.viewportCulling || !this.viewportCulling.quadTreeInitialized) {
        return;
    }
    
    // 更新视距裁剪系统
    // 这里可以添加更多的优化逻辑
};

GameEngine.prototype.updateCombat = function(deltaTime) {
    var currentTime = Date.now();
    
    if (!this.player.isDead && !this.player.isZombie && 
        currentTime - this.player.lastAttackTime >= this.player.attackCooldown) {
        
        var nearbyZombies = this.zombieManager.getZombiesInRange(
            this.player.x, this.player.y, this.player.attackRange
        );
        
        if (nearbyZombies.length > 0) {
            var targetZombie = nearbyZombies[0].zombie;
            this.attackZombie(this.player, targetZombie);
            this.player.lastAttackTime = currentTime;
        }
    }
};

GameEngine.prototype.attackZombie = function(attacker, zombie) {
    if (zombie.isDead) return;
    
    zombie.takeDamage(attacker.attack);
    console.log('[Combat]', attacker.name || '玩家', '攻击僵尸，造成', attacker.attack, '点伤害');
};

GameEngine.prototype.updateNPCs = function(deltaTime) {
    // NPC更新逻辑
    // 这里可以添加NPC的AI和行为更新
};

GameEngine.prototype.render = function() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 渲染地图
    this.renderMap();
    
    // 渲染建筑物
    this.renderBuildings();
    
    // 渲染僵尸
    this.zombieManager.render(this.ctx, this.camera);
    
    // 渲染跟随者
    this.renderFollowers();
    
    // 渲染玩家
    this.renderPlayer();
    
    // 渲染UI
    this.renderUI();
};

GameEngine.prototype.renderMap = function() {
    // 地图渲染逻辑
    this.ctx.fillStyle = '#90EE90';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

GameEngine.prototype.renderBuildings = function() {
    // 建筑物渲染逻辑
    // 这里可以添加建筑物的渲染代码
};

GameEngine.prototype.renderFollowers = function() {
    for (var i = 0; i < this.companions.length; i++) {
        var companion = this.companions[i];
        if (companion && !companion.isDead) {
            this.renderFollower(companion);
        }
    }
};

GameEngine.prototype.renderFollower = function(follower) {
    var screenX = follower.x - this.camera.x + this.camera.width / 2;
    var screenY = follower.y - this.camera.y + this.camera.height / 2;
    
    this.ctx.fillStyle = '#4A90E2';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, 15, 0, Math.PI * 2);
    this.ctx.fill();
};

GameEngine.prototype.renderPlayer = function() {
    var screenX = this.player.x - this.camera.x + this.camera.width / 2;
    var screenY = this.player.y - this.camera.y + this.camera.height / 2;
    
    // 渲染玩家
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 渲染血条
    this.renderHealthBar(this.player, screenX, screenY);
};

GameEngine.prototype.renderHealthBar = function(entity, screenX, screenY) {
    var barWidth = 40;
    var barHeight = 6;
    var barY = screenY - 30;
    
    // 背景
    this.ctx.fillStyle = '#FF0000';
    this.ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);
    
    // 血量
    var healthPercent = entity.health / entity.maxHealth;
    this.ctx.fillStyle = '#00FF00';
    this.ctx.fillRect(screenX - barWidth / 2, barY, barWidth * healthPercent, barHeight);
};

GameEngine.prototype.renderUI = function() {
    // UI渲染逻辑
    this.ctx.fillStyle = '#000000';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('血量: ' + this.player.health + '/' + this.player.maxHealth, 10, 30);
    this.ctx.fillText('状态: ' + this.gameState, 10, 50);
};

GameEngine.prototype.setupInput = function() {
    // 输入系统设置
    // 这里可以添加触摸、键盘等输入处理
};

GameEngine.prototype.initializeNPCs = function() {
    // 初始化NPC
    this.npcs = [];
    this.followers = [];
    this.partnerStates = new Map();
};

GameEngine.prototype.initializeZombies = function() {
    // 僵尸初始化已在ZombieManager构造函数中完成
};

GameEngine.prototype.checkBuildingCollisions = function() {
    // 建筑物碰撞检测
    // 这里可以添加建筑物交互逻辑
};

// 初始化建筑物方法由map-system.js提供

// 初始化跟随者对象池
GameEngine.prototype.initializeFollowerPool = function() {
    // 创建一些测试跟随者
    for (var i = 0; i < 3; i++) {
        var follower = {
            id: 'follower_' + i,
            name: '伙伴' + (i + 1),
            x: this.player.x + (Math.random() - 0.5) * 100,
            y: this.player.y + (Math.random() - 0.5) * 100,
            health: 30,
            maxHealth: 30,
            isDead: false,
            type: 'follower',
            isTestPartner: true
        };
        this.followers.push(follower);
        this.companions.push(follower);
    }
};

// 初始化资源对象池
GameEngine.prototype.initializeResourcePool = function() {
    // 这里可以初始化资源对象池
    // 暂时为空，可以根据需要添加
};

// 验证跟随者数组
GameEngine.prototype.validateFollowersArray = function() {
    if (!Array.isArray(this.followers)) {
        this.followers = [];
        console.warn('[GameEngine] 跟随者数组初始化失败，重新创建');
    }
    if (!Array.isArray(this.companions)) {
        this.companions = [];
        console.warn('[GameEngine] 伙伴数组初始化失败，重新创建');
    }
};

// 检查玩家是否可以移动到指定位置
GameEngine.prototype.canPlayerMoveTo = function(x, y) {
    // 检查是否超出地图边界
    if (x < 0 || x > this.mapConfig.width || y < 0 || y > this.mapConfig.height) {
        return false;
    }
    
    // 检查是否与建筑物碰撞
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        if (x >= building.x && x <= building.x + building.width &&
            y >= building.y && y <= building.y + building.height) {
            return false;
        }
    }
    
    return true;
};

// 开始内存泄漏检测
GameEngine.prototype.startMemoryLeakDetection = function() {
    // 简单的内存使用监控
    if (typeof performance !== 'undefined' && performance.memory) {
        setInterval(function() {
            var memory = performance.memory;
            if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                console.warn('[Memory] 内存使用过高:', Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB');
            }
        }, 10000); // 每10秒检查一次
    }
};

// 开始性能监控
GameEngine.prototype.startPerformanceMonitoring = function() {
    var frameCount = 0;
    var lastTime = Date.now();
    
    setInterval(function() {
        var currentTime = Date.now();
        var fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        console.log('[Performance] FPS:', fps);
        frameCount = 0;
        lastTime = currentTime;
    }, 1000);
    
    // 在游戏循环中增加帧数计数
    var originalGameLoop = this.gameLoop;
    this.gameLoop = function() {
        frameCount++;
        originalGameLoop.call(this);
    };
};

