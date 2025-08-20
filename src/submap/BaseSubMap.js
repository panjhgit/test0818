/**
 * 子地图基类 - 定义所有子地图的通用接口
 */
function BaseSubMap(config) {
    this.type = config.type;
    this.building = config.building;
    this.canvas = config.canvas;
    this.ctx = config.ctx;
    
    // 子地图边界
    this.bounds = config.bounds || { minX: 60, maxX: 340, minY: 110, maxY: 290 };
    
    // 子地图内容
    this.enemies = [];
    this.resources = [];
    this.interactables = [];
    
    // 出口配置
    this.exitDoor = {
        x: 195, y: 280, width: 10, height: 20,
        centerX: 200, centerY: 290
    };
    
    console.log('[BaseSubMap] 子地图创建:', this.type);
}

/**
 * 初始化子地图
 */
BaseSubMap.prototype.init = function() {
    this.generateContent();
    console.log('[BaseSubMap] 子地图初始化完成:', this.type);
};

/**
 * 生成子地图内容 - 子类需要重写
 */
BaseSubMap.prototype.generateContent = function() {
    // 基础内容生成
    this.generateEnemies();
    this.generateResources();
    this.generateInteractables();
};

/**
 * 生成敌人 - 子类可重写
 */
BaseSubMap.prototype.generateEnemies = function() {
    if (!this.building.enemies || this.building.enemies.length === 0) return;
    
    var enemyCount = 2 + Math.floor(Math.random() * 4); // 2-5个敌人
    
    for (var i = 0; i < enemyCount; i++) {
        var enemyType = this.building.enemies[Math.floor(Math.random() * this.building.enemies.length)];
        var enemy = this.createEnemy(enemyType);
        if (enemy) {
            this.enemies.push(enemy);
        }
    }
    
    console.log('[BaseSubMap] 生成敌人:', this.enemies.length, '个');
};

/**
 * 生成资源 - 子类可重写
 */
BaseSubMap.prototype.generateResources = function() {
    if (!this.building.resources || this.building.resources.length === 0) return;
    
    if (Math.random() < 0.7) { // 70%概率生成资源
        var resourceType = this.building.resources[Math.floor(Math.random() * this.building.resources.length)];
        var resource = this.createResource(resourceType);
        if (resource) {
            this.resources.push(resource);
        }
    }
    
    console.log('[BaseSubMap] 生成资源:', this.resources.length, '个');
};

/**
 * 生成交互物品 - 子类可重写
 */
BaseSubMap.prototype.generateInteractables = function() {
    // 基类默认不生成交互物品
};

/**
 * 创建敌人
 */
BaseSubMap.prototype.createEnemy = function(enemyType) {
    return {
        id: Math.random().toString(36).substr(2, 9),
        type: enemyType,
        x: this.bounds.minX + Math.random() * (this.bounds.maxX - this.bounds.minX),
        y: this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY),
        health: 15,
        maxHealth: 15,
        attack: 5,
        alive: true
    };
};

/**
 * 创建资源
 */
BaseSubMap.prototype.createResource = function(resourceType) {
    return {
        id: Math.random().toString(36).substr(2, 9),
        type: resourceType,
        x: this.bounds.minX + 50 + Math.random() * (this.bounds.maxX - this.bounds.minX - 100),
        y: this.bounds.minY + 50 + Math.random() * (this.bounds.maxY - this.bounds.minY - 100),
        collected: false,
        amount: this.getResourceAmount(resourceType)
    };
};

/**
 * 获取资源数量
 */
BaseSubMap.prototype.getResourceAmount = function(resourceType) {
    switch (resourceType) {
        case 'food': return 2 + Math.floor(Math.random() * 4);
        case 'weapon_knife':
        case 'weapon_bat': return 1;
        default: return 1;
    }
};

/**
 * 渲染子地图
 */
BaseSubMap.prototype.render = function() {
    this.renderBackground();
    this.renderStructure();
    this.renderEnemies();
    this.renderResources();
    this.renderInteractables();
    this.renderExitDoor();
    this.renderUI();
};

/**
 * 渲染背景
 */
BaseSubMap.prototype.renderBackground = function() {
    // 子地图背景
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 子地图边界
    this.ctx.strokeStyle = '#ecf0f1';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.bounds.minX - 10, this.bounds.minY - 10, 
                       this.bounds.maxX - this.bounds.minX + 20, 
                       this.bounds.maxY - this.bounds.minY + 20);
    
    // 地板
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(this.bounds.minX, this.bounds.minY, 
                     this.bounds.maxX - this.bounds.minX, 
                     this.bounds.maxY - this.bounds.minY);
};

/**
 * 渲染建筑结构 - 子类重写
 */
BaseSubMap.prototype.renderStructure = function() {
    // 基础地板瓷砖效果
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 1;
    
    for (var i = this.bounds.minX; i <= this.bounds.maxX; i += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(i, this.bounds.minY);
        this.ctx.lineTo(i, this.bounds.maxY);
        this.ctx.stroke();
    }
    
    for (var j = this.bounds.minY; j <= this.bounds.maxY; j += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.bounds.minX, j);
        this.ctx.lineTo(this.bounds.maxX, j);
        this.ctx.stroke();
    }
};

/**
 * 渲染敌人
 */
BaseSubMap.prototype.renderEnemies = function() {
    for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        if (enemy.alive) {
            this.renderEnemy(enemy);
        }
    }
};

/**
 * 渲染单个敌人
 */
BaseSubMap.prototype.renderEnemy = function(enemy) {
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.fillRect(enemy.x - 8, enemy.y - 8, 16, 16);
    this.ctx.fillStyle = '#c0392b';
    this.ctx.fillRect(enemy.x - 6, enemy.y - 6, 12, 12);
    
    // 血条
    if (enemy.health < enemy.maxHealth) {
        var barWidth = 16;
        var barHeight = 3;
        var healthPercent = enemy.health / enemy.maxHealth;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 15, barWidth, barHeight);
        
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 15, barWidth * healthPercent, barHeight);
    }
};

