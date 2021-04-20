const { app, Menu, dialog, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const child_process = require('child_process');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 630,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadFile('public/index.html');
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

Menu.setApplicationMenu(null);

ipcMain.on('error', function (event, message) {
  if (message === 'lack') {
    dialog.showErrorBox('错误', '缺少必要的数据');
  }
  if (message === 'format') {
    dialog.showErrorBox('错误', '数据格式错误');
  }
});

ipcMain.on('start', function (event, data) {
  var target_ip = data[0];
  var target_port = data[1];
  var bytes = data[2];
  var sleep_time = data[3];
  var process_num = data[4];
  var choice = data[5];

  if (choice === 1) {
    global.main_process = child_process.fork(path.join(__dirname, 'icmp.js'), [target_ip, bytes, sleep_time, process_num]);
  } else if (choice === 2) {
    global.main_process = child_process.fork(path.join(__dirname, 'udp.js'), [target_ip, target_port, bytes, sleep_time, process_num]);
  }
});

ipcMain.on('stop', function (event, data) {
  global.main_process.kill('SIGINT');
});
