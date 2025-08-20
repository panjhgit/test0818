/**
 * 事件总线 - 解耦模块间通信
 * 替代原有的EventManager，提供更强大的事件系统
 */
function EventBus() {
    this.events = {};
    this.onceEvents = {};
    this.eventHistory = [];
    this.maxHistorySize = 100;
    
    console.log('[EventBus] 事件总线初始化');
}

/**
 * 订阅事件
 */
EventBus.prototype.on = function(eventName, callback, context) {
    if (!this.events[eventName]) {
        this.events[eventName] = [];
    }
    
    this.events[eventName].push({
        callback: callback,
        context: context || null
    });
    
    console.log('[EventBus] 订阅事件:', eventName);
};

/**
 * 订阅一次性事件
 */
EventBus.prototype.once = function(eventName, callback, context) {
    if (!this.onceEvents[eventName]) {
        this.onceEvents[eventName] = [];
    }
    
    this.onceEvents[eventName].push({
        callback: callback,
        context: context || null
    });
    
    console.log('[EventBus] 订阅一次性事件:', eventName);
};

/**
 * 取消订阅
 */
EventBus.prototype.off = function(eventName, callback) {
    if (this.events[eventName]) {
        this.events[eventName] = this.events[eventName].filter(function(listener) {
            return listener.callback !== callback;
        });
    }
    
    if (this.onceEvents[eventName]) {
        this.onceEvents[eventName] = this.onceEvents[eventName].filter(function(listener) {
            return listener.callback !== callback;
        });
    }
};

/**
 * 发布事件
 */
EventBus.prototype.emit = function(eventName, data) {
    var timestamp = Date.now();
    
    // 记录事件历史
    this.eventHistory.push({
        name: eventName,
        data: data,
        timestamp: timestamp
    });
    
    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
    }
    
    // 触发普通事件监听器
    if (this.events[eventName]) {
        for (var i = 0; i < this.events[eventName].length; i++) {
            var listener = this.events[eventName][i];
            try {
                if (listener.context) {
                    listener.callback.call(listener.context, data);
                } else {
                    listener.callback(data);
                }
            } catch (error) {
                console.error('[EventBus] 事件处理错误:', eventName, error);
            }
        }
    }
    
    // 触发一次性事件监听器
    if (this.onceEvents[eventName]) {
        var onceListeners = this.onceEvents[eventName];
        this.onceEvents[eventName] = []; // 清空一次性监听器
        
        for (var j = 0; j < onceListeners.length; j++) {
            var onceListener = onceListeners[j];
            try {
                if (onceListener.context) {
                    onceListener.callback.call(onceListener.context, data);
                } else {
                    onceListener.callback(data);
                }
            } catch (error) {
                console.error('[EventBus] 一次性事件处理错误:', eventName, error);
            }
        }
    }
    
    console.log('[EventBus] 事件发布:', eventName, '监听器数量:', (this.events[eventName] || []).length);
};

/**
 * 获取事件历史
 */
EventBus.prototype.getEventHistory = function(eventName) {
    if (eventName) {
        return this.eventHistory.filter(function(event) {
            return event.name === eventName;
        });
    }
    return this.eventHistory.slice(); // 返回副本
};

/**
 * 清空所有事件监听器
 */
EventBus.prototype.clear = function() {
    this.events = {};
    this.onceEvents = {};
    this.eventHistory = [];
    console.log('[EventBus] 所有事件监听器已清空');
};

// 全局事件总线实例
var eventBus = new EventBus();
