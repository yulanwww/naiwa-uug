# 隐藏八人头像包：当前仅完成安全导出阶段

当前工具无法读取用户正在使用的 Codex 内置浏览器 IndexedDB。
隔离浏览器测试不能代表用户真实头像。因此依照用户指定顺序，先提供导出，等待真实 ZIP。
没有建立占位内置头像，也没有实施或宣称完成口令解锁。

## 用户操作
在已有八张头像的当前浏览器/相同地址打开：
头像库 → 开发者工具 → 导出头像包（八人 ZIP）。
文件名 naiwa-friends-avatar-pack.zip。请确认下载完成后提供该 ZIP。

严格按：阿蛋、凌瑞、软软、小小飞、忆安、小辞、卡密望、重阳。
缺少或同名多条时拒绝导出并指出名字，不自动猜测、不覆盖任何记录。

## ZIP 内容
images/01..08：原有 source 图片字节，不重新裁剪/压缩/识别人脸。
manifest.json：固定 order、稳定内置 ID、originalId、名称、图片路径，
crop、placement、anchors、其他原记录字段、字节长度及每张图片 SHA-256。
original-records.json：完整原始八条记录备份，包括原 source data URL 和未知/旧字段。
读取使用 readonly 事务，不修改原 faces 或当前 active 设置。
ZIP 使用标准 STORE 格式和 CRC32，不新增 npm 依赖。
开发入口只在 import.meta.env.DEV 显示，生产构建不显示。

## 修改
src/features/faces/storage.js：增加只读原始记录导出接口。
src/features/faces/exportPack.js：八人核对、原图解码验证、配置和 ZIP 生成。
src/features/faces/FaceLibrary.jsx：开发者工具入口及导出错误/下载提示。
scripts/verify-avatar-export.mjs：隔离测试，绝不访问当前用户浏览器的头像。

## 已验证
隔离测试数据：顺序、缺失校验、浏览器 download、ZIP 10 个文件 CRC、
8 张原图逐字节一致、SHA-256、裁剪/偏移/锚点/未知字段完整。
IndexedDB 所有原始记录及当前选择前后完全一致。
npm.cmd run build 成功。
未对用户真实八张头像验证完整性；等待用户导出文件。
测试 ZIP 已清理，不把测试头像当成真实内置资源。

## 下一阶段（尚未实施）
获得并确认真实 ZIP 完整后再转为 public/avatars 及配置，
实现统一口令、解锁持久化、内置/个人分区与原记录去重及完整验收。
纯前端口令仅是趣味界面解锁，不能提供真正照片访问保护；
public 文件知道地址即可获取，不是安全加密。
不清空或迁移 IndexedDB，不自动推送/部署。
