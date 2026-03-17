import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order, PageResponse } from '../../models';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard">
      <aside class="seller-sidebar">
        <div class="seller-brand"><span class="material-icons">store</span><span>Seller Hub</span></div>
        <nav>
          <a routerLink="/seller/dashboard" class="nav-item"><span class="material-icons">dashboard</span> Dashboard</a>
          <a routerLink="/seller/products" class="nav-item"><span class="material-icons">inventory_2</span> Products</a>
          <a routerLink="/seller/orders" routerLinkActive="active" class="nav-item"><span class="material-icons">receipt_long</span> Orders</a>
        </nav>
      </aside>
      <main class="seller-main">
        <div class="dash-header"><h1>Orders</h1></div>

        <div *ngIf="loading" class="spinner-wrap"><div class="spinner"></div></div>

        <div *ngFor="let order of orders" class="order-card card">
          <div class="order-header">
            <div>
              <strong>{{order.orderNumber}}</strong>
              <span class="order-date">· {{order.createdAt | date:'mediumDate'}}</span>
            </div>
            <div class="header-right">
              <span [class]="'badge badge-' + statusColor(order.status)">{{order.status}}</span>
              <div class="status-update" *ngIf="order.status !== 'DELIVERED' && order.status !== 'CANCELLED'">
                <select [(ngModel)]="statusMap[order.id]" class="status-select">
                  <option value="">Update Status</option>
                  <option *ngFor="let s of allowedStatuses(order.status)" [value]="s">{{s}}</option>
                </select>
                <input *ngIf="statusMap[order.id] === 'SHIPPED'" [(ngModel)]="trackingMap[order.id]"
                       class="form-control track-input" placeholder="Tracking #"/>
                <button class="btn btn-primary btn-sm" (click)="updateStatus(order)"
                        [disabled]="!statusMap[order.id]">Update</button>
              </div>
            </div>
          </div>

          <div class="order-body">
            <div class="customer-info">
              <span class="material-icons">person</span>
              <span>{{order.buyerName || order.buyerEmail}}</span>
              <span class="sep">|</span>
              <span class="material-icons">location_on</span>
              <span>{{order.shippingAddress}}</span>
            </div>
            <div class="order-items">
              <div *ngFor="let item of order.items" class="oi-row">
                <img [src]="item.imageUrl || 'assets/placeholder.png'" class="oi-img"/>
                <div class="oi-info">
                  <p>{{item.productName}}</p>
                  <span>Qty: {{item.quantity}} × ₹{{item.price | number}}</span>
                </div>
                <strong>₹{{item.subtotal | number}}</strong>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <span class="payment-badge">
              <span class="material-icons">payments</span> {{order.paymentMethod}}
            </span>
            <strong class="order-total">Total: ₹{{order.totalAmount | number}}</strong>
          </div>
        </div>

        <div *ngIf="!loading && orders.length === 0" class="empty-state">
          <span class="material-icons">receipt_long</span><h3>No orders yet</h3>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" [disabled]="page===0" (click)="loadOrders(page-1)"><span class="material-icons">chevron_left</span></button>
          <button *ngFor="let p of pageNums" class="page-btn" [class.active]="p===page" (click)="loadOrders(p)">{{p+1}}</button>
          <button class="page-btn" [disabled]="page===totalPages-1" (click)="loadOrders(page+1)"><span class="material-icons">chevron_right</span></button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; min-height: calc(100vh - 64px); }
    .seller-sidebar { width: 220px; background: #172337; color: #fff; flex-shrink: 0; padding: 20px 0; }
    .seller-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 20px; font-size: 18px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,.1); }
    .seller-brand .material-icons { color: #ffe082; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: rgba(255,255,255,.7); font-size: 14px; transition: .2s; border-left: 3px solid transparent; }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,.08); color: #fff; border-left-color: #2874f0; }
    .seller-main { flex: 1; padding: 24px; background: #f1f3f6; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .dash-header h1 { font-size: 24px; font-weight: 700; }
    .order-card { margin-bottom: 12px; overflow: hidden; }
    .order-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;
                    gap: 10px; padding: 14px 16px; background: #f9f9f9; border-bottom: 1px solid #f0f0f0; }
    .order-date { font-size: 13px; color: #878787; }
    .header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .status-update { display: flex; align-items: center; gap: 8px; }
    .status-select { padding: 6px 10px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 13px; }
    .track-input { width: 130px; padding: 6px 8px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 13px; }
    .order-body { padding: 12px 16px; }
    .customer-info { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555;
                     margin-bottom: 12px; flex-wrap: wrap; }
    .customer-info .material-icons { font-size: 15px; color: #878787; }
    .sep { color: #e0e0e0; }
    .oi-row { display: flex; gap: 12px; align-items: center; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
    .oi-img { width: 52px; height: 52px; object-fit: contain; border: 1px solid #f0f0f0; border-radius: 4px; }
    .oi-info { flex: 1; font-size: 14px; }
    .oi-info span { font-size: 12px; color: #878787; }
    .order-footer { display: flex; justify-content: space-between; align-items: center;
                    padding: 10px 16px; border-top: 1px solid #f0f0f0; background: #fafafa; }
    .payment-badge { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #555; }
    .payment-badge .material-icons { font-size: 16px; }
    .order-total { font-size: 15px; }
    @media (max-width: 768px) { .seller-sidebar { display: none; } }
  `]
})
export class SellerOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  page = 0;
  totalPages = 0;
  statusMap: { [id: number]: string } = {};
  trackingMap: { [id: number]: string } = {};

  constructor(private orderService: OrderService) {}

  ngOnInit() { this.loadOrders(0); }

  loadOrders(p: number) {
    this.loading = true; this.page = p;
    this.orderService.getSellerOrders(p, 10).subscribe({
      next: (res: PageResponse<Order>) => { this.orders = res.content; this.totalPages = res.totalPages; this.loading = false; },
      error: () => this.loading = false
    });
  }

  updateStatus(order: Order) {
    const status = this.statusMap[order.id];
    if (!status) return;
    const tracking = this.trackingMap[order.id] || '';
    this.orderService.updateOrderStatus(order.id, status, tracking).subscribe({
      next: updated => {
        const idx = this.orders.findIndex(o => o.id === order.id);
        if (idx >= 0) this.orders[idx] = updated;
        delete this.statusMap[order.id];
        delete this.trackingMap[order.id];
      }
    });
  }

  allowedStatuses(current: string): string[] {
    const flow: Record<string, string[]> = {
      CONFIRMED: ['SHIPPED', 'CANCELLED'],
      SHIPPED:   ['DELIVERED'],
      PENDING:   ['CONFIRMED', 'CANCELLED']
    };
    return flow[current] || [];
  }

  statusColor(s: string) {
    return { CONFIRMED:'info', SHIPPED:'warning', DELIVERED:'success', CANCELLED:'danger', PENDING:'info' }[s] || 'info';
  }

  get pageNums(): number[] {
    const s = Math.max(0, this.page - 2), e = Math.min(this.totalPages - 1, this.page + 2);
    return Array.from({ length: e - s + 1 }, (_, i) => i + s);
  }
}
