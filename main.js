const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs')
const os = require('os')

// ===== APP INFO =====
const APP_NAME = 'Prevensso Pro'
const APP_VERSION = app.getVersion()
const LOG_FILE = path.join(app.getPath('userData'), 'prevensso-log.txt')

// ===== WINDOWS =====
let mainWindow = null
let splashWindow = null
let updateWindow = null

// ===== LOGGER =====
function log(msg) {
  const ts = new Date().toISOString()
  const line = `[${ts}] ${msg}\n`
  try { fs.appendFileSync(LOG_FILE, line) } catch(e) {}
  console.log(line.trim())
}

// ===== SPLASH =====
function createSplash() {
  splashWindow = new BrowserWindow({
    width: 520, height: 340,
    frame: false, resizable: false, center: true,
    alwaysOnTop: true, backgroundColor: '#0d1b3e',
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  })
  splashWindow.loadFile('splash.html')
  splashWindow.setSkipTaskbar(true)
  log('Splash screen iniciada')
}

// ===== MAIN WINDOW =====
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 1000, minHeight: 700,
    show: false, center: true, backgroundColor: '#f0f4fb',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: `Prevensso Pro v${APP_VERSION}`,
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  mainWindow.loadFile('Prevensso_Pro_v2.html')
  log('Ventana principal creada')

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.destroy()
        splashWindow = null
      }
      mainWindow.show()
      mainWindow.maximize()
      log('Plataforma lista')
      // Check for updates after window shows
      setTimeout(() => checkForUpdates(false), 5000)
    }, 3000)
  })

  mainWindow.on('closed', () => { mainWindow = null })
  buildMenu()
}

// ===== AUTO UPDATER =====
function setupAutoUpdater() {
  // Configure update server
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'prevensso-pro',
    repo: 'updates',
    private: false
  })

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    log('Verificando actualizaciones...')
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(
        `if(typeof toast==='function') toast('🔄 Verificando actualizaciones...')`
      ).catch(()=>{})
    }
  })

  autoUpdater.on('update-available', (info) => {
    log(`Actualización disponible: v${info.version}`)
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      icon: path.join(__dirname, 'assets', 'icon.png'),
      title: '✅ Actualización disponible',
      message: `Nueva versión de Prevensso Pro disponible`,
      detail: `Versión actual: v${APP_VERSION}\nNueva versión: v${info.version}\n\n¿Deseas descargar e instalar la actualización ahora?\n\nIncluye mejoras de funcionalidad y actualizaciones normativas.`,
      buttons: ['Descargar ahora', 'Recordar más tarde'],
      defaultId: 0
    }).then(result => {
      if (result.response === 0) {
        log('Usuario aceptó descarga de actualización')
        autoUpdater.downloadUpdate()
        showUpdateProgress()
      } else {
        log('Usuario pospuso la actualización')
      }
    })
  })

  autoUpdater.on('update-not-available', () => {
    log('Sin actualizaciones disponibles')
  })

  autoUpdater.on('download-progress', (progress) => {
    const pct = Math.round(progress.percent)
    log(`Descargando: ${pct}%`)
    if (updateWindow && !updateWindow.isDestroyed()) {
      updateWindow.webContents.executeJavaScript(
        `document.getElementById('upd-pct').textContent='${pct}%';
         document.getElementById('upd-bar').style.width='${pct}%';
         document.getElementById('upd-speed').textContent='${(progress.bytesPerSecond/1024).toFixed(1)} KB/s';`
      ).catch(()=>{})
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    log(`Actualización descargada: v${info.version}`)
    if (updateWindow && !updateWindow.isDestroyed()) updateWindow.destroy()
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      icon: path.join(__dirname, 'assets', 'icon.png'),
      title: '✅ Actualización lista',
      message: `Prevensso Pro v${info.version} descargada`,
      detail: 'La actualización se instalará al reiniciar la aplicación.\n\n¿Deseas reiniciar ahora para aplicar los cambios?',
      buttons: ['Reiniciar ahora', 'Reiniciar después'],
      defaultId: 0
    }).then(result => {
      if (result.response === 0) {
        log('Reiniciando para instalar actualización...')
        autoUpdater.quitAndInstall()
      }
    })
  })

  autoUpdater.on('error', (err) => {
    log(`Error en actualizador: ${err.message}`)
  })
}

