import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart, WishlistItem } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${environment.apiUrl}/api/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(tap(c => this.cartSubject.next(c)));
  }

  addItem(item: any): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, item).pipe(tap(c => this.cartSubject.next(c)));
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, { quantity }).pipe(tap(c => this.cartSubject.next(c)));
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(tap(c => this.cartSubject.next(c)));
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(tap(() => this.cartSubject.next(null)));
  }

  getWishlist(): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.apiUrl}/wishlist`);
  }

  addToWishlist(item: any): Observable<WishlistItem> {
    return this.http.post<WishlistItem>(`${this.apiUrl}/wishlist`, item);
  }

  removeFromWishlist(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/wishlist/${productId}`);
  }

  checkWishlist(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/wishlist/${productId}/check`);
  }

  get cartItemCount(): number {
    return this.cartSubject.value?.totalItems ?? 0;
  }
}
