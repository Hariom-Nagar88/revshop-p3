import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Product, Category, PageResponse } from '../../models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  template: `
    <div class="page-wrap">
      <!-- Sidebar Filters -->
      <aside class="sidebar">
        <div class="filter-section">
          <h3 class="filter-title">FILTERS</h3>
        </div>
        <div class="filter-section">
          <h4 class="filter-label">CATEGORIES</h4>
          <label *ngFor="let cat of categories" class="filter-option">
            <input type="radio" name="category" [value]="cat.id"
                   [(ngModel)]="filters.categoryId" (change)="applyFilters()"/>
            <span>{{cat.name}}</span>
            <span class="count">{{cat.productCount}}</span>
          </label>
          <label class="filter-option">
            <input type="radio" name="category" [value]="null"
                   [(ngModel)]="filters.categoryId" (change)="applyFilters()"/>
            <span>All Categories</span>
          </label>
        </div>

        <div class="filter-section">
          <h4 class="filter-label">PRICE RANGE</h4>
          <div class="price-inputs">
            <input [(ngModel)]="filters.minPrice" type="number" class="form-control" placeholder="Min ₹"/>
            <span>–</span>
            <input [(ngModel)]="filters.maxPrice" type="number" class="form-control" placeholder="Max ₹"/>
          </div>
          <button class="btn btn-outline btn-sm" (click)="applyFilters()" style="margin-top:8px;width:100%">Apply</button>
        </div>

        <div class="filter-section">
          <h4 class="filter-label">CUSTOMER RATINGS</h4>
          <label *ngFor="let r of [4,3,2,1]" class="filter-option">
            <input type="radio" name="rating" [value]="r"
                   [(ngModel)]="filters.minRating" (change)="applyFilters()"/>
            <span>{{r}}★ & above</span>
          </label>
        </div>

        <div class="filter-section">
          <h4 class="filter-label">SORT BY</h4>
          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="form-control">
            <option value="createdAt_desc">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="averageRating_desc">Top Rated</option>
          </select>
        </div>

        <button class="btn btn-outline btn-sm clear-btn" (click)="clearFilters()">Clear All Filters</button>
      </aside>

      <!-- Product Grid Area -->
      <main class="products-area">
        <div class="results-bar">
          <span *ngIf="keyword">Results for "<strong>{{keyword}}</strong>"</span>
          <span class="total-count">{{totalElements}} products</span>
        </div>

        <div *ngIf="loading" class="spinner-wrap"><div class="spinner"></div></div>

        <div *ngIf="!loading && products.length === 0" class="empty-state">
          <span class="material-icons">search_off</span>
          <h3>No products found</h3>
          <p>Try different keywords or remove some filters</p>
        </div>

        <div class="product-grid-outer" *ngIf="!loading && products.length > 0">
          <app-product-card *ngFor="let p of products" [product]="p"
                            (wishlistToggle)="toggleWishlist($event)">
          </app-product-card>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">
            <span class="material-icons">chevron_left</span>
          </button>
          <button *ngFor="let p of pageNumbers" class="page-btn"
                  [class.active]="p === currentPage" (click)="goToPage(p)">
            {{p + 1}}
          </button>
          <button class="page-btn" [disabled]="currentPage === totalPages - 1" (click)="goToPage(currentPage + 1)">
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .page-wrap { display: flex; max-width: 1280px; margin: 0 auto; padding: 12px 16px; gap: 12px; }
    .sidebar { width: 220px; flex-shrink: 0; }
    .filter-section { background: #fff; padding: 14px 16px; margin-bottom: 8px; border-radius: 4px;
                      box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .filter-title { font-size: 16px; font-weight: 700; color: #212121; margin-bottom: 8px; }
    .filter-label { font-size: 12px; font-weight: 700; color: #878787; margin-bottom: 10px;
                    text-transform: uppercase; }
    .filter-option { display: flex; align-items: center; gap: 8px; padding: 5px 0; cursor: pointer;
                     font-size: 14px; color: #212121; }
    .filter-option input { accent-color: #2874f0; }
    .filter-option .count { margin-left: auto; color: #878787; font-size: 12px; }
    .price-inputs { display: flex; gap: 8px; align-items: center; }
    .price-inputs .form-control { padding: 7px 8px; font-size: 13px; }
    .clear-btn { width: 100%; justify-content: center; margin-top: 4px; }

    .products-area { flex: 1; min-width: 0; }
    .results-bar { display: flex; justify-content: space-between; align-items: center;
                   background: #fff; padding: 12px 16px; border-radius: 4px;
                   box-shadow: 0 1px 4px rgba(0,0,0,.1); margin-bottom: 8px; font-size: 14px; }
    .total-count { color: #878787; font-size: 13px; }
    .product-grid-outer { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
                           gap: 1px; background: #e0e0e0; border-radius: 4px; overflow: hidden;
                           box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .product-grid-outer > * { background: #fff; }
    @media (max-width: 768px) { .sidebar { display: none; } }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  keyword = '';
  sortBy = 'createdAt_desc';
  filters: any = { categoryId: null, minPrice: null, maxPrice: null, minRating: null };

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.productService.getCategories().subscribe(c => this.categories = c);
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';
      if (params['categoryId']) this.filters.categoryId = +params['categoryId'];
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading = true;
    const [sortField, sortDir] = this.sortBy.split('_');
    const req = { ...this.filters, keyword: this.keyword || null, sortBy: sortField,
                  sortDir, page: this.currentPage, size: 20 };
    this.productService.search(req).subscribe({
      next: (res: PageResponse<Product>) => {
        this.products = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters() { this.currentPage = 0; this.loadProducts(); }
  clearFilters() { this.filters = { categoryId: null, minPrice: null, maxPrice: null, minRating: null };
                   this.keyword = ''; this.sortBy = 'createdAt_desc'; this.applyFilters(); }
  goToPage(page: number) { this.currentPage = page; this.loadProducts(); }

  get pageNumbers(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
  }

  toggleWishlist(product: Product) {
    if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
    this.cartService.addToWishlist({
      productId: product.id, productName: product.name,
      imageUrl: product.imageUrl, productPrice: product.price
    }).subscribe();
  }
}
