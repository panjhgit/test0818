/**
 * 警察局子地图 - 专门的警察局内部实现
 */
function PoliceStationMap(config) {
    BaseSubMap.call(this, config);
    
    // 警察局特有配置
    this.officeFurniture = [];
    this.evidenceRooms = [];
    this.cells = [];
    
    console.log('[PoliceStationMap] 警察局子地图创建');
}

// 继承BaseSubMap
PoliceStationMap.prototype = Object.create(BaseSubMap.prototype);
PoliceStationMap.prototype.constructor = PoliceStationMap;

/**
 * 生成警察局特有内容
 */
PoliceStationMap.prototype.generateContent = function() {
    // 调用父类方法
    BaseSubMap.prototype.generateContent.call(this);
    
    // 生成警察局特有内容
    this.generateOfficeFurniture();
    this.generateEvidenceRooms();
    this.generateCells();
};

/**
 * 生成办公家具
 */
PoliceStationMap.prototype.generateOfficeFurniture = function() {
    // 办公桌
    this.officeFurniture.push({
        type: 'desk',
        x: 100, y: 150,
        width: 60, height: 30,
        color: '#8b4513'
    });
    
    this.officeFurniture.push({
        type: 'desk',
        x: 220, y: 150,
        width: 60, height: 30,
        color: '#8b4513'
    });
    
    // 文件柜
    this.officeFurniture.push({
        type: 'cabinet',
        x: 300, y: 130,
        width: 30, height: 50,
        color: '#7f8c8d'
    });
};

/**
 * 生成证物室
 */
PoliceStationMap.prototype.generateEvidenceRooms = function() {
    this.evidenceRooms.push({
        x: 80, y: 200,
        width: 40, height: 30,
        color: '#34495e'
    });
};

/**
 * 生成牢房
 */
PoliceStationMap.prototype.generateCells = function() {
    for (var i = 0; i < 2; i++) {
        this.cells.push({
            x: 250 + i * 45, y: 200,
            width: 40, height: 40,
            color: '#2c3e50',
            occupied: Math.random() < 0.3 // 30%概率有犯人
        });
    }
};

/**
 * 重写结构渲染
 */
PoliceStationMap.prototype.renderStructure = function() {
    // 调用父类地板渲染
    BaseSubMap.prototype.renderStructure.call(this);
    
    // 渲染警察局特有结构
    this.renderOfficeFurniture();
    this.renderEvidenceRooms();
    this.renderCells();
    this.renderPoliceEquipment();
};

/**
 * 渲染办公家具
 */
PoliceStationMap.prototype.renderOfficeFurniture = function() {
    for (var i = 0; i < this.officeFurniture.length; i++) {
        var furniture = this.officeFurniture[i];
        this.ctx.fillStyle = furniture.color;
        this.ctx.fillRect(furniture.x, furniture.y, furniture.width, furniture.height);
        
        // 家具边框
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(furniture.x, furniture.y, furniture.width, furniture.height);
    }
};

/**
 * 渲染证物室
 */
PoliceStationMap.prototype.renderEvidenceRooms = function() {
    for (var i = 0; i < this.evidenceRooms.length; i++) {
        var room = this.evidenceRooms[i];
        this.ctx.fillStyle = room.color;
        this.ctx.fillRect(room.x, room.y, room.width, room.height);
        
        // 标签
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('证物', room.x + room.width / 2, room.y + room.height / 2);
    }
};

/**
 * 渲染牢房
 */
PoliceStationMap.prototype.renderCells = function() {
    for (var i = 0; i < this.cells.length; i++) {
        var cell = this.cells[i];
        
        // 牢房结构
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
        
        // 牢房门（栅栏效果）
        this.ctx.strokeStyle = '#7f8c8d';
        this.ctx.lineWidth = 2;
        for (var j = 0; j < 4; j++) {
            var barX = cell.x + 5 + j * 8;
            this.ctx.beginPath();
            this.ctx.moveTo(barX, cell.y);
            this.ctx.lineTo(barX, cell.y + cell.height);
            this.ctx.stroke();
        }
        
        // 如果有犯人
        if (cell.occupied) {
            this.ctx.fillStyle = '#e67e22';
            this.ctx.fillRect(cell.x + 15, cell.y + 15, 10, 10);
        }
    }
};

/**
 * 渲染警察设备
 */
PoliceStationMap.prototype.renderPoliceEquipment = function() {
    // 对讲机
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(120, 180, 15, 8);
    
    // 警徽
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.beginPath();
    this.ctx.arc(150, 140, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 公告板
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.fillRect(70, 120, 25, 35);
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(70, 120, 25, 35);
};

/**
 * 重写敌人生成 - 警察局特有的敌人配置
 */
PoliceStationMap.prototype.generateEnemies = function() {
    // 警察局敌人较少，但可能有特殊类型
    var enemyCount = 1 + Math.floor(Math.random() * 3); // 1-3个敌人
    
    for (var i = 0; i < enemyCount; i++) {
        var enemyTypes = ['zombie_normal', 'zombie_criminal']; // 警察局特有的罪犯僵尸
        var enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        var enemy = this.createEnemy(enemyType);
        if (enemy) {
            // 警察局敌人有特殊属性
            if (enemyType === 'zombie_criminal') {
                enemy.health = 20; // 更强壮
                enemy.attack = 8;
            }
            this.enemies.push(enemy);
        }
    }
    
    console.log('[PoliceStationMap] 生成警察局敌人:', this.enemies.length, '个');
};
