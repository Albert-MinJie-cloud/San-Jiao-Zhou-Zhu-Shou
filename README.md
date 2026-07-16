# 三角洲行动助手

一键生成 3:4 竖屏小红书攻略图，支持每日密码管理与 AI 截图识别。

## 项目结构

```
├── client/          # 前端 (React + Vite + TailwindCSS)
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx    # 主页 - 攻略图生成
│       │   └── Admin.tsx   # 管理后台 - 密码录入
│       ├── api.ts          # API 层
│       └── App.tsx         # 路由配置
├── server/          # 后端 (Express + SQLite)
│   └── src/
│       ├── index.ts        # 服务入口
│       ├── routes.ts       # API 路由
│       ├── db.ts           # 数据库
│       └── recognize.ts    # Gemini AI 识别
└── package.json     # 根目录启动脚本
```

## 快速开始

**依赖：** Node.js

```bash
# 安装前后端依赖
cd client && npm install && cd ..
cd server && npm install && cd ..

# 同时启动前后端
npm run dev
```

- 前端：http://localhost:3000
- 后端：http://localhost:8000
- 管理后台：http://localhost:3000/#/admin

## 环境配置

`server/.env`：

```
PORT=8000
ADMIN_TOKEN=你的管理密钥
GEMINI_API_KEY=你的Gemini API Key
```

## 功能

- 生成 3:4 竖屏每日密码合集图，一键下载
- 6 个地点独立卡片，可编辑文字、上传截图
- 管理后台：日期选择、上传截图 AI 识别密码、历史记录回溯
- 地点配置：名称/攻略/图床链接，支持新增和删除
