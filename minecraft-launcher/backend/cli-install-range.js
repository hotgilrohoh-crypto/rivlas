#!/usr/bin/env node
const { getVersionManifest } = require('./manifest')
const { installVersion } = require('./installer')

async function main() {
  const minV = process.argv[2]
  const maxV = process.argv[3] // optional, or 'latest'
  if (!minV) {
    console.error('Usage: node cli-install-range.js <minVersion> [maxVersion|latest]')
    process.exit(2)
  }
  try {
    const manifest = await getVersionManifest()
    const versions = manifest.versions // array
    const ids = versions.map(v => v.id)
    const minIdx = ids.indexOf(minV)
    if (minIdx === -1) {
      console.error('Min version not found in manifest:', minV)
      process.exit(3)
    }
    let maxIdx
    if (!maxV || maxV === 'latest') {
      maxIdx = 0
    } else {
      maxIdx = ids.indexOf(maxV)
      if (maxIdx === -1) {
        console.error('Max version not found in manifest:', maxV)
        process.exit(4)
      }
    }

    const step = minIdx <= maxIdx ? 1 : -1
    console.log('Installing versions from', versions[minIdx].id, 'to', versions[maxIdx].id)
    for (let i = minIdx; ; i += step) {
      const vid = versions[i].id
      console.log('Installing', vid)
      await installVersion(vid)
      if (i === maxIdx) break
    }
    console.log('Done')
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
