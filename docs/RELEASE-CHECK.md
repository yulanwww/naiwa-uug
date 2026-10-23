# 发布前检查结果

日期：2026-10-23

## 已通过（生产构建）
- npm run build 成功。dist 中 26 个 public 静态资源逐个 SHA256 与源文件一致，HTTP 全部 200。
- 包含 8 张内置头像与参数、5 个 MP3、9 张鸡蛋透明图片及角色原始 sprite/配置。
- 隔离新浏览器初始锁定；错误大小写口令拒绝，uugnb 解锁；八张顺序和切换正确，解锁/折叠刷新保持。
- 个人上传、命名、保存、刷新读取和原版恢复正常。
- 使用 390×844 触摸模拟测试生产构建：3/6/9 颗并发、扣分 1/2/3 次、音效自然重叠、资源清理、头像独立、单头像重置、拍肚子双跳与加分均通过。
- 没有浏览器运行错误或资源 HTTP 错误，没有横向溢出。
- src、public JSON 与 dist 的 HTML/JS/CSS/JSON 未发现 C:/D: 绝对引用或 file://；未发现开发者导出入口及常见私钥/GitHub/AWS/OpenAI 密钥模式。
- 本地根目录未发现 .env、私钥、Vercel 项目关联文件。常见密钥扫描不能保证发现所有类型凭据。

## 发布排除
.gitignore 已补充 backups、.vercel、本地环境与密钥文件、测试截图及结果；原始文件保留。已有 .qa、node_modules、dist、日志排除规则保持。
历史 docs 和本机 QA 脚本仍包含本机运行路径，未被网站构建引用或打包。
内置八人头像是明确准备公开的静态资源，前端口令不是加密访问控制，资源地址可直接访问。需要确保相关照片及音效有公开使用许可。

## 尚未满足的发布条件
1. D:/naiwa 不是 Git 仓库，没有 .git 或 GitHub remote；未创建仓库、未提交或推送。需要用户提供现有仓库 URL。
2. 未发现 Vercel 本地关联，且无法由 Git remote 确定远端部署，所以未确认自动部署或最终 URL。
3. 上游 https://github.com/Nitrogen216/awesome_pets 的现行 README License 仍写未添加许可证、权利归作者。项目没有公开再分发授权记录；需要用户确认已获授权后再正式发布。
4. 未使用实体 iPhone/Android 测试。当前为 Edge 移动视口及触摸模拟。

测试全部使用隔离浏览器上下文及本机生产预览 4173，没有修改用户当前 5173 浏览器的 IndexedDB 或 localStorage。

相关脚本：scripts/verify-release.mjs、scripts/verify-concurrent-eggs.mjs。
相关报告：docs/release-audit-results.json、docs/concurrent-eggs-results.json（本地 QA，已忽略）。
