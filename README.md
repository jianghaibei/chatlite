# ChatLite — 轻量版私人 ChatGPT 网页应用

> 一键部署你自己的 ChatGPT 网页版：填入 API Key 就能用，数据只存本地。
> Deploy your own private ChatGPT web app in minutes. Bring your own API key — all data stays in your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

灵感来自 NextChat 等优秀开源项目，本项目为独立重写的轻量实现，专注三件事：**轻、快、中文助手好用**。

## 特性 / Features

- 💬 **流式聊天**：调用 OpenAI Chat Completions API，逐字输出
- 🎭 **中文面具助手包**：短视频脚本师、小红书文案、英语教练、简历润色、代码助手、翻译官等 10 个预设助手，一键开聊
- 🗂️ **多会话管理**：新建 / 切换 / 删除会话，全部保存在浏览器 localStorage
- 🔐 **隐私优先**：API Key 和聊天记录只存你自己的浏览器，不经过任何服务器
- ⌨️ **斜杠提示词**：输入 `/` 快速调用常用提示词模板
- 📤 **导出 Markdown**：当前对话一键导出为 `.md`
- 🌙 **深色模式 + 手机适配**
- 🧪 **演示模式**：没有 API Key 也能打开体验界面和面具（回复为演示内容）

## 快速开始 / Quick Start

### 方式一：直接打开（演示 / 本地用）

用浏览器打开 `index.html`，点右上角设置，填入你的 OpenAI API Key，选择模型，即可开始聊天。

### 方式二：一键部署到 Vercel

1. Fork 本仓库到你的 GitHub
2. 打开 [vercel.com](https://vercel.com) → New Project → 导入这个仓库
3. Framework 选 **Other / Static**，根目录即网站根目录，不需要构建命令
4. Deploy 完成，打开 Vercel 给你的域名就能用（Key 在页面设置里填，只存访问者各自的浏览器）

### 方式三：GitHub Pages

仓库 Settings → Pages → Source 选 `main` 分支根目录，保存后即可通过 `https://<用户名>.github.io/chatlite/` 访问。

## 模型 / Models

默认 `gpt-4o-mini`，可在设置里切换 `gpt-4o`、`gpt-5` 等，也支持任何兼容 OpenAI 格式的接口地址（设置里的 Base URL）。

## 项目结构

```
index.html      页面
css/style.css   样式
js/masks.js     面具助手包（欢迎 PR 增补）
js/app.js       聊天 / 会话 / 流式输出 / 导出逻辑
docs/           部署与贡献说明
```

## 路线图 / Roadmap

- [x] v0.1 MVP：聊天、多会话、面具、导出、演示模式
- [ ] 对话自动总结标题、长对话上下文压缩
- [ ] 图片上传（视觉模型）
- [ ] 语音输入
- [ ] 更多社区面具包

## 贡献 / Contributing

欢迎 PR：新增面具（改 `js/masks.js`）、修界面、加语言。见 [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)。

## 许可证 / License

MIT — 见 [LICENSE](LICENSE)。本项目与 OpenAI、NextChat 无隶属关系；ChatGPT 是 OpenAI 的商标。
