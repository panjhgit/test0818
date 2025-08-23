// ========================================
// 僵尸系统 (Zombie System)
// ========================================

// 游戏平衡配置
var GAME_CONFIG = {
    // 僵尸生成配置
    ZOMBIE_SPAWN: {
        BASE_COUNT: 10,
        PER_DAY_INCREASE: 3,
        MAX_ZOMBIES: 50,
        SPAWN_RADIUS: 2000,
        MIN_DISTANCE: 300,
        MAX_ATTEMPTS_MULTIPLIER: 10
    },

    // 玩家配置
    PLAYER: {
        BASE_HEALTH: 50, BASE_ATTACK: 15, ATTACK_RANGE: 35, ATTACK_COOLDOWN: 800, MOVE_SPEED: 3, CHARACTER_RADIUS: 18
    },

    // 团队配置
    TEAM: {
        MAX_SIZE: 20, FOLLOW_DISTANCE: 35, COLLISION_THRESHOLD: 900
    },

    // 时间配置
    TIME: {
        DAY_DURATION: 30000,     // 30秒
        NIGHT_DURATION: 30000,   // 30秒
        FOOD_COST_PER_DAY: 1
    },

    // 建筑配置
    BUILDING: {
        INTERACTION_DISTANCE: 60, TRIGGER_DISTANCE: 50, EXIT_COOLDOWN: 2000
    }
};

// 基础僵尸类
function BaseZombie(config) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.type = config.type || 'thin';
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.health = config.health || 30;
    this.maxHealth = config.maxHealth || 30;
    this.attack = config.attack || 8;
    this.moveSpeed = config.moveSpeed || 1.5;
    this.detectionRange = config.detectionRange || 800; // 大幅增加检测范围，让僵尸能跟随更远
    this.attackRange = config.attackRange || 25;
    this.size = config.size || 1.2; // 比人物大一点

    // AI状态机
    this.state = 'wandering'; // wandering, aware, chasing, attacking
    this.target = null;
    this.lastAttackTime = 0;
    this.attackCooldown = config.attackCooldown || 1500; // 攻击冷却时间
    this.lastStateChangeTime = Date.now(); // 状态切换时间
    this.aiUpdateTimer = 0; // AI更新计时器

    // 移动相关
    this.lastX = this.x;
    this.lastY = this.y;
    this.isWalking = false;
    this.direction = 'down';
    this.wanderTarget = null;
    this.wanderTimer = 0;

    // 动画相关
    this.walkAnimationFrame = 0;
    this.lastAnimationTime = 0;
    this.walkAnimationSpeed = 300; // 比人物慢一点

    // 对象池相关
    this.active = true;
}

// 重置僵尸状态（用于对象池）
BaseZombie.prototype.reset = function (type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.state = 'wandering';
    this.target = null;
    this.lastAttackTime = 0;
    this.aiUpdateTimer = 0;
    this.wanderTarget = null;
    this.wanderTimer = 0;
    this.isWalking = false;
    this.direction = 'down';
    this.walkAnimationFrame = 0;
    this.lastAnimationTime = 0;

    // 更新配置
    var zombieTypes = this.gameEngine ? this.gameEngine.zombieManager.zombieTypes : {};
    if (zombieTypes[type]) {
        var config = zombieTypes[type];
        this.attack = config.attack;
        this.moveSpeed = config.moveSpeed;
        this.detectionRange = config.detectionRange;
        this.attackCooldown = config.attackCooldown;
        this.size = config.size;
    }
};

BaseZombie.prototype.update = function (deltaTime, gameEngine) {
    // 检查游戏是否已结束，如果是则不进行任何更新
    if (gameEngine && (gameEngine.isGameEnded || gameEngine.gameState === 'gameover' || gameEngine.gameState === 'victory')) {
        return;
    }

    this.gameEngine = gameEngine;
    this.updateAI(deltaTime, gameEngine);
    this.updateAnimation(deltaTime);
    this.updateMovement(deltaTime);
};

BaseZombie.prototype.updateAI = function (deltaTime, gameEngine) {
    // 检查游戏是否已结束，如果是则不进行AI更新
    if (!gameEngine || gameEngine.isGameEnded || gameEngine.gameState === 'gameover' || gameEngine.gameState === 'victory') {
        return;
    }

    // 额外检查：如果僵尸本身无效，则不更新
    if (!this || this.health <= 0 || this.isDead) {
        return;
    }

    if (!this.aiUpdateTimer) this.aiUpdateTimer = 0;
    this.aiUpdateTimer += deltaTime;

    if (this.aiUpdateTimer < 100) return; // 提高AI更新频率
    this.aiUpdateTimer = 0;

    // 检查游戏引擎和玩家对象是否有效
    if (!gameEngine.player || gameEngine.player.health <= 0 || gameEngine.player.isDead) {
        // 如果玩家无效，僵尸应该回到游荡状态
        if (this.state !== 'wandering') {
            this.state = 'wandering';
            this.target = null;
            console.log('[ZombieAI]', this.type, '玩家无效，切换到游荡状态');
        }
        return;
    }

    var currentTime = Date.now();
    var playerDistance = Math.sqrt(Math.pow(this.x - gameEngine.player.x, 2) + Math.pow(this.y - gameEngine.player.y, 2));

    // 状态机核心逻辑
    switch (this.state) {
        case 'wandering':
            this.updateWanderingState(playerDistance, gameEngine, currentTime);
            break;
        case 'aware':
            this.updateAwareState(playerDistance, gameEngine, currentTime);
            break;
        case 'chasing':
            this.updateChasingState(playerDistance, gameEngine, currentTime);
            break;
        case 'attacking':
            this.updateAttackingState(playerDistance, gameEngine, currentTime);
            break;
        default:
            this.state = 'wandering';
            break;
    }
};

// 游荡状态更新
BaseZombie.prototype.updateWanderingState = function (playerDistance, gameEngine, currentTime) {
    // 再次检查玩家对象是否有效
    if (!gameEngine || !gameEngine.player || gameEngine.player.health <= 0 || gameEngine.player.isDead) {
        return;
    }

    // 检测是否有人类进入察觉范围（70%检测范围）
    var awareRange = this.detectionRange * 0.7;
    if (playerDistance <= awareRange && gameEngine.player.health > 0 && !gameEngine.player.isDead) {
        // 游荡→察觉：检测到人类进入察觉范围
        this.state = 'aware';
        this.target = gameEngine.player;
        this.lastStateChangeTime = currentTime;
        console.log('[ZombieAI]', this.type, '从游荡切换到察觉状态，距离:', playerDistance.toFixed(0));
        return;
    }

    // 继续游荡
    this.wander(100); // 固定时间间隔
};

