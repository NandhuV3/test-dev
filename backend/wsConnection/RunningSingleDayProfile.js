const db = require("../server");

// DECLARING CLASS
class RunningSingleDayProfile {
  constructor(value, bool) {
    if (value.length > 0) {
      this.Array_POC = value[0].obj;
      this.first15MinProfile = value[1].first15MinProfile;
      this.initialBalance = value[1].initialBalance;
      this.weeklyIB = value[1].weeklyIB;
    }
    if (bool) {
      if (new Date().getDay() != 5) {
        db.get()
          .collection("WEEKLY-IB")
          .find()
          .sort({ date: -1 })
          .limit(1)
          .toArray((err, resp) => {
            if (err) throw err;
            this.weeklyIB = resp[0].weeklyIB;
          });
      }
    }
  }
  // currentDate = new Date();
  // market_StartTime = new Date(this.currentDate.getUTCFullYear() , this.currentDate.getUTCMonth(), this.currentDate.getUTCDate() , 9 , 15 , 0);
  //
  instrument = {
    minTickSize: 0.05,
  };
  //
  latestTradedPrice = null;

  instrumentName = "NIFTY-F";
  ohlc = {};
  initialBalance = {};
  weeklyIB = {};
  interval = null;

  first15MinProfile = {};

  volumePOC = {};
  valueArea = null;

  Array_POC = {};

  // MAIN FUNCTION TO CALCULATE EVERYTHING
  singleDayProfile(tick) {
    this.calculateOpenParams(tick);
    this.calculateInterval(tick);
    this.maintainVPOC(tick);

    return this.getSingleDayProfile(tick);
  }

  //INITIALING 1st 15 MINUTES BALANCE
  isTickInFirst15Min(data) {
    var result = false;
    const date = new Date(data.last_trade_time);
    const startDate = new Date(date);
    // startDate.setHours(3);
    // startDate.setMinutes(45);
    startDate.setHours(9);
    startDate.setMinutes(15);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const endDate = new Date(date);
    // endDate.setHours(3);
    // endDate.setMinutes(59);
    endDate.setHours(9);
    endDate.setMinutes(29);
    endDate.setSeconds(59);
    endDate.setMilliseconds(0);
    if (date >= startDate && date <= endDate) {
      result = true;
    }
    return result;
  }

  //INITIALING 1 HOUR BALANCE
  isTickInInitialBalance(data) {
    var result = false;
    const date = new Date(data.last_trade_time);
    const startDate = new Date(date);
    // startDate.setHours(3);
    // startDate.setMinutes(45);
    startDate.setHours(9);
    startDate.setMinutes(15);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const endDate = new Date(date);
    // endDate.setHours(4);
    // endDate.setMinutes(44);
    endDate.setHours(10);
    endDate.setMinutes(14);
    endDate.setSeconds(59);
    endDate.setMilliseconds(0);
    if (date >= startDate && date <= endDate) {
      result = true;
    }
    return result;
  }
  //INITIALING 1 HOUR BALANCE
  first5hrsIB(data) {
    var result = false;
    const date = new Date(data.last_trade_time);
    const startDate = new Date(date);
    // startDate.setHours(3);
    // startDate.setMinutes(45);
    startDate.setHours(9);
    startDate.setMinutes(15);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const endDate = new Date(date);
    // endDate.setHours(8);
    // endDate.setMinutes(44);
    endDate.setHours(14);
    endDate.setMinutes(14);
    endDate.setSeconds(59);
    endDate.setMilliseconds(0);
    if (date >= startDate && date <= endDate) {
      result = true;
    }
    return result;
  }

