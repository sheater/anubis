const fs = require('fs')
const pathLib = require('path')

const BASE_PATH = pathLib.resolve(__dirname, 'adapters')

function getAdaptersList () {
  return fs.readdirSync(BASE_PATH).reduce((acc, file) => {
    const path = pathLib.resolve(BASE_PATH, file)

    if (fs.statSync(path).isDirectory()) {
      acc.push(file)
    }

    return acc
  }, [])
}

function getAdapter (name) {
  return require(pathLib.resolve(BASE_PATH, name))
}

function getAdapters () {
  return getAdaptersList().map((name) => getAdapter(name))
}

module.exports = { getAdaptersList, getAdapter, getAdapters }
