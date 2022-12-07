const fs = require("fs");
const d3 = require("d3");
const moment = require("moment");
const exp = require("constants");

describe("testing started", function () {
  console.log("test calculation....");
  const kiteMainToken = require("../wsConnection/kiteConnect");

  it("check the calculation for 'volumepoc and valueArea' !", async function () {
    let expectedResult = [
      { vah: 17852, val: 17800, valueAreaVolume: 5812850 },
      { price: "17836", volume: 561850 },
    ];
    fs.readFile("backend/candle.json", "utf8", (err, data) => {
      data = JSON.parse(data);
      expect(data.length).toBe(19560);
      expect(calculateVpoc(data)).toEqual(expectedResult);
      let result = updateTimeDateRange(data);
      expect(result.length).toEqual(13);
      let total = alterVwapChangefunc(data);
      expect(total).toEqual('-8');
    });
  });
  test("check the function return correct instrument token !", async function () {
    let expectedToken = "16079106";
    var runAllFunction = new kiteMainToken();
    expect(await runAllFunction.findInstrument()).toEqual(expectedToken);
  });

  test('check the date func return last friday', ()=>{
    let firday = last_friday();
    expect(firday).toBe(5);
  })
  test("test timer function!", async function () {
    let date = moment(new Date("2022-10-28")).format("YYYY-MM-DD");
    let current_FA = { ohlc: { high: 17887, low: 17773 } };
    let expectedResult = [
      {
        label: "FA_High",
        date,
        price: current_FA["ohlc"].high,
        color: "hotpink",
        AlertStatus: "onslider",
        SMS_status: "off",
      },
      {
        label: "FA_Low",
        date,
        price: current_FA["ohlc"].low,
        color: "hotpink",
        AlertStatus: "onslider",
        SMS_status: "off",
      }
    ]
    fs.readFile("backend/candle.json", "utf8", async (err, resp) => {
      expect(await calculateTimer(resp)).toEqual(expectedResult);
    });
  });
});

