import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrl: './reset-password-form.component.css',
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
export class ResetPasswordFormComponent {
  resetPasswordForm: FormGroup;
  apiUrl: string = environment.apiUrl;

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, public dialog: MatDialog) {
    this.resetPasswordForm = this.fb.group({
      emailAddress: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      let httpParams = new HttpParams()
      .set('email-address', this.resetPasswordForm.value.emailAddress);
      this.http.post(this.apiUrl + '/v1/reset-password', httpParams)
      .subscribe({
        next: () => this.showSuccessMessage("Link to reset password has been sent via email"),
        error: () => this.showErrorMessage("Error occurred while sending the link to reset password via email")
      });
    }
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-success']
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error']
    });
  }
}
