import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService, CartItem } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>Secure <span>Checkout</span></h1>
        <p>Complete your culinary order securely with our JWT-protected API.</p>
      </div>

      <div class="checkout-layout">
        <!-- LEFT: SHIPPING FORM -->
        <div class="checkout-form-container glass-panel">
          <h2>1. Shipping Details</h2>
          <form #checkoutForm="ngForm" class="shipping-form">
            <div class="form-input-group">
              <label class="form-input-label" for="street">Street Address</label>
              <input 
                type="text" 
                id="street" 
                name="street" 
                class="form-input" 
                placeholder="e.g. 123 Artisan Wood Way"
                [(ngModel)]="street" 
                required
                #streetInput="ngModel"
              >
              <div *ngIf="streetInput.invalid && streetInput.touched" class="error-msg">
                Street address is required.
              </div>
            </div>

            <div class="form-row">
              <div class="form-input-group flex-1">
                <label class="form-input-label" for="city">City</label>
                <input 
                  type="text" 
                  id="city" 
                  name="city" 
                  class="form-input" 
                  placeholder="e.g. Flavor Town"
                  [(ngModel)]="city" 
                  required
                  #cityInput="ngModel"
                >
                <div *ngIf="cityInput.invalid && cityInput.touched" class="error-msg">
                  City is required.
                </div>
              </div>

              <div class="form-input-group flex-1">
                <label class="form-input-label" for="zip">Zip / Postal Code</label>
                <input 
                  type="text" 
                  id="zip" 
                  name="zip" 
                  class="form-input" 
                  placeholder="e.g. 90210"
                  [(ngModel)]="zipCode" 
                  required
                  #zipInput="ngModel"
                >
                <div *ngIf="zipInput.invalid && zipInput.touched" class="error-msg">
                  Zip code is required.
                </div>
              </div>
            </div>
          </form>

          <h2 class="section-divider">2. Delivery Packaging Choice</h2>
          <div class="packaging-selector">
            <label *ngFor="let pkg of packagingOptions" class="packaging-card glass-card" [class.selected]="selectedPackaging.name === pkg.name">
              <input 
                type="radio" 
                name="deliveryPackaging" 
                [value]="pkg" 
                [checked]="selectedPackaging.name === pkg.name"
                (change)="setPackaging(pkg)"
              >
              <div class="pkg-details">
                <strong>{{ pkg.name }}</strong>
                <p>{{ pkg.description }}</p>
              </div>
              <span class="price-pill">{{ pkg.price === 0 ? 'Free' : '+\$' + pkg.price.toFixed(2) }}</span>
            </label>
          </div>

          <h2 class="section-divider">3. Promotion & Loyalty Points</h2>
          <div class="promo-loyalty-panel">
            <div class="coupon-input-group">
              <label class="form-input-label">Have a Coupon?</label>
              <div class="coupon-row">
                <input 
                  type="text" 
                  class="form-input coupon-input" 
                  placeholder="e.g. PIZZA20"
                  [(ngModel)]="couponCode"
                  [disabled]="couponApplied"
                >
                <button 
                  type="button" 
                  class="btn-premium-outline"
                  (click)="applyCoupon()"
                  *ngIf="!couponApplied"
                >
                  Apply
                </button>
                <button 
                  type="button" 
                  class="btn-premium-danger btn-clear"
                  (click)="clearCoupon()"
                  *ngIf="couponApplied"
                >
                  Remove
                </button>
              </div>
              <div class="coupon-feedback success" *ngIf="couponApplied">
                ✓ Coupon "{{ appliedCouponCode }}" validated!
              </div>
            </div>

            <div class="loyalty-checkbox-group glass-card" *ngIf="(authService.customer$ | async) as customer">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="redeemPoints"
                  [disabled]="customer.loyaltyPoints <= 0"
                >
                <div class="loyalty-label-text">
                  <strong>Redeem Loyalty Points</strong>
                  <p>You have {{ customer.loyaltyPoints }} points. Use them to save up to \${{ (customer.loyaltyPoints / 100).toFixed(2) }}!</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- RIGHT: RECEIPT / BASKET BREAKDOWN -->
        <div class="checkout-receipt-container glass-panel">
          <h2>Order Receipt</h2>
          
          <div class="receipt-items">
            <div *ngFor="let item of cartItems" class="receipt-item">
              <div class="item-meta">
                <span class="item-name">{{ item.product.name }}</span>
                <span class="item-custom">Size: {{ item.selectedSize }} | Toppings: {{ item.selectedToppings }}</span>
              </div>
              <div class="item-pricing">
                <span class="item-qty">{{ item.quantity }}x</span>
                <span class="item-cost">\${{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="receipt-calculations">
            <div class="calc-row">
              <span>Cart Subtotal</span>
              <span>\${{ subtotal.toFixed(2) }}</span>
            </div>

            <div class="calc-row text-success" *ngIf="couponApplied">
              <span>Coupon Discount ({{ appliedCouponCode }})</span>
              <span>-\${{ couponDiscountAmount.toFixed(2) }}</span>
            </div>

            <div class="calc-row text-success" *ngIf="redeemPoints">
              <span>Loyalty Points Discount</span>
              <span>-\${{ loyaltyPointsDiscount.toFixed(2) }}</span>
            </div>

            <div class="calc-row">
              <span>Delivery Packaging ({{ selectedPackaging.name }})</span>
              <span>\${{ packagingCost.toFixed(2) }}</span>
            </div>

            <div class="calc-divider"></div>

            <div class="calc-row grand-total">
              <span>Grand Total</span>
              <span>\${{ grandTotal.toFixed(2) }}</span>
            </div>

            <div class="points-accrual">
              🪙 Placing this order earns you **{{ Math.floor(grandTotal) * 10 }}** loyalty points!
            </div>
          </div>

          <button 
            type="button" 
            class="btn-premium checkout-submit-btn glow-btn"
            [disabled]="checkoutForm.invalid || cartItems.length === 0 || checkingOut"
            (click)="submitOrder()"
          >
            <span *ngIf="!checkingOut">Secure Checkout & Buy</span>
            <span *ngIf="checkingOut">Processing payment...</span>
          </button>

          <a routerLink="/menu" class="continue-shopping">
            ← Continue Shopping
          </a>
        </div>
      </div>

      <!-- SUCCESS RECEIPT POPUP MODAL -->
      <div *ngIf="successModal" class="modal-overlay">
        <div class="modal-content-premium success-receipt glass-panel">
          <div class="modal-header-premium text-center-header">
            <h2>🎉 Checkout Successful!</h2>
            <p>Your order has been queued in our high-performance inventory system.</p>
          </div>

          <div class="modal-body-premium text-center-body">
            <div class="success-icon-badge">✓</div>
            <h3>Receipt #{{ createdOrder?.id }}</h3>
            <p class="text-secondary">A custom HTML email confirmation was dynamically dispatched to <strong>{{ (authService.customer$ | async)?.email }}</strong>.</p>
            
            <div class="loyalty-alert">
              🪙 You earned <strong>{{ createdOrder?.earnedLoyaltyPoints }}</strong> loyalty points on this order!
            </div>

            <div class="receipt-summary-box glass-card">
              <div class="receipt-row">
                <span>Items:</span>
                <strong>{{ createdOrder?.orderItems?.length }} products</strong>
              </div>
              <div class="receipt-row">
                <span>Shipping:</span>
                <strong>{{ createdOrder?.shippingAddress?.street }}, {{ createdOrder?.shippingAddress?.city }}</strong>
              </div>
              <div class="receipt-row">
                <span>Total Paid:</span>
                <strong>\${{ createdOrder?.totalAmount?.toFixed(2) }}</strong>
              </div>
            </div>
          </div>

          <div class="modal-footer-premium footer-center">
            <button class="btn-premium" (click)="dismissSuccess()">View Order History</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      display: flex;
      flex-direction: column;
      gap: 35px;
      animation: fadeIn 0.4s ease;
    }

    .checkout-header {
      text-align: center;
    }

    .checkout-header h1 span {
      color: var(--accent);
      background: linear-gradient(90deg, var(--accent) 0%, #fbbf24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .checkout-header p {
      color: var(--text-secondary);
      margin-top: 10px;
    }

    .checkout-layout {
      display: flex;
      gap: 30px;
      align-items: flex-start;
    }

    .checkout-form-container {
      flex: 1.3;
      padding: 30px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .checkout-form-container h2 {
      font-size: 18px;
      color: var(--text-primary);
      border-left: 3px solid var(--accent);
      padding-left: 10px;
      margin-bottom: 15px;
    }

    .section-divider {
      margin-top: 20px;
    }

    .shipping-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-row {
      display: flex;
      gap: 15px;
    }

    .flex-1 {
      flex: 1;
    }

    .error-msg {
      color: var(--danger);
      font-size: 12px;
      margin-top: 5px;
    }

    .packaging-selector {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .packaging-card {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px 18px;
      cursor: pointer;
      border: 1px solid var(--border-glass);
      transition: var(--transition-smooth);
      background: rgba(255,255,255,0.01);
    }

    .packaging-card:hover {
      background: rgba(255,255,255,0.03);
    }

    .packaging-card.selected {
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.04);
    }

    .packaging-card input {
      accent-color: var(--accent);
    }

    .pkg-details {
      flex-grow: 1;
    }

    .pkg-details strong {
      font-size: 14px;
      color: var(--text-primary);
    }

    .pkg-details p {
      font-size: 11px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .price-pill {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
    }

    .promo-loyalty-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .coupon-row {
      display: flex;
      gap: 10px;
    }

    .coupon-input {
      text-transform: uppercase;
      font-family: monospace;
      font-size: 16px;
      letter-spacing: 0.05em;
    }

    .coupon-feedback {
      font-size: 13px;
      font-weight: 600;
      margin-top: 5px;
    }

    .coupon-feedback.success {
      color: var(--success);
    }

    .btn-clear {
      padding: 11px 20px;
    }

    .loyalty-checkbox-group {
      padding: 15px 20px;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      cursor: pointer;
    }

    .checkbox-label input {
      margin-top: 4px;
      accent-color: var(--accent);
      width: 18px;
      height: 18px;
    }

    .loyalty-label-text strong {
      font-size: 14px;
      color: var(--text-primary);
    }

    .loyalty-label-text p {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 3px;
    }

    /* RIGHT SIDE RECEIPT */
    .checkout-receipt-container {
      flex: 0.9;
      padding: 30px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: sticky;
      top: 90px;
    }

    .receipt-items {
      display: flex;
      flex-direction: column;
      gap: 15px;
      max-height: 250px;
      overflow-y: auto;
      border-bottom: 1px solid var(--border-glass);
      padding-bottom: 15px;
    }

    .receipt-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
      font-size: 14px;
    }

    .item-meta {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .item-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .item-custom {
      font-size: 11px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .item-pricing {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .item-qty {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .item-cost {
      font-weight: 700;
      color: var(--text-primary);
    }

    .receipt-calculations {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .calc-divider {
      border-top: 1px dashed var(--border-glass);
      margin: 5px 0;
    }

    .grand-total {
      font-size: 19px;
      font-weight: 700;
      color: var(--accent);
    }

    .text-success {
      color: var(--success) !important;
    }

    .points-accrual {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-glass);
      padding: 10px 15px;
      border-radius: 8px;
      font-size: 12.5px;
      text-align: center;
      color: var(--text-secondary);
    }

    .checkout-submit-btn {
      width: 100%;
      padding: 15px 0;
      font-size: 16px;
    }

    .continue-shopping {
      text-align: center;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13.5px;
      margin-top: 5px;
      transition: var(--transition-smooth);
    }

    .continue-shopping:hover {
      color: var(--accent);
    }

    /* SUCCESS POPUP DETAILS */
    .text-center-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
    }

    .text-center-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .success-icon-badge {
      font-size: 40px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid var(--success);
      color: var(--success);
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 15px var(--success-glow));
    }

    .loyalty-alert {
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.2);
      padding: 10px 20px;
      border-radius: 10px;
      color: var(--accent);
      font-size: 14px;
      font-weight: 500;
    }

    .receipt-summary-box {
      width: 100%;
      padding: 15px 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
    }

    .receipt-row span {
      color: var(--text-secondary);
    }

    .receipt-row strong {
      color: var(--text-primary);
    }

    .footer-center {
      justify-content: center !important;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 992px) {
      .checkout-layout {
        flex-direction: column;
      }
      .checkout-receipt-container {
        position: static;
        width: 100%;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal = 0;
  packagingCost = 0;
  checkingOut = false;

  street = '';
  city = '';
  zipCode = '';

  couponCode = '';
  couponApplied = false;
  appliedCouponCode = '';
  couponDiscountAmount = 0;

  redeemPoints = false;
  successModal = false;
  createdOrder: any = null;

  packagingOptions = [
    { name: 'Eco-Friendly Box', price: 0, description: '100% recyclable classic corrugated container' },
    { name: 'Premium Insulated Bag', price: 2.50, description: 'High-performance thermal foil layer to keep it piping hot' },
    { name: 'Wood-Texture Tray', price: 1.50, description: 'Premium presentation tray, elegant for dinner guests' }
  ];

  selectedPackaging = this.packagingOptions[0];

  Math = Math;

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private toastService: ToastService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });

    // Auto-select packaging from first cart item if it exists
    if (this.cartItems.length > 0) {
      const match = this.packagingOptions.find(o => o.name === this.cartItems[0].selectedPackagingName);
      if (match) {
        this.selectedPackaging = match;
      }
    }

    // Attempt to load customer's past address if possible (from local profile)
    this.authService.refreshProfile().subscribe({
      next: () => {
        // Handled silently
      }
    });
  }

  setPackaging(pkg: any) {
    this.selectedPackaging = pkg;
    this.calculateTotals();
  }

  calculateTotals() {
    this.subtotal = this.cartService.getSubtotal();
    this.packagingCost = this.selectedPackaging.price * this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
    this.evaluateCouponDiscount();
  }

  applyCoupon() {
    if (!this.couponCode) return;
    const code = this.couponCode.trim().toUpperCase();

    // In Clean Architecture, the coupons are stored in SQLite and evaluated by the PlaceOrderCommandHandler.
    // However, to offer a premium, interactive checkout, we can perform a quick local check of coupons.
    if (code === 'PIZZA20') {
      this.couponApplied = true;
      this.appliedCouponCode = 'PIZZA20';
      this.toastService.showSuccess('20% Pizza discount applied to subtotal!');
    } else if (code === 'FREEBREAD') {
      this.couponApplied = true;
      this.appliedCouponCode = 'FREEBREAD';
      this.toastService.showSuccess('$5.00 Flat bread discount applied to subtotal!');
    } else if (code === 'WELCOME10') {
      this.couponApplied = true;
      this.appliedCouponCode = 'WELCOME10';
      this.toastService.showSuccess('10% Welcome coupon applied to subtotal!');
    } else {
      this.toastService.showDanger('Invalid promotion code. Try "PIZZA20" or "FREEBREAD"!');
      return;
    }

    this.calculateTotals();
  }

  clearCoupon() {
    this.couponApplied = false;
    this.appliedCouponCode = '';
    this.couponCode = '';
    this.couponDiscountAmount = 0;
    this.calculateTotals();
    this.toastService.showInfo('Promo coupon removed.');
  }

  evaluateCouponDiscount() {
    this.couponDiscountAmount = 0;
    if (!this.couponApplied) return;

    if (this.appliedCouponCode === 'PIZZA20') {
      // 20% discount on pizzas
      const pizzaSubtotal = this.cartItems
        .filter(i => i.product.category.toLowerCase() === 'pizza')
        .reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
      this.couponDiscountAmount = pizzaSubtotal * 0.2;
    } else if (this.appliedCouponCode === 'FREEBREAD') {
      // $5.00 flat discount
      this.couponDiscountAmount = Math.min(this.subtotal, 5.00);
    } else if (this.appliedCouponCode === 'WELCOME10') {
      // 10% discount on subtotal
      this.couponDiscountAmount = this.subtotal * 0.1;
    }
  }

  get loyaltyPointsDiscount(): number {
    if (!this.redeemPoints) return 0;
    
    // 100 points = $1.00. Points can discount subtotal minus coupon
    const maxRemaining = this.subtotal - this.couponDiscountAmount;
    if (maxRemaining <= 0) return 0;

    let pointsAvailable = 0;
    this.authService.customer$.subscribe(c => pointsAvailable = c?.loyaltyPoints || 0).unsubscribe();

    const maxDiscountAllowed = maxRemaining;
    const discountFromPoints = Math.round(pointsAvailable / 100 * 100) / 100;
    return Math.min(discountFromPoints, maxDiscountAllowed);
  }

  get grandTotal(): number {
    const calculated = (this.subtotal - this.couponDiscountAmount - this.loyaltyPointsDiscount) + this.packagingCost;
    return Math.max(0, calculated);
  }

  submitOrder() {
    if (this.cartItems.length === 0) return;
    this.checkingOut = true;

    // Build the request body for PlaceOrderCommand
    const command = {
      customerId: 0, // Injected by controller backend
      items: this.cartItems.map(i => ({
        productId: i.product.id,
        selectedSize: i.selectedSize,
        selectedToppings: i.selectedToppings,
        quantity: i.quantity
      })),
      couponCode: this.couponApplied ? this.appliedCouponCode : '',
      redeemLoyaltyPoints: this.redeemPoints,
      street: this.street,
      city: this.city,
      zipCode: this.zipCode,
      packagingName: this.selectedPackaging.name,
      packagingPrice: this.selectedPackaging.price,
      packagingDescription: this.selectedPackaging.description
    };

    this.http.post<any>('http://localhost:5000/api/orders/checkout', command).subscribe({
      next: (res) => {
        this.checkingOut = false;
        this.createdOrder = res;
        this.successModal = true;
        this.cartService.clearCart();
        this.toastService.showSuccess('Order successfully completed!');
        
        // Refresh customer profile to display accurate points
        this.authService.refreshProfile().subscribe();
      },
      error: (err) => {
        this.checkingOut = false;
        this.toastService.showDanger(err.error?.message || 'Check out failed. Please review quantities.');
      }
    });
  }

  dismissSuccess() {
    this.successModal = false;
    this.router.navigate(['/orders']);
  }
}
