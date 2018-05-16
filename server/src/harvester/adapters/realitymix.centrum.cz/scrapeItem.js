const axios = require('axios')
const cheerio = require('cheerio')
const R = require('ramda')

const { AspectType } = require('../../../common/consts')

async function scrapeItem (url) {
  const { data } = await axios.get(url)

  const $ = cheerio.load(data)

  const attrs = {
    [AspectType.ORIGINAL_URL]: url,
    [AspectType.ADAPTER_NAME]: 'realitymix.centrum.cz',
  }

  const detailInsideEl = $('#detail-inside')

  const priceEl = $('#listing-price', detailInsideEl)
  attrs[AspectType.PRICE] = priceEl.text().trim()

  const priceNoteEl = $('.pricenote', detailInsideEl)
  attrs[AspectType.PRICE_NOTE] = priceNoteEl.text().trim()

  const addressEl = $('header > .subtitle', detailInsideEl)
  attrs[AspectType.ADDRESS] = addressEl.text().trim()

  const descriptionEl = $('#estate-description', detailInsideEl)
  attrs[AspectType.DESCRIPTION] = descriptionEl.text()

  const tdEls = $('#list-info > table td', detailInsideEl)
  const tds = Array.from(tdEls).map((el) => $(el).text())
  const [ keys, values ] = R.addIndex(R.partition)((_, i) => i % 2 === 0, tds)
  const pairs = R.zipObj(keys, values.map(x => x.replace(/[\n\t]+/g, '').trim()))

  R.forEachObjIndexed((value, key) => {
    switch (key) {
      case 'Dispozice bytu:':
        attrs[AspectType.NUM_ROOMS] = value
        break

      case 'Vlastnictví:':
        attrs[AspectType.OWNERSHIP_TYPE] = value
        break

      case 'Celková podlahová plocha:':
        attrs[AspectType.SIZE] = value
        break

      case 'Doprava:':
        attrs[AspectType.TRAFFIC] = value
        break

      case 'Energetická náročnost budovy:':
        attrs[AspectType.ENERGY_EFFICIENCY_RATING] = value
        break

      case 'Číslo podlaží v domě:':
        attrs[AspectType.FLOOR_NUM] = value
        break

      case 'Počet podlaží objektu:':
        attrs[AspectType.FLOORS_TOTAL] = value
        break

      case 'Stav objektu:':
        attrs[AspectType.FLAT_CONDITION] = value
        break

      case 'Druh objektu:':
        attrs[AspectType.CONSTRUCTION_TYPE] = value
        break

      case 'Sklep:':
        attrs[AspectType.BASEMENT] = value
        break

      case 'Lodžie:':
      case 'Balkon:':
      case 'Terasa:':
        attrs[AspectType.BALCONY] = attrs[AspectType.BALCONY] ?
          `${attrs[AspectType.BALCONY]};${key}:${value}` :
          `${key}:${value}`
        break

      case 'Číslo zakázky:':
        attrs[AspectType.THEIR_ID] = value
        break

      case 'Topení:':
        attrs[AspectType.HEATING_TYPE] = value
        break

      case 'Vybaveno:':
        attrs[AspectType.EQUIPMENT] = value
        break

      case 'Bezbariérový byt:':
        attrs[AspectType.BARRIER_FREE_ACCESS] = value
        break
    }
  }, pairs)

  return attrs
}

module.exports = scrapeItem
