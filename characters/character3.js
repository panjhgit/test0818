/**
 * 3号人物 - 忍者刺客
 */
function Character3() {
    var config = {
        id: 3,
        name: '暗影忍者',
        description: '神秘的黑衣忍者，行动如风，无声无息',
        colors: {
            skin: '#D2B48C',
            skinHighlight: '#E5C99B', 
            skinShadow: '#C4975C',
            clothes: '#212121', // 黑色忍者服
            clothesShadow: '#000000',
            clothesDetail: '#424242',
            hair: '#1A1A1A',
            hairHighlight: '#333333',
            eyes: '#FF5722', // 红色眼睛
            eyesHighlight: '#FFFFFF',
            mouth: '#5D4037',
            mouthShadow: '#3E2723'
        },
        features: {
            hasGlasses: false,
            hairStyle: 'short',
            bodyType: 'slim',
            clothingStyle: 'ninja',
            accessory: 'mask'
        },
        animations: {
            walkBobAmplitude: 1.0,
            walkLegSwingAmplitude: 2,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 150
        }
    };
    
    BaseCharacter.call(this, config);
}

Character3.prototype = Object.create(BaseCharacter.prototype);
Character3.prototype.constructor = Character3;

// 重写面部特征 - 忍者面罩
Character3.prototype.renderFacialFeatures = function(ctx, x, y, player) {
    // 忍者面罩
    ctx.fillStyle = '#212121';
    ctx.fillRect(x - 8, y - 18, 16, 10);
    
    // 眼睛部分开口
    ctx.fillStyle = this.colors.eyes;
    ctx.fillRect(x - 6, y - 16, 3, 2);
    ctx.fillRect(x + 3, y - 16, 3, 2);
    
    // 眼睛高光
    ctx.fillStyle = this.colors.eyesHighlight;
    ctx.fillRect(x - 5, y - 16, 1, 1);
    ctx.fillRect(x + 4, y - 16, 1, 1);
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character3;
}
