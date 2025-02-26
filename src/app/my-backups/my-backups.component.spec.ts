import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBackupsComponent } from './my-backups.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';
import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { FileSelectionDialogComponent } from '../file-selection-dialog/file-selection-dialog.component';
import { of } from 'rxjs';

describe('MyBackupsComponent', () => {
  let component: MyBackupsComponent;
  let fixture: ComponentFixture<MyBackupsComponent>;
  let snackBarSpy: jasmine.Spy;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'hasRole'])

    const dialogRefMock = {
      afterClosed: jasmine.createSpy().and.returnValue(of(['file1.txt', 'file2.txt'])),
      close: jasmine.createSpy()
    } as unknown as MatDialogRef<FileSelectionDialogComponent>;

    dialogSpy.open.and.returnValue(dialogRefMock);

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
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: HttpClient, useValue: httpSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBackupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    authServiceSpy.hasRole.and.returnValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open account dialog on settings wheel click', () => {
    const openDialogSpy = spyOn(component['dialog'], 'open');
    component.openAccountDialog();
    expect(openDialogSpy).toHaveBeenCalledWith(AccountDialogComponent, {
      width: '800px',
      height: '225px'
    });
  });
});
