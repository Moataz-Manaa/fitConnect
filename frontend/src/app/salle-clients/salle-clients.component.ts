import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ClientSubscription } from '../Entity/ClientSubscription.Entity';
import { CustomerData, customerData, matchesSearch } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-salle-clients', templateUrl: './salle-clients.component.html' })
export class SalleClientsComponent implements OnInit {
  data$!: Observable<CustomerData<ClientSubscription[]>>;
  query = '';
  page = 1;
  subscriptionStatus = '';
  readonly labels = { actif: 'Actif', inactif: 'Inactif', en_attente: 'À venir' };

  constructor(private service: CrudService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    const request = this.service.getMyClients().pipe(map(items => (items ?? []).filter(Boolean)));
    this.data$ = customerData(request, 'Impossible de charger vos membres.');
  }

  results(items: ClientSubscription[]): ClientSubscription[] {
    return items.filter(item => matchesSearch(this.query, item.nom, item.prenom, item.email, item.telephone, item.packNom) && (!this.subscriptionStatus || item.etat === this.subscriptionStatus));
  }
}
