import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { io } from 'socket.io-client';

// import { SocialAuthService } from 'angularx-social-login';
import { environment } from 'src/environments/environment';
import { RoleGuard } from './Auth/role.guard';

const BACKEND_URL = environment.apiUrl + '/user/';
declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'candlestick';
  loggedIn: boolean = false;
  alertLogout: boolean = false;
  firstNav: boolean = false;
  showLoginErr: boolean = false;
  UserAdmin: boolean = false;
  @HostListener('window:beforeunload') onBeforeUnload() {
    sessionStorage.removeItem('vpocObj');
    if (this.socketConnected) {
      this.socket.emit('end');
      this.socket.disconnect();
    }
  }

  constructor(
    // private socialAuthService: SocialAuthService,
    private route: Router,
    private http: HttpClient,
    private logger: NGXLogger,
    private checkUser: RoleGuard
  ) {}

  ngOnInit() {
    this.checkCookie();
    if (document.cookie == '') {
      this.firstNav = true;
    } else {
      this.loggedIn = true;
      this.firstNav = false;
    }
    this.checkUser
      .canActivate()
      .then((res) => {
        if (res) {
          this.UserAdmin = true;
        } else {
          this.UserAdmin = false;
        }
      })
      .catch((err) => {
        // ...log(err);
      });
  }
  getUser_Mobile_Number(email: any) {
    // this.http.post(BACKEND_URL + 'userMobileNumber',{email}).subscribe((data:any)=>{
    //   this.Username = data.username;
    //   this.mobileNumber = data.mobileNumber;
    //   this.email = data.email;
    // });
  }

  // checking ipAddress once every refresh
  async checkCookie() {
    // finding path
    var path = window.location.href.substring(
      window.location.href.lastIndexOf('/') + 1
    );
    // check cookie
    if (document.cookie != '') {
      this.loggedIn = true;
      if (
        path == '' ||
        path == 'passwordReset' ||
        path == 'signup' ||
        path == '403Error' ||
        path == 'forgotPass'
      ) {
        this.route.navigate(['/OF-Live']);
      } else {
        this.route.navigate([`/${path}`]);
      }
    }
  }
  socketConnected: boolean = false;
  socket: any;
  async connectSocket() {
    if (!this.socketConnected) {
      this.socketConnected = true;
      var path = window.location.href;
      var url = path.split('/');
      if (
        url[2] === 'meanapp-env.eba-3zmkem9t.ap-south-1.elasticbeanstalk.com'
      ) {
        this.socket = io(
          'http://meanapp-env.eba-3zmkem9t.ap-south-1.elasticbeanstalk.com',{ reconnection: false }
        );
      } else if (url[2] === 'doublemint.app') {
        this.socket = io('https://doublemint.app',{ reconnection: false });
      } else if (url[2] === 'www.doublemint.app') {
        this.socket = io('https://www.doublemint.app',{ reconnection: false });
      }else if (
        url[2] ===
        'testingmint-env.eba-ka8ykfpn.ap-south-1.elasticbeanstalk.com'
      ) {
        this.socket = io(
          'http://testingmint-env.eba-ka8ykfpn.ap-south-1.elasticbeanstalk.com'
        ,{ reconnection: false });
      } else if (url[2] === 'localhost:1234') {
        this.socket = io('http://localhost:4040',{ reconnection: false });
      }
    }
    return '';
  }
  async closeSocket(name: string) {
    if (this.socketConnected) {
      this.socket.emit('close-socket',name);
      this.socket.disconnect();
      this.socketConnected = false;
    }
    return '';
  }
  //user canceling logout
  closeAlert() {
    window.history.back();
  }
  // func for kite login
  KiteLogin() {
    this.UserAdmin = true;
    this.firstNav = false;
    this.loggedIn = true;
  }

  async shortFun() {
    this.loggedIn = false;
    // Logout the current session
    var cookie = document.cookie.slice(8);
    document.cookie = 'tokenID= ; expires = Thu, 01 Jan 1970 00:00:00 GMT';
    await this.http
      .post(BACKEND_URL + 'deleteSession', { cookie }, { responseType: 'text' })
      .toPromise();
    this.firstNav = true;
  }
  async logOut() {

    if (confirm('Are you sure!')) {
      // this.socketConnected = false;
      // this.socket.disconnect();
      this.route.navigate(['/login']);
      this.shortFun();
    }
  }
  ngOnDestroy() {}
}
