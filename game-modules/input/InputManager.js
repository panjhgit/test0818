/**
 * 输入管理器 - 处理摇杆和触摸输入
 * 兼容抖音小程序环境 (ES5)
 */
function InputManager(canvas, gameEngine) {
    this.canvas = canvas;
    this.gameEngine = gameEngine;
    
    // 摇杆状态
    this.joystick = {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        direction: { x: 0, y: 0 }
    };
    
    this.setupInput();
}

InputManager.prototype.setupInput = function() {
    var self = this;
    
    // 触摸开始事件
    this.canvas.addEventListener('touchstart', function(e) {
        self.onTouchStart(e);
    });
    
    // 触摸移动事件  
    this.canvas.addEventListener('touchmove', function(e) {
        self.onTouchMove(e);
    });
    
    // 触摸结束事件
    this.canvas.addEventListener('touchend', function(e) {
        self.onTouchEnd(e);
    });
    
    // 点击事件
    this.canvas.addEventListener('click', function(e) {
        self.onClick(e);
    });
    
    console.log('[InputManager] 输入系统初始化完成');
};

InputManager.prototype.onTouchStart = function(e) {
    try {
        var touch = e.touches[0];
        var x = touch.x || touch.clientX || 0;
        var y = touch.y || touch.clientY || 0;
        
        console.log('[Input] 触摸开始位置:', x, y);
        
        // 检查是否在摇杆区域内
        var joystickX = 100;
        var joystickY = this.canvas.height - 100;
        var joystickRadius = 60;
        
        var distance = Math.sqrt(Math.pow(x - joystickX, 2) + Math.pow(y - joystickY, 2));
        
        if (distance <= joystickRadius) {
            this.joystick.active = true;
            this.joystick.startX = joystickX;
            this.joystick.startY = joystickY;
            this.joystick.currentX = x;
            this.joystick.currentY = y;
            
            console.log('[Input] 摇杆激活，距离:', distance);
            this.updateJoystickDirection();
        }
    } catch (error) {
        console.error('[Input] 触摸开始错误:', error);
        this.resetJoystick();
    }
};

InputManager.prototype.onTouchMove = function(e) {
    try {
        if (!this.joystick.active) return;
        
        var touch = e.touches[0];
        var x = touch.x || touch.clientX || 0;
        var y = touch.y || touch.clientY || 0;
        
        console.log('[Input] 触摸移动位置:', x, y, '摇杆状态:', this.joystick.active);
        
        this.joystick.currentX = x;
        this.joystick.currentY = y;
        
        this.updateJoystickDirection();
    } catch (error) {
        console.error('[Input] 触摸移动错误:', error);
        this.resetJoystick();
    }
};

InputManager.prototype.onTouchEnd = function(e) {
    try {
        console.log('[Input] 触摸结束');
        
        if (this.joystick.active) {
            this.resetJoystick();
        }
    } catch (error) {
        console.error('[Input] 触摸结束错误:', error);
        this.resetJoystick();
    }
};

InputManager.prototype.onClick = function(e) {
    var x = e.x || e.clientX || 0;
    var y = e.y || e.clientY || 0;
    
    console.log('[Input] 点击位置:', x, y, '游戏状态:', this.gameEngine.gameState);
    
    // 根据游戏状态分发点击事件
    switch (this.gameEngine.gameState) {
        case 'menu':
            this.gameEngine.handleMenuClick(x, y);
            break;
        case 'playing':
            this.gameEngine.handleGameClick(x, y);
            break;
        case 'submap':
            this.gameEngine.handleSubMapClick(x, y);
            break;
        case 'gameover':
        case 'victory':
            this.gameEngine.handleEndGameClick(x, y);
            break;
    }
};

InputManager.prototype.updateJoystickDirection = function() {
    try {
        var dx = this.joystick.currentX - this.joystick.startX;
        var dy = this.joystick.currentY - this.joystick.startY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var maxDistance = 50;
        var deadZone = 5;
        
        if (distance > deadZone) {
            var normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
            this.joystick.direction.x = (dx / distance) * normalizedDistance;
            this.joystick.direction.y = (dy / distance) * normalizedDistance;
        } else {
            this.joystick.direction.x = 0;
            this.joystick.direction.y = 0;
        }
        
        console.log('[Input] 摇杆方向更新:', this.joystick.direction.x, this.joystick.direction.y);
    } catch (error) {
        console.error('[Input] 摇杆方向更新错误:', error);
        this.resetJoystick();
    }
};

InputManager.prototype.resetJoystick = function() {
    this.joystick.active = false;
    this.joystick.currentX = 0;
    this.joystick.currentY = 0;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;
    console.log('[Input] 摇杆状态已重置');
};

InputManager.prototype.getJoystickDirection = function() {
    return this.joystick.direction;
};

InputManager.prototype.isJoystickActive = function() {
    return this.joystick.active;
};
