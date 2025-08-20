/**
 * 碰撞检测管理器
 * 兼容抖音小程序环境 (ES5)
 */
function CollisionManager(gameEngine) {
    this.gameEngine = gameEngine;
}

/**
 * 检查角色与建筑的碰撞
 */
CollisionManager.prototype.checkCollisionWithBuildings = function(x, y) {
    var playerRadius = 18;
    var bufferDistance = 3;
    var effectiveRadius = playerRadius + bufferDistance;
    
    var buildings = this.gameEngine.buildingManager.buildings;
    var camera = this.gameEngine.camera;
    var canvas = this.gameEngine.canvas;
    
    // 检查可见区域内的建筑
    var viewWidth = canvas.width / camera.zoom;
    var viewHeight = canvas.height / camera.zoom;
    var viewLeft = camera.x;
    var viewRight = camera.x + viewWidth;
    var viewTop = camera.y;
    var viewBottom = camera.y + viewHeight;
    
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        
        // 只检查可见区域内的建筑
        if (building.x + building.width >= viewLeft &&
            building.x <= viewRight &&
            building.y + building.height >= viewTop &&
            building.y <= viewBottom) {
            
            // 计算门的位置和尺寸
            var doorInfo = this.gameEngine.buildingManager.calculateDoorInfo(building);
            
            // 检查是否与建筑主体碰撞
            if (this.circleRectCollision(x, y, effectiveRadius, building.x, building.y, building.width, building.height)) {
                // 检查是否在门区域内
                var doorBufferDistance = 1;
                var doorEffectiveRadius = playerRadius + doorBufferDistance;
                
                if (!this.circleRectCollision(x, y, doorEffectiveRadius, doorInfo.x, doorInfo.y, doorInfo.width, doorInfo.height)) {
                    // 不在门区域内，发生碰撞
                    return { collision: true, building: building };
                } else {
                    // 在门区域内，允许通过
                    return { collision: false, building: null };
                }
            }
        }
    }
    
    return { collision: false, building: null };
};

/**
 * 圆形与矩形碰撞检测
 */
CollisionManager.prototype.circleRectCollision = function(circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight) {
    // 找到矩形上距离圆心最近的点
    var closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    var closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
    
    // 计算距离
    var distanceX = circleX - closestX;
    var distanceY = circleY - closestY;
    var distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    return distanceSquared < (circleRadius * circleRadius);
};

/**
 * 检查团队是否可以移动到指定位置
 */
CollisionManager.prototype.canTeamMoveTo = function(deltaX, deltaY) {
    var player = this.gameEngine.player;
    
    // 只检查玩家是否可以移动，团队成员被卡住不影响主人物
    var playerNewX = player.x + deltaX;
    var playerNewY = player.y + deltaY;
    var playerCollision = this.checkCollisionWithBuildings(playerNewX, playerNewY);
    
    if (playerCollision.collision) {
        console.log('[Collision] 玩家移动被建筑阻挡:', playerCollision.building.name);
        return false;
    }
    
    return true;
};

/**
 * 检查子地图中团队是否可以移动
 */
CollisionManager.prototype.canTeamMoveInSubmap = function(deltaX, deltaY) {
    var player = this.gameEngine.player;
    var followers = this.gameEngine.npcManager.followers;
    
    // 检查玩家边界
    var playerNewX = player.x + deltaX;
    var playerNewY = player.y + deltaY;
    
    if (playerNewX < 60 || playerNewX > 340 || playerNewY < 110 || playerNewY > 290) {
        return false;
    }
    
    // 检查团队成员边界
    for (var i = 0; i < followers.length; i++) {
        var follower = followers[i];
        var followerNewX = follower.x + deltaX;
        var followerNewY = follower.y + deltaY;
        
        if (followerNewX < 60 || followerNewX > 340 || followerNewY < 110 || followerNewY > 290) {
            return false;
        }
    }
    
    return true;
};
