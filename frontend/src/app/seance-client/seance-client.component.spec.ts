import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeanceClientComponent } from './seance-client.component';

describe('SeanceClientComponent', () => {
  let component: SeanceClientComponent;
  let fixture: ComponentFixture<SeanceClientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeanceClientComponent]
    });
    fixture = TestBed.createComponent(SeanceClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
