/**
 * 19号人物 - 机器人
 */
function Character19() {
    var config = {
        id: 19,
        name: '机器人',
        description: '先进的人工智能机器人',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#546E7A',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#90A4AE',
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
            walkLegSwingAmplitude: 5,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 230
        }
    };
    
    BaseCharacter.call(this, config);
}

Character19.prototype = Object.create(BaseCharacter.prototype);
Character19.prototype.constructor = Character19;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character19;
}
