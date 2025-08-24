/**
 * 战斗系统模块 (battle.js)
 * 
 * 功能描述：
 * - 战斗计算：伤害计算、命中判定、暴击系统
 * - 技能系统：技能释放、冷却管理、范围攻击
 * - 状态效果：中毒、减速、眩晕等各种Buff/Debuff
 * - 经验系统：经验获取、等级提升、属性成长
 * - 装备系统：武器、防具的属性加成
 * - 战斗AI：自动战斗、目标选择、战术决策
 * 
 * 主要类和方法：
 * - BattleSystem: 战斗系统主类
 * - DamageCalculator: 伤害计算器
 * - SkillManager: 技能管理器
 * - StatusEffectManager: 状态效果管理器
 * - ExperienceManager: 经验管理器
 */

/**
 * 战斗系统主类
 */
function BattleSystem() {
    this.damageCalculator = new DamageCalculator();
    this.skillManager = new SkillManager();
    this.statusEffectManager = new StatusEffectManager();
    this.experienceManager = new ExperienceManager();
    
    // 战斗统计
    this.battleStats = {
        totalDamageDealt: 0,
        totalDamageReceived: 0,
        enemiesKilled: 0,
        experienceGained: 0,
        battleTime: 0
    };
}

/**
 * 执行攻击
 * @param {Object} attacker - 攻击者
 * @param {Object} target - 目标
 * @param {Object} options - 攻击选项
 * @returns {Object} 攻击结果
 */
BattleSystem.prototype.executeAttack = function(attacker, target, options) {
    options = options || {};
    
    // 检查攻击是否有效
    if (!this.canAttack(attacker, target)) {
        return {success: false, reason: 'invalid_attack'};
    }
    
    // 计算伤害
    var damageResult = this.damageCalculator.calculateDamage(attacker, target, options);
    
    // 应用伤害
    var actualDamage = this.applyDamage(target, damageResult);
    
    // 更新统计
    this.updateBattleStats(attacker, target, actualDamage);
    
    // 检查目标是否死亡
    if (target.health <= 0) {
        this.handleTargetDeath(attacker, target);
    }
    
    // 触发战斗事件
    this.triggerBattleEvents(attacker, target, damageResult);
    
    return {
        success: true,
        damage: actualDamage,
        isCritical: damageResult.isCritical,
        targetDead: target.health <= 0
    };
};

/**
 * 检查是否可以攻击
 * @param {Object} attacker - 攻击者
 * @param {Object} target - 目标
 * @returns {boolean} 是否可以攻击
 */
BattleSystem.prototype.canAttack = function(attacker, target) {
    // 检查攻击者状态
    if (!attacker.isAlive || attacker.lastAttackTime > 0) {
        return false;
    }
    
    // 检查目标状态
    if (!target.isAlive) {
        return false;
    }
    
    // 检查距离
    var distance = getDistance(attacker, target);
    if (distance > attacker.attackRange) {
        return false;
    }
    
    // 检查状态效果
    if (this.statusEffectManager.hasEffect(attacker, 'stunned')) {
        return false;
    }
    
    return true;
};

/**
 * 应用伤害
 * @param {Object} target - 目标
 * @param {Object} damageResult - 伤害结果
 * @returns {number} 实际伤害
 */
BattleSystem.prototype.applyDamage = function(target, damageResult) {
    var actualDamage = Math.max(0, damageResult.finalDamage);
    
    target.health -= actualDamage;
    if (target.health < 0) {
        target.health = 0;
    }
    
    // 触发受伤事件
    if (target.onTakeDamage) {
        target.onTakeDamage(actualDamage, damageResult);
    }
    
    return actualDamage;
};

/**
 * 处理目标死亡
 * @param {Object} attacker - 攻击者
 * @param {Object} target - 目标
 */
BattleSystem.prototype.handleTargetDeath = function(attacker, target) {
    target.isAlive = false;
    target.state = 'dead';
    
    // 给予经验值
    if (target.experienceValue) {
        this.experienceManager.giveExperience(attacker, target.experienceValue);
    }
    
    // 更新击杀统计
    this.battleStats.enemiesKilled++;
    
    // 触发死亡事件
    if (target.onDeath) {
        target.onDeath(attacker);
    }
};

