/**
 * 11号人物 - 赛车手
 */
function Character11() {
    var config = {
        id: 11,
        name: '赛车手',
        description: '速度与激情的代表，追求极致速度',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#FF5722',
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
            walkLegSwingAmplitude: 5,
            walkArmSwingAmplitude: 1.50000000000000000001,
            walkSpeed: 170
        }
    };
    
    BaseCharacter.call(this, config);
}

Character11.prototype = Object.create(BaseCharacter.prototype);
Character11.prototype.constructor = Character11;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character11;
}
