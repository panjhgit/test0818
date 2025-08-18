/**
 * 伙伴角色类
 * 不同类型的伙伴有不同的技能和属性
 */
import Character from './Character.js';

class Companion extends Character {
    constructor(config) {
        super(config);
        
        this.companionType = config.companionType || 'civilian';
        this.specialAbility = config.specialAbility || null;
        
        // 根据伙伴类型设置属性
        this.initializeByType();
        
        console.log(`[Companion] 伙伴创建: ${this.name} (${this.companionType})`);
    }
    
    /**
     * 根据类型初始化伙伴
     */
    initializeByType() {
        switch (this.companionType) {
            case 'police':
                this.initializePolice();
                break;
            case 'nurse':
                this.initializeNurse();
                break;
            case 'chef':
                this.initializeChef();
                break;
            case 'doctor':
                this.initializeDoctor();
                break;
            case 'civilian':
            default:
                this.initializeCivilian();
                break;
        }
    }
    
    /**
     * 初始化警察
     */
    initializePolice() {
        this.name = '警察';
        this.maxHealth = 20;
        this.health = this.maxHealth;
        this.attack = 20; // 基础+15%近战伤害
        this.moveSpeed = 3.2;
        
        this.weapon = {
            type: 'gun',
            name: '手枪',
            damage: 15,
            range: 80,
            unlimitedAmmo: true
        };
        
        console.log('[Companion] 警察初始化完成，装备手枪');
    }
    
    /**
     * 初始化护士
     */
    initializeNurse() {
        this.name = '护士';
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.attack = 5;
        this.moveSpeed = 2;
        
        // 群体回血技能
        this.learnSkill({
            name: 'group_heal',
            type: 'passive',
            description: '每10秒为团队成员恢复2点血量',
            cooldown: 10000,
            autoTrigger: true,
            lastTrigger: 0,
            update: (deltaTime, character) => {
                const currentTime = Date.now();
                if (currentTime - this.lastTrigger >= 10000) {
                    this.triggerGroupHeal();
                    this.lastTrigger = currentTime;
                }
            }
        });
        
        console.log('[Companion] 护士初始化完成，拥有群体回血技能');
    }
    
    /**
     * 初始化厨师
     */
    initializeChef() {
        this.name = '厨师';
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.attack = 5;
        this.moveSpeed = 2;
        
        // 每日产出口粮技能
        this.learnSkill({
            name: 'food_production',
            type: 'passive',
            description: '每日产出5份口粮',
            effect: () => {
                const eventManager = require('../core/EventManager.js').default;
                eventManager.emit('daily_food_production', 5);
            }
        });
        
        console.log('[Companion] 厨师初始化完成，拥有食物增产技能');
    }
    
    /**
     * 初始化医生
     */
    initializeDoctor() {
        this.name = '医生';
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.attack = 8;
        this.moveSpeed = 2;
        
        // 医疗技能增强
        this.learnSkill({
            name: 'medical_expertise',
            type: 'passive',
            description: '增强护士技能效果10%',
            effect: () => {
                // 这个技能的效果由外部系统处理
            }
        });
        
        console.log('[Companion] 医生初始化完成，拥有医疗专业技能');
    }
    
    /**
     * 初始化平民
     */
    initializeCivilian() {
        this.name = '平民';
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.attack = 5;
        this.moveSpeed = 3;
        
        console.log('[Companion] 平民初始化完成');
    }
    
    /**
     * 触发群体回血
     */
    triggerGroupHeal() {
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('group_heal', {
            healer: this,
            amount: 2,
            range: 'all'
        });
        
        console.log('[Companion] 护士触发群体回血');
    }
    
    /**
     * 伙伴升级
     */
    levelUp() {
        super.levelUp();
        
        // 伙伴特殊升级奖励
        if (this.companionType === 'police' && this.weapon) {
            this.weapon.damage += 5;
            console.log('[Companion] 警察武器伤害提升');
        }
    }
    
    /**
     * 执行攻击（重写以支持远程武器）
     */
    performAttack() {
        if (!this.target) return;
        
        let damage = this.calculateDamage();
        let attackRange = 30; // 默认近战攻击范围
        
        // 如果有远程武器
        if (this.weapon && this.weapon.type === 'gun') {
            damage += this.weapon.damage;
            attackRange = this.weapon.range;
            
            // 播放枪声效果
            console.log('[Companion] 砰！警察开枪攻击');
        }
        
        const distance = this.getDistanceTo(this.target);
        if (distance <= attackRange) {
            this.target.takeDamage(damage, this);
            this.lastAttackTime = Date.now();
            
            console.log(`[Companion] ${this.name} 攻击 ${this.target.name || 'Unknown'}，造成 ${damage} 伤害`);
            
            // 发射攻击事件
            const eventManager = require('../core/EventManager.js').default;
            eventManager.emit('character_attack', {
                attacker: this,
                target: this.target,
                damage: damage,
                attackType: this.weapon ? this.weapon.type : 'melee'
            });
        }
    }
    
    /**
     * 应用团队增益
     */
    applyTeamBuffs(buffs) {
        // 临时增益，不修改基础属性
        this.tempAttackBonus = buffs.attack || 0;
        this.tempHealthBonus = buffs.health || 0;
        this.tempSpeedBonus = buffs.moveSpeed || 0;
        
        // 如果是新加入的伙伴，直接增加血量上限和当前血量
        if (buffs.health && !this.hasReceivedHealthBuff) {
            this.maxHealth += buffs.health;
            this.health += buffs.health;
            this.hasReceivedHealthBuff = true;
        }
    }
    
    /**
     * 计算最终攻击力
     */
    calculateDamage() {
        const baseDamage = this.attack + (this.tempAttackBonus || 0);
        const randomFactor = 0.8 + Math.random() * 0.4;
        return Math.floor(baseDamage * randomFactor);
    }
    
    /**
     * 获取有效移动速度
     */
    getEffectiveMoveSpeed() {
        return this.moveSpeed + (this.tempSpeedBonus || 0);
    }
    
    /**
     * 渲染伙伴
     */
    render(ctx) {
        super.render(ctx);
        
        // 特殊技能图标
        if (this.companionType === 'police' && this.weapon) {
            // 武器图标
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(this.x + 8, this.y - 8, 8, 3);
        } else if (this.companionType === 'nurse') {
            // 医疗十字
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x + 6, this.y - 4, 6, 2);
            ctx.fillRect(this.x + 8, this.y - 6, 2, 6);
        } else if (this.companionType === 'chef') {
            // 厨师帽
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(this.x + 6, this.y - 8, 8, 4);
        }
    }
    
    /**
     * 获取伙伴状态
     */
    getCompanionStatus() {
        return {
            ...super.getStatus(),
            companionType: this.companionType,
            specialAbility: this.specialAbility,
            weapon: this.weapon,
            tempBuffs: {
                attack: this.tempAttackBonus || 0,
                health: this.tempHealthBonus || 0,
                moveSpeed: this.tempSpeedBonus || 0
            }
        };
    }
}

export default Companion;
