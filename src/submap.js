/**
 * 子地图模块 (submap.js)
 * 
 * 功能描述：
 * - 子地图系统：进入建筑后的内部场景
 * - 建筑内部：医院、超市、警察局、学校等不同建筑的内部布局
 * - 交互系统：与建筑内物品、NPC、设施的交互
 * - 任务系统：建筑内的特殊任务和事件
 * - 资源获取：在建筑内搜寻资源和物品
 * - 危险机制：建筑内可能存在的僵尸和陷阱
 * 
 * 主要类和方法：
 * - SubmapManager: 子地图管理器
 * - SubmapType: 不同类型的子地图定义
 * - InteractionSystem: 交互系统
 * - SubmapRenderer: 子地图渲染器
 * - EventSystem: 子地图事件系统
 */

/**
 * 子地图管理器
 */
function SubmapManager() {
    this.currentSubmap = null;
    this.submapTypes = this.initializeSubmapTypes();
    this.interactionSystem = new InteractionSystem(this);
    this.submapRenderer = new SubmapRenderer();
    this.eventSystem = new EventSystem(this);
    
    // 子地图状态
    this.isInSubmap = false;
    this.exitCooldown = 0;
    this.explorationProgress = {};
    
    // 配置
    this.config = {
        exitCooldownTime: 2000,  // 退出冷却时间
        maxExplorationTime: 300000, // 最大探索时间（5分钟）
        dangerLevel: 0.1,        // 基础危险等级
        resourceSpawnRate: 0.3   // 资源生成率
    };
}

/**
 * 初始化子地图类型
 * @returns {Object} 子地图类型映射
 */
SubmapManager.prototype.initializeSubmapTypes = function() {
    return {
        hospital: new SubmapType({
            id: 'hospital',
            name: '医院',
            description: '可以治疗伤员，获取医疗用品',
            layout: 'hospital_layout',
            backgroundColor: '#E3F2FD',
            dangerLevel: 0.2,
            resources: ['medicine', 'electronics'],
            interactions: ['heal_station', 'medicine_cabinet', 'emergency_kit'],
            npcs: ['doctor', 'nurse'],
            specialFeatures: ['surgery_room', 'pharmacy', 'emergency_room']
        }),
        
        supermarket: new SubmapType({
            id: 'supermarket',
            name: '超市',
            description: '可以获取食物和生活用品',
            layout: 'supermarket_layout',
            backgroundColor: '#FFF3E0',
            dangerLevel: 0.15,
            resources: ['food', 'clothing', 'material'],
            interactions: ['food_shelf', 'checkout_counter', 'storage_room'],
            npcs: ['survivor', 'looter'],
            specialFeatures: ['freezer_section', 'electronics_aisle', 'pharmacy_corner']
        }),
        
        police_station: new SubmapType({
            id: 'police_station',
            name: '警察局',
            description: '可以获取武器和弹药',
            layout: 'police_layout',
            backgroundColor: '#E8F5E8',
            dangerLevel: 0.3,
            resources: ['weapon', 'ammunition', 'electronics'],
            interactions: ['weapon_locker', 'evidence_room', 'jail_cell'],
            npcs: ['police_officer', 'prisoner'],
            specialFeatures: ['armory', 'communication_room', 'holding_cells']
        }),
        
        school: new SubmapType({
            id: 'school',
            name: '学校',
            description: '可能有幸存者，获取教育资源',
            layout: 'school_layout',
            backgroundColor: '#FFF8E1',
            dangerLevel: 0.25,
            resources: ['material', 'electronics', 'clothing'],
            interactions: ['classroom', 'library', 'cafeteria'],
            npcs: ['teacher', 'student', 'janitor'],
            specialFeatures: ['gymnasium', 'computer_lab', 'science_lab']
        }),
        
        house: new SubmapType({
            id: 'house',
            name: '住宅',
            description: '普通住宅，可能有少量资源',
            layout: 'house_layout',
            backgroundColor: '#F3E5F5',
            dangerLevel: 0.1,
            resources: ['food', 'clothing', 'material'],
            interactions: ['kitchen', 'bedroom', 'garage'],
            npcs: ['resident', 'family_member'],
            specialFeatures: ['basement', 'attic', 'garden']
        }),
        
        warehouse: new SubmapType({
            id: 'warehouse',
            name: '仓库',
            description: '大型仓库，可能有大量物资',
            layout: 'warehouse_layout',
            backgroundColor: '#EFEBE9',
            dangerLevel: 0.2,
            resources: ['material', 'food', 'fuel'],
            interactions: ['storage_container', 'loading_dock', 'office'],
            npcs: ['worker', 'security_guard'],
            specialFeatures: ['cold_storage', 'heavy_machinery', 'office_area']
        })
    };
};

