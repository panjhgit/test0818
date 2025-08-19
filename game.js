/**
 * 末日Q行 - 抖音小程序游戏
 * 一个生存至100天的挑战游戏
 * 使用ES5语法，完全兼容抖音小程序环境
 */

console.log('=== 末日Q行游戏启动 ===');
console.log('参考文档: https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/introduction');

// === 人物系统集成 ===
// 由于抖音小程序环境限制，直接内联人物系统代码

// 基础人物类
function BaseCharacter(config) {
    this.id = config.id || 1;
    this.name = config.name || '角色' + this.id;
    this.description = config.description || '这是一个神秘的角色';
    this.colors = config.colors || this.getDefaultColors();
    this.features = config.features || this.getDefaultFeatures();
    this.animations = config.animations || this.getDefaultAnimations();
}

BaseCharacter.prototype.getDefaultColors = function() {
    return {
        skin: '#FF8C42', skinHighlight: '#FFB366', skinShadow: '#E6732A',
        clothes: '#FFFFFF', clothesShadow: '#E0E0E0', clothesDetail: '#F0F0F0',
        hair: '#1A1A1A', hairHighlight: '#404040',
        eyes: '#000000', eyesHighlight: '#FFFFFF',
        mouth: '#D4621F', mouthShadow: '#E6732A'
    };
};

BaseCharacter.prototype.getDefaultFeatures = function() {
    return { hasGlasses: true, hairStyle: 'normal', bodyType: 'normal', clothingStyle: 'casual', accessory: 'sunglasses' };
};

BaseCharacter.prototype.getDefaultAnimations = function() {
    return { walkBobAmplitude: 1.5, walkLegSwingAmplitude: 3, walkArmSwingAmplitude: 2, walkSpeed: 200 };
};

BaseCharacter.prototype.calculateAnimationOffsets = function(player) {
    var offsets = { bobOffset: 0, leftLegOffset: 0, rightLegOffset: 0, leftArmOffset: 0, rightArmOffset: 0 };
    if (player.isWalking) {
        offsets.bobOffset = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkBobAmplitude;
        var legSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkLegSwingAmplitude;
        offsets.leftLegOffset = legSwing; offsets.rightLegOffset = -legSwing;
        var armSwing = Math.sin(player.walkAnimationFrame * Math.PI / 2) * this.animations.walkArmSwingAmplitude;
        offsets.leftArmOffset = -armSwing; offsets.rightArmOffset = armSwing;
    }
    return offsets;
};

BaseCharacter.prototype.render = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    y += offsets.bobOffset;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    this.renderBody(ctx, x, y, player); this.renderHead(ctx, x, y, player);
    this.renderArms(ctx, x, y, player); this.renderLegs(ctx, x, y, player);
    ctx.restore();
};

BaseCharacter.prototype.renderBody = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.clothes; ctx.fillRect(x - 10, y - 6, 20, 18);
    ctx.fillStyle = this.colors.clothesShadow; ctx.fillRect(x + 8, y - 4, 2, 14); ctx.fillRect(x - 8, y + 10, 16, 2);
    ctx.fillStyle = this.colors.clothesDetail; ctx.fillRect(x - 6, y - 2, 2, 8); ctx.fillRect(x + 4, y + 2, 2, 6);
};

BaseCharacter.prototype.renderHead = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.skin; ctx.fillRect(x - 10, y - 20, 20, 16);
    ctx.fillStyle = this.colors.skinHighlight; ctx.fillRect(x - 8, y - 18, 4, 4); ctx.fillRect(x + 4, y - 16, 4, 3);
    ctx.fillStyle = this.colors.skinShadow; ctx.fillRect(x + 8, y - 16, 2, 12); ctx.fillRect(x - 6, y - 6, 12, 2);
    this.renderHair(ctx, x, y, player); this.renderFacialFeatures(ctx, x, y, player);
};

BaseCharacter.prototype.renderHair = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(x - 12, y - 28, 24, 12); ctx.fillRect(x - 10, y - 32, 20, 6);
    ctx.fillRect(x - 14, y - 26, 4, 8); ctx.fillRect(x + 10, y - 26, 4, 8);
    ctx.fillRect(x - 8, y - 22, 16, 4); ctx.fillRect(x - 4, y - 24, 8, 2);
    ctx.fillStyle = this.colors.hairHighlight;
    ctx.fillRect(x - 6, y - 30, 3, 2); ctx.fillRect(x + 3, y - 32, 3, 2); ctx.fillRect(x - 2, y - 22, 4, 1);
};

BaseCharacter.prototype.renderFacialFeatures = function(ctx, x, y, player) {
    if (this.features.hasGlasses) this.renderGlasses(ctx, x, y, player);
    else this.renderEyes(ctx, x, y, player);
    this.renderNose(ctx, x, y, player); this.renderMouth(ctx, x, y, player);
};

BaseCharacter.prototype.renderGlasses = function(ctx, x, y, player) {
    ctx.fillStyle = '#000000'; ctx.fillRect(x - 8, y - 18, 16, 6);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 7, y - 17, 6, 4); ctx.fillRect(x + 1, y - 17, 6, 4);
    ctx.fillStyle = '#333333'; ctx.fillRect(x - 6, y - 17, 2, 1); ctx.fillRect(x + 2, y - 17, 2, 1);
    ctx.fillStyle = '#555555'; ctx.fillRect(x - 7, y - 16, 1, 2); ctx.fillRect(x + 6, y - 16, 1, 2);
    ctx.fillStyle = '#000000'; ctx.fillRect(x - 1, y - 17, 2, 2);
    ctx.fillRect(x - 10, y - 17, 2, 1); ctx.fillRect(x + 8, y - 17, 2, 1);
};

BaseCharacter.prototype.renderEyes = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.eyes; ctx.fillRect(x - 6, y - 16, 3, 2); ctx.fillRect(x + 3, y - 16, 3, 2);
    ctx.fillStyle = this.colors.eyesHighlight; ctx.fillRect(x - 5, y - 16, 1, 1); ctx.fillRect(x + 4, y - 16, 1, 1);
};

BaseCharacter.prototype.renderNose = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.skinShadow; ctx.fillRect(x - 1, y - 12, 2, 2);
    ctx.fillStyle = this.colors.skinHighlight; ctx.fillRect(x, y - 13, 1, 1);
};

BaseCharacter.prototype.renderMouth = function(ctx, x, y, player) {
    ctx.fillStyle = this.colors.mouth; ctx.fillRect(x - 2, y - 10, 4, 1);
    ctx.fillStyle = this.colors.mouthShadow; ctx.fillRect(x - 1, y - 9, 2, 1);
};

BaseCharacter.prototype.renderArms = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 14, y - 4 + offsets.leftArmOffset, 4, 10); ctx.fillRect(x - 16, y + 4 + offsets.leftArmOffset, 4, 8);
    ctx.fillRect(x + 10, y - 4 + offsets.rightArmOffset, 4, 10); ctx.fillRect(x + 12, y + 4 + offsets.rightArmOffset, 4, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 12, y + 2 + offsets.leftArmOffset, 2, 4); ctx.fillRect(x + 10, y + 2 + offsets.rightArmOffset, 2, 4);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 18, y + 10 + offsets.leftArmOffset, 4, 4); ctx.fillRect(x + 14, y + 10 + offsets.rightArmOffset, 4, 4);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 16, y + 12 + offsets.leftArmOffset, 2, 2); ctx.fillRect(x + 14, y + 12 + offsets.rightArmOffset, 2, 2);
};

BaseCharacter.prototype.renderLegs = function(ctx, x, y, player) {
    var offsets = this.calculateAnimationOffsets(player);
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(x - 6, y + 12 + offsets.leftLegOffset, 5, 14); ctx.fillRect(x - 7, y + 24 + offsets.leftLegOffset, 5, 8);
    ctx.fillRect(x + 1, y + 12 + offsets.rightLegOffset, 5, 14); ctx.fillRect(x + 2, y + 24 + offsets.rightLegOffset, 5, 8);
    ctx.fillStyle = this.colors.skinShadow;
    ctx.fillRect(x - 2, y + 20 + offsets.leftLegOffset, 2, 6); ctx.fillRect(x + 1, y + 20 + offsets.rightLegOffset, 2, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 10, y + 30 + offsets.leftLegOffset, 8, 5); ctx.fillRect(x + 2, y + 30 + offsets.rightLegOffset, 8, 5);
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(x - 8, y + 32 + offsets.leftLegOffset, 4, 2); ctx.fillRect(x + 4, y + 32 + offsets.rightLegOffset, 4, 2);
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(x - 9, y + 30 + offsets.leftLegOffset, 2, 1); ctx.fillRect(x + 7, y + 30 + offsets.rightLegOffset, 2, 1);
};

// 人物管理器
function CharacterManager() {
    this.characters = {}; this.currentCharacterId = 1; this.initializeCharacters();
}