///     functions
function calculateVpoc(result) {
  var Array_POC = {};
  var volumePOC = {};
  var valueArea = {};
  result.forEach((d) => {
    var last_price = Number(2 * Math.round(d.latestTradedPrice / 2));

    if (Object.keys(Array_POC).indexOf(last_price.toString()) != -1) {
      Array_POC[last_price] += Number(d.lastTradedQuantity);
    } else {
      Array_POC[last_price] = Number(d.lastTradedQuantity);
    }

    var highVol_price = Object.keys(Array_POC).reduce((a, b) =>
      Array_POC[a] > Array_POC[b] ? a : b
    );
    var total_volume = Object.values(Array_POC).reduce((a, b) => a + b);
    volumePOC = {
      price: highVol_price,
      volume: Array_POC[highVol_price],
    };
    var valueAreaVolume = Number(Array_POC[highVol_price]);
    var oneUpPrice = Number(highVol_price);
    var oneDownPrice = Number(highVol_price);
    var vah = Number(highVol_price);
    var val = Number(highVol_price);
    var oneUpVolume = 0;
    var oneDownVolume = 0;
    var f = Object.keys(Array_POC).indexOf(highVol_price.toString());
    var i = 1;
    var j = 1;
    while (valueAreaVolume / total_volume < 0.7) {
      oneUpPrice = Number(Object.keys(Array_POC)[f + i]);
      oneDownPrice = Number(Number(Object.keys(Array_POC)[f - j]));
      oneUpVolume = Array_POC[oneUpPrice];
      oneDownVolume = Array_POC[oneDownPrice];

      if (oneUpVolume == undefined) {
        oneUpVolume = 0;
      }
      if (oneDownVolume == undefined) {
        oneDownVolume = 0;
      }
      if (oneUpVolume > oneDownVolume) {
        i++;
        vah = Number(oneUpPrice);
        oneDownPrice = oneDownPrice + 2;
        valueAreaVolume += Number(oneUpVolume);
      } else {
        j++;
        valueAreaVolume += Number(oneDownVolume);
        val = Number(oneDownPrice);
        oneUpPrice = oneUpPrice + 2;
      }
    }

    valueArea = {
      vah: vah,
      val: val,
      valueAreaVolume: valueAreaVolume,
    };
  });
  return [valueArea, volumePOC];
}
async function calculateTimer(resp) {
  let date = moment(new Date("2022-10-28")).format("YYYY-MM-DD");
  let customDate = 0;
  let customNumber = 0;
  let ibHTimer = 0;
  let ibLTimer = 0;
  let ibHWTimer = 0;
  let ibLWTimer = 0;

  resp = JSON.parse(resp);
  let lastIB = [
    {
      weeklyIB_high: 83693,
      weeklyIB_low: 3347,
    },
  ];
  const originalDate = resp.slice(-1)[0].date;
  let ibStartTime = new Date(originalDate);
  ibStartTime.setHours(10);
  ibStartTime.setMinutes(15);
  ibStartTime.setSeconds(0);
  ibStartTime.setMilliseconds(0);
  let ibAfterFirst5hr = new Date(originalDate);
  ibAfterFirst5hr.setHours(14);
  ibAfterFirst5hr.setMinutes(15);
  ibAfterFirst5hr.setSeconds(0);
  ibAfterFirst5hr.setMilliseconds(0);

  if (new Date(originalDate).getDay() == 5) {
    ibHWTimer = 0;
    ibLWTimer = 0;
  } else {
    ibHWTimer = lastIB[0].weeklyIB_high;
    ibLWTimer = lastIB[0].weeklyIB_low;
  }

  resp.forEach((d) => {
    if (customNumber != new Date(d.date).getSeconds()) {
      const timeCal = Math.round(
        (new Date(d.date).getTime() - new Date(customDate).getTime()) / 1000
      );
      //
      //find ib after one hour
      if (new Date(d.date).getTime() > ibStartTime.getTime()) {
        //ibh time calculation
        if (d["initialBalance"].ibHigh < d.latestTradedPrice) {
          ibHTimer += timeCal;
        }
        //ibh time calculation
        if (d["initialBalance"].ibLow > d.latestTradedPrice) {
          ibLTimer += timeCal;
        }
      }
      //find ib after five hour
      if (new Date(d.date).getDay() === 5) {
        if (new Date(d.date).getTime() > ibAfterFirst5hr.getTime()) {
          //ibh time calculation
          if (d["weeklyIB"].ibHigh < d.latestTradedPrice) {
            ibHWTimer += timeCal;
          }
          //ibh time calculation
          if (d["weeklyIB"].ibLow > d.latestTradedPrice) {
            ibLWTimer += timeCal;
          }
        }
      } else {
        if (d["weeklyIB"].ibHigh < d.latestTradedPrice) {
          ibHWTimer += timeCal;
        }
        //ibh time calculation
        if (d["weeklyIB"].ibLow > d.latestTradedPrice) {
          ibLWTimer += timeCal;
        }
      }
    }
    customNumber = new Date(d.date).getSeconds();
    customDate = new Date(d.date);
  });

  let current_FA = resp.slice(-1)[0];
  current_FA["ohlc"].high = Math.round(current_FA["ohlc"].high);
  current_FA["ohlc"].low = Math.round(current_FA["ohlc"].low);
  let FA_High = null;
  let FA_Low = null;
  if (ibHTimer < 1800 && ibHTimer > 0) {
    FA_High = {
      label: "FA_High",
      date,
      price: current_FA["ohlc"].high,
      color: "hotpink",
      AlertStatus: "onslider",
      SMS_status: "off",
    };
  }
  if (ibLTimer < 1800 && ibLTimer > 0) {
    FA_Low = {
      label: "FA_Low",
      date,
      price: current_FA["ohlc"].low,
      color: "hotpink",
      AlertStatus: "onslider",
      SMS_status: "off",
    };
  }
  let array = [];
  if (FA_High != null) {
     array.push(FA_High);
  }
  if (FA_Low != null) {
    array.push(FA_Low);
  }
  return array;
}


