/**
 * 敌人基类 - 定义所有敌人的通用接口和行为
 */
function BaseEnemy(config) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.type = config.type || 'zombie_normal';
    this.x = config.x || 0;
    this.y = config.y || 0;
    
    // 基础属性
    this.health = config.health || 15;
    this.maxHealth = config.maxHealth || this.health;
    this.attack = config.attack || 5;
    this.moveSpeed = config.moveSpeed || 2;
    this.detectionRange = config.detectionRange || 60;
    
    // 状态
    this.alive = true;
    this.state = 'patrol'; // patrol, alert, chase, attack
    this.target = null;
    this.lastAttackTime = 0;
    this.attackCooldown = 1000;
    
    // AI参数
    this.patrolCenter = { x: this.x, y: this.y };
    this.patrolRadius = config.patrolRadius || 50;
    this.alertTime = 0;
    this.chaseTimeout = 5000; // 5秒后停止追击
    this.lastChaseTime = 0;
    
    console.log('[BaseEnemy] 敌人创建:', this.type, 'at', this.x, this.y);
}

/**
 * 更新敌人状态
 */
BaseEnemy.prototype.update = function(deltaTime, targets) {
    if (!this.alive) return;
    
    this.updateAI(deltaTime, targets);
    this.updateCombat(deltaTime);
};

/**
 * 更新AI逻辑
 */
BaseEnemy.prototype.updateAI = function(deltaTime, targets) {
    switch (this.state) {
        case 'patrol':
            this.updatePatrol(deltaTime);
            this.detectTargets(targets);
            break;
        case 'alert':
            this.updateAlert(deltaTime);
            break;
        case 'chase':
            this.updateChase(deltaTime, targets);
            break;
        case 'attack':
            this.updateAttack(deltaTime);
            break;
    }
};

/**
 * 巡逻状态
 */
BaseEnemy.prototype.updatePatrol = function(deltaTime) {
    // 简单的随机巡逻
    if (Math.random() < 0.02) { // 2%概率改变方向
        var angle = Math.random() * Math.PI * 2;
        var distance = Math.random() * this.patrolRadius;
        
        var newX = this.patrolCenter.x + Math.cos(angle) * distance;
        var newY = this.patrolCenter.y + Math.sin(angle) * distance;
        
        this.moveTowards(newX, newY, deltaTime * 0.5); // 慢速巡逻
    }
};

/**
 * 检测目标
 */
BaseEnemy.prototype.detectTargets = function(targets) {
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        var distance = this.getDistanceTo(target);
        
        if (distance <= this.detectionRange) {
            this.target = target;
            this.state = 'alert';
            this.alertTime = 0;
            console.log('[BaseEnemy] 敌人发现目标:', this.type);
            break;
        }
    }
};

/**
 * 警戒状态
 */
BaseEnemy.prototype.updateAlert = function(deltaTime) {
    this.alertTime += deltaTime;
    
    if (this.alertTime >= 1000) { // 1秒警戒后开始追击
        if (this.target) {
            this.state = 'chase';
            this.lastChaseTime = Date.now();
        } else {
            this.state = 'patrol';
        }
    }
};

/**
 * 追击状态
 */
BaseEnemy.prototype.updateChase = function(deltaTime, targets) {
    if (!this.target || Date.now() - this.lastChaseTime > this.chaseTimeout) {
        this.state = 'patrol';
        this.target = null;
        return;
    }
    
    var distance = this.getDistanceTo(this.target);
    
    if (distance <= 30) {
        this.state = 'attack';
    } else if (distance <= this.detectionRange * 1.5) {
        this.moveTowards(this.target.x, this.target.y, deltaTime);
    } else {
        // 目标太远，停止追击
        this.state = 'patrol';
        this.target = null;
    }
};

/**
 * 攻击状态
 */
BaseEnemy.prototype.updateAttack = function(deltaTime) {
    if (!this.target) {
        this.state = 'patrol';
        return;
    }
    
    var distance = this.getDistanceTo(this.target);
    
    if (distance > 30) {
        this.state = 'chase';
        return;
    }
    
    // 执行攻击
    var currentTime = Date.now();
    if (currentTime - this.lastAttackTime >= this.attackCooldown) {
        this.performAttack();
        this.lastAttackTime = currentTime;
    }
};

