/**
 * 游戏配置模块
 * 包含所有游戏平衡配置和视距裁剪系统配置
 */

var GameConfig = (function() {
    'use strict';
    
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

    return {
        getGameConfig: function() {
            return GAME_CONFIG;
        },
        
        getViewportConfig: function() {
            return VIEWPORT_CONFIG;
        },
        
        getZombieSpawnConfig: function() {
            return GAME_CONFIG.ZOMBIE_SPAWN;
        },
        
        getPlayerConfig: function() {
            return GAME_CONFIG.PLAYER;
        },
        
        getTeamConfig: function() {
            return GAME_CONFIG.TEAM;
        },
        
        getTimeConfig: function() {
            return GAME_CONFIG.TIME;
        },
        
        getBuildingConfig: function() {
            return GAME_CONFIG.BUILDING;
        },
        
        updateGameConfig: function(newConfig) {
            // 深度合并配置
            for (var key in newConfig) {
                if (newConfig.hasOwnProperty(key)) {
                    if (typeof newConfig[key] === 'object' && newConfig[key] !== null) {
                        if (!GAME_CONFIG[key]) {
                            GAME_CONFIG[key] = {};
                        }
                        for (var subKey in newConfig[key]) {
                            if (newConfig[key].hasOwnProperty(subKey)) {
                                GAME_CONFIG[key][subKey] = newConfig[key][subKey];
                            }
                        }
                    } else {
                        GAME_CONFIG[key] = newConfig[key];
                    }
                }
            }
        }
    };
})();

// 为了向后兼容，暴露全局变量
if (typeof window !== 'undefined') {
    window.GameConfig = GameConfig;
    window.GAME_CONFIG = GameConfig.getGameConfig();
    window.VIEWPORT_CONFIG = GameConfig.getViewportConfig();
}