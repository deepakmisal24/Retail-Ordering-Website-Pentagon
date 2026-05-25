import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

interface OrderHistoryItem {
  id: number;
  orderDate: string;
  subTotal: number;
  discountAmount: number;
  loyaltyDiscount: number;
  totalAmount: number;
  orderStatus: string;
  couponCode: string;
  redeemedLoyaltyPoints: number;
  earnedLoyaltyPoints: number;
  shippingAddress: string;
  packagingName: string;
  packagingPrice: number;
  orderItems: {
    id: number;
    productId: number;
    productName: string;
    productCategory: string;
    selectedSize: string;
    selectedToppings: string;
    quantity: number;
    unitPrice: number;
  }[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="orders-container">
      <div class="orders-header">
        <h1>Your Order <span>History</span></h1>
        <p>Review past gourmet receipts and perform instant one-click quick reordering.</p>
      </div>

      <!-- LOADING STATE -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Retrieving your order logs...</p>
      </div>

      <!-- EMPTY STATE -->
      <div *ngIf="!loading && orders.length === 0" class="empty-state glass-panel">
        <div class="empty-icon">🍕</div>
        <h3>No Orders Yet</h3>
        <p>You haven't ordered any delicious pizzas, beverages, or breads yet.</p>
        <a routerLink="/menu" class="btn-premium glow-btn">Browse Our Menu</a>
      </div>

      <!-- ORDERS LIST -->
      <div *ngIf="!loading && orders.length > 0" class="orders-list">
        <div *ngFor="let order of orders" class="glass-panel order-card">
          <!-- CARD HEADER -->
          <div class="card-header-row">
            <div class="order-id-date">
              <h3>Receipt #{{ order.id }}</h3>
              <span class="order-date">{{ formatDate(order.orderDate) }}</span>
            </div>
            
            <div class="status-reorder">
              <span class="badge-premium" [ngClass]="getStatusBadgeClass(order.orderStatus)">
                {{ order.orderStatus }}
              </span>
              
              <button 
                class="btn-premium-outline reorder-btn" 
                (click)="performQuickReorder(order)"
                [disabled]="reorderingId === order.id"
              >
                <span *ngIf="reorderingId !== order.id">🔄 Quick Reorder</span>
                <span *ngIf="reorderingId === order.id">Reordering...</span>
              </button>
            </div>
          </div>

          <!-- CARD BODY: PRODUCTS -->
          <div class="order-items-table">
            <div *ngFor="let item of order.orderItems" class="order-item-row">
              <span class="item-emoji">{{ getEmoji(item.productCategory) }}</span>
              <div class="item-details">
                <strong>{{ item.productName }}</strong>
                <p>Size: {{ item.selectedSize }} | Toppings: {{ item.selectedToppings || 'None' }}</p>
              </div>
              <div class="item-qty-cost">
                <span>{{ item.quantity }}x</span>
                <strong>₹{{ (item.unitPrice * item.quantity).toFixed(2) }}</strong>
              </div>
            </div>
          </div>

          <!-- CARD FOOTER: BREAKDOWN & DELIVERY -->
          <div class="order-footer-details">
            <div class="delivery-details">
              <span>📍 <strong>Deliver To:</strong> {{ order.shippingAddress }}</span>
              <span>📦 <strong>Packaging:</strong> {{ order.packagingName }} (₹{{ order.packagingPrice.toFixed(2) }})</span>
            </div>

            <div class="pricing-breakdown">
              <div class="price-row" *ngIf="order.discountAmount > 0">
                <span>Coupon:</span>
                <span class="text-success">-₹{{ order.discountAmount.toFixed(2) }} ({{ order.couponCode }})</span>
              </div>
              <div class="price-row" *ngIf="order.loyaltyDiscount > 0">
                <span>Points Used:</span>
                <span class="text-success">-₹{{ order.loyaltyDiscount.toFixed(2) }}</span>
              </div>
              <div class="price-row grand-row">
                <span>Total Paid:</span>
                <strong class="text-accent">₹{{ order.totalAmount.toFixed(2) }}</strong>
              </div>
              <div class="points-row">
                🪙 Earned: <strong>+{{ order.earnedLoyaltyPoints }}</strong> | Redeemed: <strong>{{ order.redeemedLoyaltyPoints }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      display: flex;
      flex-direction: column;
      gap: 35px;
      animation: fadeIn 0.4s ease;
    }

    .orders-header {
      text-align: center;
    }

    .orders-header h1 span {
      color: var(--accent);
      background: linear-gradient(90deg, var(--accent) 0%, #fbbf24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .orders-header p {
      color: var(--text-secondary);
      margin-top: 10px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      gap: 20px;
    }

    .spinner {
      border: 4px solid rgba(255,255,255,0.05);
      border-left: 4px solid var(--accent);
      border-radius: 50%;
      width: 45px;
      height: 45px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      padding: 50px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      max-width: 500px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 60px;
      filter: drop-shadow(0 0 15px var(--accent-glow));
    }

    .empty-state h3 {
      font-size: 20px;
      color: var(--text-primary);
    }

    .empty-state p {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 10px;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .order-card {
      padding: 25px 30px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: var(--transition-smooth);
    }

    .order-card:hover {
      border-color: rgba(245, 158, 11, 0.15);
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--border-glass);
      padding-bottom: 15px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .order-id-date h3 {
      font-size: 19px;
      color: var(--text-primary);
    }

    .order-date {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
      display: block;
    }

    .status-reorder {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .reorder-btn {
      padding: 8px 16px;
      font-size: 13px;
      border-radius: 8px;
    }

    .order-items-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .order-item-row {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px 15px;
      background: rgba(255,255,255,0.01);
      border: 1px solid rgba(255,255,255,0.03);
      border-radius: 10px;
    }

    .item-emoji {
      font-size: 28px;
    }

    .item-details {
      flex-grow: 1;
    }

    .item-details strong {
      font-size: 14.5px;
      color: var(--text-primary);
    }

    .item-details p {
      font-size: 11.5px;
      color: var(--text-secondary);
      margin-top: 3px;
    }

    .item-qty-cost {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .item-qty-cost span {
      font-size: 12px;
      color: var(--text-muted);
    }

    .item-qty-cost strong {
      font-size: 15px;
      color: var(--text-primary);
    }

    .order-footer-details {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid rgba(255,255,255,0.04);
      padding-top: 15px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .delivery-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .pricing-breakdown {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-end;
      min-width: 200px;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .grand-row {
      font-size: 16px;
      border-top: 1px dashed rgba(255,255,255,0.1);
      padding-top: 6px;
      margin-top: 2px;
    }

    .text-success {
      color: var(--success);
    }

    .text-accent {
      color: var(--accent);
    }

    .points-row {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 5px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: OrderHistoryItem[] = [];
  loading = true;
  reorderingId: number | null = null;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.fetchOrderHistory();
  }

  fetchOrderHistory() {
    this.loading = true;
    this.http.get<OrderHistoryItem[]>('http://localhost:5000/api/orders/my-history').subscribe({
      next: (data) => {
        // Sort orders descending by ID (newest first)
        this.orders = data.sort((a, b) => b.id - a.id);
        this.loading = false;
      },
      error: () => {
        this.toastService.showDanger('Could not load order history.');
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'preparing': return 'badge-preparing';
      case 'delivery': return 'badge-delivery';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-pending';
    }
  }

  getEmoji(category: string): string {
    switch (category.toLowerCase()) {
      case 'pizza': return '🍕';
      case 'breads': return '🥖';
      case 'cold drinks': return '🥤';
      default: return '🍔';
    }
  }

  performQuickReorder(order: OrderHistoryItem) {
    this.reorderingId = order.id;
    this.toastService.showInfo(`Initiating quick reorder for receipt #${order.id}...`);

    // Call the backend endpoint to reuse past order details automatically
    const url = `http://localhost:5000/api/orders/reorder/${order.id}`;

    this.http.post<any>(url, {}).subscribe({
      next: (res) => {
        this.reorderingId = null;
        this.toastService.showSuccess(`Instant reorder placed! New Receipt #${res.id}`);
        this.fetchOrderHistory(); // Refresh history list
        this.authService.refreshProfile().subscribe(); // Refresh loyalty points
      },
      error: (err) => {
        this.reorderingId = null;
        this.toastService.showDanger(err.error?.message || 'Quick reorder failed. Check item availability.');
      }
    });
  }
}
