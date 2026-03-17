import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Category, Product } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-content">
        <h1>Welcome to <span>RevShop</span></h1>
        <p>Millions of products. Best prices. Fast delivery.</p>
        <a routerLink="/products" class="btn btn-accent btn-lg">Shop Now</a>
      </div>
      <div class="hero-image">
        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600" alt="Shop"/>
      </div>
    </div>

    <div class="container">

      <!-- Categories -->
      <section class="section">
        <div class="section-header-plain">
          <h2 class="sec-title">Shop by Category</h2>
          <a routerLink="/products" class="see-all">See All</a>
        </div>
        <div class="category-grid">
          <a *ngFor="let cat of categories"
             [routerLink]="['/products']" [queryParams]="{categoryId: cat.id}"
             class="cat-card">
            <div class="cat-img-wrap">
              <img [src]="cat.imageUrl" [alt]="cat.name" loading="lazy"/>
            </div>
            <p class="cat-name">{{cat.name}}</p>
          </a>
        </div>
      </section>

      <!-- Deal of the Day -->
      <section class="section" *ngIf="dealProducts.length">
        <div class="section-header-plain">
          <h2 class="sec-title">🔥 Deal of the Day</h2>
          <a routerLink="/products" class="see-all">See All</a>
        </div>
        <div class="product-grid">
          <app-product-card *ngFor="let p of dealProducts" [product]="p"></app-product-card>
        </div>
      </section>

      <!-- New Arrivals -->
      <section class="section" *ngIf="newArrivals.length">
        <div class="section-header-plain">
          <h2 class="sec-title">✨ New Arrivals</h2>
          <a routerLink="/products" class="see-all">See All</a>
        </div>
        <div class="product-grid">
          <app-product-card *ngFor="let p of newArrivals" [product]="p"></app-product-card>
        </div>
      </section>

      <!-- Loading -->
      <div *ngIf="loading" class="spinner-wrap"><div class="spinner"></div></div>

    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner container">
        <div class="footer-col">
          <h4>ABOUT</h4>
          <a href="#">About Us</a><a href="#">Careers</a><a href="#">Press</a>
        </div>
        <div class="footer-col">
          <h4>HELP</h4>
          <a href="#">Payments</a><a href="#">Shipping</a><a href="#">Returns</a>
        </div>
        <div class="footer-col">
          <h4>CONSUMER POLICY</h4>
          <a href="#">Cancellation & Returns</a><a href="#">Terms Of Use</a><a href="#">Privacy</a>
        </div>
        <div class="footer-col">
          <h4>SOCIAL</h4>
          <a href="#">Facebook</a><a href="#">Twitter</a><a href="#">Instagram</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 RevShop. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .hero-banner { background: linear-gradient(135deg, #2874f0 0%, #1a65d6 60%, #0d47a1 100%);
                   color: #fff; display: flex; align-items: center; justify-content: space-between;
                   padding: 40px 80px; min-height: 280px; overflow: hidden; }
    .hero-content h1 { font-size: 36px; font-weight: 700; margin-bottom: 12px; }
    .hero-content h1 span { color: #ffe082; }
    .hero-content p { font-size: 16px; opacity: .85; margin-bottom: 24px; }
    .hero-image img { width: 360px; height: 220px; object-fit: cover; border-radius: 8px;
                       box-shadow: 0 8px 32px rgba(0,0,0,.3); }
    @media (max-width: 768px) { .hero-banner { padding: 24px; flex-direction: column; text-align: center; }
      .hero-image { display: none; } }

    .container { max-width: 1280px; margin: 0 auto; padding: 0 16px; }
    .section { background: #fff; margin: 12px 0; border-radius: 4px; overflow: hidden;
               box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .section-header-plain { display: flex; align-items: center; justify-content: space-between;
                             padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
    .sec-title { font-size: 20px; font-weight: 700; color: #212121; }
    .see-all { color: #2874f0; font-size: 13px; font-weight: 600; }
    .see-all:hover { text-decoration: underline; }

    .category-grid { display: flex; gap: 0; overflow-x: auto; scrollbar-width: none; }
    .category-grid::-webkit-scrollbar { display: none; }
    .cat-card { display: flex; flex-direction: column; align-items: center; padding: 20px 16px;
                cursor: pointer; transition: background .2s; min-width: 100px; text-align: center; border-radius: 4px; }
    .cat-card:hover { background: #f5f5f5; }
    .cat-img-wrap { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; margin-bottom: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,.15); }
    .cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .cat-name { font-size: 13px; font-weight: 500; color: #212121; }

    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
                    gap: 1px; background: #f0f0f0; }
    .product-grid > * { background: #fff; }

    .footer { background: #172337; color: #fff; margin-top: 24px; padding: 40px 0 0; }
    .footer-inner { display: flex; gap: 40px; flex-wrap: wrap; padding-bottom: 32px; }
    .footer-col h4 { font-size: 12px; color: #878787; margin-bottom: 16px; font-weight: 600; }
    .footer-col a  { display: block; color: #ccc; font-size: 13px; margin-bottom: 10px; transition: color .2s; }
    .footer-col a:hover { color: #fff; }
    .footer-bottom { border-top: 1px solid #374046; padding: 20px; text-align: center;
                     font-size: 13px; color: #878787; }
  `]
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  dealProducts: Product[] = [];
  newArrivals: Product[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getCategories().subscribe(cats => {
      this.categories = cats.slice(0, 8);
    });
    this.productService.getAll(0, 8, 'price', 'asc').subscribe(res => {
      this.dealProducts = res.content;
    });
    this.productService.getAll(0, 8, 'createdAt', 'desc').subscribe(res => {
      this.newArrivals = res.content;
      this.loading = false;
    });
  }
}
