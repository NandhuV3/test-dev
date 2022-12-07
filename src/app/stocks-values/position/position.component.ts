import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'src/environments/environment';
import { PositionService } from 'src/app/stocks-values/position/position.service';

const BACKEND_URL = environment.apiUrl + '/api/';

@Component({
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss'],
})
export class PositionComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private positionService: PositionService,
    private http: HttpClient,
    private elementRef: ElementRef,
    private route: Router,
    private logger: NGXLogger
  ) {
    // this.showingPos();
  }
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0d1036';
  }
  MarketStartTime: any = null;
  MarketEndTime: any = null;

  netHeaders = [
    'TradingSymbol',
    'Product',
    'quan',
    'Avg',
    'ltp',
    'Realised',
    'Unrealised',
    'Pnl',
  ];
  dayHeaders = [
    'TradingSymbol',
    'Product',
    'quan',
    'Avg',
    'ltp',
    'Realised',
    'Unrealised',
    'PnL',
  ];
  netOrder = [];
  dayOrder = [];
  interval: any;
  positionErr: boolean = false;
  positionErrMsg: string = '';
  showPositionTable: boolean = false;
  ngOnInit() {
    this.showingPos();
  }

  async showingPos() {
    var currentTime = new Date();
    // Market start time
    this.MarketStartTime = new Date();
    this.MarketStartTime.setHours(9);
    this.MarketStartTime.setMinutes(15);
    this.MarketStartTime.setSeconds(0);
    // Market start time
    this.MarketEndTime = new Date();
    this.MarketEndTime.setHours(15);
    this.MarketEndTime.setMinutes(30);
    this.MarketEndTime.setSeconds(0);

    this.interval = setInterval(async () => {
      if (
        currentTime.getTime() > this.MarketEndTime.getTime() ||
        currentTime.getTime() < this.MarketStartTime.getTime()
      ) {
        clearInterval(this.interval);
      }
      if (new Date().getDay() == 0 || new Date().getDay() == 6) {
        clearInterval(this.interval);
      }
      await this.http
        .post(BACKEND_URL + 'position', {})
        .toPromise()
        .then((Position: any) => {
          if (this.positionErr.hasOwnProperty('message')) {
            if (Object.keys(Position).length >= 0) {
              this.positionService.getOrders(Position);
              this.netOrder = this.positionService.getNetValues();
              this.dayOrder = this.positionService.getDayValues();
              this.positionService.updatingValues();
              this.showPositionTable = true;
            }
          } else {
            this.logger.error(`ERROR IN POSITION PAGE : ${Position.message}`);
            clearInterval(this.interval);
            this.positionErr = true;
            this.positionErrMsg = Position.message;
          }
        })
        .catch((err: any) => {
          this.logger.error(`ERROR IN POSITION PAGE : ${err.message}`);
          clearInterval(this.interval);
          this.positionErr = true;
          this.positionErrMsg = err.message;
        });
    }, 500);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    this.interval = null;
  }
}
