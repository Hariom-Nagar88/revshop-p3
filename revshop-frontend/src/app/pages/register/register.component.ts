import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card wide">
        <div class="auth-left">
          <h2>Create Account</h2>
          <p>Shop smarter. Sell faster. Join RevShop today.</p>
        </div>
        <div class="auth-right">
          <!-- Role selector -->
          <div class="role-tabs">
            <button [class.active]="role === 'BUYER'" (click)="role='BUYER'">
              <span class="material-icons">shopping_bag</span> Buyer
            </button>
            <button [class.active]="role === 'SELLER'" (click)="role='SELLER'">
              <span class="material-icons">store</span> Seller
            </button>
          </div>
          <form (ngSubmit)="onRegister()">
            <div class="row-2">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input [(ngModel)]="form.firstName" name="firstName" class="form-control" required/>
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input [(ngModel)]="form.lastName" name="lastName" class="form-control" required/>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input [(ngModel)]="form.email" name="email" type="email" class="form-control" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Password *</label>
              <input [(ngModel)]="form.password" name="password" type="password" class="form-control" required minlength="6"/>
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input [(ngModel)]="form.phone" name="phone" class="form-control"/>
            </div>
            <div class="row-2">
              <div class="form-group">
                <label class="form-label">City</label>
                <input [(ngModel)]="form.city" name="city" class="form-control"/>
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input [(ngModel)]="form.state" name="state" class="form-control"/>
              </div>
            </div>
            <p class="error-msg" *ngIf="errorMsg">{{errorMsg}}</p>
            <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
              {{loading ? 'Creating Account...' : 'Create Account'}}
            </button>
          </form>
          <p class="divider">Already have an account? <a routerLink="/login">Login</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 64px); display: flex; align-items: center;
                 justify-content: center; background: #f1f3f6; padding: 24px; }
    .auth-card { display: flex; background: #fff; border-radius: 4px; box-shadow: 0 2px 16px rgba(0,0,0,.15);
                 overflow: hidden; width: 100%; max-width: 700px; }
    .auth-card.wide { max-width: 860px; }
    .auth-left  { background: #2874f0; color: #fff; padding: 40px 32px; width: 35%;
                  display: flex; flex-direction: column; justify-content: center; }
    .auth-left h2 { font-size: 28px; font-weight: 700; margin-bottom: 16px; }
    .auth-left p  { font-size: 14px; opacity: .85; line-height: 1.7; }
    .auth-right { padding: 32px; flex: 1; overflow-y: auto; }
    .role-tabs { display: flex; gap: 12px; margin-bottom: 24px; }
    .role-tabs button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
                         padding: 12px; border: 2px solid #e0e0e0; border-radius: 4px; background: #fff;
                         font-size: 14px; font-weight: 600; color: #555; cursor: pointer; transition: all .2s; }
    .role-tabs button.active { border-color: #2874f0; color: #2874f0; background: #e8f0fe; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .w-full { width: 100%; justify-content: center; padding: 14px; margin-top: 8px; }
    .error-msg { color: #c62828; font-size: 13px; margin-bottom: 12px; }
    .divider { text-align: center; margin-top: 20px; font-size: 14px; color: #878787; }
    .divider a { color: #2874f0; font-weight: 600; }
    @media (max-width: 600px) { .auth-left { display: none; } .row-2 { grid-template-columns: 1fr; } }
  `]
})
export class RegisterComponent {
  role = 'BUYER';
  loading = false;
  errorMsg = '';
  form = { firstName: '', lastName: '', email: '', password: '', phone: '', city: '', state: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.errorMsg = '';
    this.loading = true;
    this.authService.register({ ...this.form, role: this.role }).subscribe({
      next: () => {
        if (this.role === 'SELLER') this.router.navigate(['/seller/dashboard']);
        else this.router.navigate(['/']);
      },
      error: (e) => {
        this.loading = false;
        this.errorMsg = e.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
