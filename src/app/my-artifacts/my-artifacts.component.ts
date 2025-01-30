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

interface FileItem {
  id: number;
  name: string;
  filePath: string;
}

@Component({
  selector: 'app-my-artifacts',
  templateUrl: './my-artifacts.component.html',
  styleUrl: './my-artifacts.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ]
})
export class MyArtifactsComponent implements OnInit {
  files: FileItem[] = [];
  currentPath: string = '/';
  displayedItems: Set<string> = new Set();
  breadcrumbPaths: string[] = [];

  constructor(private http: HttpClient, private auth: AuthService, private dialog: MatDialog) {}

  ngOnInit() {
    this.fetchFiles();
  }

  fetchFiles(): void {
    this.http.get<FileItem[]>('https://localhost:8080/v1/artifacts', { headers: new HttpHeaders({'Authorization': this.auth.getToken()}) }).subscribe({
      next: (data) => {
        this.files = data;
        this.updateDisplayedItems();
      },
      error: (error) => {
        console.error('Error fetching files:', error);
      },
      complete: () => {
        console.log('File fetch completed');
      }
    });
  }

  updateDisplayedItems(): void {
    this.displayedItems.clear();

    for (const file of this.files) {
      const relativePath = file.filePath.startsWith(this.currentPath)
        ? file.filePath.substring(this.currentPath.length)
        : file.filePath;
      const topLevelItem = relativePath.split('/')[0];

      if (topLevelItem) this.displayedItems.add(topLevelItem);
    }

    this.generateBreadcrumbs();
  }

  traverse(directory: string): void {
    this.currentPath = this.currentPath === '/' ? `/${directory}/` : `${this.currentPath}${directory}/`;
    this.updateDisplayedItems();
  }

  scanArtifact(file: string): void {
    console.log(`Scanning ${this.currentPath}${file}`);
  }

  goBack(): void {
    if (this.currentPath === '/') return;

    const parts = this.currentPath.split('/').filter(p => p);
    parts.pop();
    this.currentPath = parts.length ? `/${parts.join('/')}/` : '/';

    this.updateDisplayedItems();
  }

  navigateToPath(index: number): void {
    this.currentPath = index === 0 ? '/' : '/' + this.breadcrumbPaths.slice(0, index + 1).join('/') + '/';
    this.updateDisplayedItems();
  }

  generateBreadcrumbs(): void {
    this.breadcrumbPaths = this.currentPath === '/' ? ['/'] : this.currentPath.split('/').filter(p => p);
  }

  openAccountDialog() {
    this.dialog.open(AccountDialogComponent, {
      width: '800px',
      height: '225px'
    });
  }
}
