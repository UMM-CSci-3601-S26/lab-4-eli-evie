import { HttpClient, provideHttpClient, HttpParams } from '@angular/common/http'; //HttpParams
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
      description: "[\"any\"]",
      quantityAvailable: 5
    },
    {
      _id: 'colored_pencils_id',
      itemKey: 'colored_pencils',
      itemName: 'Colored Pencils',
      description: "[\"any\"]",
      quantityAvailable: 3
    },
    {
      _id: 'folder_id',
      itemKey: 'folder_plastic',
      itemName: 'Folder',
      description: "[\"plastic\"]",
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
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams() });
      });
    }));
  });

  //___________________________________________________________________________________________________

  describe('When getInventory() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {

    it('correctly calls api/inventory with filter parameter \'itemKey\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ itemKey: 'Backpack' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('itemKey', 'Backpack') });
      });
    });

    it('correctly calls api/inventory with filter parameter \'itemName\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ itemName: 'Colored Pencils' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('itemName', 'Colored Pencils') });
      });
    });

    it('correctly calls api/inventory with filter parameter \'description\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ description: 'any' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('description', 'any') });
      });
    });


    it('correctly calls api/inventory with multiple filter parameters (itemKey, itemName, description)', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ itemKey: 'folder_plastic', itemName: 'Folder', description: 'plastic' }).subscribe(() => {

        const [url, options] = mockedMethod.calls.argsFor(0);

        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(inventoryService.inventoryUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 3 params')
          .toEqual(3);
        expect(calledHttpParams.get('itemKey'))
          .withContext('item being a plastic folder')
          .toEqual('folder_plastic');
        expect(calledHttpParams.get('itemName'))
          .withContext('this item is called a folder')
          .toEqual('Folder');
        expect(calledHttpParams.get('description'))
          .withContext('No specified requirements')
          .toEqual('plastic');
      });
    });

    it('correctly calls api/inventory with multiple filter parameters (itemName, description)', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ itemName: 'Colored Pencils', description: 'any' }).subscribe(() => {

        const [url, options] = mockedMethod.calls.argsFor(0);

        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(inventoryService.inventoryUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 2 params')
          .toEqual(2);
        expect(calledHttpParams.get('itemName'))
          .withContext('item being colored pencils')
          .toEqual('Colored Pencils');
        expect(calledHttpParams.get('description'))
          .withContext('No specified requirements')
          .toEqual('any');
      });
    });
  });

  //_____________________________________________________________________________________________________
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
})