/**
 * 进入子地图
 * @param {Object} building - 建筑对象
 * @param {Object} gameEngine - 游戏引擎引用
 * @returns {boolean} 是否成功进入
 */
SubmapManager.prototype.enterSubmap = function(building, gameEngine) {
    if (this.isInSubmap || this.exitCooldown > 0) {
        return false;
    }
    
    var submapType = this.submapTypes[building.type];
    if (!submapType) {
        console.warn('[SubmapManager] 未知的建筑类型:', building.type);
        return false;
    }
    
    // 创建子地图实例
    this.currentSubmap = new Submap(submapType, building, gameEngine);
    this.isInSubmap = true;
    
    // 初始化探索进度
    if (!this.explorationProgress[building.id]) {
        this.explorationProgress[building.id] = {
            visited: false,
            explorationLevel: 0,
            resourcesFound: 0,
            npcsEncountered: [],
            eventsTriggered: []
        };
    }
    
    this.explorationProgress[building.id].visited = true;
    
    console.log('[SubmapManager] 进入子地图:', building.name);
    
    // 触发进入事件
    this.eventSystem.triggerEvent('enter_submap', {
        building: building,
        submapType: submapType
    });
    
    return true;
};

/**
 * 退出子地图
 * @returns {boolean} 是否成功退出
 */
SubmapManager.prototype.exitSubmap = function() {
    if (!this.isInSubmap || this.exitCooldown > 0) {
        return false;
    }
    
    // 触发退出事件
    this.eventSystem.triggerEvent('exit_submap', {
        submap: this.currentSubmap
    });
    
    // 设置退出冷却
    this.exitCooldown = this.config.exitCooldownTime;
    
    // 清理子地图
    this.currentSubmap = null;
    this.isInSubmap = false;
    
    console.log('[SubmapManager] 退出子地图');
    
    return true;
};

/**
 * 更新子地图系统
 * @param {number} deltaTime - 帧间隔时间
 */
SubmapManager.prototype.update = function(deltaTime) {
    // 更新退出冷却
    if (this.exitCooldown > 0) {
        this.exitCooldown -= deltaTime;
        if (this.exitCooldown < 0) {
            this.exitCooldown = 0;
        }
    }
    
    // 更新当前子地图
    if (this.currentSubmap) {
        this.currentSubmap.update(deltaTime);
    }
    
    // 更新交互系统
    this.interactionSystem.update(deltaTime);
    
    // 更新事件系统
    this.eventSystem.update(deltaTime);
};

/**
 * 渲染子地图
 * @param {Object} ctx - 2D渲染上下文
 */
SubmapManager.prototype.render = function(ctx) {
    if (!this.currentSubmap) return;
    
    this.submapRenderer.render(ctx, this.currentSubmap);
};

/**
 * 处理子地图输入
 * @param {Object} inputEvent - 输入事件
 */
SubmapManager.prototype.handleInput = function(inputEvent) {
    if (!this.currentSubmap) return;
    
    switch (inputEvent.type) {
        case 'tap':
            this.handleTap(inputEvent.x, inputEvent.y);
            break;
        case 'longPress':
            this.handleLongPress(inputEvent.x, inputEvent.y);
            break;
    }
};

/**
 * 处理点击事件
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
SubmapManager.prototype.handleTap = function(x, y) {
    // 检查是否点击了交互对象
    var interaction = this.interactionSystem.checkInteraction(x, y);
    if (interaction) {
        this.interactionSystem.executeInteraction(interaction);
        return;
    }
    
    // 检查是否点击了退出区域
    if (this.checkExitArea(x, y)) {
        this.exitSubmap();
        return;
    }
    
    // 普通移动或探索
    this.currentSubmap.exploreArea(x, y);
};

/**
 * 处理长按事件
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
SubmapManager.prototype.handleLongPress = function(x, y) {
    // 长按可以显示详细信息或上下文菜单
    var info = this.currentSubmap.getAreaInfo(x, y);
    if (info) {
        this.showAreaInfo(info);
    }
};

/**
 * 检查退出区域
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {boolean} 是否在退出区域
 */
SubmapManager.prototype.checkExitArea = function(x, y) {
    // 简单实现：左上角区域为退出区域
    return x < 100 && y < 100;
};

/**
 * 显示区域信息
 * @param {Object} info - 区域信息
 */
SubmapManager.prototype.showAreaInfo = function(info) {
    console.log('[SubmapManager] 区域信息:', info);
    // 这里可以显示UI提示或详细信息面板
};

/**
 * 子地图类型定义
 * @param {Object} config - 配置对象
 */
