import { InventoryListPage } from '../support/inventory-list.po';

const page = new InventoryListPage();

describe('Inventory list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getInventoryTitle().should('have.text', 'Inventory');
  });

  it('Should click add inventory and go to the right URL', () => {
    page.addInventoryButton().click();
    cy.url().should(url => expect(url.endsWith('/inventory/new')).to.be.true);
    cy.get('.add-inventory-title').should('have.text', 'New Inventory');
  });

  it('Should increase quantity when + is clicked', () => {
    page.getQuantityValueOfFirstRow().then(initial => {
      page.clickPlusOnFirstRow();
      page.getQuantityValueOfFirstRow()
        .should('equal', initial + 1)
    });
  });

  it('Should decrease quantity when - is clicked', () => {
    page.getQuantityValueOfFirstRow().then(initial => {
      page.clickMinusOnFirstRow();
      page.getQuantityValueOfFirstRow()
        .should('equal', initial - 1)
    });
  });

  it('Should delete an inventory item', () => {
    page.getRowCount().then(initialCount => {
      page.clickDeleteOnFirstRow();
      page.getRows().should('have.length', initialCount - 1);
    });
  });

  it('Should remove the correct inventory item', () => {
    page.getFirstRow()
      .find('.item-name')
      .invoke('text')
      .then(itemName => {
        page.clickDeleteOnFirstRow();
        cy.contains('.item-name', itemName).should('not.exist');
      });
  });

});
