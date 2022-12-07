import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/user/'

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit ,AfterViewInit ,OnDestroy{

  constructor(
    private http: HttpClient,
    private elementRef: ElementRef,
    private logger : NGXLogger
  ) { }
  checkEmail:boolean = false;
  emailSent:boolean = false;
  userForm: NgForm;

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#f0f2f5';
  }

  async forgetPassword(value:any){

    if(value.email != ''){
      await this.http.post(BACKEND_URL + 'forgetPass', {email: value.email}).toPromise().then((result:any)=>{

        if(result.message == "true"){
          this.emailSent = true;
        }
        if(result.message == "false"){
          this.checkEmail = true;
          setTimeout(()=> {
            this.checkEmail = false;
          },4000);
        }
      }).catch((err:any)=>{
        this.logger.error(`ERROR IN FORGOT-PASS PAGE : ${err.message}`)
      });
    }
  }
  ngOnDestroy(): void {
      this.emailSent = false;
  }
}
