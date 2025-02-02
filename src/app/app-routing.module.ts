import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { LoginFormComponent } from "./login-form/login-form.component";
import { authGuard } from "./services/permission.service";
import { AccountRegistrationFormComponent } from "./account-registration-form/account-registration-form.component";
import { MyBackupsComponent } from "./my-backups/my-backups.component";

const routes: Routes = [
    { path: '', component: LoginFormComponent },
    { path: 'register', component: AccountRegistrationFormComponent },
    { path: 'my-backups', component: MyBackupsComponent, canActivate: [authGuard]}
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' }) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }