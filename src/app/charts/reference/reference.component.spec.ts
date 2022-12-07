import { HttpClientTestingModule , HttpTestingController} from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, } from '@angular/forms';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ReferenceService } from 'src/app/mainService _file/referenceService';

import { ReferenceComponent } from './reference.component';
describe('ReferenceComponent', () => {
  let component: ReferenceComponent;
  let fixture: ComponentFixture<ReferenceComponent>;
  let httpController : HttpTestingController;
  let service : ReferenceService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferenceComponent ],
      imports: [HttpClientTestingModule,FormsModule,LoggerTestingModule],
      providers : [ReferenceService]
    })
    .compileComponents();
    httpController = TestBed.get(HttpTestingController);
    service = TestBed.get(ReferenceService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('check the initial value in the component',()=>{
    let tableHeader = ['Labels', 'Price', 'Color', 'Date', 'Alert Status','SMS Status', 'Alter'];
    expect(component.tableHeaders).toEqual(tableHeader);
    expect(component.showErr).toBe(false);
    expect(component.lablesList.length).toEqual(0);
  })
  xit('check ngOninit calling both func', () => {
    spyOn(component,'fetchLabels');
    spyOn(component,'colorPalatte');
    component.ngOnInit();
    expect(component.fetchLabels).toHaveBeenCalled();
    expect(component.fetchLabels).toHaveBeenCalledTimes(1);
    expect(component.colorPalatte).toHaveBeenCalled();
    expect(component.colorPalatte).toHaveBeenCalledTimes(1);
  });
  xit("check fetchLabels func 'without' empty content", fakeAsync(() => {
    let data:any = [{label: 'some', price : 17000 , timeStamp : new Date(),date : '2022-11-04',color : 'hotpink'}];
    spyOn(service, 'getLabels').and.returnValue(data);
    component.fetchLabels();
    tick();
    expect(service.getLabels).toHaveBeenCalled();
    expect(service.getLabels).toHaveBeenCalledTimes(1);
    expect(component.lablesList).toEqual(data);
    expect(component.lablesList.length).toBeGreaterThanOrEqual(0);
    expect(component.emptyContent).toBe(false);
    const getlabels = httpController.expectOne("http://localhost:4040/api/getLabels");
    expect(getlabels.request.method).toEqual('POST');
    expect(getlabels.request.body).toEqual({});
  }));
  xit("check fetchLabels func 'with' empty content", fakeAsync(() => {
    let data : any = []
    spyOn(service, 'getLabels').and.returnValue(data);
    component.fetchLabels();
    tick();
    expect(service.getLabels).toHaveBeenCalled();
    expect(service.getLabels).toHaveBeenCalledTimes(1);
    expect(component.lablesList).toEqual([]);
    expect(component.lablesList.length).toBe(0);
    expect(component.emptyContent).toBe(true);
    const getlabels = httpController.expectOne("http://localhost:4040/api/getLabels");
    expect(getlabels.request.method).toEqual('POST');
    expect(getlabels.request.body).toEqual({});
  }));
  it('check postLabel func', fakeAsync(() => {
    let value:any = {label: 'some', price : 17000 , timeStamp : new Date(),date : '2022-11-04',color : 'hotpink'};
    spyOn(service, 'postLabels').and.callThrough();
    component.postLabels(value);
    tick();
    expect(service.postLabels).toHaveBeenCalled();
    expect(service.postLabels).toHaveBeenCalledTimes(1);
    const getlabels = httpController.expectOne("http://localhost:4040/api/postLabels");
    expect(getlabels.request.method).toEqual('POST');
    expect(getlabels.request.body).toEqual({value});
  }));
  it('check deleteLabel func send delete req to the server', fakeAsync(() => {
    let label = 'someNew';
    spyOn(service, 'deleteLabel').and.callThrough();
    component.deleteLabel(label);
    tick();
    expect(service.deleteLabel).toHaveBeenCalled();
    expect(service.deleteLabel).toHaveBeenCalledTimes(1);
    const getlabels = httpController.expectOne("http://localhost:4040/api/deleteLabel");
    expect(getlabels.request.method).toEqual('POST');
    expect(getlabels.request.body).toEqual({label});
  }));
  it('check changeStatus func send req to the server', fakeAsync(() => {
    let label = ['vpoc','','','','offslider'];
    spyOn(service, 'updateUserLabels').and.callThrough();
    component.changeStatus(label);
    tick();
    expect(service.updateUserLabels).toHaveBeenCalled();
    expect(service.updateUserLabels).toHaveBeenCalledTimes(1);
    const getlabels = httpController.expectOne("http://localhost:4040/api/updateUserLabels");
    expect(getlabels.request.method).toEqual('POST');
    expect(getlabels.request.body).toEqual({label:label[0],AlertStatus: label[4]});
  }));
  xit("check onSubmit func 'with' credentials in variable", () => {
    let obj = {label : 'some',color: 'red',date:'2022-11-01',price: 17002};
    spyOn(component,'postLabels');
    expect(component.showErr).toBe(false);
    component.lablesList = [{label: 'some'}];
    component.onSubmit(obj);
    expect(component.showErr).toBe(true);
    expect(component.showErrMsg).toEqual('label already exists!')
    expect(component.changeBTN).toBe(false);
  });
  xit("check onSubmit func 'without' credentials in variable", () => {
    let obj = {label : 'some',color: 'red',date:'2022-11-01',price: 17002};
    spyOn(component,'postLabels');
    expect(component.showErr).toBe(false);
    component.onSubmit(obj);
    expect(component.showErr).toBe(false);
    expect(component.changeBTN).toBe(false);
    expect(component.postLabels).toHaveBeenCalled();
    expect(component.postLabels).toHaveBeenCalledTimes(1);
  });
  xit("check editLabel func calling server", () => {
    let label = ['vpoc','','','','offslider'];
    component.editLabel(label);
    const getlabels = httpController.expectOne("http://localhost:4040/api/deleteLabel");
    expect(getlabels.request.method).toEqual('POST');
    expect(getlabels.request.body).toEqual({label : label[0]});
  });
});
