/**
 * 基础角色类 - 从game.js提取
 * 兼容抖音小程序环境 (ES5)
 */
function BaseCharacter(config) {
    this.id = config.id || 1;
    this.name = config.name || '角色' + this.id;
    this.description = config.description || '这是一个神秘的角色';
    this.colors = config.colors || this.getDefaultColors();
    this.features = config.features || this.getDefaultFeatures();
    this.animations = config.animations || this.getDefaultAnimations();
}

BaseCharacter.prototype.getDefaultColors = function() {
    return {
        skin: '#FF8C42', skinHighlight: '#FFB366', skinShadow: '#E6732A',
        clothes: '#FFFFFF', clothesShadow: '#E0E0E0', clothesDetail: '#F0F0F0',
        hair: '#1A1A1A', hairHighlight: '#404040',
        eyes: '#000000', eyesHighlight: '#FFFFFF',
        mouth: '#D4621F', mouthShadow: '#E6732A'
    };
};

BaseCharacter.prototype.getDefaultFeatures = function() {
    return { 
        hasGlasses: true, 
        hairStyle: 'normal', 
        bodyType: 'normal', 
        clothingStyle: 'casual', 
        accessory: 'sunglasses' 
    };
};

BaseCharacter.prototype.getDefaultAnimations = function() {
    return { 
        walkBobAmplitude: 1.5, 
        walkLegSwingAmplitude: 3, 
        walkArmSwingAmplitude: 2, 
        walkSpeed: 200 
    };
};

BaseCharacter.prototype.calculateAnimationOffsets = function(player) {
    var offsets = { 
        bobOffset: 0, leftLegOffset: 0, rightLegOffset: 0, 
        leftArmOffset: 0, rightArmOffset: 0 
    };
    
    if (player.isWalking) {
        offsets.bobOffset = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkBobAmplitude;
        var legSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkLegSwingAmplitude;
        offsets.leftLegOffset = legSwing; 
        offsets.rightLegOffset = -legSwing;
        var armSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkArmSwingAmplitude;
        offsets.leftArmOffset = -armSwing; 
        offsets.rightArmOffset = armSwing;
    }
    return offsets;
};

BaseCharacter.prototype.render = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    y += offsets.bobOffset;
    ctx.save(); 
    ctx.imageSmoothingEnabled = false;
    this.renderBody(ctx, x, y, player); 
    this.renderHead(ctx, x, y, player);
    this.renderArms(ctx, x, y, player); 
    this.renderLegs(ctx, x, y, player);
    ctx.restore();
};

BaseCharacter.prototype.renderBody = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.clothes; 
    ctx.fillRect(x - 10, y - 6, 20, 18);
    ctx.fillStyle = this.colors.clothesShadow; 
    ctx.fillRect(x + 8, y - 4, 2, 14); 
    ctx.fillRect(x - 8, y + 10, 16, 2);
    ctx.fillStyle = this.colors.clothesDetail; 
    ctx.fillRect(x - 6, y - 2, 2, 8); 
    ctx.fillRect(x + 4, y + 2, 2, 6);
};

BaseCharacter.prototype.renderHead = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.skin; 
    ctx.fillRect(x - 10, y - 20, 20, 16);
    ctx.fillStyle = this.colors.skinHighlight; 
    ctx.fillRect(x - 8, y - 18, 4, 4); 
    ctx.fillRect(x + 4, y - 16, 4, 3);
    ctx.fillStyle = this.colors.skinShadow; 
    ctx.fillRect(x + 8, y - 16, 2, 12); 
    ctx.fillRect(x - 6, y - 6, 12, 2);
    this.renderHair(ctx, x, y, player); 
    this.renderFacialFeatures(ctx, x, y, player);
};

BaseCharacter.prototype.renderHair = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(x - 12, y - 28, 24, 12); 
    ctx.fillRect(x - 10, y - 32, 20, 6);
    ctx.fillRect(x - 14, y - 26, 4, 8); 
    ctx.fillRect(x + 10, y - 26, 4, 8);
    ctx.fillRect(x - 8, y - 22, 16, 4); 
    ctx.fillRect(x - 4, y - 24, 8, 2);
    ctx.fillStyle = this.colors.hairHighlight;
    ctx.fillRect(x - 6, y - 30, 3, 2); 
    ctx.fillRect(x + 3, y - 32, 3, 2); 
    ctx.fillRect(x - 2, y - 22, 4, 1);
};

BaseCharacter.prototype.renderFacialFeatures = function(ctx, x, y, player) {
    if (this.features.hasGlasses) this.renderGlasses(ctx, x, y, player);
    else this.renderEyes(ctx, x, y, player);
    this.renderNose(ctx, x, y, player); 
    this.renderMouth(ctx, x, y, player);
};

BaseCharacter.prototype.renderGlasses = function(ctx, x, y, player) {
    ctx.fillStyle = '#000000'; 
    ctx.fillRect(x - 8, y - 18, 16, 6);
    ctx.fillStyle = '#1a1a1a'; 
    ctx.fillRect(x - 7, y - 17, 6, 4); 
    ctx.fillRect(x + 1, y - 17, 6, 4);
    ctx.fillStyle = '#333333'; 
    ctx.fillRect(x - 6, y - 17, 2, 1); 
    ctx.fillRect(x + 2, y - 17, 2, 1);
    ctx.fillStyle = '#555555'; 
    ctx.fillRect(x - 7, y - 16, 1, 2); 
    ctx.fillRect(x + 6, y - 16, 1, 2);
    ctx.fillStyle = '#000000'; 
    ctx.fillRect(x - 1, y - 17, 2, 2);
    ctx.fillRect(x - 10, y - 17, 2, 1); 
    ctx.fillRect(x + 8, y - 17, 2, 1);
};

BaseCharacter.prototype.renderEyes = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.eyes; 
    ctx.fillRect(x - 6, y - 16, 3, 2); 
    ctx.fillRect(x + 3, y - 16, 3, 2);
    ctx.fillStyle = this.colors.eyesHighlight; 
    ctx.fillRect(x - 5, y - 15, 1, 1); 
    ctx.fillRect(x + 4, y - 15, 1, 1);
};

BaseCharacter.prototype.renderNose = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.skinShadow; 
    ctx.fillRect(x - 1, y - 12, 2, 3);
};

BaseCharacter.prototype.renderMouth = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.mouth; 
    ctx.fillRect(x - 3, y - 8, 6, 2);
    ctx.fillStyle = this.colors.mouthShadow; 
    ctx.fillRect(x - 2, y - 7, 4, 1);
};

BaseCharacter.prototype.renderArms = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 18 + offsets.leftArmOffset, y - 2, 8, 12);
    ctx.fillRect(x + 10 + offsets.rightArmOffset, y - 2, 8, 12);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 12 + offsets.leftArmOffset, y + 8, 2, 2);
    ctx.fillRect(x + 16 + offsets.rightArmOffset, y + 8, 2, 2);
};

BaseCharacter.prototype.renderLegs = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 8 + offsets.leftLegOffset, y + 12, 6, 14);
    ctx.fillRect(x + 2 + offsets.rightLegOffset, y + 12, 6, 14);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 6 + offsets.leftLegOffset, y + 24, 2, 2);
    ctx.fillRect(x + 4 + offsets.rightLegOffset, y + 24, 2, 2);
};
