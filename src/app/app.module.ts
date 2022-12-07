import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

//
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
//
import { BrowserModule } from '@angular/platform-browser';


import { AppComponent } from './app.component';
import {CandlestickComponent} from './charts/candlestick/candlestick.component';
import { WebSocketComponent } from './charts/chartsValues/chartsAndGraphs.component';
import { ProfilechartComponent } from './charts/profilechart/profilechart.component';
import { TickChartComponent } from './charts/tick-chart/tick-chart.component';
import { PositionComponent } from './stocks-values/position/position.component';
import { OrdersComponent } from './stocks-values/orders/orders.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { BigDataComponent } from './charts/big-data/big-data.component';

import { ErrorPageComponent } from './error-page/error-page.component';
import { LoginComponent } from './log_and_sign/login/login.component';
import { SignupComponent } from './log_and_sign/signup/signup.component';
import { EmailErrorComponent } from './error-page/email-error/email-error.component';
import { ForgotPasswordComponent } from './error-page/forgot-password/forgot-password.component';
import { PasswordResetComponent } from './error-page/password-reset/password-reset.component';
import { RealUnrealComponent } from './stocks-values/real-unreal/real-unreal.component';
import { PaytmComponent } from './others/paytm/paytm.component';
import { InstrumentComponent } from './stocks-values/instrument/instrument.component';
import { AccessComponent } from './log_and_sign/access/access.component';
import { environment } from 'src/environments/environment';
import { CronComponent } from './others/paytm/cron/cron.component';
import { TokenInterceptor } from './Auth/token.interceptor';
import { LogsComponent } from './log_and_sign/logs/logs.component';
import { ReferenceComponent } from './charts/reference/reference.component';
import { AppRoutingModule } from './appRouting.module';
import { DRangeComponent } from './charts/d-range/d-range.component';
import { OptionOfLiveComponent } from './charts/option-of-live/option-of-live.component';


@NgModule({
  declarations: [
    AppComponent,
    CandlestickComponent,
    WebSocketComponent,
    ProfilechartComponent,
    TickChartComponent,
    PositionComponent,
    OrdersComponent,
    LineChartComponent,
    BigDataComponent,
    LoginComponent,
    SignupComponent,
    ErrorPageComponent,
    EmailErrorComponent,
    ForgotPasswordComponent,
    PasswordResetComponent,
    RealUnrealComponent,
    PaytmComponent,
    InstrumentComponent,
    CronComponent,
    LogsComponent,
    AccessComponent,
    ReferenceComponent,
    DRangeComponent,
    OptionOfLiveComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    LoggerModule.forRoot({
      serverLoggingUrl: `${environment.apiUrl}/api/saveLogs`, // Replace with YOUR API
      level: NgxLoggerLevel.TRACE,
      serverLogLevel: NgxLoggerLevel.ERROR,
      disableConsoleLogging: false
    })
  ],
  providers: [
    {provide:HTTP_INTERCEPTORS,useClass:TokenInterceptor,multi:true},
    AppComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
