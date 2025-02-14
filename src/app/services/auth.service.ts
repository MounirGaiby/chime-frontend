import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../interfaces/auth.interface';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject: BehaviorSubject<string | null>;

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let initialToken = null;
    if (isPlatformBrowser(this.platformId)) {
      initialToken = localStorage.getItem('token');
    }
    this.tokenSubject = new BehaviorSubject<string | null>(initialToken);
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.apiService.login({email, password}).pipe(
      tap(response => {
        this.setAuthState(response.data.user, response.data.authorization.token);
      })
    );
  }

  register(name: string, email: string, password: string, password_confirmation: string) {
    return this.apiService.register({ name, email, password, password_confirmation }).pipe(
      tap(response => {
        this.setAuthState(response.data.user, response.data.authorization.token);
      })
    );
  }

  logout(): void {
    this.setAuthState(null, null);
    this.router.navigate(['/login']);
  }

  private setAuthState(user: User | null, token: string | null) {
    if (isPlatformBrowser(this.platformId)) {
      if (user) {
        localStorage.setItem('token', token || '');
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
  }

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string | null): void {
    if (isPlatformBrowser(this.platformId)) {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    this.tokenSubject.next(token);
  }
} 