// 察觉状态更新（新增）
BaseZombie.prototype.updateAwareState = function (playerDistance, gameEngine, currentTime) {
    // 检查目标是否仍然有效
    if (!this.target || this.target.health <= 0 || this.target.isDead) {
        // 察觉→游荡：目标无效
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从察觉切换到游荡状态（目标无效）');
        return;
    }

    // 检查是否进入追击范围
    if (playerDistance <= this.detectionRange) {
        // 察觉→追击：进入追击范围
        this.state = 'chasing';
        console.log('[ZombieAI]', this.type, '从察觉切换到追击状态');
        return;
    }

    // 检查是否超出察觉范围
    if (playerDistance > this.detectionRange * 0.8) {
        // 察觉→游荡：超出察觉范围
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从察觉切换到游荡状态（超出察觉范围）');
        return;
    }

    // 察觉状态：缓慢转向玩家方向
    var dx = this.target.x - this.x;
    var dy = this.target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        var dirX = dx / distance;
        var dirY = dy / distance;

        // 缓慢移动（0.3倍速度）
        var slowSpeed = this.moveSpeed * 0.3;
        var newX = this.x + dirX * slowSpeed;
        var newY = this.y + dirY * slowSpeed;

        // 检查移动安全性
        if (this.canZombieMoveTo(newX, newY, this.gameEngine)) {
            this.x = newX;
            this.y = newY;
            this.isWalking = true;
            this.direction = this.getDirectionFromDelta(dirX, dirY);
        }
    }
};

// 追击状态更新
BaseZombie.prototype.updateChasingState = function (playerDistance, gameEngine, currentTime) {
    // 检查目标是否仍然有效
    if (!this.target || this.target.health <= 0 || this.target.isDead) {
        // 追击→游荡：目标无效
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从追击切换到游荡状态（目标无效）');
        return;
    }

    // 检查目标是否超出检测范围（增加追击距离）
    var chaseDistance = this.detectionRange * 1.2; // 追击距离比检测范围多20%
    if (playerDistance > chaseDistance) {
        // 追击→游荡：目标超出追击距离
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从追击切换到游荡状态（目标超出追击距离:', chaseDistance.toFixed(0), '像素）');
        return;
    }

    // 检查是否进入攻击范围
    if (playerDistance <= this.attackRange) {
        // 追击→攻击：与目标距离≤攻击范围
        this.state = 'attacking';
        this.lastStateChangeTime = currentTime;
        console.log('[ZombieAI]', this.type, '从追击切换到攻击状态');
        return;
    }

    // 继续追击
    this.chaseTarget(this.target);
};

// 攻击状态更新
BaseZombie.prototype.updateAttackingState = function (playerDistance, gameEngine, currentTime) {
    // 检查目标是否仍然有效
    if (!this.target || this.target.health <= 0 || this.target.isDead) {
        // 攻击→游荡：目标无效
        this.state = 'wandering';
        this.target = null;
        console.log('[ZombieAI]', this.type, '从攻击切换到游荡状态（目标无效）');
        return;
    }

    // 检查目标是否逃离攻击范围
    if (playerDistance > this.attackRange) {
        var chaseDistance = this.detectionRange * 1.2; // 追击距离比检测范围多20%
        if (playerDistance <= chaseDistance) {
            // 攻击→追击：目标逃离攻击范围但仍在追击距离内
            this.state = 'chasing';
            console.log('[ZombieAI]', this.type, '从攻击切换到追击状态');
        } else {
            // 攻击→游荡：目标超出追击距离
            this.state = 'wandering';
            this.target = null;
            console.log('[ZombieAI]', this.type, '从攻击切换到游荡状态（目标超出追击距离:', chaseDistance.toFixed(0), '像素）');
        }
        return;
    }

    // 执行攻击
    if (currentTime - this.lastAttackTime >= this.attackCooldown) {
        // 再次检查目标是否有效，防止在攻击过程中目标被清空
        if (this.target && this.target.health > 0 && !this.target.isDead) {
            // 在攻击前保存目标的血量，防止攻击后目标变为null导致报错
            var targetHealthBeforeAttack = this.target.health;
            var targetId = this.target.id || 'unknown';

            // 执行攻击

            this.attackTarget(this.target);
            this.lastAttackTime = currentTime;

            // 使用保存的血量值，避免访问可能已变为null的目标
            console.log('[ZombieAI]', this.type, '执行攻击，目标ID:', targetId, '目标血量:', targetHealthBeforeAttack);
        } else {
            // 目标无效，切换到游荡状态
            this.state = 'wandering';
            this.target = null;
            console.log('[ZombieAI]', this.type, '攻击时发现目标无效，切换到游荡状态');
        }
    }
};

BaseZombie.prototype.chaseTarget = function (target) {
    if (!target || target.health <= 0 || target.isDead) {
        // 目标无效，停止追击
        this.state = 'wandering';
        this.target = null;
        return;
    }

    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        var dirX = dx / distance;
        var dirY = dy / distance;

        // 群体追击策略：≥3只僵尸时形成包围
        var nearbyZombies = this.getNearbyZombies(300);
        if (nearbyZombies.length >= 3) {
            var flankingAngle = this.calculateFlankingAngle(target, nearbyZombies);
            if (flankingAngle !== null) {
                // 计算侧翼位置
                var flankX = target.x + Math.cos(flankingAngle) * 150;
                var flankY = target.y + Math.sin(flankingAngle) * 150;

                // 向侧翼位置移动
                var flankDx = flankX - this.x;
                var flankDy = flankY - this.y;
                var flankDistance = Math.sqrt(flankDx * flankDx + flankDy * flankDy);

                if (flankDistance > 0) {
                    dirX = flankDx / flankDistance;
                    dirY = flankDy / flankDistance;
                }
            }
        }

        var newX = this.x + dirX * this.moveSpeed;
        var newY = this.y + dirY * this.moveSpeed;

        // 尝试直接路径移动
        if (this.canZombieMoveAlongPath(this.x, this.y, newX, newY, this.gameEngine)) {
            this.x = newX;
            this.y = newY;
        } else {
            // 如果直接路径被阻挡，使用A*寻路算法
            var path = this.findPathToTarget(target);
            if (path && path.length > 0) {
                // 移动到路径的下一个节点
                var nextNode = path[0];
                var pathDx = nextNode.x - this.x;
                var pathDy = nextNode.y - this.y;
                var pathDistance = Math.sqrt(pathDx * pathDx + pathDy * pathDy);

                if (pathDistance > 0) {
                    var pathDirX = pathDx / pathDistance;
                    var pathDirY = pathDy / pathDistance;
                    var moveX = this.x + pathDirX * this.moveSpeed;
                    var moveY = this.y + pathDirY * this.moveSpeed;

                    if (this.canZombieMoveTo(moveX, moveY, this.gameEngine)) {
                        this.x = moveX;
                        this.y = moveY;
                    }
                }
            } else {
                // 如果A*寻路失败，尝试单轴移动
                var canMoveX = this.canZombieMoveAlongPath(this.x, this.y, newX, this.y, this.gameEngine);
                var canMoveY = this.canZombieMoveAlongPath(this.x, this.y, this.x, newY, this.gameEngine);

                if (canMoveX) {
                    this.x = newX;
                } else if (canMoveY) {
                    this.y = newY;
                }
            }
        }

        this.isWalking = true;
        this.direction = this.getDirectionFromDelta(dirX, dirY);
    }
};

// 获取附近僵尸
BaseZombie.prototype.getNearbyZombies = function (radius) {
    var nearby = [];
    if (!this.gameEngine || !this.gameEngine.zombieManager) return nearby;

    for (var i = 0; i < this.gameEngine.zombieManager.zombies.length; i++) {
        var zombie = this.gameEngine.zombieManager.zombies[i];
        if (zombie !== this && zombie.active) {
            var distance = Math.sqrt(Math.pow(this.x - zombie.x, 2) + Math.pow(this.y - zombie.y, 2));
            if (distance <= radius) {
                nearby.push(zombie);
            }
        }
    }
    return nearby;
};

