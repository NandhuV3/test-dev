import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import * as moment from 'moment';
import { NGXLogger } from 'ngx-logger';
import { TokenService } from 'src/app/charts/option-of-live/token.service';
import { SocketService } from 'src/app/mainService _file/socket.service';
import * as d3 from 'd3';
declare const $: any;

@Component({
  selector: 'app-option-of-live',
  templateUrl: './option-of-live.component.html',
  styleUrls: ['./option-of-live.component.scss'],
})
export class OptionOfLiveComponent implements OnInit, OnDestroy {
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
  timesDropdown = 30;
  timesOptions = [
    { id: 5, name: '5min' },
    { id: 15, name: '15min' },
    { id: 30, name: '30min' },
    { id: 60, name: '1hour' },
    { id: 1440, name: '1day' },
  ];
  chartDropdown: number = null;
  chartOptions: any = [];
  defaultScale = 5;
  scaleOptions = [
    { id: 1, name: '1' },
    { id: 5, name: '5' },
    { id: 10, name: '10' },
    { id: 15, name: '15' },
    { id: 20, name: '20' },
  ];
  //indexed db name
  indexDB_Name: string = 'instrumentchart';
  backendData: any = [];
  constructor(
    private wsService: SocketService,
    private elementRef: ElementRef,
    private logger: NGXLogger,
    private tokenSer: TokenService
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0f162e';

    this.wsService.indexDB_Name = this.indexDB_Name;
    //set socket credentials....
    this.wsService.post_candle_token = 'post-candle_token';
    this.wsService.receive_candle_token = 'receive-candle_token';
  }

  @HostListener('window:beforeunload') async onBeforeUnload() {
    await this.wsService.closeSocket(true);
  }
  async ngOnInit() {
    await this.setChartOption();
    this.wsService.containerID = 'candlestick';
    this.wsService.chartType = 'candle_token';
    this.wsService.renderSVG();
    this.connect();
    this.wsService.selectTimeMinute = this.timesDropdown;
    this.wsService.selectScale = this.defaultScale;
  }
  async setChartOption() {
    // this.tokenSer.instrumentList = await this.wsService
    //   .fetch_full_instrumentList()
    //   .toPromise();
    let last_tick: any = await this.wsService
      .getlastTick(moment(new Date()).format('YYYY-MM-DD'))
      .toPromise();
    this.chartOptions = await this.tokenSer.findInstrument(
      last_tick[0].latestTradedPrice
    );
    this.chartDropdown = this.chartOptions[0].id;
  }
  // while changing token
  async selectChart(tokenNumber: number) {
    this.chartDropdown = tokenNumber;
    this.wsService.mergedArray = [];
    this.wsService.mergedObj = {};
    await this.wsService.closeSocket(true);
    d3.selectAll('svg.baseSVG').remove();
    this.wsService.renderSVG();
    $('#display_chart').css('display', 'none');
    $('#chart-spinner').css('display', 'block');
    $('.ohlc-group').css('display', 'none');
    this.getDataFromDB(this.modified_time);
  }
  async selectChange(dateEvent: any) {
    var element = document.getElementById('foreUnmergeBTN');
    if (element) {
      element.parentNode.removeChild(element);
    }
    this.wsService.mergedArray = [];
    this.wsService.mergedObj = {};

    $('#candlestick-container').css('display', 'none');
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
    $('#candlestick-container').css('display', 'block');
  }

  async changeScale(scaleEvent: any) {
    this.defaultScale = scaleEvent;
    this.wsService.selectScale = scaleEvent;
    this.wsService.updateScales();
  }
  modified_time: any = null;
  public async connect() {
    // ## Timezone calculation
    this.modified_time = new Date();
    this.modified_time.setHours(new Date().getUTCHours() + 5);
    this.modified_time.setMinutes(new Date().getUTCMinutes() + 30);

    //    Market Start Time
    this.MarketStartTime = new Date(this.modified_time);
    this.MarketStartTime.setHours(9);
    this.MarketStartTime.setMinutes(15);
    this.MarketStartTime.setSeconds(0);

    //    Market End Time
    this.MarketEndTime = new Date(this.modified_time);
    this.MarketEndTime.setHours(15);
    this.MarketEndTime.setMinutes(30);
    this.MarketEndTime.setSeconds(0);

    var currentTime = new Date(this.modified_time);

    // //date for params to get data from db
    var date: any;
    if (currentTime.getDay() == 0 || currentTime.getDay() == 6) {
      if (currentTime.getDay() == 6) {
        date = new Date(
          new Date(this.modified_time).setDate(
            new Date(this.modified_time).getDate() - 1
          )
        );
      } else if (currentTime.getDay() == 0) {
        date = new Date(
          new Date(this.modified_time).setDate(
            new Date(this.modified_time).getDate() - 2
          )
        );
      }
      this.getDataFromDB(date);
    } else if (
      currentTime.getDay() == 1 &&
      currentTime.getTime() < this.MarketStartTime.getTime()
    ) {
      date = new Date(
        new Date(this.modified_time).setDate(
          new Date(this.modified_time).getDate() - 3
        )
      );
      this.getDataFromDB(date);
    } else {
      if (currentTime.getTime() >= this.MarketEndTime.getTime()) {
        date = new Date(
          new Date(this.modified_time).setDate(
            new Date(this.modified_time).getDate()
          )
        );
        this.getDataFromDB(date);
      } else if (currentTime.getTime() < this.MarketStartTime.getTime()) {
        date = new Date(
          new Date(this.modified_time).setDate(
            new Date(this.modified_time).getDate() - 1
          )
        );
        const MST = this.MarketStartTime.getTime() - currentTime.getTime();
        setTimeout(() => {
          this.connect();
        }, MST);
        this.getDataFromDB(date);
      } else {
        date = moment(new Date(this.modified_time)).format('YYYY-MM-DD');
        // if (new Date(date).getDay() != 5) {
        //   this.wsService.weeklyIBdata(date);
        // }
        //15715074
        this.wsService
          .Instrument_ticks(
            this.chartDropdown,
            moment(new Date(this.modified_time)).format('YYYY-MM-DD')
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
                  this.wsService.tick_token = this.chartDropdown;
                  this.wsService.socketBool = true;
                  this.wsService.createIndexed_db(data);
                  data = null;
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
              this.logger.error(`ERROR IN option live PAGE : ${err.message}`);
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
    this.wsService.Instrument_ticks(this.chartDropdown, date).subscribe(
      async (data: any) => {
        if (data.length > 1) {
          this.wsService.tick_token = this.chartDropdown;
          this.wsService.createIndexed_db(data);
          data = null;
        } else {
          this.getDataFromDB(
            new Date(new Date(date).setDate(new Date(date).getDate() - 1))
          );
        }
      },
      (err) => {
        this.callBackError(err.message);
        this.logger.error(`ERROR IN option live PAGE : ${err.message}`);
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
