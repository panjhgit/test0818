/**
 * 资源管理模块 (resource.js)
 * 
 * 功能描述：
 * - 资源类型管理：食物、医疗用品、武器、材料等各种资源
 * - 资源生成：在地图上随机生成资源点
 * - 资源收集：玩家与资源点交互收集资源
 * - 库存管理：资源的存储、使用、转移
 * - 资源消耗：食物消耗、武器耐久度、医疗用品使用
 * - 资源交易：不同资源之间的转换和交易
 * 
 * 主要类和方法：
 * - ResourceManager: 资源管理器主类
 * - ResourceType: 资源类型定义
 * - ResourceNode: 资源节点（地图上的资源点）
 * - Inventory: 库存系统
 * - ResourceConsumer: 资源消耗器
 */

/**
 * 资源管理器主类
 */
function ResourceManager() {
    this.resourceTypes = this.initializeResourceTypes();
    this.resourceNodes = [];
    this.inventory = new Inventory();
    this.resourceConsumer = new ResourceConsumer(this);
    
    // 资源生成配置
    this.spawnConfig = {
        baseSpawnRate: 0.1,      // 基础生成率
        maxResourceNodes: 100,   // 最大资源节点数
        respawnTime: 30000,      // 重新生成时间（毫秒）
        qualityVariation: 0.3    // 品质变化范围
    };
    
    // 资源统计
    this.stats = {
        totalCollected: {},
        totalConsumed: {},
        currentStock: {}
    };
    
    this.initializeStats();
}

/**
 * 初始化资源类型
 * @returns {Object} 资源类型映射
 */
ResourceManager.prototype.initializeResourceTypes = function() {
    return {
        food: new ResourceType({
            id: 'food',
            name: '食物',
            description: '维持生存的基本需求',
            category: 'consumable',
            stackable: true,
            maxStack: 99,
            baseValue: 1,
            consumeRate: 1, // 每天消耗量
            icon: '🍞',
            color: '#FF9800',
            rarity: 'common'
        }),
        
        medicine: new ResourceType({
            id: 'medicine',
            name: '医疗用品',
            description: '治疗伤病的药物和医疗器械',
            category: 'consumable',
            stackable: true,
            maxStack: 50,
            baseValue: 3,
            healAmount: 25,
            icon: '💊',
            color: '#E91E63',
            rarity: 'uncommon'
        }),
        
        weapon: new ResourceType({
            id: 'weapon',
            name: '武器',
            description: '用于战斗的武器装备',
            category: 'equipment',
            stackable: false,
            maxStack: 1,
            baseValue: 5,
            attackBonus: 10,
            durability: 100,
            icon: '🔫',
            color: '#9C27B0',
            rarity: 'rare'
        }),
        
        material: new ResourceType({
            id: 'material',
            name: '材料',
            description: '建造和制作用的原材料',
            category: 'material',
            stackable: true,
            maxStack: 99,
            baseValue: 2,
            icon: '🔧',
            color: '#607D8B',
            rarity: 'common'
        }),
        
        fuel: new ResourceType({
            id: 'fuel',
            name: '燃料',
            description: '车辆和发电机用的燃料',
            category: 'consumable',
            stackable: true,
            maxStack: 20,
            baseValue: 4,
            icon: '⛽',
            color: '#FF5722',
            rarity: 'uncommon'
        }),
        
        ammunition: new ResourceType({
            id: 'ammunition',
            name: '弹药',
            description: '武器使用的弹药',
            category: 'consumable',
            stackable: true,
            maxStack: 200,
            baseValue: 1,
            icon: '🔫',
            color: '#795548',
            rarity: 'common'
        }),
        
        electronics: new ResourceType({
            id: 'electronics',
            name: '电子设备',
            description: '通讯和电子设备',
            category: 'equipment',
            stackable: true,
            maxStack: 10,
            baseValue: 8,
            icon: '📱',
            color: '#2196F3',
            rarity: 'rare'
        }),
        
        clothing: new ResourceType({
            id: 'clothing',
            name: '衣物',
            description: '保暖和防护用的衣物',
            category: 'equipment',
            stackable: true,
            maxStack: 20,
            baseValue: 2,
            defenseBonus: 5,
            icon: '👕',
            color: '#4CAF50',
            rarity: 'common'
        })
    };
};

