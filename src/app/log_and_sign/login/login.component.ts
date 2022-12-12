import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'src/environments/environment';
import { AppComponent } from '../../app.component';
import * as CryptoJS from 'crypto-js';
declare const $: any;
const BACKEND_URL = environment.apiUrl + '/user/';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  user_Email: string = '';
  alertMsg: boolean = false;
  checkEmail: boolean = false;
  checkPassword: boolean = false;
  isLoggedin: boolean = false;
  emptyEmail: boolean = false;
  showDOM: boolean = false;
  kiteLoginUrl: string = null;
  contactForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  constructor(
    private $appCom: AppComponent,
    private http: HttpClient,
    private route: Router,
    private elementRef: ElementRef,
    private logger: NGXLogger
  ) {
    if (document.cookie != '') {
      this.showDOM = false;
      this.$appCom.alertLogout = true;
    } else {
      this.showDOM = true;
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
        '#f7f7f7';
      this.user_Email = localStorage.getItem('user_ID');
      this.$appCom.firstNav = false;
      this.$appCom.loggedIn = false;
      if (this.user_Email == 'null' && this.user_Email == null) {
        this.user_Email = '';
      }
    }
  }

  ngOnInit() {
    this.get_api_key();
  }

  get_api_key() {
    this.http.post(BACKEND_URL + 'login_key', {}).subscribe((data: any) => {
      if (data.hasOwnProperty('key')) {
        this.kiteLoginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${data.key}`;
      }
    });
  }
  showEyeIcon: boolean = false;
  show_pwd() {
    if (!this.showEyeIcon) {
      this.showEyeIcon = true;
      $('#secret_pwd').attr('type', 'text');
    } else {
      this.showEyeIcon = false;
      $('#secret_pwd').attr('type', 'password');
    }
  }

  async onSubmit() {
    var user = this.contactForm.value;
    var encryptData = await CryptoJS.AES.encrypt(
      JSON.stringify({ email: user.email, password: user.password }),
      'noOneCanFindthis token'
    ).toString();
    await this.http
      .post(BACKEND_URL + 'userLogin', { encryptData })
      .toPromise()
      .then(async (result: any) => {
        if (result.hasOwnProperty('email')) {
          this.checkEmail = true;
          setTimeout(() => {
            this.checkEmail = false;
          }, 4000);
        }

        if (result.hasOwnProperty('message')) {
          this.checkPassword = true;
          setTimeout(() => {
            this.checkPassword = false;
          }, 4000);
        }
        if (result.hasOwnProperty('admin')) {
          var admin: any;
          if (result.admin === true) {
            this.$appCom.UserAdmin = true;
            admin = true;
          } else {
            this.$appCom.UserAdmin = false;
            admin = false;
          }
          //sending admin detail
          var params: any = { email: user.email, admin: admin };
          //create session for user
          var sessionID: any = await this.http
            .post(BACKEND_URL + 'sendCookie', params, { responseType: 'text' })
            .toPromise();
          //saving cookie
          document.cookie = `tokenID=${sessionID}`;

          this.alertMsg = false;
          this.$appCom.firstNav = false;
          this.$appCom.showLoginErr = false;
          this.$appCom.loggedIn = true;
          this.route.navigate(['/OF-Live']);

          //checking remember function
          const checkbox = document.getElementById(
            'remember_me'
          ) as HTMLInputElement | null;

          if (checkbox?.checked == true) {
            localStorage.setItem('user_ID', user.email);
          }
          if (checkbox?.checked == false) {
            localStorage.removeItem('user_ID');
          }
          //reset form after user login
          this.contactForm.reset();
          this.showDOM = false;
        }
      })
      .catch((err) => {
        this.logger.error(`ERROR IN LOGIN PAGE : ${err.message}`);
      });
  }

  forgotPass() {
    if (this.contactForm.value.email != '') {
      this.route.navigate(['/forgotPass']);
    } else {
      this.emptyEmail = true;
      setTimeout(() => {
        this.emptyEmail = false;
      }, 3000);
    }
  }
}
