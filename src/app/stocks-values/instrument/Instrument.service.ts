import { Injectable } from '@angular/core';
import { AppComponent } from '../../app.component';
declare const $: any;

@Injectable({
  providedIn: 'root',
})
export class InstrumentService {
  constructor(private $appCom: AppComponent) {}

  socket_ID: any;
  instruments: any = [];
  totalResult: any = [];
  socketConnected: boolean = false;
  valueArray: any = [];
  async compareFun(value: any) {
    if (this.valueArray.indexOf(value) == -1) {
      if (this.socketConnected) {
        await this.$appCom.closeSocket('instrument');
      }
      this.$appCom.connectSocket();

      this.valueArray.push(value);
      value = value.toString();
      value = value.toUpperCase();
      this.instruments.filter((d: any) => {
        if (value == d.tradingsymbol) {
          this.totalResult[d.instrument_token] = {
            tradingsymbol: d.tradingsymbol,
            instrument_token: d.instrument_token,
            last_price: 0,
          };
        }
      });

      this.$appCom.socket.emit(
        'post-instrument',
        Object.keys(this.totalResult)
      );
      this.socketConnected = true;
      this.$appCom.socket.on('get-Ticks', (data: any) => {
        data.forEach((d: any) => {
          this.totalResult[d.instrument_token]['last_price'] = d.last_price;
          let header: any = Object.keys(this.totalResult);

          $('#myTable > tbody > tr').remove();
          for (let i = 0; i < header.length; i++) {
            $('#myTable > tbody:last-child').append(
              '<tr id="myTableRow" ><td>' +
                this.totalResult[header[i]]['tradingsymbol'] +
                '</td><td>' +
                this.totalResult[header[i]]['last_price'] +
                '</td></tr>'
            );
          }
        });
      });
    } else {
      $('#existsErr').css('display', 'block');
      setTimeout(() => {
        $('#existsErr').css('display', 'none');
      }, 4000);
    }
  }
  async closeSocket() {
    await this.$appCom.closeSocket('instrument');
    return '';
  }
}
