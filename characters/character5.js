/**
 * 5号人物 - 魔法师
 */
function Character5() {
    var config = {
        id: 5,
        name: '魔法师',
        description: '掌握神秘魔法的智者，身着星空法袍',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#3F51B5',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#9C27B0',
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
            walkLegSwingAmplitude: 3,
            walkArmSwingAmplitude: 1.50000000000000000001,
            walkSpeed: 150
        }
    };
    
    BaseCharacter.call(this, config);
}

Character5.prototype = Object.create(BaseCharacter.prototype);
Character5.prototype.constructor = Character5;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character5;
}
