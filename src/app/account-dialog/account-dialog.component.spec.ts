import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDialogComponent } from './account-dialog.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

describe('AccountDialogComponent', () => {
  
  let component: AccountDialogComponent;
  let fixture: ComponentFixture<AccountDialogComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<AccountDialogComponent>>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'loginForEmailAndPassword']);
    matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
          imports: [
            AccountDialogComponent,
            CommonModule,
            MatButtonModule,
            MatDialogModule,
            MatIconModule
          ],
          providers: [
            { provide: AuthService, useValue: authServiceSpy },
            { provide: MatDialogRef, useValue: matDialogRefSpy }
          ]
        }).compileComponents();

    fixture = TestBed.createComponent(AccountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
