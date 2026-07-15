const { downloadTo } = require('./downloader')
const path = require('path')
const fs = require('fs')

const DEFAULT_MCDIR = process.env.MC_HOME || path.join(process.env.HOME || '.', '.minecraft')

async function installMod(url, filename, mcDir = DEFAULT_MCDIR) {
  const modsDir = path.join(mcDir, 'mods')
  if (!fs.existsSync(modsDir)) fs.mkdirSync(modsDir, { recursive: true })
  const dest = path.join(modsDir, filename || path.basename(url))
  await downloadTo(url, dest)
  return dest
}

module.exports = { installMod }
