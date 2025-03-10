import { Component, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FileSelectionDialogComponent } from '../file-selection-dialog/file-selection-dialog.component';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-backups',
  templateUrl: './my-backups.component.html',
  styleUrl: './my-backups.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class MyBackupsComponent implements OnInit {

  backupFileNames: String[] = [];
  apiUrl: string = environment.apiUrl;

  constructor(public dialog: MatDialog, private http: HttpClient, public auth: AuthService, private snackBar: MatSnackBar, private router: Router) {

  }

  ngOnInit() {
    this.http.get<String[]>(this.apiUrl + '/v1/backups/file-names', {
      headers: new HttpHeaders({ 'Authorization': this.auth.getToken() })
    }).subscribe({
      next: (data: String[]) => {
        this.backupFileNames = data;
      },
      error: () => {
        this.showErrorMessage('An error occurred while getting the backup file names');
      }
    });
  }

  async selectFilesAndUpload() {
    try {
      console.log('Start file handles assignment'); // prints
      const fileHandles = await (window as any).showOpenFilePicker({
        multiple: true
      });
      console.log('End file handles assignment'); // does not print
  
      if (!fileHandles.length) {
        this.showErrorMessage('No files selected.');
        return;
      }
      
      const formData = new FormData();

      for (const handle of fileHandles) {
        const file = await handle.getFile();
        formData.append('files', file); 
        this.backupFileNames.push(file.name);
      }
  
      this.http.post<void>(this.apiUrl + '/v1/backups', formData, {
        headers: new HttpHeaders({ 'Authorization': this.auth.getToken() })
      }).subscribe({
        next: () => {
          this.showSuccessMessage(`Files successfully backed up`);
        },
        error: () => {
          this.showErrorMessage('An error occurred while registering system files');
        }
      });
  
    } catch (error) {
      this.showErrorMessage('File selection was canceled or failed.');
    }
  }

  async selectFilesAndDownload() {
    const dialogRef = this.dialog.open(FileSelectionDialogComponent, {
      width: '400px',
      data: { fileNames: this.backupFileNames }
    });
  
    dialogRef.afterClosed().subscribe((selectedFiles: string[] | undefined) => {
      if (selectedFiles && selectedFiles.length > 0) {
        const fileNamesParam = selectedFiles.join(',');
        const url = this.apiUrl + `/v1/backups?file-names=${encodeURIComponent(fileNamesParam)}`;
        const headers = new HttpHeaders({ Authorization: this.auth.getToken() });
  
        this.http.get(url, { headers, responseType: 'blob' }).subscribe({
          next: (blob) => {
            const blobUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = 'bizhub-backup.zip';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(blobUrl);
          },
          error: () => {
            this.showErrorMessage('Failed to download the ZIP file.');
          }
        });
      }
    });
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
