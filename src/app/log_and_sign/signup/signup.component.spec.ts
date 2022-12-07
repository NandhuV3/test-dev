import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from '../../app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupComponent ],
      imports: [HttpClientTestingModule,RouterTestingModule,LoggerTestingModule],
      providers:[AppComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('check initial state', () => {
    expect(component.signupform.value.username).toBe(null);
    expect(component.signupform.value.email).toBe(null);
    expect(component.signupform.value.password).toBe(null);
    expect(component.signupform.value.reenter).toBe(null);
  });

  it('should require valid email', () => {
    component.signupform.setValue({
      "username": "ronaldo",
      "email": '',
      "password": "",
      "reenter": ""
    });
    expect(component.signupform.valid).toEqual(false);
  });
  it('validate form with valid value', () => {
    component.signupform.setValue({
      "username": "ronaldo2",
      "email": 'ronaldo@gmail.com',
      "password": "nandha1#",
      "reenter": "nandha1#"
    });
    expect(component.signupform.valid).toEqual(true);
    component.onSubmit();
    expect(component.checkPassword).toEqual(false);
    expect(component.signupform.value.password).toEqual("nandha1#");
  });
  it("when ngDestory called", ()=>{
    component.ngOnDestroy();
    expect(component.waitingMsg).toEqual(false);
  })

});
