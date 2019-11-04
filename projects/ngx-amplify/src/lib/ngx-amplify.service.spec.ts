import { TestBed } from '@angular/core/testing';

import { NgxAmplifyService } from './ngx-amplify.service';

describe('NgxAmplifyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxAmplifyService = TestBed.get(NgxAmplifyService);
    expect(service).toBeTruthy();
  });
});
