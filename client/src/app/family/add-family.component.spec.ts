import { Location } from '@angular/common';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; //fakeAsync, flush, tick
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router'; //provideRouter
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { throwError } from 'rxjs'; //of
import { MockFamilyService } from 'src/testing/family.service.mock';
import { AddFamilyComponent } from './add-family.component';
import { provideHttpClient } from '@angular/common/http';
import { FamilyService } from './family.service';

describe('AddFamilyComponent', () => {
  let addFamilyComponent: AddFamilyComponent;
  let addFamilyForm: FormGroup;
  let fixture: ComponentFixture<AddFamilyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddFamilyComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FamilyService, useClass: MockFamilyService }
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFamilyComponent);
    addFamilyComponent = fixture.componentInstance;
    fixture.detectChanges();
    addFamilyForm = addFamilyComponent.addFamilyForm;
    expect(addFamilyForm).toBeDefined();
    expect(addFamilyForm.controls).toBeDefined();
  });

  // Not terribly important; if the component doesn't create
  // successfully that will probably blow up a lot of things.
  // Including it, though, does give us confidence that our
  // our component definitions don't have errors that would
  // prevent them from being successfully constructed.
  it('should create the component and form', () => {
    expect(addFamilyComponent).toBeTruthy();
    expect(addFamilyForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be invalid when empty', () => {
    expect(addFamilyForm.valid).toBeFalsy();
  });

  describe('The guardian name field', () => {
    let guardianNameControl: AbstractControl;

    beforeEach(() => {
      guardianNameControl = addFamilyComponent.addFamilyForm.controls.guardianName;
    });

    it('should not allow empty guardian names', () => {
      guardianNameControl.setValue('');
      expect(guardianNameControl.valid).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      guardianNameControl.setValue('Chris Smith');
      expect(guardianNameControl.valid).toBeTruthy();
    });

    it('should fail on single character guardian names', () => {
      guardianNameControl.setValue('x');
      expect(guardianNameControl.valid).toBeFalsy();
      expect(guardianNameControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long guardian names', () => {
      guardianNameControl.setValue('x'.repeat(100));
      expect(guardianNameControl.valid).toBeFalsy();
      expect(guardianNameControl.hasError('maxlength')).toBeTruthy();
    });

    //   it('should fail if we provide an "existing" guardian name', () => {
    //     // We're assuming that "abc123" and "123abc" already
    //     // exist so we disallow them.
    //     guardianNameControl.setValue('abc123');
    //     expect(guardianNameControl.valid).toBeFalsy();
    //     expect(guardianNameControl.hasError('existingName')).toBeTruthy();

    //     guardianNameControl.setValue('123abc');
    //     expect(guardianNameControl.valid).toBeFalsy();
    //     expect(guardianNameControl.hasError('existingName')).toBeTruthy();
    //    });
  });

  describe('Students FormArray', () => {
    //confirms input fields are blank
    it('should start with an empty students array', () => {
      const students = addFamilyComponent.students;
      expect(students).toBeDefined();
      expect(students.length).toBe(0);
    });

    it('should add a student when addStudent() is called', () => {
      addFamilyComponent.addStudent();
      const students = addFamilyComponent.students;

      expect(students.length).toBe(1);
      expect(students.at(0)).toBeTruthy();
      expect(students.at(0) instanceof FormGroup).toBeTrue();
    });

    it('when all required fields are valid, the the whole form should be valid', () => {
      addFamilyForm.controls.guardianName.setValue('Chris Smith');
      addFamilyForm.controls.address.setValue('123 Avenue');
      addFamilyForm.controls.timeSlot.setValue('9:00-10:00');
      addFamilyForm.controls.email.setValue('csmith@email.com');

      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);

      student.get('name')!.setValue('Jimmy');
      student.get('grade')!.setValue('3');
      student.get('school')!.setValue('Morris Elementary');

      expect(addFamilyForm.valid).toBeTrue();
    });

    //test student name input
    it('should validate student name', () => {
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);

      //name should not be valid if there is no input
      const name = student.get('name')!;
      name.setValue('');
      expect(name.valid).toBeFalse();
      expect(name.hasError('required')).toBeTrue();

      //name should not be valid unless there is more than one character in input
      name.setValue('A');
      expect(name.valid).toBeFalse();
      expect(name.hasError('minlength')).toBeTrue();

      //when set to "Lilly" the code should recognize this name as a valid input
      name.setValue('Lilly');
      expect(name.valid).toBeTrue();
    });

    //test grade input
    it('should validate student grade or integer and "K" or "k"', () => {
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);

      //should not be valid without input
      const grade = student.get('grade')!;
      grade.setValue('');
      expect(grade.valid).toBeFalse();
      expect(grade.hasError('required')).toBeTrue();

      //should not be a valid input
      grade.setValue('abc');
      expect(grade.valid).toBeFalse();
      expect(grade.hasError('pattern')).toBeTrue();

      //mixed values are invalid
      grade.setValue('k1');
      expect(grade.valid).toBeFalse();
      expect(grade.hasError('pattern')).toBeTrue();

      //integers are valid inputs
      grade.setValue('5');
      expect(grade.valid).toBeTrue();

      //"k" should be a valid input
      grade.setValue('k');
      expect(grade.valid).toBeTrue();

      //"K" should be a valid input
      grade.setValue('K');
      expect(grade.valid).toBeTrue();
    });

    //test school input
    it('should validate student school', () => {
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);

      const school = student.get('school')!;
      school.setValue('');
      expect(school.valid).toBeFalse();
      expect(school.hasError('required')).toBeTrue();

      school.setValue('A');
      expect(school.valid).toBeFalse();
      expect(school.hasError('minlength')).toBeTrue();

      school.setValue('Lincoln Elementary');
      expect(school.valid).toBeTrue();
    });

  });

  describe('The address field', () => {
    let addressControl: AbstractControl;

    beforeEach(() => {
      addressControl = addFamilyComponent.addFamilyForm.controls.address;
    });

    it('should not allow empty addresses', () => {
      addressControl.setValue('');
      expect(addressControl.valid).toBeFalsy();
    });

    it('should allow numbers and letters to input', () => {
      addressControl.setValue('123 Avenue');
      expect(addressControl.valid).toBeTruthy();
    });
  });

  describe('The email field', () => {
    let emailControl: AbstractControl;

    beforeEach(() => {
      emailControl = addFamilyComponent.addFamilyForm.controls.email;
    });

    it('should not allow empty values', () => {
      emailControl.setValue(null);
      expect(emailControl.valid).toBeFalsy();
      expect(emailControl.hasError('required')).toBeTruthy();
    });

    it('should accept legal emails', () => {
      emailControl.setValue('conniestewart@ohmnet.com');
      expect(emailControl.valid).toBeTruthy();
    });

    it('should fail without @', () => {
      emailControl.setValue('conniestewart');
      expect(emailControl.valid).toBeFalsy();
      expect(emailControl.hasError('email')).toBeTruthy();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addFamilyValidationMessages`
      // map in the component.
      let controlName: keyof typeof addFamilyComponent.addFamilyValidationMessages = 'guardianName';
      addFamilyComponent.addFamilyForm.get(controlName).setErrors({'required': true});
      expect(addFamilyComponent.getErrorMessage(controlName)).toEqual('Guardian name is required');

      // We don't need the type statement here because we're not using the
      // same (previously typed) variable. We could use a `let` and the type statement
      // if we wanted to create a new variable, though.
      controlName = 'email';
      addFamilyComponent.addFamilyForm.get(controlName).setErrors({'required': true});
      expect(addFamilyComponent.getErrorMessage(controlName)).toEqual('Email is required');

      controlName = 'email';
      addFamilyComponent.addFamilyForm.get(controlName).setErrors({'email': true});
      expect(addFamilyComponent.getErrorMessage(controlName)).toEqual('Email must be formatted properly');
    });

    it('should return "Unknown error" if no error message is found', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addFamilyValidationMessages`
      // map in the component.
      const controlName: keyof typeof addFamilyComponent.addFamilyValidationMessages = 'guardianName';
      addFamilyComponent.addFamilyForm.get(controlName).setErrors({'unknown': true});
      expect(addFamilyComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });
  });
});

