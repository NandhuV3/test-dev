import { Injectable } from '@angular/core';
declare const $: any;
import { AppComponent } from '../../app.component';
import * as d3 from 'd3';
import { CommonService } from 'src/app/mainService _file/common.service';

@Injectable({
  providedIn: 'root',
})
export class DRangeService {
  constructor(
    private $appCom: AppComponent,
    private commonSer: CommonService
  ) {}

  estimateRange1: number = 0;
  estimateRange2: number = 0;
  socketConnected: boolean = false;
  withInRange: boolean = false;
  withInValue: boolean = false;
  previousDay: any = [];
  range: number = 0;
  outSideRange: boolean = false;

  vwapChange: number = 0;
  first: Number = null;
  second: Number = null;
  f_vwap: number = 0;
  s_vwap: number = 0;
  volumeChart: boolean = false;

  width = 240;
  height = 105;
  margin = { top: 10, bottom: 20, left: 30, right: 50 };
  innerWidth = this.width - this.margin.left - this.margin.right;
  innerHeight = this.height - this.margin.top - this.margin.bottom;
  rrrr: boolean = false;
  chartData: any = [];

  updateTimeDateRange() {
    $('#ROC_vwap5').css('display', 'block');
    $('#ROC_vwap30').css('display', 'block');

    const dates = this.chartData.map((d: any) => {
      d.date = new Date(d.date);
      return d.date;
    });

    let xMin = d3.min(dates).valueOf();
    let xMax = d3.max(dates).valueOf();

    let minDate: any = new Date(xMin);
    let maxDate = new Date(xMax);

    maxDate.setSeconds(0);
    maxDate.setMilliseconds(0);
    maxDate.setMinutes(maxDate.getMinutes() + 1);

    let array1 = d3.timeMinute
      .range(minDate, maxDate, 5)
      .map((d: any) => d.valueOf());
    let array2 = d3.timeMinute
      .range(minDate, maxDate, 30)
      .map((d: any) => d.valueOf());

    let main_arr_5 = this.get_modified_mainData(5, array1);
    let main_arr_30 = this.get_modified_mainData(30, array2);

    let arr = ['#ROC_vwapChart5', '#ROC_vwapChart30'];
    this.createChart(main_arr_5, arr[0]);
    this.createChart(main_arr_30, arr[1]);
  }
  get_modified_mainData(num: number, array: any) {
    let main_arr: any = [];
    let count = 0;
    for (let i = 0; i < array.length; i++) {
      let date = array[i];
      let hours: string = new Date(date).getHours().toString();
      let minutes: string = new Date(date).getMinutes().toString();
      if (hours.length == 1) {
        hours = '0' + hours;
      }
      if (minutes.length == 1) {
        minutes = '0' + minutes;
      }
      // ! count += 15 in 30 mins interval because we calculating ROC vwap with every 2 minutes so 30 / 2 = 15;
      if (this.ROC_arr[count] != undefined) {
        main_arr.push({
          time: `${hours} : ${minutes}`,
          value: this.ROC_arr[count].toFixed(2),
        });
      }
      count += Math.floor(num / 2);
    }
    count = null;

    return main_arr;
  }

