
// ========================================
// 输入系统实现 (Input System Implementation)
// ========================================

/**
 * 设置输入系统
 */
function setupInput(gameEngine) {
    var self = gameEngine;

    console.log('[Input] 开始设置触摸事件，画布尺寸:', gameEngine.canvas.width, 'x', gameEngine.canvas.height);

    // 初始化摇杆对象
    if (!gameEngine.joystick) {
        gameEngine.joystick = {
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
    gameEngine.eventHandlers = {
        touchStart: null, touchMove: null, touchEnd: null
    };

    // 标记事件绑定状态，避免重复绑定
    gameEngine.eventsBound = false;

    // 抖音平台适配：默认位置在屏幕底部中央
    gameEngine.joystick.centerX = gameEngine.canvas.width / 2;
    gameEngine.joystick.centerY = gameEngine.canvas.height - 80;
    gameEngine.joystick.currentX = gameEngine.joystick.centerX;
    gameEngine.joystick.currentY = gameEngine.joystick.centerY;

    console.log('[Input] 摇杆位置设置完成:', gameEngine.joystick.centerX, gameEngine.joystick.centerY);

    // 抖音小程序触摸事件处理 - 修复兼容性问题
    if (typeof tt !== 'undefined') {
        // 先解绑之前的事件（如果存在）
        if (gameEngine.eventHandlers.touchStart) {
            try {
                tt.offTouchStart(gameEngine.eventHandlers.touchStart);
            } catch (e) {
                console.warn('[Input] 解绑抖音触摸开始事件失败:', e);
            }
        }
        if (gameEngine.eventHandlers.touchMove) {
            try {
                tt.offTouchMove(gameEngine.eventHandlers.touchMove);
            } catch (e) {
                console.warn('[Input] 解绑抖音触摸移动事件失败:', e);
            }
        }
        if (gameEngine.eventHandlers.touchEnd) {
            try {
                tt.offTouchEnd(gameEngine.eventHandlers.touchEnd);
            } catch (e) {
                console.warn('[Input] 解绑抖音触摸结束事件失败:', e);
            }
        }

        // 使用抖音小程序的触摸事件API
        try {
            gameEngine.eventHandlers.touchStart = function (res) {
                onTouchStart(res, gameEngine);
            };
            gameEngine.eventHandlers.touchMove = function (res) {
                onTouchMove(res, gameEngine);
            };
            gameEngine.eventHandlers.touchEnd = function (res) {
                onTouchEnd(res, gameEngine);
            };

            tt.onTouchStart(gameEngine.eventHandlers.touchStart);
            tt.onTouchMove(gameEngine.eventHandlers.touchMove);
            tt.onTouchEnd(gameEngine.eventHandlers.touchEnd);

            gameEngine.eventsBound = true;
            console.log('[Input] 抖音触摸事件绑定成功');

        } catch (ttError) {
            console.warn('[Input] 抖音触摸事件绑定失败，使用Canvas事件:', ttError);
            bindCanvasEvents(gameEngine);
        }
    } else {
        // 抖音小游戏环境：使用Canvas事件属性
        bindCanvasEvents(gameEngine);
    }
}

/**
 * 绑定Canvas事件的方法
 */
function bindCanvasEvents(gameEngine) {
    var self = gameEngine;

    try {
        // 先清理之前的事件绑定
        gameEngine.canvas.ontouchstart = null;
        gameEngine.canvas.ontouchmove = null;
        gameEngine.canvas.ontouchend = null;
        gameEngine.canvas.onclick = null;

        // 重新绑定事件
        gameEngine.canvas.ontouchstart = function (e) {
            onTouchStart(e, gameEngine);
        };
        gameEngine.canvas.ontouchmove = function (e) {
            onTouchMove(e, gameEngine);
        };
        gameEngine.canvas.ontouchend = function (e) {
            onTouchEnd(e, gameEngine);
        };
        gameEngine.canvas.onclick = function (e) {
            onClick(e, gameEngine);
        };

        gameEngine.eventsBound = true;
        console.log('[Input] Canvas触摸事件绑定成功');
    } catch (error) {
        console.error('[Input] Canvas触摸事件绑定失败:', error);
    }
}

/**
 * 触摸开始事件处理
 */
function onTouchStart(e, gameEngine) {
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
            var rect = gameEngine.canvas.getBoundingClientRect();
            x = x - rect.left;
            y = y - rect.top;
        } catch (error) {
            console.warn('[Touch] 画布坐标转换失败，使用原始坐标:', error);
        }

        gameEngine.touchStartX = x;
        gameEngine.touchStartY = y;
        gameEngine.touchStartTime = Date.now();

        console.log('[Touch] 触摸开始，坐标:', x, y, '游戏状态:', gameEngine.gameState);

        if (gameEngine.gameState === 'playing' || gameEngine.gameState === 'submap') {
            // 抖音小游戏环境：确保坐标是有效数值
            if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
                // 使用距离平方避免开方运算，提高性能
                var dx = x - gameEngine.joystick.centerX;
                var dy = y - gameEngine.joystick.centerY;
                var joystickDistanceSquared = dx * dx + dy * dy;
                var joystickRadiusSquared = gameEngine.joystick.radius * gameEngine.joystick.radius;

                console.log('[Touch] 触摸坐标:', x, y, '摇杆中心:', gameEngine.joystick.centerX, gameEngine.joystick.centerY, '距离:', Math.sqrt(joystickDistanceSquared).toFixed(1), '摇杆半径:', gameEngine.joystick.radius);

                if (joystickDistanceSquared <= joystickRadiusSquared) {
                    // 激活摇杆
                    gameEngine.joystick.active = true;
                    gameEngine.joystick.currentX = x;
                    gameEngine.joystick.currentY = y;
                    updateJoystickDirection(gameEngine);
                    console.log('[Joystick] 摇杆已激活，开始控制移动');
                } else {
                    console.log('[Touch] 触摸位置超出摇杆范围，不激活摇杆');
                }
            } else {
                console.warn('[Touch] 无效的触摸坐标:', {x: x, y: y, event: e});
            }
        } else {
            console.log('[Touch] 当前游戏状态不支持摇杆控制:', gameEngine.gameState);
        }
    } catch (error) {
        console.error('[Input] 触摸开始处理错误:', error);
        resetJoystick(gameEngine);
    }
}

