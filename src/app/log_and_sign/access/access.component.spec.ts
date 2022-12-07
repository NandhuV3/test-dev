import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { AppComponent } from 'src/app/app.component';

import { AccessComponent } from './access.component';

describe('AccessComponent', () => {
  let component: AccessComponent;
  let fixture: ComponentFixture<AccessComponent>;
  let httpController : HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessComponent ],
      imports:[HttpClientTestingModule,RouterTestingModule,LoggerTestingModule],
      providers: [AppComponent]
    })
    .compileComponents();
    httpController = TestBed.get(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.KiteErr).toEqual(false);
  });

});
