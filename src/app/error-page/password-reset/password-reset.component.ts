import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/user/';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private route: Router,
    private logger: NGXLogger
  ) {
    // var path = window.location.href.substring(
    //   window.location.href.lastIndexOf('/') + 1
    // );
    var path = window.location.href;
    var userEmail = path.split('?')[1];
    this.userEmail = userEmail.split('=')[1];
  }

  ngOnInit(): void {}
  userEmail: any;
  errorMsg: boolean = false;
  successMsg: boolean = false;

  passwordForm = new FormGroup({
    password1: new FormControl(null, [
      Validators.required,
      Validators.pattern(
        '^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$'
      ),
    ]),
    password2: new FormControl(null, [
      Validators.required,
      Validators.pattern(
        '^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$'
      ),
    ]),
  });

  async userData() {
    if (
      this.passwordForm.value.password1 != this.passwordForm.value.password2
    ) {
      this.errorMsg = true;
      setTimeout(() => {
        this.errorMsg = false;
      }, 4000);
    }
    if (
      this.passwordForm.value.password1 == this.passwordForm.value.password2
    ) {
      var userDetail = {
        email: this.userEmail,
        pwd1: this.passwordForm.value.password1,
        pwd2: this.passwordForm.value.password2,
      };
      await this.http
        .post(BACKEND_URL + 'updatePassword', userDetail, {
          responseType: 'text',
        })
        .toPromise()
        .then((result: any) => {
          var result = JSON.parse(result);
          if (result.message == 'true') {
            this.successMsg = true;
            setTimeout(() => {
              this.successMsg = false;
              this.route.navigate(['/login']);
            }, 3000);
          }
          this.passwordForm.reset();
        })
        .catch((err: any) => {
          this.logger.error(`ERROR WHILE PASSWORD RESET : ${err.message}`);
        });
    }
  }
}
