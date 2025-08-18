/**
 * 僵尸类
 * 游戏中的敌人单位
 */
import Character from '../character/Character.js';

class Zombie extends Character {
    constructor(config = {}) {
        super({
            ...config,
            name: '僵尸',
            type: 'zombie',
            maxHealth: config.maxHealth || 15,
            attack: config.attack || 5,
            moveSpeed: config.moveSpeed || 2
        });
        
        this.zombieType = config.zombieType || 'normal';
        this.alertState = 'patrol'; // patrol, alert, chase, attack
        this.alertTime = 0;
        this.chaseTarget = null;
        this.patrolRadius = config.patrolRadius || 50;
        this.patrolCenter = { x: this.x, y: this.y };
        this.detectionRange = config.detectionRange || 60;
        this.isDay = true;
        
        // 僵尸特有属性
        this.aggroLevel = 0;
        this.lastDirectionChange = 0;
        this.patrolDirection = Math.random() * Math.PI * 2;
        
        console.log(`[Zombie] 僵尸生成: ${this.zombieType} 在 (${this.x}, ${this.y})`);
    }
    
    /**
     * 更新僵尸状态
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        this.updateAI(deltaTime);
        this.updateDayNightEffects();
    }
    
    /**
     * 更新AI逻辑
     */
    updateAI(deltaTime) {
        switch (this.alertState) {
            case 'patrol':
                this.updatePatrol(deltaTime);
                break;
            case 'alert':
                this.updateAlert(deltaTime);
                break;
            case 'chase':
                this.updateChase(deltaTime);
                break;
            case 'attack':
                this.updateAttack(deltaTime);
                break;
        }
        
        // 检测周围的玩家和伙伴
        this.detectTargets();
    }
    
    /**
     * 巡逻状态
     */
    updatePatrol(deltaTime) {
        // 随机巡逻
        const currentTime = Date.now();
        if (currentTime - this.lastDirectionChange > 3000) { // 3秒换方向
            this.patrolDirection = Math.random() * Math.PI * 2;
            this.lastDirectionChange = currentTime;
        }
        
        const moveDistance = this.getEffectiveMoveSpeed() * (deltaTime / 1000);
        const newX = this.x + Math.cos(this.patrolDirection) * moveDistance;
        const newY = this.y + Math.sin(this.patrolDirection) * moveDistance;
        
        // 检查是否超出巡逻范围
        const distanceFromCenter = Math.sqrt(
            (newX - this.patrolCenter.x) ** 2 + (newY - this.patrolCenter.y) ** 2
        );
        
        if (distanceFromCenter < this.patrolRadius) {
            this.x = newX;
            this.y = newY;
        } else {
            // 转向巡逻中心
            this.patrolDirection = Math.atan2(
                this.patrolCenter.y - this.y,
                this.patrolCenter.x - this.x
            );
        }
    }
    
    /**
     * 警戒状态
     */
    updateAlert(deltaTime) {
        this.alertTime += deltaTime;
        
        // 警戒1秒后开始追击
        if (this.alertTime >= 1000) {
            if (this.chaseTarget) {
                this.alertState = 'chase';
                console.log('[Zombie] 僵尸开始追击目标');
            } else {
                this.alertState = 'patrol';
            }
        }
    }
    
    /**
     * 追击状态
     */
    updateChase(deltaTime) {
        if (!this.chaseTarget || !this.chaseTarget.isAlive()) {
            this.alertState = 'patrol';
            this.chaseTarget = null;
            return;
        }
        
        const distance = this.getDistanceTo(this.chaseTarget);
        
        // 如果目标太远，放弃追击
        if (distance > 100) {
            this.alertState = 'patrol';
            this.chaseTarget = null;
            console.log('[Zombie] 僵尸失去目标，返回巡逻');
            return;
        }
        
        // 如果靠近目标，进入攻击状态
        if (distance <= 30) {
            this.alertState = 'attack';
            this.startCombat(this.chaseTarget);
            return;
        }
        
        // 向目标移动
        this.moveTowardsTarget(this.chaseTarget, deltaTime);
    }
    
    /**
     * 攻击状态
     */
    updateAttack(deltaTime) {
        if (!this.chaseTarget || !this.chaseTarget.isAlive()) {
            this.stopCombat();
            this.alertState = 'patrol';
            this.chaseTarget = null;
            return;
        }
        
        const distance = this.getDistanceTo(this.chaseTarget);
        
        // 如果目标逃跑，继续追击
        if (distance > 30) {
            this.stopCombat();
            this.alertState = 'chase';
            return;
        }
        
        // 继续攻击
        super.updateCombat(deltaTime);
    }
    
