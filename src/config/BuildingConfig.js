/**
 * 建筑配置管理 - 集中管理所有建筑类型的配置
 */
function BuildingConfig() {
    this.buildingTypes = this.initializeBuildingTypes();
    console.log('[BuildingConfig] 建筑配置初始化，共', Object.keys(this.buildingTypes).length, '种建筑类型');
}

/**
 * 初始化建筑类型配置
 */
BuildingConfig.prototype.initializeBuildingTypes = function() {
    return {
        // === 重要建筑 ===
        police_station: {
            name: '警察局',
            category: 'government',
            color: '#3498db',
            size: { width: 80, height: 80 },
            oneTimeOnly: false,
            weight: 1,
            submapType: 'police_station',
            resources: ['companion_police'],
            enemies: ['zombie_normal'],
            description: '维护治安的重要场所'
        },
        
        hospital: {
            name: '医院',
            category: 'medical',
            color: '#e74c3c',
            size: { width: 80, height: 80 },
            oneTimeOnly: false,
            weight: 1,
            submapType: 'hospital',
            resources: ['companion_nurse', 'health_pack'],
            enemies: ['zombie_normal', 'zombie_infected'],
            description: '提供医疗服务的关键设施'
        },
        
        school: {
            name: '学校',
            category: 'education',
            color: '#f39c12',
            size: { width: 70, height: 70 },
            oneTimeOnly: false,
            weight: 2,
            submapType: 'school',
            resources: ['food'],
            enemies: ['zombie_normal'],
            description: '教育培训的重要场所'
        },
        
        // === 商业建筑 ===
        shop: {
            name: '商店',
            category: 'commercial',
            color: '#27ae60',
            size: { width: 60, height: 50 },
            oneTimeOnly: true,
            weight: 4,
            submapType: 'shop',
            resources: ['weapon_knife', 'weapon_bat'],
            enemies: ['zombie_normal'],
            description: '购买物资的商业场所'
        },
        
        restaurant: {
            name: '餐厅',
            category: 'commercial',
            color: '#e67e22',
            size: { width: 60, height: 50 },
            oneTimeOnly: true,
            weight: 4,
            submapType: 'restaurant',
            resources: ['companion_chef', 'food'],
            enemies: ['zombie_normal'],
            description: '提供食物的餐饮场所'
        },
        
        bar: {
            name: '酒吧',
            category: 'entertainment',
            color: '#d35400',
            size: { width: 50, height: 50 },
            oneTimeOnly: true,
            weight: 3,
            submapType: 'bar',
            resources: [],
            enemies: ['zombie_drunk'],
            description: '休闲娱乐的场所'
        },
        
        // === 住宅建筑 ===
        house: {
            name: '民房',
            category: 'residential',
            color: '#95a5a6',
            size: { width: 50, height: 50 },
            oneTimeOnly: false,
            weight: 8,
            submapType: 'house',
            resources: ['food'],
            enemies: ['zombie_normal'],
            description: '普通居民住宅'
        },
        
        villa: {
            name: '别墅',
            category: 'residential',
            color: '#8e44ad',
            size: { width: 80, height: 60 },
            oneTimeOnly: false,
            weight: 4,
            submapType: 'villa',
            resources: ['food', 'luxury_items'],
            enemies: ['zombie_normal', 'zombie_elite'],
            description: '高档住宅区'
        },
        
        apartment: {
            name: '公寓',
            category: 'residential',
            color: '#7f8c8d',
            size: { width: 60, height: 80 },
            oneTimeOnly: false,
            weight: 6,
            submapType: 'apartment',
            resources: ['food', 'companion_civilian'],
            enemies: ['zombie_normal'],
            description: '多层住宅建筑'
        },
        
        // === 工业建筑 ===
        factory: {
            name: '工厂',
            category: 'industrial',
            color: '#555555',
            size: { width: 90, height: 70 },
            oneTimeOnly: false,
            weight: 2,
            submapType: 'factory',
            resources: ['weapon_parts', 'fuel'],
            enemies: ['zombie_worker', 'zombie_elite'],
            description: '工业生产设施'
        },
        
        warehouse: {
            name: '仓库',
            category: 'industrial',
            color: '#666666',
            size: { width: 80, height: 60 },
            oneTimeOnly: false,
            weight: 3,
            submapType: 'warehouse',
            resources: ['food', 'supplies'],
            enemies: ['zombie_normal'],
            description: '物资储存设施'
        },
        
        // === 特殊建筑 ===
        mall: {
            name: '商场',
            category: 'commercial',
            color: '#27ae60',
            size: { width: 90, height: 70 },
            oneTimeOnly: false,
            weight: 1,
            submapType: 'mall',
            resources: ['food', 'weapons', 'companions'],
            enemies: ['zombie_normal', 'zombie_elite', 'zombie_boss'],
            description: '大型购物中心'
        },
        
        station: {
            name: '车站',
            category: 'transport',
            color: '#34495e',
            size: { width: 70, height: 60 },
            oneTimeOnly: false,
            weight: 2,
            submapType: 'station',
            resources: ['fuel', 'companion_driver'],
            enemies: ['zombie_normal'],
            description: '交通运输枢纽'
        }
    };
};

/**
 * 获取建筑类型配置
 */
BuildingConfig.prototype.getBuildingType = function(typeName) {
    return this.buildingTypes[typeName] || null;
};

/**
 * 获取所有建筑类型
 */
BuildingConfig.prototype.getAllBuildingTypes = function() {
    return Object.keys(this.buildingTypes).map(function(key) {
        return this.buildingTypes[key];
    }.bind(this));
};

/**
 * 根据分类获取建筑类型
 */
BuildingConfig.prototype.getBuildingsByCategory = function(category) {
    var buildings = [];
    for (var key in this.buildingTypes) {
        if (this.buildingTypes[key].category === category) {
            buildings.push(this.buildingTypes[key]);
        }
    }
    return buildings;
};

/**
 * 获取加权随机建筑类型
 */
BuildingConfig.prototype.getRandomBuildingType = function() {
    var totalWeight = 0;
    var buildingArray = [];
    
    for (var key in this.buildingTypes) {
        var building = this.buildingTypes[key];
        totalWeight += building.weight;
        buildingArray.push({ key: key, building: building, weight: building.weight });
    }
    
    var random = Math.random() * totalWeight;
    var currentWeight = 0;
    
    for (var i = 0; i < buildingArray.length; i++) {
        currentWeight += buildingArray[i].weight;
        if (random <= currentWeight) {
            return buildingArray[i].building;
        }
    }
    
    // 后备方案
    return this.buildingTypes.house;
};

// 全局建筑配置实例
var buildingConfig = new BuildingConfig();