function SubmapType(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.layout = config.layout;
    this.backgroundColor = config.backgroundColor;
    this.dangerLevel = config.dangerLevel;
    this.resources = config.resources || [];
    this.interactions = config.interactions || [];
    this.npcs = config.npcs || [];
    this.specialFeatures = config.specialFeatures || [];
}

/**
 * 子地图实例
 * @param {SubmapType} submapType - 子地图类型
 * @param {Object} building - 建筑对象
 * @param {Object} gameEngine - 游戏引擎引用
 */
function Submap(submapType, building, gameEngine) {
    this.type = submapType;
    this.building = building;
    this.gameEngine = gameEngine;
    
    // 子地图数据
    this.width = 800;
    this.height = 600;
    this.areas = [];
    this.interactionPoints = [];
    this.npcs = [];
    this.resources = [];
    this.exploredAreas = new Set();
    
    // 状态
    this.explorationLevel = 0;
    this.dangerLevel = submapType.dangerLevel;
    this.timeSpent = 0;
    
    // 初始化子地图
    this.initialize();
}

/**
 * 初始化子地图
 */
Submap.prototype.initialize = function() {
    this.generateLayout();
    this.spawnResources();
    this.spawnNPCs();
    this.createInteractionPoints();
    
    console.log('[Submap] 初始化子地图:', this.type.name);
};

/**
 * 生成布局
 */
Submap.prototype.generateLayout = function() {
    // 根据建筑类型生成不同的房间布局
    switch (this.type.id) {
        case 'hospital':
            this.generateHospitalLayout();
            break;
        case 'supermarket':
            this.generateSupermarketLayout();
            break;
        case 'police_station':
            this.generatePoliceStationLayout();
            break;
        case 'school':
            this.generateSchoolLayout();
            break;
        default:
            this.generateGenericLayout();
            break;
    }
};

/**
 * 生成医院布局
 */
Submap.prototype.generateHospitalLayout = function() {
    this.areas = [
        {id: 'entrance', name: '入口大厅', x: 50, y: 50, width: 200, height: 100, type: 'entrance'},
        {id: 'emergency', name: '急诊室', x: 300, y: 50, width: 150, height: 120, type: 'medical'},
        {id: 'pharmacy', name: '药房', x: 500, y: 50, width: 100, height: 80, type: 'resource'},
        {id: 'ward', name: '病房', x: 50, y: 200, width: 300, height: 150, type: 'medical'},
        {id: 'surgery', name: '手术室', x: 400, y: 200, width: 200, height: 150, type: 'special'},
        {id: 'storage', name: '储藏室', x: 50, y: 400, width: 150, height: 100, type: 'resource'}
    ];
};

/**
 * 生成超市布局
 */
Submap.prototype.generateSupermarketLayout = function() {
    this.areas = [
        {id: 'entrance', name: '入口', x: 50, y: 50, width: 150, height: 80, type: 'entrance'},
        {id: 'food_aisle', name: '食品区', x: 50, y: 150, width: 200, height: 200, type: 'resource'},
        {id: 'electronics', name: '电子产品区', x: 300, y: 150, width: 150, height: 100, type: 'resource'},
        {id: 'clothing', name: '服装区', x: 500, y: 150, width: 150, height: 150, type: 'resource'},
        {id: 'checkout', name: '收银台', x: 300, y: 300, width: 200, height: 80, type: 'interaction'},
        {id: 'storage', name: '仓库', x: 50, y: 400, width: 250, height: 150, type: 'resource'}
    ];
};

/**
 * 生成警察局布局
 */
Submap.prototype.generatePoliceStationLayout = function() {
    this.areas = [
        {id: 'lobby', name: '大厅', x: 50, y: 50, width: 200, height: 100, type: 'entrance'},
        {id: 'office', name: '办公室', x: 300, y: 50, width: 150, height: 120, type: 'interaction'},
        {id: 'armory', name: '武器库', x: 500, y: 50, width: 120, height: 100, type: 'resource'},
        {id: 'cells', name: '拘留室', x: 50, y: 200, width: 200, height: 150, type: 'special'},
        {id: 'evidence', name: '证物室', x: 300, y: 200, width: 150, height: 100, type: 'resource'},
        {id: 'garage', name: '车库', x: 50, y: 400, width: 300, height: 150, type: 'special'}
    ];
};

/**
 * 生成学校布局
 */
Submap.prototype.generateSchoolLayout = function() {
    this.areas = [
        {id: 'hallway', name: '走廊', x: 50, y: 50, width: 500, height: 80, type: 'entrance'},
        {id: 'classroom1', name: '教室1', x: 50, y: 150, width: 120, height: 100, type: 'interaction'},
        {id: 'classroom2', name: '教室2', x: 200, y: 150, width: 120, height: 100, type: 'interaction'},
        {id: 'library', name: '图书馆', x: 350, y: 150, width: 200, height: 120, type: 'resource'},
        {id: 'cafeteria', name: '食堂', x: 50, y: 300, width: 250, height: 150, type: 'resource'},
        {id: 'gym', name: '体育馆', x: 350, y: 300, width: 200, height: 150, type: 'special'}
    ];
};

