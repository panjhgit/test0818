// ========================================
// 碰撞检测模块 (Collision Detection Module)
// ========================================

// 引用僵尸模块获取配置
var zombieModule;
try {
    zombieModule = require('./zombie.js');
    console.log('[Collision] 僵尸模块加载成功');
} catch (error) {
    console.error('[Collision] 僵尸模块加载失败:', error);
    // 创建默认配置避免崩溃
    zombieModule = {
        GAME_CONFIG: {
            PLAYER: { CHARACTER_RADIUS: 18, BASE_HEALTH: 50, BASE_ATTACK: 15, ATTACK_RANGE: 35, ATTACK_COOLDOWN: 800, MOVE_SPEED: 3 },
            TEAM: { MAX_SIZE: 20, FOLLOW_DISTANCE: 35, COLLISION_THRESHOLD: 900 },
            BUILDING: { INTERACTION_DISTANCE: 60, TRIGGER_DISTANCE: 50, EXIT_COOLDOWN: 2000 }
        }
    };
}

// 碰撞检测管理器
function CollisionManager() {
    this.debugCounter = 0;
    console.log('[Collision] 碰撞检测管理器初始化完成');
}

// 检查与建筑物的碰撞
CollisionManager.prototype.checkCollisionWithBuildings = function (x, y, characterRadius, buildings) {
    characterRadius = characterRadius || zombieModule.GAME_CONFIG.PLAYER.CHARACTER_RADIUS;
    var bufferDistance = 2;
    var effectiveRadius = characterRadius + bufferDistance;

    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];

        if (this.circleRectCollision(x, y, effectiveRadius, building.x, building.y, building.width, building.height)) {
            var doorInfo = this.calculateDoorInfo(building);
            var originalDoorX = doorInfo.originalX;
            var originalDoorY = doorInfo.originalY;
            var originalDoorWidth = doorInfo.originalWidth;
            var originalDoorHeight = doorInfo.originalHeight;

            var doorEffectiveRadius = characterRadius;

            if (this.circleRectCollision(x, y, doorEffectiveRadius, originalDoorX, originalDoorY, originalDoorWidth, originalDoorHeight)) {
                return {collision: false, building: null, inDoor: true};
            } else {
                return {collision: true, building: building, inDoor: false};
            }
        }
    }

    return {collision: false, building: null, inDoor: false};
};

// 检查角色之间的重叠（允许短时间重叠）
CollisionManager.prototype.checkCharacterOverlap = function (char1, char2, allowOverlap = true) {
    var char1Radius = char1.radius || 18;
    var char2Radius = char2.radius || 18;

    // 使用距离平方避免开方运算，提高性能
    var dx = char1.x - char2.x;
    var dy = char1.y - char2.y;
    var distanceSquared = dx * dx + dy * dy;
    var minDistance = char1Radius + char2Radius;
    var minDistanceSquared = minDistance * minDistance;

    if (allowOverlap) {
        // 允许重叠身体3分之1的像素
        var overlapAllowance = Math.min(char1Radius, char2Radius) / 3;
        var allowedDistanceSquared = (minDistance - overlapAllowance) * (minDistance - overlapAllowance);
        return distanceSquared >= allowedDistanceSquared;
    } else {
        return distanceSquared >= minDistanceSquared;
    }
};

// 圆形与矩形碰撞检测
CollisionManager.prototype.circleRectCollision = function (circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight) {
    var closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    var closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));

    var distanceX = circleX - closestX;
    var distanceY = circleY - closestY;
    var distanceSquared = distanceX * distanceX + distanceY * distanceY;

    return distanceSquared < (circleRadius * circleRadius);
};

// 计算门的信息
CollisionManager.prototype.calculateDoorInfo = function (building) {
    var doorWidth = Math.max(30, Math.floor(building.width / 8));
    var doorHeight = Math.max(40, Math.floor(building.height / 6));
    var doorX = building.x + (building.width - doorWidth) / 2;
    var doorY = building.y + building.height - doorHeight - 5;

    var expandedDoorX = doorX - 20;
    var expandedDoorY = doorY - 20;
    var expandedDoorWidth = doorWidth + 40;
    var expandedDoorHeight = doorHeight + 40;

    return {
        x: expandedDoorX,
        y: expandedDoorY,
        width: expandedDoorWidth,
        height: expandedDoorHeight,
        originalX: doorX,
        originalY: doorY,
        originalWidth: doorWidth,
        originalHeight: doorHeight
    };
};

