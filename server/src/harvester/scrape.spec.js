const scrape = require('./scrape')

const MAX_MOCK_ADAPTER_ITEMS = 30

async function delay (ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class AdapterMock {
  constructor () {
    this._items = Array.from(Array(MAX_MOCK_ADAPTER_ITEMS))
      .map((x, i) => `mock${i}`)

    this.willErrorWhenScrapeItem = false
    this.willErrorWhenScrapeList = false
  }

  async scrapeItem (item) {
    await delay()
    if (this.willErrorWhenScrapeItem) {
      throw new Error('ScrapeItemError')
    }
    return item
  }

  async scrapeList () {
    if (this.willErrorWhenScrapeList) {
      throw new Error('ScrapeListError')
    }

    let i = 0
    let items = []
    while (i < 20 && this._items.length) {
      i++
      items.push(this._items.shift())
    }

    await delay()

    return {
      nextList: this._items.length ? 'some-link' : null,
      items,
    }
  }
}

let adapter

beforeEach(() => {
  adapter = new AdapterMock()
})

test('scrape first item', async () => {
  const observable$ = scrape(adapter, 'whogivesafuck', 1)

  let items = []
  let error = null
  await new Promise((resolve) => {
    observable$.subscribe(
      (item) => items.push(item),
      (e) => error = e,
      resolve
    )
  })

  expect(items).toHaveLength(1)
  expect(error).toBeNull()
})

test('scrape 10 items on 1 page', async () => {
  const observable$ = scrape(adapter, 'whogivesafuck', 10)

  let items = []
  let error = null
  await new Promise((resolve) => {
    observable$.subscribe(
      (item) => items.push(item),
      (e) => error = e,
      resolve
    )
  })

  expect(items).toHaveLength(10)
  expect(error).toBeNull()
})

test('scrape 30 items on 2 pages', async () => {
  const observable$ = scrape(adapter, 'whogivesafuck', 30)

  let items = []
  let error = null
  await new Promise((resolve) => {
    observable$.subscribe(
      (item) => items.push(item),
      (e) => error = e,
      resolve
    )
  })

  expect(items).toHaveLength(30)
  expect(error).toBeNull()
})

test('reach maximum pages', async () => {
  const observable$ = scrape(adapter, 'whogivesafuck', 100)

  let items = []
  let error = null
  await new Promise((resolve) => {
    observable$.subscribe(
      (item) => items.push(item),
      (e) => error = e,
      resolve
    )
  })

  expect(items).toHaveLength(MAX_MOCK_ADAPTER_ITEMS)
  expect(error).toBeNull()
})

test('continue after error when scrapeItem failed', async () => {
  const observable$ = scrape(adapter, 'whogivesafuck', 20)

  let items = []
  let error = null
  await new Promise((resolve) => {
    observable$.subscribe(
      (item) => {
        adapter.willErrorWhenScrapeItem = items.length === 5
        items.push(item)
      },
      (e) => error = e,
      resolve
    )
  })

  expect(error).toBeNull()
  expect(items).toHaveLength(20)
  expect(items[6].error).toBeDefined()
})

test('stop after error when scrapeList failed', async () => {
  const observable$ = scrape(adapter, 'whogivesafuck', 10)
  adapter.willErrorWhenScrapeList = true

  let items = []
  let error = null
  await new Promise((resolve) => {
    observable$.subscribe(
      (item) => items.push(item),
      (e) => {
        error = e
        resolve()
      },
      resolve
    )
  })

  expect(error).not.toBeNull()
  expect(items).toHaveLength(0)
})
