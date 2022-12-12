import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import * as moment from 'moment-timezone';
import * as d3 from 'd3';
import { NGXLogger } from 'ngx-logger';
import { SocketService } from '../../mainService _file/socket.service';
declare var $: any;
@Component({
  selector: 'app-tick-chart',
  templateUrl: './tick-chart.component.html',
  styleUrls: ['./tick-chart.component.scss'],
})
export class TickChartComponent implements OnInit, OnDestroy {
  dateChangeLoading: boolean = false;
  timeErr: boolean = false;
  MarketEndTime: any;
  chartErr: boolean = false;
  showTime_set_btn: boolean = false;
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
  timesDropdown = 5;
  // 5m , 15m, 30m, 1h, 1 day
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
  indexDB_Name: string = 'tickChart';
  timeErrMsg: string = '';

  constructor(
    private wsService: SocketService,
    private elementRef: ElementRef,
    private logger: NGXLogger
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0f162e';
  }
  backendData: any = [];
  tableValues: any = [];
  ngOnInit() {
    this.wsService.containerID = 'candlestick';
    this.wsService.indexDB_Name = this.indexDB_Name;
    this.wsService.renderSVG();
    this.connect();
    this.wsService.selectTimeMinute = this.timesDropdown;
    this.wsService.selectScale = this.defaultScale;
  }
  @HostListener('window:beforeunload') onBeforeUnload() {
    this.wsService.closeSocket(true);
  }
  setTime() {
    this.showTime_set_btn = true;
  }
  setTime_chart() {
    this.showTime_set_btn = false;
    let time = $('#setTimeInput').val();
    let splitTime = time.split(':');
    let hr: number = Number(splitTime[0]);
    let min: number = Number(splitTime[1]);
    if (hr >= 9 && hr <= 15) {
      if (hr == 9 || hr == 15) {
        if (hr == 9) {
          if (min < 15) {
            return this.showTimeErr();
          }
        }
        if (hr == 15) {
          if (min > 29) {
            return this.showTimeErr();
          }
        }
      }
      if (this.timesDropdown == 30 && !(min == 15) && !(min == 45)) {
        if (hr == 15 && min > 15 && min < 29) {
          min = 15;
        } else {
          min = 15;
        }
      } else if (this.timesDropdown == 60 && !(min == 15)) {
        if (hr == 15 && min > 15 && min < 29) {
          min = 15;
        } else {
          min = 15;
        }
      } else if (this.timesDropdown == 15) {
        if (hr == 15 && min > 15 && min < 29) {
          min = 15;
        } else {
          let round = 15 * Math.ceil(min / 15);
          if (round == 60) {
            min = 45;
          } else {
            min = round;
          }
        }
      } else if (this.timesDropdown == 5) {
        if (hr == 15 && min > 15 && min < 29) {
          min = 15;
        } else {
          let round = 5 * Math.ceil(min / 5);
          if (round == 60) {
            min = 55;
          } else {
            min = round;
          }
        }
      }
      this.wsService.set_timer(`${hr}:${min}`);
      // return `${hr}:${min}`
    } else {
      return this.showTimeErr();
    }
  }
  showTimeErr() {
    this.timeErr = true;
    this.timeErrMsg = `Please enter time between 09:15 to 15:29`;
    setTimeout(() => {
      this.timeErr = false;
    }, 5000);
  }
  //while changing interval
  selectChange(dateEvent: any) {
    var element = document.getElementById('foreUnmergeBTN');
    if (element) {
      element.parentNode.removeChild(element);
    }

    this.wsService.mergedArray = [];
    this.wsService.mergedObj = {};
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
    this.wsService.getDataFrom_Indexed_DB();
  }

  //while changing scale
  changeScale(scaleEvent: any) {
    this.defaultScale = scaleEvent;
    this.wsService.selectScale = scaleEvent;
    this.wsService.updateScales();
  }
  //while changing date
  async onDateChange(date: string) {
    $('#candlestick-container').css('display', 'none');
    $('#chart-spinner').css('display', 'block');
    this.wsService.clear_indexed_DB();
    d3.selectAll('svg.baseSVG').remove();
    await this.wsService.closeSocket(true);
    this.wsService.renderSVG();
    this.getDataFromDB(date);
  }
  async connect() {
    let modified_time = new Date();
    modified_time.setHours(new Date().getUTCHours() + 5);
    modified_time.setMinutes(new Date().getUTCMinutes() + 30);
    var currentTime = new Date(modified_time);
    this.MarketEndTime = new Date(modified_time);
    this.MarketEndTime.setHours(15);
    this.MarketEndTime.setMinutes(30);
    this.MarketEndTime.setSeconds(0);
    var date: any = null;

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
    } else if (currentTime.getDay() == 1) {
      if (currentTime.getTime() < this.MarketEndTime.getTime()) {
        date = new Date(
          new Date(modified_time).setDate(new Date(modified_time).getDate() - 3)
        );
      } else {
        date = new Date(modified_time);
      }
    } else {
      if (currentTime.getTime() >= this.MarketEndTime.getTime()) {
        date = new Date(modified_time);
      } else {
        date = new Date(
          new Date(modified_time).setDate(new Date(modified_time).getDate() - 1)
        );
      }
    }
    this.getDataFromDB(date);
  }
  getDataFromDB(date: any) {
    date = moment(date).format('YYYY-MM-DD');
    if (new Date(date).getDay() != 5) {
      this.wsService.weeklyIBdata(date);
    }
    this.wsService.dataForCandlestick(date).subscribe(
      async (data: any) => {
        if (data.length > 1) {
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
        this.logger.error(`ERROR IN TICK PAGE : ${err.message}`);
      }
    );
  }
  callBackError(message: any) {
    this.chartErrMsg = message;
    this.chartErr = true;
  }
  ngOnDestroy(): void {
    this.wsService.closeSocket(true);
  }
}
