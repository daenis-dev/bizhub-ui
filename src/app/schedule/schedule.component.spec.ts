import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleComponent } from './schedule.component';
import { AuthService } from '../services/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import dayjs from 'dayjs';
import { of } from 'rxjs';
import { ScheduleDetails } from './schedule-details.model';
import { ActivatedRoute } from '@angular/router';

describe('ScheduleComponent', () => {
  let component: ScheduleComponent;
  let fixture: ComponentFixture<ScheduleComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'hasRole']);

    await TestBed.configureTestingModule({
      imports: [
        ScheduleComponent,
        MatSnackBarModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({ username: 'testUser', 'schedule-key': '1234' }) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with events loaded', () => {
    spyOn(component, 'loadEvents');
    component.ngOnInit();
    expect(component.loadEvents).toHaveBeenCalled();
  });

  it('should fetch events from API', () => {
    const mockSchedule: ScheduleDetails =
      { username: 'someone@mail.com', eventDateDetails: [{startDateTime: dayjs().toISOString(), endDateTime: dayjs().add(1, 'hour').toISOString()}] }
    ;
    const httpSpy = spyOn(component['http'], 'get').and.returnValue(of(mockSchedule));

    component.loadEvents();

    expect(httpSpy).toHaveBeenCalled();
    expect(component.events).toEqual(mockSchedule.eventDateDetails);
  });

  it('should navigate weeks forward and backward', () => {
    const initialDate = component.currentDate;
    component.navigate(1);
    expect(component.currentDate.isAfter(initialDate)).toBeTrue();
    
    component.navigate(-1);
    expect(component.currentDate.isSame(initialDate)).toBeTrue();
  });

  it('should navigate hours correctly', () => {
    component.visibleHourStart = 8;
    component.navigateHours(1);
    expect(component.visibleHourStart).toBe(9);

    component.navigateHours(-1);
    expect(component.visibleHourStart).toBe(8);
  });

  it('should show snackbar on error', () => {
    const snackBarSpy = spyOn(component['snackBar'], 'open');
    component.showErrorMessage('Test error');
    expect(snackBarSpy).toHaveBeenCalledWith('Test error', 'Close', jasmine.any(Object));
  });

  it('should correctly identify if an event exists at a time', () => {
    const day = {
      events: [{ id: '1', name: 'Meeting', startDateTime: dayjs().hour(10).toISOString(), endDateTime: dayjs().hour(11).toISOString() }]
    };
    expect(component.hasEventAtTime(day, 10)).toBeTrue();
    expect(component.hasEventAtTime(day, 12)).toBeFalse();
  });

  it('should correctly get event at a time', () => {
    const event = { id: '1', name: 'Meeting', startDateTime: dayjs().hour(10).toISOString(), endDateTime: dayjs().hour(11).toISOString() };
    const day = { events: [event] };
    expect(component.getEventAtTime(day, 10)).toEqual(event);
    expect(component.getEventAtTime(day, 12)).toBeNull();
  });
});