// 计算侧翼角度
BaseZombie.prototype.calculateFlankingAngle = function (target, nearbyZombies) {
    if (!target || nearbyZombies.length === 0) return null;

    // 计算僵尸群的平均位置
    var avgX = 0, avgY = 0;
    for (var i = 0; i < nearbyZombies.length; i++) {
        avgX += nearbyZombies[i].x;
        avgY += nearbyZombies[i].y;
    }
    avgX /= nearbyZombies.length;
    avgY /= nearbyZombies.length;

    // 计算从目标到僵尸群的方向
    var dx = avgX - target.x;
    var dy = avgY - target.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        // 返回相反方向（侧翼位置）
        return Math.atan2(-dy, -dx);
    }

    return null;
};

// A*寻路算法：寻找从当前位置到目标的最短路径
BaseZombie.prototype.findPathToTarget = function (target) {
    if (!this.gameEngine || !target) return null;

    var startX = Math.floor(this.x / 50) * 50; // 网格化坐标
    var startY = Math.floor(this.y / 50) * 50;
    var endX = Math.floor(target.x / 50) * 50;
    var endY = Math.floor(target.y / 50) * 50;

    // 简单的A*实现，适用于小范围寻路
    var openList = [{x: startX, y: startY, g: 0, h: 0, f: 0, parent: null}];
    var closedList = [];
    var maxIterations = 100; // 防止无限循环

    while (openList.length > 0 && maxIterations > 0) {
        maxIterations--;

        // 找到f值最小的节点
        var currentNode = openList[0];
        var currentIndex = 0;
        for (var i = 1; i < openList.length; i++) {
            if (openList[i].f < currentNode.f) {
                currentNode = openList[i];
                currentIndex = i;
            }
        }

        // 从开放列表中移除当前节点
        openList.splice(currentIndex, 1);
        closedList.push(currentNode);

        // 检查是否到达目标
        if (currentNode.x === endX && currentNode.y === endY) {
            // 构建路径
            var path = [];
            var current = currentNode;
            while (current) {
                path.unshift({x: current.x, y: current.y});
                current = current.parent;
            }
            return path;
        }

        // 检查相邻节点
        var neighbors = this.getNeighborNodes(currentNode);
        for (var j = 0; j < neighbors.length; j++) {
            var neighbor = neighbors[j];

            // 检查是否已在关闭列表中
            var inClosedList = false;
            for (var k = 0; k < closedList.length; k++) {
                if (closedList[k].x === neighbor.x && closedList[k].y === neighbor.y) {
                    inClosedList = true;
                    break;
                }
            }
            if (inClosedList) continue;

            // 检查节点是否可通行
            if (!this.canZombieMoveTo(neighbor.x, neighbor.y, this.gameEngine)) {
                continue;
            }

            var g = currentNode.g + 50; // 网格距离
            var h = Math.sqrt(Math.pow(neighbor.x - endX, 2) + Math.pow(neighbor.y - endY, 2));
            var f = g + h;

            // 检查是否已在开放列表中
            var inOpenList = false;
            for (var l = 0; l < openList.length; l++) {
                if (openList[l].x === neighbor.x && openList[l].y === neighbor.y) {
                    if (g < openList[l].g) {
                        openList[l].g = g;
                        openList[l].f = f;
                        openList[l].parent = currentNode;
                    }
                    inOpenList = true;
                    break;
                }
            }

            if (!inOpenList) {
                neighbor.g = g;
                neighbor.h = h;
                neighbor.f = f;
                neighbor.parent = currentNode;
                openList.push(neighbor);
            }
        }
    }

    return null; // 未找到路径
};

// 获取相邻节点
BaseZombie.prototype.getNeighborNodes = function (node) {
    var neighbors = [];
    var directions = [{x: 0, y: -50},   // 上
        {x: 50, y: 0},    // 右
        {x: 0, y: 50},    // 下
        {x: -50, y: 0},   // 左
        {x: 50, y: -50},  // 右上
        {x: 50, y: 50},   // 右下
        {x: -50, y: 50},  // 左下
        {x: -50, y: -50}  // 左上
    ];

    for (var i = 0; i < directions.length; i++) {
        var dir = directions[i];
        neighbors.push({
            x: node.x + dir.x, y: node.y + dir.y
        });
    }

    return neighbors;
};

BaseZombie.prototype.canZombieMoveTo = function (x, y, gameEngine) {
    var zombieRadius = 20;
    var mapConfig = gameEngine ? gameEngine.mapConfig : {width: 10000, height: 10000};

    // 检查地图边界
    if (x < zombieRadius || x > mapConfig.width - zombieRadius || y < zombieRadius || y > mapConfig.height - zombieRadius) {
        return false;
    }

    // 检查与建筑物的碰撞
    var buildings = gameEngine ? gameEngine.buildings : [];
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        if (x + zombieRadius >= building.x && x - zombieRadius <= building.x + building.width && y + zombieRadius >= building.y && y - zombieRadius <= building.y + building.height) {
            return false;
        }
    }

    return true;
};

// 新增：僵尸路径安全检查
BaseZombie.prototype.canZombieMoveAlongPath = function (fromX, fromY, toX, toY, gameEngine) {
    var zombieRadius = 20;

    // 计算路径上的多个检查点
    var distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    var checkPoints = Math.max(2, Math.floor(distance / zombieRadius));

    for (var i = 0; i <= checkPoints; i++) {
        var t = i / checkPoints;
        var checkX = fromX + (toX - fromX) * t;
        var checkY = fromY + (toY - fromY) * t;

        if (!this.canZombieMoveTo(checkX, checkY, gameEngine)) {
            return false;
        }
    }

    return true;
};


BaseZombie.prototype.wander = function (deltaTime) {
    // 初始化游荡计时器
    if (!this.wanderTimer) this.wanderTimer = 0;
    if (!this.wanderTarget) this.wanderTarget = null;

    this.wanderTimer -= deltaTime;

    // 每500ms改变方向，实现随机游荡
    if (!this.wanderTarget || this.wanderTimer <= 0) {
        var attempts = 0;
        var maxAttempts = 15; // 增加尝试次数

        while (attempts < maxAttempts) {
            var angle = Math.random() * Math.PI * 2;
            var distance = 80 + Math.random() * 120; // 增加游荡范围
            var targetX = this.x + Math.cos(angle) * distance;
            var targetY = this.y + Math.sin(angle) * distance;

            // 检查目标位置是否可通行
            if (this.canZombieMoveTo(targetX, targetY, this.gameEngine)) {
                this.wanderTarget = {x: targetX, y: targetY};
                break;
            }
            attempts++;
        }

        if (!this.wanderTarget) {
            // 如果找不到合适的目标，在原地小范围移动
            this.wanderTarget = {
                x: this.x + (Math.random() - 0.5) * 60, y: this.y + (Math.random() - 0.5) * 60
            };
        }

        // 游荡时间：2-4秒
        this.wanderTimer = 2000 + Math.random() * 2000;
    }

    // 执行游荡移动
    if (this.wanderTarget) {
        var dx = this.wanderTarget.x - this.x;
        var dy = this.wanderTarget.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) { // 增加到达阈值
            var dirX = dx / distance;
            var dirY = dy / distance;
            var newX = this.x + dirX * this.moveSpeed * 0.6; // 游荡速度稍慢
            var newY = this.y + dirY * this.moveSpeed * 0.6;

            // 使用路径安全检查，防止穿墙
            if (this.canZombieMoveAlongPath(this.x, this.y, newX, newY, this.gameEngine)) {
                this.x = newX;
                this.y = newY;
                this.isWalking = true;
                this.direction = this.getDirectionFromDelta(dirX, dirY);
            } else {
                // 如果路径被阻挡，重新选择游荡目标
                this.wanderTarget = null;
                this.wanderTimer = 0;
                this.isWalking = false;
            }
        } else {
            // 到达目标，停止移动
            this.wanderTarget = null;
            this.isWalking = false;
        }
    }
};

