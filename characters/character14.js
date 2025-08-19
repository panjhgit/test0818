/**
 * 14号人物 - 网络黑客
 */
function Character14() {
    var config = {
        id: 14,
        name: '网络黑客',
        description: '精通网络技术的数字幽灵',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#00E676',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#1DE9B6',
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
            walkLegSwingAmplitude: 4,
            walkArmSwingAmplitude: 1.50000000000000000001,
            walkSpeed: 230
        }
    };
    
    BaseCharacter.call(this, config);
}

Character14.prototype = Object.create(BaseCharacter.prototype);
Character14.prototype.constructor = Character14;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character14;
}
