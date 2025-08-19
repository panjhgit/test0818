/**
 * 7号人物 - 太空探险家
 */
function Character7() {
    var config = {
        id: 7,
        name: '太空探险家',
        description: '来自未来的太空探险家，装备先进科技',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#607D8B',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#CDDC39',
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
            walkSpeed: 190
        }
    };
    
    BaseCharacter.call(this, config);
}

Character7.prototype = Object.create(BaseCharacter.prototype);
Character7.prototype.constructor = Character7;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character7;
}
