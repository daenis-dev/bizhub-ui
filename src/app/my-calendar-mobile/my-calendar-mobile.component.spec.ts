import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCalendarMobileComponent } from './my-calendar-mobile.component';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventDetails } from '../my-calendar/event-details.model';
import dayjs from 'dayjs';

describe('MyCalendarMobileComponent', () => {
  let component: MyCalendarMobileComponent;
  let fixture: ComponentFixture<MyCalendarMobileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'hasRole']);

    await TestBed.configureTestingModule({
      imports: [MyCalendarMobileComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({ username: 'testUser', 'schedule-key': '1234' }) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCalendarMobileComponent);
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
});
