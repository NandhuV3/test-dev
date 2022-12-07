import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { ApiService } from '../../mainService _file/api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AppComponent } from '../../app.component';
import { NGXLogger } from 'ngx-logger';
import * as moment from 'moment';
import { CommonService } from '../../mainService _file/common.service';
const BACKEND_URL = environment.apiUrl + '/api/';
declare const $: any;

@Injectable({
  providedIn: 'root',
})
export class ProfileServiceService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private $appCom: AppComponent,
    private logger: NGXLogger,
    private commonSer: CommonService
  ) {}
  socketBool: boolean = false;
  weeklyChart: boolean = false;
  socketConnected: boolean = false;
  todayData: any = [];
  timeData;
  IBHIGH;
  IBLOW;
  IB;
  IB1_5UP;
  IB2UP;
  IB3UP;
  IB1_5DOWN;
  IB2DOWN;
  IB3DOWN;
  vPOC;
  vWAP;
  //
  pIB;
  pIBHIGH;
  pIBLOW;
  pIB1_5UP;
  pIB2UP;
  pIB3UP;
  pIB1_5DOWN;
  pIB2DOWN;
  pIB3DOWN;
  F15MV;
  LTP;
  totalVolume;
  //
  apiGetOpenVol;
  apiGetOpenVolAvg;
  apiRefData;
  apiPrevDayVpoc;
  apiPrevDayVwap;
  //
  tVolA;
  tVolB;
  tVolC;
  tVolD;
  tVolE;
  tVolF;
  tVolG;
  tVolH;
  tVolI;
  tVolJ;
  tVolK;
  tVolL;
  tVolM;
  //
  pVolA;
  pVolB;
  pVolC;
  pVolD;
  pVolE;
  pVolF;
  pVolG;
  pVolH;
  pVolI;
  pVolJ;
  pVolK;
  pVolL;
  pVolM;

  //data only for testing chart
  data = [];
  data1 = [];
  data2 = [];
  //
  margin = { top: 10, right: 60, bottom: 40, left: 40 };
  containerID: string = '';
  chartData: any[] = [];
  width: number = 0;
  height: number = 0;
  baseSVG: any = null;
  svgGroup: any = null;
  zoom = d3.zoom();
  focus: any = null;
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

  yMin: any = null;
  yMax: any = null;
  yScale = d3.scaleLinear();
  yAxis = d3.axisLeft();
  chartBody: any = null;
  tableG: any = null;
  tableBody: any = null;
  tableHeader: any = null;
  parseDate = d3.timeFormat('%Y-%m-%d').parse;
  selectTimeMinute: any = '1440';
  timeRangeData = [];
  perBarWidth = 122;
  barTextWith = 60;
  barWidth = 10;
  tableHeight = 300;
  yStep = 0;
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
  x: any;
  dbData: any[] = [];
  wsData: any[] = [];
  changeChart: any;
  current_Week_prices: any;

  // Define filter conditions
  multiFormat = (date: any) => {
    return (
      d3.timeMonth(date) < date
        ? d3.timeWeek(date) < date
          ? this.formatDay
          : this.formatWeek
        : d3.timeYear(date) < date
        ? this.formatMonth
        : this.formatYear
    )(date);
  };

  init() {
    this.chartData = [];
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
      .style('width', '100%');
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
      .on('zoom', this.zoomed)
      .on('zoom.end', this.zoomend);

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
          (this.height - this.tableHeight + this.margin.bottom) +
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

    this.focus
      .append('rect')
      .attr('id', 'rect')
      .attr('width', this.width - this.margin.left - this.margin.right)
      .attr('height', this.height - this.tableHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('clip-path', 'url(#clip)')
      .on('dblclick', (d) => this.toggleEvent());
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

    this.chartBody = this.focus
      .append('g')
      .attr('class', 'chartBody')
      .attr('clip-path', 'url(#clip)');
    this.tableBody = this.tableG
      .append('g')
      .attr('class', 'tableBody')
      .attr('clip-path', 'url(#tableClip)');
  }

  updateTimeDateRange() {
    const dates = this.chartData.map((d: any) => new Date(d.date));
    this.timeRangeData = dates;
  }

  updateRectAndLine() {
    const candles = this.chartBody.selectAll('.candle').data(this.chartData);

    candles
      .enter()
      .append('rect')
      .merge(candles)
      .attr('class', 'candle')
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth() / 2)
      .attr('y', (d) =>
        this.yScale(Math.max(d['valueArea'].vah, d['valueArea'].val))
      )
      .attr('width', this.barWidth)
      .attr('height', (d) => {
        return d['valueArea'].vah === d['valueArea'].val
          ? 1
          : this.yScale(Math.min(d['valueArea'].vah, d['valueArea'].val)) -
              this.yScale(Math.max(d['valueArea'].vah, d['valueArea'].val));
      })
      .attr('fill', (d) =>
        d['valueArea'].vah === d['valueArea'].val ? 'silver' : 'blue'
      );
    candles.exit().remove();
    //
    const vahText = this.chartBody.selectAll('.vahText').data(this.chartData);

    vahText
      .enter()
      .append('text')
      .merge(vahText)
      .attr('class', 'vahText')
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['valueArea'].vah))
      .text((d) => Math.round(d['valueArea'].vah))
      .attr('fill', '#d1c3c2')
      .attr('font-size', '8px')
      .attr('font-weight', 900)
      .attr('text-anchor', 'start')
      .attr('font-family', 'monospace');
    vahText.exit().remove();
    //
    const valText = this.chartBody.selectAll('.valText').data(this.chartData);

    valText
      .enter()
      .append('text')
      .merge(valText)
      .attr('class', 'valText')
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['valueArea'].val))
      .text((d) => Math.round(d['valueArea'].val))
      .attr('fill', '#d1c3c2')
      .attr('font-size', '8px')
      .attr('font-weight', 900)
      .attr('text-anchor', function (d) {
        if (
          Math.abs(d['valueArea'].val - d['ohlc'].low) < 10 ||
          Math.abs(d['valueArea'].vah - d['ohlc'].high) < 10
        ) {
          return 'end';
        } else {
          return 'start';
        }
      })
      .attr('font-family', 'monospace');
    valText.exit().remove();

    const stems = this.chartBody
      .selectAll('line.stem')
      .data(this.chartData, (i) => i);

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
      .attr('y1', (d) => this.yScale(d['ohlc'].high))
      .attr('y2', (d) => this.yScale(d['ohlc'].low))
      .attr('stroke', '#5a5a5a');
    stems.exit().remove();
    //
    const ohlcHigh = this.chartBody
      .selectAll('.ohlcTextHigh')
      .data(this.chartData);

    ohlcHigh
      .enter()
      .append('text')
      .merge(ohlcHigh)
      .attr('class', 'ohlcTextHigh')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['ohlc'].high))
      .text((d) => Math.round(d['ohlc'].high))
      .attr('fill', '#d1c3c2')
      .attr('font-size', '8px')
      .attr('font-weight', 900)
      .attr('text-anchor', 'start')
      .attr('font-family', 'monospace');
    ohlcHigh.exit().remove();
    //
    const ohlcLow = this.chartBody
      .selectAll('.ohlcTextLow')
      .data(this.chartData);

    ohlcLow
      .enter()
      .append('text')
      .merge(ohlcLow)
      .attr('class', 'ohlcTextLow')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['ohlc'].low))
      .text((d) => Math.round(d['ohlc'].low))
      .attr('fill', '#d1c3c2')
      .attr('font-size', '8px')
      .attr('font-weight', 900)
      .attr('text-anchor', 'start')
      .attr('font-family', 'monospace');
    ohlcLow.exit().remove();
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
      .data(this.chartData);
    const perRowHight = 120 / 3;
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
          V: d.total_volume / 50,
          DR: Math.round(d['ohlc'].high) - Math.round(d['ohlc'].low),
          VAR: Math.round(d['valueArea'].vah) - Math.round(d['valueArea'].val),
          VRR: Math.round(
            d.total_volume /
              50 /
              (Math.round(d['ohlc'].high) - Math.round(d['ohlc'].low))
          ),
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
          .attr('transform', 'translate(0,150)')
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
          .attr('transform', 'translate(0,150)')
          .text((d) => mapObj[d]);
        tableText.exit().remove();
      });

    tableColumn.exit().remove();
    //tableHeader
    const tableHeaderRect = this.tableHeader
      .selectAll('rect.tableHeaderRect')
      .data(['V', 'DR', 'VAR', 'VRR']);
    tableHeaderRect
      .enter()
      .append('rect')
      .merge(tableHeaderRect)
      .attr('x', 0)
      .attr('class', 'tableHeaderRect')
      .attr('y', (d, i) => perRowHight * i)
      .attr('width', this.margin.left)
      .attr('height', perRowHight)
      .attr('stroke', '#5a5a5a')
      .attr('transform', 'translate(0,150)')
      .style('fill', '#000');
    tableHeaderRect.exit().remove();
    const tableHeaderText = this.tableHeader
      .selectAll('text.tableHeaderText')
      .data(['V', 'DR', 'VAR', 'VRR']);
    tableHeaderText
      .enter()
      .append('text')
      .merge(tableHeaderText)
      .attr('class', 'tableHeaderText')
      .attr('y', (d, i) => perRowHight * i + perRowHight / 2)
      .attr('x', (d, i) => this.margin.left / 2)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .attr('transform', 'translate(0,150)')
      .text((d) => d);
    tableHeaderText.exit().remove();
  }

  updateScales() {
    const self = this;

    this.xScale = d3
      .scaleLinear()
      .domain([-1, this.timeRangeData.length])
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
      .padding(0.2);
    this.xAxis = d3
      .axisBottom()
      .scale(this.xScale)
      .tickFormat((d: any, i: any) => {
        let date = this.timeRangeData[d];
        if (date === undefined) {
          return '';
          if (i !== 0) {
            date = this.timeRangeData[this.timeRangeData.length - 1];
          } else {
            date = this.timeRangeData[0];
          }
        }
        return this.multiFormat(date);
      })
      .tickSizeOuter(0);

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
    const data: any = this.chartData;
    const filtered = data.filter((d) => {
      return (
        new Date(d.date).valueOf() >= minDate.valueOf() &&
        new Date(d.date).valueOf() <= maxDate.valueOf()
      );
    });

    this.yMin = d3.min(filtered, (d: any) => d['ohlc'].low);
    this.yMax = d3.max(filtered, (d: any) => d['ohlc'].high);

    const buffer = Math.floor((this.yMax - this.yMin) * 0.1);
    this.yScale
      .domain([this.yMin - buffer, this.yMax + buffer])
      .range([this.height - this.tableHeight, 0]);
    this.yAxisG.call(
      d3
        .axisRight()
        .scale(this.yScale)
        .tickFormat((d) => d)
        .tickSize(-(this.width - this.margin.left))
        .tickSizeOuter(0)
    );
    // this.yAxisG.call(this.yAxis);
    this.yAxisG.selectAll('line').style('stroke', 'black');
    this.yAxisG.selectAll('text').style('fill', '#fffff');
  }
  Array_POC: any = {};
  volumePOC: any = {};
  valueArea: any = {};
  maintainVPOC(Array_POC: any) {
    let volumePOC = {};
    let valueArea = {};
    var highVol_price = Object.keys(Array_POC).reduce((a, b) =>
      Array_POC[a] > Array_POC[b] ? a : b
    );
    var total_volume: any = Object.values(Array_POC).reduce(
      (a: any, b: any) => a + b
    );
    volumePOC = {
      price: highVol_price,
      volume: Array_POC[highVol_price],
    };
    var valueAreaVolume = Number(Array_POC[highVol_price]);
    var oneUpPrice = Number(highVol_price);
    var oneDownPrice = Number(highVol_price);
    var vah = Number(highVol_price);
    var val = Number(highVol_price);
    var oneUpVolume = 0;
    var oneDownVolume = 0;
    var f = Object.keys(Array_POC).indexOf(highVol_price.toString());
    var i = 1;
    var j = 1;
    while (valueAreaVolume / total_volume < 0.7) {
      oneUpPrice = Number(Object.keys(Array_POC)[f + i]);
      oneDownPrice = Number(Number(Object.keys(Array_POC)[f - j]));
      oneUpVolume = Array_POC[oneUpPrice];
      oneDownVolume = Array_POC[oneDownPrice];

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

    valueArea = {
      vah: vah,
      val: val,
      valueAreaVolume: valueAreaVolume,
    };

    return {
      volumePOC: volumePOC,
      valueArea: valueArea,
    };
  }

  renderLayout() {
    $('#candlestick-container').css('display', 'block');
    let dataObj = [];
    let chartArr = [];
    if (this.weeklyChart) {
      var i = 0;
      this.chartData.forEach((obj) => {
        let date = new Date(obj.date).getDay();
        if (!dataObj[i]) {
          dataObj[i] = [];
        }
        if (date >= 1 && date <= 4) {
          dataObj[i].push(obj);
        } else if (date == 5) {
          i++;
          dataObj[i] = [obj];
        }
      });

      //   // //// ###
      dataObj.forEach((data: any) => {
        let testObj = {};
        data.forEach((obj: any) => {
          if (Object.keys(testObj).length == 0) {
            testObj = obj;
          } else {
            testObj['date'] = obj['date'];
            testObj['total_volume'] += obj['total_volume'];
            if (testObj['ohlc'].low > obj['ohlc'].low) {
              testObj['ohlc'].low = obj['ohlc'].low;
            }
            if (testObj['ohlc'].high < obj['ohlc'].high) {
              testObj['ohlc'].high = obj['ohlc'].high;
            }
            Object.keys(obj['overAll_price']).forEach((d) => {
              if (
                Object.keys(testObj['overAll_price']).indexOf(d.toString()) !=
                -1
              ) {
                testObj['overAll_price'][d] += obj['overAll_price'][d];
              }
            });
          }
          const result: any = this.maintainVPOC(testObj['overAll_price']);
          testObj['volumePOC'] = result.volumePOC;
          testObj['valueArea'] = result.valueArea;
        });
        chartArr.push(testObj);
        testObj = null;
      });

      this.chartData = chartArr;
      chartArr = null;
    }
    if (new Date().getDay() != 5) {
      this.current_Week_prices = this.chartData.slice(-1)[0]['overAll_price'];
    }

    // //                  ////                    /////               /////
    this.chartData.sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    this.chartData.forEach((d) => {
      d.volumePOC.price = Number(d.volumePOC.price);
    });

    this.updateTimeDateRange();
    this.updateScales();
    this.setYstep();

    this.updateRectAndLine();
    this.updateRedLine();
    this.updatePurlpeLine();
    this.updateDefs();
    this.updateTablelayout();
    this.rect();

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
    this.zoom.scaleExtent([a, a]);

    if (this.socketBool) {
      this.sendVALUEAREAobj();
    }
  }

  async sendVALUEAREAobj() {
    let date = moment(new Date()).format('YYYY-MM-DD');
    this.http.post(BACKEND_URL + 'chart-data', { date }).subscribe(
      async (data: any) => {
        this.connectSocket(await this.commonSer.vpoc_valueArea(data));
      },
      (err: any) => {
        this.logger.error(`ERROR IN PROFILE-CHART PAGE : ${err.message}`);
      }
    );
  }
  socket_ID: any;
  indexDB_Name: string = null;
  async connectSocket(array: any) {
    if (this.socketConnected) {
      await this.closeSocket;
    }
    this.$appCom.connectSocket();

    this.$appCom.socket.emit('candle-data', array);
    this.$appCom.socket.on('candle-ticks', (data: any) => {
      this.socketConnected = true;
      data['volumePOC'].price = Number(data['volumePOC'].price);

      if (this.weeklyChart) {
        this.current_Week_prices[data['latestTradedPrice']] +=
          data['lastTradedQuantity'];
      }
      this.chartData = [...this.chartData, data];
      this.updateTimeDateRange();
      this.updateScales();
      this.setYstep();

      this.updateRectAndLine();
      this.updateRedLine();
      this.updatePurlpeLine();
      this.updateDefs();
      this.updateTablelayout();
      this.rect();

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
      this.zoom.scaleExtent([a, a]);
      this.chartData.pop();
    });
    setTimeout(() => {
      array = null;
    }, 5000);
  }

  rect() {
    const data = this.chartData.map((d) => d.total_volume / 50);

    var arr = [];
    var res = [];
    for (var i = 0; i < data.length; i++) {
      arr.push(data[i]);
      var val = d3.mean(arr);
      res.push(val);
    }

    var height = 100;
    // Add Y axis
    this.y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d: any) => d))
      .range([height, 0])
      .nice();
    this.tableBody
      .append('g')
      .attr('class', 'yA')
      .attr('transform', 'translate(0,30)')
      .call(d3.axisRight(this.y));
    this.tableBody.selectAll('.yA .tick line').remove();
    this.tableBody.selectAll('.yA .domain, .tick text').remove();

    // Bars
    const bar = this.tableBody.selectAll('.mybar').data(data);
    bar
      .enter()
      .append('rect')
      .merge(bar)
      .attr('class', 'mybar')
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth() / 2)
      .attr('y', (d) => this.y(d))
      .attr('width', this.xBand.bandwidth() - 7)
      .attr('height', (d) => height - this.y(d))
      .attr('fill', 'blue');
    bar.exit().remove();
    //
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
          .x((d, i) => this.xScale(i) - this.xBand.bandwidth() / 2)
          .y((d) => this.yScale(d))
      );
    vAvgLine.exit().remove();
  }
  updateRedLine() {
    const vwapLine = this.chartBody
      .selectAll('.vwapLine')
      .data([this.chartData]);
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
          .x((d, i) => this.xScale(i) - this.xBand.bandwidth() / 2)
          .y((d) => this.yScale(d.vwap))
      );
    vwapLine.exit().remove();

    //
    const vwapText = this.chartBody.selectAll('.vwapText').data(this.chartData);

    vwapText
      .enter()
      .append('text')
      .merge(vwapText)
      .attr('class', 'vwapText')
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d.vwap))
      .text((d) => Math.round(d.vwap))
      .attr('fill', 'red')
      .attr('font-size', '8px')
      .attr('font-weight', 900)
      .attr('text-anchor', function (d) {
        if (
          Math.abs(d['volumePOC'].price - d.vwap) < 10 ||
          Math.abs(d['ohlc'].high - d.vwap) < 10 ||
          Math.abs(d['ohlc'].low - d.vwap) < 10 ||
          Math.abs(d['valueArea'].vah - d.vwap) < 10 ||
          Math.abs(d['valueArea'].val - d.vwap) < 10
        ) {
          return 'end';
        } else {
          return 'start';
        }
      })
      .attr('font-family', 'monospace');
    vwapText.exit().remove();
  }
  updatePurlpeLine() {
    const pocLine = this.chartBody
      .selectAll('.vpocLine')
      .data([this.chartData]);
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
          .x((d, i) => this.xScale(i) - this.xBand.bandwidth() / 2)
          .y((d) => this.yScale(d['volumePOC'].price))
      );
    pocLine.exit().remove();
    //
    const vpocText = this.chartBody.selectAll('.vpocText').data(this.chartData);
    vpocText
      .enter()
      .append('text')
      .merge(vpocText)
      .attr('class', 'vpocText')
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['volumePOC'].price))
      .text((d) => Math.round(d['volumePOC'].price))
      .attr('fill', 'purple')
      .attr('font-size', '8px')
      .attr('font-weight', 900)
      .attr('text-anchor', function (d) {
        if (
          Math.abs(d['ohlc'].high - d['volumePOC'].price) < 10 ||
          Math.abs(d['ohlc'].low - d['volumePOC'].price) < 10 ||
          Math.abs(d['valueArea'].vah - d['volumePOC'].price) < 10 ||
          Math.abs(d['valueArea'].val - d['volumePOC'].price) < 10
        ) {
          return 'end';
        } else {
          return 'start';
        }
      })
      .attr('font-family', 'monospace');
    vpocText.exit().remove();
  }

  setYstep() {
    const domain = this.yScale.domain();
    const range = this.yScale.range();
    const step = Math.round((domain[1] - domain[0]) / (range[0] / 20));

    this.yStep = step > 1 ? step / 2 : 0;
  }
  zoomed = () => {
    const self = this;
    const t = d3.event.transform;
    this.xScaleZ = t.rescaleX(this.xScale);
    const xmin = new Date(
      this.xDateScale(Math.floor(this.xScaleZ.domain()[0]))
    );
    const xmax = new Date(this.xDateScale(Math.ceil(this.xScaleZ.domain()[1])));
    this.updateYscale(xmin, xmax);
    this.setYstep();
    this.xAxisG.call(
      d3
        .axisBottom(this.xScaleZ)
        .tickFormat((d, i) => {
          let date = this.timeRangeData[d];
          if (date === undefined) {
            return '';
          }
          return this.multiFormat(date);
        })
        // .tickSize(-this.height)
        .tickSizeOuter(0)
    );
    this.tableBody
      .selectAll('g.tableColumn')
      .attr(
        'transform',
        (d, i) => `translate(${this.xScaleZ(i) - this.xBand.bandwidth() / 2},0)`
      );
    this.tableBody
      .selectAll('.mybar')
      .attr('transform', 'translate(0,30)')
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

    //text and its position for vwapText
    this.chartBody
      .selectAll('text.vwapText')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d.vwap));
    //text  position for volLine
    this.focus
      .selectAll('text.vpocText')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['volumePOC'].price));
    //candle position
    this.chartBody
      .selectAll('.candle')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2)
      .attr('y', (d) =>
        this.yScale(Math.max(d['valueArea'].vah, d['valueArea'].val))
      )
      .attr('width', this.barWidth)
      .attr('height', (d) =>
        d['valueArea'].vah === d['valueArea'].val
          ? 1
          : this.yScale(Math.min(d['valueArea'].vah, d['valueArea'].val)) -
            this.yScale(Math.max(d['valueArea'].vah, d['valueArea'].val))
      )
      .attr('fill', (d) =>
        d['valueArea'].vah === d['valueArea'].val ? 'silver' : 'blue'
      );
    //vah-Text
    this.chartBody
      .selectAll('.vahText')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['valueArea'].vah));
    //val-Text
    this.chartBody
      .selectAll('.valText')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['valueArea'].val));
    //ohlc-high
    this.chartBody
      .selectAll('.ohlcTextHigh')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['ohlc'].high));
    //ohlc-low
    this.chartBody
      .selectAll('.ohlcTextLow')
      .attr('x', (d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2 + 20)
      .attr('y', (d) => this.yScale(d['ohlc'].low));
    //stem position
    this.chartBody
      .selectAll('.stem')
      .attr(
        'x1',
        (d, i) =>
          this.xScaleZ(i) - this.xBand.bandwidth() / 2 + this.barWidth / 2
      )
      .attr(
        'x2',
        (d, i) =>
          this.xScaleZ(i) - this.xBand.bandwidth() / 2 + this.barWidth / 2
      )
      .attr('y1', (d) => this.yScale(d['ohlc'].high))
      .attr('y2', (d) => this.yScale(d['ohlc'].low));
    //redline
    this.tableBody.selectAll('path.vAvgLine').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2)
        .y((d) => this.y(d))
    );
    //vwap
    this.chartBody.selectAll('path.vwapLine').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2)
        .y((d) => this.yScale(d.vwap))
    );
    //purpleLine
    this.chartBody.selectAll('path.vpocLine').attr(
      'd',
      d3
        .line()
        .x((d, i) => this.xScaleZ(i) - this.xBand.bandwidth() / 2)
        .y((d) => this.yScale(d['volumePOC'].price))
    );
    //checking x axis ticks
    this.xAxisG.selectAll('.tick text').each(function (this: any, d: number) {
      if (this.innerHTML === '' && self.timeRangeData[d] === undefined) {
        this.parentNode.style.display = 'none';
      } else {
        this.parentNode.style.display = 'block';
      }
    });
  };

  zoomend = () => {};
  //           >>>>>>    xxxxx     >>>>>>

  //starting other charts............

  showGreeting(message: any) {
    var IBHIGH = message.initialBalance.ibHigh;
    this.IBHIGH = parseFloat(IBHIGH).toFixed(2);

    var IBLOW = message.initialBalance.ibLow;
    this.IBLOW = parseFloat(IBLOW).toFixed(2);

    this.F15MV = message.first15MinProfile.volume;
    this.vPOC = message.volumePOC.price;
    this.tVolA = message.tpoVolumeProfile.A;
    this.tVolB = message.tpoVolumeProfile.B;
    this.tVolC = message.tpoVolumeProfile.C;
    this.tVolD = message.tpoVolumeProfile.D;
    this.tVolE = message.tpoVolumeProfile.E;
    this.tVolF = message.tpoVolumeProfile.F;
    this.tVolG = message.tpoVolumeProfile.G;
    this.tVolH = message.tpoVolumeProfile.H;
    this.tVolI = message.tpoVolumeProfile.I;
    this.tVolJ = message.tpoVolumeProfile.J;
    this.tVolK = message.tpoVolumeProfile.K;
    this.tVolL = message.tpoVolumeProfile.L;
    this.tVolM = message.tpoVolumeProfile.M;
    //
    this.totalVolume = message.totalVolume;
    this.vWAP = message.vwap;
    this.LTP = message.latestTradedPrice;

    var IB = this.IBHIGH - this.IBLOW;
    this.IB = IB.toFixed(2);

    // IB UP
    var IB1_5UP = parseFloat(this.IBHIGH) + parseFloat(this.IB) * 0.5;
    this.IB1_5UP = IB1_5UP.toFixed(2);
    var IB2UP = parseFloat(this.IBHIGH) + parseFloat(this.IB) * 1;
    this.IB2UP = IB2UP.toFixed(2);
    var IB3UP = parseFloat(this.IBHIGH) + parseFloat(this.IB) * 2;
    this.IB3UP = IB3UP.toFixed(2);
    // IB DOWN
    var IB1_5DOWN = parseFloat(this.IBLOW) - parseFloat(this.IB) * 0.5;
    this.IB1_5DOWN = IB1_5DOWN.toFixed(2);
    var IB2DOWN = parseFloat(this.IBLOW) - parseFloat(this.IB) * 1;
    this.IB2DOWN = IB2DOWN.toFixed(2);
    var IB3DOWN = parseFloat(this.IBLOW) - parseFloat(this.IB) * 2;
    this.IB3DOWN = IB3DOWN.toFixed(2);

    document.getElementById('openVolume').innerHTML =
      'Open Volume :' + this.F15MV;
    document.getElementById('newIB').innerHTML = 'IB Value - ' + this.IB;
    document.getElementById('LTP').innerHTML = 'LTP - ' + this.LTP;
    document.getElementById('IBHIGH').innerHTML = 'IB HIGH  : ' + this.IBHIGH;
    document.getElementById('IBLOW').innerHTML = 'IB LOW   : ' + this.IBLOW;
    document.getElementById('IB15UP').innerHTML = '1.5 UP   : ' + this.IB1_5UP;
    document.getElementById('IB2UP').innerHTML = '2 UP     : ' + this.IB2UP;
    document.getElementById('IB3UP').innerHTML = '3 UP     : ' + this.IB3UP;
    document.getElementById('IB15DOWN').innerHTML =
      '1.5 DOWN : ' + this.IB1_5DOWN;
    document.getElementById('IB2DOWN').innerHTML = '2 DOWN   : ' + this.IB2DOWN;
    document.getElementById('IB3DOWN').innerHTML = '3 DOWN   : ' + this.IB3DOWN;
    this.dataForScale();
    this.barChart();
    this.barCurPrev();
  }

  async get() {
    // geting value from Api for bat chart
    var apiServer1 = await this.apiService.getRefData().toPromise();
    var apiRef = apiServer1['openVolAvg'];
    this.apiRefData = apiRef;
    document.getElementById('referenceValue').innerHTML =
      'Reference Value :' + this.apiRefData;

    // getting value from api for testing chart
    var prevValuesFromApi = await this.apiService
      .getPrevDayProfile()
      .toPromise();
    //pVPOC
    var pVPOC = prevValuesFromApi['volumePOC'].price;
    this.apiPrevDayVpoc = pVPOC;
    //VWAP
    var pVWAP = prevValuesFromApi['vwap'];
    this.apiPrevDayVwap = pVWAP;
    //A
    var volA = prevValuesFromApi['tpoVolumeProfile'].A;
    this.pVolA = volA;
    //B
    var volB = prevValuesFromApi['tpoVolumeProfile'].B;
    this.pVolB = volB;
    //C
    var volC = prevValuesFromApi['tpoVolumeProfile'].C;
    this.pVolC = volC;
    //D
    var volD = prevValuesFromApi['tpoVolumeProfile'].D;
    this.pVolD = volD;
    //E
    var volE = prevValuesFromApi['tpoVolumeProfile'].E;
    this.pVolE = volE;
    //F
    var volF = prevValuesFromApi['tpoVolumeProfile'].F;
    this.pVolF = volF;
    //G
    var volG = prevValuesFromApi['tpoVolumeProfile'].G;
    this.pVolG = volG;
    //H
    var volH = prevValuesFromApi['tpoVolumeProfile'].H;
    this.pVolH = volH;
    //I
    var volI = prevValuesFromApi['tpoVolumeProfile'].I;
    this.pVolI = volI;
    //J
    var volJ = prevValuesFromApi['tpoVolumeProfile'].J;
    this.pVolJ = volJ;
    //K
    var volK = prevValuesFromApi['tpoVolumeProfile'].K;
    this.pVolK = volK;
    //L
    var volL = prevValuesFromApi['tpoVolumeProfile'].L;
    this.pVolL = volL;
    //M
    var volM = prevValuesFromApi['tpoVolumeProfile'].M;
    this.pVolM = volM;

    this.dataForScale();
    this.barChart();
    this.barCurPrev();
  }

  barChart() {
    var width = 240;
    var height = 85;
    var margin = { top: 0, bottom: 20, left: 30, right: 50 };
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    var OVP = this.apiRefData;
    var f15Value = this.F15MV;
    var data = [
      { name: 'OpenVolume', value: f15Value },
      { name: 'ReferenceValue', value: OVP },
    ];
    d3.select('#barChart svg.graph').remove();
    const svg = d3
      .select('#barChart')
      .append('svg')
      .attr('class', 'graph')
      //  .attr('width','100%')
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr(
        'viewBox',
        '-65 0 ' +
          (width + margin.left + margin.right) +
          ' ' +
          (height + margin.top + margin.bottom)
      );
    //
    //grouping
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    //scale
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .rangeRound([0, innerWidth])
      .clamp(true)
      .nice();
    const XaxisTickFormat = (number) =>
      d3.format('.2s')(number).replace('G', 'B');
    const xA = d3.axisBottom(x).ticks(5).tickFormat(XaxisTickFormat);
    g.append('g').call(xA).attr('transform', `translate(0,${innerHeight})`);
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([innerHeight, 0])
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

  dataForScale() {
    this.data2 = [
      { value: this.IBLOW, labels: 'IBL' },
      { value: this.IBHIGH, labels: 'IBH' },
      { value: this.IB1_5DOWN, labels: 'IB1.5D' },
      { value: this.IB2DOWN, labels: 'IB2D' },
      { value: this.IB3DOWN, labels: 'IB3D' },
      { value: this.IB1_5UP, labels: 'IB1.5U' },
      { value: this.IB2UP, labels: 'IB2U' },
      { value: this.IB3UP, labels: 'IB3U' },
      { value: this.vPOC, labels: 'vPOC' },
      { value: this.vWAP, labels: 'VWAP' },
      { value: this.apiPrevDayVwap, labels2: 'pVWAP' },
      { value: this.apiPrevDayVpoc, labels2: 'pVPOC' },
      { value: this.LTP },
    ];

    this.data1;
    this.data = [...this.data1, ...this.data2];
    this.thermoChart();
  }
  //testing chart
  thermoChart() {
    var margin = { top: 20, bottom: 20, left: 50, right: 50 };
    var width = 500 - margin.left - margin.right;
    var height = 100 - margin.top - margin.bottom;
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    var LTPvalue = this.LTP;
    d3.select('#thermo svg.unique').remove();
    var svg = d3
      .select('#thermo')
      .append('svg')
      .attr('width', '100%')
      // .attr("height", '100%')
      .attr('class', 'unique')
      .attr('viewBox', '-25 0 ' + width + ' ' + height)
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    //creating scale
    const dataScale = d3
      .scaleLinear()
      .domain(d3.extent(this.data, (d) => d.value))
      .range([0, innerWidth])
      .nice();
    //this is only for ticks
    var uniqueValues = [...new Set(this.data.map((d) => d.value))].map(
      (d) => d
    );
    //creating axes
    const axes1 = d3.axisBottom(dataScale).ticks(60, '~s');
    svg
      .append('g')
      .call(axes1)
      .attr('class', 'Xaxis1')
      .attr('transform', 'translate(0,21)');

    //removing tick text
    d3.selectAll('.Xaxis1 .tick text').remove();

    //only showing the data value for ticks
    //this is for main datascale axes
    var axes = d3
      .axisBottom(dataScale)
      .tickValues(uniqueValues)
      .tickSizeInner(13)
      .tickPadding(5);
    svg
      .append('g')
      .call(axes)
      .attr('class', 'axisValues1')
      .attr('transform', 'translate(0,21)');
    d3.selectAll('.axisValues1 .tick text')
      .attr('y', -5)
      .attr('x', 1)
      .attr('fill', 'red')
      .attr('font-size', 4)
      .attr('font-weight', '500');

    //creating rect for showing values
    svg
      .append('rect')
      .attr('class', 'rectangle')
      .attr('x', (d) => dataScale(LTPvalue))
      .attr('width', 2)
      .attr('height', 40)
      .attr('fill', 'green')
      .attr('opacity', 0.8)
      .append('title')
      .text((d) => d);

    // appending text
    svg
      .append('g')
      .selectAll('text')
      .data(this.data)
      .enter()
      .append('text')
      .text((d) => d.labels)
      .attr('fill', 'blue')
      .attr('class', 'textLabel')
      .attr('text-anchor', 'middle')
      .attr('x', (d) => dataScale(d.value) + 2)
      .attr('y', 12)
      .attr('font-size', 4)
      .attr('font-weight', '500');

    //text only for LTP data
    svg
      .append('text')
      .text('LTP')
      .attr('fill', 'black')
      .attr('class', 'font')
      .attr('font-size', 4)
      .attr('text-anchor', 'middle')
      .attr('x', (d) => dataScale(LTPvalue))
      .attr('y', 3)
      .attr('font-weight', '900')
      .attr('fill', 'red');

    // editing ticks values
    d3.select('svg .font .tick text').attr('fill', 'red');
    // adding text for axes
    svg
      .append('g')
      .selectAll('text')
      .data(this.data)
      .enter()
      .append('text')
      .text((d) => d.labels2)
      .attr('fill', 'blue')
      .attr('class', 'labelLabel')
      .attr('text-anchor', 'middle')
      .attr('x', (d) => dataScale(d.value))
      .attr('y', 42)
      .attr('font-size', 4)
      .attr('font-weight', '500');
  }

  barCurPrev() {
    var tA = this.tVolA;
    var tB = this.tVolB;
    var tC = this.tVolC;
    var tD = this.tVolD;
    var tE = this.tVolE;
    var tF = this.tVolF;
    var tG = this.tVolG;
    var tH = this.tVolH;
    var tI = this.tVolI;
    var tJ = this.tVolJ;
    var tK = this.tVolK;
    var tL = this.tVolL;
    var tM = this.tVolM;

    //
    var pA = this.pVolA;
    var pB = this.pVolB;
    var pC = this.pVolC;
    var pD = this.pVolD;
    var pE = this.pVolE;
    var pF = this.pVolF;
    var pG = this.pVolG;
    var pH = this.pVolH;
    var pI = this.pVolI;
    var pJ = this.pVolJ;
    var pK = this.pVolK;
    var pL = this.pVolL;
    var pM = this.pVolM;

    var data = [
      { sports: 'A', PreviousDayVolume: pA, CurrentDayVolume: tA, ages: [] },
      { sports: 'B', PreviousDayVolume: pB, CurrentDayVolume: tB, ages: [] },
      { sports: 'C', PreviousDayVolume: pC, CurrentDayVolume: tC, ages: [] },
      { sports: 'D', PreviousDayVolume: pD, CurrentDayVolume: tD, ages: [] },
      { sports: 'E', PreviousDayVolume: pE, CurrentDayVolume: tE, ages: [] },
      { sports: 'F', PreviousDayVolume: pF, CurrentDayVolume: tF, ages: [] },
      { sports: 'G', PreviousDayVolume: pG, CurrentDayVolume: tG, ages: [] },
      { sports: 'H', PreviousDayVolume: pH, CurrentDayVolume: tH, ages: [] },
      { sports: 'J', PreviousDayVolume: pI, CurrentDayVolume: tI, ages: [] },
      { sports: 'K', PreviousDayVolume: pJ, CurrentDayVolume: tJ, ages: [] },
      { sports: 'L', PreviousDayVolume: pK, CurrentDayVolume: tK, ages: [] },
      { sports: 'M', PreviousDayVolume: pL, CurrentDayVolume: tL, ages: [] },
      { sports: 'M', PreviousDayVolume: pM, CurrentDayVolume: tM, ages: [] },
    ];
    //
    var margin = { top: 50, bottom: 50, left: 100, right: 100 };
    var width = 500 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
    //creating svg
    d3.select('#horizontal-bar svg.bar').remove();

    const svg = d3
      .select('#horizontal-bar')
      .append('svg')
      .attr('class', 'bar')
      .attr('width', '100%')
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr(
        'viewBox',
        '0 30 ' +
          (width + margin.left + margin.right) +
          ' ' +
          (height + margin.top + margin.bottom)
      );

    // .attr('width',width + margin.left + margin.right)
    // .attr('height',height + margin.top + margin.bottom);
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    var teams = Object.keys(data[0]).filter(function (key) {
      return key !== 'sports' && key !== 'ages';
    });
    // scale for first bar
    data.forEach(function (d) {
      d.ages = teams.map(function (name) {
        return { name: name, value: +d[name] };
      });
    });

    var xDomain = data.map((d) => d.sports);
    var x0 = d3
      .scaleBand()
      .domain(xDomain)
      .rangeRound([0, width])
      .paddingInner(0.05);
    // scale for first bar
    var x1 = d3
      .scaleBand()
      .domain(teams)
      .range([0, x0.bandwidth()])
      .paddingOuter(0.5);
    // creating x axis
    var xAxis1 = d3.axisBottom(x0);
    g.append('g')
      .attr('class', 'xVer')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis1);
    d3.selectAll('.xVer .tick text').attr('fill', 'grey');
    d3.selectAll('.xVer .domain').attr('stroke', 'blue');
    // y
    var yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d3.max(d.ages, (d) => d.value))])
      .range([height, 0])
      .nice();
    // y axis
    var yAxis = d3.axisLeft(yScale);
    g.append('g').attr('class', 'yVer').call(yAxis);

    d3.selectAll('.yVer .tick text').attr('fill', 'grey');
    d3.selectAll('.yVer .domain').attr('stroke', 'blue');

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var state = svg
      .selectAll('.state')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'g')
      .attr('transform', (d) => 'translate(' + x0(d.sports) + ',0)');

    var rect = state
      .selectAll('rect')
      .data((d) => d.ages)
      .enter()
      .append('rect')
      .attr('width', x1.bandwidth())
      .attr('x', (d) => x1(d.name) + 100)
      .attr('y', (d) => yScale(d.value) + 50)
      .attr('height', (d) => height - yScale(d.value))
      .style('fill', (d) => color(d.name))
      .append('title')
      .text((d) => d.value);
    //
    var legendLabel = ['CurrentDayVolume', 'PreviousDayVolume'];
    var legend = g
      .selectAll('.legend')
      .data(legendLabel)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => 'translate(0,' + i * 10 + ')');

    legend
      .append('rect')
      .attr('x', width + 35)
      .attr('width', 8)
      .attr('height', 8)
      .style('fill', (d, i) => color(d));

    legend
      .append('text')
      .attr('x', width + 30)
      .attr('y', 3)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .attr('font-size', 10 + 'px')
      .text((d) => d);
  }
  async closeSocket() {
    await this.$appCom.closeSocket('candlestick');
    this.socketConnected = false;
    return '';
  }
}