// 检查是否靠近门
CollisionManager.prototype.checkNearDoor = function (player, buildings, canvas, camera, buildingExitCooldown) {
    var interactionDistance = zombieModule.GAME_CONFIG.BUILDING.INTERACTION_DISTANCE;
    var triggerDistance = zombieModule.GAME_CONFIG.BUILDING.TRIGGER_DISTANCE;

    if (buildingExitCooldown > Date.now()) {
        return { nearBuilding: null, buildingEntryPrompt: null };
    }

    var nearBuilding = null;
    var buildingEntryPrompt = null;

    var viewWidth = canvas.width / camera.zoom;
    var viewHeight = canvas.height / camera.zoom;
    var viewLeft = camera.x;
    var viewRight = camera.x + viewWidth;
    var viewTop = camera.y;
    var viewBottom = camera.y + viewHeight;

    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];

        if (building.x + building.width >= viewLeft && building.x <= viewRight && building.y + building.height >= viewTop && building.y <= viewBottom) {

            var doorInfo = this.calculateDoorInfo(building);
            var doorCenterX = doorInfo.x + doorInfo.width / 2;
            var doorCenterY = doorInfo.y + doorInfo.height / 2;

            var playerDistance = Math.sqrt(Math.pow(player.x - doorCenterX, 2) + Math.pow(player.y - doorCenterY, 2));

            // 调试信息：显示距离
            if (playerDistance <= 100) { // 只显示100像素内的距离
                console.log('[Debug] 建筑物:', building.name, '距离:', playerDistance.toFixed(1), '交互距离:', interactionDistance, '触发距离:', triggerDistance);
            }

            if (playerDistance <= interactionDistance) {
                nearBuilding = building;
                console.log('[Door] 设置nearBuilding:', building.name, 'ID:', building.id, 'Name:', building.name);

                // 当门变色时，就创建弹出提示（复用门变色逻辑）
                buildingEntryPrompt = {
                    building: building,
                    buildingId: building.id || building.name,
                    active: true,
                    message: '是否进入 ' + building.name + '？',
                    options: ['进入', '取消']
                };
                console.log('[Door] 弹出提示已创建（复用门变色逻辑）:', building.name, '距离:', playerDistance);
                break;
            }
        }
    }

    return { nearBuilding: nearBuilding, buildingEntryPrompt: buildingEntryPrompt };
};

// 检查已加载NPC的碰撞（优化版，使用空间分区优化）
CollisionManager.prototype.checkLoadedNPCCollision = function (player, npcs, addPartnerToTeam) {
    if (!player || !npcs || npcs.length === 0) {
        // 添加调试信息
        if (this.debugCounter === undefined) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter >= 120) { // 每2秒输出一次
            console.log('[PartnerCollision] 无法检查碰撞:', {
                player: !!player,
                npcs: !!npcs,
                npcsLength: npcs ? npcs.length : 'undefined',
                playerPosition: player ? {x: player.x, y: player.y} : null
            });
            this.debugCounter = 0;
        }
        return;
    }

    var playerRadius = zombieModule.GAME_CONFIG.PLAYER.CHARACTER_RADIUS;
    var npcRadius = 18; // NPC的碰撞半径
    var collisionDistance = playerRadius + npcRadius;
    var collisionDistanceSquared = collisionDistance * collisionDistance;

    // 使用空间分区优化：只检查玩家附近的NPC
    var playerX = player.x;
    var playerY = player.y;
    var searchRadius = collisionDistance + 50; // 搜索半径稍大于碰撞距离

    // 快速筛选：只检查在搜索半径内的NPC
    var nearbyNPCs = [];
    for (var i = 0; i < npcs.length; i++) {
        var npc = npcs[i];

        // 跳过已经加入团队的伙伴
        if (npc.isFollowing || npc.isJoined) {
            continue;
        }

        // 快速距离检查（使用曼哈顿距离作为预筛选）
        var manhattanDistance = Math.abs(npc.x - playerX) + Math.abs(npc.y - playerY);
        if (manhattanDistance <= searchRadius * 1.5) { // 曼哈顿距离是欧几里得距离的上界
            nearbyNPCs.push(npc);
        }
    }

    // 只对附近的NPC进行精确碰撞检测
    for (var i = nearbyNPCs.length - 1; i >= 0; i--) {
        var npc = nearbyNPCs[i];

        // 精确距离计算
        var dx = playerX - npc.x;
        var dy = playerY - npc.y;
        var distanceSquared = dx * dx + dy * dy;

        // 添加距离调试信息
        if (this.debugCounter === undefined) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter >= 120) { // 每2秒输出一次
            var distance = Math.sqrt(distanceSquared);
            console.log('[PartnerCollision] 检查NPC:', npc.name || npc.id, '距离玩家:', distance.toFixed(1), '碰撞阈值:', collisionDistance);
            this.debugCounter = 0;
        }

        if (distanceSquared <= collisionDistanceSquared) {
            // 玩家碰到了伙伴，触发加入团队
            console.log('[PartnerCollision] 玩家碰到伙伴:', npc.name || npc.id, '触发加入团队');
            if (typeof addPartnerToTeam === 'function') {
                addPartnerToTeam(npc);
            }

            // 立即返回，避免在同一帧处理多个碰撞
            return;
        }
    }
};

