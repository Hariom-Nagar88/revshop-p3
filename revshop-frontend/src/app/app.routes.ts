import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'products', loadComponent: () => import('./pages/product-list/product-list.component').then(m => m.ProductListComponent) },
  { path: 'products/:id', loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },

  // Buyer routes
  { path: 'cart', canActivate: [authGuard], data: { role: 'BUYER' },
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
  { path: 'wishlist', canActivate: [authGuard], data: { role: 'BUYER' },
    loadComponent: () => import('./pages/wishlist/wishlist.component').then(m => m.WishlistComponent) },
  { path: 'checkout', canActivate: [authGuard], data: { role: 'BUYER' },
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'orders', canActivate: [authGuard], data: { role: 'BUYER' },
    loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent) },
  { path: 'orders/track', canActivate: [authGuard],
    loadComponent: () => import('./pages/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent) },

  // Seller routes
  { path: 'seller/dashboard', canActivate: [authGuard], data: { role: 'SELLER' },
    loadComponent: () => import('./pages/seller-dashboard/seller-dashboard.component').then(m => m.SellerDashboardComponent) },
  { path: 'seller/products', canActivate: [authGuard], data: { role: 'SELLER' },
    loadComponent: () => import('./pages/seller-products/seller-products.component').then(m => m.SellerProductsComponent) },
  { path: 'seller/orders', canActivate: [authGuard], data: { role: 'SELLER' },
    loadComponent: () => import('./pages/seller-orders/seller-orders.component').then(m => m.SellerOrdersComponent) },

  { path: '**', redirectTo: '' }
];
