import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/auth.models';
import { Contribution, CreateContribution, UpdateContribution } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ContributionService {
  private readonly apiUrl = `${environment.apiUrl}/contributions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Contribution[]>> {
    return this.http.get<ApiResponse<Contribution[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Contribution>> {
    return this.http.get<ApiResponse<Contribution>>(`${this.apiUrl}/${id}`);
  }

  getMyContributions(): Observable<ApiResponse<Contribution[]>> {
    return this.http.get<ApiResponse<Contribution[]>>(`${this.apiUrl}/me`);
  }

  getByUserId(userId: number): Observable<ApiResponse<Contribution[]>> {
    return this.http.get<ApiResponse<Contribution[]>>(`${this.apiUrl}/user/${userId}`);
  }

  getMyTotal(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/me/total`);
  }

  getByDateRange(startDate: Date, endDate: Date): Observable<ApiResponse<Contribution[]>> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<ApiResponse<Contribution[]>>(`${this.apiUrl}/me/range`, { params });
  }

  create(data: CreateContribution): Observable<ApiResponse<Contribution>> {
    return this.http.post<ApiResponse<Contribution>>(this.apiUrl, data);
  }

  update(id: number, data: UpdateContribution): Observable<ApiResponse<Contribution>> {
    return this.http.put<ApiResponse<Contribution>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