BaseZombie.prototype.attackTarget = function (target) {
    // 强化目标有效性检查
    if (!target || typeof target !== 'object' || target.health === undefined || target.health <= 0) {
        console.warn('[ZombieAI]', this.type, '攻击目标无效:', target);
        this.state = 'wandering';
        this.target = null;
        return;
    }

    try {
        // 保存攻击前的血量，用于安全检查
        var originalHealth = target.health;

        // 执行攻击
        target.health -= this.attack;

        // 确保血量不会变成负数
        if (target.health < 0) {
            target.health = 0;
        }

        console.log('[ZombieAI]', this.type, '攻击成功，目标血量:', originalHealth, '->', target.health);

        if (target.health <= 0) {
            this.onTargetDeath(target);

            // 如果目标是玩家，立即触发游戏结束
            if (target === this.gameEngine.player) {
                console.log('[ZombieAI]', this.type, '玩家被击杀，触发游戏结束');
                this.gameEngine.gameOver('death');
            }
        }
    } catch (error) {
        console.error('[ZombieAI]', this.type, '攻击过程中出错:', error);
        // 攻击出错时，僵尸应该回到游荡状态
        this.state = 'wandering';
        this.target = null;
    }
};

BaseZombie.prototype.onTargetDeath = function (target) {
    try {
        // 安全检查目标对象
        if (target && typeof target === 'object') {
            target.health = 0;
            target.isDead = true;
        }

        // 僵尸状态重置
        this.state = 'wandering';
        this.target = null;

        console.log('[ZombieAI]', this.type, '目标死亡，切换到游荡状态');
    } catch (error) {
        console.error('[ZombieAI]', this.type, '处理目标死亡时出错:', error);
        // 出错时确保僵尸状态正确
        this.state = 'wandering';
        this.target = null;
    }
};

BaseZombie.prototype.takeDamage = function (damage) {
    this.health -= damage;

    if (this.health <= 0) {
        this.health = 0;
        return true;
    }

    return false;
};

BaseZombie.prototype.updateAnimation = function (deltaTime) {
    if (this.isWalking) {
        this.lastAnimationTime += deltaTime;
        if (this.lastAnimationTime >= this.walkAnimationSpeed) {
            this.walkAnimationFrame = (this.walkAnimationFrame + 1) % 4;
            this.lastAnimationTime = 0;
        }
    } else {
        this.walkAnimationFrame = 0;
    }
};

BaseZombie.prototype.updateMovement = function (deltaTime) {
    if (Math.abs(this.x - this.lastX) > 0.1 || Math.abs(this.y - this.lastY) > 0.1) {
        this.isWalking = true;
    } else {
        this.isWalking = false;
    }

    this.lastX = this.x;
    this.lastY = this.y;
};

BaseZombie.prototype.getDirectionFromDelta = function (deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
    } else {
        return deltaY > 0 ? 'down' : 'up';
    }
};

BaseZombie.prototype.render = function (ctx, camera) {
    // 检查参数有效性
    if (!ctx || !camera) {
        console.warn('[BaseZombie] 渲染参数无效:', {ctx: !!ctx, camera: !!camera});
        return;
    }

    // 检查canvas是否有效
    if (!ctx.canvas || !ctx.canvas.width || !ctx.canvas.height) {
        console.warn('[BaseZombie] Canvas无效:', ctx.canvas);
        return;
    }

    // 检查相机属性是否有效
    if (typeof camera.x !== 'number' || typeof camera.y !== 'number' || typeof camera.zoom !== 'number' || isNaN(camera.x) || isNaN(camera.y) || isNaN(camera.zoom) || !isFinite(camera.x) || !isFinite(camera.y) || !isFinite(camera.zoom)) {
        console.warn('[BaseZombie] 相机属性无效:', camera);
        return;
    }

    // 检查僵尸属性是否有效
    if (typeof this.x !== 'number' || typeof this.y !== 'number' || typeof this.size !== 'number' || isNaN(this.x) || isNaN(this.y) || isNaN(this.size) || !isFinite(this.x) || !isFinite(this.y) || !isFinite(this.size)) {
        console.warn('[BaseZombie] 僵尸属性无效:', {x: this.x, y: this.y, size: this.size});
        return;
    }

    try {
        var viewWidth = ctx.canvas.width / camera.zoom;
        var viewHeight = ctx.canvas.height / camera.zoom;
        var viewLeft = camera.x;
        var viewRight = camera.x + viewWidth;
        var viewTop = camera.y;
        var viewBottom = camera.y + viewHeight;

        var margin = 100;
        if (this.x < viewLeft - margin || this.x > viewRight + margin || this.y < viewTop - margin || this.y > viewBottom + margin) {
            return;
        }

        ctx.save();
        var scale = this.size;
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);

        this.renderZombie(ctx);
        this.renderHealthBar(ctx);
        this.renderStateIndicator(ctx);

        ctx.restore();
    } catch (error) {
        console.error('[BaseZombie] 渲染过程中出错:', error);
        // 确保在出错时恢复上下文状态，避免重复调用restore
        if (ctx._saveCount && ctx._saveCount > 0) {
            try {
                ctx.restore();
            } catch (restoreError) {
                console.error('[BaseZombie] 恢复上下文状态失败:', restoreError);
            }
        }
    }
};

BaseZombie.prototype.renderZombie = function (ctx) {
    // 检查上下文是否有效
    if (!ctx || typeof ctx.fillStyle !== 'string' || typeof ctx.fillRect !== 'function') {
        console.warn('[BaseZombie] 渲染上下文无效:', ctx);
        return;
    }

    try {
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(-12, -12, 24, 24);

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-8, -8, 3, 3);
        ctx.fillRect(5, -8, 3, 3);

        ctx.fillStyle = '#000000';
        ctx.fillRect(-4, -2, 8, 2);
    } catch (error) {
        console.error('[BaseZombie] 渲染僵尸主体时出错:', error);
    }
};

BaseZombie.prototype.renderHealthBar = function (ctx) {
    // 检查上下文是否有效
    if (!ctx || typeof ctx.fillStyle !== 'string' || typeof ctx.fillRect !== 'function' || typeof ctx.strokeStyle !== 'string' || typeof ctx.lineWidth !== 'number' || typeof ctx.strokeRect !== 'function') {
        console.warn('[BaseZombie] 血条渲染上下文无效:', ctx);
        return;
    }

    // 检查血量属性是否有效
    if (typeof this.health !== 'number' || typeof this.maxHealth !== 'number' || isNaN(this.health) || isNaN(this.maxHealth) || this.maxHealth <= 0) {
        console.warn('[BaseZombie] 血量属性无效:', {health: this.health, maxHealth: this.maxHealth});
        return;
    }

    try {
        var healthPercentage = Math.max(0, Math.min(1, this.health / this.maxHealth));
        var barWidth = 20;
        var barHeight = 3;

        ctx.fillStyle = '#333333';
        ctx.fillRect(-barWidth / 2, -20, barWidth, barHeight);

        ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : healthPercentage > 0.2 ? '#FF9800' : '#F44336';
        ctx.fillRect(-barWidth / 2, -20, barWidth * healthPercentage, barHeight);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-barWidth / 2, -20, barWidth, barHeight);
    } catch (error) {
        console.error('[BaseZombie] 渲染血条时出错:', error);
    }
};