/**
 * 触摸移动事件处理
 */
function onTouchMove(e, gameEngine) {
    try {
        if (!gameEngine.joystick.active) {
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
                var rect = gameEngine.canvas.getBoundingClientRect();
                x = x - rect.left;
                y = y - rect.top;
            } catch (error) {
                console.warn('[Touch] 触摸移动画布坐标转换失败，使用原始坐标:', error);
            }
        }

        var dx = x - gameEngine.joystick.centerX;
        var dy = y - gameEngine.joystick.centerY;
        var distanceSquared = dx * dx + dy * dy;
        var maxDistanceSquared = gameEngine.joystick.maxDistance * gameEngine.joystick.maxDistance;

        if (distanceSquared <= maxDistanceSquared) {
            gameEngine.joystick.currentX = x;
            gameEngine.joystick.currentY = y;
        } else {
            var angle = Math.atan2(dy, dx);
            gameEngine.joystick.currentX = gameEngine.joystick.centerX + Math.cos(angle) * gameEngine.joystick.maxDistance;
            gameEngine.joystick.currentY = gameEngine.joystick.centerY + Math.sin(angle) * gameEngine.joystick.maxDistance;
        }

        // 实时更新摇杆方向
        updateJoystickDirection(gameEngine);

    } catch (error) {
        console.error('[Input] 触摸移动处理错误:', error);
        resetJoystick(gameEngine);
    }
}

/**
 * 触摸结束事件处理
 */
function onTouchEnd(e, gameEngine) {
    try {
        // 检测是否为快速点击（tap）
        var touchEndTime = Date.now();
        var touchDuration = touchEndTime - (gameEngine.touchStartTime || touchEndTime);

        if (touchDuration < 300 && !gameEngine.joystick.active) {
            // 模拟点击事件
            console.log('[Touch] 检测到点击，坐标:', gameEngine.touchStartX, gameEngine.touchStartY, '游戏状态:', gameEngine.gameState);
            onClick({
                x: gameEngine.touchStartX || 0, y: gameEngine.touchStartY || 0
            }, gameEngine);
        }

        // 立即重置摇杆状态
        resetJoystick(gameEngine);

    } catch (error) {
        console.error('[Input] 触摸结束处理错误:', error);
        resetJoystick(gameEngine);
    }
}

/**
 * 重置摇杆状态
 */
