/**
 * 数学工具函数库 - 提供常用的数学计算功能
 */
var MathUtils = {
    
    /**
     * 计算两点间距离
     */
    distance: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    /**
     * 计算两点间距离的平方（性能优化版本）
     */
    distanceSquared: function(x1, y1, x2, y2) {
        return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
    },
    
    /**
     * 计算两点间角度
     */
    angle: function(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    /**
     * 角度转换为方向向量
     */
    angleToDirection: function(angle) {
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    },
    
    /**
     * 限制数值在指定范围内
     */
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * 线性插值
     */
    lerp: function(start, end, factor) {
        return start + (end - start) * factor;
    },
    
    /**
     * 向量标准化
     */
    normalize: function(x, y) {
        var length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    },
    
    /**
     * 向量长度
     */
    vectorLength: function(x, y) {
        return Math.sqrt(x * x + y * y);
    },
    
    /**
     * 点到线段的距离
     */
    pointToLineDistance: function(px, py, x1, y1, x2, y2) {
        var A = px - x1;
        var B = py - y1;
        var C = x2 - x1;
        var D = y2 - y1;
        
        var dot = A * C + B * D;
        var lenSq = C * C + D * D;
        var param = lenSq !== 0 ? dot / lenSq : -1;
        
        var xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        var dx = px - xx;
        var dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * 生成随机整数
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * 生成随机浮点数
     */
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * 检查数值是否在范围内
     */
    inRange: function(value, min, max) {
        return value >= min && value <= max;
    },
    
    /**
     * 将角度转换为0-2π范围
     */
    normalizeAngle: function(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },
    
    /**
     * 计算角度差
     */
    angleDifference: function(angle1, angle2) {
        var diff = angle2 - angle1;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return diff;
    }
};
