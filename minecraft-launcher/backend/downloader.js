const https = require('https')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
}

function downloadTo(url, dest, expectedSha1) {
  return new Promise((resolve, reject) => {
    ensureDir(dest)
    const file = fs.createWriteStream(dest)
    const hash = crypto.createHash('sha1')

    https.get(url, res => {
      if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode))
      res.on('data', chunk => hash.update(chunk))
      res.pipe(file)
      file.on('finish', () => {
        file.close(() => {
          const actual = hash.digest('hex')
          if (expectedSha1 && actual !== expectedSha1) {
            return reject(new Error('SHA1 mismatch: ' + actual + ' != ' + expectedSha1))
          }
          resolve(dest)
        })
      })
    }).on('error', err => {
      fs.unlink(dest, () => reject(err))
    })
  })
}

module.exports = { downloadTo }
