/**
 * 游戏工具函数
 * 兼容抖音小程序环境 (ES5)
 */

/**
 * 颜色处理工具
 */
function lightenColor(color, amount) {
    var usePound = false;
    
    if (color[0] === '#') {
        color = color.slice(1);
        usePound = true;
    }
    
    var num = parseInt(color, 16);
    var r = (num >> 16) + amount;
    var g = (num >> 8 & 0x00FF) + amount;
    var b = (num & 0x0000FF) + amount;
    
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    
    var rHex = r.toString(16);
    var gHex = g.toString(16);
    var bHex = b.toString(16);
    
    // ES5兼容的padStart
    if (rHex.length === 1) rHex = '0' + rHex;
    if (gHex.length === 1) gHex = '0' + gHex;
    if (bHex.length === 1) bHex = '0' + bHex;
    
    return (usePound ? '#' : '') + rHex + gHex + bHex;
}

/**
 * 数学工具函数
 */
var MathUtils = {
    /**
     * 计算两点距离
     */
    distance: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    /**
     * 计算两点距离的平方（避免开方运算）
     */
    distanceSquared: function(x1, y1, x2, y2) {
        return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
    },
    
    /**
     * 将角度转换为方向
     */
    getDirectionFromDelta: function(deltaX, deltaY) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    },
    
    /**
     * 种子随机数生成器
     */
    seededRandom: function(seed) {
        var m = 2147483647;
        var a = 16807;
        var s = seed % m;
        return function() {
            s = (a * s) % m;
            return (s - 1) / (m - 1);
        };
    },
    
    /**
     * 限制数值在指定范围内
     */
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};

/**
 * 动画工具函数
 */
var AnimationUtils = {
    /**
     * 更新行走动画
     */
    updateWalkAnimation: function(player, deltaTime) {
        if (player.isWalking) {
            var now = Date.now();
            if (now - player.lastAnimationTime > player.walkAnimationSpeed) {
                player.walkAnimationFrame = (player.walkAnimationFrame + 1) % 4;
                player.lastAnimationTime = now;
            }
        } else {
            player.walkAnimationFrame = 0;
        }
    }
};

/**
 * 调试工具函数
 */
var DebugUtils = {
    /**
     * 格式化位置信息
     */
    formatPosition: function(obj) {
        return 'x:' + obj.x.toFixed(1) + ', y:' + obj.y.toFixed(1);
    },
    
    /**
     * 格式化距离信息
     */
    formatDistance: function(distance) {
        return distance.toFixed(1) + 'px';
    }
};