function resetJoystick(gameEngine) {
    // 完全重置摇杆状态
    gameEngine.joystick.active = false;
    gameEngine.joystick.currentX = gameEngine.joystick.centerX;
    gameEngine.joystick.currentY = gameEngine.joystick.centerY;
    gameEngine.joystick.direction.x = 0;
    gameEngine.joystick.direction.y = 0;

    // 确保玩家停止移动
    if (gameEngine.player) {
        gameEngine.player.isWalking = false;
        gameEngine.player.walkAnimationFrame = 0;
    }

    console.log('[Joystick] 摇杆状态已重置');
}

/**
 * 检查事件绑定状态的方法
 */
function checkEventBindingStatus(gameEngine) {
    var status = {
        eventsBound: gameEngine.eventsBound, 
        ttAvailable: typeof tt !== 'undefined', 
        eventHandlers: {
            touchStart: !!gameEngine.eventHandlers.touchStart,
            touchMove: !!gameEngine.eventHandlers.touchMove,
            touchEnd: !!gameEngine.eventHandlers.touchEnd
        }, 
        canvasEvents: {
            ontouchstart: !!gameEngine.canvas.ontouchstart,
            ontouchmove: !!gameEngine.canvas.ontouchmove,
            ontouchend: !!gameEngine.canvas.ontouchend,
            onclick: !!gameEngine.canvas.onclick
        }
    };

    console.log('[Input] 事件绑定状态检查:', status);
    return status;
}

/**
 * 更新摇杆方向
 */
function updateJoystickDirection(gameEngine) {
    try {
        // 只有在摇杆激活时才更新方向
        if (!gameEngine.joystick.active) {
            gameEngine.joystick.direction.x = 0;
            gameEngine.joystick.direction.y = 0;
            return;
        }

        var dx = gameEngine.joystick.currentX - gameEngine.joystick.centerX;
        var dy = gameEngine.joystick.currentY - gameEngine.joystick.centerY;
        var distanceSquared = dx * dx + dy * dy;
        var minDistanceSquared = 5 * 5; // 25

        if (distanceSquared > minDistanceSquared) {
            var distance = Math.sqrt(distanceSquared);
            var normalizedDistance = Math.min(distance, gameEngine.joystick.maxDistance) / gameEngine.joystick.maxDistance;
            gameEngine.joystick.direction.x = (dx / distance) * normalizedDistance;
            gameEngine.joystick.direction.y = (dy / distance) * normalizedDistance;
        } else {
            gameEngine.joystick.direction.x = 0;
            gameEngine.joystick.direction.y = 0;
        }
    } catch (error) {
        console.error('[Input] 摇杆方向更新错误:', error);
        resetJoystick(gameEngine);
    }
}

/**
 * 点击事件处理
 */
function onClick(e, gameEngine) {
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

    if (gameEngine.gameState === 'menu') {
        handleMenuClick(x, y, gameEngine);
    } else if (gameEngine.gameState === 'playing') {
        handleGameClick(x, y, gameEngine);
    } else if (gameEngine.gameState === 'submap') {
        handleSubMapClick(x, y, gameEngine);
    } else if (gameEngine.gameState === 'gameover' || gameEngine.gameState === 'victory') {
        handleEndGameClick(x, y, gameEngine);
    }
}

/**
 * 处理菜单点击
 */
function handleMenuClick(x, y, gameEngine) {
    var centerX = gameEngine.canvas.width / 2;
    var buttonWidth = 220;
    var buttonHeight = 55;
    var buttonX = centerX - buttonWidth / 2;
    var buttonY = 320;

    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        gameEngine.startGame();
    }
}

/**
 * 处理游戏点击
 */
function handleGameClick(x, y, gameEngine) {
    console.log('[Click] 游戏点击事件，坐标:', x, y, '弹出提示状态:', {
        exists: !!gameEngine.buildingEntryPrompt, active: gameEngine.buildingEntryPrompt ? gameEngine.buildingEntryPrompt.active : false
    });

    if (gameEngine.buildingEntryPrompt && gameEngine.buildingEntryPrompt.active) {
        console.log('[Click] 调用建筑进入提示点击处理');
        handleBuildingEntryPromptClick(x, y, gameEngine);
        return;
    }
}

/**
 * 处理建筑进入提示点击
 */
