FROM node:18-alpine

# 安装 better-sqlite3 依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 先复制依赖定义文件，利用 Docker 缓存层
COPY package.json package-lock.json* ./

RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 在容器内构建前端
WORKDIR /app/xinqing-frontend
COPY xinqing-frontend/package.json xinqing-frontend/package-lock.json* ./xinqing-frontend/
RUN npm ci && npm run build

# 回到后端目录
WORKDIR /app

# 创建数据持久化目录（Render 持久磁盘挂载点）
RUN mkdir -p /opt/render/project/.persist/data && \
    ln -sf /opt/render/project/.persist/data /app/data

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]
