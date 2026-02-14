import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSalleDeSportComponent } from './register-salle-de-sport.component';

describe('RegisterSalleDeSportComponent', () => {
  let component: RegisterSalleDeSportComponent;
  let fixture: ComponentFixture<RegisterSalleDeSportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterSalleDeSportComponent]
    });
    fixture = TestBed.createComponent(RegisterSalleDeSportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
