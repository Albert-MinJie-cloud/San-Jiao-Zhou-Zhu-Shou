# 三角洲行动助手

一键生成 3:4 竖屏小红书攻略图，支持每日密码管理与截图识别。

## 项目结构

```
├── client/               # 前端 (React + Vite + TailwindCSS v4)
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx        # 主页 - 攻略图生成
│       │   └── Admin.tsx       # 管理后台 - 密码录入/地点配置
│       ├── components/         # 可复用组件 (NavBar, LocationCard, …)
│       ├── hooks/              # 自定义 Hooks (useAuth, useLocations, …)
│       ├── api/                # API 层 (client.ts, daily.ts, admin.ts)
│       └── types/              # TypeScript 类型定义
│
├── server/               # [已弃用] 旧版后端 (Node Express + Tesseract.js)
│                          # 推荐使用 Python 版替代
│
├── server-py/            # 后端 (Python FastAPI + SQLAlchemy + pytesseract)
│   ├── app/
│   │   ├── main.py             # FastAPI 入口 + CORS
│   │   ├── routes/daily.py     # 公开接口 (GET /api/daily, /api/history)
│   │   ├── routes/admin.py     # 管理接口 (OCR/录入/地点 CRUD)
│   │   ├── ocr/recognize.py    # pytesseract 本地 OCR
│   │   ├── database.py         # SQLAlchemy 异步引擎 + 自动建表
│   │   ├── models.py           # ORM 模型
│   │   └── schemas.py          # Pydantic 模型
│   └── pyproject.toml          # uv 项目配置
│
├── cli/                  # 终端工具 (Rust)
│   └── src/
│       ├── main.rs             # CLI 入口 + clap 命令分发
│       ├── client.rs           # HTTP API 客户端 (reqwest)
│       ├── config.rs           # 本地 TOML 配置
│       ├── display.rs          # 终端表格展示
│       └── types.rs            # 类型定义
│
├── data/                 # SQLite 数据库（运行中自动生成）
└── package.json          # 根目录启动脚本
```

## 快速开始

### 后端（Python 版，推荐）

```bash
cd server-py
uv run uvicorn app.main:app --port 8000
```

> 需要 `uv`：`brew install uv`
>
> OCR 需系统安装 Tesseract：
>
> ```bash
> brew install tesseract
> # 中文语言包（~350MB 合集，网络不好可单独下载）
> brew install tesseract-lang
> # 或手动下载单个文件（仅 ~10MB）：
> # curl -L -o /opt/homebrew/share/tessdata/chi_sim.traineddata \
> #   https://github.com/tesseract-ocr/tessdata/raw/main/chi_sim.traineddata
> ```

### 后端（Node 版）

```bash
cd server && npm install && npm run dev
```

### 前端

```bash
cd client && npm install && npm run dev
```

### 命令行工具

```bash
cd cli
cargo run                 # 查看今日密码
cargo run -- --help       # 查看全部命令
```

## 命令参考

```bash
delta                     # 显示最新一天密码
delta daily --date 2026-07-17   # 指定日期
delta history              # 列出有记录的历史日期
delta check               # 检查今日密码是否已录入
delta ocr screenshot.jpg  # 上传截图自动识别密码
delta config show         # 查看当前配置
delta config set-url <url>
delta config set-token <token>
```

## 地址

| 服务 | 地址 |
|---|---|
| 前端页面 | http://localhost:3000 |
| 管理后台 | http://localhost:3000/#/admin |
| API 服务 | http://localhost:8000 |
| API 文档 | http://localhost:8000/docs |

## 环境配置

### 后端 `.env`

```
PORT=8000
ADMIN_TOKEN=你的管理密钥
```

### CLI 配置文件

路径：`~/Library/Application Support/delta-helper/config.toml`

```toml
[server]
url = "http://localhost:8000"
token = "你的管理密钥"
```

## 功能

- **攻略图生成** — 3:4 竖屏合集图/单卡，一键下载无水印原图
- **每日密码管理** — 6 个地点密码录入，按日期回溯历史，快捷复制
- **截图 OCR 识别** — 上传游戏截图，本地 Tesseract 自动提取密码
- **地点配置 CRUD** — 名称/攻略/图床链接管理，支持新增和删除
- **终端查询** — `delta` 命令直接看密码，无需打开浏览器

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19, Vite 6, TailwindCSS v4, React Router 7 |
| 后端 (Python) | FastAPI, SQLAlchemy + aiosqlite, pytesseract |
| 后端 (Node) | Express, better-sqlite3, Tesseract.js |
| CLI | Rust, clap, reqwest, comfy-table |
| 数据库 | SQLite |
