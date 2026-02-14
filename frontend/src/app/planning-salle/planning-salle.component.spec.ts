import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningSalleComponent } from './planning-salle.component';

describe('PlanningSalleComponent', () => {
  let component: PlanningSalleComponent;
  let fixture: ComponentFixture<PlanningSalleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlanningSalleComponent]
    });
    fixture = TestBed.createComponent(PlanningSalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
