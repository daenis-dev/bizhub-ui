import { Component, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface FileItem {
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
    MatButtonModule
  ],
  providers: 
})
export class MyArtifactsComponent implements OnInit {
  files: FileItem[] = [
    { filePath: '/Windows/Scheduled/task1.json' },
    { filePath: '/Windows/Scheduled/task2.json' },
    { filePath: '/Windows/System32/conf.json' },
    { filePath: '/Windows/System32/usr/bin/requirements.txt' },
    { filePath: '/Windows/test.txt' }
  ];

  currentPath: string = '/';
  displayedItems: Set<string> = new Set();
  breadcrumbPaths: string[] = [];

  ngOnInit() {
    this.updateDisplayedItems();
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
}
