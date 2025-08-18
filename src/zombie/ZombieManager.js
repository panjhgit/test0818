/**
 * 僵尸管理器
 * 负责僵尸的生成、管理和AI协调
 */
import Zombie from './Zombie.js';

class ZombieManager {
    constructor() {
        this.zombies = [];
        this.spawnRules = {
            large: { probability: 0.1, count: [5, 8], type: 'normal' },
            small: { probability: 0.2, count: [1, 2], type: 'normal' },
            medium: { probability: 0.7, count: [3, 4], type: 'normal' }
        };
        this.isDay = true;
        this.lastSpawnTime = 0;
        this.spawnCooldown = 2000; // 2秒生成冷却
        
        console.log('[ZombieManager] 僵尸管理器已初始化');
    }
    
    /**
     * 更新所有僵尸
     */
    update(deltaTime) {
        // 更新现有僵尸
        this.zombies.forEach(zombie => {
            if (zombie.isAlive()) {
                zombie.update(deltaTime);
            }
        });
        
        // 移除死亡的僵尸
        this.zombies = this.zombies.filter(zombie => zombie.isAlive());
        
        // 处理僵尸生成（在子地图中）
        this.handleSpawning(deltaTime);
    }
    
    /**
     * 处理僵尸生成
     */
    handleSpawning(deltaTime) {
        const currentTime = Date.now();
        
        // 只在子地图中生成僵尸
        if (this.currentMapType === 'main') return;
        
        // 检查生成冷却
        if (currentTime - this.lastSpawnTime < this.spawnCooldown) return;
        
        // 根据昼夜调整生成速度
        const spawnRate = this.isDay ? 1 : 2; // 白天1只/秒，夜晚2只/秒
        
        // 计算生成概率
        const shouldSpawn = Math.random() < (spawnRate * deltaTime / 1000);
        
        if (shouldSpawn && this.zombies.length < 10) { // 最多10只僵尸
            this.spawnZombie();
            this.lastSpawnTime = currentTime;
        }
    }
    
    /**
     * 根据规则生成僵尸群
     */
    generateZombieGroup(mapBounds) {
        this.clearAllZombies();
        
        // 随机选择生成规模
        const random = Math.random();
        let spawnRule;
        
        if (random < this.spawnRules.large.probability) {
            spawnRule = this.spawnRules.large;
        } else if (random < this.spawnRules.large.probability + this.spawnRules.small.probability) {
            spawnRule = this.spawnRules.small;
        } else {
            spawnRule = this.spawnRules.medium;
        }
        
        // 生成僵尸数量
        const count = Math.floor(Math.random() * (spawnRule.count[1] - spawnRule.count[0] + 1)) + spawnRule.count[0];
        
        console.log(`[ZombieManager] 生成僵尸群: ${count}只 ${spawnRule.type}僵尸`);
        
        // 生成僵尸
        for (let i = 0; i < count; i++) {
            this.createZombie(spawnRule.type, mapBounds);
        }
        
        // 播放生成音效
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('zombies_spawned', {
            count: count,
            type: spawnRule.type
        });
    }
    
    /**
     * 生成单个僵尸
     */
    spawnZombie() {
        // 在地图边缘生成
        const mapBounds = this.getCurrentMapBounds();
        this.createZombie('normal', mapBounds);
    }
    
    /**
     * 创建僵尸
     */
    createZombie(type, mapBounds) {
        let spawnPosition;
        
        // 根据生成规模确定位置
        if (this.zombies.length === 0) {
            // 第一批僵尸，根据规则分布
            spawnPosition = this.getSpawnPositionByRule(mapBounds);
        } else {
            // 后续生成的僵尸，在边缘生成
            spawnPosition = this.getEdgeSpawnPosition(mapBounds);
        }
        
        const zombie = new Zombie({
            x: spawnPosition.x,
            y: spawnPosition.y,
            zombieType: type,
            maxHealth: type === 'elite' ? 30 : 15,
            attack: this.isDay ? (type === 'elite' ? 10 : 5) : (type === 'elite' ? 20 : 10),
            moveSpeed: this.isDay ? (type === 'elite' ? 2.5 : 2) : (type === 'elite' ? 4 : 4),
            detectionRange: type === 'elite' ? 80 : 60
        });
        
        zombie.setDayNight(this.isDay);
        this.zombies.push(zombie);
        
        console.log(`[ZombieManager] 创建僵尸: ${type} 在 (${spawnPosition.x}, ${spawnPosition.y})`);
    }
    
    /**
     * 根据规则获取生成位置
     */
    getSpawnPositionByRule(mapBounds) {
        const rule = Math.random();
        
        if (rule < 0.1) {
            // 10% - 大量僵尸，边缘均匀分布
            return this.getEdgeSpawnPosition(mapBounds);
        } else if (rule < 0.3) {
            // 20% - 少量僵尸，入口附近
            return {
                x: mapBounds.left + 80 + Math.random() * 40,
                y: mapBounds.bottom - 50 + Math.random() * 30
            };
        } else {
            // 70% - 适量僵尸，资源点周围
            return this.getResourceAreaSpawnPosition(mapBounds);
        }
    }
    