// A lot of these tests mock the service using an approach like this doc example
// https://angular.dev/guide/testing/components-scenarios#more-async-tests
// The same way that the following allows the mock to be used:
//
// TestBed.configureTestingModule({
//   providers: [{provide: TwainQuotes, useClass: MockTwainQuotes}], // A (more-async-tests) - provide + use class of the mock
// });
// const twainQuotes = TestBed.inject(TwainQuotes) as MockTwainQuotes; // B (more-async-tests) - inject the service as the mock
//
// Is how these tests work with the mock then being injected in

describe('AddFamilyComponent#submitForm()', () => {
  let component: AddFamilyComponent;
  let fixture: ComponentFixture<AddFamilyComponent>;
  let familyService: FamilyService;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AddFamilyComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: FamilyService, useClass: MockFamilyService }, // A (more-async-tests) - provide + use class of the mock
        // provideRouter([
        //   { path: 'family/:id', component: FamilyListComponent }
        // ])
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFamilyComponent);
    component = fixture.componentInstance;
    familyService = TestBed.inject(FamilyService); // B (more-async-tests) - inject the service as the mock
    location = TestBed.inject(Location);
    // We need to inject the router and the HttpTestingController, but
    // never need to use them. So, we can just inject them into the TestBed
    // and ignore the returned values.
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    // Set up the form with valid values.
    // We don't actually have to do this, but it does mean that when we
    // check that `submitForm()` is called with the right arguments below,
    // we have some reason to believe that that wasn't passing "by accident".
    component.addFamilyForm.controls.guardianName.setValue('Chris Smith');
    component.addFamilyForm.controls.address.setValue('123 Avenue');
    component.addFamilyForm.controls.timeSlot.setValue('9:00-10:00');
    component.addFamilyForm.controls.email.setValue('csmith@email.com');
    //component.addFamilyForm.controls.student.setValue('admin');
  });

  // it('should call addFamily() and handle success response', fakeAsync(() => {
  //   const addFamilySpy = spyOn(familyService, 'addFamily').and.returnValue(of('1'));
  //   component.submitForm();
  //   expect(addFamilySpy).toHaveBeenCalledWith(component.addFamilyForm.value);
  //   tick();
  //   expect(location.path()).toBe('/family/1');
  //   flush();
  // }));

  // This doesn't need `fakeAsync()`, `tick()`, or `flush() because the
  // error case doesn't navigate to another page. It just displays an error
  // message in the snackbar. So, we don't need to worry about the asynchronous
  // nature of navigation.
  it('should call addFamily() and handle error response', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addFamily()` method in the family service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addFamilySpy = spyOn(familyService, 'addFamily')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addFamily()` was called with the form's values which we set
    // up above.
    expect(addFamilySpy).toHaveBeenCalledWith(component.addFamilyForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });


  it('should call addFamily() and handle error response for illegal family', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 400, message: 'Illegal family error' };
    // "Spy" on the `.addFamily()` method in the family service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addFamilySpy = spyOn(familyService, 'addFamily')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addFamily()` was called with the form's values which we set
    // up above.
    expect(addFamilySpy).toHaveBeenCalledWith(component.addFamilyForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should call addFamily() and handle unexpected error response if it arises', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 404, message: 'Not found' };
    // "Spy" on the `.addFamily()` method in the family service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addFamilySpy = spyOn(familyService, 'addFamily')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addFamily()` was called with the form's values which we set
    // up above.
    expect(addFamilySpy).toHaveBeenCalledWith(component.addFamilyForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });
});
