import { Component, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Client } from '../Entity/Client.Entity';
import { CustomerData, customerData, matchesSearch } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-coach-clients', templateUrl: './coach-clients.component.html' })
export class CoachClientsComponent implements OnInit {
  data$!: Observable<CustomerData<Client[]>>;
  query = '';
  page = 1;

  constructor(private service: CrudService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.service.userDetails()?.id;
    if (!id) {
      this.data$ = of({ loading: false, error: 'Connectez-vous pour consulter vos clients.', value: null });
      return;
    }
    const request = this.service.getCoachClients(id).pipe(map(items => (items ?? []).filter(Boolean)));
    this.data$ = customerData(request, 'Impossible de charger vos clients.');
  }

  results(items: Client[]): Client[] {
    return items.filter(item => matchesSearch(this.query, item.nom, item.prenom, item.email, item.telephone));
  }
}
