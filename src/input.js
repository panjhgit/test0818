/**
 * 输入系统模块 (input.js)
 * 
 * 功能描述：
 * - 触摸输入处理：单点触摸、多点触摸、手势识别
 * - 鼠标输入处理：点击、拖拽、滚轮操作
 * - 键盘输入处理：快捷键、组合键、文本输入
 * - 输入事件管理：事件监听、事件分发、事件优先级
 * - 手势识别：滑动、缩放、旋转等手势
 * - 输入适配：不同设备和平台的输入适配
 * 
 * 主要类和方法：
 * - InputManager: 输入管理器主类
 * - TouchHandler: 触摸处理器
 * - MouseHandler: 鼠标处理器
 * - KeyboardHandler: 键盘处理器
 * - GestureRecognizer: 手势识别器
 */

/**
 * 输入管理器主类
 * @param {Object} canvas - 画布对象
 * @param {Object} gameEngine - 游戏引擎引用
 */
function InputManager(canvas, gameEngine) {
    this.canvas = canvas;
    this.gameEngine = gameEngine;
    
    // 输入处理器
    this.touchHandler = new TouchHandler(canvas, this);
    this.mouseHandler = new MouseHandler(canvas, this);
    this.keyboardHandler = new KeyboardHandler(this);
    this.gestureRecognizer = new GestureRecognizer(this);
    
    // 输入状态
    this.inputState = {
        isPressed: false,
        currentX: 0,
        currentY: 0,
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
        pressTime: 0,
        lastTapTime: 0,
        tapCount: 0
    };
    
    // 输入配置
    this.config = {
        doubleTapThreshold: 300,  // 双击时间阈值（毫秒）
        longPressThreshold: 500,  // 长按时间阈值（毫秒）
        dragThreshold: 10,        // 拖拽距离阈值（像素）
        swipeThreshold: 50,       // 滑动距离阈值（像素）
        swipeVelocityThreshold: 0.5 // 滑动速度阈值
    };
    
    // 事件监听器
    this.eventListeners = {
        tap: [],
        doubleTap: [],
        longPress: [],
        drag: [],
        dragStart: [],
        dragEnd: [],
        swipe: [],
        pinch: [],
        rotate: []
    };
    
    // 初始化输入系统
    this.initialize();
}

/**
 * 初始化输入系统
 */
InputManager.prototype.initialize = function() {
    // 检测设备类型
    this.isMobile = this.detectMobileDevice();
    this.hasTouch = 'ontouchstart' in window;
    
    // 根据设备类型启用相应的输入处理
    if (this.hasTouch) {
        this.touchHandler.enable();
    } else {
        this.mouseHandler.enable();
    }
    
    this.keyboardHandler.enable();
    
    console.log('[InputManager] 输入系统初始化完成');
    console.log('- 移动设备:', this.isMobile);
    console.log('- 支持触摸:', this.hasTouch);
};

/**
 * 检测移动设备
 * @returns {boolean} 是否为移动设备
 */
InputManager.prototype.detectMobileDevice = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * 添加事件监听器
 * @param {string} eventType - 事件类型
 * @param {Function} callback - 回调函数
 */
InputManager.prototype.addEventListener = function(eventType, callback) {
    if (this.eventListeners[eventType]) {
        this.eventListeners[eventType].push(callback);
    }
};

/**
 * 移除事件监听器
 * @param {string} eventType - 事件类型
 * @param {Function} callback - 回调函数
 */
InputManager.prototype.removeEventListener = function(eventType, callback) {
    if (this.eventListeners[eventType]) {
        var index = this.eventListeners[eventType].indexOf(callback);
        if (index !== -1) {
            this.eventListeners[eventType].splice(index, 1);
        }
    }
};

/**
 * 触发事件
 * @param {string} eventType - 事件类型
 * @param {Object} eventData - 事件数据
 */
InputManager.prototype.triggerEvent = function(eventType, eventData) {
    if (this.eventListeners[eventType]) {
        for (var i = 0; i < this.eventListeners[eventType].length; i++) {
            this.eventListeners[eventType][i](eventData);
        }
    }
    
    // 同时调用游戏引擎的相应处理方法
    this.handleGameEngineEvent(eventType, eventData);
};

