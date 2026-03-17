import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-left">
          <h2>Login</h2>
          <p>Get access to your Orders, Wishlist and Recommendations</p>
          <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png" alt="Login"/>
        </div>
        <div class="auth-right">
          <form (ngSubmit)="onLogin()">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input [(ngModel)]="email" name="email" type="email"
                     class="form-control" placeholder="Enter email" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input [(ngModel)]="password" name="password" type="password"
                     class="form-control" placeholder="Enter password" required/>
            </div>
            <p class="error-msg" *ngIf="errorMsg">{{errorMsg}}</p>
            <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
              <span *ngIf="loading" class="spinner-sm"></span>
              {{loading ? 'Logging in...' : 'Login'}}
            </button>
          </form>
          <p class="divider">New to RevShop? <a routerLink="/register">Create an account</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 64px); display: flex; align-items: center;
                 justify-content: center; background: #f1f3f6; padding: 24px; }
    .auth-card { display: flex; background: #fff; border-radius: 4px; box-shadow: 0 2px 16px rgba(0,0,0,.15);
                 overflow: hidden; width: 100%; max-width: 700px; min-height: 460px; }
    .auth-left  { background: #2874f0; color: #fff; padding: 40px 32px; width: 40%; display: flex;
                  flex-direction: column; justify-content: space-between; }
    .auth-left h2 { font-size: 28px; font-weight: 700; margin-bottom: 12px; }
    .auth-left p  { font-size: 14px; opacity: .85; line-height: 1.6; }
    .auth-left img { width: 160px; margin-top: 24px; }
    .auth-right { padding: 40px 32px; flex: 1; }
    .w-full { width: 100%; justify-content: center; padding: 14px; margin-top: 8px; }
    .error-msg { color: #c62828; font-size: 13px; margin-bottom: 12px; }
    .divider { text-align: center; margin-top: 24px; font-size: 14px; color: #878787; }
    .divider a { color: #2874f0; font-weight: 600; }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4);
                  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
                  display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 600px) { .auth-left { display: none; } }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) this.redirectUser();
  }

  onLogin() {
    this.errorMsg = '';
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.redirectUser(),
      error: (e) => {
        this.loading = false;
        this.errorMsg = e.error?.message || 'Invalid email or password';
      }
    });
  }

  private redirectUser() {
    if (this.authService.isSeller) this.router.navigate(['/seller/dashboard']);
    else this.router.navigate(['/']);
  }
}
