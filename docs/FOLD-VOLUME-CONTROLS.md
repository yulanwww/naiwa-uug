# 头像库收纳、音量与底部操作区

## 当前底部布局
第一行仅「拍肚子」「头像库」，等宽两列，8px 间距。
第二行仅「恢复原版」，grid-column:1/-1 占满。
只移除了大笑与换脸快捷按钮的 JSX/内联点击入口。
laugh 仍被三连拍使用；openEditor 仍被头像库上传/编辑使用，不能删除。
本次按钮修改仅触及 App.jsx 与 styles.css 的 controls 列数。

## 前一项优化
FaceLibrary.jsx 移除开发者工具和导出按钮，删除 exportPack.js 及专用导出测试。
storage.js 移除导出专用读取接口。
不删除内置资源，不写个人 faces；备份保留历史源码。
uug 使用语义 button，aria-expanded / aria-controls，双列头像卡片保持原样。
折叠时列表不渲染，不占高度，不影响 active 或解锁。
settings.friendsExpanded 只保存开合偏好；解锁成功原子写入解锁与展开一次。
App 持有开合状态，抽屉重新打开不会强制展开；刷新读回偏好。
styles.css 仅新增标题栏样式及将底部四列改两列。

## 音量
原两个 HTMLAudioElement 使用默认 volume=1。
源码没有 AudioContext/GainNode 或其他音频增益（spring.js 的 gain 是像素位移限幅）。
App 挂载时将两个音量设置为 0.5；绝对赋值避免 StrictMode 重复乘半。
没有改动音频文件、时长、速度、音调、循环、淡入淡出或播放入口。
浏览器实测两个 volume 均为 0.5、playbackRate=1、loop=false；原音频 SHA-256 不变。

## 验证
scripts/verify-fold-volume-controls.mjs：
- 三个按钮数量/标题，首行等宽同高位置，恢复按钮全宽。
- 开发者工具/导出按钮不存在。
- 口令解锁自动展开，uug 折叠后无卡片和高度，当前头像不变。
- 关闭抽屉再打开、刷新仍保持折叠，解锁不丢失。
- 展开恢复固定顺序和 aria-pressed 使用中。
- 头像库上传入口保留，390×844 无横向溢出。
- 两个音量为原来一半，MP3 字节未改。
音效顺序与两次跳跃通过 verify-sequential-audio.mjs 回归。
npm.cmd run build 成功。
未做实体手机音量或硬件输出验证，未推送/部署。
