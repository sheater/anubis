const axios = require('axios')
const cheerio = require('cheerio')
const R = require('ramda')

const { AspectType } = require('../../../common/consts')

function append (obj, key, value) {
  obj[key] ? obj[key] += value : obj[key] = value
}

function unescapeUnicode (str) {
  // return str.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
  //   return String.fromCharCode(parseInt(grp, 16))
  // })
  // return decodeURIComponent(str)
  return str
}

async function scrapeItem (url) {
  const { data } = await axios.get(url)
  const $ = cheerio.load(data, { decodeEntities: false })

  const attrs = {
    [AspectType.ORIGINAL_URL]: url,
    [AspectType.ADAPTER_NAME]: 'reality.idnes.cz',
  }

  const articleEl = $('article[role="article"]')

  const priceEl = $('.b-detail__price', articleEl)
  attrs[AspectType.PRICE] = priceEl.text().trim()

  const priceNoteEl = $('.b-detail__price-info', articleEl)
  attrs[AspectType.PRICE_NOTE] = priceNoteEl.text().trim()

  const locationEl = $('.b-detail__info', articleEl)
  attrs[AspectType.ADDRESS] = locationEl.text().trim()

  const titleEl = $('.b-detail__title', articleEl)
  attrs[AspectType.NUM_ROOMS] = titleEl.text().trim()

  const descriptionEl = $('.b-desc', articleEl)
  attrs[AspectType.DESCRIPTION] = descriptionEl.text().trim()

  const parametersEl = $('.b-definition', articleEl)
  const parameters = $('dt, dd', parametersEl).map((i, el) => $(el))
  const tds = Array.from(parameters)
  const [ keys, values ] = R.addIndex(R.partition)((_, i) => i % 2 === 0, tds)
  const mappedKeys = keys.map((x) => x.text())
  const mappedValues = values.map(x => unescapeUnicode(x.html().replace(/[\n\t]+/g, '')))
  const pairs = R.zipObj(mappedKeys, mappedValues)

  R.forEachObjIndexed((value, key) => {
    switch (key) {
      case 'Vlastnictví':
        attrs[AspectType.OWNERSHIP_TYPE] = value
        break

      case 'Užitná plocha':
        attrs[AspectType.SIZE] = value
        break

      case 'PENB':
        attrs[AspectType.ENERGY_EFFICIENCY_RATING] = value
        break

      case 'Podlaží':
        attrs[AspectType.FLOOR_NUM] = value
        break

      case 'Stav budovy':
        attrs[AspectType.BUILDING_CONDITION] = value
        break

      case 'Stav bytu':
        attrs[AspectType.FLAT_CONDITION] = value
        break

      case 'Konstrukce budovy':
        attrs[AspectType.CONSTRUCTION_TYPE] = value
        break

      case 'Sklep':
        attrs[AspectType.BASEMENT] = value
        break

      case 'Lodžie':
        append(attrs, AspectType.BALCONY, `Lodzie:${value}`)
        break

      case 'Terasa':
        append(attrs, AspectType.BALCONY, `Terasa:${value}`)
        break

      case 'Balkon':
        append(attrs, AspectType.BALCONY, `Balkon:${value}`)
        break

      case 'Číslo zakázky':
        attrs[AspectType.THEIR_ID] = value
        break

      case 'Výtah':
        attrs[AspectType.ELEVATOR] = value
        break

      case 'Topení':
        attrs[AspectType.HEATING_TYPE] = value
        break

      case 'Parkování':
        attrs[AspectType.PARKING] = value
        break

      case 'Vybavení':
        attrs[AspectType.EQUIPMENT] = value
        break
    }
  }, pairs)

  return attrs
}

module.exports = scrapeItem
