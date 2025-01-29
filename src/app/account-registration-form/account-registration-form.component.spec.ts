import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountRegistrationFormComponent } from './account-registration-form.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../services/auth.service';

describe('AccountRegistrationFormComponent', () => {
  let component: AccountRegistrationFormComponent;
  let fixture: ComponentFixture<AccountRegistrationFormComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['registerAccountForParams']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [
        AccountRegistrationFormComponent,
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    fixture = TestBed.createComponent(AccountRegistrationFormComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty controls', () => {
    expect(component.registrationForm.get('email')?.value).toBe('');
    expect(component.registrationForm.get('password')?.value).toBe('');
    expect(component.registrationForm.get('confirmedPassword')?.value).toBe('');
  });

  it('should require valid email address', () => {
    const emailControl = component.registrationForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.invalid).toBeTrue();
    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('should require all fields', () => {
    component.registrationForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      confirmedPassword: 'password123'
    });
    expect(component.registrationForm.valid).toBeTrue();
  });

  it('should register the account', () => {
    authServiceSpy.registerAccountForParams;
    component.registrationForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      confirmedPassword: 'password123'
    });
    component.onSubmit();
    expect(authServiceSpy.registerAccountForParams).toHaveBeenCalled();
  });

  it('should navigate to login', () => {
    component.navigateToLoginForm();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('');
  });
});
