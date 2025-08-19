/**
 * 6号人物 - 海盗船长
 */
function Character6() {
    var config = {
        id: 6,
        name: '海盗船长',
        description: '勇敢的海盗船长，征服七大洋的传奇人物',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#8D6E63',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#FF5722',
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
            walkLegSwingAmplitude: 4,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 170
        }
    };
    
    BaseCharacter.call(this, config);
}

Character6.prototype = Object.create(BaseCharacter.prototype);
Character6.prototype.constructor = Character6;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character6;
}
