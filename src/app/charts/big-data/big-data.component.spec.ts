import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { BigDataComponent } from './big-data.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BigChartService } from 'src/app/charts/big-data/big-data.service';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('BigDataComponent', () => {
  let component: BigDataComponent;
  let fixture: ComponentFixture<BigDataComponent>;
  let httpController: HttpTestingController;
  let service: BigChartService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BigDataComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoggerTestingModule,
      ],
      providers: [BigChartService],
    }).compileComponents();
    httpController = TestBed.get(HttpTestingController);
    service = TestBed.get(BigChartService);
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(BigDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /// ------ Please check all the date function

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('check ngDestory calling clear function', () => {
    spyOn(service, 'clearChart');
    component.ngOnDestroy();
    expect(service.clearChart).toHaveBeenCalled();
    expect(service.clearChart).toHaveBeenCalledTimes(1);
  });
  it('initial state of form values should be null', () => {
    expect(component.checkoutForm.valid).toBe(false);
    expect(component.checkoutForm.value.from1).toBe(null);
    expect(component.checkoutForm.value.to1).toBe(null);
    expect(component.checkoutForm.value.value1).toBe(null);
    expect(component.checkoutForm.value.from2).toBe(null);
    expect(component.checkoutForm.value.to2).toBe(null);
    expect(component.checkoutForm.value.value2).toBe(null);
  });
  it('submit the form with correct values', () => {
    let cdate = new Date();
    let odate = new Date();
    cdate.setDate(20);

    component.checkoutForm.setValue({
      from1: odate,
      to1: cdate,
      value1: 2,
      from2: odate,
      to2: cdate,
      value2: 2,
    });
    spyOn(service, 'createChart');
    component.onSubmitOne();
    expect(component.errorOccured).toBe(false);
    expect(component.checkoutForm.valid).toBe(true);
    expect(service.createChart).toHaveBeenCalled();
    expect(service.createChart).toHaveBeenCalledTimes(1);
  });
  it('submit the form with wrong values and check error', () => {
    let cdate = new Date();
    let odate = new Date();
    cdate.setDate(20);
    // with wrong dates
    component.checkoutForm.setValue({
      from1: cdate,
      to1: odate,
      value1: 2,
      from2: cdate,
      to2: odate,
      value2: 2,
    });

  expect(component.checkoutForm.valid).toBe(true);
  component.onSubmitOne();
  //error occured
  expect(component.errorOccured).toBe(true);
  expect(component.errMsg).toEqual("*Please check all the fields")
  });

  it("check service functions working properly",()=>{
    spyOn(service,'lineGraphForHigh');
    spyOn(service,'lineGraphForLow');
    service.totalArray1 = [{date : new Date().toISOString(),high : 888510}];
    service.totalArray2 = [{date : new Date().toISOString(),high : 888510}];
    service.start1 = 8510;
    service.start2 = 8510;
    service.getFullData();
    expect(service.lineGraphForHigh).toHaveBeenCalled();
    expect(service.lineGraphForHigh).toHaveBeenCalledTimes(1);
    expect(service.lineGraphForLow).toHaveBeenCalled();
    expect(service.lineGraphForLow).toHaveBeenCalledTimes(1);
  })

  it("asign null to the global values at end",()=>{
    service.clearChart();
    expect(service.dataForLine1).toBe(null);
    expect(service.dataForLine2).toBe(null);
  })
});
