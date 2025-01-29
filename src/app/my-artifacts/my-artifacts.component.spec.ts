import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyArtifactsComponent } from './my-artifacts.component';

describe('MyArtifactsComponent', () => {
  let component: MyArtifactsComponent;
  let fixture: ComponentFixture<MyArtifactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyArtifactsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyArtifactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
