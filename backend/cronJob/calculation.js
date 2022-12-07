const express = require("express");
const Router = express.Router();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./config.env") });
const moment = require("moment");
const db = require("../server");
const fs = require("fs");
const JSZip = require("jszip");
const zip = new JSZip();
const cron = require("node-cron");
var ticker = null;
const KiteTicker = require("kiteconnect").KiteTicker;
const kiteInstrumemt = require("../wsConnection/kiteConnect");
var runAllFunction = null;
const api_key = process.env.API_KEY;
let access_token = null;
let total_review = 0;
let token_reviews = 0;

const RunningSingleDayProfile = require("../wsConnection/RunningSingleDayProfile");

//////   -------------------  cron works starts ---------------
// cron.schedule("40 3 * * MON-FRI", () => {
//   setAccesstoken_to_kite();
// });

// // TODO : start the cron and connect kite

// cron.schedule("42 3 * * MON-FRI", () => {
//   total_review = 0;
//   storeCandleTicksIn_DB();
// });
// cron.schedule("43 3 * * MON-FRI", () => {
//   token_reviews = 0;
//   get_Instrument_ticks();
// });

// // TODO : Stop the cron and disconnect kite connection
// cron.schedule("0 10 * * MON-FRI", () => {
//   stopCron();
// });

// // TODO : store the first minutes data in db
// cron.schedule("1 4 * * MON-FRI", () => {
//   let date = moment(new Date()).format("YYYY-MM-DD");
//   db.get()
//     .collection("IB-TICKS")
//     .find({
//       date: {
//         $gte: new Date(`${date}T04:00:00.000Z`),
//         $lt: new Date(`${date}T04:00:10.000Z`),
//       },
//     })
//     .toArray((err, resp) => {
//       let checkdate = moment(new Date(resp[0].date)).format("YYYY-MM-DD");
//       if (checkdate == date) {
//         db.get().collection("FIRST-15-MINS").insertOne(resp[0]);
//       }
//     });
// });

// // TODO updating weelky ib
// cron.schedule("0 10 * * FRI", () => {
//   db.get()
//     .collection("IB-TICKS")
//     .find()
//     .sort({ date: -1 })
//     .limit(1)
//     .toArray((err, resp) => {
//       db.get().collection("WEEKLY-IB").insertOne(resp[0]);
//     });
// });
// // TODO : updating daily profile
// cron.schedule("1 10 * * MON-FRI", () => {
//   db.get()
//     .collection("IB-TICKS")
//     .find()
//     .sort({ date: -1 })
//     .limit(1)
//     .toArray((err, resp) => {
//       db.get().collection("PROFILE-CHART").insertOne(resp[0]);
//     });
// });

// //  TODO first find the ibTimer for ibh and ibl ....after that

// //  * find FA High and Low.....

// //   ? 1. check the ibh Timer is > 0 and < 1800...... if its 'true' then add OHLC high as" FA_High " to the reference page (else) nothing

// //   ? 2. check ibl timer is > 0 and < 1800........  if its 'true' then add OHLC Low as " FA_Low " to the reference page (else) nothing

// // // updating weekly IB timer
// cron.schedule("2 10 * * MON-FRI", () => {
//   //   ! delete the old FA and ATR labels from database....

