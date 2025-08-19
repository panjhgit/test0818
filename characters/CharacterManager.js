/**
 * 人物管理器 - 管理所有可选择的人物
 */
function CharacterManager() {
    this.characters = {};
    this.currentCharacterId = 1; // 默认使用1号人物
    this.loadAllCharacters();
}

/**
 * 加载所有人物
 */
CharacterManager.prototype.loadAllCharacters = function() {
    // 这里会动态加载所有人物文件
    // 实际项目中，您可以通过require或import加载
    // 这里我们先手动注册
    for (var i = 1; i <= 20; i++) {
        try {
            // 在实际实现中，这里会动态加载对应的人物文件
            // this.characters[i] = require('./character' + i + '.js');
        } catch (e) {
            console.log('人物 ' + i + ' 文件未找到或加载失败');
        }
    }
};

/**
 * 获取当前人物
 */
CharacterManager.prototype.getCurrentCharacter = function() {
    return this.characters[this.currentCharacterId] || this.characters[1];
};

/**
 * 切换人物
 */
CharacterManager.prototype.switchCharacter = function(characterId) {
    if (characterId >= 1 && characterId <= 20 && this.characters[characterId]) {
        this.currentCharacterId = characterId;
        return true;
    }
    return false;
};

/**
 * 注册人物
 */
CharacterManager.prototype.registerCharacter = function(id, character) {
    this.characters[id] = character;
};

/**
 * 渲染当前人物
 */
CharacterManager.prototype.renderCurrentCharacter = function(ctx, x, y, player) {
    var character = this.getCurrentCharacter();
    if (character && character.render) {
        character.render(ctx, x, y, player);
    } else {
        // 如果没有找到对应人物，使用默认渲染
        this.renderDefaultCharacter(ctx, x, y, player);
    }
};

/**
 * 默认人物渲染（作为后备）
 */
CharacterManager.prototype.renderDefaultCharacter = function(ctx, x, y, player) {
    // 简单的默认人物渲染
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(x - 8, y - 8, 16, 16);
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(x - 6, y - 6, 12, 12);
};
