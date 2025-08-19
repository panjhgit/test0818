/**
 * 15号人物 - 西部牛仔
 */
function Character15() {
    var config = {
        id: 15,
        name: '西部牛仔',
        description: '来自西部荒野的孤独骑手',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#8D6E63',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#FFAB40',
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
            walkBobAmplitude: 1,
            walkLegSwingAmplitude: 5,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 150
        }
    };
    
    BaseCharacter.call(this, config);
}

Character15.prototype = Object.create(BaseCharacter.prototype);
Character15.prototype.constructor = Character15;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character15;
}
