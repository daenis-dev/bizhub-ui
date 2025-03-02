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
import { ShareScheduleComponent } from '../share-schedule/share-schedule.component';

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

  visibleHourStart: number = 8;
  visibleHourCount: number = 5;

  constructor(private router: Router, private dialog: MatDialog, private http: HttpClient, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.http.get<EventDetails[]>(`${this.apiUrl}/v1/events`, { 
      headers: new HttpHeaders({ 'Authorization': this.auth.getToken() }) 
    }).subscribe({
      next: (data) => {
        this.events = data.sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
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
    return day.events.some((event: EventDetails) => {

      return this.hasEventAtHour(event, hour);
    });
  }

  private hasEventAtHour(event: EventDetails, hour: number): boolean {
    const eventStartHour = this.getEventStartHour(event);
    const eventEndHour = this.getEventEndHour(event);

    const eventStartMinute = this.getEventStartMinute(event);
    const eventEndMinute = this.getEventEndMinute(event);

    const eventEndsThirtyMinutesIntoTheFirstVisibleHour = eventEndHour === this.visibleHourStart + 1 && eventEndMinute !== 0;
    if (eventEndsThirtyMinutesIntoTheFirstVisibleHour) {
      return this.eventOccursAtHour(event, hour);
    }

    const eventIsAtOrAfterMinimumVisibleHour = this.visibleHourStart + 1 <= eventStartHour || eventEndHour === this.visibleHourStart + 1 && eventEndMinute !== 0;
    const eventIsBeforeTheMaximumVisibleHour = eventEndHour < this.visibleHourStart + 1 + this.visibleHourCount;
    const eventStartsAndEndsWithinTheVisibleTimeframe = eventIsAtOrAfterMinimumVisibleHour && eventIsBeforeTheMaximumVisibleHour;

    if (eventStartsAndEndsWithinTheVisibleTimeframe) {
      return this.eventOccursAtHour(event, hour);
    }

    const eventStartsWithinTheTimeframe = eventStartHour < this.visibleHourStart + 1 + this.visibleHourCount && eventStartHour >= this.visibleHourStart + 1;
    const eventEndsWithinTheTimeframe = eventEndHour < this.visibleHourStart + 1 + this.visibleHourCount && eventEndHour >= this.visibleHourStart + 1;
    if (eventStartsWithinTheTimeframe || eventEndsWithinTheTimeframe) {
      return this.eventOccursAtHour(event, hour);
    }

    return false;
  }

  private eventOccursAtHour(event: EventDetails, hour: number): boolean {
    const eventStartHour = this.getEventStartHour(event);
    const eventEndHour = this.getEventEndHour(event);

    const eventStartsAtTheHour = eventStartHour === hour;
    const eventEndsOneHourBeforeTheHour = eventEndHour - 1 === hour;
    const eventEndsOneHourBeforeTheVisibleStartHour = eventEndHour - 1 === this.visibleHourStart;
    const theHourIsBetweenTheEventStartHourAndTheEventEndHour = eventStartHour < hour && hour < eventEndHour;
    return eventStartsAtTheHour
    || eventEndsOneHourBeforeTheHour
    || eventEndsOneHourBeforeTheVisibleStartHour
    || theHourIsBetweenTheEventStartHourAndTheEventEndHour;
  }
  
  getEventAtTime(day: { events: EventDetails[] }, hour: number): EventDetails | null {
      return day.events.find((event: EventDetails) => 
        this.getEventStartHour(event) === hour
      || this.getEventEndHour(event) - 1 === hour
      || (this.getEventStartHour(event) < hour && hour < this.getEventEndHour(event))
      || (this.getEventEndHour(event) === this.visibleHourStart + 1 && this.getEventEndMinute(event) !== 0)) || null;
    }

  getEventStartHour(event: EventDetails): number {
    return dayjs(event.startDateTime).hour();
  }

  getEventStartMinute(event: EventDetails): number {
    return dayjs(event.startDateTime).minute();
  }

  getEventEndHour(event: EventDetails): number {
    return dayjs(event.endDateTime).hour();
  }

  getEventEndMinute(event: EventDetails): number {
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
    
    if (!event) return 50;
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
  
  createEvent(): void {
    const dialogRef = this.dialog.open(EventDialogComponent, { data: { mode: 'create', title: 'Create Event' } });
    dialogRef.afterClosed().subscribe((newEvent) => {
      if (newEvent) {
        if (this.events.length === 0 || this.events[0].startDateTime > newEvent.startDateTime) {
          this.events.push(newEvent);
        }
        else {
          this.events.unshift(newEvent);
        }
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

  openShareScheduleForm(): void {
    this.dialog.open(ShareScheduleComponent);
  }

  navigate(direction: number): void {
    this.currentDate = this.currentDate.add(direction, 'week');
    this.generateCalendar();
  }
}
