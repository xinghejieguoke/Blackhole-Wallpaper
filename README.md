// BlackHoleWallpaper (Electron)

说明：
- 这是一个示例 Electron 项目，展示“桌面黑洞”动效并演示如何把窗口尽可能放到桌面背后（Windows 可选）。
- 开发/测试环境：Node >=16, npm 或 yarn。Windows 用户若需要桌面嵌入需额外安装可选依赖。

快速运行：
1. 克隆或把本示例文件放到目录。
2. 安装依赖：
   npm install
   # 如果需要 Windows 桌面嵌入（可选）：
   npm install ffi-napi ref-napi --save-optional
3. 启动：
   npm start

打包（使用 electron-builder）：
1. 安装 dev 依赖（已在 package.json 声明）
2. 构建：
   npm run dist
3. 生成的发行包位于 dist/ 下（取决平台）

Windows 桌面嵌入：
- 取消 main.js 中 tryAttachToDesktop 调用的注释，在 Windows 环境下安装 optional dependencies（ffi-napi/ref-napi）。
- 测试并在多台系统上验证行为。

能耗与性能：
- 若希望降低功耗，把 script.js 中 fpsLimit 调到 30 或更低。
- 在窗口不可见或屏保不活动时暂停渲染：可监听 document.visibilityState。

如需：
- 我可以把这个项目直接生成并 push 到你指定的 GitHub 仓库（请提供 owner/repo），或把完整项目打包为 ZIP 发给你。
- 我也可以：完善 Windows 本地模块的稳定实现（使用 node-gyp C++ addon 或 prebuild），或给出 electron-builder 的更详细签名与发布配置.
