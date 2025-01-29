import { Component } from '@angular/core';

import { MatSnackBarModule } from '@angular/material/snack-bar';
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

  hidePassword: boolean = true;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private dialog: MatDialog) {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/employees');
    }
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password:['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.loginForEmailAndPassword(this.loginForm?.value?.email, this.loginForm?.value?.password);
    }
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
