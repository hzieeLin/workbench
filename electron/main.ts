import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import type { Server } from 'http'

let apiServer: Server | null = null

function getDbPath(): string {
  const appName = 'TaskFlow'
  let baseDir: string

  if (process.platform === 'win32') {
    baseDir = join(process.env.APPDATA || '', appName)
  } else if (process.platform === 'darwin') {
    baseDir = join(process.env.HOME || '', 'Library', 'Application Support', appName)
  } else {
    baseDir = join(process.env.HOME || '', `.${appName.toLowerCase()}`)
  }

  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true })
  }

  return join(baseDir, 'data.db')
}

async function startBundledApi() {
  if (process.env.NODE_ENV === 'development' || apiServer) return

  process.env.DB_PATH = getDbPath()
  const serverModule = await import(join(__dirname, '../dist-server/server/http.js'))
  apiServer = await serverModule.startApiServer()
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(async () => {
  await startBundledApi()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  apiServer?.close()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
