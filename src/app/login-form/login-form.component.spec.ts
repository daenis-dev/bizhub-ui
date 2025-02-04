import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { LoginFormComponent } from './login-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'loginForEmailAndPassword']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [
        LoginFormComponent,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatIconModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    expect(emailControl?.value).toBe('');
    expect(passwordControl?.value).toBe('');
  });

  it('should mark the form as invalid if values are empty', () => {
    component.loginForm.controls['email'].setValue('');
    component.loginForm.controls['password'].setValue('');
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('should mark the form as valid if values are valid', () => {
    component.loginForm.controls['email'].setValue('test@example.com');
    component.loginForm.controls['password'].setValue('validPassword123');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should login', () => {
    const email = 'test@example.com';
    const password = 'validPassword123';
    component.loginForm.controls['email'].setValue(email);
    component.loginForm.controls['password'].setValue(password);
  
    const mockObservable = of(true);
    authServiceSpy.loginForEmailAndPassword.and.returnValue(mockObservable); 
  
    component.onSubmit();
  
    expect(authServiceSpy.loginForEmailAndPassword).toHaveBeenCalledWith(email, password);
  });

  it('should not login if form is invalid', () => {
    component.loginForm.controls['email'].setValue('');
    component.loginForm.controls['password'].setValue('');
    
    component.onSubmit();
    
    expect(authServiceSpy.loginForEmailAndPassword).not.toHaveBeenCalled();
  });

  it('should navigate to registration when "Sign up" is clicked', () => {
    component.navigateToRegistrationForm();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/register');
  });

  it('should navigate to /my-backups if the user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    fixture = TestBed.createComponent(LoginFormComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/my-backups');
  });
});
