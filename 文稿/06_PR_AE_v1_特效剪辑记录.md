# 06 · PR / AE 特效剪辑 v1 记录（2026-10-18）

## 成片
- **成片**：`素材/示例镜头/江湖之间_成片_PRAE_v1.mp4`：1920×1080，30 fps，2720 帧，90.67 s，H.264 约 20 Mbps，AAC 48 kHz
- **MG 底板 v11**：`素材/示例镜头/示例_00-90_全片MG_v11_AI镜头全超分.mp4`。A09/S17/S19/S21 已换成 FlashVSR 超分版，S18 早已是超分版
- **AE 中间片**：`工程/ae/render/江湖之间_FX_v1.mov`（ProRes 422，1.7 GB）
- **AE 工程**：`工程/ae/江湖之间_FX_v1.aep`。生成脚本是 `工程/ae/gen_fx.py`，模板是 `build_fx_tpl.jsx`
- **PR 工程**：`D:\Adobe\Pr test\国模 江湖之间.prproj`
  - 素材箱：`江湖之间_AE特效成片_v1`
  - 序列：`江湖之间_AE特效成片_v1`

## 1. 超分（FlashVSR ×2，显存常驻）
- 四个对位片段共 356 帧，用时 61 分钟，全部 EXIT=0
- 超分后发现暗部平滑渐变上有方格纹（FlashVSR 分块的痕迹）。处理链是：缩放到 1080p（lanczos），再加 `deband=1thr=0.03:2thr=0.03:3thr=0.03:range=24:blur=1`。方格纹去掉了，细节没有损失
- S18 也补了同样的 deband
- 旧帧备份：
  - `assets/clips/<key>_lanczos/`
  - `s18v7_vsr_nodeband/`

## 2. 从参考项目 world.execute(me) 学到、并已用上的手法
参考项目的原则是：转场要有理由（由歌词或内容推动），不为装饰。切点卡在节拍或画面出现的那一刻；闪光要克制（≤0.3）；画面上要叠一层纸纹或颗粒质感。

| 参考手法 | 本片用法 |
| --- | --- |
| cut + flash（关键词重击） | S03、S07、S14、S15 切点白闪 0.18–0.28，滤色叠加，按指数衰减 |
| zoom（推进） | S06 Token 洪流、S10「追赶」：径向推进模糊，提前 0.25 s 加强，落在切点上 |
| glitch / slices（不稳定、出错） | S04、S11、S12、S13：7 条横向错位条，按 15 fps 跳变 |
| rgbSplit | AE 里先把画面拆成 R/G/B 三层再相加，按线索左右错开；只在切点和翻卡时出现 |
| shake | S09「¥6 涨价牌」砸下时（44.40）震屏 0.5 s |
| after-image（残影：同一画面晚几帧再画一遍） | S08 昙花：画面晚 2 帧和晚 4 帧的副本，分别以 30% 和 18% 叠在上面 |
| 掉帧感（`floor(t*12)/12`） | S13「Kimi 没了消息」：12 fps 抽帧 |
| scan（扫描线） | S12 终端 `.git` 段加 4 px 扫描线 |
| bloom / rays | 全片轻辉光（阈值 200，强度 0.15），重点处再加强。光线只用在 S16 揭开 1017 和 S21 DeepSeek 入场 |
| 纸纹 + 颗粒 + 暗角 | 分形纸纹以叠加模式盖 7%，每秒跳 12 次；另加 2.2% 颗粒和暗角 |
| 逐字卡点 | 副歌一「逃不过相忘江湖之间」每个字微推 1.2%；S15 四次翻卡，每次推 1.5% 加 RGB |

力度按中等设置：没有连续强闪，没有反相，全片最大闪光 0.28。

## 3. 关键时间（30 fps）
- **S09 副歌一的重击放在 44.13**：MG 在 43.9 时还是全黑，44.1 画面才出来，打在黑屏上白闪只会显得发灰。¥6 涨价牌的震屏在 44.40
- **切点**：
  - 5.6 / 11.2 / 16.9 / 22.9 / 28.3 / 32.7 / 47.5 / 50.4 / 55.4 / 59.0 / 61.7 / 66.9 / 70.4 / 73.3 / 75.8 / 78.2 / 81.8 都有对应处理
  - 38.6 和 84.8 本身是软转场，不加闪光
- **S21 辉光点**：86.18 帕累托最优、87.48 SOTA、87.95 V4.1 Pro 弧线

## 4. PR 部分
- V1 放 AE 中间片，A1 放歌曲 wav：从 `音频/江湖之间.mp4` 截取 0–90.67 s，转成 48 kHz 24 bit
- 21 个镜头的范围标记都带名称和备注，写明每个切点用了什么特效。副歌标红，超分镜头标蓝。可以直接当 B 站分段章节用
- Lumetri 颜色：对比度 +6，饱和度 104，黑色 −3
- 音频尾部：89.5 s 处 0 dB，90.6 s 降到 −40 dB
- 导出预设：`01 - Match Source - High bitrate`（H.264）

## 5. 工具链备注
- **PR MCP**：`full` 模式的工具列表有 2.2 MB，Bridge 接不住。所以在 `premiere-pro-mcp/dist/workflows/tool-packs.js` 里本地加了一个 `studio` 工具包（原文件备份为 `.orig`），共 69 个工具，含 `execute_extendscript`
  - 当前配置：`PREMIERE_MCP_TOOL_PACKS=studio`，`PREMIERE_MCP_CAPABILITIES` 加上了 `unsafe-script`
  - npm 升级后这个补丁会被覆盖，需要重打
- **PR 是中文界面**：MCP 里按英文效果名查找的工具（color_correct、add_audio_keyframes）会找不到属性。改用 ExtendScript，按 matchName 定位
  - 每次失败后，都要先 `inspect_operation_recovery`，再 `acknowledge_operation_recovery`，才能继续编辑
- **AE**：MCP 连接器只支持 MOGRT 模板，所以改用 `AfterFX.com -r xxx.jsx` 直接驱动正在运行的 AE 2026。jsx 文件必须带 UTF-8 BOM，不然中文会乱码
  - 渲染用 aerender，模板是「最佳设置」+「高品质」
- **重新出片**：
  1. 改 `gen_fx.py` 里的事件表
  2. 运行 `python gen_fx.py <底板mp4> <aep>`，生成 build_fx.jsx
  3. 用 `AfterFX.com -r` 跑这个 jsx
  4. aerender 渲染，PR 里替换素材后导出
