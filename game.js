/**
 * 末日Q行 - 抖音小程序游戏
 * 一个生存至100天的挑战游戏
 * 使用ES5语法，完全兼容抖音小程序环境
 */


// ========================================
// 人物系统 (Character System)
// ========================================

// 基础人物类
function BaseCharacter(config) {
    this.id = config.id || 1;
    this.name = config.name || '角色' + this.id;
    this.description = config.description || '这是一个神秘的角色';
    this.colors = config.colors || this.getDefaultColors();
    this.features = config.features || this.getDefaultFeatures();
    this.animations = config.animations || this.getDefaultAnimations();
}

BaseCharacter.prototype.getDefaultColors = function () {
    return {
        skin: '#FF8C42',
        skinHighlight: '#FFB366',
        skinShadow: '#E6732A',
        clothes: '#FFFFFF',
        clothesShadow: '#E0E0E0',
        clothesDetail: '#F0F0F0',
        hair: '#1A1A1A',
        hairHighlight: '#404040',
        eyes: '#000000',
        eyesHighlight: '#FFFFFF',
        mouth: '#D4621F',
        mouthShadow: '#E6732A'
    };
};

BaseCharacter.prototype.getDefaultFeatures = function () {
    return {
        hasGlasses: true, hairStyle: 'normal', bodyType: 'normal', clothingStyle: 'casual', accessory: 'sunglasses'
    };
};

BaseCharacter.prototype.getDefaultAnimations = function () {
    return {walkBobAmplitude: 1.5, walkLegSwingAmplitude: 3, walkArmSwingAmplitude: 2, walkSpeed: 200};
};

BaseCharacter.prototype.calculateAnimationOffsets = function (player) {
    var offsets = {bobOffset: 0, leftLegOffset: 0, rightLegOffset: 0, leftArmOffset: 0, rightArmOffset: 0};
    if (player.isWalking) {
        offsets.bobOffset = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkBobAmplitude;
        var legSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkLegSwingAmplitude;
        offsets.leftLegOffset = legSwing;
        offsets.rightLegOffset = -legSwing;
        var armSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkArmSwingAmplitude;
        offsets.leftArmOffset = -armSwing;
        offsets.rightArmOffset = armSwing;
    }
    return offsets;
};

BaseCharacter.prototype.render = function (ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    y += offsets.bobOffset;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    this.renderBody(ctx, x, y, player);
    this.renderHead(ctx, x, y, player);
    this.renderArms(ctx, x, y, player);
    this.renderLegs(ctx, x, y, player);
    ctx.restore();
};

BaseCharacter.prototype.renderBody = function (ctx, x, y, player) {
    ctx.fillStyle = this.colors.clothes;
    ctx.fillRect(x - 10, y - 6, 20, 18);
    ctx.fillStyle = this.colors.clothesShadow;
    ctx.fillRect(x + 8, y - 4, 2, 14);
    ctx.fillRect(x - 8, y + 10, 16, 2);
    ctx.fillStyle = this.colors.clothesDetail;
    ctx.fillRect(x - 6, y - 2, 2, 8);
    ctx.fillRect(x + 4, y + 2, 2, 6);
};

BaseCharacter.prototype.renderHead = function (ctx, x, y, player) {
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 10, y - 20, 20, 16);
    ctx.fillStyle = this.colors.skinHighlight;
    ctx.fillRect(x - 8, y - 18, 4, 4);
    ctx.fillRect(x + 4, y - 16, 4, 3);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x + 8, y - 16, 2, 12);
    ctx.fillRect(x - 6, y - 6, 12, 2);
    this.renderHair(ctx, x, y, player);
    this.renderFacialFeatures(ctx, x, y, player);
};

BaseCharacter.prototype.renderHair = function (ctx, x, y, player) {
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(x - 12, y - 28, 24, 12);
    ctx.fillRect(x - 10, y - 32, 20, 6);
    ctx.fillRect(x - 14, y - 26, 4, 8);
    ctx.fillRect(x + 10, y - 26, 4, 8);
    ctx.fillRect(x - 8, y - 22, 16, 4);
    ctx.fillRect(x - 4, y - 24, 8, 2);
    ctx.fillStyle = this.colors.hairHighlight;
    ctx.fillRect(x - 6, y - 30, 3, 2);
    ctx.fillRect(x + 3, y - 32, 3, 2);
    ctx.fillRect(x - 2, y - 22, 4, 1);
};

BaseCharacter.prototype.renderFacialFeatures = function (ctx, x, y, player) {
    if (this.features.hasGlasses) this.renderGlasses(ctx, x, y, player); else this.renderEyes(ctx, x, y, player);
    this.renderNose(ctx, x, y, player);
    this.renderMouth(ctx, x, y, player);
};

BaseCharacter.prototype.renderGlasses = function (ctx, x, y, player) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 8, y - 18, 16, 6);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 7, y - 17, 6, 4);
    ctx.fillRect(x + 1, y - 17, 6, 4);
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - 6, y - 17, 2, 1);
    ctx.fillRect(x + 2, y - 17, 2, 1);
    ctx.fillStyle = '#555555';
    ctx.fillRect(x - 7, y - 16, 1, 2);
    ctx.fillRect(x + 6, y - 16, 1, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 1, y - 17, 2, 2);
    ctx.fillRect(x - 10, y - 17, 2, 1);
    ctx.fillRect(x + 8, y - 17, 2, 1);
};

BaseCharacter.prototype.renderEyes = function (ctx, x, y, player) {
    ctx.fillStyle = this.colors.eyes;
    ctx.fillRect(x - 6, y - 16, 3, 2);
    ctx.fillRect(x + 3, y - 16, 3, 2);
    ctx.fillStyle = this.colors.eyesHighlight;
    ctx.fillRect(x - 5, y - 16, 1, 1);
    ctx.fillRect(x + 4, y - 16, 1, 1);
};

BaseCharacter.prototype.renderNose = function (ctx, x, y, player) {
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 1, y - 12, 2, 2);
    ctx.fillStyle = this.colors.skinHighlight;
    ctx.fillRect(x, y - 13, 1, 1);
};

BaseCharacter.prototype.renderMouth = function (ctx, x, y, player) {
    ctx.fillStyle = this.colors.mouth;
    ctx.fillRect(x - 2, y - 10, 4, 1);
    ctx.fillStyle = this.colors.mouthShadow;
    ctx.fillRect(x - 1, y - 9, 2, 1);
};

BaseCharacter.prototype.renderArms = function (ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 14, y - 4 + offsets.leftArmOffset, 4, 10);
    ctx.fillRect(x - 16, y + 4 + offsets.leftArmOffset, 4, 8);
    ctx.fillRect(x + 10, y - 4 + offsets.rightArmOffset, 4, 10);
    ctx.fillRect(x + 12, y + 4 + offsets.rightArmOffset, 4, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 12, y + 2 + offsets.leftArmOffset, 2, 4);
    ctx.fillRect(x + 10, y + 2 + offsets.rightArmOffset, 2, 4);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 18, y + 10 + offsets.leftArmOffset, 4, 4);
    ctx.fillRect(x + 14, y + 10 + offsets.rightArmOffset, 4, 4);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 16, y + 12 + offsets.leftArmOffset, 2, 2);
    ctx.fillRect(x + 14, y + 12 + offsets.rightArmOffset, 2, 2);
};

BaseCharacter.prototype.renderLegs = function (ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 6, y + 12 + offsets.leftLegOffset, 5, 14);
    ctx.fillRect(x - 7, y + 24 + offsets.leftLegOffset, 5, 8);
    ctx.fillRect(x + 1, y + 12 + offsets.rightLegOffset, 5, 14);
    ctx.fillRect(x + 2, y + 24 + offsets.rightLegOffset, 5, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 2, y + 20 + offsets.leftLegOffset, 2, 6);
    ctx.fillRect(x + 1, y + 20 + offsets.rightLegOffset, 2, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 10, y + 30 + offsets.leftLegOffset, 8, 5);
    ctx.fillRect(x + 2, y + 30 + offsets.rightLegOffset, 8, 5);
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(x - 8, y + 32 + offsets.leftLegOffset, 4, 2);
    ctx.fillRect(x + 4, y + 32 + offsets.rightLegOffset, 4, 2);
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(x - 9, y + 30 + offsets.leftLegOffset, 2, 1);
    ctx.fillRect(x + 7, y + 30 + offsets.rightLegOffset, 2, 1);
};

// 人物管理器
function CharacterManager() {
    this.characters = {};
    this.currentCharacterId = 1;
    this.initializeCharacters();
}

CharacterManager.prototype.initializeCharacters = function () {
    var configs = [{
        id: 1, name: '酷炫墨镜哥', colors: {clothes: '#FFFFFF', hair: '#1A1A1A'}, features: {hasGlasses: true}
    }, {
        id: 2, name: '金发女战士', colors: {clothes: '#8E24AA', hair: '#FFD700'}, features: {hasGlasses: false}
    }, {id: 3, name: '暗影忍者', colors: {clothes: '#212121', hair: '#1A1A1A'}, features: {hasGlasses: false}}, {
        id: 4, name: '机械工程师', colors: {clothes: '#FF9800', hair: '#795548'}, features: {hasGlasses: true}
    }, {id: 5, name: '魔法师', colors: {clothes: '#3F51B5', hair: '#9C27B0'}, features: {hasGlasses: false}}, {
        id: 6, name: '海盗船长', colors: {clothes: '#8D6E63', hair: '#FF5722'}, features: {hasGlasses: false}
    }, {id: 7, name: '太空探险家', colors: {clothes: '#607D8B', hair: '#CDDC39'}, features: {hasGlasses: true}}, {
        id: 8, name: '武士', colors: {clothes: '#F44336', hair: '#424242'}, features: {hasGlasses: false}
    }, {id: 9, name: '摇滚歌手', colors: {clothes: '#E91E63', hair: '#FF1744'}, features: {hasGlasses: true}}, {
        id: 10, name: '神秘学者', colors: {clothes: '#009688', hair: '#37474F'}, features: {hasGlasses: false}
    }, {id: 11, name: '赛车手', colors: {clothes: '#FF5722', hair: '#FFC107'}, features: {hasGlasses: true}}, {
        id: 12, name: '军事指挥官', colors: {clothes: '#4CAF50', hair: '#616161'}, features: {hasGlasses: false}
    }, {id: 13, name: '幽灵猎人', colors: {clothes: '#9E9E9E', hair: '#212121'}, features: {hasGlasses: true}}, {
        id: 14, name: '网络黑客', colors: {clothes: '#00E676', hair: '#1DE9B6'}, features: {hasGlasses: false}
    }, {id: 15, name: '西部牛仔', colors: {clothes: '#8D6E63', hair: '#FFAB40'}, features: {hasGlasses: true}}, {
        id: 16, name: '外星访客', colors: {clothes: '#00BCD4', hair: '#4FC3F7'}, features: {hasGlasses: false}
    }, {id: 17, name: '格斗冠军', colors: {clothes: '#FF9800', hair: '#795548'}, features: {hasGlasses: true}}, {
        id: 18, name: '时间旅行者', colors: {clothes: '#673AB7', hair: '#9C27B0'}, features: {hasGlasses: false}
    }, {id: 19, name: '机器人', colors: {clothes: '#546E7A', hair: '#90A4AE'}, features: {hasGlasses: true}}, {
        id: 20, name: '超级英雄', colors: {clothes: '#2196F3', hair: '#FFC107'}, features: {hasGlasses: false}
    }];
    for (var i = 0; i < configs.length; i++) this.characters[configs[i].id] = new BaseCharacter(configs[i]);
};

CharacterManager.prototype.getCurrentCharacter = function () {
    return this.characters[this.currentCharacterId] || this.characters[1];
};

CharacterManager.prototype.switchCharacter = function (characterId) {
    if (characterId >= 1 && characterId <= 20 && this.characters[characterId]) {
        this.currentCharacterId = characterId;
        return true;
    }
    return false;
};

CharacterManager.prototype.renderCurrentCharacter = function (ctx, x, y, player) {
    var character = this.getCurrentCharacter();
    if (character) character.render(ctx, x, y, player);
};

// ========================================
// 僵尸系统 (Zombie System)
// ========================================

// 基础僵尸类
function BaseZombie(config) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.type = config.type || 'thin';
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.health = config.health || 30;
    this.maxHealth = config.maxHealth || 30;
    this.attack = config.attack || 8;
    this.moveSpeed = config.moveSpeed || 1.5;
    this.detectionRange = config.detectionRange || 800; // 大幅增加检测范围，让僵尸能跟随更远
    this.attackRange = config.attackRange || 25;
    this.size = config.size || 1.2; // 比人物大一点

    // AI状态机
    this.state = 'wandering'; // wandering, aware, chasing, attacking
    this.target = null;
    this.lastAttackTime = 0;
    this.attackCooldown = config.attackCooldown || 1500; // 攻击冷却时间
    this.lastStateChangeTime = Date.now(); // 状态切换时间
    this.aiUpdateTimer = 0; // AI更新计时器

    // 移动相关
    this.lastX = this.x;
    this.lastY = this.y;
    this.isWalking = false;
    this.direction = 'down';
    this.wanderTarget = null;
    this.wanderTimer = 0;

    // 动画相关
    this.walkAnimationFrame = 0;
    this.lastAnimationTime = 0;
    this.walkAnimationSpeed = 300; // 比人物慢一点
    
    // 对象池相关
    this.active = true;
}

// 重置僵尸状态（用于对象池）
BaseZombie.prototype.reset = function(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.state = 'wandering';
    this.target = null;
    this.lastAttackTime = 0;
    this.aiUpdateTimer = 0;
    this.wanderTarget = null;
    this.wanderTimer = 0;
    this.isWalking = false;
    this.direction = 'down';
    this.walkAnimationFrame = 0;
    this.lastAnimationTime = 0;
    
    // 更新配置
    var zombieTypes = this.gameEngine ? this.gameEngine.zombieManager.zombieTypes : {};
    if (zombieTypes[type]) {
        var config = zombieTypes[type];
        this.attack = config.attack;
        this.moveSpeed = config.moveSpeed;
        this.detectionRange = config.detectionRange;
        this.attackCooldown = config.attackCooldown;
        this.size = config.size;
    }
};

BaseZombie.prototype.update = function (deltaTime, gameEngine) {
    this.gameEngine = gameEngine;
    this.updateAI(deltaTime, gameEngine);
    this.updateAnimation(deltaTime);
    this.updateMovement(deltaTime);
};

BaseZombie.prototype.updateAI = function (deltaTime, gameEngine) {
    if (!this.aiUpdateTimer) this.aiUpdateTimer = 0;
    this.aiUpdateTimer += deltaTime;

    if (this.aiUpdateTimer < 100) return; // 提高AI更新频率
    this.aiUpdateTimer = 0;

    var currentTime = Date.now();
    var playerDistance = Math.sqrt(Math.pow(this.x - gameEngine.player.x, 2) + Math.pow(this.y - gameEngine.player.y, 2));

    // 状态机核心逻辑
    switch (this.state) {
        case 'wandering':
            this.updateWanderingState(playerDistance, gameEngine, currentTime);
            break;
        case 'aware':
            this.updateAwareState(playerDistance, gameEngine, currentTime);
            break;
        case 'chasing':
            this.updateChasingState(playerDistance, gameEngine, currentTime);
            break;
        case 'attacking':
            this.updateAttackingState(playerDistance, gameEngine, currentTime);
            break;
        default:
            this.state = 'wandering';
            break;
    }
};

