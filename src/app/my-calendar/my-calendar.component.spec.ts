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
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

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

  it('should disable navigate up button at hour 0', () => {
    component.visibleHourStart = 0;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.time-navigation button:first-child');
    expect(button.disabled).toBeTrue();
  });

  it('should open account dialog', () => {
    const dialogSpy = spyOn(component['dialog'], 'open');
    component.openAccountDialog();
    expect(dialogSpy).toHaveBeenCalled();
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