BaseZombie.prototype.renderStateIndicator = function (ctx) {
    // 检查上下文是否有效
    if (!ctx || typeof ctx.fillStyle !== 'string' || typeof ctx.font !== 'string' || typeof ctx.textAlign !== 'string' || typeof ctx.fillText !== 'function') {
        console.warn('[BaseZombie] 状态指示器渲染上下文无效:', ctx);
        return;
    }

    // 检查状态属性是否有效
    if (typeof this.state !== 'string') {
        console.warn('[BaseZombie] 状态属性无效:', this.state);
        return;
    }

    try {
        var indicator = '';
        var color = '#ffffff';

        switch (this.state) {
            case 'chasing':
                indicator = '!';
                color = '#ff4444';
                break;
            case 'attacking':
                indicator = '⚡';
                color = '#ff0000';
                break;
            case 'wandering':
                indicator = '?';
                color = '#888888';
                break;
            default:
                // 未知状态，不显示指示器
                return;
        }

        if (indicator) {
            ctx.fillStyle = color;
            ctx.font = 'bold 8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(indicator, 0, -25);
        }
    } catch (error) {
        console.error('[BaseZombie] 渲染状态指示器时出错:', error);
    }
};

// 瘦僵尸类
function ThinZombie(config) {
    BaseZombie.call(this, config);
}

ThinZombie.prototype = Object.create(BaseZombie.prototype);
ThinZombie.prototype.constructor = ThinZombie;

ThinZombie.prototype.renderZombie = function (ctx) {
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-8, -15, 16, 30);

    ctx.fillStyle = '#654321';
    ctx.fillRect(-10, -20, 20, 15);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-7, -17, 3, 3);
    ctx.fillRect(4, -17, 3, 3);

    ctx.fillStyle = '#000000';
    ctx.fillRect(-4, -12, 8, 2);

    ctx.fillStyle = '#8b0000';
    ctx.fillRect(-12, -10, 4, 20);
    ctx.fillRect(8, -10, 4, 20);
    ctx.fillRect(-6, 15, 4, 15);
    ctx.fillRect(2, 15, 4, 15);

    ctx.fillStyle = '#444444';
    ctx.fillRect(-6, -5, 12, 8);
    ctx.fillRect(-4, 5, 8, 6);
};

// 胖僵尸类
function FatZombie(config) {
    BaseZombie.call(this, config);
}

FatZombie.prototype = Object.create(BaseZombie.prototype);

// 僵尸Boss1类
function ZombieBoss1(config) {
    BaseZombie.call(this, config);
}

ZombieBoss1.prototype = Object.create(BaseZombie.prototype);


// 僵尸管理器
function ZombieManager() {
    this.zombies = [];
    this.zombieTypes = this.getZombieTypes();
    this.gameEngine = null; // 游戏引擎引用

    // 性能优化：空间分区系统
    this.spatialGrid = {};
    this.gridSize = 200;

    // 性能优化：对象池
    this.zombiePool = [];
    this.maxPoolSize = 100;

    // 性能优化：更新频率控制
    this.updateIntervals = {
        near: 100,    // 近距离僵尸更新频率
        medium: 300,  // 中距离僵尸更新频率
        far: 800      // 远距离僵尸更新频率
    };

    // 初始化对象池
    this.initializePool();
}

ZombieManager.prototype.getZombieTypes = function () {
    return {
        thin: {
            name: '瘦僵尸',
            health: 25,
            attack: 6,
            moveSpeed: 5.0,
            size: 1.1,
            attackCooldown: 1200,
            detectionRange: 600,
            color: '#8b0000'
        }, fat: {
            name: '胖僵尸',
            health: 50,
            attack: 12,
            moveSpeed: 4.5,
            size: 1.4,
            attackCooldown: 2000,
            detectionRange: 700,
            color: '#4a4a4a'
        }, boss1: {
            name: '僵尸Boss1',
            health: 100,
            attack: 20,
            moveSpeed: 6.0,
            size: 1.6,
            attackCooldown: 1000,
            detectionRange: 1000,
            color: '#2d0d0d'
        }
    };
};

// 基于生存天数计算僵尸移动速度倍数
ZombieManager.prototype.getZombieSpeedMultiplier = function (survivalDays) {
    if (survivalDays <= 10) {
        return 1.5; // 1-10天：僵尸速度是人物速度的1.5倍（更快）
    } else if (survivalDays <= 20) {
        return 1.8; // 10-20天：僵尸速度是人物速度的1.8倍
    } else if (survivalDays <= 50) {
        return 2.2; // 20-50天：僵尸速度是人物速度的2.2倍
    } else if (survivalDays <= 70) {
        return 2.6; // 50-70天：僵尸速度是人物速度的2.6倍
    } else {
        return 3.0; // 70-100天：僵尸速度是人物速度的3.0倍
    }
};

// 获取僵尸的实际移动速度（基于生存天数）
ZombieManager.prototype.getZombieActualSpeed = function (baseSpeed, survivalDays) {
    var speedMultiplier = this.getZombieSpeedMultiplier(survivalDays);
    var playerBaseSpeed = GAME_CONFIG.PLAYER.MOVE_SPEED;

    // 僵尸基础速度 + 基于天数的倍数调整
    var baseZombieSpeed = baseSpeed;
    var adjustedSpeed = baseZombieSpeed * speedMultiplier;

    // 确保僵尸速度不会太慢，至少比玩家快20%
    var minSpeed = playerBaseSpeed * 1.2;
    return Math.max(adjustedSpeed, minSpeed);
};

// 更新所有僵尸的移动速度（基于当前生存天数）
ZombieManager.prototype.updateAllZombieSpeeds = function (survivalDays) {
    var speedMultiplier = this.getZombieSpeedMultiplier(survivalDays);

    // 为每个僵尸类型计算正确的速度
    var thinSpeed = this.getZombieActualSpeed(5.0, survivalDays);
    var fatSpeed = this.getZombieActualSpeed(4.5, survivalDays);
    var bossSpeed = this.getZombieActualSpeed(6.0, survivalDays);

    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];

        // 根据僵尸类型设置正确的速度
        switch (zombie.type) {
            case 'thin':
                zombie.moveSpeed = thinSpeed;
                break;
            case 'fat':
                zombie.moveSpeed = fatSpeed;
                break;
            case 'boss1':
                zombie.moveSpeed = bossSpeed;
                break;
            default:
                zombie.moveSpeed = thinSpeed; // 默认使用瘦僵尸速度
        }

        zombie.speedMultiplier = speedMultiplier;
    }

    console.log('[ZombieManager] 僵尸速度已更新，生存天数:', survivalDays, '速度倍数:', speedMultiplier);
    console.log('[ZombieManager] 各类型僵尸速度: 瘦僵尸', thinSpeed, '胖僵尸', fatSpeed, 'Boss僵尸', bossSpeed);

    // 显示速度对比信息
    var playerSpeed = GAME_CONFIG.PLAYER.MOVE_SPEED;
    console.log('[ZombieManager] 速度对比 - 玩家:', playerSpeed, '瘦僵尸:', thinSpeed, '胖僵尸:', fatSpeed, 'Boss僵尸:', bossSpeed);
    console.log('[ZombieManager] 速度倍数 - 瘦僵尸:', (thinSpeed / playerSpeed).toFixed(1), '胖僵尸:', (fatSpeed / playerSpeed).toFixed(1), 'Boss僵尸:', (bossSpeed / playerSpeed).toFixed(1));
};

