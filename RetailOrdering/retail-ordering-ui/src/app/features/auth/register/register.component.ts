import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-box glass-panel">
        <div class="auth-header">
          <h2>Create <span>Account</span></h2>
          <p>Join the Pizza Club and earn loyalty points on every slice!</p>
        </div>

        <form (ngSubmit)="onSubmit()" #regForm="ngForm" class="auth-form">
          <div class="form-input-group">
            <label class="form-input-label" for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              class="form-input" 
              placeholder="e.g. PizzaLover99"
              [(ngModel)]="username" 
              required
              minlength="3"
              #userInput="ngModel"
            >
            <div *ngIf="userInput.invalid && userInput.touched" class="error-msg">
              Username must be at least 3 characters.
            </div>
          </div>

          <div class="form-input-group">
            <label class="form-input-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="e.g. delicious@pizza.com"
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
              minlength="6"
              #passInput="ngModel"
            >
            <div *ngIf="passInput.invalid && passInput.touched" class="error-msg">
              Password must be at least 6 characters.
            </div>
          </div>

          <button 
            type="submit" 
            class="btn-premium btn-auth glow-btn"
            [disabled]="regForm.invalid || loading"
          >
            <span *ngIf="!loading">Create Member Profile</span>
            <span *ngIf="loading">Creating profile...</span>
          </button>
        </form>

        <div class="loyalty-signup-info">
          <span>🪙 Earn <strong>100 free points</strong> upon registering!</span>
        </div>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login">Sign in instead</a></p>
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

    .loyalty-signup-info {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      font-size: 13px;
      color: var(--success);
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
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.username || !this.email || !this.password) return;

    this.loading = true;
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toastService.showSuccess(`Welcome aboard, ${res.username}!`);
          this.router.navigate(['/menu']);
        } else {
          this.toastService.showDanger(res.message || 'Registration failed.');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showDanger(err.error?.message || 'Registration error occurred.');
      }
    });
  }
}
