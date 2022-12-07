import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { AppComponent } from 'src/app/app.component';
import { ProfileServiceService } from 'src/app/charts/profilechart/profile-service.service';

import { ProfilechartComponent } from './profilechart.component';

describe('ProfilechartComponent', () => {
  let component: ProfilechartComponent;
  let fixture: ComponentFixture<ProfilechartComponent>;
  let HttpController: HttpTestingController;
  let service: ProfileServiceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilechartComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoggerTestingModule,
      ],
      providers: [ProfileServiceService, AppComponent],
    }).compileComponents();
    HttpController = TestBed.get(HttpTestingController);
    service = TestBed.get(ProfileServiceService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('check ngOninit creating a svg element', () => {
    expect(service.containerID).toEqual('candlestick');
    spyOn(service, 'renderSVG');
    spyOn(component, 'connect');
    component.ngOnInit();
    expect(service.renderSVG).toHaveBeenCalled();
    expect(service.renderSVG).toHaveBeenCalledTimes(1);
    expect(component.connect).toHaveBeenCalled();
    expect(component.connect).toHaveBeenCalledTimes(1);
    const httpmock = HttpController.expectOne(
      'http://localhost:4040/api/GET-WHOLE-VA'
    );
    expect(httpmock.request.method).toEqual('POST');
    expect(httpmock.request.body).toEqual({});
  });
  xit('check connect func requesting data from server', fakeAsync(() => {
    component.connect();
    expect(component.isLoading).toBe(true);
    tick();
    const httpmock = HttpController.expectOne(
      'http://localhost:4040/api/GET-WHOLE-VA'
    );
    expect(httpmock.request.method).toEqual('POST');
    expect(httpmock.request.body).toEqual({});
  }));
  it("check ngOndestroy close the socket server",()=>{
    spyOn(service,'closeSocket');
    component.ngOnDestroy();
    expect(service.closeSocket).toHaveBeenCalled();
    expect(service.closeSocket).toHaveBeenCalledTimes(1);
  })
});
