/**
 * 子地图工厂 - 根据建筑类型创建不同的子地图
 * 使用ES5语法，兼容抖音小程序环境
 */

// 子地图基类
function SubMap(config) {
    this.config = config || {};
    this.size = config.size || { width: 400, height: 300 };
    this.layout = config.layout || 'simple_layout';
    this.enemySpawn = config.enemySpawn || {};
    this.loot = config.loot || {};
    this.specialFeatures = config.specialFeatures || [];
    
    // 子地图内容
    this.enemies = [];
    this.lootItems = [];
    this.obstacles = [];
    this.exitPoints = [];
}

SubMap.prototype.generateContent = function() {
    this.generateEnemies();
    this.generateLoot();
    this.generateObstacles();
    this.generateLayout();
};

SubMap.prototype.generateEnemies = function() {
    if (!this.enemySpawn.types || !this.enemySpawn.count) return;
    
    var minCount = this.enemySpawn.count.min || 1;
    var maxCount = this.enemySpawn.count.max || 3;
    var count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
    
    for (var i = 0; i < count; i++) {
        var typeIndex = Math.floor(Math.random() * this.enemySpawn.types.length);
        var enemyType = this.enemySpawn.types[typeIndex];
        
        var enemy = {
            type: enemyType,
            x: 80 + Math.random() * (this.size.width - 160),
            y: 130 + Math.random() * (this.size.height - 180),
            health: this.getEnemyHealth(enemyType),
            damage: this.getEnemyDamage(enemyType),
            speed: this.getEnemySpeed(enemyType)
        };
        
        this.enemies.push(enemy);
    }
};

SubMap.prototype.generateLoot = function() {
    // 生成保证掉落的物品
    if (this.loot.guaranteed) {
        for (var i = 0; i < this.loot.guaranteed.length; i++) {
            var itemType = this.loot.guaranteed[i];
            this.createLootItem(itemType);
        }
    }
    
    // 生成可能掉落的物品
    if (this.loot.possible && this.loot.probability) {
        for (var j = 0; j < this.loot.possible.length; j++) {
            if (Math.random() < this.loot.probability) {
                var itemType = this.loot.possible[j];
                this.createLootItem(itemType);
            }
        }
    }
};

SubMap.prototype.createLootItem = function(itemType) {
    var item = {
        type: itemType,
        x: 80 + Math.random() * (this.size.width - 160),
        y: 130 + Math.random() * (this.size.height - 180),
        collected: false
    };
    this.lootItems.push(item);
};

SubMap.prototype.generateObstacles = function() {
    // 基础障碍物生成，子类可以重写
};

SubMap.prototype.generateLayout = function() {
    // 基础布局生成，子类可以重写
};

SubMap.prototype.getEnemyHealth = function(enemyType) {
    var healthMap = {
        'zombie_civilian': 20,
        'zombie_cop': 30,
        'zombie_doctor': 25,
        'zombie_patient': 15,
        'zombie_nurse': 20,
        'zombie_student': 15,
        'zombie_teacher': 25,
        'zombie_shopper': 20,
        'zombie_security': 35,
        'zombie_chef': 25,
        'zombie_customer': 18
    };
    return healthMap[enemyType] || 20;
};

SubMap.prototype.getEnemyDamage = function(enemyType) {
    var damageMap = {
        'zombie_civilian': 5,
        'zombie_cop': 8,
        'zombie_doctor': 6,
        'zombie_patient': 4,
        'zombie_nurse': 5,
        'zombie_student': 4,
        'zombie_teacher': 6,
        'zombie_shopper': 5,
        'zombie_security': 10,
        'zombie_chef': 7,
        'zombie_customer': 5
    };
    return damageMap[enemyType] || 5;
};

