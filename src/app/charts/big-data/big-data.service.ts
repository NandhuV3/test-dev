import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root',
})
export class BigChartService {
  constructor() {}

  start1: number;
  start2: number;
  dataForLine1: any = [];
  dataForLine2: any = [];
  svg1: any;
  svg2: any;
  height: number;
  width: number;
  totalArray1: any = [];
  totalArray2: any = [];

  createChart() {
    var margin = { top: 10, right: 30, bottom: 30, left: 60 };
    (this.width = 960 - margin.left - margin.right),
      (this.height = 300 - margin.top - margin.bottom);

    this.svg1 = d3
      .select('#Range-high1')
      .append('svg')
      .attr('width', this.width + margin.left + margin.right)
      .attr('height', this.height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    this.svg2 = d3
      .select('#Range-high2')
      .append('svg')
      .attr('width', this.width + margin.left + margin.right)
      .attr('height', this.height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  }

  async getFullData() {
    this.dataForLine1 = [];
    this.dataForLine2 = [];

    this.totalArray1.forEach((d: any) => {
      this.dataForLine1.push({
        date: d.date.slice(0, 10),
        values: { high: parseFloat(d.high) / this.start1 },
      });
      this.start1++;
    });
    this.totalArray2.forEach((d: any) => {
      this.dataForLine2.push({
        date: d.date.slice(0, 10),
        values: { high: parseFloat(d.high) / this.start2 },
      });
      this.start2++;
    });
    this.lineGraphForHigh();
    this.lineGraphForLow();
  }

  //for high
  lineGraphForHigh() {
    d3.selectAll('.xaxis').remove();

    // Add X axis --> it is a date format
    var x = d3
      .scaleBand()
      .domain(
        this.dataForLine1.map(function (d: any) {
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
        d3.extent(this.dataForLine1, function (d: any) {
          return d.values.high;
        })
      )
      .range([this.height, 0])
      .nice();
    this.svg1.append('g').attr('class', 'xaxis').call(d3.axisLeft(y));

    // Add the line
    this.svg1
      .append('path')
      .datum(this.dataForLine1)
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

  //for low
  lineGraphForLow() {
    d3.selectAll('.yaxis').remove();

    // Add X axis --> it is a date format
    var x = d3
      .scaleBand()
      .domain(
        this.dataForLine2.map(function (d: any) {
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
        d3.extent(this.dataForLine2, function (d: any) {
          return d.values.high;
        })
      )
      .range([this.height, 0])
      .nice();
    this.svg2.append('g').attr('class', 'yaxis').call(d3.axisLeft(y));

    // Add the line
    this.svg2
      .append('path')
      .datum(this.dataForLine2)
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
            return y(d.values.high);
          })
      );
  }

  clearChart() {
    this.dataForLine1 = null;
    this.dataForLine2 = null;
  }
}
