import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule , HttpTestingController} from '@angular/common/http/testing';
import { LogsComponent } from './logs.component';

describe('LogsComponent', () => {
  let component: LogsComponent;
  let fixture: ComponentFixture<LogsComponent>;
  let httpController : HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogsComponent ],
      imports:[HttpClientTestingModule]
    })
    .compileComponents();
    httpController = TestBed.get(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('check the get func send request to the server', fakeAsync(() => {
    expect(component.showLogs.length).toBe(0);
    tick();
    const httpmock  = httpController.expectOne("http://localhost:4040/api/getLogs");
    expect(httpmock.request.method).toEqual('POST');
    expect(httpmock.request.body).toEqual({});
  }));
});
