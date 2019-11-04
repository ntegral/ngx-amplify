import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxAmplifyComponent } from './ngx-amplify.component';

describe('NgxAmplifyComponent', () => {
  let component: NgxAmplifyComponent;
  let fixture: ComponentFixture<NgxAmplifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxAmplifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxAmplifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
