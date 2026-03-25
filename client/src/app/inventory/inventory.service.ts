import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { InventoryItem } from './inventory';

@Injectable({
  providedIn: 'root',
})

export class InventoryService {
  private httpClient = inject(HttpClient);
  readonly inventoryUrl = `${environment.apiUrl}inventory`;

  private readonly itemKey = 'itemKey';
  private readonly itemName = 'itemName';
  private readonly descriptionKey = 'description';

  getInventory(filters?: {itemKey?: string; itemName?: string; description?: string}): Observable<InventoryItem[]> { //: Observable<InventoryItem[]>
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.itemKey) {
        httpParams = httpParams.set(this.itemKey, filters.itemKey);
      }
      if (filters.itemName) {
        httpParams = httpParams.set(this.itemName, filters.itemName);
      }
      if (filters.description) {
        httpParams = httpParams.set(this.descriptionKey, filters.description);
      }
    }
    return this.httpClient.get<InventoryItem[]>(this.inventoryUrl, {params: httpParams});
  }

  getInventoryById(id: string): Observable<InventoryItem> {
    return this.httpClient.get<InventoryItem>(`${this.inventoryUrl}/${id}`);
  }

  addInventory(item: Partial<InventoryItem>): Observable<string> {
    return this.httpClient
      .post<{ id: string }>(this.inventoryUrl, item)
      .pipe(map(res => res.id));
  }

  updateQuantity(id: string, quantity: number): Observable<void> {
    return this.httpClient.put<void>(`${this.inventoryUrl}/${id}`, { quantityAvailable: quantity });
  }

  deleteInventory(id: string): Observable<unknown> {
    return this.httpClient.delete<void>(`${this.inventoryUrl}/${id}`);
  }
}
