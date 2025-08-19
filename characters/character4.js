/**
 * 4号人物 - 机械工程师
 */
function Character4() {
    var config = {
        id: 4,
        name: '机械工程师',
        description: '精通机械的天才工程师，总是随身携带工具',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#FF9800',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#795548',
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
            walkLegSwingAmplitude: 2,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 230
        }
    };
    
    BaseCharacter.call(this, config);
}

Character4.prototype = Object.create(BaseCharacter.prototype);
Character4.prototype.constructor = Character4;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character4;
}
