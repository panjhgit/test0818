/**
 * 游戏配置模块 (config.js)
 * 
 * 功能描述：
 * - 游戏平衡配置：僵尸生成、玩家属性、团队配置等
 * - 视距裁剪系统配置：网格大小、渲染距离、更新频率等
 * - 时间系统配置：昼夜循环、食物消耗等
 * - 建筑交互配置：交互距离、触发距离等
 * 
 * 主要配置对象：
 * - GAME_CONFIG: 游戏核心平衡参数
 * - VIEWPORT_CONFIG: 视距裁剪优化参数
 */

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
        BASE_HEALTH: 50,
        BASE_ATTACK: 15,
        ATTACK_RANGE: 35,
        ATTACK_COOLDOWN: 800,
        MOVE_SPEED: 3,
        CHARACTER_RADIUS: 18
    },

    // 团队配置
    TEAM: {
        MAX_SIZE: 20,
        FOLLOW_DISTANCE: 35,
        COLLISION_THRESHOLD: 900
    },

    // 时间配置
    TIME: {
        DAY_DURATION: 30000,     // 30秒
        NIGHT_DURATION: 30000,   // 30秒
        FOOD_COST_PER_DAY: 1
    },

    // 建筑配置
    BUILDING: {
        INTERACTION_DISTANCE: 60,
        TRIGGER_DISTANCE: 50,
        EXIT_COOLDOWN: 2000
    }
};

// 视距裁剪系统配置
var VIEWPORT_CONFIG = {
    GRID_SIZE: 500,           // 网格区块大小
    EXTRA_RENDER: 1,          // 额外渲染区块数
    MAX_VIEW_DISTANCE: 1000,  // 最大视距
    UPDATE_FREQUENCIES: {
        CORE: 1,              // 60fps (每帧更新)
        IMPORTANT: 2,         // 30fps (每2帧更新)
        NORMAL: 4,            // 15fps (每4帧更新)
        LOW: 30,              // 2fps (每30帧更新)
        SLEEP: 0              // 停止更新
    }
};

// 导出配置对象（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_CONFIG,
        VIEWPORT_CONFIG
    };
}