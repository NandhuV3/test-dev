import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Router, Routes } from '@angular/router';
import {Location} from "@angular/common";
import { LoginComponent } from './log_and_sign/login/login.component';
import { SignupComponent } from './log_and_sign/signup/signup.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  ];

describe('AppComponent', () => {
  let component : AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpController : HttpTestingController;
  let location: Location;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports:[HttpClientTestingModule,RouterTestingModule.withRoutes(routes),LoggerTestingModule]
    }).compileComponents();
    httpController = TestBed.get(HttpTestingController);
    router = TestBed.get(Router);
    location = TestBed.get(Location);
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router.initialNavigation();
  });
  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'candlestick'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('candlestick');
  });

  it("ngOninit checking the user is admin or not",()=>{
    spyOn(component,'checkCookie');
    component.ngOnInit();
    expect(component.checkCookie).toHaveBeenCalled();
    expect(component.checkCookie).toHaveBeenCalledTimes(1);
  })
  it("connect with socket.io",()=>{
    expect(component.socketConnected).toBe(false);
    component.connectSocket();
    expect(component.socketConnected).toBe(true);
  });
  it('navigate to "" redirects you to /login', fakeAsync(() => {
    router.navigate(['login']);
    tick();
    expect(location.path()).toBe('/login');
  }));
  xit('check logout func navigate to login page', fakeAsync(() => {
    spyOn(component,'shortFun');
    component.logOut();
    tick();
    expect(location.path()).toBe('/login');
    expect(component.shortFun).toHaveBeenCalled();
    expect(component.shortFun).toHaveBeenCalledTimes(1);
  }));
  it('check browser send token to the server', fakeAsync(() => {
    component.shortFun();
    expect(component.loggedIn).toBe(false);
    tick();
    const httpmock = httpController.expectOne("http://localhost:4040/user/deleteSession");
    expect(httpmock.request.method).toEqual('POST');
    expect(component.firstNav).toBe(true);
  }));
});
