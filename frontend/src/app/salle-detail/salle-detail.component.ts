import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { CoachSalle } from '../Entity/CoachSalle.Entity';
import { Pack } from '../Entity/Pack.Entity';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';
import { CustomerData, customerData } from '../customer/customer-data';
import { CrudService } from '../service/crud.service';

interface GymProfile {
  gym: SalleDeSport;
  packs: Pack[];
  coaches: CoachSalle[];
}

@Component({ selector: 'app-salle-detail', templateUrl: './salle-detail.component.html' })
export class SalleDetailComponent implements OnInit {
  data$!: Observable<CustomerData<GymProfile | null>>;

  constructor(private api: CrudService, private route: ActivatedRoute) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.data$ = this.route.paramMap.pipe(switchMap(params => {
      const id = Number(params.get('id'));
      const profile = this.api.getSalleById(id).pipe(switchMap(gym => {
        if (!gym?.id || gym.etat === false) return of(null);
        return forkJoin({
          gym: of(gym),
          packs: this.api.getPackBySalleId(id).pipe(map(items => (items ?? []).filter(pack => pack?.id))),
          coaches: this.api.getCoachBySalleId(id).pipe(map(items => (items ?? []).filter(coach => coach != null))),
        });
      }));
      return customerData(profile, 'Impossible de charger cette salle.');
    }));
  }
}
