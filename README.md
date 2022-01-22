# dogecoin-lunar-investigation
This software was created to compliment the [Dogecoin Lunar Calendar](https://dogecoincalendar.com). For every month within query range it is counted how many times coin price closes higher than month open. Months with positive closes count as +1 towards a total and months with negative closes take from a total. Historic CSV output represents planet name followed by total positive, negative count pairs for that planet within each house arranged 1 through 12.

## Published Online
Published online three times daily:
  + [Historic](https://dogecoincalendar.com/historic)
  + [Forecast](https://dogecoincalendar.com/forecast)
  + [Moons](https://dogecoincalendar.com/moons)
  + [Dates](https://dogecoincalendar.com/dates)
  + [Days](https://dogecoincalendar.com/days)

## Usage Historic
Note: npm run does need `--` to pass arguments.
```
$ npm install
$ npm run historic DOGE -- [--begin 12/6/2013 --end 1/20/2022] --heliocentric
$ npm run historic BTC -- [--begin 1/3/2009 --today] --geocentric
$ npm run historic ETH -- --geocentric
```

## Usage Forecast
```
$ npm run forecast DOGE -- [--begin 12/6/2013 --end 1/21/2022] --heliocentric
$ npm run forecast BTC -- [--begin 1/3/2009 --tomorrow] --geocentric
$ npm run forecast ETH -- [--begin 1/3/2009 --today] --geocentric
$ npm run forecast BTC -- --geocentric
```

## More
```
$ npm run moons DOGE -- [--high --low]
$ npm run dates BTC -- [--high --low]
$ npm run days ETH -- [--high --low]
```

## License
Copyright 2022 - GPL v3 - mike@rhodey.org
