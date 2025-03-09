import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {
  screenWidthSubject = new BehaviorSubject<boolean>(window.innerWidth < 1120);
  screenHeightSubject = new BehaviorSubject<boolean>(window.innerHeight < 530);

  isMobile$ = combineLatest([
    this.screenWidthSubject.asObservable(),
    this.screenHeightSubject.asObservable()
  ]).pipe(
    map(([isWidthMobile, isHeightMobile]) => isWidthMobile || isHeightMobile)
  );

  constructor() {
    window.addEventListener('resize', () => {
      this.screenWidthSubject.next(window.innerWidth < 1120);
      this.screenHeightSubject.next(window.innerHeight < 530);
    });
  }
}


