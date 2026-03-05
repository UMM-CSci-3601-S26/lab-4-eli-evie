import { InventoryItem } from 'src/app/inventory/inventory';

export class AddInventoryPage {

  private readonly url = '/inventory/new';

  private readonly titleSelector = '.add-inventory-title';
  private readonly submitButtonSelector = '[data-test=confirmAddInventoryButton]';

  private readonly itemKeySelector = '[data-test=itemKeyInput]';
  private readonly itemNameSelector = '[data-test=itemNameInput]';
  private readonly quantitySelector = '[data-test=quantityInput]';

  navigateTo() {
    return cy.visit(this.url);
  }

  getTitle() {
    return cy.get(this.titleSelector);
  }

  getSubmitButton() {
    return cy.get(this.submitButtonSelector);
  }

  fillItemKey(value: string) {
    return cy.get(this.itemKeySelector).clear().type(value);
  }

  fillItemName(value: string) {
    return cy.get(this.itemNameSelector).clear().type(value);
  }

  fillQuantity(value: number) {
    return cy.get(this.quantitySelector).clear().type(value.toString());
  }

  submit() {
    return this.getSubmitButton().click();
  }

  addInventory(item: InventoryItem) {
    this.fillItemKey(item.itemKey);
    this.fillItemName(item.itemName);
    this.fillQuantity(item.quantityAvailable);
    return this.submit();
  }
}
