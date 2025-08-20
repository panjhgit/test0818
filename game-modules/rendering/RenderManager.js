/**
 * 渲染管理器 - 处理所有渲染逻辑
 * 兼容抖音小程序环境 (ES5)
 */
function RenderManager(gameEngine) {
    this.gameEngine = gameEngine;
    this.ctx = gameEngine.ctx;
    this.canvas = gameEngine.canvas;
}

/**
 * 主渲染函数
 */
RenderManager.prototype.render = function() {
    var gameState = this.gameEngine.gameState;
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    switch (gameState) {
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
    
    // 渲染摇杆（在所有状态下都显示）
    if (gameState === 'playing' || gameState === 'submap') {
        this.renderJoystick();
    }
};

/**
 * 渲染主游戏画面
 */
RenderManager.prototype.renderGame = function() {
    // 保存上下文状态
    this.ctx.save();
    
    // 应用缩放和摄像机变换
    this.gameEngine.cameraManager.applyCameraTransform(this.ctx);
    
    // 渲染地图背景
    this.renderMapBackground();
    
    // 绘制街道网格
    this.renderStreetGrid();
    
    // 绘制可见区域内的建筑物
    this.renderVisibleBuildings();
    
    // 绘制玩家
    this.renderPlayer();
    
    // 绘制NPC
    this.renderNPCs();
    
    // 绘制团队成员
    this.renderFollowers();
    
    // 恢复上下文状态
    this.ctx.restore();
    
    // 渲染UI（不受摄像机影响）
    this.renderStatusBar();
    this.renderTimeInfo();
    this.renderMiniMap();
    this.renderInteractionHint();
    
    // 渲染建筑进入询问提示
    if (this.gameEngine.buildingManager.buildingEntryPrompt && 
        this.gameEngine.buildingManager.buildingEntryPrompt.active) {
        this.renderBuildingEntryPrompt();
    }
};

/**
 * 渲染建筑进入询问提示
 */
RenderManager.prototype.renderBuildingEntryPrompt = function() {
    var prompt = this.gameEngine.buildingManager.buildingEntryPrompt;
    if (!prompt || !prompt.active) return;
    
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 半透明背景
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 提示框背景
    var boxWidth = 300;
    var boxHeight = 150;
    var boxX = centerX - boxWidth / 2;
    var boxY = centerY - boxHeight / 2;
    
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeStyle = '#3498db';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // 标题
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('进入建筑', centerX, boxY + 30);
    
    // 消息
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(prompt.message, centerX, boxY + 60);
    
    // 按钮
    var buttonWidth = 80;
    var buttonHeight = 35;
    var buttonY = boxY + 90;
    
    // 进入按钮
    var enterButtonX = centerX - buttonWidth - 20;
    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(enterButtonX, buttonY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('进入', centerX - buttonWidth - 20 + buttonWidth/2, buttonY + 25);
    
    // 取消按钮
    var cancelButtonX = centerX + 20;
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.fillRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('取消', centerX + 20 + buttonWidth/2, buttonY + 25);
    
    this.ctx.restore();
};

/**
 * 渲染虚拟摇杆
 */
RenderManager.prototype.renderJoystick = function() {
    var joystick = this.gameEngine.inputManager.joystick;
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
    
    // 计算摇杆把手位置
    var knobX = joystickX + joystick.direction.x * (joystickRadius - knobRadius);
    var knobY = joystickY + joystick.direction.y * (joystickRadius - knobRadius);
    
    // 摇杆把手
    this.ctx.beginPath();
    this.ctx.arc(knobX, knobY, knobRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.restore();
};

/**
 * 渲染玩家
 */
RenderManager.prototype.renderPlayer = function() {
    var player = this.gameEngine.player;
    this.gameEngine.characterManager.renderCurrentCharacter(this.ctx, player.x, player.y, player);
};

/**
 * 渲染NPC
 */
RenderManager.prototype.renderNPCs = function() {
    var npcs = this.gameEngine.npcManager.npcs;
    var camera = this.gameEngine.cameraManager.camera;
    
    // 只渲染可见区域内的NPC
    var viewWidth = this.canvas.width / camera.zoom;
    var viewHeight = this.canvas.height / camera.zoom;
    var viewLeft = camera.x;
    var viewRight = camera.x + viewWidth;
    var viewTop = camera.y;
    var viewBottom = camera.y + viewHeight;
    
    for (var i = 0; i < npcs.length; i++) {
        var npc = npcs[i];
        
        // 检查NPC是否在可见区域内
        if (npc.x >= viewLeft - 50 && npc.x <= viewRight + 50 &&
            npc.y >= viewTop - 50 && npc.y <= viewBottom + 50) {
            this.renderSingleNPC(npc);
        }
    }
};

/**
 * 渲染单个NPC
 */
RenderManager.prototype.renderSingleNPC = function(npc) {
    // 创建虚拟的player对象用于动画
    var npcPlayer = {
        isWalking: npc.isWalking,
        walkAnimationFrame: (Date.now() / 200) % 4,
        direction: npc.direction || 'down'
    };
    
    // 使用角色渲染器
    if (npc.character && npc.character.render) {
        npc.character.render(this.ctx, npc.x, npc.y, npcPlayer);
    } else {
        this.renderDefaultNPC(npc);
    }
};

/**
 * 默认NPC渲染
 */
RenderManager.prototype.renderDefaultNPC = function(npc) {
    this.ctx.save();
    
    // 简单的方块角色
    this.ctx.fillStyle = '#3498db';
    this.ctx.fillRect(npc.x - 8, npc.y - 8, 16, 16);
    
    // 角色编号
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(npc.characterId.toString(), npc.x, npc.y + 3);
    
    this.ctx.restore();
};

/**
 * 渲染团队成员
 */
RenderManager.prototype.renderFollowers = function() {
    var followers = this.gameEngine.npcManager.followers;
    
    for (var i = 0; i < followers.length; i++) {
        var follower = followers[i];
        this.renderSingleFollower(follower, i);
    }
};

/**
 * 渲染单个团队成员
 */
RenderManager.prototype.renderSingleFollower = function(follower, index) {
    try {
        // 应用个性化效果
        this.applyFollowerPersonalityEffects(follower);
        
        // 渲染角色
        this.renderFollowerCharacter(follower);
        
        // 渲染个性指示器
        this.renderPersonalityIndicator(follower, index);
        
        this.ctx.restore();
    } catch (error) {
        console.error('[Render] 渲染跟随者错误:', error);
    }
};

/**
 * 应用跟随者个性化效果
 */
RenderManager.prototype.applyFollowerPersonalityEffects = function(follower) {
    this.ctx.save();
    
    var personality = follower.personality;
    if (personality && personality.personalityType) {
        switch (personality.personalityType) {
            case 'leader':
                this.ctx.globalAlpha = 1.0;
                break;
            case 'supporter':
                this.ctx.globalAlpha = 0.9;
                break;
            case 'scout':
                this.ctx.globalAlpha = 0.8;
                break;
            case 'guardian':
                this.ctx.globalAlpha = 0.95;
                break;
            case 'independent':
                this.ctx.globalAlpha = 0.85;
                break;
            default:
                this.ctx.globalAlpha = 0.9;
        }
    }
};

/**
 * 渲染跟随者角色
 */
RenderManager.prototype.renderFollowerCharacter = function(follower) {
    // 简化渲染，确保可见性
    this.renderDefaultFollower(follower);
    
    // 添加调试边框
    this.ctx.strokeStyle = 'red';
    this.ctx.setLineDash([2, 2]);
    this.ctx.strokeRect(follower.x - 12, follower.y - 12, 24, 24);
    this.ctx.setLineDash([]);
    
    // 添加跟随者标识
    this.ctx.fillStyle = 'red';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('F' + follower.characterId, follower.x, follower.y - 15);
};

/**
 * 默认跟随者渲染
 */
RenderManager.prototype.renderDefaultFollower = function(follower) {
    var personality = follower.personality;
    var personalityColors = {
        'leader': '#e74c3c',
        'supporter': '#2ecc71', 
        'scout': '#f39c12',
        'guardian': '#3498db',
        'independent': '#9b59b6'
    };
    
    var color = personalityColors[personality.personalityType] || '#95a5a6';
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(follower.x - 10, follower.y - 10, 20, 20);
    
    // 边框
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(follower.x - 10, follower.y - 10, 20, 20);
    
    // ID文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(follower.characterId.toString(), follower.x, follower.y + 5);
    
    // 跟随状态指示器
    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(follower.x + 8, follower.y - 8, 3, 0, 2 * Math.PI);
    this.ctx.fill();
    
    this.ctx.restore();
};

/**
 * 渲染个性指示器
 */
RenderManager.prototype.renderPersonalityIndicator = function(follower, index) {
    var personality = follower.personality;
    if (!personality) return;
    
    var x = follower.x;
    var y = follower.y - 25;
    var color = '#ffffff';
    
    // 根据个性类型渲染不同符号
    switch (personality.personalityType) {
        case 'leader':
            this.renderStarIndicator(x, y, color);
            break;
        case 'supporter':
            this.renderHeartIndicator(x, y, color);
            break;
        case 'scout':
            this.renderEyeIndicator(x, y, color);
            break;
        case 'guardian':
            this.renderShieldIndicator(x, y, color);
            break;
        case 'independent':
            this.renderArrowIndicator(x, y, color);
            break;
    }
};

/**
 * 渲染星形指示器
 */
RenderManager.prototype.renderStarIndicator = function(x, y, color) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 5);
    this.ctx.lineTo(x + 2, y - 1);
    this.ctx.lineTo(x + 5, y);
    this.ctx.lineTo(x + 2, y + 1);
    this.ctx.lineTo(x, y + 5);
    this.ctx.lineTo(x - 2, y + 1);
    this.ctx.lineTo(x - 5, y);
    this.ctx.lineTo(x - 2, y - 1);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
};

/**
 * 渲染心形指示器
 */
RenderManager.prototype.renderHeartIndicator = function(x, y, color) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - 2, y - 1, 4, 3);
    this.ctx.fillRect(x - 3, y - 2, 2, 2);
    this.ctx.fillRect(x + 1, y - 2, 2, 2);
    this.ctx.fillRect(x - 1, y + 2, 2, 2);
    this.ctx.restore();
};

