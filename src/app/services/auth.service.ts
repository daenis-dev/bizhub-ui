import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl: string = environment.apiUrl;

  tokenKey = 'token';
  tokenExpDateKey = 'token-exp';

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) { }

  isAuthenticated() {
    let tokenExpirationDate: any = localStorage.getItem(this.tokenExpDateKey);
    return localStorage.getItem(this.tokenKey) != null && new Date(tokenExpirationDate).getDate() > new Date().getDate();
  }

  registerAccountForParams(params: HttpParams) {
    this.http.post(this.apiUrl + "/v1/register", null, {params: params})
    .subscribe({
      next: () => {
        const username: string = params.get('email-address') ?? '';
        const password: string = params.get('password') ?? '';
        this.loginForEmailAndPassword(username, password)
        .subscribe({
          next: (isLoginSuccessful) => {
            if (isLoginSuccessful) {
              this.router.navigateByUrl('/my-backups');
            } else {
              this.displayError("Login attempt failed");
            }
          }, error: () => {
                this.displayError("Login attempt failed");
            }
        });
      },
      error: () => this.displayError("Error occurred while registering for an account")
    });
  }

  loginForEmailAndPassword(email: string, password: string): Observable<boolean> {
    return this.http.post(this.apiUrl + "/v1/login", null, {
      params: new HttpParams().set("email-address", email).set("password", password)
    }).pipe(
      map((data: any) => {
        let response: any = data;
        if (response.accessToken != null && response.accessToken !== 'Bearer null') {
          localStorage.setItem(this.tokenKey, response.accessToken);
          let expDate: any = new Date(new Date().setDate(new Date().getDate() + 1));
          localStorage.setItem(this.tokenExpDateKey, expDate);
          return true;
        }
        return false;
      }),
      catchError(() => {
        return of(false);
      })
    );
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