// 游荡状态更新
BaseZombie.prototype.updateWanderingState = function (playerDistance, gameEngine, currentTime) {
    // 检测是否有人类进入察觉范围（70%检测范围）
    var awareRange = this.detectionRange * 0.7;
    if (playerDistance <= awareRange && gameEngine.player.health > 0 && !gameEngine.player.isDead) {
        // 游荡→察觉：检测到人类进入察觉范围
        this.state = 'aware';
        this.target = gameEngine.player;
        this.lastStateChangeTime = currentTime;
        console.log('[ZombieAI]', this.type, '从游荡切换到察觉状态，距离:', playerDistance.toFixed(0));
        return;
    }
    
    // 继续游荡
    this.wander(100); // 固定时间间隔
};

// 察觉状态更新（新增）
BaseZombie.prototype.updateAwareState = function (playerDistance, gameEngine, currentTime) {
    // 检查目标是否仍然有效
    if (!this.target || this.target.health <= 0 || this.target.isDead) {
        // 察觉→游荡：目标无效
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从察觉切换到游荡状态（目标无效）');
        return;
    }
    
    // 检查是否进入追击范围
    if (playerDistance <= this.detectionRange) {
        // 察觉→追击：进入追击范围
        this.state = 'chasing';
        console.log('[ZombieAI]', this.type, '从察觉切换到追击状态');
        return;
    }
    
    // 检查是否超出察觉范围
    if (playerDistance > this.detectionRange * 0.8) {
        // 察觉→游荡：超出察觉范围
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从察觉切换到游荡状态（超出察觉范围）');
        return;
    }
    
    // 察觉状态：缓慢转向玩家方向
    var dx = this.target.x - this.x;
    var dy = this.target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        var dirX = dx / distance;
        var dirY = dy / distance;
        
        // 缓慢移动（0.3倍速度）
        var slowSpeed = this.moveSpeed * 0.3;
        var newX = this.x + dirX * slowSpeed;
        var newY = this.y + dirY * slowSpeed;
        
        // 检查移动安全性
        if (this.canZombieMoveTo(newX, newY, this.gameEngine)) {
            this.x = newX;
            this.y = newY;
            this.isWalking = true;
            this.direction = this.getDirectionFromDelta(dirX, dirY);
        }
    }
};

// 追击状态更新
BaseZombie.prototype.updateChasingState = function (playerDistance, gameEngine, currentTime) {
    // 检查目标是否仍然有效
    if (!this.target || this.target.health <= 0 || this.target.isDead) {
        // 追击→游荡：目标无效
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从追击切换到游荡状态（目标无效）');
        return;
    }
    
    // 检查目标是否超出检测范围（增加追击距离）
    var chaseDistance = this.detectionRange * 1.2; // 追击距离比检测范围多20%
    if (playerDistance > chaseDistance) {
        // 追击→游荡：目标超出追击距离
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从追击切换到游荡状态（目标超出追击距离:', chaseDistance.toFixed(0), '像素）');
        return;
    }
    
    // 检查是否进入攻击范围
    if (playerDistance <= this.attackRange) {
        // 追击→攻击：与目标距离≤攻击范围
        this.state = 'attacking';
        this.lastStateChangeTime = currentTime;
        console.log('[ZombieAI]', this.type, '从追击切换到攻击状态');
        return;
    }
    
    // 继续追击
    this.chaseTarget(this.target);
};

// 攻击状态更新
BaseZombie.prototype.updateAttackingState = function (playerDistance, gameEngine, currentTime) {
    // 检查目标是否仍然有效
    if (!this.target || this.target.health <= 0 || this.target.isDead) {
        // 攻击→游荡：目标无效
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从攻击切换到游荡状态（目标无效）');
        return;
    }
    
    // 检查目标是否逃离攻击范围
    if (playerDistance > this.attackRange) {
        var chaseDistance = this.detectionRange * 1.2; // 追击距离比检测范围多20%
        if (playerDistance <= chaseDistance) {
            // 攻击→追击：目标逃离攻击范围但仍在追击距离内
            this.state = 'chasing';
            console.log('[ZombieAI]', this.type, '从攻击切换到追击状态');
        } else {
            // 攻击→游荡：目标超出追击距离
            this.state = 'wandering';
            this.target = null;
            console.log('[ZombieAI]', this.type, '从攻击切换到游荡状态（目标超出追击距离:', chaseDistance.toFixed(0), '像素）');
        }
        return;
    }
    
    // 执行攻击
    if (currentTime - this.lastAttackTime >= this.attackCooldown) {
        this.attackTarget(this.target);
        this.lastAttackTime = currentTime;
        console.log('[ZombieAI]', this.type, '执行攻击，目标血量:', this.target.health);
    }
};

BaseZombie.prototype.chaseTarget = function (target) {
    if (!target) return;

    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        var dirX = dx / distance;
        var dirY = dy / distance;
        
        // 群体追击策略：≥3只僵尸时形成包围
        var nearbyZombies = this.getNearbyZombies(300);
        if (nearbyZombies.length >= 3) {
            var flankingAngle = this.calculateFlankingAngle(target, nearbyZombies);
            if (flankingAngle !== null) {
                // 计算侧翼位置
                var flankX = target.x + Math.cos(flankingAngle) * 150;
                var flankY = target.y + Math.sin(flankingAngle) * 150;
                
                // 向侧翼位置移动
                var flankDx = flankX - this.x;
                var flankDy = flankY - this.y;
                var flankDistance = Math.sqrt(flankDx * flankDx + flankDy * flankDy);
                
                if (flankDistance > 0) {
                    dirX = flankDx / flankDistance;
                    dirY = flankDy / flankDistance;
                }
            }
        }
        
        var newX = this.x + dirX * this.moveSpeed;
        var newY = this.y + dirY * this.moveSpeed;

        // 尝试直接路径移动
        if (this.canZombieMoveAlongPath(this.x, this.y, newX, newY, this.gameEngine)) {
            this.x = newX;
            this.y = newY;
        } else {
            // 如果直接路径被阻挡，使用A*寻路算法
            var path = this.findPathToTarget(target);
            if (path && path.length > 0) {
                // 移动到路径的下一个节点
                var nextNode = path[0];
                var pathDx = nextNode.x - this.x;
                var pathDy = nextNode.y - this.y;
                var pathDistance = Math.sqrt(pathDx * pathDx + pathDy * pathDy);
                
                if (pathDistance > 0) {
                    var pathDirX = pathDx / pathDistance;
                    var pathDirY = pathDy / pathDistance;
                    var moveX = this.x + pathDirX * this.moveSpeed;
                    var moveY = this.y + pathDirY * this.moveSpeed;
                    
                    if (this.canZombieMoveTo(moveX, moveY, this.gameEngine)) {
                        this.x = moveX;
                        this.y = moveY;
                    }
                }
            } else {
                // 如果A*寻路失败，尝试单轴移动
                var canMoveX = this.canZombieMoveAlongPath(this.x, this.y, newX, this.y, this.gameEngine);
                var canMoveY = this.canZombieMoveAlongPath(this.x, this.y, this.x, newY, this.gameEngine);
                
                if (canMoveX) {
                    this.x = newX;
                } else if (canMoveY) {
                    this.y = newY;
                }
            }
        }

        this.isWalking = true;
        this.direction = this.getDirectionFromDelta(dirX, dirY);
    }
};

// 获取附近僵尸
BaseZombie.prototype.getNearbyZombies = function(radius) {
    var nearby = [];
    if (!this.gameEngine || !this.gameEngine.zombieManager) return nearby;
    
    for (var i = 0; i < this.gameEngine.zombieManager.zombies.length; i++) {
        var zombie = this.gameEngine.zombieManager.zombies[i];
        if (zombie !== this && zombie.active) {
            var distance = Math.sqrt(
                Math.pow(this.x - zombie.x, 2) + 
                Math.pow(this.y - zombie.y, 2)
            );
            if (distance <= radius) {
                nearby.push(zombie);
            }
        }
    }
    return nearby;
};

// 计算侧翼角度
BaseZombie.prototype.calculateFlankingAngle = function(target, nearbyZombies) {
    if (nearbyZombies.length === 0) return null;
    
    // 计算僵尸群的平均位置
    var avgX = 0, avgY = 0;
    for (var i = 0; i < nearbyZombies.length; i++) {
        avgX += nearbyZombies[i].x;
        avgY += nearbyZombies[i].y;
    }
    avgX /= nearbyZombies.length;
    avgY /= nearbyZombies.length;
    
    // 计算从目标到僵尸群的方向
    var dx = avgX - target.x;
    var dy = avgY - target.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        // 返回相反方向（侧翼位置）
        return Math.atan2(-dy, -dx);
    }
    
    return null;
};

// A*寻路算法：寻找从当前位置到目标的最短路径
BaseZombie.prototype.findPathToTarget = function (target) {
    if (!this.gameEngine) return null;
    
    var startX = Math.floor(this.x / 50) * 50; // 网格化坐标
    var startY = Math.floor(this.y / 50) * 50;
    var endX = Math.floor(target.x / 50) * 50;
    var endY = Math.floor(target.y / 50) * 50;
    
    // 简单的A*实现，适用于小范围寻路
    var openList = [{x: startX, y: startY, g: 0, h: 0, f: 0, parent: null}];
    var closedList = [];
    var maxIterations = 100; // 防止无限循环
    
    while (openList.length > 0 && maxIterations > 0) {
        maxIterations--;
        
        // 找到f值最小的节点
        var currentNode = openList[0];
        var currentIndex = 0;
        for (var i = 1; i < openList.length; i++) {
            if (openList[i].f < currentNode.f) {
                currentNode = openList[i];
                currentIndex = i;
            }
        }
        
        // 从开放列表中移除当前节点
        openList.splice(currentIndex, 1);
        closedList.push(currentNode);
        
        // 检查是否到达目标
        if (currentNode.x === endX && currentNode.y === endY) {
            // 构建路径
            var path = [];
            var current = currentNode;
            while (current) {
                path.unshift({x: current.x, y: current.y});
                current = current.parent;
            }
            return path;
        }
        
        // 检查相邻节点
        var neighbors = this.getNeighborNodes(currentNode);
        for (var j = 0; j < neighbors.length; j++) {
            var neighbor = neighbors[j];
            
            // 检查是否已在关闭列表中
            var inClosedList = false;
            for (var k = 0; k < closedList.length; k++) {
                if (closedList[k].x === neighbor.x && closedList[k].y === neighbor.y) {
                    inClosedList = true;
                    break;
                }
            }
            if (inClosedList) continue;
            
            // 检查节点是否可通行
            if (!this.canZombieMoveTo(neighbor.x, neighbor.y, this.gameEngine)) {
                continue;
            }
            
            var g = currentNode.g + 50; // 网格距离
            var h = Math.sqrt(Math.pow(neighbor.x - endX, 2) + Math.pow(neighbor.y - endY, 2));
            var f = g + h;
            
            // 检查是否已在开放列表中
            var inOpenList = false;
            for (var l = 0; l < openList.length; l++) {
                if (openList[l].x === neighbor.x && openList[l].y === neighbor.y) {
                    if (g < openList[l].g) {
                        openList[l].g = g;
                        openList[l].f = f;
                        openList[l].parent = currentNode;
                    }
                    inOpenList = true;
                    break;
                }
            }
            
            if (!inOpenList) {
                neighbor.g = g;
                neighbor.h = h;
                neighbor.f = f;
                neighbor.parent = currentNode;
                openList.push(neighbor);
            }
        }
    }
    
    return null; // 未找到路径
};

// 获取相邻节点
BaseZombie.prototype.getNeighborNodes = function (node) {
    var neighbors = [];
    var directions = [
        {x: 0, y: -50},   // 上
        {x: 50, y: 0},    // 右
        {x: 0, y: 50},    // 下
        {x: -50, y: 0},   // 左
        {x: 50, y: -50},  // 右上
        {x: 50, y: 50},   // 右下
        {x: -50, y: 50},  // 左下
        {x: -50, y: -50}  // 左上
    ];
    
    for (var i = 0; i < directions.length; i++) {
        var dir = directions[i];
        neighbors.push({
            x: node.x + dir.x,
            y: node.y + dir.y
        });
    }
    
    return neighbors;
};

BaseZombie.prototype.canZombieMoveTo = function (x, y, gameEngine) {
    var zombieRadius = 20;
    var mapConfig = gameEngine ? gameEngine.mapConfig : {width: 10000, height: 10000};

    // 检查地图边界
    if (x < zombieRadius || x > mapConfig.width - zombieRadius || y < zombieRadius || y > mapConfig.height - zombieRadius) {
        return false;
    }

    // 检查与建筑物的碰撞
    var buildings = gameEngine ? gameEngine.buildings : [];
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        if (x + zombieRadius >= building.x && x - zombieRadius <= building.x + building.width && y + zombieRadius >= building.y && y - zombieRadius <= building.y + building.height) {
            return false;
        }
    }

    return true;
};

// 新增：僵尸路径安全检查
BaseZombie.prototype.canZombieMoveAlongPath = function (fromX, fromY, toX, toY, gameEngine) {
    var zombieRadius = 20;
    
    // 计算路径上的多个检查点
    var distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    var checkPoints = Math.max(2, Math.floor(distance / zombieRadius));
    
    for (var i = 0; i <= checkPoints; i++) {
        var t = i / checkPoints;
        var checkX = fromX + (toX - fromX) * t;
        var checkY = fromY + (toY - fromY) * t;
        
        if (!this.canZombieMoveTo(checkX, checkY, gameEngine)) {
            return false;
        }
    }
    
    return true;
};

BaseZombie.prototype.findZombieAlternativePath = function (targetX, targetY, gameEngine) {
    var searchRadius = 50;
    var stepSize = 10;
    var directions = [{dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}, {dx: 1, dy: 1}, {
        dx: 1, dy: -1
    }, {dx: -1, dy: 1}, {dx: -1, dy: -1}];

    for (var radius = stepSize; radius <= searchRadius; radius += stepSize) {
        for (var i = 0; i < directions.length; i++) {
            var dir = directions[i];
            var testX = this.x + dir.dx * radius;
            var testY = this.y + dir.dy * radius;

            if (this.canZombieMoveTo(testX, testY, gameEngine)) {
                var currentDistance = Math.sqrt(Math.pow(this.x - targetX, 2) + Math.pow(this.y - targetY, 2));
                var testDistance = Math.sqrt(Math.pow(testX - targetX, 2) + Math.pow(testY - targetY, 2));

                if (testDistance < currentDistance) {
                    return {success: true, x: testX, y: testY};
                }
            }
        }
    }

    return {success: false};
};

