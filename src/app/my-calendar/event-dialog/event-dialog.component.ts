import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { NativeDateAdapter } from '@angular/material/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventDetails } from '../event-details.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSnackBarModule,
    MatAutocompleteModule
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'l',
        },
        display: {
          dateInput: 'l',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    }
  ]
})
export class EventDialogComponent implements OnInit {

  title: string;
  id: string;
  apiUrl: string = environment.apiUrl;
  eventForm!: FormGroup;
  currentTimezone: string;
  
  timeOptions: string[] = this.generateTimeOptions();
  filteredTimes!: Observable<string[]>;
  filteredEndTimes!: Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; event?: any, title?: string, id?: string, selectedDate?: string, selectedHour?: number },
    public auth: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.title = data.title || 'Event';
    this.id = data.id || '';
    this.currentTimezone = dayjs.tz.guess();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.filteredTimes = this.eventForm.controls['startTime'].valueChanges.pipe(
      startWith(''),
      map(value => this.filterTimes(value))
    );

    this.filteredEndTimes = this.eventForm.controls['endTime'].valueChanges.pipe(
      startWith(''),
      map(value => this.filterEndTimes(value))
    );

    if (this.data.mode === 'create') {
      const { selectedDate, selectedHour } = this.data;
  
      if (selectedDate && selectedHour !== undefined) {
        const selectedDateTime = dayjs(selectedDate).set('hour', selectedHour).set('minute', 0);
        this.eventForm.controls['startDate'].setValue(selectedDateTime.toDate());
        this.eventForm.controls['startTime'].setValue(selectedDateTime.format('hh:mm A'));
      }
  
      this.eventForm.controls['startTime'].valueChanges.subscribe(startTimeValue => {
        if (!this.eventForm.controls['endTime'].value && startTimeValue) {
          this.eventForm.controls['endTime'].setValue(startTimeValue);
        }
      });
    }
  }

  private filterTimes(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.timeOptions.filter(time => time.toLowerCase().includes(filterValue));
  }

  private filterEndTimes(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.timeOptions.filter(time => time.toLowerCase().includes(filterValue) &&
      time !== this.eventForm.controls['startTime'].value);
  }

  private initializeForm(): void {
    this.eventForm = new FormGroup({
      name: new FormControl(this.data.event?.name || '', Validators.required),
      startDate: new FormControl(
        this.data.event ? dayjs(this.data.event.startDateTime).toDate() : null,
          Validators.required
      ),
      startTime: new FormControl(
        this.data.event ? dayjs(this.data.event.startDateTime).format('hh:mm A') : '',
          Validators.required
      ),
      endTime: new FormControl(
        this.data.event ? dayjs(this.data.event.endDateTime).format('hh:mm A') : '',
          Validators.required
      ),
      timezone: new FormControl(this.currentTimezone)
    });
  }

  generateTimeOptions(): string[] {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      ['00', '30'].forEach(minute => {
        const ampm = hour < 12 ? 'AM' : 'PM';
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        times.push(`${formattedHour}:${minute} ${ampm}`);
      });
    }
    return times;
  }

  formatTime(hour: number): string {
    return hour === 0 ? '12' : (hour < 10 ? '0' + hour : hour.toString());
  }

  save(): void {
    if (this.title === 'Create Event') {
      this.createEvent();
    }
    if (this.title === 'Edit Event') {
      this.editEvent();
    }
  }

  createEvent(): void {
    if (this.eventForm.valid) {
      const { startDate, startTime, endTime, name } = this.eventForm.value;

      const formattedStart = this.getFormattedDate(startDate, startTime);
  
      const formattedEnd = this.getFormattedDate(startDate, endTime);
  
      const formData = new FormData();
      formData.append("name", name);
      formData.append("start-date-time", formattedStart);
      formData.append("end-date-time", formattedEnd);
  
      this.http.post<EventDetails>(this.apiUrl + '/v1/events', formData, {
        headers: new HttpHeaders({ 'Authorization': this.auth.getToken() })
      }).subscribe({
        next: (data: EventDetails) => {
          this.dialogRef.close(data);
          this.showSuccessMessage('Successfully created an event');
        },
        error: () => {
          this.dialogRef.close({
            name: name,
            startDateTime: formattedStart,
            endDateTime: formattedEnd,
            timezone: this.currentTimezone
          });
          this.showErrorMessage('An error occurred while creating the event');
        }
      });
    }
  }

  editEvent(): void {
    if (this.eventForm.valid) {
      const { startDate, startTime, endTime, name } = this.eventForm.value;

      const formattedStart = this.getFormattedDate(startDate, startTime);
  
      const formattedEnd = this.getFormattedDate(startDate, endTime);
  
      const formData = new FormData();
      formData.append("name", name);
      formData.append("start-date-time", formattedStart);
      formData.append("end-date-time", formattedEnd);
  
      this.http.put<EventDetails>(this.apiUrl + '/v1/events/' + this.id, formData, {
        headers: new HttpHeaders({ 'Authorization': this.auth.getToken() })
      }).subscribe({
        next: (data: EventDetails) => {
          this.dialogRef.close(data);
          this.showSuccessMessage('Successfully updated the event');
        },
        error: () => {
          this.dialogRef.close({
            name: name,
            startDateTime: formattedStart,
            endDateTime: formattedEnd,
            timezone: this.currentTimezone
          });
          this.showErrorMessage('An error occurred while updating the event');
        }
      });
    }
  }
  
  getFormattedDate(date: string, time: string) {
    let combinedDateTime = new Date(date);

    let [hours, minutes] = time.split(' ')[0].split(':');
    let amPm = time.split(' ')[1];

    if (amPm === 'PM' && Number(hours) < 12) {
      hours = (parseInt(hours) + 12).toString();
    } else if (amPm === 'AM' && Number(hours) == 12) {
      hours = '00';
    }

    combinedDateTime.setHours(Number(hours), Number(minutes));

    const utcDateTime = new Date(combinedDateTime.toISOString());

    let isoDateTime = utcDateTime.toISOString();

    return isoDateTime;
  }

  onDelete() {
    this.http.delete<void>(this.apiUrl + '/v1/events/' + this.id, {
      headers: new HttpHeaders({ 'Authorization': this.auth.getToken() })
    }).subscribe({
      next: () => {
        this.dialogRef.close({ deleted: true });
        this.showSuccessMessage('Successfully deleted the event');
      },
      error: () => {
        this.dialogRef.close();
        this.showErrorMessage('An error occurred while deleting the event');
      }
    });
  }

  showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-success']
    });
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error']
    });
  }
}
