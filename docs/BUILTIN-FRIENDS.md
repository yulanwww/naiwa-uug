# 八人内置隐藏头像包：完成

## ZIP 核对与导入
来源 D:/Downloads/naiwa-friends-avatar-pack.zip。
ZIP CRC、8 个原图 SHA-256、字节长度均通过；原图与 original-records.json 的 source 字节相同。
crop、placement、anchors 与原始记录逐项一致，未自动识别、重新裁剪或压缩。
资源：public/avatars/01.webp ... 08.webp（05 为 PNG）。
唯一内置配置：public/avatars/manifest.json，含稳定 ID、originalId、name、
source/imagePath、固定 order、原裁剪/缩放/偏移/锚点及校验值。
顺序严格为：阿蛋、凌瑞、软软、小小飞、忆安、小辞、卡密望、重阳。

## 解锁与选择
头像库提供「解锁隐藏头像」，口令区分大小写，正确后一次解锁全部头像。
口令没有直接显示在页面上。错误显示「口令不正确，再试一次」。
解锁成功写入原 IndexedDB settings.friendsUnlocked=true，不改 active。
刷新和关闭浏览器重开仍有效；清除网站数据后恢复锁定。
解锁标记不按头像包版本限制，将来新增配置头像可直接展示。
解锁本身不强制切换当前头像。首次新浏览器默认原版奶娃。
内置头像按 order 显示，不显示编辑或删除；个人头像保留原增删改查。
选择内置 ID 沿用 active 记录；锁定时不恢复内置脸部，不泄露卡片缩略图/名字。

## 原数据不删除与去重
所有原 faces 记录保留在 IndexedDB，不迁移、不覆盖。
匹配原始 originalId 的本地副本仅在界面隐藏，未解锁也不会从个人区露出。
还可按图片 SHA-256+完全相同裁剪参数识别新 ID 的精确副本。
非安全 HTTP 环境若无 crypto.subtle，降级只按 originalId 去重，不阻断个人头像。
不同照片/不同裁剪的其他个人头像仍显示，可编辑删除，不会加入公共包。
旧 active 指向原副本时保留原设置值；解锁后刷新可映射对应内置头像。

## 修改文件
- public/avatars/：8 张真实图片、manifest.json。
- src/features/faces/builtinFaces.js：读取配置、缩略图、口令比较、去重匹配。
- src/features/faces/storage.js：独立解锁设置键，未改变库版本或 faces 数据。
- src/features/faces/FaceLibrary.jsx：解锁入口与内置/个人双列卡片分区。
- src/App.jsx：持久解锁初始化、选择/恢复、禁止修改内置头像及去重展示。
- vite.config.js：忽略 .qa 和 backups，避免开发服务器监视测试配置的锁定数据库而退出。
- .gitignore：忽略隔离测试浏览器 .qa/。
测试脚本 scripts/verify-friends-pack.mjs 使用专用 .qa 配置，未连接用户实际浏览器。

## 已验证
- 新访客原版默认、锁定无八张头像名字/缩略图。
- 错误大小写不能解锁，正确口令一次展示八张，顺序固定。
- 解锁不改当前选择，不写 active。
- 八张均能切换，刷新仍解锁并保持顺序与选择。
- 实际关闭 Edge 浏览器进程再用同一隔离配置打开，解锁仍保留。
- 内置头像没有编辑/删除入口，App 同时校验内置标记。
- 原版恢复、个人上传/命名/编辑/删除通过。
- 原记录和 active 不因解锁而改变；旧副本及不同 ID 精确副本去重通过，记录仍存在。
- 两轮大笑共 10 个姿态均有照片跟随，无旋转、无非等比拉伸。
- 冰冰冰真实 ended → 大笑双跳顺序与错误降级回归通过。
- npm.cmd run build 通过，public 与 dist 八张图哈希匹配 ZIP。
报告 docs/friends-pack-verification.json、docs/sequential-audio-verification.json。
390×844 桌面 Edge 手机触摸模拟；未使用实体 iPhone/Android。

## 安全边界
这是纯前端趣味口令，不是照片访问保护或加密。
public 头像与 manifest 可通过地址直接访问，口令逻辑也可检查。
不要将界面隐藏理解为安全访问控制；未部署后端，未自动发布网站。