CharacterManager.prototype.initializeCharacters = function() {
    var configs = [
        {id: 1, name: '酷炫墨镜哥', colors: {clothes: '#FFFFFF', hair: '#1A1A1A'}, features: {hasGlasses: true}},
        {id: 2, name: '金发女战士', colors: {clothes: '#8E24AA', hair: '#FFD700'}, features: {hasGlasses: false}},
        {id: 3, name: '暗影忍者', colors: {clothes: '#212121', hair: '#1A1A1A'}, features: {hasGlasses: false}},
        {id: 4, name: '机械工程师', colors: {clothes: '#FF9800', hair: '#795548'}, features: {hasGlasses: true}},
        {id: 5, name: '魔法师', colors: {clothes: '#3F51B5', hair: '#9C27B0'}, features: {hasGlasses: false}},
        {id: 6, name: '海盗船长', colors: {clothes: '#8D6E63', hair: '#FF5722'}, features: {hasGlasses: false}},
        {id: 7, name: '太空探险家', colors: {clothes: '#607D8B', hair: '#CDDC39'}, features: {hasGlasses: true}},
        {id: 8, name: '武士', colors: {clothes: '#F44336', hair: '#424242'}, features: {hasGlasses: false}},
        {id: 9, name: '摇滚歌手', colors: {clothes: '#E91E63', hair: '#FF1744'}, features: {hasGlasses: true}},
        {id: 10, name: '神秘学者', colors: {clothes: '#009688', hair: '#37474F'}, features: {hasGlasses: false}},
        {id: 11, name: '赛车手', colors: {clothes: '#FF5722', hair: '#FFC107'}, features: {hasGlasses: true}},
        {id: 12, name: '军事指挥官', colors: {clothes: '#4CAF50', hair: '#616161'}, features: {hasGlasses: false}},
        {id: 13, name: '幽灵猎人', colors: {clothes: '#9E9E9E', hair: '#212121'}, features: {hasGlasses: true}},
        {id: 14, name: '网络黑客', colors: {clothes: '#00E676', hair: '#1DE9B6'}, features: {hasGlasses: false}},
        {id: 15, name: '西部牛仔', colors: {clothes: '#8D6E63', hair: '#FFAB40'}, features: {hasGlasses: true}},
        {id: 16, name: '外星访客', colors: {clothes: '#00BCD4', hair: '#4FC3F7'}, features: {hasGlasses: false}},
        {id: 17, name: '格斗冠军', colors: {clothes: '#FF9800', hair: '#795548'}, features: {hasGlasses: true}},
        {id: 18, name: '时间旅行者', colors: {clothes: '#673AB7', hair: '#9C27B0'}, features: {hasGlasses: false}},
        {id: 19, name: '机器人', colors: {clothes: '#546E7A', hair: '#90A4AE'}, features: {hasGlasses: true}},
        {id: 20, name: '超级英雄', colors: {clothes: '#2196F3', hair: '#FFC107'}, features: {hasGlasses: false}}
    ];
    for (var i = 0; i < configs.length; i++) this.characters[configs[i].id] = new BaseCharacter(configs[i]);
};

CharacterManager.prototype.getCurrentCharacter = function() {
    return this.characters[this.currentCharacterId] || this.characters[1];
};

CharacterManager.prototype.switchCharacter = function(characterId) {
    if (characterId >= 1 && characterId <= 20 && this.characters[characterId]) {
        this.currentCharacterId = characterId; return true;
    }
    return false;
};

CharacterManager.prototype.renderCurrentCharacter = function(ctx, x, y, player) {
    var character = this.getCurrentCharacter();
    if (character) character.render(ctx, x, y, player);
};

/**
 * 游戏引擎构造函数 - 兼容抖音小程序环境
 */
function GameEngine(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.running = false;
    this.gameState = 'menu'; // menu, playing, submap, gameover, victory
    this.lastTime = 0;
    
    // 初始化人物管理器
    this.characterManager = new CharacterManager();
    
    // 游戏数据
    this.gameData = {
        survivalDays: 1,
        food: 5,
        teamSize: 1,
        maxTeamSize: 1,
        zombieKills: 0,
        totalFood: 5,
        isDay: true,
        timeRemaining: 300000, // 5分钟白天
        gameStartTime: Date.now()
    };
    
    // 地图配置
    this.mapConfig = {
        width: 10000,       // 地图总宽度 (扩大5倍容纳500个建筑)
        height: 10000,      // 地图总高度 (扩大5倍容纳500个建筑)
        blockSize: 450,     // 每个街区大小 (建筑约占半屏)
        streetWidth: 200,   // 街道宽度 (进一步拓宽)
        buildingSpacing: 0  // 建筑间距 (设为0，建筑占满格子)
    };
    
    // 摄像机系统
    this.camera = {
        x: 0,
        y: 0,
        followTarget: null,
        smoothing: 0.1,
        zoom: 0.8  // 调整缩放因子，0.8倍缩小以适应大建筑
    };
    
    // 游戏对象
    this.buildings = this.initializeBuildings();
    this.player = { 
        x: this.mapConfig.width / 2, 
        y: this.mapConfig.height / 2, 
        health: 20, 
        maxHealth: 20, 
        level: 1,
        // 添加动画相关属性
        isWalking: false,
        walkAnimationFrame: 0,
        walkAnimationSpeed: 200, // 毫秒
        lastAnimationTime: 0,
        direction: 'down' // 'up', 'down', 'left', 'right'
    };
    this.companions = [];
    this.currentBuilding = null;
    this.exploredBuildings = [];
    this.nearBuilding = null; // 当前接近的建筑
    
    // 设置摄像机跟随玩家
    this.camera.followTarget = this.player;
    
    // 子地图状态
    this.zombies = [];
    this.resources = [];
    this.subMapType = null;
    
    this.setupInput();
    console.log('[GameEngine] 游戏引擎已初始化');
}

/**
 * 初始化建筑物 - 生成约100个建筑的大地图
 */
GameEngine.prototype.initializeBuildings = function() {
    var buildings = [];
    var buildingId = 1;
    
    // 建筑类型定义
    var buildingTypes = this.getBuildingTypes();
    
    // 计算网格参数
    var blocksX = Math.floor(this.mapConfig.width / this.mapConfig.blockSize);
    var blocksY = Math.floor(this.mapConfig.height / this.mapConfig.blockSize);
    
    // 为每个街区生成建筑
    for (var blockX = 0; blockX < blocksX; blockX++) {
        for (var blockY = 0; blockY < blocksY; blockY++) {
            // 每个街区只选择一种建筑类型
            var typeIndex = Math.floor(Math.random() * buildingTypes.length);
            var buildingType = buildingTypes[typeIndex];
            
            // 每个街区只有一个建筑，占满整个格子
            var position = this.calculateBuildingPosition(blockX, blockY);
            
            if (position) {
                var building = {
                    id: buildingType.type + '_' + buildingId,
                    name: buildingType.name,
                    type: buildingType.type,
                    x: position.x,
                    y: position.y,
                    width: position.width,
                    height: position.height,
                    explored: false,
                    color: buildingType.color,
                    oneTimeOnly: buildingType.oneTimeOnly || false,
                    blockX: blockX,
                    blockY: blockY
                };
                
                buildings.push(building);
                buildingId++;
            }
        }
    }
    
    console.log('[GameEngine] 生成了 ' + buildings.length + ' 个建筑');
    return buildings;
};

/**
 * 获取建筑类型定义
 */
GameEngine.prototype.getBuildingTypes = function() {
    return [
        // 重要建筑（较少）
        { type: 'police_station', name: '警察局', width: 80, height: 80, color: '#3498db', weight: 1 },
        { type: 'hospital', name: '医院', width: 80, height: 80, color: '#e74c3c', weight: 1 },
        { type: 'school', name: '学校', width: 70, height: 70, color: '#f39c12', weight: 2 },
        { type: 'station', name: '车站', width: 70, height: 60, color: '#34495e', weight: 2 },
        { type: 'mall', name: '商场', width: 90, height: 70, color: '#27ae60', weight: 1 },
        
        // 商业建筑（中等）
        { type: 'shop', name: '商店', width: 60, height: 50, color: '#27ae60', weight: 4, oneTimeOnly: true },
        { type: 'restaurant', name: '餐厅', width: 60, height: 50, color: '#e67e22', weight: 4, oneTimeOnly: true },
        { type: 'bar', name: '酒吧', width: 50, height: 50, color: '#d35400', weight: 3, oneTimeOnly: true },
        { type: 'cafe', name: '咖啡厅', width: 50, height: 50, color: '#8e44ad', weight: 3 },
        { type: 'bank', name: '银行', width: 70, height: 60, color: '#2c3e50', weight: 2 },
        
        // 住宅建筑（较多）
        { type: 'house', name: '民房', width: 50, height: 50, color: '#95a5a6', weight: 8 },
        { type: 'villa', name: '别墅', width: 80, height: 60, color: '#8e44ad', weight: 4 },
        { type: 'apartment', name: '公寓', width: 60, height: 80, color: '#7f8c8d', weight: 6 },
        
        // 工业建筑（少量）
        { type: 'factory', name: '工厂', width: 90, height: 70, color: '#555555', weight: 2 },
        { type: 'warehouse', name: '仓库', width: 80, height: 60, color: '#666666', weight: 3 },
        
        // 其他建筑
        { type: 'gas_station', name: '加油站', width: 70, height: 50, color: '#f1c40f', weight: 2 },
        { type: 'gym', name: '健身房', width: 60, height: 60, color: '#9b59b6', weight: 2 },
        { type: 'library', name: '图书馆', width: 70, height: 70, color: '#16a085', weight: 1 }
    ];
};

/**
 * 计算建筑在街区中的位置 - 占满整个格子
 */
