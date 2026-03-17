import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      <h2 class="page-title">Track Order</h2>
      <div class="search-box card">
        <input [(ngModel)]="orderNum" class="form-control" placeholder="Enter Order Number (e.g. REV-1234567890-1234)"/>
        <button class="btn btn-primary" (click)="track()">Track</button>
      </div>

      <div *ngIf="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div *ngIf="error" class="error-card card">{{error}}</div>

      <div *ngIf="order" class="track-card card">
        <div class="track-header">
          <div>
            <h3>Order #{{order.orderNumber}}</h3>
            <p>Placed on {{order.createdAt | date:"longDate"}}</p>
          </div>
          <span [class]="'badge badge-' + statusColor(order.status)" style="font-size:14px;padding:6px 14px">
            {{order.status}}
          </span>
        </div>

        <div class="progress-track">
          <div *ngFor="let s of statusSteps; let i = index" class="track-step"
               [class.done]="isStepDone(s)" [class.current]="isCurrentStep(s)">
            <div class="track-dot">
              <span class="material-icons">{{isStepDone(s) ? "check_circle" : "radio_button_unchecked"}}</span>
            </div>
            <div class="track-label">{{s}}</div>
            <div class="track-line" *ngIf="i < statusSteps.length - 1"></div>
          </div>
        </div>

        <div class="track-info">
          <div class="info-row" *ngIf="order.trackingNumber">
            <span class="material-icons">local_shipping</span>
            <div><strong>Tracking #:</strong> {{order.trackingNumber}}</div>
          </div>
          <div class="info-row">
            <span class="material-icons">location_on</span>
            <div><strong>Deliver to:</strong> {{order.shippingAddress}}</div>
          </div>
          <div class="info-row">
            <span class="material-icons">payments</span>
            <div><strong>Payment:</strong> {{order.paymentMethod}} - Rs.{{order.totalAmount}}</div>
          </div>
        </div>

        <div class="track-items">
          <h4>Items in this order</h4>
          <div *ngFor="let item of order.items" class="ti-row">
            <img [src]="item.imageUrl" class="ti-img"/>
            <div>
              <p>{{item.productName}}</p>
              <span>Qty: {{item.quantity}} - Rs.{{item.price}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 16px; }
    .page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
    .search-box { display: flex; gap: 12px; padding: 16px; margin-bottom: 16px; }
    .search-box .form-control { flex: 1; }
    .error-card { padding: 16px; color: #c62828; background: #ffebee; }
    .track-card { overflow: hidden; }
    .track-header { display: flex; justify-content: space-between; align-items: flex-start;
                    padding: 20px; background: #f9f9f9; border-bottom: 1px solid #f0f0f0; }
    .track-header h3 { font-size: 18px; font-weight: 700; }
    .track-header p  { font-size: 13px; color: #878787; margin-top: 4px; }
    .progress-track { display: flex; align-items: flex-start; padding: 32px 20px; overflow-x: auto; }
    .track-step { display: flex; flex-direction: column; align-items: center; position: relative; min-width: 80px; }
    .track-dot .material-icons { font-size: 28px; color: #e0e0e0; }
    .track-step.done .track-dot .material-icons { color: #388e3c; }
    .track-step.current .track-dot .material-icons { color: #2874f0; }
    .track-label { font-size: 12px; text-align: center; margin-top: 6px; color: #878787; }
    .track-step.done .track-label, .track-step.current .track-label { color: #212121; font-weight: 600; }
    .track-line { position: absolute; top: 14px; left: 50%; width: 100%; height: 2px; background: #e0e0e0; }
    .track-step.done .track-line { background: #388e3c; }
    .track-info { padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
    .info-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; font-size: 14px; }
    .info-row .material-icons { color: #2874f0; }
    .track-items { padding: 16px 20px; }
    .track-items h4 { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
    .ti-row { display: flex; gap: 12px; align-items: center; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
    .ti-img { width: 56px; height: 56px; object-fit: contain; border: 1px solid #f0f0f0; border-radius: 4px; }
  `]
})
export class OrderTrackingComponent implements OnInit {
  orderNum = '';
  order: Order | null = null;
  loading = false;
  error = '';
  statusSteps = ['CONFIRMED', 'SHIPPED', 'DELIVERED'];

  constructor(private orderService: OrderService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['orderNumber']) { this.orderNum = p['orderNumber']; this.track(); }
    });
  }

  track() {
    if (!this.orderNum.trim()) return;
    this.loading = true; this.error = ''; this.order = null;
    this.orderService.trackOrder(this.orderNum.trim()).subscribe({
      next: o => { this.order = o; this.loading = false; },
      error: () => { this.error = 'Order not found. Please check the order number.'; this.loading = false; }
    });
  }

  isStepDone(step: string): boolean {
    if (!this.order) return false;
    const idx = this.statusSteps.indexOf(step);
    const cur = this.statusSteps.indexOf(this.order.status);
    return cur >= idx && this.order.status !== 'CANCELLED';
  }

  isCurrentStep(step: string): boolean { return this.order?.status === step; }

  statusColor(s: string): string {
    const map: Record<string, string> = { CONFIRMED:'info', SHIPPED:'warning', DELIVERED:'success', CANCELLED:'danger' };
    return map[s] || 'info';
  }
}
