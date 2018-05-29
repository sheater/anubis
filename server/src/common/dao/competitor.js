const R = require('ramda')

const { createBaseProps } = require('./utils')
const { standardDeviation } = require('../../utils/stats')

module.exports = {
  create: async (neo4j, params) => {
    if (!R.is(Object, params)) {
      throw new Error('`Params` is not object')
    }

    if (!params.source) {
      throw new Error('Missing `source`')
    }

    if (!params.originalUrl) {
      throw new Error('Missing `originalUrl`')
    }

    const props = { ...params, ...createBaseProps() }
    const { records } = await neo4j.query(
      [
        'CREATE (n:Competitor {props})',
        'RETURN n'
      ].join(' '),
      { props }
    )

    if (!records.length) {
      throw Error('NotProperlyCreated')
    }

    return props
  },

  getById: async (neo4j, id) => {
    const { records } = await neo4j.query(`
      MATCH (c:Competitor { id: {id} })
      RETURN c
    `, { id })

    if (!records.length) {
      throw new Error('Not found')
    }

    return R.head(records).get('c').properties
  },

  listAll: async (neo4j) => {
    const {records} = await neo4j.query(`
      MATCH (c:Competitor)
      RETURN c
    `)

    return records.map(x => x.get('c').properties)
  },

  remove: async (neo4j, id) => {
    const { records } = await neo4j.query(`
      MATCH (n:Competitor { id: {id} })
      DETACH DELETE n
      RETURN count(n) as deletedNodesCount
    `, { id })

    if (records[0].get('deletedNodesCount') <= 0) {
      throw new Error('Nothing was deleted')
    }
  },

  getAveragePrices: async (neo4j, source) => {
    const { records } = await neo4j.query(`
      MATCH (c:Competitor { source: {source} })
      RETURN c.price as price, c.size as size
    `, { source })

    const competitors = records.map(x => ({
      price: x.get('price'),
      size: x.get('size')
    }))

    const averagePrice = R.pipe(R.pluck('price'), R.mean)(competitors)
    const unitCompetitors = R.map(x => x.price / x.size)(competitors)

    const averageUnitPrice = R.mean(unitCompetitors)
    const minUnitPrice = unitCompetitors.reduce((acc, x) => {
      return x < acc ? x : acc
    }, Infinity)
    const maxUnitPrice = unitCompetitors.reduce((acc, x) => {
      return x > acc ? x : acc
    }, -Infinity)
    const sd = standardDeviation(unitCompetitors)
    // const minUnitPrice = R.min(...unitCompetitors)
    // const maxUnitPrice = R.max(...unitCompetitors)
    //
    // console.log('avg', averageUnitPrice)
    // console.log('uni', maxUnitPrice)
    // console.log('uni', minUnitPrice)

    return {
      averagePrice,
      averageUnitPrice,
      minUnitPrice,
      maxUnitPrice,
      sd,
    }
  }
}