/**
 * 处理游戏引擎事件
 * @param {string} eventType - 事件类型
 * @param {Object} eventData - 事件数据
 */
InputManager.prototype.handleGameEngineEvent = function(eventType, eventData) {
    if (!this.gameEngine) return;
    
    switch (eventType) {
        case 'tap':
            this.handleTap(eventData);
            break;
        case 'doubleTap':
            this.handleDoubleTap(eventData);
            break;
        case 'longPress':
            this.handleLongPress(eventData);
            break;
        case 'drag':
            this.handleDrag(eventData);
            break;
        case 'swipe':
            this.handleSwipe(eventData);
            break;
    }
};

/**
 * 处理点击事件
 * @param {Object} eventData - 事件数据
 */
InputManager.prototype.handleTap = function(eventData) {
    var x = eventData.x;
    var y = eventData.y;
    
    // 检查是否点击了UI元素
    if (this.checkUIClick(x, y)) {
        return;
    }
    
    // 检查是否点击了建筑
    var building = this.checkBuildingClick(x, y);
    if (building) {
        this.gameEngine.onBuildingClick(building);
        return;
    }
    
    // 检查是否点击了角色
    var character = this.checkCharacterClick(x, y);
    if (character) {
        this.gameEngine.onCharacterClick(character);
        return;
    }
    
    // 普通地面点击 - 移动角色
    this.gameEngine.onGroundClick(x, y);
};

/**
 * 处理双击事件
 * @param {Object} eventData - 事件数据
 */
InputManager.prototype.handleDoubleTap = function(eventData) {
    // 双击可以用于快速移动或特殊操作
    this.gameEngine.onDoubleTap(eventData.x, eventData.y);
};

/**
 * 处理长按事件
 * @param {Object} eventData - 事件数据
 */
InputManager.prototype.handleLongPress = function(eventData) {
    // 长按可以用于选择多个角色或显示上下文菜单
    this.gameEngine.onLongPress(eventData.x, eventData.y);
};

/**
 * 处理拖拽事件
 * @param {Object} eventData - 事件数据
 */
InputManager.prototype.handleDrag = function(eventData) {
    // 拖拽可以用于移动视角或选择区域
    if (eventData.type === 'start') {
        this.gameEngine.onDragStart(eventData.x, eventData.y);
    } else if (eventData.type === 'move') {
        this.gameEngine.onDragMove(eventData.x, eventData.y, eventData.deltaX, eventData.deltaY);
    } else if (eventData.type === 'end') {
        this.gameEngine.onDragEnd(eventData.x, eventData.y);
    }
};

/**
 * 处理滑动事件
 * @param {Object} eventData - 事件数据
 */
InputManager.prototype.handleSwipe = function(eventData) {
    // 滑动可以用于快速移动视角
    this.gameEngine.onSwipe(eventData.direction, eventData.velocity);
};

/**
 * 检查UI点击
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {boolean} 是否点击了UI
 */
InputManager.prototype.checkUIClick = function(x, y) {
    // 检查状态栏
    if (y < 60) {
        return true;
    }
    
    // 检查右上角按钮
    if (x > this.canvas.width - 100 && y < 100) {
        return true;
    }
    
    // 检查小地图
    if (x > this.canvas.width - 160 && y > 70 && y < 230) {
        return true;
    }
    
    return false;
};

/**
 * 检查建筑点击
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {Object|null} 被点击的建筑
 */
InputManager.prototype.checkBuildingClick = function(x, y) {
    if (!this.gameEngine.buildings) return null;
    
    for (var i = 0; i < this.gameEngine.buildings.length; i++) {
        var building = this.gameEngine.buildings[i];
        
        if (x >= building.x && x <= building.x + building.width &&
            y >= building.y && y <= building.y + building.height) {
            return building;
        }
    }
    
    return null;
};

/**
 * 检查角色点击
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {Object|null} 被点击的角色
 */
