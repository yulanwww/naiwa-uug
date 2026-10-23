# naiwa · 本地互动奶蛙
现有 React + Vite + JavaScript 项目，仅限本地开发。

## 运行
npm.cmd install
npm.cmd run dev -- --port 5173 --strictPort
预览：http://127.0.0.1:5173/
构建：npm.cmd run build
本机 Node.js 24.22.1 / npm 11.19.1，无新增系统软件。

## 互动
拍奶油色肚皮会实际压缩原图网格和奶油色轮廓，然后弹性回弹。
1.2 秒内三连拍触发原版捧肚大笑；也可使用「大笑」按钮。
照片换脸只支持平移、等比例缩放和固定圆形遮罩，绝不额外旋转或拉伸。
照片由浏览器正常处理 EXIF，最终保持相册显示的方向。
编辑器支持鼠标和单指拖动、透明留白、重置位置、整体/逐帧位置与等比尺寸校准。
头像库支持保存、命名、切换、编辑、删除和恢复原版；刷新保留当前选择。
裁剪位置、缩放、照片和锚点保存在当前浏览器/当前源的 IndexedDB。
旧头像的角度被忽略，源照片和其他有效数据保留，不清空数据库。
照片不会上传。共享同一浏览器配置/地址会共享此头像库，清除网站数据会删除头像。
导入 JPG/PNG/WebP，HEIC/HEIF 尝试原生解码，不支持时提示导出 JPG/PNG。最多 20 MB，最长边缩至 1600 px，大照片本地压缩为 WebP。
展示区左上角为奶娃；右上角显示可编辑头像名称。详见 docs/NAME-ALBUM.md。
真实用户照片需要手动定位；不自动识别人脸，也不生成眨眼/说话表情。

## 说明与验证
最新实现、根因、修改文件、备份位置与限制：
docs/LOCAL-FIXES.md
docs/PHASE2.md 是第二阶段最初实现的历史记录，旋转和肚皮实现以 LOCAL-FIXES.md 为准。
QA 脚本使用本机已存在的 Playwright/Edge 路径：
node scripts/verify-no-rotation.mjs
node scripts/verify-jelly.mjs
node scripts/verify-phase2.mjs
node scripts/verify-render.mjs
node scripts/inspect-anchors.mjs
已通过 390×844 浏览器鼠标/触摸模拟，未做实体手机验证。

## 素材权利
public/naifrog/pet.json、spritesheet.webp 是上游未修改原文件。
来源：https://github.com/Nitrogen216/awesome_pets
提交：3aebf5e7cdc5979bec06afe57194b60b3edf7cdd。
没有开源许可证，作者保留权利；不构成公开部署、再分发或商业使用授权。
上游说明：docs/UPSTREAM-README.md。
未重新生成角色，未引入 3D，未修改其他项目或部署网站。


## 冰冰冰音效
每轮连击第一拍播放用户提供的原始 MP3，后两拍不重播；新轮复用同一音频元素。
说明与验证见 docs/SLAP-AUDIO.md。

## 连续两次大笑跳跃
三连拍后原版跳跃播放两轮，每轮 1.5 秒，总计 3 秒；
第三拍等待冰冰冰真实 ended 后，再播放用户提供的 laugh.mp3 一次并开始双跳。
大笑音频约 3.180 秒，动作后尾音自然结束。详见 docs/DOUBLE-LAUGH.md。

音效顺序与异常处理最新说明：docs/SEQUENTIAL-AUDIO.md。

## 八人隐藏头像
头像库 → 解锁隐藏头像，正确口令后解锁全部内置朋友头像，当前浏览器永久记住。
内置顺序与真实图片、裁剪参数保存在 public/avatars/manifest.json。
原本地头像仅做去重展示，不删除 IndexedDB；个人头像功能保留。
纯前端口令不是加密保护，知道 public 地址仍可获取图片。
详见 docs/BUILTIN-FRIENDS.md。

## 独立好感度
每个头像按真实 ID 独立存储好感度：localStorage.affectionByAvatarId。
原版为 original，重命名不丢失；完整双跳后随机加分，三次鸡蛋命中后随机扣分。
随机档位 26/32/606/5408，支持负数与任意精度整数。详见 docs/AFFECTION-EGGS.md。
