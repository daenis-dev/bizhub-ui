import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareScheduleComponent } from './share-schedule.component';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ScheduleKey } from './schedule-key.model';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

describe('ShareScheduleComponent', () => {
  let component: ShareScheduleComponent;
  let fixture: ComponentFixture<ShareScheduleComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>
  let httpClientSpy: { post: jasmine.Spy; put: jasmine.Spy; delete: jasmine.Spy };
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ShareScheduleComponent>>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'hasRole']);
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'put', 'delete']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ShareScheduleComponent,
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    authServiceSpy.hasRole.and.returnValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle error when fetching schedule key', () => {
    spyOn(component['http'], 'get').and.returnValue(throwError(() => new Error('Failed to fetch')));
    const snackBarSpy = spyOn(component['snackBar'], 'open');

    component.ngOnInit();

    expect(snackBarSpy).toHaveBeenCalledWith('An error occurred while getting the share URL', 'Close', jasmine.any(Object));
  });

  it('should handle error when generating share URL', () => {
    spyOn(component['http'], 'post').and.returnValue(throwError(() => new Error('Failed to generate')));
    const snackBarSpy = spyOn(component['snackBar'], 'open');

    component.generateShareUrl();

    expect(snackBarSpy).toHaveBeenCalledWith('An error occurred while creating the share URL', 'Close', jasmine.any(Object));
  });

  it('should disable share URL successfully', () => {
    spyOn(component['http'], 'delete').and.returnValue(of(null));
    const snackBarSpy = spyOn(component['snackBar'], 'open');

    component.disableShareUrl();

    expect(component['http'].delete).toHaveBeenCalledWith(`${environment.apiUrl}/v1/schedule-keys`, jasmine.any(Object));
    expect(component.shareUrl).toBe('');
    expect(snackBarSpy).toHaveBeenCalledWith('Share URL successfully disabled', 'Close', jasmine.any(Object));
  });

  it('should handle error when disabling share URL', () => {
    spyOn(component['http'], 'delete').and.returnValue(throwError(() => new Error('Failed to disable')));
    const snackBarSpy = spyOn(component['snackBar'], 'open');

    component.disableShareUrl();

    expect(snackBarSpy).toHaveBeenCalledWith('An error occurred while disabling the share URL', 'Close', jasmine.any(Object));
  });
});
