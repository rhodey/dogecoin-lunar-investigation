const fs = require('fs')
const split = require('split')
const astro = require('astronomy-engine')
const dayOfWeek = require('day-of-week').get
const argv = require('minimist')(process.argv.slice(2))

function onError(err) {
  console.error(err)
  process.exit(1)
}

function moonsOfYear(year) {
  let newMoons = { }
  let q1Moons = { }
  let fullMoons = { }
  let q3Moons = { }
  let hour = 1000 * 60 * 60
  let backwards = 10 * 24 * hour
  let begin = new Date(Date.parse(`1/1/${year} 12:00`) - backwards).getTime()
  let end = begin + backwards + hour * 24 * 367
  let timems = begin
  while (timems < end) {
    let date = new Date(timems)
    let prev = new Date(timems - hour)
    let next = new Date(timems + hour)
    let year2 = date.getYear() + 1900
    if (year2 === year) {
      let m = date.getMonth()
      if (!newMoons[m]) { newMoons[m] = [] }
      if (!q1Moons[m]) { q1Moons[m] = [] }
      if (!fullMoons[m]) { fullMoons[m] = [] }
      if (!q3Moons[m]) { q3Moons[m] = [] }

      let moon = astro.MoonPhase(date)
      let mprev = astro.MoonPhase(prev)
      let mnext = astro.MoonPhase(next)
      if (moon < 90.0 && mprev > 270.0) {
        if (Math.abs(360.0 - mprev) < moon) {
          newMoons[prev.getMonth()].push(prev.getDate())
        } else {
          newMoons[date.getMonth()].push(date.getDate())
        }
      }
      if (moon <= 90.0 && mnext >= 90.0) {
        if (90.0 - moon < mnext - 90.0) {
          q1Moons[date.getMonth()].push(date.getDate())
        } else {
          q1Moons[next.getMonth()].push(next.getDate())
        }
      }
      if (moon <= 180.0 && mnext >= 180.0) {
        if (180.0 - moon < mnext - 180.0) {
          fullMoons[date.getMonth()].push(date.getDate())
        } else {
          fullMoons[next.getMonth()].push(next.getDate())
        }
      }
      if (moon <= 270.0 && mnext >= 270.0) {
        if (270.0 - moon < mnext - 270.0) {
          q3Moons[date.getMonth()].push(date.getDate())
        } else {
          q3Moons[next.getMonth()].push(next.getDate())
        }
      }
    }
    timems += hour
  }
  return [newMoons, q1Moons, fullMoons, q3Moons]
}

function dateHasMoon(date, moons, phase) {
  let month = new Date(date).getMonth()
  date = new Date(date).getDate()
  return moons[phase][month].some((d) => d === date)
}

function readHighOrLowIntoObject(coin, high) {
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
        let highDate = parts[2]
        let lowDate = parts[3]
        months[key] = high ? highDate : lowDate
      }
      if (first) { first = false }
    })
  })
}

if (argv._.length < 1) { onError(new Error('cmd args: DOGE, BTC, ETH')) }
let coin = argv._[0]

let begin = Date.parse('1/3/2009')
if (argv.begin) { begin = Date.parse(argv.begin) }

let today = Date.now()
let end = today
if (argv.end) { end = Date.parse(argv.end) }
let high = argv.high === true

let moons = { }
readHighOrLowIntoObject(coin, high).then((obj) => {
  let totals = new Array(4).fill(0)
  for (let phase = 0; phase < totals.length; phase++) {
    Object.keys(obj).forEach((key) => {
      let year = parseInt(key.split('/')[1])
      if (moons[year] === undefined) { moons[year] = moonsOfYear(year) }
      let month = parseInt(key.split('/')[0])
      let highOrLow = obj[key]
      let date = parseInt(highOrLow.split('/')[1])
      date = Date.parse(`${month}/${date}/${year}`)
      if (dateHasMoon(date, moons[year], phase)) {
        totals[phase] += 1
      }
    })
  }
  let year = 1900 + new Date(end).getYear()
  let month = 1 + new Date(end).getMonth()
  let date = new Date(end).getDate()
  let csv = `${month}/${date}/${year}, `
  csv += `${totals[0]}, ${totals[1]}, ${totals[2]}, ${totals[3]}`
  console.log(csv)
}).catch(onError)
