const { exec } = require('child_process')
const astro = require('astronomy-engine')
const ephemeris = require('ephemeris')
const argv = require('minimist')(process.argv.slice(2))

const HOUSES = [ 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces' ]
const PLANETS = [ 'Sun', 'Mercury', 'Venus', 'Moon', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune' ]

function onError(err) {
  console.error(err)
  process.exit(1)
}

function getCsvForCoin(coin, begin, end, heliocentric) {
  return new Promise((res, rej) => {
    let year = 1900 + new Date(begin).getYear()
    let month = 1 + new Date(begin).getMonth()
    let date = new Date(begin).getDate()
    begin = `${month}/${date}/${year}`
    year = 1900 + new Date(end).getYear()
    month = 1 + new Date(end).getMonth()
    date = new Date(end).getDate()
    end = `${month}/${date}/${year}`
    let center = heliocentric ? 'heliocentric' : 'geocentric'
    exec(`node lib/historic.js ${coin} -- --begin ${begin} --end ${end} --${center}`, (err, stdout, stderr) => {
      if (err) {
        rej(err)
      } else {
        res(stdout.split("\n"))
      }
    })
  })
}

function houseOfPlanet(date, name, heliocentric) {
  if ((heliocentric && name === 'Sun') || (!heliocentric && name === 'Earth')) {
    return null
  } else if (heliocentric) {
    return Math.floor(astro.EclipticLongitude(name, date) / 30.0)
  } else {
    let longitude = 74.0060
    let latitude = 40.7128
    let elevation = 0.0
    let names = PLANETS.filter((name) => name !== 'Earth')
    let planets = ephemeris.getAllPlanets(date, longitude, latitude, elevation).observed
    planets = names.map((name) => parseInt(planets[name.toLowerCase()].apparentLongitudeDd))
    longitude = planets[names.indexOf(name)]
    return Math.floor(longitude / 30.0)
  }
}

if (argv._.length < 1) { onError(new Error('cmd args: DOGE, BTC, ETH')) }
let coin = argv._[0]
let heliocentric = argv.heliocentric === true

let begin = Date.parse('1/3/2009')
if (argv.begin) { begin = Date.parse(argv.begin) }

let today = Date.now()
let tomorrow = today + 1000 * 60 * 60 * 24
let end = tomorrow
if (argv.today) { end = today }
if (argv.end) { end = Date.parse(argv.end) }

getCsvForCoin(coin, begin, end, heliocentric).then((csv) => {
  csv.filter((line) => line.length > 2).forEach((line) => {
    let parts = line.split(',')
    let planet = parts[1].trim()
    if ((heliocentric && planet !== 'Sun') || (!heliocentric && planet !== 'Earth')) {
      let houses = [null, null]
      let values = parts.slice(2)
      houses[0] = values.filter((v, i) => i % 2 === 0)
      houses[1] = values.filter((v, i) => i % 2 !== 0)

      let house = houseOfPlanet(new Date(end), planet, heliocentric)
      let plus = parseInt(houses[0][house])
      let minus = parseInt(houses[1][house])
      let total = plus + Math.abs(minus)

      let percentPlus = (100.0 * plus / total).toFixed(1)
      let percentMinus = Math.abs(100.0 * minus / total).toFixed(1)
      if (total === 0) { percentPlus = 0; percentMinus = 0 }
      if (plus > 0) { plus = `+${plus}` }

      let year = 1900 + new Date(end).getYear()
      let month = 1 + new Date(end).getMonth()
      let date = new Date(end).getDate()
      console.log(`${month}/${date}/${year}, ${planet}, ${HOUSES[house]}, ${plus}, ${percentPlus}%, ${minus}, ${percentMinus}%`)
    }
  })
}).catch(onError)
