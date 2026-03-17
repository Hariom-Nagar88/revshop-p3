import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, req).pipe(
      tap(res => this.storeUser(res))
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => this.storeUser(res))
    );
  }

  logout(): void {
    localStorage.removeItem('revshop_user');
    localStorage.removeItem('revshop_token');
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('revshop_token');
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get isBuyer(): boolean {
    return this.currentUser?.role === 'ROLE_BUYER';
  }

  get isSeller(): boolean {
    return this.currentUser?.role === 'ROLE_SELLER';
  }

  private storeUser(user: AuthResponse): void {
    localStorage.setItem('revshop_user', JSON.stringify(user));
    localStorage.setItem('revshop_token', user.token);
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem('revshop_user');
    return stored ? JSON.parse(stored) : null;
  }
}
