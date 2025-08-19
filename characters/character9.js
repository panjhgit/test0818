/**
 * 9号人物 - 摇滚歌手
 */
function Character9() {
    var config = {
        id: 9,
        name: '摇滚歌手',
        description: '狂野的摇滚明星，音乐就是生命',
        colors: {
            skin: '#FF8C42',
            skinHighlight: '#FFB366', 
            skinShadow: '#E6732A',
            clothes: '#E91E63',
            clothesShadow: '#E0E0E0',
            clothesDetail: '#F0F0F0',
            hair: '#FF1744',
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
            walkLegSwingAmplitude: 3,
            walkArmSwingAmplitude: 1.5,
            walkSpeed: 230
        }
    };
    
    BaseCharacter.call(this, config);
}

Character9.prototype = Object.create(BaseCharacter.prototype);
Character9.prototype.constructor = Character9;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character9;
}
