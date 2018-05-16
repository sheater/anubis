const fs = require("fs")
const path = require("path")

function loadFixture(fixturePath) {
  return fs.readFileSync(
    path.resolve(process.cwd(), 'fixtures', fixturePath)
  )
}

module.exports = loadFixture
