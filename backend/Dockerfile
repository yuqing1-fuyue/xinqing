FROM node:18-alpine

# 安装 better-sqlite3 编译依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制依赖定义文件
COPY package.json package-lock.json* ./

# 安装所有依赖（包含 devDependencies，因为 better-sqlite3 需要编译）
RUN npm install && npm cache clean --force

# 复制源代码
COPY . .

# 创建数据持久化目录（Render 持久磁盘挂载点）
RUN mkdir -p /opt/render/project/.persist/data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/index.js"]