/**
 * 初始化统计数据
 */
ResourceManager.prototype.initializeStats = function() {
    for (var resourceId in this.resourceTypes) {
        this.stats.totalCollected[resourceId] = 0;
        this.stats.totalConsumed[resourceId] = 0;
        this.stats.currentStock[resourceId] = 0;
    }
};

/**
 * 生成资源节点
 * @param {Object} mapData - 地图数据
 * @param {number} count - 生成数量
 */
ResourceManager.prototype.generateResourceNodes = function(mapData, count) {
    count = count || 50;
    
    for (var i = 0; i < count; i++) {
        var position = this.findValidResourcePosition(mapData);
        if (position) {
            var resourceNode = this.createResourceNode(position);
            this.resourceNodes.push(resourceNode);
        }
    }
    
    console.log('[ResourceManager] 生成了 ' + this.resourceNodes.length + ' 个资源节点');
};

/**
 * 寻找有效的资源位置
 * @param {Object} mapData - 地图数据
 * @returns {Object|null} 位置对象 {x, y}
 */
ResourceManager.prototype.findValidResourcePosition = function(mapData) {
    var maxAttempts = 50;
    
    for (var attempt = 0; attempt < maxAttempts; attempt++) {
        var x = Math.random() * mapData.width;
        var y = Math.random() * mapData.height;
        
        // 检查是否与建筑重叠
        var tooClose = false;
        for (var i = 0; i < mapData.buildings.length; i++) {
            var building = mapData.buildings[i];
            var distance = Math.sqrt(
                Math.pow(x - (building.x + building.width / 2), 2) + 
                Math.pow(y - (building.y + building.height / 2), 2)
            );
            
            if (distance < 50) { // 距离建筑至少50像素
                tooClose = true;
                break;
            }
        }
        
        if (!tooClose) {
            return {x: x, y: y};
        }
    }
    
    return null;
};

/**
 * 创建资源节点
 * @param {Object} position - 位置对象
 * @returns {ResourceNode} 资源节点对象
 */
ResourceManager.prototype.createResourceNode = function(position) {
    var resourceTypes = Object.keys(this.resourceTypes);
    var randomType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    var resourceType = this.resourceTypes[randomType];
    
    return new ResourceNode({
        id: 'node_' + Date.now() + '_' + Math.random(),
        x: position.x,
        y: position.y,
        resourceType: resourceType,
        amount: this.calculateResourceAmount(resourceType),
        quality: this.calculateResourceQuality(),
        respawnTime: this.spawnConfig.respawnTime,
        discovered: false
    });
};

/**
 * 计算资源数量
 * @param {ResourceType} resourceType - 资源类型
 * @returns {number} 资源数量
 */
ResourceManager.prototype.calculateResourceAmount = function(resourceType) {
    var baseAmount = 5;
    var rarityMultiplier = {
        common: 1.0,
        uncommon: 0.7,
        rare: 0.4,
        epic: 0.2,
        legendary: 0.1
    };
    
    var multiplier = rarityMultiplier[resourceType.rarity] || 1.0;
    return Math.floor(baseAmount * multiplier * (0.5 + Math.random()));
};

/**
 * 计算资源品质
 * @returns {number} 品质值 (0.5 - 1.5)
 */
ResourceManager.prototype.calculateResourceQuality = function() {
    var variation = this.spawnConfig.qualityVariation;
    return 1.0 + (Math.random() - 0.5) * variation * 2;
};

/**
 * 收集资源
 * @param {string} nodeId - 资源节点ID
 * @param {Object} collector - 收集者对象
 * @returns {Object|null} 收集结果
 */
ResourceManager.prototype.collectResource = function(nodeId, collector) {
    var node = this.findResourceNode(nodeId);
    if (!node || node.amount <= 0) {
        return null;
    }
    
    var collectedAmount = Math.min(node.amount, this.getCollectionCapacity(collector));
    var resource = {
        type: node.resourceType.id,
        amount: collectedAmount,
        quality: node.quality
    };
    
    // 更新节点
    node.amount -= collectedAmount;
    node.discovered = true;
    
    if (node.amount <= 0) {
        node.scheduleRespawn();
    }
    
    // 添加到库存
    this.inventory.addResource(resource);
    
    // 更新统计
    this.stats.totalCollected[resource.type] += collectedAmount;
    this.stats.currentStock[resource.type] += collectedAmount;
    
    console.log('[ResourceManager] 收集了 ' + collectedAmount + ' 个 ' + node.resourceType.name);
    
    return {
        resource: resource,
        node: node,
        success: true
    };
};

