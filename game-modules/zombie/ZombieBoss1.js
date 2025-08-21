/**
 * 僵尸Boss1类 - 从game.js提取
 * 兼容抖音小程序环境 (ES5)
 */
function ZombieBoss1(config) {
    BaseZombie.call(this, config);
}

ZombieBoss1.prototype = Object.create(BaseZombie.prototype);
ZombieBoss1.prototype.constructor = ZombieBoss1;

ZombieBoss1.prototype.renderZombie = function(ctx) {
    // Boss僵尸 - 更大更恐怖
    ctx.fillStyle = '#2d0d0d';
    ctx.fillRect(-18, -15, 36, 30); // 巨大的身体
    
    // 头部 - 非常大
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(-15, -28, 30, 22);
    
    // 发光的红眼睛
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-12, -24, 5, 5);
    ctx.fillRect(7, -24, 5, 5);
    
    // 发光效果
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(-14, -26, 9, 9);
    ctx.fillRect(5, -26, 9, 9);
    
    // 恐怖的嘴巴
    ctx.fillStyle = '#000000';
    ctx.fillRect(-8, -18, 16, 4);
    
    // 牙齿
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -18, 2, 3);
    ctx.fillRect(-2, -18, 2, 3);
    ctx.fillRect(2, -18, 2, 3);
    ctx.fillRect(6, -18, 2, 3);
    
    // 强壮的手臂
    ctx.fillStyle = '#2d0d0d';
    ctx.fillRect(-24, -10, 8, 25);
    ctx.fillRect(16, -10, 8, 25);
    
    // 粗壮的腿
    ctx.fillRect(-12, 15, 10, 20);
    ctx.fillRect(2, 15, 10, 20);
    
    // 装甲般的胸部
    ctx.fillStyle = '#444444';
    ctx.fillRect(-15, -8, 30, 18);
    
    // 伤疤效果
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-10, -25, 2, 15);
    ctx.fillRect(5, -22, 3, 12);
    ctx.fillRect(-5, -5, 8, 2);
};

ZombieBoss1.prototype.attackTarget = function(target) {
    if (!target || target.health <= 0) return;
    
    // Boss有特殊攻击效果
    target.health -= this.attack;
    
    console.log('[ZombieBoss1] Boss攻击目标，造成', this.attack, '点伤害，目标剩余血量:', target.health);
    
    // Boss攻击有击退效果
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
    
    // 检查目标是否死亡
    if (target.health <= 0) {
        this.onTargetDeath(target);
    }
};