BaseZombie.prototype.wander = function (deltaTime) {
    // 初始化游荡计时器
    if (!this.wanderTimer) this.wanderTimer = 0;
    if (!this.wanderTarget) this.wanderTarget = null;
    
    this.wanderTimer -= deltaTime;

    // 每500ms改变方向，实现随机游荡
    if (!this.wanderTarget || this.wanderTimer <= 0) {
        var attempts = 0;
        var maxAttempts = 15; // 增加尝试次数

        while (attempts < maxAttempts) {
            var angle = Math.random() * Math.PI * 2;
            var distance = 80 + Math.random() * 120; // 增加游荡范围
            var targetX = this.x + Math.cos(angle) * distance;
            var targetY = this.y + Math.sin(angle) * distance;

            // 检查目标位置是否可通行
            if (this.canZombieMoveTo(targetX, targetY, this.gameEngine)) {
                this.wanderTarget = {x: targetX, y: targetY};
                break;
            }
            attempts++;
        }

        if (!this.wanderTarget) {
            // 如果找不到合适的目标，在原地小范围移动
            this.wanderTarget = {
                x: this.x + (Math.random() - 0.5) * 60,
                y: this.y + (Math.random() - 0.5) * 60
            };
        }

        // 游荡时间：2-4秒
        this.wanderTimer = 2000 + Math.random() * 2000;
    }

    // 执行游荡移动
    if (this.wanderTarget) {
        var dx = this.wanderTarget.x - this.x;
        var dy = this.wanderTarget.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) { // 增加到达阈值
            var dirX = dx / distance;
            var dirY = dy / distance;
            var newX = this.x + dirX * this.moveSpeed * 0.6; // 游荡速度稍慢
            var newY = this.y + dirY * this.moveSpeed * 0.6;

            // 使用路径安全检查，防止穿墙
            if (this.canZombieMoveAlongPath(this.x, this.y, newX, newY, this.gameEngine)) {
                this.x = newX;
                this.y = newY;
                this.isWalking = true;
                this.direction = this.getDirectionFromDelta(dirX, dirY);
            } else {
                // 如果路径被阻挡，重新选择游荡目标
                this.wanderTarget = null;
                this.wanderTimer = 0;
                this.isWalking = false;
            }
        } else {
            // 到达目标，停止移动
            this.wanderTarget = null;
            this.isWalking = false;
        }
    }
};

BaseZombie.prototype.attackTarget = function (target) {
    if (!target || target.health <= 0) return;

    target.health -= this.attack;
    
    // 确保血量不会变成负数
    if (target.health < 0) {
        target.health = 0;
    }

    if (target.health <= 0) {
        this.onTargetDeath(target);
        
        // 如果目标是玩家，立即触发游戏结束
        if (target === this.gameEngine.player) {
            this.gameEngine.gameOver('death');
        }
    }
};

BaseZombie.prototype.onTargetDeath = function (target) {
    target.health = 0;
    target.isDead = true;
    this.state = 'wandering';
    this.target = null;
};

BaseZombie.prototype.takeDamage = function (damage) {
    this.health -= damage;

    if (this.health <= 0) {
        this.health = 0;
        return true;
    }

    return false;
};

BaseZombie.prototype.updateAnimation = function (deltaTime) {
    if (this.isWalking) {
        this.lastAnimationTime += deltaTime;
        if (this.lastAnimationTime >= this.walkAnimationSpeed) {
            this.walkAnimationFrame = (this.walkAnimationFrame + 1) % 4;
            this.lastAnimationTime = 0;
        }
    } else {
        this.walkAnimationFrame = 0;
    }
};

BaseZombie.prototype.updateMovement = function (deltaTime) {
    if (Math.abs(this.x - this.lastX) > 0.1 || Math.abs(this.y - this.lastY) > 0.1) {
        this.isWalking = true;
    } else {
        this.isWalking = false;
    }

    this.lastX = this.x;
    this.lastY = this.y;
};

BaseZombie.prototype.getDirectionFromDelta = function (deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
    } else {
        return deltaY > 0 ? 'down' : 'up';
    }
};

BaseZombie.prototype.render = function (ctx, camera) {
    var viewWidth = ctx.canvas.width / camera.zoom;
    var viewHeight = ctx.canvas.height / camera.zoom;
    var viewLeft = camera.x;
    var viewRight = camera.x + viewWidth;
    var viewTop = camera.y;
    var viewBottom = camera.y + viewHeight;

    var margin = 100;
    if (this.x < viewLeft - margin || this.x > viewRight + margin || this.y < viewTop - margin || this.y > viewBottom + margin) {
        return;
    }

    ctx.save();
    var scale = this.size;
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);

    this.renderZombie(ctx);
    this.renderHealthBar(ctx);
    this.renderStateIndicator(ctx);

    ctx.restore();
};

BaseZombie.prototype.renderZombie = function (ctx) {
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-12, -12, 24, 24);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-8, -8, 3, 3);
    ctx.fillRect(5, -8, 3, 3);

    ctx.fillStyle = '#000000';
    ctx.fillRect(-4, -2, 8, 2);
};

BaseZombie.prototype.renderHealthBar = function (ctx) {
    var healthPercentage = this.health / this.maxHealth;
    var barWidth = 20;
    var barHeight = 3;

    ctx.fillStyle = '#333333';
    ctx.fillRect(-barWidth / 2, -20, barWidth, barHeight);

    ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : healthPercentage > 0.2 ? '#FF9800' : '#F44336';
    ctx.fillRect(-barWidth / 2, -20, barWidth * healthPercentage, barHeight);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-barWidth / 2, -20, barWidth, barHeight);
};

BaseZombie.prototype.renderStateIndicator = function (ctx) {
    var indicator = '';
    var color = '#ffffff';

    switch (this.state) {
        case 'chasing':
            indicator = '!';
            color = '#ff4444';
            break;
        case 'attacking':
            indicator = '⚡';
            color = '#ff0000';
            break;
        case 'wandering':
            indicator = '?';
            color = '#888888';
            break;
    }

    if (indicator) {
        ctx.fillStyle = color;
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(indicator, 0, -25);
    }
};

// 瘦僵尸类
function ThinZombie(config) {
    BaseZombie.call(this, config);
}

ThinZombie.prototype = Object.create(BaseZombie.prototype);
ThinZombie.prototype.constructor = ThinZombie;

ThinZombie.prototype.renderZombie = function (ctx) {
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-8, -15, 16, 30);

    ctx.fillStyle = '#654321';
    ctx.fillRect(-10, -20, 20, 15);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-7, -17, 3, 3);
    ctx.fillRect(4, -17, 3, 3);

    ctx.fillStyle = '#000000';
    ctx.fillRect(-4, -12, 8, 2);

    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-12, -10, 4, 20);
    ctx.fillRect(8, -10, 4, 20);
    ctx.fillRect(-6, 15, 4, 15);
    ctx.fillRect(2, 15, 4, 15);

    ctx.fillStyle = '#444444';
    ctx.fillRect(-6, -5, 12, 8);
    ctx.fillRect(-4, 5, 8, 6);
};

// 胖僵尸类
function FatZombie(config) {
    BaseZombie.call(this, config);
}

FatZombie.prototype = Object.create(BaseZombie.prototype);
FatZombie.prototype.constructor = FatZombie;

FatZombie.prototype.renderZombie = function (ctx) {
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-15, -12, 30, 24);

    ctx.fillStyle = '#654321';
    ctx.fillRect(-12, -22, 24, 18);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-9, -19, 4, 4);
    ctx.fillRect(5, -19, 4, 4);

    ctx.fillStyle = '#000000';
    ctx.fillRect(-6, -14, 12, 3);

    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-18, -8, 6, 16);
    ctx.fillRect(12, -8, 6, 16);
    ctx.fillRect(-10, 12, 8, 18);
    ctx.fillRect(2, 12, 8, 18);

    ctx.fillStyle = '#666666';
    ctx.fillRect(-12, -5, 24, 15);

    ctx.fillStyle = '#333333';
    ctx.fillRect(-10, -2, 20, 8);
};

// 僵尸Boss1类
function ZombieBoss1(config) {
    BaseZombie.call(this, config);
}

ZombieBoss1.prototype = Object.create(BaseZombie.prototype);
ZombieBoss1.prototype.constructor = ZombieBoss1;

ZombieBoss1.prototype.renderZombie = function (ctx) {
    ctx.fillStyle = '#2d0d0d';
    ctx.fillRect(-18, -15, 36, 30);

    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(-15, -28, 30, 22);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-12, -24, 5, 5);
    ctx.fillRect(7, -24, 5, 5);

    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(-14, -26, 9, 9);
    ctx.fillRect(5, -26, 9, 9);

    ctx.fillStyle = '#000000';
    ctx.fillRect(-8, -18, 16, 4);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -18, 2, 3);
    ctx.fillRect(-2, -18, 2, 3);
    ctx.fillRect(2, -18, 2, 3);
    ctx.fillRect(6, -18, 2, 3);

    ctx.fillStyle = '#2d0d0d';
    ctx.fillRect(-24, -10, 8, 25);
    ctx.fillRect(16, -10, 8, 25);
    ctx.fillRect(-12, 15, 10, 20);
    ctx.fillRect(2, 15, 10, 20);

    ctx.fillStyle = '#444444';
    ctx.fillRect(-15, -8, 30, 18);

    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-10, -25, 2, 15);
    ctx.fillRect(5, -22, 3, 12);
    ctx.fillRect(-5, -5, 8, 2);
};

ZombieBoss1.prototype.attackTarget = function (target) {
    if (!target || target.health <= 0) return;

    target.health -= this.attack;

    if (target.x !== undefined && target.y !== undefined) {
        var dx = target.x - this.x;
        var dy = target.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            var knockbackDistance = 20;
            target.x += (dx / distance) * knockbackDistance;
            target.y += (dy / distance) * knockbackDistance;
        }
    }

    if (target.health <= 0) {
        this.onTargetDeath(target);
    }
};

// 僵尸管理器
function ZombieManager() {
    this.zombies = [];
    this.zombieTypes = this.getZombieTypes();
    this.gameEngine = null; // 游戏引擎引用

    // 性能优化：空间分区系统
    this.spatialGrid = {};
    this.gridSize = 200;

    // 性能优化：对象池
    this.zombiePool = [];
    this.maxPoolSize = 100;

    // 性能优化：更新频率控制
    this.updateIntervals = {
        near: 100,    // 近距离僵尸更新频率
        medium: 300,  // 中距离僵尸更新频率
        far: 800      // 远距离僵尸更新频率
    };
    
    // 初始化对象池
    this.initializePool();
}

ZombieManager.prototype.getZombieTypes = function () {
    return {
        thin: {
            name: '瘦僵尸', health: 25, attack: 6, moveSpeed: 5.0, size: 1.1, attackCooldown: 1200, detectionRange: 600, color: '#8b0000'
        }, fat: {
            name: '胖僵尸', health: 50, attack: 12, moveSpeed: 4.5, size: 1.4, attackCooldown: 2000, detectionRange: 700, color: '#4a4a4a'
        }, boss1: {
            name: '僵尸Boss1',
            health: 100,
            attack: 20,
            moveSpeed: 6.0,
            size: 1.6,
            attackCooldown: 1000,
            detectionRange: 1000,
            color: '#2d0d0d'
        }
    };
};

// 基于生存天数计算僵尸移动速度倍数
ZombieManager.prototype.getZombieSpeedMultiplier = function (survivalDays) {
    if (survivalDays <= 10) {
        return 1.5; // 1-10天：僵尸速度是人物速度的1.5倍（更快）
    } else if (survivalDays <= 20) {
        return 1.8; // 10-20天：僵尸速度是人物速度的1.8倍
    } else if (survivalDays <= 50) {
        return 2.2; // 20-50天：僵尸速度是人物速度的2.2倍
    } else if (survivalDays <= 70) {
        return 2.6; // 50-70天：僵尸速度是人物速度的2.6倍
    } else {
        return 3.0; // 70-100天：僵尸速度是人物速度的3.0倍
    }
};

// 获取僵尸的实际移动速度（基于生存天数）
ZombieManager.prototype.getZombieActualSpeed = function (baseSpeed, survivalDays) {
    var speedMultiplier = this.getZombieSpeedMultiplier(survivalDays);
    var playerBaseSpeed = GAME_CONFIG.PLAYER.MOVE_SPEED;
    
    // 僵尸基础速度 + 基于天数的倍数调整
    var baseZombieSpeed = baseSpeed;
    var adjustedSpeed = baseZombieSpeed * speedMultiplier;
    
    // 确保僵尸速度不会太慢，至少比玩家快20%
    var minSpeed = playerBaseSpeed * 1.2;
    return Math.max(adjustedSpeed, minSpeed);
};

// 更新所有僵尸的移动速度（基于当前生存天数）
ZombieManager.prototype.updateAllZombieSpeeds = function (survivalDays) {
    var speedMultiplier = this.getZombieSpeedMultiplier(survivalDays);
    
    // 为每个僵尸类型计算正确的速度
    var thinSpeed = this.getZombieActualSpeed(5.0, survivalDays);
    var fatSpeed = this.getZombieActualSpeed(4.5, survivalDays);
    var bossSpeed = this.getZombieActualSpeed(6.0, survivalDays);
    
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        
        // 根据僵尸类型设置正确的速度
        switch (zombie.type) {
            case 'thin':
                zombie.moveSpeed = thinSpeed;
                break;
            case 'fat':
                zombie.moveSpeed = fatSpeed;
                break;
            case 'boss1':
                zombie.moveSpeed = bossSpeed;
                break;
            default:
                zombie.moveSpeed = thinSpeed; // 默认使用瘦僵尸速度
        }
        
        zombie.speedMultiplier = speedMultiplier;
    }
    
    console.log('[ZombieManager] 僵尸速度已更新，生存天数:', survivalDays, '速度倍数:', speedMultiplier);
    console.log('[ZombieManager] 各类型僵尸速度: 瘦僵尸', thinSpeed, '胖僵尸', fatSpeed, 'Boss僵尸', bossSpeed);
    
    // 显示速度对比信息
    var playerSpeed = GAME_CONFIG.PLAYER.MOVE_SPEED;
    console.log('[ZombieManager] 速度对比 - 玩家:', playerSpeed, '瘦僵尸:', thinSpeed, '胖僵尸:', fatSpeed, 'Boss僵尸:', bossSpeed);
    console.log('[ZombieManager] 速度倍数 - 瘦僵尸:', (thinSpeed/playerSpeed).toFixed(1), '胖僵尸:', (fatSpeed/playerSpeed).toFixed(1), 'Boss僵尸:', (bossSpeed/playerSpeed).toFixed(1));
};

// 对象池管理
ZombieManager.prototype.initializePool = function() {
    try {
        console.log('[ZombieManager] 初始化僵尸对象池，预创建', this.maxPoolSize, '个实例');
        
        for (var i = 0; i < this.maxPoolSize; i++) {
            var zombie = this.createZombieInstance();
            if (zombie) {
                zombie.active = false;
                this.zombiePool.push(zombie);
            }
        }
        
        console.log('[ZombieManager] 对象池初始化完成，实际创建', this.zombiePool.length, '个实例');
    } catch (error) {
        console.error('[ZombieManager] 初始化对象池时出错:', error);
        // 出错时创建空对象池
        this.zombiePool = [];
    }
};