// 对象池管理
ZombieManager.prototype.initializePool = function () {
    try {
        console.log('[ZombieManager] 初始化僵尸对象池，预创建', this.maxPoolSize, '个实例');

        for (var i = 0; i < this.maxPoolSize; i++) {
            var zombie = this.createZombieInstance();
            if (zombie) {
                zombie.active = false;
                this.zombiePool.push(zombie);
            }
        }

        console.log('[ZombieManager] 对象池初始化完成，实际创建', this.zombiePool.length, '个实例');
    } catch (error) {
        console.error('[ZombieManager] 初始化对象池时出错:', error);
        // 出错时创建空对象池
        this.zombiePool = [];
    }
};

ZombieManager.prototype.createZombieInstance = function () {
    try {
        var zombieTypes = Object.keys(this.zombieTypes);
        if (zombieTypes.length === 0) {
            console.warn('[ZombieManager] 没有可用的僵尸类型');
            return null;
        }

        var randomType = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
        var config = this.zombieTypes[randomType];

        if (!config) {
            console.warn('[ZombieManager] 僵尸配置无效:', randomType);
            return null;
        }

        return new BaseZombie({
            type: randomType,
            health: config.health,
            attack: config.attack,
            moveSpeed: config.moveSpeed,
            size: config.size,
            attackCooldown: config.attackCooldown,
            detectionRange: config.detectionRange,
            color: config.color,
            gameEngine: this.gameEngine
        });
    } catch (error) {
        console.error('[ZombieManager] 创建僵尸实例时出错:', error);
        return null;
    }
};

ZombieManager.prototype.getZombieFromPool = function (type, x, y) {
    // 从对象池中获取僵尸
    for (var i = 0; i < this.zombiePool.length; i++) {
        if (!this.zombiePool[i].active) {
            var zombie = this.zombiePool[i];
            zombie.reset(type, x, y);
            zombie.active = true;
            return zombie;
        }
    }

    // 如果对象池满了，创建新实例
    if (this.zombies.length < this.maxPoolSize) {
        var newZombie = this.createZombieInstance();
        newZombie.reset(type, x, y);
        newZombie.active = true;
        this.zombiePool.push(newZombie);
        return newZombie;
    }

    return null;
};


ZombieManager.prototype.createZombie = function (type, x, y) {
    var zombieType = this.zombieTypes[type];
    if (!zombieType) {
        console.warn('[ZombieManager] 未知的僵尸类型:', type);
        return null;
    }

    // 性能优化：从对象池获取僵尸
    var zombie = this.getZombieFromPool(type);

    if (!zombie) {
        // 获取当前生存天数
        var survivalDays = this.gameEngine ? this.gameEngine.gameData.survivalDays : 1;

        // 计算基于天数的实际移动速度
        var actualMoveSpeed = this.getZombieActualSpeed(zombieType.moveSpeed, survivalDays);

        var config = {
            type: type,
            x: x,
            y: y,
            health: zombieType.health,
            maxHealth: zombieType.health,
            attack: zombieType.attack,
            moveSpeed: actualMoveSpeed, // 使用基于天数的实际速度
            baseMoveSpeed: zombieType.moveSpeed, // 保存基础速度
            speedMultiplier: this.getZombieSpeedMultiplier(survivalDays), // 保存速度倍数
            size: zombieType.size,
            attackCooldown: zombieType.attackCooldown,
            detectionRange: zombieType.detectionRange || 800, // 使用更大的默认检测范围
            state: 'wandering', // 确保初始状态
            isDead: false, // 确保死亡状态
            renderFailed: false // 渲染失败标记
        };

        switch (type) {
            case 'thin':
                zombie = new ThinZombie(config);
                break;
            case 'fat':
                zombie = new FatZombie(config);
                break;
            case 'boss1':
                zombie = new ZombieBoss1(config);
                break;
            default:
                zombie = new BaseZombie(config);
        }
    } else {
        // 获取当前生存天数
        var survivalDays = this.gameEngine ? this.gameEngine.gameData.survivalDays : 1;

        // 更新基于天数的实际移动速度
        var actualMoveSpeed = this.getZombieActualSpeed(zombieType.moveSpeed, survivalDays);

        // 重置僵尸状态
        zombie.x = x;
        zombie.y = y;
        zombie.health = zombieType.health;
        zombie.maxHealth = zombieType.health;
        zombie.moveSpeed = actualMoveSpeed; // 更新移动速度
        zombie.speedMultiplier = this.getZombieSpeedMultiplier(survivalDays); // 更新速度倍数
        zombie.state = 'wandering';
        zombie.target = null;
        zombie.lastAttackTime = 0;
        zombie.isWalking = false;
        zombie.walkAnimationFrame = 0;
        zombie.isDead = false; // 重置死亡状态
        zombie.renderFailed = false; // 重置渲染失败标记
    }

    this.zombies.push(zombie);
    return zombie;
};

ZombieManager.prototype.update = function (deltaTime, gameEngine) {
    // 检查游戏是否已经结束
    if (gameEngine.isGameEnded || gameEngine.gameState === 'gameover' || gameEngine.gameState === 'menu' || gameEngine.gameState === 'victory') {
        return;
    }

    // 检查玩家是否已经死亡
    if (gameEngine.player.health <= 0 && !gameEngine.player.isDead) {
        gameEngine.player.isDead = true;
        gameEngine.gameOver('death');
        return;
    }

    var viewWidth = gameEngine.canvas.width / gameEngine.camera.zoom;
    var viewHeight = gameEngine.canvas.height / gameEngine.camera.zoom;
    var viewLeft = gameEngine.camera.x - 200;
    var viewRight = gameEngine.camera.x + viewWidth + 200;
    var viewTop = gameEngine.camera.y - 200;
    var viewBottom = gameEngine.camera.y + viewHeight + 200;

    // 性能优化：批量处理僵尸死亡
    var deadZombies = [];

    for (var i = this.zombies.length - 1; i >= 0; i--) {
        var zombie = this.zombies[i];

        var inView = (zombie.x >= viewLeft && zombie.x <= viewRight && zombie.y >= viewTop && zombie.y <= viewBottom);
        var isChasing = zombie.state === 'chasing' || zombie.state === 'attacking';

        if (inView || isChasing) {
            // 强化僵尸有效性检查
            if (!zombie || typeof zombie !== 'object' || zombie.health <= 0 || zombie.isDead) {
                deadZombies.push(i);
                continue;
            }

            // 额外检查：如果游戏已经结束，僵尸应该停止所有活动
            if (gameEngine.isGameEnded || gameEngine.gameState === 'gameover' || gameEngine.gameState === 'victory') {
                // 强制僵尸回到游荡状态
                if (zombie.state !== 'wandering') {
                    zombie.state = 'wandering';
                    zombie.target = null;
                }
                continue;
            }

            // 性能优化：动态更新频率
            var distanceToPlayer = Math.sqrt(Math.pow(zombie.x - gameEngine.player.x, 2) + Math.pow(zombie.y - gameEngine.player.y, 2));
            var updateInterval = distanceToPlayer < 300 ? this.updateIntervals.near : distanceToPlayer < 800 ? this.updateIntervals.medium : this.updateIntervals.far;

            if (!zombie.lastUpdateTime) zombie.lastUpdateTime = 0;
            if (Date.now() - zombie.lastUpdateTime >= updateInterval) {
                try {
                    zombie.update(deltaTime, gameEngine);
                    zombie.lastUpdateTime = Date.now();
                } catch (error) {
                    console.error('[ZombieManager] 僵尸更新出错:', error, '僵尸:', zombie);
                    // 如果僵尸更新出错，将其标记为死亡
                    zombie.health = 0;
                    zombie.isDead = true;
                    deadZombies.push(i);
                }
            }
        }

        if (zombie.health <= 0) {
            deadZombies.push(i);
            gameEngine.gameData.zombieKills++;
        }
    }

    // 性能优化：批量删除死亡僵尸
    // 使用安全的批量删除方法，避免索引问题
    if (deadZombies.length > 0) {
        var removedCount = this.safeBatchRemoveZombies(deadZombies);
        if (removedCount !== deadZombies.length) {
            console.warn('[ZombieManager] 批量删除数量不匹配，预期:', deadZombies.length, '实际:', removedCount);
        }
    }

    // 定期清理无效僵尸（每100帧执行一次）
    if (!this.cleanupCounter) this.cleanupCounter = 0;
    this.cleanupCounter++;
    if (this.cleanupCounter >= 100) {
        this.cleanupInvalidZombies();
        this.cleanupCounter = 0;
    }
};

