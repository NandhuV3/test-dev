import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { AppComponent } from '../app.component';
import { CommonService } from './common.service';
const BACKEND_URL = environment.apiUrl + '/api/';
declare const $: any;

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor(
    private http: HttpClient,
    private $appCom: AppComponent,
    private commonSer: CommonService
  ) {
    this.fetchLabels();
  }

  weeklyIB_Obj: boolean = false;
  minMinute: number = null;
  timeOption: any = [];
  audio: any = new Audio('./assets/alertTone/HighAlert.mp3');
  //indexed db
  indexDB_Name: string = '';

  //temporary
  dummyData: any = [];
  vahvalValue: any = {};
  // ## only for ib family
  ibHTimer: number = 0;
  ibLTimer: number = 0;
  ibHWTimer: number = 0;
  ibLWTimer: number = 0;
  db_wib_h: number = 0;
  db_wib_l: number = 0;
  max_ohlc: number = 0;
  min_ohlc: number = 0;
  //
  socketConnected: boolean = false;
  socketBool: boolean = false;
  emptyFinalObj: boolean = false;
  //
  ibStartTime: any;
  ibAfterFirst5hr: any;
  margin = { top: 30, right: 110, bottom: 40, left: 90 };
  containerID: string = '';
  // chartData: any[] = [];
  width: number = 0;
  height: number = 0;
  baseSVG: any = null;
  svgGroup: any = null;
  zoom = d3.zoom();
  focus: any = null;
  textR: any = null;
  textL: any = null;
  xAxisG: any = null;
  yAxisG: any = null;
  xMin: any = null;
  xMax: any = null;
  xScale: any = null;
  xDateScale = d3.scaleQuantize();
  xBand = d3.scaleBand();
  xAxis = d3.axisBottom();
  vScaleX: any;
  vScaleY: any;
  selectScale: number;
  sideBar: boolean = false;

  yMin: any = null;
  yMax: any = null;
  yScale = d3.scaleLinear();
  yAxis = d3.axisLeft();
  chartBody: any = null;
  tableG: any = null;
  tableBody: any = null;
  tableHeader: any = null;
  parseDate = d3.timeFormat('%Y-%m-%d').parse;
  selectTimeMinute: any = null;
  timeRangeData = [];
  perBarWidth = 192;
  // perBarWidth = 230;
  barTextWith = 80;
  // barTextWith = 100;
  barWidth = 10;
  // tableHeight = 400;
  tableHeight = 180;
  yStep = 0;
  filterData: any = {};
  barHeight = 150;
  xScaleZ = d3.scaleLinear();
  tooltip: any = null;
  formatMillisecond = d3.timeFormat('.%L ms');
  formatSecond = d3.timeFormat('%M:%S m');
  formatMinute = d3.timeFormat('%I:%M:%S');
  formatHour = d3.timeFormat('%I %p');
  formatDay = d3.timeFormat('%a %d %b');
  formatWeek = d3.timeFormat('%b %d');
  formatMonth = d3.timeFormat('%B');
  formatYear = d3.timeFormat('%Y');
  y: any;

  istep: number = 0;
  sideX: any;
  sideY: any;

  //sockets credentials
  get_socket_id: string = null;
  get_candle_token_ID: string = null;
  post_candle_token: string = null;
  receive_candle_token: string = null;

  // Define filter conditions
  multiFormat = (date: any) => {
    return (
      d3.timeSecond(date) < date
        ? this.formatMillisecond
        : d3.timeMinute(date) < date
        ? this.formatSecond
        : d3.timeHour(date) < date
        ? this.formatMinute
        : d3.timeDay(date) < date
        ? this.formatHour
        : d3.timeMonth(date) < date
        ? d3.timeWeek(date) < date
          ? this.formatDay
          : this.formatWeek
        : d3.timeYear(date) < date
        ? this.formatMonth
        : this.formatYear
    )(date);
  };

  dataForCandlestick(date: any) {
    return this.http.post(BACKEND_URL + 'chart-data', { date });
  }
  getlastTick(date: any) {
    return this.http.post(BACKEND_URL + 'last-tick', { date });
  }
  Instrument_ticks(token: number, date: any) {
    return this.http.post(BACKEND_URL + 'getSpecifiedToken', { token, date });
  }
  fetch_full_instrumentList() {
    return this.http.post(BACKEND_URL + 'instrument-list', {});
  }
  weeklyIBdata(date: any) {
    this.http.post(BACKEND_URL + 'weeklyIB_Timer', { date }).subscribe(
      (data: any) => {
        if (data.length > 0) {
          this.db_wib_h = data[0].weeklyIB_high;
          this.db_wib_l = data[0].weeklyIB_low;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  lablesList: any[];
  fetchLabels() {
    this.http.post(BACKEND_URL + 'getLabels', {}).subscribe(
      (data: any) => {
        if (data.length > 0) {
          this.lablesList = data;
          data.forEach((d: any) => {
            if (d.AlertStatus == 'offslider') {
              this.blinkedPrices.push(d);
            }
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  toggleFunction: boolean = false;
  toggleEvent() {
    var content = document.getElementById('content');
    if (this.toggleFunction == false) {
      content.requestFullscreen();
      this.toggleFunction = true;
    } else {
      this.toggleFunction = false;
      document.exitFullscreen();
    }
  }
  renderSVG() {
    const container: any = document.getElementById(this.containerID);
    // this.width = container.offsetWidth - this.margin.left - this.margin.right;
    this.width = container.offsetWidth;
    this.height = container.offsetHeight - this.margin.top - this.margin.bottom;

    this.baseSVG = d3
      .select('#' + this.containerID + '-container')
      .on('dblclick', (d) => this.toggleEvent())
      .append('svg')
      .attr('class', 'baseSVG')
      .attr('fill', 'transparent')
      .attr('width', this.width)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .style('display', 'flex')
      .style('width', '100%')
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr('viewBox', '0 0 ' + this.width + ' ' + this.height);
    this.tooltip = d3.select('#tooltip');
    this.svgGroup = this.baseSVG
      .append('g')
      .attr('class', 'mainGroup')
      .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

    const extent = [
      [0, 0],
      [this.width, this.height - this.tableHeight],
    ];

    this.zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent(extent)
      .extent(extent)
      .on('zoom.start', this.zoomStart)
      .on('zoom', this.zoomed)
      .on('zoom.end', this.zoomEnd);

    this.focus = this.svgGroup
      .append('g')
      .attr('class', 'focus')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
    this.tableG = this.svgGroup
      .append('g')
      .attr('class', 'tableG')
      .attr(
        'transform',
        'translate(' +
          this.margin.left +
          ',' +
          (this.height - this.tableHeight + this.margin.bottom + 10) +
          ')'
      );
    this.tableG
      .append('rect')
      .attr('id', 'rect')
      .attr('width', this.width - this.margin.left - this.margin.right)
      .attr('height', this.tableHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('clip-path', 'url(#tableClip)');
    this.tableHeader = this.tableG
      .append('g')
      .attr('id', 'tableHeader')
      .attr(
        'transform',
        'translate(' +
          (this.width - this.margin.left - this.margin.right) +
          ',0)'
      );
    var verticalLine = this.focus
      .append('line')
      .attr('opacity', 0)
      .attr('y1', 0)
      .attr('y2', this.height - this.tableHeight)
      .attr('stroke', 'white')
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-width', 1);
    // .attr('pointer-events', 'none');

    var horizontalLine = this.focus
      .append('line')
      .attr('opacity', 0)
      .attr('x1', 0)
      .attr('x2', this.width - this.margin.left - this.margin.right)
      .attr('stroke', 'white')
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-width', 1);
    // .attr('pointer-events', 'none');
    this.focus
      .append('rect')
      .attr('id', 'rect')
      .attr('class', 'hair')
      .attr('width', this.width - this.margin.left - this.margin.right)
      .attr('height', this.height - this.tableHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .style('cursor', 'crosshair')
      .attr('clip-path', 'url(#clip)')
      .on('dblclick', () => this.toggleEvent())
      .on('mousemove', function () {
        let mouse = d3.mouse(this),
          mousex = mouse[0],
          mousey = mouse[1];
        verticalLine.attr('x1', mousex).attr('x2', mousex).attr('opacity', 1);
        horizontalLine.attr('y1', mousey).attr('y2', mousey).attr('opacity', 1);
      })
      .on('mouseout', function () {
        verticalLine.attr('opacity', 0);
        horizontalLine.attr('opacity', 0);
      });
    this.xAxisG = this.focus
      .append('g')
      .attr('class', 'xAxis')
      .attr('transform', `translate(0,${this.height - this.tableHeight})`);

    this.yAxisG = this.focus
      .append('g')
      .attr('class', 'yAxis')
      .attr(
        'transform',
        `translate(${this.width - this.margin.right - this.margin.left},0)`
      );

    this.textR = this.focus
      .append('g')
      .attr('class', 'rightGroup')
      .attr('height', this.height - this.tableHeight)
      .attr(
        'transform',
        `translate(${this.width - this.margin.right - this.margin.left},0)`
      )
      .attr('clip-path', 'url(#clip)');
    this.textL = this.focus
      .append('g')
      .attr('class', 'leftGroup')
      .attr('height', this.height - this.tableHeight)
      .attr('transform', `translate(${0 - 145},0)`)
      .attr('clip-path', 'url(#clip)');

    this.chartBody = this.focus
      .append('g')
      .attr('class', 'chartBody')
      .attr('clip-path', 'url(#clip)');
    this.tableBody = this.tableG
      .append('g')
      .attr('class', 'tableBody')
      .attr('clip-path', 'url(#tableClip)');
  }

  updateTimeDateRange(chartData: any) {
    const dates = chartData.map((d: any) => {
      d.date = new Date(d.date);
      this.updateIBTimer(d);
      return d.date;
    });

    this.xMin = d3.min(dates).valueOf();
    this.xMax = d3.max(dates).valueOf();

    let minDate: any = new Date(this.xMin);
    //
    minDate.setMinutes(5 * Math.floor(minDate.getMinutes() / 5));
    minDate.setSeconds(0);
    minDate.setMilliseconds(0);

    //find minMinte
    this.minMinute = minDate.getMinutes();

    let maxDate = new Date(this.xMax);

    maxDate.setMinutes(maxDate.getMinutes() + 1);
    maxDate.setSeconds(0);
    maxDate.setMilliseconds(0);

    if (this.selectTimeMinute <= 15) {
      this.timeRangeData = d3.timeMinute.range(
        minDate,
        maxDate,
        this.selectTimeMinute
      );
    } else if (this.selectTimeMinute == 30) {
      this.timeRangeData = d3.timeMinute.range(
        minDate,
        maxDate,
        this.selectTimeMinute
      );
    } else if (this.selectTimeMinute == 60) {
      minDate.setSeconds(0);
      if (maxDate.getMinutes() < this.minMinute) {
        maxDate.setHours(maxDate.getHours() - 1);
        maxDate.setMinutes(this.minMinute);
      } else if (maxDate.getMinutes() > this.minMinute) {
        maxDate.setMinutes(this.minMinute);
      }

      var array = [];
      for (let i = minDate.getHours(); i <= maxDate.getHours(); i++) {
        let date = new Date(this.xMin);
        date.setHours(i);
        date.setMinutes(this.minMinute);
        date.setSeconds(0);
        date.setMilliseconds(0);
        array.push(date);
      }
      this.timeRangeData = array;
      array = null;
    } else if (this.selectTimeMinute == 1440) {
      this.timeRangeData = [d3.timeDay(new Date(this.xMin))];
    }
    chartData = null;
    if (this.mergedArray.length > 0) {
      var emptyArr = [];
      this.timeRangeData.forEach((d) => {
        if (Object.keys(this.mergedObj).indexOf(d.toString()) != -1) {
          emptyArr.push(d);
        } else if (this.mergedArray.indexOf(d.toString()) != -1) {
        } else {
          emptyArr.push(d);
        }
      });
      this.timeRangeData = emptyArr;
    }
  }

  updateTimeWiseDataMapping(chartData: any) {
    this.timeRangeData.forEach(async (element) => {
      const subObj: any = {};
      subObj['key'] = element;
      subObj.leftSideData = [];
      subObj.rightSideData = [];
      subObj.minData = [];
      subObj.maxData = [];
      // subObj.obje = {};
      subObj.PIVOTGREEN = [];
      subObj.PIVOTRED = [];
      subObj.valueArea = {};
      subObj.sumLR = [];
      subObj.left = {};
      subObj.right = {};
      subObj.ohlc = {};
      let chcArr: any = [];
      let curH: number = 0;
      //finding the merging element
      if (this.mergedArray.indexOf(element.toString()) != -1) {
        curH = element.getHours();
        Object.values(this.mergedObj[element]).forEach((d: any) => {
          chcArr.push(new Date(d).getHours());
        });
      }
      let oriEle: any = element;
      subObj.data = chartData.filter((d: any, i: number) => {
        const oriDate = d.date;
        if (
          chcArr.indexOf(element.getHours()) != -1 &&
          chcArr.indexOf(d.date.getHours()) != -1
        ) {
          //alter Date
          let bool: boolean = false;
          if (d.date.getHours() != element.getHours()) {
            bool = true;
          }
          let alterDate = new Date(d.date.toString());
          alterDate.setHours(curH);
          d.date = alterDate;

          if (bool) {
            // if(minutes <= element.getMinutes() ){
            alterDate.setMinutes(0);
            d.date = alterDate;
            element = new Date(new Date(element.toString()).setMinutes(0));
            // }
          }
          let minutes = d.date.getMinutes();
          if (minutes >= element.getMinutes()) {
            alterDate.setMinutes(0);
            d.date = alterDate;
            element = new Date(new Date(element.toString()).setMinutes(0));
          }
          alterDate = null;
        }
        const countMinute = d3.timeMinute.count(element, d.date);
        const countSecound = d3.timeSecond.count(element, d.date);

        element = oriEle;
        d.date = oriDate;

        // subObj.obje[Math.round(d.latestTradedPrice)] = d;
        if (
          countMinute >= 0 &&
          countSecound >= 0 &&
          countMinute < this.selectTimeMinute
        ) {
          if (countSecound === 0) {
            subObj.leftSideData.push(d);
          }
          subObj.end = d.latestTradedPrice;
          subObj.vwap = d.vwap;
          subObj.initialBalance = d.initialBalance;
          subObj.weeklyIB = d.weeklyIB;
          subObj.latestTradedPrice = d.latestTradedPrice;
          subObj.full_value_Area = d.valueArea;
          subObj.ohlc = d.ohlc;

          //
          if (i === 0) {
            d.val = 0;
            subObj.leftSideData.push(d);
          } else {
            //
            if (chartData[i - 1].latestTradedPrice >= d.latestTradedPrice) {
              const leftSideValue = subObj.leftSideData.filter(
                (e) =>
                  Math.round(e.latestTradedPrice) ===
                  Math.round(d.latestTradedPrice)
              );
              //
              let leftSideNewValue = 0;
              //
              if (leftSideValue && leftSideValue.length) {
                leftSideNewValue = leftSideValue[leftSideValue.length - 1].val
                  ? leftSideValue[leftSideValue.length - 1].val
                  : 0;
              }
              //
              d.val =
                Number(d.total_volume - chartData[i - 1].total_volume) / 50 +
                leftSideNewValue;
              subObj.leftSideData.push(d);
            } //
            else {
              const rightSideValue = subObj.rightSideData.filter(
                (e) =>
                  Math.round(e.latestTradedPrice) ===
                  Math.round(d.latestTradedPrice)
              );
              let rightSideNewValue = 0;
              //
              if (rightSideValue && rightSideValue.length) {
                rightSideNewValue = rightSideValue[rightSideValue.length - 1]
                  .val
                  ? rightSideValue[rightSideValue.length - 1].val
                  : 0;
              }
              d.val =
                Number(d.total_volume - chartData[i - 1].total_volume) / 50 +
                rightSideNewValue;
              subObj.rightSideData.push(d);
            }
          }
          return true;
        }
        return false;
      });
      //finding vpoc to find valueArea
      this.vahvalValue = {};
      //assigning the value
      this.filterData[element] = subObj;
      //finfing value area for each element
      if (this.filterData[element].data.length > 0) {
        this.filterData[element].data.forEach((data: any) => {
          var last_price: number = 2 * Math.round(data.latestTradedPrice / 2);

          if (
            Object.keys(this.vahvalValue).indexOf(last_price.toString()) != -1
          ) {
            this.vahvalValue[last_price] += data.lastTradedQuantity;
          } else {
            this.vahvalValue[last_price] = data.lastTradedQuantity;
          }
        });

        var highVol_price: any = Object.keys(this.vahvalValue).reduce(
          (a: any, b: any) =>
            this.vahvalValue[a] > this.vahvalValue[b] ? a : b
        );

        var total_volume: any = Object.values(this.vahvalValue).reduce(
          (a: number, b: number) => a + b
        );

        var valueAreaVolume: number = Number(this.vahvalValue[highVol_price]);
        var oneUpPrice: number = Number(highVol_price);
        var oneDownPrice: number = Number(highVol_price);
        var vah: number = Number(highVol_price);
        var val: number = Number(highVol_price);
        var oneUpVolume: number = 0;
        var oneDownVolume: number = 0;
        var f = Object.keys(this.vahvalValue).indexOf(highVol_price.toString());
        var i = 1;
        var j = 1;
        while (valueAreaVolume / total_volume < 0.7) {
          oneUpPrice = Number(Object.keys(this.vahvalValue)[f + i]);
          oneDownPrice = Number(Number(Object.keys(this.vahvalValue)[f - j]));
          oneUpVolume = this.vahvalValue[oneUpPrice];
          oneDownVolume = this.vahvalValue[oneDownPrice];

          if (oneUpVolume == undefined) {
            oneUpVolume = 0;
          }
          if (oneDownVolume == undefined) {
            oneDownVolume = 0;
          }
          if (oneUpVolume > oneDownVolume) {
            i++;
            vah = Number(oneUpPrice);
            oneDownPrice = oneDownPrice + 2;
            valueAreaVolume += Number(oneUpVolume);
          } else {
            j++;
            valueAreaVolume += Number(oneDownVolume);
            val = Number(oneDownPrice);
            oneUpPrice = oneUpPrice + 2;
          }
        }
        this.filterData[element].valueArea = {
          vah: vah,
          val: val,
          valueAreaVolume: valueAreaVolume,
        };
      }
    });
    Object.keys(this.filterData).forEach((d) => {
      if (this.filterData[d].data.length == 0) {
        delete this.filterData[d];
      }
    });
    this.timeRangeData = Object.keys(this.filterData);
    chartData = null;
  }

  updateStartAndEndLine() {
    var high = [];
    var low = [];
    var num = 0;
    var prev = null;
    Object.values(this.filterData).forEach((d: any, i) => {
      if (d.data && d.data.length) {
        d.startLine = d3.max(d.data, (e: any) => e.latestTradedPrice);
        d.start = d.data[0].latestTradedPrice;
        d.endLine = d3.min(d.data, (e: any) => e.latestTradedPrice);

        //calculating indicators
        var startLine = d.startLine;
        var endLine = d.endLine;
        high.push(startLine);
        low.push(endLine);
        if (num > 1) {
          if (
            high[0] > high[1] &&
            high[1] < high[2] &&
            low[0] > low[1] &&
            low[1] < low[2]
          ) {
            prev['PIVOTGREEN'].push('PIVOT');
          } else if (
            high[0] < high[1] &&
            high[1] > high[2] &&
            low[0] < low[1] &&
            low[1] > low[2]
          ) {
            prev['PIVOTRED'].push('PIVOT');
          } else {
            prev['PIVOTGREEN'].push('');
            prev['PIVOTRED'].push('');
          }
          high.shift();
          low.shift();
        }
        num++;
        prev = d;
      }
    });
  }
  updateStartAndEndLine1(date: any) {
    var data = date.toString();
    if (this.filterData[data]) {
      this.filterData[data].startLine = d3.max(
        this.filterData[data].data,
        (e: any) => e.latestTradedPrice
      );
      this.filterData[data].start =
        this.filterData[data].data[0].latestTradedPrice;
      this.filterData[data].endLine = d3.min(
        this.filterData[data].data,
        (e: any) => e.latestTradedPrice
      );
    }
  }

  updateleftSideandRightSideTextData(bool: boolean) {
    let filterScaleData = {};
    const key = Object.keys(this.filterData).slice(-1)[0];
    if (bool) {
      filterScaleData[key] = this.filterData[key];
    } else {
      filterScaleData = this.filterData;
    }

    // Object.values(this.filterData).forEach((d: any, i) => {
    Object.values(filterScaleData).forEach((d: any, i) => {
      this.istep = 2;
      if (this.yStep) {
        const domain = this.yScale.domain();
        if (domain[1] - domain[0] < 70) {
          this.istep = Math.round(this.yStep);
        } else {
          this.istep = Math.round(this.yStep) + 1;
        }
      }
      if (this.istep < 2) {
        this.istep = 2;
      }
      let dummyleft = {};
      d.leftSideData.forEach((element: any) => {
        const k =
          (Math.round(element.latestTradedPrice) -
            this.yStep +
            (Math.round(element.latestTradedPrice) + this.yStep)) /
          2;
        element.key = k;
        dummyleft[k] = element;
      });

      let dummyRight = {};
      d.rightSideData.forEach((element: any) => {
        const k =
          (Math.round(element.latestTradedPrice) -
            this.yStep +
            (Math.round(element.latestTradedPrice) + this.yStep)) /
          2;
        element.key = k;
        dummyRight[k] = element;
      });

      //kumar
      d.left = {};
      Object.keys(dummyleft).forEach((element: any) => {
        const k = this.istep * Math.round(Number(element) / this.istep);

        if (Object.keys(d.left).indexOf(k.toString()) != -1) {
          d.left[k].val += dummyleft[element].val;
        } else {
          d.left[k] = {
            latestTradedPrice: k,
            key: k,
            val: dummyleft[element].val,
            ohlc: d.ohlc,
          };
        }
      });

      d.right = {};
      Object.keys(dummyRight).forEach((element: any) => {
        const k = this.istep * Math.round(Number(element) / this.istep);
        if (Object.keys(d.right).indexOf(k.toString()) != -1) {
          d.right[k].val += dummyRight[element].val;
        } else {
          d.right[k] = {
            latestTradedPrice: k,
            key: k,
            val: dummyRight[element].val,
            ohlc: d.ohlc,
          };
        }
      });

      d.lineData = {};
      let total = 0;
      Object.keys(d.left).forEach((element) => {
        const subt =
          Number(d.left[element].val) +
          Number(d.right[element] ? d.right[element].val : 0);

        if (total <= subt) {
          total = subt;
          d.lineData = {
            latestTradedPrice: Number(element),
            total: total,
            leftSideTotal: d3.sum(Object.values(d.left), (e) => {
              return e.val;
            }),
            rightSideTotal: d3.sum(Object.values(d.right), (e) => {
              return e.val;
            }),
          };
        }
      });

      let temObj: any = {};
      Object.values(d.left).forEach((e: any) => {
        temObj[e.key] = e.val;
      });
      Object.values(d.right).forEach((e: any) => {
        if (temObj[e.key]) {
          temObj[e.key] += e.val;
        } else {
          temObj[e.key] = e.val;
        }
      });
      d.sumLR = temObj;
      var highVol_price: any = Object.keys(temObj).reduce((a: any, b: any) =>
        temObj[a] > temObj[b] ? a : b
      );
      d.volumePOC = {
        price: highVol_price,
        volume: temObj[highVol_price],
      };
    });
    this.filterData[key] = filterScaleData[key];
    filterScaleData = null;
  }

  // findNearValue(arr: number[], num: number) {
  //   let closest = arr[0];

  //   for (let item of arr) {
  //     if (Math.abs(item - num) < Math.abs(closest - num)) {
  //       closest = item;
  //     }
  //   }
  //   return closest;
  // }

  updateGTextAndMiddleLine() {
    let filterScaleData = {};
    let key = Object.keys(this.filterData);

    if (this.socketBool) {
      key.pop();
      key.forEach((d) => {
        filterScaleData[d] = this.filterData[d];
      });
    } else {
      filterScaleData = this.filterData;
    }
    let range = 0;
    if (this.selectTimeMinute == 1440) {
      range = 90;
    } else {
      range = 50;
    }
    const self = this;
    const gText = this.chartBody
      .selectAll('g.barTexts')
      .data(Object.values(filterScaleData), (d: any, i: number) => i);
    // .data(Object.values(this.filterData), (d: any, i: number) => i);

    gText
      .enter()
      .append('g')
      .merge(gText)
      .attr('class', 'barTexts')
      .attr(
        'transform',
        (d: any, i: any) =>
          `translate(${
            // this.xScale(i) + this.xBand.bandwidth() / 2 - this.barTextWith
            this.xScale(Object.keys(this.filterData).length - 1) +
            this.xBand.bandwidth() / 8
          },0)`
      )
      .each(function (this: any, d: any, i: any) {
        const ele = d3.select(this);
        if (!self.sideBar) {
          var data = [];
          Object.keys(d.sumLR).forEach((keys) => {
            if (d.sumLR[keys] != undefined) {
              data.push({ price: keys, value: d.sumLR[keys] });
            }
          });
          self.sideX = d3
            .scaleLinear()
            .domain([
              0,
              d3.max(data, (d) => {
                return d.value;
              }),
            ])
            .range([0, range]);
          ele
            .selectAll('g.barTexts')
            .append('g')
            .attr('class', 'sideX')
            .call(d3.axisBottom(self.sideX));
          d3.selectAll('svg.sideX').remove();
          // Y axis
          self.sideY = d3
            .scaleBand()
            .domain(
              data.map((d) => {
                return d.price;
              })
            )
            .range([0, data.length * 10])
            .padding(0.2);
          ele
            .selectAll('g.barTexts')
            .append('g')
            .attr('class', 'sideY')
            .call(d3.axisLeft(self.sideY));
          d3.selectAll('svg.sideY').remove();
          d3.selectAll('svg.srText').remove();
          const sideRect = ele.selectAll('rect.sideRect').data(data);
          sideRect
            .enter()
            .append('rect')
            .merge(sideRect)
            .attr('class', 'sideRect')
            .attr('transform', 'translate(0,-5)')
            .attr('x', () => {
              if (self.selectTimeMinute == 1440) {
                return self.sideX(0) + 30;
              } else {
                return self.sideX(0);
              }
            })
            .attr('y', (d) => self.yScale(Number(d.price)))
            .attr('width', (d) => self.sideX(d.value))
            .attr('height', self.sideY.bandwidth())
            .attr('fill', '#fcca03')
            .attr('opacity', '0.5')
            .append('title')
            .attr('class', 'srText')
            .text((d) => d.value);
          sideRect.exit().remove();
        }

        const left: any = Object.keys(d.left).map(Number);
        const right: any = Object.keys(d.right).map(Number);

        for (let i = left[0]; i <= left.slice(-1)[0]; i += self.istep) {
          if (left.indexOf(i) == -1) {
            d.left[i] = { latestTradedPrice: i, key: Number(i), val: 0 };
          }
          if (right.indexOf(i) == -1) {
            d.right[i] = { latestTradedPrice: i, key: i, val: 0 };
          }
        }
        for (let i = right[0]; i <= right.slice(-1)[0]; i += self.istep) {
          if (right.indexOf(i) == -1) {
            d.right[i] = { latestTradedPrice: i, key: Number(i), val: 0 };
          }
          if (left.indexOf(i) == -1) {
            d.left[i] = { latestTradedPrice: i, key: i, val: 0 };
          }
        }

        // assigning value area
        const vahavalcandles = ele.selectAll('.vahvalcandle').data([d]);
        vahavalcandles
          .enter()
          .append('rect')
          .merge(vahavalcandles)
          .attr('class', 'vahvalcandle')
          .attr('transform', 'translate(-10,0)')
          .attr('x', 0 - self.barTextWith)
          .attr('y', (d) =>
            self.yScale(Math.max(d['valueArea'].vah, d['valueArea'].val))
          )
          .attr('width', () => {
            if (self.selectTimeMinute == 1440) {
              return self.barTextWith + 35;
            } else {
              return self.barTextWith;
            }
          })
          .attr('height', (d) =>
            d['valueArea'].vah === d['valueArea'].val
              ? '1'
              : self.yScale(Math.min(d['valueArea'].vah, d['valueArea'].val)) -
                self.yScale(Math.max(d['valueArea'].vah, d['valueArea'].val))
          )
          .attr('fill', '#4dfff9')
          .attr('opacity', '0.2');
        vahavalcandles.exit().remove();
        // leftside group for text
        const leftsideG = ele.selectAll('g.leftsideG').data([d]);
        leftsideG
          .enter()
          .append('g')
          .merge(leftsideG)
          .attr('class', 'leftsideG')
          .each(function (this: any, d: any) {
            const gEle = d3.select(this);

            const texts = gEle
              .selectAll('text.leftText')
              .data(Object.values(d.left), (e: any) => e.key);
            texts
              .enter()
              .append('text')
              .merge(texts)
              .attr('class', 'leftText')
              .attr('x', 0 - self.barTextWith)
              .attr('y', (e: any, i: number) => {
                return self.yScale(Number(e.key));
              })
              .style('fill', (e: any) =>
                e.x3 || e.x6 || e.x9 ? 'pink' : 'white'
              )
              .style('font-weight', (e: any) =>
                e.x3 || e.x6 || e.x9 ? 'bold' : 'normal'
              )
              .style('text-anchor', 'start')
              .style('font-size', '12px')
              .attr('dy', '.35em')
              .text((e: any) => e.val);
            texts.exit().remove();
          });
        leftsideG.exit().remove();

        // rightsideG group for text
        const rightsideG = ele.selectAll('g.rightsideG').data([d]);
        rightsideG
          .enter()
          .append('g')
          .merge(rightsideG)
          .attr('class', 'rightsideG')
          .attr('transform', (d: any) => `translate(${self.barTextWith / 2},0)`)
          .each(function (this: any, d: any) {
            const gEle = d3.select(this);
            const texts = gEle
              .selectAll('text.rightText')
              .data(Object.values(d.right), (d: any) => d.key);
            texts
              .enter()
              .append('text')
              .merge(texts)
              .attr('class', (d: any) => 'rightText ' + d.key)
              .attr('x', () => {
                if (self.selectTimeMinute == 1440) {
                  return -60;
                } else {
                  return 0 - self.barTextWith;
                }
              })
              .attr('y', (d: any) => self.yScale(Number(d.key)))
              .style('fill', (d: any) =>
                d.x3 || d.x6 || d.x9 ? 'green' : 'white'
              )
              .style('font-weight', (d: any) =>
                d.x3 || d.x6 || d.x9 ? 'bold' : 'normal'
              )
              .style('text-anchor', 'start')
              .style('font-size', '12px')
              .attr('dy', '.35em')
              .text((d: any) => d.val);
            texts.exit().remove();
          });
        rightsideG.exit().remove();

        ele
          .selectAll('text')
          .on('mouseover', (d: any) => {
            self.tooltip.transition().duration(200).style('opacity', 0.9);
            self.tooltip
              .html(d.key)
              .style('left', d3.event.pageX + 'px')
              .style('top', d3.event.pageY - 28 + 'px');
          })
          .on('mouseout', function (d) {
            self.tooltip.transition().duration(500).style('opacity', 0);
          });
        const middleLine = ele.selectAll('line.middleLine').data([d.lineData]);
        middleLine
          .enter()
          .append('line')
          .merge(middleLine)
          .attr('class', 'middleLine')
          .attr('x1', 0 - self.barTextWith - 10)
          .attr('x2', () => {
            if (self.selectTimeMinute == 1440) {
              return self.barTextWith - self.barTextWith + 15;
            } else {
              return self.barTextWith - self.barTextWith - 10;
            }
          })
          .attr('y1', (e: any) => self.yScale(Number(e.latestTradedPrice)))
          .attr('y2', (e: any) => self.yScale(Number(e.latestTradedPrice)))
          .attr('title', (e: any) => e.total)
          .attr('stroke', 'blue')
          .attr('stroke-width', '2px');
        middleLine.exit().remove();
      });

    gText.exit().selectAll('*').remove();
    filterScaleData = null;
    key = null;
  }
  updateGTextAndMiddleLine1() {
    let filterScaleData = {};
    let key: any = Object.keys(this.filterData).slice(-1)[0];
    filterScaleData[key] = this.filterData[key];

    let range = 0;
    if (this.selectTimeMinute == 1440) {
      range = 90;
    } else {
      range = 50;
    }
    const self = this;
    const gText = this.chartBody
      .selectAll('g.barTexts1')
      .data(Object.values(filterScaleData), (d: any, i: number) => i);
    // .data(Object.values(this.filterData), (d: any, i: number) => i);

    gText
      .enter()
      .append('g')
      .merge(gText)
      .attr('class', 'barTexts1')
      .attr(
        'transform',
        (d: any, i: any) =>
          `translate(${
            // this.xScale(i) + this.xBand.bandwidth() / 2 - this.barTextWith
            this.xScale(i) + this.xBand.bandwidth() / 8
          },0)`
      )
      .each(function (this: any, d: any, i: any) {
        const ele = d3.select(this);
        if (!self.sideBar) {
          var data = [];
          Object.keys(d.sumLR).forEach((keys) => {
            if (d.sumLR[keys] != undefined) {
              data.push({ price: keys, value: d.sumLR[keys] });
            }
          });
          self.sideX = d3
            .scaleLinear()
            .domain([
              0,
              d3.max(data, (d) => {
                return d.value;
              }),
            ])
            .range([0, range]);
          ele
            .selectAll('g.barTexts1')
            .append('g')
            .attr('class', 'sideX')
            .call(d3.axisBottom(self.sideX));
          d3.selectAll('svg.sideX').remove();
          // Y axis
          self.sideY = d3
            .scaleBand()
            .domain(
              data.map((d) => {
                return d.price;
              })
            )
            .range([0, data.length * 10])
            .padding(0.2);
          ele
            .selectAll('g.barTexts1')
            .append('g')
            .attr('class', 'sideY')
            .call(d3.axisLeft(self.sideY));
          d3.selectAll('svg.sideY').remove();
          d3.selectAll('svg.srText2').remove();
          const sideRect = ele.selectAll('rect.sideRect').data(data);
          sideRect
            .enter()
            .append('rect')
            .merge(sideRect)
            .attr('class', 'sideRect')
            .attr('x', () => {
              if (self.selectTimeMinute == 1440) {
                return self.sideX(0) + 20;
              } else {
                return self.sideX(0);
              }
            })
            .attr('y', (d) => self.yScale(Number(d.price)))
            .attr('width', (d) => self.sideX(d.value))
            .attr('height', self.sideY.bandwidth())
            .attr('fill', '#fcca03')
            .attr('opacity', '0.5')
            .append('title')
            .attr('class', 'srText2')
            .text((d) => d.value);
          sideRect.exit().remove();
        }
        const left: any = Object.keys(d.left).map(Number);
        const right: any = Object.keys(d.right).map(Number);

        for (let i = left[0]; i <= left.slice(-1)[0]; i += self.istep) {
          if (left.indexOf(i) == -1) {
            d.left[i] = { latestTradedPrice: i, key: Number(i), val: 0 };
          }
          if (right.indexOf(i) == -1) {
            d.right[i] = { latestTradedPrice: i, key: i, val: 0 };
          }
        }
        for (let i = right[0]; i <= right.slice(-1)[0]; i += self.istep) {
          if (right.indexOf(i) == -1) {
            d.right[i] = { latestTradedPrice: i, key: Number(i), val: 0 };
          }
          if (left.indexOf(i) == -1) {
            d.left[i] = { latestTradedPrice: i, key: i, val: 0 };
          }
        }

        // assigning value area
        const vahavalcandles = ele.selectAll('.vahvalcandle').data([d]);
        vahavalcandles
          .enter()
          .append('rect')
          .merge(vahavalcandles)
          .attr('class', 'vahvalcandle')
          .attr('transform', 'translate(-10,0)')
          .attr('x', 0 - self.barTextWith)
          .attr('y', (d) =>
            self.yScale(Math.max(d['valueArea'].vah, d['valueArea'].val))
          )
          .attr('width', () => {
            if (self.selectTimeMinute == 1440) {
              return self.barTextWith + 35;
            } else {
              return self.barTextWith;
            }
          })
          .attr('height', (d) =>
            d['valueArea'].vah === d['valueArea'].val
              ? '1'
              : self.yScale(Math.min(d['valueArea'].vah, d['valueArea'].val)) -
                self.yScale(Math.max(d['valueArea'].vah, d['valueArea'].val))
          )
          .attr('fill', '#4dfff9')
          .attr('opacity', '0.2');
        vahavalcandles.exit().remove();
        // leftside group for text
        const leftsideG = ele.selectAll('g.leftsideG').data([d]);
        leftsideG
          .enter()
          .append('g')
          .merge(leftsideG)
          .attr('class', 'leftsideG')
          .each(function (this: any, d: any) {
            const gEle = d3.select(this);

            const texts = gEle
              .selectAll('text.leftText')
              .data(Object.values(d.left), (e: any) => e.key);
            texts
              .enter()
              .append('text')
              .merge(texts)
              .attr('class', 'leftText')
              .attr('x', 0 - self.barTextWith)
              .attr('y', (e: any, i: number) => {
                return self.yScale(Number(e.key));
              })
              .style('fill', (e: any) =>
                e.x3 || e.x6 || e.x9 ? 'pink' : 'white'
              )
              .style('font-weight', (e: any) =>
                e.x3 || e.x6 || e.x9 ? 'bold' : 'normal'
              )
              .style('text-anchor', 'start')
              .style('font-size', '12px')
              .attr('dy', '.35em')
              .text((e: any) => e.val);
            texts.exit().remove();
          });
        leftsideG.exit().remove();

        // rightsideG group for text
        const rightsideG = ele.selectAll('g.rightsideG').data([d]);
        rightsideG
          .enter()
          .append('g')
          .merge(rightsideG)
          .attr('class', 'rightsideG')
          .attr('transform', (d: any) => `translate(${self.barTextWith / 2},0)`)
          .each(function (this: any, d: any) {
            const gEle = d3.select(this);
            const texts = gEle
              .selectAll('text.rightText')
              .data(Object.values(d.right), (d: any) => d.key);
            texts
              .enter()
              .append('text')
              .merge(texts)
              .attr('class', (d: any) => 'rightText ' + d.key)
              .attr('x', () => {
                if (self.selectTimeMinute == 1440) {
                  return -60;
                } else {
                  return 0 - self.barTextWith;
                }
              })
              .attr('y', (d: any) => self.yScale(Number(d.key)))
              .style('fill', (d: any) =>
                d.x3 || d.x6 || d.x9 ? 'green' : 'white'
              )
              .style('font-weight', (d: any) =>
                d.x3 || d.x6 || d.x9 ? 'bold' : 'normal'
              )
              .style('text-anchor', 'start')
              .style('font-size', '12px')
              .attr('dy', '.35em')
              .text((d: any) => d.val);
            texts.exit().remove();
          });
        rightsideG.exit().remove();

        ele
          .selectAll('text')
          .on('mouseover', (d: any) => {
            self.tooltip.transition().duration(200).style('opacity', 0.9);
            self.tooltip
              .html(d.key)
              .style('left', d3.event.pageX + 'px')
              .style('top', d3.event.pageY - 28 + 'px');
          })
          .on('mouseout', function (d) {
            self.tooltip.transition().duration(500).style('opacity', 0);
          });
        const middleLine = ele.selectAll('line.middleLine').data([d.lineData]);
        middleLine
          .enter()
          .append('line')
          .merge(middleLine)
          .attr('class', 'middleLine')
          .attr('x1', 0 - self.barTextWith - 10)
          .attr('x2', () => {
            if (self.selectTimeMinute == 1440) {
              return self.barTextWith - self.barTextWith + 15;
            } else {
              return self.barTextWith - self.barTextWith - 10;
            }
          })
          .attr('y1', (e: any) => self.yScale(Number(e.latestTradedPrice)))
          .attr('y2', (e: any) => self.yScale(Number(e.latestTradedPrice)))
          .attr('title', (e: any) => e.total)
          .attr('stroke', 'blue')
          .attr('stroke-width', '2px');
        middleLine.exit().remove();
      });

    gText.exit().selectAll('*').remove();
    filterScaleData = null;
    key = null;
  }

  updateLabels() {
    if (this.lablesList.length > 0) {
      d3.selectAll('.fdate').remove();

      //text
      const labelText = this.textL
        .selectAll('text.labelText')
        .data(this.lablesList);
      labelText
        .enter()
        .append('text')
        .merge(labelText)
        .attr('class', (d) => `text${d.price}`)
        .attr('x', 0)
        .attr('y', (d) => this.yScale(Number(d.price)))
        // .text((d) => `${d.label} / ${d.date}`)
        .text((d) => `${d.label} /`)
        .style('fill', (d, i) => d.color)
        .style('font-weight', 400)
        .style('text-anchor', 'start')
        .style('font-size', 9)
        .attr('font-family', 'Poppins')
        .append('tspan')
        .attr('class', 'fdate')
        .text((d, i) => d.date)
        .attr('x', 70)
        .attr('y', (d) => this.yScale(Number(d.price)) + 15);
      labelText.exit().remove();

      //line
      this.lablesList.forEach((data: any) => {
        const labelLine = this.chartBody
          .selectAll(`path.line${data.price}`)
          .data(() => {
            if (Object.keys(this.filterData).length == 1) {
              return [
                Array(Object.keys(this.filterData).length + 2).fill(data.price),
              ];
            } else {
              return [
                Array(Object.keys(this.filterData).length).fill(data.price),
              ];
            }
          });
        labelLine
          .enter()
          .append('path')
          .merge(labelLine)
          .attr('class', `line${data.price}`)
          .attr('fill', 'none')
          .attr('stroke', data.color)
          .attr('stroke-dasharray', '7,7')
          .attr('stroke-width', 1)
          .attr(
            'd',
            d3
              .line()
              .x((d, i) => this.xScale(i))
              .y((d) => this.yScale(d))
          );
        labelLine.exit().remove();
      });
    }
  }
  updateCandle() {
    // stem for a candle
    const stems = this.chartBody
      .selectAll('line.stem')
      .data(Object.keys(this.filterData), (i) => i);

    stems
      .enter()
      .append('line')
      .merge(stems)
      .attr('class', 'stem')
      .attr(
        'x1',
        (d, i) =>
          this.xScale(i) - this.xBand.bandwidth() / 2 + this.barWidth / 2
      )
      .attr(
        'x2',
        (d, i) =>
          this.xScale(i) - this.xBand.bandwidth() / 2 + this.barWidth / 2
      )
      .attr('y1', (d) => this.yScale(this.filterData[d].startLine))
      .attr('y2', (d) => this.yScale(this.filterData[d].endLine))
      // .attr('stroke', '#5a5a5a');
      .attr('stroke', '#fff')
      .attr('opacity', '0.5')
      .on('mouseenter', (d: any) => {
        addField(this.filterData[d]);
      })
      .on('mouseleave', () => {
        removeField();
      });
    stems.exit().remove();
    const candles = this.chartBody
      .selectAll('.candle')
      .data(Object.keys(this.filterData));

    candles
      .enter()
      .append('rect')
      .merge(candles)
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth() / 2)
      .attr('class', 'candle')
      .attr('y', (d) =>
        this.yScale(Math.max(this.filterData[d].start, this.filterData[d].end))
      )
      .attr('width', this.barWidth)
      .attr('height', (d) =>
        this.filterData[d].start === this.filterData[d].end
          ? '1'
          : this.yScale(
              Math.min(this.filterData[d].start, this.filterData[d].end)
            ) -
            this.yScale(
              Math.max(this.filterData[d].start, this.filterData[d].end)
            )
      )
      .attr('fill', (d) =>
        this.filterData[d].start === this.filterData[d].end
          ? 'silver'
          : this.filterData[d].start > this.filterData[d].end
          ? 'red'
          : 'green'
      )
      .on('mouseenter', (d: any) => {
        addField(this.filterData[d]);
      })
      .on('mouseleave', () => {
        removeField();
      });
    candles.exit().remove();

    // show ohlc
    function addField(d: any) {
      if (Object.keys(d).length > 0) {
        let array = [
          '<p>' + 'O  ' + d['ohlc'].open + '</p>',
          '<p>' + 'H  ' + d['ohlc'].high + '</p>',
          '<p>' + 'L  ' + d['ohlc'].low + '</p>',
          '<p>' + 'C  ' + d['ohlc'].close + '</p>',
        ];
        array.forEach((d) => {
          $('#candle-ohlc').append(d);
        });
        $('#candle-ohlc').css('display', 'block');
        $('#candle-ohlc').css('display', 'flex');
        $('#candle-ohlc > p').css('margin', '0 50px');
      }
    }
    // remove ohlc
    function removeField() {
      $('#candle-ohlc').css('display', 'none');
      $('#candle-ohlc > p').remove();
    }
    // RS and RB
    const RS_RB_text = this.chartBody
      .selectAll('text.RS_RB_text')
      .data(Object.values(this.filterData));

    RS_RB_text.enter()
      .append('text')
      .merge(RS_RB_text)
      .attr('class', 'RS_RB_text')
      .attr(
        'x',
        (d: any, i: any) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 15
      )
      .attr('y', (d: any) => {
        let perc = (d.startLine - d.endLine) * 0.2;
        if (
          d['volumePOC'].price <= d.startLine &&
          d['volumePOC'].price >= d.startLine - perc
        ) {
          return this.yScale(d.startLine) - 30;
        } else if (
          d['volumePOC'].price >= d.endLine &&
          d['volumePOC'].price <= d.endLine + perc
        ) {
          return this.yScale(d.endLine) + 40;
        } else {
          return '';
        }
      })
      .text((d: any) => {
        let perc = (d.startLine - d.endLine) * 0.2;

        if (
          d['volumePOC'].price <= d.startLine &&
          d['volumePOC'].price >= d.startLine - perc
        ) {
          return 'RS';
        } else if (
          d['volumePOC'].price >= d.endLine &&
          d['volumePOC'].price <= d.endLine + perc
        ) {
          return 'RB';
        } else {
          return '';
        }
      })
      .attr('fill', 'yellow')
      .attr('font-size', 12)
      .attr('font-weight', 400)
      .attr('text-anchor', 'end')
      .attr('font-family', 'Poppins');
    RS_RB_text.exit().remove();

    const text1 = this.chartBody
      .selectAll('text.indicator1')
      .data(Object.values(this.filterData));

    text1
      .enter()
      .append('text')
      .merge(text1)
      .attr('class', 'indicator1')
      .attr(
        'x',
        (d: any, i: any) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20
      )
      .attr('y', (d: any) => this.yScale(d.endLine) + 20)
      .text((d: any) => d.PIVOTGREEN)
      .attr('fill', function (d) {
        if (d.PIVOTGREEN == 'PIVOT') {
          return '#bffc6f';
        } else {
          return '';
        }
      })
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('text-anchor', 'end')
      .attr('font-family', 'Poppins');
    text1.exit().remove();
    //

    const text2 = this.chartBody
      .selectAll('text.indicator2')
      .data(Object.values(this.filterData));
    text2
      .enter()
      .append('text')
      .merge(text2)
      .attr('class', 'indicator2')
      .attr(
        'x',
        (d: any, i: number) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20
      )
      .attr('y', (d: any, i: number) => this.yScale(d.startLine) - 10)
      .text((d: any) => d.PIVOTRED)
      .attr('fill', function (d: any) {
        if (d.PIVOTRED == 'PIVOT') {
          return 'red';
        } else {
          return '';
        }
      })
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('text-anchor', 'end')
      .attr('font-family', 'Poppins');
    text2.exit().remove();
  }
  overAll_sideBar: any = [];
  updateSide_vpoc_bar() {
    // volume bar
    this.vScaleX = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(this.overAll_sideBar), (d) => d))
      .range([0, 100]);
    this.chartBody.selectAll('.vAxisX').remove();
    this.chartBody
      .append('g')
      .attr('class', 'vAxisX')
      .attr('transform', `translate(${0},${this.height - this.tableHeight})`)
      .call(d3.axisBottom(this.vScaleX));
    this.chartBody.selectAll('.vAxisX .tick line').remove();
    this.chartBody.selectAll('.vAxisX .domain, .tick text').remove();
    //yscale for volume
    this.vScaleY = d3
      .scaleBand()
      .domain(Object.keys(this.overAll_sideBar).map((d) => d))
      .range([this.height - this.tableHeight, 0])
      .padding(0.2);
    this.chartBody
      .append('g')
      .attr('class', 'vAxisY')
      .call(d3.axisLeft(this.vScaleY));
    this.chartBody.selectAll('.vAxisY').remove();
    const arrayOfObj = Object.entries(this.overAll_sideBar).map((e) => ({
      [e[0]]: e[1],
    }));

    this.chartBody.selectAll('.vAxisY .tick line').remove();
    this.chartBody.selectAll('.vAxisY .domain, .tick text').remove();
    d3.selectAll('svg.vbText').remove();
    const volumeBar = this.chartBody.selectAll('.volumeBar').data(arrayOfObj);
    volumeBar
      .enter()
      .append('rect')
      .merge(volumeBar)
      .attr('class', 'volumeBar')
      .attr('y', (d, i) => this.yScale(Object.keys(d)[0]))
      .attr('width', (d) => this.vScaleX(Object.values(d)[0]))
      .attr('height', (d) => this.vScaleY.bandwidth())
      .attr('fill', '#fb8bfc')
      .attr('opacity', '0.5')
      .append('title')
      .attr('class', 'vbText')
      .text((d) => Object.values(d));
    volumeBar.exit().remove();
  }

  updateDefs() {
    const defs = this.focus.select('defs').node();
    if (!defs) {
      this.focus
        .append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', this.width - this.margin.left - this.margin.right)
        .attr('height', this.height - this.tableHeight);
    }
    const defs1 = this.tableBody.select('defs').node();
    if (!defs1) {
      this.tableBody
        .append('defs')
        .append('clipPath')
        .attr('id', 'tableClip')
        .append('rect')
        .attr('width', this.width - this.margin.left - this.margin.right)
        .attr('height', this.tableHeight);
    }
  }

  updateTablelayout() {
    const self = this;
    const tableColumn = this.tableBody
      .selectAll('g.tableColumn')
      .data(Object.values(this.filterData));
    // const perRowHight = 150 / 3;
    const perRowHight = 100 / 3;
    tableColumn
      .enter()
      .append('g')
      .merge(tableColumn)
      .attr('class', 'tableColumn')
      .attr(
        'transform',
        (d, i) => `translate(${this.xScale(i) - this.xBand.bandwidth() / 2},0)`
      )
      .each(function (this: any, d, i) {
        const mapObj = {
          v: d.lineData.leftSideTotal + d.lineData.rightSideTotal,
          c: d.lineData.rightSideTotal - d.lineData.leftSideTotal,
          p: d.lineData.latestTradedPrice,
        };
        const gEle = d3.select(this);
        const tableRect = gEle
          .selectAll('rect.tableRect')
          .data(Object.keys(mapObj));
        tableRect
          .enter()
          .append('rect')
          .merge(tableRect)
          .attr('x', 0)
          .attr('class', 'tableRect')
          .attr('y', (d, i) => perRowHight * i)
          .attr('width', self.xBand.bandwidth() - 7)
          .attr('height', perRowHight)
          .attr('transform', 'translate(0,80)')
          // .attr('transform', 'translate(0,150)')
          .attr('stroke', '#5a5a5a')
          .style('fill', '#eee');
        tableRect.exit().remove();
        const tableText = gEle
          .selectAll('text.tableText')
          .data(Object.keys(mapObj));
        tableText
          .enter()
          .append('text')
          .merge(tableText)
          .attr('class', 'tableText')
          .attr('x', self.xBand.bandwidth() - 12)
          .attr('y', (d, i) => perRowHight * i + perRowHight / 2)
          .attr('dy', '.35em')
          .style('text-anchor', 'end')
          .style('fill', 'black')
          .attr('transform', 'translate(0,80)')
          // .attr('transform', 'translate(0,150)')
          .text((d) => mapObj[d]);
        tableText.exit().remove();
      });

    tableColumn.exit().remove();
    //tableHeader
    const tableHeaderRect = this.tableHeader
      .selectAll('rect.tableHeaderRect')
      .data(['V', 'C', 'P']);
    tableHeaderRect
      .enter()
      .append('rect')
      .merge(tableHeaderRect)
      .attr('x', 0)
      .attr('class', 'tableHeaderRect')
      .attr('y', (d, i) => perRowHight * i)
      .attr('width', 40)
      .attr('height', perRowHight)
      .attr('stroke', '#5a5a5a')
      .attr('transform', 'translate(0,80)')
      // .attr('transform', 'translate(0,150)')
      .style('fill', '#000');
    tableHeaderRect.exit().remove();
    const tableHeaderText = this.tableHeader
      .selectAll('text.tableHeaderText')
      .data(['V', 'C', 'P']);
    tableHeaderText
      .enter()
      .append('text')
      .merge(tableHeaderText)
      .attr('class', 'tableHeaderText')
      .attr('y', (d, i) => perRowHight * i + perRowHight / 2)
      .attr('x', (d, i) => 40 / 2)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .attr('transform', 'translate(0,80)')
      // .attr('transform', 'translate(0,150)')
      .text((d) => d);
    tableHeaderText.exit().remove();
  }

  updateScales() {
    const self = this;
    this.xScale = d3
      .scaleLinear()
      .domain([-1, this.timeRangeData.length + 0.5])
      .range([0, this.width - this.margin.left - this.margin.right]);
    //
    this.xDateScale = d3
      .scaleQuantize()
      .domain([0, this.timeRangeData.length])
      .range(this.timeRangeData);
    //

    this.xBand = d3
      .scaleBand()
      .domain(d3.range(-1, this.timeRangeData.length))
      .range([
        Math.min(
          0,
          this.width -
            this.margin.left -
            this.margin.right -
            Math.max(
              this.timeRangeData.length * this.perBarWidth,
              this.width - this.margin.left - this.margin.right
            )
        ),
        this.width - this.margin.left - this.margin.right,
      ])
      .padding(0.1);
    this.xAxis = d3
      .axisBottom()
      .scale(this.xScale)
      .tickFormat((d, i) => {
        let date = this.timeRangeData[d];
        if (date === undefined) {
          return '';
          if (i !== 0) {
            date = this.timeRangeData[this.timeRangeData.length - 1];
          } else {
            date = this.timeRangeData[0];
          }
        }
        // return this.multiFormat(date);
        if (this.selectTimeMinute == 1440) {
          return moment(date).format('MMM DD YY');
        } else {
          if (Object.keys(this.mergedObj).indexOf(date.toString()) != -1) {
            const returnTime: any = Object.values(
              this.mergedObj[date.toString()]
            );
            let mergedDate =
              new Date(returnTime[0]).getHours() +
              ':' +
              new Date(returnTime[0]).getMinutes() +
              ' - ' +
              new Date(returnTime.slice(-1)[0]).getHours() +
              ':' +
              new Date(returnTime.slice(-1)[0]).getMinutes();
            return mergedDate;
          } else {
            // return this.multiFormat(date);
            let hours: string = new Date(date.toString()).getHours().toString();
            let minutes: string = new Date(date.toString())
              .getMinutes()
              .toString();
            if (hours.length == 1) {
              hours = '0' + hours;
            }
            if (minutes.length == 1) {
              minutes = '0' + minutes;
            }
            return hours + ':' + minutes;
          }
        }
      })
      .tickSizeOuter(0);

    this.xAxisG.selectAll('text').style('fill', 'white');
    this.xAxisG.call(this.xAxis);
    this.xAxisG.selectAll('.tick text').each(function (this: any, d: any) {
      if (this.innerHTML === '' && self.timeRangeData[d] === undefined) {
        this.parentNode.style.display = 'none';
      } else {
        this.parentNode.style.display = 'block';
      }
    });
    // y- scales
    const domain = this.xScale.domain();

    let maxIndex = Math.round(
      (this.width - this.margin.left - this.margin.right) / self.xBand.step()
    );

    let maxVal = self.xBand.domain()[maxIndex];

    const xmin = new Date(this.xDateScale(domain[1] - (maxVal + 2)));
    const xmax = new Date(this.xDateScale(domain[1]));
    this.updateYscale(xmin, xmax);
  }
  updateYscale(minDate: any, maxDate: any) {
    const data: any = Object.keys(this.filterData);
    const filtered = data.filter((d: any) => {
      return (
        new Date(d).valueOf() >= minDate.valueOf() &&
        new Date(d).valueOf() <= maxDate.valueOf()
      );
    });
    // this.yMax = d3.max(
    //   filtered,
    //   (d: any) => this.filterData[d]['initialBalance'].ib3U
    // );
    // this.yMin = d3.min(
    //   filtered,
    //   (d: any) => this.filterData[d]['initialBalance'].ib3D
    // );

    this.yMin = d3.min(filtered, (d: any) => this.filterData[d].endLine);
    this.yMax = d3.max(filtered, (d: any) => this.filterData[d].startLine);

    const buffer = Math.floor((this.yMax - this.yMin) * 0.2);

    this.yScale
      // .domain([this.yMin - buffer, this.yMax + buffer])
      .domain(d3.extent(d3.range(this.yMax + buffer, this.yMin - buffer, -1)))
      .range([this.height - this.tableHeight, 0]);
    // .nice();

    this.yAxisG.call(
      d3
        .axisRight()
        .scale(this.yScale)
        .tickValues(
          d3.range(
            Math.round(this.yMax + buffer),
            Math.round(this.yMin - buffer),
            -this.selectScale
          )
        )
        // .tickValues(d3.range(this.yMax + 0.1,this.yMin - 0.1,-1))
        .tickFormat((d) => d)
        // .tickSize(-(this.width - this.margin.left))
        .tickSizeOuter(0)
        .ticks(10)
    );
    // this.yAxisG.call(this.yAxis);
    this.yAxisG.selectAll('line').style('fill', 'white').attr('opacity', 0.3);
    this.yAxisG.selectAll('text').style('fill', 'white');
  }
  // ## ib timers calculation
  customDate: any = 0;
  customNumber: number = 0;
  updateIBTimer(d: any) {
    if (this.customNumber != new Date(d.date).getSeconds()) {
      const timeCal = Math.round(
        (new Date(d.date).getTime() - new Date(this.customDate).getTime()) /
          1000
      );
      //find ib after one hour
      if (new Date(d.date).getTime() > this.ibStartTime.getTime()) {
        //ibh time calculation
        if (d['initialBalance'].ibHigh < d.latestTradedPrice) {
          this.ibHTimer += timeCal;
        }
        //ibh time calculation
        if (d['initialBalance'].ibLow > d.latestTradedPrice) {
          this.ibLTimer += timeCal;
        }
      }

      //////
      if (this.weeklyIB_Obj) {
        //find ib after five hour
        if (new Date(d.date).getDay() === 5) {
          if (new Date(d.date).getTime() > this.ibAfterFirst5hr.getTime()) {
            //ibh time calculation
            if (d['weeklyIB'].ibHigh < d.latestTradedPrice) {
              this.ibHWTimer += timeCal;
            }
            //ibh time calculation
            if (d['weeklyIB'].ibLow > d.latestTradedPrice) {
              this.ibLWTimer += timeCal;
            }
          }
        } else {
          if (d['weeklyIB'].ibHigh < d.latestTradedPrice) {
            this.ibHWTimer += timeCal;
          }
          //ibh time calculation

          if (d['weeklyIB'].ibLow > d.latestTradedPrice) {
            this.ibLWTimer += timeCal;
          }
        }
      }
    }
    this.customNumber = new Date(d.date).getSeconds();
    this.customDate = new Date(d.date);
  }
  displayIB(value: number) {
    if (value >= 1800) {
      return '30 : 00';
    } else if (value == 0) {
      return '00 : 00';
    } else {
      const result = this.calculateIBTimer(value);
      return result.minutes + ' : ' + result.seconds;
    }
  }

  //function for calculating time in HH:MM:SS
  calculateIBTimer(totalSecs: number) {
    let minutes = 0;
    let seconds = totalSecs;

    if (seconds >= 60) {
      minutes = Math.floor(seconds / 60);
      seconds = seconds - minutes * 60;
    } else {
      minutes = 0;
      seconds = seconds;
    }
    return {
      minutes,
      seconds,
    };
  }
  updateIBfamilyColors(date: any) {
    //updating ib family
    var ibArray = Object.keys(this.filterData);

    var index_1hr: any;
    var lineValue_1hr: any;
    var index_5hr: any;
    var lineValue_5hr: any;

    if (
      new Date(date).getTime() > this.ibStartTime.getTime() &&
      ibArray.length > 1
    ) {
      //collecting data for line calculation

      if (this.selectTimeMinute == 30) {
        index_1hr = ibArray.indexOf(this.ibStartTime.toString());
        index_5hr = ibArray.indexOf(this.ibAfterFirst5hr.toString());
      } else if (this.selectTimeMinute == 60) {
        index_1hr = ibArray.indexOf(this.ibStartTime.toString());
        index_5hr = ibArray.indexOf(this.ibAfterFirst5hr.toString());
      } else {
        index_1hr = ibArray.indexOf(this.ibStartTime.toString());
        index_5hr = ibArray.indexOf(this.ibAfterFirst5hr.toString());
      }

      lineValue_1hr = Number((index_1hr / ibArray.length).toFixed(2));
      lineValue_5hr = Number((index_5hr / (ibArray.length - 1)).toFixed(2));

      //append attribute to color the line
      if (lineValue_1hr > 0) {
        document.getElementById('liveIB').style.display = 'block';
        var lineColor1: any = document.getElementsByClassName('lineColor1');
        var lineColor2: any = document.getElementsByClassName('lineColor2');
        for (let i = 0; i < lineColor1.length; i++) {
          lineColor1[i].setAttribute('offset', lineValue_1hr);
          lineColor2[i].setAttribute('offset', lineValue_1hr);
        }
        this.IBbefore5hrs();
      }
    } else {
      document.getElementById('liveIB').style.display = 'none';
    }
    //after first 5 hours
    if (this.weeklyIB_Obj && lineValue_5hr > 0) {
      document.getElementById('weeklyIB').style.display = 'block';
      if (new Date(date).getDay() === 5) {
        if (new Date(date).getTime() > this.ibAfterFirst5hr.getTime()) {
          var highLine: any = document.getElementsByClassName('WIB1');
          var lowLine: any = document.getElementsByClassName('WIB2');
          for (let i = 0; i < highLine.length; i++) {
            highLine[i].setAttribute('offset', lineValue_5hr);
            lowLine[i].setAttribute('offset', lineValue_5hr);
          }

          this.IBafter5hrs();
        }
      } else {
        this.IBafter5hrs();
      }
    } else {
      document.getElementById('weeklyIB').style.display = 'none';
    }
  }
  main_zoom_event_front() {
    const a =
      Math.max(
        this.timeRangeData.length * this.perBarWidth,
        this.width - this.margin.left - this.margin.right
      ) /
      (this.width - this.margin.left - this.margin.right);
    this.focus.call(
      this.zoom.transform,
      d3.zoomIdentity.translate(Math.min(0, 0), 0).scale(a)
    );
  }
  foreignObject_things() {
    //arrow btn
    //double-arrow-back
    d3.selectAll('foreignObject.double-arrow-back').remove();
    this.focus
      .append('foreignObject')
      .attr('width', 30)
      .attr('height', 30)
      .html(
        `<i style="font-size:24px; cursor:pointer;color:#2ee8f2;" class="bi bi-arrow-right-circle-fill"></i>`
      )
      .attr('class', 'double-arrow-back')
      .attr('x', this.width - this.margin.left - this.margin.right + 18)
      .attr('y', this.height - this.tableHeight + 12)
      .on('click', () => {
        this.main_zoom_event();
      });
    // double-arrow-front
    d3.selectAll('foreignObject.double-arrow-front').remove();
    this.focus
      .append('foreignObject')
      .attr('width', 30)
      .attr('height', 30)
      .html(
        `<i style="font-size:24px; cursor:pointer;color:#2ee8f2;" class="bi bi-arrow-left-circle-fill"></i>`
      )
      .attr('class', 'double-arrow-front')
      .attr('x', -60)
      .attr('y', this.height - this.tableHeight + 10)
      .on('click', () => {
        this.main_zoom_event_front();
      });
    //sidebar hide and show btn
    d3.selectAll('foreignObject.view-sidebar').remove();
    this.focus
      .append('foreignObject')
      .attr('width', 30)
      .attr('height', 30)
      .html(
        `<i style="font-size:24px; cursor:pointer;color:yellow;" class="bi bi-file-bar-graph"></i>`
      )
      .attr('class', 'view-sidebar')
      .attr('x', this.width - this.margin.left - this.margin.right + 60)
      .attr('y', this.height - this.tableHeight + 12)
      .on('click', () => {
        this.hide_show_sideBar();
      });

    //merge btn
    d3.selectAll('foreignObject.mergeBTN').remove();
    this.focus
      .append('foreignObject')
      .attr('width', 45)
      .attr('height', 20)
      .html(
        `<p class="pl-1" style="border:1px solid #2ee8f2;border-radius: 10px;font-size:10px;font-weight:900;color:#2ee8f2;cursor:pointer">merge</p>`
      )
      .attr('class', 'mergeBTN')
      .attr('x', this.width - this.margin.left - this.margin.right - 20)
      .attr('y', -30)
      .on('click', () => {
        this.checkedlist();
      });
  }
  unmerged_btn() {
    //unmerge btn
    d3.selectAll('foreignObject.unmergeBTN').remove();
    this.focus
      .append('foreignObject')
      .attr('id', 'foreUnmergeBTN')
      .attr('width', 60)
      .attr('height', 20)
      .html(
        `<p class="pl-1" style="border:1px solid #e6fa34;border-radius: 10px;font-size:10px;font-weight:900;color:#e6fa34;cursor:pointer">unmerge</p>`
      )
      .attr('class', 'unmergeBTN')
      .attr('x', this.width - this.margin.left - this.margin.right + 35)
      .attr('y', -30)
      .on('click', () => {
        document.getElementById('candlestick-container').style.display = 'none';
        document.getElementById('chart-spinner').style.display = 'block';
        this.unmerge_All();
      });
  }
  db_version: number = null;
  async createIndexed_db(data: any) {
    if (data.length > 0) {
      if (this.indexDB_Name == 'candlechart1') {
        const isExisting: any = (await window.indexedDB.databases()).map(
          (db) => {
            return db;
          }
        );
        if (isExisting.length > 0) {
          let str: string = isExisting.pop().name.slice(-1);
          this.db_version = Number(str) + 1;
          this.indexDB_Name = 'candlechart' + this.db_version;
          this.commonSer.indexDB_Name = this.indexDB_Name;
        } else {
          this.commonSer.indexDB_Name = this.indexDB_Name;
        }
      } else {
        this.commonSer.indexDB_Name = this.indexDB_Name;
      }
      await this.commonSer.createIndexed_DB();
      await this.commonSer.storeData_to_Indexed_DB(data);
      this.renderLayout(data);
      data = null;
    } else {
      alert('empty content plz reload the page!');
    }
  }
  async renderLayout(chartData: any) {
    if (Object.keys(chartData.slice(-1)[0].weeklyIB).length > 1) {
      this.weeklyIB_Obj = true;
    } else {
      this.weeklyIB_Obj = false;
    }
    if (this.chartType == 'candle_token') {
      if (this.selectTimeMinute >= 30) {
        this.perBarWidth = 230 + 20;
        this.barTextWith = 100;
      } else {
        this.barTextWith = 90;
        this.perBarWidth = 230;
      }
    } else {
      if (this.selectTimeMinute >= 30) {
        this.perBarWidth = 230;
      } else {
        this.perBarWidth = 192;
      }
    }

    //get " DATE " from whole data
    const firstEle = new Date(chartData[0].date);
    // variables for calculating ibh and ibl for first 1 hour
    this.ibHTimer = 0;
    this.ibLTimer = 0;
    this.filterData = {};
    // variables for calculating ibh and ibl for after 5 hour
    this.ibHWTimer = this.db_wib_h;
    this.ibLWTimer = this.db_wib_l;
    this.customDate = 0;
    this.customNumber = 0;

    //starting time for displaying IB family
    this.ibStartTime = new Date(firstEle);
    this.ibStartTime.setHours(firstEle.getHours() + 1);

    this.ibAfterFirst5hr = new Date(firstEle);
    this.ibAfterFirst5hr.setHours(firstEle.getHours() + 5);

    this.max_ohlc = chartData.slice(-1)[0]['ohlc'].high;
    this.min_ohlc = chartData.slice(-1)[0]['ohlc'].low;

    setTimeout(() => {
      const ele = document.getElementById('cur-Date');
      if (ele) {
        ele.innerHTML = moment(chartData.slice(-1)[0].date).format(
          'YYYY-MM-DD'
        );
      }
      const data = chartData.slice(-1)[0];

      this.updatingDOMvalues(data);
    }, 50);

    this.updateTimeDateRange(chartData);
    this.updateTimeWiseDataMapping(chartData);

    this.updateStartAndEndLine();
    this.updateScales();
    this.setYstep();

    await this.update_ImportantThings();
    this.updateIBfamilyColors(chartData.slice(-1)[0].date);

    this.timeOption = [];
    this.timeRangeData.forEach((d) => {
      this.timeOption.push(d.toString());
    });
    // this.timeOption
    if (this.selectTimeMinute == 1440) {
      d3.selectAll('path.vAvgLine').remove();
    }
    // extra btn and icons ....
    this.foreignObject_things();
    if (
      this.selectTimeMinute != 1440 &&
      Object.keys(this.filterData).length > 1
    ) {
      //updating checkbox
      this.appendCheckBox();
    } else {
      //remove all check box from chart when its whole day chart
      d3.selectAll('foreignObject.checkBox').remove();
      d3.selectAll('foreignObject.mergeBTN').remove();
    }
    //zoom function
    this.main_zoom_event();

    this.filter_lastIndex = new Date(
      Object.keys(this.filterData).slice(-1)[0]
    ).valueOf();

    if (this.socketBool == true && !this.start_socket_connection) {
      // calculate value area and vpoc for backend
      this.connectSocket(this.commonSer.vpoc_valueArea(chartData));
    } else {
      this.start_socket_connection = false;
      this.stop_socket_connection = false;
    }
    $('#display_chart').css('display', 'block');
    $('#candlestick-container').css('display', 'block');
    $('#chart-spinner').css('display', 'none');
    $('.ohlc-group').css('display', 'flex');

    setTimeout(() => {
      chartData = null;
    }, 10000);
  }

  set_timer(time: any) {
    let splitTime = time.split(':');
    let hr = splitTime[0];
    let min = splitTime[1];

    let getTime = this.timeOption.filter(
      (d: any) =>
        new Date(d).getHours() == hr && new Date(d).getMinutes() == min
    );
    let index = this.timeOption.indexOf(getTime.toString());
    this.main_zoom_event_change(index);
  }

  main_zoom_event_change(index: number) {
    index += 3;

    this.focus.call(this.zoom);
    const a =
      Math.max(
        this.timeRangeData.length * this.perBarWidth,
        this.width - this.margin.left - this.margin.right
      ) /
      (this.width - this.margin.left - this.margin.right);
    this.focus.call(
      this.zoom.transform,
      d3.zoomIdentity
        .translate(
          Math.min(
            0,
            this.width -
              this.margin.left -
              Math.max(
                index * this.perBarWidth,
                this.width - this.margin.left - this.margin.right
              )
          )
        )
        .scale(a)
    );
  }

  hide_show_sideBar() {
    if (!this.sideBar) {
      this.sideBar = true;
      d3.selectAll('svg.sideX').remove();
      d3.selectAll('svg.sideY').remove();
      d3.selectAll('rect.sideRect').remove();
    } else {
      this.sideBar = false;
      this.updateleftSideandRightSideTextData(false);
      this.updateGTextAndMiddleLine();
      this.main_zoom_event();
    }
  }
  appendCheckBox() {
    if (
      this.selectTimeMinute != 1440 &&
      Object.keys(this.filterData).length > 1
    ) {
      d3.selectAll('foreignObject.checkBox').remove();
      var checkBox = this.chartBody
        .selectAll('.checkBox')
        .data(Object.values(this.filterData));
      checkBox
        .enter()
        .append('foreignObject')
        .attr('width', 20)
        .attr('height', 20)
        .merge(checkBox)
        .attr('class', 'checkBox')
        .html(
          `<input class="checkProp" style="cursor:pointer" type="checkbox">`
        )
        .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth() / 4)
        .attr('y', (d, i) => this.yScale(d.startLine) - 40);
      checkBox.exit().remove();
      var checkProp: any = document.getElementsByClassName('checkProp');
      let filArr = Object.keys(this.filterData);
      for (var i = 0; i < checkProp.length; i++) {
        checkProp[i].setAttribute('id', filArr[i]);
      }
    } else {
      d3.selectAll('foreignObject.checkBox').remove();
    }
  }
  async unmerge_All() {
    this.mergedArray = [];
    this.mergedObj = {};
    d3.selectAll('svg.barTexts').remove();
    d3.selectAll('foreignObject.unmergeBTN').remove();
    this.modify_newChart();
  }
  mergedArray: any = [];
  mergedObj: any = {};
  async checkedlist() {
    this.mergedArray = null;
    this.mergedArray = [];
    var markedCheckbox: any = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );

    if (markedCheckbox.length > 1) {
      //store merged dates in array
      let checkDates = [];

      for (var i = 0; i < markedCheckbox.length; i++) {
        checkDates.push(markedCheckbox[i].id);
      }

      let arr = Object.keys(this.filterData);
      let index = arr.indexOf(checkDates[0]);
      let checkit = arr.slice(index, index + checkDates.length);

      let notInOrder = false;
      for (let i = 0; i < checkDates.length; i++) {
        if (checkit[i] != checkDates[i]) {
          notInOrder = true;
        }
      }
      if (!notInOrder) {
        document.getElementById('candlestick-container').style.display = 'none';
        document.getElementById('chart-spinner').style.display = 'block';
        //show unmerged btn
        this.unmerged_btn();

        // check the date already is in array
        var alreadyExists = false;

        if (Object.keys(this.mergedObj).length > 0) {
          checkDates.forEach((d: any) => {
            if (Object.keys(this.mergedObj).indexOf(d) != -1) {
              alreadyExists = true;
              // dates which are merged
              this.mergedObj[d] = [
                ...Object.values(this.mergedObj[d]),
                ...checkDates,
              ].sort((a: number, b: number) => {
                return new Date(a).getTime() - new Date(b).getTime();
              });
              if (d != checkDates[0]) {
                this.mergedObj[checkDates[0]] = this.mergedObj[d];
                checkDates = this.mergedObj[checkDates[0]];
                delete this.mergedObj[d];
              } else {
                checkDates = this.mergedObj[d];
              }
            }
          });
        }

        // create a obj with date custom merged date
        if (!alreadyExists) {
          this.mergedObj[checkDates[0]] = checkDates;
        }
        Object.values(this.mergedObj).forEach((arr: any) => {
          this.mergedArray = [...this.mergedArray, ...arr];
        });

        checkDates = null;
        //get data from indexed db
        this.modify_newChart();
      } else {
        alert('Please select Only consecutive candles');
      }
    } else {
      alert('Please select more than one');
    }
  }

  main_zoom_event() {
    this.focus.call(this.zoom);
    const a =
      Math.max(
        this.timeRangeData.length * this.perBarWidth,
        this.width - this.margin.left - this.margin.right
      ) /
      (this.width - this.margin.left - this.margin.right);
    this.focus.call(
      this.zoom.transform,
      d3.zoomIdentity
        .translate(
          Math.min(
            0,
            this.width -
              this.margin.left -
              Math.max(
                this.timeRangeData.length * this.perBarWidth,
                this.width - this.margin.left - this.margin.right
              )
          ),
          0
        )
        .scale(a)
    );
    //9,15
    this.zoom.scaleExtent([a, a]);
  }

  calculationPart1(date1: any, d: any) {
    var element: any = new Date(date1);
    const oriDate = d.date;

    let chcArr: any = [];
    let curH: number = 0;
    //finding the merging element
    if (this.mergedArray.indexOf(element.toString()) != -1) {
      curH = new Date(element.toString()).getHours();
      Object.values(this.mergedObj[element]).forEach((d: any) => {
        chcArr.push(new Date(d).getHours());
      });
    }
    let oriEle: any = element;
    if (
      chcArr.indexOf(element.getHours()) != -1 &&
      chcArr.indexOf(d.date.getHours()) != -1
    ) {
      //alter Date
      let bool: boolean = false;
      if (d.date.getHours() != element.getHours()) {
        bool = true;
      }
      let alterDate = new Date(d.date.toString());
      alterDate.setHours(curH);
      d.date = alterDate;

      if (bool) {
        // if(minutes <= element.getMinutes() ){
        alterDate.setMinutes(0);
        d.date = alterDate;
        element = new Date(new Date(element.toString()).setMinutes(0));
        // }
      }
      let minutes = d.date.getMinutes();
      if (minutes >= element.getMinutes()) {
        alterDate.setMinutes(0);
        d.date = alterDate;
        element = new Date(new Date(element.toString()).setMinutes(0));
      }
      alterDate = null;
    }

    const countMinute = d3.timeMinute.count(element, d.date);
    //
    const countSecound = d3.timeSecond.count(element, d.date);
    //
    element = oriEle;
    d.date = oriDate;

    // this.filterData[element].obje[Math.round(d.latestTradedPrice)] = d;

    if (
      countMinute >= 0 &&
      countSecound > 0 &&
      countMinute < this.selectTimeMinute
    ) {
      //

      if (countSecound === 0) {
        this.filterData[element].leftSideData.push(d);
      }
      this.filterData[element].end = d.latestTradedPrice;
      this.filterData[element].vwap = d.vwap;
      this.filterData[element].initialBalance = d.initialBalance;
      this.filterData[element].weeklyIB = d.weeklyIB;
      this.filterData[element].latestTradedPrice = d.latestTradedPrice;
      this.filterData[element].full_value_Area = d.valueArea;

      if (
        this.filterData[element].data.slice(-1)[0].latestTradedPrice >=
        d.latestTradedPrice
      ) {
        const leftSideValue = this.filterData[element].leftSideData.filter(
          (e) =>
            Math.round(e.latestTradedPrice) === Math.round(d.latestTradedPrice)
        );

        //
        let leftSideNewValue = 0;
        //
        if (leftSideValue && leftSideValue.length) {
          leftSideNewValue = leftSideValue[leftSideValue.length - 1].val
            ? leftSideValue[leftSideValue.length - 1].val
            : 0;
        }
        //
        d.val =
          Number(
            d.total_volume -
              this.filterData[element].data.slice(-1)[0].total_volume
          ) /
            50 +
          leftSideNewValue;
        this.filterData[element].leftSideData.push(d);
      } //
      else {
        const rightSideValue = this.filterData[element].rightSideData.filter(
          (e) =>
            Math.round(e.latestTradedPrice) === Math.round(d.latestTradedPrice)
        );
        let rightSideNewValue = 0;
        //
        if (rightSideValue && rightSideValue.length) {
          rightSideNewValue = rightSideValue[rightSideValue.length - 1].val;
        }
        d.val =
          Number(
            d.total_volume -
              this.filterData[element].data.slice(-1)[0].total_volume
          ) /
            50 +
          rightSideNewValue;

        this.filterData[element].rightSideData.push(d);
      }
    }

    //finfing value area for each element
    var last_price: number = 2 * Math.round(d.latestTradedPrice / 2);

    if (Object.keys(this.vahvalValue).indexOf(last_price.toString()) != -1) {
      this.vahvalValue[last_price] += d.lastTradedQuantity;
    } else {
      this.vahvalValue[last_price] = d.lastTradedQuantity;
    }
    var highVol_price: any = Object.keys(this.vahvalValue).reduce(
      (a: any, b: any) => (this.vahvalValue[a] > this.vahvalValue[b] ? a : b)
    );

    var total_volume: any = Object.values(this.vahvalValue).reduce(
      (a: number, b: number) => a + b
    );

    var valueAreaVolume: number = Number(this.vahvalValue[highVol_price]);
    var oneUpPrice: number = Number(highVol_price);
    var oneDownPrice: number = Number(highVol_price);
    var vah: number = Number(highVol_price);
    var val: number = Number(highVol_price);
    var oneUpVolume: number = 0;
    var oneDownVolume: number = 0;
    var f = Object.keys(this.vahvalValue).indexOf(highVol_price.toString());
    var i = 1;
    var j = 1;
    while (valueAreaVolume / total_volume < 0.7) {
      oneUpPrice = Number(Object.keys(this.vahvalValue)[f + i]);
      oneDownPrice = Number(Number(Object.keys(this.vahvalValue)[f - j]));
      oneUpVolume = this.vahvalValue[oneUpPrice];
      oneDownVolume = this.vahvalValue[oneDownPrice];

      if (oneUpVolume == undefined) {
        oneUpVolume = 0;
      }
      if (oneDownVolume == undefined) {
        oneDownVolume = 0;
      }
      if (oneUpVolume > oneDownVolume) {
        i++;
        vah = Number(oneUpPrice);
        oneDownPrice = oneDownPrice + 2;
        valueAreaVolume += Number(oneUpVolume);
      } else {
        j++;
        valueAreaVolume += Number(oneDownVolume);
        val = Number(oneDownPrice);
        oneUpPrice = oneUpPrice + 2;
      }
    }

    this.filterData[element].valueArea = {
      vah: vah,
      val: val,
      valueAreaVolume: valueAreaVolume,
    };
  }
  zoomIndex: number = 0;
  test_zoom() {
    const a =
      Math.max(
        this.timeRangeData.length * this.perBarWidth,
        this.width - this.margin.left - this.margin.right
      ) /
      (this.width - this.margin.left - this.margin.right);
    this.focus.call(
      this.zoom.transform,
      d3.zoomIdentity
        .translate(
          Math.min(
            0,
            this.width -
              this.margin.left -
              Math.max(
                this.zoomIndex * this.perBarWidth,
                this.width - this.margin.left - this.margin.right
              )
          )
        )
        .scale(a)
    );
  }
  pageHigh: number = null;
  pageLow: number = null;
  update_zoom_effect() {
    const xmin = new Date(
      this.xDateScale(Math.floor(this.xScaleZ.domain()[0]))
    );

    const xmax = new Date(this.xDateScale(Math.ceil(this.xScaleZ.domain()[1])));
    const last_time = Object.keys(this.filterData).slice(-1)[0];
    const first_time = Object.keys(this.filterData)[0];
    if (first_time != new Date(xmin).toString()) {
      this.focus
        .selectAll('foreignObject.double-arrow-front')
        .style('display', 'block');
    } else {
      this.focus
        .selectAll('foreignObject.double-arrow-front')
        .style('display', 'none');
    }
    if (last_time != new Date(xmax).toString()) {
      this.focus
        .selectAll('foreignObject.double-arrow-back')
        .style('display', 'block');
    } else {
      this.focus
        .selectAll('foreignObject.double-arrow-back')
        .style('display', 'none');
    }
    this.all_Line_Text(xmax);
    this.updateYscale(xmin, xmax);
    this.setYstep();
  }
  mainCommon(date: any, bool: boolean) {
    if (!bool) {
      this.socketConnected = false;
    }

    this.updateStartAndEndLine1(date);
    this.maintainVPOC();
    this.updateSide_vpoc_bar();
    if (this.selectTimeMinute == 1440) {
      d3.selectAll('path.vAvgLine').remove();
    }

    this.all_Line_Text(date);
    if (bool) {
      this.updateleftSideandRightSideTextData(true);
      this.updateGTextAndMiddleLine1();
    } else {
      this.updateleftSideandRightSideTextData(false);
      this.updateGTextAndMiddleLine();
    }

    this.updateTablelayout();
    this.updateEveryTicks();
    if (!bool) {
      this.socketConnected = true;
    }
  }

  maintainVPOC() {
    this.overAll_sideBar = null;
    let fullObj = {};
    Object.keys(this.filterData).forEach((d) => {
      Object.keys(this.filterData[d].sumLR).forEach((e) => {
        if (Object.keys(fullObj).indexOf(e) == -1) {
          fullObj[e] = this.filterData[d].sumLR[e];
        } else {
          fullObj[e] += this.filterData[d].sumLR[e];
        }
      });
      var first_price = Object.keys(fullObj).reduce((a, b) =>
        fullObj[a] > fullObj[b] ? a : b
      );
      var second_price = Object.keys(fullObj).sort(function (a: any, b: any) {
        return fullObj[b] - fullObj[a];
      })[1];

      this.filterData[d].full_vpoc = {
        price: first_price,
        volume: fullObj[first_price],
      };
      this.filterData[d].full_dpoc = {
        price: second_price,
        volume: fullObj[second_price],
      };
    });
    // var first_price = Object.keys(fullObj).reduce((a, b) =>
    //   fullObj[a] > fullObj[b] ? a : b
    // );
    // var second_price = Object.keys(fullObj).sort(function(a:any,b:any){return fullObj[b]-fullObj[a]})[1];
    this.overAll_sideBar = fullObj;
  }

  weekly_IB_Text(date: any) {
    //high
    const WIB_TH = this.textR
      .selectAll('text.WIB_TH')
      .data([this.filterData[date]]);

    WIB_TH.enter()
      .append('text')
      .merge(WIB_TH)
      .attr('class', 'WIB_TH')
      .attr('x', 0)
      .attr('y', (d) => this.yScale(d['weeklyIB'].ibHigh))
      .text((d) => 'WIB_H: ' + d['weeklyIB'].ibHigh.toFixed(1))
      .style('font-weight', 400)
      .style('fill', 'hotpink')
      .style('text-anchor', 'start')
      .style('font-size', 10)
      .attr('font-family', 'Poppins');
    WIB_TH.exit().remove();

    //text low

    const WIB_TL = this.textR
      .selectAll('text.WIB_TL')
      .data([this.filterData[date]]);

    WIB_TL.enter()
      .append('text')
      .merge(WIB_TL)
      .attr('class', 'WIB_TL')
      .attr('x', 0)
      .attr('y', (d) => this.yScale(d['weeklyIB'].ibLow))
      .text((d) => 'WIB_L: ' + d['weeklyIB'].ibLow.toFixed(1))
      .style('font-weight', 400)
      .style('fill', 'blue')
      .style('text-anchor', 'start')
      .style('font-size', 10)
      .attr('font-family', 'Poppins');
    WIB_TL.exit().remove();
  }
  all_Line_Text(date: any) {
    // //text high
    let fdate: any = date;
    if (new Date(date).getMinutes() == 0 && new Date(date).getHours() == 0) {
      date = new Date();
    }
    if (this.weeklyIB_Obj) {
      if (new Date(date).getDay() === 5) {
        if (new Date(date).getTime() > this.ibAfterFirst5hr.getTime()) {
          this.weekly_IB_Text(fdate);
        } else {
          this.textR.selectAll('text.WIB_TH').remove();
          this.textR.selectAll('text.WIB_TL').remove();
        }
      } else {
        this.weekly_IB_Text(fdate);
      }
    }
    date = fdate;

    if (new Date(date).getTime() > this.ibStartTime.getTime()) {
      const ibHighText = this.textR
        .selectAll('text.ibHighText')
        .data([this.filterData[date]]);

      ibHighText
        .enter()
        .append('text')
        .merge(ibHighText)
        .attr('class', 'ibHighText')
        .attr('x', 0)
        .attr('y', (d) => this.yScale(d['initialBalance'].ibHigh))
        .text(
          (d) => 'ibHigh: ' + d['initialBalance'].ibHigh
          // .toFixed(1)
        )
        .style('font-weight', 400)
        .style('fill', 'white')
        .style('text-anchor', 'start')
        .style('font-size', 10)
        .attr('font-family', 'Poppins');
      ibHighText.exit().remove();
      const ibLowText = this.textR
        .selectAll('text.ibLowText')
        .data([this.filterData[date]]);

      ibLowText
        .enter()
        .append('text')
        .merge(ibLowText)
        .attr('class', 'ibLowText')
        .attr('x', 0)
        .attr('y', (d) => this.yScale(d['initialBalance'].ibLow))
        .text((d) => 'ibLow: ' + d['initialBalance'].ibLow.toFixed(1))
        .style('fill', 'white')
        .style('font-weight', 400)
        .style('text-anchor', 'start')
        .style('font-size', 10)
        .attr('font-family', 'Poppins');
      ibLowText.exit().remove();
      const ib1_5UText = this.textR
        .selectAll('text.ib1_5UText')
        .data([this.filterData[date]]);

      ib1_5UText
        .enter()
        .append('text')
        .merge(ib1_5UText)
        .attr('class', 'ib1_5UText')
        .attr('x', 0)
        .attr('y', (d) => this.yScale(d['initialBalance'].ib1_5U))
        .text((d) => '1_5U: ' + d['initialBalance'].ib1_5U.toFixed(1))
        .style('font-weight', 400)
        .style('fill', '#69fc56')
        .style('text-anchor', 'start')
        .style('font-size', 10)
        .attr('font-family', 'Poppins');
      ib1_5UText.exit().remove();
      const ib2UText = this.textR
        .selectAll('text.ib2UText')
        .data([this.filterData[date]]);

      ib2UText
        .enter()
        .append('text')
        .merge(ib2UText)
        .attr('class', 'ib2UText')
        .attr('x', 0)
        .attr('y', (d) => this.yScale(d['initialBalance'].ib2U))
        .text((d) => '2U: ' + d['initialBalance'].ib2U.toFixed(1))
        .style('font-weight', 400)
        .style('fill', 'yellow')
        .style('text-anchor', 'start')
        .style('font-size', 10)
        .attr('font-family', 'Poppins');
      ib2UText.exit().remove();
      const ib3UText = this.textR
        .selectAll('text.ib3UText')
        .data([this.filterData[date]]);

      ib3UText
        .enter()
        .append('text')
        .merge(ib3UText)
        .attr('class', 'ib3UText')
        .attr('x', 0)
        .attr('y', (d) => this.yScale(d['initialBalance'].ib3U))
        .text((d) => '3U: ' + d['initialBalance'].ib3U.toFixed(1))
        .style('font-weight', 400)
        .style('fill', '#5693f5')
        .style('text-anchor', 'start')
        .style('font-size', 10)
        .attr('font-family', 'Poppins');
      ib3UText.exit().remove();
      const ib1_5DText = this.textR
        .selectAll('text.ib1_5DText')
        .data([this.filterData[date]]);

      ib1_5DText
        .enter()
        .append('text')
        .merge(ib1_5DText)
        .attr('class', 'ib1_5DText')
        .attr('x', 0)
        .attr('y', (d) => this.yScale(d['initialBalance'].ib1_5D))
        .text((d) => '1_5D: ' + d['initialBalance'].ib1_5D.toFixed(1))
        .style('font-weight', 400)
        .style('fill', '#69fc56')
        .style('text-anchor', 'start')
        .style('font-size', 10)
        .attr('font-family', 'Poppins');
      ib1_5DText.exit().remove();
      const ib2DText = this.textR
        .selectAll('text.ib2DText')
        .data([this.filterData[date]]);

      ib2DText
        .enter()
        .append('text')
        .merge(ib2DText)
        .attr('class', 'ib2DText')
        .attr('x', 0)
        .attr('y', (d) => this.yScale(d['initialBalance'].ib2D))
        .text((d) => '2D: ' + d['initialBalance'].ib2D.toFixed(1))
        .style('font-weight', 400)
        .style('fill', 'yellow')
        .style('text-anchor', 'start')
        .style('font-size', 10)
        .attr('font-family', 'Poppins');
      ib2DText.exit().remove();
      const ib3DText = this.textR
        .selectAll('text.ib3DText')
        .data([this.filterData[date]]);

      ib3DText
        .enter()
        .append('text')
        .merge(ib3DText)
        .attr('class', 'ib3DText')
        .attr('x', 0)
        .attr('y', (d) => this.yScale(d['initialBalance'].ib3D))
        .text((d) => '3D: ' + d['initialBalance'].ib3D.toFixed(1))
        .style('font-weight', 400)
        .style('fill', '#5693f5')
        .style('text-anchor', 'start')
        .style('font-size', 10)
        .attr('font-family', 'Poppins');
      ib3DText.exit().remove();
    } else {
      this.textR.selectAll('text.ibHighText').remove();
      this.textR.selectAll('text.ibLowText').remove();
      this.textR.selectAll('text.ib1_5UText').remove();
      this.textR.selectAll('text.ib2UText').remove();
      this.textR.selectAll('text.ib3UText').remove();
      this.textR.selectAll('text.ib1_5DText').remove();
      this.textR.selectAll('text.ib3DText').remove();
      this.textR.selectAll('text.ib3DText').remove();
    }

    const vwapText = this.textR
      .selectAll('text.vwapText')
      .data([this.filterData[date]]);

    vwapText
      .enter()
      .append('text')
      .merge(vwapText)
      .attr('class', 'vwapText')
      .attr('x', 0)
      .attr('y', (d) => this.yScale(d.vwap))
      .text((d) => 'VWAP: ' + d.vwap.toFixed(1))
      .style('fill', 'red')
      .style('font-weight', 400)
      .style('text-anchor', 'start')
      .style('font-size', 10)
      .attr('font-family', 'Poppins');
    vwapText.exit().remove();

    const ltpText = this.textR
      .selectAll('text.ltpText')
      .data([this.filterData[date]]);

    ltpText
      .enter()
      .append('text')
      .merge(ltpText)
      .attr('class', 'ltpText')
      .attr('x', 0)
      .attr('y', (d) => this.yScale(d.latestTradedPrice))
      .text((d) => 'LTP: ' + d.latestTradedPrice.toFixed(1))
      .style('fill', 'white')
      .style('font-weight', 400)
      .style('text-anchor', 'start')
      .style('font-size', 10)
      .attr('font-family', 'Poppins');
    ltpText.exit().remove();

    const vahText = this.textR
      .selectAll('text.vahText')
      .data([this.filterData[date]]);

    vahText
      .enter()
      .append('text')
      .merge(vahText)
      .attr('class', 'vahText')
      .attr('x', 0)
      .attr('y', (d) => this.yScale(d['full_value_Area'].vah))
      .text((d) => 'VAH: ' + d['full_value_Area'].vah.toFixed(1))
      .style('fill', '#03fcdf')
      .style('font-weight', 400)
      .style('text-anchor', 'start')
      .style('font-size', 10)
      .attr('font-family', 'Poppins');
    vahText.exit().remove();
    const valText = this.textR
      .selectAll('text.valText')
      .data([this.filterData[date]]);

    valText
      .enter()
      .append('text')
      .merge(valText)
      .attr('class', 'valText')
      .attr('x', 0)
      .attr('y', (d) => this.yScale(d['full_value_Area'].val))
      .text((d) => 'VAL: ' + d['full_value_Area'].val.toFixed(1))
      .style('fill', '#03ebfc')
      .style('font-weight', 400)
      .style('text-anchor', 'start')
      .style('font-size', 10)
      .attr('font-family', 'Poppins');
    valText.exit().remove();

    const vpocText = this.textR
      .selectAll('text.vpocText')
      .data([this.filterData[date]]);

    vpocText
      .enter()
      .append('text')
      .merge(vpocText)
      .attr('class', 'vpocText')
      .attr('x', 0)
      .attr('y', (d) => this.yScale(Number(d['full_vpoc'].price)))
      .text((d) => 'VPOC:' + Number(d['full_vpoc'].price).toFixed(1))
      .style('fill', '#eab1fc')
      .style('font-weight', 400)
      .style('text-anchor', 'start')
      .style('font-size', 10)
      .attr('font-family', 'Poppins');
    vpocText.exit().remove();
    const dpocText = this.textR
      .selectAll('text.dpocText')
      .data([this.filterData[date]]);

    dpocText
      .enter()
      .append('text')
      .merge(dpocText)
      .attr('class', 'dpocText')
      .attr('x', 0)
      .attr('y', (d) => this.yScale(Number(d['full_dpoc'].price)))
      .text((d) => 'DPOC:' + Number(d['full_dpoc'].price).toFixed(1))
      .style('fill', '#8dfcb1')
      .style('font-weight', 400)
      .style('text-anchor', 'start')
      .style('font-size', 10)
      .attr('font-family', 'Poppins');
    dpocText.exit().remove();
  }

  bottomBar() {
    let data = [];
    let res = [];
    Object.values(this.filterData).forEach(function (d) {
      if (d['lineData'].leftSideTotal == undefined) {
        d['lineData'].leftSideTotal = 0;
      }
      if (d['lineData'].rightSideTotal == undefined) {
        d['lineData'].rightSideTotal = 0;
      }
      data.push(d['lineData'].leftSideTotal + d['lineData'].rightSideTotal);
      const val = d3.mean(data);
      res.push(val);
    });

    // Add Y axis
    this.y = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return d;
        })
      )
      .range([this.barTextWith - 40, 0]);
    this.tableBody.append('g').attr('class', 'yA').call(d3.axisRight(this.y));
    this.tableBody.selectAll('.yA .tick line').remove();
    this.tableBody.selectAll('.yA .domain, .tick text').remove();

    // Bars
    const bar = this.tableBody.selectAll('.mybar').data(data);
    bar
      .enter()
      .append('rect')
      .merge(bar)
      .attr('class', 'mybar')
      .attr('x', (d, i) => {
        return this.xScale(i) - this.xBand.bandwidth() / 2;
      })
      .attr('y', (d) => this.y(d))
      .attr('width', this.xBand.bandwidth() - 7)
      .attr(
        'height',
        (d) => this.barTextWith - 0.3 * this.barTextWith - this.y(d)
      )
      .attr('fill', '#3573de')
      .append('title')
      .text((d) => d);
    bar.exit().remove();

    if (this.selectTimeMinute != 1440) {
      const vAvgLine = this.tableBody.selectAll('.vAvgLine').data([res]);

      vAvgLine
        .enter()
        .append('path')
        .merge(vAvgLine)
        .attr('class', 'vAvgLine')
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .attr(
          'd',
          d3
            .line()
            .x((d, i) => this.xScale(i))
            .y((d) => this.yScale(d))
        );
      vAvgLine.exit().remove();
    }
  }
  IBafter5hrs() {
    ////  line high
    const WIB_high = this.chartBody
      .selectAll('path.WIB_high')
      // .data([Object.values(this.filterData)]);
      .data(() => {
        if (Object.keys(this.filterData).length == 1) {
          return [
            Array(Object.keys(this.filterData).length + 2).fill(
              Object.values(this.filterData)[0]
            ),
          ];
        } else {
          return [Object.values(this.filterData)];
        }
      });

    WIB_high.enter()
      .append('path')
      .merge(WIB_high)
      .attr('class', 'WIB_high')
      .attr('fill', 'none')
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          return 'url(#WIB-High)';
        } else {
          return 'white';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1)
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['weeklyIB'].ibHigh) + 0.1);
            } else {
              return this.yScale(Number(d['weeklyIB'].ibHigh));
            }
          })
      );
    WIB_high.exit().remove();

    ////  line high

    const WIB_low = this.chartBody
      .selectAll('path.WIB_low')
      // .data([Object.values(this.filterData)]);
      .data(() => {
        if (Object.keys(this.filterData).length == 1) {
          return [
            Array(Object.keys(this.filterData).length + 2).fill(
              Object.values(this.filterData)[0]
            ),
          ];
        } else {
          return [Object.values(this.filterData)];
        }
      });

    WIB_low.enter()
      .append('path')
      .merge(WIB_low)
      .attr('class', 'WIB_low')
      .attr('fill', 'none')
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          return 'url(#WIB-Low)';
        } else {
          return 'white';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1)
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['weeklyIB'].ibLow) + 0.1);
            } else {
              return this.yScale(Number(d['weeklyIB'].ibLow));
            }
          })
      );
    WIB_low.exit().remove();
  }
  IBbefore5hrs() {
    const ibHigh = this.chartBody
      .selectAll('path.ibHigh')
      .data([Object.values(this.filterData)]);

    ibHigh
      .enter()
      .append('path')
      .merge(ibHigh)
      .attr('class', 'ibHigh')
      .attr('fill', 'none')
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['initialBalance'].ibHigh) + 0.1);
            } else {
              return this.yScale(Number(d['initialBalance'].ibHigh));
            }
          })
      )
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          return 'url(#line-ib4)';
        } else {
          return '#69fc56';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1);
    ibHigh.exit().remove();
    const ibLow = this.chartBody
      .selectAll('path.ibLow')
      .data([Object.values(this.filterData)]);

    ibLow
      .enter()
      .append('path')
      .merge(ibLow)
      .attr('class', 'ibLow')
      .attr('fill', 'none')
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['initialBalance'].ibLow) + 0.1);
            } else {
              return this.yScale(Number(d['initialBalance'].ibLow));
            }
          })
      )
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          return 'url(#line-ib4)';
        } else {
          return '#69fc56';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1);
    ibLow.exit().remove();
    const ib1_5U = this.chartBody
      .selectAll('path.ib1_5U')
      .data([Object.values(this.filterData)]);

    ib1_5U
      .enter()
      .append('path')
      .merge(ib1_5U)
      .attr('class', 'ib1_5U')
      .attr('fill', 'none')
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['initialBalance'].ib1_5U) + 0.1);
            } else {
              return this.yScale(Number(d['initialBalance'].ib1_5U));
            }
          })
      )
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          return 'url(#line-ib1)';
        } else {
          return '#69fc56';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1);
    ib1_5U.exit().remove();

    const ib2U = this.chartBody
      .selectAll('path.ib2U')
      .data([Object.values(this.filterData)]);
    ib2U
      .enter()
      .append('path')
      .merge(ib2U)
      .attr('class', 'ib2U')
      .attr('fill', 'none')
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          return 'url(#line-ib2)';
        } else {
          return 'yellow';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1)
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['initialBalance'].ib2U) + 0.1);
            } else {
              return this.yScale(Number(d['initialBalance'].ib2U));
            }
          })
      );
    ib2U.exit().remove();
    const ib3U = this.chartBody
      .selectAll('path.ib3U')
      .data([Object.values(this.filterData)]);
    ib3U
      .enter()
      .append('path')
      .merge(ib3U)
      .attr('class', 'ib3U')
      .attr('fill', 'none')
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          return 'url(#line-ib3)';
        } else {
          return '#5693f5';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1)
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['initialBalance'].ib3U) + 0.1);
            } else {
              return this.yScale(Number(d['initialBalance'].ib3U));
            }
          })
      );
    ib3U.exit().remove();
    const ib1_5D = this.chartBody
      .selectAll('path.ib1_5D')
      .data([Object.values(this.filterData)]);
    ib1_5D
      .enter()
      .append('path')
      .merge(ib1_5D)
      .attr('class', 'ib1_5D')
      .attr('fill', 'none')
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          // return 'green';
          return 'url(#line-ib1)';
        } else {
          return '#69fc56';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1)
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['initialBalance'].ib1_5D) + 0.1);
            } else {
              return this.yScale(Number(d['initialBalance'].ib1_5D));
            }
          })
      );
    ib1_5D.exit().remove();
    const ib2D = this.chartBody
      .selectAll('path.ib2D')
      .data([Object.values(this.filterData)]);
    ib2D
      .enter()
      .append('path')
      .merge(ib2D)
      .attr('class', 'ib2D')
      .attr('fill', 'none')
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          return 'url(#line-ib2)';
        } else {
          return 'yellow';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1)
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['initialBalance'].ib2D) + 0.1);
            } else {
              return this.yScale(Number(d['initialBalance'].ib2D));
            }
          })
      );
    ib2D.exit().remove();
    const ib3D = this.chartBody
      .selectAll('path.ib3D')
      .data([Object.values(this.filterData)]);
    ib3D
      .enter()
      .append('path')
      .merge(ib3D)
      .attr('class', 'ib3D')
      .attr('fill', 'none')
      .attr('stroke', () => {
        if (this.selectTimeMinute <= 60) {
          return 'url(#line-ib3)';
        } else {
          return '#5693f5';
        }
      })
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1)
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['initialBalance'].ib3D) + 0.1);
            } else {
              return this.yScale(Number(d['initialBalance'].ib3D));
            }
          })
      );
    ib3D.exit().remove();
  }

  showMuteBtn(price: any) {
    this.textL
      .append('foreignObject')
      .attr('width', 35)
      .attr('height', 15)
      .html(
        `<p class="pl-1" style="color: black;cursor:pointer;border-radius: 10px;font-size:10px;font-weight:900;background-color: #32a852">mute</p>`
      )
      .attr('class', `mute-${price}`)
      .attr('x', 70)
      .attr('y', this.yScale(price) + 30)
      .on('click', () => {
        this.stopAudio(price);
      });

    this.textL
      .append('foreignObject')
      .attr('width', 35)
      .attr('height', 15)
      .html(
        `<i class="bi bi-volume-mute-fill" style="font-size:14px;color:red"></i>`
      )
      .attr('class', `vol-icon${price}`)
      .attr('x', 120)
      .attr('y', this.yScale(price) + 28);

    setTimeout(() => {
      this.stopAudio(price);
      d3.selectAll(`foreignObject.vol-icon${price}`).remove();
      d3.selectAll(`foreignObject.mute-${price}`).remove();
    }, 60000);
  }
  startAudio(price: any) {
    this.audio.play();
    this.audio.loop = true;
    this.showMuteBtn(price);
  }

  stopAudio(price: number) {
    this.audio.pause();
    this.audio.loop = false;
    d3.selectAll(`foreignObject.vol-icon${price}`).remove();
    d3.selectAll(`foreignObject.mute-${price}`).remove();
  }
  /*   send_Alert_Message(content:any){
    this.http.post(BACKEND_URL + 'sendMessage',{content}).subscribe();
  } */
  blinkedPrices: any = [];
  updateSound_ltp(data: any) {
    this.lablesList.forEach((obj: any) => {
      let check_Label_price = this.blinkedPrices.filter(
        (item: any) => item.label == obj.label && item.price == obj.price
      );
      if (check_Label_price.length == 0) {
        if (
          data.latestTradedPrice >= obj.price - 2 &&
          data.latestTradedPrice <= obj.price + 2
        ) {
          this.blinkedPrices.push(obj);
          /* this.send_Alert_Message(
            `Alert !!!
            current price touched your ${obj.label} : ${obj.price}`
          ) */
          this.http
            .post(BACKEND_URL + 'updateUserLabels', {
              label: obj.label,
              AlertStatus: obj.AlertStatus,
            })
            .subscribe();
          this.startAudio(obj.price);
          const interval = setInterval(() => {
            const last_day_vpoc = this.chartBody
              .selectAll(`path.line${obj.price}`)
              .data(() => {
                if (Object.keys(this.filterData).length == 1) {
                  return [
                    Array(Object.keys(this.filterData).length + 2).fill(
                      obj.price
                    ),
                  ];
                } else {
                  return [
                    Array(Object.keys(this.filterData).length).fill(obj.price),
                  ];
                }
              });
            last_day_vpoc
              .enter()
              .append('path')
              .merge(last_day_vpoc)
              .attr('class', `line${obj.price}`)
              .attr('fill', 'none')
              .attr('stroke', obj.color)
              .attr('stroke-dasharray', '7,7')
              .attr('stroke-width', 1)
              .attr(
                'd',
                d3
                  .line()
                  .x((d, i) => this.xScaleZ(i))
                  .y((d, i) => this.yScale(d))
              );
            last_day_vpoc.exit().remove();
            setTimeout(() => {
              d3.selectAll(`path.line${obj.price}`).remove();
            }, 1000);
          }, 2000);
          setTimeout(() => {
            clearInterval(interval);
            setTimeout(() => {
              this.updateLabels();
            }, 2000);
          }, 60000);
        }
      }
    });
  }
  updateRedAndPurpleLine() {
    const vwapLine = this.chartBody
      .selectAll('path.vwapLine')
      // .data([Object.values(this.filterData), Object.values(this.filterData)]);
      .data(() => {
        if (Object.keys(this.filterData).length == 1) {
          return [
            Array(Object.keys(this.filterData).length + 2).fill(
              Object.values(this.filterData)[0]
            ),
          ];
        } else {
          return [Object.values(this.filterData)];
        }
      });
    vwapLine
      .enter()
      .append('path')
      .merge(vwapLine)
      .attr('class', 'vwapLine')
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScale(i))
          .y((d) => this.yScale(d.vwap))
      );
    vwapLine.exit().remove();

    const pocLine = this.chartBody.selectAll('path.vpocLine').data(() => {
      if (Object.keys(this.filterData).length == 1) {
        return [
          Array(Object.keys(this.filterData).length + 2).fill(
            Object.values(this.filterData)[0]
          ),
        ];
      } else {
        return [Object.values(this.filterData)];
      }
    });
    pocLine
      .enter()
      .append('path')
      .merge(pocLine)
      .attr('class', 'vpocLine')
      .attr('fill', 'none')
      .attr('stroke', 'purple')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x((d: any, i: any) => this.xScale(i))
          .y((d: any, i: any) => this.yScale(Number(d['full_vpoc'].price)))
      );
    pocLine.exit().remove();
    const totalVAH_Line = this.chartBody
      .selectAll('path.totalVAH_Line')
      .data(() => {
        if (Object.keys(this.filterData).length == 1) {
          return [
            Array(Object.keys(this.filterData).length + 2).fill(
              Object.values(this.filterData)[0]
            ),
          ];
        } else {
          return [Object.values(this.filterData)];
        }
      });
    totalVAH_Line
      .enter()
      .append('path')
      .merge(totalVAH_Line)
      .attr('class', 'totalVAH_Line')
      .attr('fill', 'none')
      .attr('stroke', '#03ebfc')
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x((d: any, i: any) => this.xScale(i))
          .y((d: any, i: any) => this.yScale(Number(d['full_value_Area'].vah)))
      );
    totalVAH_Line.exit().remove();
    const totalVAL_Line = this.chartBody
      .selectAll('path.totalVAL_Line')
      .data(() => {
        if (Object.keys(this.filterData).length == 1) {
          return [
            Array(Object.keys(this.filterData).length + 2).fill(
              Object.values(this.filterData)[0]
            ),
          ];
        } else {
          return [Object.values(this.filterData)];
        }
      });
    totalVAL_Line
      .enter()
      .append('path')
      .merge(totalVAL_Line)
      .attr('class', 'totalVAL_Line')
      .attr('fill', 'none')
      .attr('stroke', '#03ebfc')
      .attr('stroke-dasharray', '7,7')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x((d: any, i: any) => this.xScale(i))
          .y((d: any, i: any) => this.yScale(Number(d['full_value_Area'].val)))
      );
    totalVAL_Line.exit().remove();
  }

  setYstep() {
    const domain = this.yScale.domain();
    const range = this.yScale.range();
    const step = Math.round((domain[1] - domain[0]) / (range[0] / 20));
    this.yStep = step > 1 ? step / 2 : 0;
  }

  zoomed = async () => {
    const self = this;
    const t = d3.event.transform;
    this.xScaleZ = t.rescaleX(this.xScale);

    this.update_zoom_effect();

    this.updateleftSideandRightSideTextData(false);
    this.updateGTextAndMiddleLine();

    this.xAxisG.call(this.xAxis);
    this.xAxisG.call(
      d3
        .axisBottom(this.xScaleZ)
        .tickFormat((d, i) => {
          let date = this.timeRangeData[d];
          if (date === undefined) {
            return '';
          }
          // return this.multiFormat(date);
          if (this.selectTimeMinute == 1440) {
            return moment(date).format('MMM DD YY');
          } else {
            if (Object.keys(this.mergedObj).indexOf(date.toString()) != -1) {
              // after merged  single date
              const returnTime: any = Object.values(
                this.mergedObj[date.toString()]
              );
              let mergedDate =
                new Date(returnTime[0]).getHours() +
                ':' +
                new Date(returnTime[0]).getMinutes() +
                ' - ' +
                new Date(returnTime.slice(-1)[0]).getHours() +
                ':' +
                new Date(returnTime.slice(-1)[0]).getMinutes();
              return mergedDate;
            } else {
              // return this.multiFormat(date);
              let hours: string = new Date(date.toString())
                .getHours()
                .toString();
              let minutes: string = new Date(date.toString())
                .getMinutes()
                .toString();
              if (hours.length == 1) {
                hours = '0' + hours;
              }
              if (minutes.length == 1) {
                minutes = '0' + minutes;
              }
              return hours + ':' + minutes;
            }
          }
        })
        // .tickSize(-this.height)
        .tickSizeOuter(0)
    );
    await this.updateEveryTicks();
    //checking x axis ticks
    this.xAxisG.selectAll('.tick text').each(function (this: any, d: number) {
      if (this.innerHTML === '' && self.timeRangeData[d] === undefined) {
        this.parentNode.style.display = 'none';
      } else {
        this.parentNode.style.display = 'block';
      }
    });
    this.xAxisG.selectAll('.tick text').style('fill', 'white');
  };

  zoomEnd = () => {};
  zoomStart = () => {};

  async updateEveryTicks() {
    //   -----------------------  charts lines start ----------------------
    //vwap
    this.chartBody.selectAll('path.vwapLine').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i))
        .y((d) => this.yScale(d.vwap))
    );

    this.chartBody.selectAll('path.ibHigh').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i))
        .y((d, i) => {
          if (i == 2) {
            return this.yScale(Number(d['initialBalance'].ibHigh) + 0.1);
          } else {
            return this.yScale(Number(d['initialBalance'].ibHigh));
          }
        })
    );
    this.chartBody.selectAll('path.ibLow').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i))
        .y((d, i) => {
          if (i == 2) {
            return this.yScale(Number(d['initialBalance'].ibLow) + 0.1);
          } else {
            return this.yScale(Number(d['initialBalance'].ibLow));
          }
        })
    );
    this.chartBody.selectAll('path.ib1_5U').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i))
        .y((d, i) => {
          if (i == 2) {
            return this.yScale(Number(d['initialBalance'].ib1_5U) + 0.1);
          } else {
            return this.yScale(Number(d['initialBalance'].ib1_5U));
          }
        })
    );

    this.chartBody.selectAll('path.ib2U').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i))
        .y((d, i) => {
          if (i == 2) {
            return this.yScale(Number(d['initialBalance'].ib2U) + 0.1);
          } else {
            return this.yScale(Number(d['initialBalance'].ib2U));
          }
        })
    );
    this.chartBody.selectAll('path.ib3U').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i))
        .y((d, i) => {
          if (i == 2) {
            return this.yScale(Number(d['initialBalance'].ib3U) + 0.1);
          } else {
            return this.yScale(Number(d['initialBalance'].ib3U));
          }
        })
    );
    this.chartBody.selectAll('path.ib1_5D').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i))
        .y((d, i) => {
          if (i == 2) {
            return this.yScale(Number(d['initialBalance'].ib1_5D) + 0.1);
          } else {
            return this.yScale(Number(d['initialBalance'].ib1_5D));
          }
        })
    );
    this.chartBody.selectAll('path.ib2D').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i))
        .y((d, i) => {
          if (i == 2) {
            return this.yScale(Number(d['initialBalance'].ib2D) + 0.1);
          } else {
            return this.yScale(Number(d['initialBalance'].ib2D));
          }
        })
    );
    this.chartBody.selectAll('path.ib3D').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i))
        .y((d, i) => {
          if (i == 2) {
            return this.yScale(Number(d['initialBalance'].ib3D) + 0.1);
          } else {
            return this.yScale(Number(d['initialBalance'].ib3D));
          }
        })
    );
    // --------------   weekly ib group  -------------

    if (this.weeklyIB_Obj) {
      //HIGH
      this.chartBody.selectAll('path.WIB_high').attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScaleZ(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['weeklyIB'].ibHigh) + 0.1);
            } else {
              return this.yScale(Number(d['weeklyIB'].ibHigh));
            }
          })
      );
      //LOW
      this.chartBody.selectAll('path.WIB_low').attr(
        'd',
        d3
          .line()
          .x((d, i) => this.xScaleZ(i))
          .y((d, i) => {
            if (i == 2) {
              return this.yScale(Number(d['weeklyIB'].ibLow) + 0.1);
            } else {
              return this.yScale(Number(d['weeklyIB'].ibLow));
            }
          })
      );
      //after 5 hours ib text
      //high
      this.textR
        .selectAll('text.WIB_TH')
        .attr('x', 35)
        .attr('y', (d) => this.yScale(Number(d['weeklyIB'].ibHigh)));
      //low
      this.textR
        .selectAll('text.WIB_TL')
        .attr('x', 35)
        .attr('y', (d) => this.yScale(Number(d['weeklyIB'].ibLow)));
    }

    // --------------------- weekly ib group end --------------

    //purpleLine
    this.chartBody.selectAll('path.vpocLine').attr(
      'd',
      d3
        .line()
        .x((d: any, i: any) => this.xScaleZ(i))
        .y((d: any) => this.yScale(Number(d['full_vpoc'].price)))
    );
    //totalVAH_Line
    this.chartBody.selectAll('path.totalVAH_Line').attr(
      'd',
      d3
        .line()
        .x((d: any, i: any) => this.xScaleZ(i))
        .y((d: any) => this.yScale(Number(d['full_value_Area'].vah)))
    );
    //totalVAL_Line
    this.chartBody.selectAll('path.totalVAL_Line').attr(
      'd',
      d3
        .line()
        .x((d: any, i: any) => this.xScaleZ(i))
        .y((d: any) => this.yScale(Number(d['full_value_Area'].val)))
    );

    //redline
    if (this.selectTimeMinute != 1440) {
      this.tableBody.selectAll('path.vAvgLine').attr(
        'd',
        d3
          .line()
          .x((d: any, i: any) => this.xScaleZ(i))
          .y((d: any) => this.y(d))
      );
    }
    //  ------------------ end of charts  lines  ------------------

    //text and its position for labelText
    if (this.lablesList.length > 0) {
      this.lablesList.forEach((data) => {
        this.textL
          .selectAll(`text.text${data.price}`)
          .attr('x', 60)
          .attr('y', (d) => this.yScale(Number(d.price)));
        this.textL
          .selectAll('tspan.fdate')
          .attr('x', 70)
          .attr('y', (d) => this.yScale(Number(d.price)) + 15);
        //labelLine
        this.chartBody.selectAll(`path.line${data.price}`).attr(
          'd',
          d3
            .line()
            .x((d: any, i: any) => this.xScaleZ(i))
            .y((d: any) => this.yScale(Number(d)))
        );
      });
    }

    //  ------------------ chart text starts  --------------------
    if (this.emptyFinalObj) {
      this.chartBody.selectAll('g.barTexts').attr(
        'transform',
        (d, i) =>
          `translate(${
            // this.xScaleZ(i) + this.xBand.bandwidth() / 2 - this.barTextWith
            this.xScaleZ(i) + this.xBand.bandwidth() / 8
          },0)`
      );
      this.chartBody.selectAll('g.barTexts1').attr(
        'transform',
        (d, i) =>
          `translate(${
            // this.xScaleZ(i) + this.xBand.bandwidth() / 2 - this.barTextWith
            this.xScaleZ(Object.keys(this.filterData).length - 1) +
            this.xBand.bandwidth() / 8
          },0)`
      );
    } else if (this.socketConnected) {
      this.chartBody.selectAll('g.barTexts1').attr(
        'transform',
        (d, i) =>
          `translate(${
            // this.xScaleZ(i) + this.xBand.bandwidth() / 2 - this.barTextWith
            this.xScaleZ(Object.keys(this.filterData).length - 1) +
            this.xBand.bandwidth() / 8
          },0)`
      );
    }
    this.chartBody.selectAll('g.barTexts').attr(
      'transform',
      (d, i) =>
        `translate(${
          // this.xScaleZ(i) + this.xBand.bandwidth() / 2 - this.barTextWith
          this.xScaleZ(i) + this.xBand.bandwidth() / 8
        },0)`
    );

    this.tableBody
      .selectAll('g.tableColumn')
      .attr(
        'transform',
        (d, i) => `translate(${this.xScaleZ(i) - this.xBand.bandwidth() / 2},0)`
      );

    this.tableBody
      .selectAll('.mybar')
      // .attr('transform', 'translate(0,-10)')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2)
      .attr('y', (d) => this.y(d));

    this.tableBody
      .selectAll('g.tableColumn')
      .selectAll('rect')
      .attr('width', this.xBand.bandwidth() - 7);

    this.tableBody
      .selectAll('g.tableColumn')
      .selectAll('text')
      .attr('x', this.xBand.bandwidth() - 12);

    /* //left ellipse position for x6
    /*     this.chartBody
      .selectAll('g.barTexts')
      .selectAll('rect.leftSideX6')
      .attr(
        'y',
        (d) =>
          this.yScale(Math.round(d.key)) -
          (this.yScale(Math.round(d.key)) -
            this.yScale(Math.round(d.key) + 1)) /
            2
      )
      .attr(
        'height',
        (d) =>
          this.yScale(Math.round(d.key)) - this.yScale(Math.round(d.key) + 1)
      ); */

    //right text position for x6
    /* this.chartBody
      .selectAll('g.barTexts')
      .selectAll('rect.rightSideX6')
      .attr(
        'y',
        (d) =>
          this.yScale(Math.round(d.key)) -
          (this.yScale(Math.round(d.key)) -
            this.yScale(Math.round(d.key) + 1)) /
            2
      )
      .attr(
        'height',
        (d) =>
          this.yScale(Math.round(d.key)) - this.yScale(Math.round(d.key) + 1)
      ); */

    //left ellipse position for x9
    // this.chartBody
    //   .selectAll('g.barTexts')
    //   .selectAll('ellipse.leftSideX9')
    //   .attr('cx', (this.barTextWith / 2) * 0.2)
    //   .attr('cy', (d) => this.yScale(Math.round(d.key)))
    //   .attr('rx', (this.barTextWith / 2) * 0.8)
    //   .attr(
    //     'ry',
    //     (d) =>
    //       (this.yScale(Math.round(d.key)) -
    //         this.yScale(Math.round(d.key) + 1)) /
    //       2
    //   );

    //right ellipse position for x9
    // this.chartBody
    //   .selectAll('g.barTexts')
    //   .selectAll('ellipse.rightSideX9')
    //   .attr('cx', this.barTextWith / 2 + (this.barTextWith / 2) * 0.2)
    //   .attr('cy', (d) => this.yScale(Math.round(d.key)))
    //   .attr('rx', (this.barTextWith / 2) * 0.8)
    //   .attr(
    //     'ry',
    //     (d) =>
    //       (this.yScale(Math.round(d.key)) -
    //         this.yScale(Math.round(d.key) + 1)) /
    //       2
    //   ); */

    //text and its position
    if (this.socketConnected) {
      this.chartBody
        .selectAll('g.barTexts1')
        .selectAll('text')
        .attr('y', (d) => {
          return this.yScale(Math.round(d.key));
        })
        .text((d) => d.val);
    }

    this.chartBody
      .selectAll('g.barTexts')
      .selectAll('text')
      .attr('y', (d) => {
        return this.yScale(Math.round(d.key));
      })
      .text((d) => d.val);
    //last price at y axis
    this.textR
      .selectAll('text.ltpText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(d.latestTradedPrice));
    //last price at y axis
    this.textR
      .selectAll('text.vahText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(d['full_value_Area'].vah));
    //last price at y axis
    this.textR
      .selectAll('text.valText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(d['full_value_Area'].val));
    //text and its position for vwapText
    this.textR
      .selectAll('text.vwapText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(d.vwap));
    //text and its position for vpocText
    this.textR
      .selectAll('text.vpocText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['full_vpoc'].price)));
    //text and its position for dpocText
    this.textR
      .selectAll('text.dpocText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['full_dpoc'].price)));

    //text and its position for ib
    this.textR
      .selectAll('text.ibHighText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['initialBalance'].ibHigh)));
    this.textR
      .selectAll('text.ibLowText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['initialBalance'].ibLow)));
    this.textR
      .selectAll('text.ib1_5UText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['initialBalance'].ib1_5U)));
    this.textR
      .selectAll('text.ib2UText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['initialBalance'].ib2U)));
    this.textR
      .selectAll('text.ib3UText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['initialBalance'].ib3U)));
    this.textR
      .selectAll('text.ib1_5DText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['initialBalance'].ib1_5D)));
    this.textR
      .selectAll('text.ib2DText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['initialBalance'].ib2D)));
    this.textR
      .selectAll('text.ib3DText')
      .attr('x', 35)
      .attr('y', (d) => this.yScale(Number(d['initialBalance'].ib3D)));

    //
    this.chartBody
      .selectAll('text.RS_RB_text')
      .attr(
        'x',
        (d: any, i: any) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 15
      )
      .attr('y', (d: any) => {
        let perc = (d.startLine - d.endLine) * 0.2;

        if (
          d['volumePOC'].price <= d.startLine &&
          d['volumePOC'].price >= d.startLine - perc
        ) {
          return this.yScale(d.startLine) - 30;
        } else if (
          d['volumePOC'].price >= d.endLine &&
          d['volumePOC'].price <= d.endLine + perc
        ) {
          return this.yScale(d.endLine) + 40;
        }
      });
    // ------------------  end of text ----------------------

    // --------------- extra bars and checkbox ----------------

    //VolumeBar position
    this.chartBody
      .selectAll('.volumeBar')
      .attr('transform', 'translate(0,-5)')
      .attr('y', (d, i) => this.yScale(Object.keys(d)[0]))
      .attr('width', (d) => this.vScaleX(Object.values(d)[0]))
      .attr('height', (d) => this.vScaleY.bandwidth());

    //checkBox
    if (this.selectTimeMinute != 1440) {
      this.chartBody
        .selectAll('.checkBox')
        .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 4)
        .attr('y', (d, i) => {
          return this.yScale(d.startLine) - 40;
        });
    }

    //
    this.chartBody
      .selectAll('text.indicator1')
      .attr(
        'x',
        (d: any, i: any) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20
      )
      .attr('y', (d: any) => this.yScale(d.endLine) + 20)
      .attr('fill', function (d) {
        if (d.PIVOTGREEN == 'PIVOT') {
          return '#bffc6f';
        } else {
          return '';
        }
      });

    //
    this.chartBody
      .selectAll('text.indicator2')
      .attr(
        'x',
        (d: any, i: any) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20
      )
      .attr('y', (d: any) => this.yScale(d.startLine) - 10)
      .attr('fill', function (d: any) {
        if (d.PIVOTRED == 'PIVOT') {
          return 'red';
        } else {
          return '';
        }
      });

    //stem position
    this.chartBody
      .selectAll('.stem')
      .attr(
        'x1',
        (d: any, i: any) =>
          this.xScaleZ(i) - this.xBand.bandwidth() / 2 + this.barWidth / 2
      )
      .attr(
        'x2',
        (d: any, i: any) =>
          this.xScaleZ(i) - this.xBand.bandwidth() / 2 + this.barWidth / 2
      )
      .attr('y1', (d) => this.yScale(this.filterData[d].startLine))
      .attr('y2', (d) => this.yScale(this.filterData[d].endLine));
    //candle position
    this.chartBody
      .selectAll('.candle')
      .attr(
        'x',
        (d: any, i: any) => this.xScaleZ(i) - this.xBand.bandwidth() / 2
      )
      .attr('y', (d: any) =>
        this.yScale(Math.max(this.filterData[d].start, this.filterData[d].end))
      )
      .attr('width', this.barWidth)
      .attr('height', (d: any) =>
        this.filterData[d].start === this.filterData[d].end
          ? '1'
          : this.yScale(
              Math.min(this.filterData[d].start, this.filterData[d].end)
            ) -
            this.yScale(
              Math.max(this.filterData[d].start, this.filterData[d].end)
            )
      )
      .attr('fill', (d) =>
        this.filterData[d].start === this.filterData[d].end
          ? 'silver'
          : this.filterData[d].start > this.filterData[d].end
          ? 'red'
          : 'green'
      );
    return '';
  }

  updatingDOMvalues(data: any) {
    //getting DOM element
    // ## updating every values
    $('#ibhTimer').text('IBH TIMER : ' + this.displayIB(this.ibHTimer));
    $('#iblTimer').text('IBL TIMER : ' + this.displayIB(this.ibLTimer));
    //weekly ib
    if (this.weeklyIB_Obj) {
      $('#w-high').text(data['weeklyIB'].ibHigh.toFixed(2));
      $('#w-low').text(data['weeklyIB'].ibLow.toFixed(2));
      $('#wibhTimer').text('WIBH TIMER : ' + this.displayIB(this.ibHWTimer));
      $('#wiblTimer').text('WIBL TIMER : ' + this.displayIB(this.ibLWTimer));
    } else {
      $('#w-high').text('null');
      $('#w-low').text('null');
      $('#wibhTimer').text('WIBH TIMER : ' + '00 : 00');
      $('#wiblTimer').text('WIBL TIMER : ' + '00 : 00');
    }

    // display ohlc
    $('#ohlc_O').text(data['ohlc'].open.toFixed(2));
    $('#ohlc_H').text(data['ohlc'].high.toFixed(2));
    $('#ohlc_L').text(data['ohlc'].low.toFixed(2));
    $('#ohlc_C').text(data['ohlc'].close.toFixed(2));
    //updating ib values
    $('#ibHigh').text(data['initialBalance'].ibHigh.toFixed(2));
    $('#ibLow').text(data['initialBalance'].ibLow.toFixed(2));
    $('#ib').text(data['initialBalance'].ib.toFixed(2));

    $('#ib1_5U').text(data['initialBalance'].ib1_5U.toFixed(2));
    $('#ib2U').text(data['initialBalance'].ib2U.toFixed(2));
    $('#ib3U').text(data['initialBalance'].ib3U.toFixed(2));
    $('#ib1_5D').text(data['initialBalance'].ib1_5D.toFixed(2));
    $('#ib2D').text(data['initialBalance'].ib2D.toFixed(2));
    $('#ib3D').text(data['initialBalance'].ib3D.toFixed(2));
    $('#VA_H').text(data['valueArea'].vah.toFixed(2));
    $('#VA_L').text(data['valueArea'].val.toFixed(2));
  }
  //send instrument token to get ticks from kite
  tick_token: number = null;
  stop_socket_connection: boolean = false;
  start_socket_connection: boolean = false;

  async connectSocket(array: any) {
    if (this.selectTimeMinute == 1440) {
      //remove all check box from chart when its whole day chart
      d3.selectAll('foreignObject.checkBox').remove();
      d3.selectAll('foreignObject.mergeBTN').remove();
    }
    await this.$appCom.connectSocket();
    // // //connecting to socket.io
    let newFilData: any = [];

    if (this.tick_token != null) {
      array.push(this.tick_token);
    }

    this.$appCom.socket.emit(this.post_candle_token, array);
    // data streaming
    this.socketConnected = true;
    this.$appCom.socket.on(this.receive_candle_token, async (data: any) => {
      data._id = new Date().toString();

      // store every data in indexed db
      const request = indexedDB.open(this.indexDB_Name, 1);
      request.onsuccess = (e: any) => {
        const db = request.result;
        const transaction = db.transaction('data', 'readwrite');
        const storeObj = transaction.objectStore('data');
        storeObj.put(data);
      };
      if (!this.start_socket_connection) {
        this.update_chart_live(data);
      } else {
        if (!this.stop_socket_connection) {
          newFilData.push(data);
          if (newFilData.length > 3) {
            newFilData = [];
            this.stop_socket_connection = true;
            this.modify_newChart();
          }
        }
      }
    });
    setTimeout(() => {
      array = null;
    }, 5000);
  }

  filter_lastIndex: any = null;
  //update everything
  async update_chart_live(data: any) {
    this.updateSound_ltp(data);
    this.updateIBTimer(data);
    this.updatingDOMvalues(data);
    data.date = new Date(data.date);
    this.updateIBfamilyColors(data.date);

    // date
    let date: any = new Date(data.date);

    if (this.selectTimeMinute == 5) {
      date.setMinutes(5 * Math.floor(date.getMinutes() / 5));
    } else if (this.selectTimeMinute == 15) {
      date.setMinutes(15 * Math.floor(date.getMinutes() / 15));
    } else if (this.selectTimeMinute == 30) {
      let hour: number;
      let minutes: number;
      if (date.getTime() >= new Date(this.filter_lastIndex + 1.8e6).getTime()) {
        hour = date.getHours();
        minutes = date.getMinutes();
      } else {
        if (date.getHours() != new Date(this.filter_lastIndex).getHours()) {
          hour = date.getHours() - 1;
        } else {
          hour = date.getHours();
        }
        minutes = new Date(this.filter_lastIndex).getMinutes();
      }
      date.setHours(hour);
      date.setMinutes(minutes);
    } else if (this.selectTimeMinute == 60) {
      let hour: number = null;
      if (date.getMinutes() < this.minMinute) {
        hour = date.getHours() - 1;
      } else {
        hour = date.getHours();
      }
      date.setHours(hour);
      date.setMinutes(this.minMinute);
    }

    date.setSeconds(0);
    date.setMilliseconds(0);

    if (this.selectTimeMinute == 1440) {
      date.setHours(0, 0, 0, 0);
    }

    //check date with merged dates
    let dateCommitted = false;
    if (Object.keys(this.mergedObj).length > 0) {
      Object.keys(this.mergedObj).forEach((d: any) => {
        if (date == d) {
          dateCommitted = true;
        }
      });

      if (!dateCommitted) {
        Object.keys(this.mergedObj).forEach((d: any) => {
          Object.values(this.mergedObj[d]).forEach((e: any) => {
            if (date == e) {
              date = new Date(d);
            }
          });
        });
      }
    }

    if (Object.keys(this.filterData).indexOf(date.toString()) == -1) {
      this.start_socket_connection = true;
    } else {
      // if (statBool) {
      //   d3.selectAll('g.barTexts1').remove();
      //   this.updateStartAndEndLine();
      //   this.updateScales();
      //   await this.update_ImportantThings();
      //   this.mainCommon(date, false);
      //   this.main_zoom_event();
      //   statBool = false;
      // } else {
      this.calculationPart1(date.toString(), data);
      this.filterData[date.toString()].data.push(data);
      if (
        data['ohlc'].low < this.min_ohlc ||
        data['ohlc'].high > this.max_ohlc ||
        data.latestTradedPrice < this.yScale.domain()[0] ||
        data.latestTradedPrice > this.yScale.domain()[1]
      ) {
        this.emptyFinalObj = true;
        //updating checkbox
        this.updateStartAndEndLine();
        this.updateScales();
        this.appendCheckBox();
        this.updateLabels();
        this.mainCommon(date, false);
        this.main_zoom_event();
        this.max_ohlc = data['ohlc'].high;
        this.min_ohlc = data['ohlc'].low;
        this.emptyFinalObj = false;
      } else {
        this.mainCommon(date, true);
      }
    }
    // }
  }
  async update_ImportantThings() {
    this.updateleftSideandRightSideTextData(false);
    this.maintainVPOC();
    this.updateRedAndPurpleLine();
    this.updateCandle();
    this.updateSide_vpoc_bar();
    this.appendCheckBox();
    this.updateLabels();
    this.updateGTextAndMiddleLine();
    this.updateDefs();
    this.updateTablelayout();
    this.bottomBar();
    return '';
  }
  /* addNewEleToFilterData(element: any, array: any) {
    array[1].val = (array[1].total_volume - array[0].total_volume) / 50;
    const obj = array[1];
    const subObj: any = {};
    subObj['key'] = element;
    subObj.leftSideData = [];
    subObj.rightSideData = [];
    subObj.minData = [];
    subObj.maxData = [];
    // subObj.obje = {};
    subObj.PIVOTGREEN = [];
    subObj.PIVOTRED = [];
    subObj.valueArea = {};
    subObj.sumLR = [];
    subObj.left = {};
    subObj.right = {};
    subObj.data = [];
    subObj.data.push(array[0], array[1]);
    // subObj.obje[Math.round(obj.latestTradedPrice)] = obj;
    subObj.end = obj.latestTradedPrice;
    subObj.vwap = obj.vwap;
    subObj.volumePOC = {
      price: obj.latestTradedPrice,
      volume: obj.lastTradedQuantity,
    };
    subObj.initialBalance = obj.initialBalance;
    subObj.weeklyIB = obj.weeklyIB;
    subObj.latestTradedPrice = obj.latestTradedPrice;
    subObj.full_value_Area = obj.valueArea;
    subObj.leftSideData.push(array[1]);
    this.filterData[element] = subObj;
    this.vahvalValue = {};
  } */
  async getDataFrom_Indexed_DB() {
    this.modify_newChart();
  }
  async modify_newChart() {
    d3.selectAll('svg.baseSVG').remove();
    this.renderSVG();
    document.getElementById('candlestick-container').style.display = 'none';
    document.getElementById('chart-spinner').style.display = 'block';
    this.renderLayout(await this.commonSer.getDataFrom_Indexed_DB());
  }

  async clear_indexed_DB() {
    this.commonSer.clear_indexed_DB();
  }
  chartType: string = null;
  async closeSocket(bool: boolean) {
    if (bool) {
      this.commonSer.closeIndexed_DB();
    }
    if (this.socketConnected) {
      await this.$appCom.closeSocket(this.chartType);
      this.socketConnected = false;
      return '';
    } else {
      return '';
    }
  }
}