/**
 * 渲染眼睛指示器
 */
RenderManager.prototype.renderEyeIndicator = function(x, y, color) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - 3, y - 1, 6, 2);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x - 1, y - 1, 2, 2);
    this.ctx.restore();
};

/**
 * 渲染盾牌指示器
 */
RenderManager.prototype.renderShieldIndicator = function(x, y, color) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - 3, y - 2, 6, 4);
    this.ctx.fillRect(x - 1, y + 2, 2, 2);
    this.ctx.restore();
};

/**
 * 渲染箭头指示器
 */
RenderManager.prototype.renderArrowIndicator = function(x, y, color) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 3);
    this.ctx.lineTo(x + 3, y);
    this.ctx.lineTo(x, y + 3);
    this.ctx.lineTo(x - 1, y + 2);
    this.ctx.lineTo(x - 1, y - 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
};

/**
 * 渲染菜单
 */
RenderManager.prototype.renderMenu = function() {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 创建渐变背景
    var gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 游戏标题
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(255, 87, 51, 0.8)';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.fillStyle = '#ff5733';
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('末日Q行', centerX, 120);
    this.ctx.restore();
    
    // 副标题
    this.ctx.fillStyle = '#e8e8e8';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('生存至100天的挑战', centerX, 170);
    
    // 开始游戏按钮
    this.renderStartButton(centerX);
    
    this.ctx.textAlign = 'left';
};

