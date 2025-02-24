import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AccountDialogComponent } from '../account-dialog/account-dialog.component';

@Component({
  selector: 'app-my-calendar',
  templateUrl: './my-calendar.component.html',
  styleUrl: './my-calendar.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ]
})
export class MyCalendarComponent {

  constructor(private router: Router, private dialog: MatDialog) {

  }

  navigateHome() {
    this.router.navigateByUrl('/home');
  }

  openAccountDialog() {
    this.dialog.open(AccountDialogComponent, {
      width: '800px',
      height: '225px'
    });
  }
}
