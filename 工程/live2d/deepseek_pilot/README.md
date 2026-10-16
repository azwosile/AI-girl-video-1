# DeepSeek 娘 · Live2D 试点

技能：`fifteen42/live2d-from-art`（装在 `D:\DeepSeek Harness WorkSpace\.agents\skills\live2d-from-art`）
运行库：`vendor/live2dcubismcore.min.js`（Live2D 官方 Cubism Core 5.1.0，使用须遵守 Live2D Proprietary Software License）、`pixi.min.js` 6.5.10、`cubism4.min.js`（pixi-live2d-display 0.4.0）

## 文件
- `Reference.png`：原图（来自 `工程/mg/assets/chars/ds.png`，不覆盖）
- `prepare.py`：生成闭眼（左 / 右）、闭嘴补层 → `layers/`、`layout.json`
- `build_moc.py`：直接写 `runtime/DeepSeek.moc3` + 贴图 + model3 / motion3 / cdi3
- `validate.cjs`：用真实 Cubism Core 在 Node 里加载并检查参数（`node validate.cjs`）
- `index.html` + `preview.js`：网页预览（左原图 / 右模型，滑块、待机、模拟说话）
- `shoot.mjs`：无头 Chrome 截图验收；`check_*.jpg` / `shot_*.png` 是验收图

## 重建
```
python prepare.py && python build_moc.py && node validate.cjs
python -m http.server 8766   # 然后打开 http://127.0.0.1:8766/
```

## 验收结果（分三层报告）
- **可加载**：通过。Core 5.1 加载成功，MOC 一致性检查 = 1，4 个网格、7 个参数。
- **会动**：通过。眨眼（左右独立）、嘴巴开合、头部侧倾 ±10°、呼吸、身体重心、长发和鲸尾摆动。
- **好看**：试点级别。闭眼 / 闭嘴是"皮肤补层 + 画线"，近看能看出补层略平；左眼上有一缕头发会被补层盖住。头部只有侧倾（2D 旋转），没有转脸、眼球移动和眉毛。

## 想做到可上镜，还差这些
1. 用生图工具精修闭眼 / 闭嘴补绘（或手绘几笔），替换 `layers/` 里的三张 PNG
2. 把刘海、侧发、鲸尾拆成独立图层并补底，才能做真正的发丝物理和转脸
3. 眼白 / 虹膜分层 → 眼球跟随；眉毛分层 → 表情
4. VTube Studio 未测试；网页通过不等于 VTS 通过
