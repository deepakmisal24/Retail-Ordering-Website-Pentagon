import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <!-- HERO BANNER -->
      <div class="hero-banner glass-panel">
        <div class="hero-text">
          <span class="badge-premium badge-pending">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/>
            </svg>
            Premium Ordering Platform
          </span>
          <h1>Artisan Wood-Fired <br><span>Pizzeria & Bakery</span></h1>
          <p>
            Seamlessly browse, customize, and order premium pizzas, artisanal sourdough breads, 
            and house-crafted chilled cold drinks. Enjoy safe, lightning-fast transaction updates 
            and thread-safe live stock management.
          </p>
          <div class="hero-actions">
            <a routerLink="/menu" class="btn-premium glow-btn">
              Explore Our Menu
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <a *ngIf="!authService.isAuthenticated" routerLink="/auth/login" class="btn-premium-outline">
              Sign In to Order
            </a>
            <div *ngIf="authService.isAuthenticated" class="welcome-user-tag">
              <span class="text-secondary">Logged in as</span>
              <strong>{{ (authService.customer$ | async)?.username }}</strong>
              <span class="loyalty-pill">
                🪙 {{ (authService.customer$ | async)?.loyaltyPoints || 0 }} pts
              </span>
            </div>
          </div>
        </div>
        <div class="hero-graphic">
          <div class="pizza-icon-glow">🍕</div>
        </div>
      </div>

      <!-- ACTIVE PROMOTIONS -->
      <h2 class="section-title">Active Promotions & Offers</h2>
      <div class="promotions-grid">
        <div class="promo-card glass-card">
          <div class="promo-icon">🏷️</div>
          <h3>PIZZA20</h3>
          <p>Get a massive 20% discount on any size of Margherita, Pepperoni, or Garden Green pizza!</p>
          <div class="promo-code" (click)="copyCode('PIZZA20')">
            Code: <span>PIZZA20</span>
          </div>
        </div>

        <div class="promo-card glass-card">
          <div class="promo-icon">🥖</div>
          <h3>FREEBREAD</h3>
          <p>Save $5.00 flat when ordering Garlic Sourdough Breadsticks or Cheese-Stuffed Pull-Apart!</p>
          <div class="promo-code" (click)="copyCode('FREEBREAD')">
            Code: <span>FREEBREAD</span>
          </div>
        </div>

        <div class="promo-card glass-card">
          <div class="promo-icon">🎁</div>
          <h3>WELCOME10</h3>
          <p>New customer? Benefit from a 10% overall order value coupon for your initial cart checkout.</p>
          <div class="promo-code" (click)="copyCode('WELCOME10')">
            Code: <span>WELCOME10</span>
          </div>
        </div>
      </div>

      <!-- BRAND SPOTLIGHT -->
      <h2 class="section-title">Brand Spotlight</h2>
      <div class="brands-grid">
        <div class="brand-card glass-panel">
          <div class="brand-header">
            <h3>Tuscan Oven</h3>
            <span class="brand-tag">Pizzas & Lemonades</span>
          </div>
          <p>Famous for Neapolitan-style wood-fired pizzas, baked at 900°F with imported San Marzano sauce and hand-crafted bubbly crusts.</p>
        </div>

        <div class="brand-card glass-panel">
          <div class="brand-header">
            <h3>Artisan Bakers</h3>
            <span class="brand-tag">Sourdough & Breads</span>
          </div>
          <p>Slow-fermented artisan sourdough breads, stuffed with premium cream cheeses and glazed with real fresh herb garlic butter blends.</p>
        </div>

        <div class="brand-card glass-panel">
          <div class="brand-header">
            <h3>Bistro Express</h3>
            <span class="brand-tag">Cold Brews & Beverages</span>
          </div>
          <p>Hand-crafted chilled beverages, triple-filtered cold brews and cane sugar sodas formulated for optimal meal pairing.</p>
        </div>
      </div>

      <!-- PLATFORM HIGHLIGHTS -->
      <div class="platform-info glass-card">
        <div class="info-grid">
          <div class="info-item">
            <h4>⚡ Rapid Updates</h4>
            <p>Our backend relies on thread-safe stock deduction and database transactions to avoid race conditions during hot pizza sales.</p>
          </div>
          <div class="info-item">
            <h4>🔒 Secure APIs</h4>
            <p>JWT-secured connections, role-based resource permissions, and a high-performance token-bucket rate limiter.</p>
          </div>
          <div class="info-item">
            <h4>📩 Live Notifications</h4>
            <p>Order placement triggers instant HTML receipt generation, which you can preview inside our simulated mailbox dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      gap: 40px;
      animation: fadeIn 0.5s ease;
    }

    .hero-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 50px;
      gap: 40px;
    }

    .hero-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
      max-width: 650px;
    }

    .hero-text h1 {
      font-size: 42px;
      line-height: 1.2;
      color: var(--text-primary);
    }

    .hero-text h1 span {
      color: var(--accent);
      background: linear-gradient(90deg, var(--accent) 0%, #fbbf24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-text p {
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .welcome-user-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.05);
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid var(--border-glass);
      font-size: 14px;
    }

    .loyalty-pill {
      background: rgba(245, 158, 11, 0.15);
      color: var(--accent);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 2px 10px;
      border-radius: 12px;
      font-weight: 600;
      margin-left: 5px;
    }

    .hero-graphic {
      flex: 0 0 200px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .pizza-icon-glow {
      font-size: 120px;
      filter: drop-shadow(0 0 30px rgba(245, 158, 11, 0.35));
      animation: float 4s ease-in-out infinite;
    }

    .section-title {
      font-size: 24px;
      border-bottom: 2px solid var(--border-glass);
      padding-bottom: 10px;
      color: var(--text-primary);
    }

    .promotions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .promo-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: center;
      padding: 30px;
    }

    .promo-icon {
      font-size: 36px;
    }

    .promo-card h3 {
      font-size: 20px;
      color: var(--accent);
    }

    .promo-card p {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
      flex-grow: 1;
    }

    .promo-code {
      background: rgba(11, 11, 14, 0.8);
      border: 1px dashed var(--border-glass);
      padding: 10px;
      border-radius: 8px;
      cursor: pointer;
      font-family: monospace;
      font-size: 14px;
      transition: var(--transition-smooth);
    }

    .promo-code:hover {
      border-color: var(--accent);
      background: rgba(245, 158, 11, 0.05);
    }

    .promo-code span {
      color: var(--accent);
      font-weight: bold;
    }

    .brands-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .brand-card {
      padding: 30px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .brand-tag {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-glass);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .brand-card p {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .platform-info {
      padding: 40px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .info-item h4 {
      font-size: 16px;
      margin-bottom: 10px;
      color: var(--text-primary);
    }

    .info-item p {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    @keyframes float {
      0% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(5deg); }
      100% { transform: translateY(0px) rotate(0deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .hero-banner {
        flex-direction: column;
        padding: 30px;
      }
      .hero-graphic {
        flex: 1;
      }
      .pizza-icon-glow {
        font-size: 80px;
      }
    }
  `]
})
export class HomeComponent {
  constructor(public authService: AuthService) {}

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied to clipboard!`);
  }
}
