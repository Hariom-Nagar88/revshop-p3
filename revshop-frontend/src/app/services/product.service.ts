import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, PageResponse, Product, Review } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/products`;
  private catUrl = `${environment.apiUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, sortBy = 'createdAt', sortDir = 'desc'): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page).set('size', size).set('sortBy', sortBy).set('sortDir', sortDir);
    return this.http.get<PageResponse<Product>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  search(filters: any): Observable<PageResponse<Product>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v != null && v !== '') params = params.set(k, String(v)); });
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/search`, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.catUrl);
  }

  getByCategory(categoryId: number, page = 0, size = 20): Observable<PageResponse<Product>> {
    return this.search({ categoryId, page, size });
  }

  // Seller
  getSellerProducts(page = 0, size = 20): Observable<PageResponse<Product>> {
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/seller`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getLowStock(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/seller/low-stock`);
  }

  create(product: any): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${productId}/reviews`);
  }

  addReview(productId: number, comment: string): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/${productId}/reviews`, { comment });
  }

  addRating(productId: number, score: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${productId}/rating`, { score });
  }
}
