FROM git-base:1.1

# 在第一天的基础镜像上追加 Node.js 与 pnpm，版本通过 ARG 固定
ARG NODE_VERSION=20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && corepack enable \
    && corepack prepare pnpm@9.15.0 --activate \
    && rm -rf /var/lib/apt/lists/*
