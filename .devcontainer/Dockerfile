FROM node:20-slim

# 开发容器所需的基础工具：git 用于版本操作，ssh 用于访问私有仓库
RUN apt-get update \
    && apt-get install -y --no-install-recommends git openssh-client ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# 与运行时镜像使用同一包管理器版本，避免锁文件差异
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /workspace
