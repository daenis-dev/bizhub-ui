import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMobileComponent } from './schedule-mobile.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
});
