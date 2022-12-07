import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessComponent } from './log_and_sign/access/access.component';
import { CandlestickComponent } from './charts/candlestick/candlestick.component';
import { WebSocketComponent } from 'src/app/charts/chartsValues/chartsAndGraphs.component';
import { ProfilechartComponent } from './charts/profilechart/profilechart.component';
import { TickChartComponent } from './charts/tick-chart/tick-chart.component';
import { PositionComponent } from './stocks-values/position/position.component';
import { OrdersComponent } from './stocks-values/orders/orders.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { BigDataComponent } from './charts/big-data/big-data.component';

import { ErrorPageComponent } from './error-page/error-page.component';
import { SignupComponent } from './log_and_sign/signup/signup.component';
import { LoginComponent } from './log_and_sign/login/login.component';
import { EmailErrorComponent } from './error-page/email-error/email-error.component';
import { ForgotPasswordComponent } from './error-page/forgot-password/forgot-password.component';
import { PasswordResetComponent } from './error-page/password-reset/password-reset.component';
import { RealUnrealComponent } from './stocks-values/real-unreal/real-unreal.component';
import { PaytmComponent } from './others/paytm/paytm.component';
import { InstrumentComponent } from './stocks-values/instrument/instrument.component';
// import { CronComponent } from './others/paytm/cron/cron.component';
import { GuardGuard } from './Auth/guard.guard';
import { RoleGuard } from './Auth/role.guard';
import { LogsComponent } from './log_and_sign/logs/logs.component';
import { ReferenceComponent } from './charts/reference/reference.component';
import { DRangeComponent } from './charts/d-range/d-range.component';
import { OptionOfLiveComponent } from './charts/option-of-live/option-of-live.component';
import { TestingChartComponent } from './charts/testing-chart/testing-chart.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'access', component: AccessComponent},
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'orders', component: OrdersComponent ,canActivate : [GuardGuard]},
  { path: 'reference' , component: ReferenceComponent ,canActivate : [GuardGuard,RoleGuard]},
  { path: 'OF-History', component: TickChartComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: 'charts', component: WebSocketComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: 'Day-Profile', component: DRangeComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: 'OF-Live', component: CandlestickComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: 'Option-OF-Live', component: OptionOfLiveComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: 'profile', component: ProfilechartComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: 'position', component: PositionComponent ,canActivate : [GuardGuard ]},
  { path: 'lineChart', component: LineChartComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: 'bigData', component: BigDataComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: 'test-chart', component: TestingChartComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: '404Error', component: ErrorPageComponent },
  { path: '403Error', component: EmailErrorComponent },
  { path: 'realUnreal', component: RealUnrealComponent ,canActivate : [GuardGuard]},
  { path: 'forgotPass', component: ForgotPasswordComponent },
  { path: 'passwordReset', component: PasswordResetComponent },
  { path: 'paytm', component: PaytmComponent },
  { path: 'instrument', component: InstrumentComponent ,canActivate : [GuardGuard]},
  // { path: 'cron', component: CronComponent ,canActivate : [GuardGuard , RoleGuard]},
  { path: 'logs', component: LogsComponent ,canActivate : [GuardGuard , RoleGuard]},
  // { path: '**', redirectTo: '404Error'}
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
