import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PaytmComponent } from './paytm.component';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('PaytmComponent', () => {
  let component: PaytmComponent;
  let fixture: ComponentFixture<PaytmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaytmComponent ],
      imports : [HttpClientTestingModule,LoggerTestingModule,RouterTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaytmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
