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
  events: EventDetails[] = [];
  calendarDays: any[] = [];
  currentDate: dayjs.Dayjs = dayjs();
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);

  visibleHourStart: number = 8; // Track the start of the visible time range
  visibleHourCount: number = 5; // Number of hours visible at a time

  constructor(private router: Router, private dialog: MatDialog, private http: HttpClient, private auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.http.get<EventDetails[]>(`${this.apiUrl}/v1/events`, { 
      headers: new HttpHeaders({ 'Authorization': this.auth.getToken() }) 
    }).subscribe({
      next: (data) => {
        this.events = data;
        this.generateCalendar();
      },
      error: () => this.showErrorMessage('An error occurred while getting the events')
    });
  }

  navigateHours(direction: number): void {
    const maxHour = 24 - this.visibleHourCount;
    this.visibleHourStart = Math.max(0, Math.min(this.visibleHourStart + direction, maxHour));
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

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error']
    });
  }

  generateCalendar(): void {
    const startDate = this.currentDate.startOf('week');
    this.calendarDays = Array.from({ length: 7 }, (_, i) => {
      const date = startDate.add(i, 'day');
      const eventsForDay = this.events.filter(event => dayjs(event.startDateTime).isSame(date, 'day'));
      return { date, events: eventsForDay };
    });
  }

  hasEventAtTime(day: { events: EventDetails[] }, hour: number): boolean {
    return day.events.some((event: EventDetails) =>
      this.getEventStartHour(event) === hour
    || this.getEventEndHour(event) - 1 === hour
    || (this.getEventStartHour(event) < hour && hour < this.getEventEndHour(event))
    );
  }
  
  getEventAtTime(day: { events: EventDetails[] }, hour: number): EventDetails | null {
    return day.events.find((event: EventDetails) => 
      this.getEventStartHour(event) === hour
    || this.getEventEndHour(event) - 1 === hour
    || (this.getEventStartHour(event) < hour && hour < this.getEventEndHour(event))) || null;
  }

  getEventStartHour(event: EventDetails): number {
    return dayjs(event.startDateTime).hour();
  }

  getEventEndHour(event: EventDetails): number {
    return dayjs(event.endDateTime).hour();
  }

  getEventHeight(day: any, hour: number): number {
    const event = this.getEventAtTime(day, hour);
    if (!event) return 0;
  
    const eventStart = dayjs(event.startDateTime);
    const eventEnd = dayjs(event.endDateTime);

    // const durationMinutes = dayjs(event.endDateTime).diff(dayjs(event.startDateTime), 'minute');
    // return (durationMinutes / 30) * 25;
  
    const eventStartHour = eventStart.hour();
    const eventEndHour = eventEnd.hour();
  
    const visibleStart = Math.max(eventStartHour, this.visibleHourStart + 1);
    const visibleEnd = Math.min(eventEndHour, this.visibleHourStart + this.visibleHourCount);
  
    const eventDuration = visibleEnd - visibleStart;
    
    return eventDuration * 50;
  }
  
  getEventTop(day: any, hour: number): number {
    const event = this.getEventAtTime(day, hour);
    if (!event) return 50;

    // const eventStart = dayjs(event.startDateTime);
    // const hourStart = eventStart.hour();
    // const minuteStart = eventStart.minute();

    // let top = (hourStart - this.visibleHourStart) * 50;
    // if (minuteStart >= 30) {
    //   top += 25;
    // }

    // return top;
  
    const eventStart = dayjs(event.startDateTime);
    const eventStartHour = eventStart.hour();
    
    const topOffset = (eventStartHour - this.visibleHourStart) * 50;
    if (topOffset <= 0 ) return 50;
    console.log('Top offset: ', topOffset);
    
    return topOffset;
  }
  
  createEvent(): void {
    const dialogRef = this.dialog.open(EventDialogComponent, { data: { mode: 'create', title: 'Create Event' } });
    dialogRef.afterClosed().subscribe((newEvent) => {
      if (newEvent) {
        this.events.push(newEvent);
        this.generateCalendar();
      }
    });
  }

  updateEvent(event: EventDetails | null): void {
    if (!event) return;
  
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: { mode: 'edit', title: 'Edit Event', event, id: event.id },
    });
  
    dialogRef.afterClosed().subscribe((result: EventDetails | { deleted: true }) => {
      if (result && 'deleted' in result) {
        this.events = this.events.filter((e) => e.id !== event.id);
        this.generateCalendar();
      } else if (result) {
        const index = this.events.findIndex((e) => e.id === result.id);
        if (index !== -1) {
          this.events[index] = result;
          this.generateCalendar();
        }
      }
    });
  }

  navigate(direction: number): void {
    this.currentDate = this.currentDate.add(direction, 'week');
    this.generateCalendar();
  }
}
