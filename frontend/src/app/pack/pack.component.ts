import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Pack } from '../Entity/Pack.Entity';
import { CustomerData, customerData, matchesSearch } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-pack',
  templateUrl: './pack.component.html',
})
export class PackComponent implements OnInit {
  data$!: Observable<CustomerData<Pack[]>>;
  query = '';
  page = 1;
  category = '';

  categories(packs: Pack[]): string[] {
    return [...new Set(packs.map(pack => pack.category?.nom).filter((name): name is string => !!name))].sort();
  }

  constructor(private api: CrudService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.data$ = customerData(this.api.getPacks().pipe(map(items => (items ?? []).filter(item => item?.id && item.salle?.etat !== false))), 'Impossible de charger les abonnements.');
  }

  results(items: Pack[]): Pack[] {
    return items.filter(abonnement => matchesSearch(this.query, abonnement.nom, abonnement.salle?.nom, abonnement.category?.nom) && (!this.category || abonnement.category?.nom === this.category));
  }
}
