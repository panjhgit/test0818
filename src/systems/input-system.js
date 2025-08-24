/**
 * 输入系统
 * 处理触摸、鼠标等输入事件
 */

GameEngine.prototype.setupInput = function() {
    var self = this;

    console.log('[Input] 开始设置触摸事件，画布尺寸:', this.canvas.width, 'x', this.canvas.height);

    // 初始化摇杆对象
    if (!this.joystick) {
        this.joystick = {
            active: false,
            centerX: 80,
            centerY: 0,
            currentX: 80,
            currentY: 0,
            direction: {x: 0, y: 0},
            radius: 60,
            knobRadius: 20,
            visible: true,
            maxDistance: 50
        };
    }

    // 性能优化：事件监听器引用，便于解绑
    this.eventHandlers = {
        touchStart: null,
        touchMove: null,
        touchEnd: null
    };

    // 标记事件绑定状态，避免重复绑定
    this.eventsBound = false;

    // 抖音平台适配：默认位置在屏幕底部中央
    this.joystick.centerX = this.canvas.width / 2;
    this.joystick.centerY = this.canvas.height - 80;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;

    console.log('[Input] 摇杆位置设置完成:', this.joystick.centerX, this.joystick.centerY);

    // 抖音小程序触摸事件处理 - 修复兼容性问题
    if (typeof tt !== 'undefined') {
        // 先解绑之前的事件（如果存在）
        if (this.eventHandlers.touchStart) {
            try {
                tt.offTouchStart(this.eventHandlers.touchStart);
            } catch (e) {
                console.warn('[Input] 解绑抖音触摸开始事件失败:', e);
            }
        }
        if (this.eventHandlers.touchMove) {
            try {
                tt.offTouchMove(this.eventHandlers.touchMove);
            } catch (e) {
                console.warn('[Input] 解绑抖音触摸移动事件失败:', e);
            }
        }
        if (this.eventHandlers.touchEnd) {
            try {
                tt.offTouchEnd(this.eventHandlers.touchEnd);
            } catch (e) {
                console.warn('[Input] 解绑抖音触摸结束事件失败:', e);
            }
        }

        // 使用抖音小程序的触摸事件API
        try {
            this.eventHandlers.touchStart = function(res) {
                self.onTouchStart(res);
            };
            this.eventHandlers.touchMove = function(res) {
                self.onTouchMove(res);
            };
            this.eventHandlers.touchEnd = function(res) {
                self.onTouchEnd(res);
            };

            tt.onTouchStart(this.eventHandlers.touchStart);
            tt.onTouchMove(this.eventHandlers.touchMove);
            tt.onTouchEnd(this.eventHandlers.touchEnd);

            this.eventsBound = true;
            console.log('[Input] 抖音触摸事件绑定成功');

        } catch (ttError) {
            console.warn('[Input] 抖音触摸事件绑定失败，使用Canvas事件:', ttError);
            this.bindCanvasEvents();
        }
    } else {
        // 抖音小游戏环境：使用Canvas事件属性
        this.bindCanvasEvents();
    }
};

// 绑定Canvas事件的方法
GameEngine.prototype.bindCanvasEvents = function() {
    var self = this;

    try {
        // 先清理之前的事件绑定
        this.canvas.ontouchstart = null;
        this.canvas.ontouchmove = null;
        this.canvas.ontouchend = null;
        this.canvas.onclick = null;

        // 重新绑定事件
        this.canvas.ontouchstart = function(e) {
            self.onTouchStart(e);
        };
        this.canvas.ontouchmove = function(e) {
            self.onTouchMove(e);
        };
        this.canvas.ontouchend = function(e) {
            self.onTouchEnd(e);
        };
        this.canvas.onclick = function(e) {
            self.onClick(e);
        };

        this.eventsBound = true;
        console.log('[Input] Canvas触摸事件绑定成功');
    } catch (error) {
        console.error('[Input] Canvas触摸事件绑定失败:', error);
    }
};

