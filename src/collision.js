/**
 * 碰撞检测模块 (collision.js)
 * 
 * 功能描述：
 * - 边界框类：矩形碰撞检测的基础数据结构
 * - 四叉树优化：大量对象的高效碰撞检测算法
 * - 视距裁剪系统：基于网格的渲染优化系统
 * - 碰撞检测函数：圆形、矩形、点等各种形状的碰撞检测
 * - 空间分割：将游戏世界分割为网格以提高性能
 * - 距离计算：各种距离和范围检测的工具函数
 * 
 * 主要类和方法：
 * - Bounds: 边界框类
 * - QuadTreeNode: 四叉树节点类
 * - ViewportCullingManager: 视距裁剪管理器
 * - 碰撞检测函数：checkCircleCollision, checkRectCollision等
 */

/**
 * 边界框类
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 */
function Bounds(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

/**
 * 检查点是否在边界框内
 * @param {number} x - 点的X坐标
 * @param {number} y - 点的Y坐标
 * @returns {boolean} 是否包含该点
 */
Bounds.prototype.contains = function(x, y) {
    return x >= this.x && x <= this.x + this.width && 
           y >= this.y && y <= this.y + this.height;
};

/**
 * 检查是否与另一个边界框相交
 * @param {Bounds} other - 另一个边界框
 * @returns {boolean} 是否相交
 */
Bounds.prototype.intersects = function(other) {
    return !(this.x > other.x + other.width || 
             this.x + this.width < other.x || 
             this.y > other.y + other.height || 
             this.y + this.height < other.y);
};

/**
 * 四叉树节点类
 * @param {Bounds} bounds - 节点边界
 * @param {number} maxObjects - 最大对象数量
 * @param {number} maxLevels - 最大层级
 * @param {number} level - 当前层级
 */
function QuadTreeNode(bounds, maxObjects, maxLevels, level) {
    this.bounds = bounds;
    this.maxObjects = maxObjects || 10;
    this.maxLevels = maxLevels || 5;
    this.level = level || 0;
    this.objects = [];
    this.nodes = [];
    this.isLeaf = true;
}

/**
 * 插入对象到四叉树
 * @param {Object} object - 要插入的对象
 * @returns {boolean} 是否成功插入
 */
QuadTreeNode.prototype.insert = function(object) {
    if (!this.bounds.contains(object.x, object.y)) {
        return false;
    }
    
    if (this.isLeaf && this.objects.length < this.maxObjects) {
        this.objects.push(object);
        return true;
    }
    
    if (this.isLeaf && this.level < this.maxLevels) {
        this.subdivide();
    }
    
    if (!this.isLeaf) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].insert(object)) {
                return true;
            }
        }
    }
    
    this.objects.push(object);
    return true;
};

/**
 * 细分四叉树节点
 */