GameEngine.prototype.calculateBuildingPosition = function(blockX, blockY) {
    // 计算街区的起始位置
    var blockStartX = blockX * this.mapConfig.blockSize;
    var blockStartY = blockY * this.mapConfig.blockSize;
    
    // 建筑占满整个格子，但要避开街道
    var buildingX = blockStartX + this.mapConfig.streetWidth;
    var buildingY = blockStartY + this.mapConfig.streetWidth;
    var buildingWidth = this.mapConfig.blockSize - this.mapConfig.streetWidth;
    var buildingHeight = this.mapConfig.blockSize - this.mapConfig.streetWidth;
    
    // 确保建筑不会超出地图边界
    if (buildingX + buildingWidth > this.mapConfig.width ||
        buildingY + buildingHeight > this.mapConfig.height) {
        return null;
    }
    
    return { 
        x: buildingX, 
        y: buildingY, 
        width: buildingWidth, 
        height: buildingHeight 
    };
};

/**
 * 设置输入处理
 */
GameEngine.prototype.setupInput = function() {
    var self = this;
    
    this.joystick = {
        active: false,
        centerX: 80,              // 固定在左下角
        centerY: 0,               // 将在init中设置
        currentX: 80,
        currentY: 0,
        direction: { x: 0, y: 0 },
        radius: 60,               // 摇杆外圈半径
        knobRadius: 20,           // 摇杆内圈半径
        visible: true,            // 始终可见
        maxDistance: 50           // 摇杆最大移动距离
    };
    
    // 初始化摇杆位置
    this.joystick.centerY = this.canvas.height - 80;
    this.joystick.currentY = this.joystick.centerY;
    
    // 抖音小程序触摸事件
    if (typeof tt !== 'undefined') {
        // 使用抖音小程序的触摸事件API
        this.canvas.addEventListener('touchstart', function(e) {
            self.onTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function(e) {
            self.onTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function(e) {
            self.onTouchEnd(e);
        });
        this.canvas.addEventListener('tap', function(e) {
            self.onClick(e);
        });
    } else {
        // 标准浏览器事件
        this.canvas.addEventListener('touchstart', function(e) {
            self.onTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function(e) {
            self.onTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function(e) {
            self.onTouchEnd(e);
        });
        this.canvas.addEventListener('click', function(e) {
            self.onClick(e);
        });
    }
    
    console.log('[GameEngine] 输入系统已初始化');
};

/**
 * 触摸开始
 */
GameEngine.prototype.onTouchStart = function(e) {
    if (e.preventDefault) e.preventDefault();
    
    var touch = e.touches && e.touches[0] ? e.touches[0] : e;
    var x, y;
    
    // 抖音小程序坐标处理
    if (touch.x !== undefined && touch.y !== undefined) {
        x = touch.x;
        y = touch.y;
    } else if (touch.clientX !== undefined && touch.clientY !== undefined) {
        x = touch.clientX;
        y = touch.clientY;
    } else {
        x = 0;
        y = 0;
    }
    
    console.log('[Input] 触摸开始位置:', x, y);
    
    // 保存触摸开始位置，用于后续的tap检测
    this.touchStartX = x;
    this.touchStartY = y;
    this.touchStartTime = Date.now();
    
    // 检查是否在虚拟摇杆区域
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        var joystickDistance = Math.sqrt(
            Math.pow(x - this.joystick.centerX, 2) + 
            Math.pow(y - this.joystick.centerY, 2)
        );
        
        if (joystickDistance <= this.joystick.radius) {
            this.joystick.active = true;
            this.joystick.currentX = x;
            this.joystick.currentY = y;
            this.updateJoystickDirection();
            console.log('[Input] 虚拟摇杆激活');
        }
    }
};

/**
 * 触摸移动
 */
GameEngine.prototype.onTouchMove = function(e) {
    if (e.preventDefault) e.preventDefault();
    if (!this.joystick.active) return;
    
    var touch = e.touches && e.touches[0] ? e.touches[0] : e;
    var x, y;
    
    // 抖音小程序坐标处理
    if (touch.x !== undefined && touch.y !== undefined) {
        x = touch.x;
        y = touch.y;
    } else if (touch.clientX !== undefined && touch.clientY !== undefined) {
        x = touch.clientX;
        y = touch.clientY;
    } else {
        return;
    }
    
    // 限制摇杆移动范围
    var dx = x - this.joystick.centerX;
    var dy = y - this.joystick.centerY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= this.joystick.maxDistance) {
        this.joystick.currentX = x;
        this.joystick.currentY = y;
    } else {
        // 限制在最大距离内
        var angle = Math.atan2(dy, dx);
        this.joystick.currentX = this.joystick.centerX + Math.cos(angle) * this.joystick.maxDistance;
        this.joystick.currentY = this.joystick.centerY + Math.sin(angle) * this.joystick.maxDistance;
    }
    
    this.updateJoystickDirection();
};

/**
 * 触摸结束
 */
GameEngine.prototype.onTouchEnd = function(e) {
    if (e.preventDefault) e.preventDefault();
    console.log('[Input] 触摸结束');
    
    // 检测是否为快速点击（tap）
    var touchEndTime = Date.now();
    var touchDuration = touchEndTime - this.touchStartTime;
    
    if (touchDuration < 300 && !this.joystick.active) { // 300ms内的快速触摸且不是摇杆操作
        console.log('[Input] 检测到点击手势，触发点击事件');
        // 模拟点击事件
        this.onClick({
            x: this.touchStartX,
            y: this.touchStartY
        });
    }
    
    // 重置摇杆状态
    this.joystick.active = false;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;
};

/**
 * 更新摇杆方向
 */
GameEngine.prototype.updateJoystickDirection = function() {
    var dx = this.joystick.currentX - this.joystick.centerX;
    var dy = this.joystick.currentY - this.joystick.centerY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) { // 死区，避免微小抖动
        var normalizedDistance = Math.min(distance, this.joystick.maxDistance) / this.joystick.maxDistance;
        this.joystick.direction.x = (dx / distance) * normalizedDistance;
        this.joystick.direction.y = (dy / distance) * normalizedDistance;
    } else {
        this.joystick.direction.x = 0;
        this.joystick.direction.y = 0;
    }
};

/**
 * 点击事件
 */
GameEngine.prototype.onClick = function(e) {
    var x, y;
    
    // 抖音小程序坐标处理
    if (e.x !== undefined && e.y !== undefined) {
        x = e.x;
        y = e.y;
    } else if (e.clientX !== undefined && e.clientY !== undefined) {
        x = e.clientX;
        y = e.clientY;
    } else if (e.touches && e.touches[0]) {
        var touch = e.touches[0];
        x = touch.x || touch.clientX || 0;
        y = touch.y || touch.clientY || 0;
    } else {
        x = 0;
        y = 0;
    }
    
    console.log('[Input] 点击位置:', x, y, '游戏状态:', this.gameState);
    
    if (this.gameState === 'menu') {
        this.handleMenuClick(x, y);
    } else if (this.gameState === 'playing') {
        this.handleGameClick(x, y);
    } else if (this.gameState === 'submap') {
        this.handleSubMapClick(x, y);
    } else if (this.gameState === 'gameover' || this.gameState === 'victory') {
        this.handleEndGameClick(x, y);
    }
};

/**
 * 处理菜单点击
 */
GameEngine.prototype.handleMenuClick = function(x, y) {
    console.log('[Menu] 菜单点击检测:', x, y);
    
    // 开始游戏按钮区域 (更新为新的按钮位置和大小)
    var centerX = this.canvas.width / 2;
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    var buttonY = 320;
    
    console.log('[Menu] 按钮区域:', buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight);
    
    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('[Menu] 按钮点击成功，开始游戏');
        this.startGame();
    } else {
        console.log('[Menu] 点击位置不在按钮范围内');
    }
};

/**
 * 处理游戏点击
 */
GameEngine.prototype.handleGameClick = function(x, y) {
    console.log('[Click] 游戏中点击:', x, y);
    
    // 现在只使用自动进入，不需要点击触发
    console.log('[Click] 游戏中点击事件，当前为自动进入模式');
};

/**
 * 处理子地图点击
 */
GameEngine.prototype.handleSubMapClick = function(x, y) {
    var self = this;
    // 检查返回按钮
    if (x >= 10 && x <= 90 && y >= this.canvas.height - 40 && y <= this.canvas.height - 10) {
        this.exitSubMap();
        return;
    }
    
    // 检查资源点击
    this.resources.forEach(function(resource) {
        if (!resource.collected) {
            var distance = Math.sqrt((x - resource.x) * (x - resource.x) + (y - resource.y) * (y - resource.y));
            if (distance <= 30) {
                self.collectResource(resource);
            }
        }
    });
};

/**
 * 处理结束画面点击
 */
GameEngine.prototype.handleEndGameClick = function(x, y) {
    // 重新开始按钮
    if (x >= 175 && x <= 325 && y >= 320 && y <= 360) {
        this.restartGame();
    }
};

/**
 * 开始游戏
 */
GameEngine.prototype.startGame = function() {
    console.log('[GameEngine] 开始游戏函数被调用');
    this.gameState = 'playing';
    console.log('[GameEngine] 游戏状态已切换到:', this.gameState);
};

/**
 * 重新开始游戏
 */
