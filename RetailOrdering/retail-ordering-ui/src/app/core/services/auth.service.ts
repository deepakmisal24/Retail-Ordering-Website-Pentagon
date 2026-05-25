import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface CustomerProfile {
  customerId: number;
  username: string;
  email: string;
  role: string;
  loyaltyPoints: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  customerId: number;
  username: string;
  email: string;
  role: string;
  loyaltyPoints: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  
  private customerSubject = new BehaviorSubject<CustomerProfile | null>(null);
  customer$ = this.customerSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSession();
  }

  get token(): string | null {
    return localStorage.getItem('jwt_token');
  }

  get isAuthenticated(): boolean {
    return this.customerSubject.value !== null;
  }

  get isAdmin(): boolean {
    return this.customerSubject.value?.role === 'Admin';
  }

  get customerId(): number | null {
    return this.customerSubject.value?.customerId ?? null;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('jwt_token', res.token);
          this.customerSubject.next({
            customerId: res.customerId,
            username: res.username,
            email: res.email,
            role: res.role,
            loyaltyPoints: res.loyaltyPoints,
            createdAt: new Date().toISOString()
          });
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('jwt_token', res.token);
          this.customerSubject.next({
            customerId: res.customerId,
            username: res.username,
            email: res.email,
            role: res.role,
            loyaltyPoints: res.loyaltyPoints,
            createdAt: new Date().toISOString()
          });
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.customerSubject.next(null);
  }

  refreshProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      tap(profile => {
        this.customerSubject.next({
          customerId: profile.userId ?? profile.customerId,
          username: profile.username,
          email: profile.email,
          role: profile.role,
          loyaltyPoints: profile.loyaltyPoints,
          createdAt: profile.createdAt
        });
      })
    );
  }

  private loadSession() {
    const token = this.token;
    if (token) {
      // Decode JWT roughly to verify if it has payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          this.logout();
          return;
        }

        // Pre-fill profile from token claims
        const customerId = parseInt(payload.sub || payload.nameid || '0', 10);
        const username = payload.unique_name || payload.name || 'User';
        const email = payload.email || '';
        const role = payload.role || 'Customer';

        this.customerSubject.next({
          customerId,
          username,
          email,
          role,
          loyaltyPoints: 0, // Will be updated by profile refresh
          createdAt: new Date().toISOString()
        });

        // Trigger asynchronous full profile refresh to pull accurate loyalty points
        this.refreshProfile().subscribe({
          error: () => this.logout() // If token is invalid on backend, clear session
        });
      } catch {
        this.logout();
      }
    }
  }
}
