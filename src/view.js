/**
 * 视图渲染模块 (view.js)
 * 
 * 功能描述：
 * - UI界面渲染：游戏主界面、菜单、对话框等
 * - 状态栏显示：生命值、食物、人口、天数等信息
 * - 小地图系统：显示玩家位置、建筑、敌人等
 * - 游戏HUD：按钮、提示信息、通知系统
 * - 特效渲染：粒子效果、动画、过渡效果
 * - 响应式布局：适配不同屏幕尺寸
 * 
 * 主要类和方法：
 * - UIRenderer: UI渲染器主类
 * - StatusBar: 状态栏组件
 * - MiniMap: 小地图组件
 * - NotificationSystem: 通知系统
 * - EffectRenderer: 特效渲染器
 */

/**
 * UI渲染器主类
 * @param {Object} canvas - 画布对象
 * @param {Object} ctx - 2D渲染上下文
 */
function UIRenderer(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // UI组件
    this.statusBar = new StatusBar(canvas, ctx);
    this.miniMap = new MiniMap(canvas, ctx);
    this.notificationSystem = new NotificationSystem(canvas, ctx);
    this.effectRenderer = new EffectRenderer(canvas, ctx);
    
    // UI状态
    this.showUI = true;
    this.showMiniMap = true;
    this.showStatusBar = true;
    this.showNotifications = true;
    
    // 布局配置
    this.layout = {
        statusBarHeight: 60,
        miniMapSize: 150,
        padding: 10,
        buttonSize: 40
    };
    
    // 颜色主题
    this.theme = {
        primary: '#2196F3',
        secondary: '#FFC107',
        success: '#4CAF50',
        danger: '#F44336',
        warning: '#FF9800',
        info: '#00BCD4',
        dark: '#212121',
        light: '#FAFAFA',
        background: 'rgba(0, 0, 0, 0.7)',
        text: '#FFFFFF'
    };
}

/**
 * 渲染所有UI元素
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.render = function(gameState) {
    if (!this.showUI) return;
    
    // 渲染状态栏
    if (this.showStatusBar) {
        this.statusBar.render(gameState);
    }
    
    // 渲染小地图
    if (this.showMiniMap) {
        this.miniMap.render(gameState);
    }
    
    // 渲染通知
    if (this.showNotifications) {
        this.notificationSystem.render();
    }
    
    // 渲染特效
    this.effectRenderer.render();
    
    // 根据游戏状态渲染不同界面
    switch (gameState.gameState) {
        case 'menu':
            this.renderMainMenu();
            break;
        case 'playing':
            this.renderGameUI(gameState);
            break;
        case 'submap':
            this.renderSubmapUI(gameState);
            break;
        case 'gameover':
            this.renderGameOverScreen(gameState);
            break;
        case 'victory':
            this.renderVictoryScreen(gameState);
            break;
    }
};

/**
 * 渲染主菜单
 */
UIRenderer.prototype.renderMainMenu = function() {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    // 背景
    ctx.fillStyle = this.theme.dark;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 标题
    ctx.fillStyle = this.theme.text;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('末日Q行', canvas.width / 2, canvas.height / 2 - 100);
    
    // 副标题
    ctx.font = '24px Arial';
    ctx.fillStyle = this.theme.secondary;
    ctx.fillText('抖音小程序游戏', canvas.width / 2, canvas.height / 2 - 60);
    
    // 开始按钮
    this.renderButton(
        canvas.width / 2 - 100, canvas.height / 2,
        200, 50,
        '开始游戏',
        this.theme.primary
    );
    
    // 设置按钮
    this.renderButton(
        canvas.width / 2 - 100, canvas.height / 2 + 70,
        200, 50,
        '游戏设置',
        this.theme.secondary
    );
};

