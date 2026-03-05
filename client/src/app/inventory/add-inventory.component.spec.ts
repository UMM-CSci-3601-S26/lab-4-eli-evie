import { Location } from '@angular/common';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; //fakeAsync, flush, tick
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router'; //provideRouter
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { throwError } from 'rxjs'; //of
import { MockInventoryService } from 'src/testing/inventory.service.mock';
import { AddInventoryComponent } from './add-inventory.component';
import { provideHttpClient } from '@angular/common/http';
import { InventoryService } from './inventory.service';

describe('AddInventoryComponent', () => {
  let addInventoryComponent: AddInventoryComponent;
  let addInventoryForm: FormGroup;
  let fixture: ComponentFixture<AddInventoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddInventoryComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: InventoryService, useClass: MockInventoryService }
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInventoryComponent);
    addInventoryComponent = fixture.componentInstance;
    fixture.detectChanges();
    addInventoryForm = addInventoryComponent.addInventoryForm;
    expect(addInventoryForm).toBeDefined();
    expect(addInventoryForm.controls).toBeDefined();
  });

  it('should create the component and form', () => {
    expect(addInventoryComponent).toBeTruthy();
    expect(addInventoryForm).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(addInventoryForm.valid).toBeFalsy();
  });

  describe('The item key field', () => {
    let itemKeyControl: AbstractControl;

    beforeEach(() => {
      itemKeyControl = addInventoryComponent.addInventoryForm.controls.itemKey;
    });

    it('should not allow empty item keys', () => {
      itemKeyControl.setValue('');
      expect(itemKeyControl.valid).toBeFalsy();
    });

    it('should be fine with "the_ball"', () => {
      itemKeyControl.setValue('the_ball');
      expect(itemKeyControl.valid).toBeTruthy();
    });

    // it('should fail on non key format', () => {
    //   itemKeyControl.setValue('The Ball');
    //   expect(itemKeyControl.valid).toBeFalsy();
    // });

  });

  describe('The item name field', () => {
    let itemNameControl: AbstractControl;

    beforeEach(() => {
      itemNameControl = addInventoryComponent.addInventoryForm.controls.itemName;
    });

    it('should not allow empty name keys', () => {
      itemNameControl.setValue('');
      expect(itemNameControl.valid).toBeFalsy();
    });

    it('should be fine with "the_ball"', () => {
      itemNameControl.setValue('The Ball');
      expect(itemNameControl.valid).toBeTruthy();
    });

  });

  describe('The quantityAvailable field', () => {
    let quantityAvailableControl: AbstractControl;

    beforeEach(() => {
      quantityAvailableControl = addInventoryComponent.addInventoryForm.controls.quantityAvailable;
    });

    it('should not allow empty quantities', () => {
      quantityAvailableControl.setValue('');
      expect(quantityAvailableControl.valid).toBeFalsy();
    });

    it('should be fine with whole numbers', () => {
      quantityAvailableControl.setValue(4);
      expect(quantityAvailableControl.valid).toBeTruthy();
    });

    it('shouldnt allow only strings to input', () => {
      quantityAvailableControl.setValue('x');
      expect(quantityAvailableControl.valid).toBeFalsy();
      expect(quantityAvailableControl.hasError('pattern')).toBeTruthy();
    });

    it('should allow only numbers equal or greater then 0', () => {
      quantityAvailableControl.setValue(-2);
      expect(quantityAvailableControl.valid).toBeFalsy();
      expect(quantityAvailableControl.hasError('min')).toBeTruthy();
    });
  });


  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      let controlName: keyof typeof addInventoryComponent.addInventoryValidationMessages = 'itemKey';
      addInventoryComponent.addInventoryForm.get(controlName).setErrors({'required': true});
      expect(addInventoryComponent.getErrorMessage(controlName)).toEqual('Item key is required');

      controlName = 'itemName';
      addInventoryComponent.addInventoryForm.get(controlName).setErrors({'required': true});
      expect(addInventoryComponent.getErrorMessage(controlName)).toEqual('Item name is required');

      controlName = 'quantityAvailable';
      addInventoryComponent.addInventoryForm.get(controlName).setErrors({'required': true});
      expect(addInventoryComponent.getErrorMessage(controlName)).toEqual('Quantity is required');
    });

    it('should return "Unknown error" if no error message is found', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addInventoryValidationMessages`
      // map in the component.
      const controlName: keyof typeof addInventoryComponent.addInventoryValidationMessages = 'itemKey';
      addInventoryComponent.addInventoryForm.get(controlName).setErrors({'unknown': true});
      expect(addInventoryComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });

  });
});

// A lot of these tests mock the service using an approach like this doc example
// https://angular.dev/guide/testing/components-scenarios#more-async-tests
// The same way that the following allows the mock to be used:

// TestBed.configureTestingModule({
//   providers: [{provide: TwainQuotes, useClass: MockTwainQuotes}], // A (more-async-tests) - provide + use class of the mock
// });
// const twainQuotes = TestBed.inject(TwainQuotes) as MockTwainQuotes; // B (more-async-tests) - inject the service as the mock

// Is how these tests work with the mock then being injected in

describe('AddInventoryComponent#submitForm()', () => {
  let component: AddInventoryComponent;
  let fixture: ComponentFixture<AddInventoryComponent>;
  let inventoryService: InventoryService;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AddInventoryComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: InventoryService, useClass: MockInventoryService }, // A (more-async-tests) - provide + use class of the mock
        // provideRouter([
        //   { path: 'inventory/:id', component: InventoryListComponent }
        // ])
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInventoryComponent);
    component = fixture.componentInstance;
    inventoryService = TestBed.inject(InventoryService); // B (more-async-tests) - inject the service as the mock
    location = TestBed.inject(Location);
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.addInventoryForm.controls.itemKey.setValue('red_folder');
    component.addInventoryForm.controls.itemName.setValue('Folder');
    component.addInventoryForm.controls.quantityAvailable.setValue(6);
  });

  // it('should call addInventory() and handle success response', fakeAsync(() => {
  //   const addInventorySpy = spyOn(inventoryService, 'addInventory').and.returnValue(of('1'));
  //   component.submitForm();
  //   expect(addInventorySpy).toHaveBeenCalledWith(component.addInventoryForm.value);
  //   tick();
  //   expect(location.path()).toBe('/inventory/1');
  //   flush();
  // }));

  it('should call addInventory() and handle error response', () => {
    const path = location.path();
    const errorResponse = { status: 500, message: 'Server error' };
    const addInventorySpy = spyOn(inventoryService, 'addInventory')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addInventorySpy).toHaveBeenCalledWith(component.addInventoryForm.value);
    expect(location.path()).toBe(path);
  });


  it('should call addInventory() and handle error response for illegal inventory', () => {
    const path = location.path();
    const errorResponse = { status: 400, message: 'Illegal inventory error' };

    const addInventorySpy = spyOn(inventoryService, 'addInventory')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addInventorySpy).toHaveBeenCalledWith(component.addInventoryForm.value);
    expect(location.path()).toBe(path);
  });

  it('should call addInventory() and handle unexpected error response if it arises', () => {
    const path = location.path();
    const errorResponse = { status: 404, message: 'Not found' };

    const addInventorySpy = spyOn(inventoryService, 'addInventory')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addInventorySpy).toHaveBeenCalledWith(component.addInventoryForm.value);
    expect(location.path()).toBe(path);
  });
});
