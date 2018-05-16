const axios = require("axios")
const MockAdapter = require("axios-mock-adapter")

const loadFixture = require('../../utils/loadFixture')
const scrapeList = require("./scrapeList")

const mock = new MockAdapter(axios)

const FIRST_LIST_URL = 'https://www.sreality.cz/api/cs/v2/estates?category_main_cb=1&category_type_cb=1&locality_region_id=14&tms=1520332763763'
const LAST_LIST_URL = 'https://www.sreality.cz/api/cs/v2/estates?category_main_cb=1&category_type_cb=1&locality_region_id=14&page=24&per_page=60&tms=1520333079249'

mock.onGet(FIRST_LIST_URL).reply(200, loadFixture('sreality.cz/list-first/index.json'))
mock.onGet(LAST_LIST_URL).reply(200, loadFixture('sreality.cz/list-last/index.json'))

describe("first page", () => {
  let list = null

  beforeAll(async () => {
    list = await scrapeList(FIRST_LIST_URL)
  })

  test("has ads", () => {
    expect(list.items).toHaveLength(20)
  })

  test("link to next list", () => {
    expect(list.nextList).toBe("/cs/v2/estates?category_main_cb=1&locality_region_id=14&category_type_cb=1&page=2")
  })
})

describe("last page", () => {
  let list = null

  beforeAll(async () => {
    list = await scrapeList(LAST_LIST_URL)
  })

  test("has ads", () => {
    expect(list.items).toHaveLength(51)
  })

  test("no link", () => {
    expect(list.nextList).toBeNull()
  })
})
