/**
 * 2号人物 - 金发女战士
 */
function Character2() {
    var config = {
        id: 2,
        name: '金发女战士',
        description: '拥有金色长发的勇敢女战士，擅长近战格斗',
        colors: {
            skin: '#F4C2A1',
            skinHighlight: '#F8D7B8', 
            skinShadow: '#E0A680',
            clothes: '#8E24AA', // 紫色战斗服
            clothesShadow: '#6A1B9A',
            clothesDetail: '#BA68C8',
            hair: '#FFD700', // 金色头发
            hairHighlight: '#FFF176',
            eyes: '#2196F3', // 蓝色眼睛
            eyesHighlight: '#FFFFFF',
            mouth: '#E91E63',
            mouthShadow: '#C2185B'
        },
        features: {
            hasGlasses: false,
            hairStyle: 'long',
            bodyType: 'athletic',
            clothingStyle: 'combat',
            accessory: 'none'
        },
        animations: {
            walkBobAmplitude: 2.0,
            walkLegSwingAmplitude: 4,
            walkArmSwingAmplitude: 3,
            walkSpeed: 180
        }
    };
    
    BaseCharacter.call(this, config);
}

Character2.prototype = Object.create(BaseCharacter.prototype);
Character2.prototype.constructor = Character2;

// 重写头发渲染 - 长发造型
Character2.prototype.renderHair = function(ctx, x, y, player) {
    // 长发
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(x - 10, y - 30, 20, 10); // 头发主体
    ctx.fillRect(x - 12, y - 25, 24, 15); // 长发延伸
    ctx.fillRect(x - 8, y - 10, 16, 8); // 头发垂落到肩膀
    
    // 头发高光
    ctx.fillStyle = this.colors.hairHighlight;
    ctx.fillRect(x - 6, y - 28, 3, 1);
    ctx.fillRect(x + 3, y - 26, 3, 1);
    ctx.fillRect(x - 4, y - 15, 8, 1);
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character2;
}
