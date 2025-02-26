import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventDialogComponent } from './event-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EventDialogComponent', () => {
  let component: EventDialogComponent;
  let fixture: ComponentFixture<EventDialogComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let httpClientSpy: { post: jasmine.Spy; put: jasmine.Spy; delete: jasmine.Spy };
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EventDialogComponent>>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'hasRole']);
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'put', 'delete']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        EventDialogComponent,
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
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'create', event: null, title: 'Create Event', id: '' } },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    authServiceSpy.hasRole.and.returnValue(true);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values for a new event', () => {
    expect(component.eventForm.value).toEqual({
      name: '',
      startDate: null,
      startTime: '',
      endDate: null,
      endTime: '',
      timezone: component.currentTimezone
    });
  });

  it('should mark form as invalid if required fields are missing', () => {
    component.eventForm.controls['name'].setValue('');
    component.eventForm.controls['startDate'].setValue(null);
    component.eventForm.controls['startTime'].setValue('');
    expect(component.eventForm.valid).toBeFalse();
  });

  it('should call createEvent() when save() is triggered for a new event', () => {
    spyOn(component, 'createEvent');
    component.title = 'Create Event';
    component.save();
    expect(component.createEvent).toHaveBeenCalled();
  });

  it('should call editEvent() when save() is triggered for an existing event', () => {
    spyOn(component, 'editEvent');
    component.title = 'Edit Event';
    component.save();
    expect(component.editEvent).toHaveBeenCalled();
  });

  it('should format time correctly', () => {
    expect(component.formatTime(0)).toBe('12');
    expect(component.formatTime(5)).toBe('05');
    expect(component.formatTime(12)).toBe('12');
  });
});
