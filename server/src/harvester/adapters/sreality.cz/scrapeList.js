const axios = require('axios')

const SREALITY_API_URL = 'https://www.sreality.cz/api'

async function scrapeList (url) {
  const { data: json } = await axios.get(url, { responseType: 'json' })
  const items = json._embedded.estates.map(x => SREALITY_API_URL + x._links.self.href)
  const resultSize = json.result_size
  const page = json.page
  const perPage = json.per_page

  const nextList = page * perPage < resultSize
    ? SREALITY_API_URL + json._links.self.href.replace(/page=(\d+)$/, `page=${(page + 1).toString()}`)
    : null

  return { items, nextList }
}

module.exports = scrapeList
