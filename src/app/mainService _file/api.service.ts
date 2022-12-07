import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  url1 =
    'http://test-env.eba-kxvikfsm.us-east-2.elasticbeanstalk.com/getOpenVol';
  url2 =
    'http://test-env.eba-kxvikfsm.us-east-2.elasticbeanstalk.com/getOpenVolAvg';
  url3 = 'http://test-env.eba-kxvikfsm.us-east-2.elasticbeanstalk.com/refData';
  url4 =
    'http://test-env.eba-kxvikfsm.us-east-2.elasticbeanstalk.com/prevDayProfile';

  getOpenVol() {
    return this.http.get(this.url1);
  }

  getOpenVolAvg() {
    return this.http.get(this.url2);
  }
  getRefData() {
    return this.http.get(this.url3);
  }
  getPrevDayProfile() {
    return this.http.get(this.url4);
  }
}
