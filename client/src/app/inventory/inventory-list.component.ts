import { Component, inject } from '@angular/core';
import { InventoryItem } from './inventory';
import { InventoryService } from './inventory.service';
import { catchError, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardHeader, MatCard, MatCardTitle, MatCardContent } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatError } from "@angular/material/form-field";

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory-list.component.html',
  imports: [MatCardHeader, MatCard, MatCardTitle, MatCardContent, MatIcon, MatError],
})

export class InventoryListComponent {
  private inventoryService = inject(InventoryService);

  inventoryItems = toSignal<InventoryItem[]>(
    this.inventoryService.getInventory().pipe(catchError(() => of([])))
  );

  // Delete or update triggers re-fetch
  deleteItem(id: string) {
    this.inventoryService.deleteInventory(id).subscribe(() => this.refreshInventory());
  }

  updateQuantity(id: string, quantity: number) {
    this.inventoryService.updateQuantity(id, quantity).subscribe(() => this.refreshInventory());
  }

  private refreshInventory() {
    this.inventoryItems = toSignal<InventoryItem[]>(
      this.inventoryService.getInventory().pipe(catchError(() => of([])))
    );
  }
}
