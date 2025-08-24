/**
 * 菜单系统模块
 * 负责首页界面的渲染和交互逻辑
 */

// 菜单渲染系统
var MenuSystem = (function() {
    'use strict';
    
    return {
        // 渲染主菜单
        renderMenu: function(ctx, canvas) {
            var centerX = canvas.width / 2;
            
            // 创建渐变背景
            var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(0.5, '#16213e');
            gradient.addColorStop(1, '#0f3460');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 渲染背景网格
            this.renderBackgroundGrid(ctx, canvas);
            
            // 渲染装饰元素
            this.renderDecorations(ctx, canvas);
            
            // 渲染标题
            this.renderTitle(ctx, centerX);
            
            // 渲染副标题
            this.renderSubtitle(ctx, centerX);
            
            // 渲染游戏特性
            this.renderGameFeatures(ctx, centerX);
            
            // 渲染开始按钮
            this.renderStartButton(ctx, centerX);
            
            // 渲染页脚信息
            this.renderFooterInfo(ctx, centerX);
            
            ctx.textAlign = 'left';
        },
        
        // 渲染背景网格
        renderBackgroundGrid: function(ctx, canvas) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            
            var gridSize = 40;
            
            for (var x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            for (var y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            ctx.restore();
        },
        
        // 渲染装饰元素
        renderDecorations: function(ctx, canvas) {
            ctx.save();
            
            // 左上角装饰
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.arc(50, 50, 15, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(48, 48, 3, 0, Math.PI * 2);
            ctx.arc(52, 48, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // 右上角警告标志
            ctx.strokeStyle = '#ff5733';
            ctx.fillStyle = '#ff5733';
            ctx.lineWidth = 3;
            
            var warningX = canvas.width - 50;
            var warningY = 50;
            
            ctx.beginPath();
            ctx.moveTo(warningX, warningY - 15);
            ctx.lineTo(warningX - 13, warningY + 15);
            ctx.lineTo(warningX + 13, warningY + 15);
            ctx.closePath();
            ctx.stroke();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('!', warningX, warningY + 5);
            
            // 底部装饰线
            var decorY = canvas.height - 60;
            ctx.fillStyle = 'rgba(255, 87, 51, 0.2)';
            ctx.fillRect(0, decorY, canvas.width, 4);
            
            ctx.fillStyle = 'rgba(255, 87, 51, 0.4)';
            ctx.fillRect(0, decorY + 8, canvas.width, 2);
            
            ctx.restore();
        },
        
        // 渲染标题
        renderTitle: function(ctx, centerX) {
            ctx.save();
            ctx.shadowColor = 'rgba(255, 87, 51, 0.8)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ff5733';
            ctx.font = 'bold 42px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('末日Q行', centerX, 120);
            
            // 渲染标题下划线
            ctx.strokeStyle = '#ff5733';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - 100, 140);
            ctx.lineTo(centerX + 100, 140);
            ctx.stroke();
            ctx.restore();
        },
        
        // 渲染副标题
        renderSubtitle: function(ctx, centerX) {
            ctx.fillStyle = '#e8e8e8';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('生存至100天的挑战', centerX, 170);
        },
        
        // 渲染游戏特性
        renderGameFeatures: function(ctx, centerX) {
            var features = ['🧟 对抗僵尸群', '🏠 探索建筑物', '👥 招募伙伴', '🍞 管理资源'];
            
            ctx.fillStyle = '#b8c6db';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            
            var startY = 200;
            var spacing = 25;
            
            for (var i = 0; i < features.length; i++) {
                ctx.fillText(features[i], centerX, startY + i * spacing);
            }
        },
        
        // 渲染开始按钮
        renderStartButton: function(ctx, centerX) {
            var buttonWidth = 220;
            var buttonHeight = 55;
            var buttonX = centerX - buttonWidth / 2;
            var buttonY = 320;
            
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;
            
            // 按钮渐变
            var buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
            buttonGradient.addColorStop(0, '#4CAF50');
            buttonGradient.addColorStop(0.5, '#45a049');
            buttonGradient.addColorStop(1, '#3d8b40');
            
            ctx.fillStyle = buttonGradient;
            ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            // 按钮边框
            ctx.shadowColor = 'rgba(76, 175, 80, 0.6)';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            ctx.restore();
            
            // 按钮文字
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🎮 开始游戏', centerX, buttonY + buttonHeight / 2 + 7);
            
            // 按钮内边框
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(buttonX + 5, buttonY + 5, buttonWidth - 10, buttonHeight - 10);
        },
        
        // 渲染页脚信息
        renderFooterInfo: function(ctx, centerX) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('点击开始游戏按钮开始冒险', centerX, 400);
        },
        
        // 检查点击是否在开始按钮上
        isStartButtonClicked: function(x, y, canvas) {
            var centerX = canvas.width / 2;
            var buttonWidth = 220;
            var buttonHeight = 55;
            var buttonX = centerX - buttonWidth / 2;
            var buttonY = 320;
            
            return x >= buttonX && x <= buttonX + buttonWidth && 
                   y >= buttonY && y <= buttonY + buttonHeight;
        },
        
        // 获取开始按钮区域（用于调试）
        getStartButtonBounds: function(canvas) {
            var centerX = canvas.width / 2;
            var buttonWidth = 220;
            var buttonHeight = 55;
            var buttonX = centerX - buttonWidth / 2;
            var buttonY = 320;
            
            return {
                x: buttonX,
                y: buttonY,
                width: buttonWidth,
                height: buttonHeight
            };
        }
    };
})();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuSystem;
}