/**
 * 渲染游戏中UI
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.renderGameUI = function(gameState) {
    // 渲染控制按钮
    this.renderControlButtons();
    
    // 渲染建筑交互提示
    if (gameState.nearbyBuilding) {
        this.renderBuildingInteraction(gameState.nearbyBuilding);
    }
    
    // 渲染选中角色信息
    if (gameState.selectedCharacters && gameState.selectedCharacters.length > 0) {
        this.renderSelectedCharacterInfo(gameState.selectedCharacters);
    }
};

/**
 * 渲染子地图UI
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.renderSubmapUI = function(gameState) {
    // 渲染返回按钮
    this.renderButton(
        this.layout.padding, this.layout.padding,
        80, 40,
        '返回',
        this.theme.danger
    );
    
    // 渲染子地图特定UI
    if (gameState.subMapType) {
        this.renderSubmapSpecificUI(gameState.subMapType, gameState);
    }
};

/**
 * 渲染游戏结束画面
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.renderGameOverScreen = function(gameState) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 游戏结束标题
    ctx.fillStyle = this.theme.danger;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 100);
    
    // 统计信息
    this.renderGameStats(gameState, canvas.width / 2, canvas.height / 2 - 20);
    
    // 重新开始按钮
    this.renderButton(
        canvas.width / 2 - 100, canvas.height / 2 + 80,
        200, 50,
        '重新开始',
        this.theme.primary
    );
};

/**
 * 渲染胜利画面
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.renderVictoryScreen = function(gameState) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 胜利标题
    ctx.fillStyle = this.theme.success;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('胜利!', canvas.width / 2, canvas.height / 2 - 100);
    
    // 恭喜信息
    ctx.fillStyle = this.theme.text;
    ctx.font = '24px Arial';
    ctx.fillText('恭喜你成功生存了30天!', canvas.width / 2, canvas.height / 2 - 50);
    
    // 统计信息
    this.renderGameStats(gameState, canvas.width / 2, canvas.height / 2 + 20);
    
    // 继续游戏按钮
    this.renderButton(
        canvas.width / 2 - 100, canvas.width / 2 + 120,
        200, 50,
        '继续游戏',
        this.theme.success
    );
};

/**
 * 渲染按钮
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {string} text - 按钮文本
 * @param {string} color - 按钮颜色
 */
UIRenderer.prototype.renderButton = function(x, y, width, height, text, color) {
    var ctx = this.ctx;
    
    // 按钮背景
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    
    // 按钮边框
    ctx.strokeStyle = this.theme.light;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // 按钮文本
    ctx.fillStyle = this.theme.text;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
};

/**
 * 渲染控制按钮
 */
UIRenderer.prototype.renderControlButtons = function() {
    var canvas = this.canvas;
    var buttonSize = this.layout.buttonSize;
    var padding = this.layout.padding;
    
    // 暂停按钮
    this.renderButton(
        canvas.width - buttonSize - padding,
        padding,
        buttonSize, buttonSize,
        '⏸',
        this.theme.warning
    );
    
    // 设置按钮
    this.renderButton(
        canvas.width - buttonSize * 2 - padding * 2,
        padding,
        buttonSize, buttonSize,
        '⚙',
        this.theme.info
    );
};

/**
 * 渲染建筑交互提示
 * @param {Object} building - 建筑对象
 */
UIRenderer.prototype.renderBuildingInteraction = function(building) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    // 提示框背景
    var boxWidth = 200;
    var boxHeight = 80;
    var boxX = canvas.width / 2 - boxWidth / 2;
    var boxY = canvas.height - boxHeight - 50;
    
    ctx.fillStyle = this.theme.background;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    ctx.strokeStyle = this.theme.primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // 建筑名称
    ctx.fillStyle = this.theme.text;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(building.name, boxX + boxWidth / 2, boxY + 25);
    
    // 交互提示
    ctx.font = '14px Arial';
    ctx.fillStyle = this.theme.secondary;
    ctx.fillText('点击进入', boxX + boxWidth / 2, boxY + 50);
};

/**
 * 渲染选中角色信息
 * @param {Array} selectedCharacters - 选中的角色数组
 */
UIRenderer.prototype.renderSelectedCharacterInfo = function(selectedCharacters) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    if (selectedCharacters.length === 0) return;
    
    var character = selectedCharacters[0]; // 显示第一个选中的角色
    
    // 信息框
    var boxWidth = 180;
    var boxHeight = 100;
    var boxX = this.layout.padding;
    var boxY = canvas.height - boxHeight - this.layout.padding;
    
    ctx.fillStyle = this.theme.background;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    ctx.strokeStyle = this.theme.primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // 角色名称
    ctx.fillStyle = this.theme.text;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(character.name, boxX + 10, boxY + 20);
    
    // 生命值
    ctx.font = '12px Arial';
    ctx.fillText('生命: ' + character.health + '/' + character.maxHealth, boxX + 10, boxY + 40);
    
    // 攻击力
    ctx.fillText('攻击: ' + character.attack, boxX + 10, boxY + 55);
    
    // 等级（如果有）
    if (character.level) {
        ctx.fillText('等级: ' + character.level, boxX + 10, boxY + 70);
    }
    
    // 选中数量
    if (selectedCharacters.length > 1) {
        ctx.fillStyle = this.theme.secondary;
        ctx.fillText('已选中 ' + selectedCharacters.length + ' 个角色', boxX + 10, boxY + 85);
    }
};

