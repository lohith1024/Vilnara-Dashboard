import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Vilnara</span>
      <span style="flex: 1 1 auto;"></span>
      <ng-container *ngIf="!isLoggedIn">
        <button mat-button routerLink="/login">Login</button>
        <button mat-button routerLink="/register">Register</button>
      </ng-container>
      <ng-container *ngIf="isLoggedIn">
        <button mat-button routerLink="/dashboard">Dashboard</button>
        <button mat-button (click)="logout()">Logout</button>
      </ng-container>
    </mat-toolbar>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
} 