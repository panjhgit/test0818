/**
 * 20号人物 - 超级英雄
 */
function Character20() {
    var config = {
        id: 20,
        name: '超级英雄',
        description: '守护正义的超级英雄',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#2196F3',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#FFC107',
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
            walkSpeed: 150
        }
    };
    
    BaseCharacter.call(this, config);
}

Character20.prototype = Object.create(BaseCharacter.prototype);
Character20.prototype.constructor = Character20;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character20;
}