/**
 * 渲染子地图特定UI
 * @param {string} submapType - 子地图类型
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.renderSubmapSpecificUI = function(submapType, gameState) {
    switch (submapType) {
        case 'hospital':
            this.renderHospitalUI(gameState);
            break;
        case 'supermarket':
            this.renderSupermarketUI(gameState);
            break;
        case 'police_station':
            this.renderPoliceStationUI(gameState);
            break;
        case 'school':
            this.renderSchoolUI(gameState);
            break;
    }
};

/**
 * 渲染医院UI
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.renderHospitalUI = function(gameState) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    // 医院特有的UI元素
    ctx.fillStyle = this.theme.text;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('医院 - 可以治疗伤员', canvas.width / 2, 50);
    
    // 治疗按钮
    this.renderButton(
        canvas.width / 2 - 75, 80,
        150, 40,
        '治疗所有人',
        this.theme.success
    );
};

/**
 * 渲染超市UI
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.renderSupermarketUI = function(gameState) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    // 超市特有的UI元素
    ctx.fillStyle = this.theme.text;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('超市 - 可以获取食物', canvas.width / 2, 50);
    
    // 搜寻食物按钮
    this.renderButton(
        canvas.width / 2 - 75, 80,
        150, 40,
        '搜寻食物',
        this.theme.warning
    );
};

/**
 * 渲染警察局UI
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.renderPoliceStationUI = function(gameState) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    // 警察局特有的UI元素
    ctx.fillStyle = this.theme.text;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('警察局 - 可以获取武器', canvas.width / 2, 50);
    
    // 搜寻武器按钮
    this.renderButton(
        canvas.width / 2 - 75, 80,
        150, 40,
        '搜寻武器',
        this.theme.danger
    );
};

/**
 * 渲染学校UI
 * @param {Object} gameState - 游戏状态
 */
UIRenderer.prototype.renderSchoolUI = function(gameState) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    // 学校特有的UI元素
    ctx.fillStyle = this.theme.text;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('学校 - 可能有幸存者', canvas.width / 2, 50);
    
    // 搜寻幸存者按钮
    this.renderButton(
        canvas.width / 2 - 75, 80,
        150, 40,
        '搜寻幸存者',
        this.theme.info
    );
};

/**
 * 渲染游戏统计
 * @param {Object} gameState - 游戏状态
 * @param {number} centerX - 中心X坐标
 * @param {number} centerY - 中心Y坐标
 */
UIRenderer.prototype.renderGameStats = function(gameState, centerX, centerY) {
    var ctx = this.ctx;
    
    ctx.fillStyle = this.theme.text;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    
    var stats = [
        '生存天数: ' + (gameState.day || 0),
        '团队人数: ' + (gameState.population || 0),
        '剩余食物: ' + (gameState.food || 0),
        '击败僵尸: ' + (gameState.battleStats ? gameState.battleStats.enemiesKilled : 0)
    ];
    
    for (var i = 0; i < stats.length; i++) {
        ctx.fillText(stats[i], centerX, centerY + i * 25);
    }
};

/**
 * 状态栏组件
 * @param {Object} canvas - 画布对象
 * @param {Object} ctx - 2D渲染上下文
 */
function StatusBar(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.height = 60;
}

/**
 * 渲染状态栏
 * @param {Object} gameState - 游戏状态
 */
