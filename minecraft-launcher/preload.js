const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectExe: () => ipcRenderer.invoke('select-exe'),
  launchExe: (exePath, args) => ipcRenderer.invoke('launch-exe', exePath, args),
  installVersion: (versionId) => ipcRenderer.invoke('install-version', versionId),
  launchVersion: (opts) => ipcRenderer.invoke('launch-version', opts),
  versionsList: () => ipcRenderer.invoke('versions-list'),
  accountsList: () => ipcRenderer.invoke('accounts-list'),
  accountsAdd: (profile) => ipcRenderer.invoke('accounts-add', profile),
  accountsRemove: (id) => ipcRenderer.invoke('accounts-remove', id),
  accountsSetActive: (id) => ipcRenderer.invoke('accounts-set-active', id),
  modsInstall: (url, filename) => ipcRenderer.invoke('mods-install', url, filename),
  onLog: (cb) => ipcRenderer.on('proc-log', (e, data) => cb(data)),
  onExit: (cb) => ipcRenderer.on('proc-exit', (e, code) => cb(code))
})
