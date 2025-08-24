game.js  # 启动主文件

src/
├── config/
│   └── game-config.js          # 游戏配置
├── utils/
│   ├── bounds.js               # 边界框工具类
│   └── quad-tree.js            # 四叉树实现
├── entities/
│   ├── base-character.js       # 角色基类
│   └── zombie-system.js        # 僵尸系统
├── managers/
│   ├── character-manager.js    # 角色管理器
│   ├── zombie-manager.js       # 僵尸管理器
│   └── viewport-culling.js     # 视距裁剪
├── systems/
│   ├── game-engine.js          # 游戏引擎
│   ├── input-system.js         # 输入系统
│   └── map-system.js           # 地图系统
└── module-loader.js            # 模块加载器
