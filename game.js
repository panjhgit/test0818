/**
 * 游戏主入口文件
 * 负责游戏的初始化和启动
 */

// 全局游戏实例
var gameEngine = null;

/**
 * 初始化游戏
 */
function initGame() {
    try {
        console.log('[Main] 开始初始化游戏...');

        // 检查配置模块
        if (typeof GameConfig === 'undefined') {
            console.error('[Main] GameConfig 模块未加载！');
            throw new Error('GameConfig 模块未加载');
        }

        // 获取配置
        var GAME_CONFIG = GameConfig.getGameConfig();
        var VIEWPORT_CONFIG = GameConfig.getViewportConfig();

        console.log('[Main] 配置加载成功');

        // 创建画布
        var canvas = createCanvas();
        if (!canvas) {
            throw new Error('无法创建画布');
        }

        var ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('无法获取画布上下文');
        }

        console.log('[Main] 画布创建成功，尺寸:', canvas.width, 'x', canvas.height);

        // 创建游戏引擎
        gameEngine = new GameEngine(canvas, ctx);
        console.log('[Main] 游戏引擎创建成功');

        // 设置输入事件
        setupGameInput(canvas);
        console.log('[Main] 输入系统设置完成');

        // 启动游戏
        gameEngine.start();
        console.log('[Main] 游戏启动成功');

        return true;

    } catch (error) {
        console.error('[Main] 游戏启动失败:', error);
        showErrorMessage('游戏启动失败: ' + error.message);
        return false;
    }
}

/**
 * 创建画布
 */
function createCanvas() {
    var canvas = null;

    try {
        // 检查是否为抖音小程序环境
        if (typeof tt !== 'undefined' && tt.createCanvas) {
            canvas = tt.createCanvas();
            console.log('[Main] 使用抖音小程序画布');
        } else {
            // 浏览器环境
            canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            canvas.style.border = '1px solid #000';
            canvas.style.display = 'block';
            canvas.style.margin = '20px auto';

            // 添加到页面
            var container = document.getElementById('game-container') || document.body;
            container.appendChild(canvas);

            console.log('[Main] 使用浏览器画布');
        }

        return canvas;

    } catch (error) {
        console.error('[Main] 创建画布失败:', error);
        return null;
    }
}

/**
 * 设置游戏输入
 */
function setupGameInput(canvas) {
    if (!canvas) return;

    try {
        // 触摸事件
        canvas.addEventListener('touchstart', handleTouchStart, false);
        canvas.addEventListener('touchmove', handleTouchMove, false);
        canvas.addEventListener('touchend', handleTouchEnd, false);

        // 鼠标事件（浏览器环境）
        canvas.addEventListener('mousedown', handleMouseDown, false);
        canvas.addEventListener('mousemove', handleMouseMove, false);
        canvas.addEventListener('mouseup', handleMouseUp, false);

        console.log('[Input] 输入事件绑定成功');

    } catch (error) {
        console.error('[Input] 输入事件绑定失败:', error);
    }
}

/**
 * 触摸事件处理
 */
function handleTouchStart(e) {
    if (gameEngine && gameEngine.handleTouchStart) {
        gameEngine.handleTouchStart(e);
    }
}

function handleTouchMove(e) {
    if (gameEngine && gameEngine.handleTouchMove) {
        gameEngine.handleTouchMove(e);
    }
}

function handleTouchEnd(e) {
    if (gameEngine && gameEngine.handleTouchEnd) {
        gameEngine.handleTouchEnd(e);
    }
}

/**
 * 鼠标事件处理
 */
function handleMouseDown(e) {
    if (gameEngine && gameEngine.handleMouseDown) {
        gameEngine.handleMouseDown(e);
    }
}

function handleMouseMove(e) {
    if (gameEngine && gameEngine.handleMouseMove) {
        gameEngine.handleMouseMove(e);
    }
}

function handleMouseUp(e) {
    if (gameEngine && gameEngine.handleMouseUp) {
        gameEngine.handleMouseUp(e);
    }
}

/**
 * 显示错误信息
 */
function showErrorMessage(message) {
    console.error('[Error]', message);

    // 在页面上显示错误信息
    var errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        // 创建错误信息显示元素
        var div = document.createElement('div');
        div.id = 'error-message';
        div.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); ' +
            'background: #ff0000; color: white; padding: 20px; border-radius: 5px; ' +
            'z-index: 1000; font-size: 16px;';
        div.textContent = message;
        document.body.appendChild(div);
    }
}

/**
 * 游戏重启
 */
function restartGame() {
    try {
        console.log('[Main] 重启游戏...');

        if (gameEngine) {
            gameEngine.stop();
        }

        // 清理资源
        gameEngine = null;

        // 重新初始化
        setTimeout(function() {
            initGame();
        }, 100);

    } catch (error) {
        console.error('[Main] 游戏重启失败:', error);
    }
}

/**
 * 游戏暂停/恢复
 */
function togglePause() {
    if (!gameEngine) return;

    if (gameEngine.running) {
        gameEngine.stop();
        console.log('[Main] 游戏已暂停');
    } else {
        gameEngine.start();
        console.log('[Main] 游戏已恢复');
    }
}

/**
 * 页面加载完成后自动初始化
 */
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Main] 页面加载完成，准备初始化游戏...');

        // 延迟初始化，确保所有模块都已加载
        setTimeout(function() {
            initGame();
        }, 100);
    });
}

// 导出函数（如果支持模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGame: initGame,
        restartGame: restartGame,
        togglePause: togglePause
    };
}
