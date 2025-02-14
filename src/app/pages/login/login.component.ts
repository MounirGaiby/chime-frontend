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
    .login-card {
      max-width: 400px;
      margin: 2rem auto;
      padding: 20px;
    }

    .button-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }

    mat-form-field {
      margin-bottom: 1rem;
    }

    .error-message {
      color: red;
      text-align: center;
      margin: 10px 0;
    }

    mat-card-footer {
      padding: 16px;
      border-top: 1px solid #eee;
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