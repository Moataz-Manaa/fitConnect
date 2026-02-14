import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeAbonnementClientComponent } from './liste-abonnement-client.component';

describe('ListeAbonnementClientComponent', () => {
  let component: ListeAbonnementClientComponent;
  let fixture: ComponentFixture<ListeAbonnementClientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeAbonnementClientComponent]
    });
    fixture = TestBed.createComponent(ListeAbonnementClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
