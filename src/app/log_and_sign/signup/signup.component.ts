import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'src/environments/environment';
import { AppComponent } from '../../app.component';
import * as CryptoJS from 'crypto-js';


const BACKEND_URL = environment.apiUrl + '/user/';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy{

  checkPassword: boolean = false;
  checkEmail: boolean = false;
  emailFailed:boolean = false;
  waitingMsg:boolean = false;
  runSpinner:boolean = false;
  signupform = new FormGroup({
    username: new FormControl(null, [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(25),
      Validators.pattern('^[a-zA-Z]{1,}[a-zA-Z0-9_]*$'),
    ]),
    email: new FormControl(null, [
      Validators.required,
      Validators.email,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
    ]),
    password: new FormControl(null, [Validators.required,Validators.pattern('^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$'),Validators.minLength(6),Validators.maxLength(15)]),
    reenter: new FormControl(null, [Validators.required,Validators.pattern('^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$'),Validators.minLength(6),Validators.maxLength(15)]),
  });

  constructor(
    private http: HttpClient,
    private $appCom : AppComponent,
    private elementRef: ElementRef,
    private logger: NGXLogger) {
    this.$appCom.firstNav = false;
    this.$appCom.loggedIn = false;
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
    // '#161d36';
    "#f7f7f7";
  }

  ngOnInit(): void {}

  async onSubmit() {

    if (this.signupform.value.password != this.signupform.value.reenter) {
      // this.alertMsg = false;
      this.checkPassword = true;
      setTimeout(() => {
        this.checkPassword = false;
      }, 3000);
    } else {

      await this.http
        .post(BACKEND_URL + 'checkSignUp' , {email : this.signupform.value.email})
        .toPromise().then((result:any)=>{
          if (result.result == 'true') {
            this.checkEmail = true;
            setTimeout(() => {
              this.checkEmail = false;
            }, 5000);
            this.signupform.reset();
          } else if (result.result == 'false') {
            this.runSpinner = true;
            this.saveDataInDb(this.signupform.value);
            this.signupform.reset();
          }
        }).catch((err)=>{
          this.logger.error(`ERROR IN SIGNUP PAGE : ${err.message}`)
        });
    }
  }

  async saveDataInDb(getData: any) {

    var encryptData = await CryptoJS.AES.encrypt(JSON.stringify(getData), "noOneCanFindthis token").toString();

    await this.http
      .post(BACKEND_URL + 'userSignUp', {encryptData}, { responseType: 'text' })
      .toPromise().then((result:any)=>{

        var results = JSON.parse(result)
        if(results.message == "true"){
          this.emailFailed = true;
          setTimeout(()=> {
            this.emailFailed = false;
          },10000);
        }else {
          this.runSpinner = false;
          this.waitingMsg = true;
        }
      }).catch((err:any)=>{
        this.logger.error(`ERROR IN SIGNUP PAGE : ${err.message}`);
      })
  }

  ngOnDestroy(): void {
      this.waitingMsg = false;
  }
}
