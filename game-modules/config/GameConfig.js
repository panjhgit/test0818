/**
 * 游戏配置文件
 * 兼容抖音小程序环境 (ES5)
 */

var GameConfig = {
    // 地图配置
    map: {
        width: 10000,
        height: 10000,
        blockSize: 450,
        streetWidth: 200,
        buildingSpacing: 0
    },
    
    // 玩家配置
    player: {
        radius: 18,
        moveSpeed: 4,
        health: 20,
        maxHealth: 20
    },
    
    // 摄像机配置
    camera: {
        zoom: 0.8,
        smoothing: 0.1
    },
    
    // 摇杆配置
    joystick: {
        radius: 60,
        knobRadius: 25,
        x: 100,
        maxDistance: 50,
        deadZone: 5
    },
    
    // 建筑配置
    building: {
        interactionDistance: 30,
        triggerDistance: 25
    },
    
    // NPC配置
    npc: {
        collisionThreshold: 30,
        maxTeamSize: 20,
        followDistance: 40
    },
    
    // 时间配置
    time: {
        dayDuration: 300000,   // 5分钟白天
        nightDuration: 60000,  // 1分钟夜晚
        animationSpeed: 200
    }
};
