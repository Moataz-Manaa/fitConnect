import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeReservationCoachComponent } from './liste-reservation-coach.component';

describe('ListeReservationCoachComponent', () => {
  let component: ListeReservationCoachComponent;
  let fixture: ComponentFixture<ListeReservationCoachComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeReservationCoachComponent]
    });
    fixture = TestBed.createComponent(ListeReservationCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
