/**
 * 游戏管理器
 * 负责游戏核心数据和状态管理
 */
class GameManager {
    constructor() {
        this.gameData = {
            survivalDays: 1,
            food: 5,
            teamSize: 1,
            maxTeamSize: 1,
            zombieKills: 0,
            totalFood: 5,
            isDay: true,
            timeRemaining: 300000, // 5分钟白天
            gameStartTime: Date.now()
        };
        
        this.gameStats = {
            survivalDays: 1,
            maxTeamSize: 1,
            zombieKills: 0,
            totalFood: 5,
            cause: null
        };
        
        this.team = [];
        this.exploredBuildings = new Set();
        
        console.log('[GameManager] 游戏管理器已初始化');
    }
    
    /**
     * 重置游戏数据
     */
    resetGame() {
        this.gameData = {
            survivalDays: 1,
            food: 5,
            teamSize: 1,
            maxTeamSize: 1,
            zombieKills: 0,
            totalFood: 5,
            isDay: true,
            timeRemaining: 300000,
            gameStartTime: Date.now()
        };
        
        this.gameStats = {
            survivalDays: 1,
            maxTeamSize: 1,
            zombieKills: 0,
            totalFood: 5,
            cause: null
        };
        
        this.team = [];
        this.exploredBuildings.clear();
        
        console.log('[GameManager] 游戏数据已重置');
    }
    
    /**
     * 更新游戏时间和昼夜循环
     */
    updateTime(deltaTime) {
        this.gameData.timeRemaining -= deltaTime;
        
        // 检查昼夜切换
        if (this.gameData.timeRemaining <= 0) {
            if (this.gameData.isDay) {
                // 白天结束，进入夜晚
                this.gameData.isDay = false;
                this.gameData.timeRemaining = 60000; // 1分钟夜晚
                console.log('[GameManager] 夜幕降临');
            } else {
                // 夜晚结束，进入新的一天
                this.advanceDay();
            }
        }
    }
    
    /**
     * 推进到新的一天
     */
    advanceDay() {
        this.gameData.isDay = true;
        this.gameData.timeRemaining = 300000; // 5分钟白天
        this.gameData.survivalDays++;
        
        // 消耗口粮
        const foodCost = this.gameData.teamSize;
        this.gameData.food -= foodCost;
        
        console.log(`[GameManager] 第${this.gameData.survivalDays}天，消耗口粮${foodCost}份`);
        
        // 检查口粮是否足够
        if (this.gameData.food < 0) {
            this.gameOver('starvation');
            return;
        }
        
        // 检查是否通关
        if (this.gameData.survivalDays > 100) {
            this.gameWin();
            return;
        }
        
        // 发射新一天事件
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('new_day', this.gameData.survivalDays);
    }
    
    /**
     * 游戏结束
     */
    gameOver(cause) {
        this.gameStats.survivalDays = this.gameData.survivalDays;
        this.gameStats.maxTeamSize = this.gameData.maxTeamSize;
        this.gameStats.zombieKills = this.gameData.zombieKills;
        this.gameStats.cause = cause;
        
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('game_over', this.gameStats);
        
        console.log(`[GameManager] 游戏结束，原因: ${cause}`);
    }
    
    /**
     * 游戏胜利
     */
    gameWin() {
        this.gameStats.survivalDays = this.gameData.survivalDays;
        this.gameStats.maxTeamSize = this.gameData.maxTeamSize;
        this.gameStats.zombieKills = this.gameData.zombieKills;
        this.gameStats.totalFood = this.gameData.totalFood;
        
        const eventManager = require('../core/EventManager.js').default;
        eventManager.emit('game_win', this.gameStats);
        
        console.log('[GameManager] 游戏胜利！');
    }
    
    /**
     * 添加队友
     */
    addTeamMember(memberData) {
        this.team.push(memberData);
        this.gameData.teamSize = this.team.length + 1; // +1 for player
        
        if (this.gameData.teamSize > this.gameData.maxTeamSize) {
            this.gameData.maxTeamSize = this.gameData.teamSize;
        }
        
        console.log(`[GameManager] 新队友加入: ${memberData.name}，团队人数: ${this.gameData.teamSize}`);
    }
    
    /**
     * 移除队友
     */
    removeTeamMember(index) {
        if (index >= 0 && index < this.team.length) {
            const member = this.team.splice(index, 1)[0];
            this.gameData.teamSize = this.team.length + 1;
            
            console.log(`[GameManager] 队友离开: ${member.name}，团队人数: ${this.gameData.teamSize}`);
        }
    }
    
    /**
     * 增加口粮
     */
    addFood(amount) {
        this.gameData.food += amount;
        this.gameData.totalFood += amount;
        
        console.log(`[GameManager] 获得口粮 ${amount}份，当前口粮: ${this.gameData.food}`);
    }
    
    /**
     * 增加僵尸击杀数
     */
    addZombieKill(count = 1) {
        this.gameData.zombieKills += count;
        
        console.log(`[GameManager] 击杀僵尸 ${count}只，总击杀数: ${this.gameData.zombieKills}`);
    }
    
    /**
     * 标记建筑物已探索
     */
    markBuildingExplored(buildingId) {
        this.exploredBuildings.add(buildingId);
        
        console.log(`[GameManager] 建筑物已探索: ${buildingId}`);
    }
    
    /**
     * 检查建筑物是否已探索
     */
    isBuildingExplored(buildingId) {
        return this.exploredBuildings.has(buildingId);
    }
    
    /**
     * 获取游戏数据
     */
    getGameData() {
        return { ...this.gameData };
    }
    
    /**
     * 获取游戏统计
     */
    getGameStats() {
        return { ...this.gameStats };
    }
    
    /**
     * 获取团队数据
     */
    getTeam() {
        return [...this.team];
    }
    
    /**
     * 获取当前游戏阶段描述
     */
    getCurrentPhaseDescription() {
        const { isDay, timeRemaining } = this.gameData;
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        
        if (isDay) {
            return `白天 ${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `夜晚 ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}

export default GameManager;
