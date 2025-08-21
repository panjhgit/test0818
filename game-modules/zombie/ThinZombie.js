/**
 * 瘦僵尸类 - 从game.js提取
 * 兼容抖音小程序环境 (ES5)
 */
function ThinZombie(config) {
    BaseZombie.call(this, config);
}

ThinZombie.prototype = Object.create(BaseZombie.prototype);
ThinZombie.prototype.constructor = ThinZombie;

ThinZombie.prototype.renderZombie = function(ctx) {
    // 瘦僵尸 - 瘦长的身体
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-8, -15, 16, 30); // 瘦长的身体
    
    // 头部
    ctx.fillStyle = '#654321';
    ctx.fillRect(-10, -20, 20, 15);
    
    // 眼睛
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-7, -17, 3, 3);
    ctx.fillRect(4, -17, 3, 3);
    
    // 嘴巴
    ctx.fillStyle = '#000000';
    ctx.fillRect(-4, -12, 8, 2);
    
    // 手臂 - 很瘦
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-12, -10, 4, 20);
    ctx.fillRect(8, -10, 4, 20);
    
    // 腿部 - 很瘦
    ctx.fillRect(-6, 15, 4, 15);
    ctx.fillRect(2, 15, 4, 15);
    
    // 破烂的衣服效果
    ctx.fillStyle = '#444444';
    ctx.fillRect(-6, -5, 12, 8);
    ctx.fillRect(-4, 5, 8, 6);
};