/**
 * 更新战斗统计
 * @param {Object} attacker - 攻击者
 * @param {Object} target - 目标
 * @param {number} damage - 伤害值
 */
BattleSystem.prototype.updateBattleStats = function(attacker, target, damage) {
    if (attacker.isPlayer || (attacker.followTarget && attacker.followTarget.isPlayer)) {
        this.battleStats.totalDamageDealt += damage;
    }
    
    if (target.isPlayer || (target.followTarget && target.followTarget.isPlayer)) {
        this.battleStats.totalDamageReceived += damage;
    }
};

/**
 * 触发战斗事件
 * @param {Object} attacker - 攻击者
 * @param {Object} target - 目标
 * @param {Object} damageResult - 伤害结果
 */
BattleSystem.prototype.triggerBattleEvents = function(attacker, target, damageResult) {
    // 暴击事件
    if (damageResult.isCritical) {
        this.onCriticalHit(attacker, target, damageResult);
    }
    
    // 连击事件
    if (damageResult.isCombo) {
        this.onComboHit(attacker, target, damageResult);
    }
};

/**
 * 暴击事件处理
 * @param {Object} attacker - 攻击者
 * @param {Object} target - 目标
 * @param {Object} damageResult - 伤害结果
 */
BattleSystem.prototype.onCriticalHit = function(attacker, target, damageResult) {
    // 暴击特效、音效等
    console.log('Critical Hit!', damageResult.finalDamage);
};

/**
 * 连击事件处理
 * @param {Object} attacker - 攻击者
 * @param {Object} target - 目标
 * @param {Object} damageResult - 伤害结果
 */
BattleSystem.prototype.onComboHit = function(attacker, target, damageResult) {
    // 连击特效、音效等
    console.log('Combo Hit!', damageResult.comboCount);
};

/**
 * 伤害计算器
 */
function DamageCalculator() {
    this.baseCriticalChance = 0.05; // 5%基础暴击率
    this.baseCriticalMultiplier = 2.0; // 2倍暴击伤害
    this.defenseReduction = 0.1; // 防御减伤系数
}

/**
 * 计算伤害
 * @param {Object} attacker - 攻击者
 * @param {Object} target - 目标
 * @param {Object} options - 计算选项
 * @returns {Object} 伤害结果
 */
DamageCalculator.prototype.calculateDamage = function(attacker, target, options) {
    options = options || {};
    
    // 基础伤害
    var baseDamage = attacker.attack || 0;
    
    // 武器伤害加成
    if (attacker.weapon) {
        baseDamage += attacker.weapon.damage || 0;
    }
    
    // 技能伤害加成
    if (options.skill) {
        baseDamage *= (options.skill.damageMultiplier || 1.0);
    }
    
    // 随机伤害浮动 (±10%)
    var damageVariation = 0.9 + Math.random() * 0.2;
    var damage = baseDamage * damageVariation;
    
    // 暴击判定
    var criticalChance = this.baseCriticalChance + (attacker.criticalChance || 0);
    var isCritical = Math.random() < criticalChance;
    
    if (isCritical) {
        var criticalMultiplier = this.baseCriticalMultiplier + (attacker.criticalMultiplier || 0);
        damage *= criticalMultiplier;
    }
    
    // 防御减伤
    var defense = target.defense || 0;
    var defenseReduction = defense * this.defenseReduction;
    damage = Math.max(1, damage - defenseReduction);
    
    // 状态效果影响
    damage = this.applyStatusEffects(attacker, target, damage);
    
    return {
        baseDamage: baseDamage,
        finalDamage: Math.floor(damage),
        isCritical: isCritical,
        defenseReduction: defenseReduction
    };
};

/**
 * 应用状态效果对伤害的影响
 * @param {Object} attacker - 攻击者
 * @param {Object} target - 目标
 * @param {number} damage - 基础伤害
 * @returns {number} 修正后的伤害
 */