function checkForUpdates(showNoUpdate = true) {
  log('Iniciando verificación de actualizaciones...')
  try {
    autoUpdater.checkForUpdates().catch(err => {
      log(`Error al verificar: ${err.message}`)
      if (showNoUpdate && mainWindow) {
        mainWindow.webContents.executeJavaScript(
          `if(typeof toast==='function') toast('✅ Sin actualizaciones disponibles')`
        ).catch(()=>{})
      }
    })
  } catch(e) {
    log(`checkForUpdates error: ${e.message}`)
  }
}

function showUpdateProgress() {
  updateWindow = new BrowserWindow({
    width: 420, height: 200, frame: false, resizable: false,
    center: true, alwaysOnTop: true, backgroundColor: '#0d1b3e',
    parent: mainWindow, modal: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })
  updateWindow.loadURL(`data:text/html;charset=utf-8,
    <html><head><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{background:#0d1b3e;color:#fff;font-family:'Segoe UI',sans-serif;
           padding:30px;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}
      h3{font-size:14px;margin-bottom:6px;color:#4cba8a}
      p{font-size:11px;color:rgba(255,255,255,.6);margin-bottom:20px}
      .bar-bg{width:300px;height:6px;background:rgba(255,255,255,.1);border-radius:6px}
      .bar-fill{height:100%;background:linear-gradient(90deg,#2e7d5e,#4cba8a);border-radius:6px;transition:width .3s}
      .info{display:flex;justify-content:space-between;width:300px;margin-top:8px;font-size:11px;color:rgba(255,255,255,.5)}
    </style></head><body>
      <h3>⬇️ Descargando Prevensso Pro...</h3>
      <p>Actualizando a la última versión con mejoras y normativa vigente</p>
      <div class="bar-bg"><div class="bar-fill" id="upd-bar" style="width:0%"></div></div>
      <div class="info"><span id="upd-pct">0%</span><span id="upd-speed">—</span></div>
    </body></html>`)
}

// ===== SISTEMA DE LOGS =====
function setupIPC() {
  // Get log file content
  ipcMain.handle('get-logs', () => {
    try {
      if (fs.existsSync(LOG_FILE)) {
        return fs.readFileSync(LOG_FILE, 'utf8').split('\n').slice(-100).join('\n')
      }
      return 'Sin registros aún'
    } catch(e) { return 'Error al leer logs: ' + e.message }
  })

  // Send error report
  ipcMain.handle('send-error-report', (event, errorData) => {
    log(`ERROR REPORT: ${JSON.stringify(errorData)}`)
    const reportPath = path.join(app.getPath('userData'), 'error-report.txt')
    const report = `PREVENSSO PRO — REPORTE DE ERROR\n${'='.repeat(50)}\nFecha: ${new Date().toLocaleString('es-CL')}\nVersión: v${APP_VERSION}\nSistema: ${os.type()} ${os.release()}\nMódulo: ${errorData.module || '—'}\nError: ${errorData.error || '—'}\nDetalle: ${errorData.detail || '—'}\n${'='.repeat(50)}\n`
    try { fs.writeFileSync(reportPath, report) } catch(e) {}
    return reportPath
  })

  // Open logs folder
  ipcMain.handle('open-logs-folder', () => {
    shell.openPath(app.getPath('userData'))
  })

  // Get app version
  ipcMain.handle('get-version', () => APP_VERSION)

  // Check updates manually
  ipcMain.handle('check-updates', () => {
    checkForUpdates(true)
    return true
  })

  // Print
  ipcMain.handle('print', () => {
    if (mainWindow) mainWindow.webContents.print()
  })
}

