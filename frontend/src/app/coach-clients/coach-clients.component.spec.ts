import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachClientsComponent } from './coach-clients.component';

describe('CoachClientsComponent', () => {
  let component: CoachClientsComponent;
  let fixture: ComponentFixture<CoachClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoachClientsComponent]
    });
    fixture = TestBed.createComponent(CoachClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
