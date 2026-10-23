# 角色标题、头像命名、手机相册入口

## 本次修改
- src/App.jsx：只将展示区域 NAI FROG 改为奶娃；右上角显示 name，
  空白时为未命名头像，原版状态为原版奶娃；保持原有省略号布局。
- src/features/faces/FaceEditor.jsx：将头像名称放到选图前即可填写的位置；
  用户输入名称后，后续选图/更换照片不会覆盖该名称。
  未输入时使用去扩展名文件名作建议，保存时 trim，空白回退未命名头像。
  原生 file input 支持 JPEG、PNG、WebP、HEIC、HEIF 与 HEIC/HEIF 扩展名，
  不设置 capture，避免限制成相机入口。
- src/features/faces/model.js：复用 name，兼容旧记录，空白名称回退，不清空数据库。
- src/features/faces/image.js：验证 MIME/扩展名、文件签名、空文件和 20 MB 限制。
  HEIC/HEIF 尝试浏览器原生解码，失败显示明确转换 JPG/PNG 的提示。
  EXIF 由浏览器正常解析，不另旋转；缩放保持原始比例。
  大于 1600px 或 1MB 的照片保存为本地压缩 WebP，编码不支持时浏览器回退 PNG。
  小照片保留 PNG 浏览器副本。没有第三方上传或新增解码服务。

备份：backups/name-album-20261023-175823。

## 验证
scripts/verify-name-album.mjs 使用隔离 Edge 配置，390×844：
- 奶娃、原版奶娃以及网站品牌未改验证通过。
- 选图按钮触发真实浏览器 filechooser 事件。
- 中文/英文/数字/表情名称，选图前命名、建议文件名、空白回退通过。
- 名称保存、切换、编辑、刷新、长名称省略和无横向溢出通过。
- 不可解码 HEIF 测试文件显示明确错误，不能保存空白头像。
  这是错误路径验证，不代表完整 HEIC 图像的正向解码已验证。
- 3200×2000 图片本地压缩为 1600×1000 WebP。
- 无旋转/EXIF 方向、旧头像、拖动缩放、三连拍和头像库回归通过。
- npm.cmd run build 成功。
报告：name-album-verification.json；截图：name-album-mobile.png。

## 尚未验证/限制
未使用实体 iPhone Safari 或 Android Chrome 测试系统照片图库界面。
采用原生文件选择控件，系统提供哪些相册/文件入口由设备和浏览器决定。
HEIC/HEIF 仅在当前浏览器本身能解码时成功，无额外 HEIC 解码依赖；
不支持时需从相册导出 JPG/PNG。没有声称支持所有 HEIC 变体。
保留现有单指拖动与缩放滑块；现有裁剪器没有双指缩放，本次未新增。
未改动角色原图、肚皮物理、动作配置或数据库结构，未部署。
