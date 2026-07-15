#!/usr/bin/env node
const { launchVersion } = require('./runner')

function main() {
  const version = process.argv[2]
  const java = process.argv[3] || 'java'
  const username = process.argv[4] || 'Player'
  const token = process.argv[5] || '0'
  if (!version) {
    console.error('Usage: node cli-launch.js <version> [javaPath] [username] [accessToken]')
    process.exit(2)
  }
  try {
    console.log('Launching', version)
    const child = launchVersion(undefined, version, java, username, token)
    child.on('close', code => process.exit(code))
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