/**
 * 寻找资源节点
 * @param {string} nodeId - 节点ID
 * @returns {ResourceNode|null} 资源节点
 */
ResourceManager.prototype.findResourceNode = function(nodeId) {
    for (var i = 0; i < this.resourceNodes.length; i++) {
        if (this.resourceNodes[i].id === nodeId) {
            return this.resourceNodes[i];
        }
    }
    return null;
};

/**
 * 获取收集容量
 * @param {Object} collector - 收集者对象
 * @returns {number} 收集容量
 */
ResourceManager.prototype.getCollectionCapacity = function(collector) {
    var baseCapacity = 5;
    var skillMultiplier = 1.0;
    
    // 根据收集者的技能调整容量
    if (collector.skills && collector.skills.scavenging) {
        skillMultiplier = 1 + collector.skills.scavenging * 0.2;
    }
    
    return Math.floor(baseCapacity * skillMultiplier);
};

/**
 * 消耗资源
 * @param {string} resourceType - 资源类型
 * @param {number} amount - 消耗数量
 * @returns {boolean} 是否成功消耗
 */
ResourceManager.prototype.consumeResource = function(resourceType, amount) {
    if (this.inventory.hasResource(resourceType, amount)) {
        this.inventory.removeResource(resourceType, amount);
        this.stats.totalConsumed[resourceType] += amount;
        this.stats.currentStock[resourceType] -= amount;
        return true;
    }
    return false;
};

/**
 * 获取资源数量
 * @param {string} resourceType - 资源类型
 * @returns {number} 资源数量
 */
ResourceManager.prototype.getResourceAmount = function(resourceType) {
    return this.inventory.getResourceAmount(resourceType);
};

/**
 * 更新资源系统
 * @param {number} deltaTime - 帧间隔时间
 */
ResourceManager.prototype.update = function(deltaTime) {
    // 更新资源节点
    for (var i = 0; i < this.resourceNodes.length; i++) {
        this.resourceNodes[i].update(deltaTime);
    }
    
    // 更新资源消耗
    this.resourceConsumer.update(deltaTime);
    
    // 检查是否需要生成新的资源节点
    this.checkResourceNodeSpawn();
};

/**
 * 检查资源节点生成
 */
ResourceManager.prototype.checkResourceNodeSpawn = function() {
    var activeNodes = this.resourceNodes.filter(function(node) {
        return node.amount > 0;
    });
    
    if (activeNodes.length < this.spawnConfig.maxResourceNodes * 0.5) {
        // 当活跃节点少于最大值的50%时，生成新节点
        var spawnCount = Math.floor(this.spawnConfig.maxResourceNodes * 0.1);
        // 这里需要地图数据，实际实现时需要从游戏引擎获取
        // this.generateResourceNodes(mapData, spawnCount);
    }
};

/**
 * 渲染资源节点
 * @param {Object} ctx - 2D渲染上下文
 * @param {Object} viewport - 视口信息
 */
ResourceManager.prototype.render = function(ctx, viewport) {
    for (var i = 0; i < this.resourceNodes.length; i++) {
        var node = this.resourceNodes[i];
        
        if (node.amount > 0 && this.isNodeInViewport(node, viewport)) {
            node.render(ctx);
        }
    }
};

/**
 * 检查节点是否在视口内
 * @param {ResourceNode} node - 资源节点
 * @param {Object} viewport - 视口信息
 * @returns {boolean} 是否在视口内
 */
ResourceManager.prototype.isNodeInViewport = function(node, viewport) {
    return node.x >= viewport.x && node.x <= viewport.x + viewport.width &&
           node.y >= viewport.y && node.y <= viewport.y + viewport.height;
};

/**
 * 资源类型定义
 * @param {Object} config - 配置对象
 */
