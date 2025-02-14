import { Component } from '@angular/core';
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
    <mat-toolbar color="primary" class="app-toolbar">
      <span routerLink="/" style="cursor: pointer">Chime AI Chat</span>
      <span class="spacer"></span>
      @if (!authService.isAuthenticated) {
        <button mat-button routerLink="/login">Login</button>
        <button mat-button routerLink="/register">Register</button>
      } @else {
        <button mat-icon-button (click)="authService.logout()">
          <mat-icon>logout</mat-icon>
        </button>
      }
    </mat-toolbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .spacer {
      flex: 1 1 auto;
    }

    main {
      margin-top: 64px;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
