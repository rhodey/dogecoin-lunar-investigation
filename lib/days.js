const fs = require('fs')
const split = require('split')
const dayOfWeek = require('day-of-week').get
const argv = require('minimist')(process.argv.slice(2))

function onError(err) {
  console.error(err)
  process.exit(1)
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
        let highDate = parts[2].substr(1)
        let lowDate = parts[3].substr(1)
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

readHighOrLowIntoObject(coin, high).then((obj) => {
  let totals = new Array(7).fill(0)
  Object.keys(obj).forEach((key) => {
    let highOrLow = obj[key].split('/')
    let year = parseInt(highOrLow[2])
    let month = parseInt(highOrLow[0])
    let date = parseInt(highOrLow[1])
    let day7 = dayOfWeek(new Date(Date.parse(`${month}/${date}/${year}`)), 'America/New_York')
    if (day7 == 0) { day7 = 7 }
    totals[-1 + day7] += 1
  })
  let year = 1900 + new Date(end).getYear()
  let month = 1 + new Date(end).getMonth()
  let date = new Date(end).getDate()
  let csv = `${month}/${date}/${year}, `
  let total = totals.reduce((acc, t) => acc + t, 0.0)
  for (let i = 0; i < totals.length; i++) {
    if (totals[i] === 0) {
      csv += "0%, "
    } else {
      let percent = 100 * totals[i] / total
      csv += `+${percent.toFixed(1)}%, `
    }
  }
  console.log(`${csv}${Math.floor(total)}`)
}).catch(onError)
