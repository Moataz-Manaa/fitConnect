import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCoachComponent } from './register-coach.component';

describe('RegisterCoachComponent', () => {
  let component: RegisterCoachComponent;
  let fixture: ComponentFixture<RegisterCoachComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterCoachComponent]
    });
    fixture = TestBed.createComponent(RegisterCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
