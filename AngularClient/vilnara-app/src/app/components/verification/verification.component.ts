import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Verify Email</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="verificationForm" (ngSubmit)="onSubmit()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>Verification Code</mat-label>
              <input matInput formControlName="code" required>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit">Verify</button>
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
  `]
})
export class VerificationComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  verificationForm: FormGroup;
  email: string;

  constructor() {
    this.email = localStorage.getItem('pendingVerification') || '';
    this.verificationForm = this.fb.group({
      code: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.verificationForm.valid) {
      const loadingSnackBar = this.snackBar.open('Verifying...', '', { duration: undefined });
      
      this.authService.verifyEmail({
        email: this.email,
        code: this.verificationForm.get('code')?.value
      }).subscribe({
        next: () => {
          loadingSnackBar.dismiss();
          this.snackBar.open('Email verified successfully!', 'Close', { duration: 3000 });
          localStorage.removeItem('pendingVerification');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          loadingSnackBar.dismiss();
          console.error('Verification error:', error);
          this.snackBar.open(
            typeof error === 'string' ? error : 'Verification failed. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
    }
  }
} 