# 第三方素材与使用范围

根目录 LICENSE 保留远程仓库原有 MIT 文本，未修改。该文件不应被理解为对第三方素材、照片或音频另行授予 MIT 权利。

## 原版奶蛙
- 文件：public/naifrog/pet.json、public/naifrog/spritesheet.webp。
- 来源：https://github.com/Nitrogen216/awesome_pets 。下载记录提交为 3aebf5e7cdc5979bec06afe57194b60b3edf7cdd。
- 上游 README 明确尚未添加许可证、权利归仓库所有者。当前项目没有可验证的公开再分发授权记录，正式公开前需要确认授权。

## 八人内置头像
- 文件：public/avatars/01.webp、02.webp、03.webp、04.webp、05.png、06.webp、07.webp、08.webp，以及 manifest.json 中的显示、裁剪及定位参数。
- 固定顺序：阿蛋、凌瑞、软软、小小飞、忆安、小辞、卡密望、重阳。
- 来源：用户导出的原有头像包，未根据截图替代。公开图片前应确认相关图片及肖像的使用许可。
- 前端口令仅为趣味解锁，不能提供真正访问保护；仓库公开或资源部署后可通过文件地址直接获取。

## 用户提供的音效
- public/audio/bingbingbing.mp3
- public/audio/laugh.mp3
- public/audio/egg-crack.mp3
- public/audio/affection-plus.mp3
- public/audio/affection-minus.mp3

均保留用户提供的原始内容。本项目没有独立验证这些音频的来源或公开传播许可。

## 鸡蛋特效
- public/effects/egg-stages.png、egg-00.png 至 egg-07.png、manifest.json。
- 来源：用户提供的 AI 素材合集前两行，经透明抠图与阶段整理。未使用第三、四行。
- 原图及编辑结果的公开使用条件需由素材提供者确认。

## 不随代码提交的本地数据
个人上传头像与好感度存储在浏览器 IndexedDB/localStorage；本次 Git 操作不读取、导出、清空或上传这些浏览器数据。
本地备份、浏览器测试 profile、日志、测试截图/动图、结果 JSON、环境变量文件及密钥文件均应保留在忽略范围内。
