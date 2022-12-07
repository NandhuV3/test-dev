import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LineChartService } from './line-chart.service';
import { environment } from 'src/environments/environment';
import { NGXLogger } from 'ngx-logger';
import { type } from 'os';

const BACKEND_URL = environment.apiUrl + '/api/';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  chartErr: boolean = false;
  chartErrMsg: string = '';
  constructor(
    private lineChartService: LineChartService,
    private elementRef: ElementRef,
    private http: HttpClient,
    private logger : NGXLogger
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0d1036';
  }

  ngOnInit(): void {
    this.displayLineChart();
  }

  checkoutForm = new FormGroup({
    value: new FormControl(null,[Validators.required]),
  });
  showChart: boolean = false;
  displayErr:boolean = false;
  displayErrMsg:string = "*Please Enter the valid number";
  onSubmit() {
    var inputValue = this.checkoutForm['value'].value;
    if(inputValue == null){
      inputValue = 8510;
    }
    if((inputValue <= 0) || (typeof inputValue != "number")){
      this.displayErr = true;
      setTimeout(()=>{
        this.displayErr = false;
      },4000);
    }else{
      this.lineChartService.start = inputValue;
      this.lineChartService.getDataFromBackend();
      this.checkoutForm.reset();
    }
  }

  async displayLineChart() {
    this.isLoading = true;
    this.http.post(BACKEND_URL + 'historicalData', {}).subscribe(
      (backendData: any) => {
        if (!Array.isArray(backendData)) {
          this.callBackError(backendData.message);
          this.logger.error(`ERROR IN LINE-CHART PAGE : ${backendData.message}`);
        } else {
          if (backendData.length > 1) {
            this.lineChartService.lineData = backendData;
            this.lineChartService.createChart();
            this.lineChartService.getDataFromBackend();
            this.isLoading = false;
            this.showChart = false;
          } else {
            this.callBackError('Empty content from server!');
            this.logger.error(`ERROR IN LINE-CHART PAGE : 'Empty content from server!'`);
          }
        }
      },
      (err) => {
        this.callBackError(err.message);
        this.logger.error(`ERROR IN LINE-CHART PAGE : ${err.message}`);
      }
    );
  }
  callBackError(message: any) {
    this.chartErrMsg = message;
    this.chartErr = true;
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this.lineChartService.clearChart();
  }
}
