const R = require('ramda')

const { createBaseProps } = require('./utils')

module.exports = {
  create: async (neo4j, params) => {
    if (!R.is(Object, params)) {
      throw new Error('Params are not object')
    }

    const props = { ...params, ...createBaseProps() }
    const { records } = await neo4j.query(
      'CREATE (n:Scrape {props}) RETURN n',
      { props }
    )

    if (!records.length) {
      throw Error('NotProperlyCreated')
    }

    return props
  },

  remove: async (neo4j, id) => {
    const { records } = await neo4j.query(`
      MATCH (s:Scrape { id: $id })
      OPTIONAL MATCH (s)-[:CREATED]->(n:Snapshot)
      DETACH DELETE s, n
      RETURN count(n) as deletedNodesCount
    `, { id })

    if (records[0].get('deletedNodesCount') <= 0) {
      throw new Error('Nothing was deleted')
    }
  },

  getById: async (neo4j, id) => {
    const { records } = await neo4j.query(`
      MATCH (s:Scrape { id: {id} })
      RETURN s
    `, { id })

    if (!records.length) {
      throw new Error('Not found')
    }

    return R.head(records).get('s').properties
  },

  list: async (neo4j) => {
    // FIXME: sortovat uz v dotazu
    const { records } = await neo4j.query(`
      MATCH (s:Scrape) 
      OPTIONAL MATCH (s)-[:CREATED]->(n:Snapshot)
      RETURN
        s.id as id,
        round(s.createdAt / 1000) as createdAt,
        s.source as source,
        s.startUrl as startUrl,
        s.numRequested as numRequested,
        count(n) as numEffective
    `)

    return records
      .map((x) => x.toObject())
      .sort((a, b) => b.createdAt - a.createdAt)
  }
}
