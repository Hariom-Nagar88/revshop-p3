import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <!-- Logo -->
        <a class="nav-logo" routerLink="/">
          <span class="logo-rev">Rev</span><span class="logo-shop">Shop</span>
          
        </a>

        <!-- Search -->
        <div class="nav-search">
          <input [(ngModel)]="searchQuery" (keyup.enter)="search()"
                 placeholder="Search for products, brands and more" class="search-input"/>
          <button class="search-btn" (click)="search()">
            <span class="material-icons">search</span>
          </button>
        </div>

        <!-- Nav Actions -->
        <div class="nav-actions">
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/login" class="nav-btn login-btn">Login</a>
            <a routerLink="/register" class="nav-btn signup-btn">Sign Up</a>
          </ng-container>

          <ng-container *ngIf="isLoggedIn">
            <!-- Cart (buyer only) -->
            <a *ngIf="isBuyer" routerLink="/cart" class="nav-icon-btn">
              <span class="material-icons">shopping_cart</span>
              <span class="badge-dot" *ngIf="cartCount > 0">{{cartCount}}</span>
              <span class="icon-label">Cart</span>
            </a>
            <!-- Wishlist (buyer only) -->
            <a *ngIf="isBuyer" routerLink="/wishlist" class="nav-icon-btn">
              <span class="material-icons">favorite_border</span>
              <span class="icon-label">Wishlist</span>
            </a>

            <!-- User dropdown -->
            <div class="user-dropdown" (click)="dropdownOpen = !dropdownOpen">
              <span class="material-icons">account_circle</span>
              <span class="icon-label">{{userName}}</span>
              <span class="material-icons arrow">expand_more</span>
              <div class="dropdown-menu" *ngIf="dropdownOpen">
                <ng-container *ngIf="isBuyer">
                  <a routerLink="/orders" (click)="dropdownOpen=false">My Orders</a>
                  <a routerLink="/wishlist" (click)="dropdownOpen=false">Wishlist</a>
                </ng-container>
                <ng-container *ngIf="isSeller">
                  <a routerLink="/seller/dashboard" (click)="dropdownOpen=false">Dashboard</a>
                  <a routerLink="/seller/products" (click)="dropdownOpen=false">My Products</a>
                  <a routerLink="/seller/orders" (click)="dropdownOpen=false">Orders</a>
                </ng-container>
                <hr/>
                <a (click)="logout()">Logout</a>
              </div>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Category bar -->
      <div class="category-bar">
        <a routerLink="/products" class="cat-link">
          <span class="material-icons">apps</span> All
        </a>
        <a *ngFor="let cat of categories" [routerLink]="['/products']"
           [queryParams]="{categoryId: cat.id}" class="cat-link">
          {{cat.name}}
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar { background: #2874f0; color: #fff; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,.2); }
    .nav-inner { display: flex; align-items: center; gap: 16px; padding: 10px 16px; max-width: 1280px; margin: 0 auto; }
    .nav-logo { display: flex; align-items: baseline; gap: 2px; cursor: pointer; }
    .logo-rev  { font-size: 22px; font-weight: 700; color: #fff; }
    .logo-shop { font-size: 22px; font-weight: 300; color: #ffe082; }
    .nav-logo small { font-size: 10px; font-style: italic; color: #ffe082; margin-left: 4px; align-self: flex-end; }

    .nav-search { flex: 1; display: flex; max-width: 600px; }
    .search-input { flex: 1; padding: 10px 14px; border: none; outline: none; font-size: 14px;
                    border-radius: 2px 0 0 2px; }
    .search-btn   { background: #fff; border: none; padding: 0 14px; border-radius: 0 2px 2px 0;
                    cursor: pointer; color: #2874f0; }
    .search-btn:hover { background: #f5f5f5; }

    .nav-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
    .nav-btn { padding: 8px 16px; border-radius: 2px; font-size: 14px; font-weight: 600;
               cursor: pointer; transition: .2s; }
    .login-btn { background: #fff; color: #2874f0; }
    .login-btn:hover { background: #f0f4ff; }
    .signup-btn { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.5); }
    .signup-btn:hover { background: rgba(255,255,255,.1); }

    .nav-icon-btn { display: flex; flex-direction: column; align-items: center; position: relative;
                    color: #fff; padding: 4px 10px; cursor: pointer; transition: .2s; border-radius: 2px; }
    .nav-icon-btn:hover { background: rgba(255,255,255,.15); }
    .icon-label { font-size: 11px; }
    .badge-dot { position: absolute; top: 2px; right: 4px; background: #ff6161; color: #fff;
                 font-size: 10px; font-weight: 700; width: 16px; height: 16px; border-radius: 50%;
                 display: flex; align-items: center; justify-content: center; }

    .user-dropdown { display: flex; align-items: center; gap: 4px; padding: 4px 10px;
                     cursor: pointer; position: relative; border-radius: 2px; }
    .user-dropdown:hover { background: rgba(255,255,255,.15); }
    .user-dropdown .arrow { font-size: 18px; }
    .dropdown-menu { position: absolute; top: calc(100% + 4px); right: 0; background: #fff;
                     color: #212121; border-radius: 4px; box-shadow: 0 4px 16px rgba(0,0,0,.2);
                     min-width: 160px; overflow: hidden; z-index: 999; }
    .dropdown-menu a { display: block; padding: 12px 16px; font-size: 14px; cursor: pointer; }
    .dropdown-menu a:hover { background: #f5f5f5; }
    .dropdown-menu hr { border: none; border-top: 1px solid #e0e0e0; margin: 4px 0; }

    .category-bar { display: flex; gap: 2px; padding: 0 16px; background: #1a65d6;
                    overflow-x: auto; scrollbar-width: none; max-width: 1280px; margin: 0 auto; width: 100%; }
    .category-bar::-webkit-scrollbar { display: none; }
    .cat-link { display: flex; align-items: center; gap: 4px; color: #fff; font-size: 13px;
                padding: 8px 14px; white-space: nowrap; border-radius: 2px; transition: .2s; }
    .cat-link:hover { background: rgba(255,255,255,.15); }
    .cat-link .material-icons { font-size: 16px; }
    @media (max-width: 768px) {
      .nav-logo small { display: none; }
      .nav-actions .signup-btn { display: none; }
      .icon-label { display: none; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  searchQuery = '';
  dropdownOpen = false;
  cartCount = 0;
  categories: any[] = [];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(cart => this.cartCount = cart?.totalItems ?? 0);
    if (this.isLoggedIn && this.isBuyer) this.cartService.getCart().subscribe();
  }

  get isLoggedIn() { return this.authService.isLoggedIn; }
  get isBuyer()    { return this.authService.isBuyer; }
  get isSeller()   { return this.authService.isSeller; }
  get userName()   { return this.authService.currentUser?.firstName ?? 'Account'; }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { keyword: this.searchQuery.trim() } });
    }
  }

  logout() {
    this.dropdownOpen = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

