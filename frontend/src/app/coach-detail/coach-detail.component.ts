import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, switchMap } from 'rxjs';
import { Coach } from '../Entity/Coach.Entity';
import { CustomerData, customerData } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

@Component({ selector: 'app-coach-detail', templateUrl: './coach-detail.component.html' })
export class CoachDetailComponent implements OnInit {
  data$!: Observable<CustomerData<Coach | null>>;

  constructor(private api: CrudService, private route: ActivatedRoute) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.data$ = this.route.paramMap.pipe(switchMap(params =>
      customerData(this.api.getCoach(Number(params.get('id'))).pipe(
        map(coach => coach?.id && coach.etat !== false ? coach : null)
      ), 'Impossible de charger ce coach.')
    ));
  }
}
