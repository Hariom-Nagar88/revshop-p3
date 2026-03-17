import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, PageResponse, PlaceOrderRequest, SellerStats } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  placeOrder(req: PlaceOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, req);
  }

  getMyOrders(page = 0, size = 10): Observable<PageResponse<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Order>>(this.apiUrl, { params });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  trackOrder(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/track/${orderNumber}`);
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // Seller
  getSellerOrders(page = 0, size = 10): Observable<PageResponse<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Order>>(`${this.apiUrl}/seller`, { params });
  }

  updateOrderStatus(orderId: number, status: string, trackingNumber?: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/seller/${orderId}/status`, { status, trackingNumber });
  }

  getSellerStats(): Observable<SellerStats> {
    return this.http.get<SellerStats>(`${this.apiUrl}/seller/stats`);
  }
}
