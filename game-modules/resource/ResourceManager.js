/**
 * 资源管理器 - 从game.js提取
 * 兼容抖音小程序环境 (ES5)
 */
function ResourceManager() {
    this.resources = [];
}

/**
 * 生成资源
 */
ResourceManager.prototype.generateResources = function(subMapType) {
    var resourceChance = this.getResourceChance(subMapType);
    
    if (Math.random() < resourceChance) {
        var resourceType = this.getResourceType(subMapType);
        var resource = this.createResource(resourceType, subMapType);
        
        if (resource) {
            this.resources.push(resource);
        }
    }
};

/**
 * 获取资源生成概率
 */
ResourceManager.prototype.getResourceChance = function(subMapType) {
    switch (subMapType) {
        case 'police_station':
        case 'hospital':
        case 'restaurant':
            return 0.8;
        case 'shop':
            return 0.6;
        case 'school':
        case 'house':
        case 'villa':
            return 0.7;
        default:
            return 0.3;
    }
};

/**
 * 获取资源类型
 */
ResourceManager.prototype.getResourceType = function(subMapType) {
    switch (subMapType) {
        case 'police_station':
            return 'companion_police';
        case 'hospital':
            return 'companion_nurse';
        case 'restaurant':
            return 'companion_chef';
        case 'shop':
            return Math.random() < 0.5 ? 'weapon' : 'weapon';
        case 'school':
        case 'house':
        case 'villa':
            return 'food';
        default:
            return 'food';
    }
};

/**
 * 创建资源
 */
ResourceManager.prototype.createResource = function(type, subMapType) {
    var resource = {
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 80,
        collected: false
    };
    
    switch (type) {
        case 'companion_police':
            resource.companionData = { name: '警察', type: 'police', health: 20, attack: 25, special: '远程攻击' };
            break;
        case 'companion_nurse':
            resource.companionData = { name: '护士', type: 'nurse', health: 15, attack: 8, special: '群体回血' };
            break;
        case 'companion_chef':
            resource.companionData = { name: '厨师', type: 'chef', health: 15, attack: 8, special: '每日产粮' };
            break;
        case 'food':
            resource.amount = this.getFoodAmount(subMapType);
            break;
        case 'weapon':
            resource.weaponData = { name: '近战武器', damage: 10 };
            break;
    }
    
    return resource;
};

/**
 * 获取食物数量
 */
ResourceManager.prototype.getFoodAmount = function(subMapType) {
    switch (subMapType) {
        case 'school':
            return 3 + Math.floor(Math.random() * 3);
        case 'house':
            return 2 + Math.floor(Math.random() * 2);
        case 'villa':
            return 4 + Math.floor(Math.random() * 3);
        default:
            return 2 + Math.floor(Math.random() * 3);
    }
};

/**
 * 收集资源
 */
ResourceManager.prototype.collectResource = function(resource, gameEngine) {
    if (resource.collected) return;
    
    resource.collected = true;
    
    switch (resource.type) {
        case 'companion_police':
        case 'companion_nurse':
        case 'companion_chef':
            if (gameEngine.companions && gameEngine.companions.length < 7) { // 团队上限8人
                gameEngine.companions.push(resource.companionData);
                if (gameEngine.gameData) {
                    gameEngine.gameData.teamSize++;
                    if (gameEngine.gameData.teamSize > gameEngine.gameData.maxTeamSize) {
                        gameEngine.gameData.maxTeamSize = gameEngine.gameData.teamSize;
                    }
                }
                console.log('[ResourceManager] 新伙伴加入: ' + resource.companionData.name);
            }
            break;
        case 'food':
            if (gameEngine.gameData) {
                gameEngine.gameData.food += resource.amount;
                gameEngine.gameData.totalFood += resource.amount;
            }
            console.log('[ResourceManager] 获得 ' + resource.amount + ' 份口粮');
            break;
        case 'weapon':
            if (gameEngine.player) {
                gameEngine.player.attack = (gameEngine.player.attack || 20) + resource.weaponData.damage;
            }
            console.log('[ResourceManager] 获得武器，攻击力提升');
            break;
    }
};

/**
 * 渲染资源
 */
ResourceManager.prototype.render = function(ctx) {
    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        if (!resource.collected) {
            // 渲染资源图标
            ctx.fillStyle = this.getResourceColor(resource.type);
            ctx.fillRect(resource.x - 6, resource.y - 6, 12, 12);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(resource.x - 4, resource.y - 4, 8, 8);
            
            // 渲染资源类型标识
            ctx.fillStyle = '#000000';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            var symbol = this.getResourceSymbol(resource.type);
            ctx.fillText(symbol, resource.x, resource.y + 2);
        }
    }
};

/**
 * 获取资源颜色
 */
ResourceManager.prototype.getResourceColor = function(type) {
    switch (type) {
        case 'companion_police':
            return '#0066CC';
        case 'companion_nurse':
            return '#CC0066';
        case 'companion_chef':
            return '#CC6600';
        case 'food':
            return '#00CC66';
        case 'weapon':
            return '#CC0000';
        default:
            return '#CCCCCC';
    }
};

/**
 * 获取资源符号
 */
ResourceManager.prototype.getResourceSymbol = function(type) {
    switch (type) {
        case 'companion_police':
            return '👮';
        case 'companion_nurse':
            return '👩‍⚕️';
        case 'companion_chef':
            return '👨‍🍳';
        case 'food':
            return '🍞';
        case 'weapon':
            return '⚔️';
        default:
            return '?';
    }
};

/**
 * 清空资源
 */
ResourceManager.prototype.clearResources = function() {
    this.resources = [];
};

/**
 * 获取指定位置附近的资源
 */
ResourceManager.prototype.getResourcesInRange = function(x, y, range) {
    var resourcesInRange = [];
    
    for (var i = 0; i < this.resources.length; i++) {
        var resource = this.resources[i];
        if (!resource.collected) {
            var distance = Math.sqrt(
                Math.pow(resource.x - x, 2) + 
                Math.pow(resource.y - y, 2)
            );
            
            if (distance <= range) {
                resourcesInRange.push({ resource: resource, distance: distance });
            }
        }
    }
    
    return resourcesInRange;
};
