/**
 * 末日Q行 - 抖音小程序游戏
 * 一个生存至100天的挑战游戏
 * 使用ES5语法，完全兼容抖音小程序环境
 */

console.log('=== 末日Q行游戏启动 ===');
console.log('参考文档: https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/introduction');

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

BaseCharacter.prototype.getDefaultColors = function() {
    return {
        skin: '#FF8C42', skinHighlight: '#FFB366', skinShadow: '#E6732A',
        clothes: '#FFFFFF', clothesShadow: '#E0E0E0', clothesDetail: '#F0F0F0',
        hair: '#1A1A1A', hairHighlight: '#404040',
        eyes: '#000000', eyesHighlight: '#FFFFFF',
        mouth: '#D4621F', mouthShadow: '#E6732A'
    };
};

BaseCharacter.prototype.getDefaultFeatures = function() {
    return { hasGlasses: true, hairStyle: 'normal', bodyType: 'normal', clothingStyle: 'casual', accessory: 'sunglasses' };
};

BaseCharacter.prototype.getDefaultAnimations = function() {
    return { walkBobAmplitude: 1.5, walkLegSwingAmplitude: 3, walkArmSwingAmplitude: 2, walkSpeed: 200 };
};

BaseCharacter.prototype.calculateAnimationOffsets = function(player) {
    var offsets = { bobOffset: 0, leftLegOffset: 0, rightLegOffset: 0, leftArmOffset: 0, rightArmOffset: 0 };
    if (player.isWalking) {
        offsets.bobOffset = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkBobAmplitude;
        var legSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkLegSwingAmplitude;
        offsets.leftLegOffset = legSwing; offsets.rightLegOffset = -legSwing;
        var armSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkArmSwingAmplitude;
        offsets.leftArmOffset = -armSwing; offsets.rightArmOffset = armSwing;
    }
    return offsets;
};

BaseCharacter.prototype.render = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    y += offsets.bobOffset;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    this.renderBody(ctx, x, y, player); this.renderHead(ctx, x, y, player);
    this.renderArms(ctx, x, y, player); this.renderLegs(ctx, x, y, player);
    ctx.restore();
};

BaseCharacter.prototype.renderBody = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.clothes; ctx.fillRect(x - 10, y - 6, 20, 18);
    ctx.fillStyle = this.colors.clothesShadow; ctx.fillRect(x + 8, y - 4, 2, 14); ctx.fillRect(x - 8, y + 10, 16, 2);
    ctx.fillStyle = this.colors.clothesDetail; ctx.fillRect(x - 6, y - 2, 2, 8); ctx.fillRect(x + 4, y + 2, 2, 6);
};

BaseCharacter.prototype.renderHead = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.skin; ctx.fillRect(x - 10, y - 20, 20, 16);
    ctx.fillStyle = this.colors.skinHighlight; ctx.fillRect(x - 8, y - 18, 4, 4); ctx.fillRect(x + 4, y - 16, 4, 3);
    ctx.fillStyle = this.colors.skinShadow; ctx.fillRect(x + 8, y - 16, 2, 12); ctx.fillRect(x - 6, y - 6, 12, 2);
    this.renderHair(ctx, x, y, player); this.renderFacialFeatures(ctx, x, y, player);
};

BaseCharacter.prototype.renderHair = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(x - 12, y - 28, 24, 12); ctx.fillRect(x - 10, y - 32, 20, 6);
    ctx.fillRect(x - 14, y - 26, 4, 8); ctx.fillRect(x + 10, y - 26, 4, 8);
    ctx.fillRect(x - 8, y - 22, 16, 4); ctx.fillRect(x - 4, y - 24, 8, 2);
    ctx.fillStyle = this.colors.hairHighlight;
    ctx.fillRect(x - 6, y - 30, 3, 2); ctx.fillRect(x + 3, y - 32, 3, 2); ctx.fillRect(x - 2, y - 22, 4, 1);
};

BaseCharacter.prototype.renderFacialFeatures = function(ctx, x, y, player) {
    if (this.features.hasGlasses) this.renderGlasses(ctx, x, y, player);
    else this.renderEyes(ctx, x, y, player);
    this.renderNose(ctx, x, y, player); this.renderMouth(ctx, x, y, player);
};

BaseCharacter.prototype.renderGlasses = function(ctx, x, y, player) {
    ctx.fillStyle = '#000000'; ctx.fillRect(x - 8, y - 18, 16, 6);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 7, y - 17, 6, 4); ctx.fillRect(x + 1, y - 17, 6, 4);
    ctx.fillStyle = '#333333'; ctx.fillRect(x - 6, y - 17, 2, 1); ctx.fillRect(x + 2, y - 17, 2, 1);
    ctx.fillStyle = '#555555'; ctx.fillRect(x - 7, y - 16, 1, 2); ctx.fillRect(x + 6, y - 16, 1, 2);
    ctx.fillStyle = '#000000'; ctx.fillRect(x - 1, y - 17, 2, 2);
    ctx.fillRect(x - 10, y - 17, 2, 1); ctx.fillRect(x + 8, y - 17, 2, 1);
};

BaseCharacter.prototype.renderEyes = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.eyes; ctx.fillRect(x - 6, y - 16, 3, 2); ctx.fillRect(x + 3, y - 16, 3, 2);
    ctx.fillStyle = this.colors.eyesHighlight; ctx.fillRect(x - 5, y - 16, 1, 1); ctx.fillRect(x + 4, y - 16, 1, 1);
};

BaseCharacter.prototype.renderNose = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.skinShadow; ctx.fillRect(x - 1, y - 12, 2, 2);
    ctx.fillStyle = this.colors.skinHighlight; ctx.fillRect(x, y - 13, 1, 1);
};

BaseCharacter.prototype.renderMouth = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.mouth; ctx.fillRect(x - 2, y - 10, 4, 1);
    ctx.fillStyle = this.colors.mouthShadow; ctx.fillRect(x - 1, y - 9, 2, 1);
};

BaseCharacter.prototype.renderArms = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 14, y - 4 + offsets.leftArmOffset, 4, 10); ctx.fillRect(x - 16, y + 4 + offsets.leftArmOffset, 4, 8);
    ctx.fillRect(x + 10, y - 4 + offsets.rightArmOffset, 4, 10); ctx.fillRect(x + 12, y + 4 + offsets.rightArmOffset, 4, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 12, y + 2 + offsets.leftArmOffset, 2, 4); ctx.fillRect(x + 10, y + 2 + offsets.rightArmOffset, 2, 4);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 18, y + 10 + offsets.leftArmOffset, 4, 4); ctx.fillRect(x + 14, y + 10 + offsets.rightArmOffset, 4, 4);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 16, y + 12 + offsets.leftArmOffset, 2, 2); ctx.fillRect(x + 14, y + 12 + offsets.rightArmOffset, 2, 2);
};

BaseCharacter.prototype.renderLegs = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 6, y + 12 + offsets.leftLegOffset, 5, 14); ctx.fillRect(x - 7, y + 24 + offsets.leftLegOffset, 5, 8);
    ctx.fillRect(x + 1, y + 12 + offsets.rightLegOffset, 5, 14); ctx.fillRect(x + 2, y + 24 + offsets.rightLegOffset, 5, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 2, y + 20 + offsets.leftLegOffset, 2, 6); ctx.fillRect(x + 1, y + 20 + offsets.rightLegOffset, 2, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 10, y + 30 + offsets.leftLegOffset, 8, 5); ctx.fillRect(x + 2, y + 30 + offsets.rightLegOffset, 8, 5);
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(x - 8, y + 32 + offsets.leftLegOffset, 4, 2); ctx.fillRect(x + 4, y + 32 + offsets.rightLegOffset, 4, 2);
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(x - 9, y + 30 + offsets.leftLegOffset, 2, 1); ctx.fillRect(x + 7, y + 30 + offsets.rightLegOffset, 2, 1);
};

// 人物管理器
function CharacterManager() {
    this.characters = {}; 
    this.currentCharacterId = 1; 
    this.initializeCharacters();
}

CharacterManager.prototype.initializeCharacters = function() {
    var configs = [
        {id: 1, name: '酷炫墨镜哥', colors: {clothes: '#FFFFFF', hair: '#1A1A1A'}, features: {hasGlasses: true}},
        {id: 2, name: '金发女战士', colors: {clothes: '#8E24AA', hair: '#FFD700'}, features: {hasGlasses: false}},
        {id: 3, name: '暗影忍者', colors: {clothes: '#212121', hair: '#1A1A1A'}, features: {hasGlasses: false}},
        {id: 4, name: '机械工程师', colors: {clothes: '#FF9800', hair: '#795548'}, features: {hasGlasses: true}},
        {id: 5, name: '魔法师', colors: {clothes: '#3F51B5', hair: '#9C27B0'}, features: {hasGlasses: false}},
        {id: 6, name: '海盗船长', colors: {clothes: '#8D6E63', hair: '#FF5722'}, features: {hasGlasses: false}},
        {id: 7, name: '太空探险家', colors: {clothes: '#607D8B', hair: '#CDDC39'}, features: {hasGlasses: true}},
        {id: 8, name: '武士', colors: {clothes: '#F44336', hair: '#424242'}, features: {hasGlasses: false}},
        {id: 9, name: '摇滚歌手', colors: {clothes: '#E91E63', hair: '#FF1744'}, features: {hasGlasses: true}},
        {id: 10, name: '神秘学者', colors: {clothes: '#009688', hair: '#37474F'}, features: {hasGlasses: false}},
        {id: 11, name: '赛车手', colors: {clothes: '#FF5722', hair: '#FFC107'}, features: {hasGlasses: true}},
        {id: 12, name: '军事指挥官', colors: {clothes: '#4CAF50', hair: '#616161'}, features: {hasGlasses: false}},
        {id: 13, name: '幽灵猎人', colors: {clothes: '#9E9E9E', hair: '#212121'}, features: {hasGlasses: true}},
        {id: 14, name: '网络黑客', colors: {clothes: '#00E676', hair: '#1DE9B6'}, features: {hasGlasses: false}},
        {id: 15, name: '西部牛仔', colors: {clothes: '#8D6E63', hair: '#FFAB40'}, features: {hasGlasses: true}},
        {id: 16, name: '外星访客', colors: {clothes: '#00BCD4', hair: '#4FC3F7'}, features: {hasGlasses: false}},
        {id: 17, name: '格斗冠军', colors: {clothes: '#FF9800', hair: '#795548'}, features: {hasGlasses: true}},
        {id: 18, name: '时间旅行者', colors: {clothes: '#673AB7', hair: '#9C27B0'}, features: {hasGlasses: false}},
        {id: 19, name: '机器人', colors: {clothes: '#546E7A', hair: '#90A4AE'}, features: {hasGlasses: true}},
        {id: 20, name: '超级英雄', colors: {clothes: '#2196F3', hair: '#FFC107'}, features: {hasGlasses: false}}
    ];
    for (var i = 0; i < configs.length; i++) this.characters[configs[i].id] = new BaseCharacter(configs[i]);
};

