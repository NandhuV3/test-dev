import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
const BACKEND_URL = environment.apiUrl + '/api/';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  params: any = [];
  exchange: string;
  last_price: any = [];
  fullarr: any = {};
  totalBuyAmount: number = 0;
  totalBuyQuantity: number = 0;
  totalSellQuantity: number = 0;
  totalSellAmount: number = 0;
  realised: number = 0;
  unrealised: number = 0;
  ltpPrice: number;
  totalRealised: number = 0;
  totalUnrealised: number = 0;
  date: any;

  storeUnrealised: any = [];
  pendingData: any = [];
  checkType: any;
  checkQuan: any;
  averagePrice: number;
  order_type: number;
  instrument_token: number;
  product: number;
  TradingSymbol: number;
  exchangeTimestamp: number;
  pendingSymbols: any;

  orderData: any;
  completeOrders: any = [];
  storeObj: any = [];
  orderID: number;
  UserInput: any = [];
  checkIT: boolean = false;
  allInstrument_tokens: any = [];

  async updateOrders() {
    this.completeOrders = [];
    this.fullarr = {};

    await this.orderData.forEach((data: any) => {

      if (data.status == 'COMPLETE') {
        var avg = Number(data.average_price);
        data.average_price = avg.toFixed(2);
        this.completeOrders.push(data);
      }
    });

    //==================

    this.completeOrders.forEach(async (data: any) => {
      this.allInstrument_tokens.push(data.instrument_token);
      data.last_price = 0;
      data.realised = 0;
      data.unrealised = 0;
      data.order_id = data.order_id.toString();
      this.exchange = data.exchange;
      var date = new Date(data.exchange_timestamp);
      date.toISOString();
      data.exchange_timestamp = moment(new Date(date)).format(
        'YYYY-MM-DD , h:mm:ss'
      );
      if (!(data.tradingsymbol in this.fullarr)) {

        this.fullarr[data.tradingsymbol] = { values: [], pnl: [] };
        this.fullarr[data.tradingsymbol].values.push(data);
      } else {
        this.fullarr[data.tradingsymbol].values.push(data);
      }
    });

    //get pending data from backend

    if (this.pendingData.length > 0) {
      var mainKeys = Object.keys(this.fullarr);
      this.pendingData[0].pending.forEach((db: any) => {
        if(mainKeys.indexOf(Object.keys(db)[0]) != -1){
          this.fullarr[Object.keys(db)[0]].values.unshift(
            Object.values(db)[0]
          );
        }
      });
    }
  }

  updateOrderslist() {

    this.storeUnrealised = [];
    this.totalRealised = 0;
    this.totalUnrealised = 0;

    var TSymbols = Object.keys(this.fullarr);
    TSymbols.forEach((data) => {

      this.totalBuyAmount = 0;
      this.totalSellAmount = 0;
      this.totalBuyQuantity = 0;
      this.totalSellQuantity = 0;
      this.realised = 0;
      this.unrealised = 0;

      this.fullarr[data].values.forEach((d: any) => {
        this.checkType = d.transaction_type;
        //

/*         if (this.last_price.length > 0) {
          this.last_price.forEach((ltpValue: any) => {
            if (ltpValue.instrument_token == d.instrument_token) {
              var ltp = Number(ltpValue.last_price);
              d.last_price = ltp.toFixed(2);
            }
          });
        } */

        if(Object.keys(this.last_price).length > 0){
          d.instrument_token = d.instrument_token.toString();
          if(Object.keys(this.last_price).indexOf(d.instrument_token) != -1){
            d.last_price = this.last_price[d.instrument_token]
          }
        }

        //
        if (this.fullarr[data].values.length > 1) {
          if (d.transaction_type == 'BUY') {

            //BUY Type
            this.totalBuyAmount += d.quantity * d.average_price;
            this.totalBuyQuantity += d.quantity;
            this.averagePrice = this.totalBuyAmount / this.totalBuyQuantity;

            if (this.totalSellQuantity !== 0) {
              var actualPrice = this.totalSellAmount / this.totalSellQuantity;

              var actualAmount = d.quantity * actualPrice;
              var profit = actualAmount - d.quantity * d.average_price;

              this.totalBuyQuantity -= this.totalSellQuantity;
              this.totalSellQuantity -= d.quantity;
              this.totalBuyAmount -= this.totalSellAmount;
              this.totalSellAmount -= actualAmount;
              if (Math.sign(this.totalSellAmount) == -1) {
                this.totalSellAmount = 0;
              }
              if (Math.sign(this.totalBuyAmount) == -1) {
                this.totalBuyAmount = 0;
              }
              if (Math.sign(this.totalSellQuantity) == -1) {
                this.totalSellQuantity = 0;
              }
              if (Math.sign(this.totalBuyQuantity) == -1) {
                this.totalBuyQuantity = 0;
              }

              //profit and loss after sell
              d.realised = profit;
              if (this.totalBuyQuantity != 0) {
                d.unrealised =
                  (d.last_price - d.average_price) * this.totalBuyQuantity;
              } else if (this.totalSellQuantity != 0) {
                d.unrealised =
                  (actualPrice - d.last_price) * this.totalSellQuantity;
              } else {
                d.unrealised = d.unrealised;
              }
            } else {
              //profit and loss for only buy
              d.realised = 0.0;
              //if continuously two buy comes
              var unrealisedPrice = this.totalBuyAmount / this.totalBuyQuantity;
              d.unrealised =
                (d.last_price - unrealisedPrice) * this.totalBuyQuantity;
            }

            this.realised += d.realised;
            this.unrealised = d.unrealised;
          } else {
            //SELL Type

            this.totalSellAmount += d.quantity * d.average_price;
            this.totalSellQuantity += d.quantity;
            this.averagePrice = this.totalSellAmount / this.totalSellQuantity;

            if (this.totalBuyQuantity !== 0) {
              var actualPrice = this.totalBuyAmount / this.totalBuyQuantity;
              var actualAmount = d.quantity * actualPrice;
              var profit = d.quantity * d.average_price - actualAmount;

              //calculating balance
              this.totalSellQuantity -= this.totalBuyQuantity;
              this.totalBuyQuantity -= d.quantity;
              this.totalSellAmount -= this.totalBuyAmount;
              this.totalBuyAmount -= actualAmount;
              if (Math.sign(this.totalSellAmount) == -1) {
                this.totalSellAmount = 0;
              }
              if (Math.sign(this.totalBuyAmount) == -1) {
                this.totalBuyAmount = 0;
              }
              if (Math.sign(this.totalSellQuantity) == -1) {
                this.totalSellQuantity = 0;
              }
              if (Math.sign(this.totalBuyQuantity) == -1) {
                this.totalBuyQuantity = 0;
              }

              //profit and loss after buy
              d.realised = profit;

              if (this.totalBuyQuantity != 0) {
                d.unrealised =
                  (d.last_price - actualPrice) * this.totalBuyQuantity;
              } else if (this.totalSellQuantity != 0) {
                d.unrealised =
                  (d.average_price - d.last_price) * this.totalSellQuantity;
              } else {
                d.unrealised = 0.0;
              }
            } else {
              //profit and loss for only Sell
              d.realised = 0.0;
              //if continuously two Sell
              var unrealisedPrice =
                this.totalSellAmount / this.totalSellQuantity;
              d.unrealised =
                (unrealisedPrice - d.last_price) * this.totalSellQuantity;
            }

            this.realised += d.realised;
            this.unrealised = d.unrealised;
          }
        } else {
          //if only BUY
          if (d.transaction_type == 'BUY') {
            d.realised = d.realised;
            d.unrealised = (d.last_price - d.average_price) * d.quantity;
            this.totalBuyQuantity = d.quantity;
            this.realised = d.realised;
            this.unrealised = d.unrealised;
            this.averagePrice = d.average_price;
          }
          //or only SELLlast_price
          if (d.transaction_type == 'SELL') {
            d.realised = d.realised;
            d.unrealised = (d.average_price - d.last_price) * d.quantity;
            this.totalSellQuantity = d.quantity;
            this.realised = d.realised;
            this.unrealised = d.unrealised;
            this.averagePrice = d.average_price;
          }
        }

        if (this.averagePrice == null || this.averagePrice == undefined) {
          this.averagePrice = 0.0;
        }
        //lastprice
        this.ltpPrice = d.last_price;
        this.product = d.product;
        this.order_type = d.order_type;
        this.TradingSymbol = d.tradingsymbol;
        this.exchangeTimestamp = d.exchange_timestamp;
        this.orderID = d.order_id;
        this.instrument_token = d.instrument_token;

        //checking all buy and sell quantity
        if (this.totalBuyQuantity > this.totalSellQuantity) {
          this.checkType = 'BUY';
        } else if (this.totalBuyQuantity < this.totalSellQuantity) {
          this.checkType = 'SELL';
        }
      });
      this.checkQuan = Math.abs(this.totalBuyQuantity - this.totalSellQuantity);

      //realised and unrealised data to every symbol
      this.fullarr[data].pnl.push({
        realised: this.realised.toFixed(2),
        unrealised: this.unrealised.toFixed(2),
        last_price: this.ltpPrice,
      });

      if (this.fullarr[data].pnl.length > 1) {
        this.fullarr[data].pnl.shift();
      }

      // unrealised data for database
      if (this.unrealised != 0) {
        var key = this.fullarr[data].values[0].tradingsymbol;
        var value = this.fullarr[data].values.slice(-1);
        var m = {
          [key]: {
            tradingsymbol: this.TradingSymbol,
            instrument_token: Number(this.instrument_token),
            order_id: this.orderID,
            quantity: Number(this.checkQuan),
            average_price: Number(this.averagePrice),
            realised: 0,
            exchange_timestamp: this.exchangeTimestamp,
            product: this.product,
            transaction_type: this.checkType,
            order_type: this.order_type,
            unrealised: Number(value[0].unrealised),
          },
        };
        this.storeUnrealised.push(m);
      }

      this.totalRealised += this.realised;
      this.totalUnrealised += this.unrealised;
      var total_R = this.totalRealised;
      var total_UR = this.totalUnrealised;
      this.totalRealised = Number(total_R.toFixed(2));
      this.totalUnrealised = Number(total_UR.toFixed(2));
    });

    // to add unrealised orders in db and remove it from fullArr
    if (this.pendingData.length > 0) {

      this.pendingData[0].pending.forEach((dd: any) => {
        Object.keys(dd).forEach((c: any) => {

          //initialise price
          dd[c].last_price = 0;
          //assign price

          if(Object.keys(this.last_price).length > 0){
            dd[c].instrument_token = dd[c].instrument_token.toString();
            if(Object.keys(this.last_price).indexOf(c) != -1){
              dd[c].last_price = this.last_price[dd[c].instrument_token]
            }
          }
          // remove realised order in fullarr
          if(Object.keys(this.fullarr).indexOf(c) != -1){
            this.fullarr[c].values.shift();
          }else{
            // store unrealised orders
            this.storeUnrealised.push({ [c]: dd[c] });
          }
        });
      });
    }

    return this.fullarr;
  }
}
