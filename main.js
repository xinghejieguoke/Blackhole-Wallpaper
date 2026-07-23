const { app, BrowserWindow } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    transparent: false,
    resizable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // 可选：不在任务栏显示
  // win.setSkipTaskbar(true);

  win.once('ready-to-show', () => {
    win.show();
    // 如果在 Windows 上想把窗口放到桌面后面，解除下面注释并安装依赖（ffi-napi/ref-napi）
    // tryAttachToDesktop(win);
  });

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (!win) createWindow();
});

app.on('window-all-closed', () => {
  // macOS 常见做法：保留 app 直到用户 Cmd+Q；这里直接退出以简化
  app.quit();
});

// 可选：在 Windows 上把 window 嵌入到桌面（Progman/WorkerW）—— 实现放在 setDesktopParent.js
function tryAttachToDesktop(browserWindow) {
  try {
    const setDesktop = require('./setDesktopParent');
    setDesktop(browserWindow);
  } catch (err) {
    console.warn('setDesktopParent 无法加载（可能缺少可选依赖或不是 Windows 平台）：', err && err.message);
  }
}
