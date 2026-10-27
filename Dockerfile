FROM node:20-slim

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# 按锁文件安装依赖
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# 把 API 基地址写进 .env，供 Vite 开发服务器读取（练习用开发启动方式）
ARG VITE_API_BASE_URL=http://localhost:8000
RUN printf 'VITE_API_BASE_URL=%s\n' "$VITE_API_BASE_URL" > .env

# 容器内监听 0.0.0.0
EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
