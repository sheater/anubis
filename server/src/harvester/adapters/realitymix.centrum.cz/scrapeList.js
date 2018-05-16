const urlLib = require('url')
const axios = require('axios')
const cheerio = require('cheerio')

async function scrapeList (url) {
  const { data } = await axios.get(url)
  const $ = cheerio.load(data)

  const listingEl = $('#main-list')
  const paginatorEl = $('.paginator')

  const items = Array.from(
    $('> li', listingEl).map((i, item) => {
      const href = $('h2 a', item).attr('href')

      if (!href) {
        return null
      }

      return urlLib.resolve(url, href)
    })
  ).filter((x) => x)

  const nextListEl = $('.next', paginatorEl)
  const nextList = nextListEl.length
    ? urlLib.resolve(url, nextListEl.attr('href'))
    : null

  return { items, nextList }
}

module.exports = scrapeList
