/**
 * 医院子地图 - 专门的医院内部实现
 */
function HospitalMap(config) {
    BaseSubMap.call(this, config);
    
    // 医院特有配置
    this.medicalEquipment = [];
    this.patientBeds = [];
    this.medicineStorage = [];
    
    console.log('[HospitalMap] 医院子地图创建');
}

// 继承BaseSubMap
HospitalMap.prototype = Object.create(BaseSubMap.prototype);
HospitalMap.prototype.constructor = HospitalMap;

/**
 * 生成医院特有内容
 */
HospitalMap.prototype.generateContent = function() {
    BaseSubMap.prototype.generateContent.call(this);
    
    this.generateMedicalEquipment();
    this.generatePatientBeds();
    this.generateMedicineStorage();
};

/**
 * 生成医疗设备
 */
HospitalMap.prototype.generateMedicalEquipment = function() {
    // 心电图机
    this.medicalEquipment.push({
        type: 'ecg_machine',
        x: 280, y: 140,
        width: 25, height: 20,
        color: '#e74c3c'
    });
    
    // 医疗推车
    this.medicalEquipment.push({
        type: 'medical_cart',
        x: 120, y: 200,
        width: 20, height: 15,
        color: '#bdc3c7'
    });
    
    // 氧气瓶
    this.medicalEquipment.push({
        type: 'oxygen_tank',
        x: 300, y: 180,
        width: 12, height: 25,
        color: '#3498db'
    });
};

/**
 * 生成病床
 */
HospitalMap.prototype.generatePatientBeds = function() {
    var bedPositions = [
        { x: 80, y: 130 },
        { x: 200, y: 130 },
        { x: 80, y: 200 },
        { x: 200, y: 200 }
    ];
    
    for (var i = 0; i < bedPositions.length; i++) {
        this.patientBeds.push({
            x: bedPositions[i].x,
            y: bedPositions[i].y,
            width: 60, height: 30,
            color: '#ffffff',
            occupied: Math.random() < 0.4 // 40%概率有病人
        });
    }
};

/**
 * 生成药品储存
 */
HospitalMap.prototype.generateMedicineStorage = function() {
    this.medicineStorage.push({
        x: 320, y: 120,
        width: 15, height: 40,
        color: '#27ae60',
        medicines: ['bandage', 'antiseptic', 'painkillers']
    });
};

/**
 * 重写结构渲染
 */
HospitalMap.prototype.renderStructure = function() {
    BaseSubMap.prototype.renderStructure.call(this);
    
    // 医院地板（更亮的颜色）
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.fillRect(this.bounds.minX, this.bounds.minY, 
                     this.bounds.maxX - this.bounds.minX, 
                     this.bounds.maxY - this.bounds.minY);
    
    this.renderMedicalEquipment();
    this.renderPatientBeds();
    this.renderMedicineStorage();
    this.renderHospitalSigns();
};

/**
 * 渲染医疗设备
 */
HospitalMap.prototype.renderMedicalEquipment = function() {
    for (var i = 0; i < this.medicalEquipment.length; i++) {
        var equipment = this.medicalEquipment[i];
        
        this.ctx.fillStyle = equipment.color;
        this.ctx.fillRect(equipment.x, equipment.y, equipment.width, equipment.height);
        
        // 设备边框
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(equipment.x, equipment.y, equipment.width, equipment.height);
        
        // 设备指示灯
        if (equipment.type === 'ecg_machine') {
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(equipment.x + 2, equipment.y + 2, 3, 3);
        }
    }
};

/**
 * 渲染病床
 */
HospitalMap.prototype.renderPatientBeds = function() {
    for (var i = 0; i < this.patientBeds.length; i++) {
        var bed = this.patientBeds[i];
        
        // 床架
        this.ctx.fillStyle = bed.color;
        this.ctx.fillRect(bed.x, bed.y, bed.width, bed.height);
        
        // 床边框
        this.ctx.strokeStyle = '#bdc3c7';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(bed.x, bed.y, bed.width, bed.height);
        
        // 枕头
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(bed.x + 5, bed.y + 5, 15, 10);
        
        // 如果有病人
        if (bed.occupied) {
            this.ctx.fillStyle = '#ffa726';
            this.ctx.fillRect(bed.x + 20, bed.y + 10, 12, 8);
            
            // 病人头部
            this.ctx.fillStyle = '#ff8f65';
            this.ctx.fillRect(bed.x + 25, bed.y + 5, 8, 8);
        }
    }
};

/**
 * 渲染药品储存
 */
HospitalMap.prototype.renderMedicineStorage = function() {
    for (var i = 0; i < this.medicineStorage.length; i++) {
        var storage = this.medicineStorage[i];
        
        // 药柜
        this.ctx.fillStyle = storage.color;
        this.ctx.fillRect(storage.x, storage.y, storage.width, storage.height);
        
        // 药柜分隔
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1;
        for (var j = 1; j < 4; j++) {
            var shelfY = storage.y + (storage.height / 4) * j;
            this.ctx.beginPath();
            this.ctx.moveTo(storage.x, shelfY);
            this.ctx.lineTo(storage.x + storage.width, shelfY);
            this.ctx.stroke();
        }
        
        // 药品瓶子
        this.ctx.fillStyle = '#3498db';
        for (var k = 0; k < 6; k++) {
            var bottleX = storage.x + 2 + (k % 2) * 6;
            var bottleY = storage.y + 5 + Math.floor(k / 2) * 10;
            this.ctx.fillRect(bottleX, bottleY, 4, 6);
        }
    }
};

/**
 * 渲染医院标识
 */
HospitalMap.prototype.renderHospitalSigns = function() {
    // 红十字标志
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.fillRect(150, 120, 15, 5); // 水平线
    this.ctx.fillRect(155, 115, 5, 15); // 垂直线
    
    // 急救标识
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('急救', 157, 145);
};

/**
 * 重写敌人生成 - 医院特有的敌人
 */
HospitalMap.prototype.generateEnemies = function() {
    var enemyCount = 2 + Math.floor(Math.random() * 3); // 2-4个敌人
    
    var enemyTypes = ['zombie_patient', 'zombie_doctor', 'zombie_normal'];
    
    for (var i = 0; i < enemyCount; i++) {
        var enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        var enemy = this.createEnemy(enemyType);
        
        if (enemy) {
            // 医院敌人特殊属性
            switch (enemyType) {
                case 'zombie_patient':
                    enemy.health = 10; // 较弱
                    enemy.attack = 3;
                    break;
                case 'zombie_doctor':
                    enemy.health = 25; // 较强
                    enemy.attack = 7;
                    break;
            }
            
            this.enemies.push(enemy);
        }
    }
    
    console.log('[HospitalMap] 生成医院敌人:', this.enemies.length, '个');
};
