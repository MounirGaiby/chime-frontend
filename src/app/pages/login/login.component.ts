import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    RouterLink
  ],
  template: `
    <div class="container">
      <mat-card class="login-card">
        @if (loading) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }
        <mat-card-header>
          <mat-card-title>Login to Chime AI</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            @if (error) {
              <p class="error-message">{{ error }}</p>
            }

            <div class="button-container">
              <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || loading">
                Login
              </button>
            </div>
          </form>
        </mat-card-content>
        <mat-card-footer>
          <p class="text-center">
            Don't have an account? <a routerLink="/register">Register</a>
          </p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .container::before {
      content: '';
      position: absolute;
      width: 150%;
      height: 150%;
      background: radial-gradient(circle, rgba(45, 146, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
      animation: pulse 15s infinite;
    }

    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    }

    .login-card {
      max-width: 400px;
      width: 100%;
      margin: 2rem auto;
      padding: 2.5rem;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      animation: fadeIn 0.5s ease-out;
      position: relative;
      z-index: 1;
    }

    mat-card-header {
      margin-bottom: 2.5rem;
      text-align: center;
      position: relative;
    }

    mat-card-header::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #3498db, #2980b9);
      border-radius: 50%;
      opacity: 0.2;
      filter: blur(20px);
    }

    mat-card-title {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    mat-form-field {
      margin-bottom: 1.5rem;
    }

    ::ng-deep .mat-mdc-form-field {
      .mdc-text-field--filled {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      }

      .mat-mdc-form-field-focus-overlay {
        background: rgba(255, 255, 255, 0.05);
      }

      .mdc-floating-label, .mdc-text-field__input {
        color: rgba(255, 255, 255, 0.87) !important;
      }

      .mdc-line-ripple::before {
        border-bottom-color: rgba(255, 255, 255, 0.1);
      }
    }

    .button-container {
      margin-top: 2rem;
    }

    button[type="submit"] {
      width: 100%;
      padding: 1.25rem;
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3498db, #2980b9);
      border: none;
      color: white;
      transition: all 0.3s ease;
      text-transform: uppercase;
    }

    button[type="submit"]:not([disabled]):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
    }

    button[type="submit"][disabled] {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.4);
    }

    .error-message {
      color: #e74c3c;
      text-align: center;
      margin: 1rem 0;
      padding: 1rem;
      border-radius: 12px;
      background: rgba(231, 76, 60, 0.1);
      border: 1px solid rgba(231, 76, 60, 0.2);
      backdrop-filter: blur(5px);
    }

    mat-card-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      margin-top: 2rem;
    }

    mat-card-footer p {
      color: rgba(255, 255, 255, 0.6);
    }

    mat-card-footer a {
      color: #3498db;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
    }

    mat-card-footer a::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -2px;
      left: 0;
      background: linear-gradient(90deg, #3498db, #2980b9);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    mat-card-footer a:hover::after {
      transform: scaleX(1);
    }

    ::ng-deep .mat-mdc-progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      border-radius: 24px 24px 0 0;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/chat']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Login failed. Please try again.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
} 