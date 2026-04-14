import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ConvertRequest, ConvertResponse,
  OperationRequest, OperationResponse,
  HistoryResponse
} from '../models/quantity.models';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuantityService {

  private BASE_URL = environment.apiUrl;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  // Send auth header on every request if token exists
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  convert(body: ConvertRequest): Observable<ConvertResponse> {
    return this.http.post<ConvertResponse>(
      `${this.BASE_URL}/quantities/convert`, body,
      { headers: this.getHeaders() }
    );
  }

  compare(body: OperationRequest): Observable<OperationResponse> {
    return this.http.post<OperationResponse>(
      `${this.BASE_URL}/quantities/compare`, body,
      { headers: this.getHeaders() }
    );
  }

  add(body: OperationRequest): Observable<OperationResponse> {
    return this.http.post<OperationResponse>(
      `${this.BASE_URL}/quantities/add`, body,
      { headers: this.getHeaders() }
    );
  }

  subtract(body: OperationRequest): Observable<OperationResponse> {
    return this.http.post<OperationResponse>(
      `${this.BASE_URL}/quantities/subtract`, body,
      { headers: this.getHeaders() }
    );
  }

  divide(body: OperationRequest): Observable<OperationResponse> {
    return this.http.post<OperationResponse>(
      `${this.BASE_URL}/quantities/divide`, body,
      { headers: this.getHeaders() }
    );
  }

  getHistory(): Observable<HistoryResponse> {
    return this.http.get<HistoryResponse>(
      `${this.BASE_URL}/quantities/history`,
      { headers: this.getHeaders() }
    );
  }

  clearHistory(): Observable<any> {
    return this.http.delete(
      `${this.BASE_URL}/quantities/clear`,
      { headers: this.getHeaders() }
    );
  }
}