InputManager.prototype.checkCharacterClick = function(x, y) {
    if (!this.gameEngine.characterManager) return null;
    
    var characters = this.gameEngine.characterManager.characters;
    
    for (var i = 0; i < characters.length; i++) {
        var character = characters[i];
        var distance = Math.sqrt(Math.pow(x - character.x, 2) + Math.pow(y - character.y, 2));
        
        if (distance <= character.radius) {
            return character;
        }
    }
    
    return null;
};

/**
 * 获取相对于画布的坐标
 * @param {Object} event - 事件对象
 * @returns {Object} 坐标对象 {x, y}
 */
InputManager.prototype.getCanvasCoordinates = function(event) {
    var rect = this.canvas.getBoundingClientRect();
    var scaleX = this.canvas.width / rect.width;
    var scaleY = this.canvas.height / rect.height;
    
    var clientX, clientY;
    
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
};

/**
 * 触摸处理器
 * @param {Object} canvas - 画布对象
 * @param {Object} inputManager - 输入管理器引用
 */
function TouchHandler(canvas, inputManager) {
    this.canvas = canvas;
    this.inputManager = inputManager;
    this.enabled = false;
    
    // 触摸状态
    this.touches = {};
    this.gestureState = {
        isGesturing: false,
        initialDistance: 0,
        initialAngle: 0
    };
}

/**
 * 启用触摸处理
 */
TouchHandler.prototype.enable = function() {
    if (this.enabled) return;
    
    var self = this;
    
    this.canvas.addEventListener('touchstart', function(e) {
        self.onTouchStart(e);
    }, {passive: false});
    
    this.canvas.addEventListener('touchmove', function(e) {
        self.onTouchMove(e);
    }, {passive: false});
    
    this.canvas.addEventListener('touchend', function(e) {
        self.onTouchEnd(e);
    }, {passive: false});
    
    this.canvas.addEventListener('touchcancel', function(e) {
        self.onTouchCancel(e);
    }, {passive: false});
    
    this.enabled = true;
    console.log('[TouchHandler] 触摸处理器已启用');
};

/**
 * 触摸开始事件
 * @param {Object} event - 触摸事件
 */
TouchHandler.prototype.onTouchStart = function(event) {
    event.preventDefault();
    
    var currentTime = Date.now();
    var coords = this.inputManager.getCanvasCoordinates(event);
    
    // 更新输入状态
    var inputState = this.inputManager.inputState;
    inputState.isPressed = true;
    inputState.currentX = coords.x;
    inputState.currentY = coords.y;
    inputState.startX = coords.x;
    inputState.startY = coords.y;
    inputState.pressTime = currentTime;
    
    // 检测双击
    if (currentTime - inputState.lastTapTime < this.inputManager.config.doubleTapThreshold) {
        inputState.tapCount++;
    } else {
        inputState.tapCount = 1;
    }
    
    // 记录触摸点
    for (var i = 0; i < event.touches.length; i++) {
        var touch = event.touches[i];
        this.touches[touch.identifier] = {
            x: touch.clientX,
            y: touch.clientY,
            startTime: currentTime
        };
    }
    
    // 多点触摸手势检测
    if (event.touches.length > 1) {
        this.gestureState.isGesturing = true;
        this.initializeGesture(event.touches);
    }
    
    // 启动长按检测
    this.startLongPressDetection();
};

/**
 * 触摸移动事件
 * @param {Object} event - 触摸事件
 */
TouchHandler.prototype.onTouchMove = function(event) {
    event.preventDefault();
    
    var coords = this.inputManager.getCanvasCoordinates(event);
    var inputState = this.inputManager.inputState;
    
    // 更新位置
    var deltaX = coords.x - inputState.currentX;
    var deltaY = coords.y - inputState.currentY;
    
    inputState.deltaX = deltaX;
    inputState.deltaY = deltaY;
    inputState.currentX = coords.x;
    inputState.currentY = coords.y;
    
    // 检测拖拽
    var dragDistance = Math.sqrt(
        Math.pow(coords.x - inputState.startX, 2) + 
        Math.pow(coords.y - inputState.startY, 2)
    );
    
    if (dragDistance > this.inputManager.config.dragThreshold) {
        this.cancelLongPressDetection();
        
        if (event.touches.length === 1) {
            this.inputManager.triggerEvent('drag', {
                type: 'move',
                x: coords.x,
                y: coords.y,
                deltaX: deltaX,
                deltaY: deltaY,
                startX: inputState.startX,
                startY: inputState.startY
            });
        }
    }
    
    // 多点触摸手势处理
    if (event.touches.length > 1 && this.gestureState.isGesturing) {
        this.handleMultiTouchGesture(event.touches);
    }
};

