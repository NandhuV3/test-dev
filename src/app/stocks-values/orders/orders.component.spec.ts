import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppComponent } from '../../app.component';
import { OrdersComponent } from './orders.component';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderService } from './orders1.service';
import { PendingOrdersService } from './pendingOrders.service';
import { HttpClientModule } from '@angular/common/http';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let httpController: HttpTestingController;
  let service1: OrderService;
  let service2: PendingOrdersService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrdersComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        HttpClientModule,
        LoggerTestingModule,
      ],
      providers: [AppComponent, PendingOrdersService, OrderService],
    }).compileComponents();
    httpController = TestBed.get(HttpTestingController);
    service1 = TestBed.get(OrderService);
    service2 = TestBed.get(PendingOrdersService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(service1).toBeTruthy();
    expect(service2).toBeTruthy();
  });

  it('component initial state should be', () => {
    expect(component.results).toEqual({});
    expect(component.pendingData).toEqual([]);
    expect(component.MarketStartTime).toEqual(null);
    expect(component.MarketEndTime).toEqual(null);
    expect(component.dbUnrealisedData.length).toEqual(0);
    expect(component.OrdersErr).toBe(false);
    expect(component.runSpinner).toBe(false);
    expect(component.socketConnected).toBe(false);
    let header1 =[
      'TradingSymbol',
      'Exchange_timestamp',
      'Product',
      'Order_type',
      'Quantity',
      'Average_price',
      'Transaction_type',
      'StopLoss',
    ];
    let header2 = [
      'TradingSymbol',
      'Exchange_timestamp',
      'Product',
      'Order_type',
      'Qty',
      'Avg',
      'Type',
    ];
    expect(component.header).toEqual(header1);
    expect(component.header1).toEqual(header2);
  });
  it("ngOninit should start the main function",()=>{
    spyOn(component, 'firstFun');
    component.ngOnInit();
    expect(component.firstFun).toHaveBeenCalled();
    expect(component.firstFun).toHaveBeenCalledTimes(1);
  })
  xit("main function should run getIP address func",fakeAsync(()=>{
    spyOn(component, 'getIpAddress');
    component.firstFun();
    expect(component.getIpAddress).toHaveBeenCalled();
    expect(component.getIpAddress).toHaveBeenCalledTimes(1);
    tick();
    const httpIPaddress = httpController.expectOne("https://api.ipify.org/?format=json")
    expect(httpIPaddress.request.method).toEqual("GET");
    const userAdmin = httpController.expectOne("http://localhost:4040/api/userAdmin")
    expect(userAdmin.request.method).toEqual("POST");
  }));
  it('check showOrders func working in weekly days', () => {
    spyOn(component, 'showOrders');
    spyOn(component, 'SatAndSun');
    component.callOrders();
    if (new Date().getDate() >= 1 && new Date().getDay() <= 5) {
      expect(component.showOrders).toHaveBeenCalled();
      expect(component.showOrders).toHaveBeenCalledTimes(1);
    } else {
      expect(component.SatAndSun).toHaveBeenCalled();
      expect(component.SatAndSun).toHaveBeenCalledTimes(1);
    }
  });
  xit("check showOrders func requesting for pending and current day orders",()=>{
    component.showOrders();
    const pending = httpController.expectOne("http://localhost:4040/api/pending")
    expect(pending.request.method).toEqual("POST");
  });
  xit("check showOrders func requesting for pending and current day orders",()=>{
    component.showOrders();
    const previousOrders = httpController.expectOne("http://localhost:4040/api/previousOrders")
    expect(previousOrders.request.method).toEqual("POST");
  });
});
