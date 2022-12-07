import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'src/environments/environment';
import { AppComponent } from 'src/app/app.component';

const BACKEND_URL = environment.apiUrl + '/user/';
const CHART_URL = environment.apiUrl + '/api/';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
})
export class AccessComponent implements OnInit {
  KiteErr: boolean = false;
  spinner: boolean = false;
  TokenErr: string = '';
  constructor(
    public route: Router,
    public route1: ActivatedRoute,
    public http: HttpClient,
    public $appCom: AppComponent,
    public logger: NGXLogger
  ) {

    this.route1.queryParamMap.subscribe(async (params: any) => {
      await params;
      var queryParams = params.params;
      if (queryParams.status == 'success') {

          ////  ## Save Token and Use in Backend
           var result:any = await this.http
            .post(CHART_URL + 'requestToken', {
              request_token: queryParams.request_token,
            })
            .toPromise();
            // .then(async (result:any)=>{

              if (result.message === true) {
                //create session for user
                var params: any = {
                  email: queryParams.request_token,
                  admin: true,
                };
                var sessionID: any = await this.http
                  .post(BACKEND_URL + 'sendCookie', params, {
                    responseType: 'text',
                  })
                  .toPromise();
                //saving cookie
                document.cookie = `tokenID=${sessionID}`;
                //// ## navigate to orders page
                this.$appCom.KiteLogin();
                this.route.navigate(['/OF-Live']);
              } else {

                this.TokenErr = result.message;
                this.KiteErr = true;
                this.logger.error(`ERROR WHILE GETTING TOKEN  : ${result.message}`);
              }
            /* }).catch((err:any)=>{
              this.logger.error(`ERROR : ${err.message}`);
            }) */
        } else {

          if (queryParams.status == 'failed') {
            this.KiteErr = true;
            this.TokenErr = `ERROR : Login failed because of kite login status failed`
            this.logger.error(
              `ERROR : Login failed because of kite login status failed`
            );
          }
        }
    });
  }

  ngOnInit(): void {}

  goToLogin() {
    // check url
    this.KiteErr = false;
  }
}
