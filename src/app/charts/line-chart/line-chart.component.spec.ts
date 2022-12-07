import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { LineChartService } from 'src/app/charts/line-chart/line-chart.service';
import { LineChartComponent } from './line-chart.component';

describe('LineChartComponent', () => {
  let component: LineChartComponent;
  let fixture: ComponentFixture<LineChartComponent>;
  let service : LineChartService;
  let httpController : HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LineChartComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoggerTestingModule,
      ],
      providers: [LineChartService],
    }).compileComponents();
    httpController = TestBed.get(HttpTestingController);
    service = TestBed.get(LineChartService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it("check ngOninit calling default chart function",()=>{
    spyOn(component,'displayLineChart');
    component.ngOnInit();
    expect(component.displayLineChart).toHaveBeenCalled();
    expect(component.displayLineChart).toHaveBeenCalledTimes(1);
  })
  it('check the initial state of form values', () => {
    expect(component.checkoutForm.value.value).toBe(null);
    expect(component.checkoutForm.valid).toBe(false);
  });
  it('enter different types of error and check', () => {
    component.checkoutForm.setValue({
      value: '',
    });
    component.onSubmit();
    expect(component.checkoutForm.valid).toBe(false);
    expect(component.displayErr).toBe(true);
    expect(component.displayErrMsg).toEqual('*Please Enter the valid number');
  });
  it('enter negative number and check', () => {
    component.checkoutForm.setValue({
      value: -42,
    });
    component.onSubmit();
    expect(component.displayErr).toBe(true);
    expect(component.displayErrMsg).toEqual('*Please Enter the valid number');
  });
  it('check with entering valid number', () => {
    let num:any = 42;
    component.checkoutForm.setValue({
      value: num,
    });
    expect(component.checkoutForm.valid).toBe(true);
    spyOn(service,'getDataFromBackend');
    component.onSubmit();
    expect(component.displayErr).toBe(false);
    expect(service.start).toEqual(num);
    expect(service.getDataFromBackend).toHaveBeenCalled();
    expect(service.getDataFromBackend).toHaveBeenCalledTimes(1);
    const httpmock = httpController.expectOne("http://localhost:4040/api/historicalData");
    expect(httpmock.request.body).toEqual({});
    expect(httpmock.request.method).toEqual('POST');
  });
  it("ngOnDestroy should clear the chart",()=>{
    spyOn(service, "clearChart");
    component.ngOnDestroy();
    expect(service.clearChart).toHaveBeenCalled();
    expect(service.clearChart).toHaveBeenCalledTimes(1);
  })
});