StatusBar.prototype.render = function(gameState) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    // 状态栏背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, this.height);
    
    // 分隔线
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    ctx.lineTo(canvas.width, this.height);
    ctx.stroke();
    
    // 状态信息
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    var padding = 20;
    var spacing = 150;
    
    // 天数
    ctx.fillText('第 ' + (gameState.day || 1) + ' 天', padding, 25);
    
    // 时间
    var timeText = gameState.timeOfDay === 'day' ? '白天' : '夜晚';
    ctx.fillText(timeText, padding, 45);
    
    // 人口
    ctx.fillText('人口: ' + (gameState.population || 1), padding + spacing, 25);
    
    // 食物
    ctx.fillStyle = gameState.food <= 5 ? '#F44336' : '#FFFFFF';
    ctx.fillText('食物: ' + (gameState.food || 0), padding + spacing, 45);
    
    // 僵尸数量
    ctx.fillStyle = '#F44336';
    ctx.fillText('僵尸: ' + (gameState.zombieCount || 0), padding + spacing * 2, 25);
    
    // 玩家生命值
    if (gameState.player) {
        var healthPercent = gameState.player.health / gameState.player.maxHealth;
        var healthColor = healthPercent > 0.6 ? '#4CAF50' : healthPercent > 0.3 ? '#FFC107' : '#F44336';
        
        ctx.fillStyle = healthColor;
        ctx.fillText('生命: ' + gameState.player.health + '/' + gameState.player.maxHealth, 
                    padding + spacing * 2, 45);
    }
};

/**
 * 小地图组件
 * @param {Object} canvas - 画布对象
 * @param {Object} ctx - 2D渲染上下文
 */
function MiniMap(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.size = 150;
    this.scale = 0.05; // 小地图缩放比例
}

/**
 * 渲染小地图
 * @param {Object} gameState - 游戏状态
 */
MiniMap.prototype.render = function(gameState) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    var mapX = canvas.width - this.size - 10;
    var mapY = 70; // 状态栏下方
    
    // 小地图背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mapX, mapY, this.size, this.size);
    
    // 小地图边框
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, this.size, this.size);
    
    // 渲染建筑
    if (gameState.buildings) {
        this.renderBuildingsOnMiniMap(gameState.buildings, mapX, mapY, gameState);
    }
    
    // 渲染玩家位置
    if (gameState.player) {
        this.renderPlayerOnMiniMap(gameState.player, mapX, mapY, gameState);
    }
    
    // 渲染僵尸
    if (gameState.zombies) {
        this.renderZombiesOnMiniMap(gameState.zombies, mapX, mapY, gameState);
    }
};

/**
 * 在小地图上渲染建筑
 * @param {Array} buildings - 建筑数组
 * @param {number} mapX - 小地图X坐标
 * @param {number} mapY - 小地图Y坐标
 * @param {Object} gameState - 游戏状态
 */
MiniMap.prototype.renderBuildingsOnMiniMap = function(buildings, mapX, mapY, gameState) {
    var ctx = this.ctx;
    
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        var x = mapX + building.x * this.scale;
        var y = mapY + building.y * this.scale;
        
        ctx.fillStyle = building.explored ? '#4CAF50' : '#666';
        ctx.fillRect(x, y, 3, 3);
    }
};

/**
 * 在小地图上渲染玩家
 * @param {Object} player - 玩家对象
 * @param {number} mapX - 小地图X坐标
 * @param {number} mapY - 小地图Y坐标
 * @param {Object} gameState - 游戏状态
 */
MiniMap.prototype.renderPlayerOnMiniMap = function(player, mapX, mapY, gameState) {
    var ctx = this.ctx;
    
    var x = mapX + player.x * this.scale;
    var y = mapY + player.y * this.scale;
    
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
};

/**
 * 在小地图上渲染僵尸
 * @param {Array} zombies - 僵尸数组
 * @param {number} mapX - 小地图X坐标
 * @param {number} mapY - 小地图Y坐标
 * @param {Object} gameState - 游戏状态
 */
MiniMap.prototype.renderZombiesOnMiniMap = function(zombies, mapX, mapY, gameState) {
    var ctx = this.ctx;
    
    for (var i = 0; i < zombies.length; i++) {
        var zombie = zombies[i];
        var x = mapX + zombie.x * this.scale;
        var y = mapY + zombie.y * this.scale;
        
        ctx.fillStyle = '#F44336';
        ctx.fillRect(x, y, 1, 1);
    }
};

/**
 * 通知系统
 * @param {Object} canvas - 画布对象
 * @param {Object} ctx - 2D渲染上下文
 */
function NotificationSystem(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.notifications = [];
    this.maxNotifications = 5;
}

/**
 * 添加通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 (info, success, warning, error)
 * @param {number} duration - 显示时长（毫秒）
 */
NotificationSystem.prototype.addNotification = function(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    
    var notification = {
        id: Date.now(),
        message: message,
        type: type,
        startTime: Date.now(),
        duration: duration,
        alpha: 1.0
    };
    
    this.notifications.unshift(notification);
    
    // 限制通知数量
    if (this.notifications.length > this.maxNotifications) {
        this.notifications = this.notifications.slice(0, this.maxNotifications);
    }
};

