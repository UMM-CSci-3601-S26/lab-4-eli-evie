import { Component, inject } from '@angular/core';
import { InventoryItem } from './inventory';
import { InventoryService } from './inventory.service';
import { catchError, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardHeader, MatCard, MatCardTitle, MatCardContent } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatError } from "@angular/material/form-field";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory-list.component.html',
  imports: [MatCardHeader, MatCard, MatCardTitle, MatCardContent, MatIcon, MatError, RouterLink],
})

export class InventoryListComponent {
  private inventoryService = inject(InventoryService);

  inventoryItems = toSignal<InventoryItem[]>(
    this.inventoryService.getInventory().pipe(catchError(() => of([])))
  );

  // Delete or update triggers re-fetch
  // deleteItem(id: string) {
  //   this.inventoryService.deleteInventory(id);
  // }

  reload(): void {
    window.location.reload()
  }

  updateQuantity(id: string, quantity: number) {
    this.inventoryService.updateQuantity(id, quantity).subscribe(() => {
      this.reload();
    });
  }

  confirmDelete(id: string) {
    const confirmed = confirm('Are you sure you want to delete this item?');
    if (confirmed) {
      this.inventoryService.deleteInventory(id).subscribe(() => {
        this.reload();
      });
    }
  }
}
