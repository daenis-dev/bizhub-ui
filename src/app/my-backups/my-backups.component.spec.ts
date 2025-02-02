import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBackupsComponent } from './my-backups.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MyBackupsComponent', () => {
  let component: MyBackupsComponent;
  let fixture: ComponentFixture<MyBackupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MyBackupsComponent,
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule
      ],
      providers: [
              MatSnackBar,
              MatDialog,
              provideHttpClient(withInterceptorsFromDi()),
              provideHttpClientTesting()
            ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBackupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
