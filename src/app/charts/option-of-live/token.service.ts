import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { AppComponent } from '../../app.component';
import { CommonService } from '../../mainService _file/common.service';
const BACKEND_URL = environment.apiUrl + '/api/';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(
    private http: HttpClient,
    private $appCom: AppComponent,
    private commonSer: CommonService
  ) {}
  socket_ID: string = null;
  socketConnected: boolean = false;
  socketBool: boolean = false;
  instrumentList:any = [];

  async findInstrument(data: number) {
    let instrument_list: any = await this.http
      // .post(BACKEND_URL + 'getInstrument', {})
      .get('./assets/instrument/instrument.json')
      .toPromise();
    // });

    //   // todo : find the next thursday
    let next_week = new Date();

    if (next_week.getDay() >= 5 || next_week.getDate() > 24) {
      next_week.setDate(
        next_week.getDate() + ((4 + 7 - next_week.getDay()) % 7 || 7)
      );
    } else if (next_week.getDay() == 4) {
    } else {
      next_week.setDate(
        next_week.getDate() + ((5 - 7 - next_week.getDay()) % 7 || 7)
      );
    }

    // * find month
    let month = moment(next_week).format('MMM');
    month = month.toUpperCase();

    // * find year
    let year = moment(next_week).format('YY');
    // * find name
    let name = 'NIFTY';
    // * merge all the founded strings
    let concatString: string = name.concat(year, month);

    //   // ? store the symbols...
    let overALL_PE_CE: any = [];

    // // //   // todo : all the price ... below 5 above 5 from actual price
    let total: any = this.check_PE_CE(data);

    // instrument_list.forEach((d: any) => {
    //   if (d.strike == 18200 && d.tradingsymbol == `NIFTY22NOV${18200}CE`) {
    //     overALL_PE_CE.push(d.instrument_token);
    //   }
    // });
    // todo : filter the instrument and get the symbols
    // this.instrumentList.forEach((d: any) => {
      instrument_list.forEach((d: any) => {
      if (
        total.indexOf(d.strike) != -1 &&
        (d.tradingsymbol == `${concatString}${d.strike}CE` ||
          d.tradingsymbol == `${concatString}${d.strike}PE`)
      ) {
        // overALL_PE_CE.push(d);
        // overALL_PE_CE.push(d.instrument_token);
        overALL_PE_CE.push({
          id: Number(d.instrument_token),
          name: d.tradingsymbol,
        });
      }
    });
    // overALL_PE_CE = overALL_PE_CE.map((d: any) => Number(d));
    return overALL_PE_CE;

    // this.tokenConnection(vpoc_val, overALL_PE_CE);
  }

  check_PE_CE(data: number) {
    let highPrice = data + 500;
    let lowPrice = data - 500;
    let array = [];
    for (let i = lowPrice; i <= highPrice; i += 100) {
      array.push(100 * Math.round(i / 100));
    }
    return array;
  }
}
