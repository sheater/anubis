#!/usr/bin/env node

const program = require("commander")
const R = require("ramda")
const chalk = require("chalk")
const { Observable } = require('rxjs')

const neo4j = require("./common/neo4j")
const dao = require("./common/dao")
const { geocode, extractAddressPathFromAddressComponents } = require('./common/googleMaps')
const { getAdapter, getAdaptersList } = require("./harvester/adapters")
const scrape = require("./harvester/scrape")
const check = require('./harvester/check')

program.command("adapters")
  .description("List all available adapters")
  .action(() => {
    console.log("List of all available adapters:")
    getAdaptersList().forEach((name) => console.log("-", name))
  })

const START_URL_ADAPTER_MAP = {
  "reality.idnes.cz": "https://reality.idnes.cz/s/prodej/byty/jihomoravsky-kraj/",
  "realitymix.centrum.cz": "http://realitymix.centrum.cz/vypis-nabidek/?form%5Binzerat_typ%5D=1&form%5Badresa_kraj_id%5D%5B%5D=116&form%5Bsearch_in_city%5D=&form%5Bcena_normalizovana__from%5D=&form%5Bcena_normalizovana__to%5D=&form%5Bplocha__from%5D=&form%5Bplocha__to%5D=&form%5Bsearch_in_text%5D=&form%5Bnemovitost_typ%5D%5B%5D=4&form%5Bcena_mena%5D=1&form%5Bpodlazi_cislo__from%5D=&form%5Bpodlazi_cislo__to%5D=",
  "sreality.cz": "https://www.sreality.cz/api/cs/v2/estates?category_main_cb=1&category_type_cb=1&locality_region_id=14&per_page=60&tms=1520342434894"
}

program.command("scrape [source]")
  .description("scrape source site")
  .option("-n, --number <n>", "Number of items to scrape", 20)
  .option("-d, --dry", "Dry run")
  .action(async (sourceSite, cmd) => {
    console.log(chalk.green("scrape begin"))
    const startTime = Date.now()
    const sources = sourceSite ? [sourceSite] : getAdaptersList()

    const observables = []

    for (const source of sources) {
      const adapter = getAdapter(source)
      const startUrl = START_URL_ADAPTER_MAP[source]
      const number = Number.parseInt(cmd.number)

      if (!startUrl) {
        throw new Error("No available start url")
      }

      const scrapeLog = cmd.dry
        ? null
        : await dao.scrape.create(neo4j, {
          source,
          startUrl,
          numRequested: number,
        })

      const observable = scrape(adapter, startUrl, number)

      observables.push(observable)
      observable
        .subscribe(async (entry) => {
            if (scrapeLog) {
              await dao.snapshot.create(neo4j, scrapeLog, entry)
            }
            console.log(chalk.green("Entry"), chalk.magenta(entry.adapterName), entry.address)
          },
          (error) => {
            console.log(chalk.red("Error"), error)
          },
          async () => {
            console.log(chalk.green("Done"), source)
          }
        )
    }

    Observable.forkJoin(...observables).subscribe(() => {
      console.log(chalk.green(`Everything is done in ${(Date.now() - startTime) / 1000} s`))
    })
  })

let downtownRequests = 0
const downtownCache = {}
async function getDowntownFromAddress(addressPath) {
  const downtownAddress = addressPath.slice(0, 3).join(', ')

  if (downtownCache.hasOwnProperty(downtownAddress)) {
    return downtownCache[downtownAddress]
  } else {
    const { geometry } = R.head(await geocode(addressPath.slice(0, 3).join(', ')))
    const downtownCoords = geometry.location
    downtownRequests++
    downtownCache[downtownAddress] = downtownCoords
    return downtownCoords
  }
}

const haversine = require('haversine')