ZombieManager.prototype.createZombieInstance = function() {
    try {
        var zombieTypes = Object.keys(this.zombieTypes);
        if (zombieTypes.length === 0) {
            console.warn('[ZombieManager] 没有可用的僵尸类型');
            return null;
        }
        
        var randomType = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
        var config = this.zombieTypes[randomType];
        
        if (!config) {
            console.warn('[ZombieManager] 僵尸配置无效:', randomType);
            return null;
        }
        
        return new BaseZombie({
            type: randomType,
            health: config.health,
            attack: config.attack,
            moveSpeed: config.moveSpeed,
            size: config.size,
            attackCooldown: config.attackCooldown,
            detectionRange: config.detectionRange,
            color: config.color,
            gameEngine: this.gameEngine
        });
    } catch (error) {
        console.error('[ZombieManager] 创建僵尸实例时出错:', error);
        return null;
    }
};

ZombieManager.prototype.getZombieFromPool = function(type, x, y) {
    // 从对象池中获取僵尸
    for (var i = 0; i < this.zombiePool.length; i++) {
        if (!this.zombiePool[i].active) {
            var zombie = this.zombiePool[i];
            zombie.reset(type, x, y);
            zombie.active = true;
            return zombie;
        }
    }
    
    // 如果对象池满了，创建新实例
    if (this.zombies.length < this.maxPoolSize) {
        var newZombie = this.createZombieInstance();
        newZombie.reset(type, x, y);
        newZombie.active = true;
        this.zombiePool.push(newZombie);
        return newZombie;
    }
    
    return null;
};

ZombieManager.prototype.returnZombieToPool = function(zombie) {
    zombie.active = false;
    zombie.health = zombie.maxHealth;
    zombie.x = -1000;
    zombie.y = -1000;
    zombie.state = 'wandering';
    zombie.target = null;
};

ZombieManager.prototype.createZombie = function (type, x, y) {
    var zombieType = this.zombieTypes[type];
    if (!zombieType) {
        console.warn('[ZombieManager] 未知的僵尸类型:', type);
        return null;
    }

    // 性能优化：从对象池获取僵尸
    var zombie = this.getZombieFromPool(type);

    if (!zombie) {
        // 获取当前生存天数
        var survivalDays = this.gameEngine ? this.gameEngine.gameData.survivalDays : 1;
        
        // 计算基于天数的实际移动速度
        var actualMoveSpeed = this.getZombieActualSpeed(zombieType.moveSpeed, survivalDays);
        
        var config = {
            type: type,
            x: x,
            y: y,
            health: zombieType.health,
            maxHealth: zombieType.health,
            attack: zombieType.attack,
            moveSpeed: actualMoveSpeed, // 使用基于天数的实际速度
            baseMoveSpeed: zombieType.moveSpeed, // 保存基础速度
            speedMultiplier: this.getZombieSpeedMultiplier(survivalDays), // 保存速度倍数
            size: zombieType.size,
            attackCooldown: zombieType.attackCooldown,
            detectionRange: zombieType.detectionRange || 800 // 使用更大的默认检测范围
        };

        switch (type) {
            case 'thin':
                zombie = new ThinZombie(config);
                break;
            case 'fat':
                zombie = new FatZombie(config);
                break;
            case 'boss1':
                zombie = new ZombieBoss1(config);
                break;
            default:
                zombie = new BaseZombie(config);
        }
    } else {
        // 获取当前生存天数
        var survivalDays = this.gameEngine ? this.gameEngine.gameData.survivalDays : 1;
        
        // 更新基于天数的实际移动速度
        var actualMoveSpeed = this.getZombieActualSpeed(zombieType.moveSpeed, survivalDays);
        
        // 重置僵尸状态
        zombie.x = x;
        zombie.y = y;
        zombie.health = zombieType.health;
        zombie.maxHealth = zombieType.health;
        zombie.moveSpeed = actualMoveSpeed; // 更新移动速度
        zombie.speedMultiplier = this.getZombieSpeedMultiplier(survivalDays); // 更新速度倍数
        zombie.state = 'wandering';
        zombie.target = null;
        zombie.lastAttackTime = 0;
        zombie.isWalking = false;
        zombie.walkAnimationFrame = 0;
    }

    this.zombies.push(zombie);
    return zombie;
};

ZombieManager.prototype.update = function (deltaTime, gameEngine) {
    // 检查玩家是否已经死亡
    if (gameEngine.player.health <= 0 && !gameEngine.player.isDead) {
        gameEngine.player.isDead = true;
        gameEngine.gameOver('death');
        return;
    }
    
    var viewWidth = gameEngine.canvas.width / gameEngine.camera.zoom;
    var viewHeight = gameEngine.canvas.height / gameEngine.camera.zoom;
    var viewLeft = gameEngine.camera.x - 200;
    var viewRight = gameEngine.camera.x + viewWidth + 200;
    var viewTop = gameEngine.camera.y - 200;
    var viewBottom = gameEngine.camera.y + viewHeight + 200;

    // 性能优化：批量处理僵尸死亡
    var deadZombies = [];

    for (var i = this.zombies.length - 1; i >= 0; i--) {
        var zombie = this.zombies[i];

        var inView = (zombie.x >= viewLeft && zombie.x <= viewRight && zombie.y >= viewTop && zombie.y <= viewBottom);
        var isChasing = zombie.state === 'chasing' || zombie.state === 'attacking';

        if (inView || isChasing) {
            // 性能优化：动态更新频率
            var distanceToPlayer = Math.sqrt(Math.pow(zombie.x - gameEngine.player.x, 2) + Math.pow(zombie.y - gameEngine.player.y, 2));
            var updateInterval = distanceToPlayer < 300 ? this.updateIntervals.near : distanceToPlayer < 800 ? this.updateIntervals.medium : this.updateIntervals.far;

            if (!zombie.lastUpdateTime) zombie.lastUpdateTime = 0;
            if (Date.now() - zombie.lastUpdateTime >= updateInterval) {
                zombie.update(deltaTime, gameEngine);
                zombie.lastUpdateTime = Date.now();
            }
        }

        if (zombie.health <= 0) {
            deadZombies.push(i);
            gameEngine.gameData.zombieKills++;
        }
    }

    // 性能优化：批量删除死亡僵尸
    for (var j = deadZombies.length - 1; j >= 0; j--) {
        var zombieIndex = deadZombies[j];
        var zombie = this.zombies[zombieIndex];

        // 回收到对象池
        if (this.zombiePool.length < this.maxPoolSize) {
            this.recycleZombie(zombie);
        }

        this.zombies.splice(zombieIndex, 1);
    }
};

ZombieManager.prototype.render = function (ctx, camera) {
    for (var i = 0; i < this.zombies.length; i++) {
        this.zombies[i].render(ctx, camera);
    }
};

ZombieManager.prototype.getZombiesInRange = function (x, y, range) {
    var zombiesInRange = [];

    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        var distance = Math.sqrt(Math.pow(zombie.x - x, 2) + Math.pow(zombie.y - y, 2));

        if (distance <= range) {
            zombiesInRange.push({zombie: zombie, distance: distance});
        }
    }

    return zombiesInRange;
};

// 性能优化：对象池管理方法
ZombieManager.prototype.getZombieFromPool = function (type) {
    for (var i = 0; i < this.zombiePool.length; i++) {
        if (this.zombiePool[i].type === type) {
            return this.zombiePool.splice(i, 1)[0];
        }
    }
    return null;
};

ZombieManager.prototype.recycleZombie = function (zombie) {
    if (this.zombiePool.length < this.maxPoolSize) {
        this.zombiePool.push(zombie);
    }
};

// ========================================
// 输入系统 (Input System)
// ========================================

// 输入处理相关函数会在GameEngine中定义，这里预留空间给工具函数

// ========================================
// 碰撞检测系统 (Collision System)
// ========================================

// 碰撞检测相关函数会在GameEngine中定义

// ========================================
// 游戏配置常量 (Game Configuration Constants)
// ========================================

// 游戏平衡配置
var GAME_CONFIG = {
    // 僵尸生成配置
    ZOMBIE_SPAWN: {
        BASE_COUNT: 10,
        PER_DAY_INCREASE: 3,
        MAX_ZOMBIES: 50,
        SPAWN_RADIUS: 2000,
        MIN_DISTANCE: 300,
        MAX_ATTEMPTS_MULTIPLIER: 10
    },

    // 玩家配置
    PLAYER: {
        BASE_HEALTH: 50, BASE_ATTACK: 15, ATTACK_RANGE: 35, ATTACK_COOLDOWN: 800, MOVE_SPEED: 3, CHARACTER_RADIUS: 18
    },

    // 团队配置
    TEAM: {
        MAX_SIZE: 20, FOLLOW_DISTANCE: 35, COLLISION_THRESHOLD: 900
    },

    // 时间配置
    TIME: {
        DAY_DURATION: 300000,    // 5分钟
        NIGHT_DURATION: 60000,   // 1分钟
        FOOD_COST_PER_DAY: 1
    },

    // 建筑配置
    BUILDING: {
        INTERACTION_DISTANCE: 60, TRIGGER_DISTANCE: 50, EXIT_COOLDOWN: 2000
    }
};

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

    // 初始化管理器
    this.characterManager = new CharacterManager();
    this.zombieManager = new ZombieManager();
    
    // 设置僵尸管理器的游戏引擎引用
    this.zombieManager.gameEngine = this;
    
    // 绘制优化设置
    this.ctx.imageSmoothingEnabled = false; // 关闭图像平滑，保持像素风格
    this.ctx.imageSmoothingQuality = 'low'; // 设置图像平滑质量

    // NPC系统
    this.npcs = [];
    this.followers = [];

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
        width: 10000, height: 10000, blockSize: 750, streetWidth: 350, buildingSpacing: 0
    };

    // 摄像机系统
    this.camera = {
        x: 0, y: 0, followTarget: null, smoothing: 0.1, zoom: 0.8
    };

    // 游戏对象
    this.buildings = this.initializeBuildings();
    
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
    console.log('[Collision] 玩家碰撞半径:', GAME_CONFIG.PLAYER.CHARACTER_RADIUS);
    console.log('[Collision] 僵尸碰撞半径: 20');
    console.log('[Collision] 跟随者碰撞半径: 15');
    
    // 调试信息：显示移动系统状态
    console.log('[Movement] 匀速移动系统已启用');
    console.log('[Movement] 玩家移动速度:', GAME_CONFIG.PLAYER.MOVE_SPEED, '像素/帧');
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
// 建筑和地图系统 (Building & Map System)
// ========================================

/**
 * 初始化建筑物
 */
GameEngine.prototype.initializeBuildings = function () {
    var buildings = [];
    var buildingId = 1;
    var buildingTypes = this.getBuildingTypes();

    var blocksX = Math.floor(this.mapConfig.width / this.mapConfig.blockSize);
    var blocksY = Math.floor(this.mapConfig.height / this.mapConfig.blockSize);

    for (var blockX = 0; blockX < blocksX; blockX++) {
        for (var blockY = 0; blockY < blocksY; blockY++) {
            var typeIndex = Math.floor(Math.random() * buildingTypes.length);
            var buildingType = buildingTypes[typeIndex];
            var position = this.calculateBuildingPosition(blockX, blockY);

            if (position) {
                var building = {
                    id: buildingType.type + '_' + buildingId,
                    name: buildingType.name,
                    type: buildingType.type,
                    x: position.x,
                    y: position.y,
                    width: position.width,
                    height: position.height,
                    explored: false,
                    color: buildingType.color,
                    oneTimeOnly: buildingType.oneTimeOnly || false,
                    blockX: blockX,
                    blockY: blockY
                };

                buildings.push(building);
                buildingId++;
            }
        }
    }

    return buildings;
};

GameEngine.prototype.getBuildingTypes = function () {
    return [{
        type: 'police_station', name: '警察局', width: 70, height: 70, color: '#3498db', weight: 1
    }, {type: 'hospital', name: '医院', width: 70, height: 70, color: '#e74c3c', weight: 1}, {
        type: 'school', name: '学校', width: 60, height: 60, color: '#f39c12', weight: 2
    }, {type: 'station', name: '车站', width: 60, height: 50, color: '#34495e', weight: 2}, {
        type: 'mall', name: '商场', width: 80, height: 60, color: '#27ae60', weight: 1
    }, {
        type: 'shop', name: '商店', width: 50, height: 40, color: '#27ae60', weight: 4, oneTimeOnly: true
    }, {
        type: 'restaurant', name: '餐厅', width: 50, height: 40, color: '#e67e22', weight: 4, oneTimeOnly: true
    }, {
        type: 'bar', name: '酒吧', width: 40, height: 40, color: '#d35400', weight: 3, oneTimeOnly: true
    }, {type: 'cafe', name: '咖啡厅', width: 40, height: 40, color: '#8e44ad', weight: 3}, {
        type: 'bank', name: '银行', width: 60, height: 50, color: '#2c3e50', weight: 2
    }, {type: 'house', name: '民房', width: 40, height: 40, color: '#95a5a6', weight: 8}, {
        type: 'villa', name: '别墅', width: 70, height: 50, color: '#8e44ad', weight: 4
    }, {type: 'apartment', name: '公寓', width: 50, height: 70, color: '#7f8c8d', weight: 6}, {
        type: 'factory', name: '工厂', width: 80, height: 60, color: '#555555', weight: 2
    }, {type: 'warehouse', name: '仓库', width: 70, height: 50, color: '#666666', weight: 3}, {
        type: 'gas_station', name: '加油站', width: 60, height: 40, color: '#f1c40f', weight: 2
    }];
};

GameEngine.prototype.calculateBuildingPosition = function (blockX, blockY) {
    var blockStartX = blockX * this.mapConfig.blockSize;
    var blockStartY = blockY * this.mapConfig.blockSize;

    var buildingX = blockStartX + this.mapConfig.streetWidth;
    var buildingY = blockStartY + this.mapConfig.streetWidth;
    var buildingWidth = this.mapConfig.blockSize - this.mapConfig.streetWidth;
    var buildingHeight = this.mapConfig.blockSize - this.mapConfig.streetWidth;

    if (buildingX + buildingWidth > this.mapConfig.width || buildingY + buildingHeight > this.mapConfig.height) {
        return null;
    }

    return {
        x: buildingX, y: buildingY, width: buildingWidth, height: buildingHeight
    };
};

