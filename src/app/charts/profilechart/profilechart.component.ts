import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ProfileServiceService } from './profile-service.service';
import { environment } from '../../../environments/environment';
import { NGXLogger } from 'ngx-logger';
import { CommonService } from 'src/app/mainService _file/common.service';
declare const $: any;

const BACKEND_URL = environment.apiUrl + '/api/';

@Component({
  selector: 'app-profilechart',
  templateUrl: './profilechart.component.html',
  styleUrls: ['./profilechart.component.scss'],
})
export class ProfilechartComponent implements OnInit, OnDestroy {
  isLoading = false;
  chartErr: boolean = false;
  chartErrMsg: string = '';
  indexDB_Name: string = 'profilechart';
  constructor(
    private pgService: ProfileServiceService,
    private http: HttpClient,
    private elementRef: ElementRef,
    private logger: NGXLogger,
    private commonSer: CommonService
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#08102e';
    this.commonSer.indexDB_Name = this.indexDB_Name;
    this.commonSer.createIndexed_DB();
  }

  @HostListener('window:beforeunload') async onBeforeUnload() {
    this.commonSer.closeIndexed_DB();
    await this.pgService.closeSocket();
  }

  ngOnInit() {
    this.pgService.containerID = 'candlestick';
    this.pgService.renderSVG();
    this.connect();
  }
  async selectChange(dateEvent: any) {
    document.getElementById('candlestick-container').style.display = 'none';
    if (dateEvent == 'day') {
      $('#checkweek').removeClass('active');
      $('#checkday').addClass('active');
      this.pgService.weeklyChart = false;
    } else {
      $('#checkday').removeClass('active');
      $('#checkweek').addClass('active');
      this.pgService.weeklyChart = true;
    }
    let data: any = await this.commonSer.getDataFrom_Indexed_DB();
    this.pgService.chartData = data;
    this.pgService.renderLayout();
    data = null;
  }

  async connect() {
    this.pgService.indexDB_Name = this.indexDB_Name;
    this.isLoading = true;
    // this.http.post(BACKEND_URL + 'NSE-DAY-PROFILE', {}).subscribe(
    this.http.post(BACKEND_URL + 'GET-WHOLE-VA', {}).subscribe(
      async (result: any) => {
        if (result.length > 1) {
          await this.commonSer.storeData_to_Indexed_DB(result);

          this.pgService.chartData = result;
          let modified_time = new Date();
          modified_time.setHours(new Date().getUTCHours() + 5);
          modified_time.setMinutes(new Date().getUTCMinutes() + 30);

          let marketStart = new Date(modified_time);
          marketStart.setHours(9);
          marketStart.setMinutes(15);
          marketStart.setSeconds(0);

          let marketEnd = new Date(modified_time);
          marketEnd.setHours(15);
          marketEnd.setMinutes(30);
          marketEnd.setSeconds(0);

          var currentDate = new Date(modified_time);

          if (currentDate.getDay() == 0 || currentDate.getDay() == 6) {
            this.pgService.socketBool = false;
            this.pgService.renderLayout();
          } else if (
            currentDate.getTime() > marketStart.getTime() &&
            currentDate.getTime() < marketEnd.getTime()
          ) {
            this.pgService.socketBool = true;
            this.pgService.renderLayout();
          } else {
            this.pgService.socketBool = false;
            this.pgService.renderLayout();
          }

          this.isLoading = false;
          result = null;
        } else {
          this.callBackError('Empty content from server!');
          this.logger.error(
            `ERROR IN PROFILE-CHART PAGE : Empty content from server!`
          );
        }
      },
      (err: any) => {
        this.logger.error(`ERROR IN PROFILE-CHART PAGE : ${err.message}`);
        this.callBackError(err.message);
      }
    );
  }
  callBackError(message: any) {
    this.chartErrMsg = message;
    this.chartErr = true;
    this.isLoading = false;
  }
  async ngOnDestroy() {
    this.commonSer.closeIndexed_DB();
    await this.pgService.closeSocket();
  }
}
