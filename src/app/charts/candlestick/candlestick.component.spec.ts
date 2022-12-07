import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { AppComponent } from 'src/app/app.component';
import { SocketService } from 'src/app/mainService _file/socket.service';
import { CandlestickComponent } from './candlestick.component';

describe('CandlestickComponent', () => {

  let component: CandlestickComponent;
  let fixture: ComponentFixture<CandlestickComponent>;
  let service: SocketService;

  let httpController: HttpTestingController;
  //    Market Start Time
  let MarketStartTime = new Date();
  MarketStartTime.setHours(9);
  MarketStartTime.setMinutes(15);
  MarketStartTime.setSeconds(0);
  //    Market End Time
  let MarketEndTime = new Date();
  MarketEndTime.setHours(15);
  MarketEndTime.setMinutes(30);
  MarketEndTime.setSeconds(0);
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CandlestickComponent],
      providers: [SocketService, AppComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoggerTestingModule,
      ],
    }).compileComponents();
    httpController = TestBed.get(HttpTestingController);
    service = TestBed.get(SocketService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CandlestickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  let scale = 5;
  let timeInterval = 5;
  let chart = 'candlestick';

  // afterEach(() => {
  //   httpTestingController.verify();
  //  });
  it('component and service created', () => {
    expect(component).toBeTruthy();
    expect(service).toBeTruthy();
  });

  it('while entering the component', ()=>{
    spyOn(component, 'connect');
    spyOn(service, 'renderSVG');
    component.ngOnInit();
    expect(service.selectScale).toEqual(scale);
    expect(service.selectTimeMinute).toEqual(timeInterval);
    expect(service.containerID).toEqual(chart);
    expect(service.containerID).not.toEqual('');
    expect(service.chartType).toEqual(chart);
    expect(service.chartType).not.toEqual('');
    expect(component.connect).toHaveBeenCalled();
    expect(component.connect).toHaveBeenCalledTimes(1);
    expect(service.renderSVG).toHaveBeenCalled();
    expect(service.renderSVG).toHaveBeenCalledTimes(1);
  });

  it('while entering the component', ()=>{
    spyOn(component, 'connect');
    spyOn(service, 'renderSVG');
    component.ngOnInit();
    expect(service.selectScale).toEqual(scale);
    expect(service.selectTimeMinute).toEqual(timeInterval);
    expect(service.containerID).toEqual(chart);
    expect(service.containerID).not.toEqual('');
    expect(service.chartType).toEqual(chart);
    expect(service.chartType).not.toEqual('');
    expect(component.connect).toHaveBeenCalled();
    expect(component.connect).toHaveBeenCalledTimes(1);
    expect(service.renderSVG).toHaveBeenCalled();
    expect(service.renderSVG).toHaveBeenCalledTimes(1);
  });

  //after 3 30

  xit('after 3 30 should not connect socket',()=>{
    spyOn(component,'getDataFromDB');
    component.connect();
    expect(service.socketBool).toBe(false);
    expect(component.getDataFromDB).toHaveBeenCalled();
    expect(component.getDataFromDB).toHaveBeenCalledTimes(1);
  })

  xit('call the promise function to get data', ()=> {
    spyOn(service, 'createIndexed_db');
    service.createIndexed_db({_id : 'ronaldo'});
    expect(service.createIndexed_db).toHaveBeenCalled();
    expect(service.createIndexed_db).toHaveBeenCalledTimes(1);
  })

  //before 3 30

  xit('before 3 30 need to connect socket',()=>{
    spyOn(component,'getDataFromDB');
    component.connect();
    expect(service.socketBool).toBe(true);
    expect(component.getDataFromDB).not.toHaveBeenCalled();
    expect(component.getDataFromDB).not.toHaveBeenCalledTimes(1);
  });
  it('mainCommon function should call the important func only',()=>{
    spyOn(service,'updateStartAndEndLine1')
    spyOn(service,'updateleftSideandRightSideTextData')
    spyOn(service,'updateGTextAndMiddleLine1')
    spyOn(service,'updateTablelayout')
    spyOn(service,'updateEveryTicks')
    spyOn(service,'updateSide_vpoc_bar')
    service.mainCommon([],true);
    expect(service.updateStartAndEndLine1).toHaveBeenCalled();
    expect(service.updateleftSideandRightSideTextData).toHaveBeenCalled();
    expect(service.updateGTextAndMiddleLine1).toHaveBeenCalled();
    expect(service.updateTablelayout).toHaveBeenCalled();
    expect(service.updateEveryTicks).toHaveBeenCalled();
    expect(service.updateSide_vpoc_bar).toHaveBeenCalled();
  });

  it('check the hide and show button for side bar', () => {
    service.sideBar = true;
    spyOn(service, 'updateleftSideandRightSideTextData');
    spyOn(service, 'updateGTextAndMiddleLine');
    spyOn(service, 'main_zoom_event');
    service.hide_show_sideBar();
    expect(service.sideBar).toBe(false);
    expect(service.updateleftSideandRightSideTextData).toHaveBeenCalled();
    expect(service.updateGTextAndMiddleLine).toHaveBeenCalled();
    expect(service.main_zoom_event).toHaveBeenCalled();
  });

  it('unmerge all function should recreate a chart from first',()=>{
    spyOn(service, 'modify_newChart')
    service.unmerge_All();
    expect(service.mergedArray).toEqual([]);
    expect(service.mergedObj).toEqual({});
    expect(service.modify_newChart).toHaveBeenCalled();
  })

  it('close the socket while leaving',()=>{
    spyOn(service , 'closeSocket');
    component.ngOnDestroy();
    expect(service.closeSocket).toHaveBeenCalled();
    expect(service.closeSocket).toHaveBeenCalledTimes(1);
  })
});



























