import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { OrderService } from './orders1.service';
import { PendingOrdersService } from './pendingOrders.service';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

const BACKEND_URL = environment.apiUrl + '/api/';
const USER_URL = environment.apiUrl + '/user/';
declare var $: any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostListener('window:beforeunload') onBeforeUnload() {
    if (this.socketConnected) {
      this.$appCom.socket.emit('post-tokens', 'end');
      this.$appCom.socket.emit('end');
      this.$appCom.socket.disconnect();
    }
  }
  constructor(
    private http: HttpClient,
    private _orderService1: OrderService,
    private _pendingOrders: PendingOrdersService,
    private elementRef: ElementRef,
    private route: Router,
    private logger: NGXLogger,
    private $appCom: AppComponent
  ) {
    this.$appCom.loggedIn = true;
    this.$appCom.firstNav = false;
  }
  header = [
    'TradingSymbol',
    'Exchange_timestamp',
    'Product',
    'Order_type',
    'Quantity',
    'Average_price',
    'Transaction_type',
    'StopLoss',
  ];
  header1 = [
    'TradingSymbol',
    'Exchange_timestamp',
    'Product',
    'Order_type',
    'Qty',
    'Avg',
    'Type',
  ];
  results: any = {};
  reportKeys = [];
  interval: any;
  pendingData: any = [];
  reportpendingKeys: any = [];
  checKTableDisplay = false;
  storeObj: any = [];
  hideInputStopLoss: boolean = false;
  ipAddress: any = null;
  checkLtp: boolean = false;
  MarketStartTime: any = null;
  MarketEndTime: any = null;
  dbUnrealisedData: any = [];
  noPending: boolean = false;
  showTable: boolean = false;
  timeOver: boolean = false;
  OrdersErr: boolean = false;
  OrdersErrMsg: string = '';
  runSpinner: boolean = false;
  tableDate: string = null;
  socketConnected: boolean = false;

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0d1036';
    if (document.cookie != '') {
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
        '#08102e';
    }
  }

  ngOnInit(): void {
    this.firstFun();
  }

  async getIpAddress() {
    this.ipAddress = await this.http
      .get<{ ip: string }>('https://api.ipify.org/?format=json')
      .toPromise();
  }

  async firstFun() {
    await this.getIpAddress();
    // var controlTime: any;
    // if (document.cookie != '') {
    //   document.getElementById('orders').style.marginLeft = '15vw';
    // this.callOrders();
    // await this.http
    //   .post(BACKEND_URL + 'userAdmin', {}, { responseType: 'text' })
    //   .toPromise()
    //   .then((result: any) => {
    //     if (result) {
          this.callOrders();
    //     }
    //   })
    //   .catch((err) => {
    //     this.logger.info(err.message);
    //   });

    // } else {
    //   this.route.navigate(['/login']);
    // }
    // getIP time in DB
    /* if (document.cookie == '') {
      var dbIP: any = await this.http
        .post(USER_URL + 'checkIP' ,{ ip : this.ipAddress.ip})
        .toPromise();

      if (dbIP.length == 0) {
        await this.http
          .post(USER_URL + 'ipAddress', this.ipAddress, {
            responseType: 'text',
          })
          .toPromise();
          var runWithAdminToken:any = await this.http.post(BACKEND_URL + 'userAdmin',{},{responseType: 'text'}).toPromise();
          if(runWithAdminToken == "OK"){
            this.callOrders();
            setTimeout(() => {
              this.timeOver = true;
              this.showTable = false;
              this.socket.disconnect();
              this.$appCom.timeOver();
            }, 10 * 60000);
          }
      } else {
        var dbIP: any = await this.http
          .post(USER_URL + 'checkIP' ,{ ip : this.ipAddress.ip})
          .toPromise();
        var ipTime = new Date(dbIP[0].time);
        var AddedTime: any = new Date(ipTime).setMinutes(
          new Date(ipTime).getMinutes() + 10
        );
        controlTime =
          new Date(AddedTime).getMinutes() - new Date().getMinutes();

        if (Math.sign(controlTime) == -1) {
          controlTime = 0;
        }
        //checkTime 10mins
        if (new Date().getTime() > new Date(AddedTime).getTime()) {
          this.timeOver = true;
          this.showTable = false;
          this.socket.disconnect();
          this.$appCom.timeOver();
        }
        if (new Date().getTime() < new Date(AddedTime).getTime()) {
          var runWithAdminToken:any = await this.http.post(BACKEND_URL + 'userAdmin',{},{responseType: 'text'}).toPromise();
          if(runWithAdminToken == "OK"){
            this.callOrders();
          }
        }
        setTimeout(() => {
          this.timeOver = true;
          this.showTable = false;
          this.socket.disconnect();
          this.$appCom.timeOver();
        }, controlTime * 60000);
      }
    } */
  }

  async callOrders() {
    //setting time to get unrealised orders
    var from = moment(new Date('2022-06-21')).format('YYYY-MM-DD');
    var to = moment(new Date()).format('YYYY-MM-DD');
    $(function () {
      $('#datePicker').attr('min', from).attr('max', to);
    });

    var CheckDate = new Date();

    if (CheckDate.getDay() == 6 || CheckDate.getDay() == 0) {
      this.SatAndSun();
      this.showTable = true;
    } else {
      this.showOrders();
      this.showTable = true;
    }
  }

  async showOrders() {
    this.$appCom.connectSocket();
    var currentTime = new Date();
    this.MarketStartTime = new Date();
    this.MarketStartTime.setHours(9);
    this.MarketStartTime.setMinutes(14);
    this.MarketStartTime.setSeconds(58);
    // Market start time
    this.MarketEndTime = new Date();
    this.MarketEndTime.setHours(15);
    this.MarketEndTime.setMinutes(30);
    this.MarketEndTime.setSeconds(0);
    if (
      currentTime.getTime() < this.MarketStartTime.getTime() ||
      currentTime.getTime() > this.MarketEndTime.getTime()
    ) {
      this.dbUnrealisedData = await this.http
        .post(BACKEND_URL + 'previousOrders', {})
        .toPromise();
    } else {
      this.dbUnrealisedData = await this.http
        .post(BACKEND_URL + 'pending', {})
        .toPromise();
    }

    this.tableDate = `${moment(new Date()).format('YYYY-MM-DD')}`;
    var currentTime = new Date();

    var correctTime = this.MarketStartTime.getTime() - currentTime.getTime();

    if (correctTime <= 0) {
      correctTime = 0;
    }
    if (currentTime.getDay() == 1) {
      if (currentTime.getTime() < this.MarketStartTime.getTime()) {
        this.dbUnrealisedData = await this.http
          .post(BACKEND_URL + 'previousOrders', {})
          .toPromise();

        setTimeout(async () => {
          this.dbUnrealisedData = await this.http
            .post(BACKEND_URL + 'pending', {})
            .toPromise();
        }, correctTime);
      }
    }

    //asign it to ordersService component class
    this._orderService1.pendingData = await this.dbUnrealisedData;
    this._pendingOrders.pendingData = await this.dbUnrealisedData;
    if (this.dbUnrealisedData.length <= 0) {
      this.noPending = true;
    } else {
      this.noPending = false;
    }

    var previousData = {};
    var LastLtpFromDb: any = await this.http
      .post(BACKEND_URL + 'lastLTP', {})
      .toPromise();

    //======== ===============

    //get ORDERS from calling API
    this.runSpinner = true;
    await this.http
      .post(BACKEND_URL + 'orders', {})
      .toPromise()
      .then(async (orders: any) => {
        this.runSpinner = false;
        if (Array.isArray(orders) == true) {
          this._orderService1.orderData = await orders;

          //asign it to ordersService component
          await this._orderService1.updateOrders();

          //asign the pendingdata and get the params
          this._pendingOrders.getparams();

          //calling LTP for newOrders keys
          var NewLTP = await this._orderService1.allInstrument_tokens;
          //calling LTP for _pendingOrders keys
          var OldLTP = await this._pendingOrders.allPending_Tokens;
          //get LTP from calling API

          var bothTokens = [...NewLTP, ...OldLTP];
          let uniqueChars = [...new Set(bothTokens)];

          uniqueChars.forEach((d: any) => {
            previousData[d] = 0;
          });

          if (LastLtpFromDb.length > 0) {
            if (LastLtpFromDb[0].ticks.length > 0) {
              LastLtpFromDb[0].ticks.forEach((d: any) => {
                previousData[d.instrument_token] = d.last_price;
              });
            }
          }

          this.$appCom.socket.emit('post-tokens', previousData);
          this.socketConnected = true;
          this.$appCom.socket.on('receive-ticks', async (data: any) => {
            if (
              currentTime.getTime() < this.MarketStartTime.getTime() ||
              currentTime.getTime() > this.MarketEndTime.getTime()
            ) {
              clearInterval(this.interval);
            }
            var keys = Object.keys(data);

            keys.forEach((d: any) => {
              if (Object.keys(previousData).indexOf(d) != -1) {
                previousData[d] = data[d];
              }
            });

            this._orderService1.last_price = previousData;
            this._pendingOrders.last_price = previousData;
            this.MainFun();
          });
        } else {
          this.OrdersErrMsg = orders.message;
          this.OrdersErr = true;
        }
      })
      .catch((err) => {
        this.logger.error(`ERROR IN ORDERS PAGE : ${err.message}`);
      });
  }

  async SatAndSun() {
    //setting date
    this.header = this.header1;
    this.hideInputStopLoss = true;
    this.tableDate = `${moment(new Date()).format('YYYY-MM-DD')}`;
    await this.http
      .post(BACKEND_URL + 'previousOrders', {})
      .toPromise()
      .then(async (dbUnrealisedData: any) => {
        //asign it to ordersService component class
        this._orderService1.pendingData = dbUnrealisedData;
        this._pendingOrders.pendingData = dbUnrealisedData;
        if (dbUnrealisedData.length <= 0) {
          this.noPending = true;
        } else {
          this.noPending = false;
        }

        var previousData = {};
        var LastLtpFromDb: any = await this.http
          .post(BACKEND_URL + 'lastLTP', {})
          .toPromise();

        //=======================
        var currentDate = new Date();
        var date = moment(new Date()).format('YYYY-MM-DD');
        if (currentDate.getDay() == 6) {
          date = moment(
            new Date(new Date().setDate(new Date().getDate() - 1))
          ).format('YYYY-MM-DD');
        }
        if (currentDate.getDay() == 0) {
          date = moment(
            new Date(new Date().setDate(new Date().getDate() - 2))
          ).format('YYYY-MM-DD');
        }

        //get ORDERS from calling API
        const orders: any = await this.http
          .post(BACKEND_URL + 'getOldOrders', { date })
          .toPromise();

        if (orders.length > 1) {
          this._orderService1.orderData = orders;

          //asign it to ordersService component
          await this._orderService1.updateOrders();

          if (LastLtpFromDb.length > 0) {
            if (LastLtpFromDb[0].ticks.length > 0) {
              LastLtpFromDb[0].ticks.forEach((d: any) => {
                previousData[d.instrument_token] = d.last_price;
              });
            }
          }

          //running the lastPrice object
          this._orderService1.last_price = previousData;
          this._pendingOrders.last_price = previousData;
          //
          this.MainFun();
        }
      })
      .catch((err: any) => {
        this.logger.error(`ERROR IN ORDERS PAGE : ${err.message}`);
      });
  }

  async onChangeDate(date: any) {
    this.tableDate = date;
    var previousData = {};
    if (this.socketConnected) {
      this.$appCom.socket.disconnect();
    }
    if (date == moment(new Date()).format('YYYY-MM-DD')) {
      this.header = [
        'TradingSymbol',
        'Exchange_timestamp',
        'Product',
        'Order_type',
        'Quantity',
        'Average_price',
        'Transaction_type',
        'StopLoss',
      ];
      this.hideInputStopLoss = false;
      this.callOrders();
    }

    this.hideInputStopLoss = true;
    this.header = this.header1;

    //get pendingData from calling API
    var dbUnrealisedData: any = await this.http
      .post(BACKEND_URL + 'pending', { date })
      .toPromise();

    //asign it to ordersService component class
    this._orderService1.pendingData = dbUnrealisedData;
    this._pendingOrders.pendingData = dbUnrealisedData;
    if (dbUnrealisedData.length <= 0) {
      this.noPending = true;
    } else {
      this.noPending = false;
    }

    //=======================

    //get ORDERS from calling API
    const a: any = await this.http
      .post(BACKEND_URL + 'orders', { date })
      .toPromise();

    this._orderService1.orderData = a;

    //asign it to ordersService component
    var LastLtpFromDb: any = await this.http
      .post(BACKEND_URL + 'lastLTP', {})
      .toPromise();

    if (LastLtpFromDb.length > 0) {
      if (LastLtpFromDb[0].ticks.length > 0) {
        LastLtpFromDb[0].ticks.forEach((d: any) => {
          previousData[d.instrument_token] = d.last_price;
        });
      }
    }

    //running the lastPrice object
    this._orderService1.last_price = previousData;
    this._pendingOrders.last_price = previousData;
    this.MainFun();
  }

  getValue(id: string, value) {
    this.callOrders();
    this._orderService1.checkIT = true;
    if ((id != '' && value != '') || value != '') {
      document.getElementsByClassName(id)[0].innerHTML = '';
      this.storeObj.push({ id: id, value: value });
    } else {
      document.getElementsByClassName(id)[0].innerHTML = '* Value Required';
    }
    const result = Object.values(
      this.storeObj.reduce((acc: any, cur: any) => {
        acc[cur.id] = cur;
        return acc;
      }, {})
    );

    if (this.storeObj.length != 0) {
      this._orderService1.UserInput = this.storeObj;
      this._pendingOrders.UserInput = this.storeObj;
      this._orderService1.updateOrders();
      this._orderService1.updateOrderslist();
      this._pendingOrders.getPendingData();
    }
  }

  checkTypeYes() {
    this._orderService1.checkIT = true;
    this._pendingOrders.checkIT = true;
  }

  checkTypeNo() {
    this._orderService1.checkIT = false;
    this._pendingOrders.checkIT = false;
  }

  closeInterval() {
    clearInterval(this.interval);
  }

  async MainFun() {
    await this._orderService1.updateOrders();
    this.results = await this._orderService1.updateOrderslist();

    //getting the pending Orders to display a table
    this.pendingData = await this._pendingOrders.getPendingData();
    //

    this.reportKeys = Object.keys(this.results);

    //checking the value to show the table or not
    if (this.pendingData == undefined || this.pendingData.length == 0) {
      this.checKTableDisplay = false;
    } else {
      this.checKTableDisplay = true;
      this.reportpendingKeys = Object.keys(this.pendingData);
    }

    //calculating total realised and unrealised

    var unrealised = (this._pendingOrders.totalUnrealised +=
      this._orderService1.totalUnrealised);
    var realised = this._orderService1.totalRealised;

    //save both in db
    //  await this.http.post(BACKEND_URL + 'TRLTUNRL', {realised,unrealised},{responseType:'text'}).toPromise();

    //realised
    if (Math.sign(realised) == -1) {
      document.getElementById('realised').style.color = '#ff1717';
    } else if (Math.sign(realised) == 1) {
      document.getElementById('realised').style.color = '#15e62d';
    } else {
      document.getElementById('realised').style.color = '#949494';
    }
    document.getElementById('realised').innerHTML = realised.toFixed(2);
    //unrealised
    if (Math.sign(unrealised) == -1) {
      document.getElementById('unrealised').style.color = '#ff1717';
    } else if (Math.sign(unrealised) == 1) {
      document.getElementById('unrealised').style.color = '#15e62d';
    } else {
      document.getElementById('unrealised').style.color = '#949494';
    }
    document.getElementById('unrealised').innerHTML = unrealised.toFixed(2);
  }

  ngOnDestroy() {
    if (this.socketConnected == true) {
      this.$appCom.socket.emit('post-tokens', 'end');
      this.$appCom.socket.emit('end');
      this.$appCom.socket.disconnect();
    }
  }
}
