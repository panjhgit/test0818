/**
 * 18号人物 - 时间旅行者
 */
function Character18() {
    var config = {
        id: 18,
        name: '时间旅行者',
        description: '穿越时空的神秘旅行者',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#673AB7',
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
            walkBobAmplitude: 1,
            walkLegSwingAmplitude: 4,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 210
        }
    };
    
    BaseCharacter.call(this, config);
}

Character18.prototype = Object.create(BaseCharacter.prototype);
Character18.prototype.constructor = Character18;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character18;
}
