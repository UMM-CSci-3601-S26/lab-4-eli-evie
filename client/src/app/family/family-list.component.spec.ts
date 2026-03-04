import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
//import { Observable } from 'rxjs';
import { MockFamilyService } from 'src/testing/family.service.mock';
//import { Family } from './family';
import { FamilyListComponent } from './family-list.component';
import { FamilyService } from './family.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { Family } from './family';

describe('Family list', () => {
  let familyList: FamilyListComponent;
  let fixture: ComponentFixture<FamilyListComponent>;
  let familyService: FamilyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FamilyListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FamilyService, useClass: MockFamilyService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(FamilyListComponent);
      familyList = fixture.componentInstance;
      familyService = TestBed.inject(FamilyService);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(familyList).toBeTruthy();
  });

  it('should load families from service', () => {
    const families = familyList.families();
    //there is one family
    expect(families.length).toBe(3);
    //the guardian of that family is Chris
    expect(families[0].guardianName).toBe('John Johnson');
  });

  //test checks that when calling downloadCSV(), the program invokes spy,
  //implying that exportFamilies() operates as expected

//needs work still:
//   it('exportFamilies() should be called when CSV is downloaded', () => {
//     const spy = spyOn(familyService, 'exportFamilies').and.returnValue(of('csv-data'));
//     familyList.downloadCSV();
//     expect(spy).toHaveBeenCalled();
//   //because downloadCSV() invokes spy, was can confirm that it was called
//   });
});



// /*
//  * This test is a little odd, but illustrates how we can use stubs
//  * to create mock objects (a service in this case) that be used for
//  * testing. Here we set up the mock FamilyService (familyServiceStub) so that
//  * _always_ fails (throws an exception) when you request a set of families.
//  */
describe('Misbehaving Family List', () => {
  let familyList: FamilyListComponent;
  let fixture: ComponentFixture<FamilyListComponent>;

  let familyServiceStub: {
    getFamilies: () => Observable<Family[]>;
    exportFamilies: () => Observable<string>;
  };

  beforeEach(() => {
    // stub FamilyService for test purposes
    familyServiceStub = {
      getFamilies: () =>
        new Observable((observer) => {
          observer.error('getFamilies() Observer generates an error');
        }),
      exportFamilies: () => of('')
    };
  });

  // Construct the `familyList` used for the testing in the `it` statement
  // below.
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FamilyListComponent
      ],
      // providers:    [ FamilyService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{
        provide: FamilyService,
        useValue: familyServiceStub
      }, provideRouter([])],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyListComponent);
    familyList = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('it will return an empty array when the service experiences an error', () => {
    expect(familyList.families()).toEqual([]); //familyList should return an empty array
  });
});
