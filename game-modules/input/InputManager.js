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
    
    // 触摸状态跟踪
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    
    this.setupInput();
}

/**
 * 初始化输入系统
 */
InputManager.prototype.setupInput = function() {
    var self = this;
    
    // 初始化摇杆位置
    this.joystick.centerY = this.canvas.height - 80;
    this.joystick.currentY = this.joystick.centerY;
    
    // 抖音小程序触摸事件 - 增强版本
    if (typeof tt !== 'undefined') {
        // 使用抖音小程序的触摸事件API
        this.canvas.addEventListener('touchstart', function(e) {
            console.log('[Input] 抖音触摸开始事件触发');
            self.onTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function(e) {
            console.log('[Input] 抖音触摸移动事件触发');
            self.onTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function(e) {
            console.log('[Input] 抖音触摸结束事件触发');
            self.onTouchEnd(e);
        });
        this.canvas.addEventListener('tap', function(e) {
            console.log('[Input] 抖音点击事件触发');
            self.onClick(e);
        });
    } else {
        // 标准浏览器事件
        this.canvas.addEventListener('touchstart', function(e) {
            console.log('[Input] 浏览器触摸开始事件触发');
            self.onTouchStart(e);
        });
        this.canvas.addEventListener('touchmove', function(e) {
            console.log('[Input] 浏览器触摸移动事件触发');
            self.onTouchMove(e);
        });
        this.canvas.addEventListener('touchend', function(e) {
            console.log('[Input] 浏览器触摸结束事件触发');
            self.onTouchEnd(e);
        });
        this.canvas.addEventListener('click', function(e) {
            console.log('[Input] 浏览器点击事件触发');
            self.onClick(e);
        });
    }
    
    console.log('[InputManager] 输入系统已初始化');
};

/**
 * 触摸开始处理
 */
InputManager.prototype.onTouchStart = function(e) {
    try {
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
            console.warn('[Input] 触摸坐标获取失败:', touch);
            x = 0;
            y = 0;
        }
        
        console.log('[Input] 触摸开始位置:', x, y, '游戏状态:', this.gameEngine.gameState);
        
        // 保存触摸开始位置，用于后续的tap检测
        this.touchStartX = x;
        this.touchStartY = y;
        this.touchStartTime = Date.now();
        
        // 检查是否在虚拟摇杆区域
        if (this.gameEngine.gameState === 'playing' || this.gameEngine.gameState === 'submap') {
            var joystickDistance = Math.sqrt(
                Math.pow(x - this.joystick.centerX, 2) + 
                Math.pow(y - this.joystick.centerY, 2)
            );
            
            console.log('[Input] 摇杆距离检查:', joystickDistance, '摇杆半径:', this.joystick.radius);
            
            if (joystickDistance <= this.joystick.radius) {
                this.joystick.active = true;
                this.joystick.currentX = x;
                this.joystick.currentY = y;
                this.updateJoystickDirection();
                console.log('[Input] 虚拟摇杆激活成功');
            } else {
                console.log('[Input] 触摸位置不在摇杆范围内');
            }
        } else {
            console.log('[Input] 当前游戏状态不支持摇杆操作:', this.gameEngine.gameState);
        }
    } catch (error) {
        console.error('[Input] 触摸开始处理错误:', error);
        // 重置摇杆状态
        this.resetJoystick();
    }
};

/**
 * 触摸移动处理
 */
InputManager.prototype.onTouchMove = function(e) {
    try {
        if (e.preventDefault) e.preventDefault();
        
        if (!this.joystick.active) {
            console.log('[Input] 摇杆未激活，忽略触摸移动');
            return;
        }
        
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
            console.warn('[Input] 触摸移动坐标获取失败');
            return;
        }
        
        console.log('[Input] 触摸移动位置:', x, y, '摇杆状态:', this.joystick.active);
        
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
        console.log('[Input] 摇杆方向更新:', this.joystick.direction.x, this.joystick.direction.y);
        
    } catch (error) {
        console.error('[Input] 触摸移动处理错误:', error);
        this.resetJoystick();
    }
};

/**
 * 触摸结束处理
 */
InputManager.prototype.onTouchEnd = function(e) {
    try {
        if (e.preventDefault) e.preventDefault();
        console.log('[Input] 触摸结束，摇杆状态:', this.joystick.active);
        
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
        this.resetJoystick();
        
    } catch (error) {
        console.error('[Input] 触摸结束处理错误:', error);
        this.resetJoystick();
    }
};

/**
 * 点击事件处理
 */
InputManager.prototype.onClick = function(e) {
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

/**
 * 更新摇杆方向
 */
InputManager.prototype.updateJoystickDirection = function() {
    try {
        var dx = this.joystick.currentX - this.joystick.centerX;
        var dy = this.joystick.currentY - this.joystick.centerY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        console.log('[Input] 摇杆方向计算:', {
            dx: dx,
            dy: dy,
            distance: distance,
            maxDistance: this.joystick.maxDistance,
            deadZone: 5
        });
        
        if (distance > 5) { // 死区，避免微小抖动
            var normalizedDistance = Math.min(distance, this.joystick.maxDistance) / this.joystick.maxDistance;
            this.joystick.direction.x = (dx / distance) * normalizedDistance;
            this.joystick.direction.y = (dy / distance) * normalizedDistance;
            
            console.log('[Input] 摇杆方向已更新:', {
                x: this.joystick.direction.x,
                y: this.joystick.direction.y,
                normalizedDistance: normalizedDistance
            });
        } else {
            this.joystick.direction.x = 0;
            this.joystick.direction.y = 0;
            console.log('[Input] 摇杆在死区内，方向重置为0');
        }
    } catch (error) {
        console.error('[Input] 摇杆方向更新错误:', error);
        this.resetJoystick();
    }
};

/**
 * 重置摇杆状态
 */
InputManager.prototype.resetJoystick = function() {
    console.log('[Input] 重置摇杆状态');
    this.joystick.active = false;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;
};

/**
 * 获取摇杆方向
 */
InputManager.prototype.getJoystickDirection = function() {
    return this.joystick.direction;
};

/**
 * 检查摇杆是否激活
 */
InputManager.prototype.isJoystickActive = function() {
    return this.joystick.active;
};

/**
 * 获取摇杆状态
 */
InputManager.prototype.getJoystick = function() {
    return this.joystick;
};