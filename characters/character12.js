/**
 * 12号人物 - 军事指挥官
 */
function Character12() {
    var config = {
        id: 12,
        name: '军事指挥官',
        description: '经验丰富的军事领袖，战术大师',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#4CAF50',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#616161',
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
            walkLegSwingAmplitude: 2,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 190
        }
    };
    
    BaseCharacter.call(this, config);
}

Character12.prototype = Object.create(BaseCharacter.prototype);
Character12.prototype.constructor = Character12;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character12;
}
