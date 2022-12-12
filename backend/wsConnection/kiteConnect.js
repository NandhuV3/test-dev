var getKiteInstruments = require("./orders&postition");
const fs = require("fs");

class MainPage {
  constructor() {}
  // KC is used to get all the functions from KITE TRADE APP by passing params
  KC = new getKiteInstruments({
    access_token: "",
  });
  //function to find instrument token
  findInstrument() {
    //path to find the  " INSTRUMENT " json file
    // const path = "wsConnection/instrumentList/instrument.json";
    const path = "backend/wsConnection/instrumentList/instrument.json";
    //checking if path exists
    if (fs.existsSync(path)) {
      //if path exists reading the file to get list
      var data = JSON.parse(fs.readFileSync(path, "utf8"));

      //checking the list is enpty or not
      if (data.length != 0) {
        //getting the current month and date
        var TodayDate = new Date();
        var curMonth = TodayDate.getMonth();
        var curDaTe = TodayDate.getDate();
        // comparing the array with current date to get token
        data.map((d) => {
          var month = new Date(d.expiry).getMonth();
          var date = new Date(d.expiry).getDate();
          if (curMonth == month && curDaTe <= date) {
            this.instrument_token = d.instrument_token;
          } else if (curMonth + 1 == month) {
            this.instrument_token = d.instrument_token;
          }
        });
        //if token equals to undefined creating a new file in a dirc
        if (this.instrument_token === undefined) {
          this.addInstrumentList();
        }
      } else {
        this.addInstrumentList();
      }
      //if path not exists
    } else {
      this.addInstrumentList();
    }
    // returning the token
    return this.instrument_token;
  }
  // function for creating the file in a instrument dirc
  async addInstrumentList() {
    await this.KC.getInstruments("NFO")
      .then((data) => {
        var NFO_arr = [];
        //finding the needed tokens
        data.find((d) => {
          if (d.segment == "NFO-FUT") {
            NFO_arr.push(d);
          }
        });
        //getting first three month data from an array
        var ArrayFile = NFO_arr.slice(0, 3);
        //creating or writing a new file
        fs.writeFileSync(
          // "wsConnection/instrumentList/instrument.json",
          "backend/wsConnection/instrumentList/instrument.json",
          JSON.stringify(ArrayFile),
          () => {
            this.addInstrumentList();
          }
        );
      })
      .catch(function (err) {
        fs.appendFileSync("router/logs.txt", JSON.stringify({err :err.message, time : new Date()}));
      });
  }
}
module.exports = MainPage;