/**
 * 生成通用布局
 */
Submap.prototype.generateGenericLayout = function() {
    this.areas = [
        {id: 'main_room', name: '主房间', x: 100, y: 100, width: 300, height: 200, type: 'main'},
        {id: 'side_room', name: '侧房间', x: 450, y: 100, width: 150, height: 150, type: 'secondary'},
        {id: 'storage', name: '储藏室', x: 100, y: 350, width: 200, height: 100, type: 'resource'}
    ];
};

/**
 * 生成资源
 */
Submap.prototype.spawnResources = function() {
    var resourceTypes = this.type.resources;
    var resourceCount = Math.floor(this.areas.length * 0.6);
    
    for (var i = 0; i < resourceCount; i++) {
        var area = this.areas[Math.floor(Math.random() * this.areas.length)];
        var resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        
        var resource = {
            id: 'resource_' + i,
            type: resourceType,
            amount: Math.floor(Math.random() * 5) + 1,
            x: area.x + Math.random() * area.width,
            y: area.y + Math.random() * area.height,
            discovered: false,
            collected: false
        };
        
        this.resources.push(resource);
    }
};

/**
 * 生成NPC
 */
Submap.prototype.spawnNPCs = function() {
    var npcTypes = this.type.npcs;
    var npcCount = Math.floor(Math.random() * 3) + 1;
    
    for (var i = 0; i < npcCount && i < npcTypes.length; i++) {
        var area = this.areas[Math.floor(Math.random() * this.areas.length)];
        var npcType = npcTypes[i];
        
        var npc = {
            id: 'npc_' + i,
            type: npcType,
            name: this.generateNPCName(npcType),
            x: area.x + area.width / 2,
            y: area.y + area.height / 2,
            health: 100,
            isAlive: true,
            isHostile: Math.random() < this.dangerLevel,
            dialogue: this.generateNPCDialogue(npcType)
        };
        
        this.npcs.push(npc);
    }
};

/**
 * 生成NPC名称
 * @param {string} npcType - NPC类型
 * @returns {string} NPC名称
 */
Submap.prototype.generateNPCName = function(npcType) {
    var names = {
        doctor: ['Dr. Smith', 'Dr. Johnson', 'Dr. Brown'],
        nurse: ['Nurse Wilson', 'Nurse Davis', 'Nurse Miller'],
        survivor: ['Alex', 'Jordan', 'Casey', 'Morgan'],
        police_officer: ['Officer Jones', 'Officer Taylor', 'Officer Anderson'],
        teacher: ['Mr. White', 'Ms. Garcia', 'Dr. Martinez']
    };
    
    var nameList = names[npcType] || ['Unknown'];
    return nameList[Math.floor(Math.random() * nameList.length)];
};

/**
 * 生成NPC对话
 * @param {string} npcType - NPC类型
 * @returns {Array} 对话数组
 */
Submap.prototype.generateNPCDialogue = function(npcType) {
    var dialogues = {
        doctor: [
            '我可以治疗你的伤势。',
            '这里的医疗用品快用完了。',
            '小心，有些病房里可能有感染者。'
        ],
        survivor: [
            '你也是幸存者吗？',
            '我们应该团结起来。',
            '这里不太安全，我们得小心。'
        ],
        police_officer: [
            '这里是警察局，我会保护平民。',
            '武器库里还有一些装备。',
            '外面的情况很糟糕。'
        ]
    };
    
    return dialogues[npcType] || ['...'];
};

/**
 * 创建交互点
 */
Submap.prototype.createInteractionPoints = function() {
    var interactions = this.type.interactions;
    
    for (var i = 0; i < interactions.length; i++) {
        var interactionType = interactions[i];
        var area = this.findAreaForInteraction(interactionType);
        
        if (area) {
            var interaction = {
                id: 'interaction_' + i,
                type: interactionType,
                name: this.getInteractionName(interactionType),
                x: area.x + area.width / 2,
                y: area.y + area.height / 2,
                area: area,
                used: false,
                cooldown: 0
            };
            
            this.interactionPoints.push(interaction);
        }
    }
};

/**
 * 为交互寻找合适的区域
 * @param {string} interactionType - 交互类型
 * @returns {Object|null} 区域对象
 */