/**
 * 渲染通知
 */
NotificationSystem.prototype.render = function() {
    var ctx = this.ctx;
    var canvas = this.canvas;
    var currentTime = Date.now();
    
    // 清理过期通知
    this.notifications = this.notifications.filter(function(notification) {
        return currentTime - notification.startTime < notification.duration;
    });
    
    // 渲染通知
    for (var i = 0; i < this.notifications.length; i++) {
        var notification = this.notifications[i];
        var elapsed = currentTime - notification.startTime;
        var remaining = notification.duration - elapsed;
        
        // 计算透明度（最后500ms淡出）
        if (remaining < 500) {
            notification.alpha = remaining / 500;
        }
        
        this.renderNotification(notification, i);
    }
};

/**
 * 渲染单个通知
 * @param {Object} notification - 通知对象
 * @param {number} index - 通知索引
 */
NotificationSystem.prototype.renderNotification = function(notification, index) {
    var ctx = this.ctx;
    var canvas = this.canvas;
    
    var width = 300;
    var height = 50;
    var x = canvas.width - width - 20;
    var y = 80 + index * (height + 10); // 状态栏下方
    
    // 通知背景
    ctx.save();
    ctx.globalAlpha = notification.alpha;
    
    var colors = {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336'
    };
    
    ctx.fillStyle = colors[notification.type] || colors.info;
    ctx.fillRect(x, y, width, height);
    
    // 通知文本
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(notification.message, x + 10, y + height / 2);
    
    ctx.restore();
};

/**
 * 特效渲染器
 * @param {Object} canvas - 画布对象
 * @param {Object} ctx - 2D渲染上下文
 */
function EffectRenderer(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.effects = [];
}

/**
 * 添加特效
 * @param {Object} effect - 特效对象
 */
EffectRenderer.prototype.addEffect = function(effect) {
    this.effects.push(effect);
};

/**
 * 渲染所有特效
 */
EffectRenderer.prototype.render = function() {
    var currentTime = Date.now();
    
    // 更新和渲染特效
    for (var i = this.effects.length - 1; i >= 0; i--) {
        var effect = this.effects[i];
        
        if (currentTime - effect.startTime > effect.duration) {
            this.effects.splice(i, 1);
        } else {
            this.renderEffect(effect);
        }
    }
};

/**
 * 渲染单个特效
 * @param {Object} effect - 特效对象
 */
EffectRenderer.prototype.renderEffect = function(effect) {
    // 根据特效类型渲染不同效果
    switch (effect.type) {
        case 'damage':
            this.renderDamageEffect(effect);
            break;
        case 'heal':
            this.renderHealEffect(effect);
            break;
        case 'explosion':
            this.renderExplosionEffect(effect);
            break;
    }
};

/**
 * 渲染伤害特效
 * @param {Object} effect - 特效对象
 */
EffectRenderer.prototype.renderDamageEffect = function(effect) {
    var ctx = this.ctx;
    var elapsed = Date.now() - effect.startTime;
    var progress = elapsed / effect.duration;
    
    ctx.save();
    ctx.fillStyle = '#F44336';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 1 - progress;
    
    var y = effect.y - progress * 30; // 向上飘动
    ctx.fillText('-' + effect.damage, effect.x, y);
    
    ctx.restore();
};

/**
 * 渲染治疗特效
 * @param {Object} effect - 特效对象
 */
EffectRenderer.prototype.renderHealEffect = function(effect) {
    var ctx = this.ctx;
    var elapsed = Date.now() - effect.startTime;
    var progress = elapsed / effect.duration;
    
    ctx.save();
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 1 - progress;
    
    var y = effect.y - progress * 30; // 向上飘动
    ctx.fillText('+' + effect.heal, effect.x, y);
    
    ctx.restore();
};

/**
 * 渲染爆炸特效
 * @param {Object} effect - 特效对象
 */
EffectRenderer.prototype.renderExplosionEffect = function(effect) {
    var ctx = this.ctx;
    var elapsed = Date.now() - effect.startTime;
    var progress = elapsed / effect.duration;
    
    ctx.save();
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1 - progress;
    
    var radius = progress * effect.maxRadius;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
};

// 导出类（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UIRenderer,
        StatusBar,
        MiniMap,
        NotificationSystem,
        EffectRenderer
    };
}
