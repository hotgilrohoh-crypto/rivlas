#!/usr/bin/env node
const { installVersion } = require('./installer')

async function main() {
  const ver = process.argv[2]
  if (!ver) {
    console.error('Usage: node cli-install.js <version>')
    process.exit(2)
  }
  try {
    console.log('Installing', ver)
    const res = await installVersion(ver)
    console.log('Installed:', res)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
