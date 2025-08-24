/**
 * 人物模块 (character.js)
 * 
 * 功能描述：
 * - 基础人物类：生命值、攻击力、移动速度等基本属性
 * - 人物行为：移动、攻击、跟随、状态管理
 * - 人物管理器：团队管理、AI控制、碰撞检测
 * - 人物渲染：角色绘制、动画播放、状态显示
 * - 人物升级：属性提升、技能解锁、装备系统
 * 
 * 主要类和方法：
 * - BaseCharacter: 基础人物类
 * - CharacterManager: 人物管理器
 * - 移动控制：moveTowards, followPlayer
 * - 战斗系统：attack, takeDamage, checkAttackRange
 * - 状态管理：updateState, handleDeath
 */

/**
 * 基础人物类
 * @param {Object} config - 人物配置对象
 */
function BaseCharacter(config) {
    // 基础属性
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.name = config.name || '幸存者';
    this.type = config.type || 'survivor';
    
    // 位置和移动
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.targetX = this.x;
    this.targetY = this.y;
    this.moveSpeed = config.moveSpeed || GAME_CONFIG.PLAYER.MOVE_SPEED;
    this.radius = config.radius || GAME_CONFIG.PLAYER.CHARACTER_RADIUS;
    
    // 战斗属性
    this.maxHealth = config.health || GAME_CONFIG.PLAYER.BASE_HEALTH;
    this.health = this.maxHealth;
    this.attack = config.attack || GAME_CONFIG.PLAYER.BASE_ATTACK;
    this.attackRange = config.attackRange || GAME_CONFIG.PLAYER.ATTACK_RANGE;
    this.attackCooldown = config.attackCooldown || GAME_CONFIG.PLAYER.ATTACK_COOLDOWN;
    this.lastAttackTime = 0;
    
    // 状态
    this.isAlive = true;
    this.isPlayer = config.isPlayer || false;
    this.isSelected = false;
    this.state = 'idle'; // idle, moving, attacking, following, dead
    
    // 跟随系统
    this.followTarget = null;
    this.followDistance = config.followDistance || GAME_CONFIG.TEAM.FOLLOW_DISTANCE;
    
    // 渲染属性
    this.color = config.color || '#4CAF50';
    this.size = config.size || 16;
    
    // AI相关
    this.aiUpdateInterval = 100; // AI更新间隔（毫秒）
    this.lastAiUpdate = 0;
    this.currentTarget = null; // 当前攻击目标
}

/**
 * 人物更新逻辑
 * @param {number} deltaTime - 帧间隔时间
 */
BaseCharacter.prototype.update = function(deltaTime) {
    if (!this.isAlive) return;
    
    // 更新AI（非玩家角色）
    if (!this.isPlayer) {
        this.updateAI(deltaTime);
    }
    
    // 更新移动
    this.updateMovement(deltaTime);
    
    // 更新攻击冷却
    this.updateAttackCooldown(deltaTime);
    
    // 更新状态
    this.updateState(deltaTime);
};

/**
 * AI更新逻辑
 * @param {number} deltaTime - 帧间隔时间
 */
BaseCharacter.prototype.updateAI = function(deltaTime) {
    this.lastAiUpdate += deltaTime;
    if (this.lastAiUpdate < this.aiUpdateInterval) return;
    this.lastAiUpdate = 0;
    
    // 寻找最近的敌人
    var nearestEnemy = this.findNearestEnemy();
    
    if (nearestEnemy && this.getDistanceTo(nearestEnemy) <= this.attackRange) {
        // 在攻击范围内，进行攻击
        this.attack(nearestEnemy);
        this.state = 'attacking';
    } else if (this.followTarget) {
        // 跟随目标
        this.followPlayer();
        this.state = 'following';
    } else {
        // 空闲状态
        this.state = 'idle';
    }
};

/**
 * 移动更新
 * @param {number} deltaTime - 帧间隔时间
 */
