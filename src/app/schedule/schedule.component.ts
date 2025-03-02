import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import dayjs from 'dayjs';
import { EventDateDetails } from './event-date-details.model';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ScheduleDetails } from './schedule-details.model';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
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
export class ScheduleComponent {

  username: string = '';
  scheduleKey: string = '';

  apiUrl: string = environment.apiUrl;
  events: EventDateDetails[] = [];
  calendarDays: any[] = [];
  currentDate: dayjs.Dayjs = dayjs();
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);

  visibleHourStart: number = 8;
  visibleHourCount: number = 5;

  constructor(private route: ActivatedRoute, private http: HttpClient, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.username = params['username'];
      this.scheduleKey = params['schedule-key'];
      this.loadEvents();
    });
  }

  loadEvents(): void {
    this.http.get<ScheduleDetails>(`${this.apiUrl}/v1/schedules`, { 
      headers: new HttpHeaders({ 'Authorization': this.auth.getToken() }),
      params: new HttpParams()
        .set('username', this.username)
        .set('schedule-key', this.scheduleKey) 
    }).subscribe({
      next: (data) => {
        this.username = data.username;
        this.events = data.eventDateDetails.sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
        this.generateCalendar();
      },
      error: () => this.showErrorMessage('An error occurred while getting the events')
    });
  }

  navigateHours(direction: number): void {
    const maxHour = 24 - this.visibleHourCount;
    this.visibleHourStart = Math.max(0, Math.min(this.visibleHourStart + direction, maxHour));
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

  hasEventAtTime(day: { events: EventDateDetails[] }, hour: number): boolean {
    return day.events.some((event: EventDateDetails) => {
      if ((this.getEventStartHour(event) === this.visibleHourStart + 1) && this.getEventEndMinute(event) !== 0) {
        return true;
      }
      if (this.getEventStartHour(event) === this.visibleHourStart + this.visibleHourCount) {
        return false;
      }

      if (this.getEventEndHour(event) === this.visibleHourStart + 1) {
        return false;
      }
      return this.getEventStartHour(event) === hour
      || this.getEventEndHour(event) - 1 === hour
      || this.getEventEndHour(event) - 1 === this.visibleHourStart
      || (this.getEventStartHour(event) < hour && hour < this.getEventEndHour(event));
    });
  }
  
  getEventAtTime(day: { events: EventDateDetails[] }, hour: number): EventDateDetails | null {
    return day.events.find((event: EventDateDetails) => 
      this.getEventStartHour(event) === hour
    || this.getEventEndHour(event) - 1 === hour
    || (this.getEventStartHour(event) < hour && hour < this.getEventEndHour(event))
    || (this.getEventEndHour(event) === this.visibleHourStart + 1 && this.getEventEndMinute(event) !== 0)) || null;
  }

  getEventStartHour(event: EventDateDetails): number {
    return dayjs(event.startDateTime).hour();
  }

  getEventStartMinute(event: EventDateDetails): number {
    return dayjs(event.startDateTime).minute();
  }

  getEventEndHour(event: EventDateDetails): number {
    return dayjs(event.endDateTime).hour();
  }

  getEventEndMinute(event: EventDateDetails): number {
    return dayjs(event.endDateTime).minute();
  }

  getEventHeight(day: any, hour: number): number {
    const event = this.getEventAtTime(day, hour);
    if (!event) return 0;
  
    const eventStart = dayjs(event.startDateTime);
    const eventEnd = dayjs(event.endDateTime);
  
    const eventStartHour = eventStart.hour();
    const eventEndHour = eventEnd.hour();

    const eventStartMinute = eventStart.minute();
    const eventEndMinute = eventEnd.minute();
  
    const visibleStart = Math.max(eventStartHour, this.visibleHourStart + 1);
    const visibleEnd = Math.min(eventEndHour, this.visibleHourStart + this.visibleHourCount);
  
    const eventDuration = visibleEnd - visibleStart;

    if (eventStartHour === this.visibleHourStart + this.visibleHourCount) {
      return 0;
    }

    if (eventEndHour === this.visibleHourStart + 1) {
      return 15;
    }

    if (eventStartMinute !== 0 && eventEndMinute === 0 && eventStartHour + 1 === eventEndHour) {
      return 15;
    }

    return (eventStartMinute !== 0 && eventEndMinute !== 0
      ? (eventDuration * 50)
      : eventStartMinute !== 0 || eventEndMinute !== 0
        ? (eventDuration * 50) + 25
        : eventDuration * 50) - 10;
  }
  
  getEventTop(day: any, hour: number): number {
    const event = this.getEventAtTime(day, hour);
    
    if (!event) console.log('Event top not zero, no event');
    if (!event) return 0; // TODO: was 50, trying to resolve early events
    const eventStart = dayjs(event.startDateTime);
    const eventEnd = dayjs(event.endDateTime);

    const eventStartHour = eventStart.hour();

    const eventEndHour = eventEnd.hour();

    const eventStartMinute = eventStart.minute();
    const eventEndMinute = eventEnd.minute();
    
    const topOffset = (eventStartHour - this.visibleHourStart) * 50;
    if (topOffset <= 0 ) return 50;
    
    
    if (eventStartMinute !== 0 && eventEndMinute !== 0) {
      return topOffset + 25;
    }

    if (eventStartMinute !== 0 && eventEndMinute === 0 && eventStartHour + 1 === eventEndHour) {
      return topOffset + 25;
    }

    if (eventStartHour === this.visibleHourStart + this.visibleHourCount) {
      return topOffset;
    }
    
    return topOffset;
  }

  navigate(direction: number): void {
    this.currentDate = this.currentDate.add(direction, 'week');
    this.generateCalendar();
  }
}
