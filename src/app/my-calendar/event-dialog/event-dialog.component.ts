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
    MatSnackBarModule
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

  apiUrl: string = environment.apiUrl;
  eventForm!: FormGroup;
  currentTimezone: string;
  timeOptions = this.generateTimeOptions();

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; event?: any },
    private auth: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.currentTimezone = dayjs.tz.guess();
  }

  ngOnInit(): void {
    this.initializeForm();
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
      startTimeCustom: new FormControl(''),
      endDate: new FormControl(
        this.data.event ? dayjs(this.data.event.endDateTime).toDate() : null,
        Validators.required
      ),
      endTime: new FormControl(
        this.data.event ? dayjs(this.data.event.endDateTime).format('hh:mm A') : '',
        Validators.required
      ),
      endTimeCustom: new FormControl(''),
      timezone: new FormControl(this.currentTimezone)
    });
  }

  generateTimeOptions() {
    const options = [];
    let hour = 0;
    const suffixes = ['AM', 'PM'];
    for (let i = 0; i < 24; i++) {
      const time = `${this.formatTime(hour % 12)}:${i % 2 === 0 ? '00' : '30'} ${suffixes[Math.floor(i / 12)]}`;
      options.push(time);
      hour++;
    }
    return options;
  }

  formatTime(hour: number): string {
    return hour === 0 ? '12' : (hour < 10 ? '0' + hour : hour.toString());
  }

  save(): void {
    if (this.eventForm.valid) {
      const { startDate, startTime, startTimeCustom, endDate, endTime, endTimeCustom } = this.eventForm.value;
      const formattedStart = startTime === 'custom' ? 
        dayjs(`${startDate} ${startTimeCustom}`, 'YYYY-MM-DD hh:mm A').tz(this.currentTimezone).format() :
        dayjs(`${startDate} ${startTime}`, 'YYYY-MM-DD hh:mm A').tz(this.currentTimezone).format();
      const formattedEnd = endTime === 'custom' ? 
        dayjs(`${endDate} ${endTimeCustom}`, 'YYYY-MM-DD hh:mm A').tz(this.currentTimezone).format() :
        dayjs(`${endDate} ${endTime}`, 'YYYY-MM-DD hh:mm A').tz(this.currentTimezone).format();

      this.http.post<EventDetails>(
        this.apiUrl + '/v1/events',
        { headers: new HttpHeaders({ 'Authorization': this.auth.getToken() })}).subscribe({
          next: (data: EventDetails) => {
            this.dialogRef.close(data);
            this.showSuccessMessage('Successfully created an event');
          },
          error: () => {
            this.dialogRef.close({
              name: this.eventForm.value.name,
              startDateTime: formattedStart,
              endDateTime: formattedEnd,
              timezone: this.currentTimezone
            });
            this.showErrorMessage('An error occurred while creating the event');
          }
        });

      
    }
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
