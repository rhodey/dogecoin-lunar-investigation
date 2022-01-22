const fs = require('fs')
const split = require('split')
const astro = require('astronomy-engine')
const ephemeris = require('ephemeris')
const argv = require('minimist')(process.argv.slice(2))

let RESULT = { 'Sun':null, 'Mercury':null, 'Venus':null, 'Moon':null, 'Earth':null, 'Mars':null, 'Jupiter':null, 'Saturn':null, 'Uranus':null, 'Neptune':null }
const PLANETS = Object.keys(RESULT)
PLANETS.forEach((name) => RESULT[name] = [ new Array(12).fill(0), new Array(12).fill(0) ])

function onError(err) {
  console.error(err)
  process.exit(1)
}

function readMonthsIntoObject(coin) {
  let first = true
  let months = { }
  return new Promise((res, rej) => {
    let read = fs.createReadStream(`assets/months-${coin.toLowerCase()}.csv`)
    read = read.pipe(split())
    read.on('end', () => res(months))
    read.on('error', rej)
    read.on('data', (line) => {
      let parts = line.split(',')
      if (!first && parts.length === 4) {
        let date = parts[0]
        date = date.split('/')
        let key = `${date[0]}/${date[2]}`
        let positive = parseInt(parts[1]) === 1
        months[key] = positive
      }
      if (first) { first = false }
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

function writeCSV(date) {
  PLANETS.forEach((name) => {
    let year = 1900 + new Date(date).getYear()
    let month = 1 + new Date(date).getMonth()
    let date2 = new Date(date).getDate()
    let csv = `${month}/${date2}/${year}, ${name}, `
    for (let h = 0; h < 12; h++) {
      if (RESULT[name][0][h] === 0) {
        csv += "0, "
      } else {
        csv += `+${RESULT[name][0][h]}, `
      }
      csv += `${RESULT[name][1][h]}`
      if (h < 11) { csv += ", " }
    }
    console.log(csv)
  })
}

if (argv._.length < 1) { onError(new Error('cmd args: DOGE, BTC, ETH')) }
let coin = argv._[0]
let heliocentric = argv.heliocentric === true

let begin = Date.parse('1/3/2009')
if (argv.begin) { begin = Date.parse(argv.begin) }

let today = Date.now()
let tomorrow = today + 1000 * 60 * 60 * 24
let end = today

if (argv.tomorrow) { end = tomorrow }
if (argv.end) { end = Date.parse(argv.end) }

let endYear = 1900 + new Date(end).getYear()
let endMonth = 1 + new Date(end).getMonth()
let endDate = new Date(end).getDate()

readMonthsIntoObject(coin).then((obj) => {
  Object.keys(obj).forEach((key) => {
    let year = parseInt(key.split('/')[1])
    let month = parseInt(key.split('/')[0])
    let date = Date.parse(`${month}/15/${year} 12:00`)
    if (year === endYear && month === endMonth) {
      date = Date.parse(`${month}/${endDate}/${year}`)
    }
    if (date >= begin && date <= end) {
      for (let planet = 0; planet < PLANETS.length; planet++) {
        let name = PLANETS[planet]
        let house = houseOfPlanet(new Date(date), name, heliocentric)
        if (house !== null && obj[key] === true) {
          RESULT[name][0][house] += 1
        } else if (house !== null) {
          RESULT[name][1][house] -= 1
        }
      }
    }
  })
  writeCSV(end)
}).catch(onError)
