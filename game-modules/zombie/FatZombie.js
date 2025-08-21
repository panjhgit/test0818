/**
 * 胖僵尸类 - 从game.js提取
 * 兼容抖音小程序环境 (ES5)
 */
function FatZombie(config) {
    BaseZombie.call(this, config);
}

FatZombie.prototype = Object.create(BaseZombie.prototype);
FatZombie.prototype.constructor = FatZombie;

FatZombie.prototype.renderZombie = function(ctx) {
    // 胖僵尸 - 圆胖的身体
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-15, -12, 30, 24); // 胖身体
    
    // 头部 - 比较大
    ctx.fillStyle = '#654321';
    ctx.fillRect(-12, -22, 24, 18);
    
    // 眼睛
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-9, -19, 4, 4);
    ctx.fillRect(5, -19, 4, 4);
    
    // 嘴巴 - 比较大
    ctx.fillStyle = '#000000';
    ctx.fillRect(-6, -14, 12, 3);
    
    // 粗手臂
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-18, -8, 6, 16);
    ctx.fillRect(12, -8, 6, 16);
    
    // 粗腿
    ctx.fillRect(-10, 12, 8, 18);
    ctx.fillRect(2, 12, 8, 18);
    
    // 肚子
    ctx.fillStyle = '#666666';
    ctx.fillRect(-12, -5, 24, 15);
    
    // 破烂的衣服
    ctx.fillStyle = '#333333';
    ctx.fillRect(-10, -2, 20, 8);
};
