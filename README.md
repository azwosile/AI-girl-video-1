# AI娘 · 江湖之间

一支 90 秒、16:9 的 AI 娘混剪，配乐《江湖之间》，讲国产大模型这一年的起落。分三幕：

| 幕 | 主题 | 内容 |
|---|---|---|
| 一 | 过去的惊艳 | DeepSeek R1 横空出世并普及 CoT、Qwen3.8 27B 消费级显卡可跑、GLM-5.3、Kimi K3 开源逼近 Opus、Seedance 2.5 领跑 |
| 二 | 现在的落寞 | DeepSeek V4-Pro-0813 涨价 + 神区二相性、Qwen3.8-Max 前端不如自家 Flash、GLM Zcode 上传用户 git 工作区、Kimi K2.8 之后没了消息、豆包「唐」梗 |
| 三 | 未来的展望 | DeepSeek V4.1 Pro、Qwen 4、GLM 5.5、Kimi K3.1；字节：Seed 娘一句「别等了，睡吧」 |

GPT 娘、Claude 娘作为对照组贯穿全片。字幕只有歌词，用艺术字。

## 目录

| 路径 | 内容 |
|---|---|
| `文稿/` | 文稿与分镜（v3 为当前版）、AI 视频清单与 H3 提示词、歌词 srt、修改说明 |
| `Ai娘图片/` | 各家 AI 娘立绘；`DeepSeek_表情差分/` 是 DeepSeek 娘的得意 / 沮丧 / 惊慌 / 归来挥手四张透明底差分 |
| `工程/mg/` | 非 AI 镜头的 MG 引擎：`lib.js`（组件）、`shots.js`（S01–S15 每个镜头）、`film.html`、`render.mjs`（逐帧确定性渲染成视频） |
| `工程/comfy_mcp/` | 本地 ComfyUI 的极简 MCP 服务器 + 客户端，MiniMax H3 图生视频工作流（API 格式）和 A14 提示词 |
| `工程/scripts/` | 辅助脚本（Premiere FCP7 XML 生成等） |
| `工程/审查_无AI镜头_v*.xml` | 导入 Premiere 的审查序列（带镜头标记） |
| `工程/live2d/` | Live2D 试验（已搁置），只保留代码，不含 Cubism Core |
| `素材/截图/` | 官网 / 新闻 / 榜单截图 |
| `素材/AI镜头/` | 本地 ComfyUI + MiniMax H3 生成的 AI 镜头 |
| `素材/字体/` | 志莽行书 ZhiMangXing（SIL OFL） |

## 渲染非 AI 部分（0–70.4 s）

需要 Node 18+、Chrome、ffmpeg。歌曲文件不在仓库里，请自备放到 `音频/江湖之间.mp4`。

```bash
cd 工程/mg
npm install
node render.mjs 0 70.4 ../../素材/示例镜头/示例_00-70_非AI镜头.mp4 --audio ../../音频/江湖之间.mp4
```

## 没有放进仓库的内容

- 成片与示例视频（最新 v5 放在 Releases 附件）
- 《江湖之间》原曲
- 第三方 B 站视频原片（S11 只用了几帧截图，出自 UP 主 无机酸-_- 的 BV1katJ6cEwk）
- Premiere 工程文件

角色立绘、截图和引用素材的版权归各自作者 / 厂商所有，本仓库只作个人创作记录。
