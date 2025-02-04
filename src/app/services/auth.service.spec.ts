import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpParams, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true if user is authenticated', () => {
    localStorage.setItem('token', 'mockToken');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    localStorage.setItem('token-exp', tomorrow.toString());

    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false if user is not authenticated', () => {
    localStorage.removeItem('token');
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should register account and navigate to /my-backups', () => {
    const params = new HttpParams()
      .set('email-address', 'john.doe@example.com')
      .set('password', 'password123')
      .set('confirmed-password', 'password123');

    service.registerAccountForParams(params);
    
    const req = httpTestingController.expectOne("https://localhost:8080/v1/register?email-address=john.doe@example.com&password=password123&confirmed-password=password123");
    expect(req.request.method).toBe('POST');
    
    req.flush({});
    expect(snackBarSpy.open).toHaveBeenCalledWith("Account registered successfully", 'Close', jasmine.any(Object));
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/my-backups');
  });

  it('should log in', () => {
    const email = 'john.doe@example.com';
    const password = 'password123';
  
    service.loginForEmailAndPassword(email, password);
  
    expect(localStorage.getItem('token-exp')).toBeTruthy();
  });

  it('should log out and navigate to home', () => {
    service.logout();
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('token-exp')).toBeNull();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