// 安全获取跟随者索引的辅助方法
CollisionManager.prototype.getFollowerIndex = function (follower, followers) {
    // 检查跟随者是否有效
    if (!follower || !followers || !Array.isArray(followers)) {
        console.warn('[getFollowerIndex] 跟随者或followers数组无效:', {follower: !!follower, followers: !!followers});
        return -1;
    }

    var index = followers.indexOf(follower);

    // 检查index是否有效
    if (index === -1) {
        console.warn('[getFollowerIndex] 跟随者不在数组中:', follower);
        return -1;
    }

    return index;
};

// 安全移除跟随者的辅助方法
CollisionManager.prototype.safeRemoveFollower = function (follower, followers, recycleFollowerToPool, safeRemoveFollowerByIndex) {
    var index = this.getFollowerIndex(follower, followers);
    if (index === -1) {
        console.warn('[safeRemoveFollower] 无法找到跟随者索引:', follower);
        return false;
    }

    // 验证索引和数组状态
    if (followers && Array.isArray(followers) && index >= 0 && index < followers.length) {
        if (followers[index] === follower) {
            // 在移除前，尝试回收到跟随者对象池
            if (typeof recycleFollowerToPool === 'function') {
                recycleFollowerToPool(follower);
            }

            // 使用安全的移除方法
            if (typeof safeRemoveFollowerByIndex === 'function') {
                return safeRemoveFollowerByIndex(index);
            } else {
                // 如果没有提供安全的移除方法，使用默认的splice
                followers.splice(index, 1);
                return true;
            }
        } else {
            console.warn('[safeRemoveFollower] 索引验证失败，跟随者可能已被移除');
            return false;
        }
    } else {
        console.error('[safeRemoveFollower] 数组状态异常，无法移除跟随者');
        return false;
    }
};

// 检查移动路径是否安全（防止穿墙）
CollisionManager.prototype.canMoveAlongPath = function (fromX, fromY, toX, toY, characterRadius, canMoveToPosition) {
    var margin = characterRadius || zombieModule.GAME_CONFIG.PLAYER.CHARACTER_RADIUS;

    // 计算路径上的多个检查点
    var distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    var checkPoints = Math.max(2, Math.floor(distance / margin));

    for (var i = 0; i <= checkPoints; i++) {
        var t = i / checkPoints;
        var checkX = fromX + (toX - fromX) * t;
        var checkY = fromY + (toY - fromY) * t;

        if (!canMoveToPosition(checkX, checkY, characterRadius)) {
            return false;
        }
    }

    return true;
};

// 验证followers数组状态的辅助方法
CollisionManager.prototype.validateFollowersArray = function (followers) {
    if (!followers) {
        console.error('[validateFollowersArray] followers数组未定义');
        return false;
    }

    if (!Array.isArray(followers)) {
        console.error('[validateFollowersArray] followers不是数组:', typeof followers);
        return false;
    }

    // 检查数组中的无效元素
    var invalidCount = 0;
    for (var i = 0; i < followers.length; i++) {
        if (!followers[i] || typeof followers[i] !== 'object') {
            console.warn('[validateFollowersArray] 发现无效跟随者，索引:', i, '值:', followers[i]);
            invalidCount++;
        }
    }

    if (invalidCount > 0) {
        console.warn('[validateFollowersArray] 发现', invalidCount, '个无效跟随者');
        // 清理无效元素 - 使用安全的批量删除避免索引错乱
        var invalidIndices = [];
        for (var j = 0; j < followers.length; j++) {
            if (!followers[j] || typeof followers[j] !== 'object') {
                invalidIndices.push(j);
            }
        }

        // 从后往前删除，避免索引错乱
        for (var k = invalidIndices.length - 1; k >= 0; k--) {
            var indexToRemove = invalidIndices[k];
            if (indexToRemove >= 0 && indexToRemove < followers.length) {
                followers.splice(indexToRemove, 1);
            }
        }
        console.log('[validateFollowersArray] 清理后跟随者数量:', followers.length);
    }

    return true;
};

