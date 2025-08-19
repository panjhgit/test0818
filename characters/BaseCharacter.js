/**
 * 基础人物类 - 所有人物的基类
 */
function BaseCharacter(config) {
    this.id = config.id || 1;
    this.name = config.name || '角色' + this.id;
    this.description = config.description || '这是一个神秘的角色';
    this.colors = config.colors || this.getDefaultColors();
    this.features = config.features || this.getDefaultFeatures();
    this.animations = config.animations || this.getDefaultAnimations();
}

/**
 * 获取默认颜色配置
 */
BaseCharacter.prototype.getDefaultColors = function() {
    return {
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
    };
};

/**
 * 获取默认特征配置
 */
BaseCharacter.prototype.getDefaultFeatures = function() {
    return {
        hasGlasses: true,
        hairStyle: 'normal',
        bodyType: 'normal',
        clothingStyle: 'casual',
        accessory: 'sunglasses'
    };
};

/**
 * 获取默认动画配置
 */
BaseCharacter.prototype.getDefaultAnimations = function() {
    return {
        walkBobAmplitude: 1.5,
        walkLegSwingAmplitude: 3,
        walkArmSwingAmplitude: 2,
        walkSpeed: 200
    };
};

/**
 * 渲染人物 - 子类需要重写此方法
 */
BaseCharacter.prototype.render = function(ctx, x, y, player) {
    // 基础渲染逻辑
    this.renderBody(ctx, x, y, player);
    this.renderHead(ctx, x, y, player);
    this.renderArms(ctx, x, y, player);
    this.renderLegs(ctx, x, y, player);
};

/**
 * 计算动画偏移
 */
BaseCharacter.prototype.calculateAnimationOffsets = function(player) {
    var offsets = {
        bobOffset: 0,
        leftLegOffset: 0,
        rightLegOffset: 0,
        leftArmOffset: 0,
        rightArmOffset: 0
    };
    
    if (player.isWalking) {
        // 行走时的上下摆动
        offsets.bobOffset = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkBobAmplitude;
        
        // 腿部动画偏移 - 交替摆动
        var legSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkLegSwingAmplitude;
        offsets.leftLegOffset = legSwing;
        offsets.rightLegOffset = -legSwing;
        
        // 手臂摆动 - 与腿部相反
        var armSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkArmSwingAmplitude;
        offsets.leftArmOffset = -armSwing;
        offsets.rightArmOffset = armSwing;
    }
    
    return offsets;
};

/**
 * 渲染身体 - 基础实现
 */
BaseCharacter.prototype.renderBody = function(ctx, x, y, player) {
    // 白色衣服主体
    ctx.fillStyle = this.colors.clothes;
    ctx.fillRect(x - 10, y - 6, 20, 18);
    
    // 衣服阴影
    ctx.fillStyle = this.colors.clothesShadow;
    ctx.fillRect(x + 8, y - 4, 2, 14);
    ctx.fillRect(x - 8, y + 10, 16, 2);
    
    // 衣服褶皱细节
    ctx.fillStyle = this.colors.clothesDetail;
    ctx.fillRect(x - 6, y - 2, 2, 8);
    ctx.fillRect(x + 4, y + 2, 2, 6);
};

/**
 * 渲染头部 - 基础实现
 */
BaseCharacter.prototype.renderHead = function(ctx, x, y, player) {
    // 橙色皮肤 - 脸部
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 10, y - 20, 20, 16);
    
    // 皮肤高光
    ctx.fillStyle = this.colors.skinHighlight;
    ctx.fillRect(x - 8, y - 18, 4, 4);
    ctx.fillRect(x + 4, y - 16, 4, 3);
    
    // 皮肤阴影
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x + 8, y - 16, 2, 12);
    ctx.fillRect(x - 6, y - 6, 12, 2);
    
    // 头发
    this.renderHair(ctx, x, y, player);
    
    // 五官
    this.renderFacialFeatures(ctx, x, y, player);
};

/**
 * 渲染头发
 */
BaseCharacter.prototype.renderHair = function(ctx, x, y, player) {
    // 主要头发区域
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(x - 12, y - 28, 24, 12);
    ctx.fillRect(x - 10, y - 32, 20, 6);
    
    // 头发侧面延伸
    ctx.fillRect(x - 14, y - 26, 4, 8);
    ctx.fillRect(x + 10, y - 26, 4, 8);
    
    // 头发前刘海
    ctx.fillRect(x - 8, y - 22, 16, 4);
    ctx.fillRect(x - 4, y - 24, 8, 2);
    
    // 头发高光
    ctx.fillStyle = this.colors.hairHighlight;
    ctx.fillRect(x - 6, y - 30, 3, 2);
    ctx.fillRect(x + 3, y - 32, 3, 2);
    ctx.fillRect(x - 2, y - 22, 4, 1);
};

/**
 * 渲染面部特征
 */
