import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root',
})
export class LineChartService {
  constructor() {}
  start: number = 8510;
  dataForLine: any = [];
  svg1: any;
  svg2: any;
  height: number;
  width: number;
  margin: any = {};

  createChart() {
    this.margin = { top: 10, right: 30, bottom: 30, left: 60 };
    (this.width = 960 - this.margin.left - this.margin.right),
      (this.height = 300 - this.margin.top - this.margin.bottom);

    this.svg1 = d3
      .select('#line-chart-high')
      .append('svg')
      .attr('class', 'chart')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    this.svg2 = d3
      .select('#line-chart-low')
      .append('svg')
      .attr('class', 'chart')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
  }
  lineData: any = [];
  getDataFromBackend() {
    this.dataForLine = [];

    this.lineData.forEach((d: any) => {
      this.dataForLine.push({
        date: d.date.slice(0, 10),
        values: {
          high: parseFloat(d.high) / this.start,
          low: parseFloat(d.low) / this.start,
        },
      });
      this.start++;
    });
    this.lineGraphForHigh();
    this.lineGraphForLow();
  }

  lineGraphForHigh() {
    d3.selectAll('.xaxis').remove();
    // Add X axis --> it is a date format
    var x = d3
      .scaleBand()
      .domain(
        this.dataForLine.map(function (d: any) {
          return d.date;
        })
      )
      .range([0, this.width]);
    this.svg1
      .append('g')
      .attr('class', 'xaxis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain(
        d3.extent(this.dataForLine, function (d: any) {
          return d.values.high;
        })
      )
      .range([this.height, 0]);
    this.svg1.append('g').attr('class', 'xaxis').call(d3.axisLeft(y));

    // Add the line
    this.svg1
      .append('path')
      .datum(this.dataForLine)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('class', 'xaxis')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x(function (d: any) {
            return x(d.date);
          })
          .y(function (d: any) {
            return y(d.values.high);
          })
      );
  }
  lineGraphForLow() {
    d3.selectAll('.yaxis').remove();
    // Add X axis --> it is a date format
    var x = d3
      .scaleBand()
      .domain(
        this.dataForLine.map(function (d: any) {
          return d.date;
        })
      )
      .range([0, this.width]);
    this.svg2
      .append('g')
      .attr('class', 'yaxis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain(
        d3.extent(this.dataForLine, function (d: any) {
          return d.values.low;
        })
      )
      .range([this.height, 0]);
    this.svg2.append('g').attr('class', 'yaxis').call(d3.axisLeft(y));

    // Add the line
    this.svg2
      .append('path')
      .datum(this.dataForLine)
      .attr('fill', 'none')
      .attr('class', 'yaxis')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x(function (d: any) {
            return x(d.date);
          })
          .y(function (d: any) {
            return y(d.values.low);
          })
      );
  }

  clearChart() {
    this.dataForLine = [];
  }
}