// ===== MENU =====
function buildMenu() {
  const template = [
    {
      label: 'Prevensso Pro',
      submenu: [
        {
          label: `Acerca de — v${APP_VERSION}`,
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              icon: path.join(__dirname, 'assets', 'icon.png'),
              title: 'Prevensso Pro®',
              message: `Prevensso Pro v${APP_VERSION}`,
              detail: `Plataforma Integral de Asesoría Empresarial\nNormativa chilena vigente 2024\n\n© ${new Date().getFullYear()} Prevensso Pro\nasesorias.prevensso@gmail.com`,
              buttons: ['Cerrar']
            })
          }
        },
        { type: 'separator' },
        {
          label: '🔄 Verificar Actualizaciones',
          click: () => checkForUpdates(true)
        },
        {
          label: '📋 Ver Registros (Logs)',
          click: async () => {
            const logs = fs.existsSync(LOG_FILE) ?
              fs.readFileSync(LOG_FILE, 'utf8').split('\n').slice(-50).join('\n') :
              'Sin registros'
            const logWin = new BrowserWindow({ width: 700, height: 450, parent: mainWindow,
              title: 'Logs Prevensso Pro', backgroundColor: '#0d1b3e',
              webPreferences: { nodeIntegration: true, contextIsolation: false }
            })
            logWin.loadURL(`data:text/html;charset=utf-8,
              <html><head><style>
                body{background:#0d1b3e;color:#4cba8a;font-family:monospace;padding:16px;font-size:12px}
                h3{color:#fff;margin-bottom:10px}pre{white-space:pre-wrap;line-height:1.6}
                button{background:#2e7d5e;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;margin-top:10px}
              </style></head><body>
              <h3>📋 Prevensso Pro — Registros del Sistema</h3>
              <pre>${logs.replace(/</g,'&lt;')}</pre>
              <button onclick="const el=document.createElement('a');el.href='file://${LOG_FILE.replace(/\\/g,'/')}';document.body.appendChild(el);el.click()">📁 Abrir carpeta de logs</button>
              </body></html>`)
          }
        },
        {
          label: '📤 Enviar Reporte de Error',
          click: async () => {
            const result = await dialog.showInputBox ? dialog.showInputBox(mainWindow, {}) :
              { response: 0, checkboxChecked: false }
            const reportPath = path.join(app.getPath('userData'), 'error-report.txt')
            const sysInfo = `PREVENSSO PRO — REPORTE DE ERROR\n${'='.repeat(50)}\nFecha: ${new Date().toLocaleString('es-CL')}\nVersión: v${APP_VERSION}\nSistema: ${os.type()} ${os.release()} (${os.arch()})\nRAM: ${(os.totalmem()/1024/1024/1024).toFixed(1)} GB\nLogs: ${LOG_FILE}\n`
            fs.writeFileSync(reportPath, sysInfo)
            shell.openExternal(`mailto:asesorias.prevensso@gmail.com?subject=Reporte de Error Prevensso Pro v${APP_VERSION}&body=Adjunta el archivo: ${reportPath}`)
            dialog.showMessageBox(mainWindow, {
              type: 'info', title: 'Reporte generado',
              message: 'Reporte de error generado',
              detail: `Archivo: ${reportPath}\n\nSe abrirá tu cliente de email. Adjunta el archivo de reporte y descríbenos el problema.`,
              buttons: ['OK']
            })
          }
        },
        { type: 'separator' },
        { label: 'Minimizar', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Pantalla Completa', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: 'separator' },
        { label: 'Salir', accelerator: 'CmdOrCtrl+Q', click: () => { log('App cerrada por usuario'); app.quit() } }
      ]
    },
    {
      label: 'Edición',
      submenu: [
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Pegar', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Seleccionar todo', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
        { type: 'separator' },
        { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rehacer', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
      ]
    },
    {
      label: 'Vista',
      submenu: [
        { label: 'Acercar', accelerator: 'CmdOrCtrl+Plus', click: () => mainWindow.webContents.zoomIn() },
        { label: 'Alejar', accelerator: 'CmdOrCtrl+-', click: () => mainWindow.webContents.zoomOut() },
        { label: 'Tamaño Normal', accelerator: 'CmdOrCtrl+0', click: () => mainWindow.webContents.setZoomLevel(0) },
        { type: 'separator' },
        { label: 'Imprimir', accelerator: 'CmdOrCtrl+P', click: () => mainWindow.webContents.print() },
        { type: 'separator' },
        { label: 'Herramientas de desarrollo', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() },
        { label: 'Recargar', accelerator: 'F5', click: () => mainWindow.reload() }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        { label: '📧 Soporte Técnico', click: () => shell.openExternal(`mailto:asesorias.prevensso@gmail.com?subject=Soporte Prevensso Pro v${APP_VERSION}`) },
        { label: '🌐 Sitio Web', click: () => shell.openExternal('mailto:asesorias.prevensso@gmail.com') },
        { type: 'separator' },
        { label: `Versión ${APP_VERSION}`, enabled: false }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ===== APP EVENTS =====
app.whenReady().then(() => {
  log(`Prevensso Pro v${APP_VERSION} iniciando en ${os.type()} ${os.release()}`)
  setupIPC()
  setupAutoUpdater()
  createSplash()
  createMainWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  log('Todas las ventanas cerradas')
  if (process.platform !== 'darwin') app.quit()
})

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus() }
  })
}

// Handle external links
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http') || url.startsWith('mailto')) {
      shell.openExternal(url); return { action: 'deny' }
    }
    return { action: 'allow' }
  })
})
