/**
 * NPC管理器 - 管理NPC生成、跟随和行为
 * 兼容抖音小程序环境 (ES5)
 */
function NPCManager(gameEngine) {
    this.gameEngine = gameEngine;
    this.npcs = [];
    this.followers = [];
}

/**
 * 初始化NPC系统
 */
NPCManager.prototype.initializeNPCs = function() {
    console.log('[NPC] 开始初始化NPC系统');
    
    // 生成19个NPC（2-20号人物）
    for (var i = 0; i < 19; i++) {
        var characterId = i + 2; // 2-20号人物
        var npc = this.createNPC(characterId);
        this.npcs.push(npc);
    }
    
    console.log('[NPC] 已生成', this.npcs.length, '个NPC');
};

/**
 * 创建单个NPC
 */
NPCManager.prototype.createNPC = function(characterId) {
    // 随机选择街道位置
    var position = this.getRandomStreetPosition();
    
    // 获取角色个性
    var character = this.gameEngine.characterManager.characters[characterId] || 
                   this.gameEngine.characterManager.characters[2];
    var personality = this.getCharacterPersonality(character);
    
    var npc = {
        id: characterId,
        characterId: characterId,
        x: position.x,
        y: position.y,
        character: character,
        personality: personality,
        isFollowing: false,
        
        // 动画状态
        isWalking: false,
        walkAnimationFrame: 0,
        direction: 'down',
        
        // 行为状态
        idleBehavior: null,
        behaviorTimer: 0,
        behaviorDuration: 0
    };
    
    return npc;
};

/**
 * 获取随机街道位置
 */
NPCManager.prototype.getRandomStreetPosition = function() {
    var mapConfig = this.gameEngine.mapConfig;
    var attempts = 0;
    var maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        var x = Math.random() * mapConfig.width;
        var y = Math.random() * mapConfig.height;
        
        // 检查是否在街道上（不在建筑内）
        var blockX = Math.floor(x / mapConfig.blockSize);
        var blockY = Math.floor(y / mapConfig.blockSize);
        
        var blockStartX = blockX * mapConfig.blockSize;
        var blockStartY = blockY * mapConfig.blockSize;
        
        var inStreetX = (x - blockStartX) < mapConfig.streetWidth / 2 || 
                       (x - blockStartX) > mapConfig.blockSize - mapConfig.streetWidth / 2;
        var inStreetY = (y - blockStartY) < mapConfig.streetWidth / 2 || 
                       (y - blockStartY) > mapConfig.blockSize - mapConfig.streetWidth / 2;
        
        if (inStreetX || inStreetY) {
            return { x: x, y: y };
        }
        
        attempts++;
    }
    
    // 如果找不到合适位置，返回地图中心
    return { 
        x: mapConfig.width / 2, 
        y: mapConfig.height / 2 
    };
};

/**
 * 更新NPC系统
 */
NPCManager.prototype.updateNPCs = function(deltaTime) {
    for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];
        this.updateSingleNPC(npc, deltaTime);
    }
};

/**
 * 更新单个NPC
 */
NPCManager.prototype.updateSingleNPC = function(npc, deltaTime) {
    // 如果已经加入团队，跳过处理节省性能
    if (npc.isFollowing) {
        return;
    }
    
    var player = this.gameEngine.player;
    var collisionThresholdSquared = 900; // 30^2 = 900，避免开方运算
    
    // 检查与玩家的碰撞
    var distanceSquaredToPlayer = 
        Math.pow(npc.x - player.x, 2) + 
        Math.pow(npc.y - player.y, 2);
    
    var shouldJoinTeam = distanceSquaredToPlayer < collisionThresholdSquared;
    
    // 如果与玩家未碰撞，检查与团队成员的碰撞
    if (!shouldJoinTeam) {
        for (var i = 0; i < this.followers.length; i++) {
            var follower = this.followers[i];
            var distanceSquaredToFollower = 
                Math.pow(npc.x - follower.x, 2) + 
                Math.pow(npc.y - follower.y, 2);
            
            if (distanceSquaredToFollower < collisionThresholdSquared) {
                shouldJoinTeam = true;
                break;
            }
        }
    }
    
    // 加入团队
    if (shouldJoinTeam) {
        this.addNPCToTeam(npc);
    } else {
        // 更新空闲行为
        this.updateNPCIdleBehavior(npc, deltaTime);
    }
};

