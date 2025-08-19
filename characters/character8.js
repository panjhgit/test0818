/**
 * 8号人物 - 武士
 */
function Character8() {
    var config = {
        id: 8,
        name: '武士',
        description: '遵循武士道的日本剑客，刀法精湛',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#F44336',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#424242',
            hairHighlight: '#404040',
            eyes: '#000000',
            eyesHighlight: '#FFFFFF',
            mouth: '#D4621F',
            mouthShadow: '#E6732A'
        },
        features: {
            hasGlasses: false,
            hairStyle: 'normal',
            bodyType: 'normal',
            clothingStyle: 'normal',
            accessory: 'none'
        },
        animations: {
            walkBobAmplitude: 1.00000000000000000001,
            walkLegSwingAmplitude: 2,
            walkArmSwingAmplitude: 1.50000000000000000001,
            walkSpeed: 210
        }
    };
    
    BaseCharacter.call(this, config);
}

Character8.prototype = Object.create(BaseCharacter.prototype);
Character8.prototype.constructor = Character8;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character8;
}