  createChart(main_arr: any, id: string) {
    // remove chart

    $(`${id}`).empty();

    let color = 'red';
    if (id == '#ROC_vwapChart30') {
      color = '#425af5';
    }

    //width
    let width = main_arr.length * 12;
    if (width < 60) {
      width = 60;
    }
    let height = 180;

    // update scales
    //x scale
    const x = d3
      .scaleBand()
      .domain(main_arr.map((d: any) => d.time))
      .range([this.margin.left, width * 6 - this.margin.right]);
    //x Axis
    const xAxis = (g) =>
      g
        .attr('transform', `translate(${0},${height - this.margin.bottom})`)
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .call(d3.axisBottom(x).tickSizeOuter(0));

    //yscale
    const y = d3
      .scaleLinear()
      .domain(d3.extent(main_arr, (d: any) => Number(d.value)))
      .range([height - this.margin.bottom, this.margin.top])
      .nice();
    //yAxis

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${this.margin.left},0)`)
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .call(d3.axisLeft(y).ticks(6));
    //
    const minX = x(main_arr[0].time);
    const maxX = x(main_arr[main_arr.length - 1].time);
    const overwidth = maxX - minX + this.margin.left + this.margin.right + 80;

    // create chart

    const parent = d3.select(id);
    parent
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('z-index', 1)
      .call((svg: any) => svg.append('g').call(yAxis));

    const body = parent
      .append('div')
      .attr('class', 'emt-div')
      .style('overflow-x', 'scroll')
      .style('-webkit-overflow-scrolling', 'touch');

    body
      .append('svg')
      .attr('width', overwidth)
      .attr('height', height)
      .attr('class', 'vwapLine')
      .style('display', 'block')
      .call((svg: any) => svg.append('g').call(xAxis))
      // .call((svg: any) => svg.append('g').call(yAxis))
      .append('path')
      .datum(main_arr)
      .attr('class', 'vwapLine')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('transform', `translate(${this.margin.left},0)`)
      .attr('stroke-width', 1)
      .attr(
        'd',
        d3
          .line()
          .x((d: any) => {
            return x(d.time);
          })
          .y((d: any) => {
            return y(d.value);
          })
      );
  }
  display_day_totalVolume(current: any, old: any) {
    let data = [
      // { name: 'OpenVolume', value: current },
      { name: 'DAY-VOL', value: current },
      { name: 'T_VOL-AVG', value: old },
    ];
    this.get_chart('totalVolume_Chart', data);
    data = null;
  }
  display_day_valueArea(current: any, old: any) {
    let data = [
      // { name: 'OpenVolume', value: current },
      { name: 'DAY-VA', value: current },
      { name: 'T_VA-AVG', value: old },
    ];
    this.get_chart('ValueArea_Chart', data);
    data = null;
  }
  display_first15min_volume(current: any, old: any) {
    let data = [
      // { name: 'OpenVolume', value: current },
      { name: 'OPEN-VOL', value: current },
      { name: 'REF-AVG', value: old },
    ];
    this.get_chart('first15minChart', data);
    data = null;
  }

  get_chart(chart: string, data: any) {
    d3.select(`#${chart} svg.graph`).remove();
    const svg = d3
      .select(`#${chart}`)
      .append('svg')
      .attr('class', 'graph')
      //  .attr('width','100%')
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr(
        'viewBox',
        '-65 0 ' +
          (this.width + this.margin.left + this.margin.right) +
          ' ' +
          (this.height + this.margin.top + this.margin.bottom)
      );
    //
    //grouping
    const g = svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    //scale
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.value)])
      .rangeRound([0, this.innerWidth])
      .clamp(true)
      .nice();
    const XaxisTickFormat = (number: number) =>
      d3.format('.2s')(number).replace('G', 'B');
    const xA = d3.axisBottom(x).ticks(5).tickFormat(XaxisTickFormat);
    g.append('g')
      .call(xA)
      .attr('transform', `translate(0,${this.innerHeight})`);
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([this.innerHeight, 0])
      .padding(0.5);
    const yA = d3.axisLeft(y);
    g.append('g').call(yA);
    //creating the rect bar
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bartext')
      .attr('y', (d) => y(d.name))
      .attr('width', (d) => x(d.value))
      .attr('height', y.bandwidth())
      .attr('font-family', 'san-serif')
      .append('title')
      .text((d) => d.value);
    // .attr('fill','aqua');
    d3.selectAll('.bartext .tick text').attr('fill', 'black');
  }

  avg_14_first15min: number = null;
  avg_14_totalVolume: number = null;
  avg_14_valueArea: number = null;

  async fetchTodayData(d_15min: any, d_totalVolume: any) {
    let modified_time = new Date();
    modified_time.setHours(new Date().getUTCHours() + 5);
    modified_time.setMinutes(new Date().getUTCMinutes() + 30);
    let currentDate = new Date(modified_time);
    let startTime = new Date(modified_time);
    let endTime = new Date(modified_time);
    let first15 = new Date(modified_time);
    startTime.setHours(9);
    startTime.setMinutes(15);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    endTime.setHours(15);
    endTime.setMinutes(30);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);
    first15.setHours(9);
    first15.setMinutes(30);
    first15.setSeconds(0);
    first15.setMilliseconds(0);
    if (currentDate.getTime() > first15.getTime()) {
      this.first15_Reached = true;
    }

    if (this.chartData.length > 0) {
      if (this.withInRange) {
        $('.priceStatus').css('display', 'block');
        $('.dayPosibilities').css('display', 'block');
        $('.priceEntered').css('display', 'block');
      }
      this.chartData.forEach((d: any) => {
        this.alterVwapChangefunc(d);
        if (this.withInRange) {
          this.alterdata(d);
        }
      });
      this.updateTimeDateRange();

      if (d_15min.length != 0 && d_totalVolume.length != 0) {
        this.volumeChart = true;
        $('#first15min').css('display', 'block');
        $('#d-totalVolume').css('display', 'block');
        $('#d-ValueArea').css('display', 'block');
        this.avg_14_first15min = Number(
          (
            d3.sum(d_15min, (d: any) => d.total_volume) / d_15min.length
          ).toFixed(2)
        );
        this.avg_14_totalVolume = Number(
          (
            d3.sum(d_totalVolume, (d: any) => d.total_volume) /
            d_totalVolume.length
          ).toFixed(2)
        );
        this.avg_14_valueArea = Number(
          (
            d3.sum(
              d_totalVolume,
              (d: any) => d['valueArea'].vah - d['valueArea'].val
            ) / d_totalVolume.length
          ).toFixed(2)
        );
        let lastEle: any = this.chartData.slice(-1)[0];

        this.display_first15min_volume(
          lastEle['first15MinProfile'].volume,
          this.avg_14_first15min
        );
        this.display_day_valueArea(
          lastEle['valueArea'].vah - lastEle['valueArea'].val,
          this.avg_14_valueArea
        );
        this.display_day_totalVolume(
          lastEle.total_volume,
          this.avg_14_totalVolume
        );
        lastEle = null;
      }
      if (this.withInRange) {
        $('#estimateRange1').text(
          `Range 1 : ${this.estimateRange1.toFixed(2)}`
        );
        $('#estimateRange2').text(
          `Range 2 : ${this.estimateRange2.toFixed(2)}`
        );
      }
      if (Math.sign(this.vwapChange) == -1) {
        $('#rate-value').removeClass('positiveRate');
        $('#rate-value').addClass('negativeRate');
      } else {
        $('#rate-value').removeClass('negativeRate');
        $('#rate-value').addClass('positiveRate');
      }
      $('#rate-spinner').css('display', 'none');
      $('#rate-value').css('display', 'block');
      $('#rate-value').text(Number(this.vwapChange.toFixed(2)));

      if (
        new Date(modified_time).getDay() <= 5 &&
        new Date(modified_time).getDay() >= 1
      ) {
        if (
          currentDate.getTime() > startTime.getTime() &&
          currentDate.getTime() < endTime.getTime()
        ) {
          this.connectSocket(this.commonSer.vpoc_valueArea(this.chartData));
        }
      }
    }
  }

  ROC_arr: any = [];
  ROC_vwap: number = null;
  alterVwapChangefunc(d: any) {
    if (this.first == null) {
      this.first = new Date(d.date).getMinutes();
      this.f_vwap = Number(d.vwap);
    }
    if (this.first != null && this.second == null) {
      if (new Date(d.date).getMinutes() != this.first) {
        this.f_vwap -= Number(d.vwap);
        this.second = new Date(d.date).getMinutes();
        this.s_vwap = Number(d.vwap);
      }
    }
    if (this.first != null && this.second != null) {
      if (new Date(d.date).getMinutes() != this.second) {
        this.s_vwap -= Number(d.vwap);
        this.vwapChange += (this.s_vwap - this.f_vwap) / 2;
        this.ROC_vwap += this.s_vwap - this.f_vwap;

        this.ROC_arr.push(this.ROC_vwap);
        this.first = new Date(d.date).getMinutes();
        this.f_vwap = Number(d.vwap);
        this.second = null;
        this.s_vwap = 0;
      }
    }
  }

  socket_ID: any = null;
  first15_Reached: boolean = false;

  async connectSocket(array: any) {
    let currentMin: number =
      5 * Math.floor(new Date(array.slice(-1)[0].date).getMinutes() / 5);

    if (this.socketConnected) {
      await this.closeSocket();
    }
    await this.$appCom.connectSocket();
    let dummyArr = [];
    this.$appCom.socket.emit('candle-data', array);
    this.$appCom.socket.on('candle-ticks', async (data: any) => {
      this.chartData.push(data);

      let minute = 5 * Math.floor(new Date(data.date).getMinutes() / 5);

      if (currentMin != minute) {
        dummyArr.push(data);
        if (dummyArr.length > 3) {
          dummyArr = [];
          currentMin = minute;
          this.updateTimeDateRange();
          if (this.volumeChart) {
            this.display_day_totalVolume(
              data.total_volume,
              this.avg_14_totalVolume
            );
          }
        }
      }

      this.socketConnected = true;

      this.alterVwapChangefunc(data);

      if (this.volumeChart) {
        if (!this.first15_Reached) {
          this.display_first15min_volume(
            data['first15MinProfile'].volume,
            this.avg_14_first15min
          );
        }
        this.display_day_valueArea(
          data['valueArea'].vah - data['valueArea'].val,
          this.avg_14_valueArea
        );
      }

      //show text
      $('#rate-value').text(Number(this.vwapChange.toFixed(2)));
      //color the text
      if (Math.sign(this.vwapChange) == -1) {
        $('#rate-value').removeClass('positiveRate');
        $('#rate-value').addClass('negativeRate');
      } else {
        $('#rate-value').removeClass('negativeRate');
        $('#rate-value').addClass('positiveRate');
      }
      if (this.withInRange) {
        this.alterdata(data);
      }
    });
  }
  indexDB_Name: string = null;

  alterdata(data: any) {
    this.estimateRange1 = data['ohlc'].high - this.range;
    this.estimateRange2 = data['ohlc'].low + this.range;
    let priceInside =
      data.latestTradedPrice < this.previousDay['valueArea'].vah &&
      data.latestTradedPrice > this.previousDay['valueArea'].val;
    $('#estimateRange1').text(`Range 1 : ${this.estimateRange1.toFixed(2)}`);
    $('#estimateRange2').text(`Range 2 : ${this.estimateRange2.toFixed(2)}`);
    // if the price open outside and later enter into previous vah and val Display " “Price inside Prev Value "
    // todo : if the price "inside" the prev day value area
    if (priceInside) {
      $('#blink').text('Price inside Prev Value');
      this.withInValue = true;
      this.outSideRange = false;
      $('#blink').addClass('blink_me');
    } else {
      // todo : if the price "outside" the prev day value area
      $('#blink').removeClass('blink_me');
      this.withInValue = false;
      this.outSideRange = true;
      $('#blink').text('outside previous value');
    }
    if (this.outSideRange) {
      // todo : if the price moved out from "above" prev day value area
      if (data.latestTradedPrice > this.previousDay['valueArea'].vah) {
        $('#aboveBelow').text('Price Moving upside from previous value');
        this.outSideRange = true;
        this.withInValue = false;
      } else if (data.latestTradedPrice < this.previousDay['valueArea'].val) {
        // todo : if the price moved out from "below" prev day value area
        $('#aboveBelow').text('Price Moving downside from previous value');
        this.outSideRange = true;
        this.withInValue = false;
      }
    } else {
      // todo : if the price entered from "above" prev day value area
      if (
        data.latestTradedPrice < this.previousDay['valueArea'].vah &&
        data.latestTradedPrice > this.previousDay['valueArea'].vah - 15
      ) {
        $('#aboveBelow').text('Price entered from above VAH');
        this.outSideRange = false;
        this.withInValue = true;
      } else if (
        data.latestTradedPrice > this.previousDay['valueArea'].val &&
        data.latestTradedPrice < this.previousDay['valueArea'].val + 15
      ) {
        // todo : if the price entered from "below" prev day value area
        $('#aboveBelow').text('Price entered from below VAL');
        this.outSideRange = false;
        this.withInValue = true;
      }
    }
  }

  async closeSocket() {
    await this.$appCom.closeSocket('candlestick');
    this.socketConnected = false;
    return '';
  }
}

//Open Outside Value Within Range

//notes

// for ohlc
//Display - if Open in OhLC is within previous day range (between high and low ) then display open within range

//If not open out of range

//for prevday value area vah val

//if the open is between prevVah and PrevVal .. display as Open within Value
//If not put open outside value

//for both ohlc and value area

//if outside value and within range - put Open Outside Value Within Range

//Next .. if open is outside value .. and later the price comes into yesterday value are (between VAH & VAL) then we need to display “Price inside Prev Value” and this needs to be blinking

//Reverse if open is inside value and price moving outside ..we need “ Price Moving outside previous value”

//Outside can be above VAH or below VAL

//totally five works

//check
//    1. opens within range
//    2. opens out of range
//    3. opens within value
//    4. opens outside of value
//    5. opens within range  and outside the value
//    6. Price inside Prev Value
//    7. Price Moving outside previous value
//  if price comes from outside value check
//    8. the price comes from above vah or from below val
