import { Injectable } from '@angular/core';
import { OrderService } from './orders1.service';

@Injectable({
  providedIn: 'root',
})
export class PendingOrdersService {
  constructor(private mainOrder: OrderService) {
  }

  pendingData: any = [];
  fullObj: any = null;
  params: any = [];
  last_price: any = [];
  pUnrealised: number;
  UserInput: any = [];
  checkIT: boolean = false;
  allPending_Tokens: any = [];
  totalUnrealised: number = 0;
  bal_unr: number = 0;

  //  # funtion for getting instrument_token to get ltp
  getparams() {
    if (this.pendingData.length != 0) {

      this.pendingData[0].pending.forEach((dd: any) => {
        Object.values(dd).forEach((d: any) => {
          if (this.allPending_Tokens.includes(d.instrument_token)) {
            return;
          } else {
            this.allPending_Tokens.push(d.instrument_token);
          }
        });
      });
    }
  }

  // calculating pending orders
  async getPendingData() {
    this.totalUnrealised = 0;
    this.bal_unr = 0;

    if (this.pendingData.length > 0) {

      this.fullObj = {};
      var seperate_obj = [];

      this.pendingData[0].pending.forEach((d: any) => {
        seperate_obj.push(Object.values(d)[0]);
      });

      seperate_obj.forEach((data: any) => {
        data.last_price = 0;

        if(Object.keys(this.last_price).length > 0){
          data.instrument_token = data.instrument_token.toString();
          if(Object.keys(this.last_price).indexOf(data.instrument_token) != -1){
            data.last_price = this.last_price[data.instrument_token]
          }
        }

        data.average_price = Number(data.average_price).toFixed(2);
        data.order_id = data.order_id.toString();
        if (!(data.tradingsymbol in this.fullObj)) {
          this.fullObj[data.tradingsymbol] = { values: [], pnl: [] };
          this.fullObj[data.tradingsymbol].values.push(data);
        } else {
          this.fullObj[data.tradingsymbol].values.push(data);
        }

        //if only BUY
        if (data.transaction_type == 'BUY') {
          data.unrealised =
            (data.last_price - data.average_price) * data.quantity;
          this.pUnrealised = Number(data.unrealised.toFixed(2));
        }
        //or only SELL
        if (data.transaction_type == 'SELL') {
          data.unrealised =
            (data.average_price - data.last_price) * data.quantity;
          this.pUnrealised = Number(data.unrealised.toFixed(2));
        }

        this.fullObj[data.tradingsymbol].pnl.push({
          realised: 0,
          unrealised: this.pUnrealised,
          last_price: data.last_price,
        });
        this.totalUnrealised += this.pUnrealised;
      });

      // // check the mainorder and pending && send the balance orders

      var mainData = this.mainOrder.fullarr;

      Object.keys(this.fullObj).forEach((d:any)=>{
        if(Object.keys(mainData).indexOf(d) != -1){
          this.bal_unr += Number(this.fullObj[d].values[0].unrealised);
          mainData[d].values.forEach((dd: any) => {
            if (dd.realised != '0' || dd.realised != 0) {
              delete this.fullObj[d];
            }
          });
        }
      });

      this.totalUnrealised = Number(
        (this.totalUnrealised - this.bal_unr).toFixed(2)
      );
      return this.fullObj;
    }
  }
}
