const fs = require('fs')
const path = require('path')

const STORAGE = process.env.MC_LAUNCHER_HOME || path.join(process.env.HOME || '.', '.minecraft-launcher')
const ACC_FILE = path.join(STORAGE, 'accounts.json')

function ensureStorage() {
  if (!fs.existsSync(STORAGE)) fs.mkdirSync(STORAGE, { recursive: true })
  if (!fs.existsSync(ACC_FILE)) fs.writeFileSync(ACC_FILE, JSON.stringify({ profiles: [], active: null }, null, 2))
}

function read() {
  ensureStorage()
  return JSON.parse(fs.readFileSync(ACC_FILE))
}

function write(data) {
  ensureStorage()
  fs.writeFileSync(ACC_FILE, JSON.stringify(data, null, 2))
}

function listAccounts() {
  return read()
}

function addAccount(profile) {
  const data = read()
  data.profiles.push(profile)
  data.active = profile.id
  write(data)
  return data
}

function removeAccount(id) {
  const data = read()
  data.profiles = data.profiles.filter(p => p.id !== id)
  if (data.active === id) data.active = data.profiles.length ? data.profiles[0].id : null
  write(data)
  return data
}

function setActive(id) {
  const data = read()
  if (!data.profiles.find(p => p.id === id)) throw new Error('Profile not found')
  data.active = id
  write(data)
  return data
}

module.exports = { listAccounts, addAccount, removeAccount, setActive, ACC_FILE }
