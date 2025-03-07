import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMobileComponent } from './schedule-mobile.component';

describe('ScheduleMobileComponent', () => {
  let component: ScheduleMobileComponent;
  let fixture: ComponentFixture<ScheduleMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
