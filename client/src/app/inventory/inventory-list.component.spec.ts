// Angular Imports
import { ComponentFixture, TestBed, waitForAsync, tick, fakeAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InventoryService } from './inventory.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// RxJS Imports
import { Observable } from 'rxjs';

// Inventory Imports
import { MockInventoryService } from 'src/testing/inventory.service.mock';
import { InventoryItem } from './inventory';
import { InventoryListComponent } from './inventory-list.component';


describe('Inventory Table', () => {
  let inventoryTable: InventoryListComponent;
  let fixture: ComponentFixture<InventoryListComponent>
  let inventoryService: InventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InventoryListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: InventoryService, useClass: MockInventoryService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(InventoryListComponent);
      inventoryTable = fixture.componentInstance;
      inventoryService = TestBed.inject(InventoryService);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(inventoryTable).toBeTruthy();
  });

  it('should initialize with serverFilteredTable available', () => {
    const inventory = inventoryTable.inventoryItems();
    expect(inventory).toBeDefined();
    expect(Array.isArray(inventory)).toBe(true);
  });


  it('should call getInventory() when item keys signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.itemKey.set('glue_stick');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ itemKey: 'glue_stick', itemName: undefined, description: undefined});
  }));

  it('should call getInventory() when item names signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.itemName.set('Folder');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ itemKey: undefined, itemName: 'Folder', description: undefined});
  }));

  it('should call getInventory() when item signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.description.set('yellow');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ itemKey: undefined, itemName: undefined, description: 'yellow'});
  }));

  it('should call getInventory() when brand and color signals change', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.itemKey.set('composition_notebook');
    inventoryTable.itemName.set('Notebook');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ itemKey: 'composition_notebook', itemName: 'Notebook', description: undefined});
  }));

  it('should call getInventory() when item, brand, color, and material signals change', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.itemKey.set('pens_black');
    inventoryTable.itemName.set('Pens');
    inventoryTable.description.set('black');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ itemKey: 'pens_black', itemName: 'Pens', description: 'black'});
  }));

  it('should not show error message on successful load', () => {
    expect(inventoryTable.errMsg()).toBeUndefined();
  });
});

describe('Misbehaving Inventory Table', () => {
  let inventoryTable: InventoryListComponent;
  let fixture: ComponentFixture<InventoryListComponent>;

  let inventoryServiceStub: {
    getInventory: () => Observable<InventoryItem[]>;
    //filterInventory: () => Inventory[];
  };

  beforeEach(() => {
    inventoryServiceStub = {
      getInventory: () =>
        new Observable((observer) => {
          observer.error('getInventory() Observer generates an error');
        }),
      //filterInventory: () => []
    };
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InventoryListComponent
      ],
      providers: [{
        provide: InventoryService,
        useValue: inventoryServiceStub
      }, provideRouter([])],
    })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(InventoryListComponent);
    inventoryTable = fixture.componentInstance;
    fixture.detectChanges();
    tick(300);
  }));

  it("generates an error if we don't set up a InventoryService", () => {
    expect(inventoryTable.inventoryItems())
      .withContext("service can't give values to the list if it's not there")
      .toEqual([]);
    expect(inventoryTable.errMsg())
      .withContext('the error message will be')
      .toContain('Problem contacting the server – Error Code:');
  });
});