/**
 * 将NPC添加到团队
 */
NPCManager.prototype.addNPCToTeam = function(npc) {
    // 检查是否已经在followers数组中
    var alreadyInTeam = false;
    for (var j = 0; j < this.followers.length; j++) {
        if (this.followers[j].id === npc.id) {
            alreadyInTeam = true;
            break;
        }
    }
    
    if (!alreadyInTeam) {
        npc.isFollowing = true;
        
        // 创建新的跟随者对象
        var newFollower = {
            id: npc.id,
            characterId: npc.characterId,
            x: npc.x,
            y: npc.y,
            character: npc.character,
            personality: npc.personality,
            isWalking: false,
            walkAnimationFrame: 0,
            direction: 'down',
            followStartTime: Date.now(),
            moveHistory: []
        };
        
        this.addNewFollowerToTeam(newFollower);
        console.log('[NPC] 角色', npc.characterId, '加入团队，团队人数:', this.followers.length + 1);
    }
};

/**
 * 添加新跟随者到团队（不刷新现有成员位置）
 */
NPCManager.prototype.addNewFollowerToTeam = function(newFollower) {
    var player = this.gameEngine.player;
    var personality = newFollower.personality;
    
    // 计算新跟随者的理想位置
    var targetOffset = this.calculateFollowerOffset(newFollower, personality);
    var targetX = player.x + targetOffset.x;
    var targetY = player.y + targetOffset.y;
    
    // 直接移动新跟随者到理想位置
    newFollower.x = targetX;
    newFollower.y = targetY;
    
    // 添加到跟随者数组
    this.followers.push(newFollower);
    
    console.log('[NPC] 新跟随者已加入团队，位置:', targetX, targetY);
};

/**
 * 获取角色个性
 */
NPCManager.prototype.getCharacterPersonality = function(character) {
    var seed = character.id * 12345;
    var random = this.seededRandom(seed);
    
    return {
        followDistance: 40 + random() * 40,
        moveSpeed: 2 + random() * 3,
        aggressiveness: random(),
        randomness: random() * 0.3,
        reactionDelay: 100 + random() * 400,
        personalityType: this.getPersonalityType(character.id)
    };
};

/**
 * 计算跟随者偏移位置
 */
NPCManager.prototype.calculateFollowerOffset = function(follower, personality) {
    var baseDistance = personality.followDistance;
    var angle = (follower.id * 45) % 360;
    var rad = angle * Math.PI / 180;
    
    var offsetX = Math.cos(rad) * baseDistance;
    var offsetY = Math.sin(rad) * baseDistance;
    
    return { x: offsetX, y: offsetY };
};

/**
 * 获取个性类型
 */
NPCManager.prototype.getPersonalityType = function(characterId) {
    var types = ['leader', 'supporter', 'scout', 'guardian', 'independent'];
    return types[characterId % types.length];
};

/**
 * 种子随机数生成器
 */
NPCManager.prototype.seededRandom = function(seed) {
    var m = 2147483647;
    var a = 16807;
    var s = seed % m;
    return function() {
        s = (a * s) % m;
        return (s - 1) / (m - 1);
    };
};

/**
 * 更新NPC空闲行为
 */
NPCManager.prototype.updateNPCIdleBehavior = function(npc, deltaTime) {
    // 简化的空闲行为
    if (!npc.idleBehavior) {
        npc.idleBehavior = 'idle';
        npc.behaviorTimer = 0;
        npc.behaviorDuration = 2000 + Math.random() * 3000;
    }
    
    npc.behaviorTimer += deltaTime;
    
    if (npc.behaviorTimer >= npc.behaviorDuration) {
        // 重置行为
        npc.idleBehavior = 'idle';
        npc.behaviorTimer = 0;
        npc.behaviorDuration = 2000 + Math.random() * 3000;
    }
};