GameEngine.prototype.onTouchStart = function(e) {
    try {
        // 抖音小程序事件对象结构可能不同
        var x, y;

        // 抖音小程序的触摸事件处理
        if (typeof tt !== 'undefined') {
            // 抖音小程序触摸事件结构
            if (e.touches && e.touches.length > 0) {
                // 标准触摸事件结构
                var touch = e.touches[0];
                x = touch.x || touch.clientX || touch.pageX || 0;
                y = touch.y || touch.clientY || touch.pageY || 0;
            } else if (e.x !== undefined && e.y !== undefined) {
                // 抖音小程序直接坐标
                x = e.x;
                y = e.y;
            } else if (e.clientX !== undefined && e.clientY !== undefined) {
                // 客户端坐标
                x = e.clientX;
                y = e.clientY;
            } else {
                // 默认坐标
                x = 0;
                y = 0;
            }
        } else {
            // 抖音小游戏环境：直接使用事件坐标
            var touch = e.touches && e.touches[0] ? e.touches[0] : e;
            x = parseFloat(touch.x) || parseFloat(touch.clientX) || 0;
            y = parseFloat(touch.y) || parseFloat(touch.clientY) || 0;
        }

        // 转换为画布坐标
        try {
            var rect = this.canvas.getBoundingClientRect();
            x = x - rect.left;
            y = y - rect.top;
        } catch (error) {
            console.warn('[Touch] 画布坐标转换失败，使用原始坐标:', error);
        }

        this.touchStartX = x;
        this.touchStartY = y;
        this.touchStartTime = Date.now();

        console.log('[Touch] 触摸开始，坐标:', x, y, '游戏状态:', this.gameState);

        if (this.gameState === 'playing' || this.gameState === 'submap') {
            // 抖音小游戏环境：确保坐标是有效数值
            if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
                // 使用距离平方避免开方运算，提高性能
                var dx = x - this.joystick.centerX;
                var dy = y - this.joystick.centerY;
                var joystickDistanceSquared = dx * dx + dy * dy;
                var joystickRadiusSquared = this.joystick.radius * this.joystick.radius;

                console.log('[Touch] 触摸坐标:', x, y, '摇杆中心:', this.joystick.centerX, this.joystick.centerY, '距离:', Math.sqrt(joystickDistanceSquared).toFixed(1), '摇杆半径:', this.joystick.radius);

                if (joystickDistanceSquared <= joystickRadiusSquared) {
                    // 激活摇杆
                    this.joystick.active = true;
                    this.joystick.currentX = x;
                    this.joystick.currentY = y;
                    this.updateJoystickDirection();
                    console.log('[Joystick] 摇杆已激活，开始控制移动');
                } else {
                    console.log('[Touch] 触摸位置超出摇杆范围，不激活摇杆');
                }
            } else {
                console.warn('[Touch] 无效的触摸坐标:', {x: x, y: y, event: e});
            }
        } else {
            console.log('[Touch] 当前游戏状态不支持摇杆控制:', this.gameState);
        }
    } catch (error) {
        console.error('[Input] 触摸开始处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.onTouchMove = function(e) {
    try {
        if (!this.joystick.active) return;

        var x, y;

        // 抖音小程序的触摸事件处理
        if (typeof tt !== 'undefined') {
            if (e.touches && e.touches.length > 0) {
                var touch = e.touches[0];
                x = touch.x || touch.clientX || touch.pageX || 0;
                y = touch.y || touch.clientY || touch.pageY || 0;
            } else if (e.x !== undefined && e.y !== undefined) {
                x = e.x;
                y = e.y;
            } else {
                return;
            }
        } else {
            var touch = e.touches && e.touches[0] ? e.touches[0] : e;
            x = parseFloat(touch.x) || parseFloat(touch.clientX) || 0;
            y = parseFloat(touch.y) || parseFloat(touch.clientY) || 0;
        }

        // 转换为画布坐标
        try {
            var rect = this.canvas.getBoundingClientRect();
            x = x - rect.left;
            y = y - rect.top;
        } catch (error) {
            // 如果无法获取边界，使用原始坐标
        }

        // 限制摇杆范围
        var dx = x - this.joystick.centerX;
        var dy = y - this.joystick.centerY;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.joystick.maxDistance) {
            var ratio = this.joystick.maxDistance / distance;
            dx *= ratio;
            dy *= ratio;
        }

        this.joystick.currentX = this.joystick.centerX + dx;
        this.joystick.currentY = this.joystick.centerY + dy;

        this.updateJoystickDirection();

    } catch (error) {
        console.error('[Input] 触摸移动处理错误:', error);
    }
};

