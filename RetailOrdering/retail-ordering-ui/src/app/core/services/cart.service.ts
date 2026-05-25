import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductDto } from './product-dto';

export interface CartItem {
  product: ProductDto;
  selectedSize: string;
  selectedToppings: string; // Comma separated list
  selectedPackagingName: string;
  selectedPackagingPrice: number;
  selectedPackagingDescription: string;
  quantity: number;
  unitPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  addToCart(
    product: ProductDto,
    size: string,
    toppings: string,
    packagingName: string,
    packagingPrice: number,
    packagingDescription: string,
    quantity: number,
    unitPrice: number
  ) {
    const current = this.itemsSubject.value;
    const existing = current.find(i => 
      i.product.id === product.id &&
      i.selectedSize === size &&
      i.selectedToppings === toppings &&
      i.selectedPackagingName === packagingName
    );

    if (existing) {
      existing.quantity += quantity;
      this.itemsSubject.next([...current]);
    } else {
      const newItem: CartItem = {
        product,
        selectedSize: size,
        selectedToppings: toppings,
        selectedPackagingName: packagingName,
        selectedPackagingPrice: packagingPrice,
        selectedPackagingDescription: packagingDescription,
        quantity,
        unitPrice
      };
      this.itemsSubject.next([...current, newItem]);
    }
    this.saveCart();
  }

  removeFromCart(productId: number, size: string, toppings: string, packagingName: string) {
    const current = this.itemsSubject.value;
    const filtered = current.filter(i => !(
      i.product.id === productId &&
      i.selectedSize === size &&
      i.selectedToppings === toppings &&
      i.selectedPackagingName === packagingName
    ));
    this.itemsSubject.next(filtered);
    this.saveCart();
  }

  updateQuantity(productId: number, size: string, toppings: string, packagingName: string, quantity: number) {
    const current = this.itemsSubject.value;
    const item = current.find(i => 
      i.product.id === productId &&
      i.selectedSize === size &&
      i.selectedToppings === toppings &&
      i.selectedPackagingName === packagingName
    );

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId, size, toppings, packagingName);
      } else {
        item.quantity = quantity;
        this.itemsSubject.next([...current]);
        this.saveCart();
      }
    }
  }

  clearCart() {
    this.itemsSubject.next([]);
    this.saveCart();
  }

  getItemCount(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }

  getPackagingTotal(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + (item.selectedPackagingPrice * item.quantity), 0);
  }

  private saveCart() {
    localStorage.setItem('cart_items', JSON.stringify(this.itemsSubject.value));
  }

  private loadCart() {
    const stored = localStorage.getItem('cart_items');
    if (stored) {
      try {
        this.itemsSubject.next(JSON.parse(stored));
      } catch {
        this.itemsSubject.next([]);
      }
    }
  }
}
