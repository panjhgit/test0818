# 开发指南 - 模块化游戏开发

## 🎯 模块化成果

### **文件大小对比**
- **原版 game.js**: 4,386行, 152KB
- **模块化 game.js**: 2,289行, 68KB  
- **精简度**: 减少了 47% 的代码行数，55% 的文件大小

### **模块化结构**
```
game-modules/              # 开发时的模块化代码
├── character/            # 角色系统 (BaseCharacter, CharacterManager)
├── input/               # 输入系统 (摇杆控制, 触摸事件)
├── collision/           # 碰撞检测 (建筑碰撞, 团队移动)
├── camera/              # 摄像机系统 (跟随, 视野管理)
├── building/            # 建筑系统 (建筑交互, 进入/退出)
├── npc/                 # NPC系统 (NPC管理, 跟随逻辑)
├── rendering/           # 渲染系统 (游戏渲染, UI渲染)
├── gamestate/           # 游戏状态管理 (状态切换, 数据)
└── utils/               # 工具函数 (数学, 动画, 调试)

src/main.js              # 主入口文件 (精简版本)
build.sh                 # 构建脚本
game.js                  # 最终构建文件 (自动生成)
```

## 🛠️ 开发工作流

### **开发时**
1. 编辑 `game-modules/` 中的模块文件
2. 编辑 `src/main.js` 中的主逻辑
3. 运行 `./build.sh` 构建最终文件

### **构建时**
```bash
# 构建游戏
./build.sh

# 检查构建结果
ls -lh game*.js
```

### **部署时**
- 只需要 `game.js` (构建后的文件)
- 其他模块文件不会被打包 (在 project.config.json 中被忽略)

## 📝 模块说明

### **角色系统 (Character System)**
- **文件**: `game-modules/character/`
- **功能**: 20个角色的渲染、动画、管理
- **核心类**: `BaseCharacter`, `CharacterManager`

### **输入系统 (Input System)**
- **文件**: `game-modules/input/`
- **功能**: 摇杆控制、触摸事件处理
- **核心类**: `InputManager`

### **建筑系统 (Building System)**
- **文件**: `game-modules/building/`
- **功能**: 建筑生成、交互、进入/退出逻辑
- **核心类**: `BuildingManager`

### **NPC系统 (NPC System)**
- **文件**: `game-modules/npc/`
- **功能**: NPC管理、跟随逻辑、个性化行为
- **核心类**: `NPCManager`

### **碰撞检测 (Collision System)**
- **文件**: `game-modules/collision/`
- **功能**: 建筑碰撞、团队移动检测
- **核心类**: `CollisionManager`

### **摄像机系统 (Camera System)**
- **文件**: `game-modules/camera/`
- **功能**: 摄像机跟随、视野管理
- **核心类**: `CameraManager`

### **渲染系统 (Rendering System)**
- **文件**: `game-modules/rendering/`
- **功能**: 游戏渲染、UI渲染、场景渲染
- **核心类**: `RenderManager`

## 🎮 功能保持

所有原有功能完全保留：
- ✅ 摇杆控制移动
- ✅ 20个角色系统
- ✅ 建筑进入询问提示
- ✅ NPC跟随系统
- ✅ 位置恢复机制
- ✅ 团队协作移动
- ✅ 碰撞检测
- ✅ 摄像机跟随

## 🚀 扩展建议

### **新增功能**
- 编辑对应模块文件
- 运行构建脚本
- 测试构建后的 game.js

### **修改现有功能**
- 在 `game-modules/` 中找到对应模块
- 编辑模块代码
- 重新构建

### **调试**
- 开发时可以直接编辑模块文件
- 构建后使用 game.js 进行测试
- 保留了所有调试功能
