import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Cart } from '../../models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      <div class="steps-bar">
        <div class="step" [class.active]="step >= 1"><span>1</span> Address</div>
        <div class="step-line"></div>
        <div class="step" [class.active]="step >= 2"><span>2</span> Payment</div>
        <div class="step-line"></div>
        <div class="step" [class.active]="step >= 3"><span>3</span> Summary</div>
      </div>

      <div class="checkout-layout">
        <div class="checkout-main">
          <!-- Step 1: Address -->
          <div class="step-card card" *ngIf="step === 1">
            <div class="step-header"><h3>Delivery Address</h3></div>
            <div class="step-body">
              <div class="row-2">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input [(ngModel)]="address.name" class="form-control" required/>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone *</label>
                  <input [(ngModel)]="address.phone" class="form-control" required/>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Address *</label>
                <textarea [(ngModel)]="address.line" class="form-control" rows="2" required></textarea>
              </div>
              <div class="row-3">
                <div class="form-group">
                  <label class="form-label">City *</label>
                  <input [(ngModel)]="address.city" class="form-control" required/>
                </div>
                <div class="form-group">
                  <label class="form-label">State *</label>
                  <input [(ngModel)]="address.state" class="form-control" required/>
                </div>
                <div class="form-group">
                  <label class="form-label">Pincode *</label>
                  <input [(ngModel)]="address.pincode" class="form-control" required/>
                </div>
              </div>
              <button class="btn btn-primary" (click)="step = 2">Deliver Here</button>
            </div>
          </div>

          <!-- Step 2: Payment -->
          <div class="step-card card" *ngIf="step === 2">
            <div class="step-header"><h3>Payment Method</h3></div>
            <div class="step-body">
              <div *ngFor="let m of paymentMethods" class="payment-option"
                   [class.selected]="paymentMethod === m.value"
                   (click)="paymentMethod = m.value">
                <div class="radio-indicator"></div>
                <span class="material-icons">{{m.icon}}</span>
                <div>
                  <strong>{{m.label}}</strong>
                  <p>{{m.desc}}</p>
                </div>
              </div>
              <!-- Card fields -->
              <div *ngIf="paymentMethod !== 'CASH_ON_DELIVERY'" class="card-fields">
                <div class="form-group">
                  <label class="form-label">Card Number</label>
                  <input [(ngModel)]="card.number" class="form-control" placeholder="XXXX XXXX XXXX XXXX" maxlength="19"/>
                </div>
                <div class="row-2">
                  <div class="form-group">
                    <label class="form-label">Expiry</label>
                    <input [(ngModel)]="card.expiry" class="form-control" placeholder="MM/YY"/>
                  </div>
                  <div class="form-group">
                    <label class="form-label">CVV</label>
                    <input [(ngModel)]="card.cvv" class="form-control" placeholder="CVV" maxlength="3" type="password"/>
                  </div>
                </div>
              </div>
              <div class="step-btns">
                <button class="btn btn-outline" (click)="step = 1">Back</button>
                <button class="btn btn-primary" (click)="step = 3">Continue</button>
              </div>
            </div>
          </div>

          <!-- Step 3: Summary -->
          <div class="step-card card" *ngIf="step === 3">
            <div class="step-header"><h3>Order Summary</h3></div>
            <div class="step-body">
              <div *ngFor="let item of cart?.items" class="order-item">
                <img [src]="item.imageUrl" class="order-item-img"/>
                <div class="order-item-info">
                  <p>{{item.productName}}</p>
                  <span>Qty: {{item.quantity}} × ₹{{item.price | number}}</span>
                </div>
                <strong>₹{{item.subtotal | number}}</strong>
              </div>
              <div class="address-review">
                <strong>Delivering to:</strong>
                <p>{{address.name}}, {{address.line}}, {{address.city}}, {{address.state}} - {{address.pincode}}</p>
              </div>
              <p class="error-msg" *ngIf="orderError">{{orderError}}</p>
              <div class="step-btns">
                <button class="btn btn-outline" (click)="step = 2">Back</button>
                <button class="btn btn-accent" [disabled]="placingOrder" (click)="placeOrder()">
                  {{placingOrder ? 'Placing Order...' : 'Place Order · ₹' + (cart?.totalPrice | number)}}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Price Summary Sidebar -->
        <div class="price-sidebar card" *ngIf="cart">
          <h3 class="sum-title">PRICE DETAILS</h3>
          <div class="sum-row"><span>Items</span><span>{{cart.totalItems}}</span></div>
          <div class="sum-row"><span>Total MRP</span><span>₹{{cart.totalPrice | number}}</span></div>
          <div class="sum-row"><span>Delivery</span><span class="green">FREE</span></div>
          <div class="sum-row bold"><span>Total</span><span>₹{{cart.totalPrice | number}}</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1100px; margin: 0 auto; padding: 16px; }
    .steps-bar { display: flex; align-items: center; background: #fff; padding: 16px 24px;
                 border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,.1); margin-bottom: 16px; }
    .step { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #878787; }
    .step.active { color: #2874f0; }
    .step span { width: 28px; height: 28px; border-radius: 50%; border: 2px solid currentColor;
                 display: flex; align-items: center; justify-content: center; font-size: 13px; }
    .step-line { flex: 1; height: 2px; background: #e0e0e0; margin: 0 16px; }
    .checkout-layout { display: flex; gap: 16px; align-items: flex-start; }
    .checkout-main { flex: 1; }
    .step-card { margin-bottom: 8px; overflow: hidden; }
    .step-header { background: #2874f0; color: #fff; padding: 12px 20px; }
    .step-header h3 { font-size: 16px; font-weight: 600; }
    .step-body { padding: 20px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .payment-option { display: flex; align-items: flex-start; gap: 14px; padding: 14px;
                      border: 2px solid #e0e0e0; border-radius: 4px; cursor: pointer; margin-bottom: 10px; transition: .2s; }
    .payment-option.selected { border-color: #2874f0; background: #e8f0fe; }
    .payment-option .radio-indicator { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #e0e0e0;
                                        margin-top: 2px; flex-shrink: 0; }
    .payment-option.selected .radio-indicator { border-color: #2874f0; background: #2874f0; box-shadow: inset 0 0 0 3px #fff; }
    .payment-option .material-icons { color: #555; }
    .payment-option strong { font-size: 15px; display: block; margin-bottom: 2px; }
    .payment-option p { font-size: 12px; color: #878787; }
    .card-fields { background: #f9f9f9; padding: 14px; border-radius: 4px; margin-top: 12px; }
    .step-btns { display: flex; gap: 12px; margin-top: 16px; }
    .order-item { display: flex; gap: 12px; align-items: center; padding: 10px 0;
                  border-bottom: 1px solid #f0f0f0; }
    .order-item-img { width: 56px; height: 56px; object-fit: contain; border-radius: 4px; }
    .order-item-info { flex: 1; font-size: 14px; }
    .order-item-info span { font-size: 12px; color: #878787; }
    .address-review { background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 16px 0; font-size: 14px; }
    .error-msg { color: #c62828; font-size: 13px; margin-bottom: 12px; }
    .price-sidebar { width: 280px; padding: 20px; flex-shrink: 0; }
    .sum-title { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #878787;
                 margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0; }
    .sum-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; }
    .sum-row.bold { font-weight: 700; font-size: 16px; padding-top: 10px;
                    border-top: 1px solid #e0e0e0; margin-top: 6px; }
    .green { color: #388e3c; font-weight: 600; }
    @media (max-width: 768px) { .checkout-layout { flex-direction: column; } .price-sidebar { width: 100%; }
      .row-2, .row-3 { grid-template-columns: 1fr; } }
  `]
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  step = 1;
  placingOrder = false;
  orderError = '';
  address = { name: '', phone: '', line: '', city: '', state: '', pincode: '' };
  paymentMethod = 'CASH_ON_DELIVERY';
  card = { number: '', expiry: '', cvv: '' };
  paymentMethods = [
    { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', desc: 'Pay when delivered', icon: 'payments' },
    { value: 'CREDIT_CARD',      label: 'Credit Card',      desc: 'Visa, Mastercard, Amex', icon: 'credit_card' },
    { value: 'DEBIT_CARD',       label: 'Debit Card',       desc: 'All Indian bank cards', icon: 'credit_card' }
  ];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.getCart().subscribe(c => this.cart = c);
    const user = this.authService.currentUser;
    if (user) this.address.name = `${user.firstName} ${user.lastName}`;
  }

  placeOrder() {
    if (!this.cart || this.cart.items.length === 0) return;
    this.placingOrder = true;
    this.orderError = '';
    const shippingAddr = `${this.address.name}, ${this.address.line}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
    const req = {
      items: this.cart.items.map(i => ({
        productId: i.productId, productName: i.productName,
        imageUrl: i.imageUrl, price: i.price, quantity: i.quantity, sellerId: i.sellerId
      })),
      shippingAddress: shippingAddr,
      paymentMethod: this.paymentMethod
    };
    this.orderService.placeOrder(req).subscribe({
      next: (order) => {
        this.cartService.clearCart().subscribe();
        this.router.navigate(['/orders'], { queryParams: { success: order.orderNumber } });
      },
      error: (e) => {
        this.placingOrder = false;
        this.orderError = e.error?.message || 'Failed to place order. Please try again.';
      }
    });
  }
}
