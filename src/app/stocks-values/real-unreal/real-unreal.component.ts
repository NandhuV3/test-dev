import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/api/';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

declare var $: any;
@Component({
  selector: 'app-real-unreal',
  templateUrl: './real-unreal.component.html',
  styleUrls: ['./real-unreal.component.scss'],
})
export class RealUnrealComponent implements OnInit {
  constructor(
    public http: HttpClient,
    public elementRef: ElementRef,
    public route: Router,
    public logger: NGXLogger
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0f162e';
  }

  fullArray: any = [];
  ngOnInit(): void {
    this.getDataFromDB();
  }

  async getDataFromDB() {
    var from = '2022-10-10';
    var to = moment(new Date()).format('YYYY-MM-DD');
    $(function () {
      $('#datePicker').attr('min', from).attr('max', to);
    });
    await this.http
      .post(BACKEND_URL + 'realUnreal', {})
      .toPromise()
      .then((result: any) => {
        result.forEach((d: any) => {
          d.date = moment(new Date(d.date)).format('YYYY-MM-DD');
        });
        this.fullArray = result;
      })
      .catch((err: any) => {
        this.logger.error(`ERROR IN PRO&LOS PAGE : ${err.message}`);
      });
  }

  async dateChanged(date: any) {
    await this.http
      .post(BACKEND_URL + 'realUnrealFrom', { date })
      .toPromise()
      .then((result: any) => {
        result.forEach((d: any) => {
          d.date = moment(new Date(d.date)).format('YYYY-MM-DD');
        });
        this.fullArray = result;
      })
      .catch((err: any) => {
        this.logger.error(`ERROR IN PRO&LOS PAGE : ${err.message}`);
      });
  }
}
