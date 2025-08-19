/**
 * 17号人物 - 格斗冠军
 */
function Character17() {
    var config = {
        id: 17,
        name: '格斗冠军',
        description: '无敌的格斗冠军，拳法无双',
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
            walkSpeed: 190
        }
    };
    
    BaseCharacter.call(this, config);
}

Character17.prototype = Object.create(BaseCharacter.prototype);
Character17.prototype.constructor = Character17;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character17;
}
