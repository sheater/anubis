const axios = require("axios")
const MockAdapter = require("axios-mock-adapter")

const { AspectType } = require('../../../common/consts')
const loadFixture = require('../../utils/loadFixture')
const scrapeItem = require('./scrapeItem')

const mock = new MockAdapter(axios)

const ITEM_1_URL = 'https://reality.idnes.cz/detail/prodej/byt/cerna-pole-milady-horakove/5a8623e8a26e3a6f823ae9e6/?s-et=flat&s-l=VUSC-116'
const ITEM_2_URL = 'https://reality.idnes.cz/s/prodej/byty/jihomoravsky-kraj/2'

mock.onGet(ITEM_1_URL).reply(200, loadFixture('reality.idnes.cz/1/index.html'))
mock.onGet(ITEM_2_URL).reply(200, loadFixture('reality.idnes.cz/2/index.html'))

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
  expect(item1[AspectType.ADAPTER_NAME]).toBe('reality.idnes.cz')
  expect(item2[AspectType.ADAPTER_NAME]).toBe('reality.idnes.cz')
})

test(AspectType.PRICE, () => {
  expect(item1[AspectType.PRICE]).toBe('5 245 000 Kč')
  expect(item2[AspectType.PRICE]).toBe('3 900 000 Kč')
})

test(AspectType.PRICE_NOTE, () => {
  expect(item1[AspectType.PRICE_NOTE]).toBe('Poznámka k ceně: neplatíte daň z nabytí')
  expect(item2[AspectType.PRICE_NOTE]).toBe('')
})

test(AspectType.ADDRESS, () => {
  expect(item1[AspectType.ADDRESS]).toBe('Milady Horákové, Černá Pole')
  expect(item2[AspectType.ADDRESS]).toBe('Dusíkova, Brno')
})

test(AspectType.NUM_ROOMS, () => {
  expect(item1[AspectType.NUM_ROOMS]).toBe('Prodej novostaveb bytů 3+kk v centru města ihned k nastěhování')
  expect(item2[AspectType.NUM_ROOMS]).toBe('Prodej cihlového bytu v 6NP/8, 2+kk 54m2, Novostavba 2009, balkon 5m2, gar. stání, Brno- Lesná')
})

test(AspectType.DESCRIPTION, () => {
  expect(item1[AspectType.DESCRIPTION]).toHaveLength(428)
  expect(item2[AspectType.DESCRIPTION]).toHaveLength(1181)
})

test(AspectType.OWNERSHIP_TYPE, () => {
  expect(item1[AspectType.OWNERSHIP_TYPE]).toBe('osobní')
  expect(item2[AspectType.OWNERSHIP_TYPE]).toBe('osobní')
})

test(AspectType.SIZE, () => {
  expect(item1[AspectType.SIZE]).toBe('81 m<sup>2</sup>')
  expect(item2[AspectType.SIZE]).toBe('54 m<sup>2</sup>')
})

test(AspectType.ENERGY_EFFICIENCY_RATING, () => {
  expect(item1[AspectType.ENERGY_EFFICIENCY_RATING]).toBe('B')
  expect(item2[AspectType.ENERGY_EFFICIENCY_RATING]).toBeUndefined()
})

test(AspectType.FLOOR_NUM, () => {
  expect(item1[AspectType.FLOOR_NUM]).toBe('4. patro (5. NP).')
  expect(item2[AspectType.FLOOR_NUM]).toBe('6. patro (7. NP).')
})

test(AspectType.BUILDING_CONDITION, () => {
  expect(item1[AspectType.BUILDING_CONDITION]).toBe('novostavba')
  expect(item2[AspectType.BUILDING_CONDITION]).toBe('novostavba')
})

test(AspectType.FLAT_CONDITION, () => {
  expect(item1[AspectType.FLAT_CONDITION]).toBe('novostavba')
  expect(item2[AspectType.FLAT_CONDITION]).toBe('novostavba')
})

test(AspectType.CONSTRUCTION_TYPE, () => {
  expect(item1[AspectType.CONSTRUCTION_TYPE]).toBe('cihlová')
  expect(item2[AspectType.CONSTRUCTION_TYPE]).toBe('cihlová')
})

test(AspectType.BASEMENT, () => {
  expect(item1[AspectType.BASEMENT]).toHaveLength(200)
  expect(item2[AspectType.BASEMENT]).toHaveLength(200)
})

test(AspectType.BALCONY, () => {
  expect(item1[AspectType.BALCONY]).toHaveLength(621)
  expect(item2[AspectType.BALCONY]).toHaveLength(207)
})

test(AspectType.THEIR_ID, () => {
  expect(item1[AspectType.THEIR_ID]).toBe('IDNES-3+kk Černá Pole I.M.Horá')
  expect(item2[AspectType.THEIR_ID]).toBe('IDNES-142955')
})

test(AspectType.ELEVATOR, () => {
  expect(item1[AspectType.ELEVATOR]).toHaveLength(200)
  expect(item2[AspectType.ELEVATOR]).toHaveLength(200)
})

test(AspectType.HEATING_TYPE, () => {
  expect(item1[AspectType.HEATING_TYPE]).toBeUndefined()
  expect(item2[AspectType.HEATING_TYPE]).toBe('ústřední - dálkové')
})

test(AspectType.PARKING, () => {
  expect(item1[AspectType.PARKING]).toBe('parkování na ulici, parkovací místo')
  expect(item2[AspectType.PARKING]).toBe('parkování na pozemku')
})

test(AspectType.EQUIPMENT, () => {
  expect(item1[AspectType.EQUIPMENT]).toBeUndefined()
  expect(item2[AspectType.EQUIPMENT]).toBe('částečně zařízený')
})
