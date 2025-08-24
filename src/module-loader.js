/**
 * 模块加载器
 * 负责按正确顺序加载所有游戏模块
 */

var ModuleLoader = (function() {
    'use strict';
    
    var loadedModules = {};
    var moduleDependencies = {
        'config': [],
        'utils': ['config'],
        'entities': ['config', 'utils'],
        'managers': ['config', 'utils', 'entities'],
        'systems': ['config', 'utils', 'entities', 'managers']
    };
    
    var moduleFiles = {
        'config': [
            'src/config/game-config.js'
        ],
        'utils': [
            'src/utils/bounds.js',
            'src/utils/quad-tree.js'
        ],
        'entities': [
            'src/entities/base-character.js',
            'src/entities/zombie-system.js'
        ],
        'managers': [
            'src/managers/character-manager.js',
            'src/managers/zombie-manager.js',
            'src/managers/viewport-culling.js'
        ],
        'systems': [
            'src/systems/game-engine.js',
            'src/systems/map-system.js',
            'src/systems/input-system.js'
        ]
    };
    
    return {
        /**
         * 加载指定模块组
         */
        loadModuleGroup: function(moduleGroup) {
            return new Promise(function(resolve, reject) {
                if (loadedModules[moduleGroup]) {
                    resolve();
                    return;
                }
                
                var dependencies = moduleDependencies[moduleGroup];
                var dependencyPromises = dependencies.map(function(dep) {
                    return this.loadModuleGroup(dep);
                }.bind(this));
                
                Promise.all(dependencyPromises).then(function() {
                    this.loadModuleFiles(moduleGroup).then(function() {
                        loadedModules[moduleGroup] = true;
                        console.log('[ModuleLoader] 模块组加载完成:', moduleGroup);
                        resolve();
                    }).catch(reject);
                }.bind(this)).catch(reject);
            }.bind(this));
        },
        
        /**
         * 加载模块文件
         */
        loadModuleFiles: function(moduleGroup) {
            return new Promise(function(resolve, reject) {
                var files = moduleFiles[moduleGroup];
                if (!files || files.length === 0) {
                    resolve();
                    return;
                }
                
                var loadPromises = files.map(function(file) {
                    return this.loadScript(file);
                }.bind(this));
                
                Promise.all(loadPromises).then(resolve).catch(reject);
            }.bind(this));
        },
        
        /**
         * 加载单个脚本文件
         */
        loadScript: function(src) {
            return new Promise(function(resolve, reject) {
                // 检查是否已经加载
                var existingScript = document.querySelector('script[src="' + src + '"]');
                if (existingScript) {
                    resolve();
                    return;
                }
                
                var script = document.createElement('script');
                script.src = src;
                script.type = 'text/javascript';
                
                script.onload = function() {
                    console.log('[ModuleLoader] 脚本加载成功:', src);
                    resolve();
                };
                
                script.onerror = function() {
                    console.error('[ModuleLoader] 脚本加载失败:', src);
                    reject(new Error('脚本加载失败: ' + src));
                };
                
                document.head.appendChild(script);
            });
        },
        
        /**
         * 加载所有模块
         */
        loadAllModules: function() {
            console.log('[ModuleLoader] 开始加载所有模块...');
            
            return this.loadModuleGroup('systems').then(function() {
                console.log('[ModuleLoader] 所有模块加载完成！');
                return true;
            }).catch(function(error) {
                console.error('[ModuleLoader] 模块加载失败:', error);
                throw error;
            });
        },
        
        /**
         * 检查模块是否已加载
         */
        isModuleLoaded: function(moduleGroup) {
            return !!loadedModules[moduleGroup];
        },
        
        /**
         * 获取已加载的模块列表
         */
        getLoadedModules: function() {
            return Object.keys(loadedModules);
        },
        
        /**
         * 重置模块状态
         */
        reset: function() {
            loadedModules = {};
            console.log('[ModuleLoader] 模块状态已重置');
        }
    };
})();

// 为了向后兼容，暴露全局变量
if (typeof window !== 'undefined') {
    window.ModuleLoader = ModuleLoader;
}
