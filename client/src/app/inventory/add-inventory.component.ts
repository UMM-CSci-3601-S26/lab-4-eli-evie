import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { InventoryService } from './inventory.service';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule]
})
export class AddInventoryComponent {
  private inventoryService = inject(InventoryService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  addInventoryForm = new FormGroup({
    itemKey: new FormControl('', Validators.required),
    itemName: new FormControl('', Validators.required),
    quantityAvailable: new FormControl<number>(null, Validators.compose([
      Validators.required,
      Validators.min(0),
      Validators.pattern('^[0-9]+$')
    ])),
  });

  readonly addInventoryValidationMessages = {
    itemKey: [
      {type: 'required', message: 'Item key is required'}
    ],

    itemName: [
      {type: 'required', message: 'Item name is required'}
    ],

    quantityAvailable: [
      {type: 'required', message: 'Quantity is required'},
      {type: 'min', message: 'Quantity must be at least 0'},
      {type: 'pattern', message: 'Quantity must be a whole number'}
    ]
  };

  formControlHasError(controlItemKey: string): boolean {
    return this.addInventoryForm.get(controlItemKey).invalid &&
      (this.addInventoryForm.get(controlItemKey).dirty || this.addInventoryForm.get(controlItemKey).touched);
  }

  getErrorMessage(name: keyof typeof this.addInventoryValidationMessages): string {
    for(const {type, message} of this.addInventoryValidationMessages[name]) {
      if (this.addInventoryForm.get(name).hasError(type)) {
        return message;
      }
    }
    return 'Unknown error';
  }

  submitForm() {
    this.inventoryService.addInventory(this.addInventoryForm.value).subscribe({
      next: (newId) => {
        this.snackBar.open(
          `Added inventory ${this.addInventoryForm.value.itemName}`,
          null,
          { duration: 2000 }
        );
        this.router.navigate(['/inventorys/', newId]);
      },
      error: err => {
        if (err.status === 400) {
          this.snackBar.open(
            `Tried to add an illegal new inventory – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else if (err.status === 500) {
          this.snackBar.open(
            `The server failed to process your request to add a new inventory. Is the server up? – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else {
          this.snackBar.open(
            `An unexpected error occurred – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        }
      },
    });
  }

}
