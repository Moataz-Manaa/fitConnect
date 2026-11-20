import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Coach } from '../Entity/Coach.Entity';
import { CustomerData, customerData, matchesSearch } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
})
export class CoachComponent implements OnInit {
  data$!: Observable<CustomerData<Coach[]>>;
  query = '';
  page = 1;

  constructor(private api: CrudService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.data$ = customerData(this.api.getCoachs().pipe(map(items => (items ?? []).filter(item => item?.id && item.etat !== false))), 'Impossible de charger les coachs.');
  }

  results(items: Coach[]): Coach[] {
    return items.filter(coach => matchesSearch(this.query, coach.prenom, coach.nom));
  }
}
