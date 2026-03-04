import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { InventoryItem } from './inventory';

@Injectable({
  providedIn: 'root',
})

export class InventoryService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}inventory`;

  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.url);
  }

  getInventoryById(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.url}/${id}`);
  }

  addInventory(item: Partial<InventoryItem>): Observable<string> {
    return this.http
      .post<{ id: string }>(this.url, item)
      .pipe(map(res => res.id));
  }

  updateQuantity(id: string, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, { quantityAvailable: quantity });
  }

  deleteInventory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
