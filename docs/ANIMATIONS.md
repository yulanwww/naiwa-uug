# 原版动画分析

来源提交：3aebf5e7cdc5979bec06afe57194b60b3edf7cdd
pet.json 的 id 为 nailong，displayName 为奶蛙，spriteVersionNumber 为 2。
没有显式 animations、动作名称、帧数、时长或 FPS。
精灵图为 1536×2288，8 列 × 11 行，单格 192×208。
以下依据本地 v2 布局规范并对原图逐行目视核对；动作标签并非 pet.json 提供。

| 行（从 0 开始） | v2 状态 | 标准帧数 | 原图内容 |
| --- | --- | --- | --- |
| 0 | idle | 6 | 站立、呼吸与眨眼；原图另在第 7 格有一幅站立图，本项目按标准播放前 6 帧 |
| 1 | running-right | 8 | 向右走跑 |
| 2 | running-left | 8 | 向左走跑 |
| 3 | waving | 4 | 挥手 |
| 4 | jumping | 5 | 捧肚张嘴大笑并跳起；作为 Laugh 测试播放 |
| 5 | failed | 8 | 低头、沮丧、蹲下 |
| 6 | waiting | 6 | 等待、请求 |
| 7 | running | 6 | 思考、处理任务 |
| 8 | review | 6 | 检查、审视 |
| 9–10 | look directions | 16 | 环视方向姿势，属于方向帧而非普通循环动作 |

没有独立名为 Laugh 的配置；原版第 4 行明显呈现捧肚大笑，因此映射为 laugh，
不是新增或生成动画。页面只开放 idle 与 laugh，其余动作尚未接入 UI。
Idle 采用 6 FPS，Laugh 采用 8 FPS；这些是本项目选择的预览速度，不宣称为作者原始时序。
播放使用 requestAnimationFrame 和真实时间，逐格裁切，防止相邻帧混入。
Laugh 完整播放 5 帧后自动返回 Idle；组件卸载时清理动画循环。
原始 WebP 字节没有修改，未修复或补画多余/缺失帧。