DamageCalculator.prototype.applyStatusEffects = function(attacker, target, damage) {
    // 攻击者的增益效果
    if (attacker.statusEffects) {
        if (attacker.statusEffects.strengthened) {
            damage *= 1.5; // 力量增强，伤害+50%
        }
        if (attacker.statusEffects.weakened) {
            damage *= 0.7; // 虚弱状态，伤害-30%
        }
    }
    
    // 目标的防御效果
    if (target.statusEffects) {
        if (target.statusEffects.shielded) {
            damage *= 0.5; // 护盾状态，受伤-50%
        }
        if (target.statusEffects.vulnerable) {
            damage *= 1.3; // 易伤状态，受伤+30%
        }
    }
    
    return damage;
};

/**
 * 技能管理器
 */
function SkillManager() {
    this.skills = {};
    this.cooldowns = {};
}

/**
 * 注册技能
 * @param {string} skillId - 技能ID
 * @param {Object} skillData - 技能数据
 */
SkillManager.prototype.registerSkill = function(skillId, skillData) {
    this.skills[skillId] = skillData;
};

/**
 * 使用技能
 * @param {Object} caster - 施法者
 * @param {string} skillId - 技能ID
 * @param {Object} target - 目标
 * @returns {boolean} 是否成功使用
 */
SkillManager.prototype.useSkill = function(caster, skillId, target) {
    var skill = this.skills[skillId];
    if (!skill) return false;
    
    // 检查冷却时间
    var cooldownKey = caster.id + '_' + skillId;
    if (this.cooldowns[cooldownKey] > Date.now()) {
        return false;
    }
    
    // 检查资源消耗（法力值、体力等）
    if (!this.checkResourceCost(caster, skill)) {
        return false;
    }
    
    // 执行技能效果
    this.executeSkill(caster, skill, target);
    
    // 设置冷却时间
    this.cooldowns[cooldownKey] = Date.now() + skill.cooldown;
    
    // 消耗资源
    this.consumeResources(caster, skill);
    
    return true;
};

/**
 * 检查资源消耗
 * @param {Object} caster - 施法者
 * @param {Object} skill - 技能
 * @returns {boolean} 是否有足够资源
 */
SkillManager.prototype.checkResourceCost = function(caster, skill) {
    if (skill.manaCost && (caster.mana || 0) < skill.manaCost) {
        return false;
    }
    if (skill.staminaCost && (caster.stamina || 0) < skill.staminaCost) {
        return false;
    }
    return true;
};

/**
 * 消耗资源
 * @param {Object} caster - 施法者
 * @param {Object} skill - 技能
 */
SkillManager.prototype.consumeResources = function(caster, skill) {
    if (skill.manaCost) {
        caster.mana = (caster.mana || 0) - skill.manaCost;
    }
    if (skill.staminaCost) {
        caster.stamina = (caster.stamina || 0) - skill.staminaCost;
    }
};

/**
 * 执行技能效果
 * @param {Object} caster - 施法者
 * @param {Object} skill - 技能
 * @param {Object} target - 目标
 */
SkillManager.prototype.executeSkill = function(caster, skill, target) {
    switch (skill.type) {
        case 'damage':
            this.executeDamageSkill(caster, skill, target);
            break;
        case 'heal':
            this.executeHealSkill(caster, skill, target);
            break;
        case 'buff':
            this.executeBuffSkill(caster, skill, target);
            break;
        case 'debuff':
            this.executeDebuffSkill(caster, skill, target);
            break;
        case 'area':
            this.executeAreaSkill(caster, skill, target);
            break;
    }
};

/**
 * 执行伤害技能
 * @param {Object} caster - 施法者
 * @param {Object} skill - 技能
 * @param {Object} target - 目标
 */
SkillManager.prototype.executeDamageSkill = function(caster, skill, target) {
    // 使用战斗系统执行攻击，传入技能参数
    // 这里需要访问战斗系统实例
};

/**
 * 执行治疗技能
 * @param {Object} caster - 施法者
 * @param {Object} skill - 技能
 * @param {Object} target - 目标
 */
