/**
 * 角色管理器
 * 管理所有游戏角色
 */

function CharacterManager() {
    this.characters = {};
    this.currentCharacterId = 1;
    this.initializeCharacters();
}

CharacterManager.prototype.initializeCharacters = function() {
    var configs = [
        {
            id: 1,
            name: '酷炫墨镜哥',
            colors: { clothes: '#FFFFFF', hair: '#1A1A1A' },
            features: { hasGlasses: true }
        },
        {
            id: 2,
            name: '金发女战士',
            colors: { clothes: '#8E24AA', hair: '#FFD700' },
            features: { hasGlasses: true }
        },
        {
            id: 3,
            name: '暗影忍者',
            colors: { clothes: '#212121', hair: '#1A1A1A' },
            features: { hasGlasses: true }
        },
        {
            id: 4,
            name: '机械工程师',
            colors: { clothes: '#FF9800', hair: '#795548' },
            features: { hasGlasses: true }
        },
        {
            id: 5,
            name: '魔法师',
            colors: { clothes: '#3F51B5', hair: '#9C27B0' },
            features: { hasGlasses: true }
        },
        {
            id: 6,
            name: '海盗船长',
            colors: { clothes: '#8D6E63', hair: '#FF5722' },
            features: { hasGlasses: true }
        },
        {
            id: 7,
            name: '太空探险家',
            colors: { clothes: '#607D8B', hair: '#CDDC39' },
            features: { hasGlasses: true }
        },
        {
            id: 8,
            name: '武士',
            colors: { clothes: '#F44336', hair: '#424242' },
            features: { hasGlasses: true }
        }
    ];
    
    for (var i = 0; i < configs.length; i++) {
        this.characters[configs[i].id] = new BaseCharacter(configs[i]);
    }
};

CharacterManager.prototype.getCharacterDescription = function(id) {
    var descriptions = [
        '勇敢的战士',
        '聪明的厨师',
        '经验丰富的医生',
        '技术精湛的工程师',
        '训练有素的士兵',
        '敏捷的猎人',
        '强壮的工人',
        '智慧的学者',
        '灵活的运动员',
        '耐心的教师'
    ];
    return descriptions[id % descriptions.length];
};

CharacterManager.prototype.getCharacterColors = function(id) {
    var colorSchemes = [
        { primary: '#4A90E2', secondary: '#357ABD', accent: '#F5A623' },
        { primary: '#7ED321', secondary: '#5CB85C', accent: '#FF9500' },
        { primary: '#F5A623', secondary: '#E67E22', accent: '#E74C3C' },
        { primary: '#9B59B6', secondary: '#8E44AD', accent: '#3498DB' },
        { primary: '#E74C3C', secondary: '#C0392B', accent: '#F39C12' }
    ];
    return colorSchemes[id % colorSchemes.length];
};

CharacterManager.prototype.getCharacterFeatures = function(id) {
    var baseFeatures = {
        strength: 10,
        agility: 10,
        intelligence: 10,
        charisma: 10
    };
    
    // 根据角色ID调整属性
    var type = id % 5;
    switch (type) {
        case 0: // 战士
            baseFeatures.strength = 15;
            baseFeatures.agility = 12;
            break;
        case 1: // 厨师
            baseFeatures.intelligence = 13;
            baseFeatures.charisma = 12;
            break;
        case 2: // 医生
            baseFeatures.intelligence = 15;
            baseFeatures.charisma = 11;
            break;
        case 3: // 工程师
            baseFeatures.intelligence = 14;
            baseFeatures.strength = 11;
            break;
        case 4: // 士兵
            baseFeatures.strength = 13;
            baseFeatures.agility = 13;
            break;
    }
    
    return baseFeatures;
};

CharacterManager.prototype.getCharacter = function(id) {
    return this.characters[id] || null;
};

CharacterManager.prototype.getAllCharacters = function() {
    return this.characters;
};

CharacterManager.prototype.getCurrentCharacter = function() {
    return this.characters[this.currentCharacterId] || this.characters[1];
};

CharacterManager.prototype.renderCurrentCharacter = function(ctx, x, y, player) {
    var character = this.getCurrentCharacter();
    if (character) {
        character.render(ctx, x, y, player);
    }
};

CharacterManager.prototype.getCharacterPersonality = function(character) {
    if (!character) return null;
    
    var personalities = [
        '勇敢', '谨慎', '乐观', '悲观', '友好',
        '冷漠', '幽默', '严肃', '好奇', '保守'
    ];
    
    return {
        trait: personalities[character.id % personalities.length],
        loyalty: 50 + (character.id % 30),
        courage: 50 + (character.id % 40)
    };
};

// 基础角色类
function BaseCharacter() {
    this.x = 0;
    this.y = 0;
    this.health = 100;
    this.isDead = false;
    // 其他基础属性...
}

BaseCharacter.prototype.update = function (deltaTime) {
    // 基础更新逻辑
};

BaseCharacter.prototype.render = function (ctx, camera) {
    // 基础渲染逻辑
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CharacterManager, BaseCharacter };
}