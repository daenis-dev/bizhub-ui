import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { authGuard } from './services/permission.service';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./login-form/login-form.component').then(
        (m) => m.LoginFormComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./account-registration-form/account-registration-form.component').then(
        (m) => m.AccountRegistrationFormComponent
      ),
  },
  {
    path: 'my-backups',
    loadComponent: () =>
      import('./my-backups/my-backups.component').then(
        (m) => m.MyBackupsComponent
      ),
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