function ResourceType(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.category = config.category; // consumable, equipment, material
    this.stackable = config.stackable;
    this.maxStack = config.maxStack;
    this.baseValue = config.baseValue;
    this.icon = config.icon;
    this.color = config.color;
    this.rarity = config.rarity; // common, uncommon, rare, epic, legendary
    
    // 特殊属性
    this.consumeRate = config.consumeRate || 0;
    this.healAmount = config.healAmount || 0;
    this.attackBonus = config.attackBonus || 0;
    this.defenseBonus = config.defenseBonus || 0;
    this.durability = config.durability || 0;
}

/**
 * 获取资源显示颜色
 * @returns {string} 颜色值
 */
ResourceType.prototype.getDisplayColor = function() {
    var rarityColors = {
        common: '#FFFFFF',
        uncommon: '#1EFF00',
        rare: '#0070DD',
        epic: '#A335EE',
        legendary: '#FF8000'
    };
    
    return rarityColors[this.rarity] || this.color;
};

/**
 * 资源节点类
 * @param {Object} config - 配置对象
 */
function ResourceNode(config) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.resourceType = config.resourceType;
    this.amount = config.amount;
    this.maxAmount = config.amount;
    this.quality = config.quality;
    this.respawnTime = config.respawnTime;
    this.discovered = config.discovered;
    
    // 重生相关
    this.isRespawning = false;
    this.respawnTimer = 0;
    
    // 视觉效果
    this.pulseTimer = 0;
    this.glowIntensity = 0;
}

/**
 * 更新资源节点
 * @param {number} deltaTime - 帧间隔时间
 */
ResourceNode.prototype.update = function(deltaTime) {
    // 更新重生计时器
    if (this.isRespawning) {
        this.respawnTimer += deltaTime;
        
        if (this.respawnTimer >= this.respawnTime) {
            this.respawn();
        }
    }
    
    // 更新视觉效果
    this.pulseTimer += deltaTime;
    this.glowIntensity = 0.5 + 0.5 * Math.sin(this.pulseTimer * 0.003);
};

/**
 * 安排重生
 */
ResourceNode.prototype.scheduleRespawn = function() {
    this.isRespawning = true;
    this.respawnTimer = 0;
};

/**
 * 重生资源
 */
ResourceNode.prototype.respawn = function() {
    this.amount = Math.floor(this.maxAmount * (0.5 + Math.random() * 0.5));
    this.isRespawning = false;
    this.respawnTimer = 0;
    this.discovered = false;
    
    console.log('[ResourceNode] 资源节点 ' + this.id + ' 重生了');
};

/**
 * 渲染资源节点
 * @param {Object} ctx - 2D渲染上下文
 */
ResourceNode.prototype.render = function(ctx) {
    if (this.amount <= 0) return;
    
    ctx.save();
    
    // 绘制光晕效果
    if (this.discovered) {
        var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 20);
        gradient.addColorStop(0, this.resourceType.color + '80');
        gradient.addColorStop(1, this.resourceType.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20 * this.glowIntensity, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制资源图标
    var size = 12 + this.amount * 2;
    ctx.fillStyle = this.resourceType.getDisplayColor();
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制边框
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制资源类型图标
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.resourceType.icon, this.x, this.y);
    
    // 绘制数量（如果已发现）
    if (this.discovered) {
        ctx.fillStyle = '#FFF';
        ctx.font = '10px Arial';
        ctx.fillText(this.amount.toString(), this.x, this.y + size + 15);
    }
    
    ctx.restore();
};

/**
 * 库存系统
 */
function Inventory() {
    this.resources = {};
    this.maxSlots = 100;
    this.usedSlots = 0;
}

/**
 * 添加资源到库存
 * @param {Object} resource - 资源对象 {type, amount, quality}
 * @returns {boolean} 是否成功添加
 */
Inventory.prototype.addResource = function(resource) {
    if (!this.resources[resource.type]) {
        this.resources[resource.type] = {
            amount: 0,
            quality: 1.0,
            items: []
        };
    }
    
    var existing = this.resources[resource.type];
    existing.amount += resource.amount;
    
    // 更新平均品质
    existing.quality = (existing.quality + resource.quality) / 2;
    
    return true;
};

/**
 * 移除资源从库存
 * @param {string} resourceType - 资源类型
 * @param {number} amount - 移除数量
 * @returns {boolean} 是否成功移除
 */