/**
 * 更新战斗
 */
BaseEnemy.prototype.updateCombat = function(deltaTime) {
    // 战斗相关的更新逻辑
};

/**
 * 向目标位置移动
 */
BaseEnemy.prototype.moveTowards = function(targetX, targetY, deltaTime) {
    var dx = targetX - this.x;
    var dy = targetY - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        var moveDistance = this.moveSpeed * (deltaTime / 1000);
        this.x += (dx / distance) * moveDistance;
        this.y += (dy / distance) * moveDistance;
    }
};

/**
 * 执行攻击
 */
BaseEnemy.prototype.performAttack = function() {
    if (!this.target) return;
    
    var damage = this.calculateDamage();
    console.log('[BaseEnemy] 敌人攻击:', this.type, '造成伤害:', damage);
    
    // 发布攻击事件
    eventBus.emit('enemy_attack', {
        attacker: this,
        target: this.target,
        damage: damage
    });
};

/**
 * 计算伤害
 */
BaseEnemy.prototype.calculateDamage = function() {
    var baseDamage = this.attack;
    var randomFactor = 0.8 + Math.random() * 0.4; // 80%-120%
    return Math.floor(baseDamage * randomFactor);
};

/**
 * 受到伤害
 */
BaseEnemy.prototype.takeDamage = function(damage, attacker) {
    this.health -= damage;
    
    if (this.health <= 0) {
        this.health = 0;
        this.die(attacker);
    }
    
    console.log('[BaseEnemy] 敌人受伤:', this.type, '剩余血量:', this.health);
};

/**
 * 死亡处理
 */
BaseEnemy.prototype.die = function(killer) {
    this.alive = false;
    this.state = 'dead';
    
    console.log('[BaseEnemy] 敌人死亡:', this.type);
    
    // 发布死亡事件
    eventBus.emit('enemy_death', {
        enemy: this,
        killer: killer
    });
    
    // 掉落物品
    this.dropLoot();
};

/**
 * 掉落战利品
 */
BaseEnemy.prototype.dropLoot = function() {
    var dropChance = this.type === 'zombie_elite' ? 0.3 : 0.1;
    
    if (Math.random() < dropChance) {
        var lootTypes = ['food', 'health_pack'];
        var lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
        
        eventBus.emit('loot_dropped', {
            type: lootType,
            position: { x: this.x, y: this.y },
            amount: 1
        });
    }
};

/**
 * 获取到目标的距离
 */
BaseEnemy.prototype.getDistanceTo = function(target) {
    return Math.sqrt(
        Math.pow(this.x - target.x, 2) + 
        Math.pow(this.y - target.y, 2)
    );
};

/**
 * 渲染敌人
 */
BaseEnemy.prototype.render = function(ctx) {
    if (!this.alive) return;
    
    this.renderBody(ctx);
    this.renderHealthBar(ctx);
    this.renderStateIndicator(ctx);
};

/**
 * 渲染敌人身体 - 子类可重写
 */
BaseEnemy.prototype.renderBody = function(ctx) {
    // 基础僵尸渲染
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    ctx.fillStyle = '#a00000';
    ctx.fillRect(this.x - 6, this.y - 6, 12, 12);
};

/**
 * 渲染血条
 */
BaseEnemy.prototype.renderHealthBar = function(ctx) {
    if (this.health >= this.maxHealth) return;
    
    var barWidth = 16;
    var barHeight = 3;
    var healthPercent = this.health / this.maxHealth;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.x - barWidth / 2, this.y - 15, barWidth, barHeight);
    
    ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : '#e74c3c';
    ctx.fillRect(this.x - barWidth / 2, this.y - 15, barWidth * healthPercent, barHeight);
};

/**
 * 渲染状态指示器
 */
BaseEnemy.prototype.renderStateIndicator = function(ctx) {
    if (this.state === 'alert' || this.state === 'chase') {
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
};

/**
 * 获取敌人状态
 */
BaseEnemy.prototype.getStatus = function() {
    return {
        id: this.id,
        type: this.type,
        position: { x: this.x, y: this.y },
        health: this.health,
        maxHealth: this.maxHealth,
        alive: this.alive,
        state: this.state,
        hasTarget: !!this.target
    };
};