//   let delete_Arr = [
//     "FA_High",
//     "FA_Low",
//     "1ATR_UP",
//     "2ATR_UP",
//     "1ATR_DOWN",
//     "2ATR_DOWN",
//   ];
//   delete_Arr.forEach((label) => {
//     db.get().collection("User-Labels").deleteOne({ label });
//   });
//   // TODO : Get current Day data from db;
//   let date = moment(new Date()).format("YYYY-MM-DD");
//   db.get()
//     .collection("IB-TICKS")
//     .find({
//       date: { $gte: new Date(date) },
//     })
//     .toArray((err, resp) => {
//       //   * find Average True Range with last 14 days data
//       db.get()
//         .collection("PROFILE-CHART")
//         .find()
//         .sort({ date: -1 })
//         .skip(1)
//         .limit(14)
//         .toArray((err, last_14_days) => {
//           // * calculate AVG True Range with last 14 Days
//           let range = 0;
//           let ATR = 0;
//           if (last_14_days.length > 0) {
//             last_14_days.forEach((data) => {
//               range += data["ohlc"].high - data["ohlc"].low;
//             });
//             // TODO : Average True Range
//             ATR = range / last_14_days.length;
//           }
//           // // TODO : Calculate weekly ib timer
//           let customDate = 0;
//           let customNumber = 0;
//           let ibHTimer = 0;
//           let ibLTimer = 0;
//           let ibHWTimer = 0;
//           let ibLWTimer = 0;
//           const originalDate = resp.slice(-1)[0].date;
//           let ibStartTime = new Date(originalDate);
//           ibStartTime.setHours(4);
//           ibStartTime.setMinutes(45);
//           // ibStartTime.setHours(10);
//           // ibStartTime.setMinutes(15);
//           ibStartTime.setSeconds(0);
//           ibStartTime.setMilliseconds(0);
//           let ibAfterFirst5hr = new Date(originalDate);
//           ibAfterFirst5hr.setHours(8);
//           ibAfterFirst5hr.setMinutes(45);
//           // ibAfterFirst5hr.setHours(14);
//           // ibAfterFirst5hr.setMinutes(15);
//           ibAfterFirst5hr.setSeconds(0);
//           ibAfterFirst5hr.setMilliseconds(0);
//           // TODO : Get last day time from db
//           db.get()
//             .collection("WEEKLY-IB-TIMER")
//             .find({})
//             .sort({ date: -1 })
//             .limit(1)
//             .toArray((err, lastIB) => {
//               if (new Date().getDay() == 5) {
//                 ibHWTimer = 0;
//                 ibLWTimer = 0;
//               } else {
//                 if (new Date().getDay() == 1) {
//                   if (new Date(lastIB[0].date).getDay() == 5) {
//                     ibHWTimer = lastIB[0].weeklyIB_high;
//                     ibLWTimer = lastIB[0].weeklyIB_low;
//                   } else {
//                     ibHWTimer = 0;
//                     ibLWTimer = 0;
//                   }
//                 } else {
//                   ibHWTimer = lastIB[0].weeklyIB_high;
//                   ibLWTimer = lastIB[0].weeklyIB_low;
//                 }
//               }
//               resp.forEach((d) => {
//                 if (customNumber != new Date(d.date).getSeconds()) {
//                   const timeCal = Math.round(
//                     (new Date(d.date).getTime() -
//                       new Date(customDate).getTime()) /
//                       1000
//                   );
//                   //
//                   //find ib after one hour
//                   if (new Date(d.date).getTime() > ibStartTime.getTime()) {
//                     //ibh time calculation
//                     if (d["initialBalance"].ibHigh < d.latestTradedPrice) {
//                       ibHTimer += timeCal;
//                     }
//                     //ibh time calculation
//                     if (d["initialBalance"].ibLow > d.latestTradedPrice) {
//                       ibLTimer += timeCal;
//                     }
//                   }
//                   //find ib after five hour
//                   if (new Date(d.date).getDay() === 5) {
//                     if (
//                       new Date(d.date).getTime() > ibAfterFirst5hr.getTime()
//                     ) {
//                       //ibh time calculation
//                       if (d["weeklyIB"].ibHigh < d.latestTradedPrice) {
//                         ibHWTimer += timeCal;
//                       }
//                       //ibh time calculation
//                       if (d["weeklyIB"].ibLow > d.latestTradedPrice) {
//                         ibLWTimer += timeCal;
//                       }
//                     }
//                   } else {
//                     if (d["weeklyIB"].ibHigh < d.latestTradedPrice) {
//                       ibHWTimer += timeCal;
//                     }
//                     //ibh time calculation
//                     if (d["weeklyIB"].ibLow > d.latestTradedPrice) {
//                       ibLWTimer += timeCal;
//                     }
//                   }
//                 }
//                 customNumber = new Date(d.date).getSeconds();
//                 customDate = new Date(d.date);
//               });
//               // * Modified weekly IB Timer inserting in db
//               db.get().collection("WEEKLY-IB-TIMER").insertOne({
//                 date: originalDate,
//                 weeklyIB_high: ibHWTimer,
//                 weeklyIB_low: ibLWTimer,
//               });
//               // TODO : Calculate FA > High and low
//               let current_FA = resp.slice(-1)[0];

