/**
 * 地图管理器
 * 负责主地图和子地图的管理
 */
class MapManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.currentMap = 'main';
        this.buildings = [];
        this.mainMapData = null;
        this.subMapData = null;
        
        this.initializeMainMap();
        console.log('[MapManager] 地图管理器已初始化');
    }
    
    /**
     * 初始化主地图
     */
    initializeMainMap() {
        this.buildings = [
            {
                id: 'police_station',
                name: '警察局',
                type: 'police_station',
                x: 100,
                y: 150,
                width: 60,
                height: 60,
                explored: false,
                color: '#3498db'
            },
            {
                id: 'hospital',
                name: '医院',
                type: 'hospital',
                x: 200,
                y: 150,
                width: 60,
                height: 60,
                explored: false,
                color: '#e74c3c'
            },
            {
                id: 'school',
                name: '学校',
                type: 'school',
                x: 300,
                y: 150,
                width: 60,
                height: 60,
                explored: false,
                color: '#f39c12'
            },
            {
                id: 'house1',
                name: '民房',
                type: 'house',
                x: 100,
                y: 250,
                width: 50,
                height: 50,
                explored: false,
                color: '#95a5a6'
            },
            {
                id: 'villa',
                name: '别墅',
                type: 'villa',
                x: 200,
                y: 250,
                width: 70,
                height: 50,
                explored: false,
                color: '#8e44ad'
            },
            {
                id: 'shop',
                name: '商店',
                type: 'shop',
                x: 300,
                y: 250,
                width: 60,
                height: 50,
                explored: false,
                color: '#27ae60',
                oneTimeOnly: true
            },
            {
                id: 'bar',
                name: '酒吧',
                type: 'bar',
                x: 100,
                y: 350,
                width: 50,
                height: 50,
                explored: false,
                color: '#d35400',
                oneTimeOnly: true
            },
            {
                id: 'restaurant',
                name: '餐厅',
                type: 'restaurant',
                x: 200,
                y: 350,
                width: 60,
                height: 50,
                explored: false,
                color: '#e67e22',
                oneTimeOnly: true
            },
            {
                id: 'station',
                name: '车站',
                type: 'station',
                x: 300,
                y: 350,
                width: 60,
                height: 50,
                explored: false,
                color: '#34495e'
            }
        ];
        
        console.log('[MapManager] 主地图建筑物已初始化');
    }
    
    /**
     * 渲染主地图
     */
    renderMainMap() {
        // 绘制背景
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(0, 60, this.canvas.width, this.canvas.height - 60);
        
        // 绘制街道
        this.ctx.fillStyle = '#34495e';
        // 水平街道
        this.ctx.fillRect(0, 200, this.canvas.width, 20);
        this.ctx.fillRect(0, 320, this.canvas.width, 20);
        // 垂直街道
        this.ctx.fillRect(150, 60, 20, this.canvas.height - 60);
        this.ctx.fillRect(250, 60, 20, this.canvas.height - 60);
        
        // 绘制建筑物
        this.buildings.forEach(building => {
            this.renderBuilding(building);
        });
        
        // 绘制废土元素
        this.renderWastelandElements();
    }
    
    /**
     * 渲染建筑物
     */
    renderBuilding(building) {
        const { x, y, width, height, color, explored, name } = building;
        
        // 建筑物主体
        this.ctx.fillStyle = explored ? color : this.lightenColor(color, 0.3);
        this.ctx.fillRect(x, y, width, height);
        
        // 建筑物边框
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // 未探索高亮效果
        if (!explored) {
            this.ctx.strokeStyle = '#f1c40f';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
            this.ctx.setLineDash([]);
        }
        
        // 建筑物标签
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(name, x + width / 2, y + height + 15);
        
        // 重置文字对齐
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染废土元素
     */
    renderWastelandElements() {
        // 断墙
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(50, 120, 15, 30);
        this.ctx.fillRect(380, 180, 12, 25);
        
        // 废弃车辆
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.fillRect(350, 280, 30, 15);
        this.ctx.fillRect(70, 400, 25, 12);
    }
    
    /**
     * 渲染子地图
     */
    renderSubMap(mapType, resources = [], zombies = []) {
        // 清空画布
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 60, this.canvas.width, this.canvas.height - 60);
        
        // 根据地图类型渲染不同背景
        switch (mapType) {
            case 'police_station':
                this.renderPoliceStationMap(resources);
                break;
            case 'hospital':
                this.renderHospitalMap(resources);
                break;
            case 'school':
                this.renderSchoolMap(resources);
                break;
            case 'house':
                this.renderHouseMap(resources);
                break;
            case 'villa':
                this.renderVillaMap(resources);
                break;
            case 'shop':
                this.renderShopMap(resources);
                break;
            case 'bar':
                this.renderBarMap();
                break;
            case 'restaurant':
                this.renderRestaurantMap(resources);
                break;
            case 'station':
                this.renderStationMap();
                break;
            default:
                this.renderGenericMap();
        }
        
        // 渲染资源点
        resources.forEach(resource => {
            this.renderResource(resource);
        });
        
        // 渲染僵尸
        zombies.forEach(zombie => {
            this.renderZombie(zombie);
        });
        
        // 渲染返回按钮
        this.renderBackButton();
    }
    
    /**
     * 渲染警察局子地图
     */
    renderPoliceStationMap(resources) {
        // 警察局内部布局
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(50, 100, 300, 200);
        
        // 办公桌
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(80, 130, 60, 30);
        this.ctx.fillRect(200, 130, 60, 30);
        
        // 警察局标识
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('警察局', this.canvas.width / 2, 90);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染医院子地图
     */
    renderHospitalMap(resources) {
        // 医院内部布局
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(50, 100, 300, 200);
        
        // 病床
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(70, 120, 80, 40);
        this.ctx.fillRect(220, 120, 80, 40);
        
        // 医疗设备
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(150, 200, 20, 30);
        
        // 医院标识
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('医院', this.canvas.width / 2, 90);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染学校子地图
     */
    renderSchoolMap(resources) {
        // 教室布局
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(50, 100, 300, 200);
        
        // 课桌
        this.ctx.fillStyle = '#8b4513';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                this.ctx.fillRect(70 + j * 60, 120 + i * 40, 40, 20);
            }
        }
        
        // 黑板
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(60, 250, 280, 40);
        
        // 学校标识
        this.ctx.fillStyle = '#f39c12';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('学校', this.canvas.width / 2, 90);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染民房子地图
     */
    renderHouseMap(resources) {
        // 房间布局
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.fillRect(50, 100, 300, 200);
        
        // 家具
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(70, 120, 80, 40); // 沙发
        this.ctx.fillRect(250, 120, 60, 30); // 桌子
        this.ctx.fillRect(80, 220, 40, 60); // 床
        
        // 民房标识
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('民房', this.canvas.width / 2, 90);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染别墅子地图
     */
    renderVillaMap(resources) {
        // 豪华房间布局
        this.ctx.fillStyle = '#8e44ad';
        this.ctx.fillRect(30, 80, 340, 240);
        
        // 豪华家具
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(50, 100, 100, 50); // 大沙发
        this.ctx.fillRect(250, 100, 80, 40); // 餐桌
        this.ctx.fillRect(50, 200, 60, 80); // 大床
        this.ctx.fillRect(200, 200, 40, 40); // 电视
        
        // 别墅标识
        this.ctx.fillStyle = '#8e44ad';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('别墅', this.canvas.width / 2, 75);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染商店子地图
     */
    renderShopMap(resources) {
        // 商店布局
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(50, 100, 300, 200);
        
        // 货架
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(70, 120, 20, 120);
        this.ctx.fillRect(150, 120, 20, 120);
        this.ctx.fillRect(230, 120, 20, 120);
        
        // 收银台
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(280, 200, 60, 30);
        
        // 商店标识
        this.ctx.fillStyle = '#27ae60';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('商店', this.canvas.width / 2, 90);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染酒吧子地图
     */
    renderBarMap() {
        // 酒吧布局
        this.ctx.fillStyle = '#d35400';
        this.ctx.fillRect(50, 100, 300, 200);
        
        // 吧台
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(60, 200, 280, 40);
        
        // 座椅
        this.ctx.fillStyle = '#2c3e50';
        for (let i = 0; i < 6; i++) {
            this.ctx.fillRect(80 + i * 40, 180, 15, 15);
        }
        
        // 酒吧标识
        this.ctx.fillStyle = '#d35400';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('酒吧', this.canvas.width / 2, 90);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染餐厅子地图
     */
    renderRestaurantMap(resources) {
        // 餐厅布局
        this.ctx.fillStyle = '#e67e22';
        this.ctx.fillRect(50, 100, 300, 200);
        
        // 餐桌
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(80, 130, 40, 40);
        this.ctx.fillRect(200, 130, 40, 40);
        this.ctx.fillRect(80, 200, 40, 40);
        this.ctx.fillRect(200, 200, 40, 40);
        
        // 厨房
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(270, 120, 60, 80);
        
        // 餐厅标识
        this.ctx.fillStyle = '#e67e22';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('餐厅', this.canvas.width / 2, 90);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染车站子地图
     */
    renderStationMap() {
        // 车站布局
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(50, 100, 300, 200);
        
        // 候车椅
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(80, 150, 200, 20);
        
        // 站台
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(60, 250, 280, 30);
        
        // 车站标识
        this.ctx.fillStyle = '#34495e';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('车站', this.canvas.width / 2, 90);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染通用子地图
     */
    renderGenericMap() {
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(50, 100, 300, 200);
    }
    
    /**
     * 渲染资源点
     */
    renderResource(resource) {
        const { x, y, type, amount } = resource;
        
        // 资源发光效果
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 20);
        
        switch (type) {
            case 'food':
                gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x - 20, y - 20, 40, 40);
                
                // 食物图标
                this.ctx.fillStyle = '#f39c12';
                this.ctx.fillRect(x - 8, y - 8, 16, 16);
                break;
                
            case 'weapon':
                gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x - 20, y - 20, 40, 40);
                
                // 武器图标
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillRect(x - 10, y - 3, 20, 6);
                break;
                
            case 'companion':
                gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
                gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x - 20, y - 20, 40, 40);
                
                // 人物图标
                this.ctx.fillStyle = '#27ae60';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 8, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
    }
    
    /**
     * 渲染僵尸
     */
    renderZombie(zombie) {
        const { x, y, health, maxHealth } = zombie;
        
        // 僵尸主体
        this.ctx.fillStyle = '#8b0000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 血条
        if (health < maxHealth) {
            const barWidth = 20;
            const barHeight = 4;
            const healthPercent = health / maxHealth;
            
            // 血条背景
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(x - barWidth / 2, y - 20, barWidth, barHeight);
            
            // 血条
            this.ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : '#e74c3c';
            this.ctx.fillRect(x - barWidth / 2, y - 20, barWidth * healthPercent, barHeight);
        }
    }
    
    /**
     * 渲染返回按钮
     */
    renderBackButton() {
        const buttonWidth = 80;
        const buttonHeight = 30;
        const buttonX = 10;
        const buttonY = this.canvas.height - 40;
        
        // 按钮背景
        this.ctx.fillStyle = 'rgba(52, 73, 94, 0.8)';
        this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // 按钮边框
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // 按钮文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('返回', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 5);
        
        // 重置文字对齐
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 检查点击的建筑物
     */
    getBuildingAt(x, y) {
        return this.buildings.find(building => {
            return x >= building.x && x <= building.x + building.width &&
                   y >= building.y && y <= building.y + building.height;
        });
    }
    
    /**
     * 标记建筑物为已探索
     */
    markBuildingExplored(buildingId) {
        const building = this.buildings.find(b => b.id === buildingId);
        if (building) {
            building.explored = true;
        }
    }
    
    /**
     * 切换到子地图
     */
    switchToSubMap(mapType) {
        this.currentMap = mapType;
    }
    
    /**
     * 切换到主地图
     */
    switchToMainMap() {
        this.currentMap = 'main';
    }
    
    /**
     * 获取当前地图类型
     */
    getCurrentMap() {
        return this.currentMap;
    }
    
    /**
     * 颜色变亮函数
     */
    lightenColor(color, amount) {
        const colorInt = parseInt(color.slice(1), 16);
        const r = Math.min(255, Math.floor((colorInt >> 16) + 255 * amount));
        const g = Math.min(255, Math.floor(((colorInt >> 8) & 0x00FF) + 255 * amount));
        const b = Math.min(255, Math.floor((colorInt & 0x0000FF) + 255 * amount));
        
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
}

export default MapManager;
