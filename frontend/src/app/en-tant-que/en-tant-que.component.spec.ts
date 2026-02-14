import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnTantQueComponent } from './en-tant-que.component';

describe('EnTantQueComponent', () => {
  let component: EnTantQueComponent;
  let fixture: ComponentFixture<EnTantQueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnTantQueComponent]
    });
    fixture = TestBed.createComponent(EnTantQueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
