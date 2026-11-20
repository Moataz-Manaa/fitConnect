import { Component, OnInit } from '@angular/core';
import { Observable, finalize, map, of } from 'rxjs';
import { Abonnement } from '../Entity/Abonnement.Entity';
import { sessionTime } from '../customer/customer-booking';
import { CustomerData, customerData } from '../customer/customer-data';
import { CheckoutService, checkoutErrorMessage } from '../service/checkout.service';
import { CrudService } from '../service/crud.service';

interface MemberSubscription extends Abonnement { expiresAt: Date | null; }

@Component({ selector: 'app-liste-abonnement-client', templateUrl: './liste-abonnement-client.component.html' })
export class ListeAbonnementClientComponent implements OnInit {
  data$!: Observable<CustomerData<MemberSubscription[]>>;
  page = 1;
  checkoutError = '';
  renewingPackId?: number;

  constructor(private service: CrudService, private checkout: CheckoutService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.service.userDetails()?.id;
    if (!id) {
      this.data$ = of({ loading: false, error: 'Connectez-vous pour consulter vos abonnements.', value: null });
      return;
    }
    const subscriptions = this.service.getAbonnementsByClientId(id).pipe(map(items => (items ?? [])
      .filter(item => item != null)
      .map(item => ({ ...item, expiresAt: this.expirationDate(item.dateActivation) }))));
    this.data$ = customerData(subscriptions, 'Impossible de charger vos abonnements.');
  }

  private expirationDate(activation: string | undefined): Date | null {
    const start = sessionTime(activation, '0:00');
    if (!Number.isFinite(start)) return null;
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    return end;
  }

  startRenewal(packId: number): void {
    if (this.renewingPackId !== undefined) return;
    this.checkoutError = '';
    this.renewingPackId = packId;
    this.checkout.start('RENEWAL', packId).pipe(
      finalize(() => this.renewingPackId = undefined)
    ).subscribe({ error: error => this.checkoutError = checkoutErrorMessage(error) });
  }
}
