import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductDto, SizeOption, ToppingOption } from '../../../core/services/product-dto';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';

interface CustomizationModal {
  isOpen: boolean;
  product: ProductDto | null;
  selectedSize: SizeOption | null;
  selectedToppings: { [toppingName: string]: boolean };
  selectedPackaging: { name: string; price: number; description: string };
  quantity: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="menu-container">
      <div class="menu-header">
        <h1>Our Hand-Crafted <span>Menu</span></h1>
        <p>Explore artisan wood-fired pizzas, stuffed pull-aparts, and fresh sparkling coolers.</p>
      </div>

      <!-- FILTER BAR -->
      <div class="filter-bar glass-panel">
        <div class="category-tabs">
          <button 
            *ngFor="let cat of categories" 
            class="tab-btn" 
            [class.active]="selectedCategory === cat"
            (click)="selectCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>

        <div class="search-and-brand">
          <select class="form-input brand-select" [(ngModel)]="selectedBrand" (change)="applyFilters()">
            <option value="All">All Brands</option>
            <option value="Tuscan Oven">Tuscan Oven</option>
            <option value="Artisan Bakers">Artisan Bakers</option>
            <option value="Bistro Express">Bistro Express</option>
          </select>
          
          <input 
            type="text" 
            class="form-input search-input" 
            placeholder="Search pizza, drinks, breads..." 
            [(ngModel)]="searchQuery"
            (keyup)="applyFilters()"
          >
        </div>
      </div>

      <!-- LOADING STATE -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Baking the menu fresh for you...</p>
      </div>

      <!-- PRODUCTS GRID -->
      <div *ngIf="!loading" class="products-grid">
        <div *ngFor="let p of filteredProducts" class="glass-card product-card" [class.low-stock]="p.isStockLow && p.availableStock > 0" [class.out-of-stock]="!p.isAvailable">
          <div class="product-badge-overlay">
            <span *ngIf="!p.isAvailable" class="badge-premium badge-danger">Out of Stock</span>
            <span *ngIf="p.isAvailable && p.isStockLow" class="badge-premium badge-pending">
              ⚠️ Only {{ p.availableStock }} left!
            </span>
          </div>

          <div class="product-icon-container">
            <span class="product-emoji">{{ getEmoji(p.category) }}</span>
          </div>

          <div class="product-details">
            <span class="product-brand">{{ p.brand }}</span>
            <h3 class="product-title">{{ p.name }}</h3>
            <p class="product-desc">{{ p.description }}</p>
            
            <div class="product-footer">
              <div class="product-price">
                <span class="price-label">Starts at</span>
                <span class="price-value">\${{ p.basePrice.toFixed(2) }}</span>
              </div>

