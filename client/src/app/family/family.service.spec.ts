import { HttpClient, provideHttpClient } from '@angular/common/http'; //HttpParams
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Family } from './family';
import { FamilyService } from './family.service';
//import { School } from '../school-list/school';

describe('FamilyService', () => {
  // A small collection of test families
  const testFamilies: Family[] = [
    {
      _id: 'john_id',
      guardianName: 'John Johnson',
      email: 'jjohnson@email.com',
      address: '713 Broadway',
      timeSlot: '8:00-9:00',
      students: [
        {
          name: 'John Jr.',
          grade: '1',
          school: "Morris Elementary",
          requestedSupplies: ['pencils', 'markers']
        },
      ]
    },
    {
      //family with two kids
      _id: 'jane_id',
      guardianName: 'Jane Doe',
      email: 'janedoe@email.com',
      address: '123 Street',
      timeSlot: '10:00-11:00',
      students: [
        {
          name: 'Jennifer',
          grade: '6',
          school: "Hancock Middle School",
          requestedSupplies: ['headphones']
        },
        {
          name: 'Jake',
          grade: '8',
          school: "Hancock Middle School",
          requestedSupplies: ['calculator']
        },
      ]
    },
    {
      //family with three kids
      _id: 'george_id',
      guardianName: 'George Peterson',
      email: 'georgepeter@email.com',
      address: '245 Acorn Way',
      timeSlot: '1:00-2:00',
      students: [
        {
          name: 'Harold',
          grade: '11',
          school: "Morris High School",
          requestedSupplies: []
        },
        {
          name: 'Thomas',
          grade: '6',
          school: "Morris High School",
          requestedSupplies: ['headphones']
        },
        {
          name: 'Emma',
          grade: '2',
          school: "Morris Elementary",
          requestedSupplies: ['backpack', 'markers']
        },
      ]
    },
  ];

  // A small collection of families organized by school
  // const testCompanies: Company[] = [
  //   {
  //     _id: 'company1',
  //     count: 1,
  //     families: [{_id: 'family1', name: 'Family 1'}]
  //   },
  //   {
  //     _id: 'company2',
  //     count: 2,
  //       families: [{_id: 'family2', name: 'Family 2'}, {_id: 'family3', name: 'Family 3'}]
  //   }
  // ];

  let familyService: FamilyService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    familyService = TestBed.inject(FamilyService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  //   describe('When getFamilies() is called with no parameters', () => {
  //     /* We really don't care what `getFamilies()` returns. Since all the
  //     * filtering (when there is any) is happening on the server,
  //     * `getFamilies()` is really just a "pass through" that returns whatever it receives,
  //     * without any "post processing" or manipulation. The test in this
  //     * `describe` confirms that the HTTP request is properly formed
  //     * and sent out in the world, but we don't _really_ care about
  //     * what `getFamilies()` returns as long as it's what the HTTP
  //     * request returns.
  //     *
  //     * So in this test, we'll keep it simple and have
  //     * the (mocked) HTTP request return the entire list `testFamilies`
  //     * even though in "real life" we would expect the server to
  //     * return return a filtered subset of the families. Furthermore, we
  //     * won't actually check what got returned (there won't be an `expect`
  //     * about the returned value). Since we don't use the returned value in this test,
  //     * It might also be fine to not bother making the mock return it.
  //     */
  //     it('calls `api/families`', waitForAsync(() => {
  //       // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
  //       // it just returns our test data.
  //       const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

  //       // Call `familyService.getFamilies()` and confirm that the correct call has
  //       // been made with the correct arguments.
  //       //
  //       // We have to `subscribe()` to the `Observable` returned by `getFamilies()`.
  //       // The `families` argument in the function is the array of Families returned by
  //       // the call to `getFamilies()`.
  //       familyService.getFamilies().subscribe(() => {
  //         // The mocked method (`httpClient.get()`) should have been called
  //         // exactly one time.
  //         expect(mockedMethod)
  //           .withContext('one call')
  //           .toHaveBeenCalledTimes(1);
  //         // The mocked method should have been called with two arguments:
  //         //   * the appropriate URL ('/api/families' defined in the `FamilyService`)
  //         //   * An options object containing an empty `HttpParams`
  //         expect(mockedMethod)
  //           .withContext('talks to the correct endpoint')
  //           .toHaveBeenCalledWith(familyService.familyUrl, { params: new HttpParams() });
  //       });
  //     }));
  //   });

  //   describe('When getFamilies() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
  //     /*
  //     * As in the test of `getFamilies()` that takes in no filters in the params,
  //     * we really don't care what `getFamilies()` returns in the cases
  //     * where the filtering is happening on the server. Since all the
  //     * filtering is happening on the server, `getFamilies()` is really
  //     * just a "pass through" that returns whatever it receives, without
  //     * any "post processing" or manipulation. So the tests in this
  //     * `describe` block all confirm that the HTTP request is properly formed
  //     * and sent out in the world, but don't _really_ care about
  //     * what `getFamilies()` returns as long as it's what the HTTP
  //     * request returns.
  //     *
  //     * So in each of these tests, we'll keep it simple and have
  //     * the (mocked) HTTP request return the entire list `testFamilies`
  //     * even though in "real life" we would expect the server to
  //     * return return a filtered subset of the families. Furthermore, we
  //     * won't actually check what got returned (there won't be an `expect`
  //     * about the returned value).
  //     */

  //     it('correctly calls api/families with filter parameter \'admin\'', () => {
  //       const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

  //       familyService.getFamilies({ role: 'admin' }).subscribe(() => {
  //         expect(mockedMethod)
  //           .withContext('one call')
  //           .toHaveBeenCalledTimes(1);
  //         // The mocked method should have been called with two arguments:
  //         //   * the appropriate URL ('/api/families' defined in the `FamilyService`)
  //         //   * An options object containing an `HttpParams` with the `role`:`admin`
  //         //     key-value pair.
  //         expect(mockedMethod)
  //           .withContext('talks to the correct endpoint')
  //           .toHaveBeenCalledWith(familyService.familyUrl, { params: new HttpParams().set('role', 'admin') });
  //       });
  //     });

  //     it('correctly calls api/families with filter parameter \'age\'', () => {
  //       const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

  //       familyService.getFamilies({ age: 25 }).subscribe(() => {
  //         expect(mockedMethod)
  //           .withContext('one call')
  //           .toHaveBeenCalledTimes(1);
  //         expect(mockedMethod)
  //           .withContext('talks to the correct endpoint')
  //           .toHaveBeenCalledWith(familyService.familyUrl, { params: new HttpParams().set('age', '25') });
  //       });
  //     });

  //     it('correctly calls api/families with multiple filter parameters', () => {
  //       const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

  //       familyService.getFamilies({ role: 'editor', company: 'IBM', age: 37 }).subscribe(() => {
  //         // This test checks that the call to `familyService.getFamilies()` does several things:
  //         //   * It calls the mocked method (`HttpClient#get()`) exactly once.
  //         //   * It calls it with the correct endpoint (`familyService.familyUrl`).
  //         //   * It calls it with the correct parameters:
  //         //      * There should be three parameters (this makes sure that there aren't extras).
  //         //      * There should be a "role:editor" key-value pair.
  //         //      * And a "company:IBM" pair.
  //         //      * And a "age:37" pair.

  //         // This gets the arguments for the first (and in this case only) call to the `mockMethod`.
  //         const [url, options] = mockedMethod.calls.argsFor(0);
  //         // Gets the `HttpParams` from the options part of the call.
  //         // `options.param` can return any of a broad number of types;
  //         // it is in fact an instance of `HttpParams`, and I need to use
  //         // that fact, so I'm casting it (the `as HttpParams` bit).
  //         const calledHttpParams: HttpParams = (options.params) as HttpParams;
  //         expect(mockedMethod)
  //           .withContext('one call')
  //           .toHaveBeenCalledTimes(1);
  //         expect(url)
  //           .withContext('talks to the correct endpoint')
  //           .toEqual(familyService.familyUrl);
  //         expect(calledHttpParams.keys().length)
  //           .withContext('should have 3 params')
  //           .toEqual(3);
  //         expect(calledHttpParams.get('role'))
  //           .withContext('role of editor')
  //           .toEqual('editor');
  //         expect(calledHttpParams.get('company'))
  //           .withContext('company being IBM')
  //           .toEqual('IBM');
  //         expect(calledHttpParams.get('age'))
  //           .withContext('age being 37')
  //           .toEqual('37');
  //       });
  //     });
  //   });

  describe('When getFamilyById() is given an ID', () => {
    /* We really don't care what `getFamilyById()` returns. Since all the
    * interesting work is happening on the server, `getFamilyById()`
    * is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getFamilyById()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the `targetFamily`
    * Furthermore, we won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls api/families/id with the correct ID', waitForAsync(() => {
      // We're just picking a Family "at random" from our little
      // set of Families up at the top.
      const targetFamily: Family = testFamilies[1];
      const targetId: string = targetFamily._id;

      // Mock the `httpClient.get()` method so that instead of making an HTTP request
      // it just returns one family from our test data
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetFamily));

      // Call `familyService.getFamily()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getFamilyById()`.
      // The `family` argument in the function below is the thing of type Family returned by
      // the call to `getFamilyById()`.
      familyService.getFamilyById(targetId).subscribe(() => {
        // The `Family` returned by `getFamilyById()` should be targetFamily, but
        // we don't bother with an `expect` here since we don't care what was returned.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${familyService.familyUrl}/${targetId}`);
      });
    }));
  });

  //   describe('Filtering on the client using `filterFamilies()` (Angular/Client filtering)', () => {
  //     /*
  //      * Since `filterFamilies` actually filters "locally" (in
  //      * Angular instead of on the server), we do want to
  //      * confirm that everything it returns has the desired
  //      * properties. Since this doesn't make a call to the server,
  //      * though, we don't have to use the mock HttpClient and
  //      * all those complications.
  //      */
  //     it('filters by name', () => {
  //       const familyName = 'i';
  //       const filteredFamilies = familyService.filterFamilies(testFamilies, { name: familyName });
  //       // There should be two families with an 'i' in their
  //       // name: Chris and Jamie.
  //       expect(filteredFamilies.length).toBe(2);
  //       // Every returned family's name should contain an 'i'.
  //       filteredFamilies.forEach(family => {
  //         expect(family.name.indexOf(familyName)).toBeGreaterThanOrEqual(0);
  //       });
  //     });

  //     it('filters by company', () => {
  //       const familyCompany = 'UMM';
  //       const filteredFamilies = familyService.filterFamilies(testFamilies, { company: familyCompany });
  //       // There should be just one family that has UMM as their company.
  //       expect(filteredFamilies.length).toBe(1);
  //       // Every returned family's company should contain 'UMM'.
  //       filteredFamilies.forEach(family => {
  //         expect(family.company.indexOf(familyCompany)).toBeGreaterThanOrEqual(0);
  //       });
  //     });

  //     it('filters by name and company', () => {
  //       // There's only one family (Chris) whose name
  //       // contains an 'i' and whose company contains
  //       // an 'M'. There are two whose name contains
  //       // an 'i' and two whose company contains an
  //       // an 'M', so this should test combined filtering.
  //       const familyName = 'i';
  //       const familyCompany = 'M';
  //       const filters = { name: familyName, company: familyCompany };
  //       const filteredFamilies = familyService.filterFamilies(testFamilies, filters);
  //       // There should be just one family with these properties.
  //       expect(filteredFamilies.length).toBe(1);
  //       // Every returned family should have _both_ these properties.
  //       filteredFamilies.forEach(family => {
  //         expect(family.name.indexOf(familyName)).toBeGreaterThanOrEqual(0);
  //         expect(family.company.indexOf(familyCompany)).toBeGreaterThanOrEqual(0);
  //       });
  //     });
  //   });

  describe('Adding a family using `addFamily()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      const family_id = 'john_id';
      const expected_http_response = { id: family_id } ;

      // Mock the `httpClient.addFamily()` method, so that instead of making an HTTP request,
      // it just returns our expected HTTP response.
      const mockedMethod = spyOn(httpClient, 'post')
        .and
        .returnValue(of(expected_http_response));

      familyService.addFamily(testFamilies[1]).subscribe((new_family_id) => {
        expect(new_family_id).toBe(family_id);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(familyService.familyUrl, testFamilies[1]);
      });
    }));
  });
});