SkillManager.prototype.executeHealSkill = function(caster, skill, target) {
    var healAmount = skill.healAmount || 0;
    target.health = Math.min(target.maxHealth, target.health + healAmount);
};

/**
 * 执行增益技能
 * @param {Object} caster - 施法者
 * @param {Object} skill - 技能
 * @param {Object} target - 目标
 */
SkillManager.prototype.executeBuffSkill = function(caster, skill, target) {
    // 应用增益效果
    // 这里需要访问状态效果管理器
};

/**
 * 执行减益技能
 * @param {Object} caster - 施法者
 * @param {Object} skill - 技能
 * @param {Object} target - 目标
 */
SkillManager.prototype.executeDebuffSkill = function(caster, skill, target) {
    // 应用减益效果
    // 这里需要访问状态效果管理器
};

/**
 * 执行范围技能
 * @param {Object} caster - 施法者
 * @param {Object} skill - 技能
 * @param {Object} target - 目标位置
 */
SkillManager.prototype.executeAreaSkill = function(caster, skill, target) {
    // 获取范围内的所有目标
    var targetsInRange = getObjectsInRange(
        [], // 需要传入所有可能的目标
        target,
        skill.range || 100
    );
    
    // 对每个目标执行技能效果
    for (var i = 0; i < targetsInRange.length; i++) {
        this.executeSkill(caster, skill, targetsInRange[i]);
    }
};

/**
 * 状态效果管理器
 */
function StatusEffectManager() {
    this.activeEffects = {}; // 按对象ID存储状态效果
}

/**
 * 添加状态效果
 * @param {Object} target - 目标对象
 * @param {string} effectType - 效果类型
 * @param {number} duration - 持续时间（毫秒）
 * @param {Object} data - 效果数据
 */
StatusEffectManager.prototype.addEffect = function(target, effectType, duration, data) {
    if (!this.activeEffects[target.id]) {
        this.activeEffects[target.id] = {};
    }
    
    this.activeEffects[target.id][effectType] = {
        type: effectType,
        duration: duration,
        startTime: Date.now(),
        data: data || {}
    };
    
    // 应用效果
    this.applyEffect(target, effectType, data);
};

/**
 * 移除状态效果
 * @param {Object} target - 目标对象
 * @param {string} effectType - 效果类型
 */
StatusEffectManager.prototype.removeEffect = function(target, effectType) {
    if (this.activeEffects[target.id] && this.activeEffects[target.id][effectType]) {
        // 移除效果
        this.removeEffectFromTarget(target, effectType);
        delete this.activeEffects[target.id][effectType];
    }
};

/**
 * 检查是否有指定效果
 * @param {Object} target - 目标对象
 * @param {string} effectType - 效果类型
 * @returns {boolean} 是否有该效果
 */
StatusEffectManager.prototype.hasEffect = function(target, effectType) {
    return this.activeEffects[target.id] && 
           this.activeEffects[target.id][effectType] !== undefined;
};

/**
 * 更新状态效果
 * @param {number} deltaTime - 帧间隔时间
 */
StatusEffectManager.prototype.update = function(deltaTime) {
    var currentTime = Date.now();
    
    for (var targetId in this.activeEffects) {
        var effects = this.activeEffects[targetId];
        
        for (var effectType in effects) {
            var effect = effects[effectType];
            
            // 检查是否过期
            if (currentTime - effect.startTime >= effect.duration) {
                // 找到目标对象并移除效果
                // 这里需要一个方法来根据ID找到对象
                delete effects[effectType];
            }
        }
        
        // 如果该目标没有任何效果，删除整个条目
        if (Object.keys(effects).length === 0) {
            delete this.activeEffects[targetId];
        }
    }
};

/**
 * 应用效果到目标
 * @param {Object} target - 目标对象
 * @param {string} effectType - 效果类型
 * @param {Object} data - 效果数据
 */
