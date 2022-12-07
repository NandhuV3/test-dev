import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { PositionComponent } from './position.component';
import { PositionService } from './position.service';
import { AppComponent } from '../../app.component';
import { RouterTestingModule } from '@angular/router/testing';


describe('PositionComponent', () => {
  let component: PositionComponent;
  let fixture: ComponentFixture<PositionComponent>;
  let service: PositionService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    service = new PositionService();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PositionComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoggerTestingModule,
      ],
      providers: [PositionService, AppComponent],
    }).compileComponents();
    httpController = TestBed.get(HttpTestingController);
    service = TestBed.get(PositionService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('component initial stage should be', () => {
    expect(component.netOrder).toEqual([]);
    expect(component.dayOrder).toEqual([]);
    expect(component.netHeaders).toEqual([
      'TradingSymbol',
      'Product',
      'quan',
      'Avg',
      'ltp',
      'Realised',
      'Unrealised',
      'Pnl',
    ]);
    expect(component.dayHeaders).toEqual([
      'TradingSymbol',
      'Product',
      'quan',
      'Avg',
      'ltp',
      'Realised',
      'Unrealised',
      'PnL',
    ]);
  });

  it('check ngOninit calling the main function', () => {
    spyOn(component, 'showingPos');
    component.ngOnInit();
    expect(component.showingPos).toHaveBeenCalled();
    expect(component.showingPos).toHaveBeenCalledTimes(1);
    expect(component.MarketStartTime).not.toBe(null);
    expect(component.MarketEndTime).not.toBe(null);
  });
  xit('check the main function sent req to the server', fakeAsync(() => {
    component.showingPos();
    tick(500);
    const httpmock = httpController.expectOne(
      'http://localhost:4040/api/position'
    );
    expect(httpmock.request.method).toEqual('POST');
    expect(httpmock.request.body).toEqual({});
  }));
  it('check ngOndestroy stops the interval func', () => {
    component.ngOnDestroy();
    expect(component.interval).toEqual(null);
  });
  it('check the getOrder function', () => {
    let data = {
      net: { some: '12345' },
      day: { some: '67890' },
    };
    service.getOrders(data);
    expect(service.TotalOrders).toEqual([data]);
    expect(service.net).toBeTruthy();
    expect(service.day).toBeTruthy();
  });
  it('check the getDayValues function', () => {
    service.day = [
      {
        tradingsymbol: 'GOLDPETAL21JUNFUT',
        product: 'NRML',
        average_price: 4852,
        quantity: 1,
        last_price: 17987,
        realised: 500,
        unrealised: 0,
        pnl: 500,
      },
    ];
    expect(service.getDayValues()).toEqual([
      {
        TradingSymbol: 'GOLDPETAL21JUNFUT',
        Product: 'NRML',
        quan: 1,
        Avg: '4852.00',
        ltp: '17987.00',
        Realised: '500.00',
        Unrealised: '0.00',
        PnL: '500.00',
      },
    ]);
  });
  it('check the getNetValues function', () => {
    service.net = [
      {
        tradingsymbol: 'GOLDPETAL21JUNFUT',
        product: 'NRML',
        average_price: 4852,
        quantity: 1,
        last_price: 17987,
        realised: 500,
        unrealised: 0,
        pnl: 500,
        buy_quantity : 0,
        sell_quantity : 0
      },
    ];
    expect(service.getNetValues()).toEqual([
      {
        TradingSymbol: 'GOLDPETAL21JUNFUT',
        Product: 'NRML',
        quan: 1,
        Avg: '4852.00',
        ltp: '17987.00',
        Realised: '0.00',
        Unrealised: '0.00',
        Pnl: '500.00',
      },
    ]);
  });
});
//https://kite.trade/docs/connect/v3/orders/

/*
  {
      "tradingsymbol": "GOLDPETAL21JUNFUT",
      "product": "NRML",
      "average_price": 4852,
      "quantity": 1,
      "ltp": 17987,
      "Realised": 500,
      "Unrealised": 0,
      "PnL": 500,
    },
*/
