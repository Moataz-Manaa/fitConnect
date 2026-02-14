import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSalleDeSportComponent } from './login-salle-de-sport.component';

describe('LoginSalleDeSportComponent', () => {
  let component: LoginSalleDeSportComponent;
  let fixture: ComponentFixture<LoginSalleDeSportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginSalleDeSportComponent]
    });
    fixture = TestBed.createComponent(LoginSalleDeSportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
