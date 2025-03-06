import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScreenSizeService } from '../services/screen-size.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-calendar-mobile',
  templateUrl: './my-calendar-mobile.component.html',
  styleUrl: './my-calendar-mobile.component.css',
  standalone: true,
  imports: [
  ]
})
export class MyCalendarMobileComponent implements OnInit, OnDestroy {

  private screenWidthSub?: Subscription;
  private screenHeightSub?: Subscription;

  constructor(private router: Router, private screenSizeService: ScreenSizeService) {

  }

  ngOnInit(): void {
    this.screenWidthSub = this.screenSizeService.isMobile$.subscribe(isMobile => {
      if (!isMobile) {
        this.router.navigate(['/my-calendar']);
      }
    });
    this.screenHeightSub = this.screenSizeService.isMobile$.subscribe(isMobile => {
      if (!isMobile) {
        this.router.navigate(['/my-calendar']);
      }
    });
  }

  ngOnDestroy() {
    if (this.screenWidthSub) {
      this.screenWidthSub.unsubscribe();
    }
    if (this.screenHeightSub) {
      this.screenHeightSub.unsubscribe();
    }
  }
}
