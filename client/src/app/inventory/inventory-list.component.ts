import { Component, inject, signal } from '@angular/core';
import { InventoryItem } from './inventory';
import { InventoryService } from './inventory.service';
import { catchError, combineLatest, debounceTime, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatCardHeader, MatCard, MatCardTitle, MatCardContent, MatCardModule } from "@angular/material/card";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatError, MatFormFieldModule } from "@angular/material/form-field";
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss'],
  imports: [
    MatCardHeader,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatIcon,
    MatError,
    RouterLink,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
})

export class InventoryListComponent {
  private snackBar = inject(MatSnackBar);
  private inventoryService = inject(InventoryService);
  itemName = signal<string | undefined>(undefined);
  itemKey = signal<string | undefined>(undefined);
  description = signal<string | undefined>(undefined);

  errMsg = signal<string | undefined>(undefined);

  private name$ = toObservable(this.itemName);
  private key$ = toObservable(this.itemKey);
  private description$ = toObservable(this.description);

  inventoryItems = toSignal(
    combineLatest([this.name$, this.key$, this.description$]).pipe(
      debounceTime(300),
      switchMap(([ itemName, itemKey, description]) =>
        this.inventoryService.getInventory({ itemName, itemKey, description})
      ),
      catchError((err) => {
        if (!(err.error instanceof ErrorEvent)) {
          this.errMsg.set(
            `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
          )
        };
        this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
        return of<InventoryItem[]>([]);
      })
    ),
    { initialValue: [] }
  );

  // inventoryItems = toSignal<InventoryItem[]>(
  //   this.inventoryService.getInventory().pipe(catchError(() => of([])))
  // );

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