BaseCharacter.prototype.renderFacialFeatures = function(ctx, x, y, player) {
    if (this.features.hasGlasses) {
        this.renderGlasses(ctx, x, y, player);
    } else {
        this.renderEyes(ctx, x, y, player);
    }
    
    this.renderNose(ctx, x, y, player);
    this.renderMouth(ctx, x, y, player);
};

/**
 * 渲染眼镜
 */
BaseCharacter.prototype.renderGlasses = function(ctx, x, y, player) {
    // 墨镜镜框
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 8, y - 18, 16, 6);
    
    // 墨镜镜片
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 7, y - 17, 6, 4);
    ctx.fillRect(x + 1, y - 17, 6, 4);
    
    // 墨镜反光效果
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - 6, y - 17, 2, 1);
    ctx.fillRect(x + 2, y - 17, 2, 1);
    ctx.fillStyle = '#555555';
    ctx.fillRect(x - 7, y - 16, 1, 2);
    ctx.fillRect(x + 6, y - 16, 1, 2);
    
    // 墨镜鼻梁
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 1, y - 17, 2, 2);
    
    // 墨镜镜腿
    ctx.fillRect(x - 10, y - 17, 2, 1);
    ctx.fillRect(x + 8, y - 17, 2, 1);
};

/**
 * 渲染眼睛（无眼镜时）
 */
BaseCharacter.prototype.renderEyes = function(ctx, x, y, player) {
    // 眼睛轮廓
    ctx.fillStyle = this.colors.eyes;
    ctx.fillRect(x - 6, y - 16, 3, 2);
    ctx.fillRect(x + 3, y - 16, 3, 2);
    
    // 眼睛高光
    ctx.fillStyle = this.colors.eyesHighlight;
    ctx.fillRect(x - 5, y - 16, 1, 1);
    ctx.fillRect(x + 4, y - 16, 1, 1);
};

/**
 * 渲染鼻子
 */
BaseCharacter.prototype.renderNose = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 1, y - 12, 2, 2);
    ctx.fillStyle = this.colors.skinHighlight;
    ctx.fillRect(x, y - 13, 1, 1);
};

/**
 * 渲染嘴巴
 */
BaseCharacter.prototype.renderMouth = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.mouth;
    ctx.fillRect(x - 2, y - 10, 4, 1);
    ctx.fillStyle = this.colors.mouthShadow;
    ctx.fillRect(x - 1, y - 9, 2, 1);
};

/**
 * 渲染手臂
 */
BaseCharacter.prototype.renderArms = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    
    // 左手臂
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 14, y - 4 + offsets.leftArmOffset, 4, 10);
    ctx.fillRect(x - 16, y + 4 + offsets.leftArmOffset, 4, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 12, y + 2 + offsets.leftArmOffset, 2, 4);
    
    // 右手臂
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x + 10, y - 4 + offsets.rightArmOffset, 4, 10);
    ctx.fillRect(x + 12, y + 4 + offsets.rightArmOffset, 4, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x + 10, y + 2 + offsets.rightArmOffset, 2, 4);
    
    // 手部
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 18, y + 10 + offsets.leftArmOffset, 4, 4);
    ctx.fillRect(x + 14, y + 10 + offsets.rightArmOffset, 4, 4);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 16, y + 12 + offsets.leftArmOffset, 2, 2);
    ctx.fillRect(x + 14, y + 12 + offsets.rightArmOffset, 2, 2);
};

/**
 * 渲染腿部
 */
BaseCharacter.prototype.renderLegs = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    
    // 左腿
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 6, y + 12 + offsets.leftLegOffset, 5, 14);
    ctx.fillRect(x - 7, y + 24 + offsets.leftLegOffset, 5, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 2, y + 20 + offsets.leftLegOffset, 2, 6);
    
    // 右腿
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x + 1, y + 12 + offsets.rightLegOffset, 5, 14);
    ctx.fillRect(x + 2, y + 24 + offsets.rightLegOffset, 5, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x + 1, y + 20 + offsets.rightLegOffset, 2, 6);
    
    // 鞋子
    this.renderShoes(ctx, x, y, player, offsets);
};

/**
 * 渲染鞋子
 */
BaseCharacter.prototype.renderShoes = function(ctx, x, y, player, offsets) {
    // 白色鞋子
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 10, y + 30 + offsets.leftLegOffset, 8, 5);
    ctx.fillRect(x + 2, y + 30 + offsets.rightLegOffset, 8, 5);
    
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(x - 8, y + 32 + offsets.leftLegOffset, 4, 2);
    ctx.fillRect(x + 4, y + 32 + offsets.rightLegOffset, 4, 2);
    
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(x - 9, y + 30 + offsets.leftLegOffset, 2, 1);
    ctx.fillRect(x + 7, y + 30 + offsets.rightLegOffset, 2, 1);
};
