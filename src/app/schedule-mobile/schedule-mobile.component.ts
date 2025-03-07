import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScreenSizeService } from '../services/screen-size.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventDateDetails } from '../schedule/event-date-details.model';
import { environment } from '../../environments/environment';
import dayjs from 'dayjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScheduleDetails } from '../schedule/schedule-details.model';

@Component({
  selector: 'app-schedule-mobile',
  templateUrl: './schedule-mobile.component.html',
  styleUrl: './schedule-mobile.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class ScheduleMobileComponent implements OnInit, OnDestroy {

  private screenWidthSub?: Subscription;
  private screenHeightSub?: Subscription;

  username: string = '';
  scheduleKey: string = '';
  apiUrl: string = environment.apiUrl;
  events: EventDateDetails[] = [];
  calendarDays: any[] = [];
  currentDate: dayjs.Dayjs = dayjs();
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);

  constructor(private screenSizeService: ScreenSizeService, private router: Router, private http: HttpClient, private auth: AuthService, private snackBar: MatSnackBar, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.screenWidthSub = this.screenSizeService.isMobile$.subscribe(isMobile => {
      if (!isMobile) {
        this.router.navigate(['/schedules']);
      }
    });
    this.screenHeightSub = this.screenSizeService.isMobile$.subscribe(isMobile => {
      if (!isMobile) {
        this.router.navigate(['/schedules']);
      }
    });
    this.route.queryParams.subscribe(params => {
      this.username = params['username'];
      this.scheduleKey = params['schedule-key'];
      this.loadEvents();
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

  loadEvents(): void {
    this.http.get<ScheduleDetails>(`${this.apiUrl}/v1/schedules`, { 
      headers: new HttpHeaders({ 'Authorization': this.auth.getToken() }),
      params: new HttpParams()
        .set('username', this.username)
        .set('schedule-key', this.scheduleKey) 
    }).subscribe({
      next: (data) => {
        this.username = data.username;
        this.events = data.eventDateDetails.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
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

  formatEventTime(dateTime: string): string {
    return dayjs(dateTime).format('hh:mm A');
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

  navigate(direction: number): void {
    this.currentDate = this.currentDate.add(direction, 'week');
    this.generateCalendar();
  }
}
