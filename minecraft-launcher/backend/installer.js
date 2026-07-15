const path = require('path')
const fs = require('fs')
const { getVersionMeta } = require('./manifest')
const { downloadTo } = require('./downloader')

const DEFAULT_MCDIR = process.env.MC_HOME || path.join(process.env.HOME || '.', '.minecraft')

function toLibraryPath(lib) {
  // lib.name like group:artifact:version
  const parts = lib.name.split(':')
  const group = parts[0].replace(/\./g, '/')
  const artifact = parts[1]
  const version = parts[2]
  const fileName = artifact + '-' + version + '.jar'
  return path.join('libraries', group, artifact, version, fileName)
}

async function installVersion(versionId, mcDir = DEFAULT_MCDIR) {
  const meta = await getVersionMeta(versionId)
  const versionDir = path.join(mcDir, 'versions', versionId)
  fs.mkdirSync(versionDir, { recursive: true })

  // download client
  if (!meta.downloads || !meta.downloads.client || !meta.downloads.client.url) {
    throw new Error('No client download info for ' + versionId)
  }
  const clientUrl = meta.downloads.client.url
  const clientSha = meta.downloads.client.sha1
  const clientPath = path.join(versionDir, versionId + '.jar')
  await downloadTo(clientUrl, clientPath, clientSha)

  // download libraries
  for (const lib of meta.libraries || []) {
    if (!lib.downloads || !lib.downloads.artifact || !lib.downloads.artifact.url) continue
    const rel = toLibraryPath(lib)
    const dest = path.join(mcDir, rel)
    const expected = lib.downloads.artifact.sha1
    await downloadTo(lib.downloads.artifact.url, dest, expected)
  }

  // write version json
  const versionJsonPath = path.join(versionDir, versionId + '.json')
  fs.writeFileSync(versionJsonPath, JSON.stringify(meta, null, 2))
  return { versionDir, clientPath, versionJsonPath }
}

module.exports = { installVersion }
