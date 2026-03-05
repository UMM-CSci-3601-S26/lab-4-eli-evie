
export class InventoryListPage {
  private readonly baseUrl = '/inventory';
  private readonly pageTitle = '.inventory-list-title';
  private readonly addInventoryButtonSelector = '[data-test=addInventoryButton]';
  private readonly rowSelector = '[data-test=inventoryRow]';
  private readonly minusSelector = '[data-test=minusButton]';
  private readonly plusSelector = '[data-test=plusButton]';
  private readonly deleteSelector = '[data-test=deleteButton]';
  private readonly quantitySelector = '.quantity-number';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  getInventoryTitle() {
    return cy.get(this.pageTitle);
  }

  getRows() {
    return cy.get(this.rowSelector);
  }

  getFirstRow() {
    return cy.get(this.rowSelector).first();
  }

  getRowCount() {
    return this.getRows().its('length');
  }

  getQuantityValueOfFirstRow() {
    return this.getFirstRow()
      .find(this.quantitySelector)
      .invoke('text')
      .then(text => Number(text.trim()));
  }

  clickPlusOnFirstRow() {
    return this.getFirstRow().find(this.plusSelector).click();
  }

  clickMinusOnFirstRow() {
    return this.getFirstRow().find(this.minusSelector).click();
  }

  clickDeleteOnFirstRow() {
    return this.getFirstRow().find(this.deleteSelector).click();
  }

  addInventoryButton() {
    return cy.get(this.addInventoryButtonSelector);
  }
}
