import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingChartComponent } from './testing-chart.component';

describe('TestingChartComponent', () => {
  let component: TestingChartComponent;
  let fixture: ComponentFixture<TestingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestingChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