BaseCharacter.prototype.updateMovement = function(deltaTime) {
    var dx = this.targetX - this.x;
    var dy = this.targetY - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
        var moveDistance = this.moveSpeed * (deltaTime / 16.67); // 标准化到60fps
        if (moveDistance > distance) {
            moveDistance = distance;
        }
        
        this.x += (dx / distance) * moveDistance;
        this.y += (dy / distance) * moveDistance;
        
        if (this.state === 'idle') {
            this.state = 'moving';
        }
    } else {
        if (this.state === 'moving') {
            this.state = 'idle';
        }
    }
};

/**
 * 攻击冷却更新
 * @param {number} deltaTime - 帧间隔时间
 */
BaseCharacter.prototype.updateAttackCooldown = function(deltaTime) {
    if (this.lastAttackTime > 0) {
        this.lastAttackTime -= deltaTime;
        if (this.lastAttackTime < 0) {
            this.lastAttackTime = 0;
        }
    }
};

/**
 * 状态更新
 * @param {number} deltaTime - 帧间隔时间
 */
BaseCharacter.prototype.updateState = function(deltaTime) {
    // 检查死亡
    if (this.health <= 0 && this.isAlive) {
        this.handleDeath();
    }
};

/**
 * 移动到指定位置
 * @param {number} x - 目标X坐标
 * @param {number} y - 目标Y坐标
 */
BaseCharacter.prototype.moveTowards = function(x, y) {
    this.targetX = x;
    this.targetY = y;
};

/**
 * 跟随玩家
 */
BaseCharacter.prototype.followPlayer = function() {
    if (!this.followTarget) return;
    
    var distance = this.getDistanceTo(this.followTarget);
    if (distance > this.followDistance) {
        // 计算跟随位置
        var angle = Math.atan2(this.y - this.followTarget.y, this.x - this.followTarget.x);
        var followX = this.followTarget.x + Math.cos(angle) * this.followDistance;
        var followY = this.followTarget.y + Math.sin(angle) * this.followDistance;
        
        this.moveTowards(followX, followY);
    }
};

/**
 * 攻击目标
 * @param {Object} target - 攻击目标
 */
BaseCharacter.prototype.attack = function(target) {
    if (this.lastAttackTime > 0) return false;
    if (!target || !target.isAlive) return false;
    
    var distance = this.getDistanceTo(target);
    if (distance > this.attackRange) return false;
    
    // 造成伤害
    target.takeDamage(this.attack);
    
    // 设置攻击冷却
    this.lastAttackTime = this.attackCooldown;
    
    return true;
};

/**
 * 受到伤害
 * @param {number} damage - 伤害值
 */
BaseCharacter.prototype.takeDamage = function(damage) {
    if (!this.isAlive) return;
    
    this.health -= damage;
    if (this.health < 0) {
        this.health = 0;
    }
};

/**
 * 治疗
 * @param {number} amount - 治疗量
 */
BaseCharacter.prototype.heal = function(amount) {
    if (!this.isAlive) return;
    
    this.health += amount;
    if (this.health > this.maxHealth) {
        this.health = this.maxHealth;
    }
};

/**
 * 处理死亡
 */
BaseCharacter.prototype.handleDeath = function() {
    this.isAlive = false;
    this.state = 'dead';
    // 死亡时的其他处理逻辑
};

/**
 * 获取到目标的距离
 * @param {Object} target - 目标对象
 * @returns {number} 距离
 */
