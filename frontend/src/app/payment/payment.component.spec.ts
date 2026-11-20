import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { PageStateComponent } from '../customer/page-state.component';
import { Checkout, CheckoutService } from '../service/checkout.service';
import { PaymentComponent } from './payment.component';

describe('PaymentComponent', () => {
  const checkout: Checkout = {
    id: '12345678-1234-4123-8123-123456789abc',
    kind: 'SESSION',
    state: 'OPEN',
    description: 'Fitness',
    amount: 37.50,
    currency: 'eur',
    activationDate: null,
    checkoutUrl: 'https://checkout.stripe.com/test',
    resultId: null,
    confirmedAt: null,
  };
  let service: jasmine.SpyObj<CheckoutService>;
  let fixture: ComponentFixture<PaymentComponent>;

  beforeEach(() => {
    registerLocaleData(localeFr);
    service = jasmine.createSpyObj<CheckoutService>('CheckoutService', ['confirm', 'cancel']);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PageStateComponent],
      declarations: [PaymentComponent],
      providers: [
        { provide: CheckoutService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: {
          paramMap: convertToParamMap({ id: checkout.id }),
          queryParamMap: convertToParamMap({ returned: 'true' }),
        } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(PaymentComponent);
  });

  it('waits for server confirmation after returning from Stripe', () => {
    service.confirm.and.returnValue(of(checkout));
    fixture.detectChanges();

    expect(service.confirm).toHaveBeenCalledWith(checkout.id);
    expect(fixture.nativeElement.querySelector(`a[href="${checkout.checkoutUrl}"]`)).toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/listeReservationClient"]')).toBeNull();

    service.confirm.and.returnValue(of({ ...checkout, state: 'COMPLETED', resultId: 42, checkoutUrl: null }));
    fixture.componentInstance.verify();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href="/listeReservationClient"]')).not.toBeNull();
  });
});
