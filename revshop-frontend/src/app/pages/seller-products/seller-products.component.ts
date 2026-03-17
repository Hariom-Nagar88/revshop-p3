import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, Category, PageResponse } from '../../models';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard">
      <aside class="seller-sidebar">
        <div class="seller-brand"><span class="material-icons">store</span><span>Seller Hub</span></div>
        <nav>
          <a routerLink="/seller/dashboard" class="nav-item"><span class="material-icons">dashboard</span> Dashboard</a>
          <a routerLink="/seller/products" routerLinkActive="active" class="nav-item"><span class="material-icons">inventory_2</span> Products</a>
          <a routerLink="/seller/orders" class="nav-item"><span class="material-icons">receipt_long</span> Orders</a>
        </nav>
      </aside>
      <main class="seller-main">
        <div class="dash-header">
          <h1>My Products</h1>
          <button class="btn btn-primary" (click)="openModal(null)">
            <span class="material-icons">add</span> Add Product
          </button>
        </div>

        <!-- Products Table -->
        <div class="card table-card">
          <div *ngIf="loading" class="spinner-wrap"><div class="spinner"></div></div>
          <table *ngIf="!loading && products.length > 0">
            <thead>
              <tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Rating</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of products">
                <td class="product-cell">
                  <img [src]="p.imageUrl || 'assets/placeholder.png'" class="table-img"/>
                  <div><strong>{{p.name}}</strong><br/><small>{{p.categoryName}}</small></div>
                </td>
                <td>₹{{p.price | number}}</td>
                <td>
                  <span [class]="'badge ' + (p.stock === 0 ? 'badge-danger' : p.lowStock ? 'badge-warning' : 'badge-success')">
                    {{p.stock}} units
                  </span>
                </td>
                <td><span [class]="'badge ' + (p.active ? 'badge-success' : 'badge-danger')">{{p.active ? 'Active' : 'Inactive'}}</span></td>
                <td>{{p.averageRating | number:'1.1-1'}} ★ ({{p.ratingCount}})</td>
                <td class="action-cell">
                  <button class="btn btn-outline btn-sm" (click)="openModal(p)">Edit</button>
                  <button class="btn btn-sm" style="border:1px solid #c62828;color:#c62828" (click)="delete(p)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="!loading && products.length === 0" class="empty-state">
            <span class="material-icons">inventory_2</span><h3>No products yet</h3>
            <button class="btn btn-primary" (click)="openModal(null)" style="margin-top:16px">Add Your First Product</button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" [disabled]="page===0" (click)="loadProducts(page-1)"><span class="material-icons">chevron_left</span></button>
          <button *ngFor="let p of pageNums" class="page-btn" [class.active]="p===page" (click)="loadProducts(p)">{{p+1}}</button>
          <button class="page-btn" [disabled]="page===totalPages-1" (click)="loadProducts(page+1)"><span class="material-icons">chevron_right</span></button>
        </div>
      </main>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{editProduct ? 'Edit Product' : 'Add New Product'}}</h3>
          <button class="modal-close" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Product Name *</label>
            <input [(ngModel)]="form.name" class="form-control" required/>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea [(ngModel)]="form.description" class="form-control" rows="3"></textarea>
          </div>
          <div class="row-2">
            <div class="form-group">
              <label class="form-label">Price (₹) *</label>
              <input [(ngModel)]="form.price" type="number" class="form-control" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Original Price (₹)</label>
              <input [(ngModel)]="form.originalPrice" type="number" class="form-control"/>
            </div>
          </div>
          <div class="row-2">
            <div class="form-group">
              <label class="form-label">Stock *</label>
              <input [(ngModel)]="form.stock" type="number" class="form-control" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Brand</label>
              <input [(ngModel)]="form.brand" class="form-control"/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select [(ngModel)]="form.categoryId" class="form-control" required>
              <option [value]="null" disabled>Select category</option>
              <option *ngFor="let c of categories" [value]="c.id">{{c.name}}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input [(ngModel)]="form.imageUrl" class="form-control" placeholder="https://..."/>
          </div>
          <p class="error-msg" *ngIf="formError">{{formError}}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="saveProduct()" [disabled]="saving">
            {{saving ? 'Saving...' : (editProduct ? 'Update' : 'Create')}}
          </button>
        </div>
      </div>
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
    .table-card { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #555; border-bottom: 2px solid #e0e0e0; }
    td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; vertical-align: middle; }
    .product-cell { display: flex; align-items: center; gap: 12px; }
    .table-img { width: 48px; height: 48px; object-fit: contain; border: 1px solid #f0f0f0; border-radius: 4px; }
    .action-cell { display: flex; gap: 8px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .error-msg { color: #c62828; font-size: 13px; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 1000;
                       display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal-box { background: #fff; border-radius: 8px; width: 100%; max-width: 560px;
                 max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center;
                    padding: 16px 20px; border-bottom: 1px solid #e0e0e0; }
    .modal-header h3 { font-size: 18px; font-weight: 700; }
    .modal-close { background: none; border: none; cursor: pointer; color: #878787; }
    .modal-body { padding: 20px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px;
                    border-top: 1px solid #e0e0e0; }
    @media (max-width: 768px) { .seller-sidebar { display: none; } }
  `]
})
export class SellerProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  page = 0;
  totalPages = 0;
  showModal = false;
  editProduct: Product | null = null;
  saving = false;
  formError = '';
  form: any = { name: '', description: '', price: null, originalPrice: null, stock: null, brand: '', categoryId: null, imageUrl: '' };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getCategories().subscribe(c => this.categories = c);
    this.loadProducts(0);
  }

  loadProducts(p: number) {
    this.loading = true; this.page = p;
    this.productService.getSellerProducts(p, 10).subscribe({
      next: (res: PageResponse<Product>) => { this.products = res.content; this.totalPages = res.totalPages; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openModal(p: Product | null) {
    this.editProduct = p;
    this.formError = '';
    this.form = p
      ? { name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice,
          stock: p.stock, brand: p.brand, categoryId: p.categoryId, imageUrl: p.imageUrl }
      : { name: '', description: '', price: null, originalPrice: null, stock: null, brand: '', categoryId: null, imageUrl: '' };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editProduct = null; }

  saveProduct() {
    if (!this.form.name || !this.form.price || !this.form.stock || !this.form.categoryId) {
      this.formError = 'Please fill all required fields.'; return;
    }
    this.saving = true; this.formError = '';
    const obs = this.editProduct
      ? this.productService.update(this.editProduct.id, this.form)
      : this.productService.create(this.form);
    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.loadProducts(this.page); },
      error: (e) => { this.saving = false; this.formError = e.error?.message || 'Failed to save product.'; }
    });
  }

  delete(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.productService.delete(p.id).subscribe(() => this.loadProducts(this.page));
  }

  get pageNums(): number[] {
    const s = Math.max(0, this.page - 2), e = Math.min(this.totalPages - 1, this.page + 2);
    return Array.from({ length: e - s + 1 }, (_, i) => i + s);
  }
}