Submap.prototype.findAreaForInteraction = function(interactionType) {
    var preferredAreaTypes = {
        heal_station: ['medical'],
        medicine_cabinet: ['resource', 'medical'],
        weapon_locker: ['resource'],
        food_shelf: ['resource'],
        classroom: ['interaction']
    };
    
    var preferred = preferredAreaTypes[interactionType] || ['interaction'];
    
    for (var i = 0; i < preferred.length; i++) {
        var areaType = preferred[i];
        for (var j = 0; j < this.areas.length; j++) {
            var area = this.areas[j];
            if (area.type === areaType) {
                return area;
            }
        }
    }
    
    return this.areas[0]; // 默认返回第一个区域
};

/**
 * 获取交互名称
 * @param {string} interactionType - 交互类型
 * @returns {string} 交互名称
 */
Submap.prototype.getInteractionName = function(interactionType) {
    var names = {
        heal_station: '治疗站',
        medicine_cabinet: '药品柜',
        weapon_locker: '武器柜',
        food_shelf: '食品架',
        classroom: '教室',
        checkout_counter: '收银台'
    };
    
    return names[interactionType] || interactionType;
};

/**
 * 更新子地图
 * @param {number} deltaTime - 帧间隔时间
 */
Submap.prototype.update = function(deltaTime) {
    this.timeSpent += deltaTime;
    
    // 更新交互点冷却
    for (var i = 0; i < this.interactionPoints.length; i++) {
        var interaction = this.interactionPoints[i];
        if (interaction.cooldown > 0) {
            interaction.cooldown -= deltaTime;
            if (interaction.cooldown < 0) {
                interaction.cooldown = 0;
            }
        }
    }
    
    // 更新NPC
    for (var j = 0; j < this.npcs.length; j++) {
        var npc = this.npcs[j];
        if (npc.isAlive) {
            this.updateNPC(npc, deltaTime);
        }
    }
    
    // 检查时间限制
    if (this.timeSpent > 300000) { // 5分钟限制
        this.triggerTimeLimit();
    }
};

/**
 * 更新NPC
 * @param {Object} npc - NPC对象
 * @param {number} deltaTime - 帧间隔时间
 */
Submap.prototype.updateNPC = function(npc, deltaTime) {
    // 简单的NPC AI
    if (npc.isHostile) {
        // 敌对NPC可能会攻击玩家
        this.updateHostileNPC(npc, deltaTime);
    } else {
        // 友好NPC可能会提供帮助
        this.updateFriendlyNPC(npc, deltaTime);
    }
};

/**
 * 更新敌对NPC
 * @param {Object} npc - NPC对象
 * @param {number} deltaTime - 帧间隔时间
 */
Submap.prototype.updateHostileNPC = function(npc, deltaTime) {
    // 敌对行为逻辑
    // 例如：向玩家移动、攻击等
};

/**
 * 更新友好NPC
 * @param {Object} npc - NPC对象
 * @param {number} deltaTime - 帧间隔时间
 */
Submap.prototype.updateFriendlyNPC = function(npc, deltaTime) {
    // 友好行为逻辑
    // 例如：提供信息、交易等
};

/**
 * 探索区域
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
Submap.prototype.exploreArea = function(x, y) {
    var area = this.getAreaAt(x, y);
    if (area && !this.exploredAreas.has(area.id)) {
        this.exploredAreas.add(area.id);
        this.explorationLevel++;
        
        console.log('[Submap] 探索了新区域:', area.name);
        
        // 可能发现资源
        this.checkResourceDiscovery(area);
        
        // 可能触发事件
        this.checkAreaEvent(area);
    }
};

/**
 * 获取指定坐标的区域
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {Object|null} 区域对象
 */
Submap.prototype.getAreaAt = function(x, y) {
    for (var i = 0; i < this.areas.length; i++) {
        var area = this.areas[i];
        if (x >= area.x && x <= area.x + area.width &&
            y >= area.y && y <= area.y + area.height) {
            return area;
        }
    }
    return null;
};

/**
 * 检查资源发现
 * @param {Object} area - 区域对象
 */
Submap.prototype.checkResourceDiscovery = function(area) {
    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        if (!resource.discovered && this.isResourceInArea(resource, area)) {
            resource.discovered = true;
            console.log('[Submap] 发现资源:', resource.type, 'x' + resource.amount);
        }
    }
};

/**
 * 检查资源是否在区域内
 * @param {Object} resource - 资源对象
 * @param {Object} area - 区域对象
 * @returns {boolean} 是否在区域内
 */
Submap.prototype.isResourceInArea = function(resource, area) {
    return resource.x >= area.x && resource.x <= area.x + area.width &&
           resource.y >= area.y && resource.y <= area.y + area.height;
};

/**
 * 检查区域事件
 * @param {Object} area - 区域对象
 */