function updateStartAndEndLine(data) {
  var high = [];
  var low = [];
  var num = 0;
  var prev = null;
  Object.values(this.filterData).forEach((d, i) => {
    if (d.data && d.data.length) {
      d.startLine = d3.max(d.data, (e) => e.latestTradedPrice);
      d.start = d.data[0].latestTradedPrice;
      d.endLine = d3.min(d.data, (e) => e.latestTradedPrice);

      //calculating indicators
      var startLine = d.startLine;
      var endLine = d.endLine;
      high.push(startLine);
      low.push(endLine);
      if (num > 1) {
        if (
          high[0] > high[1] &&
          high[1] < high[2] &&
          low[0] > low[1] &&
          low[1] < low[2]
        ) {
          prev['PIVOTGREEN'].push('PIVOT');
        } else if (
          high[0] < high[1] &&
          high[1] > high[2] &&
          low[0] < low[1] &&
          low[1] > low[2]
        ) {
          prev['PIVOTRED'].push('PIVOT');
        } else {
          prev['PIVOTGREEN'].push('');
          prev['PIVOTRED'].push('');
        }
        high.shift();
        low.shift();
      }
      num++;
      prev = d;
    }
  });
}



function updateTimeDateRange(chartData) {
  const dates = chartData.map((d) => {
    d.date = new Date(d.date);
    return d.date;
  });
  let selectTimeMinute = 30;
  let timeRangeData = null;
  let xMin = d3.min(dates).valueOf();
  let xMax = d3.max(dates).valueOf();

  let minDate = new Date(xMin);
  //
  minDate.setMinutes(5 * Math.floor(minDate.getMinutes() / 5));
  minDate.setSeconds(0);
  minDate.setMilliseconds(0);

  let minMinute = minDate.getMinutes();
  let maxDate = new Date(xMax);

  maxDate.setMinutes(maxDate.getMinutes() + 1);
  maxDate.setSeconds(0);
  maxDate.setMilliseconds(0);

  if (selectTimeMinute <= 15) {
    timeRangeData = d3.timeMinute.range(
      minDate,
      maxDate,
      selectTimeMinute
    );
  } else if (selectTimeMinute == 30) {
    timeRangeData = d3.timeMinute.range(
      minDate,
      maxDate,
      selectTimeMinute
    );
  } else if (selectTimeMinute == 60) {
    minDate.setSeconds(0);
    if (maxDate.getMinutes() < minMinute) {
      maxDate.setHours(maxDate.getHours() - 1);
      maxDate.setMinutes(minMinute);
    } else if (maxDate.getMinutes() > minMinute) {
      maxDate.setMinutes(minMinute);
    }

    var array = [];
    for (let i = minDate.getHours(); i <= maxDate.getHours(); i++) {
      let date = new Date(xMin);
      date.setHours(i);
      date.setMinutes(minMinute);
      date.setSeconds(0);
      date.setMilliseconds(0);
      array.push(date);
    }
    timeRangeData = array;
    array = null;
  } else if (selectTimeMinute == 1440) {
    timeRangeData = [d3.timeDay(new Date(xMin))];
  }

  return timeRangeData;
}

let first = null;
let second = null;
let f_vwap = 0;
let s_vwap = 0;
let vwapChange = 0;

function alterVwapChangefunc(data) {
  data.forEach(d => {
    if (first == null) {
      first = new Date(d.date).getMinutes();
      f_vwap = Number(d.vwap);
    }
    if (first != null && second == null) {
      if (new Date(d.date).getMinutes() != first) {
        f_vwap -= Number(d.vwap);
        second = new Date(d.date).getMinutes();
        s_vwap = Number(d.vwap);
      }
    }
    if (first != null && second != null) {
      if (new Date(d.date).getMinutes() != second) {
        s_vwap -= Number(d.vwap);
        vwapChange += (s_vwap - f_vwap) / 2;
        first = new Date(d.date).getMinutes();
        f_vwap = Number(d.vwap);
        second = null;
        s_vwap = 0;
      }
    }
  });
  return vwapChange.toFixed();
}


function last_friday(){
  let currentDateObj = new Date();
  currentDateObj.setDate(
    currentDateObj.getDate() - ((currentDateObj.getDay() + 2) % 7)
  );
  return currentDateObj.getDay();
}
