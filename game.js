console.log('使用抖音开发者工具开发过程中可以参考以下文档:');
console.log(
    'https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/introduction',
);

/**
 * 游戏主入口文件
 * 负责加载模块和构建运行环境
 */

// 全局游戏对象
var Game = {
    canvas: null,
    ctx: null,
    systemInfo: null,
    gameEngine: null,
    moduleLoader: null
};

// 初始化游戏环境
function initGameEnvironment() {
    try {
        // 检查抖音小程序环境
        if (typeof tt === 'undefined') {
            throw new Error('未检测到抖音小程序环境 (tt对象不存在)');
        }

        // 获取系统信息
        Game.systemInfo = tt.getSystemInfoSync();
        console.log('[Game] 系统信息获取成功:', Game.systemInfo);

        // 创建画布
        Game.canvas = tt.createCanvas();
        Game.ctx = Game.canvas.getContext('2d');
        
        // 设置画布尺寸
        Game.canvas.width = Game.systemInfo.windowWidth;
        Game.canvas.height = Game.systemInfo.windowHeight;

        // 验证画布功能
        if (!Game.canvas.width || !Game.canvas.height) {
            throw new Error('画布尺寸设置失败');
        }

        if (!Game.ctx || typeof Game.ctx.fillRect !== 'function') {
            throw new Error('2D上下文功能异常');
        }

        console.log('[Game] 画布初始化成功:', Game.canvas.width, 'x', Game.canvas.height);

        // 为抖音小程序Canvas添加兼容性方法
        addCanvasCompatibility(Game.canvas);

        return true;

    } catch (error) {
        console.error('[Game] 游戏环境初始化失败:', error);
        return false;
    }
}

// 添加Canvas兼容性方法
function addCanvasCompatibility(canvas) {
    if (!canvas.getBoundingClientRect) {
        canvas.getBoundingClientRect = function () {
            return {
                left: 0,
                top: 0,
                right: this.width,
                bottom: this.height,
                width: this.width,
                height: this.height,
                x: 0,
                y: 0
            };
        };
    }

    if (!canvas.offsetLeft) {
        canvas.offsetLeft = 0;
    }
    if (!canvas.offsetTop) {
        canvas.offsetTop = 0;
    }
}

// 加载游戏模块
function loadGameModules() {
    return new Promise(function(resolve, reject) {
        console.log('[Game] 开始加载游戏模块...');
        
        // 按顺序加载模块
        var modules = [
            'src/config/game-config.js',
            'src/utils/bounds.js',
            'src/utils/quad-tree.js',
            'src/entities/base-character.js',
            'src/entities/zombie-system.js',
            'src/managers/character-manager.js',
            'src/managers/zombie-manager.js',
            'src/managers/viewport-culling.js',
            'src/systems/map-system.js',
            'src/systems/input-system.js',
            'src/systems/game-engine.js'
        ];

        var loadedCount = 0;
        var totalModules = modules.length;

        function loadModule(index) {
            if (index >= totalModules) {
                console.log('[Game] 所有模块加载完成');
                resolve();
                return;
            }

            var script = document.createElement('script');
            script.src = modules[index];
            script.type = 'text/javascript';

            script.onload = function() {
                loadedCount++;
                console.log('[Game] 模块加载成功:', modules[index], '(', loadedCount, '/', totalModules, ')');
                loadModule(index + 1);
            };

            script.onerror = function() {
                console.error('[Game] 模块加载失败:', modules[index]);
                reject(new Error('模块加载失败: ' + modules[index]));
            };

            document.head.appendChild(script);
        }

        loadModule(0);
    });
}

// 启动游戏
function startGame() {
    try {
        console.log('[Game] 开始启动游戏...');
        
        // 检查必要的全局对象是否存在
        if (typeof GameEngine === 'undefined') {
            throw new Error('GameEngine未定义，模块加载可能失败');
        }

        if (typeof GAME_CONFIG === 'undefined') {
            throw new Error('GAME_CONFIG未定义，配置模块加载可能失败');
        }

        // 创建游戏引擎
        Game.gameEngine = new GameEngine(Game.canvas, Game.ctx);
        
        // 设置输入系统
        if (Game.gameEngine.setupInput) {
            Game.gameEngine.setupInput();
        }

        // 启动游戏
        Game.gameEngine.start();

        console.log('[Game] 游戏启动成功');

        // 延迟检查游戏状态
        setTimeout(function() {
            if (Game.gameEngine.buildings && Game.gameEngine.buildings.length > 0) {
                console.log('[Game] 建筑物状态检查 - 总数:', Game.gameEngine.buildings.length);
                console.log('[Game] 视距裁剪系统状态:', !!Game.gameEngine.viewportCulling);
                if (Game.gameEngine.viewportCulling) {
                    console.log('[Game] 可见建筑物数量:', Game.gameEngine.viewportCulling.visibleEntities.buildings.length);
                }
            }

            // 启动性能监控
            if (Game.gameEngine.startMemoryLeakDetection) {
                Game.gameEngine.startMemoryLeakDetection();
            }
            if (Game.gameEngine.startPerformanceMonitoring) {
                Game.gameEngine.startPerformanceMonitoring();
            }
        }, 1000);

    } catch (error) {
        console.error('[Game] 游戏启动失败:', error);
        throw error;
    }
}

// 显示加载画面
function showLoadingScreen() {
    var ctx = Game.ctx;
    var canvas = Game.canvas;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#E5EBF6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制加载文字
    ctx.fillStyle = '#000000';
    ctx.font = `${parseInt(canvas.width / 20)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('正在加载游戏模块...', canvas.width / 2, canvas.height / 2);
    
    // 绘制图标
    var image = tt.createImage();
    image.src = 'icon.png';
    image.onload = function() {
        ctx.drawImage(
            image,
            0,
            0,
            image.width,
            image.height,
            (canvas.width - 100) / 2,
            canvas.height / 2 + 50,
            100,
            100
        );
    };
}

// 主函数
function main() {
    try {
        console.log('[Game] 游戏主函数开始执行');
        
        // 初始化游戏环境
        if (!initGameEnvironment()) {
            throw new Error('游戏环境初始化失败');
        }

        // 显示加载画面
        showLoadingScreen();

        // 加载游戏模块
        loadGameModules().then(function() {
            console.log('[Game] 模块加载完成，开始启动游戏');
            startGame();
        }).catch(function(error) {
            console.error('[Game] 模块加载失败:', error);
            throw error;
        });

    } catch (error) {
        console.error('[Game] 游戏启动失败:', error);
        
        // 显示错误信息
        var ctx = Game.ctx;
        var canvas = Game.canvas;
        
        ctx.fillStyle = '#FF0000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏启动失败: ' + error.message, canvas.width / 2, canvas.height / 2 + 100);
    }
}

// 等待页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
