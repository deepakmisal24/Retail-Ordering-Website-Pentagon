import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CartService, CartItem } from './core/services/cart.service';
import { ToastService, ToastMessage } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('retail-ordering-ui');
  
  isDrawerOpen = false;
  toasts: ToastMessage[] = [];
  cartCount = 0;
  cartSubtotal = 0;
  cartItems: CartItem[] = [];

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    public toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
    
    this.cartService.items$.subscribe(items => {
      this.cartItems = items;
      this.cartCount = this.cartService.getItemCount();
      this.cartSubtotal = this.cartService.getSubtotal();
    });
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  adjustItemQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    this.cartService.updateQuantity(
      item.product.id,
      item.selectedSize,
      item.selectedToppings,
      item.selectedPackagingName,
      newQty
    );
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(
      item.product.id,
      item.selectedSize,
      item.selectedToppings,
      item.selectedPackagingName
    );
    this.toastService.showInfo(`Removed ${item.product.name} from basket.`);
  }

  handleLogout() {
    this.authService.logout();
    this.cartService.clearCart();
    this.toastService.showSuccess('Logout successful. Basket cleared.');
    this.router.navigate(['/']);
  }

  proceedToCheckout() {
    this.toggleDrawer();
    this.router.navigate(['/checkout']);
  }
}
