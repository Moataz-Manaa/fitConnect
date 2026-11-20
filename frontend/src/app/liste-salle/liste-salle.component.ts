import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';
import { CustomerData, customerData, matchesSearch } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-liste-salle',
  templateUrl: './liste-salle.component.html',
})
export class ListeSalleComponent implements OnInit {
  data$!: Observable<CustomerData<SalleDeSport[]>>;
  query = '';
  page = 1;

  constructor(private api: CrudService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.data$ = customerData(this.api.getSalles().pipe(map(items => (items ?? []).filter(item => item?.id && item.etat !== false))), 'Impossible de charger les salles.');
  }

  results(items: SalleDeSport[]): SalleDeSport[] {
    return items.filter(salle => matchesSearch(this.query, salle.nom, salle.adresse));
  }
}
