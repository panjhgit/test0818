/**
 * 10号人物 - 神秘学者
 */
function Character10() {
    var config = {
        id: 10,
        name: '神秘学者',
        description: '研究古老秘密的学者，知识渊博',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#009688',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#37474F',
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
            walkLegSwingAmplitude: 4,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 150
        }
    };
    
    BaseCharacter.call(this, config);
}

Character10.prototype = Object.create(BaseCharacter.prototype);
Character10.prototype.constructor = Character10;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character10;
}