/**
 * 触摸结束事件
 * @param {Object} event - 触摸事件
 */
TouchHandler.prototype.onTouchEnd = function(event) {
    event.preventDefault();
    
    var currentTime = Date.now();
    var coords = this.inputManager.getCanvasCoordinates(event);
    var inputState = this.inputManager.inputState;
    
    this.cancelLongPressDetection();
    
    // 检测点击
    var dragDistance = Math.sqrt(
        Math.pow(coords.x - inputState.startX, 2) + 
        Math.pow(coords.y - inputState.startY, 2)
    );
    
    if (dragDistance < this.inputManager.config.dragThreshold) {
        // 检测滑动
        var swipeDistance = Math.sqrt(
            Math.pow(inputState.deltaX, 2) + Math.pow(inputState.deltaY, 2)
        );
        
        var pressDuration = currentTime - inputState.pressTime;
        var velocity = swipeDistance / pressDuration;
        
        if (swipeDistance > this.inputManager.config.swipeThreshold && 
            velocity > this.inputManager.config.swipeVelocityThreshold) {
            
            var direction = this.getSwipeDirection(inputState.deltaX, inputState.deltaY);
            this.inputManager.triggerEvent('swipe', {
                direction: direction,
                velocity: velocity,
                distance: swipeDistance
            });
        } else {
            // 普通点击
            if (inputState.tapCount >= 2) {
                this.inputManager.triggerEvent('doubleTap', {
                    x: coords.x,
                    y: coords.y
                });
            } else {
                this.inputManager.triggerEvent('tap', {
                    x: coords.x,
                    y: coords.y
                });
            }
        }
    }
    
    inputState.lastTapTime = currentTime;
    inputState.isPressed = false;
    
    // 清理触摸点记录
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        delete this.touches[touch.identifier];
    }
    
    // 结束手势
    if (event.touches.length <= 1) {
        this.gestureState.isGesturing = false;
    }
};

/**
 * 触摸取消事件
 * @param {Object} event - 触摸事件
 */
TouchHandler.prototype.onTouchCancel = function(event) {
    this.onTouchEnd(event);
};

/**
 * 启动长按检测
 */
TouchHandler.prototype.startLongPressDetection = function() {
    var self = this;
    this.longPressTimer = setTimeout(function() {
        var inputState = self.inputManager.inputState;
        if (inputState.isPressed) {
            self.inputManager.triggerEvent('longPress', {
                x: inputState.currentX,
                y: inputState.currentY
            });
        }
    }, this.inputManager.config.longPressThreshold);
};

/**
 * 取消长按检测
 */
TouchHandler.prototype.cancelLongPressDetection = function() {
    if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
    }
};

/**
 * 初始化手势
 * @param {Object} touches - 触摸点列表
 */
TouchHandler.prototype.initializeGesture = function(touches) {
    if (touches.length >= 2) {
        var touch1 = touches[0];
        var touch2 = touches[1];
        
        this.gestureState.initialDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        this.gestureState.initialAngle = Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
        );
    }
};

/**
 * 处理多点触摸手势
 * @param {Object} touches - 触摸点列表
 */
TouchHandler.prototype.handleMultiTouchGesture = function(touches) {
    if (touches.length >= 2) {
        var touch1 = touches[0];
        var touch2 = touches[1];
        
        var currentDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        var currentAngle = Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
        );
        
        // 缩放手势
        var scale = currentDistance / this.gestureState.initialDistance;
        if (Math.abs(scale - 1) > 0.1) {
            this.inputManager.triggerEvent('pinch', {
                scale: scale,
                centerX: (touch1.clientX + touch2.clientX) / 2,
                centerY: (touch1.clientY + touch2.clientY) / 2
            });
        }
        
        // 旋转手势
        var rotation = currentAngle - this.gestureState.initialAngle;
        if (Math.abs(rotation) > 0.1) {
            this.inputManager.triggerEvent('rotate', {
                rotation: rotation,
                centerX: (touch1.clientX + touch2.clientX) / 2,
                centerY: (touch1.clientY + touch2.clientY) / 2
            });
        }
    }
};