Submap.prototype.checkAreaEvent = function(area) {
    var eventChance = 0.2; // 20%几率触发事件
    
    if (Math.random() < eventChance) {
        this.triggerAreaEvent(area);
    }
};

/**
 * 触发区域事件
 * @param {Object} area - 区域对象
 */
Submap.prototype.triggerAreaEvent = function(area) {
    var events = this.getAreaEvents(area);
    if (events.length > 0) {
        var event = events[Math.floor(Math.random() * events.length)];
        console.log('[Submap] 触发事件:', event.name);
        // 执行事件逻辑
    }
};

/**
 * 获取区域事件
 * @param {Object} area - 区域对象
 * @returns {Array} 事件数组
 */
Submap.prototype.getAreaEvents = function(area) {
    var events = [];
    
    switch (area.type) {
        case 'medical':
            events.push({name: 'find_medicine', description: '发现了医疗用品'});
            break;
        case 'resource':
            events.push({name: 'find_supplies', description: '发现了补给品'});
            break;
        case 'special':
            events.push({name: 'special_discovery', description: '发现了特殊物品'});
            break;
    }
    
    return events;
};

/**
 * 获取区域信息
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {Object|null} 区域信息
 */
Submap.prototype.getAreaInfo = function(x, y) {
    var area = this.getAreaAt(x, y);
    if (area) {
        return {
            name: area.name,
            type: area.type,
            explored: this.exploredAreas.has(area.id),
            resources: this.getAreaResources(area),
            npcs: this.getAreaNPCs(area)
        };
    }
    return null;
};

/**
 * 获取区域内的资源
 * @param {Object} area - 区域对象
 * @returns {Array} 资源数组
 */
Submap.prototype.getAreaResources = function(area) {
    var areaResources = [];
    
    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        if (this.isResourceInArea(resource, area) && resource.discovered) {
            areaResources.push(resource);
        }
    }
    
    return areaResources;
};

/**
 * 获取区域内的NPC
 * @param {Object} area - 区域对象
 * @returns {Array} NPC数组
 */
Submap.prototype.getAreaNPCs = function(area) {
    var areaNPCs = [];
    
    for (var i = 0; i < this.npcs.length; i++) {
        var npc = this.npcs[i];
        if (npc.x >= area.x && npc.x <= area.x + area.width &&
            npc.y >= area.y && npc.y <= area.y + area.height) {
            areaNPCs.push(npc);
        }
    }
    
    return areaNPCs;
};

/**
 * 触发时间限制
 */
Submap.prototype.triggerTimeLimit = function() {
    console.warn('[Submap] 探索时间过长，危险等级上升！');
    this.dangerLevel += 0.1;
    // 可能生成更多敌对NPC或触发危险事件
};

/**
 * 交互系统
 * @param {SubmapManager} submapManager - 子地图管理器引用
 */
function InteractionSystem(submapManager) {
    this.submapManager = submapManager;
    this.activeInteractions = [];
}

/**
 * 更新交互系统
 * @param {number} deltaTime - 帧间隔时间
 */
InteractionSystem.prototype.update = function(deltaTime) {
    // 更新活跃交互
    for (var i = this.activeInteractions.length - 1; i >= 0; i--) {
        var interaction = this.activeInteractions[i];
        interaction.duration -= deltaTime;
        
        if (interaction.duration <= 0) {
            this.completeInteraction(interaction);
            this.activeInteractions.splice(i, 1);
        }
    }
};

/**
 * 检查交互
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {Object|null} 交互对象
 */
InteractionSystem.prototype.checkInteraction = function(x, y) {
    var submap = this.submapManager.currentSubmap;
    if (!submap) return null;
    
    for (var i = 0; i < submap.interactionPoints.length; i++) {
        var interaction = submap.interactionPoints[i];
        var distance = Math.sqrt(
            Math.pow(x - interaction.x, 2) + Math.pow(y - interaction.y, 2)
        );
        
        if (distance < 50 && interaction.cooldown <= 0) { // 50像素交互范围
            return interaction;
        }
    }
    
    return null;
};

/**
 * 执行交互
 * @param {Object} interaction - 交互对象
 */
InteractionSystem.prototype.executeInteraction = function(interaction) {
    if (interaction.used && interaction.cooldown > 0) {
        return false;
    }
    
    console.log('[InteractionSystem] 执行交互:', interaction.name);
    
    switch (interaction.type) {
        case 'heal_station':
            this.executeHealInteraction(interaction);
            break;
        case 'medicine_cabinet':
            this.executeMedicineInteraction(interaction);
            break;
        case 'weapon_locker':
            this.executeWeaponInteraction(interaction);
            break;
        case 'food_shelf':
            this.executeFoodInteraction(interaction);
            break;
        default:
            this.executeGenericInteraction(interaction);
            break;
    }
    
    // 设置冷却时间
    interaction.cooldown = 5000; // 5秒冷却
    interaction.used = true;
    
    return true;
};

