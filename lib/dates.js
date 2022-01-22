const fs = require('fs')
const split = require('split')
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

readHighOrLowIntoObject(coin, high).then((obj) => {
  let totals = new Array(31).fill(0)
  Object.keys(obj).forEach((key) => {
    let highOrLow = obj[key]
    let date2 = -1 + parseInt(highOrLow.split('/')[1])
    totals[date2] += 1
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
