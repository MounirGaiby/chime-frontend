import { Component, EventEmitter, Output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  template: `
    <div class="app-container">
      <mat-toolbar class="app-toolbar">
        <div class="toolbar-left">
          @if (authService.isAuthenticated) {
            <button 
              mat-icon-button 
              class="menu-button"
              (click)="toggleSidenav.emit()"
            >
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span routerLink="/" class="brand-title">Chime AI Chat</span>
        </div>
        <span class="spacer"></span>
        @if (!authService.isAuthenticated) {
          <button mat-flat-button class="auth-button" routerLink="/login">Login</button>
          <button mat-flat-button class="auth-button" routerLink="/register">Register</button>
        } @else {
          <button mat-icon-button class="logout-button" (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
          </button>
        }
      </mat-toolbar>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1c1e 0%, #29323c 100%);
    }

    .app-toolbar {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 0 24px;
    }

    .brand-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
      text-decoration: none;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: opacity 0.3s ease;
    }

    .brand-title:hover {
      opacity: 0.9;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .auth-button {
      margin-left: 16px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .auth-button:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .logout-button {
      color: white;
      opacity: 0.8;
      transition: all 0.3s ease;
    }

    .logout-button:hover {
      opacity: 1;
      transform: translateY(-1px);
    }

    main {
      padding-top: 64px;
      min-height: calc(100vh - 64px);
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .menu-button {
      color: rgba(255, 255, 255, 0.9);
      transition: all 0.3s ease;
      
      &:hover {
        color: white;
        transform: translateY(-1px);
      }
    }
  `]
})
export class AppComponent {
  @Output() toggleSidenav = new EventEmitter<void>();

  constructor(public authService: AuthService) {}
}
