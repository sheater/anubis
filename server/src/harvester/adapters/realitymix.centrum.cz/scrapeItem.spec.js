const axios = require("axios")
const MockAdapter = require("axios-mock-adapter")

const { AspectType } = require('../../../common/consts')
const loadFixture = require('../../utils/loadFixture')
const scrapeItem = require('./scrapeItem')

const mock = new MockAdapter(axios)

const ITEM_1_URL = 'http://realitymix.centrum.cz/detail/brno/prodej-bytu-3-kk-89-4m2-s-balkonem-10-5m2-v-centru-brna-ulice-cejl-7066773.html'
const ITEM_2_URL = 'http://realitymix.centrum.cz/detail/brno/ov-2-1-ul-chodska-kralovo-pole-cp-64-m2-jako-startovni-bydleni-nebo-investice-7066303.html'

mock.onGet(ITEM_1_URL).reply(200, loadFixture('realitymix.centrum.cz/1/index.html'))
mock.onGet(ITEM_2_URL).reply(200, loadFixture('realitymix.centrum.cz/2/index.html'))

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
  expect(item1[AspectType.ADAPTER_NAME]).toBe('realitymix.centrum.cz')
  expect(item2[AspectType.ADAPTER_NAME]).toBe('realitymix.centrum.cz')
})

test(AspectType.PRICE, () => {
  expect(item1[AspectType.PRICE]).toBe('4 420 000 Kč')
  expect(item2[AspectType.PRICE]).toBe('3 000 000 Kč')
})

test(AspectType.PRICE_NOTE, () => {
  expect(item1[AspectType.PRICE_NOTE]).toBe('cena včetně provize RK a právních služeb')
  expect(item2[AspectType.PRICE_NOTE]).toBe('+ provize RK + daň z nabytí nemovitostí')
})

test(AspectType.ADDRESS, () => {
  expect(item1[AspectType.ADDRESS]).toBe('Cejl, Brno-střed, Brno, Brno-město')
  expect(item2[AspectType.ADDRESS]).toBe('Chodská, Brno-Královo Pole, Brno, Brno-město')
})

test(AspectType.NUM_ROOMS, () => {
  expect(item1[AspectType.NUM_ROOMS]).toBe('3+kk')
  expect(item2[AspectType.NUM_ROOMS]).toBe('2+1')
})

test(AspectType.DESCRIPTION, () => {
  expect(item1[AspectType.DESCRIPTION]).toHaveLength(972)
  expect(item2[AspectType.DESCRIPTION]).toHaveLength(636)
})

test(AspectType.OWNERSHIP_TYPE, () => {
  expect(item1[AspectType.OWNERSHIP_TYPE]).toBe('osobní')
  expect(item2[AspectType.OWNERSHIP_TYPE]).toBe('osobní')
})

test(AspectType.SIZE, () => {
  expect(item1[AspectType.SIZE]).toBe('89 m²')
  expect(item2[AspectType.SIZE]).toBe('64 m²')
})

test(AspectType.ENERGY_EFFICIENCY_RATING, () => {
  expect(item1[AspectType.ENERGY_EFFICIENCY_RATING]).toBe('G - Mimořádně nehospodárná')
  expect(item2[AspectType.ENERGY_EFFICIENCY_RATING]).toBe('C - Vyhovující')
})

test(AspectType.FLOOR_NUM, () => {
  expect(item1[AspectType.FLOOR_NUM]).toBe('3')
  expect(item2[AspectType.FLOOR_NUM]).toBe('5')
})

test(AspectType.FLAT_CONDITION, () => {
  expect(item1[AspectType.FLAT_CONDITION]).toHaveLength(12)
  expect(item2[AspectType.FLAT_CONDITION]).toHaveLength(12)
})

test(AspectType.CONSTRUCTION_TYPE, () => {
  expect(item1[AspectType.CONSTRUCTION_TYPE]).toBe('cihlová')
  expect(item2[AspectType.CONSTRUCTION_TYPE]).toBe('panelová')
})

test(AspectType.BASEMENT, () => {
  expect(item1[AspectType.BASEMENT]).toBeUndefined()
  expect(item2[AspectType.BASEMENT]).toBe('2 m²')
})

test(AspectType.BALCONY, () => {
  expect(item1[AspectType.BALCONY]).toBe('Balkon::10 m²')
  expect(item2[AspectType.BALCONY]).toBe('Lodžie::10 m²')
})

test(AspectType.THEIR_ID, () => {
  expect(item1[AspectType.THEIR_ID]).toBe('REALITYMIX-197-N03158')
  expect(item2[AspectType.THEIR_ID]).toBe('REALITYMIX-B16906LP')
})

test(AspectType.HEATING_TYPE, () => {
  expect(item1[AspectType.HEATING_TYPE]).toBe('Ústřední - plynové')
  expect(item2[AspectType.HEATING_TYPE]).toBe('Ústřední - dálkové')
})

test(AspectType.EQUIPMENT, () => {
  expect(item1[AspectType.EQUIPMENT]).toBeUndefined()
  expect(item2[AspectType.EQUIPMENT]).toBe('ano')
})
