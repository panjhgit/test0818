// ========================================
// 工具模块 (Utils Module)
// ========================================

// 通用安全数组操作工具类
var SafeArrayOperations = {
    // 安全的批量删除，使用对象引用而不是索引，就地操作避免内存分配
    safeBatchRemove: function (array, indicesToRemove, onRemove) {
        if (!array || !Array.isArray(array) || !indicesToRemove || indicesToRemove.length === 0) {
            return 0;
        }

        var objectsToRemove = [];
        var removedCount = 0;

        // 收集需要移除的对象引用
        for (var i = 0; i < indicesToRemove.length; i++) {
            var index = indicesToRemove[i];
            if (index >= 0 && index < array.length) {
                var obj = array[index];
                if (obj) {
                    objectsToRemove.push(obj);
                }
            }
        }

        // 使用就地操作安全移除，避免内存分配和索引问题
        for (var j = array.length - 1; j >= 0; j--) {
            var obj = array[j];
            var shouldRemove = objectsToRemove.indexOf(obj) !== -1;

            if (shouldRemove) {
                if (typeof onRemove === 'function') {
                    onRemove(obj);
                }
                array.splice(j, 1);
                removedCount++;
            }
        }

        return removedCount;
    },

    // 安全的单个元素移除，使用对象引用
    safeRemove: function (array, objectToRemove) {
        if (!array || !Array.isArray(array) || !objectToRemove) {
            return false;
        }

        var index = array.indexOf(objectToRemove);
        if (index === -1) {
            return false;
        }

        array.splice(index, 1);
        return true;
    },

    // 验证索引是否有效
    isValidIndex: function (array, index) {
        return array && Array.isArray(array) && index >= 0 && index < array.length;
    },

    // 安全删除死亡实体
    safeRemoveDeadEntities: function (array, isDeadCheck, cleanupCallback) {
        if (!Array.isArray(array)) {
            console.warn('[SafeArrayOperations] 数组参数类型错误');
            return 0;
        }

        var deadIndices = [];

        // 先收集所有死亡实体的索引
        for (var i = 0; i < array.length; i++) {
            if (array[i] && isDeadCheck(array[i])) {
                deadIndices.push(i);
            }
        }

        // 从后往前删除
        var removedCount = 0;
        for (var j = deadIndices.length - 1; j >= 0; j--) {
            var indexToRemove = deadIndices[j];
            if (indexToRemove >= 0 && indexToRemove < array.length) {
                if (cleanupCallback) {
                    cleanupCallback(array[indexToRemove]);
                }
                array.splice(indexToRemove, 1);
                removedCount++;
            }
        }

        return removedCount;
    }
};

// 其他通用工具函数
var Utils = {
    // 计算两点之间的距离
    distance: function(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // 计算两点之间的距离平方（避免开方运算）
    distanceSquared: function(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return dx * dx + dy * dy;
    },

    // 限制数值在指定范围内
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // 线性插值
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },

    // 角度转弧度
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },

    // 弧度转角度
    radToDeg: function(radians) {
        return radians * 180 / Math.PI;
    },

    // 生成随机整数
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 生成随机浮点数
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },

    // 检查点是否在矩形内
    pointInRect: function(x, y, rectX, rectY, rectWidth, rectHeight) {
        return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
    },

    // 检查两个矩形是否相交
    rectIntersects: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }
};

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SafeArrayOperations: SafeArrayOperations,
        Utils: Utils
    };
}
