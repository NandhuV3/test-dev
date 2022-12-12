import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import * as moment from 'moment';
import { DRangeService } from 'src/app/charts/d-range/D-Range.service';
import { ReferenceService } from 'src/app/mainService _file/referenceService';
declare const $: any;

@Component({
  selector: 'app-d-range',
  templateUrl: './d-range.component.html',
  styleUrls: ['./d-range.component.scss'],
})
export class DRangeComponent implements OnInit, OnDestroy {
  constructor(
    private elementRef: ElementRef,
    private RangeService: DRangeService,
    private ReferenceService: ReferenceService
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0f162e';
    this.RangeService.indexDB_Name = this.indexDB_Name;
  }

  @HostListener('window:beforeunload') async onBeforeUnload() {
    await this.RangeService.closeSocket();
  }

  ngOnInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0f162e';
    this.DisplayRange();
  }
  indexDB_Name: string = 'ROC_vwap';
  isLoading: boolean = false;
  displaytext: string = '';
  socketConnected: boolean = false;
  currentDay: any = [];
  previousDay: any = [];
  range: number = 0;

  timesDropdown: number = 5;
  timesOptions = [
    { id: 5, name: '5min' },
    { id: 15, name: '15min' },
    { id: 30, name: '30min' },
    { id: 60, name: '1hour' },
  ];

  async DisplayRange() {
    this.RangeService.indexDB_Name = this.indexDB_Name;
    this.isLoading = true;
    let date = moment(new Date()).format('YYYY-MM-DD');

    // current date
    this.currentDay = await this.ReferenceService.get_single_data([
      date,
      'first',
    ]);
    if (this.currentDay.length == 0) {
      this.currentDay = await this.ReferenceService.get_single_data([
        date,
        'second',
      ]);
      this.currentDay = this.currentDay[0];
      date = moment(new Date(this.currentDay.date)).format('YYYY-MM-DD');
    } else {
      this.currentDay = this.currentDay[0];
    }

    //last date
    let prev: any = await this.ReferenceService.get_single_data([
      date,
      'second',
    ]);
    this.previousDay = prev[0];

    this.RangeService.previousDay = this.previousDay;
    this.isLoading = false;
    //data recieved , calculations starts

    //first check the current open is between previous day VA_vah and VA_Val
    //if true display a text

    //else check the current price is between previous day high and low
    setTimeout(async () => {
      if (
        this.currentDay['ohlc'].open < this.previousDay['ohlc'].high &&
        this.currentDay['ohlc'].open > this.previousDay['ohlc'].low
      ) {
        this.RangeService.withInRange = true;
        this.displaytext = 'open within range';
      } else {
        this.RangeService.withInRange = false;
        this.displaytext = 'open out of range';
      }
      if (this.RangeService.withInRange) {
        $('.valueType').css('display', 'block');
        if (
          this.currentDay['ohlc'].open < this.previousDay['valueArea'].vah &&
          this.currentDay['ohlc'].open > this.previousDay['valueArea'].val
        ) {
          $('#openvalue').text('Open within Value');
          this.RangeService.outSideRange = false;
          this.RangeService.withInValue = true;
        } else {
          // $('#openvalue').text('open outside value');
          $('#openvalue').text('Open Outside Value Within Range');
          this.RangeService.outSideRange = true;
          this.RangeService.withInValue = false;
        }
      } else {
        $('#openvalue').text('Undefined');
      }
      // // //if open within range
      if (this.RangeService.withInRange) {
        this.RangeService.range =
          this.previousDay['ohlc'].high - this.previousDay['ohlc'].low;
        }

        // last 14 days first 15 min
      let last_14_days_First15min: any =
        await this.ReferenceService.getlast_14_days_first15min()

      // last 14 days total volume
      let last_14_days_totalVolume: any =
        await this.ReferenceService.getlast_14_days_totalVolume()

      // day full data
      let fulldata: any = await this.ReferenceService.get_oneDay_full_data(
        moment(new Date(this.currentDay.date)).format('YYYY-MM-DD')
      );

      if (fulldata.length > 0) {
        this.RangeService.chartData = fulldata;
        if (new Date().getDay() >= 1 && new Date().getDay() <= 5) {
          this.RangeService.fetchTodayData(last_14_days_First15min,last_14_days_totalVolume);
          fulldata = null;
          last_14_days_First15min = null;
          last_14_days_totalVolume = null;
        } else {
          this.RangeService.fetchTodayData(last_14_days_First15min,last_14_days_totalVolume);
          fulldata = null;
          last_14_days_First15min = null;
          last_14_days_totalVolume = null;
        }
      }
    }, 500);
  }

  async ngOnDestroy() {
    await this.RangeService.closeSocket();
  }
}
