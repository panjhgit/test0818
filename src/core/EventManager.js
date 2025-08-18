/**
 * 事件管理器
 * 负责游戏内事件的发布和订阅
 */
class EventManager {
    constructor() {
        this.events = new Map();
    }
    
    /**
     * 订阅事件
     */
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(callback);
    }
    
    /**
     * 取消订阅
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    /**
     * 发布事件
     */
    emit(eventName, ...args) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        callbacks.forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`[EventManager] 事件处理错误 ${eventName}:`, error);
            }
        });
    }
    
    /**
     * 清空所有事件监听
     */
    clear() {
        this.events.clear();
    }
}

// 全局事件管理器实例
const eventManager = new EventManager();

export default eventManager;
