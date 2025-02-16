import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Register</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit">Register</button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
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
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.hasError('required')) return `${field} is required`;
    if (control?.hasError('email')) return 'Not a valid email';
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    return '';
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const loadingSnackBar = this.snackBar.open('Registering...', '', { duration: undefined });
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          loadingSnackBar.dismiss();
          console.log('Registration response:', response); // Debug log
          
          if (response.verificationCode) {
            this.snackBar.open(
              `Registration successful! Test code: ${response.verificationCode}`, 
              'Close', 
              { duration: 10000 }
            );
            localStorage.setItem('pendingVerification', this.registerForm.get('email')?.value);
            this.router.navigate(['/verify']);
          }
        },
        error: (error) => {
          loadingSnackBar.dismiss();
          console.error('Registration error:', error); // Debug log
          this.snackBar.open(
            typeof error === 'string' ? error : 'Registration failed. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.snackBar.open('Please fix the form errors', 'Close', { duration: 3000 });
    }
  }
} 