#!/bin/bash
echo -e "\n> https://github.com/rhodey/dogecoin-lunar-investigation" > dist/historic.txt
echo -e "\n> https://github.com/rhodey/dogecoin-lunar-investigation" > dist/forecast.txt
echo -e "\n> https://github.com/rhodey/dogecoin-lunar-investigation" > dist/moons.txt
echo -e "\n> https://github.com/rhodey/dogecoin-lunar-investigation" > dist/dates.txt
echo -e "\n> https://github.com/rhodey/dogecoin-lunar-investigation" > dist/days.txt

npm run download-doge && \
  npm run download-btc && \
    npm run download-eth

git add assets/
git commit -m "update dataset."
git push

npm run historic DOGE -- --today --heliocentric >> dist/historic.txt
npm run historic DOGE -- --today --geocentric >> dist/historic.txt
npm run historic BTC -- --today --heliocentric >> dist/historic.txt
npm run historic BTC -- --today --geocentric >> dist/historic.txt
npm run historic ETH -- --today --geocentric >> dist/historic.txt
npm run historic ETH -- --today --heliocentric >> dist/historic.txt

npm run forecast DOGE -- --tomorrow --heliocentric >> dist/forecast.txt
npm run forecast DOGE -- --tomorrow --geocentric >> dist/forecast.txt
npm run forecast BTC -- --tomorrow --heliocentric >> dist/forecast.txt
npm run forecast BTC -- --tomorrow --geocentric >> dist/forecast.txt
npm run forecast ETH -- --tomorrow --heliocentric >> dist/forecast.txt
npm run forecast ETH -- --tomorrow --geocentric >> dist/forecast.txt

npm run moons DOGE -- --high >> dist/moons.txt
npm run moons DOGE -- --low >> dist/moons.txt
npm run moons BTC -- --high >> dist/moons.txt
npm run moons BTC -- --low >> dist/moons.txt
npm run moons ETH -- --high >> dist/moons.txt
npm run moons ETH -- --low >> dist/moons.txt

npm run dates DOGE -- --high >> dist/dates.txt
npm run dates DOGE -- --low >> dist/dates.txt
npm run dates BTC -- --high >> dist/dates.txt
npm run dates BTC -- --low >> dist/dates.txt
npm run dates ETH -- --high >> dist/dates.txt
npm run dates ETH -- --low >> dist/dates.txt

npm run days DOGE -- --high >> dist/days.txt
npm run days DOGE -- --low >> dist/days.txt
npm run days BTC -- --high >> dist/days.txt
npm run days BTC -- --low >> dist/days.txt
npm run days ETH -- --high >> dist/days.txt
npm run days ETH -- --low >> dist/days.txt

sed -i -e '3d' dist/historic.txt
sed -i -e '3d' dist/forecast.txt
sed -i -e '3d' dist/moons.txt
sed -i -e '3d' dist/dates.txt
sed -i -e '3d' dist/days.txt
