import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { HttpClient } from '@angular/common/http';
import { EventDetails } from './event-details.model';
import dayjs from 'dayjs';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    MatFormFieldModule
  ]
})
export class MyCalendarComponent implements OnInit {

  view: 'week' | 'month' = 'week';
  events: EventDetails[] = [];
  calendarDays: any[] = [];
  currentDate: dayjs.Dayjs = dayjs(); // Keep track of current displayed date

  constructor(private router: Router, private dialog: MatDialog, private http: HttpClient) {}

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
  }

  loadEvents(): void {
    this.http.get<EventDetails[]>('/v1/events').subscribe((data) => {
      this.events = data;
      this.generateCalendar();
    });
  }

  generateCalendar(): void {
    const startDate = this.view === 'week' ? this.currentDate.startOf('week') : this.currentDate.startOf('month');
    const daysInView = this.view === 'week' ? 7 : this.currentDate.daysInMonth();
  
    this.calendarDays = Array.from({ length: daysInView }, (_, i) => {
      const date = startDate.add(i, 'day');
      const eventsForDay = this.events.filter(event =>
        dayjs(event.startDateTime).isSame(date, 'day')
      );
      return { date, events: eventsForDay };
    });
  }

  changeView(view: 'week' | 'month'): void {
    this.view = view;
    this.generateCalendar();
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

  toggleView() {
    if (this.view === 'week') {
      this.changeView('month');
    } else {
      this.changeView('week');
    }
  }

  navigate(direction: number): void {
    const increment = direction === 1 ? 1 : -1;

    if (this.view === 'week') {
      this.currentDate = this.currentDate.add(increment, 'week');
      this.generateCalendar();
    } else {
      this.currentDate = this.currentDate.add(increment, 'month');
      this.generateCalendar();
    }
  }
}