/**
 * 渲染开始按钮
 */
RenderManager.prototype.renderStartButton = function(centerX) {
    var buttonY = this.canvas.height / 2 + 50;
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    
    // 按钮背景
    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 按钮边框
    this.ctx.strokeStyle = '#2ecc71';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 按钮文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('开始游戏', centerX, buttonY + 35);
};

/**
 * 渲染游戏结束画面
 */
RenderManager.prototype.renderGameOver = function() {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 半透明背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 游戏结束标题
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束', centerX, centerY - 60);
    
    // 统计信息
    var gameData = this.gameEngine.gameStateManager.getGameData();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('生存天数: ' + gameData.survivalDays, centerX, centerY);
    this.ctx.fillText('击杀数: ' + gameData.zombieKills, centerX, centerY + 40);
    this.ctx.fillText('最大团队: ' + gameData.maxTeamSize, centerX, centerY + 80);
    
    // 重新开始按钮
    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(centerX - 80, centerY + 120, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('重新开始', centerX, centerY + 150);
};

/**
 * 渲染胜利画面
 */
RenderManager.prototype.renderVictory = function() {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    
    // 半透明背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 胜利标题
    this.ctx.fillStyle = '#f39c12';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('胜利！', centerX, centerY - 60);
    
    // 恭喜信息
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('恭喜你生存了100天！', centerX, centerY);
    
    var gameData = this.gameEngine.gameStateManager.getGameData();
    this.ctx.fillText('最终击杀数: ' + gameData.zombieKills, centerX, centerY + 40);
    this.ctx.fillText('最终团队规模: ' + gameData.teamSize, centerX, centerY + 70);
    
    // 重新开始按钮
    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(centerX - 80, centerY + 100, 160, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('重新开始', centerX, centerY + 130);
};

/**
 * 渲染地图背景
 */
RenderManager.prototype.renderMapBackground = function() {
    // 简化的地图背景
    this.ctx.fillStyle = '#2c5530';
    this.ctx.fillRect(0, 0, this.gameEngine.mapConfig.width, this.gameEngine.mapConfig.height);
};

/**
 * 渲染街道网格
 */
RenderManager.prototype.renderStreetGrid = function() {
    var mapConfig = this.gameEngine.mapConfig;
    var camera = this.gameEngine.cameraManager.camera;
    
    // 计算可见区域
    var viewWidth = this.canvas.width / camera.zoom;
    var viewHeight = this.canvas.height / camera.zoom;
    var viewLeft = camera.x;
    var viewRight = camera.x + viewWidth;
    var viewTop = camera.y;
    var viewBottom = camera.y + viewHeight;
    
    this.ctx.strokeStyle = '#4a4a4a';
    this.ctx.lineWidth = 2;
    
    // 绘制垂直街道
    var blocksX = Math.ceil(mapConfig.width / mapConfig.blockSize);
    for (var i = 0; i <= blocksX; i++) {
        var x = i * mapConfig.blockSize;
        if (x >= viewLeft && x <= viewRight) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, Math.max(viewTop, 0));
            this.ctx.lineTo(x, Math.min(viewBottom, mapConfig.height));
            this.ctx.stroke();
        }
    }
    
    // 绘制水平街道
    var blocksY = Math.ceil(mapConfig.height / mapConfig.blockSize);
    for (var j = 0; j <= blocksY; j++) {
        var y = j * mapConfig.blockSize;
        if (y >= viewTop && y <= viewBottom) {
            this.ctx.beginPath();
            this.ctx.moveTo(Math.max(viewLeft, 0), y);
            this.ctx.lineTo(Math.min(viewRight, mapConfig.width), y);
            this.ctx.stroke();
        }
    }
};

