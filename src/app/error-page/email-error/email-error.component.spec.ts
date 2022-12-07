import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { AppComponent } from 'src/app/app.component';

import { EmailErrorComponent } from './email-error.component';

describe('EmailErrorComponent', () => {
  let component: EmailErrorComponent;
  let fixture: ComponentFixture<EmailErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailErrorComponent ],
      providers : [AppComponent],
      imports: [LoggerTestingModule,RouterTestingModule,HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
