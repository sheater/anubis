const urlLib = require('url')
const axios = require('axios')
const cheerio = require('cheerio')

async function scrapeList (url) {
  const { data } = await axios.get(url)
  const $ = cheerio.load(data)

  const listingEl = $('.c-list-products__list')
  const items = Array.from(
    $('.c-list-products__item', listingEl).map((i, item) => {
      const href = $('.c-list-products__link', item).attr('href')

      if (!href) {
        return null
      }

      return urlLib.resolve(url, href)
    })
  ).filter((x) => x)

  const paginatorEl = $('#snippet-s-result-paginator-')
  const nextListEl = $('.paging__next', paginatorEl)
  const nextList = nextListEl.length
    ? urlLib.resolve(url, nextListEl.attr('href'))
    : null

  return { items, nextList }
}

module.exports = scrapeList
