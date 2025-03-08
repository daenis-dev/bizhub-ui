import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountDialogComponent } from './account-dialog.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { ResetPasswordFormComponent } from '../reset-password-form/reset-password-form.component';
import { of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

fdescribe('AccountDialogComponent', () => {
  let component: AccountDialogComponent;
  let fixture: ComponentFixture<AccountDialogComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'loginForEmailAndPassword', 'logout']);

    matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
    matDialogRefSpy.afterClosed.and.returnValue(of(true));

    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    matDialogSpy.open.and.returnValue(matDialogRefSpy);
    
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        AccountDialogComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: matDialogRefSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  
    fixture = TestBed.createComponent(AccountDialogComponent);
    component = fixture.componentInstance;
    component.dialog = matDialogSpy;
    fixture.detectChanges();

    console.log('Injected dialog ref: ', component.dialogRef === matDialogRefSpy);
    console.log('Injected dialog: ', component.dialog === matDialogSpy);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call AuthService logout and close the dialog when logout is clicked', () => {
    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(matDialogRefSpy.close).toHaveBeenCalled();
  });

  it('should open ResetPasswordFormComponent and close the dialog when resetPassword is called', () => {
    component.resetPassword();

    expect(matDialogSpy.open).toHaveBeenCalledWith(ResetPasswordFormComponent, {
      width: '600px',
      height: '300px'
    });
  });
});
