const axios = require("axios")
const MockAdapter = require("axios-mock-adapter")

const { AspectType } = require('../../../common/consts')
const loadFixture = require('../../utils/loadFixture')
const scrapeItem = require('./scrapeItem')

const mock = new MockAdapter(axios)

const ITEM_1_URL = 'https://sreality.cz/byty/jihomoravsky-kraj/1'
const ITEM_2_URL = 'https://sreality.cz/byty/jihomoravsky-kraj/2'

mock.onGet(ITEM_1_URL).reply(200, loadFixture('sreality.cz/1/index.json'))
mock.onGet(ITEM_2_URL).reply(200, loadFixture('sreality.cz/2/index.json'))

let item1, item2

beforeAll(async () => {
  item1 = await scrapeItem(ITEM_1_URL)
  item2 = await scrapeItem(ITEM_2_URL)
})

test(AspectType.ORIGINAL_URL, () => {
  expect(item1[AspectType.ORIGINAL_URL]).toBe(ITEM_1_URL)
  expect(item2[AspectType.ORIGINAL_URL]).toBe(ITEM_2_URL)
})

test(AspectType.ADAPTER_NAME, () => {
  expect(item1[AspectType.ADAPTER_NAME]).toBe('sreality.cz')
  expect(item2[AspectType.ADAPTER_NAME]).toBe('sreality.cz')
})

test(AspectType.PRICE, () => {
  expect(item1[AspectType.PRICE]).toBe(5900000)
  expect(item2[AspectType.PRICE]).toBe(499000)
})

test(AspectType.PRICE_NOTE, () => {
  expect(item1[AspectType.PRICE_NOTE]).toBe('Rezervace')
  expect(item2[AspectType.PRICE_NOTE]).toBe('včetně poplatků, včetně provize, včetně právního servisu')
})

test(AspectType.ADDRESS, () => {
  expect(item1[AspectType.ADDRESS]).toBe('Brno - Brno-město')
  expect(item2[AspectType.ADDRESS]).toBe('Slovinská, Brno - Královo Pole')
})

test(AspectType.LAST_UPDATE, () => {
  expect(item1[AspectType.LAST_UPDATE]).toBe('27.02.2018')
  expect(item2[AspectType.LAST_UPDATE]).toBe('28.02.2018')
})

test(AspectType.NUM_ROOMS, () => {
  expect(item1[AspectType.NUM_ROOMS]).toBe('Prodej bytu 3+kk 93 m²')
  expect(item2[AspectType.NUM_ROOMS]).toBe('Prodej bytu 2+1 100 m²')
})

test(AspectType.OWNERSHIP_TYPE, () => {
  expect(item1[AspectType.OWNERSHIP_TYPE]).toBe('Osobní')
  expect(item2[AspectType.OWNERSHIP_TYPE]).toBe('Státní/obecní')
})

test(AspectType.SIZE, () => {
  expect(item1[AspectType.SIZE]).toBe('93')
  expect(item2[AspectType.SIZE]).toBe('100')
})

test(AspectType.TRAFFIC, () => {
  expect(item1[AspectType.TRAFFIC]).toBeUndefined()
  expect(item2[AspectType.TRAFFIC]).toBe('Vlak;Silnice;MHD;Autobus')
})

test(AspectType.ENERGY_EFFICIENCY_RATING, () => {
  expect(item1[AspectType.ENERGY_EFFICIENCY_RATING]).toBe('Třída B - Velmi úsporná č. 78/2013 Sb. podle vyhlášky')
  expect(item2[AspectType.ENERGY_EFFICIENCY_RATING]).toBe('Třída G - Mimořádně nehospodárná')
})

test(AspectType.FLOOR_NUM, () => {
  expect(item1[AspectType.FLOOR_NUM]).toBe('4. podlaží')
  expect(item2[AspectType.FLOOR_NUM]).toBe('2. podlaží z celkem 3')
})

test(AspectType.FLAT_CONDITION, () => {
  expect(item1[AspectType.FLAT_CONDITION]).toBe('Po rekonstrukci')
  expect(item2[AspectType.FLAT_CONDITION]).toBe('Velmi dobrý')
})

test(AspectType.CONSTRUCTION_TYPE, () => {
  expect(item1[AspectType.CONSTRUCTION_TYPE]).toBe('Cihlová')
  expect(item2[AspectType.CONSTRUCTION_TYPE]).toBe('Cihlová')
})

test(AspectType.BASEMENT, () => {
  expect(item1[AspectType.BASEMENT]).toBeUndefined()
  expect(item2[AspectType.BASEMENT]).toBe('6')
})

test(AspectType.BALCONY, () => {
  expect(item1[AspectType.BALCONY]).toBeTruthy()
  expect(item2[AspectType.BALCONY]).toBe('6')
})

test(AspectType.THEIR_ID, () => {
  expect(item1[AspectType.THEIR_ID]).toBe('ATT1P11112')
  expect(item2[AspectType.THEIR_ID]).toBe('00231')
})

test(AspectType.DESCRIPTION, () => {
  expect(item1[AspectType.DESCRIPTION]).toHaveLength(2624)
  expect(item2[AspectType.DESCRIPTION]).toHaveLength(947)
})

test(AspectType.ELEVATOR, () => {
  expect(item1[AspectType.ELEVATOR]).toBeFalsy()
  expect(item2[AspectType.ELEVATOR]).toBeFalsy()
})

test(AspectType.HEATING_TYPE, () => {
  expect(item1[AspectType.HEATING_TYPE]).toBeUndefined()
  expect(item2[AspectType.HEATING_TYPE]).toBe('[{"name":"Topení","value":"Lokální plynové"}]')
})