GameEngine.prototype.restartGame = function() {
    this.gameData = {
        survivalDays: 1,
        food: 5,
        teamSize: 1,
        maxTeamSize: 1,
        zombieKills: 0,
        totalFood: 5,
        isDay: true,
        timeRemaining: 300000,
        gameStartTime: Date.now()
    };
    
    this.player = { 
        x: this.mapConfig.width / 2, 
        y: this.mapConfig.height / 2, 
        health: 20, 
        maxHealth: 20, 
        level: 1 
    };
    this.companions = [];
    this.exploredBuildings = [];
    this.nearBuilding = null;
    
    var self = this;
    this.buildings.forEach(function(building) {
        building.explored = false;
    });
    
    this.gameState = 'playing';
    console.log('[GameEngine] 游戏重新开始');
};

/**
 * 探索建筑物
 */
GameEngine.prototype.exploreBuilding = function(building) {
    console.log('[GameEngine] 尝试探索建筑:', building.name, '类型:', building.type);
    
    if (building.oneTimeOnly && building.explored) {
        console.log('[GameEngine] 该建筑物只能探索一次，已探索过');
        return;
    }
    
    console.log('[GameEngine] 开始进入建筑: ' + building.name);
    console.log('[GameEngine] 当前游戏状态:', this.gameState, '→ submap');
    
    this.currentBuilding = building;
    this.subMapType = building.type;
    this.gameState = 'submap';
    
    // 将玩家放在子地图入口处（上方进入）
    this.player.x = 200; // 子地图中心X
    this.player.y = 130; // 子地图上方，刚进入房间
    
    console.log('[GameEngine] 玩家位置设为:', this.player.x, this.player.y);
    
    // 生成子地图内容
    this.generateSubMapContent();
    
    console.log('[GameEngine] 建筑进入完成，当前状态:', this.gameState);
};

/**
 * 生成子地图内容
 */
GameEngine.prototype.generateSubMapContent = function() {
    this.zombies = [];
    this.resources = [];
    
    // 生成僵尸
    this.generateZombies();
    
    // 生成资源
    this.generateResources();
    
    console.log('[GameEngine] 子地图内容生成完成: ' + this.zombies.length + '只僵尸, ' + this.resources.length + '个资源');
};

/**
 * 生成僵尸
 */
GameEngine.prototype.generateZombies = function() {
    var random = Math.random();
    var count;
    
    if (random < 0.1) {
        count = 5 + Math.floor(Math.random() * 4); // 5-8只
    } else if (random < 0.3) {
        count = 1 + Math.floor(Math.random() * 2); // 1-2只
    } else {
        count = 3 + Math.floor(Math.random() * 2); // 3-4只
    }
    
    for (var i = 0; i < count; i++) {
        var zombie = {
            id: Math.random().toString(36).substr(2, 9),
            x: 80 + Math.random() * 240,
            y: 120 + Math.random() * 160,
            health: 15,
            maxHealth: 15,
            attack: this.gameData.isDay ? 5 : 10,
            moveSpeed: this.gameData.isDay ? 2 : 4,
            state: 'patrol',
            target: null,
            lastAttackTime: 0
        };
        
        this.zombies.push(zombie);
    }
};

/**
 * 生成资源
 */
GameEngine.prototype.generateResources = function() {
    var resourceChance = this.getResourceChance();
    
    if (Math.random() < resourceChance) {
        var resourceType = this.getResourceType();
        var resource = this.createResource(resourceType);
        
        if (resource) {
            this.resources.push(resource);
        }
    }
};

/**
 * 获取资源生成概率
 */
GameEngine.prototype.getResourceChance = function() {
    switch (this.subMapType) {
        case 'police_station':
        case 'hospital':
        case 'restaurant':
            return 0.8;
        case 'shop':
            return 0.6;
        case 'school':
        case 'house':
        case 'villa':
            return 0.7;
        default:
            return 0.3;
    }
};

/**
 * 获取资源类型
 */
GameEngine.prototype.getResourceType = function() {
    switch (this.subMapType) {
        case 'police_station':
            return 'companion_police';
        case 'hospital':
            return 'companion_nurse';
        case 'restaurant':
            return 'companion_chef';
        case 'shop':
            return Math.random() < 0.5 ? 'weapon' : 'weapon';
        case 'school':
        case 'house':
        case 'villa':
            return 'food';
        default:
            return 'food';
    }
};

/**
 * 创建资源
 */
GameEngine.prototype.createResource = function(type) {
    var resource = {
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 80,
        collected: false
    };
    
    switch (type) {
        case 'companion_police':
            resource.companionData = { name: '警察', type: 'police', health: 20, attack: 25, special: '远程攻击' };
            break;
        case 'companion_nurse':
            resource.companionData = { name: '护士', type: 'nurse', health: 15, attack: 8, special: '群体回血' };
            break;
        case 'companion_chef':
            resource.companionData = { name: '厨师', type: 'chef', health: 15, attack: 8, special: '每日产粮' };
            break;
        case 'food':
            resource.amount = this.getFoodAmount();
            break;
        case 'weapon':
            resource.weaponData = { name: '近战武器', damage: 10 };
            break;
    }
    
    return resource;
};

/**
 * 获取食物数量
 */
GameEngine.prototype.getFoodAmount = function() {
    switch (this.subMapType) {
        case 'school':
            return 3 + Math.floor(Math.random() * 3);
        case 'house':
            return 2 + Math.floor(Math.random() * 2);
        case 'villa':
            return 4 + Math.floor(Math.random() * 3);
        default:
            return 2 + Math.floor(Math.random() * 3);
    }
};

/**
 * 收集资源
 */
GameEngine.prototype.collectResource = function(resource) {
    if (resource.collected) return;
    
    resource.collected = true;
    
    switch (resource.type) {
        case 'companion_police':
        case 'companion_nurse':
        case 'companion_chef':
            if (this.companions.length < 7) { // 团队上限8人
                this.companions.push(resource.companionData);
                this.gameData.teamSize++;
                if (this.gameData.teamSize > this.gameData.maxTeamSize) {
                    this.gameData.maxTeamSize = this.gameData.teamSize;
                }
                console.log('[GameEngine] 新伙伴加入: ' + resource.companionData.name);
            }
            break;
        case 'food':
            this.gameData.food += resource.amount;
            this.gameData.totalFood += resource.amount;
            console.log('[GameEngine] 获得 ' + resource.amount + ' 份口粮');
            break;
        case 'weapon':
            this.player.attack = (this.player.attack || 20) + resource.weaponData.damage;
            console.log('[GameEngine] 获得武器，攻击力提升');
            break;
    }
};

/**
 * 退出子地图
 */
GameEngine.prototype.exitSubMap = function() {
    if (this.currentBuilding) {
        this.currentBuilding.explored = true;
        this.exploredBuildings.push(this.currentBuilding.id);
    }
    
    this.gameState = 'playing';
    this.currentBuilding = null;
    this.subMapType = null;
    this.zombies = [];
    this.resources = [];
    
    console.log('[GameEngine] 退出子地图');
};

/**
 * 启动游戏循环
 */
GameEngine.prototype.start = function() {
    this.running = true;
    this.lastTime = Date.now();
    this.gameLoop();
    console.log('[GameEngine] 游戏主循环启动');
};

/**
 * 游戏主循环
 */
GameEngine.prototype.gameLoop = function() {
    var self = this;
    
    if (!this.running) return;
    
    var currentTime = Date.now();
    var deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame(function() {
        self.gameLoop();
    });
};

/**
 * 更新游戏逻辑
 */
GameEngine.prototype.update = function(deltaTime) {
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        this.updatePlayer(deltaTime);
        this.updateTime(deltaTime);
        
        if (this.gameState === 'submap') {
            this.updateZombies(deltaTime);
        }
    }
};

/**
 * 更新玩家
 */
GameEngine.prototype.updatePlayer = function(deltaTime) {
    var isMoving = (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0);
    
    if (isMoving) {
        // 设置行走状态
        this.player.isWalking = true;
        
        // 更新行走方向
        if (Math.abs(this.joystick.direction.x) > Math.abs(this.joystick.direction.y)) {
            this.player.direction = this.joystick.direction.x > 0 ? 'right' : 'left';
        } else {
            this.player.direction = this.joystick.direction.y > 0 ? 'down' : 'up';
        }
        
        // 更新行走动画帧
        this.updateWalkAnimation(deltaTime);
        
        var moveSpeed = 4; // 调整移动速度为原来的1/3
        var newX = this.player.x + this.joystick.direction.x * moveSpeed;
        var newY = this.player.y + this.joystick.direction.y * moveSpeed;
        
        // 边界检查
        if (this.gameState === 'playing') {
            // 超大地图边界检查
            newX = Math.max(100, Math.min(this.mapConfig.width - 100, newX));
            newY = Math.max(100, Math.min(this.mapConfig.height - 100, newY));
            
            // 碰撞检测
            var collisionResult = this.checkCollisionWithBuildings(newX, newY);
            if (!collisionResult.collision) {
                this.player.x = newX;
                this.player.y = newY;
            } else {
                // 尝试单轴移动
                var canMoveX = !this.checkCollisionWithBuildings(newX, this.player.y).collision;
                var canMoveY = !this.checkCollisionWithBuildings(this.player.x, newY).collision;
                
                if (canMoveX) {
                    this.player.x = newX;
                }
                if (canMoveY) {
                    this.player.y = newY;
                }
            }
            
            // 检查是否接近建筑门
            this.checkNearDoor();
            
        } else if (this.gameState === 'submap') {
            this.player.x = Math.max(60, Math.min(340, newX));
            this.player.y = Math.max(110, Math.min(290, newY));
        }
        
    } else {
        // 停止行走状态
        this.player.isWalking = false;
        this.player.walkAnimationFrame = 0;
    }
    
    // 更新摄像机位置
    if (this.gameState === 'playing') {
        this.updateCamera(deltaTime);
    }
};

