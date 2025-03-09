import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCalendarComponent } from './my-calendar.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import dayjs from 'dayjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Router } from '@angular/router';
import { EventDetails } from './event-details.model';

describe('MyCalendarComponent', () => {
  let component: MyCalendarComponent;
  let fixture: ComponentFixture<MyCalendarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'hasRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        MyCalendarComponent,
        MatDialogModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    authServiceSpy.hasRole.and.returnValue(true);
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
    const mockEvents: EventDetails[] = [
      { id: '1', name: 'meeting', startDateTime: dayjs().toISOString(), endDateTime: dayjs().add(1, 'hour').toISOString() }
    ];
    const httpSpy = spyOn(component['http'], 'get').and.returnValue(of(mockEvents));

    component.loadEvents();

    expect(httpSpy).toHaveBeenCalled();
    expect(component.events).toEqual(mockEvents);
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

  it('should correctly handle event starting on the hour and ending on the half hour (10:00 AM - 10:30 AM)', () => {
    const event: EventDetails = {
      id: '1',
      name: 'Short Event',
      startDateTime: dayjs().hour(10).minute(0).toISOString(),
      endDateTime: dayjs().hour(10).minute(30).toISOString()
    };
    const day = { events: [event] };
    expect(component.hasEventAtTime(day, 10)).toBeTrue();
    expect(component.hasEventAtTime(day, 10.5)).toBeFalse();
  });

  it('should correctly handle event starting on the half hour and ending on the hour (10:30 AM - 11:00 AM)', () => {
    const event: EventDetails = {
      id: '2',
      name: 'Short Event 2',
      startDateTime: dayjs().hour(10).minute(30).toISOString(),
      endDateTime: dayjs().hour(11).minute(0).toISOString()
    };
    const day = { events: [event] };
    expect(component.hasEventAtTime(day, 10.5)).toBeTrue();
    expect(component.hasEventAtTime(day, 11)).toBeFalse();
  });

  it('should correctly handle event starting on the hour and ending on the hour (10:00 AM - 11:00 AM)', () => {
    const event: EventDetails = {
      id: '3',
      name: '1 Hour Event',
      startDateTime: dayjs().hour(10).minute(0).toISOString(),
      endDateTime: dayjs().hour(11).minute(0).toISOString()
    };
    const day = { events: [event] };
    expect(component.hasEventAtTime(day, 10)).toBeTrue();
    expect(component.hasEventAtTime(day, 11)).toBeFalse();
  });

  it('should correctly handle event starting on the half hour and ending on the half hour (10:30 AM - 11:30 AM)', () => {
    const event: EventDetails = {
      id: '4',
      name: '1 Hour Event 2',
      startDateTime: dayjs().hour(10).minute(30).toISOString(),
      endDateTime: dayjs().hour(11).minute(30).toISOString()
    };
    const day = { events: [event] };
    expect(component.hasEventAtTime(day, 10.5)).toBeTrue();
    expect(component.hasEventAtTime(day, 11.5)).toBeFalse();
  });

  it('should correctly handle event starting on the half hour and ending on the hour (10:30 AM - 12:00 PM)', () => {
    const event: EventDetails = {
      id: '5',
      name: '1.5 Hour Event',
      startDateTime: dayjs().hour(10).minute(30).toISOString(),
      endDateTime: dayjs().hour(12).minute(0).toISOString()
    };
    const day = { events: [event] };
    expect(component.hasEventAtTime(day, 10.5)).toBeTrue();
    expect(component.hasEventAtTime(day, 12)).toBeFalse();
  });

  it('should correctly handle event starting on the hour and ending on the half hour (10:00 AM - 11:30 AM)', () => {
    const event: EventDetails = {
      id: '6',
      name: '1.5 Hour Event 2',
      startDateTime: dayjs().hour(10).minute(0).toISOString(),
      endDateTime: dayjs().hour(11).minute(30).toISOString()
    };
    const day = { events: [event] };
    expect(component.hasEventAtTime(day, 10)).toBeTrue();
    expect(component.hasEventAtTime(day, 11.5)).toBeFalse();
  });

  it('should correctly handle event starting on the hour and ending on the hour (10:00 AM - 12:00 PM)', () => {
    const event: EventDetails = {
      id: '7',
      name: '2 Hour Event',
      startDateTime: dayjs().hour(10).minute(0).toISOString(),
      endDateTime: dayjs().hour(12).minute(0).toISOString()
    };
    const day = { events: [event] };
    expect(component.hasEventAtTime(day, 10)).toBeTrue();
    expect(component.hasEventAtTime(day, 12)).toBeFalse();
  });

  it('should correctly handle event starting on the half hour and ending on the half hour (10:30 AM - 12:30 PM)', () => {
    const event: EventDetails = {
      id: '8',
      name: '2 Hour Event 2',
      startDateTime: dayjs().hour(10).minute(30).toISOString(),
      endDateTime: dayjs().hour(12).minute(30).toISOString()
    };
    const day = { events: [event] };
    expect(component.hasEventAtTime(day, 10.5)).toBeTrue();
    expect(component.hasEventAtTime(day, 12.5)).toBeFalse();
  });
});
