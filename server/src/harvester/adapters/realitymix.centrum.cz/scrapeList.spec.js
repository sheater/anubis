const axios = require("axios")
const MockAdapter = require("axios-mock-adapter")

const loadFixture = require('../../utils/loadFixture')
const scrapeList = require("./scrapeList")

const mock = new MockAdapter(axios)

const FIRST_LIST_URL = 'http://realitymix.centrum.cz/vypis-nabidek/?form%5Binzerat_typ%5D=1&form%5Badresa_kraj_id%5D%5B0%5D=116&form%5Bsearch_in_city%5D=&form%5Bcena_normalizovana__from%5D=&form%5Bcena_normalizovana__to%5D=&form%5Bplocha__from%5D=&form%5Bplocha__to%5D=&form%5Bsearch_in_text%5D=&form%5Bnemovitost_typ%5D%5B0%5D=4&form%5Bcena_mena%5D=1&form%5Bpodlazi_cislo__from%5D=&form%5Bpodlazi_cislo__to%5D='
const LAST_LIST_URL = 'http://realitymix.centrum.cz/vypis-nabidek/?form%5Binzerat_typ%5D=1&form%5Badresa_kraj_id%5D%5B0%5D=116&form%5Bsearch_in_city%5D=&form%5Bcena_normalizovana__from%5D=&form%5Bcena_normalizovana__to%5D=&form%5Bplocha__from%5D=&form%5Bplocha__to%5D=&form%5Bsearch_in_text%5D=&form%5Bnemovitost_typ%5D%5B0%5D=4&form%5Bcena_mena%5D=1&form%5Bpodlazi_cislo__from%5D=&form%5Bpodlazi_cislo__to%5D=&stranka=39'

mock.onGet(FIRST_LIST_URL).reply(200, loadFixture('realitymix.centrum.cz/list-first/index.html'))
mock.onGet(LAST_LIST_URL).reply(200, loadFixture('realitymix.centrum.cz/list-last/index.html'))

describe("first page", () => {
  let list = null

  beforeAll(async () => {
    list = await scrapeList(FIRST_LIST_URL)
  })

  test("has ads", () => {
    expect(list.items).toHaveLength(21)
  })

  test("link to next list", () => {
    expect(list.nextList).toBe("http://realitymix.centrum.cz/vypis-nabidek/?form%5Binzerat_typ%5D=1&form%5Badresa_kraj_id%5D%5B0%5D=116&form%5Bsearch_in_city%5D=&form%5Bcena_normalizovana__from%5D=&form%5Bcena_normalizovana__to%5D=&form%5Bplocha__from%5D=&form%5Bplocha__to%5D=&form%5Bsearch_in_text%5D=&form%5Bnemovitost_typ%5D%5B0%5D=4&form%5Bcena_mena%5D=1&form%5Bpodlazi_cislo__from%5D=&form%5Bpodlazi_cislo__to%5D=&stranka=2")
  })
})

describe("last page", () => {
  let list = null

  beforeAll(async () => {
    list = await scrapeList(LAST_LIST_URL)
  })

  test("has ads", () => {
    expect(list.items).toHaveLength(15)
  })

  test("no link", () => {
    expect(list.nextList).toBeNull()
  })
})