              <button 
                class="btn-premium" 
                [disabled]="!p.isAvailable"
                (click)="openCustomization(p)"
              >
                {{ p.isAvailable ? 'Customize & Add' : 'Sold Out' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div *ngIf="!loading && filteredProducts.length === 0" class="empty-state glass-panel">
        <p>No delicious items found matching your filters. Try selecting another category or brand!</p>
      </div>

      <!-- CUSTOMIZATION MODAL -->
      <div *ngIf="modal.isOpen && modal.product" class="modal-overlay">
        <div class="modal-content-premium glass-panel">
          <div class="modal-header-premium">
            <div>
              <span class="brand-tag">{{ modal.product.brand }}</span>
              <h2>Customize {{ modal.product.name }}</h2>
            </div>
            <button class="close-btn" (click)="closeCustomization()">×</button>
          </div>

          <div class="modal-body-premium">
            <!-- SIZE SELECTION -->
            <div class="custom-section" *ngIf="modal.product.sizeOptions && modal.product.sizeOptions.length > 0">
              <h3>1. Select Size</h3>
              <div class="size-options-grid">
                <div 
                  *ngFor="let size of modal.product.sizeOptions" 
                  class="size-card"
                  [class.active]="modal.selectedSize?.Name === size.Name"
                  (click)="modal.selectedSize = size"
                >
                  <span class="size-name">{{ size.Name }}</span>
                  <span class="size-price" *ngIf="size.PriceModifier > 0">+\${{ size.PriceModifier.toFixed(2) }}</span>
                  <span class="size-price" *ngIf="size.PriceModifier === 0">Included</span>
                </div>
              </div>
            </div>

            <!-- TOPPINGS SELECTION -->
            <div class="custom-section" *ngIf="modal.product.toppingOptions && modal.product.toppingOptions.length > 0">
              <h3>2. Choose Extra Toppings</h3>
              <div class="toppings-grid">
                <label *ngFor="let topping of modal.product.toppingOptions" class="topping-label glass-card" [class.selected]="modal.selectedToppings[topping.Name]">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="modal.selectedToppings[topping.Name]"
                  >
                  <span class="topping-name">{{ topping.Name }}</span>
                  <span class="topping-price">+\${{ topping.Price.toFixed(2) }}</span>
                </label>
              </div>
            </div>

            <!-- PACKAGING OPTIONS -->
            <div class="custom-section">
              <h3>3. Eco & Premium Packaging</h3>
              <div class="packaging-options">
                <label *ngFor="let pkg of packagingOptions" class="packaging-option-row" [class.active]="modal.selectedPackaging.name === pkg.name">
                  <input 
                    type="radio" 
                    name="packaging" 
                    [value]="pkg" 
                    [checked]="modal.selectedPackaging.name === pkg.name"
                    (change)="modal.selectedPackaging = pkg"
                  >
                  <div class="pkg-info">
                    <span class="pkg-name">{{ pkg.name }}</span>
                    <span class="pkg-desc">{{ pkg.description }}</span>
                  </div>
                  <span class="pkg-price">{{ pkg.price === 0 ? 'Free' : '+\$' + pkg.price.toFixed(2) }}</span>
                </label>
              </div>
            </div>

            <!-- QUANTITY AND STOCK WARNING -->
            <div class="custom-section quantity-section">
              <h3>4. Quantity</h3>
              <div class="quantity-controller">
                <div class="qty-adjust">
                  <button type="button" class="qty-btn" (click)="adjustQty(-1)">-</button>
                  <span class="qty-display">{{ modal.quantity }}</span>
                  <button type="button" class="qty-btn" (click)="adjustQty(1)">+</button>
                </div>
                <div class="stock-info">
                  <span class="text-secondary">Available Stock:</span>
                  <strong>{{ modal.product.availableStock }} units</strong>
                </div>
              </div>
              <div *ngIf="modal.quantity > modal.product.availableStock" class="stock-error">
                ⚠️ Danger: Requested quantity exceeds active physical stock ({{ modal.product.availableStock }}).
              </div>
            </div>
          </div>

          <div class="modal-footer-premium">
            <div class="modal-total-price">
              <span>Total Price:</span>
              <strong>\${{ getModalTotal().toFixed(2) }}</strong>
            </div>
            
            <button class="btn-premium-outline" (click)="closeCustomization()">Cancel</button>
            <button 
              class="btn-premium glow-btn" 
              [disabled]="modal.quantity <= 0 || modal.quantity > modal.product.availableStock"
              (click)="confirmAddToCart()"
            >
              Add to Basket
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-container {
      display: flex;
      flex-direction: column;
      gap: 35px;
      animation: fadeIn 0.4s ease;
    }

    .menu-header {
      text-align: center;
    }

    .menu-header h1 span {
      color: var(--accent);
      background: linear-gradient(90deg, var(--accent) 0%, #fbbf24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .menu-header p {
      color: var(--text-secondary);
      margin-top: 10px;
    }

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 25px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .category-tabs {
      display: flex;
      gap: 8px;
    }

    .tab-btn {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid transparent;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: var(--transition-smooth);
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

    .search-and-brand {
      display: flex;
      gap: 12px;
      flex-grow: 1;
      max-width: 450px;
      justify-content: flex-end;
    }

    .brand-select {
      width: 160px;
      cursor: pointer;
    }

    .search-input {
      width: 240px;
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

    /* PRODUCT CARD ADJUSTMENTS */
    .product-card {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 15px;
      min-height: 380px;
    }

    .product-badge-overlay {
      position: absolute;
      top: 15px;
      right: 15px;
      z-index: 10;
    }

    .product-icon-container {
      height: 120px;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid var(--border-glass);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 12px 12px 0 0;
      margin: -20px -20px 0 -20px;
      transition: var(--transition-smooth);
    }

    .product-card:hover .product-icon-container {
      background: rgba(245, 158, 11, 0.04);
    }

    .product-emoji {
      font-size: 55px;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
    }

    .product-brand {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent);
    }

    .product-title {
      font-size: 18px;
      color: var(--text-primary);
      margin: 5px 0;
    }

    .product-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
      flex-grow: 1;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 15px;
      margin-top: 10px;
    }

    .product-price {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 10px;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .price-value {
      font-size: 19px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .low-stock {
      border-color: rgba(245, 158, 11, 0.4);
    }

    .out-of-stock {
      opacity: 0.6;
    }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--text-secondary);
    }

    /* CUSTOMIZATION MODAL DETAILS */
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 28px;
      cursor: pointer;
      line-height: 1;
    }

    .close-btn:hover {
      color: var(--text-primary);
    }

    .custom-section {
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 20px;
    }

    .custom-section h3 {
      font-size: 15px;
      color: var(--text-primary);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .size-options-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .size-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-glass);
      padding: 15px;
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 5px;
      transition: var(--transition-smooth);
    }

    .size-card:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.2);
    }

    .size-card.active {
      background: rgba(245, 158, 11, 0.08);
      border-color: var(--accent);
      color: var(--text-primary);
    }

    .size-name {
      font-weight: 600;
      font-size: 14px;
    }

    .size-price {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .size-card.active .size-price {
      color: var(--accent);
    }

    .toppings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
    }

    .topping-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      cursor: pointer;
      font-size: 13px;
      background: rgba(255,255,255,0.01);
      border-color: var(--border-glass);
      transition: var(--transition-smooth);
    }

    .topping-label input {
      margin-right: 8px;
      accent-color: var(--accent);
    }

    .topping-label:hover {
      background: rgba(255,255,255,0.04);
    }

    .topping-label.selected {
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.03);
    }

    .topping-price {
      color: var(--accent);
      font-weight: 500;
    }

    .packaging-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .packaging-option-row {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px 16px;
      border: 1px solid var(--border-glass);
      border-radius: 10px;
      cursor: pointer;
      background: rgba(255,255,255,0.01);
      transition: var(--transition-smooth);
    }

    .packaging-option-row input {
      accent-color: var(--accent);
    }

    .packaging-option-row:hover {
      background: rgba(255,255,255,0.03);
    }

    .packaging-option-row.active {
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.04);
    }

    .pkg-info {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .pkg-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .pkg-desc {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .pkg-price {
      font-weight: 600;
      color: var(--accent);
      font-size: 14px;
    }

    .quantity-section {
      border-bottom: none;
      padding-bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .quantity-controller {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .qty-adjust {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-glass);
      border-radius: 8px;
      background: rgba(11, 11, 14, 0.6);
      overflow: hidden;
    }

    .qty-btn {
      background: transparent;
      border: none;
      color: var(--text-primary);
      width: 36px;
      height: 36px;
      font-size: 18px;
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .qty-btn:hover {
      background: rgba(255,255,255,0.05);
    }

    .qty-display {
      width: 36px;
      text-align: center;
      font-weight: 700;
      font-size: 15px;
    }

    .stock-info {
      font-size: 13px;
    }

    .stock-error {
      color: var(--danger);
      font-size: 12px;
      font-weight: 600;
      width: 100%;
      margin-top: 10px;
    }

    .modal-total-price {
      display: flex;
      flex-direction: column;
      margin-right: auto;
    }

    .modal-total-price span {
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
    }

    .modal-total-price strong {
      font-size: 24px;
      color: var(--accent);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class MenuComponent implements OnInit {
  apiUrl = 'http://localhost:5000/api/products';
  products: ProductDto[] = [];
  filteredProducts: ProductDto[] = [];
  loading = true;

  categories = ['All', 'Pizza', 'Cold Drinks', 'Breads'];
  selectedCategory = 'All';
  selectedBrand = 'All';
  searchQuery = '';

  packagingOptions = [
    { name: 'Eco-Friendly Box', price: 0, description: '100% recyclable classic corrugated container' },
    { name: 'Premium Insulated Bag', price: 2.50, description: 'High-performance thermal foil layer to keep it piping hot' },
    { name: 'Wood-Texture Tray', price: 1.50, description: 'Premium presentation tray, elegant for dinner guests' }
  ];

  modal: CustomizationModal = {
    isOpen: false,
    product: null,
    selectedSize: null,
    selectedToppings: {},
    selectedPackaging: this.packagingOptions[0],
    quantity: 1
  };

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading = true;
    this.http.get<ProductDto[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.products = data.map(p => {
          try {
            p.sizeOptions = JSON.parse(p.sizeOptionsJson);
          } catch {
            p.sizeOptions = [];
          }
          try {
            p.toppingOptions = JSON.parse(p.toppingOptionsJson);
          } catch {
            p.toppingOptions = [];
          }
          return p;
        });
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.toastService.showDanger('Could not load catalog from API database.');
        this.loading = false;
      }
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters() {
    let result = this.products;

    if (this.selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }

    if (this.selectedBrand !== 'All') {
      result = result.filter(p => p.brand === this.selectedBrand);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    this.filteredProducts = result;
  }

  getEmoji(category: string): string {
    switch(category.toLowerCase()) {
      case 'pizza': return '🍕';
      case 'breads': return '🥖';
      case 'cold drinks': return '🥤';
      default: return '🍔';
    }
  }

  openCustomization(product: ProductDto) {
    this.modal = {
      isOpen: true,
      product: product,
      selectedSize: product.sizeOptions && product.sizeOptions.length > 0 ? product.sizeOptions[0] : null,
      selectedToppings: {},
      selectedPackaging: this.packagingOptions[0],
      quantity: 1
    };

    if (product.toppingOptions) {
      product.toppingOptions.forEach(t => {
        this.modal.selectedToppings[t.Name] = false;
      });
    }
  }

  closeCustomization() {
    this.modal.isOpen = false;
    this.modal.product = null;
  }

  adjustQty(val: number) {
    const newQty = this.modal.quantity + val;
    if (newQty > 0) {
      this.modal.quantity = newQty;
    }
  }

  getModalTotal(): number {
    if (!this.modal.product) return 0;
    
    let price = this.modal.product.basePrice;
    
    if (this.modal.selectedSize) {
      price += this.modal.selectedSize.PriceModifier;
    }

    if (this.modal.product.toppingOptions) {
      this.modal.product.toppingOptions.forEach(t => {
        if (this.modal.selectedToppings[t.Name]) {
          price += t.Price;
        }
      });
    }

    price += this.modal.selectedPackaging.price;
    return price * this.modal.quantity;
  }

  confirmAddToCart() {
    if (!this.modal.product) return;
    
    const p = this.modal.product;
    if (this.modal.quantity > p.availableStock) {
      this.toastService.showDanger(`Race-condition notice: Requested quantity (${this.modal.quantity}) exceeds available stock (${p.availableStock}).`);
      return;
    }

    // Build lists of toppings
    const toppingsList = Object.keys(this.modal.selectedToppings)
      .filter(key => this.modal.selectedToppings[key])
      .join(', ');

    // Deduct base price + modifications to form unitPrice
    let unitPrice = p.basePrice;
    if (this.modal.selectedSize) {
      unitPrice += this.modal.selectedSize.PriceModifier;
    }
    if (p.toppingOptions) {
      p.toppingOptions.forEach(t => {
        if (this.modal.selectedToppings[t.Name]) {
          unitPrice += t.Price;
        }
      });
    }

    this.cartService.addToCart(
      p,
      this.modal.selectedSize?.Name || 'Standard',
      toppingsList || 'None',
      this.modal.selectedPackaging.name,
      this.modal.selectedPackaging.price,
      this.modal.selectedPackaging.description,
      this.modal.quantity,
      unitPrice
    );

    this.toastService.showSuccess(`Added ${this.modal.quantity}x ${p.name} to basket!`);
    this.closeCustomization();
  }
}
