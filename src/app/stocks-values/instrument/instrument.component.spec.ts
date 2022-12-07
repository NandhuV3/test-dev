import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { AppComponent } from 'src/app/app.component';
import { Location } from '@angular/common';
import { InstrumentComponent } from './instrument.component';
import { Router, Routes } from '@angular/router';
import { LoginComponent } from 'src/app/log_and_sign/login/login.component';
import { InstrumentService } from 'src/app/stocks-values/instrument/Instrument.service';

const routes: Routes = [
  { path: 'instrument', component: InstrumentComponent },
  { path: 'login', component: LoginComponent },
];

describe('InstrumentComponent', () => {
  let component: InstrumentComponent;
  let fixture: ComponentFixture<InstrumentComponent>;
  let httpController : HttpTestingController;
  let location: Location;
  let router: Router;
  let $appCom : AppComponent;
  let service : InstrumentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        LoggerTestingModule,
      ],
      declarations: [InstrumentComponent],
      providers: [AppComponent,InstrumentService],
    }).compileComponents();
    httpController = TestBed.get(HttpTestingController);
    $appCom = TestBed.get(AppComponent);
    location = TestBed.get(Location);
    router = TestBed.get(Router);
    service = TestBed.get(InstrumentService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router.initialNavigation();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('component initial state ', async () => {
    // expect(component.searchStr).toEqual('');
    expect(component.instruments).toEqual([]);
    expect(component.isLoading).toEqual(false);
  });
  it("if document.cookie = '' should redirect to login page", fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(location.path()).toEqual('/login');
  }));
  it("if document.cookie != '' should call func", (done: DoneFn) => {
    document.cookie = `tokenID=nandhuronaldomessineymar`;
    spyOn(component, 'filterInstrument');
    component.ngOnInit();
    expect(component.filterInstrument).toHaveBeenCalled();
    expect(component.filterInstrument).toHaveBeenCalledTimes(1);
    document.cookie = 'tokenID= ; expires = Thu, 01 Jan 1970 00:00:00 GMT';
    done();
  });
  it('when filterInstrument func is called, request should send to server ', fakeAsync(() => {
    component.filterInstrument();
    expect(component.isLoading).toBe(true);
    tick();
    const httpmock = httpController.expectOne("http://localhost:4040/api/getInstrument");
    expect(httpmock.request.method).toEqual('POST');
    expect(httpmock.request.body).toEqual({});
  }));
  it('check findsymbol func is working perfect', ()=>{
    spyOn(service, 'compareFun');
    let value = "rondlo"
    component.findSymbol(value);
    expect(service.compareFun).toHaveBeenCalled();
    expect(service.compareFun).toHaveBeenCalledTimes(1);
  });
  it('check ngOnDestroy closing socket', ()=>{
    spyOn(service, 'closeSocket');
    component.ngOnDestroy();
    expect(service.closeSocket).toHaveBeenCalled();
    expect(service.closeSocket).toHaveBeenCalledTimes(1);
  });
});