  //CALCUTATING IB AND FIRST15MINS
  async calculateOpenParams(value) {
    var isInInitialBal = this.isTickInInitialBalance(value);
    var firstInitialBalance = this.isTickInFirst15Min(value);
    var first5hrs = this.first5hrsIB(value);
    var friday;
    if (new Date(value.last_trade_time).getDay() == 5) {
      friday = true;
    } else {
      friday = false;
    }
    if (isInInitialBal || firstInitialBalance || first5hrs) {
      var ib = Number((value["ohlc"].high - value["ohlc"].low).toFixed(2));
      // IB UP
      var ib1_5U = Number((value["ohlc"].high + ib * 0.5).toFixed(2));
      var ib3U = Number((value["ohlc"].high + ib * 2).toFixed(2));
      var ib2U = Number((value["ohlc"].high + ib * 1).toFixed(2));
      // IB DOWN
      var ib1_5D = Number((value["ohlc"].low - ib * 0.5).toFixed(2));
      var ib2D = Number((value["ohlc"].low - ib * 1).toFixed(2));
      var ib3D = Number((value["ohlc"].low - ib * 2).toFixed(2));
    }
    if (firstInitialBalance) {
      this.initialBalance = {};
      this.first15MinProfile.volume = value.volume_traded;

      this.initialBalance.volume = value["volume_traded"];
      this.initialBalance.ibHigh = value["ohlc"].high;
      this.initialBalance.ibLow = value["ohlc"].low;
      this.initialBalance.ib = ib;
      this.initialBalance.ib1_5U = ib1_5U;
      this.initialBalance.ib2U = ib2U;
      this.initialBalance.ib3U = ib3U;
      this.initialBalance.ib1_5D = ib1_5D;
      this.initialBalance.ib2D = ib2D;
      this.initialBalance.ib3D = ib3D;
      if (friday) {
        this.weeklyIB = {};
        this.weeklyIB = this.initialBalance;
      }
    } else if (isInInitialBal) {
      this.initialBalance = {};
      this.initialBalance.volume = value.volume_traded;
      this.initialBalance.ibHigh = value["ohlc"].high;
      this.initialBalance.ibLow = value["ohlc"].low;
      this.initialBalance.ib = ib;
      this.initialBalance.ib1_5U = ib1_5U;
      this.initialBalance.ib2U = ib2U;
      this.initialBalance.ib3U = ib3U;
      this.initialBalance.ib1_5D = ib1_5D;
      this.initialBalance.ib2D = ib2D;
      this.initialBalance.ib3D = ib3D;
      if (friday) {
        this.weeklyIB = {};
        this.weeklyIB = this.initialBalance;
      }
    } else if (first5hrs && friday) {
      this.weeklyIB = {};
      this.weeklyIB.volume = value.volume_traded;
      this.weeklyIB.ibHigh = value["ohlc"].high;
      this.weeklyIB.ibLow = value["ohlc"].low;
      this.weeklyIB.ib = ib;
      this.weeklyIB.ib1_5U = ib1_5U;
      this.weeklyIB.ib2U = ib2U;
      this.weeklyIB.ib3U = ib3U;
      this.weeklyIB.ib1_5D = ib1_5D;
      this.weeklyIB.ib2D = ib2D;
      this.weeklyIB.ib3D = ib3D;
    }
  }

  calculateInterval(data) {
    this.interval = data.last_price / 10000;
    if (Math.round(this.interval) < this.instrument.minTickSize) {
      this.interval = this.instrument.minTickSize;
    } else {
      this.interval = Math.round(this.interval);
    }
    return this.interval;
  }

  maintainVPOC(tick) {
    this.latestTradedPrice = Number(
      this.interval * Math.round(tick.last_price / this.interval)
    );

    if (
      Object.keys(this.Array_POC).indexOf(this.latestTradedPrice.toString()) !=
      -1
    ) {
      this.Array_POC[this.latestTradedPrice] += Number(
        tick.last_traded_quantity
      );
    } else {
      this.Array_POC[this.latestTradedPrice] = Number(
        tick.last_traded_quantity
      );
    }

    var highVol_price = Object.keys(this.Array_POC).reduce((a, b) =>
      this.Array_POC[a] > this.Array_POC[b] ? a : b
    );
    var total_volume = Object.values(this.Array_POC).reduce((a, b) => a + b);

    this.volumePOC = {
      price: highVol_price,
      volume: this.Array_POC[highVol_price],
    };
    var valueAreaVolume = Number(this.Array_POC[highVol_price]);
    var oneUpPrice = Number(highVol_price);
    var oneDownPrice = Number(highVol_price);
    var vah = Number(highVol_price);
    var val = Number(highVol_price);
    var oneUpVolume = 0;
    var oneDownVolume = 0;
    var f = Object.keys(this.Array_POC).indexOf(highVol_price.toString());
    var i = 1;
    var j = 1;
    while (valueAreaVolume / total_volume < 0.7) {
      oneUpPrice = Number(Object.keys(this.Array_POC)[f + i]);
      oneDownPrice = Number(Number(Object.keys(this.Array_POC)[f - j]));
      oneUpVolume = this.Array_POC[oneUpPrice];
      oneDownVolume = this.Array_POC[oneDownPrice];

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

    this.valueArea = {
      vah: vah,
      val: val,
      valueAreaVolume: valueAreaVolume,
    };
  }

  getSingleDayProfile(data) {
    const date = new Date(data.last_trade_time);
    return {
      date: date,
      instrument_token: data.instrument_token,
      instrument_name: this.instrumentName,
      ohlc: data.ohlc,
      total_volume: data.volume_traded,
      latestTradedPrice: this.latestTradedPrice,
      vwap: data.average_traded_price,
      volumePOC: this.volumePOC,
      first15MinProfile: this.first15MinProfile,
      initialBalance: this.initialBalance,
      weeklyIB: this.weeklyIB,
      lastTradedQuantity: data.last_traded_quantity,
      valueArea: this.valueArea,
    };
  }
}

module.exports = RunningSingleDayProfile;
