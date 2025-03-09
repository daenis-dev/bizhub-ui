import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCalendarMobileComponent } from './my-calendar-mobile.component';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
});
