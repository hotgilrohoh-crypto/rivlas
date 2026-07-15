const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

const DEFAULT_MCDIR = process.env.MC_HOME || path.join(process.env.HOME || '.', '.minecraft')

function buildClasspath(mcDirParam, versionId) {
  const mcDir = mcDirParam || DEFAULT_MCDIR
  const versionDir = path.join(mcDir, 'versions', versionId)
  const versionJsonPath = path.join(versionDir, versionId + '.json')
  if (!fs.existsSync(versionJsonPath)) throw new Error('Version not installed: ' + versionId)
  const meta = JSON.parse(fs.readFileSync(versionJsonPath))
  const classpath = []
  // add libraries
  for (const lib of meta.libraries || []) {
    if (lib.downloads && lib.downloads.artifact && lib.downloads.artifact.url) {
      const parts = lib.name.split(':')
      const group = parts[0].replace(/\./g, '/')
      const artifact = parts[1]
      const version = parts[2]
      const jar = path.join(mcDir, 'libraries', group, artifact, version, artifact + '-' + version + '.jar')
      if (fs.existsSync(jar)) classpath.push(jar)
    }
  }
  // add client jar
  const clientJar = path.join(versionDir, versionId + '.jar')
  classpath.push(clientJar)
  return { classpath, meta }
}

function launchVersion(mcDir, versionId, javaPath = 'java', username = 'Player', accessToken = '0', gameDir) {
  const { classpath, meta } = buildClasspath(mcDir, versionId)
  const sep = process.platform === 'win32' ? ';' : ':'
  const cp = classpath.join(sep)
  const mainClass = meta.mainClass || 'net.minecraft.client.main.Main'

  // build game arguments
  let gameArgs = []
  if (meta.arguments && meta.arguments.game) {
    for (const a of meta.arguments.game) {
      if (typeof a === 'string') gameArgs.push(a)
      else if (a.rules) continue
    }
  } else if (meta.minecraftArguments) {
    gameArgs = meta.minecraftArguments.split(' ')
  }

  // replace token placeholders if present
  gameArgs = gameArgs.map(a => a.replace(/--username\s+\S+|--version\s+\S+|--gameDir\s+\S+|--accessToken\s+\S+/g, ''))
  // append required args
  gameArgs.push('--username', username, '--version', versionId, '--accessToken', accessToken)
  if (gameDir) { gameArgs.push('--gameDir', gameDir) }

  const args = ['-cp', cp, mainClass, ...gameArgs]
  const child = spawn(javaPath, args, { stdio: 'inherit' })
  return child
}

module.exports = { launchVersion }
