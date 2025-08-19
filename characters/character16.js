/**
 * 16号人物 - 外星访客
 */
function Character16() {
    var config = {
        id: 16,
        name: '外星访客',
        description: '来自遥远星系的神秘访客',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#00BCD4',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#4FC3F7',
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
            walkSpeed: 170
        }
    };
    
    BaseCharacter.call(this, config);
}

Character16.prototype = Object.create(BaseCharacter.prototype);
Character16.prototype.constructor = Character16;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character16;
}