GameEngine.prototype.exploreBuilding = function (building) {

    if (building.oneTimeOnly && building.explored) {
        return;
    }

    this.playerPositionBeforeEntering = {x: this.player.x, y: this.player.y};
    this.followersPositionBeforeEntering = [];
    for (var i = 0; i < this.followers.length; i++) {
        this.followersPositionBeforeEntering.push({
            x: this.followers[i].x, y: this.followers[i].y
        });
    }

    this.currentBuilding = building;
    this.subMapType = building.type;
    this.gameState = 'submap';

    this.player.x = 200;
    this.player.y = 130;

    var maxTeamSize = Math.min(this.followers.length, 12);
    var submapBounds = {minX: 70, maxX: 330, minY: 120, maxY: 280};

    for (var i = 0; i < maxTeamSize; i++) {
        var follower = this.followers[i];
        var row = Math.floor(i / 4);
        var col = i % 4;
        var baseOffsetX = (col - 1.5) * 35;
        var baseOffsetY = (row + 1) * 35;
        var randomOffsetX = (Math.random() - 0.5) * 10;
        var randomOffsetY = (Math.random() - 0.5) * 10;

        var newX = this.player.x + baseOffsetX + randomOffsetX;
        var newY = this.player.y + baseOffsetY + randomOffsetY;

        newX = Math.max(submapBounds.minX, Math.min(submapBounds.maxX, newX));
        newY = Math.max(submapBounds.minY, Math.min(submapBounds.maxY, newY));

        follower.x = newX;
        follower.y = newY;
    }

    for (var j = maxTeamSize; j < this.followers.length; j++) {
        this.followers[j].x = -100;
        this.followers[j].y = -100;
    }

    this.generateSubMapContent();
};

GameEngine.prototype.exitBuilding = function () {

    var building = this.currentBuilding;

    if (building) {
        building.explored = true;
        this.exploredBuildings.push(building);
    }

    if (building && this.playerPositionBeforeEntering) {
        this.player.x = this.playerPositionBeforeEntering.x;
        this.player.y = this.playerPositionBeforeEntering.y;

        if (this.followersPositionBeforeEntering) {
            for (var i = 0; i < Math.min(this.followers.length, this.followersPositionBeforeEntering.length); i++) {
                var follower = this.followers[i];
                var savedPosition = this.followersPositionBeforeEntering[i];

                follower.x = savedPosition.x;
                follower.y = savedPosition.y;

                follower.x = Math.max(100, Math.min(this.mapConfig.width - 100, follower.x));
                follower.y = Math.max(100, Math.min(this.mapConfig.height - 100, follower.y));
            }
        }

        this.playerPositionBeforeEntering = null;
        this.followersPositionBeforeEntering = null;
    } else {
        if (building) {
            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.originalX + doorInfo.originalWidth / 2;
            var doorCenterY = doorInfo.originalY + doorInfo.originalHeight / 2;

            this.player.x = doorCenterX;
            this.player.y = doorCenterY + 120;

            for (var i = 0; i < this.followers.length; i++) {
                var follower = this.followers[i];
                var row = Math.floor(i / 3);
                var col = i % 3;
                var offsetX = (col - 1) * 40;
                var offsetY = row * 35 + 60;

                follower.x = this.player.x + offsetX;
                follower.y = this.player.y + offsetY;

                follower.x = Math.max(100, Math.min(this.mapConfig.width - 100, follower.x));
                follower.y = Math.max(100, Math.min(this.mapConfig.height - 100, follower.y));
            }
        }
    }

    this.gameState = 'playing';
    this.currentBuilding = null;
    this.subMapType = null;
    this.buildingExitCooldown = Date.now() + GAME_CONFIG.BUILDING.EXIT_COOLDOWN;
    this.zombies = [];
    this.resources = [];
};

// ========================================
// 输入系统实现 (Input System Implementation)
// ========================================

