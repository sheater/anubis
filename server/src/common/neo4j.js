const neo4j = require('neo4j-driver').v1

const driver = neo4j.driver('bolt://127.0.0.1', neo4j.auth.basic('neo4j', 'chucknorris'))
const session = driver.session()

async function query(query, params) {
  try {
    // NOTE: await IS REQUIRED HERE!!!
    return await session.run(query, params)
  }
  catch (error) {
    throw error
  }
  finally {
    session.close()
  }
}

module.exports = { query, close: driver.close }

//
// const personName = 'Alice'
// const resultPromise = session.run(
//   'CREATE (a:Person {name: $name}) RETURN a',
//   {name: personName}
// )
//
// resultPromise.then(result => {
//   session.close()
//
//   const singleRecord = result.records[0]
//   const node = singleRecord.get(0)
//
//   console.log(node.properties.name)
//
//   // on application exit:
//   driver.close()
// })
//
// async function insertEntries (items) {
//   console.log('insertEntries', items)
// }
//
// module.exports = { insertEntries }