/**
 * 执行治疗交互
 * @param {Object} interaction - 交互对象
 */
InteractionSystem.prototype.executeHealInteraction = function(interaction) {
    // 治疗玩家和团队成员
    var gameEngine = this.submapManager.currentSubmap.gameEngine;
    if (gameEngine && gameEngine.characterManager) {
        var characters = gameEngine.characterManager.characters;
        
        for (var i = 0; i < characters.length; i++) {
            var character = characters[i];
            if (character.health < character.maxHealth) {
                character.heal(25);
                console.log('[InteractionSystem] 治疗了', character.name);
            }
        }
    }
};

/**
 * 执行药品交互
 * @param {Object} interaction - 交互对象
 */
InteractionSystem.prototype.executeMedicineInteraction = function(interaction) {
    // 获取医疗用品
    var amount = Math.floor(Math.random() * 3) + 1;
    console.log('[InteractionSystem] 获得医疗用品 x' + amount);
    // 这里应该调用资源管理器添加资源
};

/**
 * 执行武器交互
 * @param {Object} interaction - 交互对象
 */
InteractionSystem.prototype.executeWeaponInteraction = function(interaction) {
    // 获取武器
    console.log('[InteractionSystem] 获得武器');
    // 这里应该调用资源管理器添加武器
};

/**
 * 执行食物交互
 * @param {Object} interaction - 交互对象
 */
InteractionSystem.prototype.executeFoodInteraction = function(interaction) {
    // 获取食物
    var amount = Math.floor(Math.random() * 5) + 2;
    console.log('[InteractionSystem] 获得食物 x' + amount);
    // 这里应该调用资源管理器添加食物
};

/**
 * 执行通用交互
 * @param {Object} interaction - 交互对象
 */
InteractionSystem.prototype.executeGenericInteraction = function(interaction) {
    console.log('[InteractionSystem] 执行通用交互:', interaction.name);
};

/**
 * 完成交互
 * @param {Object} interaction - 交互对象
 */
InteractionSystem.prototype.completeInteraction = function(interaction) {
    console.log('[InteractionSystem] 完成交互:', interaction.name);
};

/**
 * 子地图渲染器
 */
function SubmapRenderer() {
    this.backgroundColor = '#F5F5F5';
}

/**
 * 渲染子地图
 * @param {Object} ctx - 2D渲染上下文
 * @param {Submap} submap - 子地图对象
 */
SubmapRenderer.prototype.render = function(ctx, submap) {
    // 清空背景
    ctx.fillStyle = submap.type.backgroundColor;
    ctx.fillRect(0, 0, submap.width, submap.height);
    
    // 渲染区域
    this.renderAreas(ctx, submap);
    
    // 渲染资源
    this.renderResources(ctx, submap);
    
    // 渲染NPC
    this.renderNPCs(ctx, submap);
    
    // 渲染交互点
    this.renderInteractionPoints(ctx, submap);
    
    // 渲染UI
    this.renderUI(ctx, submap);
};

/**
 * 渲染区域
 * @param {Object} ctx - 2D渲染上下文
 * @param {Submap} submap - 子地图对象
 */
SubmapRenderer.prototype.renderAreas = function(ctx, submap) {
    for (var i = 0; i < submap.areas.length; i++) {
        var area = submap.areas[i];
        var isExplored = submap.exploredAreas.has(area.id);
        
        // 区域背景
        ctx.fillStyle = isExplored ? '#E8F5E8' : '#F0F0F0';
        ctx.fillRect(area.x, area.y, area.width, area.height);
        
        // 区域边框
        ctx.strokeStyle = isExplored ? '#4CAF50' : '#CCC';
        ctx.lineWidth = 2;
        ctx.strokeRect(area.x, area.y, area.width, area.height);
        
        // 区域名称
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(area.name, area.x + area.width / 2, area.y + area.height / 2);
    }
};

/**
 * 渲染资源
 * @param {Object} ctx - 2D渲染上下文
 * @param {Submap} submap - 子地图对象
 */
