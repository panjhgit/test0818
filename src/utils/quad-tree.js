/**
 * 四叉树工具类
 * 用于视距裁剪和空间分区优化
 */

function QuadTreeNode(bounds, maxObjects, maxLevels, level) {
    this.bounds = bounds;
    this.maxObjects = maxObjects || 10;
    this.maxLevels = maxLevels || 4;
    this.level = level || 0;
    
    this.objects = [];
    this.nodes = [];
    this.isLeaf = true;
}

QuadTreeNode.prototype.split = function() {
    var subWidth = this.bounds.width / 2;
    var subHeight = this.bounds.height / 2;
    var x = this.bounds.x;
    var y = this.bounds.y;
    
    this.nodes[0] = new QuadTreeNode(
        new Bounds(x + subWidth, y, subWidth, subHeight),
        this.maxObjects,
        this.maxLevels,
        this.level + 1
    );
    
    this.nodes[1] = new QuadTreeNode(
        new Bounds(x, y, subWidth, subHeight),
        this.maxObjects,
        this.maxLevels,
        this.level + 1
    );
    
    this.nodes[2] = new QuadTreeNode(
        new Bounds(x, y + subHeight, subWidth, subHeight),
        this.maxObjects,
        this.maxLevels,
        this.level + 1
    );
    
    this.nodes[3] = new QuadTreeNode(
        new Bounds(x + subWidth, y + subHeight, subWidth, subHeight),
        this.maxObjects,
        this.maxLevels,
        this.level + 1
    );
    
    this.isLeaf = false;
};

QuadTreeNode.prototype.getIndex = function(rect) {
    var index = -1;
    var verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    var horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);
    
    var topQuadrant = (rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint);
    var bottomQuadrant = (rect.y > horizontalMidpoint);
    
    if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
        if (topQuadrant) {
            index = 1;
        } else if (bottomQuadrant) {
            index = 2;
        }
    } else if (rect.x > verticalMidpoint) {
        if (topQuadrant) {
            index = 0;
        } else if (bottomQuadrant) {
            index = 3;
        }
    }
    
    return index;
};

QuadTreeNode.prototype.insert = function(object) {
    if (!this.bounds.contains(object.x, object.y)) {
        return false;
    }

    if (this.isLeaf && this.objects.length < this.maxObjects) {
        this.objects.push(object);
        return true;
    }

    if (this.isLeaf && this.level < this.maxLevels) {
        this.split();
    }

    for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].insert(object)) {
            return true;
        }
    }

    return false;
};

QuadTreeNode.prototype.query = function(range) {
    var result = [];

    if (!this.bounds.intersects(range)) {
        return result;
    }

    for (var i = 0; i < this.objects.length; i++) {
        if (range.contains(this.objects[i].x, this.objects[i].y)) {
            result.push(this.objects[i]);
        }
    }

    if (!this.isLeaf) {
        for (var i = 0; i < this.nodes.length; i++) {
            result = result.concat(this.nodes[i].query(range));
        }
    }

    return result;
};

// 从四叉树中移除对象
QuadTreeNode.prototype.remove = function(object) {
    if (this.isLeaf) {
        // 在叶子节点中查找并移除对象
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i] === object) {
                this.objects.splice(i, 1);
                return true;
            }
        }
        return false;
    } else {
        // 在子节点中查找并移除对象
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].remove(object)) {
                return true;
            }
        }
        return false;
    }
};

QuadTreeNode.prototype.clear = function() {
    this.objects = [];
    
    for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i]) {
            this.nodes[i].clear();
        }
    }
    
    this.nodes = [];
    this.isLeaf = true;
};

