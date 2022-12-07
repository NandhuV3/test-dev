import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionOfLiveComponent } from './option-of-live.component';

describe('OptionOfLiveComponent', () => {
  let component: OptionOfLiveComponent;
  let fixture: ComponentFixture<OptionOfLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionOfLiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionOfLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
