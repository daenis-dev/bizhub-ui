import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { ResetPasswordFormComponent } from '../reset-password-form/reset-password-form.component';

@Component({
  selector: 'app-account-dialog',
  standalone: true,
  templateUrl: './account-dialog.component.html',
  styleUrl: './account-dialog.component.css',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ]
})
export class AccountDialogComponent {

  constructor(private auth: AuthService, public dialogRef: MatDialogRef<AccountDialogComponent>, public dialog: MatDialog) {}

  resetPassword() {
    this.dialog.open(ResetPasswordFormComponent, {
      width: '600px',
      height: '300px'
    });
    this.dialogRef.close();
  }

  logout() {
    this.auth.logout();
    this.dialogRef.close();
  }
}
