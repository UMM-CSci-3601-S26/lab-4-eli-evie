import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { InventoryItem } from '../app/inventory/inventory';
import { InventoryService } from 'src/app/inventory/inventory.service';

@Injectable({
  providedIn: AppComponent
})
export class MockInventoryService implements Pick<InventoryService, 'getInventory' | 'getInventoryById' | 'addInventory' | 'deleteInventory'> {

  static testInventory: InventoryItem[] = [
    {
      _id: 'backpack_id',
      itemKey: 'backpack',
      itemName: 'Backpack',
      quantityAvailable: 5
    },
    {
      _id: 'colored_pencils_id',
      itemKey: 'colored_pencils',
      itemName: 'Colored Pencils',
      quantityAvailable: 3
    },
    {
      _id: 'crayons_id',
      itemKey: 'crayons',
      itemName: 'Crayons',
      quantityAvailable: 6
    }
  ];

  getInventory(): Observable<InventoryItem[]> {
    return of(MockInventoryService.testInventory);
  }

  getInventoryById(id: string): Observable<InventoryItem> {
    if (id === MockInventoryService.testInventory[0]._id) {
      return of(MockInventoryService.testInventory[0]);
    } else if (id === MockInventoryService.testInventory[1]._id) {
      return of(MockInventoryService.testInventory[1]);
    } else {
      return of(null);
    }
  }

  addInventory(newInventory: Partial<InventoryItem>): Observable<string> {
    console.log('addInventory called with', newInventory);
    return of('1');
  }

  deleteInventory(id: string): Observable<string> {
    console.log('addInventory called with', id);
    return of('1');
  }

  exportFamilies(): Observable<string> {
    return of('csv-data');
  }
}