ZombieManager.prototype.render = function (ctx, camera) {
    // 检查参数有效性
    if (!ctx || !camera) {
        console.warn('[ZombieManager] 渲染参数无效:', {ctx: !!ctx, camera: !!camera});
        return;
    }

    // 检查zombies数组是否有效
    if (!this.zombies || !Array.isArray(this.zombies)) {
        console.warn('[ZombieManager] zombies数组无效:', this.zombies);
        return;
    }

    // 渲染每个僵尸，添加完整的对象完整性检查
    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];

        // 检查僵尸对象是否有效
        if (!zombie || typeof zombie !== 'object') {
            console.warn('[ZombieManager] 僵尸对象无效，索引:', i, '值:', zombie);
            continue;
        }

        // 检查僵尸是否已死亡（不应该渲染死亡的僵尸）
        if (zombie.health <= 0 || zombie.isDead) {
            continue;
        }

        // 检查僵尸是否有必要的属性和方法
        if (typeof zombie.x !== 'number' || typeof zombie.y !== 'number' || typeof zombie.render !== 'function') {
            console.warn('[ZombieManager] 僵尸对象缺少必要属性，索引:', i, '僵尸:', zombie);
            continue;
        }

        // 检查僵尸坐标是否有效
        if (isNaN(zombie.x) || isNaN(zombie.y) || !isFinite(zombie.x) || !isFinite(zombie.y)) {
            console.warn('[ZombieManager] 僵尸坐标无效，索引:', i, '坐标:', zombie.x, zombie.y);
            continue;
        }

        // 检查僵尸状态是否有效
        if (typeof zombie.state !== 'string' || !zombie.state) {
            zombie.state = 'wandering'; // 设置默认状态
        }

        // 检查僵尸血量是否有效
        if (typeof zombie.health !== 'number' || typeof zombie.maxHealth !== 'number' || zombie.health <= 0 || zombie.maxHealth <= 0) {
            console.warn('[ZombieManager] 僵尸血量无效，索引:', i, '血量:', zombie.health, '最大血量:', zombie.maxHealth);
            continue;
        }

        // 检查僵尸大小是否有效
        if (typeof zombie.size !== 'number' || zombie.size <= 0 || !isFinite(zombie.size)) {
            zombie.size = 1.0; // 设置默认大小
        }

        try {
            zombie.render(ctx, camera);
        } catch (error) {
            console.error('[ZombieManager] 渲染僵尸时出错，索引:', i, '僵尸:', zombie, '错误:', error);
            // 如果渲染失败，标记僵尸为无效状态
            zombie.renderFailed = true;
        }
    }
};

ZombieManager.prototype.getZombiesInRange = function (x, y, range) {
    // 检查参数有效性
    if (typeof x !== 'number' || typeof y !== 'number' || typeof range !== 'number' || isNaN(x) || isNaN(y) || isNaN(range) || !isFinite(x) || !isFinite(y) || !isFinite(range)) {
        console.warn('[ZombieManager] 参数无效:', {x: x, y: y, range: range});
        return [];
    }

    // 检查zombies数组是否有效
    if (!this.zombies || !Array.isArray(this.zombies)) {
        console.warn('[ZombieManager] zombies数组无效:', this.zombies);
        return [];
    }

    var zombiesInRange = [];

    for (var i = 0; i < this.zombies.length; i++) {
        var zombie = this.zombies[i];

        // 检查僵尸对象是否有效
        if (!zombie || typeof zombie !== 'object') {
            console.warn('[ZombieManager] 僵尸对象无效，索引:', i, '值:', zombie);
            continue;
        }

        // 检查僵尸坐标是否有效
        if (typeof zombie.x !== 'number' || typeof zombie.y !== 'number' || isNaN(zombie.x) || isNaN(zombie.y) || !isFinite(zombie.x) || !isFinite(zombie.y)) {
            console.warn('[ZombieManager] 僵尸坐标无效，索引:', i, '坐标:', zombie.x, zombie.y);
            continue;
        }

        try {
            var distance = Math.sqrt(Math.pow(zombie.x - x, 2) + Math.pow(zombie.y - y, 2));

            if (distance <= range) {
                zombiesInRange.push({zombie: zombie, distance: distance});
            }
        } catch (error) {
            console.error('[ZombieManager] 计算距离时出错，索引:', i, '僵尸:', zombie, '错误:', error);
        }
    }

    return zombiesInRange;
};

// 性能优化：对象池管理方法
ZombieManager.prototype.getZombieFromPool = function (type) {
    for (var i = 0; i < this.zombiePool.length; i++) {
        if (this.zombiePool[i].type === type) {
            return this.zombiePool.splice(i, 1)[0];
        }
    }
    return null;
};

// 安全的批量删除方法，使用对象引用而不是索引
ZombieManager.prototype.safeBatchRemoveZombies = function (deadZombies) {
    if (!deadZombies || deadZombies.length === 0) {
        return 0;
    }

    // 使用通用安全数组操作工具
    var removedCount = SafeArrayOperations.safeBatchRemove(this.zombies, deadZombies, function (zombie) {
        // 从视距裁剪系统中移除死亡僵尸
        if (this.gameEngine && this.gameEngine.viewportCulling) {
            zombie.isDead = true;
            zombie.quadTreeInserted = false;
        }

        // 回收到对象池
        this.recycleZombie(zombie);
    }.bind(this));

    console.log('[ZombieManager] 安全批量删除完成，移除', removedCount, '个死亡僵尸，剩余僵尸数量:', this.zombies.length);
    return removedCount;
};

