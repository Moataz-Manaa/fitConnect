import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalleClientsComponent } from './salle-clients.component';

describe('SalleClientsComponent', () => {
  let component: SalleClientsComponent;
  let fixture: ComponentFixture<SalleClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalleClientsComponent]
    });
    fixture = TestBed.createComponent(SalleClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