/**
 * 渲染资源
 */
BaseSubMap.prototype.renderResources = function() {
    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        if (!resource.collected) {
            this.renderResource(resource);
        }
    }
};

/**
 * 渲染单个资源
 */
BaseSubMap.prototype.renderResource = function(resource) {
    // 发光效果
    var gradient = this.ctx.createRadialGradient(resource.x, resource.y, 0, resource.x, resource.y, 20);
    gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(resource.x - 20, resource.y - 20, 40, 40);
    
    // 资源图标
    this.ctx.fillStyle = this.getResourceColor(resource.type);
    this.ctx.fillRect(resource.x - 6, resource.y - 6, 12, 12);
};

/**
 * 获取资源颜色
 */
BaseSubMap.prototype.getResourceColor = function(type) {
    switch (type) {
        case 'food': return '#f39c12';
        case 'weapon_knife':
        case 'weapon_bat': return '#e74c3c';
        case 'companion_police': return '#3498db';
        case 'companion_nurse': return '#e74c3c';
        case 'companion_chef': return '#f39c12';
        default: return '#27ae60';
    }
};

/**
 * 渲染交互物品
 */
BaseSubMap.prototype.renderInteractables = function() {
    for (var i = 0; i < this.interactables.length; i++) {
        var item = this.interactables[i];
        this.renderInteractable(item);
    }
};

/**
 * 渲染单个交互物品 - 子类可重写
 */
BaseSubMap.prototype.renderInteractable = function(item) {
    this.ctx.fillStyle = '#9b59b6';
    this.ctx.fillRect(item.x - 8, item.y - 8, 16, 16);
};

/**
 * 渲染出口门
 */
BaseSubMap.prototype.renderExitDoor = function() {
    var door = this.exitDoor;
    
    // 门
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(door.x, door.y, door.width, door.height);
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(door.x + 2, door.y + 5, 2, 2); // 门把手
    
    // 门标识
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('出口', door.centerX, door.y - 5);
};

/**
 * 渲染UI信息
 */
BaseSubMap.prototype.renderUI = function() {
    // 建筑信息
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.building.name, this.canvas.width / 2, 50);
    this.ctx.textAlign = 'left';
};

/**
 * 更新子地图
 */
BaseSubMap.prototype.update = function(deltaTime) {
    this.updateEnemies(deltaTime);
    this.updateResources(deltaTime);
    this.updateInteractables(deltaTime);
};

/**
 * 更新敌人 - 子类可重写
 */
BaseSubMap.prototype.updateEnemies = function(deltaTime) {
    // 基础敌人更新逻辑
    for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        if (enemy.alive) {
            // 简单的敌人AI可以在这里实现
        }
    }
};

/**
 * 更新资源
 */
BaseSubMap.prototype.updateResources = function(deltaTime) {
    // 资源通常不需要更新，但子类可以重写
};

/**
 * 更新交互物品
 */
BaseSubMap.prototype.updateInteractables = function(deltaTime) {
    // 交互物品更新逻辑
};

/**
 * 检查是否接近出口
 */
BaseSubMap.prototype.checkExitProximity = function(player, team) {
    var exitThreshold = 25;
    var autoExitThreshold = 15;
    
    // 检查玩家
    var playerDistance = Math.sqrt(
        Math.pow(player.x - this.exitDoor.centerX, 2) + 
        Math.pow(player.y - this.exitDoor.centerY, 2)
    );
    
    // 检查团队成员
    var teamNearExit = playerDistance < exitThreshold;
    var shouldAutoExit = playerDistance < autoExitThreshold;
    
    for (var i = 0; i < team.length && !shouldAutoExit; i++) {
        var member = team[i];
        var memberDistance = Math.sqrt(
            Math.pow(member.x - this.exitDoor.centerX, 2) + 
            Math.pow(member.y - this.exitDoor.centerY, 2)
        );
        
        if (memberDistance < exitThreshold) {
            teamNearExit = true;
        }
        if (memberDistance < autoExitThreshold) {
            shouldAutoExit = true;
        }
    }
    
    return {
        nearExit: teamNearExit,
        shouldExit: shouldAutoExit
    };
};

/**
 * 处理资源收集
 */
BaseSubMap.prototype.collectResource = function(resourceId) {
    for (var i = 0; i < this.resources.length; i++) {
        if (this.resources[i].id === resourceId && !this.resources[i].collected) {
            this.resources[i].collected = true;
            console.log('[BaseSubMap] 资源已收集:', this.resources[i].type);
            return this.resources[i];
        }
    }
    return null;
};

/**
 * 处理敌人击败
 */
BaseSubMap.prototype.defeatEnemy = function(enemyId) {
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].id === enemyId && this.enemies[i].alive) {
            this.enemies[i].alive = false;
            console.log('[BaseSubMap] 敌人已击败:', this.enemies[i].type);
            return this.enemies[i];
        }
    }
    return null;
};

/**
 * 获取子地图状态
 */
BaseSubMap.prototype.getStatus = function() {
    return {
        type: this.type,
        building: this.building.getStatus(),
        enemies: this.enemies.filter(function(e) { return e.alive; }).length,
        resources: this.resources.filter(function(r) { return !r.collected; }).length,
        bounds: this.bounds
    };
};

/**
 * 清理子地图
 */
BaseSubMap.prototype.cleanup = function() {
    this.enemies = [];
    this.resources = [];
    this.interactables = [];
    console.log('[BaseSubMap] 子地图已清理');
};