/**
 * 更新行走动画
 */
GameEngine.prototype.updateWalkAnimation = function(deltaTime) {
    this.player.lastAnimationTime += deltaTime;
    
    if (this.player.lastAnimationTime >= this.player.walkAnimationSpeed) {
        this.player.walkAnimationFrame = (this.player.walkAnimationFrame + 1) % 4; // 4帧循环
        this.player.lastAnimationTime = 0;
    }
};

/**
 * 检查玩家与建筑的碰撞
 */
GameEngine.prototype.checkCollisionWithBuildings = function(x, y) {
    var playerRadius = 18; // 玩家半径
    var self = this;
    
    // 检查可见区域内的建筑
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;
    
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        
        // 只检查可见区域内的建筑
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
            // 计算门的位置和尺寸
            var doorInfo = this.calculateDoorInfo(building);
            
            // 检查是否与建筑主体碰撞（排除门区域）
            if (this.circleRectCollision(x, y, playerRadius, building.x, building.y, building.width, building.height)) {
                // 检查是否在门区域内
                if (!this.circleRectCollision(x, y, playerRadius, doorInfo.x, doorInfo.y, doorInfo.width, doorInfo.height)) {
                    return { collision: true, building: building };
                }
            }
        }
    }
    
    return { collision: false, building: null };
};

/**
 * 检查玩家是否接近建筑门
 */
GameEngine.prototype.checkNearDoor = function() {
    var playerRadius = 18;
    var interactionDistance = 30; // 交互距离
    var self = this;
    
    // 重置当前接近的建筑
    this.nearBuilding = null;
    
    // 检查可见区域内的建筑
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;
    
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        
        // 只检查可见区域内的建筑
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.x + doorInfo.width / 2;
            var doorCenterY = doorInfo.y + doorInfo.height / 2;
            
            // 计算玩家到门中心的距离
            var distance = Math.sqrt(
                Math.pow(this.player.x - doorCenterX, 2) + 
                Math.pow(this.player.y - doorCenterY, 2)
            );
            
            if (distance <= interactionDistance + playerRadius) {
                this.nearBuilding = building;
                
                // 显示详细调试信息（只在接近时）
                console.log('[Debug] 接近建筑:', building.name);
                console.log('[Debug] 建筑位置:', building.x, building.y, building.width, building.height);
                console.log('[Debug] 门位置:', doorInfo.x, doorInfo.y, doorInfo.width, doorInfo.height);
                console.log('[Debug] 门中心:', doorCenterX, doorCenterY);
                console.log('[Debug] 玩家位置:', this.player.x, this.player.y);
                console.log('[Debug] 距离:', distance, '触发距离:', playerRadius + 35);
                
                // 自动进入建筑 - 增大触发范围，更容易进入
                if (distance <= playerRadius + 35) {
                    console.log('[Door] 触发自动进入建筑:', building.name, '距离:', distance);
                    this.exploreBuilding(building);
                }
                break;
            }
        }
    }
};

/**
 * 计算建筑门的信息
 */
GameEngine.prototype.calculateDoorInfo = function(building) {
    var doorWidth = Math.max(30, Math.floor(building.width / 8));
    var doorHeight = Math.max(40, Math.floor(building.height / 6));
    var doorX = building.x + (building.width - doorWidth) / 2;
    var doorY = building.y + building.height - doorHeight - 5;
    
    return {
        x: doorX,
        y: doorY,
        width: doorWidth,
        height: doorHeight
    };
};

/**
 * 圆形与矩形碰撞检测
 */
GameEngine.prototype.circleRectCollision = function(circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight) {
    // 找到矩形上距离圆心最近的点
    var closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    var closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
    
    // 计算距离
    var distanceX = circleX - closestX;
    var distanceY = circleY - closestY;
    var distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    return distanceSquared < (circleRadius * circleRadius);
};

/**
 * 更新摄像机
 */
GameEngine.prototype.updateCamera = function(deltaTime) {
    if (!this.camera.followTarget) return;
    
    // 考虑缩放因子的视野大小
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    
    // 计算目标摄像机位置（让玩家居中）
    var targetX = this.camera.followTarget.x - viewWidth / 2;
    var targetY = this.camera.followTarget.y - viewHeight / 2;
    
    // 边界限制
    targetX = Math.max(0, Math.min(this.mapConfig.width - viewWidth, targetX));
    targetY = Math.max(0, Math.min(this.mapConfig.height - viewHeight, targetY));
    
    // 平滑跟随
    this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
    this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;
};

/**
 * 更新游戏时间
 */
GameEngine.prototype.updateTime = function(deltaTime) {
    var self = this;
    this.gameData.timeRemaining -= deltaTime;
    
    if (this.gameData.timeRemaining <= 0) {
        if (this.gameData.isDay) {
            this.gameData.isDay = false;
            this.gameData.timeRemaining = 60000; // 1分钟夜晚
            console.log('[GameEngine] 夜幕降临');
        } else {
            this.gameData.isDay = true;
            this.gameData.timeRemaining = 300000; // 5分钟白天
            this.gameData.survivalDays++;
            
            // 消耗口粮
            var foodCost = this.gameData.teamSize;
            this.gameData.food -= foodCost;
            
            console.log('[GameEngine] 第' + this.gameData.survivalDays + '天，消耗口粮' + foodCost + '份');
            
            // 检查口粮是否足够
            if (this.gameData.food < 0) {
                this.gameOver('starvation');
                return;
            }
            
            // 检查是否通关
            if (this.gameData.survivalDays > 100) {
                this.gameWin();
                return;
            }
            
            // 厨师每日产粮
            this.companions.forEach(function(companion) {
                if (companion.type === 'chef') {
                    self.gameData.food += 5;
                    self.gameData.totalFood += 5;
                }
            });
        }
    }
};

/**
 * 更新僵尸
 */
GameEngine.prototype.updateZombies = function(deltaTime) {
    var self = this;
    
    this.zombies.forEach(function(zombie) {
        // 简单的僵尸AI
        var dx = self.player.x - zombie.x;
        var dy = self.player.y - zombie.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100 && distance > 30) {
            // 追击玩家
            var moveDistance = zombie.moveSpeed * (deltaTime / 1000);
            zombie.x += (dx / distance) * moveDistance;
            zombie.y += (dy / distance) * moveDistance;
        } else if (distance <= 30) {
            // 攻击玩家
            var currentTime = Date.now();
            if (currentTime - zombie.lastAttackTime >= 1000) {
                self.player.health -= zombie.attack;
                zombie.lastAttackTime = currentTime;
                
                if (self.player.health <= 0) {
                    self.gameOver('death');
                }
            }
        }
    });
    
    // 移除死亡僵尸
    this.zombies = this.zombies.filter(function(zombie) {
        return zombie.health > 0;
    });
};

/**
 * 游戏结束
 */
GameEngine.prototype.gameOver = function(cause) {
    this.gameState = 'gameover';
    this.gameData.cause = cause;
    console.log('[GameEngine] 游戏结束: ' + cause);
};

/**
 * 游戏胜利
 */
GameEngine.prototype.gameWin = function() {
    this.gameState = 'victory';
    console.log('[GameEngine] 游戏胜利');
};

/**
 * 渲染游戏
 */
GameEngine.prototype.render = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    switch (this.gameState) {
        case 'menu':
            this.renderMenu();
            break;
        case 'playing':
            this.renderGame();
            break;
        case 'submap':
            this.renderSubMap();
            break;
        case 'gameover':
            this.renderGameOver();
            break;
        case 'victory':
            this.renderVictory();
            break;
    }
    
    // 渲染虚拟摇杆（游戏中始终显示）
    if (this.gameState === 'playing' || this.gameState === 'submap') {
        this.renderJoystick();
    }
};

/**
 * 渲染菜单
 */
GameEngine.prototype.renderMenu = function() {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 创建渐变背景
    var gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 添加背景装饰网格
    this.renderBackgroundGrid();
    
    // 添加末日风格装饰元素
    this.renderDecorations();
    
    // 游戏标题 - 主标题
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(255, 87, 51, 0.8)';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.fillStyle = '#ff5733';
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('末日Q行', centerX, 120);
    
    // 标题下方的装饰线
    this.ctx.strokeStyle = '#ff5733';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 100, 140);
    this.ctx.lineTo(centerX + 100, 140);
    this.ctx.stroke();
    this.ctx.restore();
    
    // 副标题
    this.ctx.fillStyle = '#e8e8e8';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('生存至100天的挑战', centerX, 170);
    
    // 游戏特色信息
    this.renderGameFeatures(centerX);
    
    // 开始游戏按钮 - 增强版
    this.renderStartButton(centerX);
    
    // 底部信息
    this.renderFooterInfo(centerX);
    
    this.ctx.textAlign = 'left';
};

/**
 * 渲染背景网格装饰
 */