CharacterManager.prototype.getCurrentCharacter = function() {
    return this.characters[this.currentCharacterId] || this.characters[1];
};

CharacterManager.prototype.switchCharacter = function(characterId) {
    if (characterId >= 1 && characterId <= 20 && this.characters[characterId]) {
        this.currentCharacterId = characterId; 
        return true;
    }
    return false;
};

CharacterManager.prototype.renderCurrentCharacter = function(ctx, x, y, player) {
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
    this.detectionRange = config.detectionRange || 150;
    this.attackRange = config.attackRange || 25;
    this.size = config.size || 1.2; // 比人物大一点
    
    // AI状态
    this.state = 'wandering'; // wandering, chasing, attacking
    this.target = null;
    this.lastAttackTime = 0;
    this.attackCooldown = config.attackCooldown || 1500; // 攻击冷却时间
    
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
}

BaseZombie.prototype.update = function(deltaTime, gameEngine) {
    this.gameEngine = gameEngine;
    this.updateAI(deltaTime, gameEngine);
    this.updateAnimation(deltaTime);
    this.updateMovement(deltaTime);
};

BaseZombie.prototype.updateAI = function(deltaTime, gameEngine) {
    if (!this.aiUpdateTimer) this.aiUpdateTimer = 0;
    this.aiUpdateTimer += deltaTime;
    
    if (this.aiUpdateTimer < 200) return;
    this.aiUpdateTimer = 0;
    
    var currentTime = Date.now();
    var playerDistance = Math.sqrt(
        Math.pow(this.x - gameEngine.player.x, 2) + 
        Math.pow(this.y - gameEngine.player.y, 2)
    );
    
    if (playerDistance <= this.detectionRange && gameEngine.player.health > 0) {
        this.state = 'chasing';
        this.target = gameEngine.player;
        
        if (playerDistance <= this.attackRange) {
            this.state = 'attacking';
            if (currentTime - this.lastAttackTime >= this.attackCooldown) {
                this.attackTarget(gameEngine.player);
                this.lastAttackTime = currentTime;
            }
        } else {
            this.chaseTarget(gameEngine.player);
        }
    } else {
        if (this.state !== 'wandering') {
            this.state = 'wandering';
            this.target = null;
        }
        this.wander(deltaTime);
    }
};

BaseZombie.prototype.chaseTarget = function(target) {
    if (!target) return;
    
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        var dirX = dx / distance;
        var dirY = dy / distance;
        var newX = this.x + dirX * this.moveSpeed;
        var newY = this.y + dirY * this.moveSpeed;
        
        if (this.canZombieMoveTo(newX, newY, this.gameEngine)) {
            this.x = newX;
            this.y = newY;
        } else {
            var alternativePath = this.findZombieAlternativePath(target.x, target.y, this.gameEngine);
            if (alternativePath.success) {
                this.x = alternativePath.x;
                this.y = alternativePath.y;
            }
        }
        
        this.isWalking = true;
        this.direction = this.getDirectionFromDelta(dirX, dirY);
    }
};

BaseZombie.prototype.canZombieMoveTo = function(x, y, gameEngine) {
    var zombieRadius = 20;
    var mapConfig = gameEngine ? gameEngine.mapConfig : { width: 10000, height: 10000 };
    
    if (x < zombieRadius || x > mapConfig.width - zombieRadius ||
        y < zombieRadius || y > mapConfig.height - zombieRadius) {
        return false;
    }
    
    var buildings = gameEngine ? gameEngine.buildings : [];
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        if (x + zombieRadius >= building.x && 
            x - zombieRadius <= building.x + building.width &&
            y + zombieRadius >= building.y && 
            y - zombieRadius <= building.y + building.height) {
            return false;
        }
    }
    
    return true;
};

BaseZombie.prototype.findZombieAlternativePath = function(targetX, targetY, gameEngine) {
    var searchRadius = 50;
    var stepSize = 10;
    var directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
    ];
    
    for (var radius = stepSize; radius <= searchRadius; radius += stepSize) {
        for (var i = 0; i < directions.length; i++) {
            var dir = directions[i];
            var testX = this.x + dir.dx * radius;
            var testY = this.y + dir.dy * radius;
            
            if (this.canZombieMoveTo(testX, testY, gameEngine)) {
                var currentDistance = Math.sqrt(Math.pow(this.x - targetX, 2) + Math.pow(this.y - targetY, 2));
                var testDistance = Math.sqrt(Math.pow(testX - targetX, 2) + Math.pow(testY - targetY, 2));
                
                if (testDistance < currentDistance) {
                    return { success: true, x: testX, y: testY };
                }
            }
        }
    }
    
    return { success: false };
};

BaseZombie.prototype.wander = function(deltaTime) {
    this.wanderTimer -= deltaTime;
    
    if (!this.wanderTarget || this.wanderTimer <= 0) {
        var attempts = 0;
        var maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            var angle = Math.random() * Math.PI * 2;
            var distance = 50 + Math.random() * 100;
            var targetX = this.x + Math.cos(angle) * distance;
            var targetY = this.y + Math.sin(angle) * distance;
            
            if (this.canZombieMoveTo(targetX, targetY, this.gameEngine)) {
                this.wanderTarget = { x: targetX, y: targetY };
                break;
            }
            attempts++;
        }
        
        if (!this.wanderTarget) {
            this.wanderTarget = { x: this.x, y: this.y };
        }
        
        this.wanderTimer = 2000 + Math.random() * 3000;
    }
    
    if (this.wanderTarget) {
        var dx = this.wanderTarget.x - this.x;
        var dy = this.wanderTarget.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            var dirX = dx / distance;
            var dirY = dy / distance;
            var newX = this.x + dirX * this.moveSpeed * 0.5;
            var newY = this.y + dirY * this.moveSpeed * 0.5;
            
            if (this.canZombieMoveTo(newX, newY, this.gameEngine)) {
                this.x = newX;
                this.y = newY;
                this.isWalking = true;
                this.direction = this.getDirectionFromDelta(dirX, dirY);
            } else {
                this.wanderTarget = null;
                this.wanderTimer = 0;
                this.isWalking = false;
            }
        } else {
            this.wanderTarget = null;
            this.isWalking = false;
        }
    }
};

BaseZombie.prototype.attackTarget = function(target) {
    if (!target || target.health <= 0) return;
    
    target.health -= this.attack;
    console.log('[Zombie] 僵尸攻击目标，造成', this.attack, '点伤害，目标剩余血量:', target.health);
    
    if (target.health <= 0) {
        this.onTargetDeath(target);
    }
};

BaseZombie.prototype.onTargetDeath = function(target) {
    console.log('[Zombie] 目标死亡，准备转化为僵尸');
    target.health = 0;
    target.isDead = true;
    this.state = 'wandering';
    this.target = null;
};

BaseZombie.prototype.takeDamage = function(damage) {
    this.health -= damage;
    console.log('[Zombie] 僵尸受到', damage, '点伤害，剩余血量:', this.health);
    
    if (this.health <= 0) {
        this.health = 0;
        console.log('[Zombie] 僵尸死亡');
        return true;
    }
    
    return false;
};

BaseZombie.prototype.updateAnimation = function(deltaTime) {
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

BaseZombie.prototype.updateMovement = function(deltaTime) {
    if (Math.abs(this.x - this.lastX) > 0.1 || Math.abs(this.y - this.lastY) > 0.1) {
        this.isWalking = true;
    } else {
        this.isWalking = false;
    }
    
    this.lastX = this.x;
    this.lastY = this.y;
};

BaseZombie.prototype.getDirectionFromDelta = function(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
    } else {
        return deltaY > 0 ? 'down' : 'up';
    }
};

BaseZombie.prototype.render = function(ctx, camera) {
    var viewWidth = ctx.canvas.width / camera.zoom;
    var viewHeight = ctx.canvas.height / camera.zoom;
    var viewLeft = camera.x;
    var viewRight = camera.x + viewWidth;
    var viewTop = camera.y;
    var viewBottom = camera.y + viewHeight;
    
    var margin = 100;
    if (this.x < viewLeft - margin || this.x > viewRight + margin ||
        this.y < viewTop - margin || this.y > viewBottom + margin) {
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

BaseZombie.prototype.renderZombie = function(ctx) {
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-12, -12, 24, 24);
    
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-8, -8, 3, 3);
    ctx.fillRect(5, -8, 3, 3);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(-4, -2, 8, 2);
};

BaseZombie.prototype.renderHealthBar = function(ctx) {
    var healthPercentage = this.health / this.maxHealth;
    var barWidth = 20;
    var barHeight = 3;
    
    ctx.fillStyle = '#333333';
    ctx.fillRect(-barWidth/2, -20, barWidth, barHeight);
    
    ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : healthPercentage > 0.2 ? '#FF9800' : '#F44336';
    ctx.fillRect(-barWidth/2, -20, barWidth * healthPercentage, barHeight);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-barWidth/2, -20, barWidth, barHeight);
};

