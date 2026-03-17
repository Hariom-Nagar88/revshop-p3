import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { SellerStats, Product } from '../../models';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <!-- Sidebar -->
      <aside class="seller-sidebar">
        <div class="seller-brand">
          <span class="material-icons">store</span>
          <span>Seller Hub</span>
        </div>
        <nav>
          <a routerLink="/seller/dashboard" routerLinkActive="active" class="nav-item">
            <span class="material-icons">dashboard</span> Dashboard
          </a>
          <a routerLink="/seller/products" routerLinkActive="active" class="nav-item">
            <span class="material-icons">inventory_2</span> Products
          </a>
          <a routerLink="/seller/orders" routerLinkActive="active" class="nav-item">
            <span class="material-icons">receipt_long</span> Orders
          </a>
        </nav>
      </aside>

      <!-- Main -->
      <main class="seller-main">
        <div class="dash-header">
          <h1>Dashboard</h1>
          <a routerLink="/seller/products" class="btn btn-primary">
            <span class="material-icons">add</span> Add Product
          </a>
        </div>

        <!-- Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon blue"><span class="material-icons">receipt_long</span></div>
            <div class="stat-info">
              <p class="stat-value">{{stats?.totalOrders ?? 0}}</p>
              <p class="stat-label">Total Orders</p>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon green"><span class="material-icons">currency_rupee</span></div>
            <div class="stat-info">
              <p class="stat-value">₹{{(stats?.totalRevenue ?? 0) | number:'1.0-0'}}</p>
              <p class="stat-label">Total Revenue</p>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon orange"><span class="material-icons">inventory_2</span></div>
            <div class="stat-info">
              <p class="stat-value">{{totalProducts}}</p>
              <p class="stat-label">Total Products</p>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon red"><span class="material-icons">warning</span></div>
            <div class="stat-info">
              <p class="stat-value">{{lowStockProducts.length}}</p>
              <p class="stat-label">Low Stock Alerts</p>
            </div>
          </div>
        </div>

        <!-- Order Status Breakdown -->
        <div class="section-row">
          <div class="card half-card" *ngIf="stats">
            <div class="section-header"><h3 class="section-title">Order Status</h3></div>
            <div class="status-breakdown">
              <div class="status-row" *ngFor="let s of orderStatuses">
                <span class="status-dot" [style.background]="s.color"></span>
                <span class="status-name">{{s.label}}</span>
                <span class="status-bar-wrap">
                  <span class="status-bar" [style.width.%]="barWidth(s.value)" [style.background]="s.color"></span>
                </span>
                <span class="status-count">{{s.value}}</span>
              </div>
            </div>
          </div>

          <!-- Low Stock Alerts -->
          <div class="card half-card">
            <div class="section-header">
              <h3 class="section-title">⚠️ Low Stock Alerts</h3>
              <a routerLink="/seller/products" class="see-all-link">Manage</a>
            </div>
            <div *ngIf="lowStockProducts.length === 0" class="empty-mini">All products well stocked</div>
            <div *ngFor="let p of lowStockProducts" class="low-stock-row">
              <img [src]="p.imageUrl || 'assets/placeholder.png'" class="ls-img"/>
              <div class="ls-info">
                <p class="ls-name">{{p.name}}</p>
                <p class="ls-stock">{{p.stock}} units left</p>
              </div>
              <span class="badge badge-danger">Low</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; min-height: calc(100vh - 64px); }
    .seller-sidebar { width: 220px; background: #172337; color: #fff; flex-shrink: 0;
                       padding: 20px 0; }
    .seller-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 20px;
                    font-size: 18px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,.1); }
    .seller-brand .material-icons { color: #ffe082; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: rgba(255,255,255,.7);
                font-size: 14px; cursor: pointer; transition: .2s; border-left: 3px solid transparent; }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,.08); color: #fff; border-left-color: #2874f0; }
    .seller-main { flex: 1; padding: 24px; background: #f1f3f6; overflow-y: auto; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .dash-header h1 { font-size: 24px; font-weight: 700; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
    .stat-card { display: flex; gap: 16px; align-items: center; padding: 20px; }
    .stat-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.blue   { background: #e3f2fd; } .stat-icon.blue .material-icons   { color: #1565c0; }
    .stat-icon.green  { background: #e8f5e9; } .stat-icon.green .material-icons  { color: #388e3c; }
    .stat-icon.orange { background: #fff3e0; } .stat-icon.orange .material-icons { color: #e65100; }
    .stat-icon.red    { background: #ffebee; } .stat-icon.red .material-icons    { color: #c62828; }
    .stat-value { font-size: 24px; font-weight: 700; color: #212121; }
    .stat-label { font-size: 13px; color: #878787; }
    .section-row { display: flex; gap: 16px; }
    .half-card { flex: 1; overflow: hidden; }
    .see-all-link { font-size: 13px; color: #2874f0; font-weight: 600; }
    .status-breakdown { padding: 16px; }
    .status-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .status-name { width: 90px; font-size: 14px; color: #555; }
    .status-bar-wrap { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
    .status-bar { height: 100%; border-radius: 4px; transition: width .4s; }
    .status-count { font-weight: 700; font-size: 14px; min-width: 24px; text-align: right; }
    .empty-mini { padding: 24px; text-align: center; color: #878787; font-size: 14px; }
    .low-stock-row { display: flex; gap: 12px; align-items: center; padding: 10px 16px;
                     border-bottom: 1px solid #f5f5f5; }
    .ls-img  { width: 44px; height: 44px; object-fit: contain; border-radius: 4px; }
    .ls-info { flex: 1; }
    .ls-name { font-size: 14px; color: #212121; }
    .ls-stock { font-size: 12px; color: #c62828; font-weight: 600; }
    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .seller-sidebar { display: none; } .section-row { flex-direction: column; } }
  `]
})
export class SellerDashboardComponent implements OnInit {
  stats: SellerStats | null = null;
  lowStockProducts: Product[] = [];
  totalProducts = 0;

  constructor(private orderService: OrderService, private productService: ProductService) {}

  ngOnInit() {
    this.orderService.getSellerStats().subscribe(s => this.stats = s);
    this.productService.getLowStock().subscribe(p => this.lowStockProducts = p);
    this.productService.getSellerProducts(0, 1).subscribe(p => this.totalProducts = p.totalElements);
  }

  get orderStatuses() {
    if (!this.stats) return [];
    return [
      { label: 'Confirmed',  value: this.stats.confirmedOrders,  color: '#1565c0' },
      { label: 'Shipped',    value: this.stats.shippedOrders,    color: '#f57f17' },
      { label: 'Delivered',  value: this.stats.deliveredOrders,  color: '#388e3c' },
      { label: 'Cancelled',  value: this.stats.cancelledOrders,  color: '#c62828' },
    ];
  }

  barWidth(val: number): number {
    const max = Math.max(...this.orderStatuses.map(s => s.value), 1);
    return (val / max) * 100;
  }
}