GameEngine.prototype.renderBackgroundGrid = function() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    
    var gridSize = 40;
    
    // 垂直线
    for (var x = 0; x < this.canvas.width; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    }
    
    // 水平线
    for (var y = 0; y < this.canvas.height; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
    }
    
    this.ctx.restore();
};

/**
 * 渲染装饰元素
 */
GameEngine.prototype.renderDecorations = function() {
    var centerX = this.canvas.width / 2;
    
    // 左上角僵尸图标装饰
    this.ctx.save();
    this.ctx.fillStyle = '#8b0000';
    this.ctx.beginPath();
    this.ctx.arc(50, 50, 15, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(48, 48, 3, 0, Math.PI * 2);
    this.ctx.arc(52, 48, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    
    // 右上角警告标志
    this.ctx.save();
    this.ctx.strokeStyle = '#ff5733';
    this.ctx.fillStyle = '#ff5733';
    this.ctx.lineWidth = 3;
    
    var warningX = this.canvas.width - 50;
    var warningY = 50;
    
    this.ctx.beginPath();
    this.ctx.moveTo(warningX, warningY - 15);
    this.ctx.lineTo(warningX - 13, warningY + 15);
    this.ctx.lineTo(warningX + 13, warningY + 15);
    this.ctx.closePath();
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('!', warningX, warningY + 5);
    this.ctx.restore();
    
    // 底部装饰条
    var decorY = this.canvas.height - 60;
    this.ctx.fillStyle = 'rgba(255, 87, 51, 0.2)';
    this.ctx.fillRect(0, decorY, this.canvas.width, 4);
    
    this.ctx.fillStyle = 'rgba(255, 87, 51, 0.4)';
    this.ctx.fillRect(0, decorY + 8, this.canvas.width, 2);
};

/**
 * 渲染游戏特色信息
 */
GameEngine.prototype.renderGameFeatures = function(centerX) {
    var features = [
        '🧟 对抗僵尸群',
        '🏠 探索建筑物',
        '👥 招募伙伴',
        '🍞 管理资源'
    ];
    
    this.ctx.fillStyle = '#b8c6db';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    
    var startY = 200;
    var spacing = 25;
    
    for (var i = 0; i < features.length; i++) {
        this.ctx.fillText(features[i], centerX, startY + i * spacing);
    }
};

/**
 * 渲染增强版开始按钮
 */
GameEngine.prototype.renderStartButton = function(centerX) {
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    var buttonY = 320;
    
    // 按钮阴影
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 4;
    
    // 按钮渐变背景
    var buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
    buttonGradient.addColorStop(0, '#4CAF50');
    buttonGradient.addColorStop(0.5, '#45a049');
    buttonGradient.addColorStop(1, '#3d8b40');
    
    this.ctx.fillStyle = buttonGradient;
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 按钮发光效果
    this.ctx.shadowColor = 'rgba(76, 175, 80, 0.6)';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    this.ctx.restore();
    
    // 按钮文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🎮 开始游戏', centerX, buttonY + buttonHeight / 2 + 7);
    
    // 按钮装饰
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(buttonX + 5, buttonY + 5, buttonWidth - 10, buttonHeight - 10);
};

/**
 * 渲染底部信息
 */
GameEngine.prototype.renderFooterInfo = function(centerX) {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    
    var footerY = this.canvas.height - 30;
    this.ctx.fillText('点击开始按钮进入末日世界', centerX, footerY);
    
    // 版本信息
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.font = '10px Arial';
    this.ctx.fillText('v1.0 - 抖音小程序版', centerX, footerY + 15);
};

/**
 * 渲染游戏主界面
 */
GameEngine.prototype.renderGame = function() {
    // 保存上下文状态
    this.ctx.save();
    
    // 应用缩放和摄像机变换
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);
    
    // 渲染地图背景
    this.renderMapBackground();
    
    // 绘制街道网格
    this.renderStreetGrid();
    
    // 绘制可见区域内的建筑物
    this.renderVisibleBuildings();
    
    // 绘制玩家
    this.renderPlayer();
    
    // 恢复上下文状态
    this.ctx.restore();
    
    // 渲染UI（不受摄像机影响）
    this.renderStatusBar();
    this.renderTimeInfo();
    this.renderMiniMap();
    this.renderInteractionHint();
};

/**
 * 渲染地图背景
 */
GameEngine.prototype.renderMapBackground = function() {
    // 地图背景色
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(0, 0, this.mapConfig.width, this.mapConfig.height);
};

/**
 * 渲染街道网格
 */
GameEngine.prototype.renderStreetGrid = function() {
    this.ctx.fillStyle = '#2c3e50';
    var streetWidth = this.mapConfig.streetWidth;
    var blockSize = this.mapConfig.blockSize;
    
    // 计算考虑缩放后的可见区域
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var startX = Math.floor(this.camera.x / blockSize) * blockSize;
    var endX = startX + viewWidth + blockSize;
    var startY = Math.floor(this.camera.y / blockSize) * blockSize;
    var endY = startY + viewHeight + blockSize;
    
    // 绘制垂直街道
    for (var x = startX; x <= endX; x += blockSize) {
        if (x >= 0 && x <= this.mapConfig.width) {
            this.ctx.fillRect(x, Math.max(0, this.camera.y), streetWidth, 
                Math.min(viewHeight, this.mapConfig.height - this.camera.y));
        }
    }
    
    // 绘制水平街道
    for (var y = startY; y <= endY; y += blockSize) {
        if (y >= 0 && y <= this.mapConfig.height) {
            this.ctx.fillRect(Math.max(0, this.camera.x), y, 
                Math.min(viewWidth, this.mapConfig.width - this.camera.x), streetWidth);
        }
    }
    
    // 绘制街道标线
    this.renderStreetLines();
};

/**
 * 渲染街道标线
 */
GameEngine.prototype.renderStreetLines = function() {
    this.ctx.strokeStyle = '#f39c12';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    
    var blockSize = this.mapConfig.blockSize;
    var streetWidth = this.mapConfig.streetWidth;
    
    // 计算考虑缩放后的可见区域
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var startX = Math.floor(this.camera.x / blockSize) * blockSize;
    var endX = startX + viewWidth + blockSize;
    var startY = Math.floor(this.camera.y / blockSize) * blockSize;
    var endY = startY + viewHeight + blockSize;
    
    // 垂直道路标线
    for (var x = startX; x <= endX; x += blockSize) {
        if (x >= 0 && x <= this.mapConfig.width) {
            var lineX = x + streetWidth / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(lineX, Math.max(0, this.camera.y));
            this.ctx.lineTo(lineX, Math.min(this.camera.y + viewHeight, this.mapConfig.height));
            this.ctx.stroke();
        }
    }
    
    // 水平道路标线
    for (var y = startY; y <= endY; y += blockSize) {
        if (y >= 0 && y <= this.mapConfig.height) {
            var lineY = y + streetWidth / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(Math.max(0, this.camera.x), lineY);
            this.ctx.lineTo(Math.min(this.camera.x + viewWidth, this.mapConfig.width), lineY);
            this.ctx.stroke();
        }
    }
    
    this.ctx.setLineDash([]);
};

/**
 * 渲染状态栏
 */
GameEngine.prototype.renderStatusBar = function() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, 60);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('第 ' + this.gameData.survivalDays + ' 天', 10, 25);
    this.ctx.fillText('🍞 ' + this.gameData.food, 10, 45);
    this.ctx.fillText('👥 ' + this.gameData.teamSize, 120, 25);
};

/**
 * 渲染可见区域内的建筑物
 */
