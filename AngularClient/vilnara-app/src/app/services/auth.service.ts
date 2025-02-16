import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('Auth Error:', error);
    return throwError(() => errorMessage);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user)
      .pipe(catchError(this.handleError));
  }

  verifyEmail(data: { email: string, code: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-email`, data)
      .pipe(catchError(this.handleError));
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
} 