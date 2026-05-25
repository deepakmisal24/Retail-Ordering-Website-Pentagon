import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-box glass-panel">
        <div class="auth-header">
          <h2>Secure <span>Sign In</span></h2>
          <p>Access your pizza, drinks and breads orders dashboard</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
          <div class="form-input-group">
            <label class="form-input-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="e.g. customer@pizza.com"
              [(ngModel)]="email" 
              required
              email
              #emailInput="ngModel"
            >
            <div *ngIf="emailInput.invalid && emailInput.touched" class="error-msg">
              Please enter a valid email address.
            </div>
          </div>

          <div class="form-input-group">
            <label class="form-input-label" for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input" 
              placeholder="••••••••"
              [(ngModel)]="password" 
              required
              #passInput="ngModel"
            >
            <div *ngIf="passInput.invalid && passInput.touched" class="error-msg">
              Password is required.
            </div>
          </div>

          <button 
            type="submit" 
            class="btn-premium btn-auth glow-btn"
            [disabled]="loginForm.invalid || loading"
          >
            <span *ngIf="!loading">Authenticate Session</span>
            <span *ngIf="loading">Verifying credentials...</span>
          </button>
        </form>

        <div class="demo-logins">
          <h4>💡 Quick Demo Accounts</h4>
          <div class="demo-buttons">
            <button type="button" class="btn-premium-outline btn-sm" (click)="fillDemo('customer')">
              👤 Pizza Customer
            </button>
            <button type="button" class="btn-premium-outline btn-sm" (click)="fillDemo('admin')">
              👑 Admin Manager
            </button>
          </div>
        </div>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/auth/register">Create one here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      animation: fadeIn 0.4s ease;
    }

    .auth-box {
      width: 100%;
      max-width: 450px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .auth-header {
      text-align: center;
    }

    .auth-header h2 {
      font-size: 28px;
      color: var(--text-primary);
    }

    .auth-header h2 span {
      color: var(--accent);
    }

    .auth-header p {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 8px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .btn-auth {
      width: 100%;
      margin-top: 10px;
    }

    .error-msg {
      color: var(--danger);
      font-size: 12px;
      margin-top: 5px;
    }

    .demo-logins {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-glass);
      padding: 15px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .demo-logins h4 {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .demo-buttons {
      display: flex;
      gap: 10px;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      flex: 1;
      border-radius: 8px;
    }

    .auth-footer {
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-glass);
      padding-top: 20px;
    }

    .auth-footer a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 500;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  fillDemo(type: 'customer' | 'admin') {
    if (type === 'customer') {
      this.email = 'customer@pizza.com';
      this.password = 'Customer@123';
    } else {
      this.email = 'admin@pizza.com';
      this.password = 'Admin@123';
    }
    this.toastService.showInfo(`Filled ${type} credentials!`);
  }

  onSubmit() {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toastService.showSuccess(`Welcome back, ${res.username}!`);
          if (res.role === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/menu']);
          }
        } else {
          this.toastService.showDanger(res.message || 'Login failed.');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showDanger(err.error?.message || 'Authentication error occurred.');
      }
    });
  }
}
