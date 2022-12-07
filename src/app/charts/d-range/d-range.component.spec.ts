import { HttpClientTestingModule , HttpTestingController} from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { AppComponent } from 'src/app/app.component';
import { DRangeService } from 'src/app/charts/d-range/D-Range.service';
import { CommonService } from 'src/app/mainService _file/common.service';
import { ReferenceService } from 'src/app/mainService _file/referenceService';

import { DRangeComponent } from './d-range.component';
declare const $ : any;

fdescribe('DRangeComponent', () => {
  let component: DRangeComponent;
  let fixture: ComponentFixture<DRangeComponent>;
  let referenceSer : ReferenceService;
  let rangeSer : DRangeService;
  let commonSer : CommonService;
  let httpcontroller : HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DRangeComponent , ],
      imports : [HttpClientTestingModule,RouterTestingModule,LoggerTestingModule],
      providers : [ReferenceService,DRangeService, AppComponent,CommonService]
    })
    .compileComponents();
    referenceSer = TestBed.get(ReferenceService);
    rangeSer = TestBed.get(DRangeService);
    commonSer = TestBed.get(CommonService);
    httpcontroller = TestBed.get(HttpTestingController)
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('component should automatically call display function', () => {
    spyOn(component, 'DisplayRange');
    component.ngOnInit();
    expect(component.DisplayRange).toHaveBeenCalled();
    expect(component.DisplayRange).toHaveBeenCalledTimes(1);
  });

  it('dont call the chart function when data is empty', ()=> {
    spyOn(commonSer, 'storeData_to_Indexed_DB');
    spyOn(rangeSer, 'updateTimeDateRange');
    spyOn(rangeSer, 'alterVwapChangefunc');
    rangeSer.fetchTodayData([],'','');
    expect(rangeSer.alterVwapChangefunc).not.toHaveBeenCalled()
    expect(rangeSer.updateTimeDateRange).not.toHaveBeenCalled()
  })

  it('create and close and alter  index db function', ()=> {
    spyOn(commonSer ,'createIndexed_DB');
    spyOn(commonSer ,'closeIndexed_DB');
    rangeSer.create_Indexed_DB();
    expect(commonSer.createIndexed_DB).toHaveBeenCalled();
    rangeSer.close_Indexed_DB();
    expect(commonSer.closeIndexed_DB).toHaveBeenCalled();
  });

  it('check time range data working without error',()=>{
    let data:any = [
      {"_id":"635b503c5a099bc026b0e44c","date":"2022-10-28T03:45:00.000Z","instrument_token":13669122,"instrument_name":"NIFTY-F","ohlc":{"open":17781,"high":17878,"low":17781,"close":17789.2},"total_volume":7350,"latestTradedPrice":17794,"vwap":17832.94,"volumePOC":{"price":"17794","volume":7350},"first15MinProfile":{"volume":7350},"initialBalance":{"volume":7350,"ibHigh":17878,"ibLow":17781,"ib":97,"ib1_5U":17926.5,"ib2U":17975,"ib3U":18072,"ib1_5D":17732.5,"ib2D":17684,"ib3D":17587},"weeklyIB":{"volume":7350,"ibHigh":17878,"ibLow":17781,"ib":97,"ib1_5U":17926.5,"ib2U":17975,"ib3U":18072,"ib1_5D":17732.5,"ib2D":17684,"ib3D":17587},"lastTradedQuantity":7350,"valueArea":{"vah":17794,"val":17794,"valueAreaVolume":7350}},{"_id":"635b503d5a099bc026b0e44d","date":"2022-10-28T03:45:01.000Z","instrument_token":13669122,"instrument_name":"NIFTY-F","ohlc":{"open":17781,"high":17878,"low":17781,"close":17789.2},"total_volume":13700,"latestTradedPrice":17810,"vwap":17824.61,"volumePOC":{"price":"17794","volume":7350},"first15MinProfile":{"volume":13700},"initialBalance":{"volume":13700,"ibHigh":17878,"ibLow":17781,"ib":97,"ib1_5U":17926.5,"ib2U":17975,"ib3U":18072,"ib1_5D":17732.5,"ib2D":17684,"ib3D":17587},"weeklyIB":{"volume":13700,"ibHigh":17878,"ibLow":17781,"ib":97,"ib1_5U":17926.5,"ib2U":17975,"ib3U":18072,"ib1_5D":17732.5,"ib2D":17684,"ib3D":17587},"lastTradedQuantity":6350,"valueArea":{"vah":17810,"val":17794,"valueAreaVolume":13700}}
    ];
    spyOn(rangeSer, 'get_modified_mainData')
    spyOn(rangeSer, 'createChart')
    rangeSer.updateTimeDateRange(data);
    expect(rangeSer.get_modified_mainData).toHaveBeenCalled();
    expect(rangeSer.createChart).toHaveBeenCalled();
  })

  it("ngOnDestroy should close the socket connection", ()=> {
    spyOn(rangeSer,'closeSocket');
    component.ngOnDestroy();
    expect(rangeSer.closeSocket).toHaveBeenCalled();
    expect(rangeSer.closeSocket).toHaveBeenCalledTimes(1);
  })
});