    /**
     * 向目标移动
     */
    moveTowardsTarget(target, deltaTime) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const moveDistance = this.getEffectiveMoveSpeed() * (deltaTime / 1000);
            this.x += (dx / distance) * moveDistance;
            this.y += (dy / distance) * moveDistance;
        }
    }
    
    /**
     * 检测目标
     */
    detectTargets() {
        if (this.alertState === 'attack') return;
        
        // 获取场景中的所有角色
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('zombie_detect_request', {
            zombie: this,
            position: { x: this.x, y: this.y },
            range: this.detectionRange
        });
    }
    
    /**
     * 发现目标
     */
    detectTarget(target) {
        if (!target.isAlive()) return;
        
        const distance = this.getDistanceTo(target);
        if (distance <= this.detectionRange) {
            this.chaseTarget = target;
            this.alertState = 'alert';
            this.alertTime = 0;
            
            console.log('[Zombie] 僵尸发现目标，进入警戒状态');
            
            // 播放嘶吼音效
            const eventManager = require('../core/EventManager.js').default;
            eventManager.emit('zombie_alert', {
                zombie: this,
                target: target
            });
        }
    }
    
    /**
     * 更新昼夜效果
     */
    updateDayNightEffects() {
        // 夜晚僵尸更强
        if (!this.isDay) {
            this.moveSpeed = this.zombieType === 'elite' ? 4 : 4; // 夜晚移速x2
            this.attack = this.zombieType === 'elite' ? 20 : 10; // 夜晚攻击x2
        } else {
            this.moveSpeed = this.zombieType === 'elite' ? 2.5 : 2; // 白天基础移速
            this.attack = this.zombieType === 'elite' ? 10 : 5; // 白天基础攻击
        }
    }
    
    /**
     * 设置昼夜状态
     */
    setDayNight(isDay) {
        this.isDay = isDay;
        this.updateDayNightEffects();
    }
    
    /**
     * 获取有效移动速度
     */
    getEffectiveMoveSpeed() {
        return this.moveSpeed;
    }
    
    /**
     * 死亡处理
     */
    onDeath(killer) {
        super.onDeath(killer);
        
        // 掉落奖励
        this.dropRewards();
        
        // 增加击杀统计
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('zombie_killed', {
            zombie: this,
            killer: killer,
            zombieType: this.zombieType
        });
    }
    
    /**
     * 掉落奖励
     */
    dropRewards() {
        const dropChance = this.zombieType === 'elite' ? 0.05 : 0.01; // 5% vs 1%
        
        if (Math.random() < dropChance) {
            const rewards = ['food', 'health_pack'];
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            
            const eventManager = require('../core/EventManager.js').default;
            eventManager.emit('zombie_drop', {
                type: reward,
                position: { x: this.x, y: this.y },
                amount: 1
            });
            
            console.log(`[Zombie] 僵尸掉落奖励: ${reward}`);
        }
    }
    
    /**
     * 渲染僵尸
     */
    render(ctx) {
        // 僵尸主体
        ctx.fillStyle = this.getZombieColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.zombieType === 'elite' ? 14 : 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 僵尸边框
        ctx.strokeStyle = this.alertState === 'alert' || this.alertState === 'chase' ? '#e74c3c' : '#8b0000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 警戒状态效果
        if (this.alertState === 'alert') {
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 血条
        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }
        
        // 精英僵尸标识
        if (this.zombieType === 'elite') {
            ctx.fillStyle = '#f1c40f';
            ctx.font = 'bold 8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('★', this.x, this.y - 20);
            ctx.textAlign = 'left';
        }
    }
    
    /**
     * 获取僵尸颜色
     */
    getZombieColor() {
        switch (this.zombieType) {
            case 'elite':
                return this.isDay ? '#8b0000' : '#4a0000';
            case 'mutant':
                return this.isDay ? '#654321' : '#3d2913';
            default:
                return this.isDay ? '#8b0000' : '#4a0000';
        }
    }
    
    /**
     * 获取僵尸状态
     */
    getZombieStatus() {
        return {
            ...super.getStatus(),
            zombieType: this.zombieType,
            alertState: this.alertState,
            chaseTarget: this.chaseTarget ? this.chaseTarget.id : null,
            patrolCenter: this.patrolCenter,
            isDay: this.isDay
        };
    }
}

export default Zombie;
