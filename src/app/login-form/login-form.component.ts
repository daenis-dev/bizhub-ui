import { Component } from '@angular/core';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ResetPasswordFormComponent } from '../reset-password-form/reset-password-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule
  ]
})
export class LoginFormComponent {
  loginForm: FormGroup;
  loginIsDisabled: boolean = false;

  hidePassword: boolean = true;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private dialog: MatDialog, private snackBar: MatSnackBar) {
    console.log('Constructing login form');
    if (this.authService.isAuthenticated()) {
      console.log('User is authenticated, navigating home now');
      this.router.navigateByUrl('/home');
    }
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password:['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
        this.loginIsDisabled = true;
        this.authService.loginForEmailAndPassword(this.loginForm?.value?.email, this.loginForm?.value?.password)
        .subscribe({
          next: (isLoginSuccessful) => {
            this.loginIsDisabled = false;
            if (isLoginSuccessful) {
              this.router.navigateByUrl('/home');
            } else {
              this.displayError("Login attempt failed");
            }
          }, error: () => {
                this.loginIsDisabled = false;
                this.displayError("Login attempt failed");
            }
        });
    }
  }

  private displayError(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error']
    });
  }

  navigateToRegistrationForm() {
    this.router.navigateByUrl('/register');
  }

  displayResetPasswordForm() {
    this.dialog.open(ResetPasswordFormComponent, {
      width: '600px',
      height: '300px'
    });
  }
}