//               let FA_High = null;
//               let ATR1_Down = null;
//               let ATR2_Down = null;
//               let FA_Low = null;
//               let ATR1_Up = null;
//               let ATR2_Up = null;
//               if (ibHTimer < 1800 && ibHTimer > 0) {
//                 // TODO  FA_High
//                 FA_High = {
//                   label: "FA_High",
//                   date,
//                   price: Math.round(current_FA["ohlc"].high),
//                   color: "hotpink",
//                   AlertStatus: "onslider",
//                   SMS_status: "off",
//                   timestamp: new Date(),
//                 };
//                 // TODO  1ATR_DOWN
//                 ATR1_Down = {
//                   label: "1ATR_DOWN",
//                   date,
//                   price: Math.round(current_FA["ohlc"].high - ATR),
//                   color: "#f5c842",
//                   AlertStatus: "onslider",
//                   SMS_status: "off",
//                   timestamp: new Date(),
//                 };
//                 // TODO  2ATR_DOWN
//                 ATR2_Down = {
//                   label: "2ATR_DOWN",
//                   date,
//                   price: Math.round(current_FA["ohlc"].high - 2 * ATR),
//                   color: "#f5c842",
//                   AlertStatus: "onslider",
//                   SMS_status: "off",
//                   timestamp: new Date(),
//                 };
//               }
//               // TODO  FA_Low
//               if (ibLTimer < 1800 && ibLTimer > 0) {
//                 FA_Low = {
//                   label: "FA_Low",
//                   date,
//                   price: Math.round(current_FA["ohlc"].low),
//                   color: "hotpink",
//                   AlertStatus: "onslider",
//                   SMS_status: "off",
//                   timestamp: new Date(),
//                 };
//                 // TODO  1ATR_UP
//                 ATR1_Up = {
//                   label: "1ATR_UP",
//                   date,
//                   price: Math.round(current_FA["ohlc"].low + ATR),
//                   color: "#f5c842",
//                   AlertStatus: "onslider",
//                   SMS_status: "off",
//                   timestamp: new Date(),
//                 };
//                 // TODO  2ATR_UP
//                 ATR2_Up = {
//                   label: "2ATR_UP",
//                   date,
//                   price: Math.round(current_FA["ohlc"].low + 2 * ATR),
//                   color: "#f5c842",
//                   AlertStatus: "onslider",
//                   SMS_status: "off",
//                   timestamp: new Date(),
//                 };
//               }

//               //   TODO : after deleting the labels now insert these datas in databse

//               // ! if FA High and Low != null , update it in DB
//               if (FA_High != null) {
//                 let ATR_arr_high = [ATR1_Down, ATR2_Down, FA_High];
//                 db.get().collection("User-Labels").insertMany(ATR_arr_high);
//               }
//               if (FA_Low != null) {
//                 let ATR_arr_low = [FA_Low, ATR1_Up, ATR2_Up];
//                 db.get().collection("User-Labels").insertMany(ATR_arr_low);
//               }
//             });
//         });
//     });
// });
// cron.schedule("3 10 * * MON-FRI", () => {
//   db.get()
//     .collection("IB-TICKS")
//     .find({
//       date: { $gte: new Date(moment(new Date()).format("YYYY-MM-DD")) },
//     })
//     .toArray((err, data) => {
//       let Array_POC = {};
//       let volumePOC = {};
//       let valueArea = {};
//       data.forEach((tick) => {
//         let last_price = Number(2 * Math.round(tick.latestTradedPrice / 2));

//         if (Object.keys(Array_POC).indexOf(last_price.toString()) != -1) {
//           Array_POC[last_price] += Number(tick.lastTradedQuantity);
//         } else {
//           Array_POC[last_price] = Number(tick.lastTradedQuantity);
//         }

//         var highVol_price = Object.keys(Array_POC).reduce((a, b) =>
//           Array_POC[a] > Array_POC[b] ? a : b
//         );
//         var total_volume = Object.values(Array_POC).reduce((a, b) => a + b);