function handleBuildingEntryPromptClick(x, y, gameEngine) {
    console.log('[Click] 处理建筑进入提示点击，坐标:', x, y);
    var prompt = gameEngine.buildingEntryPrompt;
    var centerX = gameEngine.canvas.width / 2;
    var centerY = gameEngine.canvas.height / 2;
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
        if (gameEngine.nearBuilding && gameEngine.nearBuilding.id === prompt.building.id && gameEngine.nearBuilding.name === prompt.building.name) {
            console.log('[Click] 开始进入建筑:', prompt.building.name);
            gameEngine.mapModule.exploreBuilding(prompt.building, gameEngine);
        } else {
            console.log('[Click] 进入建筑失败，nearBuilding不匹配:', {
                nearBuilding: gameEngine.nearBuilding, promptBuilding: prompt.building
            });
        }
        gameEngine.buildingEntryPrompt = null;
        return;
    }

    var cancelButtonX = centerX + 20;
    if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        gameEngine.buildingEntryPrompt = null;
        return;
    }
}

/**
 * 处理子地图点击
 */
function handleSubMapClick(x, y, gameEngine) {
    if (x >= 10 && x <= 90 && y >= gameEngine.canvas.height - 40 && y <= gameEngine.canvas.height - 10) {
        gameEngine.mapModule.exitBuilding(gameEngine);
        return;
    }

    // 使用for循环遍历资源，可以提前退出以提高性能
    for (var i = 0; i < gameEngine.resources.length; i++) {
        var resource = gameEngine.resources[i];
        if (!resource.collected) {
            // 使用距离平方避免开方运算，提高性能
            var dx = x - resource.x;
            var dy = y - resource.y;
            var distanceSquared = dx * dx + dy * dy;
            var interactionRadiusSquared = 30 * 30; // 900

            if (distanceSquared <= interactionRadiusSquared) {
                gameEngine.collectResource(resource);
                break; // 找到一个资源后即可退出
            }
        }
    }
}

/**
 * 处理游戏结束点击
 */
function handleEndGameClick(x, y, gameEngine) {
    var centerX = gameEngine.canvas.width / 2;
    var centerY = gameEngine.canvas.height / 2;

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
    console.log('[EndGame] 画布尺寸:', gameEngine.canvas.width, 'x', gameEngine.canvas.height);
    console.log('[EndGame] 画布中心:', centerX, centerY);
    console.log('[EndGame] 重新开始按钮区域:', restartButtonX, restartButtonY, restartButtonWidth, restartButtonHeight);
    console.log('[EndGame] 返回菜单按钮区域:', menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight);

    // 检查重新开始按钮点击
    if (x >= restartButtonX && x <= restartButtonX + restartButtonWidth && y >= restartButtonY && y <= restartButtonY + restartButtonHeight) {
        console.log('[EndGame] 重新开始按钮被点击');
        gameEngine.restartGame();
        return;
    }

    // 检查返回菜单按钮点击
    if (x >= menuButtonX && x <= menuButtonX + menuButtonWidth && y >= menuButtonY && y <= menuButtonY + menuButtonHeight) {
        console.log('[EndGame] 返回菜单按钮被点击');
        returnToMenu(gameEngine);
        return;
    }

    console.log('[EndGame] 点击未命中任何按钮');
}

/**
 * 返回菜单函数
 */
function returnToMenu(gameEngine) {
    console.log('[GameEngine] 返回菜单');

    // 重置游戏状态
    gameEngine.gameState = 'menu';
    gameEngine.isGameEnded = false;

    // 清理游戏对象
    gameEngine.cleanupGameObjects();

    // 强制重新绑定触摸事件
    gameEngine.eventsBound = false;
    setupInput(gameEngine);
    console.log('[Input] 返回菜单时重新绑定触摸事件');

    // 重置摇杆状态
    resetJoystick(gameEngine);

    // 重新开始游戏循环以显示菜单
    gameEngine.running = true;
    gameEngine.lastTime = Date.now();
}

// 模块导出
module.exports = {
    setupInput: setupInput,
    bindCanvasEvents: bindCanvasEvents,
    onTouchStart: onTouchStart,
    onTouchMove: onTouchMove,
    onTouchEnd: onTouchEnd,
    resetJoystick: resetJoystick,
    checkEventBindingStatus: checkEventBindingStatus,
    updateJoystickDirection: updateJoystickDirection,
    onClick: onClick,
    handleMenuClick: handleMenuClick,
    handleGameClick: handleGameClick,
    handleBuildingEntryPromptClick: handleBuildingEntryPromptClick,
    handleSubMapClick: handleSubMapClick,
    handleEndGameClick: handleEndGameClick,
    returnToMenu: returnToMenu
};