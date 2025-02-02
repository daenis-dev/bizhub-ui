import { Component, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FileSelectionDialogComponent } from '../file-selection-dialog/file-selection-dialog.component';

@Component({
  selector: 'app-my-backups',
  templateUrl: './my-backups.component.html',
  styleUrl: './my-backups.component.css',
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
export class MyBackupsComponent implements OnInit {

  private backupFileNames: String[] = [];

  constructor(private dialog: MatDialog, private http: HttpClient, private auth: AuthService, private snackBar: MatSnackBar) {

  }

  ngOnInit() {
    this.http.get<String[]>('https://localhost:8080/v1/backups/file-names', {
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

  openAccountDialog() {
      this.dialog.open(AccountDialogComponent, {
        width: '800px',
        height: '225px'
      });
  }

  async selectFilesAndUpload() {
      try {
        const fileHandles = await (window as any).showOpenFilePicker({
          multiple: true
        });
    
        if (!fileHandles.length) {
          this.showErrorMessage('No files selected.');
          return;
        }
        
        const formData = new FormData();

        for (const handle of fileHandles) {
          const file = await handle.getFile();
          formData.append('files', file); 
          // TODO: add file name to list of backup file names
        }
    
        this.http.post<void>('https://localhost:8080/v1/backups', formData, {
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
          selectedFiles.forEach((fileName: string) => {
            const url = `https://localhost:8080/v1/backups?file-name=${encodeURIComponent(fileName)}`;
            const headers = new HttpHeaders({ Authorization: this.auth.getToken() });
    
            const newTab = window.open('', '_blank');
    
            this.http.get(url, { headers, responseType: 'blob' }).subscribe({
              next: (blob) => {
                const fileType = blob.type;
                const blobUrl = window.URL.createObjectURL(blob);
    
                if (fileType.includes('pdf') || fileType.includes('image') || fileType.includes('text')) {
                  newTab!.location.href = blobUrl;
                } else {
                  const anchor = document.createElement('a');
                  anchor.href = blobUrl;
                  anchor.download = fileName;
                  document.body.appendChild(anchor);
                  anchor.click();
                  document.body.removeChild(anchor);
                  newTab!.close();
                }
              },
              error: () => {
                this.showErrorMessage(`Failed to download ${fileName}`);
                newTab!.close();
              }
            });
          });
        }
      });
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
