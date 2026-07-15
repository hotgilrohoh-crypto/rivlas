const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const { installVersion } = require('./backend/installer')
const { launchVersion } = require('./backend/runner')
const accounts = require('./backend/accounts')
const mods = require('./backend/mods')

function createWindow() {
  const win = new BrowserWindow({
    width: 700,
    height: 480,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(createWindow)

ipcMain.handle('select-exe', async () => {
  const res = await dialog.showOpenDialog({ properties: ['openFile'] })
  if (res.canceled) return null
  return res.filePaths[0]
})

ipcMain.handle('launch-exe', (event, exePath, args) => {
  try {
    const child = spawn(exePath, args || [], { windowsHide: true })

    child.stdout.on('data', data => {
      event.sender.send('proc-log', data.toString())
    })
    child.stderr.on('data', data => {
      event.sender.send('proc-log', data.toString())
    })
    child.on('close', code => {
      event.sender.send('proc-exit', code)
    })

    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
})

ipcMain.handle('install-version', async (event, versionId) => {
  try {
    const res = await installVersion(versionId)
    return { ok: true, res }
  } catch (err) {
    return { ok: false, error: err.message }
  }
})

ipcMain.handle('launch-version', (event, opts) => {
  try {
    const { versionId, javaPath, username, accessToken, gameDir } = opts || {}
    const child = launchVersion(process.env.MC_HOME || undefined, versionId, javaPath || 'java', username || 'Player', accessToken || '0', gameDir)
    child.on('close', code => event.sender.send('proc-exit', code))
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
})

ipcMain.handle('accounts-list', () => {
  try { return { ok: true, res: accounts.listAccounts() } } catch (e) { return { ok: false, error: e.message } }
})

ipcMain.handle('accounts-add', (event, profile) => {
  try { return { ok: true, res: accounts.addAccount(profile) } } catch (e) { return { ok: false, error: e.message } }
})

ipcMain.handle('accounts-remove', (event, id) => {
  try { return { ok: true, res: accounts.removeAccount(id) } } catch (e) { return { ok: false, error: e.message } }
})

ipcMain.handle('accounts-set-active', (event, id) => {
  try { return { ok: true, res: accounts.setActive(id) } } catch (e) { return { ok: false, error: e.message } }
})

ipcMain.handle('mods-install', async (event, url, filename) => {
  try { const dest = await mods.installMod(url, filename); return { ok: true, dest } } catch (e) { return { ok: false, error: e.message } }
})

ipcMain.handle('versions-list', async () => {
  const { getVersionManifest } = require('./backend/manifest')
  try { const m = await getVersionManifest(); return { ok: true, res: m.versions.map(v => v.id) } } catch (e) { return { ok: false, error: e.message } }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
