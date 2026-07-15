window.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabVersions = document.getElementById('tabVersions')
  const tabAccounts = document.getElementById('tabAccounts')
  const tabMods = document.getElementById('tabMods')
  const viewVersions = document.getElementById('viewVersions')
  const viewAccounts = document.getElementById('viewAccounts')
  const viewMods = document.getElementById('viewMods')

  function showView(v) {
    viewVersions.style.display = 'none'
    viewAccounts.style.display = 'none'
    viewMods.style.display = 'none'
    v.style.display = ''
  }
  tabVersions.addEventListener('click', () => showView(viewVersions))
  tabAccounts.addEventListener('click', () => showView(viewAccounts))
  tabMods.addEventListener('click', () => showView(viewMods))

  // Versions
  const versionSelect = document.getElementById('versionSelect')
  const installVersionBtn = document.getElementById('installVersionBtn')
  const launchVersionBtn = document.getElementById('launchVersionBtn')
  const jvmArgs = document.getElementById('jvmArgs')
  const logArea = document.getElementById('log')

  async function loadVersions() {
    const res = await window.electronAPI.versionsList()
    if (res.ok) {
      versionSelect.innerHTML = ''
      for (const v of res.res) {
        const o = document.createElement('option')
        o.value = v
        o.textContent = v
        versionSelect.appendChild(o)
      }
    } else {
      alert('Błąd pobierania listy wersji: ' + res.error)
    }
  }
  loadVersions()

  installVersionBtn.addEventListener('click', async () => {
    const v = versionSelect.value
    logArea.value = ''
    const res = await window.electronAPI.installVersion(v)
    if (!res.ok) alert('Błąd instalacji: ' + res.error)
    else logArea.value += 'Zainstalowano: ' + JSON.stringify(res.res) + '\n'
  })

  launchVersionBtn.addEventListener('click', async () => {
    const v = versionSelect.value
    const tokenRes = await window.electronAPI.accountsList()
    let token = '0'
    if (tokenRes.ok && tokenRes.res.active) {
      const act = tokenRes.res.profiles.find(p => p.id === tokenRes.res.active)
      if (act) token = act.accessToken || '0'
    }
    const opts = { versionId: v, accessToken: token, javaPath: 'java' }
    const res = await window.electronAPI.launchVersion(opts)
    if (!res.ok) alert('Błąd uruchomienia: ' + res.error)
  })

  // Accounts
  const accId = document.getElementById('accId')
  const accName = document.getElementById('accName')
  const accToken = document.getElementById('accToken')
  const addAccBtn = document.getElementById('addAccBtn')
  const accSelect = document.getElementById('accSelect')
  const setActiveAccBtn = document.getElementById('setActiveAccBtn')
  const removeAccBtn = document.getElementById('removeAccBtn')

  async function loadAccounts() {
    const res = await window.electronAPI.accountsList()
    if (!res.ok) return alert('Błąd: ' + res.error)
    accSelect.innerHTML = ''
    for (const p of res.res.profiles) {
      const o = document.createElement('option')
      o.value = p.id
      o.textContent = p.name + ' (' + p.id + ')' 
      accSelect.appendChild(o)
    }
  }
  loadAccounts()

  addAccBtn.addEventListener('click', async () => {
    const profile = { id: accId.value || ('id-' + Date.now()), name: accName.value || 'Player', accessToken: accToken.value || '0' }
    const res = await window.electronAPI.accountsAdd(profile)
    if (!res.ok) alert('Błąd dodawania: ' + res.error)
    loadAccounts()
  })

  setActiveAccBtn.addEventListener('click', async () => {
    const id = accSelect.value
    const res = await window.electronAPI.accountsSetActive(id)
    if (!res.ok) alert('Błąd: ' + res.error)
    loadAccounts()
  })

  removeAccBtn.addEventListener('click', async () => {
    const id = accSelect.value
    const res = await window.electronAPI.accountsRemove(id)
    if (!res.ok) alert('Błąd: ' + res.error)
    loadAccounts()
  })

  // Mods
  const modUrl = document.getElementById('modUrl')
  const modFile = document.getElementById('modFile')
  const installModBtn = document.getElementById('installModBtn')

  installModBtn.addEventListener('click', async () => {
    const url = modUrl.value
    const file = modFile.value || undefined
    if (!url) return alert('Podaj URL do moda .jar')
    const res = await window.electronAPI.modsInstall(url, file)
    if (!res.ok) alert('Błąd instalacji moda: ' + res.error)
    else alert('Zainstalowano moda: ' + res.dest)
  })

  // IPC logs
  window.electronAPI.onLog(data => {
    logArea.value += data + '\n'
    logArea.scrollTop = logArea.scrollHeight
  })
  window.electronAPI.onExit(code => {
    logArea.value += '\nProces zakończony kodem: ' + code + '\n'
  })
})
