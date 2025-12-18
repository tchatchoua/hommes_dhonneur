import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/auth.models';
import { Debt, CreateDebt, UpdateDebt } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DebtService {
  private readonly apiUrl = `${environment.apiUrl}/debts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Debt[]>> {
    return this.http.get<ApiResponse<Debt[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Debt>> {
    return this.http.get<ApiResponse<Debt>>(`${this.apiUrl}/${id}`);
  }

  getMyDebts(): Observable<ApiResponse<Debt[]>> {
    return this.http.get<ApiResponse<Debt[]>>(`${this.apiUrl}/me`);
  }

  getByUserId(userId: number): Observable<ApiResponse<Debt[]>> {
    return this.http.get<ApiResponse<Debt[]>>(`${this.apiUrl}/user/${userId}`);
  }

  getMyTotal(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/me/total`);
  }

  getByDateRange(startDate: Date, endDate: Date): Observable<ApiResponse<Debt[]>> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<ApiResponse<Debt[]>>(`${this.apiUrl}/me/range`, { params });
  }

  create(data: CreateDebt): Observable<ApiResponse<Debt>> {
    return this.http.post<ApiResponse<Debt>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateDebt): Observable<ApiResponse<Debt>> {
    return this.http.put<ApiResponse<Debt>>(`${this.apiUrl}/${id}`, data);
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<Debt>> {
    return this.http.patch<ApiResponse<Debt>>(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
