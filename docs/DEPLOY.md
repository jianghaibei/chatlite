# 部署指南 / Deploy

## Vercel（推荐）
1. Fork 本仓库
2. vercel.com → Add New → Project → 选择 chatlite 仓库
3. Framework Preset 选 Other，Build Command 留空，Output Directory 留空（根目录）
4. Deploy。完成后用 Vercel 域名访问，在页面「设置」里填各自的 OpenAI API Key

注意：不要把 API Key 写进代码或 Vercel 环境变量后公开给所有访客共用——本应用的设计是每个访客在自己浏览器里填自己的 Key，只存本地。

## GitHub Pages
Settings → Pages → Build and deployment → Source: Deploy from a branch → main / (root) → Save。
约 1 分钟后访问 https://<你的用户名>.github.io/chatlite/

## 本地
直接双击 index.html，或在仓库根目录跑：python3 -m http.server 8000 然后打开 http://localhost:8000
