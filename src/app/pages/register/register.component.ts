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
    .register-card {
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