/**
 * 获取滑动方向
 * @param {number} deltaX - X方向位移
 * @param {number} deltaY - Y方向位移
 * @returns {string} 滑动方向
 */
TouchHandler.prototype.getSwipeDirection = function(deltaX, deltaY) {
    var absDeltaX = Math.abs(deltaX);
    var absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > absDeltaY) {
        return deltaX > 0 ? 'right' : 'left';
    } else {
        return deltaY > 0 ? 'down' : 'up';
    }
};

/**
 * 鼠标处理器
 * @param {Object} canvas - 画布对象
 * @param {Object} inputManager - 输入管理器引用
 */
function MouseHandler(canvas, inputManager) {
    this.canvas = canvas;
    this.inputManager = inputManager;
    this.enabled = false;
}

/**
 * 启用鼠标处理
 */
MouseHandler.prototype.enable = function() {
    if (this.enabled) return;
    
    var self = this;
    
    this.canvas.addEventListener('mousedown', function(e) {
        self.onMouseDown(e);
    });
    
    this.canvas.addEventListener('mousemove', function(e) {
        self.onMouseMove(e);
    });
    
    this.canvas.addEventListener('mouseup', function(e) {
        self.onMouseUp(e);
    });
    
    this.canvas.addEventListener('wheel', function(e) {
        self.onWheel(e);
    });
    
    this.canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    this.enabled = true;
    console.log('[MouseHandler] 鼠标处理器已启用');
};

/**
 * 鼠标按下事件
 * @param {Object} event - 鼠标事件
 */
MouseHandler.prototype.onMouseDown = function(event) {
    var coords = this.inputManager.getCanvasCoordinates(event);
    var inputState = this.inputManager.inputState;
    
    inputState.isPressed = true;
    inputState.currentX = coords.x;
    inputState.currentY = coords.y;
    inputState.startX = coords.x;
    inputState.startY = coords.y;
    inputState.pressTime = Date.now();
    
    if (event.button === 0) { // 左键
        this.inputManager.triggerEvent('drag', {
            type: 'start',
            x: coords.x,
            y: coords.y
        });
    }
};

/**
 * 鼠标移动事件
 * @param {Object} event - 鼠标事件
 */
MouseHandler.prototype.onMouseMove = function(event) {
    var coords = this.inputManager.getCanvasCoordinates(event);
    var inputState = this.inputManager.inputState;
    
    if (inputState.isPressed) {
        var deltaX = coords.x - inputState.currentX;
        var deltaY = coords.y - inputState.currentY;
        
        inputState.deltaX = deltaX;
        inputState.deltaY = deltaY;
        inputState.currentX = coords.x;
        inputState.currentY = coords.y;
        
        this.inputManager.triggerEvent('drag', {
            type: 'move',
            x: coords.x,
            y: coords.y,
            deltaX: deltaX,
            deltaY: deltaY
        });
    }
};

/**
 * 鼠标释放事件
 * @param {Object} event - 鼠标事件
 */
MouseHandler.prototype.onMouseUp = function(event) {
    var coords = this.inputManager.getCanvasCoordinates(event);
    var inputState = this.inputManager.inputState;
    
    if (inputState.isPressed) {
        var dragDistance = Math.sqrt(
            Math.pow(coords.x - inputState.startX, 2) + 
            Math.pow(coords.y - inputState.startY, 2)
        );
        
        if (dragDistance < this.inputManager.config.dragThreshold) {
            // 点击事件
            this.inputManager.triggerEvent('tap', {
                x: coords.x,
                y: coords.y,
                button: event.button
            });
        } else {
            // 拖拽结束
            this.inputManager.triggerEvent('drag', {
                type: 'end',
                x: coords.x,
                y: coords.y
            });
        }
    }
    
    inputState.isPressed = false;
};

