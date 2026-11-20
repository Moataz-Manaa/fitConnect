import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { CheckoutKind, CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  const id = '12345678-1234-4123-8123-123456789abc';
  let service: CheckoutService;
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: router }],
    });
    service = TestBed.inject(CheckoutService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  for (const kind of ['SESSION', 'PACK', 'RENEWAL'] as CheckoutKind[]) {
    it(`starts ${kind} using the product and displays the server checkout`, () => {
      const activationDate = kind === 'PACK' ? '2027-01-01' : undefined;
      service.start(kind, 12, activationDate).subscribe();
      const request = http.expectOne({ method: 'POST', url: '/api/checkout' });
      expect(request.request.body).toEqual({ kind, productId: 12, activationDate });
      expect(router.navigate).not.toHaveBeenCalled();

      request.flush({ id, kind });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/checkout', id]);
    });
  }

  it('checks status and cancels using the order reference', () => {
    service.confirm(id).subscribe(order => expect(order.state).toBe('OPEN'));
    http.expectOne({ method: 'POST', url: `/api/checkout/${id}/confirm` }).flush({ state: 'OPEN' });
    service.cancel(id).subscribe(order => expect(order.state).toBe('EXPIRED'));
    http.expectOne({ method: 'POST', url: `/api/checkout/${id}/cancel` }).flush({ state: 'EXPIRED' });
  });
});
