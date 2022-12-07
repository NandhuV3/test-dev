import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
const BACKEND_API = environment.apiUrl + '/api/';

@Injectable({
  providedIn: 'root',
})
export class ReferenceService {
  constructor(private http: HttpClient) {}

  async getLabels() {
    return await this.http.post(BACKEND_API + 'getLabels', {}).toPromise();
  }
  async updateUserLabels(obj: any) {
    return await this.http
      .post(BACKEND_API + 'updateUserLabels', obj)
      .toPromise();
  }
  async postLabels(value: any) {
    return await this.http
      .post(BACKEND_API + 'postLabels', { value })
      .toPromise();
  }
  async deleteLabel(label: any) {
    return await this.http.post(BACKEND_API + 'deleteLabel', label).toPromise();
  }
  async get_single_data(arr: any) {
    return await this.http
      .post(BACKEND_API + 'get_single_data', { date: arr[0], status: arr[1] })
      .toPromise();
  }
  async get_oneDay_full_data(date: any) {
    return await this.http
      .post(BACKEND_API + 'chart-data', { date })
      .toPromise();
  }
  async getlast_14_days_first15min() {
    return await this.http
      .post(BACKEND_API + 'last_14-Days_first_15Min', {})
      .toPromise()
  }
  async getlast_14_days_totalVolume() {
    return await this.http
      .post(BACKEND_API + 'last_14-Days_totalVolume', {})
      .toPromise();
  }
}
