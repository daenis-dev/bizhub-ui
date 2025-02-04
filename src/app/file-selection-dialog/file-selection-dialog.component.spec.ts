import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileSelectionDialogComponent } from './file-selection-dialog.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('FileSelectionDialogComponent', () => {
  let component: FileSelectionDialogComponent;
  let fixture: ComponentFixture<FileSelectionDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<FileSelectionDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        FileSelectionDialogComponent,
        CommonModule,
        MatDialogModule,
        MatListModule,
        MatCheckboxModule,
        MatButtonModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { fileNames: ['file1.txt', 'file2.txt', 'file3.txt'] } },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle file selection when a checkbox is clicked', () => {
    expect(component.selectedFiles.length).toBe(0);

    component.toggleSelection('file1.txt');
    expect(component.selectedFiles).toContain('file1.txt');

    component.toggleSelection('file1.txt');
    expect(component.selectedFiles).not.toContain('file1.txt');
  });

  it('should confirm selection and close the dialog with selected files', () => {
    component.toggleSelection('file1.txt');
    component.toggleSelection('file2.txt');
    
    component.confirmSelection();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(['file1.txt', 'file2.txt']);
  });

  it('should cancel and close the dialog without selection', () => {
    component.cancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });
});
