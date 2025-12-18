import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, PaginatedResponse } from '../models/auth.models';
import { Notification, NotificationSettings, UpdateNotificationSettings } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getMyNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/me`);
  }

  getAll(page = 1, pageSize = 20): Observable<ApiResponse<PaginatedResponse<Notification>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<Notification>>>(this.apiUrl, { params });
  }

  create(data: { userId?: number; message: string; type?: string }): Observable<ApiResponse<Notification>> {
    return this.http.post<ApiResponse<Notification>>(this.apiUrl, data);
  }

  getSettings(): Observable<ApiResponse<NotificationSettings>> {
    return this.http.get<ApiResponse<NotificationSettings>>(`${this.apiUrl}/settings`);
  }

  updateSettings(data: UpdateNotificationSettings): Observable<ApiResponse<NotificationSettings>> {
    return this.http.put<ApiResponse<NotificationSettings>>(`${this.apiUrl}/settings`, data);
  }

  getNextNotificationDate(): Observable<ApiResponse<Date>> {
    return this.http.get<ApiResponse<Date>>(`${this.apiUrl}/next-date`);
  }

  triggerBalanceNotifications(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/trigger-balance`, {});
  }

  sendPendingNotifications(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/send-pending`, {});
  }
}
