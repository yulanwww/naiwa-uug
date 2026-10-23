# 冰冰冰拍肚音效
用户 MP3 原样复制到 public/audio/bingbingbing.mp3。
浏览器地址 /audio/bingbingbing.mp3，Vite 响应字节与源文件一致。
SHA-256: CD81C6E0BCE7AA01952FEF3933C3BFC1DE96E80B5CB8A52D7F2897C2447261E0
原音频约 1.020227 秒；未转码、剪辑或改变速度、音调。

## 修改代码
src/App.jsx：
一个隐藏的持久 audio 元素，preload=auto、loop=false。
使用原 taps.current、1200ms 过滤窗口及 tapTimer，无新增计数器或音效计时器。
先过滤过期拍击；数组为空时播放一次，再添加本次拍击。
数组非空时是本轮后续拍击，不调用 play、不设置 currentTime。
第三拍沿用原逻辑触发大笑并清空计数，大笑期间原来的拍击保护继续生效。
原超时清空计数或大笑结束后，新轮首拍可重新播放。卸载时暂停。
没有新增 touchstart/click 音效监听。

src/features/audio/slapSound.js：
只操作唯一 audio 元素，不创建 Audio 对象。
新轮才 pause、currentTime=0、play，同一元素不会有多个实例叠加。
播放在真实用户拍击/按钮点击同步链内发起，不绕过自动播放限制。
不等待加载或 play Promise，捕获失败，避免阻塞果冻动画和大笑。
不循环，不修改音量、播放速率或音调。

## 验证
脚本 scripts/verify-slap-audio.mjs；报告 docs/slap-audio-verification.json。
Edge 实际解码、playing/ended 事件与用户激活状态验证通过：
- 单拍立即播放并自然结束；双拍/三拍只播放一次，第三拍正常大笑。
- 大笑期间拍击不重播，结束后新轮可播放。
- 原 1200ms 超时之后再拍，会启动新轮音效。
- 测试中人为提前结束音频，同轮后续拍击仍不重播；生产代码无提前结束操作。
- 肚皮外无声；按钮与触摸共享拍击入口。
- 单 audio，rate=1、loop=false，不叠加。
- 模拟播放被拒绝后，大笑仍正常。
- 换脸后、刷新后仍可播放；头像存储和原互动回归通过。
- npm.cmd run build 成功。

未使用实体 iPhone Safari / Android Chrome，也未人工试听扬声器输出。
不能保证所有设备的系统音量、静音或音频策略都允许出声。
播放器遵循浏览器权限，失败不自动重试或绕过限制。
未修改布局、角色、换脸、肚皮物理或数据库，未增加依赖或部署。
