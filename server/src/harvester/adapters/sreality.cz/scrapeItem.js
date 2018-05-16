const axios = require('axios')

const { AspectType } = require('../../../common/consts')

async function scrapeItem (url) {
  const { data: json } = await axios.get(url, { responseType: 'json' })
  // await new Promise(resolve => setTimeout(resolve, 300))

  const attrs = {
    [AspectType.ORIGINAL_URL]: url,
    [AspectType.ADAPTER_NAME]: 'sreality.cz',
    [AspectType.NUM_ROOMS]: json.name.value,
    [AspectType.ADDRESS]: json.locality.value,
    [AspectType.DESCRIPTION]: json.text.value,
    [AspectType.PRICE]: json.price_czk.value_raw,
  }

  json.items.forEach((x) => {
    switch (x.name) {
      case 'Doprava':
        attrs[AspectType.TRAFFIC] = x.value.map(y => y.value).join(';')
        break

      case 'Vybavení':
        attrs[AspectType.EQUIPMENT] = x.value
        break

      case 'Výtah':
        attrs[AspectType.ELEVATOR] = x.value
        break

      case 'Energetická náročnost budovy':
        attrs[AspectType.ENERGY_EFFICIENCY_RATING] = x.value
        break

      case 'Topení':
        attrs[AspectType.HEATING_TYPE] = JSON.stringify(x.value)
        break

      case 'Sklep':
        attrs[AspectType.BASEMENT] = x.value
        break

      case 'Terasa':
        attrs[AspectType.BALCONY] = x.value
        break

      case 'Užitná plocha':
      case "Plocha podlahov\u00e1":
        attrs[AspectType.SIZE] = x.value
        break

      case 'Podlaží':
        attrs[AspectType.FLOOR_NUM] = x.value
        break

      case 'Vlastnictví':
        attrs[AspectType.OWNERSHIP_TYPE] = x.value
        break

      case 'Stav objektu':
        attrs[AspectType.FLAT_CONDITION] = x.value
        break

      case 'Stavba':
        attrs[AspectType.CONSTRUCTION_TYPE] = x.value
        break

      case 'Aktualizace':
        attrs[AspectType.LAST_UPDATE] = x.value
        break

      case 'ID zakázky':
        attrs[AspectType.THEIR_ID] = x.value
        break

      case 'Poznámka k ceně':
        attrs[AspectType.PRICE_NOTE] = x.value
        break

      case 'Parkov\u00e1n\u00ed':
        attrs[AspectType.PARKING] = x.value
        break
    }
  }, {})

  return attrs
}

module.exports = scrapeItem
