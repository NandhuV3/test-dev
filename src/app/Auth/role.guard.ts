import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { environment } from 'src/environments/environment';
const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private http: HttpClient) {}
  async canActivate() {
    var token = document.cookie.slice(8);

    var checkAdmin = await this.http
      .post(BACKEND_URL + 'checkSession', { token })
      .toPromise();
    if (checkAdmin[0].admin == true) {
      return true;
    } else {
      return false;
    }
  }
}
