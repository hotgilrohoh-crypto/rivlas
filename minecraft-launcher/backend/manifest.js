const https = require('https')

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

const MANIFEST_URL = 'https://launchermeta.mojang.com/mc/game/version_manifest.json'

async function getVersionManifest() {
  return fetchJSON(MANIFEST_URL)
}

async function getVersionMeta(versionId) {
  const manifest = await getVersionManifest()
  const v = manifest.versions.find(x => x.id === versionId)
  if (!v) throw new Error('Version not found: ' + versionId)
  return fetchJSON(v.url)
}

module.exports = { getVersionManifest, getVersionMeta }
