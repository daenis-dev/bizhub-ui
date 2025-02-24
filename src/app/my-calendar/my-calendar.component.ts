import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventDetails } from './event-details.model';
import dayjs from 'dayjs';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatDialogModule,
    MatFormFieldModule,
    MatSnackBarModule
  ]
})
export class MyCalendarComponent implements OnInit {

  apiUrl: string = environment.apiUrl;
  view = 'week';
  events: EventDetails[] = [];
  calendarDays: any[] = [];
  currentDate: dayjs.Dayjs = dayjs(); // Keep track of current displayed date

  constructor(private router: Router, private dialog: MatDialog, private http: HttpClient, private auth: AuthService, private snackBar: MatSnackBar) {}

  navigateHome() {
    this.router.navigateByUrl('/home');
  }

  openAccountDialog() {
    this.dialog.open(AccountDialogComponent, {
      width: '800px',
      height: '225px'
    });
  }

  ngOnInit(): void {
    this.loadEvents();

    this.generateCalendar()
  }

  loadEvents(): void {
    this.http.get<EventDetails[]>(
      this.apiUrl + '/v1/events',
      { headers: new HttpHeaders({ 'Authorization': this.auth.getToken() })}).subscribe({
        next: (data: EventDetails[]) => {
          this.events = data;
          this.generateCalendar();
        },
        error: () => {
          this.showErrorMessage('An error occurred while getting the events');
        }
      });
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error']
    });
  }

  generateCalendar(): void {
    const startDate = this.currentDate.startOf('week');
    const daysInView = 7;
  
    this.calendarDays = Array.from({ length: daysInView }, (_, i) => {
      const date = startDate.add(i, 'day');
      const eventsForDay = this.events.filter(event =>
        dayjs(event.startDateTime).isSame(date, 'day')
      );
      return { date, events: eventsForDay };
    });
  }

  createEvent(): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.http.post<EventDetails>('/v1/events', result).subscribe(() => this.loadEvents());
      }
    });
  }

  updateEvent(event: EventDetails): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: { mode: 'edit', event },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.http.put<EventDetails>(`/v1/events/${event.id}`, result).subscribe(() => this.loadEvents());
      }
    });
  }

  deleteEvent(eventId: string): void {
    this.http.delete(`/v1/events/${eventId}`).subscribe(() => this.loadEvents());
  }

  navigate(direction: number): void {
    const increment = direction === 1 ? 1 : -1;

    this.currentDate = this.currentDate.add(increment, 'week');
      this.generateCalendar();
  }
}
