import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ArtifactRequest } from '../models/artifact-request';

@Component({
  selector: 'app-artifact-form',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatCardModule,
    FormsModule
  ],
  templateUrl: './artifact-form.component.html',
  styleUrl: './artifact-form.component.css',
  standalone: true
})
export class ArtifactFormComponent {
  filesToDisplay: ArtifactRequest[] = [];

  constructor(private dialogRef: MatDialogRef<ArtifactFormComponent>) {}

  onFileSelect(event: any): void {
    const files = event.target.files;

    // Clear previous files
    this.filesToDisplay = [];

    // If files are selected, we will process them
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.filesToDisplay.push({
        name: file.name,
        path: file.webkitRelativePath || file.name
      });
    }

    // If a directory was selected, webkitRelativePath will be populated, showing the directory structure
    console.log('Selected files:', this.filesToDisplay);
  }

  onCreateRequest(): void {
    // Handle create request logic here
    console.log('Creating artifacts for selected files:', this.filesToDisplay);
    this.dialogRef.close();
  }
}
