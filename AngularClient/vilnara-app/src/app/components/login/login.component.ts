import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-login',
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit">Login</button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    DashboardComponent
  ],
  providers: [FormBuilder],
  styles: [`
    .form-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 64px);
    }
    mat-card {
      width: 100%;
      max-width: 400px;
      margin: 20px;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loadingSnackBar = this.snackBar.open('Logging in...', '', { duration: undefined });
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          loadingSnackBar.dismiss();
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          loadingSnackBar.dismiss();
          console.error('Login error:', error);
          this.snackBar.open(
            error.error?.message || 'Login failed. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.snackBar.open('Please fix the form errors', 'Close', { duration: 3000 });
    }
  }
} 