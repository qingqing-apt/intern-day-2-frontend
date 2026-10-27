# intern-day-2-frontend

实习生第二天练习 · 前端应用：React + TypeScript + Vite，主题为**服务器监控台**——登录后展示后端实时采集的服务器指标。

## 功能范围

- 账号密码登录页（必填校验、加载状态、错误提示、密码框）
- 登录状态管理：刷新页面重新向后端校验；401 自动清理并回到登录页
- 退出登录（调用后端登出接口后清理本地状态）
- 登录后的监控仪表盘（自选功能）：
  - CPU / 内存 / 磁盘 / 系统运行时长统计卡片（含迷你趋势线）
  - CPU 与内存最近 10 分钟趋势图（手写 SVG 折线图，无图表库依赖）
  - 网络收发总量、采样间隔、累计样本数
  - 每 5 秒自动轮询刷新

所有监控数据均来自受保护的后端接口，未登录无法访问（路由守卫 + 后端 401 双重防护）。

## 开发环境进入方式

本仓库开发容器基于第一天的 `git-base:1.1` 镜像构建（已内置 git 2.34.1 与团队 GitHub 只读密钥），在上层追加 Node.js 20 与 pnpm 9（版本在 `.devcontainer/Dockerfile` 中用 ARG 固定）。

前置条件：

1. 本机已导入基础镜像：`docker load -i git-base-1.1.tar.gz`
2. VS Code 已安装 Dev Containers 扩展
3. 在容器内配置自己的 git 身份与推送密钥（基础镜像内置的密钥只读，不能 push）：

```bash
git config --global user.name  "你的名字"
git config --global user.email "你的邮箱"
ssh-keygen -t ed25519   # 公钥添加到个人 GitHub 账号
```

操作：VS Code 打开本仓库目录 → 命令面板 → `Dev Containers: Reopen in Container`。容器创建后会自动执行 `pnpm install`。

> 注意：本仓库尚未提交 `pnpm-lock.yaml`，首次进入容器后 `pnpm install` 会自动生成，请将锁文件提交进仓库（CI 与镜像构建依赖 `--frozen-lockfile`）。

## 独立启动命令

在本仓库根目录执行：

```bash
docker compose up --build -d
docker compose ps
docker compose logs --tail=100
```

前端服务监听 `0.0.0.0:5173`，映射到宿主机 `5173`。这是**练习用 Vite 开发服务器**启动方式（README 需明确的说明），源码通过 `./src` 挂载支持热更新。

本地开发（不进 compose）也可以在容器内直接 `pnpm dev --host 0.0.0.0`。

## 配套仓库与联调版本

- 配套后端仓库：https://github.com/qingqing-apt/intern-day-2-backend
- 联调方式：**浏览器直连宿主机端口**。页面走 `http://localhost:5173`，API 请求走 `http://localhost:8000`（后端 Compose 映射端口）；两个 Compose 项目互相独立，不共享服务发现，因此 API 基地址必须使用宿主机视角地址，不能写容器名
- API 基地址通过构建参数注入：`compose.yaml` 的 `VITE_API_BASE_URL`（默认 `http://localhost:8000`），镜像构建时写入容器内 `.env` 供 Vite 读取
- 后端 CORS 已放行 `http://localhost:5173`
- 实际联调使用的双方分支/提交版本：`feat/login-and-custom-feature`（联调时填写具体 commit）

## 访问地址

- 前端页面：http://localhost:5173
- 后端接口文档（配套仓库启动后）：http://localhost:8000/docs

## 练习账号

后端服务首次启动时自动创建（虚构数据）：

- 账号：`intern`
- 密码：`intern-pass-123`

## 登录状态方案

- 登录成功后后端签发随机不透明令牌，前端保存在浏览器 `localStorage`
- 封装了 `api()` 请求函数：自动携带 `Authorization: Bearer <token>` 头；收到 401 时清理本地令牌并派发全局事件，路由守卫随后跳转登录页
- **刷新页面行为**：重新加载后若本地有令牌，先调用 `/auth/me` 向后端校验，通过则保持登录，失败则清理并回登录页——不依赖前端标志认定已登录
- 未登录访问功能页由 `RequireAuth` 重定向到 `/login`（体验层防护，真正的拦截在后端）

## 数据保存方式

- 前端不持久化任何业务数据，仅保存登录令牌（localStorage）
- 监控数据全部实时来自后端 SQLite，刷新页面只重新拉取，不做本地缓存

## 自测记录

（联调完成后填写：正常登录 / 错误密码统一提示 / 未登录访问功能页 / 伪造与过期凭证 / 退出后旧凭证 / 后端暂停时的失败提示 / 重建容器后复现）

## 已知问题与限制

- 练习用 Vite 开发服务器启动，未做生产构建部署
- 趋势图按最近 10 分钟窗口展示，更长时间窗口需调 `minutes` 参数
- 页面未做移动端适配
