import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/auth.models';
import { Invitation, CreateInvitation } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private readonly apiUrl = `${environment.apiUrl}/invitations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Invitation[]>> {
    return this.http.get<ApiResponse<Invitation[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Invitation>> {
    return this.http.get<ApiResponse<Invitation>>(`${this.apiUrl}/${id}`);
  }

  validate(token: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/validate/${token}`);
  }

  create(data: CreateInvitation = {}): Observable<ApiResponse<Invitation>> {
    return this.http.post<ApiResponse<Invitation>>(this.apiUrl, data);
  }

  cleanup(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/cleanup`, {});
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
