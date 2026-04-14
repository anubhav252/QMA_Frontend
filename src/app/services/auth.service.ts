import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, UserResponse } from '../models/quantity.models';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private BASE_URL = environment.apiUrl;
  private tokenKey = 'token';
  private isBrowser: boolean;

  private loggedIn$ = new BehaviorSubject<boolean>(false);
  private username$ = new BehaviorSubject<string>('');
  private authModalOpen$ = new BehaviorSubject<boolean>(false);

  isLoggedIn$ = this.loggedIn$.asObservable();
  currentUser$ = this.username$.asObservable();
  authModal$ = this.authModalOpen$.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser && this.hasToken()) {
      this.loggedIn$.next(true);
      this.fetchUser();
    }
  }

  private hasToken(): boolean {
    return this.isBrowser && !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.tokenKey) : null;
  }

  private saveToken(token: string): void {
    if (this.isBrowser) localStorage.setItem(this.tokenKey, token);
    this.loggedIn$.next(true);
  }

  requestAuth(): void {
    this.authModalOpen$.next(true);
  }

  closeAuth(): void {
    this.authModalOpen$.next(false);
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/auth/login`, { username, password })
      .pipe(tap(res => {
        const token = res.token || res.Token || res.accessToken || '';
        this.saveToken(token);
        this.fetchUser();
      }));
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/register`, { username, password });
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/auth/google-login`, { idToken })
      .pipe(tap(res => {
        const token = res.token || res.Token || res.accessToken || '';
        this.saveToken(token);
        this.fetchUser();
      }));
  }

  fetchUser(): void {
    const token = this.getToken();
    if (!token) return;
    this.http.get<UserResponse>(`${this.BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => this.username$.next(res.username),
      error: () => this.username$.next('Logged In')
    });
  }

  logout(): void {
    if (this.isBrowser) localStorage.removeItem(this.tokenKey);
    this.loggedIn$.next(false);
    this.username$.next('');
  }
}