GameEngine.prototype.renderVisibleBuildings = function() {
    var self = this;
    
    // 计算考虑缩放后的可见区域
    var viewWidth = this.canvas.width / this.camera.zoom;
    var viewHeight = this.canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;
    
    // 只渲染可见区域内的建筑
    this.buildings.forEach(function(building) {
        // 检查建筑是否在可见区域内
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
            // 建筑主体
            self.ctx.fillStyle = building.explored ? building.color : self.lightenColor(building.color, 0.3);
            self.ctx.fillRect(building.x, building.y, building.width, building.height);
            
            // 建筑细节 - 添加窗户效果 (适配超大建筑)
            self.ctx.fillStyle = building.explored ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)';
            var windowSize = Math.max(12, Math.floor(building.width / 15)); // 更大的窗户
            var windowSpacing = windowSize + 12; // 更大的窗户间距
            
            // 绘制窗户网格 (避开门的区域)
            var doorWidth = Math.max(30, Math.floor(building.width / 8));
            var doorHeight = Math.max(40, Math.floor(building.height / 6));
            var doorX = building.x + (building.width - doorWidth) / 2;
            var doorY = building.y + building.height - doorHeight - 5;
            
            for (var wx = building.x + windowSpacing; wx < building.x + building.width - windowSize; wx += windowSpacing) {
                for (var wy = building.y + windowSpacing; wy < building.y + building.height - doorHeight - 20; wy += windowSpacing) {
                    // 避开门的位置
                    if (!(wx >= doorX - windowSpacing && wx <= doorX + doorWidth + windowSpacing && 
                          wy >= doorY - windowSpacing)) {
                        self.ctx.fillRect(wx, wy, windowSize, windowSize);
                        
                        // 窗户边框
                        self.ctx.strokeStyle = building.explored ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';
                        self.ctx.lineWidth = 1;
                        self.ctx.strokeRect(wx, wy, windowSize, windowSize);
                    }
                }
            }
            
            // 绘制建筑门 - 更加详细
            // 门框背景
            self.ctx.fillStyle = building.explored ? 'rgba(101, 67, 33, 0.9)' : 'rgba(101, 67, 33, 0.5)';
            self.ctx.fillRect(doorX - 3, doorY - 3, doorWidth + 6, doorHeight + 6);
            
            // 门本体
            self.ctx.fillStyle = building.explored ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.6)';
            self.ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
            
            // 门的细节
            self.ctx.strokeStyle = building.explored ? 'rgba(160, 82, 45, 1)' : 'rgba(160, 82, 45, 0.7)';
            self.ctx.lineWidth = 2;
            self.ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);
            
            // 门把手
            var handleSize = Math.max(3, Math.floor(doorWidth / 10));
            var handleX = doorX + doorWidth - handleSize * 2;
            var handleY = doorY + doorHeight / 2;
            
            self.ctx.fillStyle = building.explored ? 'rgba(255, 215, 0, 0.9)' : 'rgba(255, 215, 0, 0.5)';
            self.ctx.beginPath();
            self.ctx.arc(handleX, handleY, handleSize, 0, Math.PI * 2);
            self.ctx.fill();
            
            // 如果玩家接近这个建筑的门，添加高亮效果
            if (self.nearBuilding && self.nearBuilding.id === building.id) {
                // 门的发光效果
                self.ctx.save();
                self.ctx.shadowColor = '#3498db';
                self.ctx.shadowBlur = 15;
                self.ctx.strokeStyle = '#3498db';
                self.ctx.lineWidth = 4;
                self.ctx.strokeRect(doorX - 2, doorY - 2, doorWidth + 4, doorHeight + 4);
                
                // 添加进入箭头指示
                self.ctx.fillStyle = '#3498db';
                var arrowY = doorY - 15;
                var arrowX = doorX + doorWidth / 2;
                self.ctx.beginPath();
                self.ctx.moveTo(arrowX, arrowY);
                self.ctx.lineTo(arrowX - 6, arrowY - 8);
                self.ctx.lineTo(arrowX + 6, arrowY - 8);
                self.ctx.closePath();
                self.ctx.fill();
                
                self.ctx.restore();
            }
            
            // 门上方标识
            if (building.width > 200) {
                self.ctx.fillStyle = building.explored ? building.color : self.lightenColor(building.color, 0.3);
                var signWidth = doorWidth + 20;
                var signHeight = 15;
                var signX = doorX - 10;
                var signY = doorY - signHeight - 5;
                
                self.ctx.fillRect(signX, signY, signWidth, signHeight);
                self.ctx.strokeStyle = '#2c3e50';
                self.ctx.lineWidth = 1;
                self.ctx.strokeRect(signX, signY, signWidth, signHeight);
            }
            
            // 建筑边框
            self.ctx.strokeStyle = '#2c3e50';
            self.ctx.lineWidth = 2;
            self.ctx.strokeRect(building.x, building.y, building.width, building.height);
            
            // 未探索高亮
            if (!building.explored) {
                self.ctx.strokeStyle = '#f1c40f';
                self.ctx.lineWidth = 3;
                self.ctx.setLineDash([5, 5]);
                self.ctx.strokeRect(building.x - 3, building.y - 3, building.width + 6, building.height + 6);
                self.ctx.setLineDash([]);
            }
            
            // 建筑名称（适配大建筑的字体大小）
            var fontSize = Math.max(20, Math.floor(building.width / 12)); // 根据建筑大小调整字体
            self.ctx.fillStyle = '#ffffff';
            self.ctx.font = 'bold ' + fontSize + 'px Arial';
            self.ctx.textAlign = 'center';
            self.ctx.strokeStyle = '#000000';
            self.ctx.lineWidth = Math.max(3, Math.floor(fontSize / 6));
            
            // 在建筑上半部分显示名称，避开窗户区域
            var textX = building.x + building.width / 2;
            var textY = building.y + building.height / 3; // 放在上1/3位置
            
            self.ctx.strokeText(building.name, textX, textY);
            self.ctx.fillText(building.name, textX, textY);
            
            // 如果建筑足够大，添加建筑类型描述
            if (building.width > 200 && building.height > 200) {
                var subtitleFontSize = Math.floor(fontSize * 0.6);
                self.ctx.font = subtitleFontSize + 'px Arial';
                self.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                self.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                self.ctx.lineWidth = Math.max(2, Math.floor(subtitleFontSize / 8));
                
                var subtitle = self.getBuildingSubtitle(building.type);
                var subtitleY = textY + fontSize + 10;
                
                self.ctx.strokeText(subtitle, textX, subtitleY);
                self.ctx.fillText(subtitle, textX, subtitleY);
            }
        }
    });
    
    this.ctx.textAlign = 'left';
};

/**
 * 渲染交互提示
 */
GameEngine.prototype.renderInteractionHint = function() {
    // 禁用提示显示 - 改为直接自动进入
    // if (!this.nearBuilding) return;
    
    // 不再显示任何提示，靠近门时自动进入
    return;
};

/**
 * 获取建筑类型的副标题
 */
GameEngine.prototype.getBuildingSubtitle = function(buildingType) {
    switch (buildingType) {
        case 'police_station': return '治安管理';
        case 'hospital': return '医疗救治';
        case 'school': return '教育培训';
        case 'station': return '交通枢纽';
        case 'mall': return '购物中心';
        case 'shop': return '零售商店';
        case 'restaurant': return '餐饮服务';
        case 'bar': return '休闲娱乐';
        case 'cafe': return '咖啡休憩';
        case 'bank': return '金融服务';
        case 'house': return '居民住宅';
        case 'villa': return '高档别墅';
        case 'apartment': return '公寓大楼';
        case 'factory': return '工业生产';
        case 'warehouse': return '仓储物流';
        case 'gas_station': return '燃料补给';
        case 'gym': return '健身运动';
        case 'library': return '知识宝库';
        default: return '未知建筑';
    }
};

/**
 * 渲染小地图
 */
GameEngine.prototype.renderMiniMap = function() {
    var miniMapSize = 90; // 从120减小到90
    var miniMapX = this.canvas.width - miniMapSize - 8;
    var miniMapY = 65;
    
    // 小地图背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // 小地图边框
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // 视角拉近效果 - 只显示玩家周围的区域
    var zoomFactor = 0.3; // 缩放因子，数值越小视角越近
    var viewRange = Math.min(this.mapConfig.width, this.mapConfig.height) * zoomFactor;
    
    // 计算小地图显示的世界区域（以玩家为中心）
    var worldCenterX = this.player.x;
    var worldCenterY = this.player.y;
    var worldLeft = worldCenterX - viewRange / 2;
    var worldRight = worldCenterX + viewRange / 2;
    var worldTop = worldCenterY - viewRange / 2;
    var worldBottom = worldCenterY + viewRange / 2;
    
    // 边界限制
    if (worldLeft < 0) {
        worldRight += -worldLeft;
        worldLeft = 0;
    }
    if (worldRight > this.mapConfig.width) {
        worldLeft -= (worldRight - this.mapConfig.width);
        worldRight = this.mapConfig.width;
    }
    if (worldTop < 0) {
        worldBottom += -worldTop;
        worldTop = 0;
    }
    if (worldBottom > this.mapConfig.height) {
        worldTop -= (worldBottom - this.mapConfig.height);
        worldBottom = this.mapConfig.height;
    }
    
    // 计算缩放比例
    var scaleX = miniMapSize / (worldRight - worldLeft);
    var scaleY = miniMapSize / (worldBottom - worldTop);
    
    // 绘制玩家位置（居中）
    var playerMiniX = miniMapX + (this.player.x - worldLeft) * scaleX;
    var playerMiniY = miniMapY + (this.player.y - worldTop) * scaleY;
    
    this.ctx.fillStyle = '#3498db';
    this.ctx.beginPath();
    this.ctx.arc(playerMiniX, playerMiniY, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制周围的建筑
    var self = this;
    this.buildings.forEach(function(building) {
        // 只显示视野范围内的建筑
        if (building.x >= worldLeft && building.x <= worldRight &&
            building.y >= worldTop && building.y <= worldBottom) {
            
            var buildingMiniX = miniMapX + (building.x - worldLeft) * scaleX;
            var buildingMiniY = miniMapY + (building.y - worldTop) * scaleY;
            
            // 根据是否探索显示不同样式
            if (building.explored) {
                self.ctx.fillStyle = building.color;
                self.ctx.fillRect(buildingMiniX - 1, buildingMiniY - 1, 3, 3);
            } else {
                // 未探索的建筑显示为灰色小点
                self.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                self.ctx.fillRect(buildingMiniX, buildingMiniY, 1, 1);
            }
        }
    });
    
    // 绘制当前视野范围（考虑缩放）
    var gameViewWidth = this.canvas.width / this.camera.zoom;
    var gameViewHeight = this.canvas.height / this.camera.zoom;
    var cameraMiniX = miniMapX + (this.camera.x - worldLeft) * scaleX;
    var cameraMiniY = miniMapY + (this.camera.y - worldTop) * scaleY;
    var viewMiniW = gameViewWidth * scaleX;
    var viewMiniH = gameViewHeight * scaleY;
    
    this.ctx.strokeStyle = '#f1c40f';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(cameraMiniX, cameraMiniY, viewMiniW, viewMiniH);
    
    // 添加小地图标签
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('地图', miniMapX + miniMapSize / 2, miniMapY + miniMapSize + 12);
    this.ctx.textAlign = 'left';
};

/**
 * 渲染子地图（建筑内部）
 */
GameEngine.prototype.renderSubMap = function() {
    console.log('[Render] 渲染子地图，当前建筑:', this.currentBuilding ? this.currentBuilding.name : 'null');
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 子地图背景
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 子地图边界
    this.ctx.strokeStyle = '#ecf0f1';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(50, 100, 300, 200);
    
    // 地板纹理
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(60, 110, 280, 180);
    
    // 地板瓷砖效果
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 1;
    for (var i = 60; i <= 340; i += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(i, 110);
        this.ctx.lineTo(i, 290);
        this.ctx.stroke();
    }
    for (var j = 110; j <= 290; j += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(60, j);
        this.ctx.lineTo(340, j);
        this.ctx.stroke();
    }
    
    // 门 - 用于退出（放在下面）
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(195, 280, 10, 20); // 门移到下面
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(197, 285, 2, 2); // 门把手
    
    // 门标识
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('出口', 200, 315); // 标识移到下面
    
    // 建筑信息
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.currentBuilding ? this.currentBuilding.name : '建筑内部', this.canvas.width / 2, 50);
    
    // 渲染僵尸
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(zombie.x - 8, zombie.y - 8, 16, 16);
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(zombie.x - 6, zombie.y - 6, 12, 12);
    }
    
    // 渲染资源
    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(resource.x - 6, resource.y - 6, 12, 12);
        this.ctx.fillStyle = '#e67e22';
        this.ctx.fillRect(resource.x - 4, resource.y - 4, 8, 8);
    }
    
    // 渲染玩家
    this.renderPlayer();
    
    // 检查玩家是否接近出口（门在下面）
    var exitX = 200;
    var exitY = 290; // 门的中心位置
    var distanceToExit = Math.sqrt(
        Math.pow(this.player.x - exitX, 2) + 
        Math.pow(this.player.y - exitY, 2)
    );
    
    if (distanceToExit < 25) {
        this.ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('靠近门口即可退出', this.canvas.width / 2, this.canvas.height - 30);
        
        // 自动退出建筑
        if (distanceToExit < 15) {
            this.exitBuilding();
        }
    }
    
    // 渲染状态栏
    this.renderStatusBar();
};

