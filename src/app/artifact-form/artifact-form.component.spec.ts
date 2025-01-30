import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtifactFormComponent } from './artifact-form.component';

describe('ArtifactFormComponent', () => {
  let component: ArtifactFormComponent;
  let fixture: ComponentFixture<ArtifactFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtifactFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtifactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
