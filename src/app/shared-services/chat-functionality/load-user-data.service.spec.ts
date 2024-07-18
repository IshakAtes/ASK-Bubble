import { TestBed } from '@angular/core/testing';

import { LoadUserDataService } from './load-user-data.service';

describe('LoadUserDataService', () => {
  let service: LoadUserDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadUserDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
