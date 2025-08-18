/**
 * 输入管理器
 * 处理触摸输入和虚拟摇杆
 */
class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.touches = new Map();
        this.isJoystickActive = false;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickDirection = { x: 0, y: 0 };
        this.joystickRadius = 60;
        this.joystickDeadZone = 10;
        
        this.setupEventListeners();
        console.log('[InputManager] 输入管理器已初始化');
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 触摸开始
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (let touch of e.changedTouches) {
                this.onTouchStart(touch);
            }
        });
        
        // 触摸移动
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let touch of e.changedTouches) {
                this.onTouchMove(touch);
            }
        });
        
        // 触摸结束
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (let touch of e.changedTouches) {
                this.onTouchEnd(touch);
            }
        });
        
        // 点击事件（用于建筑物交互）
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.onCanvasClick(x, y);
        });
    }
    
    /**
     * 触摸开始处理
     */
    onTouchStart(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.touches.set(touch.identifier, { x, y, startX: x, startY: y });
        
        // 检查是否在屏幕左下角（虚拟摇杆区域）
        if (x < this.canvas.width / 3 && y > this.canvas.height * 2 / 3) {
            this.activateJoystick(x, y);
        }
    }
    
    /**
     * 触摸移动处理
     */
    onTouchMove(touch) {
        const touchData = this.touches.get(touch.identifier);
        if (!touchData) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        touchData.x = x;
        touchData.y = y;
        
        // 更新虚拟摇杆
        if (this.isJoystickActive) {
            this.updateJoystick(x, y);
        }
    }
    
    /**
     * 触摸结束处理
     */
    onTouchEnd(touch) {
        this.touches.delete(touch.identifier);
        
        // 如果是虚拟摇杆，则停用
        if (this.isJoystickActive) {
            this.deactivateJoystick();
        }
    }
    
    /**
     * 画布点击处理
     */
    onCanvasClick(x, y) {
        // 发射点击事件给其他系统
        const eventManager = require('./EventManager.js').default;
        eventManager.emit('canvas_click', { x, y });
    }
    
    /**
     * 激活虚拟摇杆
     */
    activateJoystick(x, y) {
        this.isJoystickActive = true;
        this.joystickCenter.x = x;
        this.joystickCenter.y = y;
        this.updateJoystick(x, y);
        
        console.log('[InputManager] 虚拟摇杆已激活');
    }
    
    /**
     * 更新虚拟摇杆
     */
    updateJoystick(x, y) {
        const dx = x - this.joystickCenter.x;
        const dy = y - this.joystickCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.joystickDeadZone) {
            this.joystickDirection.x = 0;
            this.joystickDirection.y = 0;
        } else {
            const normalizedDistance = Math.min(distance, this.joystickRadius) / this.joystickRadius;
            this.joystickDirection.x = (dx / distance) * normalizedDistance;
            this.joystickDirection.y = (dy / distance) * normalizedDistance;
        }
        
        // 发射摇杆移动事件
        const eventManager = require('./EventManager.js').default;
        eventManager.emit('joystick_move', {
            x: this.joystickDirection.x,
            y: this.joystickDirection.y
        });
    }
    
    /**
     * 停用虚拟摇杆
     */
    deactivateJoystick() {
        this.isJoystickActive = false;
        this.joystickDirection.x = 0;
        this.joystickDirection.y = 0;
        
        const eventManager = require('./EventManager.js').default;
        eventManager.emit('joystick_stop');
        
        console.log('[InputManager] 虚拟摇杆已停用');
    }
    
    /**
     * 渲染虚拟摇杆
     */
    renderJoystick(ctx) {
        if (!this.isJoystickActive) return;
        
        const { x: centerX, y: centerY } = this.joystickCenter;
        const { x: dirX, y: dirY } = this.joystickDirection;
        
        // 绘制外圈
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.joystickRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制内圈（摇杆）
        const knobX = centerX + dirX * this.joystickRadius * 0.7;
        const knobY = centerY + dirY * this.joystickRadius * 0.7;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(knobX, knobY, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * 获取摇杆方向
     */
    getJoystickDirection() {
        return { ...this.joystickDirection };
    }
    
    /**
     * 摇杆是否激活
     */
    isJoystickOn() {
        return this.isJoystickActive;
    }
}

export default InputManager;
