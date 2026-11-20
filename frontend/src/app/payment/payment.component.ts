import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { Checkout, CheckoutService, checkoutErrorMessage, isCheckoutId } from '../service/checkout.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  checkout?: Checkout;
  id = '';
  busy = false;
  error = '';
  needsLogin = false;
  returnedFromStripe = false;
  cancelledInStripe = false;

  constructor(private route: ActivatedRoute, private service: CheckoutService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!isCheckoutId(id)) {
      this.error = 'Ce paiement est introuvable.';
      return;
    }
    this.id = id;
    this.returnedFromStripe = this.route.snapshot.queryParamMap.get('returned') === 'true';
    this.cancelledInStripe = this.route.snapshot.queryParamMap.get('cancelled') === 'true';
    this.verify();
  }

  verify(): void {
    this.update(this.service.confirm(this.id));
  }

  cancel(): void {
    this.update(this.service.cancel(this.id));
  }

  get historyRoute(): string {
    return this.checkout?.kind === 'SESSION' ? '/listeReservationClient' : '/listeAbonnementClient';
  }

  get catalogRoute(): string {
    if (this.checkout?.kind === 'SESSION') return '/coach';
    return this.checkout?.kind === 'RENEWAL' ? '/listeAbonnementClient' : '/packs';
  }

  private update(request: Observable<Checkout>): void {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    this.needsLogin = false;
    request.pipe(finalize(() => { this.busy = false; })).subscribe({
      next: checkout => { this.checkout = checkout; },
      error: (error: HttpErrorResponse) => {
        this.error = checkoutErrorMessage(error);
        this.needsLogin = error.status === 401 || error.status === 403;
      },
    });
  }
}