    /**
     * 获取边缘生成位置
     */
    getEdgeSpawnPosition(mapBounds) {
        const edge = Math.floor(Math.random() * 4); // 0:上, 1:右, 2:下, 3:左
        
        switch (edge) {
            case 0: // 上边缘
                return {
                    x: mapBounds.left + Math.random() * (mapBounds.right - mapBounds.left),
                    y: mapBounds.top + 10
                };
            case 1: // 右边缘
                return {
                    x: mapBounds.right - 10,
                    y: mapBounds.top + Math.random() * (mapBounds.bottom - mapBounds.top)
                };
            case 2: // 下边缘
                return {
                    x: mapBounds.left + Math.random() * (mapBounds.right - mapBounds.left),
                    y: mapBounds.bottom - 10
                };
            case 3: // 左边缘
                return {
                    x: mapBounds.left + 10,
                    y: mapBounds.top + Math.random() * (mapBounds.bottom - mapBounds.top)
                };
        }
    }
    
    /**
     * 获取资源区域生成位置
     */
    getResourceAreaSpawnPosition(mapBounds) {
        // 在地图中心区域的资源点周围100px范围内生成
        const centerX = (mapBounds.left + mapBounds.right) / 2;
        const centerY = (mapBounds.top + mapBounds.bottom) / 2;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50; // 50-100px范围
        
        return {
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance
        };
    }
    
    /**
     * 获取当前地图边界
     */
    getCurrentMapBounds() {
        // 默认子地图边界
        return {
            left: 50,
            right: 350,
            top: 100,
            bottom: 300
        };
    }
    
    /**
     * 设置当前地图类型
     */
    setCurrentMapType(mapType) {
        this.currentMapType = mapType;
    }
    
    /**
     * 设置昼夜状态
     */
    setDayNight(isDay) {
        this.isDay = isDay;
        
        // 更新所有僵尸的昼夜状态
        this.zombies.forEach(zombie => {
            zombie.setDayNight(isDay);
        });
        
        console.log(`[ZombieManager] 昼夜状态更新: ${isDay ? '白天' : '夜晚'}`);
    }
    
    /**
     * 处理僵尸检测请求
     */
    handleZombieDetection(zombieDetectData) {
        const { zombie, position, range } = zombieDetectData;
        
        // 获取场景中的所有可攻击目标
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('get_attackable_targets', {
            requester: zombie,
            position: position,
            range: range,
            callback: (targets) => {
                if (targets.length > 0) {
                    // 选择最近的目标
                    let nearestTarget = null;
                    let nearestDistance = Infinity;
                    
                    targets.forEach(target => {
                        const distance = zombie.getDistanceTo(target);
                        if (distance < nearestDistance) {
                            nearestDistance = distance;
                            nearestTarget = target;
                        }
                    });
                    
                    if (nearestTarget) {
                        zombie.detectTarget(nearestTarget);
                    }
                }
            }
        });
    }
    
    /**
     * 获取所有僵尸
     */
    getAllZombies() {
        return [...this.zombies];
    }
    
    /**
     * 清除所有僵尸
     */
    clearAllZombies() {
        this.zombies = [];
        console.log('[ZombieManager] 清除所有僵尸');
    }
    
    /**
     * 获取指定位置范围内的僵尸
     */
    getZombiesInRange(x, y, range) {
        return this.zombies.filter(zombie => {
            const distance = Math.sqrt((zombie.x - x) ** 2 + (zombie.y - y) ** 2);
            return distance <= range && zombie.isAlive();
        });
    }
    
    /**
     * 渲染所有僵尸
     */
    render(ctx) {
        this.zombies.forEach(zombie => {
            if (zombie.isAlive()) {
                zombie.render(ctx);
            }
        });
    }
    
    /**
     * 获取僵尸统计信息
     */
    getStats() {
        return {
            totalZombies: this.zombies.length,
            aliveZombies: this.zombies.filter(z => z.isAlive()).length,
            zombiesByType: {
                normal: this.zombies.filter(z => z.zombieType === 'normal').length,
                elite: this.zombies.filter(z => z.zombieType === 'elite').length,
                mutant: this.zombies.filter(z => z.zombieType === 'mutant').length
            },
            zombiesByState: {
                patrol: this.zombies.filter(z => z.alertState === 'patrol').length,
                alert: this.zombies.filter(z => z.alertState === 'alert').length,
                chase: this.zombies.filter(z => z.alertState === 'chase').length,
                attack: this.zombies.filter(z => z.alertState === 'attack').length
            }
        };
    }
}

export default ZombieManager;
