import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from '../../app.component';
import { RouterTestingModule } from "@angular/router/testing";
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerTestingModule
      ],
      providers: [AppComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
​
  it('component initial state', () => {
    expect(component.contactForm.value.password).toBe(null)
    expect(component.contactForm.value.email).toBe(null)
    expect(component.checkEmail).toEqual(false);
    expect(component.checkPassword).toEqual(false);
  });
// ​
  it("check password reset", () => {
    component.forgotPass();
    expect(component.contactForm.value.email).toBe(null);
    // expect(component.contactForm.value.email).not.toBe('');
  });

  it('should require valid email', () => {
    component.contactForm.setValue({
      "email": '',
      "password": ''
    });
    expect(component.contactForm.valid).toEqual(false);
  });
  it('validate form with valid value', () => {
    component.contactForm.setValue({
      "email": 'ronaldo@gmail.com',
      "password": "nandha1#",
    });
    expect(component.contactForm.valid).toEqual(true);
    component.onSubmit();
    expect(component.checkPassword).toEqual(false);
    expect(component.contactForm.value.password).toEqual("nandha1#");
  });

});
