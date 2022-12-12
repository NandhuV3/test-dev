const KiteTicker = require("kiteconnect").KiteTicker;
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const mongoClient = require("mongodb").MongoClient;
require("dotenv").config({ path: path.resolve(__dirname, "./config.env") });
// const dbURL = process.env.database_url;
const dbURL = "mongodb://localhost:27017";
let mongodb = null;
var access_token = null;
var instrument_token = null;
var api_key = process.env.API_KEY;
let closeCon = null;

////sockets
let connectCandle = null;
let csCon = false;
let overAll_connectedCandle = 0;
let connectInstr = null;
let instrCon = false;
let overAll_connectedInstr = 0;
let candle_token = null;
let candle_token_con = false;
let overAll_candle_token = 0;

//connect db
connect();
const kiteMainToken = require("./wsConnection/kiteConnect");
async function connect() {
  console.log("server started");
  mongoClient.connect(dbURL, async (err, result) => {
    if (err) {
      add_error_msg_to_logger("database connection", err.message);
    }else{
      closeCon = result;
      console.log("connected db");
      mongodb = result.db("admin");
      // add_error_msg_to_logger("server started", false);
      mongodb
      .collection("Admin-Token")
      .find()
      .toArray(async (err, token) => {
        var runAllFunction = new kiteMainToken();
        runAllFunction.KC.setAccessToken(token[0].access_token);
        runAllFunction.KC.access_token = token[0].access_token;
        instrument_Token(await runAllFunction.findInstrument());
        key(token[0].access_token);
        get();
        MainFile();
      });
    }
  });
}

function get() {
  return mongodb;
}
function close() {
  // mongodb.close();
  closeCon.close();
}
function key(params) {
  access_token = params;
}
function instrument_Token(params) {
  instrument_token = Number(params);
}

module.exports = {
  connect,
  get,
  close,
  key,
  instrument_Token,
};

