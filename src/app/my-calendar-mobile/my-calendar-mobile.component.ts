import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScreenSizeService } from '../services/screen-size.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import dayjs from 'dayjs';
import { EventDetails } from '../my-calendar/event-details.model';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { EventDialogComponent } from '../my-calendar/event-dialog/event-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ShareScheduleComponent } from '../share-schedule/share-schedule.component';

@Component({
  selector: 'app-my-calendar-mobile',
  templateUrl: './my-calendar-mobile.component.html',
  styleUrl: './my-calendar-mobile.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class MyCalendarMobileComponent implements OnInit, OnDestroy {

  private screenWidthSub?: Subscription;
  private screenHeightSub?: Subscription;

  apiUrl: string = environment.apiUrl;
  events: EventDetails[] = [];
  calendarDays: any[] = [];
  currentDate: dayjs.Dayjs = dayjs();
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);

  constructor(private router: Router, private screenSizeService: ScreenSizeService, private http: HttpClient, public auth: AuthService, private snackBar: MatSnackBar, private dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.screenWidthSub = this.screenSizeService.isMobile$.subscribe(isMobile => {
      if (!isMobile) {
        this.router.navigate(['/my-calendar']);
      }
    });
    this.screenHeightSub = this.screenSizeService.isMobile$.subscribe(isMobile => {
      if (!isMobile) {
        this.router.navigate(['/my-calendar']);
      }
    });
    this.loadEvents();
  }

  loadEvents(): void {
    this.http.get<EventDetails[]>(`${this.apiUrl}/v1/events`, { 
      headers: new HttpHeaders({ 'Authorization': this.auth.getToken() }) 
    }).subscribe({
      next: (data) => {
        this.events = data.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
        this.generateCalendar();
      },
      error: () => this.showErrorMessage('An error occurred while getting the events')
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

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error']
    });
  }

  ngOnDestroy() {
    if (this.screenWidthSub) {
      this.screenWidthSub.unsubscribe();
    }
    if (this.screenHeightSub) {
      this.screenHeightSub.unsubscribe();
    }
  }

  formatEventTime(dateTime: string): string {
    return dayjs(dateTime).format('hh:mm A');
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

  navigate(direction: number): void {
    this.currentDate = this.currentDate.add(direction, 'week');
    this.generateCalendar();
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

  openShareScheduleForm(): void {
    this.dialog.open(ShareScheduleComponent);
  }
}