/**
 * 鼠标滚轮事件
 * @param {Object} event - 滚轮事件
 */
MouseHandler.prototype.onWheel = function(event) {
    event.preventDefault();
    
    var coords = this.inputManager.getCanvasCoordinates(event);
    
    this.inputManager.triggerEvent('wheel', {
        x: coords.x,
        y: coords.y,
        deltaY: event.deltaY,
        direction: event.deltaY > 0 ? 'down' : 'up'
    });
};

/**
 * 键盘处理器
 * @param {Object} inputManager - 输入管理器引用
 */
function KeyboardHandler(inputManager) {
    this.inputManager = inputManager;
    this.enabled = false;
    this.pressedKeys = {};
}

/**
 * 启用键盘处理
 */
KeyboardHandler.prototype.enable = function() {
    if (this.enabled) return;
    
    var self = this;
    
    document.addEventListener('keydown', function(e) {
        self.onKeyDown(e);
    });
    
    document.addEventListener('keyup', function(e) {
        self.onKeyUp(e);
    });
    
    this.enabled = true;
    console.log('[KeyboardHandler] 键盘处理器已启用');
};

/**
 * 键盘按下事件
 * @param {Object} event - 键盘事件
 */
KeyboardHandler.prototype.onKeyDown = function(event) {
    this.pressedKeys[event.code] = true;
    
    // 处理特殊按键
    switch (event.code) {
        case 'Space':
            event.preventDefault();
            this.inputManager.gameEngine.onSpaceKey();
            break;
        case 'Escape':
            this.inputManager.gameEngine.onEscapeKey();
            break;
        case 'KeyP':
            this.inputManager.gameEngine.onPauseKey();
            break;
    }
};

/**
 * 键盘释放事件
 * @param {Object} event - 键盘事件
 */
KeyboardHandler.prototype.onKeyUp = function(event) {
    this.pressedKeys[event.code] = false;
};

/**
 * 检查按键是否被按下
 * @param {string} keyCode - 按键代码
 * @returns {boolean} 是否被按下
 */
KeyboardHandler.prototype.isKeyPressed = function(keyCode) {
    return !!this.pressedKeys[keyCode];
};

/**
 * 手势识别器
 * @param {Object} inputManager - 输入管理器引用
 */
function GestureRecognizer(inputManager) {
    this.inputManager = inputManager;
}

/**
 * 识别手势
 * @param {Object} gestureData - 手势数据
 * @returns {string|null} 识别的手势类型
 */
GestureRecognizer.prototype.recognizeGesture = function(gestureData) {
    // 简单的手势识别逻辑
    // 可以扩展为更复杂的机器学习算法
    
    if (gestureData.type === 'swipe') {
        return this.recognizeSwipeGesture(gestureData);
    } else if (gestureData.type === 'pinch') {
        return this.recognizePinchGesture(gestureData);
    }
    
    return null;
};

/**
 * 识别滑动手势
 * @param {Object} gestureData - 手势数据
 * @returns {string} 手势类型
 */
GestureRecognizer.prototype.recognizeSwipeGesture = function(gestureData) {
    var velocity = gestureData.velocity;
    var distance = gestureData.distance;
    
    if (velocity > 1.0 && distance > 100) {
        return 'fast_swipe';
    } else if (velocity > 0.5 && distance > 50) {
        return 'normal_swipe';
    } else {
        return 'slow_swipe';
    }
};

/**
 * 识别缩放手势
 * @param {Object} gestureData - 手势数据
 * @returns {string} 手势类型
 */
GestureRecognizer.prototype.recognizePinchGesture = function(gestureData) {
    var scale = gestureData.scale;
    
    if (scale > 1.2) {
        return 'zoom_in';
    } else if (scale < 0.8) {
        return 'zoom_out';
    } else {
        return 'pinch';
    }
};

// 导出类（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        InputManager,
        TouchHandler,
        MouseHandler,
        KeyboardHandler,
        GestureRecognizer
    };
}