//         volumePOC = {
//           price: highVol_price,
//           volume: Array_POC[highVol_price],
//         };
//         var valueAreaVolume = Number(Array_POC[highVol_price]);
//         var oneUpPrice = Number(highVol_price);
//         var oneDownPrice = Number(highVol_price);
//         var vah = Number(highVol_price);
//         var val = Number(highVol_price);
//         var oneUpVolume = 0;
//         var oneDownVolume = 0;
//         var f = Object.keys(Array_POC).indexOf(highVol_price.toString());
//         var i = 1;
//         var j = 1;
//         while (valueAreaVolume / total_volume < 0.7) {
//           oneUpPrice = Number(Object.keys(Array_POC)[f + i]);
//           oneDownPrice = Number(Number(Object.keys(Array_POC)[f - j]));
//           oneUpVolume = Array_POC[oneUpPrice];
//           oneDownVolume = Array_POC[oneDownPrice];

//           if (oneUpVolume == undefined) {
//             oneUpVolume = 0;
//           }
//           if (oneDownVolume == undefined) {
//             oneDownVolume = 0;
//           }
//           if (oneUpVolume > oneDownVolume) {
//             i++;
//             vah = Number(oneUpPrice);
//             oneDownPrice = oneDownPrice + 2;
//             valueAreaVolume += Number(oneUpVolume);
//           } else {
//             j++;
//             valueAreaVolume += Number(oneDownVolume);
//             val = Number(oneDownPrice);
//             oneUpPrice = oneUpPrice + 2;
//           }
//         }
//         valueArea = {
//           vah: vah,
//           val: val,
//           valueAreaVolume: valueAreaVolume,
//         };
//       });
//       const lastData = data.slice(-1)[0];
//       db.get()
//         .collection("DAY-VALUE_AREA")
//         .insertMany([
//           {
//             valueArea,
//             volumePOC,
//             overAll_price: Array_POC,
//             date: new Date(),
//             ohlc: lastData["ohlc"],
//             total_volume: lastData["total_volume"],
//             vwap: lastData["vwap"],
//           },
//         ]);
//     });
// });

// // // todo : updating previous day vpoc and valueArea to the reference page at the time 3 : 30
// cron.schedule("4 10 * * MON-FRI", () => {
//   let currentDateObj = new Date();
//   currentDateObj.setDate(
//     currentDateObj.getDate() - ((currentDateObj.getDay() + 2) % 7)
//   );
//   currentDateObj = moment(currentDateObj).format("YYYY-MM-DD");
//   db.get()
//     .collection("PROFILE-CHART")
//     .find({ date: { $gte: new Date(currentDateObj) } })
//     .toArray((err, result) => {
//       // ! first delete the old labels from database

//       let deleteName = [
//         "prevVPOC",
//         "prevVAH",
//         "prevVAL",
//         "cur_week_VAH",
//         "cur_week_VAL",
//         "cur_week_VPOC",
//       ];
//       deleteName.forEach((d) => {
//         db.get().collection("User-Labels").deleteOne({
//           label: d,
//         });
//       });
//       if (result.length > 0) {
//         // ? store every on in this array
//         let storeOBJ_arr = [];

//         // todo : week reference labels of vpoc and va
//         let cur_week_VPOC = 0;
//         let cur_week_VAH = 0;
//         let cur_week_VAL = 0;
//         result.forEach((d) => {
//           cur_week_VPOC += Number(d["volumePOC"].price);
//           cur_week_VAH += Number(d["valueArea"].vah);
//           cur_week_VAL += Number(d["valueArea"].val);
//         });

//         cur_week_VPOC /= result.length;
//         cur_week_VAH /= result.length;
//         cur_week_VAL /= result.length;

//         storeOBJ_arr.push(
//           made_label("cur_week_VPOC", cur_week_VPOC, "#6beb34", new Date())
//         );
//         storeOBJ_arr.push(
//           made_label("cur_week_VAH", cur_week_VAH, "#6beb34", new Date())
//         );
//         storeOBJ_arr.push(
//           made_label("cur_week_VAL", cur_week_VAL, "#6beb34", new Date())
//         );
//         // todo : day reference labels of vpoc and va
//         // * push the every single data to the array
//         let lastElem = result.slice(-1)[0];

