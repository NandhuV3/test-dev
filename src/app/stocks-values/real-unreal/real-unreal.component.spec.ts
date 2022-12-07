import { HttpClientTestingModule , HttpTestingController} from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { RealUnrealComponent } from './real-unreal.component';

describe('RealUnrealComponent', () => {
  let component: RealUnrealComponent;
  let fixture: ComponentFixture<RealUnrealComponent>;
  let httpController : HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RealUnrealComponent ],
      imports: [HttpClientTestingModule,LoggerTestingModule,RouterTestingModule],
    })
    .compileComponents();
    httpController = TestBed.get(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RealUnrealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('check ngOninit gets data from db', fakeAsync(()=> {
    expect(component.fullArray).toEqual([]);
    spyOn(component,'getDataFromDB');
    component.ngOnInit();
    expect(component.getDataFromDB).toHaveBeenCalled();
    expect(component.getDataFromDB).toHaveBeenCalledTimes(1);
    tick();
    const httpmock = httpController.expectOne("http://localhost:4040/api/realUnreal");
    expect(httpmock.request.method).toEqual("POST");
    expect(httpmock.request.body).toEqual({});
  }));
  it('check while changing dateChanged func', fakeAsync(()=> {
    let date = "2022-11-01";
    component.dateChanged(date);
    tick();
    const httpmock = httpController.expectOne("http://localhost:4040/api/realUnrealFrom");
    expect(httpmock.request.method).toEqual("POST");
    expect(httpmock.request.body).toEqual({date});
  }));
});
