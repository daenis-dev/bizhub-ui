import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ScheduleKey } from './schedule-key.model';

@Component({
  selector: 'app-share-schedule',
  templateUrl: './share-schedule.component.html',
  styleUrl: './share-schedule.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ]
})
export class ShareScheduleComponent implements OnInit {

  shareUrl: string = '';

  constructor(public dialogRef: MatDialogRef<ShareScheduleComponent>, private auth: AuthService, private http: HttpClient, private snackBar: MatSnackBar) {

  }

  ngOnInit() {
    this.findScheduleKey();    
  }

  private findScheduleKey(): void {
    this.http.get<ScheduleKey>(environment.apiUrl + '/v1/schedule-keys', {
        headers: new HttpHeaders({ 'Authorization': this.auth.getToken()})
      }).subscribe({
        next: (data: ScheduleKey) => {
          if (data) {
            this.shareUrl = environment.appUrl + '/schedules?username=' + this.auth.getUsername() + '&schedule-key=' + data.token;
          } 
        },
        error: () => {
          this.showErrorMessage('An error occurred while getting the share URL');
        }
    });
  }

  generateShareUrl() {
    this.http.post<ScheduleKey>(environment.apiUrl + '/v1/schedule-keys', null, {
        headers: new HttpHeaders({ 'Authorization': this.auth.getToken()})
      }).subscribe({
        next: (data: ScheduleKey) => {
          this.shareUrl = environment.appUrl + '/schedules?username=' + this.auth.getUsername() + '&schedule-key=' + data.token;
          this.showSuccessMessage('Share URL created successfully')
        },
        error: () => {
          this.showErrorMessage('An error occurred while creating the share URL');
        }
    });
  }

  showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-success']
    });
  }


  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error']
    });
  }

  disableShareUrl() {
    this.http.delete<void>(environment.apiUrl + '/v1/schedule-keys', {
      headers: new HttpHeaders({ 'Authorization': this.auth.getToken()})
    }).subscribe({
      next: () => {
        this.shareUrl = '';
        this.showSuccessMessage('Share URL successfully disabled')
      },
      error: () => {
        this.showErrorMessage('An error occurred while disabling the share URL');
      }
  });
  }
}