BaseZombie.prototype.renderStateIndicator = function(ctx) {
    var indicator = '';
    var color = '#ffffff';
    
    switch (this.state) {
        case 'chasing': indicator = '!'; color = '#ff4444'; break;
        case 'attacking': indicator = '⚡'; color = '#ff0000'; break;
        case 'wandering': indicator = '?'; color = '#888888'; break;
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

ThinZombie.prototype.renderZombie = function(ctx) {
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

FatZombie.prototype.renderZombie = function(ctx) {
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

ZombieBoss1.prototype.renderZombie = function(ctx) {
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

ZombieBoss1.prototype.attackTarget = function(target) {
    if (!target || target.health <= 0) return;
    
    target.health -= this.attack;
    console.log('[ZombieBoss1] Boss攻击目标，造成', this.attack, '点伤害，目标剩余血量:', target.health);
    
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
}

ZombieManager.prototype.getZombieTypes = function() {
    return {
        thin: {
            name: '瘦僵尸', health: 25, attack: 6, moveSpeed: 2.0,
            size: 1.1, attackCooldown: 1200, color: '#8b0000'
        },
        fat: {
            name: '胖僵尸', health: 50, attack: 12, moveSpeed: 1.2,
            size: 1.4, attackCooldown: 2000, color: '#4a4a4a'
        },
        boss1: {
            name: '僵尸Boss1', health: 100, attack: 20, moveSpeed: 1.8,
            size: 1.6, attackCooldown: 1000, detectionRange: 200, color: '#2d0d0d'
        }
    };
};

ZombieManager.prototype.createZombie = function(type, x, y) {
    var zombieType = this.zombieTypes[type];
    if (!zombieType) {
        console.warn('[ZombieManager] 未知的僵尸类型:', type);
        return null;
    }
    
    var config = {
        type: type, x: x, y: y,
        health: zombieType.health, maxHealth: zombieType.health,
        attack: zombieType.attack, moveSpeed: zombieType.moveSpeed,
        size: zombieType.size, attackCooldown: zombieType.attackCooldown,
        detectionRange: zombieType.detectionRange || 150
    };
    
    var zombie;
    switch (type) {
        case 'thin': zombie = new ThinZombie(config); break;
        case 'fat': zombie = new FatZombie(config); break;
        case 'boss1': zombie = new ZombieBoss1(config); break;
        default: zombie = new BaseZombie(config);
    }
    
    this.zombies.push(zombie);
    return zombie;
};

ZombieManager.prototype.update = function(deltaTime, gameEngine) {
    var viewWidth = gameEngine.canvas.width / gameEngine.camera.zoom;
    var viewHeight = gameEngine.canvas.height / gameEngine.camera.zoom;
    var viewLeft = gameEngine.camera.x - 200;
    var viewRight = gameEngine.camera.x + viewWidth + 200;
    var viewTop = gameEngine.camera.y - 200;
    var viewBottom = gameEngine.camera.y + viewHeight + 200;
    
    for (var i = this.zombies.length - 1; i >= 0; i--) {
        var zombie = this.zombies[i];
        
        var inView = (zombie.x >= viewLeft && zombie.x <= viewRight &&
                     zombie.y >= viewTop && zombie.y <= viewBottom);
        var isChasing = zombie.state === 'chasing' || zombie.state === 'attacking';
        
        if (inView || isChasing) {
            zombie.update(deltaTime, gameEngine);
        }
        
        if (zombie.health <= 0) {
            this.zombies.splice(i, 1);
            gameEngine.gameData.zombieKills++;
            console.log('[Zombie] 僵尸死亡，剩余:', this.zombies.length, '只');
        }
    }
};

ZombieManager.prototype.render = function(ctx, camera) {
    for (var i = 0; i < this.zombies.length; i++) {
        this.zombies[i].render(ctx, camera);
    }
};

ZombieManager.prototype.getZombiesInRange = function(x, y, range) {
    var zombiesInRange = [];
    
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        var distance = Math.sqrt(
            Math.pow(zombie.x - x, 2) + 
            Math.pow(zombie.y - y, 2)
        );
        
        if (distance <= range) {
            zombiesInRange.push({ zombie: zombie, distance: distance });
        }
    }
    
    return zombiesInRange;
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
    
    // NPC系统
    this.npcs = [];
    this.followers = [];
    
    // 游戏数据
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
        x: 0, y: 0,
        followTarget: null,
        smoothing: 0.1,
        zoom: 0.8
    };
    
    // 游戏对象
    this.buildings = this.initializeBuildings();
    this.player = { 
        x: this.mapConfig.width / 2, 
        y: this.mapConfig.height / 2, 
        health: 50, 
        maxHealth: 50, 
        level: 1,
        attack: 15,
        attackRange: 35,
        lastAttackTime: 0,
        attackCooldown: 800,
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
    
    // 初始化系统
    this.initializeNPCs();
    this.initializeZombies();
    
    // 子地图状态
    this.zombies = [];
    this.resources = [];
    this.subMapType = null;
    
    this.setupInput();
    console.log('[GameEngine] 游戏引擎已初始化');
}

// ========================================
// 建筑和地图系统 (Building & Map System)
// ========================================

/**
 * 初始化建筑物
 */
GameEngine.prototype.initializeBuildings = function() {
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
    
    console.log('[GameEngine] 生成了 ' + buildings.length + ' 个建筑');
    return buildings;
};

GameEngine.prototype.getBuildingTypes = function() {
    return [
        { type: 'police_station', name: '警察局', width: 80, height: 80, color: '#3498db', weight: 1 },
        { type: 'hospital', name: '医院', width: 80, height: 80, color: '#e74c3c', weight: 1 },
        { type: 'school', name: '学校', width: 70, height: 70, color: '#f39c12', weight: 2 },
        { type: 'station', name: '车站', width: 70, height: 60, color: '#34495e', weight: 2 },
        { type: 'mall', name: '商场', width: 90, height: 70, color: '#27ae60', weight: 1 },
        { type: 'shop', name: '商店', width: 60, height: 50, color: '#27ae60', weight: 4, oneTimeOnly: true },
        { type: 'restaurant', name: '餐厅', width: 60, height: 50, color: '#e67e22', weight: 4, oneTimeOnly: true },
        { type: 'bar', name: '酒吧', width: 50, height: 50, color: '#d35400', weight: 3, oneTimeOnly: true },
        { type: 'cafe', name: '咖啡厅', width: 50, height: 50, color: '#8e44ad', weight: 3 },
        { type: 'bank', name: '银行', width: 70, height: 60, color: '#2c3e50', weight: 2 },
        { type: 'house', name: '民房', width: 50, height: 50, color: '#95a5a6', weight: 8 },
        { type: 'villa', name: '别墅', width: 80, height: 60, color: '#8e44ad', weight: 4 },
        { type: 'apartment', name: '公寓', width: 60, height: 80, color: '#7f8c8d', weight: 6 },
        { type: 'factory', name: '工厂', width: 90, height: 70, color: '#555555', weight: 2 },
        { type: 'warehouse', name: '仓库', width: 80, height: 60, color: '#666666', weight: 3 },
        { type: 'gas_station', name: '加油站', width: 70, height: 50, color: '#f1c40f', weight: 2 },
        { type: 'gym', name: '健身房', width: 60, height: 60, color: '#9b59b6', weight: 2 },
        { type: 'library', name: '图书馆', width: 70, height: 70, color: '#16a085', weight: 1 }
    ];
};

GameEngine.prototype.calculateBuildingPosition = function(blockX, blockY) {
    var blockStartX = blockX * this.mapConfig.blockSize;
    var blockStartY = blockY * this.mapConfig.blockSize;
    
    var buildingX = blockStartX + this.mapConfig.streetWidth;
    var buildingY = blockStartY + this.mapConfig.streetWidth;
    var buildingWidth = this.mapConfig.blockSize - this.mapConfig.streetWidth;
    var buildingHeight = this.mapConfig.blockSize - this.mapConfig.streetWidth;
    
    if (buildingX + buildingWidth > this.mapConfig.width ||
        buildingY + buildingHeight > this.mapConfig.height) {
        return null;
    }
    
    return { 
        x: buildingX, 
        y: buildingY, 
        width: buildingWidth, 
        height: buildingHeight 
    };
};

GameEngine.prototype.exploreBuilding = function(building) {
    console.log('[GameEngine] 尝试探索建筑:', building.name, '类型:', building.type);
    
    if (building.oneTimeOnly && building.explored) {
        console.log('[GameEngine] 该建筑物只能探索一次，已探索过');
        return;
    }
    
    this.playerPositionBeforeEntering = { x: this.player.x, y: this.player.y };
    this.followersPositionBeforeEntering = [];
    for (var i = 0; i < this.followers.length; i++) {
        this.followersPositionBeforeEntering.push({
            x: this.followers[i].x,
            y: this.followers[i].y
        });
    }
    
    this.currentBuilding = building;
    this.subMapType = building.type;
    this.gameState = 'submap';
    
    this.player.x = 200;
    this.player.y = 130;
    
    var maxTeamSize = Math.min(this.followers.length, 12);
    var submapBounds = { minX: 70, maxX: 330, minY: 120, maxY: 280 };
    
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
    console.log('[GameEngine] 建筑进入完成，当前状态:', this.gameState);
};

GameEngine.prototype.exitBuilding = function() {
    console.log('[GameEngine] 退出建筑');
    
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
    this.buildingExitCooldown = Date.now() + 2000;
    this.zombies = [];
    this.resources = [];
};

// ========================================
// 输入系统实现 (Input System Implementation)
// ========================================

GameEngine.prototype.setupInput = function() {
    var self = this;
    
    this.joystick = {
        active: false,
        centerX: 80,
        centerY: 0,
        currentX: 80,
        currentY: 0,
        direction: { x: 0, y: 0 },
        radius: 60,
        knobRadius: 20,
        visible: true,
        maxDistance: 50
    };
    
    this.joystick.centerY = this.canvas.height - 80;
    this.joystick.currentY = this.joystick.centerY;
    
    // 抖音小程序触摸事件处理 - 修复兼容性问题
    if (typeof tt !== 'undefined') {
        console.log('[Input] 检测到抖音小程序环境，使用tt API');
        
        // 使用抖音小程序的触摸事件API
        try {
            tt.onTouchStart(function(res) {
                console.log('[Input] 抖音触摸开始事件:', res);
                self.onTouchStart(res);
            });
            
            tt.onTouchMove(function(res) {
                console.log('[Input] 抖音触摸移动事件:', res);
                self.onTouchMove(res);
            });
            
            tt.onTouchEnd(function(res) {
                console.log('[Input] 抖音触摸结束事件:', res);
                self.onTouchEnd(res);
            });
            
            console.log('[Input] 抖音小程序触摸事件注册成功');
        } catch (ttError) {
            console.warn('[Input] 抖音小程序触摸事件注册失败，尝试Canvas事件:', ttError);
            
            // 后备方案：尝试Canvas事件（可能不支持getBoundingClientRect）
            try {
                this.canvas.ontouchstart = function(e) { 
                    console.log('[Input] Canvas触摸开始事件');
                    self.onTouchStart(e); 
                };
                this.canvas.ontouchmove = function(e) { 
                    console.log('[Input] Canvas触摸移动事件');
                    self.onTouchMove(e); 
                };
                this.canvas.ontouchend = function(e) { 
                    console.log('[Input] Canvas触摸结束事件');
                    self.onTouchEnd(e); 
                };
                this.canvas.onclick = function(e) { 
                    console.log('[Input] Canvas点击事件');
                    self.onClick(e); 
                };
                
                console.log('[Input] Canvas事件注册成功');
            } catch (canvasError) {
                console.error('[Input] Canvas事件注册也失败:', canvasError);
            }
        }
    } else {
        console.log('[Input] 标准浏览器环境，使用addEventListener');
        
        // 标准浏览器事件
        this.canvas.addEventListener('touchstart', function(e) { self.onTouchStart(e); });
        this.canvas.addEventListener('touchmove', function(e) { self.onTouchMove(e); });
        this.canvas.addEventListener('touchend', function(e) { self.onTouchEnd(e); });
        this.canvas.addEventListener('click', function(e) { self.onClick(e); });
    }
    
    console.log('[GameEngine] 输入系统已初始化');
};

GameEngine.prototype.onTouchStart = function(e) {
    try {
        console.log('[Input] 触摸开始事件触发，事件对象:', e);
        
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
                console.log('[Input] 抖音触摸坐标(touches):', x, y);
            } else if (e.x !== undefined && e.y !== undefined) {
                // 抖音小程序直接坐标
                x = e.x;
                y = e.y;
                console.log('[Input] 抖音触摸坐标(direct):', x, y);
            } else if (e.clientX !== undefined && e.clientY !== undefined) {
                // 客户端坐标
                x = e.clientX;
                y = e.clientY;
                console.log('[Input] 抖音触摸坐标(client):', x, y);
            } else {
                // 默认坐标
                x = 0;
                y = 0;
                console.warn('[Input] 无法获取抖音触摸坐标，使用默认值');
            }
        } else {
            // 标准浏览器环境
            var touch = e.touches && e.touches[0] ? e.touches[0] : e;
            x = touch.x !== undefined ? touch.x : (touch.clientX || 0);
            y = touch.y !== undefined ? touch.y : (touch.clientY || 0);
            console.log('[Input] 浏览器触摸坐标:', x, y);
        }
        
        this.touchStartX = x;
        this.touchStartY = y;
        this.touchStartTime = Date.now();
        
        console.log('[Input] 触摸开始位置:', x, y, '游戏状态:', this.gameState);
        
        if (this.gameState === 'playing' || this.gameState === 'submap') {
            var joystickDistance = Math.sqrt(
                Math.pow(x - this.joystick.centerX, 2) + 
                Math.pow(y - this.joystick.centerY, 2)
            );
            
            console.log('[Input] 摇杆距离检查:', joystickDistance, '摇杆半径:', this.joystick.radius);
            
            if (joystickDistance <= this.joystick.radius) {
                this.joystick.active = true;
                this.joystick.currentX = x;
                this.joystick.currentY = y;
                this.updateJoystickDirection();
                console.log('[Input] 虚拟摇杆激活成功');
            } else {
                console.log('[Input] 触摸位置不在摇杆范围内');
            }
        }
    } catch (error) {
        console.error('[Input] 触摸开始处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.onTouchMove = function(e) {
    try {
        console.log('[Input] 触摸移动事件触发');
        
        if (!this.joystick.active) {
            console.log('[Input] 摇杆未激活，忽略触摸移动');
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
            var touch = e.touches && e.touches[0] ? e.touches[0] : e;
            x = touch.x !== undefined ? touch.x : (touch.clientX || 0);
            y = touch.y !== undefined ? touch.y : (touch.clientY || 0);
        }
        
        console.log('[Input] 触摸移动位置:', x, y, '摇杆状态:', this.joystick.active);
        
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
        console.log('[Input] 摇杆方向更新:', this.joystick.direction.x, this.joystick.direction.y);
        
    } catch (error) {
        console.error('[Input] 触摸移动处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.onTouchEnd = function(e) {
    try {
        console.log('[Input] 触摸结束事件触发，摇杆状态:', this.joystick.active);
        
        // 检测是否为快速点击（tap）
        var touchEndTime = Date.now();
        var touchDuration = touchEndTime - (this.touchStartTime || touchEndTime);
        
        console.log('[Input] 触摸持续时间:', touchDuration, 'ms');
        
        if (touchDuration < 300 && !this.joystick.active) {
            console.log('[Input] 检测到点击手势，触发点击事件');
            // 模拟点击事件
            this.onClick({
                x: this.touchStartX || 0,
                y: this.touchStartY || 0
            });
        }
        
        // 重置摇杆状态
        this.resetJoystick();
        
    } catch (error) {
        console.error('[Input] 触摸结束处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.resetJoystick = function() {
    this.joystick.active = false;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;
};

GameEngine.prototype.updateJoystickDirection = function() {
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

GameEngine.prototype.onClick = function(e) {
    var x, y;
    
    console.log('[Input] 点击事件触发，事件对象:', e);
    
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
        // 标准浏览器环境
        if (e.touches && e.touches[0]) {
            var touch = e.touches[0];
            x = touch.x || touch.clientX || 0;
            y = touch.y || touch.clientY || 0;
        } else {
            x = e.x !== undefined ? e.x : (e.clientX || 0);
            y = e.y !== undefined ? e.y : (e.clientY || 0);
        }
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

GameEngine.prototype.handleMenuClick = function(x, y) {
    var centerX = this.canvas.width / 2;
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    var buttonY = 320;
    
    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        this.startGame();
    }
};

GameEngine.prototype.handleGameClick = function(x, y) {
    if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        this.handleBuildingEntryPromptClick(x, y);
        return;
    }
};

GameEngine.prototype.handleBuildingEntryPromptClick = function(x, y) {
    var prompt = this.buildingEntryPrompt;
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    var boxHeight = 150;
    var boxY = centerY - boxHeight / 2;
    var buttonWidth = 80;
    var buttonHeight = 35;
    var buttonY = boxY + 90;
    
    var enterButtonX = centerX - buttonWidth - 20;
    if (x >= enterButtonX && x <= enterButtonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
        if (this.nearBuilding && 
            this.nearBuilding.id === prompt.building.id && 
            this.nearBuilding.name === prompt.building.name) {
            this.exploreBuilding(prompt.building);
        }
        this.buildingEntryPrompt = null;
        return;
    }
    
    var cancelButtonX = centerX + 20;
    if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
        this.buildingEntryPrompt = null;
        return;
    }
};

GameEngine.prototype.handleSubMapClick = function(x, y) {
    var self = this;
    if (x >= 10 && x <= 90 && y >= this.canvas.height - 40 && y <= this.canvas.height - 10) {
        this.exitBuilding();
        return;
    }
    
    this.resources.forEach(function(resource) {
        if (!resource.collected) {
            var distance = Math.sqrt((x - resource.x) * (x - resource.x) + (y - resource.y) * (y - resource.y));
            if (distance <= 30) {
                self.collectResource(resource);
            }
        }
    });
};

GameEngine.prototype.handleEndGameClick = function(x, y) {
    if (x >= 175 && x <= 325 && y >= 320 && y <= 360) {
        this.restartGame();
    }
};

// ========================================
// 碰撞检测系统实现 (Collision System Implementation)
// ========================================

GameEngine.prototype.checkCollisionWithBuildings = function(x, y, characterRadius) {
    characterRadius = characterRadius || 18;
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
                return { collision: false, building: null, inDoor: true };
            } else {
                return { collision: true, building: building, inDoor: false };
            }
        }
    }
    
    return { collision: false, building: null, inDoor: false };
};

GameEngine.prototype.canMoveToPosition = function(x, y, characterRadius) {
    var margin = characterRadius || 18;
    if (x < margin || x > this.mapConfig.width - margin ||
        y < margin || y > this.mapConfig.height - margin) {
        return false;
    }
    
    var collision = this.checkCollisionWithBuildings(x, y, characterRadius);
    return !collision.collision;
};

GameEngine.prototype.circleRectCollision = function(circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight) {
    var closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    var closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
    
    var distanceX = circleX - closestX;
    var distanceY = circleY - closestY;
    var distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    return distanceSquared < (circleRadius * circleRadius);
};

GameEngine.prototype.calculateDoorInfo = function(building) {
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

GameEngine.prototype.checkNearDoor = function() {
    var playerRadius = 18;
    var interactionDistance = 60;
    var triggerDistance = 50;
    
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
        
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.x + doorInfo.width / 2;
            var doorCenterY = doorInfo.y + doorInfo.height / 2;
            
            var playerDistance = Math.sqrt(
                Math.pow(this.player.x - doorCenterX, 2) + 
                Math.pow(this.player.y - doorCenterY, 2)
            );
            
            if (playerDistance <= interactionDistance) {
                this.nearBuilding = building;
                
                if (playerDistance <= triggerDistance) {
                    if (!this.buildingEntryPrompt || 
                        !this.buildingEntryPrompt.active ||
                        this.buildingEntryPrompt.buildingId !== (building.id || building.name)) {
                        
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
            this.zombieManager.update(deltaTime, this);
            this.updateCombat(deltaTime);
            this.updateTeamHealth(deltaTime);
        }
        
        if (this.gameState === 'submap') {
            this.updateZombies(deltaTime);
        }
    }
};

GameEngine.prototype.updatePlayer = function(deltaTime) {
    var isMoving = (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0);
    
    if (isMoving) {
        this.player.isWalking = true;
        
        if (Math.abs(this.joystick.direction.x) > Math.abs(this.joystick.direction.y)) {
            this.player.direction = this.joystick.direction.x > 0 ? 'right' : 'left';
        } else {
            this.player.direction = this.joystick.direction.y > 0 ? 'down' : 'up';
        }
        
        this.updateWalkAnimation(deltaTime);
        
        var moveSpeed = 4;
        var newX = this.player.x + this.joystick.direction.x * moveSpeed;
        var newY = this.player.y + this.joystick.direction.y * moveSpeed;
        
        if (this.gameState === 'playing') {
            if (this.canMoveToPosition(newX, newY, 18)) {
            var deltaX = newX - this.player.x;
            var deltaY = newY - this.player.y;
                this.player.x = newX;
                this.player.y = newY;
                this.moveTeam(deltaX, deltaY);
            } else {
                var canMoveX = this.canMoveToPosition(newX, this.player.y, 18);
                var canMoveY = this.canMoveToPosition(this.player.x, newY, 18);
                
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

GameEngine.prototype.updateWalkAnimation = function(deltaTime) {
    this.player.lastAnimationTime += deltaTime;
    
    if (this.player.lastAnimationTime >= this.player.walkAnimationSpeed) {
        this.player.walkAnimationFrame = (this.player.walkAnimationFrame + 1) % 4;
        this.player.lastAnimationTime = 0;
    }
};

GameEngine.prototype.updateCamera = function(deltaTime) {
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

GameEngine.prototype.updateTime = function(deltaTime) {
    var self = this;
    this.gameData.timeRemaining -= deltaTime;
    
    if (this.gameData.timeRemaining <= 0) {
        if (this.gameData.isDay) {
            this.gameData.isDay = false;
            this.gameData.timeRemaining = 60000;
            console.log('[GameEngine] 夜幕降临');
        } else {
            this.gameData.isDay = true;
            this.gameData.timeRemaining = 300000;
            this.gameData.survivalDays++;
            
            var foodCost = this.gameData.teamSize;
            this.gameData.food -= foodCost;
            
            console.log('[GameEngine] 第' + this.gameData.survivalDays + '天，消耗口粮' + foodCost + '份');
            
            if (this.gameData.food < 0) {
                this.gameOver('starvation');
                return;
            }
            
            if (this.gameData.survivalDays > 100) {
                this.gameWin();
                return;
            }
            
            this.spawnNewDayZombies();
            
            this.companions.forEach(function(companion) {
                if (companion.type === 'chef') {
                    self.gameData.food += 5;
                    self.gameData.totalFood += 5;
                }
            });
        }
    }
};

GameEngine.prototype.startGame = function() {
    console.log('[GameEngine] 开始游戏函数被调用');
    this.gameState = 'playing';
    console.log('[GameEngine] 游戏状态已切换到:', this.gameState);
};

GameEngine.prototype.restartGame = function() {
    this.gameData = {
        survivalDays: 1, food: 5, teamSize: 1, maxTeamSize: 1,
        zombieKills: 0, totalFood: 5, isDay: true,
        timeRemaining: 300000, gameStartTime: Date.now()
    };
    
    this.player = { 
        x: this.mapConfig.width / 2, y: this.mapConfig.height / 2, 
        health: 20, maxHealth: 20, level: 1 
    };
    this.companions = [];
    this.exploredBuildings = [];
    this.nearBuilding = null;
    
    var self = this;
    this.buildings.forEach(function(building) {
        building.explored = false;
    });
    
    this.gameState = 'playing';
    console.log('[GameEngine] 游戏重新开始');
};

GameEngine.prototype.gameOver = function(cause) {
    this.gameState = 'gameover';
    this.gameData.cause = cause;
    console.log('[GameEngine] 游戏结束: ' + cause);
};

GameEngine.prototype.gameWin = function() {
    this.gameState = 'victory';
    console.log('[GameEngine] 游戏胜利');
};

// ========================================
// NPC和团队系统 (NPC & Team System)
// ========================================

GameEngine.prototype.initializeNPCs = function() {
    console.log('[NPC] 开始初始化NPC系统');
    
    for (var i = 0; i < 19; i++) {
        var characterId = i + 2;
        var npc = this.createNPC(characterId);
        this.npcs.push(npc);
    }
    
    console.log('[NPC] 已生成', this.npcs.length, '个NPC');
};

GameEngine.prototype.createNPC = function(characterId) {
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

GameEngine.prototype.getRandomStreetPosition = function() {
    var blockSize = this.mapConfig.blockSize;
    var streetWidth = this.mapConfig.streetWidth;
    var mapWidth = this.mapConfig.width;
    var mapHeight = this.mapConfig.height;
    
    if (Math.random() < 0.5) {
        var blockY = Math.floor(Math.random() * Math.floor(mapHeight / blockSize));
        var streetY = blockY * blockSize + streetWidth / 2;
        var x = Math.random() * (mapWidth - 200) + 100;
        return { x: x, y: streetY };
    } else {
        var blockX = Math.floor(Math.random() * Math.floor(mapWidth / blockSize));
        var streetX = blockX * blockSize + streetWidth / 2;
        var y = Math.random() * (mapHeight - 200) + 100;
        return { x: streetX, y: y };
    }
};

GameEngine.prototype.updateNPCs = function(deltaTime) {
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
        
        if (npc.x >= viewLeft && npc.x <= viewRight &&
            npc.y >= viewTop && npc.y <= viewBottom) {
            this.updateSingleNPC(npc, deltaTime);
        }
    }
};

GameEngine.prototype.updateSingleNPC = function(npc, deltaTime) {
    if (npc.isFollowing) return;
    
    var collisionThresholdSquared = 900;
    var distanceSquaredToPlayer = 
        Math.pow(npc.x - this.player.x, 2) + 
        Math.pow(npc.y - this.player.y, 2);
    
    var shouldJoinTeam = distanceSquaredToPlayer < collisionThresholdSquared;
    
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
            console.log('[NPC] 角色', npc.characterId, '加入团队，当前团队人数:', this.followers.length);
            
            this.addNewFollowerToTeam(npc);
        }
    } else {
        this.updateNPCIdleBehavior(npc, deltaTime);
    }
};

GameEngine.prototype.addNewFollowerToTeam = function(newFollower) {
    var character = newFollower.character || this.characterManager.characters[2];
    var personality = this.getCharacterPersonality(character);
    
    var targetOffset = this.calculateFollowerOffset(newFollower, personality);
    newFollower.x = this.player.x + targetOffset.x;
    newFollower.y = this.player.y + targetOffset.y;
    
    newFollower.isWalking = false;
    newFollower.direction = 'down';
};

GameEngine.prototype.moveTeam = function(deltaX, deltaY) {
    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        this.moveSingleFollower(follower, deltaX, deltaY);
    }
};

GameEngine.prototype.moveSingleFollower = function(follower, deltaX, deltaY) {
    var character = follower.character || this.characterManager.characters[2];
    var personality = this.getCharacterPersonality(character);
    
    var targetOffset = this.calculateFollowerOffset(follower, personality);
    var targetX = this.player.x + targetOffset.x;
    var targetY = this.player.y + targetOffset.y;
    
    var currentDistance = Math.sqrt(
        Math.pow(follower.x - targetX, 2) + 
        Math.pow(follower.y - targetY, 2)
    );
    
    if (currentDistance > 15) {
        var directionX = targetX - follower.x;
        var directionY = targetY - follower.y;
        var distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        if (distance > 0) {
            directionX /= distance;
            directionY /= distance;
            
            var moveSpeed = currentDistance > 100 ? 4 : currentDistance > 50 ? 3 : 2;
            var moveDistance = Math.min(moveSpeed, currentDistance);
            
            var newX = follower.x + directionX * moveDistance;
            var newY = follower.y + directionY * moveDistance;
            
            if (this.canMoveToPosition(newX, newY, 15)) {
                follower.x = newX;
                follower.y = newY;
            } else {
                if (this.canMoveToPosition(newX, follower.y, 15)) {
                    follower.x = newX;
                } else if (this.canMoveToPosition(follower.x, newY, 15)) {
                    follower.y = newY;
                } else {
                    var alternativePath = this.findAlternativePathForFollower(follower, targetX, targetY);
                if (alternativePath.success) {
                    follower.x = alternativePath.x;
                    follower.y = alternativePath.y;
                    }
                }
            }
            
            follower.isWalking = true;
            follower.direction = this.getDirectionFromDelta(directionX, directionY);
        }
    } else {
        follower.isWalking = false;
    }
    
    this.updateFollowerAnimation(follower, personality);
    
    follower.x = Math.max(50, Math.min(this.mapConfig.width - 50, follower.x));
    follower.y = Math.max(50, Math.min(this.mapConfig.height - 50, follower.y));
};

GameEngine.prototype.getCharacterPersonality = function(character) {
    var characterId = character.id || 2;
    var seed = characterId * 12345;
    var random = this.seededRandom(seed);
    
    return {
        followDistance: 35 + (random() * 20 - 10),
        moveSpeed: 0.8 + (random() * 0.4),
        followAggressiveness: 0.7 + (random() * 0.6),
        randomness: random() * 0.3,
        reactionDelay: random() * 200,
        personalityType: this.getPersonalityType(characterId)
    };
};

GameEngine.prototype.calculateFollowerOffset = function(follower, personality) {
    var index = this.followers.indexOf(follower);
    var totalFollowers = this.followers.length;
    var baseAngle = (index / totalFollowers) * Math.PI * 2;
    var radius = personality.followDistance;
    
    switch (personality.personalityType) {
        case 'leader': return { x: -15, y: 0 };
        case 'supporter': return { x: index % 2 === 0 ? 25 : -25, y: (index % 2 === 0 ? 1 : -1) * 20 };
        case 'scout': return { x: 20, y: -15 };
        case 'guardian':
            var angle = baseAngle + (index * 0.3);
            return { x: Math.cos(angle) * radius * 0.8, y: Math.sin(angle) * radius * 0.8 };
        case 'independent':
            var angle = baseAngle + (index * 0.5);
            return { x: Math.cos(angle) * (radius + 10), y: Math.sin(angle) * (radius + 10) };
        default:
            var angle = baseAngle + (index * 0.2);
            return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    }
};

GameEngine.prototype.getPersonalityType = function(characterId) {
    var types = ['leader', 'supporter', 'scout', 'guardian', 'independent'];
    return types[characterId % types.length];
};

GameEngine.prototype.updateFollowerAnimation = function(follower, personality) {
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

GameEngine.prototype.getDirectionFromDelta = function(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
    } else {
        return deltaY > 0 ? 'down' : 'up';
    }
};

GameEngine.prototype.seededRandom = function(seed) {
    var m = 0x80000000;
    var a = 1103515245;
    var c = 12345;
    var state = seed ? seed : Math.floor(Math.random() * (m - 1));
    
    return function() {
        state = (a * state + c) % m;
        return (state & (m - 1)) / (m - 1);
    };
};

GameEngine.prototype.canTeamMoveInSubmap = function(deltaX, deltaY) {
    var submapBounds = { minX: 60, maxX: 340, minY: 110, maxY: 290 };
    
    var playerNewX = this.player.x + deltaX;
    var playerNewY = this.player.y + deltaY;
    if (playerNewX < submapBounds.minX || playerNewX > submapBounds.maxX ||
        playerNewY < submapBounds.minY || playerNewY > submapBounds.maxY) {
        return false;
    }
    
    for (var i = 0; i < this.followers.length; i++) {
        var follower = this.followers[i];
        var followerNewX = follower.x + deltaX;
        var followerNewY = follower.y + deltaY;
        
        if (followerNewX < submapBounds.minX || followerNewX > submapBounds.maxX ||
            followerNewY < submapBounds.minY || followerNewY > submapBounds.maxY) {
            return false;
        }
    }
    
    return true;
};

GameEngine.prototype.findAlternativePathForFollower = function(follower, targetX, targetY) {
    var searchRadius = 40;
    var stepSize = 8;
    var directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
    ];
    
    for (var radius = stepSize; radius <= searchRadius; radius += stepSize) {
        for (var i = 0; i < directions.length; i++) {
            var dir = directions[i];
            var testX = follower.x + dir.dx * radius;
            var testY = follower.y + dir.dy * radius;
            
            if (this.canMoveToPosition(testX, testY, 15)) {
                var currentDistance = Math.sqrt(
                    Math.pow(follower.x - targetX, 2) + 
                    Math.pow(follower.y - targetY, 2)
                );
                var testDistance = Math.sqrt(
                    Math.pow(testX - targetX, 2) + 
                    Math.pow(testY - targetY, 2)
                );
                
                if (testDistance < currentDistance) {
                    return { success: true, x: testX, y: testY };
                }
            }
        }
    }
    
    return { success: false };
};

GameEngine.prototype.updateNPCIdleBehavior = function(npc, deltaTime) {
    if (!npc.behaviorTimer) npc.behaviorTimer = 0;
    npc.behaviorTimer -= deltaTime || 16;
    
    if (npc.behaviorTimer <= 0) {
        npc.currentBehavior = this.selectNPCBehavior(npc);
        npc.behaviorTimer = 1000 + Math.random() * 2000;
    }
    
    this.executeNPCBehavior(npc);
};

GameEngine.prototype.selectNPCBehavior = function(npc) {
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

GameEngine.prototype.executeNPCBehavior = function(npc) {
    switch (npc.currentBehavior) {
        case 'wander': this.executeWanderBehavior(npc); break;
        case 'look_around': this.executeLookAroundBehavior(npc); break;
        case 'stretch': this.executeStretchBehavior(npc); break;
        case 'check_equipment': this.executeCheckEquipmentBehavior(npc); break;
        default: break;
    }
};

GameEngine.prototype.executeWanderBehavior = function(npc) {
    if (!npc.wanderTarget) {
        var wanderRadius = 50 + Math.random() * 100;
        var angle = Math.random() * Math.PI * 2;
        npc.wanderTarget = {
            x: npc.x + Math.cos(angle) * wanderRadius,
            y: npc.y + Math.sin(angle) * wanderRadius
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

GameEngine.prototype.executeLookAroundBehavior = function(npc) {
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

GameEngine.prototype.executeStretchBehavior = function(npc) {
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

GameEngine.prototype.executeCheckEquipmentBehavior = function(npc) {
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
    
    if (!this.teamCombatTimer) this.teamCombatTimer = 0;
    this.teamCombatTimer += deltaTime;
    
    if (this.teamCombatTimer >= 500) {
        this.teamCombatTimer = 0;
        this.updateTeamCombat(currentTime);
    }
};

GameEngine.prototype.updateTeamCombat = function(currentTime) {
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
        
        if (!follower.isDead && !follower.isZombie &&
            currentTime - follower.lastAttackTime >= follower.attackCooldown) {
            
            var nearbyZombies = this.zombieManager.getZombiesInRange(
                follower.x, follower.y, follower.attackRange
            );
            
            if (nearbyZombies.length > 0) {
                var targetZombie = nearbyZombies[0].zombie;
                this.attackZombie(follower, targetZombie);
                follower.lastAttackTime = currentTime;
            }
        }
    }
};

GameEngine.prototype.attackZombie = function(attacker, zombie) {
    var damage = attacker.attack + Math.floor(Math.random() * 5);
    var isDead = zombie.takeDamage(damage);
    
    console.log('[Combat]', attacker === this.player ? '玩家' : '团队成员', '攻击僵尸，造成', damage, '点伤害');
    
    if (isDead) {
        console.log('[Combat] 僵尸被击败');
    }
};

GameEngine.prototype.updateTeamHealth = function(deltaTime) {
    if (this.player.health <= 0 && !this.player.isDead) {
        this.player.isDead = true;
        console.log('[Health] 玩家死亡');
        this.gameOver('death');
        return;
    }
    
    for (var i = this.followers.length - 1; i >= 0; i--) {
        var follower = this.followers[i];
        
        if (follower.health <= 0 && !follower.isDead) {
            console.log('[Health] 团队成员死亡，转化为僵尸:', follower.characterId);
            this.convertToZombie(follower, i);
        }
    }
};

GameEngine.prototype.convertToZombie = function(follower, index) {
    var newZombie = this.zombieManager.createZombie('thin', follower.x, follower.y);
    if (newZombie) {
        newZombie.isConverted = true;
        newZombie.originalName = follower.character ? follower.character.name : '团队成员';
        console.log('[Conversion] 团队成员', newZombie.originalName, '已转化为僵尸');
    }
    
    this.followers.splice(index, 1);
    this.gameData.teamSize = this.followers.length + 1;
};

// ========================================
// 僵尸生成系统 (Zombie Spawning System)
// ========================================

GameEngine.prototype.initializeZombies = function() {
    console.log('[Zombie] 开始初始化僵尸分布');
    this.spawnZombiesByDay();
    console.log('[Zombie] 初始僵尸分布完成');
};

GameEngine.prototype.spawnZombiesByDay = function() {
    var currentDay = this.gameData.survivalDays;
    var baseCount = 10;
    var perDayIncrease = 3;
    var maxZombies = 50;
    var zombieCount = Math.min(maxZombies, baseCount + (currentDay - 1) * perDayIncrease);
    
    console.log('[Zombie] 第', currentDay, '天，生成', zombieCount, '只僵尸');
    
    var playerX = this.player.x;
    var playerY = this.player.y;
    var spawnRadius = 2000;
    var minDistance = 300;
    
    var created = 0;
    var maxAttempts = zombieCount * 10;
    var attempts = 0;
    
    while (created < zombieCount && attempts < maxAttempts) {
        attempts++;
        
        var angle = Math.random() * Math.PI * 2;
        var distance = minDistance + Math.random() * (spawnRadius - minDistance);
        
        var x = playerX + Math.cos(angle) * distance;
        var y = playerY + Math.sin(angle) * distance;
        
        x = Math.max(100, Math.min(this.mapConfig.width - 100, x));
        y = Math.max(100, Math.min(this.mapConfig.height - 100, y));
        
        if (this.canMoveToPosition(x, y, 20)) {
            var zombieType = this.getRandomZombieType(currentDay);
            var zombie = this.zombieManager.createZombie(zombieType, x, y);
            if (zombie) {
                created++;
                console.log('[Zombie] 创建僵尸', created + '/' + zombieCount, ':', zombieType, '位置:', x.toFixed(0), y.toFixed(0));
            }
        }
    }
    
    if (created < zombieCount) {
        console.warn('[Zombie] 只成功创建了', created, '只僵尸，目标是', zombieCount, '只');
    } else {
        console.log('[Zombie] 成功创建所有', created, '只僵尸');
    }
};

GameEngine.prototype.getRandomZombieType = function(day) {
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

GameEngine.prototype.spawnNewDayZombies = function() {
    var currentDay = this.gameData.survivalDays;
    var newZombieCount = 5;
    
    if (currentDay >= 5 && currentDay % 5 === 0) {
        newZombieCount = 10;
        console.log('[Zombie] 第', currentDay, '天！大波僵尸来袭！');
    }
    
    var playerX = this.player.x;
    var playerY = this.player.y;
    var spawnRadius = 2000;
    var minDistance = 400;
    
    var created = 0;
    var maxAttempts = newZombieCount * 15;
    var attempts = 0;
    
    console.log('[Zombie] 第', currentDay, '天开始，生成', newZombieCount, '只新僵尸');
    
    while (created < newZombieCount && attempts < maxAttempts) {
        attempts++;
        
        var angle = Math.random() * Math.PI * 2;
        var distance = minDistance + Math.random() * (spawnRadius - minDistance);
        
        var x = playerX + Math.cos(angle) * distance;
        var y = playerY + Math.sin(angle) * distance;
        
        x = Math.max(100, Math.min(this.mapConfig.width - 100, x));
        y = Math.max(100, Math.min(this.mapConfig.height - 100, y));
        
        if (this.canMoveToPosition(x, y, 20)) {
            var zombieType = this.getRandomZombieType(currentDay);
            var zombie = this.zombieManager.createZombie(zombieType, x, y);
            if (zombie) {
                created++;
                console.log('[Zombie] 新一天生成僵尸', created + '/' + newZombieCount, ':', zombieType);
            }
        }
    }
    
    console.log('[Zombie] 新一天成功生成', created, '只僵尸，当前总数:', this.zombieManager.zombies.length);
};

// ========================================
// 子地图和资源系统 (SubMap & Resource System)
// ========================================

GameEngine.prototype.generateSubMapContent = function() {
    this.zombies = [];
    this.resources = [];
    
    this.generateZombies();
    this.generateResources();
    
    console.log('[GameEngine] 子地图内容生成完成: ' + this.zombies.length + '只僵尸, ' + this.resources.length + '个资源');
};

GameEngine.prototype.generateZombies = function() {
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
    
    console.log('[SubMap] 建筑类型:', buildingType, '生成僵尸数量:', count);
    
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

GameEngine.prototype.getResourceType = function() {
    switch (this.subMapType) {
        case 'police_station': return 'companion_police';
        case 'hospital': return 'companion_nurse';
        case 'restaurant': return 'companion_chef';
        case 'shop': return Math.random() < 0.5 ? 'weapon' : 'weapon';
        case 'school':
        case 'house':
        case 'villa': return 'food';
        default: return 'food';
    }
};

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

GameEngine.prototype.getFoodAmount = function() {
    switch (this.subMapType) {
        case 'school': return 3 + Math.floor(Math.random() * 3);
        case 'house': return 2 + Math.floor(Math.random() * 2);
        case 'villa': return 4 + Math.floor(Math.random() * 3);
        default: return 2 + Math.floor(Math.random() * 3);
    }
};

GameEngine.prototype.collectResource = function(resource) {
    if (resource.collected) return;
    
    resource.collected = true;
    
    switch (resource.type) {
        case 'companion_police':
        case 'companion_nurse':
        case 'companion_chef':
            if (this.companions.length < 7) {
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

GameEngine.prototype.updateZombies = function(deltaTime) {
    var self = this;
    
    this.zombies.forEach(function(zombie) {
        var dx = self.player.x - zombie.x;
        var dy = self.player.y - zombie.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100 && distance > 30) {
            var moveDistance = zombie.moveSpeed * (deltaTime / 1000);
            zombie.x += (dx / distance) * moveDistance;
            zombie.y += (dy / distance) * moveDistance;
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
    
    this.zombies = this.zombies.filter(function(zombie) {
        return zombie.health > 0;
    });
};

// ========================================
// 渲染系统 (Rendering System)
// ========================================

GameEngine.prototype.render = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    switch (this.gameState) {
        case 'menu': this.renderMenu(); break;
        case 'playing': this.renderGame(); break;
        case 'submap': this.renderSubMap(); break;
        case 'gameover': this.renderGameOver(); break;
        case 'victory': this.renderVictory(); break;
    }
    
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        this.renderJoystick();
    }
    
    if (this.showFPS) {
        this.renderFPS();
    }
};

// 菜单渲染
GameEngine.prototype.renderMenu = function() {
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

GameEngine.prototype.renderBackgroundGrid = function() {
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

GameEngine.prototype.renderDecorations = function() {
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

GameEngine.prototype.renderGameFeatures = function(centerX) {
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

GameEngine.prototype.renderStartButton = function(centerX) {
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

GameEngine.prototype.renderFooterInfo = function(centerX) {
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
GameEngine.prototype.renderGame = function() {
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

GameEngine.prototype.renderMapBackground = function() {
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(0, 0, this.mapConfig.width, this.mapConfig.height);
};

GameEngine.prototype.renderStreetGrid = function() {
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
            this.ctx.fillRect(x, Math.max(0, this.camera.y), streetWidth, 
                Math.min(viewHeight, this.mapConfig.height - this.camera.y));
        }
    }
    
    for (var y = startY; y <= endY; y += blockSize) {
        if (y >= 0 && y <= this.mapConfig.height) {
            this.ctx.fillRect(Math.max(0, this.camera.x), y, 
                Math.min(viewWidth, this.mapConfig.width - this.camera.x), streetWidth);
        }
    }
    
    this.renderStreetLines();
};

GameEngine.prototype.renderStreetLines = function() {
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

GameEngine.prototype.renderPlayer = function() {
    this.characterManager.renderCurrentCharacter(this.ctx, this.player.x, this.player.y, this.player);
    this.renderCharacterHealthBar(this.player, this.player.x, this.player.y);
};

GameEngine.prototype.renderCharacterHealthBar = function(character, x, y) {
    if (character.health <= 0 || character.isDead) return;
    
    var healthPercentage = character.health / character.maxHealth;
    var barWidth = 30;
    var barHeight = 4;
    var barY = y - 45;
    
    this.ctx.save();
    
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);
    
    if (healthPercentage > 0.6) {
        this.ctx.fillStyle = '#4CAF50';
    } else if (healthPercentage > 0.3) {
        this.ctx.fillStyle = '#FF9800';
    } else {
        this.ctx.fillStyle = '#F44336';
    }
    
    this.ctx.fillRect(x - barWidth/2, barY, barWidth * healthPercentage, barHeight);
    
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - barWidth/2, barY, barWidth, barHeight);
    
    if (character === this.player) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(character.health + '/' + character.maxHealth, x, barY - 2);
    }
    
    this.ctx.restore();
};

GameEngine.prototype.renderStatusBar = function() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, 60);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('第 ' + this.gameData.survivalDays + ' 天', 10, 25);
    this.ctx.fillText('🍞 ' + this.gameData.food, 10, 45);
    this.ctx.fillText('👥 ' + this.gameData.teamSize, 120, 25);
};

GameEngine.prototype.renderTimeInfo = function() {
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
GameEngine.prototype.renderNPCs = function() {
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;
    
    for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];
        
        if (npc.x >= viewLeft - 50 && npc.x <= viewRight + 50 &&
            npc.y >= viewTop - 50 && npc.y <= viewBottom + 50) {
            this.renderSingleNPC(npc);
        }
    }
};

GameEngine.prototype.renderSingleNPC = function(npc) {
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

GameEngine.prototype.renderDefaultNPC = function(npc) {
    this.ctx.save();
    
    this.ctx.fillStyle = '#3498db';
    this.ctx.fillRect(npc.x - 8, npc.y - 8, 16, 16);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(npc.characterId.toString(), npc.x, npc.y + 3);
    
    this.ctx.restore();
};

GameEngine.prototype.renderFollowers = function() {
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

GameEngine.prototype.renderSingleFollower = function(follower, index) {
    var character = follower.character || this.characterManager.characters[2];
    var personality = follower.personality || this.getCharacterPersonality(character);
    
    this.ctx.save();
    this.applyFollowerPersonalityEffects(follower, personality);
    this.renderFollowerCharacter(follower, character);
    this.renderPersonalityIndicator(follower, personality, index);
    this.ctx.restore();
};

GameEngine.prototype.renderFollowerCharacter = function(follower, character) {
    this.renderDefaultFollower(follower);
    
    if (follower.health > 0 && !follower.isDead) {
        this.renderCharacterHealthBar(follower, follower.x, follower.y);
    }
};

GameEngine.prototype.renderDefaultFollower = function(follower) {
    this.ctx.save();
    
    var personality = follower.personality;
    var baseColor = '#3498db';
    
    if (personality) {
        switch (personality.personalityType) {
            case 'leader': baseColor = '#f1c40f'; break;
            case 'supporter': baseColor = '#e74c3c'; break;
            case 'scout': baseColor = '#3498db'; break;
            case 'guardian': baseColor = '#27ae60'; break;
            case 'independent': baseColor = '#9b59b6'; break;
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

GameEngine.prototype.applyFollowerPersonalityEffects = function(follower, personality) {
    switch (personality.personalityType) {
        case 'leader': this.ctx.globalAlpha = 0.9; break;
        case 'supporter': this.ctx.globalAlpha = 0.9; break;
        case 'scout': this.ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.01) * 0.2; break;
        case 'guardian': this.ctx.globalAlpha = 0.95; break;
        case 'independent': this.ctx.globalAlpha = 0.7; break;
        default: this.ctx.globalAlpha = 1.0; break;
    }
};

GameEngine.prototype.renderPersonalityIndicator = function(follower, personality, index) {
    var indicatorY = follower.y - 25;
    
    switch (personality.personalityType) {
        case 'leader': this.renderStarIndicator(follower.x, indicatorY, '#f1c40f'); break;
        case 'supporter': this.renderHeartIndicator(follower.x, indicatorY, '#e74c3c'); break;
        case 'scout': this.renderEyeIndicator(follower.x, indicatorY, '#3498db'); break;
        case 'guardian': this.renderShieldIndicator(follower.x, indicatorY, '#27ae60'); break;
        case 'independent': this.renderArrowIndicator(follower.x, indicatorY, '#9b59b6'); break;
    }
    
    if (follower.followStartTime) {
        var followDuration = Math.floor((Date.now() - follower.followStartTime) / 1000);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(followDuration + 's', follower.x, indicatorY - 10);
    }
};

GameEngine.prototype.renderStarIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('★', x, y);
};

GameEngine.prototype.renderHeartIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('♥', x, y);
};

GameEngine.prototype.renderEyeIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('👁', x, y);
};

GameEngine.prototype.renderShieldIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🛡', x, y);
};

GameEngine.prototype.renderArrowIndicator = function(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('→', x, y);
};

// 建筑渲染和其他渲染函数
GameEngine.prototype.renderVisibleBuildings = function() {
    var self = this;
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;
    
    this.buildings.forEach(function(building) {
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
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

GameEngine.prototype.lightenColor = function(color, amount) {
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

GameEngine.prototype.renderMiniMap = function() {
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
    this.buildings.forEach(function(building) {
        if (building.x >= worldLeft && building.x <= worldRight &&
            building.y >= worldTop && building.y <= worldBottom) {
            
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

GameEngine.prototype.renderJoystick = function() {
    var joystickRadius = 60;
    var knobRadius = 25;
    var joystickX = 100;
    var joystickY = this.canvas.height - 100;
    
    this.ctx.save();
    
    this.ctx.beginPath();
    this.ctx.arc(joystickX, joystickY, joystickRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 3;
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

GameEngine.prototype.renderBuildingEntryPrompt = function() {
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
    this.ctx.fillText('进入', centerX - buttonWidth - 20 + buttonWidth/2, buttonY + 25);
    
    var cancelButtonX = centerX + 20;
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.fillRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('取消', centerX + 20 + buttonWidth/2, buttonY + 25);
    
    this.ctx.restore();
};

GameEngine.prototype.renderSubMap = function() {
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
    var distanceToExit = Math.sqrt(
        Math.pow(this.player.x - exitX, 2) + 
        Math.pow(this.player.y - exitY, 2)
    );
    
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

GameEngine.prototype.renderNPCsInSubMap = function() {
            for (var i = 0; i < this.followers.length; i++) {
                var follower = this.followers[i];
        this.renderSingleNPC(follower);
    }
};

GameEngine.prototype.renderGameOver = function() {
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

GameEngine.prototype.renderVictory = function() {
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

GameEngine.prototype.renderFPS = function() {
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

GameEngine.prototype.switchCharacter = function(characterId) {
    if (this.characterManager.switchCharacter(characterId)) {
        console.log('[Game] 切换到角色: ' + characterId + ' - ' + this.characterManager.getCurrentCharacter().name);
        return true;
    }
    return false;
};

GameEngine.prototype.getCurrentCharacterInfo = function() {
    var character = this.characterManager.getCurrentCharacter();
    return {
        id: character.id,
        name: character.name,
        description: character.description
    };
};

GameEngine.prototype.getCharacterList = function() {
    var list = [];
    for (var id in this.characterManager.characters) {
        var character = this.characterManager.characters[id];
        list.push({
            id: parseInt(id),
            name: character.name,
            description: character.description
        });
    }
    return list.sort(function(a, b) { return a.id - b.id; });
};

// ========================================
// 游戏初始化和启动 (Game Initialization)
// ========================================

function initGame() {
    try {
        console.log('[Main] 开始初始化游戏...');
        
        // 检查抖音小程序环境
        if (typeof tt === 'undefined') {
            throw new Error('未检测到抖音小程序环境 (tt对象不存在)');
        }
        
        console.log('[Main] 抖音小程序环境检测成功');
        
        // 获取系统信息
        var systemInfo;
        try {
            systemInfo = tt.getSystemInfoSync();
            console.log('[Main] 系统信息获取成功:', {
                windowWidth: systemInfo.windowWidth,
                windowHeight: systemInfo.windowHeight,
                pixelRatio: systemInfo.pixelRatio,
                platform: systemInfo.platform,
                version: systemInfo.version
            });
        } catch (systemError) {
            console.error('[Main] 获取系统信息失败:', systemError);
            // 使用默认值
            systemInfo = {
                windowWidth: 375,
                windowHeight: 667,
                pixelRatio: 2,
                platform: 'unknown'
            };
            console.log('[Main] 使用默认系统信息:', systemInfo);
        }
        
        // 创建画布
        var canvas, ctx;
        try {
            canvas = tt.createCanvas();
            console.log('[Main] Canvas创建成功，类型:', typeof canvas);
            
            ctx = canvas.getContext('2d');
            console.log('[Main] 2D上下文获取成功，类型:', typeof ctx);
            
            // 设置画布尺寸
            canvas.width = systemInfo.windowWidth;
            canvas.height = systemInfo.windowHeight;
            
            console.log('[Main] 画布尺寸设置成功: ' + canvas.width + 'x' + canvas.height);
            
            // 验证画布功能
            if (!canvas.width || !canvas.height) {
                throw new Error('画布尺寸设置失败');
            }
            
            if (!ctx || typeof ctx.fillRect !== 'function') {
                throw new Error('2D上下文功能异常');
            }
            
            console.log('[Main] 画布功能验证通过');
            
        } catch (canvasError) {
            console.error('[Main] 画布创建失败:', canvasError);
            throw new Error('画布初始化失败: ' + canvasError.message);
        }
        
        // 创建游戏引擎前的额外兼容性检查
        console.log('[Main] 开始创建游戏引擎...');
        
        // 为抖音小程序Canvas添加兼容性方法
        if (!canvas.getBoundingClientRect) {
            console.log('[Main] 为Canvas添加getBoundingClientRect兼容性方法');
            canvas.getBoundingClientRect = function() {
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
        
        console.log('[Main] Canvas兼容性修复完成');
        
        var gameEngine = new GameEngine(canvas, ctx);
        
        console.log('[Main] 游戏引擎创建成功，开始启动...');
        gameEngine.start();
    
        // 添加调试功能
    setTimeout(function() {
        console.log('[Main] 团队跟随系统状态:', {
            followers: gameEngine.followers.length,
            npcs: gameEngine.npcs.length,
            personalities: gameEngine.followers.map(function(f) {
                return {
                    id: f.characterId,
                    type: f.personality ? f.personality.personalityType : 'unknown'
                };
            })
        });
        
            // 添加调试方法
            try {
        var globalObj = typeof global !== 'undefined' ? global : 
                       typeof window !== 'undefined' ? window : 
                       typeof this !== 'undefined' ? this : {};
        
                globalObj.game = gameEngine;
                globalObj.canvas = canvas;
                globalObj.ctx = ctx;
                
                // 调试功能
        gameEngine.debugFollowers = function() {
            console.log('[Debug] 当前跟随者状态:');
            console.log('  跟随者数量:', this.followers.length);
            console.log('  NPC数量:', this.npcs.length);
            console.log('  跟随者数组:', this.followers);
            console.log('  NPC数组:', this.npcs);
                };
                
    gameEngine.debugInfo = function() {
        console.log('[Debug] 游戏引擎状态:');
        console.log('  玩家位置:', this.player.x, this.player.y);
        console.log('  跟随者数量:', this.followers.length);
        console.log('  NPC数量:', this.npcs.length);
        console.log('  建筑数量:', this.buildings.length);
        console.log('  摄像机位置:', this.camera.x, this.camera.y);
        console.log('  摄像机缩放:', this.camera.zoom);
    };
    
    gameEngine.addTestFollower = function() {
        var testFollower = {
            id: 'test_follower_' + Date.now(),
            characterId: 999,
            x: this.player.x + 50,
            y: this.player.y + 50,
            isFollowing: true,
            personality: { personalityType: 'leader' },
            isWalking: false,
            walkAnimationFrame: 0,
            lastAnimationTime: 0,
            direction: 'down',
            character: this.characterManager.characters[2]
        };
        
        this.followers.push(testFollower);
        console.log('[Debug] 测试跟随者添加成功，当前跟随者数量:', this.followers.length);
        return testFollower;
    };
    
    gameEngine.spawnZombie = function(type, x, y) {
        type = type || 'thin';
        x = x || this.player.x + 100;
        y = y || this.player.y + 100;
        
        var zombie = this.zombieManager.createZombie(type, x, y);
        if (zombie) {
            console.log('[Debug] 创建僵尸成功:', type, '位置:', x, y);
            console.log('[Debug] 当前僵尸数量:', this.zombieManager.zombies.length);
        }
        return zombie;
    };
    
    gameEngine.clearZombies = function() {
        this.zombieManager.zombies = [];
        console.log('[Debug] 已清除所有僵尸');
    };
    
    gameEngine.healPlayer = function(amount) {
        amount = amount || 20;
        this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
        console.log('[Debug] 玩家恢复', amount, '点血量，当前血量:', this.player.health);
    };
    
                console.log('[Main] 调试功能已加载');
                
            } catch (error) {
                console.warn('[Main] 调试功能加载失败:', error);
            }
    }, 2000);
    
    console.log('[Main] 游戏启动成功！');
        return gameEngine;
        
    } catch (error) {
        console.error('[Main] 游戏初始化失败:', error);
        
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

// ========================================
// 游戏启动 (Game Launch)
// ========================================

console.log('[Main] 准备启动末日Q行游戏...');
try {
    initGame();
    console.log('[Main] 游戏启动完成！');
} catch (error) {
    console.error('[Main] 游戏启动失败:', error);
}
