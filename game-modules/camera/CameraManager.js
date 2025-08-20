/**
 * 摄像机管理器 - 处理摄像机跟随和视野管理
 * 兼容抖音小程序环境 (ES5)
 */
function CameraManager(gameEngine) {
    this.gameEngine = gameEngine;
    this.camera = {
        x: 0,
        y: 0,
        followTarget: null,
        smoothing: 0.1,
        zoom: 0.8
    };
}

/**
 * 设置跟随目标
 */
CameraManager.prototype.setFollowTarget = function(target) {
    this.camera.followTarget = target;
    console.log('[Camera] 设置跟随目标');
};

/**
 * 更新摄像机位置
 */
CameraManager.prototype.updateCamera = function(deltaTime) {
    if (!this.camera.followTarget) return;
    
    var canvas = this.gameEngine.canvas;
    var mapConfig = this.gameEngine.mapConfig;
    
    // 考虑缩放因子的视野大小
    var viewWidth = canvas.width / this.camera.zoom;
    var viewHeight = canvas.height / this.camera.zoom;
    
    // 计算目标摄像机位置（让玩家居中）
    var targetX = this.camera.followTarget.x - viewWidth / 2;
    var targetY = this.camera.followTarget.y - viewHeight / 2;
    
    // 边界限制
    targetX = Math.max(0, Math.min(mapConfig.width - viewWidth, targetX));
    targetY = Math.max(0, Math.min(mapConfig.height - viewHeight, targetY));
    
    // 平滑跟随 - 确保摄像机始终跟随玩家
    var smoothing = this.camera.smoothing || 0.1;
    this.camera.x += (targetX - this.camera.x) * smoothing;
    this.camera.y += (targetY - this.camera.y) * smoothing;
    
    // 确保摄像机不会卡住
    if (Math.abs(targetX - this.camera.x) < 1) this.camera.x = targetX;
    if (Math.abs(targetY - this.camera.y) < 1) this.camera.y = targetY;
    
    // 调试：摄像机状态
    if (this.gameEngine.debugMode) {
        console.log('[Camera] 摄像机位置:', this.camera.x, this.camera.y, '目标:', targetX, targetY);
    }
};

/**
 * 获取摄像机状态
 */
CameraManager.prototype.getCamera = function() {
    return this.camera;
};

/**
 * 应用摄像机变换
 */
CameraManager.prototype.applyCameraTransform = function(ctx) {
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);
};

/**
 * 检查对象是否在视野内
 */
CameraManager.prototype.isInView = function(x, y, width, height) {
    width = width || 0;
    height = height || 0;
    
    var canvas = this.gameEngine.canvas;
    var viewWidth = canvas.width / this.camera.zoom;
    var viewHeight = canvas.height / this.camera.zoom;
    var viewLeft = this.camera.x;
    var viewRight = this.camera.x + viewWidth;
    var viewTop = this.camera.y;
    var viewBottom = this.camera.y + viewHeight;
    
    return (x + width >= viewLeft && x <= viewRight && 
            y + height >= viewTop && y <= viewBottom);
};