//         storeOBJ_arr.push(
//           made_label(
//             "prevVPOC",
//             lastElem["volumePOC"].price,
//             "red",
//             new Date(lastElem.date)
//           )
//         );
//         storeOBJ_arr.push(
//           made_label(
//             "prevVAH",
//             lastElem["valueArea"].vah,
//             "red",
//             new Date(lastElem.date)
//           )
//         );
//         storeOBJ_arr.push(
//           made_label(
//             "prevVAL",
//             lastElem["valueArea"].val,
//             "red",
//             new Date(lastElem.date)
//           )
//         );

//         // todo : insert the array to database
//         db.get().collection("User-Labels").insertMany(storeOBJ_arr);
//         setTimeout(() => {
//           storeOBJ_arr = null;
//         }, 5000);
//       }
//     });
// });

// cron.schedule("5 10 * * THU",() => {

//   let deleteName = ["prev_week_vpoc", "prev_week_vah", "prev_week_val"];
//       deleteName.forEach((d) => {
//         db.get().collection("User-Labels").deleteOne({
//           label: d,
//         });
//       });
//   db.get()
//     .collection("PROFILE-CHART")
//     .find({
//       date: {
//         $gte: new Date(new Date() - 6 * 60 * 60 * 24 * 1000),
//       },
//     })
//     .toArray((err, res) => {
//       let prev_week_vpoc = 0;
//       let prev_week_vah = 0;
//       let prev_week_val = 0;
//       res.forEach((d) => {
//         prev_week_vpoc += Number(d["volumePOC"].price);
//         prev_week_vah += Number(d["valueArea"].vah);
//         prev_week_val += Number(d["valueArea"].val);
//       });

//       prev_week_vpoc /= res.length;
//       prev_week_vah /= res.length;
//       prev_week_val /= res.length;

//       let PREV_Arr = [];
//       PREV_Arr.push(
//         made_label(
//           "prev_week_vpoc",
//           prev_week_vpoc,
//           "#d69256",
//           new Date()
//         )
//       );
//       PREV_Arr.push(
//         made_label(
//           "prev_week_vah",
//           prev_week_vah,
//           "#d69256",
//           new Date()
//         )
//       );
//       PREV_Arr.push(
//         made_label(
//           "prev_week_val",
//           prev_week_val,
//           "#d69256",
//           new Date()
//         )
//       );

//       db.get().collection("User-Labels").insertMany(PREV_Arr);
//       PREV_Arr = null;
//     });
// });

function made_label(label, price, color, date) {
  return {
    label,
    date: moment(date).format("YYYY-MM-DD"),
    price: Math.round(Number(price)),
    color,
    AlertStatus: "onslider",
    SMS_status: "off",
    timestamp: new Date(),
  };
}
///////////   ------------------   cron works end ----------------

Router.get("/Zip/:date", (req, res) => {
  fs.readFile(
    `backend/cronJob/zipFolder/${req.params.date}.zip`,
    function (err, data) {
      if (!err) {
        var zip = new JSZip();
        zip.loadAsync(data).then(function (contents) {
          Object.keys(contents.files).forEach(function (filename) {
            zip
              .file(filename)
              // .async("nodebuffer")
              .async("string")
              .then(function (content) {
                res.send(content);
              });
          });
        });
      }
    }
  );
});
Router.get("/Zip1", (req, res) => {
  fs.readFile(`backend/router/logs.txt`, "utf8", function (err, data) {
    res.send(data);
  });
});
Router.get("/openZip/:date", (req, res) => {
  fs.readFile(`cronJob/zipFolder/${req.params.date}.zip`, function (err, data) {
    if (!err) {
      var zip = new JSZip();
      zip.loadAsync(data).then(function (contents) {
        Object.keys(contents.files).forEach(function (filename) {
          zip
            .file(filename)
            // .async("nodebuffer")
            .async("string")
            .then(function (content) {
              res.send(content);
            });
        });
      });
    }
  });
});
Router.get("/openZip1", (req, res) => {
  fs.readFile(`router/logs.txt`, "utf8", function (err, data) {
    res.send(data);
  });
});
function setAccesstoken_to_kite() {
  db.get()
    .collection("Admin-Token")
    .find()
    .toArray(async (err, res) => {
      if (err) throw err;
      access_token = res[0].access_token;
      runAllFunction = new kiteInstrumemt();
      runAllFunction.KC.access_token = access_token;
      runAllFunction.KC.setAccessToken(access_token);
      get_Instrument_ticks();
    });
}
//we used this func more then once

