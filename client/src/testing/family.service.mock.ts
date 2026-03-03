import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { DashboardStats, Family } from '../app/family/family';
import { FamilyService } from 'src/app/family/family.service';

@Injectable({
  providedIn: AppComponent
})
export class MockFamilyService implements Pick<FamilyService, 'getFamilyById' | 'addFamily' | 'getDashboardStats'> {
  //'getFamily' |
  // getFamilies: FamilyService;
  static testFamilies: Family[] = [
    {
      //family with one kid
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

  getDashboardStats(): Observable<DashboardStats> {
    const totalFamilies = MockFamilyService.testFamilies.length;

    const totalStudents = MockFamilyService.testFamilies
      .reduce((sum, f) => sum + (f.students?.length ?? 0), 0);

    const suppliesRequested = MockFamilyService.testFamilies
      .flatMap(f => f.students ?? [])
      .flatMap(s => s.requestedSupplies ?? [])
      .length;

    return of({
      totalFamilies,
      totalStudents,
      suppliesRequested
    });
  }

  getFamilies(): Observable<Family[]> {
    return of(MockFamilyService.testFamilies);
  }

  getFamilyById(id: string): Observable<Family> {
    if (id === MockFamilyService.testFamilies[0]._id) {
      return of(MockFamilyService.testFamilies[0]);
    } else if (id === MockFamilyService.testFamilies[1]._id) {
      return of(MockFamilyService.testFamilies[1]);
    } else {
      return of(null);
    }
  }

  addFamily(newFamily: Partial<Family>): Observable<string> {
    return of('1');
  }

}
