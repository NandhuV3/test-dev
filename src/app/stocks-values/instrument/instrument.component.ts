import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NGXLogger } from 'ngx-logger';
import { InstrumentService } from 'src/app/stocks-values/instrument/Instrument.service';

const BACKEND_URL = environment.apiUrl + '/api/';
declare const $: any;

@Component({
  selector: 'app-instrument',
  templateUrl: './instrument.component.html',
  styleUrls: ['./instrument.component.scss'],
})
export class InstrumentComponent implements OnInit, OnDestroy {
  instruments: any = [];
  instrumentToken: any = [];
  headerValues: any = [];
  showTable: boolean = false;
  filteredList: any = [];
  liElements: any = [];
  showli: boolean = false;
  showComponent: boolean = false;
  isLoading: boolean = false;
  pageErr: boolean = false;
  pageErrMsg: string = '';
  totalResult: any = {};
  socketConnected: boolean = false;
  constructor(
    public http: HttpClient,
    public elementRef: ElementRef,
    public route: Router,
    public logger: NGXLogger,
    private InstrumentService: InstrumentService
  ) {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#0f162e';
  }
  @HostListener('window:beforeunload') async onBeforeUnload() {
    await this.InstrumentService.closeSocket();
  }

  ngOnInit(): void {
    if (document.cookie != '') {
      this.filterInstrument();
    } else {
      this.route.navigate(['/login']);
    }
  }

  async filterInstrument() {
    this.isLoading = true;
    this.http.post(BACKEND_URL + 'getInstrument', {}).subscribe(
      (result: any) => {
        if (Array.isArray(result)) {
          if (result.length > 1) {
            this.isLoading = false;
            this.InstrumentService.instruments = result;
            this.instruments = result;
            this.showComponent = true;
          } else {
            this.callBackError('Empty content from the server!');
            this.logger.error(
              `ERROR IN INSTRUMENT-LIST PAGE : "Empty content from the server!"}`
            );
          }
        } else {
          this.callBackError(result.message);
          this.logger.error(
            `ERROR IN INSTRUMENT-LIST PAGE : ${result.message}`
          );
        }
      },
      (err: any) => {
        this.callBackError(err.message);
        this.logger.error(`ERROR IN INSTRUMENT-LIST PAGE : ${err.message}`);
      }
    );
  }

  async findSymbol(value: any) {
    $('#inputchange').val('');
    this.showli = false;
    this.InstrumentService.compareFun(value);
  }
  newstr: string = '';
  public modelChange(str: any) {
    this.newstr = str;
    if (str == '') {
      this.showli = false;
    } else {
      var search_term = str;
      var patt1 = /[0-9]/g;
      var patt2 = /[a-zA-Z]/g;
      search_term.toString();
      search_term = search_term.toLowerCase();
      var splitStr = search_term.match(patt2);
      var joinStr = splitStr.join();
      var fullStr = joinStr.replace(/,/g, '');
      this.liElements = [];
      this.instruments.forEach((item: any) => {
        var array = [];
        array.push(item.tradingsymbol);
        array.forEach((item: any) => {
          if (item != undefined) {
            var splitStr1 = item.match(patt2);
            var joinStr1 = splitStr1.join();
            var fullStr1 = joinStr1.replace(/,/g, '');
            if (fullStr1.toLowerCase().indexOf(fullStr) !== -1) {
              this.liElements.push(item);
              this.liElements = this.liElements.slice(0, 15);
            }
          }
        });
      });
      this.showli = true;
    }
  }
  callBackError(message: any) {
    this.showComponent = false;
    this.pageErrMsg = message;
    this.pageErr = true;
    this.isLoading = false;
  }

  async ngOnDestroy() {
    await this.InstrumentService.closeSocket();
  }
}
