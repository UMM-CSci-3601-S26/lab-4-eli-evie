import { HttpClient, provideHttpClient } from '@angular/common/http'; //HttpParams
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { InventoryItem } from './inventory';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  // A small collection of test inventory
  const testInventory: InventoryItem[] = [
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

  let inventoryService: InventoryService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    inventoryService = TestBed.inject(InventoryService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('When getInventory() is called with no parameters', () => {
    it('calls `api/inventory`', waitForAsync(() => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory().subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl);
      });
    }));
  });


  describe('When getInventoryById() is given an ID', () => {
    it('calls api/families/id with the correct ID', waitForAsync(() => {
      const targetInventory: InventoryItem = testInventory[1];
      const targetId: string = targetInventory._id;
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetInventory));
      inventoryService.getInventoryById(targetId).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${inventoryService.inventoryUrl}/${targetId}`);
      });
    }));
  });

  describe('Adding a inventory using `addInventory()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      const inventory_id = 'john_id';
      const expected_http_response = { id: inventory_id } ;

      const mockedMethod = spyOn(httpClient, 'post')
        .and
        .returnValue(of(expected_http_response));

      inventoryService.addInventory(testInventory[1]).subscribe((new_inventory_id) => {
        expect(new_inventory_id).toBe(inventory_id);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, testInventory[1]);
      });
    }));
  });

  describe('Deleting a inventory using `deleteInventory()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      const mockedMethod = spyOn(httpClient, 'delete').and.returnValue(of({ success: true }));

      inventoryService.deleteInventory('john_id').subscribe((res) => {
        expect(res).toEqual({success: true});

        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
      });
    }));
  });

});
