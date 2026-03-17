import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, PageResponse } from '../../models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h2 class="page-title">My Orders</h2>

      <div class="success-banner card" *ngIf="successOrderNum">
        <span class="material-icons" style="color:#388e3c">check_circle</span>
        <div>
          <strong>Order Placed Successfully!</strong>
          <p>Order #{{successOrderNum}} confirmed. You'll receive a confirmation email shortly.</p>
        </div>
      </div>

      <div *ngIf="loading" class="spinner-wrap"><div class="spinner"></div></div>

      <div *ngIf="!loading && orders.length === 0" class="empty-state">
        <span class="material-icons">receipt_long</span>
        <h3>No orders yet</h3>
        <p>Order something and track it here</p>
        <a routerLink="/products" class="btn btn-primary" style="margin-top:16px">Start Shopping</a>
      </div>

      <div *ngFor="let order of orders" class="order-card card">
        <div class="order-header">
          <div>
            <strong>Order #{{order.orderNumber}}</strong>
            <span [class]="'badge badge-' + statusColor(order.status)" style="margin-left:10px">
              {{order.status}}
            </span>
          </div>
          <span class="order-date">{{order.createdAt | date:'mediumDate'}}</span>
        </div>
        <div class="order-items">
          <div *ngFor="let item of order.items" class="oi-row">
            <img [src]="item.imageUrl || 'assets/placeholder.png'" class="oi-img"/>
            <div class="oi-info">
              <p class="oi-name">{{item.productName}}</p>
              <p class="oi-meta">Qty: {{item.quantity}} × ₹{{item.price | number}}</p>
            </div>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-total">Total: <strong>₹{{order.totalAmount | number}}</strong></span>
          <div class="order-actions">
            <a [routerLink]="['/orders/track']" [queryParams]="{orderNumber: order.orderNumber}"
               class="btn btn-outline btn-sm">Track Order</a>
            <button *ngIf="order.status === 'CONFIRMED'" class="btn btn-sm"
                    style="border:1px solid #c62828;color:#c62828" (click)="cancel(order.id)">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button class="page-btn" [disabled]="page===0" (click)="loadOrders(page-1)">
          <span class="material-icons">chevron_left</span>
        </button>
        <button *ngFor="let p of pageNums" class="page-btn" [class.active]="p===page" (click)="loadOrders(p)">{{p+1}}</button>
        <button class="page-btn" [disabled]="page===totalPages-1" (click)="loadOrders(page+1)">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 0 auto; padding: 16px; }
    .page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
    .success-banner { display: flex; gap: 16px; align-items: flex-start; padding: 16px;
                       background: #e8f5e9; margin-bottom: 16px; }
    .success-banner strong { display: block; font-size: 16px; color: #212121; }
    .success-banner p { font-size: 13px; color: #555; margin-top: 2px; }
    .order-card { margin-bottom: 10px; overflow: hidden; }
    .order-header { display: flex; justify-content: space-between; align-items: center;
                    padding: 14px 16px; background: #f9f9f9; border-bottom: 1px solid #f0f0f0; }
    .order-date { font-size: 13px; color: #878787; }
    .order-items { padding: 12px 16px; }
    .oi-row  { display: flex; gap: 12px; align-items: center; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
    .oi-img  { width: 60px; height: 60px; object-fit: contain; border: 1px solid #f0f0f0; border-radius: 4px; }
    .oi-name { font-size: 14px; color: #212121; margin-bottom: 4px; }
    .oi-meta { font-size: 13px; color: #878787; }
    .order-footer { display: flex; justify-content: space-between; align-items: center;
                    padding: 12px 16px; border-top: 1px solid #f0f0f0; }
    .order-total { font-size: 15px; }
    .order-actions { display: flex; gap: 8px; }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  page = 0;
  totalPages = 0;
  successOrderNum = '';

  constructor(private orderService: OrderService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => { this.successOrderNum = p['success'] || ''; });
    this.loadOrders(0);
  }

  loadOrders(p: number) {
    this.loading = true;
    this.page = p;
    this.orderService.getMyOrders(p, 10).subscribe({
      next: (res: PageResponse<Order>) => {
        this.orders = res.content; this.totalPages = res.totalPages; this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this order?')) return;
    this.orderService.cancelOrder(id).subscribe(() => this.loadOrders(this.page));
  }

  statusColor(s: string) {
    return { CONFIRMED: 'info', SHIPPED: 'warning', DELIVERED: 'success', CANCELLED: 'danger', PENDING: 'info' }[s] || 'info';
  }

  get pageNums(): number[] {
    const s = Math.max(0, this.page - 2), e = Math.min(this.totalPages - 1, this.page + 2);
    return Array.from({ length: e - s + 1 }, (_, i) => i + s);
  }
}
