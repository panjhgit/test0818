/**
 * 边界框工具类
 * 用于碰撞检测和视距裁剪
 */

function Bounds(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Bounds.prototype.contains = function(x, y) {
    return x >= this.x && x <= this.x + this.width && 
           y >= this.y && y <= this.y + this.height;
};

Bounds.prototype.intersects = function(other) {
    return !(this.x + this.width < other.x || 
             other.x + other.width < this.x || 
             this.y + this.height < other.y || 
             other.y + other.height < this.y);
};

Bounds.prototype.getCenter = function() {
    return {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2
    };
};

Bounds.prototype.expand = function(amount) {
    return new Bounds(
        this.x - amount,
        this.y - amount,
        this.width + amount * 2,
        this.height + amount * 2
    );
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Bounds;
}