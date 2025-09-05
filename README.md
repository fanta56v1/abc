# ABC Learning (A–Z 字母听读小游戏)

一个用 **HTML + CSS + JavaScript** 实现的轻量字母学习小程序。支持点读字母、朗读提示、大小写切换、开始/重复一轮练习、正确数统计，并针对 **iPad/Safari** 做了 TTS（语音合成）与屏幕常亮优化。已支持 **PWA**（可“添加到主屏幕”离线使用）。

> 在线演示（GitHub Pages）  
> https://fanta56v1.github.io/abc/  
> 如果你 fork 了本仓库，请将上面链接中的 `fanta56v1/abc` 替换为你的用户名和仓库名。

---

## ✨ 功能特性

- **A–Z 网格**：点击任意字母即可播放对应读音  
- **朗读提示**：`Listen` 按钮播报指令，点击正确字母加分  
- **大小写切换**：`大写 / 小写` 两个按钮即时切换展示  
- **开始/重复**：`Start` 开始新一轮、`Repeat` 重播当前提示  
- **统计反馈**：底部显示已答对数量、可选庆祝动画（如烟花）  
- **iPad/Safari 适配**：避免读出 “Capital A”，保证直接读字母读音  
- **PWA 支持**：`manifest.webmanifest` + `icons`，可添加到主屏幕离线使用  
- **可选常亮**：启用 Wake Lock，练习中不熄屏（受浏览器支持限制）  

---

## 🖥️ 使用方法 / 开发

### 本地打开
1. 直接双击 `index.html` 用浏览器打开（推荐 Chrome/Edge/Safari）。
2. 若需要 PWA/跨文件加载的完整行为，建议使用本地服务器：
   ```bash
   # 任一方式任选其一
   # Python
   python -m http.server 8000
   # Node
   npx serve .
   # 或 VS Code Live Server 扩展
