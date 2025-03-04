import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
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
    return day.events.some(event => this.hasEventAtHour(event, hour));
  }
  
  private hasEventAtHour(event: EventDateDetails, hour: number): boolean {
    const startHour = this.getEventStartHour(event);
    const endHour = this.getEventEndHour(event);
    const endMinute = this.getEventEndMinute(event);
    const minHour = this.visibleHourStart;
    const maxHour = minHour + this.visibleHourCount;

    if (endHour === this.visibleHourStart + 1 && endMinute === 0) return false;
  
    if (endHour === minHour && endMinute === 0) return false;
    if (startHour >= maxHour) return false;
    if (endHour === minHour && endMinute !== 0) return this.eventOccursAtHour(event, hour);

    const eventStartsBeforeFirstVisibleHourLabel = startHour < this.visibleHourStart + 1;
    const eventEndsAfterLastVisibleHourLabel = endHour > this.visibleHourStart + this.visibleHourCount;
    if (eventStartsBeforeFirstVisibleHourLabel && eventEndsAfterLastVisibleHourLabel) {
      return true;
    }

    const endHourIsVisible = this.visibleHourStart + 1 < endHour && endHour <= this.visibleHourStart + this.visibleHourCount;
    if (eventStartsBeforeFirstVisibleHourLabel && endHourIsVisible) {
      return true;
    }
    
    const withinVisibleRange = 
      (minHour <= startHour || (endHour === minHour && endMinute !== 0)) &&
      endHour < maxHour;
  
    if (withinVisibleRange) return this.eventOccursAtHour(event, hour);
  
    const startsOrEndsWithin = 
      (startHour < maxHour && startHour >= minHour) || 
      (endHour < maxHour && endHour >= minHour);
  
    return startsOrEndsWithin ? this.eventOccursAtHour(event, hour) : startHour === hour;
  }

  private eventOccursAtHour(event: EventDateDetails, hour: number): boolean {
    const startHour = this.getEventStartHour(event);
    const endHour = this.getEventEndHour(event);
  
    return (
      startHour === hour ||
      endHour - 1 === hour ||
      endHour - 1 === this.visibleHourStart ||
      (startHour < hour && hour < endHour)
    );
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
  
    const startHour = eventStart.hour();
    const endHour = eventEnd.hour();
    const startMinute = eventStart.minute();
    const endMinute = eventEnd.minute();
  
    const visibleStart = Math.max(startHour, this.visibleHourStart + 1);
    const visibleEnd = Math.min(endHour, this.visibleHourStart + this.visibleHourCount);
  
    if (
      visibleStart >= this.visibleHourStart + 1 + this.visibleHourCount ||
      visibleEnd < this.visibleHourStart + 1 ||
      (visibleEnd === this.visibleHourStart && endMinute === 0)
    ) {
      return 0;
    }
  
    if ((endHour === this.visibleHourStart + 1 && endMinute !== 0) ||
        (endHour === this.visibleHourStart + 2 && endMinute === 0 && startMinute !== 0 && startHour === this.visibleHourStart + 1)) {
      return 15;
    }
  
    if (endHour === this.visibleHourStart + 2 && endMinute === 0) {
      return 40;
    }
  
    if (startHour === this.visibleHourStart + this.visibleHourCount) {
      return 40;
    }
  
    const duration = visibleEnd - visibleStart;
  
    if (endMinute !== 0 && startMinute === 0) {
      return endHour > this.visibleHourStart + this.visibleHourCount || (endHour === this.visibleHourStart + this.visibleHourCount && endMinute !== 0)
        ? duration * 50 - 10
        : duration * 50 + 15;
    }
  
    if (startMinute !== 0 && endMinute === 0) {
      if (startHour < this.visibleHourStart + 1 && startMinute !== 0 && endMinute === 0 && endHour > this.visibleHourStart + 2) {
        return (duration - 1) * 50 + 40;
      }
      return (duration - 1) * 50 + 15;
    }
  
    if (visibleEnd === this.visibleHourStart + 1) {
      return 15;
    }
  
    if (startMinute !== 0 && endMinute === 0 && visibleStart + 1 === visibleEnd) {
      return 15;
    }
  
    const startsOrEndsOnHalfHour = (visibleStart !== 0 && visibleEnd === 0) || (startMinute === 0 && endMinute !== 0);
    const endsHalfHourAfterLastVisibleHour = endHour === this.visibleHourStart + this.visibleHourCount && endMinute !== 0;
  
    if (visibleStart !== 0 && visibleEnd !== 0) {
      const startsAndEndsOnHalfHour = startMinute !== 0 && endMinute !== 0;
      const startsBeforeFirstVisibleHour = startHour < this.visibleHourStart + 1;
      const endsWithinVisibleHours = this.visibleHourCount + 1 < endHour && endHour < this.visibleHourStart + 1 + this.visibleHourCount;
  
      if (startsAndEndsOnHalfHour && startsBeforeFirstVisibleHour && endsWithinVisibleHours) {
        return duration * 50 - 10 + 25;
      }
  
      if (startsAndEndsOnHalfHour && (endHour > this.visibleHourStart + 1 + this.visibleHourCount || endsHalfHourAfterLastVisibleHour)) {
        return duration * 50 - 35;
      }
      const endsAfterLastVisibleHour = endsHalfHourAfterLastVisibleHour || endHour > this.visibleHourCount + this.visibleHourStart;


      const doesNotStartAndEndOnTheHour = !(startMinute === 0 && endMinute === 0);
      return endsAfterLastVisibleHour && doesNotStartAndEndOnTheHour ? duration * 50 - 35 : duration * 50 - 10;
    }
  
    return startsOrEndsOnHalfHour ? (endsHalfHourAfterLastVisibleHour ? duration * 50 + 5 : duration * 50 + 15) : duration * 50 - 10;
  }  
  
  getEventTop(day: any, hour: number): number {
    const event = this.getEventAtTime(day, hour);
    if (!event) return 300;

    const eventStart = dayjs(event.startDateTime);
    const eventEnd = dayjs(event.endDateTime);

    const topOffset = (eventStart.hour() - this.visibleHourStart) * 50;
    if (topOffset <= 0) return 50;

    const eventStartMinute = eventStart.minute();
    const eventEndMinute = eventEnd.minute();

    if (eventStartMinute !== 0) {
        if (eventEndMinute === 0 && eventStart.hour() + 1 === eventEnd.hour()) return topOffset + 25;
        return topOffset + 25;
    }

    if (eventStart.hour() === this.visibleHourStart + this.visibleHourCount) return topOffset;

    return topOffset;
  }

  navigate(direction: number): void {
    this.currentDate = this.currentDate.add(direction, 'week');
    this.generateCalendar();
  }
}
