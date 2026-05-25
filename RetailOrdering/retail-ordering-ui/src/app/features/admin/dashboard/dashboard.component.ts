import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';

interface AdminOrder {
  id: number;
  customerUsername: string;
  customerEmail: string;
  orderDate: string;
  subTotal: number;
  discountAmount: number;
  loyaltyDiscount: number;
  totalAmount: number;
  orderStatus: string;
  shippingAddressStreet: string;
  shippingAddressCity: string;
  shippingAddressZipCode: string;
  selectedPackagingName: string;
  orderItems: {
    productName: string;
    selectedSize: string;
    selectedToppings: string;
    quantity: number;
  }[];
}

interface InventoryProduct {
  productId: number;
  name: string;
  category: string;
  brand: string;
  availableStock: number;
  lowStockThreshold: number;
  isStockLow: boolean;
}

interface SimulatedEmail {
  id: number;
  orderId: number;
  recipientEmail: string;
  subject: string;
  htmlBody: string;
  sentAt: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <h1>Admin Operations <span>Control Panel</span></h1>
        <p>Manage order pipeline status, replenish hot stock levels, and inspect simulated dispatch logs.</p>
      </div>

      <!-- DASHBOARD TABS -->
      <div class="admin-tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'orders'"
          (click)="selectTab('orders')"
        >
          📦 Active Orders ({{ orders.length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'inventory'"
          (click)="selectTab('inventory')"
        >
          📊 Stock Inventory
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'emails'"
          (click)="selectTab('emails')"
        >
          📬 Email Dispatch Box ({{ simulatedEmails.length }})
        </button>
      </div>

      <!-- TABS CONTENTS -->
      <!-- TAB 1: ACTIVE ORDERS -->
      <div *ngIf="activeTab === 'orders'" class="tab-content">
        <div *ngIf="loadingOrders" class="loading-state">
          <div class="spinner"></div>
          <p>Retrieving platform orders...</p>
        </div>

        <div *ngIf="!loadingOrders && orders.length === 0" class="empty-state glass-card">
          <p>No orders have been submitted yet. Go order some pizzas!</p>
        </div>

        <div *ngIf="!loadingOrders && orders.length > 0" class="orders-table-wrapper glass-panel">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>User / Date</th>
                <th>Gourmet Items</th>
                <th>Address & Packaging</th>
                <th>Total Paid</th>
                <th>Status Pipeline Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of orders" [class.new-order]="o.orderStatus === 'Preparing'">
                <td>
                  <strong class="text-accent">#{{ o.id }}</strong>
                </td>
                <td>
                  <div class="user-meta">
                    <strong>{{ o.customerUsername }}</strong>
                    <span class="text-muted">{{ o.customerEmail }}</span>
                    <span class="date-tag">{{ formatDate(o.orderDate) }}</span>
                  </div>
                </td>
                <td>
                  <div class="item-list-admin">
                    <div *ngFor="let item of o.orderItems" class="item-pill">
                      {{ item.quantity }}x {{ item.productName }} ({{ item.selectedSize }})
                      <span *ngIf="item.selectedToppings && item.selectedToppings !== 'None'" class="topping-subtext">
                        + {{ item.selectedToppings }}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="address-pkg">
                    <span>📍 {{ o.shippingAddressStreet }}, {{ o.shippingAddressCity }}</span>
                    <span class="pkg-badge">📦 {{ o.selectedPackagingName }}</span>
                  </div>
                </td>
                <td>
                  <strong class="total-tag">\${{ o.totalAmount.toFixed(2) }}</strong>
                </td>
                <td>
                  <div class="status-action-row">
                    <span class="badge-premium" [ngClass]="getStatusBadgeClass(o.orderStatus)">
                      {{ o.orderStatus }}
                    </span>
                    <select 
                      class="form-input status-select" 
                      [ngModel]="o.orderStatus"
                      (change)="updateOrderStatus(o.id, $any($event.target).value)"
                    >
                      <option value="Preparing">Preparing</option>
                      <option value="Delivery">Out For Delivery</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: STOCK INVENTORY -->
      <div *ngIf="activeTab === 'inventory'" class="tab-content">
        <div *ngIf="loadingInventory" class="loading-state">
          <div class="spinner"></div>
          <p>Retrieving database stock status...</p>
        </div>

        <div *ngIf="!loadingInventory" class="inventory-grid">
          <div *ngFor="let p of inventory" class="glass-card stock-card" [class.low-stock]="p.isStockLow">
            <div class="stock-header-row">
              <h3>{{ p.name }}</h3>
              <span class="category-badge">{{ p.category }}</span>
            </div>
            
            <div class="stock-stats">
              <div class="stat-box">
                <span class="stat-label">Available Stock</span>
                <span class="stat-value" [class.alert-text]="p.isStockLow">{{ p.availableStock }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Low Warning Threshold</span>
                <span class="stat-value">{{ p.lowStockThreshold }}</span>
              </div>
            </div>

            <div class="stock-alert-msg" *ngIf="p.isStockLow">
              ⚠️ Warning: Low Stock Alert! Restock immediately to prevent checkout disruptions.
            </div>

            <!-- ADJUSTMENT FORM -->
            <div class="stock-form">
              <div class="form-row">
                <div class="form-input-group flex-1">
                  <label class="form-input-label">Update Stock</label>
                  <input type="number" class="form-input" [(ngModel)]="p.availableStock" min="0">
                </div>
                <div class="form-input-group flex-1">
                  <label class="form-input-label">Threshold</label>
                  <input type="number" class="form-input" [(ngModel)]="p.lowStockThreshold" min="0">
                </div>
              </div>
              <button 
                class="btn-premium btn-sm-block" 
                (click)="saveStockAdjustment(p)"
              >
                💾 Save Adjustments
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: simulated EMAIL LOGGER -->
      <div *ngIf="activeTab === 'emails'" class="tab-content">
        <div class="email-layout">
          <!-- EMAIL LIST (LEFT) -->
          <div class="email-list-panel glass-panel">
            <h2>Simulated Mailbox Drawer</h2>
            <div class="email-list-container">
              <div 
                *ngFor="let mail of simulatedEmails" 
                class="email-row glass-card"
                [class.active]="selectedEmail?.id === mail.id"
                (click)="selectedEmail = mail"
              >
                <div class="mail-header-meta">
                  <strong>To: {{ mail.recipientEmail }}</strong>
                  <span>{{ formatDate(mail.sentAt) }}</span>
                </div>
                <span class="mail-subj">{{ mail.subject }}</span>
                <span class="mail-ref">Order Receipt Reference: #{{ mail.orderId }}</span>
              </div>

              <div *ngIf="simulatedEmails.length === 0" class="empty-state">
                <p>No receipt emails have been logged yet.</p>
              </div>
            </div>
          </div>

          <!-- EMAIL PREVIEW (RIGHT) -->
          <div class="email-preview-panel glass-panel">
            <h2>Live HTML Confirmation Receipt Render</h2>
            
            <div *ngIf="selectedEmail" class="preview-box">
              <div class="preview-meta">
                <p><strong>From:</strong> server-daemon&#64;pizzeria.com (Simulated)</p>
                <p><strong>To:</strong> {{ selectedEmail.recipientEmail }}</p>
                <p><strong>Subject:</strong> {{ selectedEmail.subject }}</p>
                <p><strong>Logged Time:</strong> {{ formatDate(selectedEmail.sentAt) }}</p>
              </div>
              <div class="preview-divider"></div>
              
              <!-- Direct styling injection for premium look -->
              <div class="email-html-wrapper" [innerHTML]="selectedEmail.htmlBody"></div>
            </div>

            <div *ngIf="!selectedEmail" class="empty-preview glass-card">
              <p>📬 Click an email receipt from the list on the left to inspect its live HTML formatting!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      flex-direction: column;
      gap: 35px;
      animation: fadeIn 0.4s ease;
    }

    .admin-header {
      text-align: center;
    }

    .admin-header h1 span {
      color: var(--accent);
      background: linear-gradient(90deg, var(--accent) 0%, #fbbf24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .admin-header p {
      color: var(--text-secondary);
      margin-top: 10px;
    }

    .admin-tabs {
      display: flex;
      gap: 12px;
      border-bottom: 1px solid var(--border-glass);
      padding-bottom: 12px;
      flex-wrap: wrap;
    }

    .tab-btn {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid transparent;
      padding: 12px 24px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: var(--transition-smooth);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tab-btn:hover {
      color: var(--text-primary);
      background: rgba(255,255,255,0.04);
    }

    .tab-btn.active {
      color: var(--accent);
      background: rgba(245, 158, 11, 0.08);
      border-color: rgba(245, 158, 11, 0.25);
    }

    .tab-content {
      animation: tabFadeIn 0.3s ease;
    }

    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
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
      padding: 40px;
      text-align: center;
      color: var(--text-secondary);
    }

    /* ACTIVE ORDERS TABLE */
    .orders-table-wrapper {
      padding: 20px;
      overflow-x: auto;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13.5px;
    }

    .admin-table th {
      padding: 12px 15px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-glass);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11.5px;
      letter-spacing: 0.05em;
    }

    .admin-table td {
      padding: 16px 15px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      vertical-align: middle;
    }

    .new-order {
      background: rgba(245, 158, 11, 0.02);
    }

    .text-accent {
      color: var(--accent);
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .user-meta strong {
      color: var(--text-primary);
    }

    .date-tag {
      font-size: 10.5px;
      color: var(--text-muted);
    }

    .item-list-admin {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-width: 250px;
    }

    .item-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-glass);
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      color: var(--text-primary);
      display: flex;
      flex-direction: column;
    }

    .topping-subtext {
      font-size: 10px;
      color: var(--accent);
      margin-top: 2px;
    }

    .address-pkg {
      display: flex;
      flex-direction: column;
      gap: 5px;
      max-width: 220px;
    }

    .pkg-badge {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .total-tag {
      font-size: 16px;
      color: var(--accent);
    }

    .status-action-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }

    .status-select {
      padding: 6px 10px;
      font-size: 12px;
      width: 140px;
      cursor: pointer;
    }

    /* INVENTORY CARDS */
    .inventory-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .stock-card {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .stock-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 10px;
    }

    .stock-header-row h3 {
      font-size: 16px;
      color: var(--text-primary);
    }

    .category-badge {
      background: rgba(255,255,255,0.05);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      color: var(--text-secondary);
      border: 1px solid var(--border-glass);
    }

    .stock-stats {
      display: flex;
      gap: 15px;
    }

    .stat-box {
      flex: 1;
      background: rgba(11, 11, 14, 0.5);
      padding: 10px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid var(--border-glass);
    }

    .stat-label {
      font-size: 10.5px;
      color: var(--text-muted);
      text-transform: uppercase;
      display: block;
      margin-bottom: 5px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .alert-text {
      color: var(--danger) !important;
      text-shadow: 0 0 10px var(--danger-glow);
    }

    .low-stock {
      border-color: rgba(239, 68, 68, 0.4);
      background: linear-gradient(180deg, var(--bg-card) 0%, rgba(239, 68, 68, 0.02) 100%);
    }

    .stock-alert-msg {
      color: var(--danger);
      font-size: 11.5px;
      font-weight: 600;
      line-height: 1.4;
    }

    .stock-form {
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-row {
      display: flex;
      gap: 10px;
    }

    .flex-1 {
      flex: 1;
    }

    .btn-sm-block {
      width: 100%;
      padding: 8px 0;
      font-size: 13px;
      border-radius: 8px;
    }

    /* EMAIL LOG VIEWER LAYOUT */
    .email-layout {
      display: flex;
      gap: 30px;
    }

    .email-list-panel {
      flex: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      height: 70vh;
    }

    .email-list-panel h2 {
      font-size: 16px;
      color: var(--text-primary);
      border-left: 3px solid var(--accent);
      padding-left: 8px;
    }

    .email-list-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      flex-grow: 1;
    }

    .email-row {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 15px;
      transition: var(--transition-smooth);
      background: rgba(255,255,255,0.01);
      border-color: var(--border-glass);
    }

    .email-row:hover {
      background: rgba(255,255,255,0.03);
    }

    .email-row.active {
      border-color: rgba(245, 158, 11, 0.4);
      background: rgba(245, 158, 11, 0.04);
    }

    .mail-header-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
    }

    .mail-subj {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .mail-ref {
      font-size: 11px;
      color: var(--accent);
    }

    .email-preview-panel {
      flex: 1.3;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      height: 70vh;
    }

    .email-preview-panel h2 {
      font-size: 16px;
      color: var(--text-primary);
      border-left: 3px solid var(--accent);
      padding-left: 8px;
    }

    .preview-box {
      background: #0d0d10;
      border: 1px solid var(--border-glass);
      border-radius: 12px;
      padding: 20px;
      overflow-y: auto;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .preview-meta {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .preview-divider {
      border-top: 1px solid rgba(255,255,255,0.05);
      margin: 5px 0;
    }

    .email-html-wrapper {
      background: #121218;
      border-radius: 8px;
      padding: 10px;
    }

    .empty-preview {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-grow: 1;
      text-align: center;
      color: var(--text-secondary);
      padding: 40px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 992px) {
      .email-layout {
        flex-direction: column;
      }
      .email-list-panel, .email-preview-panel {
        height: auto;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'orders';
  orders: AdminOrder[] = [];
  inventory: InventoryProduct[] = [];
  simulatedEmails: SimulatedEmail[] = [];
  selectedEmail: SimulatedEmail | null = null;

  loadingOrders = true;
  loadingInventory = true;

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.fetchOrders();
    this.fetchInventory();
    this.fetchSimulatedEmails();
  }

  selectTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'orders') {
      this.fetchOrders();
    } else if (tab === 'inventory') {
      this.fetchInventory();
    } else if (tab === 'emails') {
      this.fetchSimulatedEmails();
    }
  }

  fetchOrders() {
    this.loadingOrders = true;
    this.http.get<AdminOrder[]>('http://localhost:5000/api/orders/all').subscribe({
      next: (data) => {
        this.orders = data.sort((a, b) => b.id - a.id);
        this.loadingOrders = false;
      },
      error: () => {
        this.toastService.showDanger('Failed to fetch platform orders.');
        this.loadingOrders = false;
      }
    });
  }

  fetchInventory() {
    this.loadingInventory = true;
    this.http.get<InventoryProduct[]>('http://localhost:5000/api/inventory').subscribe({
      next: (data) => {
        this.inventory = data;
        this.loadingInventory = false;
      },
      error: () => {
        this.toastService.showDanger('Failed to fetch stock database.');
        this.loadingInventory = false;
      }
    });
  }

  fetchSimulatedEmails() {
    this.http.get<SimulatedEmail[]>('http://localhost:5000/api/orders/simulated-emails').subscribe({
      next: (data) => {
        this.simulatedEmails = data;
        if (data.length > 0 && !this.selectedEmail) {
          this.selectedEmail = data[0];
        }
      }
    });
  }

  updateOrderStatus(orderId: number, status: string) {
    const url = `http://localhost:5000/api/orders/${orderId}/status?status=${status}`;
    this.http.put(url, {}).subscribe({
      next: () => {
        this.toastService.showSuccess(`Receipt #${orderId} status shifted to ${status}!`);
        this.fetchOrders();
      },
      error: (err: any) => {
        this.toastService.showDanger(err.error?.message || 'Failed to shift pipeline status.');
      }
    });
  }

  saveStockAdjustment(p: InventoryProduct) {
    const payload = {
      productId: p.productId,
      availableStock: p.availableStock,
      lowStockThreshold: p.lowStockThreshold
    };

    this.http.put('http://localhost:5000/api/inventory/update', payload).subscribe({
      next: () => {
        this.toastService.showSuccess(`Stock levels successfully adjusted for ${p.name}!`);
        this.fetchInventory();
      },
      error: (err: any) => {
        this.toastService.showDanger(err.error?.message || 'Failed to adjust stock level.');
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
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
}
