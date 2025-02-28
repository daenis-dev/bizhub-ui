import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareScheduleComponent } from './share-schedule.component';

describe('ShareScheduleComponent', () => {
  let component: ShareScheduleComponent;
  let fixture: ComponentFixture<ShareScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
