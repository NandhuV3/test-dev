import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'src/environments/environment';
import { BigChartService } from './big-data.service';

const BACKEND_URL = environment.apiUrl + '/api/';

@Component({
  selector: 'app-big-data',
  templateUrl: './big-data.component.html',
  styleUrls: ['./big-data.component.scss'],
})
export class BigDataComponent implements OnInit, OnDestroy {
  errorOccured: boolean = false;
  clearNoContent: boolean = false;
  isLoading: boolean = false;
  showContent: boolean = true;
  chartErr: boolean = false;
  chartErrMsg: string = '';
  constructor(
    private bigDataService: BigChartService,
    private http: HttpClient,
    private logger: NGXLogger,
    private elementRef: ElementRef
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0d1036';
  }
  errMsg : string = "*Please check all the fields"
  ngOnInit(): void {}

  checkoutForm = new FormGroup({
    from1: new FormControl(null, [Validators.required]),
    to1: new FormControl(null, [Validators.required]),
    value1: new FormControl(null, [Validators.required]),
    from2: new FormControl(null, [Validators.required]),
    to2: new FormControl(null, [Validators.required]),
    value2: new FormControl(null, [Validators.required]),
  });

  async onSubmitOne() {
    var from1 = this.checkoutForm.get('from1').value;
    var to1 = this.checkoutForm.get('to1').value;
    var value1 = this.checkoutForm.get('value1').value;
    var from2 = this.checkoutForm.get('from2').value;
    var to2 = this.checkoutForm.get('to2').value;
    var value2 = this.checkoutForm.get('value2').value;

    if (new Date(from1).getTime() > new Date(to1).getTime()) {
      this.errorOccured = true;
      setTimeout(() => {
        this.errorOccured = false;
      }, 3000);
    } else if (new Date(from2).getTime() > new Date(to2).getTime()) {
      this.errorOccured = true;
      setTimeout(() => {
        this.errorOccured = false;
      }, 3000);
    } else {
      this.errorOccured = false;
      this.bigDataService.createChart();
      this.clearNoContent = true;
      this.http.post(BACKEND_URL + 'highOne', { from1, to1 }).subscribe(
        (response1: any) => {
          if (!Array.isArray(response1)) {
            this.showContent = false;
            this.callBackError(response1.message);
          } else {
            if (response1.length > 1) {
              this.bigDataService.totalArray1 = response1;
              this.http.post(BACKEND_URL + 'highTwo', { from2, to2 }).subscribe(
                (response2: any) => {
                  if (response2.length > 1) {
                    this.bigDataService.totalArray2 = response2;
                    this.bigDataService.start1 = value1;
                    this.bigDataService.start2 = value2;
                    this.bigDataService.getFullData();
                    this.showContent = true;
                    this.checkoutForm.reset();
                  } else {
                    this.logger.error(
                      `ERROR IN BIG_CHART PAGE : "Empty content from the server!"`
                    );
                    this.callBackError('Empty content from the server!');
                  }
                },
                (err) => {
                  this.callBackError(err.message);
                  this.logger.error(`ERROR IN BIG_CHART PAGE : ${err.message}`);
                }
              );
            } else {
              this.logger.error(
                `ERROR IN BIG_CHART PAGE : "Empty content from the server!"`
              );
              this.callBackError('Empty content from the server!');
            }
          }
        },
        (err) => {
          this.callBackError(err.message);
          this.logger.error(`ERROR IN BIG_CHART PAGE : ${err.message}`);
        }
      );
    }
  }
  callBackError(message: any) {
    this.showContent = false;
    this.chartErrMsg = message;
    this.chartErr = true;
    this.isLoading = false;
  }
  ngOnDestroy(): void {
    this.bigDataService.clearChart();
  }
}
