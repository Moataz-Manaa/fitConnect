import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachDetailComponent } from './coach-detail.component';

describe('CoachDetailComponent', () => {
  let component: CoachDetailComponent;
  let fixture: ComponentFixture<CoachDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoachDetailComponent]
    });
    fixture = TestBed.createComponent(CoachDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
