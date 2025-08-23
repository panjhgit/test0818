
// ========================================
// 输入系统实现 (Input System Implementation)
// ========================================

GameEngine.prototype.setupInput = function () {
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
        touchStart: null, touchMove: null, touchEnd: null
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
            this.eventHandlers.touchStart = function (res) {
                self.onTouchStart(res);
            };
            this.eventHandlers.touchMove = function (res) {
                self.onTouchMove(res);
            };
            this.eventHandlers.touchEnd = function (res) {
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
GameEngine.prototype.bindCanvasEvents = function () {
    var self = this;

    try {
        // 先清理之前的事件绑定
        this.canvas.ontouchstart = null;
        this.canvas.ontouchmove = null;
        this.canvas.ontouchend = null;
        this.canvas.onclick = null;

        // 重新绑定事件
        this.canvas.ontouchstart = function (e) {
            self.onTouchStart(e);
        };
        this.canvas.ontouchmove = function (e) {
            self.onTouchMove(e);
        };
        this.canvas.ontouchend = function (e) {
            self.onTouchEnd(e);
        };
        this.canvas.onclick = function (e) {
            self.onClick(e);
        };

        this.eventsBound = true;
        console.log('[Input] Canvas触摸事件绑定成功');
    } catch (error) {
        console.error('[Input] Canvas触摸事件绑定失败:', error);
    }
};

GameEngine.prototype.onTouchStart = function (e) {
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

GameEngine.prototype.onTouchMove = function (e) {
    try {

        if (!this.joystick.active) {
            console.log('[Touch] 摇杆未激活，忽略触摸移动');
            return;
        }

        var x, y;

        // 抖音小程序的触摸移动事件处理
        if (typeof tt !== 'undefined') {
            if (e.touches && e.touches.length > 0) {
                var touch = e.touches[0];
                x = touch.x || touch.clientX || touch.pageX || 0;
                y = touch.y || touch.clientY || touch.pageY || 0;
            } else if (e.x !== undefined && e.y !== undefined) {
                x = e.x;
                y = e.y;
            } else if (e.clientX !== undefined && e.clientY !== undefined) {
                x = e.clientX;
                y = e.clientY;
            } else {
                console.warn('[Input] 无法获取抖音触摸移动坐标');
                return;
            }
        } else {
            // 抖音小游戏环境：直接使用事件坐标
            var touch = e.touches && e.touches[0] ? e.touches[0] : e;
            x = parseFloat(touch.x) || parseFloat(touch.clientX) || 0;
            y = parseFloat(touch.y) || parseFloat(touch.clientY) || 0;

            // 转换为画布坐标
            try {
                var rect = this.canvas.getBoundingClientRect();
                x = x - rect.left;
                y = y - rect.top;
            } catch (error) {
                console.warn('[Touch] 触摸移动画布坐标转换失败，使用原始坐标:', error);
            }
        }


        var dx = x - this.joystick.centerX;
        var dy = y - this.joystick.centerY;
        var distanceSquared = dx * dx + dy * dy;
        var maxDistanceSquared = this.joystick.maxDistance * this.joystick.maxDistance;

        if (distanceSquared <= maxDistanceSquared) {
            this.joystick.currentX = x;
            this.joystick.currentY = y;
        } else {
            var angle = Math.atan2(dy, dx);
            this.joystick.currentX = this.joystick.centerX + Math.cos(angle) * this.joystick.maxDistance;
            this.joystick.currentY = this.joystick.centerY + Math.sin(angle) * this.joystick.maxDistance;
        }

        // 实时更新摇杆方向
        this.updateJoystickDirection();

    } catch (error) {
        console.error('[Input] 触摸移动处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.onTouchEnd = function (e) {
    try {
        // 检测是否为快速点击（tap）
        var touchEndTime = Date.now();
        var touchDuration = touchEndTime - (this.touchStartTime || touchEndTime);

        if (touchDuration < 300 && !this.joystick.active) {
            // 模拟点击事件
            console.log('[Touch] 检测到点击，坐标:', this.touchStartX, this.touchStartY, '游戏状态:', this.gameState);
            this.onClick({
                x: this.touchStartX || 0, y: this.touchStartY || 0
            });
        }

        // 立即重置摇杆状态
        this.resetJoystick();

    } catch (error) {
        console.error('[Input] 触摸结束处理错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.resetJoystick = function () {
    // 完全重置摇杆状态
    this.joystick.active = false;
    this.joystick.currentX = this.joystick.centerX;
    this.joystick.currentY = this.joystick.centerY;
    this.joystick.direction.x = 0;
    this.joystick.direction.y = 0;

    // 确保玩家停止移动
    if (this.player) {
        this.player.isWalking = false;
        this.player.walkAnimationFrame = 0;
    }

    console.log('[Joystick] 摇杆状态已重置');
};




// 检查事件绑定状态的方法
GameEngine.prototype.checkEventBindingStatus = function () {
    var status = {
        eventsBound: this.eventsBound, ttAvailable: typeof tt !== 'undefined', eventHandlers: {
            touchStart: !!this.eventHandlers.touchStart,
            touchMove: !!this.eventHandlers.touchMove,
            touchEnd: !!this.eventHandlers.touchEnd
        }, canvasEvents: {
            ontouchstart: !!this.canvas.ontouchstart,
            ontouchmove: !!this.canvas.ontouchmove,
            ontouchend: !!this.canvas.ontouchend,
            onclick: !!this.canvas.onclick
        }
    };

    console.log('[Input] 事件绑定状态检查:', status);
    return status;
};

GameEngine.prototype.updateJoystickDirection = function () {
    try {
        // 只有在摇杆激活时才更新方向
        if (!this.joystick.active) {
            this.joystick.direction.x = 0;
            this.joystick.direction.y = 0;
            return;
        }

        var dx = this.joystick.currentX - this.joystick.centerX;
        var dy = this.joystick.currentY - this.joystick.centerY;
        var distanceSquared = dx * dx + dy * dy;
        var minDistanceSquared = 5 * 5; // 25

        if (distanceSquared > minDistanceSquared) {
            var distance = Math.sqrt(distanceSquared);
            var normalizedDistance = Math.min(distance, this.joystick.maxDistance) / this.joystick.maxDistance;
            this.joystick.direction.x = (dx / distance) * normalizedDistance;
            this.joystick.direction.y = (dy / distance) * normalizedDistance;
        } else {
            this.joystick.direction.x = 0;
            this.joystick.direction.y = 0;
        }
    } catch (error) {
        console.error('[Input] 摇杆方向更新错误:', error);
        this.resetJoystick();
    }
};

GameEngine.prototype.onClick = function (e) {
    var x, y;


    // 抖音小程序点击事件处理
    if (typeof tt !== 'undefined') {
        if (e.touches && e.touches.length > 0) {
            var touch = e.touches[0];
            x = touch.x || touch.clientX || touch.pageX || 0;
            y = touch.y || touch.clientY || touch.pageY || 0;
        } else if (e.x !== undefined && e.y !== undefined) {
            x = e.x;
            y = e.y;
        } else if (e.clientX !== undefined && e.clientY !== undefined) {
            x = e.clientX;
            y = e.clientY;
        } else {
            x = 0;
            y = 0;
            console.warn('[Input] 无法获取抖音点击坐标，使用默认值');
        }
    } else {
        // 抖音小游戏环境：直接使用事件坐标
        if (e.touches && e.touches[0]) {
            var touch = e.touches[0];
            x = parseFloat(touch.x) || parseFloat(touch.clientX) || 0;
            y = parseFloat(touch.y) || parseFloat(touch.clientY) || 0;
        } else {
            x = parseFloat(e.x) || parseFloat(e.clientX) || 0;
            y = parseFloat(e.y) || parseFloat(e.clientY) || 0;
        }
    }


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

GameEngine.prototype.handleMenuClick = function (x, y) {
    var centerX = this.canvas.width / 2;
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    var buttonY = 320;

    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        this.startGame();
    }
};

GameEngine.prototype.handleGameClick = function (x, y) {
    console.log('[Click] 游戏点击事件，坐标:', x, y, '弹出提示状态:', {
        exists: !!this.buildingEntryPrompt, active: this.buildingEntryPrompt ? this.buildingEntryPrompt.active : false
    });

    if (this.buildingEntryPrompt && this.buildingEntryPrompt.active) {
        console.log('[Click] 调用建筑进入提示点击处理');
        this.handleBuildingEntryPromptClick(x, y);
        return;
    }
};

GameEngine.prototype.handleBuildingEntryPromptClick = function (x, y) {
    console.log('[Click] 处理建筑进入提示点击，坐标:', x, y);
    var prompt = this.buildingEntryPrompt;
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;
    var boxHeight = 150;
    var boxY = centerY - boxHeight / 2;
    var buttonWidth = 80;
    var buttonHeight = 35;
    var buttonY = boxY + 90;

    var enterButtonX = centerX - buttonWidth - 20;
    console.log('[Click] 进入按钮区域:', enterButtonX, buttonY, buttonWidth, buttonHeight);
    console.log('[Click] 点击位置是否在进入按钮内:', x >= enterButtonX && x <= enterButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight);

    if (x >= enterButtonX && x <= enterButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('[Click] 进入按钮被点击');
        if (this.nearBuilding && this.nearBuilding.id === prompt.building.id && this.nearBuilding.name === prompt.building.name) {
            console.log('[Click] 开始进入建筑:', prompt.building.name);
            mapModule.exploreBuilding(prompt.building, this);
        } else {
            console.log('[Click] 进入建筑失败，nearBuilding不匹配:', {
                nearBuilding: this.nearBuilding, promptBuilding: prompt.building
            });
        }
        this.buildingEntryPrompt = null;
        return;
    }

    var cancelButtonX = centerX + 20;
    if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        this.buildingEntryPrompt = null;
        return;
    }
};

GameEngine.prototype.handleSubMapClick = function (x, y) {
    var self = this;
    if (x >= 10 && x <= 90 && y >= this.canvas.height - 40 && y <= this.canvas.height - 10) {
        mapModule.exitBuilding(this);
        return;
    }

    // 使用for循环遍历资源，可以提前退出以提高性能
    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        if (!resource.collected) {
            // 使用距离平方避免开方运算，提高性能
            var dx = x - resource.x;
            var dy = y - resource.y;
            var distanceSquared = dx * dx + dy * dy;
            var interactionRadiusSquared = 30 * 30; // 900

            if (distanceSquared <= interactionRadiusSquared) {
                this.collectResource(resource);
                break; // 找到一个资源后即可退出
            }
        }
    }
};

GameEngine.prototype.handleEndGameClick = function (x, y) {
    var centerX = this.canvas.width / 2;
    var centerY = this.canvas.height / 2;

    // 重新开始按钮 (160x50, 居中) - 与渲染代码保持一致
    var restartButtonX = centerX - 80;
    var restartButtonY = centerY + 80;
    var restartButtonWidth = 160;
    var restartButtonHeight = 50;

    // 返回菜单按钮 (160x50, 居中) - 与渲染代码保持一致
    var menuButtonX = centerX - 80;
    var menuButtonY = centerY + 150;
    var menuButtonWidth = 160;
    var menuButtonHeight = 50;

    console.log('[EndGame] 点击坐标:', x, y);
    console.log('[EndGame] 画布尺寸:', this.canvas.width, 'x', this.canvas.height);
    console.log('[EndGame] 画布中心:', centerX, centerY);
    console.log('[EndGame] 重新开始按钮区域:', restartButtonX, restartButtonY, restartButtonWidth, restartButtonHeight);
    console.log('[EndGame] 返回菜单按钮区域:', menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight);

    // 检查重新开始按钮点击
    if (x >= restartButtonX && x <= restartButtonX + restartButtonWidth && y >= restartButtonY && y <= restartButtonY + restartButtonHeight) {
        console.log('[EndGame] 重新开始按钮被点击');
        this.restartGame();
        return;
    }

    // 检查返回菜单按钮点击
    if (x >= menuButtonX && x <= menuButtonX + menuButtonWidth && y >= menuButtonY && y <= menuButtonY + menuButtonHeight) {
        console.log('[EndGame] 返回菜单按钮被点击');
        this.returnToMenu();
        return;
    }

    console.log('[EndGame] 点击未命中任何按钮');
};

// 返回菜单函数
GameEngine.prototype.returnToMenu = function () {
    console.log('[GameEngine] 返回菜单');

    // 重置游戏状态
    this.gameState = 'menu';
    this.isGameEnded = false;

    // 清理游戏对象
    this.cleanupGameObjects();

    // 强制重新绑定触摸事件
    this.eventsBound = false;
    this.setupInput();
    console.log('[Input] 返回菜单时重新绑定触摸事件');

    // 重置摇杆状态
    this.resetJoystick();

    // 重新开始游戏循环以显示菜单
    this.running = true;
    this.lastTime = Date.now();
};