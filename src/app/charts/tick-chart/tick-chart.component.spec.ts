import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { AppComponent } from 'src/app/app.component';
import { SocketService } from 'src/app/mainService _file/socket.service';
import { TickChartComponent } from './tick-chart.component';

describe('TickChartComponent', () => {
  let component: TickChartComponent;
  let fixture: ComponentFixture<TickChartComponent>;
  let service: SocketService;
  let httpController : HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TickChartComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoggerTestingModule,
      ],
      providers: [SocketService, AppComponent],
    }).compileComponents();
    service = TestBed.get(SocketService);
    httpController = TestBed.get(HttpTestingController)
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TickChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('component and service created', () => {
    expect(component).toBeTruthy();
    expect(service).toBeTruthy();
  });

  it('global variables default values are', () => {
    expect(component.defaultScale).toBe(5);
    expect(component.timesDropdown).toBe(5);
    expect(component.timesOptions.length).toBe(5);
    expect(component.scaleOptions.length).toBe(5);
    expect(component.backendData).toEqual([]);
    expect(component.chartErr).toEqual(false);
  });
  it('ngOninit have been called', () => {
    spyOn(component, 'connect');
    spyOn(service, 'renderSVG');
    component.ngOnInit();
    expect(component.connect).toHaveBeenCalled();
    expect(component.connect).toHaveBeenCalledTimes(1);
    expect(service.renderSVG).toHaveBeenCalled();
    expect(service.renderSVG).toHaveBeenCalledTimes(1);
  });
  // if (new Date().getDay() < 5 ) {
  //   it('check the main func calling the needed sub func', () => {
  //     spyOn(service, 'weeklyIBdata');
  //     let spy = spyOn(service, 'dataFortick1');
  //     component.connect();
  //     expect(service.weeklyIBdata).toHaveBeenCalled();
  //     expect(service.weeklyIBdata).toHaveBeenCalledTimes(1);
  //     expect(service.weeklyIBdata).toHaveBeenCalledBefore(spy);
  //     expect(service.dataFortick1).toHaveBeenCalled();
  //     expect(service.dataFortick1).toHaveBeenCalledTimes(1);
  //     expect(service.db_wib_h).toBeGreaterThanOrEqual(0);
  //     expect(service.db_wib_l).toBeGreaterThanOrEqual(0);
  //   });
  // }
  // if (new Date().getDay() == 5) {
  //   it('check the main func calling the needed sub func', () => {
  //     spyOn(service, 'weeklyIBdata');
  //     spyOn(component, 'getDataFromDB');
  //     component.connect();
  //     expect(service.weeklyIBdata).not.toHaveBeenCalled();
  //     expect(component.getDataFromDB).toHaveBeenCalled();
  //     expect(component.getDataFromDB).toHaveBeenCalledTimes(1);
  //     fixture.detectChanges();
  //     expect(service.db_wib_h).toEqual(0);
  //     expect(service.db_wib_l).toEqual(0);
  //   });
  // }
  // it('check while change the scale and interval', () => {
  //   let default_num: number = 5;
  //   let alter_num: number = 15;
  //   expect(service.selectScale).toEqual(default_num);
  //   expect(component.defaultScale).toEqual(default_num);
  //   expect(service.selectTimeMinute).toEqual(default_num);
  //   expect(component.timesDropdown).toEqual(default_num);
  //   spyOn(component, 'getDataFrom_Indexed_DB');
  //   component.selectChange(alter_num);
  //   component.changeScale(alter_num);
  //   expect(service.selectScale).toEqual(alter_num);
  //   expect(component.defaultScale).toEqual(alter_num);
  //   expect(service.selectTimeMinute).toEqual(alter_num);
  //   expect(component.timesDropdown).toEqual(alter_num);
  //   expect(component.getDataFrom_Indexed_DB).toHaveBeenCalled();
  //   expect(component.getDataFrom_Indexed_DB).toHaveBeenCalledTimes(2);
  // });
  // it('check the calender with different date', () => {
  //   spyOn(service, 'weeklyIBdata');
  //   spyOn(service, 'dataFortick1');
  //   component.onDateChange('2022-10-27');
  //   expect(service.weeklyIBdata).toHaveBeenCalled();
  //   expect(service.weeklyIBdata).toHaveBeenCalledTimes(1);
  //   expect(service.dataFortick1).toHaveBeenCalled();
  //   expect(service.dataFortick1).toHaveBeenCalledTimes(1);
  // });
  // it('check whether the api request are send to the server', () => {
  //   const dataFortick1 = httpController.expectOne('http://localhost:4040/api/chart-data');
  //   const getLabels = httpController.expectOne('http://localhost:4040/api/getLabels');
  //   // const weeklyIBdata = httpController.expectOne('http://localhost:4040/api/weeklyIB_Timer');
  //   // tick();
  //   //expected results
  //   expect(getLabels.request.body).toEqual({});
  //   // expect(dataFortick1.request.body).toEqual({date : "2022-11-07"});
  //   expect(dataFortick1.request.method).toEqual('POST');
  //   expect(getLabels.request.method).toEqual('POST');
  //   // expect(weeklyIBdata.request.method).toEqual('POST');
  // });
  it("check set timer function", ()=>{
    spyOn(service, 'main_zoom_event_change');
    service.set_timer("");
    expect(service.main_zoom_event_change).toHaveBeenCalled();
    expect(service.main_zoom_event_change).toHaveBeenCalledTimes(1);
  })
  // xit("check component time function with correct value", ()=>{
  //   spyOn(service,'set_timer');
  //   let result = component.setTime_chart('11:20');
  //   expect(service.set_timer).toHaveBeenCalled();
  //   expect(service.set_timer).toHaveBeenCalledTimes(1);
  //   expect(result).toEqual('11:20');
  // });
  // xit("check component time function with wrong value", ()=>{
  //   spyOn(service,'set_timer');
  //   spyOn(component,'showTimeErr');
  //   component.setTime_chart('15:40');
  //   expect(component.showTimeErr).toHaveBeenCalled();
  //   expect(component.showTimeErr).toHaveBeenCalledTimes(1);
  // });

});
