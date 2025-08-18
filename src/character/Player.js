/**
 * 玩家角色类
 * 继承自Character，添加玩家特有的功能
 */
import Character from './Character.js';

class Player extends Character {
    constructor(config = {}) {
        super({
            ...config,
            name: '幸存者',
            type: 'player',
            maxHealth: 20,
            attack: 20,
            moveSpeed: 3
        });
        
        // 玩家特有属性
        this.experience = 0;
        this.nextLevelExp = 100;
        this.teamBuffs = {
            attack: 0,
            health: 0,
            moveSpeed: 0
        };
        
        // 初始化玩家技能
        this.initializePlayerSkills();
        
        console.log('[Player] 玩家角色已创建');
    }
    
    /**
     * 初始化玩家技能
     */
    initializePlayerSkills() {
        // 1级技能：全队攻击+2
        this.learnSkill({
            name: 'leadership_1',
            type: 'passive',
            description: '全队攻击 +2',
            effect: () => {
                this.teamBuffs.attack = 2;
            }
        });
    }
    
    /**
     * 玩家升级
     */
    levelUp() {
        super.levelUp();
        
        // 玩家特殊升级奖励
        switch (this.level) {
            case 2:
                this.teamBuffs.health = 5;
                this.learnSkill({
                    name: 'leadership_2',
                    type: 'passive',
                    description: '全队血量 +5',
                    effect: () => {
                        this.teamBuffs.health = 5;
                    }
                });
                console.log('[Player] 解锁技能: 全队血量 +5');
                break;
                
            case 3:
                this.teamBuffs.moveSpeed = 0.2;
                this.learnSkill({
                    name: 'leadership_3',
                    type: 'passive',
                    description: '全队移速 +0.2m/s',
                    effect: () => {
                        this.teamBuffs.moveSpeed = 0.2;
                    }
                });
                console.log('[Player] 解锁技能: 全队移速 +0.2m/s');
                break;
        }
    }
    
    /**
     * 获得经验值
     */
    gainExperience(amount) {
        this.experience += amount;
        console.log(`[Player] 获得经验值: ${amount}`);
        
        // 检查是否可以升级
        if (this.experience >= this.nextLevelExp && this.level < 3) {
            this.experience -= this.nextLevelExp;
            this.nextLevelExp *= 2; // 下一级所需经验翻倍
            this.levelUp();
        }
    }
    
    /**
     * 处理输入移动
     */
    handleMovement(direction) {
        if (!direction.x && !direction.y) return;
        
        const moveDistance = 5; // 每次移动的像素距离
        const newX = this.x + direction.x * moveDistance;
        const newY = this.y + direction.y * moveDistance;
        
        // 边界检查（假设画布大小为400x600）
        const boundedX = Math.max(10, Math.min(390, newX));
        const boundedY = Math.max(70, Math.min(590, newY));
        
        this.setPosition(boundedX, boundedY);
    }
    
    /**
     * 获取团队增益
     */
    getTeamBuffs() {
        return { ...this.teamBuffs };
    }
    
    /**
     * 渲染玩家
     */
    render(ctx) {
        // 玩家特殊渲染效果
        super.render(ctx);
        
        // 玩家光环效果
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.stroke();
        
        // 等级显示
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${this.level}`, this.x, this.y + 25);
        ctx.textAlign = 'left';
    }
    
    /**
     * 获取玩家状态
     */
    getPlayerStatus() {
        return {
            ...super.getStatus(),
            experience: this.experience,
            nextLevelExp: this.nextLevelExp,
            teamBuffs: this.teamBuffs
        };
    }
}

export default Player;
