const express = require("express");
const router = express.Router();
const db = require("../server");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./config.env") });
const running = require("../wsConnection/kiteConnect");
const runAllFunction = new running();
const fs = require("fs");
const moment = require("moment");
const api_key = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// // ------------ Beginning of chart works  -------------

//data for tick chart or old charts..
router.post("/chart-data", (req, res, next) => {
  const date = req.body.date;
  db.get()
    .collection("IB-TICKS")
    .find({
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    })
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});

// fetch WIB timer
router.post("/weeklyIB_Timer", (req, res, next) => {
  const date = req.body.date;
  db.get()
    .collection("WEEKLY-IB-TIMER")
    .find({ date: { $lte: new Date(date) } })
    .sort({ date: -1 })
    .limit(1)
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});

// fetch data for profile chart
router.post("/NSE-DAY-PROFILE", (req, res, next) => {
  db.get()
    .collection("PROFILE-CHART")
    .find()
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//fetch every value area
router.post("/GET-WHOLE-VA", (req, res, next) => {
  db.get()
    .collection("DAY-VALUE_AREA")
    .find()
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//fetch last_14-Day datas
router.post("/last_14-Days_first_15Min", (req, res, next) => {
  let date = moment(new Date()).format("YYYY-MM-DD");
  db.get()
    .collection("FIRST-15-MINS")
    .find({ date: { $lt: new Date(date) } })
    .sort({ date: -1 })
    .limit(14)
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
router.post("/last_14-Days_totalVolume", (req, res, next) => {
  let date = moment(new Date()).format("YYYY-MM-DD");
  db.get()
    .collection("PROFILE-CHART")
    .find({ date: { $lt: new Date(date) } })
    .sort({ date: -1 })
    .limit(14)
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
// store reference labels
router.post("/postLabels", (req, res, next) => {
  db.get().collection("User-Labels").insertOne(req.body.value);
  res.json({ message: "done" });
});
// fetch all the reference labels
router.post("/getLabels", (req, res, next) => {
  db.get()
    .collection("User-Labels")
    .find()
    .toArray((err, result) => {
      res.send(result);
    });
});

//delete a reference label
router.post("/deleteLabel", (req, res, next) => {
  db.get().collection("User-Labels").deleteOne({ label: req.body.label });
  res.json({ message: "deleted!" });
});

//update blinked price status
router.post("/updateUserLabels", (req, res, next) => {
  let status = "onslider";
  if (req.body.AlertStatus == status) {
    status = "offslider";
  }
  db.get()
    .collection("User-Labels")
    .updateOne(
      {
        label: req.body.label,
      },
      {
        $set: {
          AlertStatus: status,
        },
      }
    );
  res.json({ message: "updated!" });
});

//  ------------ END of chart works -----------------

//------------- GET kite data from "Kite API"  -----------------

//get data for position page from kite api
router.post("/position", async (req, res, next) => {
  await runAllFunction.KC.getPositions()
    .then((data) => {
      if (data !== null) {
        res.status(200).json(data);
      }
    })
    .catch(function (err) {
      res.json({ message: err.message });
    });
});
//get data for historicalData page from kite api
router.post("/historicalData", async (req, res, next) => {
  //256265 old
  //13669122 new
  await runAllFunction.KC.getHistoricalData(
    256265,
    "day",
    "2022-03-24",
    "2022-10-03"
  )
    .then((data) => {
      res.status(200).json(data);
    })
    .catch(function (err) {
      res.json({ message: err.message });
    });
});
//get data for BigRange page from kite api
router.post("/BigRange", async (req, res, next) => {
  db.get()
    .collection("Big-Range")
    .find({ volume: 0 })
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//get last data to find range
router.post("/get_single_data", async (req, res, next) => {
  let date = req.body.date;
  let query = null;
  if (req.body.status == "first") {
    query = { date: { $gte: new Date(date) } };
  } else {
    query = { date: { $lt: new Date(date) } };
  }
  db.get()
    .collection("IB-TICKS")
    .find(query)
    .sort({ date: -1 })
    .limit(1)
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//get data for linechart page from kite api
router.post("/highOne", async (req, res, next) => {
  var data = req.body;
  var instrumenttoken = runAllFunction.findInstrument();
  var interval = "day";
  var from = data.from1;
  var to = data.to1;
  await runAllFunction.KC.getHistoricalData(instrumenttoken, interval, from, to)
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.json({ message: "data not found" });
      }
    })
    .catch(function (err) {
      add_error_msg_to_logger("highOne", err);
      res.json({ message: err.message });
    });
});
//get data for linechart page from kite api
router.post("/highTwo", async (req, res, next) => {
  var data = req.body;
  var instrumenttoken = runAllFunction.findInstrument();
  var interval = "day";
  var from = data.from2;
  var to = data.to2;
  await runAllFunction.KC.getHistoricalData(instrumenttoken, interval, from, to)
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.json({ message: "data not found" });
      }
    })
    .catch(function (err) {
      add_error_msg_to_logger("highTwo", err);
      res.json({ message: err.message });
    });
});
//get the NFO instrument list from kite api
router.post("/getInstrument", async (req, res) => {
  await runAllFunction.KC.getInstruments("NFO")
    .then((data) => {
      res.json(data);
    })
    .catch(function (err) {
      add_error_msg_to_logger("getInstrument", err);
      res.json({ message: err.message });
    });
});
//get the whole instrument from kite api
router.post("/instrument-list", async (req, res) => {
  await runAllFunction.KC.getInstruments()
    .then((data) => {
      res.json(data);
    })
    .catch(function (err) {
      add_error_msg_to_logger("instrument-list", err);
      res.json({ message: err.message });
    });
});

//get specified instrument ticks from db
router.post("/getSpecifiedToken", async (req, res) => {
  const token = Number(req.body.token);
  const date = req.body.date;
  db.get()
    .collection("INSTRUMENT-TOKENS")
    .find({
      instrument_token: token,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 1 * 24 * 60 * 60 * 1000),
      },
    })
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//get LAST ticks from db
router.post("/last-tick", async (req, res) => {
  const date = req.body.date;
  db.get()
    .collection("IB-TICKS")
    .find({
      date: {
        $lt: new Date(date),
      },
    })
    .sort({ date: -1 })
    .limit(1)
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});

//get data for orders page from kite api
router.post("/orders", async (req, res, next) => {
  await runAllFunction.KC.getOrders()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch(function (err) {
      res.json({ message: err.message });
    });
});

//get last ltp from database
router.post("/ltp", async (req, res, next) => {
  const date = req.body.date;
  db.get()
    .collection("OrderLTP")
    .find({
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 1 * 24 * 60 * 60 * 1000),
      },
    })
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//get the last day last order from db

router.post("/getOldOrders", async (req, res, next) => {
  const date = req.body.date;
  db.get()
    .collection("Orders")
    .find({
      order_timestamp: {
        $gte: new Date(JSON.stringify(date)),
        $lt: new Date(
          new Date(JSON.stringify(date)).getTime() + 1 * 24 * 60 * 60 * 1000
        ),
      },
    })
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//fetch real and unrealised data from db
router.post("/realUnreal", (req, res) => {
  db.get()
    .collection("Total_R-UR")
    .find({ date: { $gte: new Date("2022-04-01") } })
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//fetch real and unrealised data from db

router.post("/realUnrealFrom", (req, res) => {
  db.get()
    .collection("Total_R-UR")
    .find({ date: { $gte: new Date(req.body.date) } })
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//get last ltp from database
router.post("/lastLTP", async (req, res, next) => {
  db.get()
    .collection("OrderLTP")
    .find()
    .sort({ date: -1 })
    .limit(1)
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//fetch every pending orders from db
router.post("/pending", (req, res) => {
  db.get()
    .collection("Pending-Orders")
    .find()
    .sort({ date: -1 })
    .limit(1)
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//fetch previousOrders from db
router.post("/pending", (req, res) => {
  db.get()
    .collection("Pending-Orders")
    .find()
    .sort({ date: -1 })
    .skip(1)
    .limit(1)
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});
//doubt
router.post("/pending", (req, res) => {
  var date = req.body;
  db.get()
    .collection("Pending-Orders")
    .find({
      date: {
        $gte: new Date(
          new Date(date.date).setDate(new Date(date.date).getDate() - 1)
        ),
        $lt: new Date(date.date),
      },
    })
    .toArray((err, result) => {
      send_it_to_browser(err, result, req.url, res);
    });
});

// generate accesstoken from kite API
router.post("/requestToken", async (req, res) => {
  var KiteConnect = require("kiteconnect").KiteConnect;
  var kc = new KiteConnect({
    api_key,
  });
  var api_secret = API_SECRET;
  var request_token = req.body.request_token;

  kc.generateSession(request_token, api_secret)
    .then(function (response) {
      runAllFunction.KC.access_token = response.access_token;
      runAllFunction.KC.setAccessToken(response.access_token);
      db.instrument_Token(runAllFunction.findInstrument());
      db.key(response.access_token);
      db.get()
        .collection("Admin-Token")
        .updateOne(
          {
            user: "admin",
          },
          {
            $set: {
              access_token: response.access_token,
            },
          }
        );
      res.json({ message: true });
    })
    .catch((err) => {
      add_error_msg_to_logger("requestToken api", err);
      res.json({ message: err.message });
    });
});
//delete accesstoken
router.post("/deleteToken", async (req, res) => {
  await runAllFunction.KC.invalidateAccessToken(runAllFunction.KC.access_token)
    .then((data) => {
      res.send("success");
    })
    .catch((err) => {
      add_error_msg_to_logger("deleteToken api", err);
      res.json({ message: err.message });
    });
});

//save errors
router.post("/saveLogs", async (req, res) => {
  fs.appendFileSync("router/logs.txt", JSON.stringify(req.body));
});
//get errors
router.post("/getlogs", async (req, res) => {
  fs.readFile("router/logs.txt", "utf8", function (err, data) {
    // zip.file("logs.txt", data);
    // zip
    //   .generateNodeStream({ type: "nodebuffer", streamFiles: true })
    //   .pipe(fs.createWriteStream(`cronJob/zipFolder/${moment(new Date()).format("YYYY-MM-DD")}.zip`))
    //   .on("finish", function () {
    //   });
    res.send(JSON.stringify(data));
  });
});

function send_it_to_browser(err, result, message, res) {
  if (err) {
    // ! if error store it in logs
    fs.appendFileSync(
      "router/logs.txt",
      JSON.stringify({
        err: err.message,
        message,
        time: new Date(),
      })
    );
    res.status(200).json({ err: err.message });
  } else {
    res.status(200).json(result);
  }
}

// todo : error function
function add_error_msg_to_logger(message, err) {
  fs.appendFileSync(
    "router/logs.txt",
    JSON.stringify({
      err: err.message,
      message,
      time: new Date(),
    })
  );
  db.get().collection('ERROR-MSG').insertOne({
    err : err.message,
    message,
    time: new Date()
  })
}
module.exports = router;
