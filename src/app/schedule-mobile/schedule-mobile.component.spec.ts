import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMobileComponent } from './schedule-mobile.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ScheduleDetails } from '../schedule/schedule-details.model';
import dayjs from 'dayjs';

describe('ScheduleMobileComponent', () => {
  let component: ScheduleMobileComponent;
  let fixture: ComponentFixture<ScheduleMobileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'hasRole']);

    await TestBed.configureTestingModule({
      imports: [
        ScheduleMobileComponent,
        MatSnackBarModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({ username: 'testUser', 'schedule-key': '1234' }) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleMobileComponent);
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
});
