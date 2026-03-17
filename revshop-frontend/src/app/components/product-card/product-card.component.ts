import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-card" [routerLink]="['/products', product.id]">
      <div class="card-img-wrap">
        <img [src]="product.imageUrl || 'assets/placeholder.png'"
             [alt]="product.name" class="card-img" loading="lazy"/>
        <button class="wishlist-btn" (click)="toggleWishlist($event)">
          <span class="material-icons">{{wishlisted ? 'favorite' : 'favorite_border'}}</span>
        </button>
        <div class="out-of-stock-overlay" *ngIf="product.stock === 0">Out of Stock</div>
      </div>
      <div class="card-body">
        <p class="card-brand">{{product.brand || product.categoryName}}</p>
        <h3 class="card-name">{{product.name}}</h3>

        <div class="card-rating" *ngIf="product.ratingCount > 0">
          <span class="rating-pill">
            {{product.averageRating | number:'1.1-1'}}
            <span class="material-icons" style="font-size:12px">star</span>
          </span>
          <span class="rating-count">({{product.ratingCount}})</span>
        </div>

        <div class="card-price">
          <span class="price">₹{{product.price | number}}</span>
          <span class="price-old" *ngIf="product.originalPrice > product.price">
            ₹{{product.originalPrice | number}}
          </span>
          <span class="price-off" *ngIf="discountPct > 0">{{discountPct}}% off</span>
        </div>

        <p class="free-delivery">Free delivery</p>
      </div>
    </div>
  `,
  styles: [`
    .product-card { background: #fff; border-radius: 4px; overflow: hidden; cursor: pointer;
                    transition: box-shadow .2s; border: 1px solid transparent; }
    .product-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.15); border-color: #e0e0e0; }
    .card-img-wrap { position: relative; background: #f5f5f5; padding: 16px;
                     display: flex; align-items: center; justify-content: center; height: 180px; }
    .card-img { width: 140px; height: 140px; object-fit: contain; transition: transform .3s; }
    .product-card:hover .card-img { transform: scale(1.05); }
    .wishlist-btn { position: absolute; top: 8px; right: 8px; background: none; border: none;
                    cursor: pointer; color: #878787; transition: color .2s; padding: 4px; }
    .wishlist-btn:hover, .wishlist-btn .material-icons.active { color: #ff6161; }
    .wishlist-btn .material-icons { font-size: 20px; }
    .out-of-stock-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,.5);
                             color: #fff; text-align: center; padding: 6px; font-size: 12px; font-weight: 600; }
    .card-body { padding: 10px 12px 12px; }
    .card-brand { font-size: 11px; color: #878787; text-transform: uppercase; font-weight: 600;
                  margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card-name  { font-size: 13px; color: #212121; font-weight: 400; margin-bottom: 6px;
                  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .rating-pill { background: #388e3c; color: #fff; font-size: 11px; font-weight: 600;
                   padding: 2px 6px; border-radius: 3px; display: flex; align-items: center; gap: 2px; }
    .rating-count { font-size: 12px; color: #878787; }
    .card-price { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
    .price      { font-size: 16px; font-weight: 700; color: #212121; }
    .price-old  { font-size: 12px; color: #878787; text-decoration: line-through; }
    .price-off  { font-size: 12px; color: #388e3c; font-weight: 600; }
    .free-delivery { font-size: 11px; color: #388e3c; }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() wishlisted = false;
  @Output() wishlistToggle = new EventEmitter<Product>();

  get discountPct(): number {
    if (!this.product.originalPrice || this.product.originalPrice <= this.product.price) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }

  toggleWishlist(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.wishlistToggle.emit(this.product);
  }
}