// todo : main function to store ticks..
function storeCandleTicksIn_DB() {
  ticker = new KiteTicker({
    api_key,
    access_token,
  });
  db.get()
    .collection("IB-TICKS")
    .find({ date: { $gte: new Date(moment(new Date()).format("YYYY-MM-DD")) } })
    .toArray(async (err, data) => {
      if (data.length > 1) {
        let array = await vpoc_valueArea(data);
        runCron(data.slice(-1)[0].total_volume, array);
      } else {
        runCron(0, []);
      }
    });
}

async function runCron(t_vol, array) {
  let volume_traded = t_vol;
  let RSDP = new RunningSingleDayProfile(array, true);

  ticker.autoReconnect(true, -1, 5);
  ticker.connect();
  ticker.on("ticks", onTicks);
  ticker.on("connect", subscribe);

  //kite error
  ticker.on("error", (e) => {
    total_review++;
    ticker.autoReconnect(false);
    fs.appendFileSync("router/logs.txt", JSON.stringify({err :e.message, time : new Date()}));
    if (total_review < 5) {
      storeCandleTicksIn_DB();
    }
  });

  //  disconnect kite
  ticker.on("disconnect", (cb) => {
    //...
    if (ticker != null) {
      ticker.autoReconnect(false);
    }
    fs.appendFileSync("router/logs.txt", JSON.stringify({err :"diconnected", time : new Date()}));
  });

  async function onTicks(ticks) {
    let tick = ticks[0];
    if (tick.volume_traded > volume_traded) {
      tick.last_traded_quantity = tick.volume_traded - volume_traded;
      db.get().collection("IB-TICKS").insertOne(RSDP.singleDayProfile(tick));
      volume_traded = tick.volume_traded;
    }
  }
  async function subscribe() {
    let token = Number(await runAllFunction.findInstrument());
    let instrument_Token = [token];
    ticker.subscribe(instrument_Token);
    ticker.setMode(ticker.modeFull, instrument_Token);
  }
}

function stopCron() {
  ticker.disconnect();
}

Router.post("/stopCron", (req, res) => {
  stopCron();
  res.json({ message: "stopped!!" });
});

Router.post("/runCron", (req, res) => {
  storeCandleTicksIn_DB();
  res.json({ message: "started!!" });
});

Router.post("/cronTime", (req, res) => {
  let hr = Number(req.body.hour);
  let min = Number(req.body.minute);
  let setCron = cron.schedule(`${min} ${hr} * * MON-FRI`, async function () {
    storeCandleTicksIn_DB();
    setCron.stop();
  });
  res.json({ message: "Successfully done" });
});

