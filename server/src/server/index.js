const Koa = require('koa')
const mount = require('koa-mount')
const graphqlHTTP = require('koa-graphql')
const { buildSchema } = require('graphql')
const cors = require('@koa/cors')
const R = require('ramda')

const { getAdaptersList } = require('../harvester/adapters')
const evaluate = require('../evaluator/evaluate')
const neo4j = require('../common/neo4j')
const dao = require('../common/dao')
const { geocode, extractAddressPathFromAddressComponents } = require('../common/googleMaps')
const createStatsObject = require("../evaluator/createStatsObject")

const app = new Koa()

const schema = buildSchema(`
  type Scrape {
    id: ID
    createdAt: Int
    source: String
    startUrl: String
    numRequested: Int
    numEffective: Int
  }

  type Adapter {
    id: ID
    name: String
  }

  type Global {
    adapters: [Adapter]
  }

  scalar Snapshot
  scalar Aspect
  
  type AspectPossibleValue {
    content: String
    count: Int
  }

  type AspectStatsByAdapter {
    adapterId: ID
    isUndefinedPossible: Boolean
    possibleValues: [AspectPossibleValue]
  }

  type AspectStats {
    items: [AspectStatsByAdapter]
  }
  
  type Competitor {
    id: ID
    source: String
    originalUrl: String
    address: String
    price: Int
    size: Int
    numRooms: Int
    kitchenType: String
    ownershipType: String
    flatCondition: String
    constructionType: String
    floorNum: Int
    basement: Boolean
    coords: [Float]
    downtownDistance: Float
    addressPath: [String]
  }
  
  scalar Stats
  scalar Entity

  type Evaluation {
    competitors: [Entity]
    # outliers: [Entity]
    estimatedPrice: Float
    estimatedUnitPrice: Float
    standardDeviation: Float
  }

  input EvaluationAttributes {
    address: String!
    numRooms: Int!
    size: Int!
    kitchenType: String
    ownershipType: String
    flatCondition: String
    constructionType: String
    floorNum: Int
    basement: Boolean
  }

  type Query {
    scrapes: [Scrape]
    competitors: [Competitor]
    global: Global
    snapshots(adapter: String): [Snapshot]
    aspects: [Aspect]
    aspectStats(aspectKey: String): AspectStats
    stats: Stats
    evaluate(attributes: EvaluationAttributes!): Evaluation
  }

  type Mutation {
    removeScrape(id: ID): Scrape
    removeCompetitor(id: ID): Competitor
  }
`)

const resolver = {
  scrapes: async () => {
    return await dao.scrape.list(neo4j)
  },

  snapshots: async (obj) => {
    return await dao.snapshot.list(neo4j, obj.adapter)
  },

  removeScrape: async (obj) => {
    const scrape = await dao.scrape.getById(neo4j, obj.id)
    await dao.scrape.remove(neo4j, scrape.id)

    return scrape
  },

  removeCompetitor: async (obj) => {
    const competitor = await dao.competitor.getById(neo4j, obj.id)
    await dao.competitor.remove(neo4j, competitor.id)

    return competitor
  },

  competitors: async () => {
    return dao.competitor.listAll(neo4j)
  },

  stats: async () => {
    const prices = await Promise.all(
      getAdaptersList().map(async (source) => {
        const x = await dao.competitor.getAveragePrices(neo4j, source)

        return { ...x, source }
      })
    )

    return { prices }
  },

  aspects: async () => {
    const adapters = getAdaptersList()
    const promises = adapters.map(async (adapter) => {
      const { records } = await neo4j.query([
        'MATCH (n:Snapshot { adapterName: {adapter} })',
        'RETURN filter(x IN keys(n) WHERE n[x] IS NOT NULL) as k'
      ].join(' '), { adapter })

      return records.reduce((acc, x) => {
        x.get('k').forEach((key) => {
          acc[key] = acc.hasOwnProperty(key) ? acc[key] + 1 : 1
        })

        return acc
      }, {})
    })

    const usagesByName = (await Promise.all(promises))

    const keys = R.pipe(
      R.flatten,
      R.uniq,
    )(usagesByName.map(Object.keys))

    return keys.map((key) => {
      const aspect = { key }
      adapters.forEach((adapter, i) =>
        aspect[adapter] = usagesByName[i][key] || 0)
      return aspect
    })
  },

  aspectStats: async (obj) => {
    const { aspectKey } = obj
    const adapters = getAdaptersList()
    const promises = adapters.map(async (adapterId) => {
      const { records } = await neo4j.query(`
        MATCH (n:Snapshot { adapterName: {adapterId} })
        RETURN n[$aspectKey] as aspect
      `, { adapterId, aspectKey })

      let isUndefinedPossible = false

      const possibleValues = records.reduce((acc, x) => {
        const content = x.get('aspect')

        if (!content) {
          isUndefinedPossible = true
        }

        const index = acc.findIndex(xx => xx.content === content)
        if (index >= 0) {
          acc[index].count++
        }
        else {
          acc.push({ content, count: 1 })
        }

        return acc
      }, [])

      return { adapterId, possibleValues, isUndefinedPossible }
    })

    return { items: await promises }
  },

  evaluate: async (obj) => {
    const { attributes } = obj
    const competitors = await dao.competitor.listAll(neo4j)
    const geodata = await geocode(attributes.address)

    if (!geodata.length) {
      throw new Error('Invalid location')
    }

    const { address_components, geometry } = R.head(geodata)
    const addressPath =
      extractAddressPathFromAddressComponents(address_components)
    const coords = [geometry.location.lat, geometry.location.lng]
    const target = Object.assign({}, attributes, { addressPath, coords })
    const stats = createStatsObject(competitors)

    return evaluate(target, competitors, stats)
  },

  global: async () => {
    await new Promise(resolve => setTimeout(resolve, 50))
    return {
      adapters: [
        { id: 'reality.idnes.cz', name: 'Reality.iDNES.cz' },
        { id: 'realitymix.centrum.cz', name: 'Realitymix Centrum' },
        { id: 'sreality.cz', name: 'Sreality.cz' },
      ]
    }
  }
}

app.use(cors())
app.use(mount('/graphql', graphqlHTTP({
  schema,
  rootValue: resolver,
  graphiql: true
})))

app.listen(4000)
