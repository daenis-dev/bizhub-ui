import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';

import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('PermissionService', () => {
  let service: PermissionService;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(PermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow access if the user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    
    const next = new ActivatedRouteSnapshot();
    const state = {} as RouterStateSnapshot;

    const result = service.canActivate(next, state);
    expect(result).toBeTrue();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should deny access and navigate to login if the user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    
    const next = new ActivatedRouteSnapshot();
    const state = {} as RouterStateSnapshot;

    const result = service.canActivate(next, state);
    expect(result).toBeFalse();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
