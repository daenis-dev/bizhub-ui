import { Component, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ArtifactRequest } from '../models/artifact-request';

@Component({
  selector: 'app-my-artifacts',
  templateUrl: './my-artifacts.component.html',
  styleUrl: './my-artifacts.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class MyArtifactsComponent implements OnInit {
  commonTargetFilePaths: String[] = [];

  constructor(private http: HttpClient, private auth: AuthService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.http.get<String[]>('https://localhost:8080/v1/common-target-file-paths/windows', { headers: new HttpHeaders({'Authorization': this.auth.getToken()}) }).subscribe({
      next: (data) => {
        this.commonTargetFilePaths = data;
      },
      error: (error) => {
        this.showErrorMessage('An error occurred while retrieving the file paths to check for');
      },
      complete: () => {
      }
    });
  }

  openAccountDialog() {
    this.dialog.open(AccountDialogComponent, {
      width: '800px',
      height: '225px'
    });
  }

  async registerSystemFiles() {
    try {
      // Open file picker for multiple file selection
      const fileHandles = await (window as any).showOpenFilePicker({
        multiple: true
      });
  
      if (!fileHandles.length) {
        this.showErrorMessage('No files selected.');
        return;
      }
  
      const artifactRequests: ArtifactRequest[] = [];
  
      for (const handle of fileHandles) {
        const file = await handle.getFile();
        const filePath = file.name;
  
        if (this.commonTargetFilePaths.includes(`C:/Windows/${filePath}`)) {
          const hash = await this.computeSHA256(file);
          artifactRequests.push({ filePath: `C:/Windows/${filePath}`, hash });
        }
      }
  
      if (artifactRequests.length === 0) {
        this.showErrorMessage('No matching system files found.');
        return;
      }
  
      // Send selected files to backend
      this.http.post<void>('https://localhost:8080/v1/artifacts', artifactRequests, {
        headers: new HttpHeaders({ 'Authorization': this.auth.getToken() })
      }).subscribe({
        next: () => {
          this.showSuccessMessage(`${artifactRequests.length} system files successfully registered`);
        },
        error: () => {
          this.showErrorMessage('An error occurred while registering system files');
        }
      });
  
    } catch (error) {
      this.showErrorMessage('File selection was canceled or failed.');
    }
  }
  
  /**
   * Computes the SHA-256 hash of a file
   */
  private async computeSHA256(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-success']
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error']
    });
  }

}
