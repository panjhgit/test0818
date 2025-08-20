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
