const R = require('ramda')

const { createBaseProps } = require('./utils')

module.exports = {
  create: async (neo4j, scrape, params) => {
    if (!R.is(Object, params)) {
      throw new Error('Params are not object')
    }

    if (!scrape || !scrape.id) {
      throw new Error('Invalid scrape')
    }

    const props = { ...params, ...createBaseProps() }
    const { records } = await neo4j.query(
      [
        'MATCH (s:Scrape { id: {scrapeId} })',
        'CREATE (n:Snapshot {props})<-[:CREATED]-(s)',
        'RETURN n'
      ].join(' '),
      { props, scrapeId: scrape.id }
    )

    if (!records.length) {
      throw Error('NotProperlyCreated')
    }

    return props
  },

  list: async (neo4j, adapterName) => {
    const { records } = await neo4j.query(
      [
        'MATCH (n:Snapshot { adapterName: {adapterName} })',
        'RETURN n'
      ].join(' '),
      { adapterName }
    )

    return records.map(x => x.get('n').properties)
  },

  analyzeAspect: async (neo4j, adapterName, aspectKey) => {
    if (!adapterName) {
      throw new Error('no adapterName')
    }

    if (!aspectKey) {
      throw new Error('no aspectKey')
    }

    const { records } = await neo4j.query(
      [
        'MATCH (n:Snapshot { adapterName: {adapterName} })',
        `RETURN count(n.${aspectKey}) as numUsages, count(DISTINCT n.${aspectKey}) as numVariants, collect(DISTINCT n.${aspectKey}) as variants`
      ].join(' '),
      { adapterName }
    )

    const numUsages = records[0].get('numUsages').toString()
    const numVariants = records[0].get('numVariants').toString()
    const variants = records[0].get('variants')

    return { numUsages, numVariants, variants }
  },

  listAspects: async (neo4j, adapterName) => {
    const cql = adapterName
      ? [
        'MATCH (n:Snapshot { adapterName: {adapterName} })',
        `RETURN keys(n) as k`
      ]
      : [
        'MATCH (n:Snapshot)',
        `RETURN keys(n) as k`
      ]

    const { records } = await neo4j.query(cql.join(' '), { adapterName })

    return records.reduce((acc, x) => {
      const keys = x.get('k')
      acc.push(...R.difference(keys, acc))
      return acc
    }, [])
  }
}
