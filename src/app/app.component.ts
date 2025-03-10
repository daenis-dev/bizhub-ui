import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AccountDialogComponent } from './account-dialog/account-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterModule, MatIconModule, CommonModule]
})
export class AppComponent {
  title = 'bizhub-ui';

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

  showHomeIcon() {
    return this.router.url !== '/home' && this.router.url !== '/schedules' && this.router.url !== '/schedule-mobile';
  }

  showSettingsIcon() {
    return this.router.url !== '/schedules' && this.router.url !== '/schedule-mobile';
  }
}
