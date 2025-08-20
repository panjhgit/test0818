/**
 * 建筑基类 - 定义所有建筑的通用接口和行为
 */
function BaseBuilding(config) {
    this.id = config.id;
    this.type = config.type;
    this.name = config.name;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    this.color = config.color;
    this.explored = false;
    this.oneTimeOnly = config.oneTimeOnly || false;
    
    // 建筑特有属性
    this.category = config.category || 'unknown';
    this.resources = config.resources || [];
    this.enemies = config.enemies || [];
    this.submapType = config.submapType;
    this.description = config.description || '';
    
    console.log('[BaseBuilding] 建筑创建:', this.name, 'at', this.x, this.y);
}

/**
 * 获取门的信息
 */
BaseBuilding.prototype.getDoorInfo = function() {
    var doorWidth = Math.max(30, Math.floor(this.width / 8));
    var doorHeight = Math.max(40, Math.floor(this.height / 6));
    var doorX = this.x + (this.width - doorWidth) / 2;
    var doorY = this.y + this.height - doorHeight - 5;
    
    return {
        x: doorX,
        y: doorY,
        width: doorWidth,
        height: doorHeight,
        centerX: doorX + doorWidth / 2,
        centerY: doorY + doorHeight / 2
    };
};

/**
 * 检查点是否在建筑内
 */
BaseBuilding.prototype.containsPoint = function(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
};

/**
 * 检查是否与矩形区域相交
 */
BaseBuilding.prototype.intersectsRect = function(x, y, width, height) {
    return !(this.x + this.width < x || 
             this.x > x + width || 
             this.y + this.height < y || 
             this.y > y + height);
};

/**
 * 渲染建筑 - 可被子类重写
 */
BaseBuilding.prototype.render = function(ctx, camera) {
    // 基础建筑渲染
    this.renderBase(ctx);
    this.renderDetails(ctx);
    this.renderDoor(ctx);
    this.renderLabel(ctx);
    
    if (!this.explored) {
        this.renderUnexploredEffect(ctx);
    }
};

/**
 * 渲染建筑主体
 */
BaseBuilding.prototype.renderBase = function(ctx) {
    // 建筑主体
    ctx.fillStyle = this.explored ? this.color : this.lightenColor(this.color, 0.3);
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 建筑边框
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
};

/**
 * 渲染建筑细节 - 子类可重写
 */
BaseBuilding.prototype.renderDetails = function(ctx) {
    // 窗户效果
    ctx.fillStyle = this.explored ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)';
    var windowSize = Math.max(12, Math.floor(this.width / 15));
    var windowSpacing = windowSize + 12;
    
    var doorInfo = this.getDoorInfo();
    
    for (var wx = this.x + windowSpacing; wx < this.x + this.width - windowSize; wx += windowSpacing) {
        for (var wy = this.y + windowSpacing; wy < this.y + this.height - doorInfo.height - 20; wy += windowSpacing) {
            // 避开门的位置
            if (!(wx >= doorInfo.x - windowSpacing && wx <= doorInfo.x + doorInfo.width + windowSpacing && 
                  wy >= doorInfo.y - windowSpacing)) {
                ctx.fillRect(wx, wy, windowSize, windowSize);
                
                // 窗户边框
                ctx.strokeStyle = this.explored ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(wx, wy, windowSize, windowSize);
            }
        }
    }
};

/**
 * 渲染门
 */
BaseBuilding.prototype.renderDoor = function(ctx) {
    var doorInfo = this.getDoorInfo();
    
    // 门框背景
    ctx.fillStyle = this.explored ? 'rgba(101, 67, 33, 0.9)' : 'rgba(101, 67, 33, 0.5)';
    ctx.fillRect(doorInfo.x - 3, doorInfo.y - 3, doorInfo.width + 6, doorInfo.height + 6);
    
    // 门本体
    ctx.fillStyle = this.explored ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.6)';
    ctx.fillRect(doorInfo.x, doorInfo.y, doorInfo.width, doorInfo.height);
    
    // 门的细节
    ctx.strokeStyle = this.explored ? 'rgba(160, 82, 45, 1)' : 'rgba(160, 82, 45, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(doorInfo.x, doorInfo.y, doorInfo.width, doorInfo.height);
    
    // 门把手
    var handleSize = Math.max(3, Math.floor(doorInfo.width / 10));
    var handleX = doorInfo.x + doorInfo.width - handleSize * 2;
    var handleY = doorInfo.y + doorInfo.height / 2;
    
    ctx.fillStyle = this.explored ? 'rgba(255, 215, 0, 0.9)' : 'rgba(255, 215, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(handleX, handleY, handleSize, 0, Math.PI * 2);
    ctx.fill();
};

/**
 * 渲染建筑标签
 */
BaseBuilding.prototype.renderLabel = function(ctx) {
    var fontSize = Math.max(20, Math.floor(this.width / 12));
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold ' + fontSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, Math.floor(fontSize / 6));
    
    var textX = this.x + this.width / 2;
    var textY = this.y + this.height / 3;
    
    ctx.strokeText(this.name, textX, textY);
    ctx.fillText(this.name, textX, textY);
};

/**
 * 渲染未探索效果
 */
BaseBuilding.prototype.renderUnexploredEffect = function(ctx) {
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
    ctx.setLineDash([]);
};

/**
 * 颜色变亮工具函数
 */
BaseBuilding.prototype.lightenColor = function(color, amount) {
    var hex = color.replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    
    r = Math.min(255, Math.floor(r + (255 - r) * amount));
    g = Math.min(255, Math.floor(g + (255 - g) * amount));
    b = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    var rHex = r.toString(16); if (rHex.length === 1) rHex = '0' + rHex;
    var gHex = g.toString(16); if (gHex.length === 1) gHex = '0' + gHex;
    var bHex = b.toString(16); if (bHex.length === 1) bHex = '0' + bHex;
    
    return '#' + rHex + gHex + bHex;
};

/**
 * 标记为已探索
 */
BaseBuilding.prototype.markExplored = function() {
    this.explored = true;
    console.log('[BaseBuilding] 建筑已探索:', this.name);
};

/**
 * 获取建筑状态
 */
BaseBuilding.prototype.getStatus = function() {
    return {
        id: this.id,
        type: this.type,
        name: this.name,
        position: { x: this.x, y: this.y },
        size: { width: this.width, height: this.height },
        explored: this.explored,
        category: this.category,
        submapType: this.submapType
    };
};
