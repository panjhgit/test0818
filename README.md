# 末日Q行 - 模块化代码结构

## 概述

本项目已从单一的 `game.js` 文件重构为模块化的结构，每个模块负责特定的功能，提高了代码的可维护性和可扩展性。

## 模块结构

### 1. `gameConfig.js` - 游戏配置模块
- **功能**: 包含所有游戏常量配置
- **内容**: 玩家配置、僵尸配置、跟随者配置、时间配置、地图配置、视距裁剪配置、游戏平衡配置
- **依赖**: 无
- **导出**: `GAME_CONFIG` 对象

### 2. `collision.js` - 碰撞检测系统模块
- **功能**: 空间分区和视距裁剪优化
- **内容**: `Bounds` 类、`QuadTreeNode` 类、`ViewportCullingManager` 类、碰撞检测工具函数
- **依赖**: 无
- **导出**: `Bounds`, `QuadTreeNode`, `ViewportCullingManager`, `circleRectCollision`, `canMoveToPosition`

### 3. `character.js` - 人物系统模块
- **功能**: 角色管理和渲染
- **内容**: `BaseCharacter` 类、`CharacterManager` 类
- **依赖**: 无
- **导出**: `BaseCharacter`, `CharacterManager`

### 4. `zombie.js` - 僵尸系统模块
- **功能**: 僵尸AI、管理和渲染
- **内容**: `BaseZombie` 类、各种僵尸类型、`ZombieManager` 类
- **依赖**: `gameConfig.js`
- **导出**: `BaseZombie`, `ThinZombie`, `FatZombie`, `ZombieBoss1`, `ZombieManager`

### 5. `gameEngine.js` - 游戏引擎核心模块
- **功能**: 游戏主循环、状态管理、输入处理
- **内容**: `GameEngine` 类
- **依赖**: `gameConfig.js`, `collision.js`, `character.js`, `zombie.js`
- **导出**: `GameEngine` 类

### 6. `main.js` - 主游戏逻辑模块
- **功能**: 游戏启动、主菜单、流程控制
- **内容**: `MainGame` 类、`InputManager` 类、`AudioManager` 类、`UIManager` 类
- **依赖**: `gameEngine.js`
- **导出**: `MainGame`, `InputManager`, `AudioManager`, `UIManager`, `initGame`

### 7. `moduleLoader.js` - 模块加载器
- **功能**: 按顺序加载所有模块，确保依赖关系正确
- **内容**: `ModuleLoader` 类、自动启动逻辑
- **依赖**: 所有其他模块
- **导出**: `ModuleLoader`, `moduleLoader`, `onModulesLoaded`, `autoStartModuleLoading`

## 使用方法

### 抖音小程序环境

1. 确保所有模块文件都在 `js/` 目录下
2. 在 `game.js` 中引用 `moduleLoader.js`
3. 模块加载器会自动按顺序加载所有模块
4. 游戏会在所有模块加载完成后自动启动

### 浏览器环境

1. 使用支持 ES6 模块的现代浏览器
2. 通过 `<script>` 标签按顺序引入模块
3. 或者使用模块打包工具（如 Webpack、Rollup）

## 模块依赖关系

```
gameConfig.js (基础配置)
    ↓
collision.js (空间分区)
    ↓
character.js (角色系统)
    ↓
zombie.js (僵尸系统)
    ↓
gameEngine.js (游戏引擎)
    ↓
main.js (主逻辑)
    ↓
moduleLoader.js (加载器)
```

## 扩展指南

### 添加新模块

1. 在 `js/` 目录下创建新的模块文件
2. 在 `moduleLoader.js` 的 `MODULE_ORDER` 数组中添加模块名
3. 确保模块有正确的导出语句
4. 在依赖模块中正确引用新模块

### 修改现有模块

1. 保持模块的单一职责原则
2. 确保模块间的接口稳定
3. 更新相关的依赖关系
4. 测试模块的独立性和集成性

## 性能优化

- **视距裁剪**: 只渲染玩家视野内的对象
- **空间分区**: 使用四叉树优化碰撞检测
- **对象池**: 重用游戏对象，减少垃圾回收
- **批量更新**: 按优先级分批更新游戏对象

## 注意事项

1. **ES5 兼容性**: 所有代码使用 ES5 语法，确保在抖音小程序环境中正常运行
2. **模块顺序**: 严格按照 `MODULE_ORDER` 定义的顺序加载模块
3. **错误处理**: 每个模块都包含适当的错误处理和日志记录
4. **内存管理**: 使用对象池和视距裁剪来优化内存使用

## 故障排除

### 常见问题

1. **模块加载失败**: 检查文件路径和模块导出语句
2. **依赖错误**: 确保模块按正确顺序加载
3. **性能问题**: 检查视距裁剪和对象池是否正确初始化
4. **内存泄漏**: 监控对象池大小和实体清理

### 调试技巧

1. 查看控制台日志，了解模块加载状态
2. 使用性能监控工具检查帧率和内存使用
3. 验证四叉树和视距裁剪系统的状态
4. 检查对象池的使用情况
