/**
 * 角色基类
 * 定义角色的基本属性和行为
 */
class Character {
    constructor(config) {
        this.id = config.id || Math.random().toString(36).substr(2, 9);
        this.name = config.name || '未命名';
        this.type = config.type || 'civilian';
        
        // 基础属性
        this.level = config.level || 1;
        this.maxHealth = config.maxHealth || 20;
        this.health = config.health || this.maxHealth;
        this.attack = config.attack || 5;
        this.moveSpeed = config.moveSpeed || 3;
        
        // 位置和移动
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.targetX = this.x;
        this.targetY = this.y;
        this.isMoving = false;
        
        // 战斗状态
        this.isInCombat = false;
        this.target = null;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1秒攻击冷却
        
        // 特殊技能
        this.skills = config.skills || [];
        this.lastSkillTime = new Map();
        
        console.log(`[Character] 角色创建: ${this.name} (${this.type})`);
    }
    
    /**
     * 更新角色状态
     */
    update(deltaTime) {
        this.updateMovement(deltaTime);
        this.updateCombat(deltaTime);
        this.updateSkills(deltaTime);
    }
    
    /**
     * 更新移动
     */
    updateMovement(deltaTime) {
        if (!this.isMoving) return;
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
            return;
        }
        
        const moveDistance = this.moveSpeed * (deltaTime / 1000);
        const moveX = (dx / distance) * moveDistance;
        const moveY = (dy / distance) * moveDistance;
        
        this.x += moveX;
        this.y += moveY;
    }
    
    /**
     * 更新战斗
     */
    updateCombat(deltaTime) {
        if (!this.isInCombat || !this.target) return;
        
        const distance = this.getDistanceTo(this.target);
        
        // 如果目标太远，停止战斗
        if (distance > 100) {
            this.stopCombat();
            return;
        }
        
        // 如果在攻击范围内且冷却结束，进行攻击
        if (distance <= 30 && Date.now() - this.lastAttackTime >= this.attackCooldown) {
            this.performAttack();
        }
    }
    
    /**
     * 更新技能
     */
    updateSkills(deltaTime) {
        this.skills.forEach(skill => {
            if (skill.type === 'passive' && skill.autoTrigger) {
                skill.update(deltaTime, this);
            }
        });
    }
    
    /**
     * 移动到指定位置
     */
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
    }
    
    /**
     * 立即设置位置
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
    }
    
    /**
     * 开始战斗
     */
    startCombat(target) {
        this.isInCombat = true;
        this.target = target;
        console.log(`[Character] ${this.name} 开始战斗对战 ${target.name || 'Unknown'}`);
    }
    
    /**
     * 停止战斗
     */
    stopCombat() {
        this.isInCombat = false;
        this.target = null;
        console.log(`[Character] ${this.name} 停止战斗`);
    }
    
    /**
     * 执行攻击
     */
    performAttack() {
        if (!this.target) return;
        
        const damage = this.calculateDamage();
        this.target.takeDamage(damage, this);
        this.lastAttackTime = Date.now();
        
        console.log(`[Character] ${this.name} 攻击 ${this.target.name || 'Unknown'}，造成 ${damage} 伤害`);
        
        // 发射攻击事件
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('character_attack', {
            attacker: this,
            target: this.target,
            damage: damage
        });
    }
    
    /**
     * 计算伤害
     */
    calculateDamage() {
        const baseDamage = this.attack;
        const randomFactor = 0.8 + Math.random() * 0.4; // 80%-120%
        return Math.floor(baseDamage * randomFactor);
    }
    
    /**
     * 受到伤害
     */
    takeDamage(damage, attacker) {
        this.health -= damage;
        
        if (this.health <= 0) {
            this.health = 0;
            this.onDeath(attacker);
        }
        
        console.log(`[Character] ${this.name} 受到 ${damage} 伤害，剩余血量: ${this.health}`);
    }
    
    /**
     * 治疗
     */
    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.health + amount, this.maxHealth);
        const actualHeal = this.health - oldHealth;
        
        if (actualHeal > 0) {
            console.log(`[Character] ${this.name} 恢复 ${actualHeal} 血量`);
        }
        
        return actualHeal;
    }
    
    /**
     * 升级
     */
    levelUp() {
        this.level++;
        
        // 基础属性提升
        this.maxHealth += 10;
        this.health += 10;
        this.attack += 5;
        
        console.log(`[Character] ${this.name} 升级到 ${this.level} 级！`);
        
        // 发射升级事件
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('character_level_up', this);
    }
    
    /**
     * 学习技能
     */
    learnSkill(skill) {
        this.skills.push(skill);
        console.log(`[Character] ${this.name} 学会了技能: ${skill.name}`);
    }
    
    /**
     * 使用技能
     */
    useSkill(skillName, target = null) {
        const skill = this.skills.find(s => s.name === skillName);
        if (!skill) return false;
        
        const lastUseTime = this.lastSkillTime.get(skillName) || 0;
        const currentTime = Date.now();
        
        if (currentTime - lastUseTime < skill.cooldown) {
            console.log(`[Character] ${this.name} 技能 ${skillName} 冷却中`);
            return false;
        }
        
        const success = skill.use(this, target);
        if (success) {
            this.lastSkillTime.set(skillName, currentTime);
            console.log(`[Character] ${this.name} 使用技能: ${skillName}`);
        }
        
        return success;
    }
    
    /**
     * 死亡处理
     */
    onDeath(killer) {
        console.log(`[Character] ${this.name} 死亡`);
        
        // 发射死亡事件
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('character_death', {
            character: this,
            killer: killer
        });
    }
    
    /**
     * 获取到另一个角色的距离
     */
    getDistanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 渲染角色
     */
    render(ctx) {
        // 角色主体（简单的圆形）
        ctx.fillStyle = this.getCharacterColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 角色边框
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 血条
        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }
        
        // 名字标签
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - 20);
        ctx.textAlign = 'left';
    }
    
    /**
     * 渲染血条
     */
    renderHealthBar(ctx) {
        const barWidth = 20;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        // 血条背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x - barWidth / 2, this.y - 18, barWidth, barHeight);
        
        // 血条
        ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : '#e74c3c';
        ctx.fillRect(this.x - barWidth / 2, this.y - 18, barWidth * healthPercent, barHeight);
    }
    
    /**
     * 获取角色颜色
     */
    getCharacterColor() {
        switch (this.type) {
            case 'player': return '#3498db';
            case 'police': return '#2980b9';
            case 'nurse': return '#e74c3c';
            case 'chef': return '#f39c12';
            case 'doctor': return '#27ae60';
            case 'civilian': return '#95a5a6';
            default: return '#7f8c8d';
        }
    }
    
    /**
     * 检查是否存活
     */
    isAlive() {
        return this.health > 0;
    }
    
    /**
     * 获取角色状态
     */
    getStatus() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            level: this.level,
            health: this.health,
            maxHealth: this.maxHealth,
            attack: this.attack,
            moveSpeed: this.moveSpeed,
            position: { x: this.x, y: this.y },
            isInCombat: this.isInCombat
        };
    }
}

export default Character;
