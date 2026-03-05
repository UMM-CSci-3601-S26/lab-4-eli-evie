import { AddInventoryPage } from '../support/add-inventory.po';
//import { InventoryListPage } from '../support/inventory-list.po';

const addPage = new AddInventoryPage();
//const listPage = new InventoryListPage();

describe('Add Inventory Page', () => {
  beforeEach(() => {
    cy.task('seed:database');
  });

  it('Should load add inventory page', () => {
    addPage.navigateTo();
    addPage.getTitle().should('have.text', 'New Inventory');
  })

  it('Should disable submit button when form invalid', () => {
    addPage.navigateTo();
    addPage.getSubmitButton().should('be.disabled');
  });

  //   it('Should add a new inventory item', () => {
  //     const newItem = {
  //       itemKey: 'glue',
  //       itemName: 'Glue Sticks',
  //       quantityAvailable: 5
  //     }

  //     addPage.navigateTo();
  //     addPage.addInventory(newItem);

  //     cy.url().should('include', '/inventory');

  //     cy.contains('[data-test=inventoryRow]', 'Glue Sticks')
  //       .should('exist');
  //   });

  it('Should show error if quantity is negative', () => {
    addPage.navigateTo();

    addPage.fillItemKey('bad');
    addPage.fillItemName('Bad Item');
    addPage.fillQuantity(-3);

    addPage.getSubmitButton().should('be.disabled');
  });
})
