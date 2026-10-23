# 每头像独立好感度与臭鸡蛋

## 存储与 ID
localStorage 键 affectionByAvatarId，按真实头像 ID 保存。
原版为 original；内置为现有 builtin-friend-01 ... 08；个人使用原 UUID。
缺失记录显示 0，不预填示例分数。名称只用于显示，不参与存储键。
使用 BigInt 运算，以十进制字符串写 JSON，避免 Number 安全整数范围形成隐性上下限。
允许负数，不设分数上限/下限。浏览器配额或禁止存储导致保存失败时显示实际错误提示。
页面内两模块共享同一映射；不同头像不共享数值。
切换/恢复只切换显示，重命名不改变 ID。个人头像成功删除后，只移除该 ID 的分数与内存鸡蛋计数。
original 和 builtin-* 不允许普通个人删除操作清理。
头像库、内置资源和 IndexedDB 结构未改。

## 随机与结算
REWARDS=[26,32,606,5408]，Math.floor(Math.random()*4) 等概率选四档。
随机值在唯一结算入口抽取，不在 React state updater、渲染或 effect 中抽取。

拍肚：
复用原 taps/1200ms 窗口，第一下记录本轮头像 ID。
第三下等待真实冰冰冰 ended，原双跳仍为 1500ms × 2。
只在主播放器完整结束、interaction=laughing 且本轮未结算时加分一次。
先标记已结算再更新分数，重复回调无效；刷新/卸载取消 RAF，不会提前加分。
换头像导致新轮时绑定新 ID，不把旧轮转给新头像。
已移除的快捷大笑/换脸按钮没有恢复。

臭鸡蛋：
每颗投掷是一个带 ID、头像 ID 和开始时间的 ticket。
Canvas 2D requestAnimationFrame 绘制二次贝塞尔弧线，飞行 420ms，
击中后绘制卡通碎壳、绿色臭气，850ms 总时长后结束。
没有鸡蛋声音、外部素材、AI/图片识别或永久覆盖脸部的污渍。
受击时整张角色 Canvas 水平位移几像素，脸与身体始终是同一 Canvas。
每个头像另有独立鸡蛋命中计数，第三颗在 impact 回调扣一次，并将计数归零。
ticket.impacted 以及活动 ID 双重检查去重，完成/卸载清理 RAF。
鸡蛋未击中即被页面刷新中断，不结算该颗；计数只保存在当前页面内存。

## 协调与界面
复用 interaction phase：idle/tapping/waitingForBingEnd/laughing/eggFlying/eggHit。
等待音频和大笑时禁止鸡蛋；飞行/受击时禁止拍肚按钮和直接角色触摸。
活动互动期间锁定头像库/恢复按钮，并对选择/编辑/保存/删除处理做入口检查。
结算仍绑定互动开始的 ID，不依赖结算时当前头像。
好感度显示「♥ 当前头像的好感度：数值」，变化轻微弹动。
加分绿色 +数值 ♥，扣分红色 −数值 ♥，向上淡出。
底部两行等宽：拍肚子/丢臭鸡蛋；头像库/恢复原版。
保留半音量、原版图片、头像裁剪、uug 折叠/解锁与音效顺序。

## 修改文件
src/App.jsx：计分与互动状态、头像锁定、删除清理、显示与四按钮。
src/components/PetSprite.jsx：直接触摸与拍肚方法遵循 interactive 锁。
src/features/affection/useAffection.js：ID 映射、BigInt 持久化、随机值。
src/features/eggs/EggEffect.jsx：单 RAF 轨迹/命中/结束，清理与去重。
src/styles.css：计分、浮字、卡通效果图层和两行按钮样式。

## 已测试
scripts/verify-affection-eggs.mjs / docs/affection-eggs-verification.json：
- 原版及八张内置头像初始值 0。
- 单拍不加分、第三拍与第一跳均不加分，完整大笑只加一次。
- 四个随机区间仅得 26/32/606/5408。
- 前两颗不扣分，第三颗在击中时扣一次，可以为负。
- 互动互斥、进行中不能切换、快速额外输入无重复结算。
- 原版/阿蛋/忆安分数各自独立，切换及折叠不改变分数。
- 个人头像上传后初始 0，改名后分数不变；刷新保留。
- 删除个人记录只删对应分数，原版和内置分数仍在。
- 中断大笑没有加分。
- 超过 Number 范围的任意精度整数仍能精确持久化并扣分。
- 两个音量均 0.5，390×844 无横向溢出，无浏览器运行错误。
音效 ended 后双跳的全部成功/异常路径回归通过。
npm.cmd run build 成功。
测试使用隔离浏览器与可控随机数；没有为用户浏览器预填任何示例分数。
手机为 Edge 触摸模拟，未做实体 iPhone/Android 验证。
未部署、未推送 GitHub。