/*

  it('global variables default values are', () => {
    expect(component.defaultScale).toBe(5);
    expect(component.timesDropdown).toBe(5);
    expect(component.timesOptions.length).toBe(5);
    expect(component.scaleOptions.length).toBe(5);
    expect(component.backendData).toEqual([]);
    expect(component.chartErr).toEqual(false);
    expect(service.socketConnected).toEqual(false);
    expect(service.socketBool).toEqual(false);
  });
  it('when ngOninit have been called connet should start automatically', () => {
    spyOn(component, 'connect');
    spyOn(service, 'renderSVG');
    component.ngOnInit();
    expect(component.connect).toHaveBeenCalled();
    expect(component.connect).toHaveBeenCalledTimes(1);
    expect(service.renderSVG).toHaveBeenCalled();
    expect(service.renderSVG).toHaveBeenCalledTimes(1);
  });
  //please check the current date
  if (
    new Date().getDay() < 5 &&
    new Date().getTime() < MarketEndTime.getTime()
  ) {
    it('check the main func calling the needed sub func', () => {
      spyOn(service, 'weeklyIBdata');
      let spy = spyOn(service, 'dataForCandlestick');
      component.connect();
      expect(service.weeklyIBdata).toHaveBeenCalled();
      expect(service.weeklyIBdata).toHaveBeenCalledTimes(1);
      expect(service.weeklyIBdata).toHaveBeenCalledBefore(spy);
      expect(service.dataForCandlestick).toHaveBeenCalled();
      expect(service.dataForCandlestick).toHaveBeenCalledTimes(1);
      expect(service.db_wib_h).toBeGreaterThanOrEqual(0);
      expect(service.db_wib_l).toBeGreaterThanOrEqual(0);
    });
  } else if (
    new Date().getDay() == 5 &&
    new Date().getTime() < MarketEndTime.getTime()
  ) {
    it('check the main func calling the needed sub func', () => {
      spyOn(service, 'weeklyIBdata');
      spyOn(service, 'fetchLabels');
      spyOn(service, 'dataForCandlestick');
      component.connect();
      expect(service.weeklyIBdata).not.toHaveBeenCalled();
      expect(service.dataForCandlestick).toHaveBeenCalled();
      expect(service.fetchLabels).not.toHaveBeenCalled();
      expect(service.fetchLabels).toHaveBeenCalled();
      expect(service.dataForCandlestick).toHaveBeenCalledTimes(1);
      fixture.detectChanges();
      expect(service.db_wib_h).toEqual(0);
      expect(service.db_wib_l).toEqual(0);
    });
  } else {
    it('chart after time 3 30', () => {
      spyOn(component, 'getDataFromDB');
      spyOn(service, 'weeklyIBdata');
      component.connect();
      expect(component.getDataFromDB).toHaveBeenCalled();
      expect(component.getDataFromDB).toHaveBeenCalledTimes(1);
      expect(service.weeklyIBdata).not.toHaveBeenCalled();
      expect(service.db_wib_h).toBeGreaterThanOrEqual(0);
      expect(service.db_wib_l).toBeGreaterThanOrEqual(0);
    });
  }
  it("chech the renderSVG creates the svg element",()=>{
    service.renderSVG();
    expect(service.baseSVG).not.toBe(null);
    expect(service.svgGroup).not.toBe(null);
    expect(service.focus).not.toBe(null);
    expect(service.textR).not.toBe(null);
    expect(service.textL).not.toBe(null);
    expect(service.xAxisG).not.toBe(null);
    expect(service.yAxisG).not.toBe(null);
    expect(service.width).not.toBe(0);
    expect(service.height).not.toBe(0);
  })
  it('check while change the scale and interval', () => {
    let default_num: number = 5;
    let alter_num: number = 15;
    expect(service.selectScale).toEqual(default_num);
    expect(component.defaultScale).toEqual(default_num);
    expect(service.selectTimeMinute).toEqual(default_num);
    expect(component.timesDropdown).toEqual(default_num);
    spyOn(service, 'getDataFrom_Indexed_DB');
    component.selectChange(alter_num);
    component.changeScale(alter_num);
    expect(service.selectScale).toEqual(alter_num);
    expect(component.defaultScale).toEqual(alter_num);
    expect(service.selectTimeMinute).toEqual(alter_num);
    expect(component.timesDropdown).toEqual(alter_num);
    expect(service.getDataFrom_Indexed_DB).toHaveBeenCalled();
    expect(service.getDataFrom_Indexed_DB).toHaveBeenCalledTimes(1);
  });
  it('check whether the api request are send to the server', () => {
    if (new Date().getTime() < MarketEndTime.getTime()) {
      const candlestickData = httpController.expectOne(
        'http://localhost:4040/api/chart-data'
      );
    //   expect(candlestickData.request.method).toEqual('POST');
    //   const weeklyIBdata = httpController.expectOne(
    //     'http://localhost:4040/api/weeklyIB_Timer'
    //   );
    //   expect(weeklyIBdata.request.method).toEqual('POST');
    }
    // expect(dataFortick1.request.body).toEqual({date : "2022-10-28"});
    const getLabels = httpController.expectOne(
      'http://localhost:4040/api/getLabels'
    );
    expect(getLabels.request.body).toEqual({});
    expect(getLabels.request.method).toEqual('POST');
  });
*/