ZombieManager.prototype.recycleZombie = function (zombie) {
    if (!zombie || typeof zombie !== 'object') {
        console.warn('[ZombieManager] 无效的僵尸对象，跳过回收:', zombie);
        return false;
    }

    if (this.zombiePool.length >= this.maxPoolSize) {
        console.log('[ZombieManager] 僵尸对象池已满，跳过回收');
        return false;
    }

    try {
        // 重置僵尸状态
        zombie.x = 0;
        zombie.y = 0;
        zombie.health = 0;
        zombie.maxHealth = 0;
        zombie.state = 'wandering';
        zombie.target = null;
        zombie.lastAttackTime = 0;
        zombie.isWalking = false;
        zombie.walkAnimationFrame = 0;
        zombie.isDead = false;
        zombie.isConverted = false;
        zombie.originalName = null;
        zombie.quadTreeInserted = false;
        zombie.renderFailed = false; // 重置渲染失败标记
        zombie.aiUpdateTimer = 0; // 重置AI更新计时器
        zombie.lastStateChangeTime = 0; // 重置状态变化时间

        // 添加到对象池
        this.zombiePool.push(zombie);
        console.log('[ZombieManager] 僵尸回收成功，当前池大小:', this.zombiePool.length);
        return true;
    } catch (error) {
        console.error('[ZombieManager] 回收僵尸时出错:', error);
        return false;
    }
};

// 为主地图生成僵尸
ZombieManager.prototype.generateZombiesForMap = function () {
    console.log('[ZombieManager] 开始为主地图生成僵尸');

    // 清空现有僵尸
    this.zombies = [];

    // 获取当前生存天数
    var survivalDays = this.gameEngine ? this.gameEngine.gameData.survivalDays : 1;

    // 计算僵尸数量（基于生存天数）
    var baseCount = GAME_CONFIG.ZOMBIE_SPAWN.BASE_COUNT;
    var additionalCount = Math.floor((survivalDays - 1) * GAME_CONFIG.ZOMBIE_SPAWN.PER_DAY_INCREASE);
    var totalCount = Math.min(baseCount + additionalCount, GAME_CONFIG.ZOMBIE_SPAWN.MAX_ZOMBIES);

    console.log('[ZombieManager] 生存天数:', survivalDays, '基础数量:', baseCount, '额外数量:', additionalCount, '总数量:', totalCount);

    // 生成僵尸
    for (var i = 0; i < totalCount; i++) {
        var zombie = this.generateZombieAtRandomLocation();
        if (zombie) {
            this.zombies.push(zombie);
        }
    }

    console.log('[ZombieManager] 主地图僵尸生成完成，数量:', this.zombies.length);
};

// 在随机位置生成僵尸
ZombieManager.prototype.generateZombieAtRandomLocation = function () {
    if (!this.gameEngine) {
        console.warn('[ZombieManager] 游戏引擎引用无效，无法生成僵尸');
        return null;
    }

    var maxAttempts = GAME_CONFIG.ZOMBIE_SPAWN.MAX_ATTEMPTS_MULTIPLIER * 10;
    var attempt = 0;

    console.log('[ZombieManager] 开始生成僵尸，最大尝试次数:', maxAttempts);

    while (attempt < maxAttempts) {
        attempt++;

        // 随机选择僵尸类型
        var zombieTypes = ['thin', 'fat', 'boss1'];
        var randomType = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];

        // 随机位置（在玩家周围一定范围内）
        var angle = Math.random() * Math.PI * 2;
        var distance = GAME_CONFIG.ZOMBIE_SPAWN.MIN_DISTANCE + Math.random() * (GAME_CONFIG.ZOMBIE_SPAWN.SPAWN_RADIUS - GAME_CONFIG.ZOMBIE_SPAWN.MIN_DISTANCE);
        var x = this.gameEngine.player.x + Math.cos(angle) * distance;
        var y = this.gameEngine.player.y + Math.sin(angle) * distance;

        // 确保位置在地图范围内
        x = Math.max(100, Math.min(this.gameEngine.mapConfig.width - 100, x));
        y = Math.max(100, Math.min(this.gameEngine.mapConfig.height - 100, y));

        // 检查位置是否安全（不与建筑物重叠）
        if (this.isSafeZombieSpawnPosition(x, y)) {
            // 创建僵尸
            var zombie = this.createZombie(randomType, x, y);
            if (zombie) {
                console.log('[ZombieManager] 僵尸生成成功，位置:', {x: x, y: y, type: randomType});
                return zombie;
            }
        } else {
            console.log('[ZombieManager] 位置不安全，重新尝试:', {x: x, y: y});
        }
    }

    console.warn('[ZombieManager] 达到最大尝试次数，僵尸生成失败');
    return null;
};

// 检查僵尸生成位置是否安全（不与建筑物重叠）
ZombieManager.prototype.isSafeZombieSpawnPosition = function (x, y) {
    if (!this.gameEngine || !this.gameEngine.buildings) {
        console.warn('[ZombieManager] 无法检查位置安全性，缺少游戏引擎或建筑物数据');
        return true; // 如果无法检查，默认安全
    }

    var zombieRadius = 20; // 僵尸的碰撞半径
    var safetyMargin = 10; // 额外的安全边距
    var totalRadius = zombieRadius + safetyMargin;

    // 检查是否与任何建筑物重叠
    for (var i = 0; i < this.gameEngine.buildings.length; i++) {
        var building = this.gameEngine.buildings[i];

        if (!building || typeof building.x !== 'number' || typeof building.y !== 'number') {
            continue; // 跳过无效的建筑物数据
        }

        // 计算僵尸中心到建筑物边缘的最短距离
        var closestX = Math.max(building.x, Math.min(x, building.x + building.width));
        var closestY = Math.max(building.y, Math.min(y, building.y + building.height));

        var distanceSquared = Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2);
        var minDistanceSquared = Math.pow(totalRadius, 2);

        // 如果距离小于安全距离，位置不安全
        if (distanceSquared < minDistanceSquared) {
            console.log('[ZombieManager] 位置不安全，与建筑物重叠:', {
                zombiePos: {x: x, y: y}, building: {
                    x: building.x, y: building.y, width: building.width, height: building.height, name: building.name
                }, distance: Math.sqrt(distanceSquared).toFixed(1), minDistance: totalRadius
            });
            return false;
        }
    }

    // 检查是否与玩家太近
    if (this.gameEngine.player) {
        var playerDistanceSquared = Math.pow(x - this.gameEngine.player.x, 2) + Math.pow(y - this.gameEngine.player.y, 2);
        var minPlayerDistanceSquared = Math.pow(GAME_CONFIG.ZOMBIE_SPAWN.MIN_DISTANCE, 2);

        if (playerDistanceSquared < minPlayerDistanceSquared) {
            console.log('[ZombieManager] 位置不安全，与玩家太近:', {
                zombiePos: {x: x, y: y},
                playerPos: {x: this.gameEngine.player.x, y: this.gameEngine.player.y},
                distance: Math.sqrt(playerDistanceSquared).toFixed(1),
                minDistance: GAME_CONFIG.ZOMBIE_SPAWN.MIN_DISTANCE
            });
            return false;
        }
    }

    // 位置安全
    return true;
};

// 模块导出
module.exports = {
    BaseZombie: BaseZombie,
    ThinZombie: ThinZombie,
    FatZombie: FatZombie,
    ZombieBoss1: ZombieBoss1,
    ZombieManager: ZombieManager,
    GAME_CONFIG: GAME_CONFIG
};