// 跟随者对象池管理
CollisionManager.prototype.followerPool = [];
CollisionManager.prototype.maxFollowerPoolSize = 50;

// 初始化跟随者对象池（优化版）
CollisionManager.prototype.initializeFollowerPool = function () {
    if (this.followerPool.length > 0) {
        console.log('[FollowerPool] 对象池已存在，跳过初始化');
        return;
    }

    console.log('[FollowerPool] 开始初始化跟随者对象池，目标大小:', this.maxFollowerPoolSize);

    // 预创建一些跟随者对象，使用对象工厂避免重复代码
    var initialPoolSize = Math.min(20, this.maxFollowerPoolSize);
    for (var i = 0; i < initialPoolSize; i++) {
        var follower = this.createPooledFollower(i);
        this.followerPool.push(follower);
    }

    console.log('[FollowerPool] 跟随者对象池初始化完成，当前大小:', this.followerPool.length);
};

// 创建池化跟随者对象（对象工厂模式）
CollisionManager.prototype.createPooledFollower = function (index) {
    return {
        id: 'pool_' + index,
        characterId: 2, // 默认角色ID
        x: 0,
        y: 0,
        health: 30,
        maxHealth: 30,
        attack: 10,
        attackRange: 25,
        attackCooldown: 1000,
        lastAttackTime: 0,
        isDead: false,
        isZombie: false,
        isUnstucking: false,
        unstuckTargetX: null,
        unstuckTargetY: null,
        unstuckStartTime: null,
        lastMoveTime: null,
        lastX: null,
        lastY: null,
        lastFollowUpdate: null,
        isWalking: false,
        direction: 'down',
        walkAnimationFrame: 0,
        lastAnimationTime: null,
        smoothForceX: 0,
        smoothForceY: 0,
        quadTreeInserted: false, // 池化对象标记
        isPooled: true,
        poolIndex: index
    };
};

// 回收跟随者到对象池
CollisionManager.prototype.recycleFollowerToPool = function (follower) {
    if (!follower || typeof follower !== 'object') {
        console.warn('[FollowerPool] 无效的跟随者对象，跳过回收:', follower);
        return false;
    }

    if (this.followerPool.length >= this.maxFollowerPoolSize) {
        console.log('[FollowerPool] 对象池已满，跳过回收');
        return false;
    }

    try {
        // 重置跟随者状态
        follower.x = 0;
        follower.y = 0;
        follower.health = 30;
        follower.maxHealth = 30;
        follower.isDead = false;
        follower.isZombie = false;
        follower.isUnstucking = false;
        follower.unstuckTargetX = null;
        follower.unstuckTargetY = null;
        follower.unstuckStartTime = null;
        follower.lastMoveTime = null;
        follower.lastX = null;
        follower.lastY = null;
        follower.lastFollowUpdate = null;
        follower.isWalking = false;
        follower.direction = 'down';
        follower.walkAnimationFrame = 0;
        follower.lastAnimationTime = null;
        follower.smoothForceX = 0;
        follower.smoothForceY = 0;
        follower.quadTreeInserted = false;

        // 添加到对象池
        this.followerPool.push(follower);
        console.log('[FollowerPool] 跟随者回收成功，当前池大小:', this.followerPool.length);
        return true;
    } catch (error) {
        console.error('[FollowerPool] 回收跟随者时出错:', error);
        return false;
    }
};

// 通过索引安全移除跟随者
CollisionManager.prototype.safeRemoveFollowerByIndex = function (index, followers, gameData) {
    if (!followers || !Array.isArray(followers)) {
        console.error('[safeRemoveFollowerByIndex] followers数组无效');
        return false;
    }

    if (index < 0 || index >= followers.length) {
        console.error('[safeRemoveFollowerByIndex] 索引超出范围:', index, '数组长度:', followers.length);
        return false;
    }

    try {
        // 验证索引对应的对象
        var follower = followers[index];
        if (!follower) {
            console.error('[safeRemoveFollowerByIndex] 索引对应的跟随者无效:', index);
            return false;
        }

        // 安全移除
        followers.splice(index, 1);
        if (gameData) {
            gameData.teamSize = followers.length + 1;
        }
        console.log('[safeRemoveFollowerByIndex] 跟随者移除成功，当前团队人数:', gameData ? gameData.teamSize : '未知');
        return true;
    } catch (error) {
        console.error('[safeRemoveFollowerByIndex] 移除跟随者时出错:', error);
        return false;
    }
};

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CollisionManager: CollisionManager
    };
}