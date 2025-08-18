/**
 * UI管理器
 * 负责游戏界面的绘制和管理
 */
class UIManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.elements = [];
        
        console.log('[UIManager] UI管理器已初始化');
    }
    
    /**
     * 渲染游戏状态栏
     */
    renderStatusBar(gameData) {
        const { survivalDays, food, teamSize } = gameData;
        
        // 背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, 60);
        
        // 文字样式
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        
        // 生存天数
        this.ctx.fillText(`第 ${survivalDays} 天`, 10, 25);
        
        // 口粮（带图标）
        this.ctx.fillText(`🍞 ${food}`, 10, 45);
        
        // 团队人数
        this.ctx.fillText(`👥 ${teamSize}`, 120, 25);
    }
    
    /**
     * 渲染按钮
     */
    renderButton(x, y, width, height, text, style = {}) {
        const {
            backgroundColor = '#4CAF50',
            textColor = '#ffffff',
            borderColor = '#45a049',
            borderWidth = 2,
            fontSize = 16
        } = style;
        
        // 按钮背景
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(x, y, width, height);
        
        // 按钮边框
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = borderWidth;
        this.ctx.strokeRect(x, y, width, height);
        
        // 按钮文字
        this.ctx.fillStyle = textColor;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width / 2, y + height / 2);
        
        // 重置文字对齐
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
    }
    
    /**
     * 渲染菜单界面
     */
    renderMainMenu() {
        // 背景
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 标题
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('末日Q行', this.canvas.width / 2, 150);
        
        // 副标题
        this.ctx.fillStyle = '#bdc3c7';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('生存至100天的挑战', this.canvas.width / 2, 190);
        
        // 开始游戏按钮
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (this.canvas.width - buttonWidth) / 2;
        const buttonY = 250;
        
        this.renderButton(buttonX, buttonY, buttonWidth, buttonHeight, '开始游戏');
        
        // 重置文字对齐
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染游戏结束界面
     */
    renderGameOver(gameStats) {
        const { survivalDays, maxTeamSize, zombieKills, cause } = gameStats;
        
        // 半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 游戏结束标题
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        
        const title = cause === 'starvation' ? '饥饿死亡' : '全团覆灭';
        this.ctx.fillText(title, this.canvas.width / 2, 150);
        
        // 统计数据
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '18px Arial';
        
        const stats = [
            `生存天数: ${survivalDays}`,
            `团队最高人数: ${maxTeamSize}`,
            `击杀僵尸总数: ${zombieKills}`
        ];
        
        stats.forEach((stat, index) => {
            this.ctx.fillText(stat, this.canvas.width / 2, 200 + index * 30);
        });
        
        // 重新开始按钮
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonX = (this.canvas.width - buttonWidth) / 2;
        const buttonY = 320;
        
        this.renderButton(buttonX, buttonY, buttonWidth, buttonHeight, '重新开始', {
            backgroundColor: '#e74c3c',
            borderColor: '#c0392b'
        });
        
        // 重置文字对齐
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染通关界面
     */
    renderVictory(gameStats) {
        const { survivalDays, maxTeamSize, zombieKills, totalFood } = gameStats;
        
        // 背景
        this.ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 通关标题
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('100天生存成功！', this.canvas.width / 2, 120);
        
        // 恭喜文字
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('恭喜成为末日幸存者！', this.canvas.width / 2, 160);
        
        // 统计数据
        this.ctx.font = '16px Arial';
        const stats = [
            `生存天数: ${survivalDays}`,
            `团队最高人数: ${maxTeamSize}`,
            `击杀僵尸总数: ${zombieKills}`,
            `收集口粮总数: ${totalFood}`
        ];
        
        stats.forEach((stat, index) => {
            this.ctx.fillText(stat, this.canvas.width / 2, 200 + index * 25);
        });
        
        // 奖励提示
        this.ctx.fillStyle = '#f39c12';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('已解锁: 末日幸存者称号', this.canvas.width / 2, 320);
        this.ctx.fillText('已解锁: 幸存者专属皮肤', this.canvas.width / 2, 340);
        
        // 重新开始按钮
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonX = (this.canvas.width - buttonWidth) / 2;
        const buttonY = 380;
        
        this.renderButton(buttonX, buttonY, buttonWidth, buttonHeight, '再次挑战', {
            backgroundColor: '#27ae60',
            borderColor = '#229954'
        });
        
        // 重置文字对齐
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染载入画面
     */
    renderLoadingScreen(progress, text = '探索中...') {
        // 黑色背景
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 载入文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        // 进度条背景
        const barWidth = 200;
        const barHeight = 10;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height / 2 + 10;
        
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 进度条
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // 重置文字对齐
        this.ctx.textAlign = 'left';
    }
    
    /**
     * 渲染建筑物探索提示
     */
    renderBuildingHint(buildingName, x, y) {
        const text = `点击探索${buildingName}`;
        const padding = 10;
        
        // 测量文字尺寸
        this.ctx.font = '14px Arial';
        const textWidth = this.ctx.measureText(text).width;
        
        // 提示框背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - textWidth / 2 - padding, y - 35, textWidth + padding * 2, 25);
        
        // 提示文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y - 15);
        
        // 重置文字对齐
        this.ctx.textAlign = 'left';
    }
}

export default UIManager;