/**
 * 退出建筑
 */
GameEngine.prototype.exitBuilding = function() {
    console.log('[GameEngine] 退出建筑');
    
    // 保存当前建筑引用
    var building = this.currentBuilding;
    
    // 标记建筑为已探索
    if (building) {
        building.explored = true;
        this.exploredBuildings.push(building);
    }
    
    // 将玩家放在建筑门口外面（在重置状态之前）
    if (building) {
        var doorInfo = this.calculateDoorInfo(building);
        this.player.x = doorInfo.x + doorInfo.width / 2;
        this.player.y = doorInfo.y + doorInfo.height + 30; // 放在门外
    }
    
    // 返回主地图
    this.gameState = 'playing';
    this.currentBuilding = null;
    this.subMapType = null;
    
    // 清空子地图数据
    this.zombies = [];
    this.resources = [];
};

/**
 * 渲染虚拟摇杆
 */
GameEngine.prototype.renderJoystick = function() {
    var joystickRadius = 60;
    var knobRadius = 25;
    var joystickX = 100;
    var joystickY = this.canvas.height - 100;
    
    this.ctx.save();
    
    // 摇杆底座
    this.ctx.beginPath();
    this.ctx.arc(joystickX, joystickY, joystickRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // 内圈指示器
    this.ctx.beginPath();
    this.ctx.arc(joystickX, joystickY, joystickRadius - 15, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // 计算摇杆把手位置
    var knobX = joystickX + this.joystick.direction.x * (joystickRadius - knobRadius);
    var knobY = joystickY + this.joystick.direction.y * (joystickRadius - knobRadius);
    
    // 摇杆把手
    this.ctx.beginPath();
    this.ctx.arc(knobX, knobY, knobRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // 把手中心点
    this.ctx.beginPath();
    this.ctx.arc(knobX, knobY, 8, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
    this.ctx.fill();
    
    // 方向指示器（如果有方向输入）
    if (this.joystick.direction.x !== 0 || this.joystick.direction.y !== 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(joystickX, joystickY);
        this.ctx.lineTo(knobX, knobY);
        this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }
    
    this.ctx.restore();
};

/**
 * 渲染时间信息
 */
GameEngine.prototype.renderTimeInfo = function() {
    // 渲染时间信息到右上角
    this.ctx.save();
    
    // 背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(this.canvas.width - 200, 10, 190, 80);
    
    // 边框
    this.ctx.strokeStyle = '#3498db';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.canvas.width - 200, 10, 190, 80);
    
    // 文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    
    // 生存天数
    this.ctx.fillText('生存天数: ' + this.gameData.survivalDays, this.canvas.width - 190, 35);
    
    // 当前时间（模拟游戏内时间）
    var gameTime = Math.floor((Date.now() / 1000) % (24 * 60 * 60)); // 24小时循环
    var hours = Math.floor(gameTime / 3600);
    var minutes = Math.floor((gameTime % 3600) / 60);
    var timeString = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
    this.ctx.fillText('时间: ' + timeString, this.canvas.width - 190, 55);
    
    // 当前角色信息
    var character = this.characterManager.getCurrentCharacter();
    this.ctx.fillText('角色: ' + character.name, this.canvas.width - 190, 75);
    
    this.ctx.restore();
};

/**
 * 颜色工具函数 - 使颜色变亮
 */
GameEngine.prototype.lightenColor = function(color, amount) {
    // 将十六进制颜色转换为RGB
    var hex = color.replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    
    // 增加亮度
    r = Math.min(255, Math.floor(r + (255 - r) * amount));
    g = Math.min(255, Math.floor(g + (255 - g) * amount));
    b = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    // 转换回十六进制 (兼容ES5)
    var rHex = r.toString(16);
    if (rHex.length === 1) rHex = '0' + rHex;
    var gHex = g.toString(16);
    if (gHex.length === 1) gHex = '0' + gHex;
    var bHex = b.toString(16);
    if (bHex.length === 1) bHex = '0' + bHex;
    
    return '#' + rHex + gHex + bHex;
};

/**
 * 渲染玩家 - 使用人物管理器渲染当前选择的角色
 */
GameEngine.prototype.renderPlayer = function() {
    // 使用人物管理器渲染当前角色
    this.characterManager.renderCurrentCharacter(this.ctx, this.player.x, this.player.y, this.player);
};

/**
 * 切换人物
 */
GameEngine.prototype.switchCharacter = function(characterId) {
    if (this.characterManager.switchCharacter(characterId)) {
        console.log('[Game] 切换到角色: ' + characterId + ' - ' + this.characterManager.getCurrentCharacter().name);
        return true;
    }
    return false;
};

/**
 * 获取当前人物信息
 */
GameEngine.prototype.getCurrentCharacterInfo = function() {
    var character = this.characterManager.getCurrentCharacter();
    return {
        id: character.id,
        name: character.name,
        description: character.description
    };
};

/**
 * 获取所有人物列表
 */
GameEngine.prototype.getCharacterList = function() {
    var list = [];
    for (var id in this.characterManager.characters) {
        var character = this.characterManager.characters[id];
        list.push({
            id: parseInt(id),
            name: character.name,
            description: character.description
        });
    }
    return list.sort(function(a, b) { return a.id - b.id; });
};

function initGame() {
    try {
        console.log('[Main] 开始初始化游戏...');
        
        // 获取系统信息
        var systemInfo = tt.getSystemInfoSync();
        console.log('[Main] 系统信息:', {
            windowWidth: systemInfo.windowWidth,
            windowHeight: systemInfo.windowHeight,
            pixelRatio: systemInfo.pixelRatio,
            platform: systemInfo.platform
        });
        
        // 创建画布
        var canvas = tt.createCanvas();
        var ctx = canvas.getContext('2d');
canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;

        console.log('[Main] 画布创建成功: ' + canvas.width + 'x' + canvas.height);
        
        // 创建游戏引擎
        var gameEngine = new GameEngine(canvas, ctx);
        
        // 启动游戏
        gameEngine.start();
        
        console.log('[Main] 游戏启动成功！');
        
        // 暴露全局变量供调试
        if (typeof global !== 'undefined') {
            global.game = gameEngine;
            global.canvas = canvas;
            global.ctx = ctx;
        }
        
        return gameEngine;
        
    } catch (error) {
        console.error('[Main] 游戏初始化失败:', error);
        
        // 显示错误信息
        try {
            var canvas = tt.createCanvas();
            var ctx = canvas.getContext('2d');
            var systemInfo = tt.getSystemInfoSync();
            canvas.width = systemInfo.windowWidth;
            canvas.height = systemInfo.windowHeight;
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('游戏启动失败', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText('请重新加载', canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('错误: ' + error.message, canvas.width / 2, canvas.height / 2 + 60);
        } catch (displayError) {
            console.error('[Main] 无法显示错误信息:', displayError);
        }
        
        throw error;
    }
}

// 启动游戏
console.log('[Main] 准备启动末日Q行游戏...');
try {
    initGame();
    console.log('[Main] 游戏启动完成！');
} catch (error) {
    console.error('[Main] 游戏启动失败:', error);
}