async function MainFile() {
  const RunningSingleDayProfile = require("./wsConnection/RunningSingleDayProfile");

  ///// #connecting port
  const app = require("./app");
  // const port = process.env.PORT || 4040;
  const port = 4040;
  const server = require("http").createServer(app);

  //// ## connect socket
  const io = require("socket.io")(server, {
    cors: {
      origin: [
        "https://www.doublemint.app",
        "https://doublemint.app",
        "http://meanapp-env.eba-3zmkem9t.ap-south-1.elasticbeanstalk.com",
        "http://testingmint-env.eba-ka8ykfpn.ap-south-1.elasticbeanstalk.com",
        "http://localhost:1234",
      ],
      forceNew: true,
      transport: ["websocket"],
      methods: ["GET", "POST"],
    },
  });
  // //disconnect every socket which are connected
  function close_reset_candle() {
    if (csCon) {
      connectCandle.autoReconnect(false);
      connectCandle.disconnect();
      connectCandle = null;
      csCon = false;
    }
  }
  function close_reset_instrument() {
    if (instrCon) {
      connectInstr.autoReconnect(false);
      connectInstr.disconnect();
      connectInstr = null;
      instrCon = false;
      overAll_connectedInstr = 0;
    }
  }
  function close_reset_tokens() {
    if (candle_token_con) {
      candle_token.autoReconnect(false);
      candle_token.disconnect();
      candle_token = null;
      candle_token_con = false;
      overAll_candle_token = 0;
    }
  }
  // cron.schedule("40 3 * * MON-FRI", () => {
  //   connectCandle = null;
  //   csCon = false;
  //   overAll_connectedCandle = 0;
  //   connectInstr = null;
  //   instrCon = false;
  //   overAll_connectedInstr = 0;
  //   candle_token = null;
  //   candle_token_con = false;
  //   overAll_candle_token = 0;
  // });
  // cron.schedule("0 10 * * MON-FRI", () => {
  //   close_reset_candle();
  //   close_reset_instrument();
  //   close_reset_tokens();
  // });
  app.set("port", port);
  server.listen(port, () => {
    console.log("server running on port 4040");
  });

  io.on("connection", (socket) => {
    //"socket connection working";

    /////   ---------- Beginning of candlestick socket connection ---------

    //for candlestick chart
    socket.on("candle-data", async (data) => {
      overAll_connectedCandle++;
      let volume_traded = null;
      let RSDP = null;

      if (csCon) {
        connectCandle.autoReconnect(false);
        connectCandle.disconnect();
        connectCandle = null;
        //connection false...
        csCon = false;
      }
      csCon = true;
      volume_traded = data[1].total_volume;
      RSDP = new RunningSingleDayProfile(data, true);

      connectCandle = new KiteTicker({
        api_key,
        access_token,
      });
      //connection true...
      connectCandle.autoReconnect(true, -1, 5);
      connectCandle.connect();
      connectCandle.on("ticks", onTicks);
      connectCandle.on("connect", subscribe);

      //socket error
      connectCandle.on("error", (e) => {
        close_reset_candle();
        add_error_msg_to_logger("socket io", e.message);
      });

      //disconnect
      connectCandle.on("disconnect", () => {
        if (csCon) {
          connectCandle.autoReconnect(false);
        }
      });

      function onTicks(ticks) {
        let tick = ticks[0];
        if (tick.volume_traded > volume_traded) {
          tick.last_traded_quantity = tick.volume_traded - volume_traded;
          // //todo : sending data to browser ...
          io.sockets.emit("candle-ticks", RSDP.singleDayProfile(tick));
          volume_traded = tick.volume_traded;
        }
      }
      function subscribe() {
        var instrument_Token = [instrument_token];
        connectCandle.subscribe(instrument_Token);
        connectCandle.setMode(connectCandle.modeFull, instrument_Token);
      }
    });

    //   ---------- //?End of candlestick socket connection ---------

    //   ---------- //?Beginning of instrument socket connection ---------

    socket.on("post-instrument", (data) => {
      overAll_connectedInstr++;
      var total_tokens;
      if (instrCon) {
        connectInstr.autoReconnect(false);
        connectInstr.disconnect();
        connectInstr = null;
        //connection false...
        instrCon = false;
      }
      total_tokens = data.map((str) => {
        return Number(str);
      });

      connectInstr = new KiteTicker({
        api_key,
        access_token,
      });
      //connection true...
      instrCon = true;
      connectInstr.autoReconnect(true, -1, 5);
      connectInstr.connect();
      connectInstr.on("ticks", onTicks);
      connectInstr.on("connect", subscribe);

      //socket error
      connectInstr.on("error", (e) => {
        close_reset_instrument();
        add_error_msg_to_logger("socket io", e.message);
      });

      //disconnect
      connectInstr.on("disconnect", () => {
        if (instrCon) {
          connectInstr.autoReconnect(false);
        }
      });

      async function onTicks(ticks) {
        // sending data to browser ...
        io.sockets.emit("get-Ticks", ticks);
      }
      function subscribe() {
        const instrument_Token = total_tokens;
        connectInstr.subscribe(instrument_Token);
        connectInstr.setMode(connectInstr.modeLTP, instrument_Token);
      }
    });

    /////   ---------- End of instrument socket connection ---------
    //updating ltp
    socket.on("post-tokens", (data) => {
      var ticks;
      var token_list;
      if (data != "end") {
        ticks = Object.keys(data);
        token_list = ticks.map((str) => {
          return Number(str);
        });
        ticker.autoReconnect(true, -1, 5);
      } else {
        ticker.autoReconnect(false);
        ticker.disconnect();
      }
      ticker.connect();
      ticker.on("ticks", onTicks);
      ticker.on("connect", subscribe);

      //socket error
      ticker.on("error", (e) => {
        ticker.autoReconnect(false);
        io.sockets.emit("receive-ticks", e.message);
      });

      //  disconnect kite
      ticker.on("disconnect", (cb) => {
        ticker.disconnect();
      });

      // kite connection closed
      ticker.on("close", (cb) => {
        // ...close;
      });

      function onTicks(ticks) {
        ticks.forEach((d) => {
          d.instrument_token = d.instrument_token.toString();
          if (Object.keys(data).indexOf(d.instrument_token) != -1) {
            data[d.instrument_token] = d.last_price;
          }
        });
        // sending data to browser....;
        io.sockets.emit("receive-ticks", data);
      }

      function subscribe() {
        const instrument_Token = token_list;
        ticker.subscribe(instrument_Token);
        ticker.setMode(ticker.modeLTP, instrument_Token);
      }
    });
    /////   ---------- End of instrument socket connection ---------

    //updating ltp
    socket.on("post-candle_token", (data) => {
      overAll_candle_token++;
      let volume_traded = null;
      let RSDP = null;
      let token = Number(data.pop());

      if (candle_token_con) {
        candle_token.autoReconnect(false);
        candle_token.disconnect();
        candle_token = null;
        //connection false...
        candle_token_con = false;
      }

      volume_traded = data[1].total_volume;
      RSDP = new RunningSingleDayProfile(data, false);

      candle_token = new KiteTicker({
        api_key,
        access_token,
      });
      //connection true...
      candle_token_con = true;
      candle_token.autoReconnect(true, -1, 5);
      candle_token.connect();
      candle_token.on("ticks", onTicks);
      candle_token.on("connect", subscribe);
      //socket error
      candle_token.on("error", (e) => {
        close_reset_tokens();
        add_error_msg_to_logger("socket io", e.message);
      });

      candle_token.on("disconnect", () => {
        if (candle_token_con) {
          candle_token.autoReconnect(false);
        }
      });

      function onTicks(ticks) {
        // sending data to browser....;
        var tick = ticks[0];
        if (tick.volume_traded > volume_traded) {
          tick.last_traded_quantity = tick.volume_traded - volume_traded;
          // sending data to browser ...
          io.sockets.emit("receive-candle_token", RSDP.singleDayProfile(tick));
          volume_traded = tick.volume_traded;
        }
      }

      function subscribe() {
        const instrument_Token = [token];
        candle_token.subscribe(instrument_Token);
        candle_token.setMode(candle_token.modeFull, instrument_Token);
      }
    });

    //// -------------  close sockets with its ID  ----------------
    // disconnect instrument
    socket.on("close-socket", function (data) {
      if (data == "candlestick") {
        overAll_connectedCandle--;
        if(overAll_connectedCandle < 0){
          overAll_connectedCandle = 0;
        }
        if (overAll_connectedCandle == 0 && csCon) {
          close_reset_candle();
        }
      }
      if (data == "instrument") {
        overAll_connectedInstr--;
        if (overAll_connectedInstr == 0 && instrCon) {
          close_reset_instrument();
        }
      }
      if (data == "candle_token") {
        overAll_candle_token--;
        if (overAll_candle_token == 0 && candle_token_con) {
          close_reset_tokens();
        }
      }
    });
  });
}

// ! handling errors
function add_error_msg_to_logger(message, err) {
  fs.appendFileSync(
    "backend/router/logs.txt",
    JSON.stringify({
      err: err,
      message,
      time: new Date(),
    })
  );
  mongodb.collection('ERROR-MSG').insertOne({
    err,
    message,
    time: new Date()
  })
}