BaseCharacter.prototype.getDistanceTo = function(target) {
    var dx = this.x - target.x;
    var dy = this.y - target.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 寻找最近的敌人
 * @returns {Object|null} 最近的敌人对象
 */
BaseCharacter.prototype.findNearestEnemy = function() {
    // 这里需要访问游戏引擎的僵尸管理器
    // 具体实现将在游戏引擎中提供敌人列表
    return null;
};

/**
 * 渲染人物
 * @param {Object} ctx - 2D渲染上下文
 */
BaseCharacter.prototype.render = function(ctx) {
    if (!this.isAlive) return;
    
    // 绘制人物圆形
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制生命值条
    this.renderHealthBar(ctx);
    
    // 绘制选中状态
    if (this.isSelected) {
        this.renderSelection(ctx);
    }
    
    ctx.restore();
};

/**
 * 渲染生命值条
 * @param {Object} ctx - 2D渲染上下文
 */
BaseCharacter.prototype.renderHealthBar = function(ctx) {
    var barWidth = 30;
    var barHeight = 4;
    var barX = this.x - barWidth / 2;
    var barY = this.y - this.size - 10;
    
    // 背景
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 生命值
    var healthPercent = this.health / this.maxHealth;
    var healthColor = healthPercent > 0.6 ? '#4CAF50' : healthPercent > 0.3 ? '#FFC107' : '#F44336';
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
};

/**
 * 渲染选中状态
 * @param {Object} ctx - 2D渲染上下文
 */
BaseCharacter.prototype.renderSelection = function(ctx) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
    ctx.stroke();
};

/**
 * 人物管理器
 */
function CharacterManager() {
    this.characters = [];
    this.player = null;
    this.selectedCharacters = [];
    this.maxTeamSize = GAME_CONFIG.TEAM.MAX_SIZE;
}

/**
 * 添加人物
 * @param {Object} character - 人物对象
 */
CharacterManager.prototype.addCharacter = function(character) {
    if (this.characters.length >= this.maxTeamSize && !character.isPlayer) {
        return false;
    }
    
    this.characters.push(character);
    
    if (character.isPlayer) {
        this.player = character;
    } else {
        // 设置跟随玩家
        character.followTarget = this.player;
    }
    
    return true;
};

/**
 * 移除人物
 * @param {string} characterId - 人物ID
 */
CharacterManager.prototype.removeCharacter = function(characterId) {
    for (var i = this.characters.length - 1; i >= 0; i--) {
        if (this.characters[i].id === characterId) {
            this.characters.splice(i, 1);
            break;
        }
    }
};

/**
 * 更新所有人物
 * @param {number} deltaTime - 帧间隔时间
 */
CharacterManager.prototype.update = function(deltaTime) {
    for (var i = this.characters.length - 1; i >= 0; i--) {
        var character = this.characters[i];
        character.update(deltaTime);
        
        // 移除死亡的角色
        if (!character.isAlive && !character.isPlayer) {
            this.characters.splice(i, 1);
        }
    }
};

/**
 * 渲染所有人物
 * @param {Object} ctx - 2D渲染上下文
 */
CharacterManager.prototype.render = function(ctx) {
    for (var i = 0; i < this.characters.length; i++) {
        this.characters[i].render(ctx);
    }
};

/**
 * 获取活着的人物数量
 * @returns {number} 活着的人物数量
 */
CharacterManager.prototype.getAliveCount = function() {
    var count = 0;
    for (var i = 0; i < this.characters.length; i++) {
        if (this.characters[i].isAlive) {
            count++;
        }
    }
    return count;
};

/**
 * 获取玩家角色
 * @returns {Object|null} 玩家角色对象
 */
CharacterManager.prototype.getPlayer = function() {
    return this.player;
};

/**
 * 选择人物
 * @param {number} x - 选择区域X坐标
 * @param {number} y - 选择区域Y坐标
 * @param {number} radius - 选择半径
 */
CharacterManager.prototype.selectCharacters = function(x, y, radius) {
    this.selectedCharacters = [];
    
    for (var i = 0; i < this.characters.length; i++) {
        var character = this.characters[i];
        var distance = character.getDistanceTo({x: x, y: y});
        
        if (distance <= radius) {
            character.isSelected = true;
            this.selectedCharacters.push(character);
        } else {
            character.isSelected = false;
        }
    }
};

/**
 * 命令选中的人物移动
 * @param {number} x - 目标X坐标
 * @param {number} y - 目标Y坐标
 */
CharacterManager.prototype.moveSelectedCharacters = function(x, y) {
    for (var i = 0; i < this.selectedCharacters.length; i++) {
        this.selectedCharacters[i].moveTowards(x, y);
    }
};

// 导出类（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseCharacter,
        CharacterManager
    };
}
