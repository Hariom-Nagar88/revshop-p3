import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';
import { Product, Review } from '../../models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StarRatingComponent],
  template: `
    <div class="container" *ngIf="product">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a routerLink="/">Home</a> <span class="material-icons" style="font-size:14px">chevron_right</span>
        <a routerLink="/products">Products</a> <span class="material-icons" style="font-size:14px">chevron_right</span>
        <a [routerLink]="['/products']" [queryParams]="{categoryId: product.categoryId}">{{product.categoryName}}</a>
        <span class="material-icons" style="font-size:14px">chevron_right</span>
        <span>{{product.name}}</span>
      </div>

      <div class="product-layout">
        <!-- Gallery -->
        <div class="gallery-panel">
          <div class="main-img-wrap">
            <img [src]="selectedImage || product.imageUrl" [alt]="product.name" class="main-img"/>
          </div>
          <div class="thumb-row" *ngIf="product?.imageUrls?.length > 1">
            <img *ngFor="let url of product?.imageUrls" [src]="url"
                 [class.active]="selectedImage === url"
                 (click)="selectedImage = url" class="thumb"/>
          </div>
          <div class="action-sticky">
            <button class="btn btn-accent btn-lg" [disabled]="product.stock === 0" (click)="addToCart()">
              <span class="material-icons">shopping_cart</span>
              {{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}}
            </button>
            <button class="btn btn-primary btn-lg" [disabled]="product.stock === 0" (click)="buyNow()">
              <span class="material-icons">bolt</span> Buy Now
            </button>
            <button class="btn btn-outline" (click)="toggleWishlist()">
              <span class="material-icons">{{wishlisted ? 'favorite' : 'favorite_border'}}</span>
              {{wishlisted ? 'Wishlisted' : 'Wishlist'}}
            </button>
          </div>
        </div>

        <!-- Details -->
        <div class="details-panel">
          <p class="product-brand">{{product.brand}}</p>
          <h1 class="product-name">{{product.name}}</h1>

          <div class="rating-row" *ngIf="product.ratingCount > 0">
            <span class="rating-pill">
              {{product.averageRating | number:'1.1-1'}}
              <span class="material-icons" style="font-size:13px">star</span>
            </span>
            <span class="rating-text">{{product.ratingCount}} Ratings & {{reviews.length}} Reviews</span>
          </div>

          <div class="price-row">
            <span class="price-main">₹{{product.price | number}}</span>
            <span class="price-mrp" *ngIf="product.originalPrice > product.price">
              MRP <s>₹{{product.originalPrice | number}}</s>
            </span>
            <span class="price-off" *ngIf="discountPct > 0">{{discountPct}}% off</span>
          </div>

          <div class="tag-row">
            <span class="badge badge-success" *ngIf="product.stock > 0">In Stock ({{product.stock}} units)</span>
            <span class="badge badge-danger" *ngIf="product.stock === 0">Out of Stock</span>
            <span class="badge badge-warning" *ngIf="product.lowStock && product.stock > 0">Low Stock!</span>
          </div>

          <div class="info-block">
            <h3>Product Details</h3>
            <p>{{product.description}}</p>
            <table class="specs-table" *ngIf="product.brand">
              <tr><td>Brand</td><td>{{product.brand}}</td></tr>
              <tr><td>Category</td><td>{{product.categoryName}}</td></tr>
              <tr><td>Seller</td><td>{{product.sellerName}}</td></tr>
            </table>
          </div>

          <!-- Delivery Info -->
          <div class="delivery-block">
            <span class="material-icons">local_shipping</span>
            <div>
              <strong>Free Delivery</strong>
              <p>Enter pincode for delivery date</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div class="reviews-section card">
        <div class="section-header">
          <h2 class="section-title">Ratings & Reviews</h2>
        </div>
        <div class="reviews-layout">
          <div class="overall-rating">
            <div class="big-rating">{{product.averageRating | number:'1.1-1'}}</div>
            <app-star-rating [value]="product.averageRating" [count]="product.ratingCount" [showCount]="true"></app-star-rating>
            <p class="review-count">{{product.ratingCount}} Ratings</p>
          </div>
          <div class="reviews-list">
            <ng-container *ngIf="authService.isBuyer">
              <!-- Add Review -->
              <div class="add-review">
                <h4>Rate this Product</h4>
                <app-star-rating [interactive]="true" (rated)="submitRating($event)"></app-star-rating>
                <textarea [(ngModel)]="reviewText" placeholder="Write your review..." class="form-control" rows="3" style="margin-top:8px"></textarea>
                <button class="btn btn-primary btn-sm" (click)="submitReview()" style="margin-top:8px">Submit Review</button>
              </div>
            </ng-container>
            <div *ngFor="let r of reviews" class="review-item">
              <div class="review-header">
                <span class="reviewer-name">{{r.buyerName}}</span>
                <span class="review-date">{{r.createdAt | date:'mediumDate'}}</span>
              </div>
              <p class="review-text">{{r.comment}}</p>
            </div>
            <div *ngIf="reviews.length === 0 && !authService.isBuyer" class="empty-reviews">
              <span class="material-icons">rate_review</span>
              <p>No reviews yet. Be the first to review!</p>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="toast" class="toast" [class.success]="toastType==='success'" [class.error]="toastType==='error'">
        {{toast}}
      </div>
    </div>

    <div *ngIf="!product && !loading" class="empty-state">
      <span class="material-icons">error_outline</span><h3>Product not found</h3>
    </div>
    <div *ngIf="loading" class="spinner-wrap"><div class="spinner"></div></div>
  `,
  styles: [`
    .container { max-width: 1280px; margin: 0 auto; padding: 12px 16px; }
    .product-layout { display: flex; gap: 24px; background: #fff; border-radius: 4px;
                      box-shadow: 0 1px 4px rgba(0,0,0,.1); padding: 24px; margin-bottom: 12px; }
    .gallery-panel { width: 380px; flex-shrink: 0; }
    .main-img-wrap  { width: 100%; height: 300px; display: flex; align-items: center;
                      justify-content: center; border: 1px solid #f0f0f0; border-radius: 4px;
                      margin-bottom: 12px; }
    .main-img { max-width: 100%; max-height: 280px; object-fit: contain; }
    .thumb-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .thumb { width: 56px; height: 56px; object-fit: contain; border: 2px solid #e0e0e0;
             border-radius: 4px; cursor: pointer; transition: border-color .2s; }
    .thumb.active { border-color: #2874f0; }
    .action-sticky { display: flex; flex-direction: column; gap: 10px; }
    .action-sticky .btn { justify-content: center; }

    .details-panel { flex: 1; min-width: 0; }
    .product-brand { font-size: 13px; color: #878787; font-weight: 600; text-transform: uppercase; }
    .product-name  { font-size: 22px; font-weight: 400; color: #212121; margin: 6px 0 10px; }
    .rating-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
                  padding-bottom: 14px; border-bottom: 1px solid #f0f0f0; }
    .rating-pill { background: #388e3c; color: #fff; font-size: 13px; font-weight: 700;
                   padding: 3px 8px; border-radius: 3px; display: flex; align-items: center; gap: 3px; }
    .rating-text { color: #878787; font-size: 14px; }
    .price-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px; }
    .price-main { font-size: 28px; font-weight: 700; }
    .price-mrp  { font-size: 16px; color: #878787; }
    .price-off  { font-size: 16px; color: #388e3c; font-weight: 700; }
    .tag-row { display: flex; gap: 8px; margin-bottom: 16px; }
    .info-block { margin-bottom: 16px; padding: 16px; background: #fafafa; border-radius: 4px; }
    .info-block h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
    .info-block p  { color: #555; font-size: 14px; line-height: 1.7; }
    .specs-table { margin-top: 12px; border-collapse: collapse; width: 100%; }
    .specs-table td { padding: 6px 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
    .specs-table td:first-child { color: #878787; width: 120px; }
    .delivery-block { display: flex; gap: 12px; align-items: flex-start; padding: 14px;
                      background: #e8f5e9; border-radius: 4px; }
    .delivery-block .material-icons { color: #388e3c; }
    .delivery-block strong { font-size: 14px; }
    .delivery-block p { font-size: 13px; color: #555; }

    .reviews-section { margin-bottom: 12px; }
    .reviews-layout  { display: flex; gap: 32px; padding: 20px; }
    .overall-rating  { text-align: center; min-width: 120px; }
    .big-rating { font-size: 48px; font-weight: 700; color: #212121; }
    .review-count { color: #878787; font-size: 13px; margin-top: 4px; }
    .reviews-list { flex: 1; }
    .add-review { background: #f9f9f9; padding: 16px; border-radius: 4px; margin-bottom: 16px; }
    .add-review h4 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
    .review-item { padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
    .review-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .reviewer-name { font-weight: 600; font-size: 14px; }
    .review-date   { color: #878787; font-size: 12px; }
    .review-text   { color: #555; font-size: 14px; line-height: 1.6; }
    .empty-reviews { text-align: center; padding: 32px; color: #878787; }
    .empty-reviews .material-icons { font-size: 40px; display: block; margin-bottom: 8px; }
    @media (max-width: 768px) { .product-layout { flex-direction: column; } .gallery-panel { width: 100%; }
      .reviews-layout { flex-direction: column; } }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  selectedImage = '';
  wishlisted = false;
  loading = true;
  reviewText = '';
  toast = '';
  toastType = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getById(id).subscribe({
      next: p => { this.product = p; this.selectedImage = p.imageUrl; this.loading = false;
                   this.productService.getReviews(id).subscribe(r => this.reviews = r);
                   if (this.authService.isBuyer)
                     this.cartService.checkWishlist(id).subscribe(w => this.wishlisted = w); },
      error: () => this.loading = false
    });
  }

  get discountPct(): number {
    if (!this.product?.originalPrice || this.product.originalPrice <= this.product.price) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }

  addToCart() {
    if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
    this.cartService.addItem({
      productId: this.product?.id, productName: this.product?.name,
      imageUrl: this.product?.imageUrl, price: this.product?.price,
      quantity: 1, sellerId: this.product?.sellerId
    }).subscribe({
      next: () => this.showToast('Added to cart!', 'success'),
      error: () => this.showToast('Failed to add to cart', 'error')
    });
  }

  buyNow() {
    this.addToCart();
    setTimeout(() => this.router.navigate(['/cart']), 500);
  }

  toggleWishlist() {
    if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
    if (this.wishlisted) {
      this.cartService.removeFromWishlist(this.product?.id).subscribe(() => this.wishlisted = false);
    } else {
      this.cartService.addToWishlist({
        productId: this.product?.id, productName: this.product?.name,
        imageUrl: this.product?.imageUrl, productPrice: this.product?.price
      }).subscribe(() => this.wishlisted = true);
    }
  }

  submitReview() {
    if (!this.reviewText.trim()) return;
    this.productService.addReview(this.product?.id, this.reviewText).subscribe({
      next: r => { this.reviews.unshift(r); this.reviewText = ''; this.showToast('Review submitted!', 'success'); },
      error: () => this.showToast('Failed to submit review', 'error')
    });
  }

  submitRating(score: number) {
    this.productService.addRating(this.product?.id, score).subscribe({
      next: () => { this.showToast(`Rated ${score} stars!`, 'success');
                    this.productService.getById(this.product?.id).subscribe(p => this.product = p); }
    });
  }

  private showToast(msg: string, type: 'success' | 'error') {
    this.toast = msg; this.toastType = type;
    setTimeout(() => this.toast = '', 3000);
  }
}

