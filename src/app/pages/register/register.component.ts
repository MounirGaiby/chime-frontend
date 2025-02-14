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
  selector: 'app-register',
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
      <mat-card class="register-card">
        @if (loading) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }
        <mat-card-header>
          <mat-card-title>Register for Chime AI</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required>
              @if (registerForm.get('name')?.hasError('required') && registerForm.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email')) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input matInput type="password" formControlName="password_confirmation" required>
              @if (registerForm.get('password_confirmation')?.hasError('required') && registerForm.get('password_confirmation')?.touched) {
                <mat-error>Password confirmation is required</mat-error>
              }
              @if (registerForm.hasError('passwordMismatch')) {
                <mat-error>Passwords do not match</mat-error>
              }
            </mat-form-field>

            @if (error) {
              <p class="error-message">{{ error }}</p>
            }

            <div class="button-container">
              <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || loading">
                Register
              </button>
            </div>
          </form>
        </mat-card-content>
        <mat-card-footer>
          <p class="text-center">
            Already have an account? <a routerLink="/login">Login</a>
          </p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1c1e 0%, #29323c 100%);
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

    .register-card {
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

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 1.5rem;
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
      ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      const { name, email, password, password_confirmation } = this.registerForm.value;

      this.authService.register(name, email, password, password_confirmation).subscribe({
        next: () => {
          this.router.navigate(['/chat']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Registration failed. Please try again.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
} 