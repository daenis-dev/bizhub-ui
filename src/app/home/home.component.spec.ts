import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { Router } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to "/my-backups" when openMyFiles is called', () => {
    component.openMyFiles();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/my-backups');
  });

  it('should navigate to "/my-calendar" when openMyCalendar is called', () => {
    component.openMyCalendar();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/my-calendar');
  });
});