GameEngine.prototype.setupInput = function () {
    var self = this;

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
        maxDistance: 50,
        
        // 抖音平台适配：松手后保持移动方向
        lastDirection: {x: 0, y: 0},
        directionHoldTime: 0,
        directionHoldDuration: 300 // 300ms保持时间
    };

    // 性能优化：事件监听器引用，便于解绑
    this.eventHandlers = {
        touchStart: null, touchMove: null, touchEnd: null, click: null
    };

    // 抖音平台适配：默认位置在屏幕底部中央
    this.joystick.centerX = this.canvas.width / 2;
    this.joystick.centerY = this.canvas.height - 80;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;

    // 抖音小程序触摸事件处理 - 修复兼容性问题
    if (typeof tt !== 'undefined') {

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

        } catch (ttError) {

            // 后备方案：尝试Canvas事件（可能不支持getBoundingClientRect）
            try {
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

            } catch (canvasError) {
            }
        }
    } else {
        // 抖音小游戏环境：使用Canvas事件属性
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

        this.touchStartX = x;
        this.touchStartY = y;
        this.touchStartTime = Date.now();


        if (this.gameState === 'playing' || this.gameState === 'submap') {
            // 抖音小游戏环境：确保坐标是有效数值
            if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
                var joystickDistance = Math.sqrt(Math.pow(x - this.joystick.centerX, 2) + Math.pow(y - this.joystick.centerY, 2));

                if (joystickDistance <= this.joystick.radius) {
                    this.joystick.active = true;
                    this.joystick.currentX = x;
                    this.joystick.currentY = y;
                    this.updateJoystickDirection();
                }
            } else {
                console.warn('[Touch] 无效的触摸坐标:', {x: x, y: y, event: e});
            }
        }
    } catch (error) {
        console.error('[Input] 触摸开始处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.onTouchMove = function (e) {
    try {

        if (!this.joystick.active) {
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
        }


        var dx = x - this.joystick.centerX;
        var dy = y - this.joystick.centerY;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.joystick.maxDistance) {
            this.joystick.currentX = x;
            this.joystick.currentY = y;
        } else {
            var angle = Math.atan2(dy, dx);
            this.joystick.currentX = this.joystick.centerX + Math.cos(angle) * this.joystick.maxDistance;
            this.joystick.currentY = this.joystick.centerY + Math.sin(angle) * this.joystick.maxDistance;
        }

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
            this.onClick({
                x: this.touchStartX || 0, y: this.touchStartY || 0
            });
        }

        // 重置摇杆状态
        this.resetJoystick();

    } catch (error) {
        console.error('[Input] 触摸结束处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.resetJoystick = function () {
    this.joystick.active = false;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;
};

// 性能优化：事件解绑方法
GameEngine.prototype.cleanupInput = function () {
    try {
        if (typeof tt !== 'undefined' && this.eventHandlers) {
            if (this.eventHandlers.touchStart) {
                tt.offTouchStart(this.eventHandlers.touchStart);
            }
            if (this.eventHandlers.touchMove) {
                tt.offTouchMove(this.eventHandlers.touchMove);
            }
            if (this.eventHandlers.touchEnd) {
                tt.offTouchEnd(this.eventHandlers.touchEnd);
            }
        }
    } catch (error) {
        console.warn('[Input] 事件解绑失败:', error);
    }
};

GameEngine.prototype.updateJoystickDirection = function () {
    try {
        var dx = this.joystick.currentX - this.joystick.centerX;
        var dy = this.joystick.currentY - this.joystick.centerY;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
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
    if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        this.handleBuildingEntryPromptClick(x, y);
        return;
    }
};

GameEngine.prototype.handleBuildingEntryPromptClick = function (x, y) {
    var prompt = this.buildingEntryPrompt;
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    var boxHeight = 150;
    var boxY = centerY - boxHeight / 2;
    var buttonWidth = 80;
    var buttonHeight = 35;
    var buttonY = boxY + 90;

    var enterButtonX = centerX - buttonWidth - 20;
    if (x >= enterButtonX && x <= enterButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        if (this.nearBuilding && this.nearBuilding.id === prompt.building.id && this.nearBuilding.name === prompt.building.name) {
            this.exploreBuilding(prompt.building);
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
        this.exitBuilding();
        return;
    }

    this.resources.forEach(function (resource) {
        if (!resource.collected) {
            var distance = Math.sqrt((x - resource.x) * (x - resource.x) + (y - resource.y) * (y - resource.y));
            if (distance <= 30) {
                self.collectResource(resource);
            }
        }
    });
};

GameEngine.prototype.handleEndGameClick = function (x, y) {
    if (x >= 175 && x <= 325 && y >= 320 && y <= 360) {
        this.restartGame();
    }
};

// ========================================
// 碰撞检测系统实现 (Collision System Implementation)
// ========================================

GameEngine.prototype.checkCollisionWithBuildings = function (x, y, characterRadius) {
    characterRadius = characterRadius || GAME_CONFIG.PLAYER.CHARACTER_RADIUS;
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
    
    var distance = Math.sqrt(Math.pow(char1.x - char2.x, 2) + Math.pow(char1.y - char2.y, 2));
    var minDistance = char1Radius + char2Radius;
    
    if (allowOverlap) {
        // 允许重叠身体3分之1的像素
        var overlapAllowance = Math.min(char1Radius, char2Radius) / 3;
        return distance >= (minDistance - overlapAllowance);
    } else {
        return distance >= minDistance;
    }
};

// 新增：检查跟随者之间的重叠
GameEngine.prototype.checkFollowerOverlap = function (follower, otherFollowers) {
    for (var i = 0; i < otherFollowers.length; i++) {
        var other = otherFollowers[i];
        if (other !== follower && !this.checkCharacterOverlap(follower, other, true)) {
            return true; // 有重叠
        }
    }
    return false; // 无重叠
};

// Flocking算法：计算跟随者的目标位置
GameEngine.prototype.calculateFlockingTarget = function (follower, personality) {
    var index = this.followers.indexOf(follower);
    var totalFollowers = this.followers.length;
    
    // 基础跟随角度
    var baseAngle = (index / totalFollowers) * Math.PI * 2;
    var baseRadius = Math.max(15, personality.followDistance - 20); // 减少基础半径
    
    // 计算理想位置
    var idealX = this.player.x + Math.cos(baseAngle) * baseRadius;
    var idealY = this.player.y + Math.sin(baseAngle) * baseRadius;
    
    // 添加微小的随机偏移，避免所有跟随者重叠在同一点
    var randomOffset = 3;
    idealX += (Math.random() - 0.5) * randomOffset;
    idealY += (Math.random() - 0.5) * randomOffset;
    
    return {x: idealX, y: idealY};
};

// Flocking算法：分离规则 - 避免碰撞和重叠
GameEngine.prototype.calculateSeparation = function (follower) {
    var separationX = 0;
    var separationY = 0;
    var separationRadius = 20; // 进一步减少分离半径，减少抽搐
    var separationStrength = 0.2; // 进一步降低分离强度，让跟随者更稳定
    
    for (var i = 0; i < this.followers.length; i++) {
        var other = this.followers[i];
        if (other !== follower) {
            var distance = Math.sqrt(Math.pow(follower.x - other.x, 2) + Math.pow(follower.y - other.y, 2));
            
            if (distance < separationRadius && distance > 0) {
                // 计算推开方向
                var pushDirectionX = follower.x - other.x;
                var pushDirectionY = follower.y - other.y;
                
                // 使用更温和的推开力计算，减少抽搐
                var normalizedDistance = distance / separationRadius;
                var pushStrength = Math.pow(1 - normalizedDistance, 2) * separationStrength; // 使用平方函数，让推开更平滑
                
                separationX += (pushDirectionX / distance) * pushStrength;
                separationY += (pushDirectionY / distance) * pushStrength;
            }
        }
    }
    
    return {x: separationX, y: separationY};
};

// Flocking算法：聚合规则 - 向群体中心聚集
GameEngine.prototype.calculateCohesion = function (follower) {
    var centerX = this.player.x;
    var centerY = this.player.y;
    var cohesionStrength = 0.6; // 降低聚合强度，减少抽搐
    
    // 计算到群体中心的距离
    var distanceToCenter = Math.sqrt(Math.pow(follower.x - centerX, 2) + Math.pow(follower.y - centerY, 2));
    var idealDistance = 30; // 增加理想距离，减少拥挤
    var maxDistance = 100; // 增加最大允许距离，减少紧急聚合
    
    if (distanceToCenter > idealDistance) {
        var directionX = centerX - follower.x;
        var directionY = centerY - follower.y;
        var distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        if (distance > 0) {
            // 使用更平滑的聚合力计算，减少抽搐
            var distanceRatio = Math.min(distanceToCenter / maxDistance, 1.5);
            var cohesionForce = Math.pow(distanceRatio - 1, 2) * cohesionStrength; // 使用平方函数，让聚合更平滑
            
            // 距离越远，聚合力越强，但限制最大值
            if (distanceToCenter > maxDistance) {
                cohesionForce *= 2.0; // 降低紧急聚合强度
            }
            
            return {
                x: (directionX / distance) * cohesionForce,
                y: (directionY / distance) * cohesionForce
            };
        }
    }
    
    return {x: 0, y: 0};
};

// Flocking算法：对齐规则 - 与群体保持一致的移动方向
GameEngine.prototype.calculateAlignment = function (follower) {
    var alignmentX = 0;
    var alignmentY = 0;
    var alignmentStrength = 0.2; // 进一步降低对齐强度，减少抽搐
    
    // 获取玩家的移动方向
    var playerDirectionX = this.joystick.direction.x;
    var playerDirectionY = this.joystick.direction.y;
    
    // 如果玩家在移动，跟随者应该对齐
    if (playerDirectionX !== 0 || playerDirectionY !== 0) {
        var playerSpeed = Math.sqrt(playerDirectionX * playerDirectionX + playerDirectionY * playerDirectionY);
        if (playerSpeed > 0) {
            // 使用更平滑的对齐力，避免突然的方向变化
            var normalizedSpeed = Math.min(playerSpeed, 1.0);
            // 添加额外的平滑处理
            var smoothAlignment = Math.pow(normalizedSpeed, 1.5); // 使用幂函数让对齐更平滑
            alignmentX = playerDirectionX * alignmentStrength * smoothAlignment;
            alignmentY = playerDirectionY * alignmentStrength * smoothAlignment;
        }
    }
    
    return {x: alignmentX, y: alignmentY};
};



GameEngine.prototype.canMoveToPosition = function (x, y, characterRadius) {
    var margin = characterRadius || GAME_CONFIG.PLAYER.CHARACTER_RADIUS;
    
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
    var margin = characterRadius || GAME_CONFIG.PLAYER.CHARACTER_RADIUS;
    
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
    var playerRadius = GAME_CONFIG.PLAYER.CHARACTER_RADIUS;
    var interactionDistance = GAME_CONFIG.BUILDING.INTERACTION_DISTANCE;
    var triggerDistance = GAME_CONFIG.BUILDING.TRIGGER_DISTANCE;

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

            if (playerDistance <= interactionDistance) {
                this.nearBuilding = building;

                if (playerDistance <= triggerDistance) {
                    if (!this.buildingEntryPrompt || !this.buildingEntryPrompt.active || this.buildingEntryPrompt.buildingId !== (building.id || building.name)) {

                        this.buildingEntryPrompt = {
                            building: building,
                            buildingId: building.id || building.name,
                            active: true,
                            message: '是否进入 ' + building.name + '？',
                            options: ['进入', '取消']
                        };
                    }
                }
                break;
            }
        }
    }

    if (!this.nearBuilding && this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
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
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        // 优先检查玩家是否死亡
        if (this.player.health <= 0 && !this.player.isDead) {
            this.player.isDead = true;
            this.gameOver('death');
            return;
        }
        
        this.updatePlayer(deltaTime);
        this.updateTime(deltaTime);

        if (this.gameState === 'playing') {
            this.zombieManager.update(deltaTime, this);
            this.updateCombat(deltaTime);
            this.updateTeamHealth(deltaTime);
        }

        if (this.gameState === 'submap') {
            this.updateZombies(deltaTime);
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
    
    var isMoving = (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0);

    if (isMoving) {
        this.player.isWalking = true;

        // 使用标准化后的方向向量判断移动方向
        if (Math.abs(directionX) > Math.abs(directionY)) {
            this.player.direction = directionX > 0 ? 'right' : 'left';
        } else {
            this.player.direction = directionY > 0 ? 'down' : 'up';
        }

        this.updateWalkAnimation(deltaTime);

        // 匀速移动：固定移动速度，不受摇杆推拉程度影响
        var moveSpeed = GAME_CONFIG.PLAYER.MOVE_SPEED;
        
        // 标准化方向向量，确保对角线移动速度一致
        var directionX = this.joystick.direction.x;
        var directionY = this.joystick.direction.y;
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
            this.gameData.timeRemaining = GAME_CONFIG.TIME.NIGHT_DURATION;
        } else {
            this.gameData.isDay = true;
            this.gameData.timeRemaining = GAME_CONFIG.TIME.DAY_DURATION;
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

            // 优化：批量处理厨师产粮
            var chefCount = 0;
            this.followers.forEach(function (follower) {
                if (follower.character && follower.character.type === 'chef') {
                    chefCount++;
                }
            });

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
    this.gameState = 'playing';
};

GameEngine.prototype.restartGame = function () {
    this.gameData = {
        survivalDays: 1,
        food: 20, // 重新开始游戏时也是20个食物
        teamSize: 1,
        maxTeamSize: 1,
        zombieKills: 0,
        totalFood: 20, // 总食物也设置为20
        isDay: true,
        timeRemaining: 300000,
        gameStartTime: Date.now()
    };

    this.player = {
        x: this.mapConfig.width / 2, y: this.mapConfig.height / 2, health: 20, maxHealth: 20, level: 1
    };
    this.companions = [];
    this.exploredBuildings = [];
    this.nearBuilding = null;

    var self = this;
    this.buildings.forEach(function (building) {
        building.explored = false;
    });

    this.gameState = 'playing';
};

GameEngine.prototype.gameOver = function (cause) {
    this.gameState = 'gameover';
    this.gameData.cause = cause;

    // 性能优化：清理资源
    this.cleanupInput();
};

GameEngine.prototype.gameWin = function () {
    this.gameState = 'victory';

    // 性能优化：清理资源
    this.cleanupInput();
};

// ========================================
// NPC和团队系统 (NPC & Team System)
// ========================================

GameEngine.prototype.initializeNPCs = function () {

    for (var i = 0; i < 19; i++) {
        var characterId = i + 2;
        var npc = this.createNPC(characterId);
        this.npcs.push(npc);
    }

};

GameEngine.prototype.createNPC = function (characterId) {
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
        currentBehavior: 'idle'
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
    var edgePositions = [
        {x: 200, y: 200}, // 左上角
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
    if (!this.npcUpdateTimer) this.npcUpdateTimer = 0;
    this.npcUpdateTimer += deltaTime;

    if (this.npcUpdateTimer < 100) return;
    this.npcUpdateTimer = 0;

    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x - 100;
    var viewRight = this.camera.x + viewWidth + 100;
    var viewTop = this.camera.y - 100;
    var viewBottom = this.camera.y + viewHeight + 100;

    for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];

        if (npc.x >= viewLeft && npc.x <= viewRight && npc.y >= viewTop && npc.y <= viewBottom) {
            this.updateSingleNPC(npc, deltaTime);
        }
    }
};

GameEngine.prototype.updateSingleNPC = function (npc, deltaTime) {
    if (npc.isFollowing) return;

    var collisionThresholdSquared = GAME_CONFIG.TEAM.COLLISION_THRESHOLD;
    var distanceSquaredToPlayer = Math.pow(npc.x - this.player.x, 2) + Math.pow(npc.y - this.player.y, 2);

    var shouldJoinTeam = distanceSquaredToPlayer < collisionThresholdSquared;

    if (!shouldJoinTeam) {
        for (var i = 0; i < this.followers.length; i++) {
            var follower = this.followers[i];
            var distanceSquaredToFollower = Math.pow(npc.x - follower.x, 2) + Math.pow(npc.y - follower.y, 2);

            if (distanceSquaredToFollower < collisionThresholdSquared) {
                shouldJoinTeam = true;
                break;
            }
        }
    }

    if (shouldJoinTeam) {
        var alreadyInTeam = false;
        for (var j = 0; j < this.followers.length; j++) {
            if (this.followers[j].id === npc.id) {
                alreadyInTeam = true;
                break;
            }
        }

        if (!alreadyInTeam) {
            npc.isFollowing = true;
            npc.followStartTime = Date.now();
            npc.lastX = npc.x;
            npc.lastY = npc.y;
            npc.isWalking = false;
            npc.walkAnimationFrame = 0;
            npc.lastAnimationTime = 0;
            npc.direction = 'down';

            this.followers.push(npc);

            this.addNewFollowerToTeam(npc);
        }
    } else {
        this.updateNPCIdleBehavior(npc, deltaTime);
    }
};

GameEngine.prototype.addNewFollowerToTeam = function (newFollower) {
    var character = newFollower.character || this.characterManager.characters[2];
    var personality = this.getCharacterPersonality(character);

    var targetOffset = this.calculateFollowerOffset(newFollower, personality);
    newFollower.x = this.player.x + targetOffset.x;
    newFollower.y = this.player.y + targetOffset.y;

    // 游戏平衡优化：限制最大团队规模
    if (this.gameData.teamSize >= GAME_CONFIG.TEAM.MAX_SIZE) {
        console.log('[Team] 团队已达到最大规模限制');
        return;
    }

    newFollower.isWalking = false;
    newFollower.direction = 'down';
};

GameEngine.prototype.moveTeam = function (deltaX, deltaY) {
    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        this.moveSingleFollower(follower, deltaX, deltaY);
    }
};

GameEngine.prototype.moveSingleFollower = function (follower, deltaX, deltaY) {
    var character = follower.character || this.characterManager.characters[2];
    var personality = this.getCharacterPersonality(character);

    // 如果正在脱困，暂停正常移动逻辑
    if (follower.isUnstucking) {
        this.handleUnstuckMovement(follower);
        follower.isWalking = true;
        return;
    }

    // Flocking算法跟随逻辑：分离、聚合、对齐
    var targetPosition = this.calculateFlockingTarget(follower, personality);
    var targetX = targetPosition.x;
    var targetY = targetPosition.y;

    var currentDistance = Math.sqrt(Math.pow(follower.x - targetX, 2) + Math.pow(follower.y - targetY, 2));
    var idealDistance = personality.followDistance;

    // 跟随延迟
    if (!follower.lastFollowUpdate) follower.lastFollowUpdate = 0;
    var timeSinceLastUpdate = Date.now() - follower.lastFollowUpdate;
    
    if (timeSinceLastUpdate < personality.reactionDelay) {
        return;
    }

    // 计算Flocking算法的三个力
    var separation = this.calculateSeparation(follower);
    var cohesion = this.calculateCohesion(follower);
    var alignment = this.calculateAlignment(follower);
    
    // 合并三个力，形成最终移动方向
    var totalForceX = separation.x + cohesion.x + alignment.x;
    var totalForceY = separation.y + cohesion.y + alignment.y;
    
    // 计算力的强度
    var forceStrength = Math.sqrt(totalForceX * totalForceX + totalForceY * totalForceY);
    
    // 添加更强的平滑因子，彻底消除抽搐
    if (!follower.smoothForceX) follower.smoothForceX = 0;
    if (!follower.smoothForceY) follower.smoothForceY = 0;
    
    var smoothingFactor = 0.2; // 降低平滑因子，让移动更平滑
    follower.smoothForceX = follower.smoothForceX * (1 - smoothingFactor) + totalForceX * smoothingFactor;
    follower.smoothForceY = follower.smoothForceY * (1 - smoothingFactor) + totalForceY * smoothingFactor;
    
    var smoothedForceStrength = Math.sqrt(follower.smoothForceX * follower.smoothForceX + follower.smoothForceY * follower.smoothForceY);
    
    if (smoothedForceStrength > 0.1) { // 提高最小力阈值，减少微小抖动
        // 标准化力的方向
        var normalizedForceX = follower.smoothForceX / smoothedForceStrength;
        var normalizedForceY = follower.smoothForceY / smoothedForceStrength;
        
        // 计算移动速度：基于距离和力的强度，提高基础速度
        var distanceRatio = currentDistance / idealDistance;
        var speedMultiplier = Math.min(2.0, Math.max(1.0, distanceRatio)); // 提高速度范围：1.0-2.0倍
        var moveSpeed = GAME_CONFIG.PLAYER.MOVE_SPEED * speedMultiplier;
        
        // 计算移动距离，使用更稳定的计算方式，减少抽搐
        var moveDistance = Math.min(moveSpeed, Math.max(0.5, smoothedForceStrength * 1.5)); // 降低力系数，减少抽搐
        
        var newX = follower.x + normalizedForceX * moveDistance;
        var newY = follower.y + normalizedForceY * moveDistance;
        
        // 检查移动是否安全 - 使用三重碰撞检测，确保绝对不穿墙
        var canMove = this.canMoveAlongPath(follower.x, follower.y, newX, newY, 15) && 
                     this.canMoveToPosition(newX, newY, 15);
        
        if (canMove) {
            // 双重检查都通过，安全移动
            follower.x = newX;
            follower.y = newY;
        } else {
            // 尝试单轴移动，同样进行双重检查
            var canMoveX = this.canMoveAlongPath(follower.x, follower.y, newX, follower.y, 15) && 
                          this.canMoveToPosition(newX, follower.y, 15);
            
            var canMoveY = this.canMoveAlongPath(follower.x, follower.y, follower.x, newY, 15) && 
                          this.canMoveToPosition(follower.x, newY, 15);
            
            if (canMoveX) {
                follower.x = newX;
            } else if (canMoveY) {
                follower.y = newY;
            } else {
                // 如果都不能移动，保持当前位置，避免穿墙
                console.log('[Follow] 跟随者', follower.id, '无法移动，保持当前位置避免穿墙');
            }
        }
        
        follower.isWalking = true;
        follower.direction = this.getDirectionFromDelta(normalizedForceX, normalizedForceY);
        follower.lastFollowUpdate = Date.now();
    } else {
        // 没有足够的力，保持静止
        follower.isWalking = false;
    }

    this.updateFollowerAnimation(follower, personality);

    // 边界检查（脱困状态下跳过，避免冲突）
    if (!follower.isUnstucking) {
        follower.x = Math.max(50, Math.min(this.mapConfig.width - 50, follower.x));
        follower.y = Math.max(50, Math.min(this.mapConfig.height - 50, follower.y));
    }
    
    // 检测跟随者是否被卡住，如果被卡住则尝试脱困
    this.checkFollowerStuck(follower);
};

GameEngine.prototype.getCharacterPersonality = function (character) {
    var characterId = character.id || 2;
    var seed = characterId * 12345;
    var random = this.seededRandom(seed);

    return {
        followDistance: 35 + (random() * 20 - 10),
        moveSpeed: 1.0, // 固定为1.0，与主人物保持一致
        randomness: random() * 0.1, // 进一步减少随机性，避免抽搐
        reactionDelay: random() * 50, // 进一步减少反应延迟，提高响应性
        personalityType: this.getPersonalityType(characterId)
    };
};

GameEngine.prototype.calculateFollowerOffset = function (follower, personality) {
    var index = this.followers.indexOf(follower);
    var totalFollowers = this.followers.length;
    
    // 几何队列布局：玩家为中心，形成菱形队列
    var baseDistance = 25; // 基础距离
    var coreDistance = 20; // 核心成员距离
    
    // 根据跟随者类型调整距离
    var distance = baseDistance;
    if (personality && (personality.personalityType === 'leader' || personality.personalityType === 'guardian')) {
        distance = coreDistance; // 核心成员距离更近
    }
    
    // 菱形队列布局：前-左-右-后
    var positions = [
        {x: 0, y: -distance},           // 前方
        {x: -distance, y: 0},           // 左侧
        {x: distance, y: 0},            // 右侧
        {x: 0, y: distance}             // 后方
    ];
    
    // 如果跟随者超过4个，使用圆形布局
    if (index >= 4) {
        var angleStep = (Math.PI * 2) / Math.max(1, totalFollowers);
        var angle = angleStep * index;
        var circleDistance = distance + (index - 3) * 10; // 每多一个跟随者，距离增加10像素
        
        return {
            x: this.player.x + Math.cos(angle) * circleDistance,
            y: this.player.y + Math.sin(angle) * circleDistance
        };
    }
    
    // 拥堵处理：当3名以上成员聚集时，自动调整间距
    if (totalFollowers >= 3) {
        distance += 5;
    }
    
    var targetPos = positions[index % 4];
    return {
        x: this.player.x + targetPos.x,
        y: this.player.y + targetPos.y
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

GameEngine.prototype.findAlternativePathForFollower = function (follower, targetX, targetY) {
    // 改进的路径寻找算法，让伙伴更好地避开建筑物
    var searchRadius = 80; // 增加搜索半径
    var stepSize = 6; // 减小步长，提高精度
    var maxAttempts = 20; // 最大尝试次数
    
    // 8个主要方向 + 16个中间方向，提供更多选择
    var directions = [
        // 主要方向
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1},
        {dx: 1, dy: 1}, {dx: 1, dy: -1}, {dx: -1, dy: 1}, {dx: -1, dy: -1},
        // 中间方向
        {dx: 0.7, dy: 0.7}, {dx: 0.7, dy: -0.7}, {dx: -0.7, dy: 0.7}, {dx: -0.7, dy: -0.7},
        {dx: 0.7, dy: 0}, {dx: -0.7, dy: 0}, {dx: 0, dy: 0.7}, {dx: 0, dy: -0.7}
    ];
    
    var attempts = 0;
    
    // 第一轮：寻找直接可到达的位置
    for (var radius = stepSize; radius <= searchRadius && attempts < maxAttempts; radius += stepSize) {
        for (var i = 0; i < directions.length && attempts < maxAttempts; i++) {
            attempts++;
            var dir = directions[i];
            var testX = follower.x + dir.dx * radius;
            var testY = follower.y + dir.dy * radius;
            
            if (this.canMoveToPosition(testX, testY, 15)) {
                var currentDistance = Math.sqrt(Math.pow(follower.x - targetX, 2) + Math.pow(follower.y - targetY, 2));
                var testDistance = Math.sqrt(Math.pow(testX - targetX, 2) + Math.pow(testY - targetY, 2));
                
                // 优先选择更接近目标的位置
                if (testDistance < currentDistance) {
                    return {success: true, x: testX, y: testY};
                }
            }
        }
    }
    
    // 第二轮：如果找不到更好的位置，寻找任何可到达的位置
    attempts = 0;
    for (var radius = stepSize; radius <= searchRadius && attempts < maxAttempts; radius += stepSize) {
        for (var i = 0; i < directions.length && attempts < maxAttempts; i++) {
            attempts++;
            var dir = directions[i];
            var testX = follower.x + dir.dx * radius;
            var testY = follower.y + dir.dy * radius;
            
            if (this.canMoveToPosition(testX, testY, 15)) {
                return {success: true, x: testX, y: testY};
            }
        }
    }
    
    // 第三轮：如果仍然找不到路径，尝试在玩家周围寻找安全位置
    var playerRadius = 60;
    var angleStep = Math.PI / 8;
    for (var angle = 0; angle < Math.PI * 2; angle += angleStep) {
        var testX = this.player.x + Math.cos(angle) * playerRadius;
        var testY = this.player.y + Math.sin(angle) * playerRadius;
        
        if (this.canMoveToPosition(testX, testY, 15)) {
            return {success: true, x: testX, y: testY};
        }
    }
    
    return {success: false};
};

/**
 * 检测跟随者是否被卡住，如果被卡住则尝试脱困
 */
GameEngine.prototype.checkFollowerStuck = function(follower) {
    // 检查跟随者是否长时间没有移动
    if (!follower.lastMoveTime) {
        follower.lastMoveTime = Date.now();
        follower.lastX = follower.x;
        follower.lastY = follower.y;
        return;
    }
    
    var currentTime = Date.now();
    var timeSinceLastMove = currentTime - follower.lastMoveTime;
    
    // 如果超过3秒没有移动，认为被卡住了（增加检测时间，减少误判）
    if (timeSinceLastMove > 3000) {
        var distanceMoved = Math.sqrt(
            Math.pow(follower.x - follower.lastX, 2) + 
            Math.pow(follower.y - follower.lastY, 2)
        );
        
        // 如果移动距离很小且不在脱困状态，尝试脱困
        if (distanceMoved < 3 && !follower.isUnstucking) {
            this.helpFollowerUnstuck(follower);
        }
        
        // 重置计时器
        follower.lastMoveTime = currentTime;
        follower.lastX = follower.x;
        follower.lastY = follower.y;
    }
};

/**
 * 帮助被卡住的跟随者脱困
 */
GameEngine.prototype.helpFollowerUnstuck = function(follower) {
    // 设置脱困状态，避免重复触发
    if (follower.isUnstucking) return;
    follower.isUnstucking = true;
    
    // 尝试在玩家周围寻找安全位置
    var playerRadius = 80;
    var angleStep = Math.PI / 12;
    
    for (var angle = 0; angle < Math.PI * 2; angle += angleStep) {
        var testX = this.player.x + Math.cos(angle) * playerRadius;
        var testY = this.player.y + Math.sin(angle) * playerRadius;
        
        if (this.canMoveToPosition(testX, testY, 15)) {
            // 找到安全位置，设置脱困目标
            follower.unstuckTargetX = testX;
            follower.unstuckTargetY = testY;
            follower.unstuckStartTime = Date.now();
            console.log('[Follower] 跟随者开始脱困，目标位置:', testX, testY);
            return;
        }
    }
    
    // 如果找不到安全位置，尝试随机位置
    var randomAngle = Math.random() * Math.PI * 2;
    var randomRadius = 60 + Math.random() * 40;
    var randomX = this.player.x + Math.cos(randomAngle) * randomRadius;
    var randomY = this.player.y + Math.sin(randomAngle) * randomRadius;
    
    // 确保在边界内
    randomX = Math.max(50, Math.min(this.mapConfig.width - 50, randomX));
    randomY = Math.max(50, Math.min(this.mapConfig.width - 50, randomY));
    
    follower.unstuckTargetX = randomX;
    follower.unstuckTargetY = randomY;
    follower.unstuckStartTime = Date.now();
    console.log('[Follower] 跟随者开始脱困，随机目标位置:', randomX, randomY);
};

/**
 * 处理跟随者的脱困移动
 */
GameEngine.prototype.handleUnstuckMovement = function(follower) {
    // 如果没有脱困目标，直接返回
    if (!follower.unstuckTargetX || !follower.unstuckTargetY || !follower.isUnstucking) {
        return;
    }
    
    var currentTime = Date.now();
    var timeSinceStart = currentTime - follower.unstuckStartTime;
    
    // 脱困移动持续时间（毫秒）
    var unstuckDuration = 2000; // 增加持续时间，让移动更平滑
    
    if (timeSinceStart >= unstuckDuration) {
        // 脱困完成，直接设置到目标位置并重置状态
        follower.x = follower.unstuckTargetX;
        follower.y = follower.unstuckTargetY;
        follower.isUnstucking = false;
        follower.unstuckTargetX = null;
        follower.unstuckTargetY = null;
        follower.unstuckStartTime = null;
        console.log('[Follower] 跟随者脱困完成');
        return;
    }
    
    // 计算脱困进度（0到1之间）
    var progress = timeSinceStart / unstuckDuration;
    
    // 使用更平滑的缓动函数
    var easedProgress = this.easeInOutCubic(progress);
    
    // 计算当前位置到目标位置的插值
    var startX = follower.x;
    var startY = follower.y;
    var targetX = follower.unstuckTargetX;
    var targetY = follower.unstuckTargetY;
    
    // 平滑插值移动，避免抽搐
    var newX = startX + (targetX - startX) * easedProgress;
    var newY = startY + (targetY - startY) * easedProgress;
    
    // 确保移动距离不会过大，避免抽搐
    var maxMoveDistance = 3; // 每帧最大移动距离
    var dx = newX - follower.x;
    var dy = newY - follower.y;
    var moveDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (moveDistance > maxMoveDistance) {
        var scale = maxMoveDistance / moveDistance;
        newX = follower.x + dx * scale;
        newY = follower.y + dy * scale;
    }
    
    follower.x = newX;
    follower.y = newY;
    
    // 标记为脱困移动状态
    follower.isWalking = true;
    follower.direction = this.getDirectionFromDelta(targetX - startX, targetY - startY);
};

/**
 * 缓动函数：让移动更自然
 */
GameEngine.prototype.easeOutCubic = function(t) {
    return 1 - Math.pow(1 - t, 3);
};

/**
 * 更平滑的缓动函数：避免抽搐
 */
GameEngine.prototype.easeInOutCubic = function(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

GameEngine.prototype.updateNPCIdleBehavior = function (npc, deltaTime) {
    if (!npc.behaviorTimer) npc.behaviorTimer = 0;
    npc.behaviorTimer -= deltaTime || 16;

    if (npc.behaviorTimer <= 0) {
        npc.currentBehavior = this.selectNPCBehavior(npc);
        npc.behaviorTimer = 1000 + Math.random() * 2000;
    }

    this.executeNPCBehavior(npc);
};

GameEngine.prototype.selectNPCBehavior = function (npc) {
    var behaviors = ['idle', 'wander', 'look_around', 'stretch', 'check_equipment'];
    var weights = [0.4, 0.3, 0.2, 0.05, 0.05];

    var random = Math.random();
    var cumulativeWeight = 0;

    for (var i = 0; i < weights.length; i++) {
        cumulativeWeight += weights[i];
        if (random <= cumulativeWeight) {
            return behaviors[i];
        }
    }

    return 'idle';
};

GameEngine.prototype.executeNPCBehavior = function (npc) {
    switch (npc.currentBehavior) {
        case 'wander':
            this.executeWanderBehavior(npc);
            break;
        case 'look_around':
            this.executeLookAroundBehavior(npc);
            break;
        case 'stretch':
            this.executeStretchBehavior(npc);
            break;
        case 'check_equipment':
            this.executeCheckEquipmentBehavior(npc);
            break;
        default:
            break;
    }
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

        var nearbyZombies = this.zombieManager.getZombiesInRange(this.player.x, this.player.y, this.player.attackRange);

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

            var nearbyZombies = this.zombieManager.getZombiesInRange(follower.x, follower.y, follower.attackRange);

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
    var newZombie = this.zombieManager.createZombie('thin', follower.x, follower.y);
    if (newZombie) {
        newZombie.isConverted = true;
        newZombie.originalName = follower.character ? follower.character.name : '团队成员';
    }

    this.followers.splice(index, 1);
    this.gameData.teamSize = this.followers.length + 1;
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
    var baseCount = GAME_CONFIG.ZOMBIE_SPAWN.BASE_COUNT;
    var perDayIncrease = GAME_CONFIG.ZOMBIE_SPAWN.PER_DAY_INCREASE;
    var maxZombies = GAME_CONFIG.ZOMBIE_SPAWN.MAX_ZOMBIES;

    // 根据团队规模调整僵尸数量
    var teamSizeMultiplier = Math.max(0.5, Math.min(2.0, this.gameData.teamSize / 5));
    var zombieCount = Math.min(maxZombies, Math.floor((baseCount + (currentDay - 1) * perDayIncrease) * teamSizeMultiplier));

    var playerX = this.player.x;
    var playerY = this.player.y;
    var spawnRadius = GAME_CONFIG.ZOMBIE_SPAWN.SPAWN_RADIUS;
    var minDistance = GAME_CONFIG.ZOMBIE_SPAWN.MIN_DISTANCE;

    var created = 0;
    var maxAttempts = zombieCount * GAME_CONFIG.ZOMBIE_SPAWN.MAX_ATTEMPTS_MULTIPLIER;
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
    var count = 0;

    switch (buildingType) {
        case 'police_station':
        case 'hospital':
            count = 1;
            break;
        case 'mall':
        case 'factory':
            count = 2;
            break;
        default:
            if (Math.random() < 0.3) {
                count = 1;
            } else {
                count = 0;
            }
            break;
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

GameEngine.prototype.createResource = function (type) {
    var resource = {
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 80,
        collected: false
    };

    switch (type) {
        case 'companion_police':
            resource.companionData = {name: '警察', type: 'police', health: 20, attack: 25, special: '远程攻击'};
            break;
        case 'companion_nurse':
            resource.companionData = {name: '护士', type: 'nurse', health: 15, attack: 8, special: '群体回血'};
            break;
        case 'companion_chef':
            resource.companionData = {name: '厨师', type: 'chef', health: 15, attack: 8, special: '每日产粮'};
            break;
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
        case 'companion_police':
        case 'companion_nurse':
        case 'companion_chef':
            // 移除伙伴数量限制，可以无限增加伙伴
            // 创建完整的跟随者对象，包含位置和跟随逻辑
            // 生成安全的伙伴位置，确保不在建筑物上
            var safePosition = this.getSafeFollowerPosition();
            
            var newFollower = {
                id: 'follower_' + Date.now() + '_' + Math.random(),
                characterId: resource.companionData.id || 2,
                character: resource.companionData,
                x: safePosition.x,
                y: safePosition.y,
                targetX: this.player.x,
                targetY: this.player.y,
                health: resource.companionData.health || 100,
                maxHealth: resource.companionData.maxHealth || 100,
                attack: resource.companionData.attack || 15,
                isWalking: false,
                direction: 'down',
                followDistance: 35 + Math.random() * 20, // 随机跟随距离
                lastUpdateTime: Date.now()
            };
            
            this.followers.push(newFollower);
            this.gameData.teamSize++;
            if (this.gameData.teamSize > this.gameData.maxTeamSize) {
                this.gameData.maxTeamSize = this.gameData.teamSize;
            }
            console.log('[GameEngine] 新伙伴加入: ' + resource.companionData.name + '，当前跟随者数量: ' + this.followers.length + '，团队人数: ' + this.gameData.teamSize);
            break;
        case 'food':
            this.gameData.food += resource.amount;
            this.gameData.totalFood += resource.amount;
            break;
        case 'weapon':
            this.player.attack = (this.player.attack || 20) + resource.weaponData.damage;
            break;
    }
};

GameEngine.prototype.updateZombies = function (deltaTime) {
    var self = this;

    this.zombies.forEach(function (zombie) {
        var dx = self.player.x - zombie.x;
        var dy = self.player.y - zombie.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1200 && distance > 30) { // 大幅增加追击距离，从100提升到1200
            // 僵尸匀速移动，不受deltaTime影响，但需要碰撞检测
            var moveDistance = zombie.moveSpeed;
            var newX = zombie.x + (dx / distance) * moveDistance;
            var newY = zombie.y + (dy / distance) * moveDistance;
            
            // 检查移动是否安全，防止穿墙
            if (this.canMoveToPosition(newX, newY, 25)) {
                zombie.x = newX;
                zombie.y = newY;
            } else {
                // 如果直接移动不安全，尝试单轴移动
                var canMoveX = this.canMoveToPosition(newX, zombie.y, 25);
                var canMoveY = this.canMoveToPosition(zombie.x, newY, 25);
                
                if (canMoveX) {
                    zombie.x = newX;
                } else if (canMoveY) {
                    zombie.y = newY;
                }
                // 如果都不能移动，保持当前位置，避免穿墙
            }
        } else if (distance <= 30) {
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

    this.zombies = this.zombies.filter(function (zombie) {
        return zombie.health > 0;
    });
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
    try {
        this.ctx.save();

        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // 更新视距裁剪系统
        this.updateViewportCulling();

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
        console.error('[RenderGame] 游戏渲染出错:', error);
        // 出错时回退到传统渲染
        this.renderGameFallback();
    }
};

// 传统游戏渲染回退方案
GameEngine.prototype.renderGameFallback = function () {
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

// 分层渲染系统
GameEngine.prototype.renderLayer = function (layerType) {
    // 安全检查：如果视距裁剪系统出错，回退到传统渲染
    if (this.fallbackToTraditionalRendering) {
        this.renderLayerFallback(layerType);
        return;
    }
    
    try {
        var entities = this.viewportCulling.visibleEntities[layerType] || [];
        
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            
            // 检查是否应该更新此实体
            if (!this.viewportCulling.shouldUpdateEntity(entity, this.getEntityUpdateType(entity))) {
                continue;
            }
            
            switch (layerType) {
                case 'players':
                    this.renderPlayerEntity(entity);
                    break;
                case 'followers':
                    this.renderFollowerEntity(entity);
                    break;
                case 'zombies':
                    this.renderZombieEntity(entity);
                    break;
                case 'buildings':
                    this.renderBuildingEntity(entity);
                    break;
                case 'decorations':
                    this.renderDecorationEntity(entity);
                    break;
            }
        }
    } catch (error) {
        console.error('[RenderLayer] 分层渲染出错:', error);
        // 出错时回退到传统渲染
        this.fallbackToTraditionalRendering = true;
        this.renderLayerFallback(layerType);
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

GameEngine.prototype.getEntityUpdateType = function (entity) {
    if (entity === this.player) {
        return 'core'; // 玩家每帧更新
    }
    
    var distance = Math.sqrt(
        Math.pow(entity.x - this.player.x, 2) +
        Math.pow(entity.y - this.player.y, 2)
    );
    
    if (distance < 500) {
        return 'important'; // 近距离实体30fps
    } else if (distance < 1000) {
        return 'normal';    // 中距离实体15fps
    } else {
        return 'low';       // 远距离实体2fps
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
    this.zombieManager.renderSingleZombie(this.ctx, zombie, this.camera);
};

GameEngine.prototype.renderBuildingEntity = function (building) {
    this.renderVisibleBuildings();
};

GameEngine.prototype.renderDecorationEntity = function (decoration) {
    // 装饰物渲染逻辑
};

// 更新视距裁剪系统
GameEngine.prototype.updateViewportCulling = function () {
    // 安全检查
    if (!this.viewportCulling || !this.viewportCulling.quadTree) {
        console.warn('[ViewportCulling] 视距裁剪系统未初始化，跳过更新');
        return;
    }
    
    try {
        // 更新摄像机位置
        this.viewportCulling.updateCamera(
            this.camera.x,
            this.camera.y,
            this.canvas.width / this.camera.zoom,
            this.canvas.height / this.camera.zoom
        );
        
        // 清空四叉树
        this.viewportCulling.quadTree = new QuadTreeNode({
            x: 0,
            y: 0,
            width: this.mapConfig.width,
            height: this.mapConfig.height
        });
        
        // 插入所有实体到四叉树
        this.insertEntitiesToQuadTree();
        
        // 更新可见实体列表
        this.viewportCulling.updateVisibleEntities(this);
    } catch (error) {
        console.error('[ViewportCulling] 更新视距裁剪系统时出错:', error);
        // 出错时回退到传统渲染
        this.fallbackToTraditionalRendering = true;
    }
};

// 将实体插入四叉树
GameEngine.prototype.insertEntitiesToQuadTree = function () {
    try {
        // 插入玩家
        if (this.player && typeof this.player.x === 'number' && typeof this.player.y === 'number') {
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
        
        // 插入僵尸
        if (this.zombieManager && this.zombieManager.zombies && Array.isArray(this.zombieManager.zombies)) {
            for (var i = 0; i < this.zombieManager.zombies.length; i++) {
                var zombie = this.zombieManager.zombies[i];
                if (zombie && typeof zombie.x === 'number' && typeof zombie.y === 'number') {
                    zombie.type = 'zombie_' + (zombie.zombieType || 'thin');
                    this.viewportCulling.quadTree.insert(zombie);
                }
            }
        }
        
        // 插入建筑
        if (this.buildings && Array.isArray(this.buildings)) {
            for (var i = 0; i < this.buildings.length; i++) {
                var building = this.buildings[i];
                if (building && typeof building.x === 'number' && typeof building.y === 'number') {
                    building.type = 'building';
                    this.viewportCulling.quadTree.insert(building);
                }
            }
        }
    } catch (error) {
        console.error('[InsertEntities] 插入实体到四叉树时出错:', error);
        throw error;
    }
};

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
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;

    for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];

        if (npc.x >= viewLeft - 50 && npc.x <= viewRight + 50 && npc.y >= viewTop - 50 && npc.y <= viewBottom + 50) {
            this.renderSingleNPC(npc);
        }
    }
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

    this.ctx.fillStyle = '#3498db';
    this.ctx.fillRect(npc.x - 8, npc.y - 8, 16, 16);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(npc.characterId.toString(), npc.x, npc.y + 3);

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

    this.ctx.fillStyle = baseColor;
    this.ctx.fillRect(follower.x - 10, follower.y - 10, 20, 20);

    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(follower.x - 10, follower.y - 10, 20, 20);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(follower.characterId.toString(), follower.x, follower.y + 6);

    if (follower.isWalking) {
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(follower.x - 12, follower.y - 12, 24, 3);
    }

    this.ctx.fillStyle = '#e74c3c';
    this.ctx.beginPath();
    this.ctx.arc(follower.x + 12, follower.y - 8, 4, 0, Math.PI * 2);
    this.ctx.fill();

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

    this.buildings.forEach(function (building) {
        if (building.x + building.width >= viewLeft && building.x <= viewRight && building.y + building.height >= viewTop && building.y <= viewBottom) {

            self.ctx.fillStyle = building.explored ? building.color : self.lightenColor(building.color, 0.3);
            self.ctx.fillRect(building.x, building.y, building.width, building.height);

            var doorWidth = Math.max(30, Math.floor(building.width / 8));
            var doorHeight = Math.max(40, Math.floor(building.height / 6));
            var doorX = building.x + (building.width - doorWidth) / 2;
            var doorY = building.y + building.height - doorHeight - 5;

            self.ctx.fillStyle = building.explored ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.6)';
            self.ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

            if (self.nearBuilding && self.nearBuilding.id === building.id) {
                self.ctx.save();
                self.ctx.shadowColor = '#3498db';
                self.ctx.shadowBlur = 15;
                self.ctx.strokeStyle = '#3498db';
                self.ctx.lineWidth = 4;
                self.ctx.strokeRect(doorX - 2, doorY - 2, doorWidth + 4, doorHeight + 4);
                self.ctx.restore();
            }

            self.ctx.strokeStyle = '#2c3e50';
            self.ctx.lineWidth = 2;
            self.ctx.strokeRect(building.x, building.y, building.width, building.height);

            if (!building.explored) {
                self.ctx.strokeStyle = '#f1c40f';
                self.ctx.lineWidth = 3;
                self.ctx.setLineDash([5, 5]);
                self.ctx.strokeRect(building.x - 3, building.y - 3, building.width + 6, building.height + 6);
                self.ctx.setLineDash([]);
            }

            var fontSize = Math.max(20, Math.floor(building.width / 12));
            self.ctx.fillStyle = '#ffffff';
            self.ctx.font = 'bold ' + fontSize + 'px Arial';
            self.ctx.textAlign = 'center';
            self.ctx.strokeStyle = '#000000';
            self.ctx.lineWidth = Math.max(3, Math.floor(fontSize / 6));

            var textX = building.x + building.width / 2;
            var textY = building.y + building.height / 3;

            self.ctx.strokeText(building.name, textX, textY);
            self.ctx.fillText(building.name, textX, textY);
        }
    });

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

    var self = this;
    this.buildings.forEach(function (building) {
        if (building.x >= worldLeft && building.x <= worldRight && building.y >= worldTop && building.y <= worldBottom) {

            var buildingMiniX = miniMapX + (building.x - worldLeft) * scaleX;
            var buildingMiniY = miniMapY + (building.y - worldTop) * scaleY;

            if (building.explored) {
                self.ctx.fillStyle = building.color;
                self.ctx.fillRect(buildingMiniX - 1, buildingMiniY - 1, 3, 3);
            } else {
                self.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                self.ctx.fillRect(buildingMiniX, buildingMiniY, 1, 1);
            }
        }
    });

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
    if (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0) {
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

    var knobX = joystickX + this.joystick.direction.x * (joystickRadius - knobRadius);
    var knobY = joystickY + this.joystick.direction.y * (joystickRadius - knobRadius);

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

    if (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(joystickX, joystickY);
        this.ctx.lineTo(knobX, knobY);
        this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    this.ctx.restore();
};

GameEngine.prototype.renderBuildingEntryPrompt = function () {
    if (!this.buildingEntryPrompt || !this.buildingEntryPrompt.active) return;

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

    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(zombie.x - 8, zombie.y - 8, 16, 16);
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(zombie.x - 6, zombie.y - 6, 12, 12);
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
            this.exitBuilding();
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

// ========================================
// 工具函数和调试系统 (Utilities & Debug System)
// ========================================

GameEngine.prototype.switchCharacter = function (characterId) {
    if (this.characterManager.switchCharacter(characterId)) {
        return true;
    }
    return false;
};

GameEngine.prototype.getCurrentCharacterInfo = function () {
    var character = this.characterManager.getCurrentCharacter();
    return {
        id: character.id, name: character.name, description: character.description
    };
};

GameEngine.prototype.getCharacterList = function () {
    var list = [];
    for (var id in this.characterManager.characters) {
        var character = this.characterManager.characters[id];
        list.push({
            id: parseInt(id), name: character.name, description: character.description
        });
    }
    return list.sort(function (a, b) {
        return a.id - b.id;
    });
};

// ========================================
// 游戏初始化和启动 (Game Initialization)
// ========================================

// ========================================
// 游戏启动 (Game Launch)
// ========================================

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

// 视距裁剪系统配置
var VIEWPORT_CONFIG = {
    GRID_SIZE: 500,           // 网格区块大小
    EXTRA_RENDER: 1,          // 额外渲染区块数
    MAX_VIEW_DISTANCE: 1000,  // 最大视距
    UPDATE_FREQUENCIES: {
        CORE: 1,              // 60fps (每帧更新)
        IMPORTANT: 2,         // 30fps (每2帧更新)
        NORMAL: 4,            // 15fps (每4帧更新)
        LOW: 30,              // 2fps (每30帧更新)
        SLEEP: 0              // 停止更新
    }
};

// 四叉树节点类
function QuadTreeNode(bounds, maxObjects, maxLevels, level) {
    this.bounds = bounds;           // 边界 {x, y, width, height}
    this.maxObjects = maxObjects || 10;
    this.maxLevels = maxLevels || 5;
    this.level = level || 0;
    this.objects = [];
    this.nodes = [];
    this.isLeaf = true;
}

QuadTreeNode.prototype.insert = function(object) {
    if (!this.bounds.contains(object.x, object.y)) {
        return false;
    }
    
    if (this.isLeaf && this.objects.length < this.maxObjects) {
        this.objects.push(object);
        return true;
    }
    
    if (this.isLeaf && this.level < this.maxLevels) {
        this.split();
    }
    
    for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].insert(object)) {
            return true;
        }
    }
    
    return false;
};

QuadTreeNode.prototype.split = function() {
    var subWidth = this.bounds.width / 2;
    var subHeight = this.bounds.height / 2;
    var x = this.bounds.x;
    var y = this.bounds.y;
    
    this.nodes[0] = new QuadTreeNode({
        x: x + subWidth,
        y: y,
        width: subWidth,
        height: subHeight
    }, this.maxObjects, this.maxLevels, this.level + 1);
    
    this.nodes[1] = new QuadTreeNode({
        x: x,
        y: y,
        width: subWidth,
        height: subHeight
    }, this.maxObjects, this.maxLevels, this.level + 1);
    
    this.nodes[2] = new QuadTreeNode({
        x: x,
        y: y + subHeight,
        width: subWidth,
        height: subHeight
    }, this.maxObjects, this.maxLevels, this.level + 1);
    
    this.nodes[3] = new QuadTreeNode({
        x: x + subWidth,
        y: y + subHeight,
        width: subWidth,
        height: subHeight
    }, this.maxObjects, this.maxLevels, this.level + 1);
    
    this.isLeaf = false;
    
    // 重新分配现有对象
    for (var i = 0; i < this.objects.length; i++) {
        for (var j = 0; j < this.nodes.length; j++) {
            if (this.nodes[j].insert(this.objects[i])) {
                break;
            }
        }
    }
    this.objects = [];
};

QuadTreeNode.prototype.query = function(range) {
    var result = [];
    
    if (!this.bounds.intersects(range)) {
        return result;
    }
    
    for (var i = 0; i < this.objects.length; i++) {
        if (range.contains(this.objects[i].x, this.objects[i].y)) {
            result.push(this.objects[i]);
        }
    }
    
    if (!this.isLeaf) {
        for (var i = 0; i < this.nodes.length; i++) {
            result = result.concat(this.nodes[i].query(range));
        }
    }
    
    return result;
};

// 边界框类
function Bounds(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Bounds.prototype.contains = function(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
};

Bounds.prototype.intersects = function(other) {
    return !(this.x > other.x + other.width ||
             this.x + this.width < other.x ||
             this.y > other.y + other.height ||
             this.y + this.height < other.y);
};

// 视距裁剪管理器
function ViewportCullingManager() {
    this.quadTree = null;
    this.visibleEntities = {
        players: [],
        followers: [],
        zombies: [],
        buildings: [],
        decorations: []
    };
    this.updateCounters = {
        core: 0,
        important: 0,
        normal: 0,
        low: 0
    };
    this.camera = {x: 0, y: 0, width: 800, height: 600};
}

ViewportCullingManager.prototype.init = function(mapWidth, mapHeight) {
    this.quadTree = new QuadTreeNode({
        x: 0,
        y: 0,
        width: mapWidth,
        height: mapHeight
    });
};

ViewportCullingManager.prototype.updateCamera = function(x, y, width, height) {
    this.camera.x = x;
    this.camera.y = y;
    this.camera.width = width;
    this.camera.height = height;
};

ViewportCullingManager.prototype.getVisibleRange = function() {
    var extra = VIEWPORT_CONFIG.GRID_SIZE * VIEWPORT_CONFIG.EXTRA_RENDER;
    return {
        x: Math.max(0, this.camera.x - extra),
        y: Math.max(0, this.camera.y - extra),
        width: this.camera.width + extra * 2,
        height: this.camera.height + extra * 2
    };
};

ViewportCullingManager.prototype.updateVisibleEntities = function(gameEngine) {
    var visibleRange = this.getVisibleRange();
    var allEntities = this.quadTree.query(visibleRange);
    
    // 清空可见实体列表
    for (var key in this.visibleEntities) {
        this.visibleEntities[key] = [];
    }
    
    // 按优先级分类实体
    for (var i = 0; i < allEntities.length; i++) {
        var entity = allEntities[i];
        var distance = Math.sqrt(
            Math.pow(entity.x - gameEngine.player.x, 2) +
            Math.pow(entity.y - gameEngine.player.y, 2)
        );
        
        // 超出最大视距的实体不渲染
        if (distance > VIEWPORT_CONFIG.MAX_VIEW_DISTANCE) {
            continue;
        }
        
        // 按类型分类
        if (entity === gameEngine.player) {
            this.visibleEntities.players.push(entity);
        } else if (entity.type === 'follower') {
            this.visibleEntities.followers.push(entity);
        } else if (entity.type && entity.type.includes('zombie')) {
            this.visibleEntities.zombies.push(entity);
        } else if (entity.type === 'building') {
            this.visibleEntities.buildings.push(entity);
        } else {
            this.visibleEntities.decorations.push(entity);
        }
    }
    
    // 更新计数器
    this.updateCounters.core++;
    if (this.updateCounters.core % 2 === 0) this.updateCounters.important++;
    if (this.updateCounters.core % 4 === 0) this.updateCounters.normal++;
    if (this.updateCounters.core % 30 === 0) this.updateCounters.low++;
};

ViewportCullingManager.prototype.shouldUpdateEntity = function(entity, updateType) {
    var distance = Math.sqrt(
        Math.pow(entity.x - this.camera.x, 2) +
        Math.pow(entity.y - this.camera.y, 2)
    );
    
    switch (updateType) {
        case 'core':
            return true; // 每帧更新
        case 'important':
            return this.updateCounters.important % 2 === 0 && distance < 500;
        case 'normal':
            return this.updateCounters.normal % 4 === 0 && distance < 1000;
        case 'low':
            return this.updateCounters.low % 30 === 0;
        case 'sleep':
            return false;
        default:
            return true;
    }
};