SubMap.prototype.getEnemySpeed = function(enemyType) {
    var speedMap = {
        'zombie_civilian': 1,
        'zombie_cop': 1.5,
        'zombie_doctor': 1.2,
        'zombie_patient': 0.8,
        'zombie_nurse': 1.1,
        'zombie_student': 1.3,
        'zombie_teacher': 1.0,
        'zombie_shopper': 1.0,
        'zombie_security': 1.8,
        'zombie_chef': 1.2,
        'zombie_customer': 1.0
    };
    return speedMap[enemyType] || 1.0;
};

// 特定类型的子地图类

// 办公室类型子地图（警察局、政府机构等）
function OfficeSubMap(config) {
    SubMap.call(this, config);
}
OfficeSubMap.prototype = Object.create(SubMap.prototype);
OfficeSubMap.prototype.constructor = OfficeSubMap;

OfficeSubMap.prototype.generateLayout = function() {
    // 生成办公室特有的布局：办公桌、文件柜等
    this.obstacles.push(
        { type: 'desk', x: 100, y: 150, width: 60, height: 30 },
        { type: 'cabinet', x: 280, y: 140, width: 40, height: 50 }
    );
};

// 医疗类型子地图（医院、诊所等）
function MedicalSubMap(config) {
    SubMap.call(this, config);
}
MedicalSubMap.prototype = Object.create(SubMap.prototype);
MedicalSubMap.prototype.constructor = MedicalSubMap;

MedicalSubMap.prototype.generateLayout = function() {
    // 生成医疗设施：病床、医疗设备等
    this.obstacles.push(
        { type: 'bed', x: 80, y: 140, width: 80, height: 40 },
        { type: 'equipment', x: 250, y: 160, width: 50, height: 40 }
    );
};

// 住宅类型子地图（房屋、公寓等）
function ResidentialSubMap(config) {
    SubMap.call(this, config);
}
ResidentialSubMap.prototype = Object.create(SubMap.prototype);
ResidentialSubMap.prototype.constructor = ResidentialSubMap;

ResidentialSubMap.prototype.generateLayout = function() {
    // 生成家具：沙发、桌子等
    this.obstacles.push(
        { type: 'sofa', x: 90, y: 160, width: 70, height: 35 },
        { type: 'table', x: 200, y: 180, width: 50, height: 50 }
    );
};

// 商业类型子地图（商店、餐厅等）
function CommercialSubMap(config) {
    SubMap.call(this, config);
}
CommercialSubMap.prototype = Object.create(SubMap.prototype);
CommercialSubMap.prototype.constructor = CommercialSubMap;

CommercialSubMap.prototype.generateLayout = function() {
    // 生成商业设施：货架、收银台等
    this.obstacles.push(
        { type: 'shelf', x: 80, y: 140, width: 30, height: 80 },
        { type: 'counter', x: 200, y: 200, width: 80, height: 30 }
    );
};

// 子地图工厂
function SubMapFactory() {}

SubMapFactory.createSubMap = function(buildingType, config) {
    if (!config || !config.type) {
        return new SubMap(config);
    }
    
    switch (config.type) {
        case 'office':
            return new OfficeSubMap(config);
        case 'medical':
            return new MedicalSubMap(config);
        case 'residential':
            return new ResidentialSubMap(config);
        case 'commercial':
        case 'shop':
        case 'restaurant':
            return new CommercialSubMap(config);
        default:
            return new SubMap(config);
    }
};

// 导出（兼容不同环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SubMap: SubMap,
        OfficeSubMap: OfficeSubMap,
        MedicalSubMap: MedicalSubMap,
        ResidentialSubMap: ResidentialSubMap,
        CommercialSubMap: CommercialSubMap,
        SubMapFactory: SubMapFactory
    };
} else {
    // 浏览器环境或内联使用
    window.SubMap = SubMap;
    window.OfficeSubMap = OfficeSubMap;
    window.MedicalSubMap = MedicalSubMap;
    window.ResidentialSubMap = ResidentialSubMap;
    window.CommercialSubMap = CommercialSubMap;
    window.SubMapFactory = SubMapFactory;
}