GameEngine.prototype.onTouchEnd = function(e) {
    try {
        console.log('[Touch] 触摸结束');
        this.resetJoystick();
    } catch (error) {
        console.error('[Input] 触摸结束处理错误:', error);
    }
};

GameEngine.prototype.onClick = function(e) {
    try {
        console.log('[Input] 点击事件');
        // 处理点击事件
    } catch (error) {
        console.error('[Input] 点击处理错误:', error);
    }
};

GameEngine.prototype.updateJoystickDirection = function() {
    if (!this.joystick.active) return;

    var dx = this.joystick.currentX - this.joystick.centerX;
    var dy = this.joystick.currentY - this.joystick.centerY;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) { // 死区
        this.joystick.direction.x = dx / distance;
        this.joystick.direction.y = dy / distance;

        // 更新玩家位置
        this.updatePlayerPosition();
    } else {
        this.joystick.direction.x = 0;
        this.joystick.direction.y = 0;
        this.player.isWalking = false;
    }
};

GameEngine.prototype.updatePlayerPosition = function() {
    if (!this.player || this.player.isDead) return;

    var moveSpeed = GAME_CONFIG.PLAYER.MOVE_SPEED;
    var newX = this.player.x + this.joystick.direction.x * moveSpeed;
    var newY = this.player.y + this.joystick.direction.y * moveSpeed;

    // 检查边界
    if (newX >= 0 && newX <= this.mapConfig.width &&
        newY >= 0 && newY <= this.mapConfig.height) {
        
        // 检查建筑物碰撞
        if (this.canPlayerMoveTo(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            this.player.isWalking = true;

            // 更新方向
            if (Math.abs(this.joystick.direction.x) > Math.abs(this.joystick.direction.y)) {
                this.player.direction = this.joystick.direction.x > 0 ? 'right' : 'left';
            } else {
                this.player.direction = this.joystick.direction.y > 0 ? 'down' : 'up';
            }
        }
    }
};

GameEngine.prototype.canPlayerMoveTo = function(x, y) {
    var playerRadius = GAME_CONFIG.PLAYER.CHARACTER_RADIUS;

    // 检查建筑物碰撞
    for (var i = 0; i < this.buildings.length; i++) {
        var building = this.buildings[i];
        
        // 计算玩家中心到建筑物边缘的最短距离
        var closestX = Math.max(building.x, Math.min(x, building.x + building.width));
        var closestY = Math.max(building.y, Math.min(y, building.y + building.height));
        
        var distanceSquared = Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2);
        var minDistanceSquared = Math.pow(playerRadius, 2);
        
        if (distanceSquared < minDistanceSquared) {
            return false;
        }
    }

    return true;
};

GameEngine.prototype.resetJoystick = function() {
    this.joystick.active = false;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;
    this.player.isWalking = false;
};

// 处理鼠标事件（用于浏览器测试）
GameEngine.prototype.handleMouseDown = function(e) {
    this.onTouchStart(e);
};

GameEngine.prototype.handleMouseMove = function(e) {
    this.onTouchMove(e);
};

GameEngine.prototype.handleMouseUp = function(e) {
    this.onTouchEnd(e);
};

GameEngine.prototype.handleTouchStart = function(e) {
    this.onTouchStart(e);
};

GameEngine.prototype.handleTouchMove = function(e) {
    this.onTouchMove(e);
};

GameEngine.prototype.handleTouchEnd = function(e) {
    this.onTouchEnd(e);
};