QuadTreeNode.prototype.subdivide = function() {
    var halfWidth = this.bounds.width / 2;
    var halfHeight = this.bounds.height / 2;
    var x = this.bounds.x;
    var y = this.bounds.y;
    
    this.nodes[0] = new QuadTreeNode(
        new Bounds(x, y, halfWidth, halfHeight),
        this.maxObjects, this.maxLevels, this.level + 1
    );
    this.nodes[1] = new QuadTreeNode(
        new Bounds(x + halfWidth, y, halfWidth, halfHeight),
        this.maxObjects, this.maxLevels, this.level + 1
    );
    this.nodes[2] = new QuadTreeNode(
        new Bounds(x, y + halfHeight, halfWidth, halfHeight),
        this.maxObjects, this.maxLevels, this.level + 1
    );
    this.nodes[3] = new QuadTreeNode(
        new Bounds(x + halfWidth, y + halfHeight, halfWidth, halfHeight),
        this.maxObjects, this.maxLevels, this.level + 1
    );
    
    this.isLeaf = false;
    
    // 重新分配现有对象
    for (var i = 0; i < this.objects.length; i++) {
        var object = this.objects[i];
        var inserted = false;
        
        for (var j = 0; j < this.nodes.length; j++) {
            if (this.nodes[j].insert(object)) {
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            // 对象跨越多个子节点，保留在当前节点
        }
    }
};

/**
 * 查询指定区域内的对象
 * @param {Bounds} range - 查询范围
 * @param {Array} found - 找到的对象数组
 * @returns {Array} 找到的对象
 */
QuadTreeNode.prototype.query = function(range, found) {
    found = found || [];
    
    if (!this.bounds.intersects(range)) {
        return found;
    }
    
    // 检查当前节点的对象
    for (var i = 0; i < this.objects.length; i++) {
        var object = this.objects[i];
        if (range.contains(object.x, object.y)) {
            found.push(object);
        }
    }
    
    // 递归查询子节点
    if (!this.isLeaf) {
        for (var j = 0; j < this.nodes.length; j++) {
            this.nodes[j].query(range, found);
        }
    }
    
    return found;
};

/**
 * 清空四叉树
 */
QuadTreeNode.prototype.clear = function() {
    this.objects = [];
    this.nodes = [];
    this.isLeaf = true;
};

/**
 * 视距裁剪管理器
 */
function ViewportCullingManager() {
    this.gridSize = VIEWPORT_CONFIG.GRID_SIZE;
    this.extraRender = VIEWPORT_CONFIG.EXTRA_RENDER;
    this.maxViewDistance = VIEWPORT_CONFIG.MAX_VIEW_DISTANCE;
    this.updateFrequencies = VIEWPORT_CONFIG.UPDATE_FREQUENCIES;
    
    // 网格系统
    this.grid = {};
    this.activeGrids = new Set();
    this.frameCounter = 0;
    
    // 性能统计
    this.stats = {
        totalObjects: 0,
        visibleObjects: 0,
        culledObjects: 0,
        gridUpdates: 0
    };
}

/**
 * 更新视距裁剪系统
 * @param {number} deltaTime - 帧间隔时间
 */
ViewportCullingManager.prototype.update = function(deltaTime) {
    this.frameCounter++;
    this.stats.gridUpdates = 0;
    
    // 重置统计
    this.stats.totalObjects = 0;
    this.stats.visibleObjects = 0;
    this.stats.culledObjects = 0;
};

/**
 * 获取网格键
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {string} 网格键
 */
ViewportCullingManager.prototype.getGridKey = function(x, y) {
    var gridX = Math.floor(x / this.gridSize);
    var gridY = Math.floor(y / this.gridSize);
    return gridX + ',' + gridY;
};

/**
 * 获取对象所在的网格
 * @param {Object} object - 游戏对象
 * @returns {string} 网格键
 */
ViewportCullingManager.prototype.getObjectGrid = function(object) {
    return this.getGridKey(object.x, object.y);
};

/**
 * 添加对象到网格
 * @param {Object} object - 游戏对象
 */
ViewportCullingManager.prototype.addToGrid = function(object) {
    var gridKey = this.getObjectGrid(object);
    
    if (!this.grid[gridKey]) {
        this.grid[gridKey] = [];
    }
    
    this.grid[gridKey].push(object);
    object._gridKey = gridKey;
};

/**
 * 从网格中移除对象
 * @param {Object} object - 游戏对象
 */
ViewportCullingManager.prototype.removeFromGrid = function(object) {
    if (!object._gridKey) return;
    
    var grid = this.grid[object._gridKey];
    if (grid) {
        var index = grid.indexOf(object);
        if (index !== -1) {
            grid.splice(index, 1);
        }
        
        if (grid.length === 0) {
            delete this.grid[object._gridKey];
        }
    }
    
    delete object._gridKey;
};

/**
 * 更新对象的网格位置
 * @param {Object} object - 游戏对象
 */
ViewportCullingManager.prototype.updateObjectGrid = function(object) {
    var newGridKey = this.getObjectGrid(object);
    
    if (object._gridKey !== newGridKey) {
        this.removeFromGrid(object);
        this.addToGrid(object);
    }
};

/**
 * 获取视野范围内的网格
 * @param {number} centerX - 中心X坐标
 * @param {number} centerY - 中心Y坐标
 * @param {number} viewDistance - 视野距离
 * @returns {Array} 网格键数组
 */
ViewportCullingManager.prototype.getVisibleGrids = function(centerX, centerY, viewDistance) {
    var visibleGrids = [];
    var gridRadius = Math.ceil(viewDistance / this.gridSize) + this.extraRender;
    
    var centerGridX = Math.floor(centerX / this.gridSize);
    var centerGridY = Math.floor(centerY / this.gridSize);
    
    for (var x = centerGridX - gridRadius; x <= centerGridX + gridRadius; x++) {
        for (var y = centerGridY - gridRadius; y <= centerGridY + gridRadius; y++) {
            var gridKey = x + ',' + y;
            visibleGrids.push(gridKey);
        }
    }
    
    return visibleGrids;
};

/**
 * 获取视野范围内的对象
 * @param {number} centerX - 中心X坐标
 * @param {number} centerY - 中心Y坐标
 * @param {number} viewDistance - 视野距离
 * @returns {Array} 可见对象数组
 */
ViewportCullingManager.prototype.getVisibleObjects = function(centerX, centerY, viewDistance) {
    var visibleObjects = [];
    var visibleGrids = this.getVisibleGrids(centerX, centerY, viewDistance);
    
    for (var i = 0; i < visibleGrids.length; i++) {
        var gridKey = visibleGrids[i];
        var grid = this.grid[gridKey];
        
        if (grid) {
            for (var j = 0; j < grid.length; j++) {
                var object = grid[j];
                var distance = this.getDistance(centerX, centerY, object.x, object.y);
                
                if (distance <= viewDistance) {
                    visibleObjects.push(object);
                    this.stats.visibleObjects++;
                } else {
                    this.stats.culledObjects++;
                }
                
                this.stats.totalObjects++;
            }
        }
    }
    
    return visibleObjects;
};

/**
 * 计算两点间距离
 * @param {number} x1 - 点1的X坐标
 * @param {number} y1 - 点1的Y坐标
 * @param {number} x2 - 点2的X坐标
 * @param {number} y2 - 点2的Y坐标
 * @returns {number} 距离
 */
ViewportCullingManager.prototype.getDistance = function(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 获取性能统计
 * @returns {Object} 性能统计对象
 */
ViewportCullingManager.prototype.getStats = function() {
    return {
        totalObjects: this.stats.totalObjects,
        visibleObjects: this.stats.visibleObjects,
        culledObjects: this.stats.culledObjects,
        cullingRatio: this.stats.totalObjects > 0 ? 
            (this.stats.culledObjects / this.stats.totalObjects * 100).toFixed(1) + '%' : '0%',
        activeGrids: Object.keys(this.grid).length
    };
};

// ========================================
// 碰撞检测工具函数
// ========================================

/**
 * 检查两个圆形是否碰撞
 * @param {Object} circle1 - 圆形1 {x, y, radius}
 * @param {Object} circle2 - 圆形2 {x, y, radius}
 * @returns {boolean} 是否碰撞
 */
function checkCircleCollision(circle1, circle2) {
    var dx = circle1.x - circle2.x;
    var dy = circle1.y - circle2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (circle1.radius + circle2.radius);
}

/**
 * 检查圆形与矩形是否碰撞
 * @param {Object} circle - 圆形 {x, y, radius}
 * @param {Object} rect - 矩形 {x, y, width, height}
 * @returns {boolean} 是否碰撞
 */
function checkCircleRectCollision(circle, rect) {
    var closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    var closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    var dx = circle.x - closestX;
    var dy = circle.y - closestY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < circle.radius;
}

/**
 * 检查两个矩形是否碰撞
 * @param {Object} rect1 - 矩形1 {x, y, width, height}
 * @param {Object} rect2 - 矩形2 {x, y, width, height}
 * @returns {boolean} 是否碰撞
 */
function checkRectCollision(rect1, rect2) {
    return !(rect1.x > rect2.x + rect2.width ||
             rect1.x + rect1.width < rect2.x ||
             rect1.y > rect2.y + rect2.height ||
             rect1.y + rect1.height < rect2.y);
}

/**
 * 检查点是否在圆形内
 * @param {Object} point - 点 {x, y}
 * @param {Object} circle - 圆形 {x, y, radius}
 * @returns {boolean} 是否在圆形内
 */
function checkPointInCircle(point, circle) {
    var dx = point.x - circle.x;
    var dy = point.y - circle.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= circle.radius;
}

/**
 * 检查点是否在矩形内
 * @param {Object} point - 点 {x, y}
 * @param {Object} rect - 矩形 {x, y, width, height}
 * @returns {boolean} 是否在矩形内
 */
function checkPointInRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
           point.y >= rect.y && point.y <= rect.y + rect.height;
}

/**
 * 计算两点间距离
 * @param {Object} point1 - 点1 {x, y}
 * @param {Object} point2 - 点2 {x, y}
 * @returns {number} 距离
 */
function getDistance(point1, point2) {
    var dx = point2.x - point1.x;
    var dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两点间的平方距离（避免开方运算，提高性能）
 * @param {Object} point1 - 点1 {x, y}
 * @param {Object} point2 - 点2 {x, y}
 * @returns {number} 平方距离
 */
function getDistanceSquared(point1, point2) {
    var dx = point2.x - point1.x;
    var dy = point2.y - point1.y;
    return dx * dx + dy * dy;
}

/**
 * 检查对象是否在指定范围内
 * @param {Object} object - 对象 {x, y}
 * @param {Object} center - 中心点 {x, y}
 * @param {number} range - 范围半径
 * @returns {boolean} 是否在范围内
 */
function isInRange(object, center, range) {
    return getDistanceSquared(object, center) <= range * range;
}

/**
 * 获取指定范围内的对象
 * @param {Array} objects - 对象数组
 * @param {Object} center - 中心点 {x, y}
 * @param {number} range - 范围半径
 * @returns {Array} 范围内的对象数组
 */
function getObjectsInRange(objects, center, range) {
    var objectsInRange = [];
    var rangeSquared = range * range;
    
    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        if (getDistanceSquared(object, center) <= rangeSquared) {
            objectsInRange.push(object);
        }
    }
    
    return objectsInRange;
}

/**
 * 寻找最近的对象
 * @param {Array} objects - 对象数组
 * @param {Object} center - 中心点 {x, y}
 * @returns {Object|null} 最近的对象
 */
function findNearestObject(objects, center) {
    var nearest = null;
    var nearestDistance = Infinity;
    
    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        var distance = getDistanceSquared(object, center);
        
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = object;
        }
    }
    
    return nearest;
}

// 导出类和函数（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Bounds,
        QuadTreeNode,
        ViewportCullingManager,
        checkCircleCollision,
        checkCircleRectCollision,
        checkRectCollision,
        checkPointInCircle,
        checkPointInRect,
        getDistance,
        getDistanceSquared,
        isInRange,
        getObjectsInRange,
        findNearestObject
    };
}
