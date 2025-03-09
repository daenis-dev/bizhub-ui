import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MyBackupsComponent } from './my-backups.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';
import { FileSelectionDialogComponent } from '../file-selection-dialog/file-selection-dialog.component';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MyBackupsComponent', () => {
  let component: MyBackupsComponent;
  let fixture: ComponentFixture<MyBackupsComponent>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let httpTestingController: HttpTestingController;
  let apiUrl: string = environment.apiUrl;

  beforeEach(async () => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'hasRole'])

    const dialogRefMock = {
      afterClosed: jasmine.createSpy().and.returnValue(of(['file1.txt', 'file2.txt'])),
      close: jasmine.createSpy()
    } as unknown as MatDialogRef<FileSelectionDialogComponent>;

    dialogSpy.open.and.returnValue(dialogRefMock);

    spyOn(window as any, 'showOpenFilePicker').and.returnValue(Promise.resolve([{
      name: 'backup1.zip',
      kind: 'file',
      getFile: () => Promise.resolve(new File(['content'], 'backup1.zip', { type: 'application/zip' }))
    }]));    

    await TestBed.configureTestingModule({
      imports: [
        MyBackupsComponent,
        BrowserAnimationsModule,
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
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBackupsComponent);
    component = fixture.componentInstance;
    component.dialog = dialogSpy;
    httpTestingController = TestBed.inject(HttpTestingController);

    authServiceSpy.hasRole.and.returnValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch backup file names on init and update backupFileNames', () => {
    const mockBackupFileNames = ['backup1.zip', 'backup2.zip'];
    
    component.ngOnInit();

    const req = httpTestingController.expectOne(apiUrl + '/v1/backups/file-names');
    expect(req.request.method).toBe('GET');
    req.flush(mockBackupFileNames);
  });

  it('should show an error message if fetching backup file names fails', () => {
    spyOn(component, 'showErrorMessage');

    component.ngOnInit();

    const req = httpTestingController.expectOne(apiUrl + '/v1/backups/file-names');
    expect(req.request.method).toBe('GET');

    req.flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(component.showErrorMessage).toHaveBeenCalledWith('An error occurred while getting the backup file names');
  });

  it('should upload selected files and update backupFileNames', fakeAsync(() => {
    const mockFile = new File(['content'], 'backup1.zip', { type: 'application/zip' });

    spyOn(component, 'showSuccessMessage');

    dialogSpy.open.and.returnValue({
      afterClosed: jasmine.createSpy().and.returnValue(of([mockFile]))
    } as unknown as MatDialogRef<FileSelectionDialogComponent>);

    component.selectFilesAndUpload();
    tick();

    const req = httpTestingController.expectOne(apiUrl + '/v1/backups');
    expect(req.request.method).toBe('POST');
    req.flush({});

    expect(component.showSuccessMessage).toHaveBeenCalledWith('Files successfully backed up');
    expect(component.backupFileNames).toContain('backup1.zip');
  }));

  it('should download selected files', fakeAsync(() => {  
  dialogSpy.open.and.returnValue({
    afterClosed: jasmine.createSpy().and.returnValue(of(['backup1.zip']))
  } as unknown as MatDialogRef<FileSelectionDialogComponent>);
  
  const mockBlob = new Blob(['file content'], { type: 'application/zip' });
  
  component.selectFilesAndDownload();
  tick();
  
  const req = httpTestingController.expectOne(apiUrl + '/v1/backups?file-names=backup1.zip');
  expect(req.request.method).toBe('GET');
  req.flush(mockBlob);
  
  const anchor = document.createElement('a');
  spyOn(anchor, 'click');
  
  spyOn(window.URL, 'revokeObjectURL');
  
  const blobUrl = window.URL.createObjectURL(mockBlob);
  anchor.href = blobUrl;
  anchor.download = 'bizhub-backup.zip';
  
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  
  expect(anchor.click).toHaveBeenCalled();
  }));
});
