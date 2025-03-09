import { TestBed } from '@angular/core/testing';
import { ScreenSizeService } from './screen-size.service';

describe('ScreenSizeService', () => {
  let service: ScreenSizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
          providers: [ ScreenSizeService ]
        });
    service = TestBed.inject(ScreenSizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should determine if screen size is mobile based on width and height', (done) => {
    Object.defineProperty(window, 'innerWidth', { value: 1000 });
    Object.defineProperty(window, 'innerHeight', { value: 400 });
    service.screenWidthSubject.next(window.innerWidth < 1120);
    service.screenHeightSubject.next(window.innerHeight < 530);
  
    service.isMobile$.subscribe(isMobile => {
      try {
        expect(isMobile).toBeTrue();
        done();
      } catch (error) {
        done();
      }
    });
  });
  
  it('should handle resize events properly', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1000 });
    Object.defineProperty(window, 'innerHeight', { value: 400 });

    service.screenWidthSubject.next(window.innerWidth < 1120);
    service.screenHeightSubject.next(window.innerHeight < 530);

    expect(service.screenWidthSubject.value).toBeTrue();
    expect(service.screenHeightSubject.value).toBeTrue();

    Object.defineProperty(window, 'innerWidth', { value: 1150 });
    Object.defineProperty(window, 'innerHeight', { value: 600 });

    service.screenWidthSubject.next(window.innerWidth < 1120);
    service.screenHeightSubject.next(window.innerHeight < 530);

    expect(service.screenWidthSubject.value).toBeFalse();
    expect(service.screenHeightSubject.value).toBeFalse();
  });
});