Inventory.prototype.removeResource = function(resourceType, amount) {
    if (!this.hasResource(resourceType, amount)) {
        return false;
    }
    
    this.resources[resourceType].amount -= amount;
    
    if (this.resources[resourceType].amount <= 0) {
        delete this.resources[resourceType];
    }
    
    return true;
};

/**
 * 检查是否有足够的资源
 * @param {string} resourceType - 资源类型
 * @param {number} amount - 需要的数量
 * @returns {boolean} 是否有足够资源
 */
Inventory.prototype.hasResource = function(resourceType, amount) {
    return this.resources[resourceType] && 
           this.resources[resourceType].amount >= amount;
};

/**
 * 获取资源数量
 * @param {string} resourceType - 资源类型
 * @returns {number} 资源数量
 */
Inventory.prototype.getResourceAmount = function(resourceType) {
    return this.resources[resourceType] ? this.resources[resourceType].amount : 0;
};

/**
 * 获取所有资源
 * @returns {Object} 资源映射
 */
Inventory.prototype.getAllResources = function() {
    return this.resources;
};

/**
 * 清空库存
 */
Inventory.prototype.clear = function() {
    this.resources = {};
    this.usedSlots = 0;
};

/**
 * 资源消耗器
 * @param {ResourceManager} resourceManager - 资源管理器引用
 */
function ResourceConsumer(resourceManager) {
    this.resourceManager = resourceManager;
    this.consumptionTimer = 0;
    this.consumptionInterval = 30000; // 30秒消耗一次
}

/**
 * 更新资源消耗
 * @param {number} deltaTime - 帧间隔时间
 */
ResourceConsumer.prototype.update = function(deltaTime) {
    this.consumptionTimer += deltaTime;
    
    if (this.consumptionTimer >= this.consumptionInterval) {
        this.processConsumption();
        this.consumptionTimer = 0;
    }
};

/**
 * 处理资源消耗
 */
ResourceConsumer.prototype.processConsumption = function() {
    // 食物消耗
    var foodConsumption = this.calculateFoodConsumption();
    if (foodConsumption > 0) {
        var success = this.resourceManager.consumeResource('food', foodConsumption);
        if (!success) {
            // 食物不足，触发饥饿事件
            this.onInsufficientFood();
        }
    }
    
    // 其他资源的自然消耗
    this.processNaturalDecay();
};

/**
 * 计算食物消耗量
 * @returns {number} 食物消耗量
 */
ResourceConsumer.prototype.calculateFoodConsumption = function() {
    // 基础消耗 + 人口数量
    var baseConsumption = 1;
    var populationConsumption = 0; // 需要从游戏引擎获取人口数量
    
    return baseConsumption + populationConsumption;
};

/**
 * 食物不足事件
 */
ResourceConsumer.prototype.onInsufficientFood = function() {
    console.warn('[ResourceConsumer] 食物不足！');
    // 触发饥饿效果，降低角色属性等
};

/**
 * 处理自然衰减
 */
ResourceConsumer.prototype.processNaturalDecay = function() {
    var inventory = this.resourceManager.inventory;
    var resources = inventory.getAllResources();
    
    for (var resourceType in resources) {
        var resource = resources[resourceType];
        var decayRate = this.getDecayRate(resourceType);
        
        if (decayRate > 0) {
            var decayAmount = Math.floor(resource.amount * decayRate);
            if (decayAmount > 0) {
                inventory.removeResource(resourceType, decayAmount);
                console.log('[ResourceConsumer] ' + resourceType + ' 衰减了 ' + decayAmount);
            }
        }
    }
};

/**
 * 获取衰减率
 * @param {string} resourceType - 资源类型
 * @returns {number} 衰减率 (0-1)
 */
ResourceConsumer.prototype.getDecayRate = function(resourceType) {
    var decayRates = {
        food: 0.02,      // 食物腐烂
        medicine: 0.01,  // 药物过期
        fuel: 0.005      // 燃料挥发
    };
    
    return decayRates[resourceType] || 0;
};

// 导出类（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ResourceManager,
        ResourceType,
        ResourceNode,
        Inventory,
        ResourceConsumer
    };
}
