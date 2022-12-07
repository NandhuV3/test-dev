import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  constructor() {}

  net = [];
  day = [];
  TotalOrders = [];

  getOrders(data: any) {
    this.TotalOrders.push(data);
    this.TotalOrders.forEach((d) => {
      this.net = d.net;
      this.day = d.day;
    });
  }
  getNetValues() {
    var netOrders = [];

    for (var i = 0; i < this.net.length; i++) {
      var Product = this.net[i].product;
      var TradingSymbol = this.net[i].tradingsymbol;
      var quan = this.net[i].quantity;
      var Avg = this.net[i].average_price.toFixed(2);
      var ltp = this.net[i].last_price.toFixed(2);
      var Pnl = this.net[i].pnl.toFixed(2);
      var Realised = this.net[i].realised.toFixed(2);
      var Unrealised = this.net[i].unrealised.toFixed(2);
      var BuyQuantity = this.net[i].buy_quantity.toFixed(2);
      var SellQuantity = this.net[i].sell_quantity.toFixed(2);

      if (BuyQuantity == 0 || SellQuantity == 0) {
        Realised = Unrealised;
      }

      var obj = {
        Product,
        TradingSymbol,
        quan,
        Avg,
        ltp,
        Realised,
        Unrealised,
        Pnl,
      };

      netOrders.push(obj);
    }
    return netOrders;
  }
  getDayValues() {
    var dayOrders = [];

    for (var i = 0; i < this.day.length; i++) {
      var Product = this.day[i].product;
      var TradingSymbol = this.day[i].tradingsymbol;
      var quan = this.day[i].quantity;
      var Avg = this.day[i].average_price.toFixed(2);
      var ltp = this.day[i].last_price.toFixed(2);
      var PnL = this.day[i].pnl.toFixed(2);
      var Realised = this.day[i].realised.toFixed(2);
      var Unrealised = this.day[i].unrealised.toFixed(2);

      var obj = {
        TradingSymbol,
        Product,
        quan,
        Avg,
        ltp,
        Realised,
        Unrealised,
        PnL,
      };

      dayOrders.push(obj);
    }
    return dayOrders;
  }

  updatingValues() {
    setTimeout(() => {
      var total = 0;

      //net PnL
      let elementsOfPnl = document.getElementsByClassName(
        'Pnl'
      ) as HTMLCollectionOf<HTMLElement>;

      for (var i = 0; i < elementsOfPnl.length; i++) {
        if (Math.sign(parseFloat(elementsOfPnl[i].innerHTML)) == -1) {
          elementsOfPnl[i].style.color = '#f51111';
        }
        if (Math.sign(parseFloat(elementsOfPnl[i].innerHTML)) == 0) {
          elementsOfPnl[i].style.color = '#666666';
        }
        if (Math.sign(parseFloat(elementsOfPnl[i].innerHTML)) == 1) {
          elementsOfPnl[i].style.color = '#15e62d';
        }

        total += parseFloat(elementsOfPnl[i].innerHTML);
      }

      //net Total
      document.getElementById('netTotal').innerHTML = '' + total.toFixed(2);

      if (Math.sign(total) == -1) {
        document.getElementById('netTotal').style.color = '#f51111';
      } else {
        document.getElementById('netTotal').style.color = '#15e62d';
      }
      //Day PnL

      total = 0;
      let elementsOfPNL = document.getElementsByClassName(
        'PnL'
      ) as HTMLCollectionOf<HTMLElement>;

      for (var i = 0; i < elementsOfPNL.length; i++) {
        if (Math.sign(parseFloat(elementsOfPNL[i].innerHTML)) == -1) {
          elementsOfPNL[i].style.color = '#f51111';
        }
        if (Math.sign(parseFloat(elementsOfPNL[i].innerHTML)) == 0) {
          elementsOfPNL[i].style.color = '#666666';
        }
        if (Math.sign(parseFloat(elementsOfPNL[i].innerHTML)) == 1) {
          elementsOfPNL[i].style.color = '#15e62d';
        }

        var num = parseFloat(elementsOfPNL[i].innerHTML);
        total += num;
      }
      //day PnL toatl

      document.getElementById('dayTotal').innerHTML = '' + total.toFixed(2);

      if (Math.sign(total) == -1) {
        document.getElementById('dayTotal').style.color = '#f51111';
      } else {
        document.getElementById('dayTotal').style.color = '#15e62d';
      }

      //avg

      let elementsOfAVG = document.getElementsByClassName(
        'Avg'
      ) as HTMLCollectionOf<HTMLElement>;
      for (var i = 0; i < elementsOfAVG.length; i++) {
        if (Math.sign(parseFloat(elementsOfAVG[i].innerHTML)) == 0) {
          elementsOfAVG[i].style.color = '#666666';
        }
      }
      //ltp

      let elementsOfLTP = document.getElementsByClassName(
        'ltp'
      ) as HTMLCollectionOf<HTMLElement>;
      for (var i = 0; i < elementsOfLTP.length; i++) {
        if (Math.sign(parseFloat(elementsOfLTP[i].innerHTML)) == 0) {
          elementsOfLTP[i].style.color = '#666666';
        }
      }

      //realised

      let elementsOf_Rl = document.getElementsByClassName(
        'Realised'
      ) as HTMLCollectionOf<HTMLElement>;

      for (var i = 0; i < elementsOf_Rl.length; i++) {
        if (Math.sign(parseFloat(elementsOf_Rl[i].innerHTML)) == 0) {
          elementsOf_Rl[i].style.color = '#666666';
        }
      }

      //unrealised

      let elementsOf_u_RL = document.getElementsByClassName(
        'Unrealised'
      ) as HTMLCollectionOf<HTMLElement>;

      for (var i = 0; i < elementsOf_u_RL.length; i++) {
        if (Math.sign(parseFloat(elementsOf_u_RL[i].innerHTML)) == 0) {
          elementsOf_u_RL[i].style.color = '#666666';
        }
      }
    }, 10);
  }
}
