const axios = require("axios")
const MockAdapter = require("axios-mock-adapter")

const loadFixture = require('../../utils/loadFixture')
const scrapeList = require("./scrapeList")

const mock = new MockAdapter(axios)

const FIRST_LIST_URL = 'https://reality.idnes.cz/s/prodej/byty/jihomoravsky-kraj/'
const LAST_LIST_URL = 'https://reality.idnes.cz/s/prodej/byty/jihomoravsky-kraj/?page=46'

mock.onGet(FIRST_LIST_URL).reply(200, loadFixture('reality.idnes.cz/list-first/index.html'))
mock.onGet(LAST_LIST_URL).reply(200, loadFixture('reality.idnes.cz/list-last/index.html'))

describe("first page", () => {
  let list = null

  beforeAll(async () => {
    list = await scrapeList(FIRST_LIST_URL)
  })

  test("has ads", () => {
    expect(list.items).toHaveLength(21)
  })

  test("link to next list", () => {
    expect(list.nextList).toBe("https://reality.idnes.cz/s/prodej/byty/jihomoravsky-kraj/?page=1")
  })
})

describe("last page", () => {
  let list = null

  beforeAll(async () => {
    list = await scrapeList(LAST_LIST_URL)
  })

  test("has ads", () => {
    expect(list.items).toHaveLength(16)
  })

  test("no link", () => {
    expect(list.nextList).toBeNull()
  })
})
