/**
 * 13号人物 - 幽灵猎人
 */
function Character13() {
    var config = {
        id: 13,
        name: '幽灵猎人',
        description: '专门对付超自然现象的猎人',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#9E9E9E',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#212121',
            hairHighlight: '#404040',
            eyes: '#000000',
            eyesHighlight: '#FFFFFF',
            mouth: '#D4621F',
            mouthShadow: '#E6732A'
        },
        features: {
            hasGlasses: true,
            hairStyle: 'normal',
            bodyType: 'normal',
            clothingStyle: 'normal',
            accessory: 'none'
        },
        animations: {
            walkBobAmplitude: 1,
            walkLegSwingAmplitude: 3,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 210
        }
    };
    
    BaseCharacter.call(this, config);
}

Character13.prototype = Object.create(BaseCharacter.prototype);
Character13.prototype.constructor = Character13;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character13;
}
