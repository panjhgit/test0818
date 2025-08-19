/**
 * 1号人物 - 戴墨镜的酷炫角色
 */
function Character1() {
    var config = {
        id: 1,
        name: '酷炫墨镜哥',
        description: '戴着时尚墨镜的街头潮人，行走间散发着不羁的魅力',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#FFFFFF',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#1A1A1A',
            hairHighlight: '#404040',
            eyes: '#000000',
            eyesHighlight: '#FFFFFF',
            mouth: '#D4621F',
            mouthShadow: '#E6732A'
        },
        features: {
            hasGlasses: true,
            hairStyle: 'fluffy',
            bodyType: 'normal',
            clothingStyle: 'casual',
            accessory: 'sunglasses'
        },
        animations: {
            walkBobAmplitude: 1.5,
            walkLegSwingAmplitude: 3,
            walkArmSwingAmplitude: 2,
            walkSpeed: 200
        }
    };
    
    BaseCharacter.call(this, config);
}

// 继承BaseCharacter
Character1.prototype = Object.create(BaseCharacter.prototype);
Character1.prototype.constructor = Character1;

/**
 * 重写渲染方法 - 1号人物的特殊渲染
 */
Character1.prototype.render = function(ctx, x, y, player) {
    // 计算动画偏移
    var offsets = this.calculateAnimationOffsets(player);
    
    // 应用上下摆动到整个身体
    y += offsets.bobOffset;
    
    ctx.save();
    ctx.imageSmoothingEnabled = false; // 保持像素风格
    
    // === 身体部分 ===
    this.renderBody(ctx, x, y, player);
    
    // === 头部区域 ===
    this.renderHead(ctx, x, y, player);
    
    // === 手臂（带动画） ===
    this.renderArms(ctx, x, y, player);
    
    // === 腿部（带动画） ===
    this.renderLegs(ctx, x, y, player);
    
    ctx.restore();
};

/**
 * 重写头发渲染 - 蓬松造型
 */
Character1.prototype.renderHair = function(ctx, x, y, player) {
    // 主要头发区域 - 更蓬松的造型
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(x - 12, y - 28, 24, 12); // 头发主体
    ctx.fillRect(x - 10, y - 32, 20, 6); // 头发顶部
    
    // 头发侧面延伸 - 蓬松效果
    ctx.fillRect(x - 14, y - 26, 4, 8); // 左侧蓬松头发
    ctx.fillRect(x + 10, y - 26, 4, 8); // 右侧蓬松头发
    
    // 头发前刘海
    ctx.fillRect(x - 8, y - 22, 16, 4); // 刘海区域
    ctx.fillRect(x - 4, y - 24, 8, 2); // 刘海尖端
    
    // 头发高光
    ctx.fillStyle = this.colors.hairHighlight;
    ctx.fillRect(x - 6, y - 30, 3, 2); // 左侧高光
    ctx.fillRect(x + 3, y - 32, 3, 2); // 右侧高光
    ctx.fillRect(x - 2, y - 22, 4, 1); // 刘海高光
};

/**
 * 重写墨镜渲染 - 更酷炫的墨镜
 */
Character1.prototype.renderGlasses = function(ctx, x, y, player) {
    // 墨镜镜框
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 8, y - 18, 16, 6); // 镜框主体
    
    // 墨镜镜片 - 深色
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 7, y - 17, 6, 4); // 左镜片
    ctx.fillRect(x + 1, y - 17, 6, 4); // 右镜片
    
    // 墨镜反光效果
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - 6, y - 17, 2, 1); // 左镜片反光
    ctx.fillRect(x + 2, y - 17, 2, 1); // 右镜片反光
    ctx.fillStyle = '#555555';
    ctx.fillRect(x - 7, y - 16, 1, 2); // 左镜片边缘光
    ctx.fillRect(x + 6, y - 16, 1, 2); // 右镜片边缘光
    
    // 墨镜鼻梁
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 1, y - 17, 2, 2); // 鼻梁连接
    
    // 墨镜镜腿
    ctx.fillRect(x - 10, y - 17, 2, 1); // 左镜腿
    ctx.fillRect(x + 8, y - 17, 2, 1); // 右镜腿
};

// 如果是在支持模块系统的环境中，导出Character1
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character1;
}
