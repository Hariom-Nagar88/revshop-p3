import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h2 class="page-title">My Cart</h2>
      <div class="cart-layout" *ngIf="cart && cart.items.length > 0">
        <!-- Items -->
        <div class="cart-items">
          <div *ngFor="let item of cart.items" class="cart-item card">
            <img [src]="item.imageUrl || 'assets/placeholder.png'" [alt]="item.productName" class="item-img"/>
            <div class="item-info">
              <a [routerLink]="['/products', item.productId]" class="item-name">{{item.productName}}</a>
              <p class="item-price">₹{{item.price | number}}</p>
            </div>
            <div class="qty-ctrl">
              <button (click)="updateQty(item, -1)" [disabled]="item.quantity <= 1">−</button>
              <span>{{item.quantity}}</span>
              <button (click)="updateQty(item, 1)">+</button>
            </div>
            <p class="item-subtotal">₹{{item.subtotal | number}}</p>
            <button class="remove-btn" (click)="removeItem(item)">
              <span class="material-icons">delete_outline</span>
            </button>
          </div>
        </div>
        <!-- Summary -->
        <div class="cart-summary card">
          <h3 class="sum-title">PRICE DETAILS</h3>
          <div class="sum-row"><span>Price ({{cart.totalItems}} items)</span><span>₹{{cart.totalPrice | number}}</span></div>
          <div class="sum-row"><span>Delivery Charges</span><span class="text-success">FREE</span></div>
          <div class="sum-row total"><span>Total Amount</span><span>₹{{cart.totalPrice | number}}</span></div>
          <p class="savings" *ngIf="totalSavings > 0">You will save ₹{{totalSavings | number}} on this order</p>
          <button class="btn btn-accent btn-lg" style="width:100%;justify-content:center" (click)="checkout()">
            PLACE ORDER
          </button>
        </div>
      </div>

      <div *ngIf="cart && cart.items.length === 0" class="empty-state">
        <span class="material-icons">shopping_cart</span>
        <h3>Your cart is empty!</h3>
        <p>Add items to it now.</p>
        <a routerLink="/products" class="btn btn-primary" style="margin-top:16px">Shop Now</a>
      </div>

      <div *ngIf="loading" class="spinner-wrap"><div class="spinner"></div></div>
    </div>
  `,
  styles: [`
    .container { max-width: 1280px; margin: 0 auto; padding: 16px; }
    .page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
    .cart-layout { display: flex; gap: 16px; align-items: flex-start; }
    .cart-items  { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .cart-item   { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .item-img    { width: 80px; height: 80px; object-fit: contain; border: 1px solid #f0f0f0; border-radius: 4px; }
    .item-info   { flex: 1; min-width: 0; }
    .item-name   { font-size: 14px; color: #212121; display: -webkit-box; -webkit-line-clamp: 2;
                   -webkit-box-orient: vertical; overflow: hidden; }
    .item-price  { font-size: 14px; color: #878787; margin-top: 4px; }
    .qty-ctrl    { display: flex; align-items: center; gap: 12px; border: 1px solid #e0e0e0; border-radius: 4px; padding: 2px 8px; }
    .qty-ctrl button { background: none; border: none; font-size: 18px; cursor: pointer; color: #2874f0; padding: 2px 6px; }
    .qty-ctrl button:disabled { opacity: .4; cursor: default; }
    .qty-ctrl span { font-size: 15px; font-weight: 600; min-width: 20px; text-align: center; }
    .item-subtotal { font-size: 16px; font-weight: 700; min-width: 80px; text-align: right; }
    .remove-btn  { background: none; border: none; color: #878787; cursor: pointer; padding: 4px; }
    .remove-btn:hover { color: #c62828; }

    .cart-summary { width: 300px; flex-shrink: 0; padding: 20px; }
    .sum-title   { font-size: 13px; font-weight: 700; color: #878787; letter-spacing: 1px;
                   margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0; }
    .sum-row     { display: flex; justify-content: space-between; font-size: 15px;
                   margin-bottom: 12px; color: #212121; }
    .sum-row.total { font-weight: 700; font-size: 17px; padding-top: 12px;
                     border-top: 1px solid #e0e0e0; margin-top: 8px; }
    .text-success { color: #388e3c; font-weight: 600; }
    .savings { color: #388e3c; font-size: 13px; font-weight: 600; margin: 12px 0; text-align: center; }
    @media (max-width: 768px) { .cart-layout { flex-direction: column; } .cart-summary { width: 100%; } }
  `]
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  totalSavings = 0;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: c => { this.cart = c; this.loading = false; },
      error: () => this.loading = false
    });
  }

  updateQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty <= 0) { this.removeItem(item); return; }
    this.cartService.updateItem(item.id, newQty).subscribe(c => this.cart = c);
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.id).subscribe(c => this.cart = c);
  }

  checkout() { this.router.navigate(['/checkout']); }
}
