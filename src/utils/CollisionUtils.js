/**
 * 碰撞检测工具库 - 提供各种碰撞检测功能
 */
var CollisionUtils = {
    
    /**
     * 圆形与圆形碰撞检测
     */
    circleToCircle: function(x1, y1, r1, x2, y2, r2) {
        var distanceSquared = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
        var radiusSum = r1 + r2;
        return distanceSquared <= radiusSum * radiusSum;
    },
    
    /**
     * 圆形与矩形碰撞检测
     */
    circleToRect: function(circleX, circleY, radius, rectX, rectY, rectWidth, rectHeight) {
        var closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
        var closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
        
        var distanceX = circleX - closestX;
        var distanceY = circleY - closestY;
        var distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        return distanceSquared <= radius * radius;
    },
    
    /**
     * 矩形与矩形碰撞检测
     */
    rectToRect: function(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 < x2 || x1 > x2 + w2 || y1 + h1 < y2 || y1 > y2 + h2);
    },
    
    /**
     * 点是否在矩形内
     */
    pointInRect: function(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
        return pointX >= rectX && pointX <= rectX + rectWidth &&
               pointY >= rectY && pointY <= rectY + rectHeight;
    },
    
    /**
     * 点是否在圆形内
     */
    pointInCircle: function(pointX, pointY, circleX, circleY, radius) {
        var distanceSquared = Math.pow(pointX - circleX, 2) + Math.pow(pointY - circleY, 2);
        return distanceSquared <= radius * radius;
    },
    
    /**
     * 线段与圆形碰撞检测
     */
    lineToCircle: function(lineX1, lineY1, lineX2, lineY2, circleX, circleY, radius) {
        var distance = MathUtils.pointToLineDistance(circleX, circleY, lineX1, lineY1, lineX2, lineY2);
        return distance <= radius;
    },
    
    /**
     * 检查移动路径是否与矩形碰撞
     */
    pathToRect: function(startX, startY, endX, endY, radius, rectX, rectY, rectWidth, rectHeight) {
        // 扩展矩形边界
        var expandedRect = {
            x: rectX - radius,
            y: rectY - radius,
            width: rectWidth + radius * 2,
            height: rectHeight + radius * 2
        };
        
        // 检查线段是否与扩展矩形相交
        return this.lineToRect(startX, startY, endX, endY, 
                              expandedRect.x, expandedRect.y, 
                              expandedRect.width, expandedRect.height);
    },
    
    /**
     * 线段与矩形碰撞检测
     */
    lineToRect: function(lineX1, lineY1, lineX2, lineY2, rectX, rectY, rectWidth, rectHeight) {
        // 检查线段端点是否在矩形内
        if (this.pointInRect(lineX1, lineY1, rectX, rectY, rectWidth, rectHeight) ||
            this.pointInRect(lineX2, lineY2, rectX, rectY, rectWidth, rectHeight)) {
            return true;
        }
        
        // 检查线段是否与矩形边相交
        return this.lineToLine(lineX1, lineY1, lineX2, lineY2, rectX, rectY, rectX + rectWidth, rectY) || // 上边
               this.lineToLine(lineX1, lineY1, lineX2, lineY2, rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectHeight) || // 右边
               this.lineToLine(lineX1, lineY1, lineX2, lineY2, rectX + rectWidth, rectY + rectHeight, rectX, rectY + rectHeight) || // 下边
               this.lineToLine(lineX1, lineY1, lineX2, lineY2, rectX, rectY + rectHeight, rectX, rectY); // 左边
    },
    
    /**
     * 线段与线段碰撞检测
     */
    lineToLine: function(x1, y1, x2, y2, x3, y3, x4, y4) {
        var denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return false; // 平行线
        
        var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    },
    
    /**
     * 获取圆形与矩形碰撞的最近点
     */
    getClosestPointOnRect: function(circleX, circleY, rectX, rectY, rectWidth, rectHeight) {
        var closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
        var closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
        
        return { x: closestX, y: closestY };
    },
    
    /**
     * 检查多个圆形是否与矩形碰撞
     */
    multipleCirclesToRect: function(circles, rectX, rectY, rectWidth, rectHeight) {
        for (var i = 0; i < circles.length; i++) {
            var circle = circles[i];
            if (this.circleToRect(circle.x, circle.y, circle.radius, rectX, rectY, rectWidth, rectHeight)) {
                return true;
            }
        }
        return false;
    },
    
    /**
     * 获取两个矩形的重叠区域
     */
    getRectOverlap: function(x1, y1, w1, h1, x2, y2, w2, h2) {
        var left = Math.max(x1, x2);
        var right = Math.min(x1 + w1, x2 + w2);
        var top = Math.max(y1, y2);
        var bottom = Math.min(y1 + h1, y2 + h2);
        
        if (left < right && top < bottom) {
            return {
                x: left,
                y: top,
                width: right - left,
                height: bottom - top
            };
        }
        
        return null; // 无重叠
    }
};
