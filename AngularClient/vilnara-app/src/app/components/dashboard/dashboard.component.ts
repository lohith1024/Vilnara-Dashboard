import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';

interface User {
  name: {
    first: string;
    last: string;
  };
  email: string;
  picture: {
    medium: string;
  };
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <h2>Users List</h2>
      <div class="users-grid" fxLayout="row wrap" fxLayoutGap="20px grid">
        <mat-card *ngFor="let user of users" fxFlex="calc(33.33% - 20px)" fxFlex.lt-md="calc(50% - 20px)" fxFlex.lt-sm="100%">
          <mat-card-header>
            <img mat-card-avatar [src]="user.picture.medium" [alt]="user.name.first">
            <mat-card-title>{{user.name.first}} {{user.name.last}}</mat-card-title>
            <mat-card-subtitle>{{user.email}}</mat-card-subtitle>
          </mat-card-header>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [MatCardModule, FlexLayoutModule, CommonModule]
})
export class DashboardComponent implements OnInit {
  users: User[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('https://randomuser.me/api/?results=10')
      .subscribe({
        next: (response) => {
          this.users = response.results;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
        }
      });
  }
} 