StatusEffectManager.prototype.applyEffect = function(target, effectType, data) {
    if (!target.statusEffects) {
        target.statusEffects = {};
    }
    
    target.statusEffects[effectType] = data;
    
    // 根据效果类型应用特殊逻辑
    switch (effectType) {
        case 'poison':
            // 中毒效果会在更新时持续造成伤害
            break;
        case 'slow':
            // 减速效果
            target.moveSpeed *= (data.speedMultiplier || 0.5);
            break;
        case 'stun':
            // 眩晕效果
            target.canMove = false;
            target.canAttack = false;
            break;
    }
};

/**
 * 从目标移除效果
 * @param {Object} target - 目标对象
 * @param {string} effectType - 效果类型
 */
StatusEffectManager.prototype.removeEffectFromTarget = function(target, effectType) {
    if (target.statusEffects) {
        delete target.statusEffects[effectType];
    }
    
    // 根据效果类型移除特殊逻辑
    switch (effectType) {
        case 'slow':
            // 恢复移动速度
            target.moveSpeed = target.baseMoveSpeed || target.moveSpeed / 0.5;
            break;
        case 'stun':
            // 恢复行动能力
            target.canMove = true;
            target.canAttack = true;
            break;
    }
};

/**
 * 经验管理器
 */
function ExperienceManager() {
    this.experienceTable = this.generateExperienceTable();
}

/**
 * 生成经验表
 * @returns {Array} 经验表
 */
ExperienceManager.prototype.generateExperienceTable = function() {
    var table = [0]; // 1级需要0经验
    
    for (var level = 2; level <= 100; level++) {
        var expRequired = Math.floor(100 * Math.pow(level - 1, 1.5));
        table.push(table[table.length - 1] + expRequired);
    }
    
    return table;
};

/**
 * 给予经验值
 * @param {Object} character - 角色
 * @param {number} amount - 经验值
 */
ExperienceManager.prototype.giveExperience = function(character, amount) {
    if (!character.experience) {
        character.experience = 0;
        character.level = 1;
    }
    
    character.experience += amount;
    
    // 检查是否升级
    this.checkLevelUp(character);
};

/**
 * 检查升级
 * @param {Object} character - 角色
 */
ExperienceManager.prototype.checkLevelUp = function(character) {
    var currentLevel = character.level || 1;
    var newLevel = this.getLevel(character.experience);
    
    if (newLevel > currentLevel) {
        var levelsGained = newLevel - currentLevel;
        
        for (var i = 0; i < levelsGained; i++) {
            this.levelUp(character);
        }
    }
};

/**
 * 根据经验值获取等级
 * @param {number} experience - 经验值
 * @returns {number} 等级
 */
ExperienceManager.prototype.getLevel = function(experience) {
    for (var i = this.experienceTable.length - 1; i >= 0; i--) {
        if (experience >= this.experienceTable[i]) {
            return i + 1;
        }
    }
    return 1;
};

/**
 * 升级处理
 * @param {Object} character - 角色
 */
ExperienceManager.prototype.levelUp = function(character) {
    character.level++;
    
    // 属性提升
    var statGains = this.calculateStatGains(character);
    
    character.maxHealth += statGains.health;
    character.health = character.maxHealth; // 升级时回满血
    character.attack += statGains.attack;
    character.defense = (character.defense || 0) + statGains.defense;
    
    // 触发升级事件
    if (character.onLevelUp) {
        character.onLevelUp(character.level, statGains);
    }
    
    console.log(character.name + ' 升级到 ' + character.level + ' 级!');
};

/**
 * 计算升级属性增长
 * @param {Object} character - 角色
 * @returns {Object} 属性增长
 */
ExperienceManager.prototype.calculateStatGains = function(character) {
    var baseGains = {
        health: 10,
        attack: 2,
        defense: 1
    };
    
    // 根据角色类型调整增长
    if (character.type === 'warrior') {
        baseGains.health += 5;
        baseGains.attack += 1;
        baseGains.defense += 2;
    } else if (character.type === 'archer') {
        baseGains.health += 3;
        baseGains.attack += 3;
        baseGains.defense += 1;
    }
    
    return baseGains;
};

// 导出类（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BattleSystem,
        DamageCalculator,
        SkillManager,
        StatusEffectManager,
        ExperienceManager
    };
}
