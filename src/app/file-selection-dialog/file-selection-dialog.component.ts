import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-file-selection-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatListModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './file-selection-dialog.component.html',
  styleUrls: ['./file-selection-dialog.component.css']
})
export class FileSelectionDialogComponent {
  selectedFiles: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<FileSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fileNames: string[] }
  ) {}

  toggleSelection(fileName: string) {
    const index = this.selectedFiles.indexOf(fileName);
    if (index === -1) {
      this.selectedFiles.push(fileName);
    } else {
      this.selectedFiles.splice(index, 1);
    }
  }

  confirmSelection() {
    this.dialogRef.close(this.selectedFiles);
  }

  cancel() {
    this.dialogRef.close();
  }
}
