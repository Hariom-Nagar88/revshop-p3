import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WishlistItem } from '../../models';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h2 class="page-title">My Wishlist <span class="count-badge">{{items.length}}</span></h2>
      <div class="wishlist-grid" *ngIf="items.length > 0">
        <div *ngFor="let item of items" class="wishlist-card card">
          <button class="remove-wish" (click)="remove(item)">
            <span class="material-icons">close</span>
          </button>
          <a [routerLink]="['/products', item.productId]">
            <img [src]="item.imageUrl || 'assets/placeholder.png'" [alt]="item.productName" class="wish-img"/>
            <p class="wish-name">{{item.productName}}</p>
            <p class="wish-price">₹{{item.productPrice | number}}</p>
          </a>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:10px"
                  (click)="moveToCart(item)">
            <span class="material-icons">shopping_cart</span> Move to Cart
          </button>
        </div>
      </div>
      <div *ngIf="items.length === 0 && !loading" class="empty-state">
        <span class="material-icons">favorite_border</span>
        <h3>Your wishlist is empty</h3>
        <a routerLink="/products" class="btn btn-primary" style="margin-top:16px">Explore Products</a>
      </div>
      <div *ngIf="loading" class="spinner-wrap"><div class="spinner"></div></div>
    </div>
  `,
  styles: [`
    .container { max-width: 1280px; margin: 0 auto; padding: 16px; }
    .page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
    .count-badge { background: #e0e0e0; border-radius: 12px; padding: 2px 10px; font-size: 14px;
                   font-weight: 600; margin-left: 8px; }
    .wishlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
    .wishlist-card { padding: 16px; position: relative; text-align: center; }
    .remove-wish { position: absolute; top: 8px; right: 8px; background: none; border: none;
                   cursor: pointer; color: #878787; }
    .remove-wish:hover { color: #c62828; }
    .wish-img  { width: 130px; height: 130px; object-fit: contain; margin: 0 auto 10px; display: block; }
    .wish-name { font-size: 14px; color: #212121; margin-bottom: 6px; overflow: hidden;
                 text-overflow: ellipsis; white-space: nowrap; }
    .wish-price { font-size: 16px; font-weight: 700; color: #212121; }
  `]
})
export class WishlistComponent implements OnInit {
  items: WishlistItem[] = [];
  loading = true;
  constructor(private cartService: CartService) {}
  ngOnInit() { this.cartService.getWishlist().subscribe({ next: i => { this.items = i; this.loading = false; }, error: () => this.loading = false }); }
  remove(item: WishlistItem) { this.cartService.removeFromWishlist(item.productId).subscribe(() => this.items = this.items.filter(i => i.id !== item.id)); }
  moveToCart(item: WishlistItem) {
    this.cartService.addItem({ productId: item.productId, productName: item.productName, imageUrl: item.imageUrl, price: item.productPrice, quantity: 1, sellerId: 0 }).subscribe();
    this.remove(item);
  }
}