function vpoc_valueArea(chartData) {
  return new Promise((resolve, reject) => {
    var Array_POC = {};
    var volumePOC = {};
    var valueArea = {};
    chartData.forEach((d) => {
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
    let lastEle = chartData.slice(-1)[0];
    resolve([{ obj: Array_POC }, lastEle]);
    chartData = null;
  });
}

async function get_Instrument_ticks() {
  let token_err = false;
  db.get()
    .collection("IB-TICKS")
    .find({ date: { $lt: new Date(moment(new Date()).format("YYYY-MM-DD")) } })
    .sort({ date: -1 })
    .limit(1)
    .toArray(async (err, num) => {
      //   // todo : all the price ... below 5 above 5 from actual price
      let total_prices = [];
      let highPrice = num[0].latestTradedPrice + 500;
      let lowPrice = num[0].latestTradedPrice - 500;
      for (let i = lowPrice; i <= highPrice; i += 100) {
        total_prices.push(100 * Math.round(i / 100));
      }
      await runAllFunction.KC.getInstruments()
        .then(async (instrument_list) => {
          // todo : find the next thursday
          let next_week = new Date();

          if (next_week.getDay() >= 5 || next_week.getDate() > 24) {
            next_week.setDate(
              next_week.getDate() + ((4 + 7 - next_week.getDay()) % 7 || 7)
            );
          } else if (next_week.getDay() == 4) {
          } else {
            next_week.setDate(
              next_week.getDate() + ((5 - 7 - next_week.getDay()) % 7 || 7)
            );
          }

          // * find month
          let month = moment(next_week).format("MMM");
          month = month.toUpperCase();

          // * find year
          let year = moment(next_week).format("YY");
          // * find name
          let name = "NIFTY";
          // * merge all the founded strings
          let concatString = name.concat(year, month);

          //   // ? store the symbols...
          let overALL_PE_CE = [];

          // todo : filter the instrument and get the symbols
          instrument_list.forEach((d) => {
            if (
              total_prices.indexOf(d.strike) != -1 &&
              (d.tradingsymbol == `${concatString}${d.strike}CE` ||
                d.tradingsymbol == `${concatString}${d.strike}PE`)
            ) {
              overALL_PE_CE.push(d.instrument_token);
            }
          });
          // change typeof tokens to numbers
          overALL_PE_CE = overALL_PE_CE.map((d) => Number(d));

          //save  classes in array
          let returnClass = {};

          // empty volume in an array
          let vol_arr = {};

          for (let i = 0; i < overALL_PE_CE.length; i++) {
            await getData_fromDB(overALL_PE_CE[i]);
          }
          async function getData_fromDB(token) {
            return new Promise((resolve) => {
              db.get()
                .collection("INSTRUMENT-TOKENS")
                .find({
                  instrument_token: token,
                  date: {
                    $gte: new Date(moment(new Date()).format("YYYY-MM-DD")),
                  },
                })
                .toArray(async (err, result) => {
                  if (result.length > 0) {
                    vol_arr[token] = result.slice(-1)[0].total_volume;
                    let vpoc_va = await vpoc_valueArea(result);
                    returnClass[token] = new RunningSingleDayProfile(
                      vpoc_va,
                      false
                    );
                    result = null;
                    vpoc_va = null;
                  } else {
                    returnClass[token] = new RunningSingleDayProfile([], false);
                    vol_arr[token] = 0;
                  }
                  resolve("resolved");
                  if (Object.keys(vol_arr).length == overALL_PE_CE.length) {
                    start_kite_connection();
                  }
                });
            });
          }
          function start_kite_connection() {
            // //connect kite
            let tokens = new KiteTicker({
              api_key,
              access_token,
            });
            //connection true...
            tokens.autoReconnect(true, -1, 5);
            tokens.connect();
            tokens.on("ticks", onTicks);
            tokens.on("connect", subscribe);

            tokens.on("error", () => {
              fs.appendFileSync("router/logs.txt", JSON.stringify({err :e.message, time : new Date()}));
              // ...
              token_err = true;
              token_reviews++;
              tokens.autoReconnect(false);
              if (token_reviews < 5) {
                get_Instrument_ticks();
              }
            });
            tokens.on("disconnect", () => {
              // ...
              if (!token_err) {
                tokens.autoReconnect(false);
              }
            });

            tokens.on("close", () => {
              // ...
            });

            function onTicks(ticks) {
              for (let i = 0; i < ticks.length; i++) {
                if (
                  ticks[i].volume_traded > vol_arr[ticks[i].instrument_token]
                ) {
                  ticks[i].last_traded_quantity =
                    ticks[i].volume_traded - vol_arr[ticks[i].instrument_token];
                  db.get()
                    .collection("INSTRUMENT-TOKENS")
                    .insertOne(
                      returnClass[ticks[i].instrument_token].singleDayProfile(
                        ticks[i]
                      )
                    );
                  vol_arr[ticks[i].instrument_token] = ticks[i].volume_traded;
                }
              }
            }

            function subscribe() {
              tokens.subscribe(overALL_PE_CE);
              tokens.setMode(tokens.modeFull, overALL_PE_CE);
            }
            cron.schedule("0 10 * * MON-FRI", () => {
              tokens.disconnect();
            });
            instrument_list = null;
          }
        })
        .catch(function (err) {
        fs.appendFileSync("router/logs.txt", JSON.stringify({time : new Date()}));
        });
    });
}

module.exports = Router;
