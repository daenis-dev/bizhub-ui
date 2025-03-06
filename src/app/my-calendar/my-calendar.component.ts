import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
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

  private isDragging = false;
  private isTap = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private calendarContainer: HTMLElement | null = null;
  private homeIcon: HTMLElement | null = null;
  private settingsWheel: HTMLElement | null = null;
  private scrollWeekButton: HTMLElement | null = null;
  private scrollDayButton: HTMLElement | null = null;
  private hourCell: HTMLElement | null = null;
  private createEventButton: HTMLElement | null = null;
  private shareScheduleButton: HTMLElement | null = null;
  private dragThreshold = 10;

  constructor(private router: Router, private dialog: MatDialog, private http: HttpClient, public auth: AuthService, private snackBar: MatSnackBar, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.loadEvents();
    this.initializeMobileDeviceControls();
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
  
  onScroll(event: WheelEvent, day: any): void {
    const direction = event.deltaY < 0 ? -1 : 1;
    this.navigateHours(direction);
    event.preventDefault();
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
    return day.events.some(event => this.hasEventAtHour(event, hour));
  }
  
  private hasEventAtHour(event: EventDetails, hour: number): boolean {
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

  private eventOccursAtHour(event: EventDetails, hour: number): boolean {
    const startHour = this.getEventStartHour(event);
    const endHour = this.getEventEndHour(event);
  
    return (
      startHour === hour ||
      endHour - 1 === hour ||
      endHour - 1 === this.visibleHourStart ||
      (startHour < hour && hour < endHour)
    );
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

  onHourSelected(day: any, hour: any): void {
    if (this.hasEventAtTime(day, hour) || hour === 0 || hour === 23) {
      return ;
    }
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        mode: 'create',
        title: 'Create Event',
        selectedDate: day.date.format('YYYY-MM-DD'),
        selectedHour: hour
      }
    });
  
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

  private initializeMobileDeviceControls(): void {
    this.calendarContainer = document.querySelector('.calendar-container');
    if (this.calendarContainer) {
      this.calendarContainer.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      this.calendarContainer.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      this.calendarContainer.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    this.homeIcon = document.querySelector('.home-icon');
    if (this.homeIcon) {
      this.homeIcon.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      this.homeIcon.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      this.homeIcon.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    this.settingsWheel = document.querySelector('.settings-wheel');
    if (this.settingsWheel) {
      this.settingsWheel.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      this.settingsWheel.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      this.settingsWheel.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    this.scrollWeekButton = document.querySelector('.scroll-week-button');
    if (this.scrollWeekButton) {
      this.scrollWeekButton.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      this.scrollWeekButton.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      this.scrollWeekButton.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    this.scrollDayButton = document.querySelector('.nav-arrow');
    if (this.scrollDayButton) {
      this.scrollDayButton.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      this.scrollDayButton.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      this.scrollDayButton.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    this.hourCell = document.querySelector('.hour-cell');
    if (this.hourCell) {
      this.hourCell.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      this.hourCell.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      this.hourCell.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    this.createEventButton = document.querySelector('.create-event-button');
    if (this.createEventButton) {
      this.createEventButton.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      this.createEventButton.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      this.createEventButton.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    this.shareScheduleButton = document.querySelector('.share-schedule-button');
    if (this.shareScheduleButton) {
      this.shareScheduleButton.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      this.shareScheduleButton.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      this.shareScheduleButton.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onDragStart(event: MouseEvent | TouchEvent) {
    if (window.innerWidth > 600) return;

    this.isDragging = true;

    if (event instanceof MouseEvent) {
      this.startX = event.clientX - this.currentX;
      this.startY = event.clientY - this.currentY;
    } else if (event instanceof TouchEvent) {
      this.startX = event.touches[0].clientX - this.currentX;
      this.startY = event.touches[0].clientY - this.currentY;
    }

    event.preventDefault();
  }

  @HostListener('mousemove', ['$event'])
  @HostListener('touchmove', ['$event'])
  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging || window.innerWidth > 600) return;

    if (event instanceof MouseEvent) {
      this.currentX = event.clientX - this.startX;
      this.currentY = event.clientY - this.startY;
    } else if (event instanceof TouchEvent) {
      this.currentX = event.touches[0].clientX - this.startX;
      this.currentY = event.touches[0].clientY - this.startY;
    }

    this.setRendererStyle(this.calendarContainer);
    this.setRendererStyle(this.homeIcon);
    this.setRendererStyle(this.settingsWheel);
    this.setRendererStyle(this.scrollWeekButton);
    this.setRendererStyle(this.scrollDayButton);
    this.setRendererStyle(this.hourCell);
    this.setRendererStyle(this.createEventButton);
    this.setRendererStyle(this.shareScheduleButton);
  }

  private setRendererStyle(element: HTMLElement | null):void {
    if (element) this.renderer.setStyle(element, 'transform', `translate(${this.currentX}px, ${this.currentY}px)`);
  }

  @HostListener('mouseup')
  @HostListener('touchend')
  @HostListener('touchcancel')
  onDragEnd() {
    this.isDragging = false;
  }

  onTouchStart(event: TouchEvent) {
    this.isDragging = false;
    this.isTap = true;
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  }
  
  onTouchMove(event: TouchEvent) {
    this.currentX = event.touches[0].clientX;
    this.currentY = event.touches[0].clientY;
    
    if (Math.abs(this.currentY - this.startY) > this.dragThreshold) {
      this.isDragging = true;
      this.isTap = false;
      event.preventDefault();
    }
  }
  
  onTouchEnd(event: TouchEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (this.isTap) {
      const targetElement = event.target as HTMLElement;
      targetElement.dispatchEvent(new Event('click', { bubbles: true }));      
      return;
    }
  
    if (this.isDragging) {
      this.isDragging = false;
    }
  }
  
  
}