/**
 * 渲染可见建筑
 */
RenderManager.prototype.renderVisibleBuildings = function() {
    var buildings = this.gameEngine.buildingManager.getBuildings();
    var camera = this.gameEngine.cameraManager.camera;
    
    // 计算可见区域
    var viewWidth = this.canvas.width / camera.zoom;
    var viewHeight = this.canvas.height / camera.zoom;
    var viewLeft = camera.x;
    var viewRight = camera.x + viewWidth;
    var viewTop = camera.y;
    var viewBottom = camera.y + viewHeight;
    
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        
        // 检查建筑是否在可见区域内
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
            this.renderSingleBuilding(building);
        }
    }
};

/**
 * 渲染单个建筑
 */
RenderManager.prototype.renderSingleBuilding = function(building) {
    // 建筑主体
    this.ctx.fillStyle = building.color;
    this.ctx.fillRect(building.x, building.y, building.width, building.height);
    
    // 建筑边框
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(building.x, building.y, building.width, building.height);
    
    // 建筑名称
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(building.name, 
        building.x + building.width / 2, 
        building.y + building.height / 2);
    
    // 探索状态指示
    if (building.explored) {
        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
        this.ctx.fillRect(building.x, building.y, building.width, building.height);
    }
};

/**
 * 渲染状态栏
 */
RenderManager.prototype.renderStatusBar = function() {
    var gameData = this.gameEngine.gameStateManager.getGameData();
    
    // 状态栏背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, 50);
    
    // 状态信息
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    
    var statusText = '第' + gameData.survivalDays + '天 | 口粮: ' + gameData.food + ' | 团队: ' + gameData.teamSize;
    this.ctx.fillText(statusText, 10, 25);
    
    // 时间信息
    var timeText = gameData.isDay ? '白天' : '夜晚';
    var timeRemaining = Math.ceil(gameData.timeRemaining / 1000);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(timeText + ' ' + timeRemaining + 's', this.canvas.width - 10, 25);
};

/**
 * 渲染时间信息
 */
RenderManager.prototype.renderTimeInfo = function() {
    // 时间信息已在状态栏中显示
};

/**
 * 渲染小地图
 */
RenderManager.prototype.renderMiniMap = function() {
    var miniMapSize = 120;
    var miniMapX = this.canvas.width - miniMapSize - 10;
    var miniMapY = 60;
    
    // 小地图背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // 小地图边框
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // 玩家位置
    var player = this.gameEngine.player;
    var mapConfig = this.gameEngine.mapConfig;
    var playerX = miniMapX + (player.x / mapConfig.width) * miniMapSize;
    var playerY = miniMapY + (player.y / mapConfig.height) * miniMapSize;
    
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.beginPath();
    this.ctx.arc(playerX, playerY, 3, 0, 2 * Math.PI);
    this.ctx.fill();
};

/**
 * 渲染交互提示
 */
RenderManager.prototype.renderInteractionHint = function() {
    var nearBuilding = this.gameEngine.buildingManager.getNearBuilding();
    if (nearBuilding) {
        var centerX = this.canvas.width / 2;
        var hintY = this.canvas.height - 150;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(centerX - 100, hintY - 20, 200, 40);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('点击进入 ' + nearBuilding.name, centerX, hintY);
    }
};

/**
 * 渲染子地图
 */
RenderManager.prototype.renderSubMap = function() {
    // 子地图背景
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 子地图边界
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(50, 100, 300, 200);
    
    // 渲染玩家和团队
    this.renderPlayer();
    this.renderFollowers();
    
    // 渲染子地图UI
    this.renderStatusBar();
};
