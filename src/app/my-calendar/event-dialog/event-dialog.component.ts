import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';import dayjs from 'dayjs';

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class EventDialogComponent implements OnInit {
  eventForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; event?: any }
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    this.eventForm = new FormGroup({
      name: new FormControl(this.data.event?.name || '', Validators.required),
      startDateTime: new FormControl(
        this.data.event ? dayjs(this.data.event.startDateTime).format('YYYY-MM-DDTHH:mm') : '',
        Validators.required
      ),
      endDateTime: new FormControl(
        this.data.event ? dayjs(this.data.event.endDateTime).format('YYYY-MM-DDTHH:mm') : '',
        Validators.required
      ),
    });
  }

  save(): void {
    if (this.eventForm.valid) {
      this.dialogRef.close(this.eventForm.value);
    }
  }
}
