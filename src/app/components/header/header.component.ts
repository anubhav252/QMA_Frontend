import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <div class="logo-icon">Q</div>
          <span>QuantiMeasure</span>
        </div>
        <div class="user-section">
          <div class="user-badge" *ngIf="isLoggedIn">👤 {{ username }}</div>
          <button class="btn btn-ghost" *ngIf="isLoggedIn" (click)="logout()">Logout</button>
          <button class="btn btn-primary" *ngIf="!isLoggedIn" (click)="openAuth()">Login</button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  @Output() authRequested = new EventEmitter<void>();

  isLoggedIn = false;
  username = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(val => this.isLoggedIn = val);
    this.authService.currentUser$.subscribe(val => this.username = val);
  }

  openAuth() {
    // Emit event to app component - handled via service
    this.authService.requestAuth();
  }

  logout() {
    this.authService.logout();
  }
}