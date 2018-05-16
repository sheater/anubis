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

          // console.log('DDDD', addressPath, d, downtown)

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

program.command('extract <source>')
  .option('-d, --dry-run', 'Dry run')
  .option('-n, --number <n>', 'Number of items to scrape', 20)
  .action(async (source, opts) => {
    try {
      const adapter = getAdapter(source)
      const startUrl = START_URL_ADAPTER_MAP[source]
      const number = Number.parseInt(opts.number)

      if (!startUrl) {
        throw new Error("No available start url")
      }

      const observable = scrape(adapter, startUrl, number)

      console.log('kokot', adapter)
    } catch (err) {
      console.log(chalk.red('ERROR'), err)
    }
  })

const test = require('./evaluator/test')

program.command('test')
  .action(async () => {
    try {
      const items = (await dao.competitor.listAll(neo4j))
        // .filter(x => R.last(x.addressPath) !== "Brno")
      test(items)
    }
    catch (error) {
      console.log(chalk.red('ERROR'), error)
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

// program.command('sample-num-competitors-test')
//   .action(async () => {
//     try {
//       const items = await dao.competitor.listAll(neo4j)
//
//       console.log('Total accuracy', test(items) * 100, '%')
//     }
//     catch (error) {
//       console.log(chalk.red('ERROR'), error)
//     }
//   })
//
// const { AspectType } = require('./common/consts')
//
// const GENS = [
//   [AspectType.SIZE],
//   [AspectType.NUM_ROOMS],
//   [AspectType.KITCHEN_TYPE],
//   [AspectType.OWNERSHIP_TYPE],
//   [AspectType.FLAT_CONDITION],
//   [AspectType.CONSTRUCTION_TYPE],
//   [AspectType.FLOOR_NUM],
//   [AspectType.BASEMENT],
// ]
//
// function selectByFitness(population, count = 2) {
//   const selection = []
//   const fitnessSum = population.reduce((acc, x) => acc + x.fitness, 0)
//
//   while (selection.length < Math.min(population.length, count)) {
//     const r = Math.random() * fitnessSum
//
//     let acc = 0
//     const item = population.find(x => {
//       if (r > acc && r < acc + x.fitness) {
//         return true
//       }
//       acc += x.fitness
//     })
//
//     if (item && !selection.includes(item)) {
//       selection.push(item)
//     }
//   }
//
//   return selection
// }
//
// function crossSample(sample, count = 2) {
//   return R.times(() => {
//     const s = selectByFitness(sample, 2)
//     const a = R.head(s)
//     const b = R.last(s)
//     const keys = Object.keys(a)
//     return keys.reduce((acc, key) => {
//       acc[key] = a[key] * b[key]
//       return acc
//     }, {})
//   }, count)
// }
//
// function mutateSample(sample, count = 2) {
//   const mutated = sample.slice()
//
//   for (let i = 0; i < count; i++) {
//     const idx = Math.floor(Math.random() * mutated.length)
//     const x = mutated[idx]
//     const keys = Object.keys(x)
//     const key = keys[Math.floor(Math.random() * keys.length)]
//
//     x[key] = 1 - x[key]
//   }
//
//   return mutated
// }
//
// function crossover(parents) {
//   return Object.keys(R.head(parents)).reduce((acc, key) => {
//     acc[key] = parents[Math.floor(Math.random() * parents.length)][key]
//     return acc
//   }, {})
// }
//
// function mutate(individual) {
//   const keys = Object.keys(individual)
//   const key = keys[Math.floor(Math.random() * keys.length)]
//   individual[key] = Math.random()
// }
//
// function roundNum(num, dec = 100) {
//   return Math.round(num * dec) / dec
// }
//
// program.command('gen')
//   .option('-p, --population [n]', 'Population size', '10')
//   .option('-g, --generations [n]', 'Max generations', '50')
//   .description('calculate aspect weights')
//   .action(async (opts) => {
//     const items = await dao.competitor.listAll(neo4j)
//
//     const populationSize = Number.parseInt(opts.population)
//     const maxGenerations = Number.parseInt(opts.generations)
//     let population = Array.from(new Array(populationSize))
//       .map(() => (GENS.reduce((acc, x) => {
//         acc[x] = Math.random()
//         return acc
//       }, {})))
//
//     let bestAverageFitness = 0
//     let previousAverageFitness = 0
//     let bestPopulation = null
//     let longTermFall = 0
//     // const populationsFitness = []
//
//     let i = 1
//     while (1) {
//       console.log('- generation', i)
//       const fitnessMap = new Map(population.map(x => [x, test(items, x, 100)]))
//       const averageFitness = R.mean(Array.from(fitnessMap.values()))
//
//       // populationsFitness.push(averageFitness)
//
//       if (averageFitness > previousAverageFitness) {
//         longTermFall = 0
//         if (averageFitness > bestAverageFitness) {
//           console.log(chalk.blue('New best population!'))
//           bestAverageFitness = averageFitness
//           bestPopulation = population
//         }
//       }
//       else {
//         longTermFall += previousAverageFitness - averageFitness
//         if (longTermFall > 0.1) {
//           console.log(chalk.yellow('Long term fall... falling back to previous best population!'))
//           longTermFall = 0
//           population = bestPopulation
//         }
//       }
//
//       // console.log('fitness', Array.from(fitnessMap.values()))
//       console.log(
//         'populationFitness', roundNum(averageFitness),
//         '|', averageFitness > previousAverageFitness
//           ? chalk.green(roundNum(averageFitness - previousAverageFitness))
//           : chalk.red(roundNum(previousAverageFitness - averageFitness))
//       )
//
//       population.sort((a, b) => fitnessMap.get(b) - fitnessMap.get(a))
//       if (++i > maxGenerations) {
//         break
//       }
//       // console.log('sorted', population.map(x => fitnessMap.get(x)))
//       //
//       // const halfCount = Math.floor(population.length / 2)
//       // console.log('half', half)
//       // const parents = population.filter(x => fitnessMap.get(x) > averageFitness * 0.6)
//       const parents = population.slice(0, 2)
//       population[population.length - 1] = crossover(parents)
//       population[population.length - 2] = crossover(parents)
//
//       if (Math.random() < 0.2) {
//         mutate(population[Math.floor(Math.random() * population.length)])
//       }
//
//       previousAverageFitness = averageFitness
//       // population.forEach((individual, i) => {
//       //   const fitness = fitnessMap.get(individual)
//       //
//       //   if (fitness < averageFitness / 2) {
//       //     population[i] = crossover(population.slice(0, 2))
//       //   }
//       // })
//       // break
//       // console.log('populationFitness', populationFitness)
//       //
//       // const selection = selectByFitness(population, Math.floor(populationSize / 2))
//       // const newPopulation = crossSample(selection, populationSize)
//       // population = newPopulation
//     }
//     //
//     // const winner = R.reduce(
//     //   (acc, x) => acc && acc.fitness > x.fitness ? acc : x
//     // , null)(population)
//
//     // Array.from(fitnessMap.entries())
//
//     // console.log('pop', bestPopulation)
//
//     const populationMap = new Map(bestPopulation.map(x => [test(items, x, 100), x]))
//     const max = Math.max(...Array.from(populationMap.keys()))
//     const winner = populationMap.get(max)
//     console.log(chalk.bgGreen('WINNER'), max, winner)
//     // console.log('avg', R.mean(population.map(x => x.fitness)))
//   })
//
// function linearRegression(x, y) {
//   const mapIndexed = R.addIndex(R.map)
//   const n = x.length
//
//   const denominator = (n * R.sum(x.map(x => x * x)) - Math.pow(R.sum(x), 2))
//   const sumxy = R.sum(mapIndexed((xi, i) => xi * y[i])(x))
//   const alpha = (n * sumxy - R.sum(x) * R.sum(y)) / denominator
//   const beta = (R.sum(x.map(x => x * x)) * R.sum(y) - R.sum(x) * sumxy) / denominator
//
//   return { alpha, beta }
// }
//
// program.command('approx')
//   .option('-i, --iterations [n]', 'Number of iterations', '100')
//   .option('-p, --points [n]', 'Number of division points for weight scale', '5')
//   .option('-r, --refresh-rate [n]', 'Refresh each n-th iteration', '4')
//   .description('calculate aspect weights')
//   .action(async (opts) => {
//     const items = await dao.competitor.listAll(neo4j)
//     const numIterations = Number.parseInt(opts.iterations)
//     const numPoints = Number.parseInt(opts.points)
//     const refreshRate = Number.parseInt(opts.refreshRate)
//
//     const weights = GENS.reduce((acc, x) => {
//       acc[x] = {
//         alpha: null,
//         value: 0.5,
//         step: 0.000001,
//       }
//       return acc
//     }, {})
//
//     const testWrapped = (key, value) => {
//       const w = R.mapObjIndexed(R.prop('value'))(weights)
//       if (key) {
//         w[key] = value
//       }
//
//       return test(items, w)
//     }
//
//     const resolveAlphas = () => {
//       for (const key of Object.keys(weights)) {
//         const segmentSize = 1 / (numPoints - 1)
//         const segments = R.times(R.identity, numPoints).map(x => x * segmentSize)
//         const fitnesses = segments.map(x => testWrapped(key, x))
//         const { alpha } = linearRegression(segments, fitnesses)
//
//         weights[key].alpha = alpha
//       }
//     }
//
//     resolveAlphas()
//
//     for (let i = 0; i < numIterations; i++) {
//       let previousFitness = await testWrapped()
//       console.log(chalk.blue('iteration'), i, 'fitness', roundNum(previousFitness, 10000))
//
//       for (const key of Object.keys(weights)) {
//         const weight = weights[key]
//
//         const value = weight.value + weight.step / weight.alpha
//         const fitness = testWrapped(key, value)
//         weight.step = fitness - previousFitness
//         console.log('value', value, 'delta', weight.step)
//
//         weight.value = weight.value + weight.step / weight.alpha
//         previousFitness = fitness
//         console.log(key, 'adjusted to',
//           weight.step >= 0
//             ? chalk.green(roundNum(weight.value, 1000))
//             : chalk.red(roundNum(weight.value, 1000)),
//           'diff', weight.step)
//       }
//     }
//     console.log(chalk.green('FINAL'), weights)
//   })

program.parse(process.argv)
