import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCalendarMobileComponent } from './my-calendar-mobile.component';

describe('MyCalendarMobileComponent', () => {
  let component: MyCalendarMobileComponent;
  let fixture: ComponentFixture<MyCalendarMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCalendarMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCalendarMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
