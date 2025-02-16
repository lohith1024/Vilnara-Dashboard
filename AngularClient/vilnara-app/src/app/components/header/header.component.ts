import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Vilnara</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/dashboard">Dashboard</button>
      <button mat-button (click)="logout()">Logout</button>
    </mat-toolbar>
  `
})
export class HeaderComponent {
  logout() {
    localStorage.removeItem('token');
  }
} 