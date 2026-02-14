import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeSalleComponent } from './liste-salle.component';

describe('ListeSalleComponent', () => {
  let component: ListeSalleComponent;
  let fixture: ComponentFixture<ListeSalleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeSalleComponent]
    });
    fixture = TestBed.createComponent(ListeSalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
