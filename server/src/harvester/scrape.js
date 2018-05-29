const { Observable } = require('rxjs')

const axios = require('axios')
const axiosRetry = require('axios-retry')

axiosRetry(axios, { retries: 3 });

function scrape (adapter, startUrl, num) {
  return Observable.create(async (observer) => {
    let url = startUrl
    let i = 0

    try {
      while (1) {
        if (i >= num || !url) {
          break
        }

        const { items, nextList } = await adapter.scrapeList(url)

        if (!items.length) {
          break
        }

        for (let j = 0; j < items.length && i < num; j++) {
          try {
            const entry = await adapter.scrapeItem(items[j])

            observer.next(entry)
          }
          catch (error) {
            observer.next({ error })
          }
          i++
        }

        url = nextList
      }
    }
    catch (e) {
      observer.error(e)
    }
    finally {
      observer.complete()
    }
  })
}

module.exports = scrape