program.command('transform <source>')
  .option('-d, --dry-run', 'Dry run')
  .description('transforms snapshots into competitors')
  .action(async (source, opts) => {
    try {
      const snapshots = await dao.snapshot.list(neo4j, source)
      const adapter = getAdapter(source)

      let numSuccess = 0
      let numErrors = 0
      let numWarnings = 0

      for (const snapshot of snapshots) {
        const transformResult = adapter.transform(snapshot)
        const { competitor } = transformResult

        // refresh competitors each iteration
        const competitors = await dao.competitor.listAll(neo4j)
        const checkResult = check(competitor, competitors)

        const errors = R.concat(transformResult.errors, checkResult.errors)
        const warnings = R.concat(transformResult.warnings, checkResult.warnings)

        let statusMsg = chalk.bgGreen('Success')
        if (errors.length) {
          statusMsg = chalk.bgRed('Error')
        }
        else if (warnings.length) {
          statusMsg = chalk.bgYellow('Warning')
        }

        console.log(statusMsg)

        if (errors.length || warnings.length) {
          if (errors.length) {
            numErrors++
            console.log(chalk.red('errors'), errors)
          }

          if (warnings.length) {
            numWarnings++
            console.log(chalk.yellow('warnings'), warnings)
          }
        }
        else {
          const coords = R.head(await geocode(competitor.address))

          const {address_components, geometry} = coords
          const {lat, lng} = geometry.location
          const addressPath =
            extractAddressPathFromAddressComponents(address_components)

          const downtown = await getDowntownFromAddress(addressPath)

          const downtownDistance = haversine(
            { latitude: lat, longitude: lng },
            { latitude: downtown.lat, longitude: downtown.lng },
            { unit: 'meter' }
          )

          Object.assign(competitor, {
            originalUrl: snapshot.originalUrl,
            source: snapshot.adapterName,
            coords: [lat, lng],
            addressPath,
            downtownDistance,
          })

          if (opts.dryRun) {
            console.log(chalk.magenta('Competitor'), competitor)
          } else {
            await dao.competitor.create(neo4j, competitor)
          }

          numSuccess++
        }
      }

      console.log(
        chalk.magenta('Done'),
        'success:', numSuccess,
        '; errors:', numErrors,
        '; warnings: ', numWarnings,
        ' // downtownRequests:', downtownRequests
      )
    } catch (err) {
      console.log(chalk.red('ERROR'), err)
    }
  })

const test = require('./evaluator/test')

program.command('test')
  .action(async () => {
    try {
      const items = (await dao.competitor.listAll(neo4j))
      test(items)
    }
    catch (error) {
      console.log(chalk.red('ERROR'), error)
    }
  })

const fs = require('fs')

program.command('export-competitors')
  .action(async () => {
    try {
      const items = await dao.competitor.listAll(neo4j)

      const data = items.reduce((acc, x) => {
        const row = [
          x.numRooms,
          x.kitchenType,
          x.price,
          x.size,
          x.address,
          x.flatCondition,
          x.ownershipType ? x.ownershipType : 'OTHER',
          x.constructionType,
        ].map(y => `"${y}"`)

        return `${acc}${row.join(',')},\n`
      }, '')

      fs.writeFileSync('./competitors.csv', data);

      console.log(chalk.green('done'))
    }
    catch (err) {
      console.log(chalk.red('ERROR'), err)
    }
  })

program.command('print-address-paths')
  .option('-i, --index <n>', 'Index')
  .action(async (opts) => {
    try {
      const items = await dao.competitor.listAll(neo4j)
      const index = Number.parseInt(opts.index)

      const cities = items.map(x => {
        if (R.is(Number, index) && index === index) {
          console.log(Array.from(x.addressPath)[index])
        }
        else {
          console.log(JSON.stringify(x.addressPath))
        }

        return x.addressPath[2]
      })

      console.log('Uniq cities', R.uniq(cities))
    }
    catch (err) {
      console.log(chalk.red('ERROR'), err)
    }
  })

program.command('analyze-descriptions')
  .action(async () => {
    try {
      // const promises = .map(x => dao.snapshot.list(neo4j, x))
      const sources = [
        'reality.idnes.cz',
        'realitymix.centrum.cz',
        'sreality.cz',
      ]
      const list = []

      for (const source of sources) {
        const res = await dao.snapshot.list(neo4j, source)

        list.push(...res)
      }

      const words = R.pipe(
        R.map(x => x.description),
        R.filter(R.identity),
        R.map(R.split(' ')),
        R.flatten,
        R.map(R.toLower),
        R.map(R.replace(/[\.\,]$/g, '')),
        R.filter(x => x.length > 2),
        R.reduce((acc, x) => {
          if (acc.hasOwnProperty(x)) {
            acc[x]++
          }
          else {
            acc[x] = 1
          }
          return acc
        }, {}),
        R.mapObjIndexed((count, word) => ({ word, count })),
        Object.values,
        R.sortBy(x => x.count),
        R.reverse,
      )(list)

      console.log('items', words)
    }
    catch (err) {
      console.log(chalk.red('ERROR'), err)
    }
  })

program.parse(process.argv)
