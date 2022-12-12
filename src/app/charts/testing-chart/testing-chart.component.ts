import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import * as moment from 'moment-timezone';
import { NGXLogger } from 'ngx-logger';
import { TestingService } from './testing.service';
declare var $: any;

@Component({
  selector: 'app-testing-chart',
  templateUrl: './testing-chart.component.html',
  styleUrls: ['./testing-chart.component.scss'],
})
export class TestingChartComponent implements OnInit, OnDestroy {

    isLoading: boolean = false;
    MarketEndTime: any = null;
    MarketStartTime: any = null;
    isLoad: boolean = false;
    chartErr: boolean = false;
    chartErrMsg: string = '';
    tableHeaders = [
      'ibHigh',
      'ibLow',
      'ib',
      'ib1_5U',
      'ib2U',
      'ib3U',
      'ib1_5D',
      'ib2D',
      'ib3D',
      'w-high',
      'w-low',
    ];
    // 5m , 15m, 30m, 1h, 1 day
    timesDropdown = 5;
    timesOptions = [
      { id: 5, name: '5min' },
      { id: 15, name: '15min' },
      { id: 30, name: '30min' },
      { id: 60, name: '1hour' },
      { id: 1440, name: '1day' },
    ];
    defaultScale = 5;
    scaleOptions = [
      { id: 1, name: '1' },
      { id: 5, name: '5' },
      { id: 10, name: '10' },
      { id: 15, name: '15' },
      { id: 20, name: '20' },
    ];
    //indexed db name
    indexDB_Name: string = 'candlechart1';
    backendData: any = [];
    constructor(
      private wsService: TestingService,
      private elementRef: ElementRef,
      private logger: NGXLogger
    ) {
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
        '#0f162e';
      this.wsService.indexDB_Name = this.indexDB_Name;
      //set socket credentials....
      this.wsService.post_candle_token = 'candle-data';
      this.wsService.receive_candle_token = 'candle-ticks';
    }

    @HostListener('window:beforeunload') async onBeforeUnload() {
      await this.wsService.closeSocket(true);
    }
    ngOnInit() {
      this.wsService.containerID = 'candlestick';
      this.wsService.chartType = 'candlestick';
      this.wsService.renderSVG();
      this.connect();
      this.wsService.selectTimeMinute = this.timesDropdown;
      this.wsService.selectScale = this.defaultScale;
    }

    async selectChange(dateEvent: any) {
      var element = document.getElementById('foreUnmergeBTN');
      if (element) {
        element.parentNode.removeChild(element);
      }
      this.wsService.mergedArray = [];
      this.wsService.mergedObj = {};
      document.getElementById('candlestick-container').style.display = 'none';
      this.isLoading = true;
      this.wsService.closeSocket(false);

      this.timesDropdown = dateEvent;
      if (dateEvent == 15 || dateEvent == 30) {
        this.defaultScale = 10;
        this.wsService.selectScale = 10;
      } else if (dateEvent == 60) {
        this.defaultScale = 15;
        this.wsService.selectScale = 15;
      } else if (dateEvent == 1440) {
        this.defaultScale = 20;
        this.wsService.selectScale = 20;
      } else {
        this.defaultScale = 5;
        this.wsService.selectScale = 5;
      }
      this.wsService.selectTimeMinute = dateEvent;
      this.isLoading = false;
      this.wsService.getDataFrom_Indexed_DB();
    }

    async changeScale(scaleEvent: any) {
      this.defaultScale = scaleEvent;
      this.wsService.selectScale = scaleEvent;
      this.wsService.updateScales();
    }

    public async connect() {
      // ## Timezone calculation
      let modified_time = new Date();
      modified_time.setHours(new Date().getUTCHours() + 5);
      modified_time.setMinutes(new Date().getUTCMinutes() + 30);

      //    Market Start Time
      this.MarketStartTime = new Date(modified_time);
      this.MarketStartTime.setHours(9);
      this.MarketStartTime.setMinutes(15);
      this.MarketStartTime.setSeconds(0);

      //    Market End Time
      this.MarketEndTime = new Date(modified_time);
      this.MarketEndTime.setHours(15);
      this.MarketEndTime.setMinutes(30);
      this.MarketEndTime.setSeconds(0);

      var currentTime = new Date(modified_time);

      // //date for params to get data from db
      var date: any;
      if (currentTime.getDay() == 0 || currentTime.getDay() == 6) {
        if (currentTime.getDay() == 6) {
          date = new Date(
            new Date(modified_time).setDate(new Date(modified_time).getDate() - 1)
          );
        } else if (currentTime.getDay() == 0) {
          date = new Date(
            new Date(modified_time).setDate(new Date(modified_time).getDate() - 2)
          );
        }
        this.getDataFromDB(date);
      } else if (
        currentTime.getDay() == 1 &&
        currentTime.getTime() < this.MarketStartTime.getTime()
      ) {
        date = new Date(
          new Date(modified_time).setDate(new Date(modified_time).getDate() - 3)
        );
        this.getDataFromDB(date);
      } else {
        if (currentTime.getTime() >= this.MarketEndTime.getTime()) {
          date = new Date(
            new Date(modified_time).setDate(new Date(modified_time).getDate())
          );
          this.getDataFromDB(date);
        } else if (currentTime.getTime() < this.MarketStartTime.getTime()) {
          date = new Date(
            new Date(modified_time).setDate(new Date(modified_time).getDate() - 1)
          );
          const MST = this.MarketStartTime.getTime() - currentTime.getTime();
          setTimeout(() => {
            this.connect();
          }, MST);
          this.getDataFromDB(date);
        } else {
          date = moment(new Date(modified_time)).format('YYYY-MM-DD');
          if (new Date(date).getDay() != 5) {
            this.wsService.weeklyIBdata(date);
          }
          this.wsService
            .dataForCandlestick(
              moment(new Date(modified_time)).format('YYYY-MM-DD')
            )
            .subscribe(
              async (data: any) => {
                if (!Array.isArray(data)) {
                  this.callBackError(data.message);
                  this.logger.error(
                    `ERROR IN CANDLESTICK PAGE : ${data.message}`
                  );
                } else {
                  if (data.length > 1) {
                    this.wsService.socketBool = true;
                    this.wsService.createIndexed_db(data);
                  } else {
                    this.getDataFromDB(
                      new Date(
                        new Date(date).setDate(new Date(date).getDate() - 1)
                      )
                    );
                  }
                }
              },
              (err) => {
                this.callBackError(err.message);
                this.logger.error(`ERROR IN CANDLESTICK PAGE : ${err.message}`);
              }
            );
        }
      }
    }
    getDataFromDB(date: any) {
      var date: any = moment(date).format('YYYY-MM-DD');
      if (new Date(date).getDay() != 5) {
        this.wsService.weeklyIBdata(date);
      }
      this.wsService.dataForCandlestick(date).subscribe(
        async (data: any) => {
          if (data.length > 1) {
            this.wsService.socketBool = true;
            this.wsService.dummyData = data;
            this.wsService.createIndexed_db(data.slice(0,10));
          } else {
            this.getDataFromDB(
              new Date(new Date(date).setDate(new Date(date).getDate() - 1))
            );
          }
        },
        (err) => {
          this.callBackError(err.message);
          this.logger.error(`ERROR IN CANDLESTICK PAGE : ${err.message}`);
        }
      );
    }
    callBackError(message: any) {
      this.chartErrMsg = message;
      this.chartErr = true;
      this.isLoading = false;
      this.isLoad = false;
    }
    async ngOnDestroy() {
      await this.wsService.closeSocket(true);
    }
  }
