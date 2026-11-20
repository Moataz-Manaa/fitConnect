import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize, map, switchMap } from 'rxjs';
import { Pack } from '../Entity/Pack.Entity';
import { localDateInput } from '../customer/customer-booking';
import { CustomerData, customerData } from '../customer/customer-data';
import { CheckoutService, checkoutErrorMessage } from '../service/checkout.service';
import { CrudService } from '../service/crud.service';
import { activeSession } from '../service/session';

@Component({ selector: 'app-pack-detail', templateUrl: './pack-detail.component.html' })
export class PackDetailComponent implements OnInit {
  data$!: Observable<CustomerData<Pack | null>>;
  dateActivation = '';
  checkoutPending = false;
  checkoutError = '';

  constructor(private service: CrudService, private checkout: CheckoutService, private route: ActivatedRoute) {}

  get isMember(): boolean { return activeSession()?.role === 'client'; }
  get today(): string { return localDateInput(); }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.data$ = this.route.paramMap.pipe(switchMap(params => {
      this.dateActivation = '';
      this.checkoutError = '';
      const pack = this.service.getPackByIdApi(Number(params.get('id'))).pipe(
        map(offer => offer?.id && offer.salle?.etat !== false ? offer : null)
      );
      return customerData(pack, 'Impossible de charger cet abonnement.');
    }));
  }

  startCheckout(packId?: number): void {
    if (!packId || !this.isMember || this.checkoutPending) return;
    if (!this.dateActivation || this.dateActivation < this.today) {
      this.checkoutError = 'Choisissez une date d’activation à partir d’aujourd’hui.';
      return;
    }
    this.checkoutError = '';
    this.checkoutPending = true;
    this.checkout.start('PACK', packId, this.dateActivation).pipe(
      finalize(() => this.checkoutPending = false)
    ).subscribe({ error: error => this.checkoutError = checkoutErrorMessage(error) });
  }
}
