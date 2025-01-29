import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  tokenKey = 'token';
  tokenExpDateKey = 'token-exp';

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) { }

  isAuthenticated() {
    let tokenExpirationDate: any = localStorage.getItem(this.tokenExpDateKey);
    return localStorage.getItem(this.tokenKey) != null && new Date(tokenExpirationDate).getDate() > new Date().getDate();
  }

  registerAccountForParams(params: HttpParams) {
    this.http.post("https://localhost:8080/v1/register", null, {params: params})
    .subscribe({
      next: () => {
        this.displaySuccess("Account registered successfully");
        this.router.navigateByUrl('/my-artifacts'); // TODO: Create component and configure routing
      },
      error: () => this.displayError("Error occurred while registering for an account")
    });
  }

  loginForEmailAndPassword(email: string, password: string) {
    this.http.post("https://localhost:8080/v1/login", null, {params: new HttpParams().set("email-address", email).set("password", password)})
    .subscribe({
      next: (data) => {
        let response: any = data;
        if (response.accessToken != null && response.accessToken !== 'Bearer null') {
          localStorage.setItem(this.tokenKey, response.accessToken);
          let expDate: any = new Date(new Date().setDate(new Date().getDate() + 1));
          localStorage.setItem(this.tokenExpDateKey, expDate);
          this.router.navigateByUrl('/my-artifacts');
        }
      },
      error: () => this.displayError("Login attempt failed")
    });
  }

  private displaySuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-success']
    });
  }

  private displayError(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['mat-snackbar-error']
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/');
  }

  getToken(): string {
    const token = localStorage.getItem(this.tokenKey);
    if (token == null) {
      return '';
    }
    return token;
  }
}