SubmapRenderer.prototype.renderResources = function(ctx, submap) {
    for (var i = 0; i < submap.resources.length; i++) {
        var resource = submap.resources[i];
        
        if (resource.discovered && !resource.collected) {
            var colors = {
                food: '#FF9800',
                medicine: '#E91E63',
                weapon: '#9C27B0',
                material: '#607D8B'
            };
            
            ctx.fillStyle = colors[resource.type] || '#FFC107';
            ctx.beginPath();
            ctx.arc(resource.x, resource.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // 数量标识
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(resource.amount.toString(), resource.x, resource.y + 3);
        }
    }
};

/**
 * 渲染NPC
 * @param {Object} ctx - 2D渲染上下文
 * @param {Submap} submap - 子地图对象
 */
SubmapRenderer.prototype.renderNPCs = function(ctx, submap) {
    for (var i = 0; i < submap.npcs.length; i++) {
        var npc = submap.npcs[i];
        
        if (npc.isAlive) {
            // NPC圆形
            ctx.fillStyle = npc.isHostile ? '#F44336' : '#2196F3';
            ctx.beginPath();
            ctx.arc(npc.x, npc.y, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // NPC名称
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(npc.name, npc.x, npc.y - 20);
        }
    }
};

/**
 * 渲染交互点
 * @param {Object} ctx - 2D渲染上下文
 * @param {Submap} submap - 子地图对象
 */
SubmapRenderer.prototype.renderInteractionPoints = function(ctx, submap) {
    for (var i = 0; i < submap.interactionPoints.length; i++) {
        var interaction = submap.interactionPoints[i];
        
        if (interaction.cooldown <= 0) {
            // 交互点标识
            ctx.fillStyle = '#FFC107';
            ctx.beginPath();
            ctx.arc(interaction.x, interaction.y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // 交互图标
            ctx.fillStyle = '#333';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚙', interaction.x, interaction.y + 5);
        }
    }
};

/**
 * 渲染UI
 * @param {Object} ctx - 2D渲染上下文
 * @param {Submap} submap - 子地图对象
 */
SubmapRenderer.prototype.renderUI = function(ctx, submap) {
    // 退出按钮
    ctx.fillStyle = '#F44336';
    ctx.fillRect(20, 20, 80, 40);
    
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('退出', 60, 45);
    
    // 探索进度
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('探索进度: ' + submap.explorationLevel + '/' + submap.areas.length, 
                20, submap.height - 20);
};

/**
 * 事件系统
 * @param {SubmapManager} submapManager - 子地图管理器引用
 */
function EventSystem(submapManager) {
    this.submapManager = submapManager;
    this.eventQueue = [];
    this.eventHandlers = {};
    
    this.registerDefaultHandlers();
}

/**
 * 注册默认事件处理器
 */
EventSystem.prototype.registerDefaultHandlers = function() {
    this.registerHandler('enter_submap', this.onEnterSubmap.bind(this));
    this.registerHandler('exit_submap', this.onExitSubmap.bind(this));
    this.registerHandler('resource_found', this.onResourceFound.bind(this));
    this.registerHandler('npc_encounter', this.onNPCEncounter.bind(this));
};

/**
 * 注册事件处理器
 * @param {string} eventType - 事件类型
 * @param {Function} handler - 处理函数
 */
EventSystem.prototype.registerHandler = function(eventType, handler) {
    if (!this.eventHandlers[eventType]) {
        this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(handler);
};

/**
 * 触发事件
 * @param {string} eventType - 事件类型
 * @param {Object} eventData - 事件数据
 */
EventSystem.prototype.triggerEvent = function(eventType, eventData) {
    this.eventQueue.push({
        type: eventType,
        data: eventData,
        timestamp: Date.now()
    });
};

/**
 * 更新事件系统
 * @param {number} deltaTime - 帧间隔时间
 */
EventSystem.prototype.update = function(deltaTime) {
    // 处理事件队列
    while (this.eventQueue.length > 0) {
        var event = this.eventQueue.shift();
        this.processEvent(event);
    }
};

/**
 * 处理事件
 * @param {Object} event - 事件对象
 */
EventSystem.prototype.processEvent = function(event) {
    var handlers = this.eventHandlers[event.type];
    if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
            handlers[i](event.data);
        }
    }
};

/**
 * 进入子地图事件处理
 * @param {Object} data - 事件数据
 */
EventSystem.prototype.onEnterSubmap = function(data) {
    console.log('[EventSystem] 进入子地图事件:', data.building.name);
};

/**
 * 退出子地图事件处理
 * @param {Object} data - 事件数据
 */
EventSystem.prototype.onExitSubmap = function(data) {
    console.log('[EventSystem] 退出子地图事件');
};

/**
 * 发现资源事件处理
 * @param {Object} data - 事件数据
 */
EventSystem.prototype.onResourceFound = function(data) {
    console.log('[EventSystem] 发现资源事件:', data.resource.type);
};

/**
 * NPC遭遇事件处理
 * @param {Object} data - 事件数据
 */
EventSystem.prototype.onNPCEncounter = function(data) {
    console.log('[EventSystem] NPC遭遇事件:', data.npc.name);
};

// 导出类（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SubmapManager,
        SubmapType,
        Submap,
        InteractionSystem,
        SubmapRenderer,
        EventSystem
    };
}
