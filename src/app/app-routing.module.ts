import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { LoginFormComponent } from "./login-form/login-form.component";
import { MyArtifactsComponent } from "./my-artifacts/my-artifacts.component";
import { authGuard } from "./services/permission.service";
import { AccountRegistrationFormComponent } from "./account-registration-form/account-registration-form.component";

const routes: Routes = [
    { path: '', component: LoginFormComponent },
    { path: 'register', component: AccountRegistrationFormComponent },
    { path: 'my-artifacts', component: MyArtifactsComponent, canActivate: [authGuard]}
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' }) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }