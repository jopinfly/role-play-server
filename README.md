# Role Play Server

角色扮演聊天机器人后端服务

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS
- **数据库**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **文件存储**: Vercel Blob
- **AI 聊天**: MiniMax API

## 功能特性

1. **Admin Portal**: 角色管理后台，可在线测试聊天流程
2. **角色管理**: 支持创建、编辑、删除角色，包含形象图片、昵称、本名、人设、朋友圈
3. **聊天功能**: 基于 MiniMax API 的智能对话
4. **对话持久化**: 自动保存对话记录

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```env
# Database (Neon)
DATABASE_URL=postgresql://username:password@host.neon.tech/role-play-server?sslmode=require

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# MiniMax API
MINIMAX_API_KEY=your_minimax_api_key
MINIMAX_GROUP_ID=your_minimax_group_id
```

### 3. 初始化数据库

```bash
npm run db:push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000/admin 进入管理后台

## 部署

项目已配置 Vercel 部署，推送到 GitHub 后在 Vercel 导入项目即可。

需要配置的环境变量：
- `DATABASE_URL` - Neon 数据库连接字符串
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob 读写令牌
- `MINIMAX_API_KEY` - MiniMax API 密钥
- `MINIMAX_GROUP_ID` - MiniMax Group ID

## API 接口

### 角色管理

- `GET /api/characters` - 获取所有角色
- `POST /api/characters` - 创建角色
- `PUT /api/characters` - 更新角色
- `DELETE /api/characters?id={id}` - 删除角色

### 聊天

- `POST /api/chat` - 创建新对话
- `PUT /api/chat` - 发送消息
- `GET /api/chat?conversationId={id}` - 获取对话历史

### 文件上传

- `POST /api/upload` - 上传文件到 Vercel Blob
